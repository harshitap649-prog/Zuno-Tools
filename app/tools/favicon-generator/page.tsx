'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'
import { Upload, Download, X, Image as ImageIcon, Copy, Check, Share2, Settings, History, Trash2, Code, Eye, Palette, Square, Circle } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

// Dynamically import ad components to avoid SSR issues
const SidebarAd = dynamic(() => import('@/components/SidebarAd'), { ssr: false })
const MobileBottomAd = dynamic(() => import('@/components/MobileBottomAd'), { ssr: false })

interface FaviconHistory {
  id: string
  image: string
  favicons: { size: number; dataUrl: string }[]
  timestamp: number
}

export default function FaviconGenerator() {
  const [image, setImage] = useState<string | null>(null)
  const [favicons, setFavicons] = useState<{ size: number; dataUrl: string }[]>([])
  const [selectedSizes, setSelectedSizes] = useState<number[]>([16, 32, 48, 64, 128, 256])
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<FaviconHistory[]>([])
  const [copied, setCopied] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [shape, setShape] = useState<'square' | 'circle'>('square')
  const [quality, setQuality] = useState(1)
  const [showHTMLCode, setShowHTMLCode] = useState(false)
  const { triggerPopunder } = usePopunderAd()

  const allSizes = [16, 32, 48, 64, 96, 128, 144, 180, 192, 256, 512]

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('favicon-generator-history')
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
        setFavicons([])
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

  const generateFavicons = () => {
    if (!image) return

    const img = new Image()
    img.src = image

    img.onload = () => {
      const generated: { size: number; dataUrl: string }[] = []

      selectedSizes.forEach(size => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = size
        canvas.height = size

        // Fill background color
        ctx.fillStyle = backgroundColor
        if (shape === 'circle') {
          ctx.beginPath()
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
          ctx.fill()
          ctx.clip()
        } else {
          ctx.fillRect(0, 0, size, size)
        }

        // Draw image
        ctx.drawImage(img, 0, 0, size, size)

        // Apply quality
        const dataUrl = canvas.toDataURL('image/png', quality)
        generated.push({
          size,
          dataUrl
        })
      })

      setFavicons(generated)
      
      // Save to history
      const historyItem: FaviconHistory = {
        id: Date.now().toString(),
        image: image.substring(0, 100) + '...',
        favicons: generated,
        timestamp: Date.now()
      }
      
      const updatedHistory = [historyItem, ...history].slice(0, 10)
      setHistory(updatedHistory)
      localStorage.setItem('favicon-generator-history', JSON.stringify(updatedHistory))
      
      toast.success('Favicons generated successfully!')
      
      // Trigger popunder after generation
      setTimeout(() => {
        triggerPopunder()
      }, 2000)
    }
  }

  const downloadFavicon = (size: number, dataUrl: string) => {
    const link = document.createElement('a')
    link.download = `favicon-${size}x${size}.png`
    link.href = dataUrl
    link.click()
    toast.success(`Downloaded favicon-${size}x${size}.png`)
    
    // Trigger popunder ad after 2 seconds
    setTimeout(() => {
      triggerPopunder()
    }, 2000)
  }

  const downloadAll = () => {
    if (favicons.length === 0) {
      toast.error('No favicons to download')
      return
    }
    
    favicons.forEach((favicon, index) => {
      setTimeout(() => {
        downloadFavicon(favicon.size, favicon.dataUrl)
      }, index * 200)
    })
    toast.success(`Downloading ${favicons.length} favicons...`)
    
    // Trigger popunder ad after 2 seconds (only once for download all)
    setTimeout(() => {
      triggerPopunder()
    }, 2000)
  }

  const copyHTMLCode = () => {
    if (favicons.length === 0) {
      toast.error('Generate favicons first')
      return
    }

    const htmlCode = favicons.map(favicon => 
      `  <link rel="icon" type="image/png" sizes="${favicon.size}x${favicon.size}" href="/favicon-${favicon.size}x${favicon.size}.png">`
    ).join('\n')

    const fullHTML = `<!-- Add these to your HTML <head> section -->\n${htmlCode}\n\n<!-- Or use a single favicon -->\n  <link rel="icon" type="image/png" href="/favicon-32x32.png">`

    navigator.clipboard.writeText(fullHTML)
    setCopied(true)
    toast.success('HTML code copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareFavicons = async () => {
    if (favicons.length === 0) {
      toast.error('Generate favicons first')
      return
    }

    const text = `I generated ${favicons.length} favicons using Zuno Tools Favicon Generator!`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Favicon Generator',
          text: text,
        })
        toast.success('Shared!')
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          copyHTMLCode()
        }
      }
    } else {
      copyHTMLCode()
    }
  }

  const toggleSize = (size: number) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size].sort((a, b) => a - b)
    )
  }

  const loadHistoryItem = (item: FaviconHistory) => {
    setImage(item.image)
    setFavicons(item.favicons)
    setShowHistory(false)
    toast.success('History item loaded!')
  }

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(item => item.id !== id)
    setHistory(updated)
    localStorage.setItem('favicon-generator-history', JSON.stringify(updated))
    toast.success('History item deleted!')
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('favicon-generator-history')
    toast.success('History cleared!')
  }

  const reset = () => {
    setImage(null)
    setFavicons([])
    setSelectedSizes([16, 32, 48, 64, 128, 256])
    setBackgroundColor('#FFFFFF')
    setShape('square')
    setQuality(1)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <SidebarAd position="right" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 mb-3 sm:mb-4">
              <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">Favicon Generator</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Generate favicons from images in multiple sizes</p>
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
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Favicon Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map(size => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation active:scale-95 ${
                          selectedSizes.includes(size)
                            ? 'bg-pink-600 text-white'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {size}x{size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Background Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="h-10 w-20 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 font-mono"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Shape</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShape('square')}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all text-sm touch-manipulation active:scale-95 flex items-center justify-center gap-2 ${
                        shape === 'square' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <Square className="h-4 w-4" />
                      Square
                    </button>
                    <button
                      onClick={() => setShape('circle')}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all text-sm touch-manipulation active:scale-95 flex items-center justify-center gap-2 ${
                        shape === 'circle' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <Circle className="h-4 w-4" />
                      Circle
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Quality: {Math.round(quality * 100)}%</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
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
                          <p className="text-sm sm:text-base text-gray-900 font-medium">{item.favicons.length} favicons generated</p>
                        </div>
                        <div className="flex gap-1 sm:gap-2">
                          <button
                            onClick={() => loadHistoryItem(item)}
                            className="p-1.5 sm:p-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg transition-colors touch-manipulation active:scale-95"
                            title="Load"
                          >
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
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
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-300 hover:border-pink-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                </p>
                <p className="text-sm sm:text-base text-gray-600">or click to select a file</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">Original Image</h3>
                    <div className="border rounded-lg overflow-hidden bg-gray-50">
                      <img src={image} alt="Original" className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain mx-auto" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm sm:text-base font-medium text-gray-900">Generated Favicons</h3>
                      {favicons.length > 0 && (
                        <div className="flex gap-2">
                          <button
                            onClick={copyHTMLCode}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors touch-manipulation active:scale-95"
                            title="Copy HTML Code"
                          >
                            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Code className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={shareFavicons}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors touch-manipulation active:scale-95"
                            title="Share"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    {favicons.length > 0 ? (
                      <div className="border rounded-lg p-3 sm:p-4 bg-gray-50">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                          {favicons.map((favicon) => (
                            <div key={favicon.size} className="text-center">
                              <div className="bg-white border rounded p-2 mb-2 hover:shadow-md transition-shadow">
                                <img
                                  src={favicon.dataUrl}
                                  alt={`${favicon.size}x${favicon.size}`}
                                  className="w-full h-auto mx-auto"
                                />
                              </div>
                              <p className="text-xs sm:text-sm text-gray-900 mb-1 font-medium">{favicon.size}x{favicon.size}</p>
                              <button
                                onClick={() => downloadFavicon(favicon.size, favicon.dataUrl)}
                                className="text-xs sm:text-sm text-pink-600 hover:text-pink-700 font-medium touch-manipulation active:scale-95"
                              >
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-6 sm:p-8 bg-gray-50 text-center">
                        <p className="text-sm sm:text-base text-gray-400">Click "Generate Favicons" to create favicons</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* HTML Code Display */}
                {showHTMLCode && favicons.length > 0 && (
                  <div className="bg-gray-900 rounded-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                        <Code className="h-4 w-4 sm:h-5 sm:w-5" />
                        HTML Code
                      </h4>
                      <button
                        onClick={() => setShowHTMLCode(false)}
                        className="text-gray-400 hover:text-white touch-manipulation active:scale-95"
                      >
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                    <pre className="text-xs sm:text-sm text-green-400 overflow-x-auto">
                      <code>{favicons.map(favicon => 
                        `  <link rel="icon" type="image/png" sizes="${favicon.size}x${favicon.size}" href="/favicon-${favicon.size}x${favicon.size}.png">`
                      ).join('\n')}</code>
                    </pre>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={generateFavicons}
                    className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation active:scale-95"
                  >
                    <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Generate Favicons</span>
                  </button>
                  {favicons.length > 0 && (
                    <>
                      <button
                        onClick={downloadAll}
                        className="flex-1 sm:flex-none bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation active:scale-95"
                      >
                        <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Download All</span>
                      </button>
                      <button
                        onClick={() => setShowHTMLCode(!showHTMLCode)}
                        className="flex-1 sm:flex-none bg-gray-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation active:scale-95"
                      >
                        <Code className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>HTML Code</span>
                      </button>
                    </>
                  )}
                </div>
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

