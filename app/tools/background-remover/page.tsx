'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Footer from '@/components/Footer'
import { Upload, Download, X, Loader2, Scissors, Palette } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

export default function BackgroundRemover() {
  const [image, setImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [modelLoading, setModelLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState<{ r: number; g: number; b: number } | null>(null)
  const [colorPickerMode, setColorPickerMode] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const modelLoadedRef = useRef(false)
  const { triggerPopunder } = usePopunderAd()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result as string)
        setProcessedImage(null)
        setSelectedColor(null)
        setColorPickerMode(false)
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
          // @ts-ignore
          const { removeBackground: removeBg } = await import('@imgly/background-removal')
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

  const removeBackground = async () => {
    if (!image) {
      toast.error('Please upload an image first')
      return
    }

    setLoading(true)
    let timeoutId: NodeJS.Timeout | null = null
    let processingTimeout: NodeJS.Timeout | null = null
    
    try {
      toast.loading('Loading AI model...', { id: 'processing' })
      
      // Dynamic import with timeout
      const importPromise = import('@imgly/background-removal')
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Model loading timeout')), 45000)
      })
      
      let removeBg: any
      try {
        const module = await Promise.race([importPromise, timeoutPromise]) as any
        removeBg = module.removeBackground || module.default?.removeBackground
        if (!removeBg) {
          throw new Error('Background removal function not found in module')
        }
      } catch (importError) {
        console.error('Import error:', importError)
        throw new Error('Failed to load background removal library. Please refresh the page and try again.')
      }
      
      if (timeoutId) clearTimeout(timeoutId)
      
      toast.loading('Processing image...', { id: 'processing' })
      
      // Convert data URL to blob
      let blob: Blob
      try {
        const response = await fetch(image)
        if (!response.ok) {
          throw new Error('Failed to fetch image')
        }
        blob = await response.blob()
      } catch (fetchError) {
        console.error('Fetch error:', fetchError)
        // Fallback: convert data URL directly to blob
        const base64Data = image.split(',')[1]
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        blob = new Blob([byteArray], { type: 'image/png' })
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
      
      // Prepare options
      const options: any = {
        outputFormat: 'image/png',
        progress: (key: string, current: number, total: number) => {
          const percentage = Math.round((current / total) * 100)
          if (percentage % 10 === 0 || percentage === 100) {
            toast.loading(`Processing: ${percentage}%`, { id: 'processing' })
          }
        }
      }
      
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
      const blobResult = await removeBg(finalBlob, options)
      
      if (processingTimeout) clearTimeout(processingTimeout)
      
      if (!blobResult) {
        throw new Error('Background removal returned no result')
      }
      
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
      toast.success('Background removed successfully!', { id: 'processing' })
    } catch (error) {
      console.error('Background removal error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      if (errorMessage.includes('timeout')) {
        toast.error('Processing took too long. Try a smaller image or refresh the page.', { id: 'processing' })
      } else if (errorMessage.includes('Failed to load')) {
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

  const downloadImage = () => {
    if (!processedImage) return
    
    const link = document.createElement('a')
    link.download = 'background-removed.png'
    link.href = processedImage
    link.click()
    
    // Trigger popunder ad after 2 seconds
    triggerPopunder()
  }

  const reset = () => {
    setImage(null)
    setProcessedImage(null)
    setSelectedColor(null)
    setColorPickerMode(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
              <Scissors className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Background Remover</h1>
            <p className="text-gray-900">Remove backgrounds from your images instantly with AI</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
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
                <p className="text-xs text-gray-400 mt-2">Supports: PNG, JPG, JPEG, WEBP</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Your Image</h2>
                  <button
                    onClick={reset}
                    className="flex items-center space-x-2 text-gray-900 hover:text-gray-900"
                  >
                    <X className="h-5 w-5" />
                    <span>Remove</span>
                  </button>
                </div>

                {/* Color Picker Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Palette className="h-4 w-4 text-blue-600" />
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
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {colorPickerMode ? 'Cancel Picker' : 'Pick Background Color'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
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

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Processed</h3>
                    <div className="border rounded-lg overflow-hidden bg-gray-100">
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

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={removeBackground}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95 touch-manipulation"
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
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

