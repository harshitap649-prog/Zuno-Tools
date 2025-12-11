'use client'

import { useState } from 'react'
import Footer from '@/components/Footer'
import MobileBottomAd from '@/components/MobileBottomAd'
import { FileText, Upload, X, Merge, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { PDFDocument } from 'pdf-lib'

export default function PDFMerger() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || [])
    const pdfFiles = uploadedFiles.filter(file => file.type === 'application/pdf')
    
    if (pdfFiles.length !== uploadedFiles.length) {
      toast.error('Please upload only PDF files')
    }
    
    setFiles(prev => [...prev, ...pdfFiles])
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const mergePDFs = async () => {
    if (files.length < 2) {
      toast.error('Please upload at least 2 PDF files')
      return
    }

    setLoading(true)
    try {
      // Verify PDFDocument is available
      if (!PDFDocument || typeof PDFDocument.create !== 'function') {
        throw new Error('PDFDocument is not available. Please ensure pdf-lib is installed and restart the dev server.')
      }

      // Create a new PDF document
      const mergedPdf = await PDFDocument.create()

      // Process each PDF file
      for (const file of files) {
        try {
          const arrayBuffer = await file.arrayBuffer()
          const pdf = await PDFDocument.load(arrayBuffer)
          
          // Copy all pages from this PDF to the merged PDF
          const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
          pages.forEach((page) => mergedPdf.addPage(page))
        } catch (error: any) {
          console.error(`Error processing ${file.name}:`, error)
          const errorMsg = error?.message || 'Unknown error'
          toast.error(`Failed to process ${file.name}: ${errorMsg}. It may be corrupted.`)
        }
      }

      // Generate the merged PDF as a blob
      const pdfBytes = await mergedPdf.save()
      // Ensure a concrete ArrayBuffer-backed ArrayBufferView for Blob
      const uint8 = new Uint8Array(pdfBytes)
      const blob = new Blob([uint8], { type: 'application/pdf' })
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'merged-pdf.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('PDFs merged successfully!')
      setFiles([])
    } catch (error: any) {
      console.error('Error merging PDFs:', error)
      const errorMessage = error?.message || error?.toString() || 'Unknown error'
      toast.error(`Failed to merge PDFs: ${errorMessage}. Please check the console for details.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 mb-3 sm:mb-4">
              <Merge className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">PDF Merger</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Combine multiple PDF files into one</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Upload PDF Files</label>
              <input
                type="file"
                accept="application/pdf"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors flex flex-col items-center justify-center space-y-2 text-gray-600 cursor-pointer"
              >
                <Upload className="h-8 w-8" />
                <span className="font-medium">Click to upload PDF files</span>
                <span className="text-sm">or drag and drop</span>
              </label>
            </div>

            {files.length > 0 && (
              <>
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Selected Files ({files.length})</h3>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-red-500" />
                        <div>
                          <div className="font-medium text-gray-900">{file.name}</div>
                          <div className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={mergePDFs}
                  disabled={files.length < 2 || loading}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Merging PDFs...</span>
                    </>
                  ) : (
                    <>
                      <Merge className="h-5 w-5" />
                      <span>Merge PDFs</span>
                    </>
                  )}
                </button>
              </>
            )}

          </div>
        </div>
      </main>

      <MobileBottomAd adKey="36d691042d95ac1ac33375038ec47a5c" />
      <Footer />
    </div>
  )
}


