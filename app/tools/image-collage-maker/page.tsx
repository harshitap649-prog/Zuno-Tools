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

interface CollageTemplate {
  id: string
  name: string
  minImages: number
  maxImages: number
  description: string
  preview: string // SVG or description for preview
}

const COLLAGE_TEMPLATES: CollageTemplate[] = [
  { id: 'grid-2x2', name: 'Grid 2x2', minImages: 4, maxImages: 4, description: 'Perfect square grid', preview: '2x2' },
  { id: 'grid-3x3', name: 'Grid 3x3', minImages: 9, maxImages: 9, description: 'Nine square grid', preview: '3x3' },
  { id: 'grid-4x4', name: 'Grid 4x4', minImages: 16, maxImages: 16, description: 'Sixteen square grid', preview: '4x4' },
  { id: 'vertical-stack', name: 'Vertical Stack', minImages: 2, maxImages: 10, description: 'Stack images vertically', preview: 'vertical' },
  { id: 'horizontal-stack', name: 'Horizontal Stack', minImages: 2, maxImages: 10, description: 'Stack images horizontally', preview: 'horizontal' },
  { id: 'masonry-2col', name: 'Masonry 2 Columns', minImages: 3, maxImages: 20, description: 'Pinterest-style layout', preview: 'masonry' },
  { id: 'masonry-3col', name: 'Masonry 3 Columns', minImages: 4, maxImages: 30, description: 'Three column masonry', preview: 'masonry' },
  { id: 'big-small', name: 'Big & Small', minImages: 3, maxImages: 3, description: 'One large, two small', preview: 'bigsmall' },
  { id: 'small-big', name: 'Small & Big', minImages: 3, maxImages: 3, description: 'Two small, one large', preview: 'smallbig' },
  { id: 'center-focus', name: 'Center Focus', minImages: 5, maxImages: 5, description: 'One center, four corners', preview: 'center' },
  { id: 'diagonal', name: 'Diagonal', minImages: 3, maxImages: 5, description: 'Diagonal arrangement', preview: 'diagonal' },
  { id: 'split-screen', name: 'Split Screen', minImages: 2, maxImages: 2, description: 'Equal split', preview: 'split' },
  { id: 'triptych', name: 'Triptych', minImages: 3, maxImages: 3, description: 'Three equal panels', preview: 'triptych' },
  { id: 'frame', name: 'Frame', minImages: 5, maxImages: 5, description: 'Frame with center', preview: 'frame' },
  { id: 'pyramid', name: 'Pyramid', minImages: 6, maxImages: 6, description: 'Pyramid arrangement', preview: 'pyramid' },
  { id: 'cross', name: 'Cross', minImages: 5, maxImages: 5, description: 'Cross pattern', preview: 'cross' },
  { id: 'circle', name: 'Circle', minImages: 4, maxImages: 8, description: 'Circular arrangement', preview: 'circle' },
  { id: 'heart', name: 'Heart', minImages: 4, maxImages: 6, description: 'Heart shape', preview: 'heart' },
  { id: 'star', name: 'Star', minImages: 5, maxImages: 5, description: 'Star pattern', preview: 'star' },
  { id: 'zigzag', name: 'Zigzag', minImages: 4, maxImages: 8, description: 'Zigzag pattern', preview: 'zigzag' },
  { id: 'spiral', name: 'Spiral', minImages: 5, maxImages: 9, description: 'Spiral arrangement', preview: 'spiral' },
  { id: 'banner', name: 'Banner', minImages: 3, maxImages: 5, description: 'Wide banner style', preview: 'banner' },
  { id: 'portrait', name: 'Portrait', minImages: 2, maxImages: 4, description: 'Portrait orientation', preview: 'portrait' },
  { id: 'landscape', name: 'Landscape', minImages: 2, maxImages: 4, description: 'Landscape orientation', preview: 'landscape' },
  { id: 'magazine', name: 'Magazine', minImages: 4, maxImages: 6, description: 'Magazine layout', preview: 'magazine' },
  { id: 'story', name: 'Story', minImages: 3, maxImages: 5, description: 'Story format', preview: 'story' },
  { id: 'collage-free', name: 'Free Form', minImages: 2, maxImages: 20, description: 'Auto-arrange', preview: 'free' }
]

