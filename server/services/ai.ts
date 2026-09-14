import type { ChatMessage } from '../../shared/types'
import { generateWithGemini } from './geminiClient'

function toGeminiContents(messages: ChatMessage[]) {
  return messages.map(m => ({
    role: (m.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
    parts: [{ text: m.content }],
  }))
}

export async function generateReply(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  const apiKey = useRuntimeConfig().geminiApiKey
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'GEMINI_API_KEY is not configured' })
  }

  return generateWithGemini({
    apiKey,
    systemPrompt,
    contents: toGeminiContents(messages),
    callerLabel: 'ai',
  })
}
