'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'
import { Upload, Download, X, Loader2, Minimize2, Share2, Copy, History, Settings, Trash2, Maximize2, Image as ImageIcon, FileText, BarChart3, RotateCw, ZoomIn, ZoomOut, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

// Dynamically import ad components to avoid SSR issues
const SidebarAd = dynamic(() => import('@/components/SidebarAd'), { ssr: false })
const MobileBottomAd = dynamic(() => import('@/components/MobileBottomAd'), { ssr: false })

interface CompressedImage {
  id: string
  original: string
  compressed: string
  originalSize: number
  compressedSize: number
  quality: number
  format: string
  dimensions: { width: number; height: number }
  timestamp: number
}

export default function ImageCompressor() {
  const [image, setImage] = useState<string | null>(null)
  const [compressedImage, setCompressedImage] = useState<string | null>(null)
  const [quality, setQuality] = useState(0.8)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [loading, setLoading] = useState(false)
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg')
  const [maxWidth, setMaxWidth] = useState<number | null>(null)
  const [maxHeight, setMaxHeight] = useState<number | null>(null)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null)
  const [compressedDimensions, setCompressedDimensions] = useState<{ width: number; height: number } | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<CompressedImage[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'split'>('side-by-side')
  const [zoom, setZoom] = useState(1)
  const [copied, setCopied] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const { triggerPopunder } = usePopunderAd()

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('image-compressor-history')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Failed to load history:', e)
      }
    }
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setOriginalSize(file.size)
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.src = reader.result as string
        img.onload = () => {
          setOriginalDimensions({ width: img.width, height: img.height })
          setImage(reader.result as string)
          setCompressedImage(null)
          setCompressedSize(0)
          setZoom(1)
          // Auto-set max dimensions if image is large
          if (img.width > 1920 || img.height > 1920) {
            setMaxWidth(1920)
            setMaxHeight(1920)
          } else {
            setMaxWidth(null)
            setMaxHeight(null)
          }
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

  const compressImage = () => {
    if (!image) {
      toast.error('Please upload an image first')
      return
    }

    setLoading(true)
    
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      // Processing function that can be called from onload or directly
      const processImage = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            toast.error('Canvas context not available. Please try again.')
            setLoading(false)
            return
          }
          
          // Calculate dimensions
          let width = img.width
          let height = img.height
          
          if (maxWidth || maxHeight) {
            const aspectRatio = width / height
            
            if (maxWidth && maxHeight) {
              if (maintainAspectRatio) {
                if (width > maxWidth || height > maxHeight) {
                  if (width / maxWidth > height / maxHeight) {
                    width = maxWidth
                    height = width / aspectRatio
                  } else {
                    height = maxHeight
                    width = height * aspectRatio
                  }
                }
              } else {
                width = maxWidth
                height = maxHeight
              }
            } else if (maxWidth && width > maxWidth) {
              width = maxWidth
              if (maintainAspectRatio) {
                height = width / aspectRatio
              }
            } else if (maxHeight && height > maxHeight) {
              height = maxHeight
              if (maintainAspectRatio) {
                width = height * aspectRatio
              }
            }
          }
          
          // Ensure dimensions are valid
          if (width <= 0 || height <= 0 || !isFinite(width) || !isFinite(height)) {
            toast.error('Invalid image dimensions. Please try another image.')
            setLoading(false)
            return
          }
          
          canvas.width = width
          canvas.height = height
          
          // Clear canvas and draw image
          ctx.clearRect(0, 0, width, height)
          ctx.drawImage(img, 0, 0, width, height)
          
          // Determine MIME type
          let mimeType = 'image/jpeg'
          if (format === 'png') {
            mimeType = 'image/png'
          } else if (format === 'webp') {
            mimeType = 'image/webp'
          }
          
          // Convert to data URL with error handling
          let compressedDataUrl: string
          try {
            if (format === 'png') {
              compressedDataUrl = canvas.toDataURL(mimeType)
            } else if (format === 'webp') {
              // WebP might not be supported in all browsers
              try {
                compressedDataUrl = canvas.toDataURL(mimeType, quality)
              } catch (webpError) {
                console.warn('WebP not supported, falling back to JPEG:', webpError)
                compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
                setFormat('jpeg')
                toast('WebP not supported, using JPEG instead', { icon: 'ℹ️' })
              }
            } else {
              compressedDataUrl = canvas.toDataURL(mimeType, quality)
            }
          } catch (dataUrlError) {
            console.error('toDataURL error:', dataUrlError)
            toast.error('Failed to compress image. Please try a different format.')
            setLoading(false)
            return
          }
          
          if (!compressedDataUrl || compressedDataUrl.length < 100) {
            toast.error('Compression failed. Please try again.')
            setLoading(false)
            return
          }
          
          const base64Length = compressedDataUrl.length - compressedDataUrl.indexOf(',') - 1
          const compressedSizeBytes = Math.ceil(base64Length * 0.75)
          
          setCompressedImage(compressedDataUrl)
          setCompressedSize(compressedSizeBytes)
          setCompressedDimensions({ width: Math.round(width), height: Math.round(height) })
          
          // Save to history
          const historyItem: CompressedImage = {
            id: Date.now().toString(),
            original: image,
            compressed: compressedDataUrl,
            originalSize,
            compressedSize: compressedSizeBytes,
            quality,
            format: format === 'webp' && compressedDataUrl.includes('data:image/jpeg') ? 'jpeg' : format,
            dimensions: { width: Math.round(width), height: Math.round(height) },
            timestamp: Date.now()
          }
          
          const updatedHistory = [historyItem, ...history].slice(0, 20)
          setHistory(updatedHistory)
          localStorage.setItem('image-compressor-history', JSON.stringify(updatedHistory))
          
          const reduction = ((1 - compressedSizeBytes / originalSize) * 100).toFixed(1)
          toast.success(`Image compressed! Size reduced by ${reduction}%`)
          
          // Trigger popunder after compression
          setTimeout(() => {
            triggerPopunder()
          }, 2000)
          
          setLoading(false)
        } catch (error) {
          console.error('Compression processing error:', error)
          toast.error('Failed to compress image. Please try again.')
          setLoading(false)
        }
      }
      
      // Handle image load error
      img.onerror = (error) => {
        console.error('Image load error:', error)
        toast.error('Failed to load image. Please try again.')
        setLoading(false)
      }
      
      // Handle successful image load
      img.onload = processImage
      
      // Set image source after setting up handlers
      img.src = image
      
      // If image is already loaded (cached), process immediately
      if (img.complete && img.naturalWidth > 0) {
        processImage()
      }
    } catch (error) {
      console.error('Compression error:', error)
      toast.error('Failed to compress image. Please try again.')
      setLoading(false)
    }
  }

  const downloadImage = (compressedImg?: string, filename?: string) => {
    const imgToDownload = compressedImg || compressedImage
    if (!imgToDownload) return
    
    const link = document.createElement('a')
    const ext = format === 'png' ? 'png' : format === 'webp' ? 'webp' : 'jpg'
    link.download = filename || `compressed-image.${ext}`
    link.href = imgToDownload
    link.click()
    
    toast.success('Image downloaded!')
  }

  const shareImage = async () => {
    if (!compressedImage) return
    
    try {
      // Convert data URL to blob
      const response = await fetch(compressedImage)
      const blob = await response.blob()
      const file = new File([blob], `compressed-image.${format}`, { type: blob.type })
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Compressed Image',
          text: 'Check out this compressed image!'
        })
        toast.success('Image shared!')
      } else {
        // Fallback: copy to clipboard
        copyImageToClipboard()
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        copyImageToClipboard()
      }
    }
  }

  const copyImageToClipboard = async () => {
    if (!compressedImage) return
    
    try {
      const response = await fetch(compressedImage)
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

  const loadHistoryItem = (item: CompressedImage) => {
    setImage(item.original)
    setCompressedImage(item.compressed)
    setOriginalSize(item.originalSize)
    setCompressedSize(item.compressedSize)
    setQuality(item.quality)
    setFormat(item.format as 'jpeg' | 'png' | 'webp')
    setCompressedDimensions(item.dimensions)
    setShowHistory(false)
    toast.success('History item loaded!')
  }

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(item => item.id !== id)
    setHistory(updated)
    localStorage.setItem('image-compressor-history', JSON.stringify(updated))
    toast.success('History item deleted!')
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('image-compressor-history')
    toast.success('History cleared!')
  }

  const reset = () => {
    setImage(null)
    setCompressedImage(null)
    setOriginalSize(0)
    setCompressedSize(0)
    setQuality(0.8)
    setFormat('jpeg')
    setMaxWidth(null)
    setMaxHeight(null)
    setOriginalDimensions(null)
    setCompressedDimensions(null)
    setZoom(1)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const applyPreset = (preset: 'low' | 'medium' | 'high' | 'ultra') => {
    switch (preset) {
      case 'low':
        setQuality(0.3)
        break
      case 'medium':
        setQuality(0.6)
        break
      case 'high':
        setQuality(0.85)
        break
      case 'ultra':
        setQuality(0.95)
        break
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
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
              <Minimize2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">Image Compressor</h1>
            <p className="text-sm sm:text-base text-gray-900">Reduce image file size while maintaining quality</p>
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
            {image && (
              <button
                onClick={reset}
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
                  <label className="block text-sm font-medium text-gray-900 mb-2">Output Format</label>
                  <div className="flex flex-wrap gap-2">
                    {(['jpeg', 'png', 'webp'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setFormat(fmt)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs sm:text-sm touch-manipulation active:scale-95 ${
                          format === fmt
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Max Dimensions (optional)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        placeholder="Width"
                        value={maxWidth || ''}
                        onChange={(e) => setMaxWidth(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Height"
                        value={maxHeight || ''}
                        onChange={(e) => setMaxHeight(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 mt-2 text-sm text-gray-900">
                    <input
                      type="checkbox"
                      checked={maintainAspectRatio}
                      onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                      className="rounded"
                    />
                    <span>Maintain aspect ratio</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Quality Presets</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => applyPreset('low')}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation active:scale-95"
                    >
                      Low (30%)
                    </button>
                    <button
                      onClick={() => applyPreset('medium')}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation active:scale-95"
                    >
                      Medium (60%)
                    </button>
                    <button
                      onClick={() => applyPreset('high')}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation active:scale-95"
                    >
                      High (85%)
                    </button>
                    <button
                      onClick={() => applyPreset('ultra')}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation active:scale-95"
                    >
                      Ultra (95%)
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Comparison Mode</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setComparisonMode('side-by-side')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs sm:text-sm touch-manipulation active:scale-95 ${
                        comparisonMode === 'side-by-side'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      Side by Side
                    </button>
                    <button
                      onClick={() => setComparisonMode('split')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs sm:text-sm touch-manipulation active:scale-95 ${
                        comparisonMode === 'split'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      Split View
                    </button>
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
                        <img src={item.compressed} alt="Compressed" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">{formatDate(item.timestamp)}</p>
                          <p className="text-xs sm:text-sm text-gray-900 font-medium">
                            {formatSize(item.originalSize)} → {formatSize(item.compressedSize)} ({item.format.toUpperCase()})
                          </p>
                          <p className="text-xs text-gray-600">
                            {item.dimensions.width} × {item.dimensions.height}px • {item.quality * 100}% quality
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-2">
                          <button
                            onClick={() => loadHistoryItem(item)}
                            className="p-1.5 sm:p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors touch-manipulation active:scale-95"
                            title="Load"
                          >
                            <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                          <button
                            onClick={() => downloadImage(item.compressed, `compressed-${item.id}.${item.format}`)}
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

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
            {!image ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 sm:p-8 md:p-12 text-center cursor-pointer transition-colors touch-manipulation ${
                  isDragActive
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50 active:bg-purple-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                </p>
                <p className="text-xs sm:text-sm text-gray-900">or click to select a file</p>
                <p className="text-xs text-gray-500 mt-2">Supports: JPG, PNG, WebP</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Statistics */}
                {originalDimensions && (
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900">Image Information</h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Original Size</p>
                        <p className="text-sm sm:text-base font-bold text-gray-900">{formatSize(originalSize)}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Dimensions</p>
                        <p className="text-sm sm:text-base font-bold text-gray-900">
                          {originalDimensions.width} × {originalDimensions.height}px
                        </p>
                      </div>
                      {compressedSize > 0 && (
                        <>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600">Compressed Size</p>
                            <p className="text-sm sm:text-base font-bold text-green-600">{formatSize(compressedSize)}</p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600">Reduction</p>
                            <p className="text-sm sm:text-base font-bold text-blue-600">
                              {((1 - compressedSize / originalSize) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Image Comparison */}
                <div className={comparisonMode === 'side-by-side' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6' : 'space-y-4'}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm sm:text-base font-medium text-gray-900">
                        Original ({formatSize(originalSize)})
                      </h3>
                      {originalDimensions && (
                        <span className="text-xs text-gray-500">
                          {originalDimensions.width} × {originalDimensions.height}px
                        </span>
                      )}
                    </div>
                    <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white relative">
                      <img 
                        src={image} 
                        alt="Original" 
                        className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain"
                        style={{ transform: `scale(${zoom})` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm sm:text-base font-medium text-gray-900">
                        Compressed {compressedSize > 0 && `(${formatSize(compressedSize)})`}
                      </h3>
                      {compressedDimensions && (
                        <span className="text-xs text-gray-500">
                          {compressedDimensions.width} × {compressedDimensions.height}px
                        </span>
                      )}
                    </div>
                    <div className="border-2 border-purple-200 rounded-lg overflow-hidden bg-gray-50 relative">
                      {loading ? (
                        <div className="flex items-center justify-center h-48 sm:h-64">
                          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 animate-spin" />
                        </div>
                      ) : compressedImage ? (
                        <img 
                          src={compressedImage} 
                          alt="Compressed" 
                          className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain"
                          style={{ transform: `scale(${zoom})` }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-48 sm:h-64 text-gray-400 text-sm sm:text-base px-4 text-center">
                          <p>Adjust quality and click "Compress Image"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Compression Controls */}
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Quality: {Math.round(quality * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>Smaller file</span>
                      <span>Better quality</span>
                    </div>
                  </div>

                  {compressedSize > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <span className="text-sm font-medium text-blue-900 block">Size Reduction</span>
                          <span className="text-xs text-gray-600">
                            {formatSize(originalSize)} → {formatSize(compressedSize)}
                          </span>
                        </div>
                        <span className="text-2xl sm:text-3xl font-bold text-purple-600">
                          {((1 - compressedSize / originalSize) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={compressImage}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95 touch-manipulation"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                          <span>Compressing...</span>
                        </>
                      ) : (
                        <>
                          <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>Compress Image</span>
                        </>
                      )}
                    </button>

                    {compressedImage && (
                      <>
                        <button
                          onClick={() => downloadImage(undefined, undefined)}
                          className="px-4 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base flex items-center justify-center gap-2 active:scale-95 touch-manipulation"
                        >
                          <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="hidden sm:inline">Download</span>
                        </button>
                        <button
                          onClick={shareImage}
                          className="px-4 sm:px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base flex items-center justify-center gap-2 active:scale-95 touch-manipulation"
                        >
                          <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="hidden sm:inline">Share</span>
                        </button>
                        <button
                          onClick={copyImageToClipboard}
                          className="px-4 sm:px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base flex items-center justify-center gap-2 active:scale-95 touch-manipulation"
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

