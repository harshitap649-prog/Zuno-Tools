'use client'

import { useState, useRef, useEffect } from 'react'
import Footer from '@/components/Footer'
import { Image, Sparkles, Download, Upload, Type, Palette } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

export default function InstagramStoryMaker() {
  const [storyText, setStoryText] = useState('Your Story')
  const [textColor, setTextColor] = useState('#FFFFFF')
  const [bgColor, setBgColor] = useState('#E1306C')
  const [bgImage, setBgImage] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { triggerPopunder } = usePopunderAd()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setBgImage(event.target?.result as string)
        setTimeout(drawStory, 100)
      }
      reader.readAsDataURL(file)
    }
  }

  const drawStory = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1080
    canvas.height = 1920

    // Draw background
    if (bgImage) {
      const img = new window.Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 1080, 1920)
        drawText(ctx)
      }
      img.src = bgImage
    } else {
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, 1080, 1920)
      drawText(ctx)
    }
  }

  const drawText = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = textColor
    ctx.font = 'bold 72px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Add text shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
    
    ctx.fillText(storyText, 540, 960)
  }

  useEffect(() => {
    drawStory()
  }, [storyText, textColor, bgColor, bgImage])

  const downloadStory = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'instagram-story.png'
    link.href = canvas.toDataURL()
    link.click()
    
    // Trigger popunder ad after 2 seconds
    triggerPopunder()
    
    toast.success('Story downloaded!')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-6">
            <div className="flex flex-col items-center justify-center mb-4 sm:mb-6">
              <div className="relative inline-flex items-center justify-center mb-3 sm:mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-pink-500 to-rose-500 p-2 sm:p-3 rounded-xl shadow-lg">
                  <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                  Zuno Tools
                </span>
              </h1>
              <div className="mt-2 h-0.5 w-20 sm:w-24 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mx-auto"></div>
            </div>
          </div>
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 mb-3 sm:mb-4">
              <Image className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Instagram Story Maker</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Create Instagram stories with text and images</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Story Text</label>
                  <input
                    type="text"
                    value={storyText}
                    onChange={(e) => {
                      setStoryText(e.target.value)
                      setTimeout(drawStory, 100)
                    }}
                    maxLength={50}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Text Color</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => {
                      setTextColor(e.target.value)
                      setTimeout(drawStory, 100)
                    }}
                    className="w-full h-12 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Background Color</label>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => {
                      setBgColor(e.target.value)
                      setBgImage(null)
                      setTimeout(drawStory, 100)
                    }}
                    className="w-full h-12 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Background Image</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors flex items-center justify-center space-x-2 text-gray-600"
                  >
                    <Upload className="h-5 w-5" />
                    <span>Upload Image</span>
                  </button>
                  {bgImage && (
                    <button
                      onClick={() => {
                        setBgImage(null)
                        setTimeout(drawStory, 100)
                      }}
                      className="mt-2 w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
                <button
                  onClick={downloadStory}
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Download className="h-5 w-5" />
                  <span>Download Story</span>
                </button>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="w-full max-w-[200px] mx-auto aspect-[9/16] bg-white rounded-lg overflow-hidden shadow-lg">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-full"
                      style={{ display: 'block' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">Instagram Story Preview (9:16)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

