'use client'

import { useState, useRef } from 'react'
import Footer from '@/components/Footer'
import { FileText, Upload, Download, PenTool } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DocumentSigner() {
  const [document, setDocument] = useState<string | null>(null)
  const [signature, setSignature] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null)

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader()
      reader.onload = (event) => {
        setDocument(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      toast.error('Please upload a PDF file')
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const signatureData = canvas.toDataURL()
    setSignature(signatureData)
  }

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignature(null)
  }

  const downloadSignedDocument = () => {
    if (!document || !signature) {
      toast.error('Please upload a document and create a signature')
      return
    }

    toast.info('Document signing requires PDF processing. This is a demo interface.')
    // In production, use pdf-lib or similar to add signature to PDF
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 mb-3 sm:mb-4">
              <PenTool className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Document Signer</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Add digital signatures to PDF documents</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Upload PDF Document</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleDocumentUpload}
                className="hidden"
                id="document-upload"
              />
              <label
                htmlFor="document-upload"
                className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors flex flex-col items-center justify-center space-y-2 text-gray-600 cursor-pointer"
              >
                <Upload className="h-8 w-8" />
                <span className="font-medium">Click to upload PDF</span>
                <span className="text-sm">or drag and drop</span>
              </label>
              {document && (
                <div className="mt-2 text-sm text-green-600">✓ Document uploaded</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Create Signature</label>
              <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                <canvas
                  ref={signatureCanvasRef}
                  width={400}
                  height={200}
                  className="border border-gray-200 rounded cursor-crosshair w-full"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={clearSignature}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>
              {signature && (
                <div className="mt-2 text-sm text-green-600">✓ Signature created</div>
              )}
            </div>

            <button
              onClick={downloadSignedDocument}
              disabled={!document || !signature}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-5 w-5" />
              <span>Download Signed Document</span>
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Document signing requires PDF processing library (e.g., pdf-lib, PDF.js). This interface demonstrates the UI. For production use, integrate with a backend service that handles PDF manipulation.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

