const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest'

interface GeminiContent {
  role: 'user' | 'model'
  parts: { text: string }[]
}

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[]
    }
  }[]
}

interface GenerateParams {
  apiKey: string
  systemPrompt: string
  contents: GeminiContent[]
  responseSchema?: object
  /** Label used only in error logs, to tell call sites apart. */
  callerLabel: string
}

/**
 * Shared Gemini call with a single retry on transient failures (connection
 * drops, 503s) — free-tier Gemini is flaky enough that every call site needs
 * this, so it lives in one place instead of being copy-pasted per service.
 * 429 (rate limit) is not retried — retrying immediately into an active
 * limit would just fail again.
 */
export async function generateWithGemini({ apiKey, systemPrompt, contents, responseSchema, callerLabel }: GenerateParams): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`

  const call = () => $fetch<GeminiResponse>(url, {
    method: 'POST',
    body: {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      ...(responseSchema
        ? { generationConfig: { responseMimeType: 'application/json', responseSchema } }
        : {}),
    },
  })

  let response: GeminiResponse
  try {
    response = await call()
  } catch (err) {
    const status = (err as { statusCode?: number; response?: { status?: number } })?.statusCode
      ?? (err as { response?: { status?: number } })?.response?.status
    if (status === 429) {
      console.error(`[${callerLabel}] rate limited:`, err)
      throw createError({ statusCode: 429, statusMessage: 'Rate limited by Gemini' })
    }
    console.error(`[${callerLabel}] Gemini request failed, retrying once:`, err)
    response = await call()
  }

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    console.error(`[${callerLabel}] Gemini returned no text. Full response:`, JSON.stringify(response))
    throw createError({ statusCode: 502, statusMessage: 'Empty response from Gemini' })
  }

  return text
}
