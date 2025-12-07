'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import Footer from '@/components/Footer'
import SidebarAd from '@/components/SidebarAd'
import MobileBottomAd from '@/components/MobileBottomAd'
import { Upload, Download, X, Maximize2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

export default function ImageResizer() {
  const [image, setImage] = useState<string | null>(null)
  const [resizedImage, setResizedImage] = useState<string | null>(null)
  const [width, setWidth] = useState<number>(800)
  const [height, setHeight] = useState<number>(600)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 })
  const [loading, setLoading] = useState(false)
  const isInitialMount = useRef(true)
  const prevDimensions = useRef({ width: 0, height: 0 })
  const { triggerPopunder } = usePopunderAd()

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

  const resizeImage = useCallback(async () => {
    if (!image) return

    // Validate dimensions
    if (width <= 0 || height <= 0 || !Number.isFinite(width) || !Number.isFinite(height)) {
      return // Don't show error for auto-resize, just return silently
    }

    if (width > 10000 || height > 10000) {
      return // Don't show error for auto-resize
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
            resolve()
          } catch (error) {
            reject(error)
          }
        }
        img.onerror = () => reject(new Error('Failed to load image'))
      })
    } catch (error) {
      console.error('Resize error:', error)
    } finally {
      setLoading(false)
    }
  }, [image, width, height])

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
    
    // Trigger popunder ad after 2 seconds
    triggerPopunder()
  }

  const reset = () => {
    setImage(null)
    setResizedImage(null)
    setWidth(800)
    setHeight(600)
  }

  // Auto-resize when dimensions change
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false
      prevDimensions.current = { width, height }
      return
    }

    // Only auto-resize if image is loaded and dimensions actually changed
    if (image && width > 0 && height > 0 && originalDimensions.width > 0) {
      const dimensionsChanged = 
        prevDimensions.current.width !== width || 
        prevDimensions.current.height !== height

      if (dimensionsChanged) {
        prevDimensions.current = { width, height }
        // Reduced debounce for more responsive updates
        const timeoutId = setTimeout(() => {
          resizeImage()
        }, 300) // Debounce for 300ms

        return () => clearTimeout(timeoutId)
      }
    }
  }, [width, height, image, originalDimensions.width, resizeImage])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/20">
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <SidebarAd position="right" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      
      <main className="flex-grow py-4 sm:py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
              <Maximize2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">Image Resizer</h1>
            <p className="text-gray-900">Resize images to any dimension while maintaining quality</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-3 sm:p-4 md:p-6">
            {!image ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 sm:p-8 md:p-10 text-center cursor-pointer transition-all touch-manipulation ${
                  isDragActive
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50/30 active:bg-blue-50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="inline-flex p-3 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 mb-3">
                  <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
                <p className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                  {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                </p>
                <p className="text-xs text-gray-600">or click to select a file</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex justify-between items-center pb-2 sm:pb-3 border-b-2 border-gray-100">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Resize Your Image</h2>
                  <button
                    onClick={reset}
                    className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs sm:text-sm"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                        <Upload className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900">
                        Original Image
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {originalDimensions.width} × {originalDimensions.height}
                      </span>
                    </div>
                    <div className="relative border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg bg-white group hover:shadow-xl transition-shadow">
                      <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        Original
                      </div>
                      <img src={image} alt="Original" className="w-full h-auto max-h-[280px] sm:max-h-[350px] md:max-h-[450px] object-contain p-2" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                          <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-gray-900">
                          Resized Image
                        </h3>
                        {resizedImage && (
                          <span className="text-xs text-gray-500 bg-cyan-100 px-2 py-0.5 rounded-full">
                            {width} × {height}
                          </span>
                        )}
                      </div>
                      {resizedImage && (
                        <button
                          onClick={() => setResizedImage(null)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="relative border-2 border-gray-200 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/40 to-cyan-50/30 shadow-lg group hover:shadow-xl transition-shadow">
                      {loading ? (
                        <div className="flex items-center justify-center h-40 sm:h-48 md:h-64">
                          <div className="text-center">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-xl opacity-20"></div>
                              <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 animate-spin mx-auto mb-3 relative z-10" />
                            </div>
                            <p className="text-sm font-medium text-gray-700">Processing image...</p>
                            <p className="text-xs text-gray-500 mt-1">Please wait</p>
                          </div>
                        </div>
                      ) : resizedImage ? (
                        <>
                          <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity">
                            Resized
                          </div>
                          <img src={resizedImage} alt="Resized" className="w-full h-auto max-h-[280px] sm:max-h-[350px] md:max-h-[450px] object-contain p-2" />
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-40 sm:h-48 md:h-64 text-gray-400 px-4">
                          <div className="p-3 rounded-full bg-gray-100 mb-3">
                            <Maximize2 className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Ready to resize</p>
                          <p className="text-xs text-gray-500 text-center">Adjust dimensions below</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white via-blue-50/20 to-cyan-50/20 rounded-2xl p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 border-2 border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="maintainRatio"
                        checked={maintainAspectRatio}
                        onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="maintainRatio" className="text-sm sm:text-base font-bold text-gray-900 cursor-pointer">
                        Maintain aspect ratio
                      </label>
                    </div>
                    {maintainAspectRatio && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                        Locked
                      </span>
                    )}
                  </div>

                  {/* Preset Sizes */}
                  <div className="mb-3 sm:mb-4">
                    <label className="block text-sm sm:text-base font-bold text-gray-900 mb-3 flex items-center space-x-2">
                      <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></span>
                      <span>Quick Presets</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {[
                        { label: 'Instagram Post', w: 1080, h: 1080, icon: '📷' },
                        { label: 'Instagram Story', w: 1080, h: 1920, icon: '📱' },
                        { label: 'Facebook Cover', w: 1200, h: 630, icon: '👥' },
                        { label: 'Twitter Header', w: 1500, h: 500, icon: '🐦' },
                        { label: 'YouTube Thumbnail', w: 1280, h: 720, icon: '▶️' },
                        { label: 'Square', w: 1000, h: 1000, icon: '⬜' },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={async () => {
                            let newWidth = preset.w
                            let newHeight = preset.h
                            
                            if (maintainAspectRatio && originalDimensions.width > 0) {
                              const ratio = originalDimensions.width / originalDimensions.height
                              if (preset.w / preset.h > ratio) {
                                newHeight = preset.h
                                newWidth = Math.round(preset.h * ratio)
                              } else {
                                newWidth = preset.w
                                newHeight = Math.round(preset.w / ratio)
                              }
                            }
                            
                            // Update dimensions
                            setWidth(newWidth)
                            setHeight(newHeight)
                            
                            // Update prevDimensions to ensure resize triggers
                            prevDimensions.current = { width: newWidth, height: newHeight }
                            
                            // Trigger resize immediately
                            setTimeout(() => {
                              resizeImage()
                            }, 100)
                          }}
                          className="px-3 py-3 text-xs font-semibold text-gray-900 bg-white border-2 border-gray-200 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 hover:border-blue-400 hover:shadow-lg transition-all active:scale-95 flex flex-col items-center space-y-1 group"
                        >
                          <span className="text-lg">{preset.icon}</span>
                          <span className="text-[10px] leading-tight text-center">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-900 flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <span>Width (px)</span>
                      </label>
                      <div className="relative">
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
                          className="w-full px-4 py-3 text-sm font-semibold text-gray-900 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all shadow-sm hover:shadow-md"
                          min="1"
                          max="10000"
                          placeholder="Width"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-900 flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                        <span>Height (px)</span>
                      </label>
                      <div className="relative">
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
                          className="w-full px-4 py-3 text-sm font-semibold text-gray-900 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white transition-all shadow-sm hover:shadow-md"
                          min="1"
                          max="10000"
                          placeholder="Height"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t-2 border-gray-200">
                    <button
                      onClick={() => {
                        resizeImage().then(() => {
                          toast.success('Image resized successfully!')
                        })
                      }}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 text-white px-6 py-3.5 rounded-xl font-bold hover:shadow-2xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm active:scale-95 touch-manipulation transform hover:scale-[1.02]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="h-5 w-5" />
                          <span>Resize Image</span>
                        </>
                      )}
                    </button>

                    {resizedImage && (
                      <button
                        onClick={downloadImage}
                        className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white px-6 py-3.5 rounded-xl font-bold hover:shadow-2xl hover:shadow-green-500/40 transition-all text-sm active:scale-95 touch-manipulation transform hover:scale-[1.02]"
                      >
                        <Download className="h-5 w-5" />
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

      <MobileBottomAd adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <Footer />
    </div>
  )
}

