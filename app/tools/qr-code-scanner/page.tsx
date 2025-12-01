'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import Footer from '@/components/Footer'
import { Upload, QrCode, Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function QRCodeScanner() {
  const [image, setImage] = useState<string | null>(null)
  const [scannedText, setScannedText] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result as string)
        setScannedText(null)
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

  const scanQRCode = async () => {
    if (!image) return

    setLoading(true)
    try {
      // Use jsQR library if available, otherwise use a simple approach
      const img = new Image()
      img.src = image

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // Try to use jsQR if available
      try {
        // @ts-ignore
        const { jsQR } = await import('jsqr')
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code) {
          setScannedText(code.data)
          toast.success('QR code scanned successfully!')
        } else {
          toast.error('No QR code found in the image')
        }
      } catch (error) {
        // Fallback: show message about installing jsQR
        toast.error('QR scanning requires jsQR library. Please install: npm install jsqr')
      }
    } catch (error) {
      console.error('Scan error:', error)
      toast.error('Failed to scan QR code')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setImage(null)
    setScannedText(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-gray-700 to-gray-900 mb-4">
              <QrCode className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">QR Code Scanner</h1>
            <p className="text-gray-900">Scan QR codes from images</p>
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
                  {isDragActive ? 'Drop the image here' : 'Drag & drop an image with QR code'}
                </p>
                <p className="text-sm text-gray-900">or click to select a file</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Scan QR Code</h2>
                  <button
                    onClick={reset}
                    className="flex items-center space-x-2 text-gray-900 hover:text-gray-900"
                  >
                    <X className="h-5 w-5" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Image</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <img src={image} alt="QR Code" className="w-full h-auto max-h-[400px] object-contain" />
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Scanned Text</h3>
                    <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px]">
                      {loading ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                        </div>
                      ) : scannedText ? (
                        <div>
                          <p className="text-gray-900 break-all mb-4">{scannedText}</p>
                          <a
                            href={scannedText}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 underline"
                          >
                            Open Link
                          </a>
                        </div>
                      ) : (
                        <p className="text-gray-400">Click "Scan QR Code" to extract text</p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={scanQRCode}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="h-5 w-5" />
                      <span>Scan QR Code</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

