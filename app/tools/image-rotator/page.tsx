'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import Footer from '@/components/Footer'
import SidebarAd from '@/components/SidebarAd'
import MobileBottomAd from '@/components/MobileBottomAd'
import { 
  Upload, Download, X, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, 
  Sliders, Info, Undo, Redo, Image as ImageIcon, FileImage
} from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

interface ImageState {
  dataUrl: string
  rotation: number
  flipH: boolean
  flipV: boolean
  width: number
  height: number
  fileSize: number
}

export default function ImageRotator() {
  const [image, setImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [rotation, setRotation] = useState(0)
  const [customRotation, setCustomRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number; fileSize: number; format: string } | null>(null)
  const [history, setHistory] = useState<ImageState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpg' | 'webp'>('png')
  const [jpgQuality, setJpgQuality] = useState(0.92)
  const [showInfo, setShowInfo] = useState(false)
  const { triggerPopunder } = usePopunderAd()
  const originalImageRef = useRef<HTMLImageElement | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        setImage(dataUrl)
        setProcessedImage(null)
        setRotation(0)
        setCustomRotation(0)
        setFlipH(false)
        setFlipV(false)
        setHistory([])
        setHistoryIndex(-1)
        
        // Get image info
        const img = new Image()
        img.onload = () => {
          setImageInfo({
            width: img.width,
            height: img.height,
            fileSize: file.size,
            format: file.type || 'image/png'
          })
          originalImageRef.current = img
        }
        img.src = dataUrl
        toast.success('Image loaded successfully!')
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

  const applyTransformations = useCallback((rot: number, flipHorizontal: boolean, flipVertical: boolean) => {
    if (!image) return

    const img = new Image()
    img.src = image

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const radians = (rot * Math.PI) / 180
      const cos = Math.abs(Math.cos(radians))
      const sin = Math.abs(Math.sin(radians))

      canvas.width = img.width * cos + img.height * sin
      canvas.height = img.width * sin + img.height * cos

      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(radians)

      // Apply flips
      if (flipHorizontal) {
        ctx.scale(-1, 1)
      }
      if (flipVertical) {
        ctx.scale(1, -1)
      }

      ctx.drawImage(img, -img.width / 2, -img.height / 2)

      // Save to history
      const newState: ImageState = {
        dataUrl: canvas.toDataURL('image/png'),
        rotation: rot,
        flipH: flipHorizontal,
        flipV: flipVertical,
        width: canvas.width,
        height: canvas.height,
        fileSize: 0
      }

      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1)
        newHistory.push(newState)
        return newHistory.slice(-20) // Keep last 20 states
      })
      setHistoryIndex(prev => Math.min(prev + 1, 19))

      setProcessedImage(canvas.toDataURL('image/png'))
    }
  }, [image, historyIndex])

  const rotateImage = (degrees: number) => {
    const newRotation = (rotation + degrees) % 360
    setRotation(newRotation)
    setCustomRotation(newRotation)
    applyTransformations(newRotation, flipH, flipV)
    toast.success(`Rotated ${degrees > 0 ? degrees : Math.abs(degrees)}° ${degrees > 0 ? 'clockwise' : 'counter-clockwise'}`)
  }

  const setCustomAngle = (angle: number) => {
    setCustomRotation(angle)
    setRotation(angle)
    applyTransformations(angle, flipH, flipV)
  }

  const flipHorizontal = () => {
    const newFlipH = !flipH
    setFlipH(newFlipH)
    applyTransformations(rotation, newFlipH, flipV)
    toast.success(newFlipH ? 'Flipped horizontally' : 'Unflipped horizontally')
  }

  const flipVertical = () => {
    const newFlipV = !flipV
    setFlipV(newFlipV)
    applyTransformations(rotation, flipH, newFlipV)
    toast.success(newFlipV ? 'Flipped vertically' : 'Unflipped vertically')
  }

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      const state = history[newIndex]
      setHistoryIndex(newIndex)
      setProcessedImage(state.dataUrl)
      setRotation(state.rotation)
      setCustomRotation(state.rotation)
      setFlipH(state.flipH)
      setFlipV(state.flipV)
      toast.success('Undone')
    } else {
      toast.error('Nothing to undo')
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      const state = history[newIndex]
      setHistoryIndex(newIndex)
      setProcessedImage(state.dataUrl)
      setRotation(state.rotation)
      setCustomRotation(state.rotation)
      setFlipH(state.flipH)
      setFlipV(state.flipV)
      toast.success('Redone')
    } else {
      toast.error('Nothing to redo')
    }
  }

  // Apply transformations when custom rotation changes via slider
  useEffect(() => {
    if (image && customRotation !== rotation) {
      const timeoutId = setTimeout(() => {
        applyTransformations(customRotation, flipH, flipV)
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [customRotation, image, flipH, flipV, rotation, applyTransformations])

  const downloadImage = () => {
    if (!processedImage) return

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(img, 0, 0)

      let mimeType = 'image/png'
      let quality = 1
      let extension = 'png'

      if (outputFormat === 'jpg') {
        mimeType = 'image/jpeg'
        quality = jpgQuality
        extension = 'jpg'
      } else if (outputFormat === 'webp') {
        mimeType = 'image/webp'
        quality = jpgQuality
        extension = 'webp'
      }

      const dataUrl = canvas.toDataURL(mimeType, quality)
    const link = document.createElement('a')
      link.download = `rotated-image.${extension}`
      link.href = dataUrl
    link.click()
    
      toast.success(`Image downloaded as ${extension.toUpperCase()}!`)
    triggerPopunder()
    }
    img.src = processedImage
  }

  const reset = () => {
    setImage(null)
    setProcessedImage(null)
    setRotation(0)
    setCustomRotation(0)
    setFlipH(false)
    setFlipV(false)
    setHistory([])
    setHistoryIndex(-1)
    setImageInfo(null)
    toast.success('Reset')
  }

  const currentRotation = rotation || customRotation

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SidebarAd position="left" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <SidebarAd position="right" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <main className="flex-grow py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-4 sm:mb-6 md:mb-8">
            <div className="relative inline-flex items-center justify-center mb-3 sm:mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
              <div className="relative inline-flex p-2 sm:p-3 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 shadow-lg">
                <RotateCw className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">
              Image Rotator
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 px-4">Rotate, flip, and transform your images with precision</p>
          </div>

          <div className="bg-gradient-to-br from-white via-blue-50/20 to-cyan-50/20 rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8">
            {!image ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50 scale-105'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">or click to select a file</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Header with actions */}
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Transform Your Image</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowInfo(!showInfo)}
                      className={`px-3 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
                        showInfo 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Info className="h-4 w-4" />
                      <span className="hidden sm:inline">Info</span>
                    </button>
                  <button
                    onClick={reset}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg font-medium text-xs sm:text-sm hover:bg-red-600 transition-colors flex items-center gap-1.5"
                  >
                      <X className="h-4 w-4" />
                      <span className="hidden sm:inline">Reset</span>
                  </button>
                  </div>
                </div>

                {/* Image Info */}
                {showInfo && imageInfo && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-blue-600" />
                      Image Information
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Width</div>
                        <div className="text-sm font-bold text-gray-900">{imageInfo.width}px</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Height</div>
                        <div className="text-sm font-bold text-gray-900">{imageInfo.height}px</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">File Size</div>
                        <div className="text-sm font-bold text-gray-900">
                          {(imageInfo.fileSize / 1024).toFixed(1)} KB
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Format</div>
                        <div className="text-sm font-bold text-gray-900">{imageInfo.format.split('/')[1]?.toUpperCase() || 'PNG'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <FileImage className="h-4 w-4" />
                      Original
                    </h3>
                    <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                      <img src={image} alt="Original" className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain mx-auto" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <RotateCw className="h-4 w-4" />
                      Preview
                    </h3>
                    <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-100 min-h-[200px] sm:min-h-[300px] flex items-center justify-center">
                      {processedImage ? (
                        <img src={processedImage} alt="Processed" className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain mx-auto" />
                      ) : (
                        <p className="text-gray-400 text-sm sm:text-base">Apply transformations to see preview</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Custom Rotation Slider */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 sm:p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Sliders className="h-5 w-5 text-blue-600" />
                      Custom Rotation
                    </h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="-360"
                        max="360"
                        value={customRotation}
                        onChange={(e) => setCustomAngle(Number(e.target.value))}
                        className="w-20 sm:w-24 px-2 py-1.5 border-2 border-gray-300 rounded-lg text-sm font-mono text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="text-sm font-semibold text-gray-700">°</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-360"
                    max="360"
                    value={customRotation}
                    onChange={(e) => setCustomAngle(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>-360°</span>
                    <span>0°</span>
                    <span>360°</span>
                  </div>
                </div>

                {/* Quick Rotation Buttons */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 sm:p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3 sm:mb-4">Quick Rotations</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                    <button
                      onClick={() => rotateImage(-45)}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 sm:px-4 py-2.5 rounded-lg font-semibold text-xs sm:text-sm hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 touch-manipulation min-h-[44px]"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>-45°</span>
                    </button>
                    <button
                      onClick={() => rotateImage(90)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 sm:px-4 py-2.5 rounded-lg font-semibold text-xs sm:text-sm hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 touch-manipulation min-h-[44px]"
                    >
                      <RotateCw className="h-4 w-4" />
                      <span>90°</span>
                    </button>
                    <button
                      onClick={() => rotateImage(180)}
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-3 sm:px-4 py-2.5 rounded-lg font-semibold text-xs sm:text-sm hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 touch-manipulation min-h-[44px]"
                    >
                      <RotateCw className="h-4 w-4" />
                      <span>180°</span>
                    </button>
                    <button
                      onClick={() => rotateImage(270)}
                      className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-3 sm:px-4 py-2.5 rounded-lg font-semibold text-xs sm:text-sm hover:from-cyan-600 hover:to-cyan-700 transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 touch-manipulation min-h-[44px]"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>270°</span>
                    </button>
                    <button
                      onClick={() => rotateImage(45)}
                      className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-3 sm:px-4 py-2.5 rounded-lg font-semibold text-xs sm:text-sm hover:from-pink-600 hover:to-pink-700 transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 touch-manipulation min-h-[44px]"
                    >
                      <RotateCw className="h-4 w-4" />
                      <span>+45°</span>
                    </button>
                  </div>
                </div>

                {/* Flip Options */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 sm:p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3 sm:mb-4">Flip Options</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={flipHorizontal}
                      className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 touch-manipulation min-h-[48px] ${
                        flipH
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                          : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 hover:from-gray-300 hover:to-gray-400'
                      }`}
                    >
                      <FlipHorizontal className="h-5 w-5" />
                      <span>Flip Horizontal {flipH && '✓'}</span>
                    </button>
                    <button
                      onClick={flipVertical}
                      className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 touch-manipulation min-h-[48px] ${
                        flipV
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                          : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 hover:from-gray-300 hover:to-gray-400'
                      }`}
                    >
                      <FlipVertical className="h-5 w-5" />
                      <span>Flip Vertical {flipV && '✓'}</span>
                    </button>
                  </div>
                </div>

                {/* Undo/Redo */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 sm:p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3 sm:mb-4">History</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={undo}
                      disabled={historyIndex <= 0}
                      className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 touch-manipulation min-h-[48px] ${
                        historyIndex <= 0
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                      }`}
                    >
                      <Undo className="h-5 w-5" />
                      <span>Undo</span>
                    </button>
                    <button
                      onClick={redo}
                      disabled={historyIndex >= history.length - 1}
                      className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 touch-manipulation min-h-[48px] ${
                        historyIndex >= history.length - 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                      }`}
                    >
                      <Redo className="h-5 w-5" />
                      <span>Redo</span>
                    </button>
                  </div>
                </div>

                {/* Export Options */}
                {processedImage && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                    <h3 className="font-bold text-gray-900 mb-3 sm:mb-4">Export Options</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Output Format</label>
                        <select
                          value={outputFormat}
                          onChange={(e) => setOutputFormat(e.target.value as 'png' | 'jpg' | 'webp')}
                          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-sm"
                        >
                          <option value="png">PNG (Lossless)</option>
                          <option value="jpg">JPG (Compressed)</option>
                          <option value="webp">WebP (Modern)</option>
                        </select>
                      </div>
                      {(outputFormat === 'jpg' || outputFormat === 'webp') && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Quality: {Math.round(jpgQuality * 100)}%
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.01"
                            value={jpgQuality}
                            onChange={(e) => setJpgQuality(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                          <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>Low (10%)</span>
                            <span>High (100%)</span>
                          </div>
                        </div>
                      )}
                  <button
                    onClick={downloadImage}
                        className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white px-6 py-3.5 rounded-lg font-bold text-sm sm:text-base hover:shadow-xl transition-all flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 active:scale-95 touch-manipulation min-h-[48px]"
                  >
                    <Download className="h-5 w-5" />
                        <span>Download {outputFormat.toUpperCase()} Image</span>
                  </button>
                    </div>
                  </div>
                )}

                {/* Current Status */}
                {(currentRotation !== 0 || flipH || flipV) && (
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4 border border-gray-300">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900">
                        Current: {currentRotation}° rotation
                        {flipH && ' • Horizontal flip'}
                        {flipV && ' • Vertical flip'}
                      </p>
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
