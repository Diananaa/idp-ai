import { ChatGoogleGenerativeAI, type GoogleGenerativeAIChatInput } from '@langchain/google-genai'

const GEMINI_FLASH_MODEL = 'gemini-2.5-flash'
const DEFAULT_CONFIG: Partial<GoogleGenerativeAIChatInput> = {
  temperature: 0.2,
  maxOutputTokens: 2048,
  streamUsage: true,
}

let cachedModel: ChatGoogleGenerativeAI | null = null

type GeminiOverrides = Partial<Omit<GoogleGenerativeAIChatInput, 'apiKey' | 'model'>>

/**
 * Returns a singleton instance of the Gemini 2.5 Flash chat model configured for LangChain.
 * Pass overrides if you need to adjust inference params for a specific call-site.
 */
export const getGeminiFlashModel = (overrides: GeminiOverrides = {}) => {
  const apiKey = process.env.API_KEY_AI_STUDIO_GOOGLE
  if (!apiKey) {
    throw new Error('Missing API_KEY_AI_STUDIO_GOOGLE environment variable')
  }

  if (!cachedModel) {
    cachedModel = new ChatGoogleGenerativeAI({
      model: GEMINI_FLASH_MODEL,
      apiKey,
      ...DEFAULT_CONFIG,
      ...overrides,
    })
  } else if (Object.keys(overrides).length > 0) {
    return new ChatGoogleGenerativeAI({
      model: GEMINI_FLASH_MODEL,
      apiKey,
      ...DEFAULT_CONFIG,
      ...overrides,
    })
  }

  return cachedModel
}

