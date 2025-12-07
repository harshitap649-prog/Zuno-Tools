'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'
import { Image, Sparkles, Download, Upload, X, Grid, Share2, Copy, History, Settings, Trash2, BarChart3, Check, GripVertical, ZoomIn, RotateCw, Maximize2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

// Dynamically import ad components to avoid SSR issues
const SidebarAd = dynamic(() => import('@/components/SidebarAd'), { ssr: false })
const MobileBottomAd = dynamic(() => import('@/components/MobileBottomAd'), { ssr: false })

interface CollageHistory {
  id: string
  dataUrl: string
  layout: string
  imageCount: number
  timestamp: number
  dimensions: { width: number; height: number }
}

export default function ImageCollageMaker() {
  const [images, setImages] = useState<string[]>([])
  const [layout, setLayout] = useState('grid')
  const [spacing, setSpacing] = useState(10)
  const [borderWidth, setBorderWidth] = useState(0)
  const [borderColor, setBorderColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [canvasWidth, setCanvasWidth] = useState(1200)
  const [canvasHeight, setCanvasHeight] = useState(1200)
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpg' | 'webp'>('png')
  const [quality, setQuality] = useState(0.95)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<CollageHistory[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [copied, setCopied] = useState(false)
  const [collageCreated, setCollageCreated] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { triggerPopunder } = usePopunderAd()

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('collage-maker-history')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Failed to load history:', e)
      }
    }
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImages(prev => [...prev, event.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
    toast.success(`${acceptedFiles.length} image(s) added!`)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: true
  })

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
    toast.success(`${files.length} image(s) added!`)
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setCollageCreated(false)
    toast.success('Image removed')
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [removed] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, removed)
    setImages(newImages)
    setCollageCreated(false)
  }

  const clearAll = () => {
    setImages([])
    setCollageCreated(false)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
    toast.success('All images cleared')
  }

  const createCollage = async () => {
    const canvas = canvasRef.current
    if (!canvas || images.length === 0) {
      toast.error('Please upload at least one image')
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      toast.error('Canvas context not available')
      return
    }

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    // Fill background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Load all images first
    const imagePromises = images.map((src) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
      })
    })

    try {
      const loadedImages = await Promise.all(imagePromises)
      let imagesDrawn = 0

      const drawComplete = () => {
        imagesDrawn++
        if (imagesDrawn === loadedImages.length) {
          setCollageCreated(true)
          toast.success('Collage created!')
          
          // Save to history
          const dataUrl = canvas.toDataURL(`image/${outputFormat}`, outputFormat === 'png' ? undefined : quality)
          const historyItem: CollageHistory = {
            id: Date.now().toString(),
            dataUrl,
            layout,
            imageCount: images.length,
            timestamp: Date.now(),
            dimensions: { width: canvas.width, height: canvas.height }
          }
          
          const updatedHistory = [historyItem, ...history].slice(0, 20)
          setHistory(updatedHistory)
          localStorage.setItem('collage-maker-history', JSON.stringify(updatedHistory))
          
          triggerPopunder()
        }
      }

      if (layout === 'grid') {
        const cols = Math.ceil(Math.sqrt(images.length))
        const rows = Math.ceil(images.length / cols)
        const cellWidth = (canvas.width - spacing * (cols + 1)) / cols
        const cellHeight = (canvas.height - spacing * (rows + 1)) / rows

        loadedImages.forEach((img, index) => {
          const col = index % cols
          const row = Math.floor(index / cols)
          const x = spacing + col * (cellWidth + spacing)
          const y = spacing + row * (cellHeight + spacing)

          // Draw border if enabled
          if (borderWidth > 0) {
            ctx.fillStyle = borderColor
            ctx.fillRect(x - borderWidth, y - borderWidth, cellWidth + borderWidth * 2, cellHeight + borderWidth * 2)
          }

          // Draw image
          ctx.drawImage(img, x, y, cellWidth, cellHeight)
          drawComplete()
        })
      } else if (layout === 'grid-2x2' && images.length >= 4) {
        const size = (canvas.width - spacing * 3) / 2
        const positions = [
          [spacing, spacing],
          [spacing * 2 + size, spacing],
          [spacing, spacing * 2 + size],
          [spacing * 2 + size, spacing * 2 + size],
        ]
        loadedImages.slice(0, 4).forEach((img, index) => {
          const [x, y] = positions[index]
          if (borderWidth > 0) {
            ctx.fillStyle = borderColor
            ctx.fillRect(x - borderWidth, y - borderWidth, size + borderWidth * 2, size + borderWidth * 2)
          }
          ctx.drawImage(img, x, y, size, size)
          drawComplete()
        })
      } else if (layout === 'grid-3x3' && images.length >= 9) {
        const size = (canvas.width - spacing * 4) / 3
        loadedImages.slice(0, 9).forEach((img, index) => {
          const col = index % 3
          const row = Math.floor(index / 3)
          const x = spacing + col * (size + spacing)
          const y = spacing + row * (size + spacing)
          if (borderWidth > 0) {
            ctx.fillStyle = borderColor
            ctx.fillRect(x - borderWidth, y - borderWidth, size + borderWidth * 2, size + borderWidth * 2)
          }
          ctx.drawImage(img, x, y, size, size)
          drawComplete()
        })
      } else if (layout === 'vertical' && images.length >= 2) {
        const height = (canvas.height - spacing * (images.length + 1)) / images.length
        const width = canvas.width - spacing * 2
        loadedImages.forEach((img, index) => {
          const y = spacing + index * (height + spacing)
          if (borderWidth > 0) {
            ctx.fillStyle = borderColor
            ctx.fillRect(spacing - borderWidth, y - borderWidth, width + borderWidth * 2, height + borderWidth * 2)
          }
          ctx.drawImage(img, spacing, y, width, height)
          drawComplete()
        })
      } else if (layout === 'horizontal' && images.length >= 2) {
        const width = (canvas.width - spacing * (images.length + 1)) / images.length
        const height = canvas.height - spacing * 2
        loadedImages.forEach((img, index) => {
          const x = spacing + index * (width + spacing)
          if (borderWidth > 0) {
            ctx.fillStyle = borderColor
            ctx.fillRect(x - borderWidth, spacing - borderWidth, width + borderWidth * 2, height + borderWidth * 2)
          }
          ctx.drawImage(img, x, spacing, width, height)
          drawComplete()
        })
      } else if (layout === 'masonry' && images.length >= 3) {
        // Simple masonry layout
        const cols = 2
        const colWidth = (canvas.width - spacing * 3) / cols
        const colHeights = [spacing, spacing]
        const colImages: { img: HTMLImageElement; index: number }[][] = [[], []]

        loadedImages.forEach((img, index) => {
          const col = index % cols
          colImages[col].push({ img, index })
        })

        colImages.forEach((colImgs, col) => {
          colImgs.forEach(({ img }) => {
            const imgAspect = img.width / img.height
            const imgHeight = colWidth / imgAspect
            const x = spacing + col * (colWidth + spacing)
            const y = colHeights[col]

            if (borderWidth > 0) {
              ctx.fillStyle = borderColor
              ctx.fillRect(x - borderWidth, y - borderWidth, colWidth + borderWidth * 2, imgHeight + borderWidth * 2)
            }
            ctx.drawImage(img, x, y, colWidth, imgHeight)
            colHeights[col] += imgHeight + spacing
            drawComplete()
          })
        })
      } else {
        toast.error(`Layout "${layout}" requires more images. Please add more images.`)
      }
    } catch (error) {
      console.error('Error creating collage:', error)
      toast.error('Failed to create collage. Please try again.')
    }
  }

  const downloadCollage = (dataUrl?: string, filename?: string) => {
    const canvas = canvasRef.current
    if (!canvas && !dataUrl) {
      toast.error('No collage to download. Please create a collage first.')
      return
    }

    if (!dataUrl && !canvas) {
      toast.error('No collage to download. Please create a collage first.')
      return
    }

    const imageData = dataUrl || (canvas ? canvas.toDataURL(`image/${outputFormat}`, outputFormat === 'png' ? undefined : quality) : '')
    const ext = outputFormat === 'png' ? 'png' : outputFormat === 'jpg' ? 'jpg' : 'webp'
    
    const link = document.createElement('a')
    link.download = filename || `image-collage-${Date.now()}.${ext}`
    link.href = imageData
    link.click()
    
    toast.success('Collage downloaded!')
  }

  const shareCollage = async () => {
    const canvas = canvasRef.current
    if (!canvas) {
      toast.error('No collage to share. Please create a collage first.')
      return
    }

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error('Failed to create image for sharing')
          return
        }

        const file = new File([blob], `collage.${outputFormat}`, { type: blob.type })
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Image Collage',
            text: 'Check out this collage I created!'
          })
          toast.success('Collage shared!')
        } else {
          copyCollageToClipboard()
        }
      }, `image/${outputFormat}`, outputFormat === 'png' ? undefined : quality)
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        copyCollageToClipboard()
      }
    }
  }

  const copyCollageToClipboard = async () => {
    const canvas = canvasRef.current
    if (!canvas) {
      toast.error('No collage to copy. Please create a collage first.')
      return
    }

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error('Failed to copy collage')
          return
        }
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ])
        setCopied(true)
        toast.success('Collage copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
      }, `image/${outputFormat}`, outputFormat === 'png' ? undefined : quality)
    } catch (error) {
      toast.error('Failed to copy collage')
    }
  }

  const loadHistoryItem = (item: CollageHistory) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const img = new window.Image()
    img.src = item.dataUrl
    img.onload = () => {
      canvas.width = item.dimensions.width
      canvas.height = item.dimensions.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        setCollageCreated(true)
        setLayout(item.layout)
        toast.success('History item loaded!')
      }
    }
    setShowHistory(false)
  }

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(item => item.id !== id)
    setHistory(updated)
    localStorage.setItem('collage-maker-history', JSON.stringify(updated))
    toast.success('History item deleted!')
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('collage-maker-history')
    toast.success('History cleared!')
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
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 mb-3 sm:mb-4">
              <Grid className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">Image Collage Maker</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Create beautiful photo collages</p>
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
            {images.length > 0 && (
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
                  <label className="block text-sm font-medium text-gray-900 mb-2">Layout</label>
                  <select
                    value={layout}
                    onChange={(e) => {
                      setLayout(e.target.value)
                      setCollageCreated(false)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  >
                    <option value="grid">Grid (Auto)</option>
                    <option value="grid-2x2">Grid (2x2)</option>
                    <option value="grid-3x3">Grid (3x3)</option>
                    <option value="vertical">Vertical Stack</option>
                    <option value="horizontal">Horizontal Stack</option>
                    <option value="masonry">Masonry</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Width (px)</label>
                    <input
                      type="number"
                      value={canvasWidth}
                      onChange={(e) => setCanvasWidth(parseInt(e.target.value) || 1200)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                      min="100"
                      max="4000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Height (px)</label>
                    <input
                      type="number"
                      value={canvasHeight}
                      onChange={(e) => setCanvasHeight(parseInt(e.target.value) || 1200)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                      min="100"
                      max="4000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Spacing: {spacing}px</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={spacing}
                    onChange={(e) => setSpacing(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Border Width: {borderWidth}px</label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={borderWidth}
                    onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                {borderWidth > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Border Color</label>
                    <input
                      type="color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="w-full h-12 rounded border-2 border-gray-300 cursor-pointer"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Background Color</label>
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full h-12 rounded border-2 border-gray-300 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Output Format</label>
                  <div className="flex flex-wrap gap-2">
                    {(['png', 'jpg', 'webp'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setOutputFormat(fmt)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs sm:text-sm touch-manipulation active:scale-95 ${
                          outputFormat === fmt
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                {outputFormat !== 'png' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Quality: {Math.round(quality * 100)}%</label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}
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
                        <img src={item.dataUrl} alt="Collage" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded bg-gray-100" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">{formatDate(item.timestamp)}</p>
                          <p className="text-xs sm:text-sm text-gray-900 font-medium">
                            {item.layout} • {item.imageCount} images
                          </p>
                          <p className="text-xs text-gray-600">
                            {item.dimensions.width} × {item.dimensions.height}px
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
                            onClick={() => downloadCollage(item.dataUrl, `collage-${item.id}.${outputFormat}`)}
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
            {/* Statistics */}
            {images.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">Statistics</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Images</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900">{images.length}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Canvas Size</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900">{canvasWidth} × {canvasHeight}px</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Layout</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 capitalize">{layout.replace('-', ' ')}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Upload Images</label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-colors touch-manipulation ${
                  isDragActive
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50 active:bg-purple-50'
                }`}
              >
                <input {...getInputProps()} />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base touch-manipulation active:scale-95"
                >
                  Browse Files
                </button>
                <p className="text-xs text-gray-500 mt-3">Supports: PNG, JPG, JPEG, WebP</p>
              </div>
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

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="absolute -top-2 -left-2 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10">
                        {index + 1}
                      </div>
                      <img src={img} alt={`Upload ${index + 1}`} className="w-full h-24 sm:h-32 object-cover rounded-lg border-2 border-gray-200" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center gap-2">
                        <button
                          onClick={() => index > 0 && moveImage(index, index - 1)}
                          disabled={index === 0}
                          className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 rounded-full p-1.5 hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation active:scale-95"
                          title="Move left"
                        >
                          <RotateCw className="h-3 w-3 sm:h-4 sm:w-4 rotate-180" />
                        </button>
                        <button
                          onClick={() => removeImage(index)}
                          className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-all touch-manipulation active:scale-95"
                          title="Remove"
                        >
                          <X className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() => index < images.length - 1 && moveImage(index, index + 1)}
                          disabled={index === images.length - 1}
                          className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 rounded-full p-1.5 hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation active:scale-95"
                          title="Move right"
                        >
                          <RotateCw className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={createCollage}
                    disabled={images.length === 0}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation active:scale-95"
                  >
                    <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Create Collage</span>
                  </button>
                  {collageCreated && (
                    <>
                      <button
                        onClick={() => downloadCollage()}
                        className="px-4 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base flex items-center justify-center gap-2 touch-manipulation active:scale-95"
                      >
                        <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                      <button
                        onClick={shareCollage}
                        className="px-4 sm:px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base flex items-center justify-center gap-2 touch-manipulation active:scale-95"
                      >
                        <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">Share</span>
                      </button>
                      <button
                        onClick={copyCollageToClipboard}
                        className="px-4 sm:px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base flex items-center justify-center gap-2 touch-manipulation active:scale-95"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                        <span className="hidden sm:inline">Copy</span>
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Canvas Preview */}
            {collageCreated && (
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">Collage Preview</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={createCollage}
                      className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation active:scale-95"
                    >
                      <RotateCw className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                      Regenerate
                    </button>
                  </div>
                </div>
                <div className="flex justify-center bg-white rounded-lg p-2 sm:p-4 overflow-auto">
                  <canvas
                    ref={canvasRef}
                    className="border-2 border-gray-300 rounded-lg max-w-full"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              </div>
            )}
            
            {!collageCreated && images.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-8 sm:p-12 text-center">
                <Grid className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-600">Click "Create Collage" to generate your collage</p>
              </div>
            )}
            
            {images.length === 0 && (
              <div className="bg-gray-50 rounded-lg p-8 sm:p-12 text-center">
                <Upload className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-600">Upload images to get started</p>
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

