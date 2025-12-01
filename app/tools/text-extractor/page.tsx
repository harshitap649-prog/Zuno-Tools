'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Footer from '@/components/Footer'
import { Upload, FileText, Loader2, X, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TextExtractor() {
  const [image, setImage] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result as string)
        setExtractedText('')
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

  const extractText = async () => {
    if (!image) return

    setLoading(true)
    try {
      // Try to use Tesseract.js for OCR
      try {
        // @ts-ignore
        const { createWorker } = await import('tesseract.js')
        const worker = await createWorker('eng')
        
        const { data: { text } } = await worker.recognize(image)
        setExtractedText(text.trim())
        await worker.terminate()
        
        if (text.trim()) {
          toast.success('Text extracted successfully!')
        } else {
          toast.error('No text found in the image')
        }
      } catch (error) {
        // Fallback message
        toast.error('OCR requires Tesseract.js. Install: npm install tesseract.js')
        setExtractedText('OCR functionality requires the tesseract.js library. Please install it using: npm install tesseract.js')
      }
    } catch (error) {
      console.error('Extraction error:', error)
      toast.error('Failed to extract text from image')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const reset = () => {
    setImage(null)
    setExtractedText('')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 mb-4">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Text Extractor</h1>
            <p className="text-gray-900">Extract text from images using OCR</p>
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
                  {isDragActive ? 'Drop the image here' : 'Drag & drop an image with text'}
                </p>
                <p className="text-sm text-gray-900">or click to select a file</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Extract Text</h2>
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
                      <img src={image} alt="Source" className="w-full h-auto max-h-[400px] object-contain" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium text-gray-900">Extracted Text</h3>
                      {extractedText && (
                        <button
                          onClick={copyToClipboard}
                          className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px]">
                      {loading ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                        </div>
                      ) : extractedText ? (
                        <p className="text-gray-900 whitespace-pre-wrap">{extractedText}</p>
                      ) : (
                        <p className="text-gray-400">Click "Extract Text" to extract text from the image</p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={extractText}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Extracting...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5" />
                      <span>Extract Text</span>
                    </>
                  )}
                </button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This tool requires the tesseract.js library for OCR functionality. Install it using: <code className="bg-blue-100 px-2 py-1 rounded">npm install tesseract.js</code>
                  </p>
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

