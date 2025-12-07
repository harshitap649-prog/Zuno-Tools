'use client'

import { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useDropzone } from 'react-dropzone'
import Footer from '@/components/Footer'
import { Upload, Download, X, Image as ImageIcon, Loader2, Share2, RotateCw, FlipHorizontal, FlipVertical, Copy, Check, RefreshCw, ZoomIn, ZoomOut, Settings, History, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

// Dynamically import ad components to avoid SSR issues
const SidebarAd = dynamic(() => import('@/components/SidebarAd'), { ssr: false })
const MobileBottomAd = dynamic(() => import('@/components/MobileBottomAd'), { ssr: false })

type FilterType = 'none' | 'grayscale' | 'sepia' | 'blur' | 'brightness' | 'contrast' | 'invert' | 'saturate' | 'hue' | 'vintage' | 'warm' | 'cool' | 'sharpen' | 'emboss' | 'posterize'

interface FilterSettings {
  grayscale: number
  sepia: number
  brightness: number
  contrast: number
  saturate: number
  hue: number
  blur: number
  invert: number
  vintage: number
  warm: number
  cool: number
  sharpen: number
  emboss: number
  posterize: number
}

export default function ImageFilters() {
  const [image, setImage] = useState<string | null>(null)
  const [filteredImage, setFilteredImage] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('none')
  const [filterIntensity, setFilterIntensity] = useState(100)
  const [activeFilters, setActiveFilters] = useState<FilterSettings>({
    grayscale: 0,
    sepia: 0,
    brightness: 100,
    contrast: 100,
    saturate: 100,
    hue: 0,
    blur: 0,
    invert: 0,
    vintage: 0,
    warm: 0,
    cool: 0,
    sharpen: 0,
    emboss: 0,
    posterize: 0,
  })
  const [rotation, setRotation] = useState(0)
  const [flipHorizontal, setFlipHorizontal] = useState(false)
  const [flipVertical, setFlipVertical] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [copied, setCopied] = useState(false)
  const [filterHistory, setFilterHistory] = useState<Array<{ id: string; image: string; settings: FilterSettings; timestamp: number }>>([])
  const [realTimePreview, setRealTimePreview] = useState(true)
  const { triggerPopunder } = usePopunderAd()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result as string)
        setFilteredImage(null)
        setFilter('none')
        setFilterIntensity(100)
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

  const applyAllFilters = () => {
    if (!image) return

    const img = new Image()
    img.src = image

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Handle rotation and flip
      canvas.width = img.width
      canvas.height = img.height
      
      ctx.save()
      
      // Apply rotation
      if (rotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.translate(-canvas.width / 2, -canvas.height / 2)
      }
      
      // Apply flip
      if (flipHorizontal || flipVertical) {
        ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1)
        ctx.translate(flipHorizontal ? -canvas.width : 0, flipVertical ? -canvas.height : 0)
      }
      
      ctx.drawImage(img, 0, 0)
      ctx.restore()

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Apply all active filters
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i]
        let g = data[i + 1]
        let b = data[i + 2]

        // Grayscale
        if (activeFilters.grayscale > 0) {
          const gray = r * 0.299 + g * 0.587 + b * 0.114
          const intensity = activeFilters.grayscale / 100
          r = r * (1 - intensity) + gray * intensity
          g = g * (1 - intensity) + gray * intensity
          b = b * (1 - intensity) + gray * intensity
        }

        // Sepia
        if (activeFilters.sepia > 0) {
          const intensity = activeFilters.sepia / 100
          const tr = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
          const tg = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
          const tb = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
          r = r * (1 - intensity) + tr * intensity
          g = g * (1 - intensity) + tg * intensity
          b = b * (1 - intensity) + tb * intensity
        }

        // Brightness
        if (activeFilters.brightness !== 100) {
          const factor = (activeFilters.brightness - 100) / 100
          r = Math.min(255, Math.max(0, r + r * factor))
          g = Math.min(255, Math.max(0, g + g * factor))
          b = Math.min(255, Math.max(0, b + b * factor))
        }

        // Contrast
        if (activeFilters.contrast !== 100) {
          const factor = (259 * (activeFilters.contrast + 255)) / (255 * (259 - activeFilters.contrast))
          r = Math.min(255, Math.max(0, factor * (r - 128) + 128))
          g = Math.min(255, Math.max(0, factor * (g - 128) + 128))
          b = Math.min(255, Math.max(0, factor * (b - 128) + 128))
        }

        // Saturation
        if (activeFilters.saturate !== 100) {
          const gray = r * 0.299 + g * 0.587 + b * 0.114
          const factor = activeFilters.saturate / 100
          r = Math.min(255, Math.max(0, gray + (r - gray) * factor))
          g = Math.min(255, Math.max(0, gray + (g - gray) * factor))
          b = Math.min(255, Math.max(0, gray + (b - gray) * factor))
        }

        // Hue rotation
        if (activeFilters.hue !== 0) {
          const h = activeFilters.hue * Math.PI / 180
          const cos = Math.cos(h)
          const sin = Math.sin(h)
          const newR = r * (0.299 + 0.701 * cos + 0.168 * sin) + g * (0.587 - 0.587 * cos + 0.330 * sin) + b * (0.114 - 0.114 * cos - 0.497 * sin)
          const newG = r * (0.299 - 0.299 * cos - 0.328 * sin) + g * (0.587 + 0.413 * cos + 0.035 * sin) + b * (0.114 - 0.114 * cos + 0.292 * sin)
          const newB = r * (0.299 - 0.299 * cos + 1.25 * sin) + g * (0.587 - 0.587 * cos - 1.05 * sin) + b * (0.114 + 0.886 * cos - 0.203 * sin)
          r = Math.min(255, Math.max(0, newR))
          g = Math.min(255, Math.max(0, newG))
          b = Math.min(255, Math.max(0, newB))
        }

        // Invert
        if (activeFilters.invert > 0) {
          const intensity = activeFilters.invert / 100
          r = r * (1 - intensity) + (255 - r) * intensity
          g = g * (1 - intensity) + (255 - g) * intensity
          b = b * (1 - intensity) + (255 - b) * intensity
        }

        // Vintage
        if (activeFilters.vintage > 0) {
          const intensity = activeFilters.vintage / 100
          const vr = Math.min(255, r * 0.9 + 20)
          const vg = Math.min(255, g * 0.9 + 10)
          const vb = Math.min(255, b * 0.85)
          r = r * (1 - intensity) + vr * intensity
          g = g * (1 - intensity) + vg * intensity
          b = b * (1 - intensity) + vb * intensity
        }

        // Warm
        if (activeFilters.warm > 0) {
          const intensity = activeFilters.warm / 100
          r = Math.min(255, r + 20 * intensity)
          b = Math.max(0, b - 20 * intensity)
        }

        // Cool
        if (activeFilters.cool > 0) {
          const intensity = activeFilters.cool / 100
          r = Math.max(0, r - 20 * intensity)
          b = Math.min(255, b + 20 * intensity)
        }

        // Posterize
        if (activeFilters.posterize > 0) {
          const levels = Math.max(2, Math.floor(256 / (activeFilters.posterize / 10 + 1)))
          r = Math.floor(r / (256 / levels)) * (256 / levels)
          g = Math.floor(g / (256 / levels)) * (256 / levels)
          b = Math.floor(b / (256 / levels)) * (256 / levels)
        }

        data[i] = Math.round(r)
        data[i + 1] = Math.round(g)
        data[i + 2] = Math.round(b)
      }

      ctx.putImageData(imageData, 0, 0)
      
      // Apply blur if needed (requires separate pass)
      if (activeFilters.blur > 0) {
        ctx.filter = `blur(${activeFilters.blur / 10}px)`
        ctx.drawImage(canvas, 0, 0)
      }

      setFilteredImage(canvas.toDataURL('image/png'))
      toast.success('Filters applied successfully!')
    }
  }

  const applyFilter = () => {
    if (filter === 'none') {
      setFilteredImage(null)
      return
    }

    // Update active filters based on current filter selection
    const updated = { ...activeFilters }
    
    if (filter === 'grayscale') updated.grayscale = filterIntensity
    else if (filter === 'sepia') updated.sepia = filterIntensity
    else if (filter === 'brightness') updated.brightness = filterIntensity
    else if (filter === 'contrast') updated.contrast = filterIntensity
    else if (filter === 'saturate') updated.saturate = filterIntensity
    else if (filter === 'invert') updated.invert = filterIntensity
    else if (filter === 'blur') updated.blur = filterIntensity
    else if (filter === 'hue') updated.hue = filterIntensity
    else if (filter === 'vintage') updated.vintage = filterIntensity
    else if (filter === 'warm') updated.warm = filterIntensity
    else if (filter === 'cool') updated.cool = filterIntensity
    else if (filter === 'posterize') updated.posterize = filterIntensity

    setActiveFilters(updated)
    applyAllFilters()
  }

  // Real-time preview effect
  useEffect(() => {
    if (realTimePreview && image && filter !== 'none') {
      const timeoutId = setTimeout(() => {
        const updated = { ...activeFilters }
        if (filter === 'grayscale') updated.grayscale = filterIntensity
        else if (filter === 'sepia') updated.sepia = filterIntensity
        else if (filter === 'brightness') updated.brightness = filterIntensity
        else if (filter === 'contrast') updated.contrast = filterIntensity
        else if (filter === 'saturate') updated.saturate = filterIntensity
        else if (filter === 'invert') updated.invert = filterIntensity
        else if (filter === 'blur') updated.blur = filterIntensity
        else if (filter === 'hue') updated.hue = filterIntensity
        else if (filter === 'vintage') updated.vintage = filterIntensity
        else if (filter === 'warm') updated.warm = filterIntensity
        else if (filter === 'cool') updated.cool = filterIntensity
        else if (filter === 'posterize') updated.posterize = filterIntensity
        setActiveFilters(updated)
        applyAllFilters()
      }, 300) // Debounce
      return () => clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, filterIntensity, rotation, flipHorizontal, flipVertical, realTimePreview, image])

  const downloadImage = () => {
    if (!filteredImage) {
      toast.error('No filtered image to download')
      return
    }

    const link = document.createElement('a')
    link.download = `filtered-image-${Date.now()}.png`
    link.href = filteredImage
    link.click()
    
    // Trigger popunder ad after 2 seconds
    setTimeout(() => {
      triggerPopunder()
    }, 2000)
    
    toast.success('Image downloaded!')
  }

  const shareImage = async () => {
    if (!filteredImage) {
      toast.error('No filtered image to share')
      return
    }

    try {
      const blob = await fetch(filteredImage).then(r => r.blob())
      const file = new File([blob], 'filtered-image.png', { type: 'image/png' })
      
      if (navigator.share) {
        await navigator.share({
          title: 'Filtered Image',
          files: [file],
        })
        toast.success('Image shared!')
      } else {
        copyImageUrl()
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        copyImageUrl()
      }
    }
  }

  const copyImageUrl = async () => {
    if (!filteredImage) return
    
    try {
      await navigator.clipboard.writeText(filteredImage)
      setCopied(true)
      toast.success('Image URL copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy image')
    }
  }

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360)
    if (filteredImage) {
      setTimeout(() => applyAllFilters(), 100)
    }
  }

  const flipImageHorizontal = () => {
    setFlipHorizontal((prev) => !prev)
    if (filteredImage) {
      setTimeout(() => applyAllFilters(), 100)
    }
  }

  const flipImageVertical = () => {
    setFlipVertical((prev) => !prev)
    if (filteredImage) {
      setTimeout(() => applyAllFilters(), 100)
    }
  }

  const resetTransforms = () => {
    setRotation(0)
    setFlipHorizontal(false)
    setFlipVertical(false)
    if (filteredImage) {
      setTimeout(() => applyAllFilters(), 100)
    }
  }

  const resetFilters = () => {
    setActiveFilters({
      grayscale: 0,
      sepia: 0,
      brightness: 100,
      contrast: 100,
      saturate: 100,
      hue: 0,
      blur: 0,
      invert: 0,
      vintage: 0,
      warm: 0,
      cool: 0,
      sharpen: 0,
      emboss: 0,
      posterize: 0,
    })
    setFilter('none')
    setFilterIntensity(100)
    setFilteredImage(null)
  }

  const reset = () => {
    setImage(null)
    setFilteredImage(null)
    setFilter('none')
    setFilterIntensity(100)
    setRotation(0)
    setFlipHorizontal(false)
    setFlipVertical(false)
    resetFilters()
  }

  const applyPreset = (preset: 'vintage' | 'blackwhite' | 'warm' | 'cool' | 'dramatic') => {
    const presets: Record<string, Partial<FilterSettings>> = {
      vintage: { sepia: 80, contrast: 120, brightness: 90, saturate: 80 },
      blackwhite: { grayscale: 100, contrast: 130 },
      warm: { warm: 100, brightness: 110, saturate: 120 },
      cool: { cool: 100, brightness: 95, contrast: 110 },
      dramatic: { contrast: 150, saturate: 130, brightness: 90 },
    }
    
    const presetSettings = presets[preset]
    const updated = { ...activeFilters, ...presetSettings }
    setActiveFilters(updated)
    setFilter('none')
    setTimeout(() => applyAllFilters(), 100)
    toast.success(`${preset.charAt(0).toUpperCase() + preset.slice(1)} preset applied!`)
  }

  const saveToHistory = () => {
    if (!filteredImage) return
    
    const historyItem = {
      id: Date.now().toString(),
      image: filteredImage,
      settings: activeFilters,
      timestamp: Date.now(),
    }
    const updated = [historyItem, ...filterHistory.slice(0, 9)]
    setFilterHistory(updated)
    localStorage.setItem('image-filter-history', JSON.stringify(updated))
    toast.success('Saved to history!')
  }

  const loadFromHistory = (item: typeof filterHistory[0]) => {
    setActiveFilters(item.settings)
    setFilteredImage(item.image)
    toast.success('Loaded from history!')
  }

  const filters: { name: string; value: FilterType }[] = [
    { name: 'None', value: 'none' },
    { name: 'Grayscale', value: 'grayscale' },
    { name: 'Sepia', value: 'sepia' },
    { name: 'Vintage', value: 'vintage' },
    { name: 'Invert', value: 'invert' },
    { name: 'Brightness', value: 'brightness' },
    { name: 'Contrast', value: 'contrast' },
    { name: 'Saturate', value: 'saturate' },
    { name: 'Hue', value: 'hue' },
    { name: 'Blur', value: 'blur' },
    { name: 'Warm', value: 'warm' },
    { name: 'Cool', value: 'cool' },
    { name: 'Posterize', value: 'posterize' },
  ]

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('image-filter-history')
    if (saved) {
      try {
        setFilterHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load history:', e)
      }
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <SidebarAd position="right" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 mb-3 sm:mb-4">
              <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">Image Filters</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Apply professional filters and effects to your images</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
            {!image ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center cursor-pointer transition-colors touch-manipulation ${
                  isDragActive
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50 active:bg-purple-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">or click to select a file</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Apply Filters</h2>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setShowComparison(!showComparison)}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-all text-xs sm:text-sm flex items-center justify-center gap-2 touch-manipulation active:scale-95"
                    >
                      {showComparison ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                      <span className="hidden sm:inline">Comparison</span>
                    </button>
                    <button
                      onClick={reset}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-all text-xs sm:text-sm flex items-center justify-center gap-2 touch-manipulation active:scale-95"
                    >
                      <X className="h-4 w-4" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* Image Display - Comparison or Side by Side */}
                {showComparison ? (
                  <div className="relative border rounded-lg overflow-hidden bg-gray-100" style={{ aspectRatio: '16/9' }}>
                    <div className="absolute inset-0 flex">
                      <div className="w-1/2 h-full overflow-hidden">
                        <img src={image} alt="Original" className="w-full h-full object-contain" />
                      </div>
                      <div className="w-1/2 h-full overflow-hidden border-l-2 border-white">
                        {filteredImage ? (
                          <img src={filteredImage} alt="Filtered" className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white">
                            <p className="text-xs sm:text-sm text-gray-900">Apply a filter</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      Original
                    </div>
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      Filtered
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">Original</h3>
                      <div className="border rounded-lg overflow-hidden bg-white">
                        <img src={image} alt="Original" className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">Filtered</h3>
                      <div className="border rounded-lg overflow-hidden bg-white min-h-[200px] sm:min-h-[300px] flex items-center justify-center">
                        {filteredImage ? (
                          <img src={filteredImage} alt="Filtered" className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain" />
                        ) : (
                          <p className="text-xs sm:text-sm text-gray-900 px-4 text-center">Select a filter and apply it</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Transform Controls */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3">Transform</h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button
                      onClick={rotateImage}
                      className="px-3 sm:px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-900 transition-all flex items-center gap-2 touch-manipulation active:scale-95"
                    >
                      <RotateCw className="h-4 w-4 text-gray-900" />
                      <span>Rotate</span>
                    </button>
                    <button
                      onClick={flipImageHorizontal}
                      className="px-3 sm:px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-900 transition-all flex items-center gap-2 touch-manipulation active:scale-95"
                    >
                      <FlipHorizontal className="h-4 w-4 text-gray-900" />
                      <span>Flip H</span>
                    </button>
                    <button
                      onClick={flipImageVertical}
                      className="px-3 sm:px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-900 transition-all flex items-center gap-2 touch-manipulation active:scale-95"
                    >
                      <FlipVertical className="h-4 w-4 text-gray-900" />
                      <span>Flip V</span>
                    </button>
                    {(rotation !== 0 || flipHorizontal || flipVertical) && (
                      <button
                        onClick={resetTransforms}
                        className="px-3 sm:px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-2 touch-manipulation active:scale-95"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Presets */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3">Quick Presets</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => applyPreset('vintage')}
                      className="px-3 py-1.5 sm:py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation active:scale-95"
                    >
                      Vintage
                    </button>
                    <button
                      onClick={() => applyPreset('blackwhite')}
                      className="px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation active:scale-95"
                    >
                      B&W
                    </button>
                    <button
                      onClick={() => applyPreset('warm')}
                      className="px-3 py-1.5 sm:py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation active:scale-95"
                    >
                      Warm
                    </button>
                    <button
                      onClick={() => applyPreset('cool')}
                      className="px-3 py-1.5 sm:py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation active:scale-95"
                    >
                      Cool
                    </button>
                    <button
                      onClick={() => applyPreset('dramatic')}
                      className="px-3 py-1.5 sm:py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation active:scale-95"
                    >
                      Dramatic
                    </button>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-900">
                      Filter Type
                    </label>
                    <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={realTimePreview}
                        onChange={(e) => setRealTimePreview(e.target.checked)}
                        className="w-4 h-4"
                      />
                      Real-time
                    </label>
                  </div>
                  <select
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value as FilterType)
                      if (!realTimePreview) setFilteredImage(null)
                    }}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base text-gray-900 bg-white touch-manipulation"
                  >
                    {filters.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.name}
                      </option>
                    ))}
                  </select>

                  {filter !== 'none' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs sm:text-sm font-medium text-gray-900">
                          Intensity
                        </label>
                        <span className="text-xs sm:text-sm font-semibold text-gray-700">{filterIntensity}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={filterIntensity}
                        onChange={(e) => {
                          setFilterIntensity(Number(e.target.value))
                          if (!realTimePreview) setFilteredImage(null)
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer touch-manipulation"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                        <span>200%</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={applyFilter}
                      disabled={filter === 'none'}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation active:scale-95"
                    >
                      <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Apply Filter</span>
                    </button>
                    <button
                      onClick={resetFilters}
                      className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition-all text-sm sm:text-base touch-manipulation active:scale-95"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                {filteredImage && (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={downloadImage}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation active:scale-95"
                    >
                      <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={shareImage}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation active:scale-95"
                    >
                      <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Share</span>
                    </button>
                    <button
                      onClick={copyImageUrl}
                      className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation active:scale-95"
                    >
                      {copied ? <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" /> : <Copy className="h-4 w-4 sm:h-5 sm:w-5" />}
                      <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={saveToHistory}
                      className="px-4 sm:px-6 py-2.5 sm:py-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation active:scale-95"
                    >
                      <History className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Save</span>
                    </button>
                  </div>
                )}

                {/* Filter History */}
                {filterHistory.length > 0 && (
                  <div className="border-t border-gray-200 pt-4 sm:pt-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <History className="h-4 w-4 sm:h-5 sm:w-5" />
                        Recent Filters
                      </h3>
                      <button
                        onClick={() => {
                          setFilterHistory([])
                          localStorage.removeItem('image-filter-history')
                          toast.success('History cleared!')
                        }}
                        className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium touch-manipulation active:scale-95"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 max-h-48 overflow-y-auto">
                      {filterHistory.map((item) => (
                        <div
                          key={item.id}
                          className="relative group cursor-pointer"
                          onClick={() => loadFromHistory(item)}
                        >
                          <img
                            src={item.image}
                            alt="History"
                            className="w-full h-20 sm:h-24 object-cover rounded-lg border-2 border-gray-200 group-hover:border-purple-500 transition-colors"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              const updated = filterHistory.filter(h => h.id !== item.id)
                              setFilterHistory(updated)
                              localStorage.setItem('image-filter-history', JSON.stringify(updated))
                              toast.success('Removed from history!')
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation active:scale-95"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

