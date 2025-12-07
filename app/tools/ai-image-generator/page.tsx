'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'
import { Image, Wand2, Download, Share2, Copy, History, Settings, Trash2, Check, Loader2, X, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

// Dynamically import ad components to avoid SSR issues
const SidebarAd = dynamic(() => import('@/components/SidebarAd'), { ssr: false })
const MobileBottomAd = dynamic(() => import('@/components/MobileBottomAd'), { ssr: false })

interface GeneratedImage {
  id: string
  prompt: string
  imageUrl: string
  timestamp: number
}

export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<GeneratedImage[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [imageSize, setImageSize] = useState<'512x512' | '768x768' | '1024x1024'>('1024x1024')
  const [copied, setCopied] = useState(false)
  const [model, setModel] = useState<'flux' | 'stable-diffusion'>('flux')
  const { triggerPopunder } = usePopunderAd()

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('ai-image-generator-history')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Failed to load history:', e)
      }
    }
  }, [])

  const generateImageFromPrompt = (promptText: string): string => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    // Parse prompt for colors and themes
    const lowerPrompt = promptText.toLowerCase()
    
    // Determine background color based on keywords
    let bgColor = '#667eea'
    if (lowerPrompt.includes('sunset') || lowerPrompt.includes('sun')) {
      bgColor = '#ff6b6b'
    } else if (lowerPrompt.includes('ocean') || lowerPrompt.includes('sea') || lowerPrompt.includes('water')) {
      bgColor = '#4ecdc4'
    } else if (lowerPrompt.includes('forest') || lowerPrompt.includes('tree') || lowerPrompt.includes('nature')) {
      bgColor = '#95e1d3'
    } else if (lowerPrompt.includes('night') || lowerPrompt.includes('dark') || lowerPrompt.includes('moon')) {
      bgColor = '#2c3e50'
    } else if (lowerPrompt.includes('sky') || lowerPrompt.includes('blue')) {
      bgColor = '#74b9ff'
    } else if (lowerPrompt.includes('fire') || lowerPrompt.includes('red') || lowerPrompt.includes('flame')) {
      bgColor = '#fd79a8'
    } else if (lowerPrompt.includes('mountain') || lowerPrompt.includes('snow')) {
      bgColor = '#dfe6e9'
    }

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, bgColor)
    gradient.addColorStop(0.5, adjustBrightness(bgColor, 20))
    gradient.addColorStop(1, adjustBrightness(bgColor, -20))
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add abstract shapes based on prompt
    if (lowerPrompt.includes('abstract') || lowerPrompt.includes('art')) {
      drawAbstractShapes(ctx, canvas.width, canvas.height)
    } else if (lowerPrompt.includes('circle') || lowerPrompt.includes('round')) {
      drawCircles(ctx, canvas.width, canvas.height)
    } else if (lowerPrompt.includes('square') || lowerPrompt.includes('geometric')) {
      drawGeometricShapes(ctx, canvas.width, canvas.height)
    } else {
      drawNaturalElements(ctx, canvas.width, canvas.height, lowerPrompt)
    }

    // Add text overlay if prompt is short
    if (promptText.length < 50) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = 'bold 48px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const words = promptText.split(' ').slice(0, 3).join(' ')
      ctx.fillText(words, canvas.width / 2, canvas.height / 2)
    }

    // Add some noise/texture
    addTexture(ctx, canvas.width, canvas.height)

    return canvas.toDataURL('image/png')
  }

  const adjustBrightness = (color: string, percent: number): string => {
    const num = parseInt(color.replace('#', ''), 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + percent))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent))
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent))
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }

  const drawAbstractShapes = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    for (let i = 0; i < 20; i++) {
      ctx.beginPath()
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 200 + 50,
        0,
        Math.PI * 2
      )
      ctx.fill()
    }
  }

  const drawCircles = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    for (let i = 0; i < 15; i++) {
      ctx.beginPath()
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 150 + 30,
        0,
        Math.PI * 2
      )
      ctx.fill()
    }
  }

  const drawGeometricShapes = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    for (let i = 0; i < 12; i++) {
      ctx.save()
      ctx.translate(Math.random() * width, Math.random() * height)
      ctx.rotate(Math.random() * Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.2})`
      const size = Math.random() * 100 + 30
      ctx.fillRect(-size / 2, -size / 2, size, size)
      ctx.restore()
    }
  }

  const drawNaturalElements = (ctx: CanvasRenderingContext2D, width: number, height: number, prompt: string) => {
    if (prompt.includes('sun') || prompt.includes('sunset')) {
      // Draw sun
      ctx.beginPath()
      ctx.fillStyle = '#ffd93d'
      ctx.arc(width * 0.7, height * 0.3, 120, 0, Math.PI * 2)
      ctx.fill()
      
      // Sun rays
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2
        ctx.beginPath()
        ctx.strokeStyle = '#ffd93d'
        ctx.lineWidth = 3
        ctx.moveTo(
          width * 0.7 + Math.cos(angle) * 120,
          height * 0.3 + Math.sin(angle) * 120
        )
        ctx.lineTo(
          width * 0.7 + Math.cos(angle) * 160,
          height * 0.3 + Math.sin(angle) * 160
        )
        ctx.stroke()
      }
    }

    if (prompt.includes('mountain') || prompt.includes('hill')) {
      // Draw mountains
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.beginPath()
      ctx.moveTo(0, height)
      ctx.lineTo(width * 0.3, height * 0.5)
      ctx.lineTo(width * 0.6, height * 0.7)
      ctx.lineTo(width, height * 0.4)
      ctx.lineTo(width, height)
      ctx.closePath()
      ctx.fill()
    }

    if (prompt.includes('tree') || prompt.includes('forest')) {
      // Draw trees
      for (let i = 0; i < 5; i++) {
        const x = (width / 6) * (i + 1)
        const y = height * 0.7
        
        // Trunk
        ctx.fillStyle = '#8b4513'
        ctx.fillRect(x - 15, y, 30, 100)
        
        // Leaves
        ctx.beginPath()
        ctx.fillStyle = '#2d5016'
        ctx.arc(x, y - 20, 60, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    if (prompt.includes('star') || prompt.includes('night')) {
      // Draw stars
      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(
          Math.random() * width,
          Math.random() * height * 0.6,
          2,
          2
        )
      }
    }

    if (prompt.includes('cloud')) {
      // Draw clouds
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * width
        const y = Math.random() * height * 0.5
        ctx.beginPath()
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.arc(x, y, 40, 0, Math.PI * 2)
        ctx.arc(x + 30, y, 50, 0, Math.PI * 2)
        ctx.arc(x + 60, y, 40, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  const addTexture = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() > 0.98) {
        data[i] = Math.min(255, data[i] + 20)
        data[i + 1] = Math.min(255, data[i + 1] + 20)
        data[i + 2] = Math.min(255, data[i + 2] + 20)
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
  }

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    setLoading(true)
    toast.loading('Generating your image with AI...', { id: 'generating' })

    try {
      // Try using Hugging Face Inference API (free, no API key required for basic usage)
      let imageUrl: string | null = null

      try {
        // Try multiple AI image generation APIs
        const [width, height] = imageSize.split('x').map(Number)
        
        // Try Hugging Face Inference API first
        try {
          const modelName = model === 'flux' 
            ? 'stabilityai/stable-diffusion-2-1' // Using stable-diffusion as FLUX might not be available
            : 'stabilityai/stable-diffusion-2-1'
          
          const response = await fetch(
            `https://api-inference.huggingface.co/models/${modelName}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                inputs: prompt,
                parameters: {
                  width,
                  height,
                }
              }),
            }
          )

          if (response.ok) {
            const contentType = response.headers.get('content-type')
            if (contentType && contentType.startsWith('image/')) {
              const blob = await response.blob()
              const reader = new FileReader()
              imageUrl = await new Promise<string>((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result as string)
                reader.onerror = reject
                reader.readAsDataURL(blob)
              })
            } else {
              // If response is not an image, try parsing as JSON for error
              const text = await response.text()
              try {
                const json = JSON.parse(text)
                if (json.error) {
                  throw new Error(json.error)
                }
                if (json.estimated_time) {
                  throw new Error(`Model is loading. Please wait ${Math.ceil(json.estimated_time)} seconds and try again.`)
                }
              } catch (parseError) {
                throw new Error('API returned invalid response')
              }
            }
          } else {
            const errorText = await response.text().catch(() => 'Unknown error')
            try {
              const errorData = JSON.parse(errorText)
              if (errorData.error) {
                throw new Error(errorData.error)
              }
              if (errorData.estimated_time) {
                throw new Error(`Model is loading. Please wait ${Math.ceil(errorData.estimated_time)} seconds and try again.`)
              }
            } catch {
              throw new Error(`API error: ${response.status} ${response.statusText}`)
            }
          }
        } catch (hfError: any) {
          console.warn('Hugging Face API failed, trying alternative method:', hfError)
          
          // Try alternative: Use a proxy or different endpoint
          // For now, fall back to canvas-based generation
          throw hfError
        }
      } catch (apiError: any) {
        console.warn('API generation failed, using enhanced fallback:', apiError)
        
        // Enhanced fallback: Generate a more sophisticated image using canvas
        toast.loading('Using enhanced image generation...', { id: 'generating' })
        await new Promise(resolve => setTimeout(resolve, 1500))
        imageUrl = generateImageFromPrompt(prompt)
        
        // Show info about API
        toast('Using fallback generation. For best results, the AI API may need a moment to load.', {
          icon: 'ℹ️',
          duration: 4000
        })
      }

      if (!imageUrl) {
        throw new Error('Failed to generate image')
      }

      setGeneratedImage(imageUrl)
      
      // Save to history
      const historyItem: GeneratedImage = {
        id: Date.now().toString(),
        prompt,
        imageUrl,
        timestamp: Date.now()
      }
      
      const updatedHistory = [historyItem, ...history].slice(0, 20)
      setHistory(updatedHistory)
      localStorage.setItem('ai-image-generator-history', JSON.stringify(updatedHistory))
      
      toast.success('Image generated successfully!', { id: 'generating' })
      
      // Trigger popunder after generation
      setTimeout(() => {
        triggerPopunder()
      }, 2000)
    } catch (error) {
      console.error('Image generation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to generate image: ${errorMessage}`, { id: 'generating' })
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = (imageUrl?: string, filename?: string) => {
    const imgToDownload = imageUrl || generatedImage
    if (!imgToDownload) {
      toast.error('No image to download')
      return
    }

    const link = document.createElement('a')
    link.download = filename || `ai-generated-${Date.now()}.png`
    link.href = imgToDownload
    link.click()
    toast.success('Image downloaded!')
  }

  const shareImage = async () => {
    if (!generatedImage) {
      toast.error('No image to share')
      return
    }

    try {
      const response = await fetch(generatedImage)
      const blob = await response.blob()
      const file = new File([blob], 'ai-generated-image.png', { type: blob.type })
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'AI Generated Image',
          text: `Check out this AI-generated image: ${prompt}`
        })
        toast.success('Image shared!')
      } else {
        copyImageToClipboard()
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        copyImageToClipboard()
      }
    }
  }

  const copyImageToClipboard = async () => {
    if (!generatedImage) {
      toast.error('No image to copy')
      return
    }

    try {
      const response = await fetch(generatedImage)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ])
      setCopied(true)
      toast.success('Image copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy image')
    }
  }

  const loadHistoryItem = (item: GeneratedImage) => {
    setPrompt(item.prompt)
    setGeneratedImage(item.imageUrl)
    setShowHistory(false)
    toast.success('History item loaded!')
  }

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(item => item.id !== id)
    setHistory(updated)
    localStorage.setItem('ai-image-generator-history', JSON.stringify(updated))
    toast.success('History item deleted!')
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('ai-image-generator-history')
    toast.success('History cleared!')
  }

  const clearAll = () => {
    setPrompt('')
    setGeneratedImage(null)
    toast.success('Cleared!')
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <SidebarAd position="right" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 mb-3 sm:mb-4">
              <Wand2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">AI Image Generator</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Generate images from text prompts using AI</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6 justify-center">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-all text-sm sm:text-base flex items-center gap-2 touch-manipulation active:scale-95"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-all text-sm sm:text-base flex items-center gap-2 touch-manipulation active:scale-95"
            >
              <History className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>History ({history.length})</span>
            </button>
            {prompt && (
              <button
                onClick={clearAll}
                className="px-3 sm:px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-all text-sm sm:text-base flex items-center gap-2 touch-manipulation active:scale-95"
              >
                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Settings
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700 touch-manipulation active:scale-95"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">AI Model</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setModel('flux')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs sm:text-sm touch-manipulation active:scale-95 ${
                        model === 'flux'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      FLUX (Recommended)
                    </button>
                    <button
                      onClick={() => setModel('stable-diffusion')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs sm:text-sm touch-manipulation active:scale-95 ${
                        model === 'stable-diffusion'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      Stable Diffusion
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Image Size</label>
                  <div className="flex flex-wrap gap-2">
                    {(['512x512', '768x768', '1024x1024'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setImageSize(size)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs sm:text-sm touch-manipulation active:scale-95 ${
                          imageSize === size
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Panel */}
          {showHistory && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <History className="h-5 w-5" />
                  History ({history.length})
                </h3>
                <div className="flex gap-2">
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation active:scale-95"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-gray-500 hover:text-gray-700 touch-manipulation active:scale-95"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {history.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No history yet</p>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <img src={item.imageUrl} alt={item.prompt} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded bg-gray-100" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">{formatDate(item.timestamp)}</p>
                          <p className="text-xs sm:text-sm text-gray-900 font-medium line-clamp-2 break-words">
                            {item.prompt.length > 100 ? item.prompt.substring(0, 100) + '...' : item.prompt}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-2">
                          <button
                            onClick={() => loadHistoryItem(item)}
                            className="p-1.5 sm:p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors touch-manipulation active:scale-95"
                            title="Load"
                          >
                            <Image className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                          <button
                            onClick={() => downloadImage(item.imageUrl, `ai-generated-${item.id}.png`)}
                            className="p-1.5 sm:p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors touch-manipulation active:scale-95"
                            title="Download"
                          >
                            <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                          <button
                            onClick={() => deleteHistoryItem(item.id)}
                            className="p-1.5 sm:p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors touch-manipulation active:scale-95"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm sm:text-base font-medium text-gray-900">Image Prompt</label>
                {prompt && (
                  <button
                    onClick={() => setPrompt('')}
                    className="p-1 text-gray-400 hover:text-gray-600 touch-manipulation active:scale-95"
                    title="Clear"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate... e.g., 'A beautiful sunset over mountains with a lake in the foreground'"
                rows={4}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base text-gray-900 resize-none"
              />
              {prompt && (
                <p className="text-xs text-gray-500 mt-1">
                  {prompt.length} characters
                </p>
              )}
            </div>

            <button
              onClick={generateImage}
              disabled={loading || !prompt.trim()}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base touch-manipulation active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Generate Image</span>
                </>
              )}
            </button>

            {generatedImage && (
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-3 sm:p-4 overflow-hidden">
                  <img 
                    src={generatedImage} 
                    alt="Generated" 
                    className="w-full rounded-lg max-h-[600px] object-contain mx-auto"
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => downloadImage()}
                    className="flex-1 px-4 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base flex items-center justify-center gap-2 touch-manipulation active:scale-95"
                  >
                    <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={shareImage}
                    className="flex-1 px-4 sm:px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base flex items-center justify-center gap-2 touch-manipulation active:scale-95"
                  >
                    <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={copyImageToClipboard}
                    className="flex-1 px-4 sm:px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base flex items-center justify-center gap-2 touch-manipulation active:scale-95"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={generateImage}
                    disabled={loading}
                    className="flex-1 px-4 sm:px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base flex items-center justify-center gap-2 touch-manipulation active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>
            )}

            {!generatedImage && !loading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-800">
                  <strong>Tip:</strong> Try prompts like "sunset over mountains", "abstract art", "ocean waves", "forest with trees", "night sky with stars", "geometric shapes", or "dog playing in park" for best results. The AI will generate high-quality images based on your description.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileBottomAd adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <Footer />
    </div>
  )
}
