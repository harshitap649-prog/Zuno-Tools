'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Upload, Download, X, RotateCw, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ImageRotator() {
  const [image, setImage] = useState<string | null>(null)
  const [rotatedImage, setRotatedImage] = useState<string | null>(null)
  const [rotation, setRotation] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result as string)
        setRotatedImage(null)
        setRotation(0)
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

  const rotateImage = (degrees: number) => {
    if (!image) return

    const img = new Image()
    img.src = image

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const radians = (degrees * Math.PI) / 180
      const cos = Math.abs(Math.cos(radians))
      const sin = Math.abs(Math.sin(radians))

      canvas.width = img.width * cos + img.height * sin
      canvas.height = img.width * sin + img.height * cos

      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(radians)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)

      setRotatedImage(canvas.toDataURL('image/png'))
      setRotation(degrees)
      toast.success(`Image rotated ${degrees}°`)
    }
  }

  const downloadImage = () => {
    if (!rotatedImage) return

    const link = document.createElement('a')
    link.download = `rotated-${rotation}deg.png`
    link.href = rotatedImage
    link.click()
  }

  const reset = () => {
    setImage(null)
    setRotatedImage(null)
    setRotation(0)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 mb-4">
              <RotateCw className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Image Rotator</h1>
            <p className="text-gray-600">Rotate images 90°, 180°, or 270°</p>
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
                  <h2 className="text-xl font-semibold text-gray-900">Rotate Your Image</h2>
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
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Original</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <img src={image} alt="Original" className="w-full h-auto max-h-[400px] object-contain" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Rotated</h3>
                    <div className="border rounded-lg overflow-hidden bg-gray-100 min-h-[200px] flex items-center justify-center">
                      {rotatedImage ? (
                        <img src={rotatedImage} alt="Rotated" className="w-full h-auto max-h-[400px] object-contain" />
                      ) : (
                        <p className="text-gray-400">Click a rotation button to rotate</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Rotation Options</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => rotateImage(90)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <RotateCw className="h-5 w-5" />
                      <span>90° Clockwise</span>
                    </button>
                    <button
                      onClick={() => rotateImage(180)}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <RotateCw className="h-5 w-5" />
                      <span>180°</span>
                    </button>
                    <button
                      onClick={() => rotateImage(270)}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <RotateCcw className="h-5 w-5" />
                      <span>90° Counter-clockwise</span>
                    </button>
                  </div>
                  {rotation !== 0 && (
                    <p className="text-center text-gray-600 mt-4">
                      Current rotation: {rotation}°
                    </p>
                  )}
                </div>

                {rotatedImage && (
                  <button
                    onClick={downloadImage}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download Rotated Image</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

