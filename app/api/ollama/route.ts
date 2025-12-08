import { NextRequest, NextResponse } from 'next/server'

// Ollama API endpoint (default: http://localhost:11434)
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434'
const DEFAULT_MODEL = process.env.OLLAMA_DEFAULT_MODEL || 'llama3:latest'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, language, model } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Construct the code generation prompt
    const codePrompt = `You are an expert ${language} programmer. Generate clean, well-commented ${language} code based on the following description:

${prompt}

Requirements:
- Write only the code, no explanations unless necessary
- Include helpful comments
- Follow best practices for ${language}
- Make the code production-ready

Code:`

    // Use the provided model or default, ensure we have the full model name
    const modelToUse = model || DEFAULT_MODEL
    console.log('Generating code with model:', modelToUse)
    
    // Call Ollama API with streaming disabled
    const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelToUse,
        prompt: codePrompt,
        stream: false,
      }),
    })

    if (!response.ok) {
      console.error('Ollama API error:', response.status, response.statusText)
      // Check if Ollama is running
      if (response.status === 0 || response.status >= 500) {
        return NextResponse.json(
          { 
            error: 'Cannot connect to Ollama. Please make sure Ollama is running on your system.',
            details: 'Ollama should be running at ' + OLLAMA_API_URL
          },
          { status: 503 }
        )
      }
      
      const errorText = await response.text().catch(() => '')
      let errorData: { error?: string; [key: string]: any } = {}
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText || 'Unknown error' }
      }
      
      return NextResponse.json(
        { error: errorData.error || 'Failed to generate code', details: errorData },
        { status: response.status }
      )
    }

    // Read response as text first to handle potential streaming format
    const responseText = await response.text()
    let generatedCode = ''
    
    try {
      // Try to parse as single JSON object (non-streaming)
      const data = JSON.parse(responseText)
      generatedCode = data.response || ''
    } catch {
      // If parsing fails, it might be streaming format (multiple JSON lines)
      // Parse each line and collect responses
      const lines = responseText.trim().split('\n').filter(line => line.trim())
      let fullResponse = ''
      
      for (const line of lines) {
        try {
          const chunk = JSON.parse(line)
          if (chunk.response) {
            fullResponse += chunk.response
          }
          // If this is the final chunk, we're done
          if (chunk.done) {
            break
          }
        } catch {
          // Skip invalid JSON lines
          continue
        }
      }
      
      generatedCode = fullResponse
    }

    if (!generatedCode) {
      return NextResponse.json(
        { error: 'No code was generated. Please try again with a different prompt.' },
        { status: 500 }
      )
    }

    console.log('Code generated successfully, length:', generatedCode.length)

    return NextResponse.json({
      code: generatedCode,
      model: modelToUse,
    })
  } catch (error: any) {
    console.error('Ollama API error:', error)
    
    // Check if it's a connection error
    if (error.code === 'ECONNREFUSED' || error.message?.includes('fetch')) {
      return NextResponse.json(
        { 
          error: 'Cannot connect to Ollama. Please make sure Ollama is installed and running.',
          details: 'Start Ollama application or run: ollama serve'
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate code', details: error.message },
      { status: 500 }
    )
  }
}

// Health check endpoint to verify Ollama is running
export async function GET() {
  try {
    console.log('Checking Ollama connection at:', OLLAMA_API_URL)
    
    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    const response = await fetch(`${OLLAMA_API_URL}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error('Ollama API returned error:', response.status, response.statusText)
      return NextResponse.json(
        { 
          connected: false,
          error: 'Ollama is not running or not accessible',
          url: OLLAMA_API_URL,
          status: response.status
        },
        { status: 503 }
      )
    }

    const data = await response.json()
    const models = data.models || []

    console.log('Ollama connected successfully, models found:', models.length)

    return NextResponse.json({
      connected: true,
      models: models.map((m: any) => ({
        name: m.name,
        size: m.size,
        modified: m.modified_at,
      })),
      url: OLLAMA_API_URL,
    })
  } catch (error: any) {
    console.error('Ollama connection error:', error.message, error.code)
    return NextResponse.json(
      { 
        connected: false,
        error: 'Cannot connect to Ollama',
        details: error.message,
        code: error.code,
        url: OLLAMA_API_URL
      },
      { status: 503 }
    )
  }
}

