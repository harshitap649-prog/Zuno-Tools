'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Footer from '@/components/Footer'
import { Upload, Download, X, FileText, FileImage, Image as ImageIcon, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import { usePopunderAd } from '@/hooks/usePopunderAd'

export default function PDFTools() {
  const [activeTab, setActiveTab] = useState<'pdf-maker' | 'pdf-to-jpg' | 'jpg-to-png'>('pdf-maker')
  const [files, setFiles] = useState<File[]>([])
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [convertedImages, setConvertedImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { triggerPopunder } = usePopunderAd()

  const onDropPDFMaker = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles])
  }, [])

  const onDropPDFToJPG = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]?.type === 'application/pdf') {
      setPdfFile(acceptedFiles[0])
    } else {
      toast.error('Please upload a PDF file')
    }
  }, [])

  const onDropJPGToPNG = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
  }, [])

  const { getRootProps: getRootPropsPDFMaker, getInputProps: getInputPropsPDFMaker, isDragActive: isDragActivePDFMaker } = useDropzone({
    onDrop: onDropPDFMaker,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: true
  })

  const { getRootProps: getRootPropsPDFToJPG, getInputProps: getInputPropsPDFToJPG, isDragActive: isDragActivePDFToJPG } = useDropzone({
    onDrop: onDropPDFToJPG,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  })

  const { getRootProps: getRootPropsJPGToPNG, getInputProps: getInputPropsJPGToPNG, isDragActive: isDragActiveJPGToPNG } = useDropzone({
    onDrop: onDropJPGToPNG,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg']
    },
    multiple: true
  })

  const createPDF = async () => {
    if (files.length === 0) {
      toast.error('Please add at least one image')
      return
    }

    setLoading(true)
    try {
      const pdf = new jsPDF()
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 0 // No margin for full-page images
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const reader = new FileReader()
        
        await new Promise<void>((resolve, reject) => {
          reader.onload = () => {
            const img = new Image()
            img.src = reader.result as string
            
            img.onerror = () => {
              reject(new Error(`Failed to load image: ${file.name}`))
            }
            
            img.onload = () => {
              try {
                if (i > 0) pdf.addPage()
                
                // Calculate dimensions to fit within page while maintaining aspect ratio
                const imgAspectRatio = img.width / img.height
                const pageAspectRatio = pageWidth / pageHeight
                
                let imgWidth: number
                let imgHeight: number
                let x: number
                let y: number
                
                // If image is wider than tall (landscape) or matches page aspect ratio
                if (imgAspectRatio >= pageAspectRatio) {
                  // Fit to page width
                  imgWidth = pageWidth - (margin * 2)
                  imgHeight = imgWidth / imgAspectRatio
                  x = margin
                  y = (pageHeight - imgHeight) / 2 // Center vertically
                } else {
                  // Fit to page height
                  imgHeight = pageHeight - (margin * 2)
                  imgWidth = imgHeight * imgAspectRatio
                  x = (pageWidth - imgWidth) / 2 // Center horizontally
                  y = margin
                }
                
                // Ensure dimensions don't exceed page size
                if (imgWidth > pageWidth) {
                  imgWidth = pageWidth - (margin * 2)
                  imgHeight = imgWidth / imgAspectRatio
                  x = margin
                  y = (pageHeight - imgHeight) / 2
                }
                
                if (imgHeight > pageHeight) {
                  imgHeight = pageHeight - (margin * 2)
                  imgWidth = imgHeight * imgAspectRatio
                  x = (pageWidth - imgWidth) / 2
                  y = margin
                }
                
                // Add image to PDF
                pdf.addImage(
                  reader.result as string,
                  'PNG',
                  x,
                  y,
                  imgWidth,
                  imgHeight
                )
                
                resolve()
              } catch (error) {
                reject(error)
              }
            }
          }
          reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
          reader.readAsDataURL(file)
        })
      }
      
      pdf.save('document.pdf')
      
      // Trigger popunder ad after 2 seconds
      triggerPopunder()
      
      toast.success('PDF created successfully!')
    } catch (error) {
      console.error('PDF creation error:', error)
      toast.error('Failed to create PDF. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const convertPDFToJPG = async () => {
    if (!pdfFile) {
      toast.error('Please upload a PDF file')
      return
    }

    setLoading(true)
    try {
      toast.loading('Converting PDF to images...', { id: 'pdf-convert' })
      
      // Dynamic import of pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist')
      
      // Set worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      
      // Read PDF file
      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      const images: string[] = []
      const numPages = pdf.numPages
      
      // Convert each page to image
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        toast.loading(`Converting page ${pageNum} of ${numPages}...`, { id: 'pdf-convert' })
        
        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 2.0 })
        
        // Create canvas
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) {
          throw new Error('Could not get canvas context')
        }
        
        canvas.height = viewport.height
        canvas.width = viewport.width
        
        // Render PDF page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        }
        
        await page.render(renderContext).promise
        
        // Convert canvas to image
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95)
        images.push(imageDataUrl)
      }
      
      setConvertedImages(images)
      toast.success(`Successfully converted ${numPages} page(s) to JPG!`, { id: 'pdf-convert' })
    } catch (error) {
      console.error('PDF to JPG conversion error:', error)
      toast.error('Failed to convert PDF to JPG. Please try again.', { id: 'pdf-convert' })
    } finally {
      setLoading(false)
    }
  }

  const convertJPGToPNG = async () => {
    if (files.length === 0) {
      toast.error('Please add at least one JPG image')
      return
    }

    setLoading(true)
    try {
      toast.loading('Converting images...', { id: 'jpg-convert' })
      const images: string[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        toast.loading(`Converting image ${i + 1} of ${files.length}...`, { id: 'jpg-convert' })
        
        const reader = new FileReader()
        await new Promise<void>((resolve, reject) => {
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.onload = () => {
            const img = new Image()
            img.onerror = () => reject(new Error('Failed to load image'))
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                if (!ctx) {
                  reject(new Error('Could not get canvas context'))
                  return
                }
                
                canvas.width = img.width
                canvas.height = img.height
                ctx.drawImage(img, 0, 0)
                
                const pngDataUrl = canvas.toDataURL('image/png', 1.0)
                images.push(pngDataUrl)
                resolve()
              } catch (error) {
                reject(error)
              }
            }
            img.src = reader.result as string
          }
          reader.readAsDataURL(file)
        })
      }
      
      setConvertedImages(images)
      toast.success(`Successfully converted ${images.length} image(s) to PNG!`, { id: 'jpg-convert' })
    } catch (error) {
      console.error('JPG to PNG conversion error:', error)
      toast.error('Failed to convert images. Please ensure the files are valid JPG images.', { id: 'jpg-convert' })
    } finally {
      setLoading(false)
    }
  }

  const downloadPNG = (index: number) => {
    if (!convertedImages[index]) return
    
    const link = document.createElement('a')
    link.download = `converted-${index + 1}.png`
    link.href = convertedImages[index]
    link.click()
    
    // Trigger popunder ad after 2 seconds
    triggerPopunder()
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 mb-3 sm:mb-4">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">PDF Tools</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Create PDFs, convert PDF to JPG, and JPG to PNG</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto">
              <button
                onClick={() => setActiveTab('pdf-maker')}
                className={`flex-1 min-w-[100px] px-3 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-colors touch-manipulation ${
                  activeTab === 'pdf-maker'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-900 hover:text-gray-900 active:bg-gray-50'
                }`}
              >
                PDF Maker
              </button>
              <button
                onClick={() => setActiveTab('pdf-to-jpg')}
                className={`flex-1 min-w-[100px] px-3 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-colors touch-manipulation ${
                  activeTab === 'pdf-to-jpg'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-900 hover:text-gray-900 active:bg-gray-50'
                }`}
              >
                PDF to JPG
              </button>
              <button
                onClick={() => setActiveTab('jpg-to-png')}
                className={`flex-1 min-w-[100px] px-3 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-colors touch-manipulation ${
                  activeTab === 'jpg-to-png'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-900 hover:text-gray-900 active:bg-gray-50'
                }`}
              >
                JPG to PNG
              </button>
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              {/* PDF Maker */}
              {activeTab === 'pdf-maker' && (
                <div className="space-y-6">
                  <div
                    {...getRootPropsPDFMaker()}
                    className={`border-2 border-dashed rounded-lg p-6 sm:p-8 md:p-12 text-center cursor-pointer transition-colors touch-manipulation ${
                      isDragActivePDFMaker
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50 active:bg-primary-50'
                    }`}
                  >
                    <input {...getInputPropsPDFMaker()} />
                    <Upload className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      {isDragActivePDFMaker ? 'Drop images here' : 'Drag & drop images here'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-900">or click to select files</p>
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Selected Images ({files.length})
                        </h3>
                        <button
                          onClick={() => setFiles([])}
                          className="text-sm text-gray-900 hover:text-gray-900"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {files.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => setFiles(files.filter((_, i) => i !== index))}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={createPDF}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Creating PDF...</span>
                          </>
                        ) : (
                          <>
                            <FileText className="h-5 w-5" />
                            <span>Create PDF</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* PDF to JPG */}
              {activeTab === 'pdf-to-jpg' && (
                <div className="space-y-6">
                  <div
                    {...getRootPropsPDFToJPG()}
                    className={`border-2 border-dashed rounded-lg p-6 sm:p-8 md:p-12 text-center cursor-pointer transition-colors touch-manipulation ${
                      isDragActivePDFToJPG
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50 active:bg-primary-50'
                    }`}
                  >
                    <input {...getInputPropsPDFToJPG()} />
                    <FileText className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      {isDragActivePDFToJPG ? 'Drop PDF here' : 'Drag & drop PDF here'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-900">or click to select a file</p>
                  </div>

                  {pdfFile && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-900">{pdfFile.name}</p>
                        <p className="text-xs text-gray-900">{(pdfFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <button
                        onClick={convertPDFToJPG}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Converting...</span>
                          </>
                        ) : (
                          <>
                            <FileImage className="h-5 w-5" />
                            <span>Convert to JPG</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* JPG to PNG */}
              {activeTab === 'jpg-to-png' && (
                <div className="space-y-6">
                  <div
                    {...getRootPropsJPGToPNG()}
                    className={`border-2 border-dashed rounded-lg p-6 sm:p-8 md:p-12 text-center cursor-pointer transition-colors touch-manipulation ${
                      isDragActiveJPGToPNG
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50 active:bg-primary-50'
                    }`}
                  >
                    <input {...getInputPropsJPGToPNG()} />
                    <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      {isDragActiveJPGToPNG ? 'Drop JPG images here' : 'Drag & drop JPG images here'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-900">or click to select files</p>
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-4">
                      <button
                        onClick={convertJPGToPNG}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Converting...</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-5 w-5" />
                            <span>Convert to PNG</span>
                          </>
                        )}
                      </button>

                      {convertedImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {convertedImages.map((img, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={img}
                                alt={`Converted ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => downloadPNG(index)}
                                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center"
                              >
                                <Download className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

