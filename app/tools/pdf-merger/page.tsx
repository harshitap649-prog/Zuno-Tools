'use client'

import { useState } from 'react'
import Footer from '@/components/Footer'
import { FileText, Sparkles, Upload, Download, X, Merge } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PDFMerger() {
  const [files, setFiles] = useState<File[]>([])

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

    toast.info('PDF merging requires a backend service. This is a demo interface.')
    // In production, you would send files to a backend API that uses pdf-lib or similar
    // For now, this is a UI demonstration
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-6">
            <div className="flex flex-col items-center justify-center mb-4 sm:mb-6">
              <div className="relative inline-flex items-center justify-center mb-3 sm:mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-pink-500 to-rose-500 p-2 sm:p-3 rounded-xl shadow-lg">
                  <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                  Zuno Tools
                </span>
              </h1>
              <div className="mt-2 h-0.5 w-20 sm:w-24 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mx-auto"></div>
            </div>
          </div>
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 mb-3 sm:mb-4">
              <Merge className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">PDF Merger</h1>
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
                  disabled={files.length < 2}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Merge className="h-5 w-5" />
                  <span>Merge PDFs</span>
                </button>
              </>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> PDF merging requires server-side processing. This interface demonstrates the UI. For production use, integrate with a PDF library like pdf-lib or a backend service.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

