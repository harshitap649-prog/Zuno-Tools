'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Upload, Download, X, Maximize2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ImageResizer() {
  const [image, setImage] = useState<string | null>(null)
  const [resizedImage, setResizedImage] = useState<string | null>(null)
  const [width, setWidth] = useState<number>(800)
  const [height, setHeight] = useState<number>(600)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 })
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.src = reader.result as string
        img.onload = () => {
          setOriginalDimensions({ width: img.width, height: img.height })
          setWidth(img.width)
          setHeight(img.height)
          setImage(reader.result as string)
          setResizedImage(null)
        }
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: false
  })

  const resizeImage = async () => {
    if (!image) return

    // Validate dimensions
    if (width <= 0 || height <= 0 || !Number.isFinite(width) || !Number.isFinite(height)) {
      toast.error('Please enter valid dimensions (greater than 0)')
      return
    }

    if (width > 10000 || height > 10000) {
      toast.error('Dimensions cannot exceed 10000px')
      return
    }

    setLoading(true)
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = image
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d', { willReadFrequently: false })
            if (!ctx) {
              reject(new Error('Could not get canvas context'))
              return
            }
            
            // Set canvas dimensions
            canvas.width = Math.round(width)
            canvas.height = Math.round(height)
            
            // Use high-quality image rendering
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'
            
            // Draw and resize the image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            
            // Convert to data URL with good quality
            const dataUrl = canvas.toDataURL('image/png', 0.95)
            setResizedImage(dataUrl)
            toast.success('Image resized successfully!')
            resolve()
          } catch (error) {
            reject(error)
          }
        }
        img.onerror = () => reject(new Error('Failed to load image'))
      })
    } catch (error) {
      console.error('Resize error:', error)
      toast.error('Failed to resize image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleWidthChange = (newWidth: number) => {
    const validWidth = Math.max(1, Math.min(10000, Math.round(newWidth)))
    setWidth(validWidth)
    if (maintainAspectRatio && originalDimensions.width > 0) {
      const ratio = originalDimensions.height / originalDimensions.width
      const calculatedHeight = Math.round(validWidth * ratio)
      setHeight(Math.max(1, Math.min(10000, calculatedHeight)))
    }
  }

  const handleHeightChange = (newHeight: number) => {
    const validHeight = Math.max(1, Math.min(10000, Math.round(newHeight)))
    setHeight(validHeight)
    if (maintainAspectRatio && originalDimensions.width > 0) {
      const ratio = originalDimensions.width / originalDimensions.height
      const calculatedWidth = Math.round(validHeight * ratio)
      setWidth(Math.max(1, Math.min(10000, calculatedWidth)))
    }
  }

  const downloadImage = () => {
    if (!resizedImage) return
    
    const link = document.createElement('a')
    link.download = `resized-${width}x${height}.png`
    link.href = resizedImage
    link.click()
  }

  const reset = () => {
    setImage(null)
    setResizedImage(null)
    setWidth(800)
    setHeight(600)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 mb-3 sm:mb-4">
              <Maximize2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Image Resizer</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Resize images to any dimension while maintaining quality</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
            {!image ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 sm:p-8 md:p-12 text-center cursor-pointer transition-colors touch-manipulation ${
                  isDragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50 active:bg-primary-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                </p>
                <p className="text-xs sm:text-sm text-gray-900">or click to select a file</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Resize Your Image</h2>
                  <button
                    onClick={reset}
                    className="flex items-center space-x-2 text-gray-900 hover:text-gray-900"
                  >
                    <X className="h-5 w-5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">
                      Original ({originalDimensions.width} × {originalDimensions.height})
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                      <img src={image} alt="Original" className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-900">
                        Resized {resizedImage ? `(${width} × ${height})` : ''}
                      </h3>
                      {resizedImage && (
                        <button
                          onClick={() => setResizedImage(null)}
                          className="text-xs text-gray-900 hover:text-gray-900"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="border rounded-lg overflow-hidden bg-gray-100">
                      {loading ? (
                        <div className="flex items-center justify-center h-48 sm:h-64">
                          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 animate-spin" />
                        </div>
                      ) : resizedImage ? (
                        <img src={resizedImage} alt="Resized" className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain" />
                      ) : (
                        <div className="flex items-center justify-center h-48 sm:h-64 text-gray-400 text-sm sm:text-base px-4 text-center">
                          <p>Adjust dimensions and click "Resize Image"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      id="maintainRatio"
                      checked={maintainAspectRatio}
                      onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="maintainRatio" className="text-sm font-medium text-gray-900">
                      Maintain aspect ratio
                    </label>
                  </div>

                  {/* Preset Sizes */}
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">
                      Quick Presets
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Instagram Post', w: 1080, h: 1080 },
                        { label: 'Instagram Story', w: 1080, h: 1920 },
                        { label: 'Facebook Cover', w: 1200, h: 630 },
                        { label: 'Twitter Header', w: 1500, h: 500 },
                        { label: 'YouTube Thumbnail', w: 1280, h: 720 },
                        { label: 'Square', w: 1000, h: 1000 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => {
                            if (maintainAspectRatio && originalDimensions.width > 0) {
                              const ratio = originalDimensions.width / originalDimensions.height
                              if (preset.w / preset.h > ratio) {
                                setHeight(preset.h)
                                setWidth(Math.round(preset.h * ratio))
                              } else {
                                setWidth(preset.w)
                                setHeight(Math.round(preset.w / ratio))
                              }
                            } else {
                              setWidth(preset.w)
                              setHeight(preset.h)
                            }
                          }}
                          className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-primary-400 transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        value={width || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : Number(e.target.value)
                          handleWidthChange(value)
                        }}
                        onBlur={(e) => {
                          if (!e.target.value || Number(e.target.value) <= 0) {
                            setWidth(originalDimensions.width || 800)
                            if (maintainAspectRatio && originalDimensions.width > 0) {
                              const ratio = originalDimensions.height / originalDimensions.width
                              setHeight(Math.round((originalDimensions.width || 800) * ratio))
                            }
                          }
                        }}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        min="1"
                        max="10000"
                        placeholder="Width"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        value={height || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : Number(e.target.value)
                          handleHeightChange(value)
                        }}
                        onBlur={(e) => {
                          if (!e.target.value || Number(e.target.value) <= 0) {
                            setHeight(originalDimensions.height || 600)
                            if (maintainAspectRatio && originalDimensions.height > 0) {
                              const ratio = originalDimensions.width / originalDimensions.height
                              setWidth(Math.round((originalDimensions.height || 600) * ratio))
                            }
                          }
                        }}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        min="1"
                        max="10000"
                        placeholder="Height"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      onClick={resizeImage}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95 touch-manipulation"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>Resize Image</span>
                        </>
                      )}
                    </button>

                    {resizedImage && (
                      <button
                        onClick={downloadImage}
                        className="flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-sm sm:text-base active:scale-95 touch-manipulation"
                      >
                        <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

