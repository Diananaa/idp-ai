import type { NextApiRequest, NextApiResponse } from 'next'
import { initDB } from '@/lib/db'
import { AppDataSource } from '@/lib/data-source'
import { ProcessingJob } from '@/lib/entities/ProcessingJob'
import { File as ProcessingFile } from '@/lib/entities/File'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Job ID is required' })
  }

  const jobId = parseInt(id, 10)
  if (isNaN(jobId)) {
    return res.status(400).json({ error: 'Invalid job ID' })
  }

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
      const job = await processingJobRepo.findOne({
        where: { id: jobId },
        relations: ['documentType', 'model', 'files'],
      })
console.log(job)
      if (!job) {
        return res.status(404).json({ error: 'Processing job not found' })
      }

      // Format response
      const response = {
        id: job.id,
        status: job.status,
        resultJson: job.resultJson,
        documentType: job.documentType
          ? {
              id: job.documentType.id,
              name: job.documentType.name,
            }
          : null,
        model: job.model
          ? {
              id: job.model.id,
              name: job.model.name,
            }
          : null,
        createdAt: job.createdAt instanceof Date ? job.createdAt.toISOString() : job.createdAt,
        updatedAt: job.updatedAt instanceof Date ? job.updatedAt.toISOString() : job.updatedAt,
        files: job.files?.map((file) => ({
          id: file.id,
          fileName: file.fileName,
          filePath: file.filePath,
          fileSize: file.fileSize,
          fileType: file.fileType,
          status: file.status,
          processTime: file.processTime,
          OCRResult: file.OCRResult,
          createdAt: file.createdAt instanceof Date ? file.createdAt.toISOString() : file.createdAt,
        })) || [],
      }

      return res.status(200).json(response)
    } catch (error) {
      console.error('Error fetching processing job detail:', error)
      return res.status(500).json({ error: 'Failed to fetch processing job detail' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const job = await processingJobRepo.findOne({
        where: { id: jobId },
        relations: ['files'],
      })

      if (!job) {
        return res.status(404).json({ error: 'Processing job not found' })
      }

      // Delete associated files first (if cascade doesn't work)
      if (job.files && job.files.length > 0) {
        await fileRepo.remove(job.files)
      }

      // Delete the processing job
      await processingJobRepo.remove(job)

      return res.status(200).json({ message: 'Processing job deleted successfully' })
    } catch (error) {
      console.error('Error deleting processing job:', error)
      return res.status(500).json({ error: 'Failed to delete processing job' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