export default function ImageCollageMaker() {
  const [images, setImages] = useState<string[]>([])
  const [layout, setLayout] = useState('grid-2x2')
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
  const [showTemplates, setShowTemplates] = useState(false)
  const [copied, setCopied] = useState(false)
  const [collageCreated, setCollageCreated] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
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

  const drawImageWithBorder = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, width: number, height: number) => {
    if (borderWidth > 0) {
      ctx.fillStyle = borderColor
      ctx.fillRect(x - borderWidth, y - borderWidth, width + borderWidth * 2, height + borderWidth * 2)
    }
    ctx.drawImage(img, x, y, width, height)
  }

  const createCollage = async () => {
    const canvas = canvasRef.current
    if (!canvas || images.length === 0) {
      toast.error('Please upload at least one image')
      return
    }

    const template = COLLAGE_TEMPLATES.find(t => t.id === layout)
    if (!template) {
      toast.error('Invalid template selected')
      return
    }

    if (images.length < template.minImages) {
      toast.error(`This template requires at least ${template.minImages} images. You have ${images.length}.`)
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      toast.error('Canvas context not available')
      return
    }

    setIsCreating(true)
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
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = src
      })
    })

    try {
      const loadedImages = await Promise.all(imagePromises)
      const imagesToUse = loadedImages.slice(0, Math.min(template.maxImages, loadedImages.length))

      // Draw based on layout
      if (layout === 'grid-2x2') {
        const size = (canvas.width - spacing * 3) / 2
        const positions = [
          [spacing, spacing],
          [spacing * 2 + size, spacing],
          [spacing, spacing * 2 + size],
          [spacing * 2 + size, spacing * 2 + size],
        ]
        imagesToUse.forEach((img, index) => {
          const [x, y] = positions[index]
          drawImageWithBorder(ctx, img, x, y, size, size)
        })
      } else if (layout === 'grid-3x3') {
        const size = (canvas.width - spacing * 4) / 3
        imagesToUse.forEach((img, index) => {
          const col = index % 3
          const row = Math.floor(index / 3)
          const x = spacing + col * (size + spacing)
          const y = spacing + row * (size + spacing)
          drawImageWithBorder(ctx, img, x, y, size, size)
        })
      } else if (layout === 'grid-4x4') {
        const size = (canvas.width - spacing * 5) / 4
        imagesToUse.forEach((img, index) => {
          const col = index % 4
          const row = Math.floor(index / 4)
          const x = spacing + col * (size + spacing)
          const y = spacing + row * (size + spacing)
          drawImageWithBorder(ctx, img, x, y, size, size)
        })
      } else if (layout === 'vertical-stack') {
        const height = (canvas.height - spacing * (imagesToUse.length + 1)) / imagesToUse.length
        const width = canvas.width - spacing * 2
        imagesToUse.forEach((img, index) => {
          const y = spacing + index * (height + spacing)
          drawImageWithBorder(ctx, img, spacing, y, width, height)
        })
      } else if (layout === 'horizontal-stack') {
        const width = (canvas.width - spacing * (imagesToUse.length + 1)) / imagesToUse.length
        const height = canvas.height - spacing * 2
        imagesToUse.forEach((img, index) => {
          const x = spacing + index * (width + spacing)
          drawImageWithBorder(ctx, img, x, spacing, width, height)
        })
      } else if (layout === 'masonry-2col') {
        const colWidth = (canvas.width - spacing * 3) / 2
        const colHeights = [spacing, spacing]
        imagesToUse.forEach((img, index) => {
          const col = index % 2
          const imgAspect = img.width / img.height
          const imgHeight = colWidth / imgAspect
          const x = spacing + col * (colWidth + spacing)
          const y = colHeights[col]
          drawImageWithBorder(ctx, img, x, y, colWidth, imgHeight)
          colHeights[col] += imgHeight + spacing
        })
      } else if (layout === 'masonry-3col') {
        const colWidth = (canvas.width - spacing * 4) / 3
        const colHeights = [spacing, spacing, spacing]
        imagesToUse.forEach((img, index) => {
          const col = index % 3
          const imgAspect = img.width / img.height
          const imgHeight = colWidth / imgAspect
          const x = spacing + col * (colWidth + spacing)
          const y = colHeights[col]
          drawImageWithBorder(ctx, img, x, y, colWidth, imgHeight)
          colHeights[col] += imgHeight + spacing
        })
      } else if (layout === 'big-small') {
        const bigSize = (canvas.width - spacing * 3) / 2
        const smallSize = (bigSize - spacing) / 2
        drawImageWithBorder(ctx, imagesToUse[0], spacing, spacing, bigSize, bigSize)
        drawImageWithBorder(ctx, imagesToUse[1], spacing * 2 + bigSize, spacing, smallSize, smallSize)
        drawImageWithBorder(ctx, imagesToUse[2], spacing * 2 + bigSize, spacing * 2 + smallSize, smallSize, smallSize)
      } else if (layout === 'small-big') {
        const bigSize = (canvas.width - spacing * 3) / 2
        const smallSize = (bigSize - spacing) / 2
        drawImageWithBorder(ctx, imagesToUse[0], spacing, spacing, smallSize, smallSize)
        drawImageWithBorder(ctx, imagesToUse[1], spacing, spacing * 2 + smallSize, smallSize, smallSize)
        drawImageWithBorder(ctx, imagesToUse[2], spacing * 2 + smallSize, spacing, bigSize, bigSize)
      } else if (layout === 'center-focus') {
        const centerSize = (canvas.width - spacing * 3) / 2
        const cornerSize = (centerSize - spacing) / 2
        drawImageWithBorder(ctx, imagesToUse[0], spacing + centerSize / 2, spacing + centerSize / 2, centerSize, centerSize)
        drawImageWithBorder(ctx, imagesToUse[1], spacing, spacing, cornerSize, cornerSize)
        drawImageWithBorder(ctx, imagesToUse[2], spacing + centerSize + spacing, spacing, cornerSize, cornerSize)
        drawImageWithBorder(ctx, imagesToUse[3], spacing, spacing + centerSize + spacing, cornerSize, cornerSize)
        drawImageWithBorder(ctx, imagesToUse[4], spacing + centerSize + spacing, spacing + centerSize + spacing, cornerSize, cornerSize)
      } else if (layout === 'split-screen') {
        const width = (canvas.width - spacing * 3) / 2
        const height = canvas.height - spacing * 2
        drawImageWithBorder(ctx, imagesToUse[0], spacing, spacing, width, height)
        drawImageWithBorder(ctx, imagesToUse[1], spacing * 2 + width, spacing, width, height)
      } else if (layout === 'triptych') {
        const width = (canvas.width - spacing * 4) / 3
        const height = canvas.height - spacing * 2
        imagesToUse.forEach((img, index) => {
          const x = spacing + index * (width + spacing)
          drawImageWithBorder(ctx, img, x, spacing, width, height)
        })
      } else if (layout === 'frame') {
        const frameWidth = canvas.width * 0.15
        const centerSize = canvas.width - frameWidth * 2 - spacing * 2
        drawImageWithBorder(ctx, imagesToUse[0], frameWidth + spacing, frameWidth + spacing, centerSize, centerSize)
        drawImageWithBorder(ctx, imagesToUse[1], spacing, spacing, frameWidth, frameWidth)
        drawImageWithBorder(ctx, imagesToUse[2], canvas.width - frameWidth - spacing, spacing, frameWidth, frameWidth)
        drawImageWithBorder(ctx, imagesToUse[3], spacing, canvas.height - frameWidth - spacing, frameWidth, frameWidth)
        drawImageWithBorder(ctx, imagesToUse[4], canvas.width - frameWidth - spacing, canvas.height - frameWidth - spacing, frameWidth, frameWidth)
      } else if (layout === 'collage-free') {
        // Auto grid layout
        const cols = Math.ceil(Math.sqrt(imagesToUse.length))
        const rows = Math.ceil(imagesToUse.length / cols)
        const cellWidth = (canvas.width - spacing * (cols + 1)) / cols
        const cellHeight = (canvas.height - spacing * (rows + 1)) / rows
        imagesToUse.forEach((img, index) => {
          const col = index % cols
          const row = Math.floor(index / cols)
          const x = spacing + col * (cellWidth + spacing)
          const y = spacing + row * (cellHeight + spacing)
          drawImageWithBorder(ctx, img, x, y, cellWidth, cellHeight)
        })
      } else {
        // Default to grid
        const cols = Math.ceil(Math.sqrt(imagesToUse.length))
        const rows = Math.ceil(imagesToUse.length / cols)
        const cellWidth = (canvas.width - spacing * (cols + 1)) / cols
        const cellHeight = (canvas.height - spacing * (rows + 1)) / rows
        imagesToUse.forEach((img, index) => {
          const col = index % cols
          const row = Math.floor(index / cols)
          const x = spacing + col * (cellWidth + spacing)
          const y = spacing + row * (cellHeight + spacing)
          drawImageWithBorder(ctx, img, x, y, cellWidth, cellHeight)
        })
      }

      setCollageCreated(true)
      setIsCreating(false)
      toast.success('Collage created!')
      
      // Save to history
      const dataUrl = canvas.toDataURL(`image/${outputFormat}`, outputFormat === 'png' ? undefined : quality)
      const historyItem: CollageHistory = {
        id: Date.now().toString(),
        dataUrl,
        layout,
        imageCount: imagesToUse.length,
        timestamp: Date.now(),
        dimensions: { width: canvas.width, height: canvas.height }
      }
      
      const updatedHistory = [historyItem, ...history].slice(0, 20)
      setHistory(updatedHistory)
      localStorage.setItem('collage-maker-history', JSON.stringify(updatedHistory))
      
      triggerPopunder()
    } catch (error) {
      console.error('Error creating collage:', error)
      setIsCreating(false)
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
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-purple-900 mb-1">Current Template</p>
                  <p className="text-xs text-purple-700">{COLLAGE_TEMPLATES.find(t => t.id === layout)?.name || layout}</p>
                  <p className="text-xs text-purple-600 mt-1">Use the template selector above to change layouts</p>
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
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-900">Choose Template</label>
                    <button
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation active:scale-95 flex items-center gap-2"
                    >
                      <Grid className="h-4 w-4" />
                      {showTemplates ? 'Hide' : 'Show'} Templates
                    </button>
                  </div>
                  
                  {showTemplates && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {COLLAGE_TEMPLATES.filter(t => images.length >= t.minImages && images.length <= t.maxImages).map((template) => {
                          const isSelected = layout === template.id
                          const canUse = images.length >= template.minImages && images.length <= template.maxImages
                          return (
                            <button
                              key={template.id}
                              onClick={() => {
                                if (canUse) {
                                  setLayout(template.id)
                                  setCollageCreated(false)
                                  setShowTemplates(false)
                                  toast.success(`Template "${template.name}" selected`)
                                }
                              }}
                              disabled={!canUse}
                              className={`p-3 rounded-lg border-2 transition-all text-left touch-manipulation active:scale-95 ${
                                isSelected
                                  ? 'border-purple-600 bg-purple-50 shadow-md'
                                  : canUse
                                  ? 'border-gray-200 bg-white hover:border-purple-400 hover:bg-purple-50'
                                  : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center justify-center mb-2 h-12 bg-gray-100 rounded">
                                <Grid className="h-6 w-6 text-gray-400" />
                              </div>
                              <p className="text-xs font-semibold text-gray-900 mb-1">{template.name}</p>
                              <p className="text-xs text-gray-500">{template.minImages}-{template.maxImages} images</p>
                            </button>
                          )
                        })}
                      </div>
                      {COLLAGE_TEMPLATES.filter(t => images.length >= t.minImages && images.length <= t.maxImages).length === 0 && (
                        <p className="text-center text-gray-500 py-4">No templates available for {images.length} image(s). Add more images to see more templates.</p>
                      )}
                    </div>
                  )}
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-purple-900">
                      Selected: <span className="font-bold">{COLLAGE_TEMPLATES.find(t => t.id === layout)?.name || layout}</span>
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                      {COLLAGE_TEMPLATES.find(t => t.id === layout)?.description || 'Template description'}
                    </p>
                  </div>
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
                    disabled={images.length === 0 || isCreating}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation active:scale-95"
                  >
                    {isCreating ? (
                      <>
                        <RotateCw className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Create Collage</span>
                      </>
                    )}
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

