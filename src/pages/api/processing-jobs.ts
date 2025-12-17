import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, {
  type File as FormidableFile,
  type Fields as FormidableFields,
  type Files as FormidableFiles,
  type Part as FormidablePart,
} from 'formidable'
import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { initDB } from '@/lib/db'
import { AppDataSource } from '@/lib/data-source'
import { ProcessingJob } from '@/lib/entities/ProcessingJob'
import { DocumentType } from '@/lib/entities/DocumentType'
import { Model } from '@/lib/entities/Model'
import { File as ProcessingFile } from '@/lib/entities/File'
import { runGeminiOcrOnFile, type StructuredOcrResult } from '@/lib/ocr'

export const config = {
  api: {
    bodyParser: false,
  },
}

type ParsedUploadPayload = {
  documentTypeId: number
  modelId: number
  files: FormidableFile[]
  uploadSubDir: string
}

const uploadRootDir = path.join(process.cwd(), 'public', 'uploads')


async function ensureUploadDir(dir = uploadRootDir) {
  await fs.mkdir(dir, { recursive: true })
}

function normalizeFieldValue(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }
  return value
}

async function parseMultipartRequest(req: NextApiRequest): Promise<ParsedUploadPayload> {
  console.log('7 parseMultipartRequest', req.body)
  await ensureUploadDir()

  const requestFolderName = `job_${Date.now()}_${randomUUID()}`
  const requestUploadDir = path.join(uploadRootDir, requestFolderName)
  await ensureUploadDir(requestUploadDir)

  const form = formidable({
    multiples: true,
    uploadDir: requestUploadDir,
    keepExtensions: true,
    maxFileSize: 20 * 1024 * 1024, // 20MB per file
    filename: (_name: string, _ext: string, part: FormidablePart) => {
      const unique = randomUUID()
      const sanitized = part.originalFilename
        ? part.originalFilename.replace(/[^\w.\-]/g, '_')
        : 'file'
      const lastDot = sanitized.lastIndexOf('.')
      const baseName = lastDot === -1 ? sanitized : sanitized.slice(0, lastDot)
      const extension = lastDot === -1 ? '' : sanitized.slice(lastDot)
      return `${baseName}_${unique}${extension}`
    },
  })

  const { fields, files } = await new Promise<{ fields: FormidableFields; files: FormidableFiles }>((resolve, reject) => {
    form.parse(req, (err: Error | null, parsedFields: FormidableFields, parsedFiles: FormidableFiles) => {
      if (err) {
        reject(err)
        return
      }
      resolve({ fields: parsedFields, files: parsedFiles })
    })
  })

  const documentTypeIdRaw = normalizeFieldValue(fields.documentTypeId)
  const modelIdRaw = normalizeFieldValue(fields.modelId)

  if (!documentTypeIdRaw || !modelIdRaw) {
    throw new Error('documentTypeId and modelId are required')
  }

  const parsedFiles = files.files
    ? Array.isArray(files.files)
      ? files.files.filter(Boolean) as FormidableFile[]
      : [files.files as FormidableFile]
    : []

  if (!parsedFiles.length) {
    throw new Error('At least one file is required')
  }

  return {
    documentTypeId: Number(documentTypeIdRaw),
    modelId: Number(modelIdRaw),
    files: parsedFiles,
    uploadSubDir: requestFolderName,
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('5 req.method', req)
  console.log('6 req.body', req)
  try {
    await initDB()
  } catch (error) {
    console.error('Error initializing DB:', error)
    return res.status(500).json({ error: 'Failed to connect to database' })
  }

  const processingJobRepo = AppDataSource.getRepository(ProcessingJob)
  const fileRepo = AppDataSource.getRepository(ProcessingFile)

  if (req.method === 'GET') {
    try {
      const jobs = await processingJobRepo.find({
        relations: ['documentType', 'model', 'files'],
        order: { createdAt: 'DESC' },
      })
      return res.status(200).json(jobs)
    } catch (error) {
      console.error('Error fetching processing jobs:', error)
      return res.status(500).json({ error: 'Failed to fetch processing jobs' })
    }
  }

  if (req.method === 'POST') {
    let payload: ParsedUploadPayload
    try {
      payload = await parseMultipartRequest(req)
    } catch (error) {
      console.error('Error parsing multipart request:', error)
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Invalid upload payload',
      })
    }

    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const documentTypeRepo = AppDataSource.getRepository(DocumentType)
      const modelRepo = AppDataSource.getRepository(Model)

      const documentType = await documentTypeRepo.findOneBy({
        id: Number(payload.documentTypeId),
      })
      if (!documentType) {
        return res.status(404).json({ error: 'Document type not found' })
      }

      const model = await modelRepo.findOneBy({ id: Number(payload.modelId) })
      if (!model) {
        return res.status(404).json({ error: 'Model not found' })
      }

      const newJob = processingJobRepo.create({
        documentTypeId: Number(payload.documentTypeId),
        modelId: Number(payload.modelId),
        documentType,
        model,
        status: 'COMPLETED',
      })

      const savedJob = await queryRunner.manager.save(newJob)

      const newFiles = await Promise.all(payload.files.map(async (file) => {
        const originalFileName = file.originalFilename ?? file.newFilename ?? 'file'
        const storedFilePath = file.filepath ?? file.newFilename
        const relativeFilePath = storedFilePath
          ? path.join('uploads', payload.uploadSubDir, path.basename(storedFilePath))
          : path.join('uploads', payload.uploadSubDir, `${randomUUID()}_${originalFileName}`)

        const createdFile = new ProcessingFile()
        createdFile.processingJob = savedJob
        createdFile.fileName = originalFileName
        createdFile.fileSize = file.size ?? undefined
        createdFile.fileType = file.mimetype ?? null
        createdFile.filePath = relativeFilePath
        createdFile.status = 'COMPLETED'
        createdFile.processTime = Math.floor(1500 + Math.random() * 2500)

        const fileAbsolutePath = file.filepath
          ? file.filepath
          : path.join(uploadRootDir, payload.uploadSubDir, path.basename(storedFilePath || originalFileName))

        const ocrData = await runGeminiOcrOnFile({
          filePath: fileAbsolutePath,
          fileName: originalFileName,
          mimeType: file.mimetype,
          documentTypeName: documentType.name,
          modelName: model.name,
        })

        createdFile.OCRResult = JSON.stringify(ocrData)

        return { entity: createdFile, ocrData }
      }))
      const savedFiles = await queryRunner.manager.save(ProcessingFile, newFiles.map(({ entity }) => entity))

      const aggregatedResult = {
        documentType: documentType.name,
        model: model.name,
        totalFiles: savedFiles.length,
        processedAt: new Date().toISOString(),
        files: newFiles.map(({ ocrData }) => ocrData),
      }

      savedJob.resultJson = JSON.stringify(aggregatedResult)
      await queryRunner.manager.save(savedJob)
      await queryRunner.commitTransaction()

      const jobWithRelations = await processingJobRepo.findOne({
        where: { id: savedJob.id },
        relations: ['documentType', 'model', 'files'],
      })

      if (!jobWithRelations) {
        throw new Error('Failed to load processing job after creation')
      }

      return res.status(200).json(jobWithRelations)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      console.error('Error creating processing jobs:', error)
      try {
        await fs.rm(path.join(uploadRootDir, payload.uploadSubDir), { recursive: true, force: true })
      } catch (cleanupError) {
        console.error('Failed to cleanup upload directory:', cleanupError)
      }
      return res.status(500).json({ error: 'Failed to create processing jobs' })
    } finally {
      await queryRunner.release()
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

