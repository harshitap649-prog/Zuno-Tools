'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'
import { Upload, FileText, Loader2, X, Copy, Check, Download, Share2, History, Settings, Trash2, ZoomIn, ZoomOut, Languages, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

// Dynamically import ad components to avoid SSR issues
const MobileBottomAd = dynamic(() => import('@/components/MobileBottomAd'), { ssr: false })

interface ExtractionHistory {
  id: string
  image: string
  text: string
  language: string
  timestamp: number
  wordCount: number
  charCount: number
}

export default function TextExtractor() {
  const [image, setImage] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [language, setLanguage] = useState<string>('eng')
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<ExtractionHistory[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [progress, setProgress] = useState(0)
  const [imageZoom, setImageZoom] = useState(1)
  const [tesseractAvailable, setTesseractAvailable] = useState<boolean | null>(null)
  const { triggerPopunder } = usePopunderAd()

  // Check if tesseract.js is available on mount (client-side only)
  useEffect(() => {
    // Only check in browser environment
    if (typeof window === 'undefined') {
      setTesseractAvailable(false)
      return
    }
    
    const checkTesseract = async () => {
      try {
        // Try CDN first
        if ((window as any).Tesseract) {
          setTesseractAvailable(true)
          return
        }
        
        // Try loading from CDN
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.4/dist/tesseract.min.js'
          script.onload = () => {
            if ((window as any).Tesseract) {
              setTesseractAvailable(true)
              resolve(true)
            } else {
              reject(new Error('Tesseract not available'))
            }
          }
          script.onerror = () => {
            // Try local import as fallback
            // @ts-ignore
            eval('import("tesseract.js")')
              .then(() => setTesseractAvailable(true))
              .catch(() => setTesseractAvailable(false))
            reject(new Error('CDN failed'))
          }
          document.head.appendChild(script)
        })
      } catch (e) {
        // Try local import as last resort
        try {
          // @ts-ignore
          await eval('import("tesseract.js")')
          setTesseractAvailable(true)
        } catch (e2) {
          setTesseractAvailable(false)
        }
      }
    }
    checkTesseract()
  }, [])

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('text-extractor-history')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Failed to load history:', e)
      }
    }
  }, [])

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
    setProgress(0)
    try {
      // Try to use Tesseract.js for OCR
      let tesseractModule
      let createWorker
      
      try {
        // Ensure we're in browser environment
        if (typeof window === 'undefined') {
          throw new Error('Tesseract.js can only be used in browser environment')
        }
        
        // Try multiple methods to load tesseract.js
        let loadSuccess = false
        
        // Method 1: Try loading from CDN (most reliable)
        try {
          // Load from CDN using dynamic script injection
          if (!(window as any).Tesseract) {
            await new Promise((resolve, reject) => {
              const script = document.createElement('script')
              script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.4/dist/tesseract.min.js'
              script.onload = () => resolve(true)
              script.onerror = () => reject(new Error('CDN load failed'))
              document.head.appendChild(script)
            })
          }
          
          // Use global Tesseract from CDN
          if ((window as any).Tesseract && (window as any).Tesseract.createWorker) {
            createWorker = (window as any).Tesseract.createWorker
            loadSuccess = true
          }
        } catch (cdnError) {
          console.log('CDN load failed, trying local import:', cdnError)
        }
        
        // Method 2: Try local npm package if CDN failed
        if (!loadSuccess) {
          try {
            // @ts-ignore - Dynamic import to prevent build-time resolution
            tesseractModule = await eval('import("tesseract.js")')
            
            // Extract createWorker - tesseract.js v5 exports it directly
            if (tesseractModule.createWorker) {
              createWorker = tesseractModule.createWorker
              loadSuccess = true
            } else if (tesseractModule.default) {
              if (tesseractModule.default.createWorker) {
                createWorker = tesseractModule.default.createWorker
                loadSuccess = true
              } else if (typeof tesseractModule.default === 'function') {
                createWorker = tesseractModule.default
                loadSuccess = true
              }
            }
          } catch (localError) {
            console.log('Local import failed:', localError)
          }
        }
        
        if (!loadSuccess || !createWorker || typeof createWorker !== 'function') {
          throw new Error('Unable to load Tesseract.js from CDN or local package. Please check your internet connection or install tesseract.js: npm install tesseract.js')
        }
      } catch (importError: any) {
        console.error('Tesseract.js load error:', importError)
        const errorMsg = importError.message || String(importError)
        toast.error('Failed to load OCR library')
        setExtractedText(`Failed to load OCR functionality.\n\nError: ${errorMsg}\n\nTrying to load from CDN...\n\nIf this persists:\n1. Check your internet connection\n2. Install locally: npm install tesseract.js\n3. Restart your development server`)
        setLoading(false)
        setProgress(0)
        return
      }
        
      const worker = await createWorker(language)
      
      // Progress tracking
      worker.onProgress = (p: any) => {
        if (p && typeof p.progress === 'number') {
          setProgress(Math.round(p.progress * 100))
        }
      }
        
        const { data: { text } } = await worker.recognize(image)
      const trimmedText = text.trim()
      setExtractedText(trimmedText)
        await worker.terminate()
      
      if (trimmedText) {
        // Save to history
        const wordCount = trimmedText.split(/\s+/).filter((w: string) => w.length > 0).length
        const charCount = trimmedText.length
        const historyItem: ExtractionHistory = {
          id: Date.now().toString(),
          image: image.substring(0, 100) + '...', // Store thumbnail
          text: trimmedText.substring(0, 200) + (trimmedText.length > 200 ? '...' : ''),
          language,
          timestamp: Date.now(),
          wordCount,
          charCount
        }
        
        const updatedHistory = [historyItem, ...history].slice(0, 20)
        setHistory(updatedHistory)
        localStorage.setItem('text-extractor-history', JSON.stringify(updatedHistory))
        
          toast.success('Text extracted successfully!')
        
        // Trigger popunder after successful extraction
        setTimeout(() => {
          triggerPopunder()
        }, 2000)
        } else {
          toast.error('No text found in the image')
      }
    } catch (error: any) {
      console.error('Extraction error:', error)
      const errorMsg = error.message || String(error)
      toast.error('Failed to extract text. Please try again.')
      setExtractedText(`Failed to extract text from image.\n\nError: ${errorMsg}\n\nPlease try:\n1. Using a clearer image\n2. Ensuring the image contains readable text\n3. Trying a different language setting`)
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const exportText = (format: 'txt' | 'json') => {
    if (!extractedText) {
      toast.error('No text to export')
      return
    }

    let content = ''
    let filename = ''
    let mimeType = ''

    if (format === 'txt') {
      content = extractedText
      filename = `extracted-text-${Date.now()}.txt`
      mimeType = 'text/plain'
    } else {
      content = JSON.stringify({
        text: extractedText,
        language,
        wordCount: extractedText.split(/\s+/).filter(w => w.length > 0).length,
        charCount: extractedText.length,
        timestamp: new Date().toISOString()
      }, null, 2)
      filename = `extracted-text-${Date.now()}.json`
      mimeType = 'application/json'
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Text exported!')
  }

  const shareText = async () => {
    if (!extractedText) {
      toast.error('No text to share')
      return
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Extracted Text',
          text: extractedText,
        })
        toast.success('Text shared!')
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          copyToClipboard()
        }
      }
    } else {
      copyToClipboard()
    }
  }

  const loadHistoryItem = (item: ExtractionHistory) => {
    setImage(item.image)
    setExtractedText(item.text)
    setLanguage(item.language)
    setShowHistory(false)
    toast.success('History item loaded!')
  }

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(item => item.id !== id)
    setHistory(updated)
    localStorage.setItem('text-extractor-history', JSON.stringify(updated))
    toast.success('History item deleted!')
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('text-extractor-history')
    toast.success('History cleared!')
  }

  const reset = () => {
    setImage(null)
    setExtractedText('')
    setImageZoom(1)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const wordCount = extractedText.split(/\s+/).filter((w: string) => w.length > 0).length
  const charCount = extractedText.length
  const lineCount = extractedText.split('\n').filter(l => l.trim().length > 0).length

  const supportedLanguages = [
    { code: 'eng', name: 'English' },
    { code: 'spa', name: 'Spanish' },
    { code: 'fra', name: 'French' },
    { code: 'deu', name: 'German' },
    { code: 'ita', name: 'Italian' },
    { code: 'por', name: 'Portuguese' },
    { code: 'rus', name: 'Russian' },
    { code: 'chi_sim', name: 'Chinese (Simplified)' },
    { code: 'jpn', name: 'Japanese' },
    { code: 'ara', name: 'Arabic' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 mb-3 sm:mb-4">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">Text Extractor</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Extract text from images using OCR</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6 justify-center">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-all text-sm sm:text-base flex items-center gap-2 touch-manipulation active:scale-95"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-all text-sm sm:text-base flex items-center gap-2 touch-manipulation active:scale-95"
            >
              <History className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>History ({history.length})</span>
            </button>
            <button
              onClick={reset}
              className="px-3 sm:px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-all text-sm sm:text-base flex items-center gap-2 touch-manipulation active:scale-95"
            >
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Clear All</span>
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Settings
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700 touch-manipulation active:scale-95"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  OCR Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base text-gray-900 bg-white"
                >
                  {supportedLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* History Panel */}
          {showHistory && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <History className="h-5 w-5" />
                  History ({history.length})
                </h3>
                <div className="flex gap-2">
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation active:scale-95"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-gray-500 hover:text-gray-700 touch-manipulation active:scale-95"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {history.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No history yet</p>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-500 mb-1">{formatDate(item.timestamp)}</p>
                          <p className="text-sm sm:text-base text-gray-900 font-medium line-clamp-2">{item.text}</p>
                          <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-600">
                            <span>{item.wordCount} words</span>
                            <span>•</span>
                            <span>{item.charCount} chars</span>
                            <span>•</span>
                            <span>{supportedLanguages.find(l => l.code === item.language)?.name || item.language}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 sm:gap-2">
                          <button
                            onClick={() => loadHistoryItem(item)}
                            className="p-1.5 sm:p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors touch-manipulation active:scale-95"
                            title="Load"
                          >
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                          <button
                            onClick={() => deleteHistoryItem(item.id)}
                            className="p-1.5 sm:p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors touch-manipulation active:scale-95"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
            {!image ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center cursor-pointer transition-colors touch-manipulation active:scale-95 ${
                  isDragActive
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Drop the image here' : 'Drag & drop an image with text'}
                </p>
                <p className="text-sm sm:text-base text-gray-600">or click to select a file</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Progress Indicator */}
                {loading && progress > 0 && (
                  <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Extracting text...</span>
                      <span className="text-sm font-medium text-indigo-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Image Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm sm:text-base font-medium text-gray-900">Image</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setImageZoom(Math.min(2, imageZoom + 0.1))}
                          className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors touch-manipulation active:scale-95"
                          title="Zoom In"
                        >
                          <ZoomIn className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => setImageZoom(Math.max(0.5, imageZoom - 0.1))}
                          className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors touch-manipulation active:scale-95"
                          title="Zoom Out"
                        >
                          <ZoomOut className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    <div className="border rounded-lg overflow-hidden bg-gray-50">
                      <div className="overflow-auto max-h-[300px] sm:max-h-[400px]">
                        <img
                          src={image}
                          alt="Source"
                          className="w-full h-auto object-contain transition-transform"
                          style={{ transform: `scale(${imageZoom})`, transformOrigin: 'top left' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Extracted Text Section */}
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                      <h3 className="text-sm sm:text-base font-medium text-gray-900">Extracted Text</h3>
                      {extractedText && (
                        <div className="flex flex-wrap gap-2">
                        <button
                          onClick={copyToClipboard}
                            className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation active:scale-95"
                        >
                          {copied ? (
                            <>
                                <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                          <button
                            onClick={() => exportText('txt')}
                            className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation active:scale-95"
                          >
                            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Export</span>
                          </button>
                          <button
                            onClick={shareText}
                            className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation active:scale-95"
                          >
                            <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Share</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="border rounded-lg p-3 sm:p-4 bg-gray-50 min-h-[200px] sm:min-h-[300px] max-h-[400px] overflow-y-auto">
                      {loading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 animate-spin mb-2" />
                          <p className="text-sm text-gray-600">Processing image...</p>
                        </div>
                      ) : extractedText ? (
                        <p className="text-sm sm:text-base text-gray-900 whitespace-pre-wrap leading-relaxed">{extractedText}</p>
                      ) : (
                        <p className="text-gray-400 text-center text-sm sm:text-base">Click "Extract Text" to extract text from the image</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                {extractedText && (
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900">Statistics</h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div className="text-center">
                        <p className="text-lg sm:text-xl font-bold text-indigo-600">{wordCount}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Words</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg sm:text-xl font-bold text-indigo-600">{charCount}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Characters</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg sm:text-xl font-bold text-indigo-600">{lineCount}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Lines</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg sm:text-xl font-bold text-indigo-600">{supportedLanguages.find(l => l.code === language)?.name || language}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Language</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Extract Button */}
                <button
                  onClick={extractText}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      <span>Extracting...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Extract Text</span>
                    </>
                  )}
                </button>

                {/* Info Note */}
                {tesseractAvailable === false && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-yellow-800">
                      <strong>Note:</strong> OCR library will be loaded from CDN when you extract text. If you have issues, ensure you have an internet connection or install locally: <code className="bg-yellow-100 px-2 py-1 rounded text-xs">npm install tesseract.js</code>
                    </p>
                  </div>
                )}
                {tesseractAvailable === true && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-green-800">
                      <strong>Ready:</strong> OCR library is available. Make sure your image has clear, readable text for best results.
                    </p>
                  </div>
                )}
                {tesseractAvailable === null && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-blue-800">
                      <strong>Loading:</strong> Checking OCR library availability... The library will be loaded automatically when needed.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileBottomAd adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <Footer />
    </div>
  )
}

