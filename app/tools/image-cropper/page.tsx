'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Footer from '@/components/Footer'
import MobileBottomAd from '@/components/MobileBottomAd'
import { Upload, Download, X, Crop, Loader2, RotateCw, ZoomIn, ZoomOut, Maximize2, Lock, Unlock, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

type AspectRatio = 'free' | '1:1' | '16:9' | '4:3' | '3:2' | '9:16' | '21:9'
type CropPreset = 'custom' | 'profile' | 'cover' | 'instagram-story' | 'instagram-post' | 'facebook-cover' | 'twitter-header' | 'youtube-thumbnail'

const aspectRatios: { value: AspectRatio; label: string; ratio: number }[] = [
  { value: 'free', label: 'Free', ratio: 0 },
  { value: '1:1', label: 'Square (1:1)', ratio: 1 },
  { value: '16:9', label: 'Widescreen (16:9)', ratio: 16 / 9 },
  { value: '4:3', label: 'Standard (4:3)', ratio: 4 / 3 },
  { value: '3:2', label: 'Photo (3:2)', ratio: 3 / 2 },
  { value: '9:16', label: 'Portrait (9:16)', ratio: 9 / 16 },
  { value: '21:9', label: 'Ultrawide (21:9)', ratio: 21 / 9 },
]

const cropPresets: { value: CropPreset; label: string; width: number; height: number }[] = [
  { value: 'custom', label: 'Custom', width: 0, height: 0 },
  { value: 'profile', label: 'Profile Picture (400×400)', width: 400, height: 400 },
  { value: 'cover', label: 'Cover Photo (1500×500)', width: 1500, height: 500 },
  { value: 'instagram-story', label: 'Instagram Story (1080×1920)', width: 1080, height: 1920 },
  { value: 'instagram-post', label: 'Instagram Post (1080×1080)', width: 1080, height: 1080 },
  { value: 'facebook-cover', label: 'Facebook Cover (1640×859)', width: 1640, height: 859 },
  { value: 'twitter-header', label: 'Twitter Header (1500×500)', width: 1500, height: 500 },
  { value: 'youtube-thumbnail', label: 'YouTube Thumbnail (1280×720)', width: 1280, height: 720 },
]

export default function ImageCropper() {
  const [image, setImage] = useState<string | null>(null)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const [cropX, setCropX] = useState(0)
  const [cropY, setCropY] = useState(0)
  const [cropWidth, setCropWidth] = useState(200)
  const [cropHeight, setCropHeight] = useState(200)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 })
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('free')
  const [lockAspectRatio, setLockAspectRatio] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { triggerPopunder } = usePopunderAd()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.src = reader.result as string
        img.onload = () => {
          setImage(reader.result as string)
          setImageDimensions({ width: img.width, height: img.height })
          const initialSize = Math.min(300, Math.min(img.width, img.height) * 0.5)
          setCropWidth(initialSize)
          setCropHeight(initialSize)
          setCropX((img.width - initialSize) / 2)
          setCropY((img.height - initialSize) / 2)
          setCroppedImage(null)
          setZoom(1)
          setRotation(0)
          setAspectRatio('free')
          setLockAspectRatio(false)
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

  // Update display dimensions when image loads
  useEffect(() => {
    if (imageRef.current && image) {
      const updateDimensions = () => {
        if (imageRef.current) {
          setDisplayDimensions({
            width: imageRef.current.clientWidth,
            height: imageRef.current.clientHeight
          })
        }
      }
      updateDimensions()
      window.addEventListener('resize', updateDimensions)
      return () => window.removeEventListener('resize', updateDimensions)
    }
  }, [image])

  // Apply aspect ratio
  const applyAspectRatio = (ratio: number, currentWidth: number, currentHeight: number) => {
    if (ratio === 0) return { width: currentWidth, height: currentHeight }
    
    if (currentWidth / currentHeight > ratio) {
      return { width: currentHeight * ratio, height: currentHeight }
    } else {
      return { width: currentWidth, height: currentWidth / ratio }
    }
  }

  const handleAspectRatioChange = (newRatio: AspectRatio) => {
    setAspectRatio(newRatio)
    const ratioData = aspectRatios.find(r => r.value === newRatio)
    if (ratioData && ratioData.ratio > 0) {
      const newDimensions = applyAspectRatio(ratioData.ratio, cropWidth, cropHeight)
      setCropWidth(newDimensions.width)
      setCropHeight(newDimensions.height)
      setLockAspectRatio(true)
    } else {
      setLockAspectRatio(false)
    }
  }

  const handlePresetChange = (preset: CropPreset) => {
    const presetData = cropPresets.find(p => p.value === preset)
    if (presetData && presetData.width > 0) {
      const scale = Math.min(
        displayDimensions.width / presetData.width,
        displayDimensions.height / presetData.height,
        0.8
      )
      const scaledWidth = presetData.width * scale
      const scaledHeight = presetData.height * scale
      
      setCropWidth(scaledWidth)
      setCropHeight(scaledHeight)
      setCropX(Math.max(0, (displayDimensions.width - scaledWidth) / 2))
      setCropY(Math.max(0, (displayDimensions.height - scaledHeight) / 2))
      
      // Set aspect ratio
      const ratio = presetData.width / presetData.height
      const ratioValue = aspectRatios.find(r => Math.abs(r.ratio - ratio) < 0.01)?.value || 'free'
      setAspectRatio(ratioValue)
      setLockAspectRatio(true)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicking on crop area
    if (x >= cropX && x <= cropX + cropWidth && y >= cropY && y <= cropY + cropHeight) {
      // Check if clicking on resize handles
      const handleSize = 10
      const handles = {
        'nw': { x: cropX, y: cropY },
        'ne': { x: cropX + cropWidth, y: cropY },
        'sw': { x: cropX, y: cropY + cropHeight },
        'se': { x: cropX + cropWidth, y: cropY + cropHeight },
      }

      for (const [handle, pos] of Object.entries(handles)) {
        if (Math.abs(x - pos.x) < handleSize && Math.abs(y - pos.y) < handleSize) {
          setIsResizing(true)
          setResizeHandle(handle)
          setDragStart({ x, y })
          return
        }
      }

      // Otherwise, drag the crop area
      setIsDragging(true)
      setDragStart({ x: x - cropX, y: y - cropY })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isDragging) {
      let newX = x - dragStart.x
      let newY = y - dragStart.y
      
      // Constrain to image bounds
      newX = Math.max(0, Math.min(newX, displayDimensions.width - cropWidth))
      newY = Math.max(0, Math.min(newY, displayDimensions.height - cropHeight))
      
      setCropX(newX)
      setCropY(newY)
    } else if (isResizing && resizeHandle) {
      const ratioData = aspectRatios.find(r => r.value === aspectRatio)
      const currentRatio = ratioData?.ratio || 0
      
      let newWidth = cropWidth
      let newHeight = cropHeight
      let newX = cropX
      let newY = cropY

      switch (resizeHandle) {
        case 'se':
          newWidth = x - cropX
          newHeight = y - cropY
          break
        case 'sw':
          newWidth = (cropX + cropWidth) - x
          newHeight = y - cropY
          newX = x
          break
        case 'ne':
          newWidth = x - cropX
          newHeight = (cropY + cropHeight) - y
          newY = y
          break
        case 'nw':
          newWidth = (cropX + cropWidth) - x
          newHeight = (cropY + cropHeight) - y
          newX = x
          newY = y
          break
      }

      // Apply aspect ratio if locked
      if (lockAspectRatio && currentRatio > 0) {
        if (newWidth / newHeight > currentRatio) {
          newHeight = newWidth / currentRatio
        } else {
          newWidth = newHeight * currentRatio
        }
      }

      // Constrain to image bounds
      newWidth = Math.max(20, Math.min(newWidth, displayDimensions.width - newX))
      newHeight = Math.max(20, Math.min(newHeight, displayDimensions.height - newY))
      newX = Math.max(0, Math.min(newX, displayDimensions.width - newWidth))
      newY = Math.max(0, Math.min(newY, displayDimensions.height - newHeight))

      setCropWidth(newWidth)
      setCropHeight(newHeight)
      setCropX(newX)
      setCropY(newY)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle(null)
  }

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    if (x >= cropX && x <= cropX + cropWidth && y >= cropY && y <= cropY + cropHeight) {
      setIsDragging(true)
      setDragStart({ x: x - cropX, y: y - cropY })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    let newX = x - dragStart.x
    let newY = y - dragStart.y
    
    newX = Math.max(0, Math.min(newX, displayDimensions.width - cropWidth))
    newY = Math.max(0, Math.min(newY, displayDimensions.height - cropHeight))
    
    setCropX(newX)
    setCropY(newY)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const cropImage = () => {
    if (!image || !imageRef.current) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.src = image

    img.onload = () => {
      const scaleX = img.width / displayDimensions.width
      const scaleY = img.height / displayDimensions.height

      const actualX = cropX * scaleX
      const actualY = cropY * scaleY
      const actualWidth = cropWidth * scaleX
      const actualHeight = cropHeight * scaleY

      canvas.width = actualWidth
      canvas.height = actualHeight

      ctx.drawImage(
        img,
        actualX,
        actualY,
        actualWidth,
        actualHeight,
        0,
        0,
        actualWidth,
        actualHeight
      )

      setCroppedImage(canvas.toDataURL('image/png', 0.95))
      toast.success('Image cropped successfully!')
    }
  }

  const downloadImage = () => {
    if (!croppedImage) return

    const link = document.createElement('a')
    link.download = 'cropped-image.png'
    link.href = croppedImage
    link.click()
    
    triggerPopunder()
  }

  const reset = () => {
    setImage(null)
    setCroppedImage(null)
    setCropX(0)
    setCropY(0)
    setCropWidth(200)
    setCropHeight(200)
    setZoom(1)
    setRotation(0)
    setAspectRatio('free')
    setLockAspectRatio(false)
  }

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-6 md:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 mb-3 sm:mb-4">
              <Crop className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">Image Cropper</h1>
            <p className="text-sm sm:text-base text-gray-900">Crop images with custom dimensions and presets</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
            {!image ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                </p>
                <p className="text-xs sm:text-sm text-gray-900">or click to select a file</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Crop Your Image</h2>
                  <button
                    onClick={reset}
                    className="flex items-center space-x-2 text-gray-900 hover:text-gray-700 text-sm sm:text-base"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Quick Presets</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {cropPresets.slice(1, 5).map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => handlePresetChange(preset.value)}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg hover:bg-primary-50 hover:border-primary-500 transition-colors text-gray-900"
                      >
                        {preset.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio Selector */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-2 sm:mb-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Aspect Ratio</h3>
                    <button
                      onClick={() => setLockAspectRatio(!lockAspectRatio)}
                      className="flex items-center space-x-1 text-xs sm:text-sm text-gray-900"
                    >
                      {lockAspectRatio ? <Lock className="h-3 w-3 sm:h-4 sm:w-4" /> : <Unlock className="h-3 w-3 sm:h-4 sm:w-4" />}
                      <span>{lockAspectRatio ? 'Locked' : 'Unlocked'}</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aspectRatios.map((ratio) => (
                      <button
                        key={ratio.value}
                        onClick={() => handleAspectRatioChange(ratio.value)}
                        className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${
                          aspectRatio === ratio.value
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">Original Image</h3>
                    <div 
                      ref={containerRef}
                      className="border rounded-lg overflow-hidden relative bg-gray-100 touch-none"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <img
                        ref={imageRef}
                        src={image}
                        alt="Original"
                        className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain"
                        style={{
                          transform: `scale(${zoom}) rotate(${rotation}deg)`,
                          transformOrigin: 'center',
                        }}
                      />
                      <div
                        className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 cursor-move"
                        style={{
                          left: `${cropX}px`,
                          top: `${cropY}px`,
                          width: `${cropWidth}px`,
                          height: `${cropHeight}px`,
                        }}
                      >
                        {/* Resize handles */}
                        {['nw', 'ne', 'sw', 'se'].map((handle) => (
                          <div
                            key={handle}
                            className={`absolute w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 border-2 border-white rounded-full ${
                              handle === 'nw' ? '-top-1.5 -left-1.5 sm:-top-2 sm:-left-2' :
                              handle === 'ne' ? '-top-1.5 -right-1.5 sm:-top-2 sm:-right-2' :
                              handle === 'sw' ? '-bottom-1.5 -left-1.5 sm:-bottom-2 sm:-left-2' :
                              '-bottom-1.5 -right-1.5 sm:-bottom-2 sm:-right-2'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                        className="p-1.5 sm:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                        title="Zoom Out"
                      >
                        <ZoomOut className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900" />
                      </button>
                      <button
                        onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                        className="p-1.5 sm:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                        title="Zoom In"
                      >
                        <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900" />
                      </button>
                      <button
                        onClick={rotateImage}
                        className="p-1.5 sm:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                        title="Rotate"
                      >
                        <RotateCw className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">Cropped Preview</h3>
                    <div className="border rounded-lg overflow-hidden bg-gray-100 min-h-[200px] sm:min-h-[300px] flex items-center justify-center">
                      {croppedImage ? (
                        <img src={croppedImage} alt="Cropped" className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain" />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs sm:text-sm text-gray-400">Adjust crop area and click "Crop Image"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Manual Controls */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Manual Controls</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">
                        X Position
                      </label>
                      <input
                        type="number"
                        value={Math.round(cropX)}
                        onChange={(e) => setCropX(Math.max(0, Math.min(Number(e.target.value), displayDimensions.width - cropWidth)))}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg text-gray-900"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">
                        Y Position
                      </label>
                      <input
                        type="number"
                        value={Math.round(cropY)}
                        onChange={(e) => setCropY(Math.max(0, Math.min(Number(e.target.value), displayDimensions.height - cropHeight)))}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg text-gray-900"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">
                        Width
                      </label>
                      <input
                        type="number"
                        value={Math.round(cropWidth)}
                        onChange={(e) => {
                          const newWidth = Math.max(20, Number(e.target.value))
                          if (lockAspectRatio && aspectRatio !== 'free') {
                            const ratioData = aspectRatios.find(r => r.value === aspectRatio)
                            if (ratioData && ratioData.ratio > 0) {
                              const newHeight = newWidth / ratioData.ratio
                              setCropHeight(newHeight)
                            }
                          }
                          setCropWidth(Math.min(newWidth, displayDimensions.width - cropX))
                        }}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg text-gray-900"
                        min="20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">
                        Height
                      </label>
                      <input
                        type="number"
                        value={Math.round(cropHeight)}
                        onChange={(e) => {
                          const newHeight = Math.max(20, Number(e.target.value))
                          if (lockAspectRatio && aspectRatio !== 'free') {
                            const ratioData = aspectRatios.find(r => r.value === aspectRatio)
                            if (ratioData && ratioData.ratio > 0) {
                              const newWidth = newHeight * ratioData.ratio
                              setCropWidth(newWidth)
                            }
                          }
                          setCropHeight(Math.min(newHeight, displayDimensions.height - cropY))
                        }}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg text-gray-900"
                        min="20"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={cropImage}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <Crop className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Crop Image</span>
                  </button>
                  {croppedImage && (
                    <button
                      onClick={downloadImage}
                      className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
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

      <MobileBottomAd adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <Footer />
    </div>
  )
}
