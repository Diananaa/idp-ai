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

    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    // Get total count for pagination metadata
    const totalCount = await processingJobRepo.count()

    // Fetch jobs with pagination
    const jobs = await processingJobRepo.find({
      relations: ['documentType', 'model', 'files'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    })

    // Map to response format - only include first file to reduce data size
    const list = jobs.map((job) => ({
      id: job.id,
      status: job.status,
      documentType: job.documentType?.name ?? null,
      model: job.model?.name ?? null,
      createdAt: job.createdAt instanceof Date ? job.createdAt.toISOString() : job.createdAt,
      updatedAt: job.updatedAt instanceof Date ? job.updatedAt.toISOString() : job.updatedAt,
      files: job.files && job.files.length > 0 ? [{
        id: job.files[0].id,
        fileName: job.files[0].fileName,
        fileSize: job.files[0].fileSize ?? 0,
        fileType: job.files[0].fileType ?? null,
      }] : [],
    }))

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)

    return res.status(200).json({
      data: list,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    })
  } catch (error) {
    console.error('Error fetching processing jobs list:', error)
    return res.status(500).json({ error: 'Failed to fetch processing jobs list' })
  }
}

