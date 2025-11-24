import type { NextApiRequest, NextApiResponse } from 'next'
import { initDB } from '@/lib/db'
import { AppDataSource } from '@/lib/data-source'
import { File as ProcessingFile } from '@/lib/entities/File'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { fileId } = req.query

  if (!fileId || typeof fileId !== 'string') {
    return res.status(400).json({ error: 'File ID is required' })
  }

  const id = parseInt(fileId, 10)
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid file ID' })
  }

  try {
    await initDB()
  } catch (error) {
    console.error('Error initializing DB:', error)
    return res.status(500).json({ error: 'Failed to connect to database' })
  }

  const fileRepo = AppDataSource.getRepository(ProcessingFile)

  if (req.method === 'PATCH' || req.method === 'PUT') {
    try {
      const file = await fileRepo.findOneBy({ id })

      if (!file) {
        return res.status(404).json({ error: 'File not found' })
      }

      const { ocrResult } = req.body

      if (!ocrResult) {
        return res.status(400).json({ error: 'OCR result is required' })
      }

      // Validate JSON structure
      let formatted: string
      try {
        // If it's already a string, validate it by parsing
        const parsed = typeof ocrResult === 'string' ? JSON.parse(ocrResult) : ocrResult
        formatted = typeof ocrResult === 'string' ? ocrResult : JSON.stringify(ocrResult)
        // Validate structure has meta and fields
        if (!parsed.meta || !parsed.fields) {
          return res.status(400).json({ error: 'Invalid OCR structure: must have meta and fields' })
        }
      } catch (parseError) {
        return res.status(400).json({ error: 'Invalid JSON format' })
      }

      file.OCRResult = formatted
      await fileRepo.save(file)

      return res.status(200).json({
        message: 'OCR result updated successfully',
        file: {
          id: file.id,
          fileName: file.fileName,
          OCRResult: file.OCRResult,
        },
      })
    } catch (error) {
      console.error('Error updating OCR result:', error)
      return res.status(500).json({ error: 'Failed to update OCR result' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

