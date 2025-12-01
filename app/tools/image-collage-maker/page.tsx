'use client'

import { useState, useRef } from 'react'
import Footer from '@/components/Footer'
import { Image, Sparkles, Download, Upload, X, Grid } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

export default function ImageCollageMaker() {
  const [images, setImages] = useState<string[]>([])
  const [layout, setLayout] = useState('grid')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { triggerPopunder } = usePopunderAd()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImages(prev => [...prev, event.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const createCollage = () => {
    const canvas = canvasRef.current
    if (!canvas || images.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1200
    canvas.height = 1200

    if (layout === 'grid' && images.length >= 4) {
      const size = 600
      const positions = [
        [0, 0],
        [600, 0],
        [0, 600],
        [600, 600],
      ]
      images.slice(0, 4).forEach((img, index) => {
        const image = new window.Image()
        image.onload = () => {
          ctx.drawImage(image, positions[index][0], positions[index][1], size, size)
          if (index === images.slice(0, 4).length - 1) {
            toast.success('Collage created!')
          }
        }
        image.src = img
      })
    } else if (layout === 'vertical' && images.length >= 2) {
      const width = 1200
      const height = 1200 / images.length
      images.forEach((img, index) => {
        const image = new window.Image()
        image.onload = () => {
          ctx.drawImage(image, 0, index * height, width, height)
          if (index === images.length - 1) {
            toast.success('Collage created!')
          }
        }
        image.src = img
      })
    } else if (layout === 'horizontal' && images.length >= 2) {
      const width = 1200 / images.length
      const height = 1200
      images.forEach((img, index) => {
        const image = new window.Image()
        image.onload = () => {
          ctx.drawImage(image, index * width, 0, width, height)
          if (index === images.length - 1) {
            toast.success('Collage created!')
          }
        }
        image.src = img
      })
    }
  }

  const downloadCollage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'image-collage.png'
    link.href = canvas.toDataURL()
    link.click()
    
    // Trigger popunder ad after 2 seconds
    triggerPopunder()
    
    toast.success('Collage downloaded!')
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
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 mb-3 sm:mb-4">
              <Grid className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Image Collage Maker</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Create beautiful photo collages</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Upload Images</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors flex items-center justify-center space-x-2 text-gray-600"
              >
                <Upload className="h-5 w-5" />
                <span>Upload Images</span>
              </button>
            </div>

            {images.length > 0 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Layout</label>
                  <select
                    value={layout}
                    onChange={(e) => setLayout(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                  >
                    <option value="grid">Grid (2x2)</option>
                    <option value="vertical">Vertical Stack</option>
                    <option value="horizontal">Horizontal Stack</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative">
                      <img src={img} alt={`Upload ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={createCollage}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <Grid className="h-5 w-5" />
                    <span>Create Collage</span>
                  </button>
                  <button
                    onClick={downloadCollage}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download</span>
                  </button>
                </div>
              </>
            )}

            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                className="border-2 border-gray-300 rounded-lg max-w-full"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

