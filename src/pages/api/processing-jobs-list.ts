import type { NextApiRequest, NextApiResponse } from 'next'
import { initDB } from '@/lib/db'
import { AppDataSource } from '@/lib/data-source'
import { ProcessingJob } from '@/lib/entities/ProcessingJob'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await initDB()
  } catch (error) {
    console.error('Error initializing DB:', error)
    return res.status(500).json({ error: 'Failed to connect to database' })
  }

  try {
    const processingJobRepo = AppDataSource.getRepository(ProcessingJob)

    const jobs = await processingJobRepo.find({
      relations: ['documentType', 'model', 'documentTypeOneToOne', 'modelOneToOne'],
      order: { createdAt: 'DESC' },
    })

    const list = jobs.map((job) => ({
      id: job.id,
      fileName: job.fileName,
      fileSize: job.fileSize,
      fileType: job.fileType,
      status: job.status,
      documentType:
        job.documentTypeOneToOne?.name ??
        job.documentType?.name ??
        null,
      model:
        job.modelOneToOne?.name ??
        job.model?.name ??
        null,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    }))

    return res.status(200).json(list)
  } catch (error) {
    console.error('Error fetching processing jobs list:', error)
    return res.status(500).json({ error: 'Failed to fetch processing jobs list' })
  }
}

