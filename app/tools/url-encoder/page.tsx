'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'
import { Link as LinkIcon, Copy, Check, ArrowLeftRight, Download, Share2, History, Settings, X, Trash2, RefreshCw, FileText, BarChart3, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

// Dynamically import ad components to avoid SSR issues
const SidebarAd = dynamic(() => import('@/components/SidebarAd'), { ssr: false })
const MobileBottomAd = dynamic(() => import('@/components/MobileBottomAd'), { ssr: false })

interface EncodingHistory {
  id: string
  input: string
  output: string
  mode: 'encode' | 'decode'
  encodingType: string
  timestamp: number
}

export default function URLEncoder() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [copied, setCopied] = useState(false)
  const [encodingType, setEncodingType] = useState<'url' | 'base64' | 'uri'>('url')
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<EncodingHistory[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [realTime, setRealTime] = useState(false)
  const { triggerPopunder } = usePopunderAd()

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('url-encoder-history')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Failed to load history:', e)
      }
    }
  }, [])

  // Real-time encoding/decoding
  useEffect(() => {
    if (realTime) {
      const timer = setTimeout(() => {
        if (!input.trim()) {
          setOutput('')
          return
        }
        
        try {
          let result = ''
          if (mode === 'encode') {
            if (encodingType === 'url') {
              result = encodeURIComponent(input)
            } else if (encodingType === 'uri') {
              result = encodeURI(input)
            } else if (encodingType === 'base64') {
              // Properly handle Unicode characters
              try {
                result = btoa(unescape(encodeURIComponent(input)))
              } catch (e) {
                setOutput('')
                return
              }
            }
          } else {
            if (encodingType === 'url') {
              try {
                result = decodeURIComponent(input)
              } catch (e) {
                setOutput('')
                return
              }
            } else if (encodingType === 'uri') {
              try {
                result = decodeURI(input)
              } catch (e) {
                setOutput('')
                return
              }
            } else if (encodingType === 'base64') {
              try {
                // Validate Base64 string
                const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
                if (!base64Regex.test(input.trim())) {
                  setOutput('')
                  return
                }
                result = decodeURIComponent(escape(atob(input.trim())))
              } catch (e) {
                setOutput('')
                return
              }
            }
          }
          setOutput(result)
        } catch (error) {
          setOutput('')
        }
      }, 300) // Debounce for 300ms
      
      return () => clearTimeout(timer)
    }
  }, [input, mode, encodingType, realTime])

  const encode = () => {
    if (!input.trim()) {
      toast.error('Please enter some text to encode')
      return
    }

    try {
      let encoded = ''
      if (encodingType === 'url') {
        encoded = encodeURIComponent(input)
      } else if (encodingType === 'uri') {
        encoded = encodeURI(input)
      } else if (encodingType === 'base64') {
        try {
          // Handle Unicode characters properly
          encoded = btoa(unescape(encodeURIComponent(input)))
        } catch (e) {
          toast.error('Failed to encode to Base64. Please check your input contains valid characters.')
          return
        }
      }
      
      if (!encoded) {
        toast.error('Encoding produced empty result')
        return
      }
      
      setOutput(encoded)
      
      // Save to history
      const historyItem: EncodingHistory = {
        id: Date.now().toString(),
        input: input,
        output: encoded,
        mode: 'encode',
        encodingType,
        timestamp: Date.now()
      }
      
      const updatedHistory = [historyItem, ...history].slice(0, 50) // Increased to 50 items
      setHistory(updatedHistory)
      localStorage.setItem('url-encoder-history', JSON.stringify(updatedHistory))
      
      toast.success('Encoded successfully!')
      
      // Trigger popunder after encoding
      setTimeout(() => {
        triggerPopunder()
      }, 2000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to encode. Please check your input.')
    }
  }

  const decode = () => {
    if (!input.trim()) {
      toast.error('Please enter some text to decode')
      return
    }

    try {
      let decoded = ''
      if (encodingType === 'url') {
        try {
          decoded = decodeURIComponent(input)
        } catch (e) {
          toast.error('Invalid URL encoded string. Please check your input.')
          return
        }
      } else if (encodingType === 'uri') {
        try {
          decoded = decodeURI(input)
        } catch (e) {
          toast.error('Invalid URI encoded string. Please check your input.')
          return
        }
      } else if (encodingType === 'base64') {
        try {
          // Validate Base64 string format
          const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
          const trimmedInput = input.trim().replace(/\s/g, '') // Remove whitespace
          
          if (!trimmedInput) {
            toast.error('Empty Base64 string')
            return
          }
          
          if (!base64Regex.test(trimmedInput)) {
            toast.error('Invalid Base64 format. Base64 strings can only contain A-Z, a-z, 0-9, +, /, and = characters.')
            return
          }
          
          // Check if length is valid (must be multiple of 4 after padding)
          if (trimmedInput.length % 4 !== 0) {
            toast.error('Invalid Base64 length. Base64 strings must have length that is a multiple of 4.')
            return
          }
          
          decoded = decodeURIComponent(escape(atob(trimmedInput)))
        } catch (e: any) {
          toast.error('Invalid Base64 string. ' + (e.message || 'Please check your input.'))
          return
        }
      }
      
      if (decoded === undefined || decoded === null) {
        toast.error('Decoding produced invalid result')
        return
      }
      
      setOutput(decoded)
      
      // Save to history
      const historyItem: EncodingHistory = {
        id: Date.now().toString(),
        input: input,
        output: decoded,
        mode: 'decode',
        encodingType,
        timestamp: Date.now()
      }
      
      const updatedHistory = [historyItem, ...history].slice(0, 50) // Increased to 50 items
      setHistory(updatedHistory)
      localStorage.setItem('url-encoder-history', JSON.stringify(updatedHistory))
      
      toast.success('Decoded successfully!')
      
      // Trigger popunder after decoding
      setTimeout(() => {
        triggerPopunder()
      }, 2000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to decode. Please check your input.')
    }
  }

  const handleConvert = () => {
    if (!input.trim()) {
      toast.error('Please enter some text')
      return
    }
    if (mode === 'encode') {
      encode()
    } else {
      decode()
    }
  }

  const copyToClipboard = (text?: string) => {
    const textToCopy = text || output
    if (!textToCopy) return
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const swapMode = () => {
    if (!output && !input) {
      toast.error('Nothing to swap')
      return
    }
    
    // Swap input and output
    const tempInput = input
    const tempOutput = output
    
    setInput(tempOutput || '')
    setOutput(tempInput || '')
    
    // Toggle mode
    setMode(mode === 'encode' ? 'decode' : 'encode')
    
    toast.success('Swapped!')
  }

  const exportData = (format: 'txt' | 'json') => {
    if (!output) {
      toast.error('No output to export')
      return
    }

    let content = ''
    let filename = ''
    let mimeType = ''

    if (format === 'txt') {
      content = `URL ${mode === 'encode' ? 'Encoded' : 'Decoded'} Result\n${'='.repeat(50)}\n\nInput:\n${input}\n\nOutput:\n${output}`
      filename = `url-${mode}-${Date.now()}.txt`
      mimeType = 'text/plain'
    } else {
      content = JSON.stringify({
        input,
        output,
        mode,
        encodingType,
        timestamp: new Date().toISOString()
      }, null, 2)
      filename = `url-${mode}-${Date.now()}.json`
      mimeType = 'application/json'
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Exported!')
  }

  const shareResult = async () => {
    if (!output) {
      toast.error('No output to share')
      return
    }

    const text = `${mode === 'encode' ? 'Encoded' : 'Decoded'}: ${output}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `URL ${mode === 'encode' ? 'Encoder' : 'Decoder'}`,
          text: text,
        })
        toast.success('Shared!')
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          copyToClipboard(output)
        }
      }
    } else {
      copyToClipboard(output)
    }
  }

  const loadHistoryItem = (item: EncodingHistory) => {
    // Load the full input/output from history
    setInput(item.input)
    setOutput(item.output)
    setMode(item.mode)
    setEncodingType(item.encodingType as 'url' | 'base64' | 'uri')
    setShowHistory(false)
    toast.success('History item loaded!')
  }

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(item => item.id !== id)
    setHistory(updated)
    localStorage.setItem('url-encoder-history', JSON.stringify(updated))
    toast.success('History item deleted!')
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('url-encoder-history')
    toast.success('History cleared!')
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    toast.success('Cleared!')
  }

  const loadExample = (example: string) => {
    if (mode === 'encode') {
      setInput(example)
      setOutput('') // Clear output when loading new example
    } else {
      // For decode mode, encode the example first
      try {
        if (encodingType === 'url') {
          setInput(encodeURIComponent(example))
        } else if (encodingType === 'uri') {
          setInput(encodeURI(example))
        } else if (encodingType === 'base64') {
          setInput(btoa(unescape(encodeURIComponent(example))))
        }
        setOutput('') // Clear output when loading new example
      } catch (e) {
        toast.error('Failed to load example')
        return
      }
    }
    toast.success('Example loaded!')
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const inputCharCount = input.length
  const outputCharCount = output.length
  const inputWordCount = input.split(/\s+/).filter(w => w.length > 0).length

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <SidebarAd position="right" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 mb-3 sm:mb-4">
              <LinkIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">URL Encoder/Decoder</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Encode and decode URL strings</p>
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
              onClick={clearAll}
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
                  <label className="block text-sm font-medium text-gray-900 mb-2">Encoding Type</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setEncodingType('url')}
                      className={`px-3 py-2 rounded-lg font-medium transition-all text-sm touch-manipulation active:scale-95 ${
                        encodingType === 'url' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      URL Component
                    </button>
                    <button
                      onClick={() => setEncodingType('uri')}
                      className={`px-3 py-2 rounded-lg font-medium transition-all text-sm touch-manipulation active:scale-95 ${
                        encodingType === 'uri' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      URI
                    </button>
                    <button
                      onClick={() => setEncodingType('base64')}
                      className={`px-3 py-2 rounded-lg font-medium transition-all text-sm touch-manipulation active:scale-95 ${
                        encodingType === 'base64' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      Base64
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="realtime"
                    checked={realTime}
                    onChange={(e) => setRealTime(e.target.checked)}
                    className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="realtime" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Real-time encoding/decoding
                  </label>
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
                          <p className="text-sm sm:text-base text-gray-900 font-medium line-clamp-2 break-all">
                            {item.input.length > 100 ? item.input.substring(0, 100) + '...' : item.input}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">{item.mode} • {item.encodingType}</p>
                        </div>
                        <div className="flex gap-1 sm:gap-2">
                          <button
                            onClick={() => loadHistoryItem(item)}
                            className="p-1.5 sm:p-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg transition-colors touch-manipulation active:scale-95"
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

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            {/* Mode Toggle */}
            <div className="flex justify-center">
              <div className="inline-flex rounded-lg border-2 border-gray-200 p-1">
                <button
                  onClick={() => setMode('encode')}
                  className={`px-4 sm:px-6 py-2 rounded-md font-semibold transition-all text-sm sm:text-base touch-manipulation active:scale-95 ${
                    mode === 'encode'
                      ? 'bg-pink-600 text-white'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Encode
                </button>
                <button
                  onClick={() => setMode('decode')}
                  className={`px-4 sm:px-6 py-2 rounded-md font-semibold transition-all text-sm sm:text-base touch-manipulation active:scale-95 ${
                    mode === 'decode'
                      ? 'bg-pink-600 text-white'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Decode
                </button>
              </div>
            </div>

            {/* Statistics */}
            {(input || output) && (
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">Statistics</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center">
                    <p className="text-lg sm:text-xl font-bold text-pink-600">{inputCharCount}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Input Chars</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-xl font-bold text-pink-600">{outputCharCount}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Output Chars</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-xl font-bold text-pink-600">{inputWordCount}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Words</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-xl font-bold text-pink-600">{encodingType.toUpperCase()}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Type</p>
                  </div>
                </div>
              </div>
            )}

            {/* Examples */}
            {mode === 'encode' && !input && (
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 sm:p-4">
                <h4 className="text-sm font-semibold text-pink-900 mb-2">Quick Examples:</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => loadExample('Hello World')}
                    className="px-3 py-1.5 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation active:scale-95"
                  >
                    Hello World
                  </button>
                  <button
                    onClick={() => loadExample('https://example.com?q=test')}
                    className="px-3 py-1.5 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation active:scale-95"
                  >
                    URL Example
                  </button>
                  <button
                    onClick={() => loadExample('Special chars: !@#$%')}
                    className="px-3 py-1.5 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation active:scale-95"
                  >
                    Special Chars
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm sm:text-base font-medium text-gray-900">
                    {mode === 'encode' ? 'Text to Encode' : 'URL to Decode'}
                  </label>
                  {input && (
                    <button
                      onClick={() => setInput('')}
                      className="p-1 text-gray-400 hover:text-gray-600 touch-manipulation active:scale-95"
                      title="Clear"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter URL encoded string...'}
                  rows={10}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none font-mono text-xs sm:text-sm text-gray-900"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm sm:text-base font-medium text-gray-900">
                    {mode === 'encode' ? 'Encoded Result' : 'Decoded Result'}
                  </label>
                  {output && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard()}
                        className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation active:scale-95"
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
                        onClick={() => exportData('txt')}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors touch-manipulation active:scale-95"
                        title="Export"
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={shareResult}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors touch-manipulation active:scale-95"
                        title="Share"
                      >
                        <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <textarea
                  value={output}
                  readOnly
                  placeholder="Result will appear here..."
                  rows={10}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 resize-none font-mono text-xs sm:text-sm text-gray-900"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleConvert}
                disabled={realTime}
                className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {realTime ? (
                  <>
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Real-time Active</span>
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>{mode === 'encode' ? 'Encode' : 'Decode'}</span>
                  </>
                )}
              </button>
              <button
                onClick={swapMode}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95 touch-manipulation"
              >
                <ArrowLeftRight className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Swap</span>
              </button>
              {output && (
                <button
                  onClick={() => exportData('json')}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95 touch-manipulation"
                >
                  <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <MobileBottomAd adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <Footer />
    </div>
  )
}

