'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Upload, Download, X, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FaviconGenerator() {
  const [image, setImage] = useState<string | null>(null)
  const [favicons, setFavicons] = useState<{ size: number; dataUrl: string }[]>([])
  const sizes = [16, 32, 48, 64, 128, 256]

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result as string)
        setFavicons([])
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

  const generateFavicons = () => {
    if (!image) return

    const img = new Image()
    img.src = image

    img.onload = () => {
      const generated: { size: number; dataUrl: string }[] = []

      sizes.forEach(size => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = size
        canvas.height = size

        ctx.drawImage(img, 0, 0, size, size)
        generated.push({
          size,
          dataUrl: canvas.toDataURL('image/png')
        })
      })

      setFavicons(generated)
      toast.success('Favicons generated successfully!')
    }
  }

  const downloadFavicon = (size: number, dataUrl: string) => {
    const link = document.createElement('a')
    link.download = `favicon-${size}x${size}.png`
    link.href = dataUrl
    link.click()
  }

  const downloadAll = () => {
    favicons.forEach((favicon) => {
      setTimeout(() => {
        downloadFavicon(favicon.size, favicon.dataUrl)
      }, favicon.size * 10)
    })
    toast.success('Downloading all favicons...')
  }

  const reset = () => {
    setImage(null)
    setFavicons([])
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 mb-4">
              <ImageIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Favicon Generator</h1>
            <p className="text-gray-600">Generate favicons from images in multiple sizes</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            {!image ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                </p>
                <p className="text-sm text-gray-500">or click to select a file</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Generate Favicons</h2>
                  <button
                    onClick={reset}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                  >
                    <X className="h-5 w-5" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Original Image</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <img src={image} alt="Original" className="w-full h-auto max-h-[400px] object-contain" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Generated Favicons</h3>
                    {favicons.length > 0 ? (
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-3 gap-4">
                          {favicons.map((favicon) => (
                            <div key={favicon.size} className="text-center">
                              <div className="bg-white border rounded p-2 mb-2">
                                <img
                                  src={favicon.dataUrl}
                                  alt={`${favicon.size}x${favicon.size}`}
                                  className="w-full h-auto"
                                />
                              </div>
                              <p className="text-xs text-gray-600 mb-1">{favicon.size}x{favicon.size}</p>
                              <button
                                onClick={() => downloadFavicon(favicon.size, favicon.dataUrl)}
                                className="text-xs text-primary-600 hover:text-primary-700"
                              >
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-8 bg-gray-50 text-center">
                        <p className="text-gray-400">Click "Generate Favicons" to create favicons</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={generateFavicons}
                    className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <ImageIcon className="h-5 w-5" />
                    <span>Generate Favicons</span>
                  </button>
                  {favicons.length > 0 && (
                    <button
                      onClick={downloadAll}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Download className="h-5 w-5" />
                      <span>Download All</span>
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

