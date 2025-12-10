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

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
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
      throw new Error(`Groq API error: ${groqResponse.status} ${errText}`)
    }

    const data = await groqResponse.json()
    const response =
      data?.choices?.[0]?.message?.content?.trim() ||
      'I could not generate a response right now. Please try again.'

    return NextResponse.json({ response })

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


