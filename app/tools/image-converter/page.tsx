'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Footer from '@/components/Footer'
import { Upload, Download, X, Loader2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

export default function ImageConverter() {
  const [image, setImage] = useState<string | null>(null)
  const [convertedImage, setConvertedImage] = useState<string | null>(null)
  const [format, setFormat] = useState<'png' | 'jpg' | 'webp'>('png')
  const [loading, setLoading] = useState(false)
  const { triggerPopunder } = usePopunderAd()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result as string)
        setConvertedImage(null)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp']
    },
    multiple: false
  })

  const convertImage = () => {
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
        
        const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`
        const convertedDataUrl = canvas.toDataURL(mimeType, 0.95)
        
        setConvertedImage(convertedDataUrl)
        toast.success(`Image converted to ${format.toUpperCase()}!`)
      }
    } catch (error) {
      toast.error('Failed to convert image')
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = () => {
    if (!convertedImage) return
    
    const link = document.createElement('a')
    link.download = `converted-image.${format}`
    link.href = convertedImage
    link.click()
    
    // Trigger popunder ad after 2 seconds
    triggerPopunder()
  }

  const reset = () => {
    setImage(null)
    setConvertedImage(null)
    setFormat('png')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 mb-3 sm:mb-4">
              <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Image Converter</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Convert images between PNG, JPG, and WEBP formats</p>
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
                <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                </p>
                <p className="text-xs sm:text-sm text-gray-900">or click to select a file</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Convert Your Image</h2>
                  <button
                    onClick={reset}
                    className="flex items-center space-x-2 text-gray-900 hover:text-gray-900"
                  >
                    <X className="h-5 w-5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Original</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <img src={image} alt="Original" className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Converted ({format.toUpperCase()})</h3>
                    <div className="border rounded-lg overflow-hidden bg-gray-100">
                      {loading ? (
                        <div className="flex items-center justify-center h-48 sm:h-64">
                          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 animate-spin" />
                        </div>
                      ) : convertedImage ? (
                        <img src={convertedImage} alt="Converted" className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain" />
                      ) : (
                        <div className="flex items-center justify-center h-48 sm:h-64 text-gray-400 text-sm sm:text-base px-4 text-center">
                          <p>Select format and click "Convert Image"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Convert to Format
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['png', 'jpg', 'webp'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setFormat(fmt)}
                          className={`px-4 py-3 rounded-lg font-semibold transition-all touch-manipulation ${
                            format === fmt
                              ? 'bg-primary-600 text-white shadow-lg'
                              : 'bg-white text-gray-900 border-2 border-gray-300 hover:border-primary-400'
                          }`}
                        >
                          {fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      onClick={convertImage}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95 touch-manipulation"
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

                    {convertedImage && (
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

