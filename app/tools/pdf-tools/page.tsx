'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useDropzone } from 'react-dropzone'
import Footer from '@/components/Footer'
import { Upload, Download, X, FileText, Loader2, Merge, Scissors, Minimize2, Info, RotateCw, FileImage } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

// Dynamically import ad components to avoid SSR issues
const SidebarAd = dynamic(() => import('@/components/SidebarAd'), { ssr: false })
const MobileBottomAd = dynamic(() => import('@/components/MobileBottomAd'), { ssr: false })

export default function PDFTools() {
  const [activeTab, setActiveTab] = useState<'pdf-maker' | 'pdf-merge' | 'pdf-split' | 'pdf-compress' | 'pdf-to-images' | 'pdf-rotate' | 'pdf-info'>('pdf-maker')
  const [files, setFiles] = useState<File[]>([])
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfFiles, setPdfFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [pdfQuality, setPdfQuality] = useState<'high' | 'medium' | 'low'>('high')
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'legal'>('a4')
  const [pdfInfo, setPdfInfo] = useState<any>(null)
  const [convertedImages, setConvertedImages] = useState<string[]>([])
  const [rotationAngle, setRotationAngle] = useState<number>(0)
  const { triggerPopunder } = usePopunderAd()

  const onDropPDFMaker = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles])
  }, [])

  const onDropPDF = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]?.type === 'application/pdf') {
      setPdfFile(acceptedFiles[0])
    } else {
      toast.error('Please upload a PDF file')
    }
  }, [])

  const onDropPDFMerge = useCallback((acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf')
    if (pdfFiles.length > 0) {
      setPdfFiles(prev => [...prev, ...pdfFiles])
    } else {
      toast.error('Please upload PDF files only')
    }
  }, [])

  const { getRootProps: getRootPropsPDFMaker, getInputProps: getInputPropsPDFMaker, isDragActive: isDragActivePDFMaker } = useDropzone({
    onDrop: onDropPDFMaker,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: true
  })

  const { getRootProps: getRootPropsPDF, getInputProps: getInputPropsPDF, isDragActive: isDragActivePDF } = useDropzone({
    onDrop: onDropPDF,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  })

  const { getRootProps: getRootPropsPDFMerge, getInputProps: getInputPropsPDFMerge, isDragActive: isDragActivePDFMerge } = useDropzone({
    onDrop: onDropPDFMerge,
    accept: {
      'application/pdf': ['.pdf']
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
      // Dynamically import jsPDF to avoid SSR issues
      const { default: jsPDF } = await import('jspdf')
      
      // Set page size based on selection
      const pageDimensions: { [key: string]: [number, number] } = {
        a4: [210, 297], // A4 in mm
        letter: [216, 279], // Letter in mm
        legal: [216, 356], // Legal in mm
      }
      
      const [width, height] = pageDimensions[pageSize]
      const pdf = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [width, height],
      })
      
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 0 // No margin for full-page images
      
      // Set quality based on selection
      const qualityMap: { [key: string]: number } = {
        high: 1.0,
        medium: 0.8,
        low: 0.6,
      }
      const imageQuality = qualityMap[pdfQuality]
      
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
                
                // Add image to PDF with quality setting
                const format = file.type.includes('jpeg') || file.type.includes('jpg') ? 'JPEG' : 'PNG'
                pdf.addImage(
                  reader.result as string,
                  format,
                  x,
                  y,
                  imgWidth,
                  imgHeight,
                  undefined,
                  'FAST', // compression
                  imageQuality
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
      
      try {
      triggerPopunder()
      } catch (adError) {
        console.error('Popunder ad trigger failed:', adError)
      }
      
      toast.success('PDF created successfully!')
    } catch (error) {
      console.error('PDF creation error:', error)
      toast.error('Failed to create PDF. Please try again.')
    } finally {
      setLoading(false)
    }
  }


  const mergePDFs = async () => {
    if (pdfFiles.length < 2) {
      toast.error('Please add at least 2 PDF files to merge')
      return
    }

    setLoading(true)
    try {
      toast.loading('Merging PDFs...', { id: 'pdf-merge' })
      
      let pdfjsLib: any
      try {
        const moduleName = 'pdfjs-dist'
        pdfjsLib = await import(/* webpackIgnore: true */ moduleName)
      } catch (error) {
        toast.error('PDF library not available', { id: 'pdf-merge' })
        setLoading(false)
        return
      }
      
      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      }
      
      const { default: jsPDF } = await import('jspdf')
      const mergedPdf = new jsPDF()
      let isFirstPage = true

      for (const pdfFile of pdfFiles) {
      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const numPages = pdf.numPages
      
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          if (!isFirstPage) {
            mergedPdf.addPage()
          }
          isFirstPage = false
        
        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 2.0 })
        
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
          if (!context) continue
        
        canvas.height = viewport.height
        canvas.width = viewport.width
        
          await page.render({
          canvasContext: context,
          viewport: viewport
          }).promise

          const imgData = canvas.toDataURL('image/jpeg', 0.95)
          const imgWidth = mergedPdf.internal.pageSize.getWidth()
          const imgHeight = mergedPdf.internal.pageSize.getHeight()

          mergedPdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)
        }
      }

      mergedPdf.save('merged-document.pdf')
      toast.success('PDFs merged successfully!', { id: 'pdf-merge' })
      try {
        triggerPopunder()
      } catch (adError) {
        console.error('Popunder ad trigger failed:', adError)
      }
    } catch (error) {
      console.error('PDF merge error:', error)
      toast.error('Failed to merge PDFs', { id: 'pdf-merge' })
    } finally {
      setLoading(false)
    }
  }

  const splitPDF = async () => {
    if (!pdfFile) {
      toast.error('Please upload a PDF file')
      return
    }

    setLoading(true)
    try {
      toast.loading('Splitting PDF...', { id: 'pdf-split' })
      
      let pdfjsLib: any
      try {
        const moduleName = 'pdfjs-dist'
        pdfjsLib = await import(/* webpackIgnore: true */ moduleName)
      } catch (error) {
        toast.error('PDF library not available', { id: 'pdf-split' })
        setLoading(false)
                  return
                }
                
      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      }

      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const numPages = pdf.numPages

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 2.0 })
        
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) continue

        canvas.height = viewport.height
        canvas.width = viewport.width

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise

        const imgData = canvas.toDataURL('image/jpeg', 0.95)
        const { default: jsPDF } = await import('jspdf')
        const singlePagePdf = new jsPDF()
        const imgWidth = singlePagePdf.internal.pageSize.getWidth()
        const imgHeight = singlePagePdf.internal.pageSize.getHeight()

        singlePagePdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)
        singlePagePdf.save(`page-${pageNum}.pdf`)
      }

      toast.success(`PDF split into ${numPages} files!`, { id: 'pdf-split' })
      try {
        triggerPopunder()
      } catch (adError) {
        console.error('Popunder ad trigger failed:', adError)
      }
    } catch (error) {
      console.error('PDF split error:', error)
      toast.error('Failed to split PDF', { id: 'pdf-split' })
    } finally {
      setLoading(false)
    }
  }

  const convertPDFToImages = async () => {
    if (!pdfFile) {
      toast.error('Please upload a PDF file')
      return
    }

    setLoading(true)
    try {
      toast.loading('Converting PDF to images...', { id: 'pdf-to-images' })
      
      let pdfjsLib: any
      try {
        const moduleName = 'pdfjs-dist'
        pdfjsLib = await import(/* webpackIgnore: true */ moduleName)
    } catch (error) {
        console.error('PDF.js import error:', error)
        toast.error('PDF library not available. Please run: npm install pdfjs-dist', { id: 'pdf-to-images' })
      setLoading(false)
        return
      }
      
      if (!pdfjsLib || !pdfjsLib.getDocument) {
        toast.error('PDF.js library not properly loaded.', { id: 'pdf-to-images' })
        setLoading(false)
        return
      }
      
      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      }
      
      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      const images: string[] = []
      const numPages = pdf.numPages
      
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        toast.loading(`Converting page ${pageNum} of ${numPages}...`, { id: 'pdf-to-images' })
        
        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 2.0 })
        
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) {
          throw new Error('Could not get canvas context')
        }
        
        canvas.height = viewport.height
        canvas.width = viewport.width
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise
        
        const imageDataUrl = canvas.toDataURL('image/png', 1.0)
        images.push(imageDataUrl)
      }
      
      setConvertedImages(images)
      toast.success(`Successfully converted ${numPages} page(s) to PNG!`, { id: 'pdf-to-images' })
    } catch (error) {
      console.error('PDF to Images conversion error:', error)
      toast.error('Failed to convert PDF to images. Please try again.', { id: 'pdf-to-images' })
    } finally {
      setLoading(false)
    }
  }

  const rotatePDF = async () => {
    if (!pdfFile) {
      toast.error('Please upload a PDF file')
      return
    }

    if (rotationAngle === 0) {
      toast.error('Please select a rotation angle')
      return
    }

    setLoading(true)
    try {
      toast.loading('Rotating PDF...', { id: 'pdf-rotate' })
      
      let pdfjsLib: any
      try {
        const moduleName = 'pdfjs-dist'
        pdfjsLib = await import(/* webpackIgnore: true */ moduleName)
      } catch (error) {
        toast.error('PDF library not available', { id: 'pdf-rotate' })
        setLoading(false)
        return
      }

      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      }

        const arrayBuffer = await pdfFile.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        const numPages = pdf.numPages

      const { default: jsPDF } = await import('jspdf')
      const rotatedPdf = new jsPDF()
      let isFirstPage = true

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          if (!isFirstPage) {
          rotatedPdf.addPage()
          }
          isFirstPage = false

          const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 2.0, rotation: rotationAngle })
          
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          if (!context) continue

          canvas.height = viewport.height
          canvas.width = viewport.width

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise

          const imgData = canvas.toDataURL('image/jpeg', 0.95)
        const imgWidth = rotatedPdf.internal.pageSize.getWidth()
        const imgHeight = rotatedPdf.internal.pageSize.getHeight()

        rotatedPdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)
      }

      rotatedPdf.save('rotated-document.pdf')
      toast.success('PDF rotated successfully!', { id: 'pdf-rotate' })
      try {
      triggerPopunder()
      } catch (adError) {
        console.error('Popunder ad trigger failed:', adError)
      }
    } catch (error) {
      console.error('PDF rotate error:', error)
      toast.error('Failed to rotate PDF', { id: 'pdf-rotate' })
    } finally {
      setLoading(false)
    }
  }

  const compressPDF = async () => {
    if (!pdfFile) {
      toast.error('Please upload a PDF file')
      return
    }

    setLoading(true)
    try {
      toast.loading('Compressing PDF...', { id: 'pdf-compress' })
      
      let pdfjsLib: any
      try {
        const moduleName = 'pdfjs-dist'
        pdfjsLib = await import(/* webpackIgnore: true */ moduleName)
      } catch (error) {
        toast.error('PDF library not available', { id: 'pdf-compress' })
        setLoading(false)
        return
      }

      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      }

      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const numPages = pdf.numPages

      const { default: jsPDF } = await import('jspdf')
      const compressedPdf = new jsPDF()
      let isFirstPage = true

      // Use lower quality for compression
      const compressionQuality = 0.7

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        if (!isFirstPage) {
          compressedPdf.addPage()
        }
        isFirstPage = false

        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 1.5 }) // Lower scale for smaller file size
        
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) continue

        canvas.height = viewport.height
        canvas.width = viewport.width

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise

        const imgData = canvas.toDataURL('image/jpeg', compressionQuality)
        const imgWidth = compressedPdf.internal.pageSize.getWidth()
        const imgHeight = compressedPdf.internal.pageSize.getHeight()

        compressedPdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)
      }

      compressedPdf.save('compressed-document.pdf')
      toast.success('PDF compressed successfully!', { id: 'pdf-compress' })
      try {
      triggerPopunder()
      } catch (adError) {
        console.error('Popunder ad trigger failed:', adError)
      }
    } catch (error) {
      console.error('PDF compress error:', error)
      toast.error('Failed to compress PDF', { id: 'pdf-compress' })
    } finally {
      setLoading(false)
    }
  }

  const getPDFInfo = async () => {
    if (!pdfFile) {
      toast.error('Please upload a PDF file')
      return
    }

    setLoading(true)
    try {
      let pdfjsLib: any
      try {
        const moduleName = 'pdfjs-dist'
        pdfjsLib = await import(/* webpackIgnore: true */ moduleName)
      } catch (error) {
        toast.error('PDF library not available')
        setLoading(false)
        return
      }

      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      }

      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      const info = {
        pages: pdf.numPages,
        fileSize: (pdfFile.size / 1024).toFixed(2) + ' KB',
        fileName: pdfFile.name,
      }

      setPdfInfo(info)
      toast.success('PDF info loaded!')
    } catch (error) {
      console.error('PDF info error:', error)
      toast.error('Failed to get PDF info')
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = (index: number) => {
    if (!convertedImages[index]) return
    
    const link = document.createElement('a')
    link.download = `page-${index + 1}.png`
    link.href = convertedImages[index]
    link.click()
    toast.success(`Page ${index + 1} downloaded!`)
    try {
      triggerPopunder()
    } catch (adError) {
      console.error('Popunder ad trigger failed:', adError)
    }
  }

  const downloadAllImages = () => {
    convertedImages.forEach((img, index) => {
      setTimeout(() => {
        const link = document.createElement('a')
        link.download = `page-${index + 1}.png`
        link.href = img
        link.click()
      }, index * 100)
    })
    toast.success(`Downloading ${convertedImages.length} images...`)
    try {
      triggerPopunder()
    } catch (adError) {
      console.error('Popunder ad trigger failed:', adError)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      <SidebarAd position="right" adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="relative inline-flex items-center justify-center mb-3 sm:mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
              <div className="relative inline-flex p-2 sm:p-3 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 shadow-lg">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">
              PDF Tools
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-4">
              Create, merge, split, compress, rotate PDFs and convert to images
            </p>
          </div>

          <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl sm:rounded-2xl shadow-xl border-2 border-purple-200 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab('pdf-maker')}
                className={`flex-shrink-0 min-w-[90px] sm:min-w-[100px] px-2 sm:px-3 md:px-4 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-colors touch-manipulation ${
                  activeTab === 'pdf-maker'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-700 hover:text-purple-600 active:bg-gray-50'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-1" />
                <span className="hidden sm:inline">PDF Maker</span>
                <span className="sm:hidden">Maker</span>
              </button>
              <button
                onClick={() => setActiveTab('pdf-merge')}
                className={`flex-shrink-0 min-w-[90px] sm:min-w-[100px] px-2 sm:px-3 md:px-4 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-colors touch-manipulation ${
                  activeTab === 'pdf-merge'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-700 hover:text-purple-600 active:bg-gray-50'
                }`}
              >
                <Merge className="h-4 w-4 inline mr-1" />
                <span className="hidden sm:inline">Merge</span>
                <span className="sm:hidden">Merge</span>
              </button>
              <button
                onClick={() => setActiveTab('pdf-split')}
                className={`flex-shrink-0 min-w-[90px] sm:min-w-[100px] px-2 sm:px-3 md:px-4 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-colors touch-manipulation ${
                  activeTab === 'pdf-split'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-700 hover:text-purple-600 active:bg-gray-50'
                }`}
              >
                <Scissors className="h-4 w-4 inline mr-1" />
                <span className="hidden sm:inline">Split</span>
                <span className="sm:hidden">Split</span>
              </button>
              <button
                onClick={() => setActiveTab('pdf-compress')}
                className={`flex-shrink-0 min-w-[90px] sm:min-w-[100px] px-2 sm:px-3 md:px-4 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-colors touch-manipulation ${
                  activeTab === 'pdf-compress'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-700 hover:text-purple-600 active:bg-gray-50'
                }`}
              >
                <Minimize2 className="h-4 w-4 inline mr-1" />
                <span className="hidden sm:inline">Compress</span>
                <span className="sm:hidden">Compress</span>
              </button>
              <button
                onClick={() => setActiveTab('pdf-to-images')}
                className={`flex-shrink-0 min-w-[90px] sm:min-w-[100px] px-2 sm:px-3 md:px-4 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-colors touch-manipulation ${
                  activeTab === 'pdf-to-images'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-700 hover:text-purple-600 active:bg-gray-50'
                }`}
              >
                <FileImage className="h-4 w-4 inline mr-1" />
                <span className="hidden sm:inline">To Images</span>
                <span className="sm:hidden">Images</span>
              </button>
              <button
                onClick={() => setActiveTab('pdf-rotate')}
                className={`flex-shrink-0 min-w-[90px] sm:min-w-[100px] px-2 sm:px-3 md:px-4 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-colors touch-manipulation ${
                  activeTab === 'pdf-rotate'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-700 hover:text-purple-600 active:bg-gray-50'
                }`}
              >
                <RotateCw className="h-4 w-4 inline mr-1" />
                <span className="hidden sm:inline">Rotate</span>
                <span className="sm:hidden">Rotate</span>
              </button>
              <button
                onClick={() => setActiveTab('pdf-info')}
                className={`flex-shrink-0 min-w-[90px] sm:min-w-[100px] px-2 sm:px-3 md:px-4 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-colors touch-manipulation ${
                  activeTab === 'pdf-info'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-700 hover:text-purple-600 active:bg-gray-50'
                }`}
              >
                <Info className="h-4 w-4 inline mr-1" />
                <span className="hidden sm:inline">Info</span>
                <span className="sm:hidden">Info</span>
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
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          Selected Images ({files.length})
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-2">
                            <label className="text-xs sm:text-sm text-gray-700">Quality:</label>
                            <select
                              value={pdfQuality}
                              onChange={(e) => setPdfQuality(e.target.value as any)}
                              className="px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 touch-manipulation"
                            >
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs sm:text-sm text-gray-700">Size:</label>
                            <select
                              value={pageSize}
                              onChange={(e) => setPageSize(e.target.value as any)}
                              className="px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 touch-manipulation"
                            >
                              <option value="a4">A4</option>
                              <option value="letter">Letter</option>
                              <option value="legal">Legal</option>
                            </select>
                          </div>
                          <button
                            onClick={() => setFiles([])}
                            className="px-3 py-1.5 text-xs sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors touch-manipulation min-h-[36px]"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                        {files.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 sm:h-32 object-cover rounded-lg border-2 border-gray-200"
                            />
                            <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                              {index + 1}
                            </div>
                            <button
                              onClick={() => setFiles(files.filter((_, i) => i !== index))}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 touch-manipulation"
                              title="Remove"
                            >
                              <X className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={createPDF}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 active:scale-95 touch-manipulation min-h-[48px]"
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

              {/* PDF Merge */}
              {activeTab === 'pdf-merge' && (
                <div className="space-y-6">
                  <div
                    {...getRootPropsPDFMerge()}
                    className={`border-2 border-dashed rounded-lg p-6 sm:p-8 md:p-12 text-center cursor-pointer transition-colors touch-manipulation ${
                      isDragActivePDFMerge
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50 active:bg-purple-50'
                    }`}
                  >
                    <input {...getInputPropsPDFMerge()} />
                    <Merge className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      {isDragActivePDFMerge ? 'Drop PDFs here' : 'Drag & drop PDF files here'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-900">or click to select files (2 or more)</p>
                  </div>

                  {pdfFiles.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          PDF Files ({pdfFiles.length})
                        </h3>
                        <button
                          onClick={() => setPdfFiles([])}
                          className="px-3 py-1.5 text-xs sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors touch-manipulation min-h-[36px] w-full sm:w-auto"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="space-y-2">
                        {pdfFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-purple-600" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-600">{(file.size / 1024).toFixed(2)} KB</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setPdfFiles(pdfFiles.filter((_, i) => i !== index))}
                              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={mergePDFs}
                        disabled={loading || pdfFiles.length < 2}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 active:scale-95 touch-manipulation min-h-[48px]"
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
                    </div>
                  )}
                </div>
              )}

              {/* PDF Split */}
              {activeTab === 'pdf-split' && (
                <div className="space-y-6">
                  <div
                    {...getRootPropsPDF()}
                    className={`border-2 border-dashed rounded-lg p-6 sm:p-8 md:p-12 text-center cursor-pointer transition-colors touch-manipulation ${
                      isDragActivePDF
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50 active:bg-purple-50'
                    }`}
                  >
                    <input {...getInputPropsPDF()} />
                    <Scissors className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      {isDragActivePDF ? 'Drop PDF here' : 'Drag & drop PDF here'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-900">or click to select a file</p>
                  </div>

                  {pdfFile && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{pdfFile.name}</p>
                            <p className="text-xs text-gray-600">{(pdfFile.size / 1024).toFixed(2)} KB</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setPdfFile(null)
                              setPdfInfo(null)
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex gap-2 mt-3">
                        <button
                          onClick={getPDFInfo}
                          disabled={loading}
                            className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-all text-sm flex items-center justify-center gap-2 touch-manipulation min-h-[44px]"
                        >
                          <Info className="h-4 w-4" />
                            Get Info
                        </button>
                        </div>
                        {pdfInfo && (
                          <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">Pages: <span className="font-semibold text-gray-900">{pdfInfo.pages}</span></p>
                            <p className="text-xs text-gray-600 mb-1">File Size: <span className="font-semibold text-gray-900">{pdfInfo.fileSize}</span></p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={splitPDF}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 active:scale-95 touch-manipulation min-h-[48px]"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Splitting PDF...</span>
                          </>
                        ) : (
                          <>
                            <Scissors className="h-5 w-5" />
                            <span>Split PDF</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* PDF Compress */}
              {activeTab === 'pdf-compress' && (
                <div className="space-y-6">
                  <div
                    {...getRootPropsPDF()}
                    className={`border-2 border-dashed rounded-lg p-6 sm:p-8 md:p-12 text-center cursor-pointer transition-colors touch-manipulation ${
                      isDragActivePDF
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50 active:bg-purple-50'
                    }`}
                  >
                    <input {...getInputPropsPDF()} />
                    <Minimize2 className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      {isDragActivePDF ? 'Drop PDF here' : 'Drag & drop PDF here'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-900">or click to select a file</p>
                          </div>

                  {pdfFile && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-900 mb-1">{pdfFile.name}</p>
                        <p className="text-xs text-gray-600">Original Size: {(pdfFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                          <Info className="h-4 w-4 inline mr-1" />
                          PDF compression will reduce file size by converting pages to images. Quality may be slightly reduced.
                        </p>
                                </div>
                                <button
                        onClick={compressPDF}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 active:scale-95 touch-manipulation min-h-[48px]"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Compressing...</span>
                          </>
                        ) : (
                          <>
                            <Minimize2 className="h-5 w-5" />
                            <span>Compress PDF</span>
                          </>
                        )}
                                </button>
                    </div>
                  )}
                </div>
              )}

              {/* PDF to Images */}
              {activeTab === 'pdf-to-images' && (
                <div className="space-y-6">
                  <div
                    {...getRootPropsPDF()}
                    className={`border-2 border-dashed rounded-lg p-6 sm:p-8 md:p-12 text-center cursor-pointer transition-colors touch-manipulation ${
                      isDragActivePDF
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50 active:bg-purple-50'
                    }`}
                  >
                    <input {...getInputPropsPDF()} />
                    <FileText className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      {isDragActivePDF ? 'Drop PDF here' : 'Drag & drop PDF here'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-900">or click to select a file (converts to PNG)</p>
                  </div>

                  {pdfFile && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{pdfFile.name}</p>
                            <p className="text-xs text-gray-600">{(pdfFile.size / 1024).toFixed(2)} KB</p>
                          </div>
                      <button
                            onClick={() => {
                              setPdfFile(null)
                              setConvertedImages([])
                              setPdfInfo(null)
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors touch-manipulation"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={getPDFInfo}
                          disabled={loading}
                          className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-all text-sm flex items-center justify-center gap-2 touch-manipulation min-h-[44px]"
                        >
                          <Info className="h-4 w-4" />
                          Get PDF Info
                        </button>
                        {pdfInfo && (
                          <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">Pages: <span className="font-semibold text-gray-900">{pdfInfo.pages}</span></p>
                            <p className="text-xs text-gray-600">File Size: <span className="font-semibold text-gray-900">{pdfInfo.fileSize}</span></p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={convertPDFToImages}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 active:scale-95 touch-manipulation min-h-[48px]"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Converting...</span>
                          </>
                        ) : (
                          <>
                            <FileImage className="h-5 w-5" />
                            <span>Convert to PNG</span>
                          </>
                        )}
                      </button>

                      {convertedImages.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Converted Images ({convertedImages.length})
                            </h3>
                            <button
                              onClick={downloadAllImages}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all text-sm flex items-center gap-2 active:scale-95 touch-manipulation min-h-[44px] w-full sm:w-auto"
                            >
                              <Download className="h-4 w-4" />
                              <span>Download All</span>
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                            {convertedImages.map((img, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={img}
                                  alt={`Page ${index + 1}`}
                                  className="w-full h-32 sm:h-40 object-cover rounded-lg border-2 border-gray-200"
                                />
                                <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                  Page {index + 1}
                                </div>
                                <button
                                  onClick={() => downloadImage(index)}
                                  className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center touch-manipulation"
                                >
                                  <Download className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* PDF Rotate */}
              {activeTab === 'pdf-rotate' && (
                <div className="space-y-6">
                  <div
                    {...getRootPropsPDF()}
                    className={`border-2 border-dashed rounded-lg p-6 sm:p-8 md:p-12 text-center cursor-pointer transition-colors touch-manipulation ${
                      isDragActivePDF
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50 active:bg-purple-50'
                    }`}
                  >
                    <input {...getInputPropsPDF()} />
                    <RotateCw className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      {isDragActivePDF ? 'Drop PDF here' : 'Drag & drop PDF here'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-900">or click to select a file</p>
                  </div>

                  {pdfFile && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-purple-600" />
                              <div>
                              <p className="text-sm font-medium text-gray-900">{pdfFile.name}</p>
                              <p className="text-xs text-gray-600">{(pdfFile.size / 1024).toFixed(2)} KB</p>
                              </div>
                            </div>
                            <button
                            onClick={() => {
                              setPdfFile(null)
                              setPdfInfo(null)
                              setRotationAngle(0)
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors touch-manipulation"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 sm:p-6 border-2 border-gray-200">
                        <label className="block text-sm font-semibold text-gray-900 mb-3">Select Rotation Angle:</label>
                        <div className="grid grid-cols-3 gap-3 sm:gap-4">
                          {[90, 180, 270].map((angle) => (
                            <button
                              key={angle}
                              onClick={() => setRotationAngle(angle)}
                              className={`px-4 py-3 rounded-lg font-semibold transition-all touch-manipulation active:scale-95 min-h-[48px] ${
                                rotationAngle === angle
                                  ? 'bg-purple-600 text-white shadow-lg'
                                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                              }`}
                            >
                              {angle}°
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={rotatePDF}
                        disabled={loading || rotationAngle === 0}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 active:scale-95 touch-manipulation min-h-[48px]"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Rotating...</span>
                          </>
                        ) : (
                          <>
                            <RotateCw className="h-5 w-5" />
                            <span>Rotate PDF</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* PDF Info */}
              {activeTab === 'pdf-info' && (
                <div className="space-y-6">
                  <div
                    {...getRootPropsPDF()}
                    className={`border-2 border-dashed rounded-lg p-6 sm:p-8 md:p-12 text-center cursor-pointer transition-colors touch-manipulation ${
                      isDragActivePDF
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50 active:bg-purple-50'
                    }`}
                  >
                    <input {...getInputPropsPDF()} />
                    <FileText className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      {isDragActivePDF ? 'Drop PDF here' : 'Drag & drop PDF here'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-900">or click to select a file</p>
                  </div>

                  {pdfFile && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-purple-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{pdfFile.name}</p>
                              <p className="text-xs text-gray-600">{(pdfFile.size / 1024).toFixed(2)} KB</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setPdfFile(null)
                              setPdfInfo(null)
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors touch-manipulation"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                          <button
                            onClick={getPDFInfo}
                            disabled={loading}
                          className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-all text-sm flex items-center justify-center gap-2 touch-manipulation min-h-[44px]"
                          >
                            <Info className="h-4 w-4" />
                          Get PDF Info
                          </button>
                        </div>
                        {pdfInfo && (
                        <div className="bg-white rounded-lg p-4 sm:p-6 border-2 border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">PDF Information</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                              <span className="text-sm text-gray-600">File Name:</span>
                              <span className="text-sm font-semibold text-gray-900">{pdfInfo.fileName}</span>
                          </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                              <span className="text-sm text-gray-600">Total Pages:</span>
                              <span className="text-sm font-semibold text-gray-900">{pdfInfo.pages}</span>
                      </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-sm text-gray-600">File Size:</span>
                              <span className="text-sm font-semibold text-gray-900">{pdfInfo.fileSize}</span>
                    </div>
                </div>
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

      <MobileBottomAd adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      <Footer />
    </div>
  )
}

