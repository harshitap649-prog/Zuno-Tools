import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationHistory } = body

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Force Groq only. If no key, return error.
    const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is missing in environment variables' },
        { status: 500 }
      )
    }

    // Limit history to last 10 messages for context
    const history = (conversationHistory || []).slice(-10)

    // Try current Groq models in order (drop decommissioned ones)
    const models = [
      'llama-3.3-70b-instruct',   // primary
      'llama-3.3-70b-versatile',  // secondary
      'mixtral-8x7b-32768'        // fallback
    ]

    let responseText = ''
    let lastError: string | null = null

    for (const model of models) {
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful, friendly, and knowledgeable AI assistant. Answer questions accurately, provide detailed information, and help users with any task. Be conversational and engaging like ChatGPT.'
            },
            ...history,
            {
              role: 'user',
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      })

      if (!groqResponse.ok) {
        const errText = await groqResponse.text().catch(() => '')
        lastError = `Model ${model} failed (status ${groqResponse.status}): ${errText?.slice(0, 300) || 'No error text returned.'}`
        console.error('Groq API error:', lastError)
        continue
      }

      let data: any = null
      try {
        data = await groqResponse.json()
      } catch (parseErr: any) {
        lastError = `Model ${model} parse error: ${parseErr?.message || 'Unknown parse error'}`
        console.error('Groq JSON parse error:', parseErr)
        continue
      }

      responseText = data?.choices?.[0]?.message?.content?.trim() || ''
      // Append which model produced the answer for debugging
      if (responseText) {
        responseText += `\n\n(Model used: ${model})`
      }
      if (responseText) break
    }

    if (!responseText) {
      return NextResponse.json({
        response: `All Groq models failed. ${lastError || 'No additional error info.'}`
      })
    }

    return NextResponse.json({ response: responseText })

  } catch (error: any) {
    console.error('Chat assistance error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}


