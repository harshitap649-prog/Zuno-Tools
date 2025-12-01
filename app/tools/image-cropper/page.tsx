'use client'

import { useState, useRef, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Footer from '@/components/Footer'
import { Upload, Download, X, Crop, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

export default function ImageCropper() {
  const [image, setImage] = useState<string | null>(null)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const [cropX, setCropX] = useState(0)
  const [cropY, setCropY] = useState(0)
  const [cropWidth, setCropWidth] = useState(200)
  const [cropHeight, setCropHeight] = useState(200)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const imageRef = useRef<HTMLImageElement>(null)
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
          setCropWidth(Math.min(200, img.width))
          setCropHeight(Math.min(200, img.height))
          setCroppedImage(null)
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

  const cropImage = () => {
    if (!image || !imageRef.current) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.src = image

    img.onload = () => {
      const scaleX = img.width / (imageRef.current?.clientWidth || 1)
      const scaleY = img.height / (imageRef.current?.clientHeight || 1)

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

      setCroppedImage(canvas.toDataURL('image/png'))
      toast.success('Image cropped successfully!')
    }
  }

  const downloadImage = () => {
    if (!croppedImage) return

    const link = document.createElement('a')
    link.download = 'cropped-image.png'
    link.href = croppedImage
    link.click()
    
    // Trigger popunder ad after 2 seconds
    triggerPopunder()
  }

  const reset = () => {
    setImage(null)
    setCroppedImage(null)
    setCropX(0)
    setCropY(0)
    setCropWidth(200)
    setCropHeight(200)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 mb-4">
              <Crop className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Image Cropper</h1>
            <p className="text-gray-900">Crop images with custom dimensions</p>
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
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                </p>
                <p className="text-sm text-gray-900">or click to select a file</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Crop Your Image</h2>
                  <button
                    onClick={reset}
                    className="flex items-center space-x-2 text-gray-900 hover:text-gray-900"
                  >
                    <X className="h-5 w-5" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Original Image</h3>
                    <div className="border rounded-lg overflow-hidden relative bg-gray-100">
                      <img
                        ref={imageRef}
                        src={image}
                        alt="Original"
                        className="w-full h-auto max-h-[400px] object-contain"
                      />
                      <div
                        className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 cursor-move"
                        style={{
                          left: `${cropX}px`,
                          top: `${cropY}px`,
                          width: `${cropWidth}px`,
                          height: `${cropHeight}px`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Cropped Image</h3>
                    <div className="border rounded-lg overflow-hidden bg-gray-100 min-h-[200px] flex items-center justify-center">
                      {croppedImage ? (
                        <img src={croppedImage} alt="Cropped" className="w-full h-auto max-h-[400px] object-contain" />
                      ) : (
                        <p className="text-gray-400">Adjust crop area and click "Crop Image"</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-gray-900">Crop Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        X Position
                      </label>
                      <input
                        type="number"
                        value={cropX}
                        onChange={(e) => setCropX(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Y Position
                      </label>
                      <input
                        type="number"
                        value={cropY}
                        onChange={(e) => setCropY(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Width
                      </label>
                      <input
                        type="number"
                        value={cropWidth}
                        onChange={(e) => setCropWidth(Math.max(10, Number(e.target.value)))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        min="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Height
                      </label>
                      <input
                        type="number"
                        value={cropHeight}
                        onChange={(e) => setCropHeight(Math.max(10, Number(e.target.value)))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        min="10"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={cropImage}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <Crop className="h-5 w-5" />
                    <span>Crop Image</span>
                  </button>
                  {croppedImage && (
                    <button
                      onClick={downloadImage}
                      className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <Download className="h-5 w-5" />
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

