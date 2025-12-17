import { promises as fs } from 'fs'
import path from 'path'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { getGeminiFlashModel } from './langchain'

export type OcrFieldValue = {
  value: string | number
  currency?: string
  confidence?: number
}

export type OcrField = {
  name: string
  value: OcrFieldValue
}

export type StructuredOcrResult = {
  meta: {
    documentType: string
    model: string
    processedAt: string
  }
  fields: OcrField[]
}

type RunGeminiOcrOptions = {
  filePath: string
  fileName: string
  mimeType?: string | null
  documentTypeName: string
  modelName: string
}

const MIME_BY_EXTENSION: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

function inferMimeType(filePath: string, provided?: string | null) {
  if (provided) return provided
  const ext = path.extname(filePath).toLowerCase()
  return MIME_BY_EXTENSION[ext] ?? 'image/png'
}

function extractJsonPayload(raw: string, logPrefix: string) {
  const trimmed = raw.trim()
  if (!trimmed) {
    console.warn(`${logPrefix} empty response content, nothing to parse`)
    return trimmed
  }

  if (trimmed.startsWith('```')) {
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
    if (fenceMatch) {
      const extracted = fenceMatch[1].trim()
      console.log(`${logPrefix} stripped markdown fences from response`, { length: extracted.length })
      return extracted
    }
  }

  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const sliced = trimmed.slice(firstBrace, lastBrace + 1)
    if (sliced.length !== trimmed.length) {
      console.log(`${logPrefix} trimmed extraneous text outside JSON braces`, { length: sliced.length })
    }
    return sliced
  }

  return trimmed
}

function coerceToStructuredResult(text: string, fallback: StructuredOcrResult, logPrefix: string): StructuredOcrResult {
  try {
    const parsed = JSON.parse(text) as StructuredOcrResult
    if (parsed?.meta && parsed?.fields) {
      return {
        meta: {
          documentType: parsed.meta.documentType ?? fallback.meta.documentType,
          model: parsed.meta.model ?? fallback.meta.model,
          processedAt: parsed.meta.processedAt ?? fallback.meta.processedAt,
        },
        fields: Array.isArray(parsed.fields) ? parsed.fields : fallback.fields,
      }
    }
  } catch {
    // swallow parsing error and return fallback
  }
  console.warn(`${logPrefix} failed to parse JSON, using fallback`, { textSnippet: text.slice(0, 200) })
  return fallback
}

function buildImagePromptMessages(params: { system: string; user: string; mime: string; base64: string }) {
  const { system, user, mime, base64 } = params
  const imageUrl = `data:${mime};base64,${base64}`

  return [
    new SystemMessage(system),
    new HumanMessage({
      content: [
        { type: 'text', text: user },
        {
          type: 'image_url',
          image_url: { url: imageUrl },
        },
      ],
    }),
  ]
}

export async function runGeminiOcrOnFile({
  filePath,
  fileName,
  mimeType,
  documentTypeName,
  modelName,
}: RunGeminiOcrOptions): Promise<StructuredOcrResult> {
  const logPrefix = `[GeminiOCR:${fileName}]`
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)
  console.log(`${logPrefix} reading file from disk`, { absolutePath })

  const fileBuffer = await fs.readFile(absolutePath)
  console.log(`${logPrefix} file loaded`, { sizeInKB: Number((fileBuffer.length / 1024).toFixed(2)) })

  const mime = inferMimeType(filePath, mimeType)
  console.log(`${logPrefix} inferred mime type`, { mime })

  const base64 = fileBuffer.toString('base64')
  console.log(`${logPrefix} encoded file to base64`, { length: base64.length })

  const llm = getGeminiFlashModel()
  console.log(`${logPrefix} instantiated Gemini model`)

  const defaultResult: StructuredOcrResult = {
    meta: {
      documentType: documentTypeName,
      model: modelName,
      processedAt: new Date().toISOString(),
    },
    fields: [],
  }

  const primaryMessages = buildImagePromptMessages({
    system: `You are an OCR extraction engine. You must ONLY respond with JSON that matches:
{
  "meta": {
    "documentType": string,
    "model": string,
    "processedAt": ISO8601 string
  },
  "fields": [
    {
      "name": string,
      "value": {
        "value": string | number,
        "currency"?: string,
        "confidence"?: number between 0 and 1
      }
    }
  ]
}

If a value does not exist, omit that field entirely. JSON must be valid and minify numbers where possible.`,
    user: `Extract the key data points for document type "${documentTypeName}" produced by model "${modelName}". Return valid JSON only.`,
    mime,
    base64,
  })
console.log('primaryMessages', primaryMessages)
  const primaryResponse = await llm.invoke(primaryMessages)
  console.log(`${logPrefix} primary model response`, primaryResponse)

  const primaryContent = Array.isArray(primaryResponse.content)
    ? primaryResponse.content
        .map((part) => {
          if (typeof part === 'string') return part
          if ('text' in part && part.text) return part.text
          return ''
        })
        .join('\n')
    : typeof primaryResponse.content === 'string'
    ? primaryResponse.content
    : ''

  const cleanedPrimary = extractJsonPayload(primaryContent, logPrefix)
  let parsedResult = coerceToStructuredResult(cleanedPrimary, defaultResult, logPrefix)
  console.log(`${logPrefix} parsed primary result`, parsedResult)

  if (parsedResult.fields.length > 0) {
    console.log(`${logPrefix} returning primary result with fields`, { count: parsedResult.fields.length })
    return parsedResult
  }

  console.warn(`${logPrefix} primary result empty, running table-aware fallback prompt`)

  const fallbackMessages = buildImagePromptMessages({
    system:
      'You map tabular/structured documents into key-value JSON. Treat the first column as the label (e.g., "Nama", "Alamat", "Nomor induk pegawai") and the adjacent column as the value. Always respond with the JSON schema described earlier.',
    user: `Identify every field you can see in the image "${fileName}". If you see an Indonesian form/table, convert each row into { "name": string, "value": { "value": string } } entries. Return JSON only.`,
    mime,
    base64,
  })

  const fallbackResponse = await llm.invoke(fallbackMessages)
  console.log(`${logPrefix} fallback model response`, fallbackResponse)

  const fallbackContent = Array.isArray(fallbackResponse.content)
    ? fallbackResponse.content
        .map((part) => {
          if (typeof part === 'string') return part
          if ('text' in part && part.text) return part.text
          return ''
        })
        .join('\n')
    : typeof fallbackResponse.content === 'string'
    ? fallbackResponse.content
    : ''

  const cleanedFallback = extractJsonPayload(fallbackContent, logPrefix)
  parsedResult = coerceToStructuredResult(cleanedFallback, defaultResult, logPrefix)
  console.log(`${logPrefix} parsed fallback result`, parsedResult)

  if (!parsedResult.fields.length) {
    console.warn(`${logPrefix} fallback also empty, returning default metadata only`)
  }

  return parsedResult
}

