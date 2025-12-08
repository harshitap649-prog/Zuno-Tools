import { NextRequest, NextResponse } from 'next/server'

// Pollinations.ai - Free and reliable image generation service
const POLLINATIONS_URL = 'https://image.pollinations.ai/prompt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, size, model } = body

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const [width, height] = (size || '1024x1024').split('x').map(Number)
    const selectedModel = model || 'flux'

    console.log('Generating image with Pollinations.ai')
    console.log('Prompt:', prompt.substring(0, 50) + '...')
    console.log('Size:', `${width}x${height}`)

    // Use Pollinations.ai - it's free and reliable
    const imageUrl = await generateWithPollinations(prompt.trim(), width, height, selectedModel)
    
    return NextResponse.json({
      imageUrl,
      model: selectedModel,
      provider: 'pollinations'
    })

  } catch (error: any) {
    console.error('Image generation error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { 
        error: 'Failed to generate image',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

async function generateWithPollinations(prompt: string, width: number, height: number, model: string): Promise<string> {
  // Build URL with parameters
  // Model options: flux, stable-diffusion, etc.
  const modelParam = model === 'stable-diffusion' ? '&model=flux' : ''
  const url = `${POLLINATIONS_URL}/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true${modelParam}`
  
  console.log('Fetching from Pollinations:', url.substring(0, 100) + '...')
  
  try {
    // Add timeout to prevent hanging (60 seconds max)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'image/*',
      },
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      console.error('Pollinations API error:', response.status, errorText)
      throw new Error(`Pollinations API error: ${response.status} - ${errorText.substring(0, 100)}`)
    }

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.startsWith('image/')) {
      const text = await response.text().catch(() => '')
      console.error('Unexpected content type:', contentType, text.substring(0, 200))
      throw new Error('Server returned non-image content')
    }

    const blob = await response.blob()
    
    if (blob.size === 0) {
      throw new Error('Received empty image blob')
    }
    
    console.log('Image blob size:', blob.size, 'bytes')
    const dataUrl = await blobToDataURL(blob)
    console.log('Successfully converted to data URL, length:', dataUrl.length)
    
    return dataUrl
  } catch (error: any) {
    console.error('Pollinations fetch error:', error.message)
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again with a shorter prompt.')
    }
    throw error
  }
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (reader.result && typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert blob to data URL'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read blob'))
    reader.readAsDataURL(blob)
  })
}

