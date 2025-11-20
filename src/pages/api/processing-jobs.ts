import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { type File as FormidableFile } from 'formidable'
import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { initDB } from '@/lib/db'
import { AppDataSource } from '@/lib/data-source'
import { ProcessingJob } from '@/lib/entities/ProcessingJob'
import { DocumentType } from '@/lib/entities/DocumentType'
import { Model } from '@/lib/entities/Model'
import { File as ProcessingFile } from '@/lib/entities/File'

export const config = {
  api: {
    bodyParser: false,
  },
}

type ParsedUploadPayload = {
  documentTypeId: number
  modelId: number
  files: FormidableFile[]
}

const uploadDir = path.join(process.cwd(), 'public', 'uploads')

async function ensureUploadDir() {
  await fs.mkdir(uploadDir, { recursive: true })
}

function normalizeFieldValue(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }
  return value
}

async function parseMultipartRequest(req: NextApiRequest): Promise<ParsedUploadPayload> {
  await ensureUploadDir()

  const form = formidable({
    multiples: true,
    uploadDir,
    keepExtensions: true,
    maxFileSize: 20 * 1024 * 1024, // 20MB per file
    filename: (_name, _ext, part) => {
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

  const { fields, files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    form.parse(req, (err, parsedFields, parsedFiles) => {
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
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
        status: 'UPLOADED',
      })

      const savedJob = await processingJobRepo.save(newJob)

      const newFiles = payload.files.map((file) =>
        fileRepo.create({
          processingJobId: savedJob.id,
          processingJob: savedJob,
          fileName: file.originalFilename ?? file.newFilename,
          fileSize: file.size ?? null,
          fileType: file.mimetype ?? null,
          filePath: path.join('uploads', path.basename(file.filepath ?? file.newFilename)),
          status: 'UPLOADED',
          processTime: 0,
        })
      )
      await fileRepo.save(newFiles)

      const jobWithRelations = await processingJobRepo.findOne({
        where: { id: savedJob.id },
        relations: ['documentType', 'model', 'files'],
      })

      if (!jobWithRelations) {
        throw new Error('Failed to load processing job after creation')
      }

      return res.status(200).json(jobWithRelations)
    } catch (error) {
      console.error('Error creating processing jobs:', error)
      return res.status(500).json({ error: 'Failed to create processing jobs' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

