'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Upload, Download, X, Loader2, Minimize2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ImageCompressor() {
  const [image, setImage] = useState<string | null>(null)
  const [compressedImage, setCompressedImage] = useState<string | null>(null)
  const [quality, setQuality] = useState(0.8)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setOriginalSize(file.size)
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result as string)
        setCompressedImage(null)
        setCompressedSize(0)
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
    if (!image) return

    setLoading(true)
    try {
      const img = new Image()
      img.src = image
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        const base64Length = compressedDataUrl.length - compressedDataUrl.indexOf(',') - 1
        const compressedSizeBytes = Math.ceil(base64Length * 0.75)
        
        setCompressedImage(compressedDataUrl)
        setCompressedSize(compressedSizeBytes)
        
        const reduction = ((1 - compressedSizeBytes / originalSize) * 100).toFixed(1)
        toast.success(`Image compressed! Size reduced by ${reduction}%`)
      }
    } catch (error) {
      toast.error('Failed to compress image')
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = () => {
    if (!compressedImage) return
    
    const link = document.createElement('a')
    link.download = 'compressed-image.jpg'
    link.href = compressedImage
    link.click()
  }

  const reset = () => {
    setImage(null)
    setCompressedImage(null)
    setOriginalSize(0)
    setCompressedSize(0)
    setQuality(0.8)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 mb-3 sm:mb-4">
              <Minimize2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Image Compressor</h1>
            <p className="text-sm sm:text-base text-gray-600 px-4">Reduce image file size while maintaining quality</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
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
                <p className="text-base sm:text-lg font-medium text-gray-700 mb-2">
                  {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">or click to select a file</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Compress Your Image</h2>
                  <button
                    onClick={reset}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                  >
                    <X className="h-5 w-5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Original ({formatSize(originalSize)})
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                      <img src={image} alt="Original" className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Compressed {compressedSize > 0 && `(${formatSize(compressedSize)})`}
                    </h3>
                    <div className="border rounded-lg overflow-hidden bg-gray-100">
                      {loading ? (
                        <div className="flex items-center justify-center h-48 sm:h-64">
                          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 animate-spin" />
                        </div>
                      ) : compressedImage ? (
                        <img src={compressedImage} alt="Compressed" className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain" />
                      ) : (
                        <div className="flex items-center justify-center h-48 sm:h-64 text-gray-400 text-sm sm:text-base px-4 text-center">
                          <p>Adjust quality and click "Compress Image"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quality: {Math.round(quality * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Smaller file</span>
                      <span>Better quality</span>
                    </div>
                  </div>

                  {compressedSize > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-900">Size Reduction</span>
                        <span className="text-lg font-bold text-blue-600">
                          {((1 - compressedSize / originalSize) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      onClick={compressImage}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95 touch-manipulation"
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
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

