import type { NextApiRequest, NextApiResponse } from 'next'
import { initDB } from '@/lib/db'
import { AppDataSource } from '@/lib/data-source'
import { ProcessingJob } from '@/lib/entities/ProcessingJob'
import { DocumentType } from '@/lib/entities/DocumentType'
import { Model } from '@/lib/entities/Model'

type CreateProcessingJobPayload = {
  documentTypeId?: number
  modelId?: number
  files?: Array<{
    name: string
    size: number
    type?: string
  }>
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initDB()
  } catch (error) {
    console.error('Error initializing DB:', error)
    return res.status(500).json({ error: 'Failed to connect to database' })
  }

  const processingJobRepo = AppDataSource.getRepository(ProcessingJob)

  if (req.method === 'GET') {
    try {
      const jobs = await processingJobRepo.find({
        relations: ['documentType', 'model'],
        order: { createdAt: 'DESC' },
      })
      return res.status(200).json(jobs)
    } catch (error) {
      console.error('Error fetching processing jobs:', error)
      return res.status(500).json({ error: 'Failed to fetch processing jobs' })
    }
  }

  if (req.method === 'POST') {
    const payload = req.body as CreateProcessingJobPayload

    if (
      !payload?.documentTypeId ||
      !payload?.modelId ||
      !Array.isArray(payload.files) ||
      payload.files.length === 0
    ) {
      return res.status(400).json({
        error: 'documentTypeId, modelId, and at least one file are required',
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

      const newJobs = payload.files.map((file) =>
        processingJobRepo.create({
          documentTypeId: Number(payload.documentTypeId),
          modelId: Number(payload.modelId),
          documentType,
          model,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type ?? null,
          status: 'UPLOADED',
        })
      )

      const savedJobs = await processingJobRepo.save(newJobs)
      return res.status(200).json(savedJobs)
    } catch (error) {
      console.error('Error creating processing jobs:', error)
      return res.status(500).json({ error: 'Failed to create processing jobs' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

