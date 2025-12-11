'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Footer from '@/components/Footer'
import MobileBottomAd from '@/components/MobileBottomAd'
import { 
  Upload, Download, X, Loader2, RefreshCw, Copy, Check, Share2,
  Image as ImageIcon, Settings, Info, FileImage, Maximize2,
  Minimize2, ZoomIn, ZoomOut, RotateCw, Palette, FileDown,
  Trash2, Plus, Grid, List
} from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

interface ImageFile {
  id: string
  original: string
  converted: string | null
  name: string
  size: number
  width: number
  height: number
  format: string
}

type Format = 'png' | 'jpg' | 'jpeg' | 'webp' | 'gif' | 'bmp' | 'ico'

export default function ImageConverter() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [format, setFormat] = useState<Format>('png')
  const [quality, setQuality] = useState(0.92)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [resizeEnabled, setResizeEnabled] = useState(false)
  const [newWidth, setNewWidth] = useState(0)
  const [newHeight, setNewHeight] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { triggerPopunder } = usePopunderAd()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.src = reader.result as string
        
        img.onload = () => {
          const imageFile: ImageFile = {
            id: Date.now().toString() + Math.random(),
            original: reader.result as string,
            converted: null,
            name: file.name,
            size: file.size,
            width: img.width,
            height: img.height,
            format: file.type.split('/')[1] || 'unknown'
          }
          
          setImages(prev => [...prev, imageFile])
          if (!selectedImage) {
            setSelectedImage(imageFile.id)
          }
          if (resizeEnabled && newWidth === 0 && newHeight === 0) {
            setNewWidth(img.width)
            setNewHeight(img.height)
          }
          toast.success(`${file.name} uploaded!`, { icon: '📷', duration: 2000 })
        }
      }
      reader.readAsDataURL(file)
    })
  }, [selectedImage, resizeEnabled, newWidth, newHeight])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.ico', '.svg']
    },
    multiple: true
  })

  const currentImage = images.find(img => img.id === selectedImage)

  const convertImage = async (imageId?: string) => {
    const imgToConvert = imageId ? images.find(img => img.id === imageId) : currentImage
    if (!imgToConvert) return

    setLoading(true)
    try {
      const img = new Image()
      img.src = imgToConvert.original
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      let width = img.width
      let height = img.height

      // Apply resizing if enabled
      if (resizeEnabled && newWidth > 0 && newHeight > 0) {
        if (maintainAspectRatio) {
          const ratio = Math.min(newWidth / width, newHeight / height)
          width = width * ratio
          height = height * ratio
        } else {
          width = newWidth
          height = newHeight
        }
      }

      canvas.width = width
      canvas.height = height

      // Handle transparency for PNG
      if (format === 'png') {
        ctx.clearRect(0, 0, width, height)
      } else {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, height)
      }

      ctx.drawImage(img, 0, 0, width, height)
      
      let mimeType = `image/${format}`
      let qualityValue = quality

      // Format-specific handling
      if (format === 'jpg' || format === 'jpeg') {
        mimeType = 'image/jpeg'
      } else if (format === 'ico') {
        mimeType = 'image/x-icon'
      } else if (format === 'bmp') {
        mimeType = 'image/bmp'
      } else if (format === 'gif') {
        mimeType = 'image/gif'
        qualityValue = undefined // GIF doesn't support quality
      }

      const convertedDataUrl = canvas.toDataURL(mimeType, qualityValue)
      
      setImages(prev => prev.map(img => 
        img.id === imgToConvert.id 
          ? { ...img, converted: convertedDataUrl }
          : img
      ))
      
      toast.success(`Image converted to ${format.toUpperCase()}!`, { 
        icon: '✅', 
        duration: 3000 
      })
    } catch (error) {
      toast.error('Failed to convert image')
    } finally {
      setLoading(false)
    }
  }

  const convertAll = async () => {
    for (const image of images) {
      if (!image.converted) {
        await convertImage(image.id)
      }
    }
    toast.success('All images converted!', { icon: '🎉', duration: 3000 })
  }

  const downloadImage = (imageId?: string, formatOverride?: Format) => {
    const imgToDownload = imageId ? images.find(img => img.id === imageId) : currentImage
    if (!imgToDownload || !imgToDownload.converted) {
      toast.error('No converted image to download')
      return
    }
    
    const link = document.createElement('a')
    const downloadFormat = formatOverride || format
    const fileName = imgToDownload.name.split('.')[0] || 'converted-image'
    link.download = `${fileName}.${downloadFormat}`
    link.href = imgToDownload.converted
    link.click()
    
    setTimeout(() => {
      triggerPopunder()
    }, 2000)
    
    toast.success('Image downloaded!', { icon: '📥', duration: 3000 })
  }

  const downloadAll = () => {
    images.forEach((img, index) => {
      if (img.converted) {
        setTimeout(() => {
          downloadImage(img.id)
        }, index * 200)
      }
    })
    toast.success('Downloading all images...', { icon: '📥', duration: 3000 })
  }

  const copyToClipboard = async (imageId?: string) => {
    const imgToCopy = imageId ? images.find(img => img.id === imageId) : currentImage
    if (!imgToCopy || !imgToCopy.converted) {
      toast.error('No converted image to copy')
      return
    }
    
    try {
      const response = await fetch(imgToCopy.converted)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      setCopied(true)
      toast.success('Image copied to clipboard!', { icon: '📋', duration: 3000 })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy image')
    }
  }

  const shareImage = async (imageId?: string) => {
    const imgToShare = imageId ? images.find(img => img.id === imageId) : currentImage
    if (!imgToShare || !imgToShare.converted) {
      toast.error('No converted image to share')
      return
    }
    
    try {
      const response = await fetch(imgToShare.converted)
      const blob = await response.blob()
      const file = new File([blob], `${imgToShare.name}.${format}`, { type: blob.type })
      
      if (navigator.share) {
        await navigator.share({
          title: 'Converted Image',
          files: [file]
        })
        toast.success('Image shared!', { duration: 2000 })
      } else {
        copyToClipboard(imageId)
      }
    } catch (error) {
      toast.error('Sharing not supported or failed')
    }
  }

  const removeImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
    if (selectedImage === imageId) {
      const remaining = images.filter(img => img.id !== imageId)
      setSelectedImage(remaining.length > 0 ? remaining[0].id : null)
    }
    toast.success('Image removed!', { duration: 2000 })
  }

  const removeAll = () => {
    setImages([])
    setSelectedImage(null)
    toast.success('All images removed!', { duration: 2000 })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const qualityPresets = [
    { label: 'Maximum', value: 1.0 },
    { label: 'High', value: 0.92 },
    { label: 'Medium', value: 0.80 },
    { label: 'Low', value: 0.60 },
  ]

  useEffect(() => {
    if (currentImage && resizeEnabled && newWidth === 0 && newHeight === 0) {
      setNewWidth(currentImage.width)
      setNewHeight(currentImage.height)
    }
  }, [currentImage, resizeEnabled])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      <main className="flex-grow py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="relative inline-flex items-center justify-center mb-3 sm:mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
              <div className="relative inline-flex p-2 sm:p-3 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 shadow-lg">
                <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">
              Image Converter
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-4">Convert images between multiple formats with advanced options</p>
          </div>

          {/* Upload Area */}
          {images.length === 0 ? (
            <div
              {...getRootProps()}
              className={`bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl sm:rounded-2xl shadow-xl border-2 border-dashed p-8 sm:p-12 md:p-16 text-center cursor-pointer transition-all touch-manipulation ${
                isDragActive
                  ? 'border-purple-500 bg-purple-100 scale-105'
                  : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 text-gray-400 mx-auto mb-4 sm:mb-6" />
              <p className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
              </p>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                or click to select files
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                Supports PNG, JPG, WEBP, GIF, BMP, ICO (Multiple files supported)
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Image List/Grid */}
              {images.length > 1 && (
                <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl sm:rounded-2xl shadow-xl border-2 border-purple-200 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-purple-600" />
                      Images ({images.length})
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                        title="Toggle view"
                      >
                        {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={removeAll}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                        title="Remove all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className={viewMode === 'grid' 
                    ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'
                    : 'space-y-2'
                  }>
                    {images.map((img) => (
                      <div
                        key={img.id}
                        onClick={() => setSelectedImage(img.id)}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === img.id
                            ? 'border-purple-500 ring-2 ring-purple-200'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <img
                          src={img.original}
                          alt={img.name}
                          className="w-full h-24 sm:h-32 object-cover"
                        />
                        <div className="absolute top-1 right-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeImage(img.id)
                            }}
                            className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        {img.converted && (
                          <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
                            ✓
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                          {img.name}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    {...getRootProps()}
                    className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-purple-400 transition-all"
                  >
                    <input {...getInputProps()} />
                    <Plus className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Add more images</p>
                  </div>
                </div>
              )}

              {/* Main Conversion Area */}
              {currentImage && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left Panel - Controls */}
                  <div className="space-y-4 sm:space-y-6">
                    {/* Format Selection */}
                    <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl sm:rounded-2xl shadow-xl border-2 border-purple-200 p-4 sm:p-6">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Settings className="h-5 w-5 text-purple-600" />
                        Conversion Settings
                      </h2>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">Output Format</label>
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {(['png', 'jpg', 'webp'] as Format[]).map((fmt) => (
                              <button
                                key={fmt}
                                onClick={() => setFormat(fmt)}
                                className={`px-3 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                                  format === fmt
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400'
                                }`}
                              >
                                {fmt.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>

                        {(format === 'jpg' || format === 'webp') && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                              Quality: {Math.round(quality * 100)}%
                            </label>
                            <input
                              type="range"
                              min="0.1"
                              max="1"
                              step="0.01"
                              value={quality}
                              onChange={(e) => setQuality(Number(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                            <div className="flex gap-2 mt-2">
                              {qualityPresets.map((preset) => (
                                <button
                                  key={preset.label}
                                  onClick={() => setQuality(preset.value)}
                                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                    quality === preset.value
                                      ? 'bg-purple-500 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="resize"
                            checked={resizeEnabled}
                            onChange={(e) => setResizeEnabled(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <label htmlFor="resize" className="text-sm font-medium text-gray-900">
                            Resize Image
                          </label>
                        </div>

                        {resizeEnabled && (
                          <div className="space-y-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <input
                                type="checkbox"
                                id="aspectRatio"
                                checked={maintainAspectRatio}
                                onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <label htmlFor="aspectRatio" className="text-sm font-medium text-gray-900">
                                Maintain Aspect Ratio
                              </label>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-gray-900 mb-1">Width</label>
                                <input
                                  type="number"
                                  value={newWidth || currentImage?.width || ''}
                                  onChange={(e) => {
                                    const val = Number(e.target.value)
                                    setNewWidth(val)
                                    if (maintainAspectRatio && currentImage) {
                                      const ratio = currentImage.width / currentImage.height
                                      setNewHeight(Math.round(val / ratio))
                                    }
                                  }}
                                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-medium text-sm"
                                  placeholder="Width"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-900 mb-1">Height</label>
                                <input
                                  type="number"
                                  value={newHeight || currentImage?.height || ''}
                                  onChange={(e) => {
                                    const val = Number(e.target.value)
                                    setNewHeight(val)
                                    if (maintainAspectRatio && currentImage) {
                                      const ratio = currentImage.width / currentImage.height
                                      setNewWidth(Math.round(val * ratio))
                                    }
                                  }}
                                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-medium text-sm"
                                  placeholder="Height"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Advanced Settings Toggle */}
                        <button
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                          <Settings className="h-4 w-4" />
                          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                        </button>
                      </div>
                    </div>

                    {/* Image Info */}
                    <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 rounded-xl sm:rounded-2xl shadow-xl border-2 border-blue-200 p-4 sm:p-6">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-600" />
                        Image Information
                      </h2>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-semibold text-gray-900 truncate ml-2">{currentImage.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Format:</span>
                          <span className="font-semibold text-gray-900">{currentImage.format.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dimensions:</span>
                          <span className="font-semibold text-gray-900">{currentImage.width} × {currentImage.height}px</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Size:</span>
                          <span className="font-semibold text-gray-900">{formatFileSize(currentImage.size)}</span>
                        </div>
                        {currentImage.converted && (
                          <div className="pt-2 border-t border-gray-200">
                            <div className="flex justify-between text-green-600">
                              <span>Converted:</span>
                              <span className="font-semibold">✓ Ready</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => convertImage()}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95 touch-manipulation min-h-[48px]"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                            <span>Converting...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span>Convert Image</span>
                          </>
                        )}
                      </button>

                      {images.length > 1 && (
                        <button
                          onClick={convertAll}
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95 touch-manipulation min-h-[48px]"
                        >
                          <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>Convert All ({images.length})</span>
                        </button>
                      )}

                      {currentImage?.converted && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => downloadImage()}
                            className="bg-green-500 text-white px-4 py-3 rounded-xl font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2 text-sm active:scale-95 touch-manipulation min-h-[48px]"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </button>
                          <button
                            onClick={() => copyToClipboard()}
                            className="bg-blue-500 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 text-sm active:scale-95 touch-manipulation min-h-[48px]"
                          >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            <span>Copy</span>
                          </button>
                        </div>
                      )}

                      {images.filter(img => img.converted).length > 0 && (
                        <button
                          onClick={downloadAll}
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95 touch-manipulation min-h-[48px]"
                        >
                          <FileDown className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>Download All ({images.filter(img => img.converted).length})</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Panel - Preview */}
                  <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl sm:rounded-2xl shadow-xl border-2 border-purple-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Maximize2 className="h-5 w-5 text-purple-600" />
                        Preview
                      </h2>
                      {currentImage.converted && (
                        <button
                          onClick={() => shareImage()}
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                          title="Share"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Original</h3>
                        <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-100">
                          <img
                            src={currentImage.original}
                            alt="Original"
                            className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain mx-auto"
                          />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">
                          Converted ({format.toUpperCase()})
                        </h3>
                        <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-100">
                          {loading ? (
                            <div className="flex items-center justify-center h-48 sm:h-64">
                              <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                            </div>
                          ) : currentImage.converted ? (
                            <img
                              src={currentImage.converted}
                              alt="Converted"
                              className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain mx-auto"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-48 sm:h-64 text-gray-400 text-sm text-center px-4">
                              <p>Click "Convert Image" to see the result</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <MobileBottomAd adKey="36d691042d95ac1ac33375038ec47a5c" />
      <Footer />
    </div>
  )
}

