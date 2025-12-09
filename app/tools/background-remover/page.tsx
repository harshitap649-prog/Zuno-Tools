'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'
import { Upload, Download, X, Loader2, Scissors, Palette, Share2, Copy, History, Settings, Trash2, Maximize2, Image as ImageIcon, FileText, BarChart3, RotateCw, ZoomIn, ZoomOut, Check, RefreshCw, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

// Dynamically import ad components to avoid SSR issues
const SidebarAd = dynamic(() => import('@/components/SidebarAd'), { ssr: false })
const MobileBottomAd = dynamic(() => import('@/components/MobileBottomAd'), { ssr: false })

interface ProcessedImage {
  id: string
  original: string
  processed: string
  originalSize: number
  processedSize: number
  timestamp: number
  dimensions: { width: number; height: number }
}

const IMG_LY_PUBLIC_PATH = 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/'

const loadRemoveBg = async () => {
  const module = await import('@imgly/background-removal')
  const removeBg = (module as any).removeBackground || (module as any).default
  if (typeof removeBg !== 'function') {
    throw new Error('Background removal function not found in module')
  }
  return removeBg as (image: Blob, config?: any) => Promise<Blob>
}

export default function BackgroundRemover() {
  const [image, setImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [modelLoading, setModelLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState<{ r: number; g: number; b: number } | null>(null)
  const [colorPickerMode, setColorPickerMode] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<ProcessedImage[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState<string>('transparent')
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpg' | 'webp'>('png')
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'split' | 'overlay'>('side-by-side')
  const [zoom, setZoom] = useState(1)
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null)
  const [processedDimensions, setProcessedDimensions] = useState<{ width: number; height: number } | null>(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [processedSize, setProcessedSize] = useState(0)
  const [copied, setCopied] = useState(false)
  const [showStats, setShowStats] = useState(true)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const modelLoadedRef = useRef(false)
  const { triggerPopunder } = usePopunderAd()

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('background-remover-history')
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
        setProcessedImage(null)
        setSelectedColor(null)
        setColorPickerMode(false)
          setZoom(1)
          setProcessedSize(0)
          setProcessedDimensions(null)
        }
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleImageClick = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    if (!colorPickerMode || !image) return
    
    const img = e.currentTarget
    const rect = img.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Get the actual image dimensions
    const imgElement = new Image()
    imgElement.src = image
    
    imgElement.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      canvas.width = imgElement.width
      canvas.height = imgElement.height
      ctx.drawImage(imgElement, 0, 0)
      
      // Calculate the actual pixel position
      const scaleX = imgElement.width / rect.width
      const scaleY = imgElement.height / rect.height
      const pixelX = Math.floor(x * scaleX)
      const pixelY = Math.floor(y * scaleY)
      
      // Get the color at that pixel
      const imageData = ctx.getImageData(pixelX, pixelY, 1, 1)
      const pixelData = imageData.data
      const r = pixelData[0]
      const g = pixelData[1]
      const b = pixelData[2]
      
      setSelectedColor({ r, g, b })
      setColorPickerMode(false)
      toast.success(`Background color selected: RGB(${r}, ${g}, ${b})`, { duration: 2000 })
    }
  }, [colorPickerMode, image])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: false
  })

  // Preload model when image is selected
  useEffect(() => {
    if (image && !modelLoadedRef.current && !modelLoading) {
      const preloadModel = async () => {
        setModelLoading(true)
        try {
          const removeBg = await loadRemoveBg()
          // Preload with a tiny test image
          const testCanvas = document.createElement('canvas')
          testCanvas.width = 10
          testCanvas.height = 10
          const testBlob = await new Promise<Blob | null>(resolve => testCanvas.toBlob(resolve))
          if (testBlob) {
            await removeBg(testBlob, {})
            modelLoadedRef.current = true
          }
        } catch (error) {
          console.log('Model preload failed, will load on demand:', error)
        } finally {
          setModelLoading(false)
        }
      }
      preloadModel()
    }
  }, [image, modelLoading])

  const buildOptions = (forcedFormat?: 'image/png') => {
    return {
      publicPath: IMG_LY_PUBLIC_PATH,
      output: {
        format: forcedFormat || 'image/png',
        quality: 0.92
      },
      device: 'cpu',
      debug: false,
      progress: (key: string, current: number, total: number) => {
        try {
          const percentage = Math.round((current / total) * 100)
          if (percentage % 10 === 0 || percentage === 100) {
            toast.loading(`Processing: ${percentage}%`, { id: 'processing' })
          }
        } catch (progressError) {
          console.warn('Progress update error:', progressError)
        }
      }
    }
  }

  const removeBackground = async () => {
    if (!image) {
      toast.error('Please upload an image first')
      return
    }

    // Validate image format
    if (!image.startsWith('data:image/') && !image.startsWith('http://') && !image.startsWith('https://')) {
      toast.error('Invalid image format. Please upload a valid image file.')
      return
    }

    setLoading(true)
    let timeoutId: NodeJS.Timeout | null = null
    let processingTimeout: NodeJS.Timeout | null = null
    
    try {
      toast.loading('Loading AI model...', { id: 'processing' })
      
      // Dynamic import with timeout
      const importPromise = loadRemoveBg()
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Model loading timeout')), 45000)
      })
      
      let removeBg: any
      try {
        removeBg = await Promise.race([importPromise, timeoutPromise])
      } catch (importError) {
        console.error('Import error:', importError)
        throw new Error('Failed to load background removal library. Please refresh the page and try again.')
      }
      
      if (timeoutId) clearTimeout(timeoutId)
      
      toast.loading('Processing image...', { id: 'processing' })
      
      // Convert data URL to blob
      let blob: Blob
      try {
        // Check if image is a data URL
        if (image.startsWith('data:')) {
          // Convert data URL directly to blob
          const base64Data = image.split(',')[1]
          if (!base64Data) {
            throw new Error('Invalid image data URL')
          }
          const byteCharacters = atob(base64Data)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          // Determine MIME type from data URL
          const mimeMatch = image.match(/data:([^;]+);/)
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/png'
          blob = new Blob([byteArray], { type: mimeType })
        } else {
          // Try to fetch if it's a URL
        const response = await fetch(image)
        if (!response.ok) {
          throw new Error('Failed to fetch image')
        }
        blob = await response.blob()
        }
      } catch (fetchError) {
        console.error('Fetch error:', fetchError)
        // Final fallback: convert data URL directly to blob
        if (image.includes(',')) {
        const base64Data = image.split(',')[1]
          if (base64Data) {
            try {
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        blob = new Blob([byteArray], { type: 'image/png' })
            } catch (e) {
              throw new Error('Failed to process image data. Please try uploading the image again.')
            }
          } else {
            throw new Error('Invalid image format. Please try uploading the image again.')
          }
        } else {
          throw new Error('Failed to load image. Please try uploading the image again.')
        }
      }
      
      if (!blob || blob.size === 0) {
        throw new Error('Invalid image file. Please try uploading a different image.')
      }
      
      // Limit image size for performance
      const maxSize = 1500
      let processBlob = blob
      
      if (blob.size > 2 * 1024 * 1024) { // If larger than 2MB
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = image
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          setTimeout(() => reject(new Error('Image load timeout')), 10000)
        })
        
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (ctx && (img.width > maxSize || img.height > maxSize)) {
          const scale = Math.min(maxSize / img.width, maxSize / img.height)
          canvas.width = img.width * scale
          canvas.height = img.height * scale
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          const resizedBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png', 0.95))
          if (resizedBlob) {
            processBlob = resizedBlob
          }
        }
      }
      
      // Remove background using the library
      processingTimeout = setTimeout(() => {
        toast.loading('Processing takes longer for high-quality images...', { id: 'processing' })
      }, 5000)
      
      // Prepare options (always process to PNG, convert later on download)
      const options = buildOptions('image/png')
     
      // If user selected a background color, we'll use it as a hint
      let finalBlob = processBlob
      if (selectedColor) {
        // Pre-process image to enhance background removal based on selected color
        const img = new Image()
        img.crossOrigin = 'anonymous'
        const objectUrl = URL.createObjectURL(processBlob)
        img.src = objectUrl
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          setTimeout(() => reject(new Error('Image load timeout')), 10000)
        })
        
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (ctx) {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data
          
          // Enhance areas similar to selected color (this helps the AI)
          const threshold = 60
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            const dist = Math.abs(r - selectedColor.r) + Math.abs(g - selectedColor.g) + Math.abs(b - selectedColor.b)
            
            if (dist < threshold) {
              // Make similar colors more uniform to help AI detection
              data[i] = selectedColor.r
              data[i + 1] = selectedColor.g
              data[i + 2] = selectedColor.b
            }
          }
          
          ctx.putImageData(imageData, 0, 0)
          const processedBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png', 0.95))
          if (processedBlob) {
            finalBlob = processedBlob
          }
        }
        URL.revokeObjectURL(objectUrl)
      }
      
      // Call the background removal function
      let blobResult: Blob
      try {
        const result = await removeBg(finalBlob, options)
        
        if (!result) {
          throw new Error('Background removal returned no result')
        }
        
        // Ensure result is a Blob
        if (result instanceof Blob) {
          blobResult = result
        } else if (result && typeof result === 'object' && 'blob' in result) {
          blobResult = (result as any).blob
        } else {
          throw new Error('Invalid result format from background removal')
        }
      } catch (bgError: any) {
        if (processingTimeout) clearTimeout(processingTimeout)
        console.error('Background removal library error:', bgError)
        
        // Check if it's a specific error we can handle
        if (bgError && typeof bgError === 'object' && bgError.message) {
          throw new Error(String(bgError.message))
        } else if (typeof bgError === 'string') {
          throw new Error(bgError)
        } else {
          throw new Error('Background removal failed. Please try again with a different image.')
        }
      }
      
      if (processingTimeout) clearTimeout(processingTimeout)
      
      // Convert blob to data URL
      const reader = new FileReader()
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          if (reader.result) {
            resolve(reader.result as string)
          } else {
            reject(new Error('Failed to read blob result'))
          }
        }
        reader.onerror = () => reject(new Error('FileReader error'))
        reader.readAsDataURL(blobResult)
      })
      
      setProcessedImage(dataUrl)
      
      // Calculate processed image size and dimensions
      const img = new Image()
      img.src = dataUrl
      await new Promise((resolve) => {
        img.onload = () => {
          setProcessedDimensions({ width: img.width, height: img.height })
          // Estimate size from data URL
          const base64Length = dataUrl.length - dataUrl.indexOf(',') - 1
          const sizeBytes = Math.ceil(base64Length * 0.75)
          setProcessedSize(sizeBytes)
          
          // Save to history
          const historyItem: ProcessedImage = {
            id: Date.now().toString(),
            original: image!,
            processed: dataUrl,
            originalSize,
            processedSize: sizeBytes,
            timestamp: Date.now(),
            dimensions: { width: img.width, height: img.height }
          }
          
          const updatedHistory = [historyItem, ...history].slice(0, 20)
          setHistory(updatedHistory)
          localStorage.setItem('background-remover-history', JSON.stringify(updatedHistory))
          
          resolve(null)
        }
      })
      
      toast.success('Background removed successfully!', { id: 'processing' })
      
      // Trigger popunder after processing
      setTimeout(() => {
        triggerPopunder()
      }, 2000)
    } catch (error) {
      console.error('Background removal error:', error)
      
      // Safely extract error message
      let errorMessage = 'Unknown error'
      try {
        if (error instanceof Error) {
          errorMessage = error.message || String(error)
        } else if (typeof error === 'string') {
          errorMessage = error
        } else if (error && typeof error === 'object' && 'message' in error) {
          errorMessage = String((error as any).message || error)
        } else {
          errorMessage = String(error)
        }
      } catch (e) {
        errorMessage = 'An unexpected error occurred'
      }
      
      // Ensure errorMessage is a string and safe to use
      if (typeof errorMessage !== 'string') {
        errorMessage = 'An unexpected error occurred'
      }
      
      if (errorMessage.includes('timeout') || errorMessage.toLowerCase().includes('timeout')) {
        toast.error('Processing took too long. Try a smaller image or refresh the page.', { id: 'processing' })
      } else if (errorMessage.includes('Failed to load') || errorMessage.includes('load')) {
        toast.error('Failed to load AI model. Please refresh the page and try again.', { id: 'processing' })
      } else {
        toast.error(`Failed to remove background: ${errorMessage}. Please try again.`, { id: 'processing' })
      }
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
      if (processingTimeout) clearTimeout(processingTimeout)
      setLoading(false)
    }
  }

  const downloadImage = (processedImg?: string, filename?: string) => {
    const imgToDownload = processedImg || processedImage
    if (!imgToDownload) return
    
    // Convert to desired format if needed
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imgToDownload
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        toast.error('Failed to prepare download')
        return
      }
      
      canvas.width = img.width
      canvas.height = img.height
      
      // Fill background if not transparent
      if (backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      
      ctx.drawImage(img, 0, 0)
      
      // Convert to desired format
      let mimeType = 'image/png'
      let ext = 'png'
      if (outputFormat === 'jpg') {
        mimeType = 'image/jpeg'
        ext = 'jpg'
      } else if (outputFormat === 'webp') {
        mimeType = 'image/webp'
        ext = 'webp'
      }
      
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Failed to create image file')
          return
        }
        
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = filename || `background-removed.${ext}`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
        toast.success('Image downloaded!')
      }, mimeType, outputFormat === 'jpg' ? 0.95 : undefined)
    }
  }

  const downloadMask = async () => {
    if (!processedImage) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = processedImage
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        // Use alpha as mask channel
        const alpha = data[i + 3]
        data[i] = alpha
        data[i + 1] = alpha
        data[i + 2] = alpha
        data[i + 3] = 255
      }
      ctx.putImageData(imageData, 0, 0)
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'background-mask.png'
        link.click()
        URL.revokeObjectURL(url)
        toast.success('Mask downloaded!')
      }, 'image/png', 1)
    }
  }

  const shareImage = async () => {
    if (!processedImage) return
    
    try {
      const response = await fetch(processedImage)
      const blob = await response.blob()
      const file = new File([blob], `background-removed.${outputFormat}`, { type: blob.type })
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Background Removed Image',
          text: 'Check out this image with background removed!'
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
    if (!processedImage) return
    
    try {
      const response = await fetch(processedImage)
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

  const loadHistoryItem = (item: ProcessedImage) => {
    setImage(item.original)
    setProcessedImage(item.processed)
    setOriginalSize(item.originalSize)
    setProcessedSize(item.processedSize)
    setProcessedDimensions(item.dimensions)
    setShowHistory(false)
    toast.success('History item loaded!')
  }

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(item => item.id !== id)
    setHistory(updated)
    localStorage.setItem('background-remover-history', JSON.stringify(updated))
    toast.success('History item deleted!')
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('background-remover-history')
    toast.success('History cleared!')
  }

  const reset = () => {
    setImage(null)
    setProcessedImage(null)
    setSelectedColor(null)
    setColorPickerMode(false)
    setZoom(1)
    setOriginalSize(0)
    setProcessedSize(0)
    setOriginalDimensions(null)
    setProcessedDimensions(null)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      <SidebarAd position="right" adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-pink-500 to-pink-400 mb-3 sm:mb-4 shadow-lg">
              <Scissors className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">Background Remover</h1>
            <p className="text-sm sm:text-base text-gray-900">Remove backgrounds from your images instantly with AI</p>
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
                    {(['png', 'jpg', 'webp'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setOutputFormat(fmt)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs sm:text-sm touch-manipulation active:scale-95 ${
                          outputFormat === fmt
                            ? 'bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-md'
                            : 'bg-gray-100 text-gray-900 hover:bg-pink-50 hover:border-pink-100'
                        }`}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Background Color (for non-transparent formats)</label>
                  <div className="flex flex-wrap gap-2 items-center">
                    <input
                      type="color"
                      value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-12 h-12 rounded border-2 border-gray-300 cursor-pointer"
                      disabled={outputFormat === 'png'}
                    />
                    <button
                      onClick={() => setBackgroundColor('transparent')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs sm:text-sm touch-manipulation active:scale-95 ${
                        backgroundColor === 'transparent'
                          ? 'bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-md'
                          : 'bg-gray-100 text-gray-900 hover:bg-pink-50 hover:border-pink-100'
                      }`}
                      disabled={outputFormat !== 'png'}
                    >
                      Transparent
                    </button>
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      placeholder="#ffffff"
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 w-24"
                      disabled={outputFormat === 'png'}
                    />
                  </div>
                  {outputFormat === 'png' && (
                    <p className="text-xs text-gray-500 mt-1">PNG format always uses transparent background</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Comparison Mode</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setComparisonMode('side-by-side')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs sm:text-sm touch-manipulation active:scale-95 ${
                        comparisonMode === 'side-by-side'
                          ? 'bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-md'
                          : 'bg-gray-100 text-gray-900 hover:bg-pink-50 hover:border-pink-100'
                      }`}
                    >
                      Side by Side
                    </button>
                    <button
                      onClick={() => setComparisonMode('split')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs sm:text-sm touch-manipulation active:scale-95 ${
                        comparisonMode === 'split'
                          ? 'bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-md'
                          : 'bg-gray-100 text-gray-900 hover:bg-pink-50 hover:border-pink-100'
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
                        <img src={item.processed} alt="Processed" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded bg-gray-100" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">{formatDate(item.timestamp)}</p>
                          <p className="text-xs sm:text-sm text-gray-900 font-medium">
                            {formatSize(item.originalSize)} → {formatSize(item.processedSize)}
                          </p>
                          <p className="text-xs text-gray-600">
                            {item.dimensions.width} × {item.dimensions.height}px
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-2">
                          <button
                            onClick={() => loadHistoryItem(item)}
                            className="p-1.5 sm:p-2 bg-pink-50 hover:bg-pink-100 text-pink-500 rounded-lg transition-colors touch-manipulation active:scale-95"
                            title="Load"
                          >
                            <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                          <button
                            onClick={() => downloadImage(item.processed, `background-removed-${item.id}.${outputFormat}`)}
                            className="p-1.5 sm:p-2 bg-pink-50 hover:bg-pink-100 text-pink-500 rounded-lg transition-colors touch-manipulation active:scale-95"
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
                    ? 'border-pink-300 bg-pink-50'
                    : 'border-gray-300 hover:border-pink-300 hover:bg-pink-50 active:bg-pink-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                </p>
                <p className="text-xs sm:text-sm text-gray-900">or click to select a file</p>
                <p className="text-xs text-gray-400 mt-2">Supports: PNG, JPG, JPEG, WEBP</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Statistics */}
                {showStats && (originalSize > 0 || processedSize > 0) && (
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500" />
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900">Image Information</h4>
                  <button
                        onClick={() => setShowStats(false)}
                        className="ml-auto text-gray-400 hover:text-gray-600"
                  >
                        <X className="h-4 w-4" />
                  </button>
                </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {originalSize > 0 && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Original Size</p>
                          <p className="text-sm sm:text-base font-bold text-gray-900">{formatSize(originalSize)}</p>
                        </div>
                      )}
                      {originalDimensions && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Dimensions</p>
                          <p className="text-sm sm:text-base font-bold text-gray-900">
                            {originalDimensions.width} × {originalDimensions.height}px
                          </p>
                        </div>
                      )}
                      {processedSize > 0 && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Processed Size</p>
                          <p className="text-sm sm:text-base font-bold text-pink-500">{formatSize(processedSize)}</p>
                        </div>
                      )}
                      {processedDimensions && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Processed</p>
                          <p className="text-sm sm:text-base font-bold text-pink-500">
                            {processedDimensions.width} × {processedDimensions.height}px
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Color Picker Section */}
                <div className="bg-pink-50 border border-pink-100 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Palette className="h-4 w-4 text-pink-500" />
                        <span className="text-sm font-medium text-gray-900">Background Color Selector</span>
                      </div>
                      <p className="text-xs text-gray-900">
                        {colorPickerMode 
                          ? "Click on the background color in the image to help AI identify what to remove"
                          : "Select the background color to improve removal accuracy (optional)"}
                      </p>
                      {selectedColor && (
                        <div className="mt-2 flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded border-2 border-gray-300"
                            style={{ backgroundColor: `rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})` }}
                          />
                          <span className="text-xs text-gray-900">
                            Selected: RGB({selectedColor.r}, {selectedColor.g}, {selectedColor.b})
                          </span>
                          <button
                            onClick={() => setSelectedColor(null)}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setColorPickerMode(!colorPickerMode)
                        if (colorPickerMode) {
                          toast.success('Color picker disabled', { duration: 2000 })
                        } else {
                          toast.success('Click on the background color in the image', { duration: 3000 })
                        }
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        colorPickerMode
                          ? 'bg-gradient-to-r from-pink-500 to-pink-400 text-white hover:from-pink-500 hover:to-pink-400 shadow-md'
                          : 'bg-white text-pink-500 border border-pink-100 hover:bg-pink-50'
                      }`}
                    >
                      {colorPickerMode ? 'Cancel Picker' : 'Pick Background Color'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex flex-col">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Original</h3>
                    <div className="border rounded-lg overflow-hidden relative">
                      <img 
                        ref={imageRef}
                        src={image} 
                        alt="Original" 
                        onClick={handleImageClick}
                        className={`w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain ${
                          colorPickerMode ? 'cursor-crosshair' : 'cursor-default'
                        }`}
                      />
                      {colorPickerMode && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 pointer-events-none">
                          <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
                            <p className="text-sm font-medium text-gray-900">Click on background color</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Processed</h3>
                    <div
                      className="border rounded-lg overflow-hidden"
                      style={{ backgroundColor: backgroundColor === 'transparent' ? '#f3f4f6' : backgroundColor }}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center h-48 sm:h-64">
                          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 animate-spin" />
                        </div>
                      ) : processedImage ? (
                        <img src={processedImage} alt="Processed" className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain" />
                      ) : (
                        <div className="flex items-center justify-center h-48 sm:h-64 text-gray-400 text-sm sm:text-base px-4 text-center">
                          <p>Click "Remove Background" to process</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={removeBackground}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-pink-400 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95 touch-manipulation shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Scissors className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Remove Background</span>
                      </>
                    )}
                  </button>

                  {processedImage && (
                    <>
                    <button
                        onClick={() => downloadImage(undefined, undefined)}
                        className="px-4 sm:px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-500 hover:to-pink-400 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base flex items-center justify-center gap-2 active:scale-95 touch-manipulation shadow-md"
                    >
                      <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                      <button
                        onClick={shareImage}
                        className="px-4 sm:px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-500 hover:to-pink-400 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base flex items-center justify-center gap-2 active:scale-95 touch-manipulation shadow-md"
                      >
                        <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">Share</span>
                      </button>
                      <button
                        onClick={copyImageToClipboard}
                        className="px-4 sm:px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-500 hover:to-pink-400 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base flex items-center justify-center gap-2 active:scale-95 touch-manipulation shadow-md"
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
            )}
          </div>
        </div>
      </main>

      <MobileBottomAd adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      <Footer />
    </div>
  )
}

