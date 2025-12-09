'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'
import { Type, Copy, Check, Download, Share2, History, Settings, X, Trash2, BarChart3, RefreshCw, FileText, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

// Dynamically import ad components to avoid SSR issues
const SidebarAd = dynamic(() => import('@/components/SidebarAd'), { ssr: false })
const MobileBottomAd = dynamic(() => import('@/components/MobileBottomAd'), { ssr: false })

interface ConversionHistory {
  id: string
  text: string
  conversions: { [key: string]: string }
  timestamp: number
}

export default function CaseConverter() {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<ConversionHistory[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [selectedCases, setSelectedCases] = useState<string[]>(['uppercase', 'lowercase', 'title', 'sentence', 'camel', 'pascal', 'snake', 'kebab', 'constant', 'train', 'dot', 'path'])
  const { triggerPopunder } = usePopunderAd()

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('case-converter-history')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Failed to load history:', e)
      }
    }
  }, [])

  const convert = (type: string, inputText?: string) => {
    const textToConvert = inputText || text
    if (!textToConvert.trim()) return ''
    
    try {
      switch (type) {
        case 'uppercase':
          return textToConvert.toUpperCase()
        
        case 'lowercase':
          return textToConvert.toLowerCase()
        
        case 'title':
          // Title Case: Capitalize first letter of each word
          return textToConvert
            .toLowerCase()
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        
        case 'sentence':
          // Sentence case: Only first letter of first word capitalized
          if (textToConvert.length === 0) return ''
          return textToConvert.charAt(0).toUpperCase() + textToConvert.slice(1).toLowerCase()
        
        case 'camel':
          // camelCase: first word lowercase, rest capitalized, no spaces
          const camelWords = textToConvert
            .trim()
            .split(/[\s\-_]+/)
            .filter(w => w.length > 0)
            .map((word, index) => {
              const cleanWord = word.replace(/[^\w]/g, '')
              if (!cleanWord) return ''
              if (index === 0) {
                return cleanWord.charAt(0).toLowerCase() + cleanWord.slice(1).toLowerCase()
              }
              return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase()
            })
            .filter(w => w.length > 0)
          return camelWords.length > 0 ? camelWords.join('') : textToConvert.toLowerCase()
        
        case 'pascal':
          // PascalCase: All words capitalized, no spaces
          const pascalWords = textToConvert
            .trim()
            .split(/[\s\-_]+/)
            .filter(w => w.length > 0)
            .map(word => {
              const cleanWord = word.replace(/[^\w]/g, '')
              if (!cleanWord) return ''
              return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase()
            })
            .filter(w => w.length > 0)
          return pascalWords.length > 0 ? pascalWords.join('') : textToConvert.charAt(0).toUpperCase() + textToConvert.slice(1).toLowerCase()
        
        case 'snake':
          // snake_case: lowercase with underscores
          const snakeWords = textToConvert
            .trim()
            .split(/[\s\-]+/)
            .filter(w => w.length > 0)
            .map(word => word.replace(/[^\w]/g, '').toLowerCase())
            .filter(w => w.length > 0)
          return snakeWords.length > 0 ? snakeWords.join('_') : textToConvert.toLowerCase().replace(/\s+/g, '_')
        
        case 'kebab':
          // kebab-case: lowercase with hyphens
          const kebabWords = textToConvert
            .trim()
            .split(/[\s_]+/)
            .filter(w => w.length > 0)
            .map(word => word.replace(/[^\w]/g, '').toLowerCase())
            .filter(w => w.length > 0)
          return kebabWords.length > 0 ? kebabWords.join('-') : textToConvert.toLowerCase().replace(/\s+/g, '-')
        
        case 'constant':
          // CONSTANT_CASE: UPPERCASE with underscores
          const constantWords = textToConvert
            .trim()
            .split(/[\s\-_]+/)
            .filter(w => w.length > 0)
            .map(word => word.replace(/[^\w]/g, '').toUpperCase())
            .filter(w => w.length > 0)
          return constantWords.length > 0 ? constantWords.join('_') : textToConvert.toUpperCase().replace(/\s+/g, '_')
        
        case 'train':
          // Train-Case: Title-Case-With-Hyphens
          const trainWords = textToConvert
            .trim()
            .split(/[\s_]+/)
            .filter(w => w.length > 0)
            .map(word => {
              const cleanWord = word.replace(/[^\w]/g, '')
              return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase()
            })
            .filter(w => w.length > 0)
          return trainWords.length > 0 ? trainWords.join('-') : textToConvert.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          ).replace(/\s+/g, '-')
        
        case 'dot':
          // dot.case: lowercase with dots
          const dotWords = textToConvert
            .trim()
            .split(/[\s\-_]+/)
            .filter(w => w.length > 0)
            .map(word => word.replace(/[^\w]/g, '').toLowerCase())
            .filter(w => w.length > 0)
          return dotWords.length > 0 ? dotWords.join('.') : textToConvert.toLowerCase().replace(/\s+/g, '.')
        
        case 'path':
          // path/case: lowercase with slashes
          const pathWords = textToConvert
            .trim()
            .split(/[\s\-_]+/)
            .filter(w => w.length > 0)
            .map(word => word.replace(/[^\w]/g, '').toLowerCase())
            .filter(w => w.length > 0)
          return pathWords.length > 0 ? pathWords.join('/') : textToConvert.toLowerCase().replace(/\s+/g, '/')
        
        case 'alternating':
          // AlTeRnAtInG cAsE: alternating uppercase and lowercase
          return textToConvert
            .split('')
            .map((char, index) => index % 2 === 0 ? char.toUpperCase() : char.toLowerCase())
            .join('')
        
        case 'inverse':
          // iNvErSe CaSe: swap uppercase and lowercase
          return textToConvert
            .split('')
            .map(char => {
              if (char === char.toUpperCase() && char !== char.toLowerCase()) {
                return char.toLowerCase()
              } else if (char === char.toLowerCase() && char !== char.toUpperCase()) {
                return char.toUpperCase()
              }
              return char
            })
            .join('')
        
        case 'swap':
          // Swap Case: swap all uppercase to lowercase and vice versa
          return textToConvert
            .split('')
            .map(char => {
              if (char === char.toUpperCase() && char !== char.toLowerCase()) {
                return char.toLowerCase()
              } else if (char === char.toLowerCase() && char !== char.toUpperCase()) {
                return char.toUpperCase()
              }
              return char
            })
            .join('')
        
        case 'capitalize':
          // Capitalize: only first letter uppercase
          if (textToConvert.length === 0) return ''
          return textToConvert.charAt(0).toUpperCase() + textToConvert.slice(1).toLowerCase()
        
        case 'flat':
          // flatcase: all lowercase, no spaces or separators
          return textToConvert
            .toLowerCase()
            .replace(/[^\w]/g, '')
        
        case 'pascal-snake':
          // Pascal_Snake_Case: PascalCase with underscores
          const pascalSnakeWords = textToConvert
            .trim()
            .split(/[\s\-]+/)
            .filter(w => w.length > 0)
            .map(word => {
              const cleanWord = word.replace(/[^\w]/g, '')
              return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase()
            })
            .filter(w => w.length > 0)
          return pascalSnakeWords.length > 0 ? pascalSnakeWords.join('_') : textToConvert.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          ).replace(/\s+/g, '_')
        
        case 'cobol':
          // COBOL-CASE: UPPERCASE with hyphens
          const cobolWords = textToConvert
            .trim()
            .split(/[\s_]+/)
            .filter(w => w.length > 0)
            .map(word => word.replace(/[^\w]/g, '').toUpperCase())
            .filter(w => w.length > 0)
          return cobolWords.length > 0 ? cobolWords.join('-') : textToConvert.toUpperCase().replace(/\s+/g, '-')
        
        default:
          return textToConvert
      }
    } catch (error) {
      console.error('Conversion error:', error)
      return textToConvert
    }
  }

  const getAllConversions = () => {
    const conversions: { [key: string]: string } = {}
    cases.forEach(caseType => {
      conversions[caseType.id] = convert(caseType.id)
    })
    return conversions
  }

  const saveToHistory = () => {
    if (!text.trim()) return
    
    const conversions = getAllConversions()
    const historyItem: ConversionHistory = {
      id: Date.now().toString(),
      text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      conversions,
      timestamp: Date.now()
    }
    
    const updatedHistory = [historyItem, ...history].slice(0, 20)
    setHistory(updatedHistory)
    localStorage.setItem('case-converter-history', JSON.stringify(updatedHistory))
  }

  const copyToClipboard = (convertedText: string, caseId?: string) => {
    navigator.clipboard.writeText(convertedText)
    setCopied(caseId || convertedText)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(null), 2000)
    
    // Save to history on copy
    saveToHistory()
    
    // Trigger popunder after copy
    setTimeout(() => {
      triggerPopunder()
    }, 2000)
  }

  const copyAllConversions = () => {
    if (!text.trim()) {
      toast.error('No text to copy')
      return
    }
    
    const conversions = getAllConversions()
    const allText = Object.entries(conversions)
      .map(([key, value]) => `${cases.find(c => c.id === key)?.name}: ${value}`)
      .join('\n\n')
    
    navigator.clipboard.writeText(allText)
    toast.success('All conversions copied!')
    saveToHistory()
  }

  const exportConversions = (format: 'txt' | 'json') => {
    if (!text.trim()) {
      toast.error('No text to export')
      return
    }

    const conversions = getAllConversions()
    let content = ''
    let filename = ''
    let mimeType = ''

    if (format === 'txt') {
      content = `Case Converter Results\n${'='.repeat(50)}\n\nOriginal Text:\n${text}\n\nConversions:\n\n`
      Object.entries(conversions).forEach(([key, value]) => {
        const caseName = cases.find(c => c.id === key)?.name || key
        content += `${caseName}:\n${value}\n\n`
      })
      filename = `case-conversions-${Date.now()}.txt`
      mimeType = 'text/plain'
    } else {
      content = JSON.stringify({
        original: text,
        conversions,
        timestamp: new Date().toISOString()
      }, null, 2)
      filename = `case-conversions-${Date.now()}.json`
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
    saveToHistory()
  }

  const shareConversions = async () => {
    if (!text.trim()) {
      toast.error('No text to share')
      return
    }

    const conversions = getAllConversions()
    const textToShare = Object.entries(conversions)
      .map(([key, value]) => `${cases.find(c => c.id === key)?.name}: ${value}`)
      .join('\n')

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Case Converter Results',
          text: textToShare,
        })
        toast.success('Shared!')
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          copyAllConversions()
        }
      }
    } else {
      copyAllConversions()
    }
  }

  const loadHistoryItem = (item: ConversionHistory) => {
    setText(item.text.endsWith('...') ? item.text.slice(0, -3) : item.text)
    setShowHistory(false)
    toast.success('History item loaded!')
  }

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(item => item.id !== id)
    setHistory(updated)
    localStorage.setItem('case-converter-history', JSON.stringify(updated))
    toast.success('History item deleted!')
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('case-converter-history')
    toast.success('History cleared!')
  }

  const clearAll = () => {
    setText('')
    toast.success('Cleared!')
  }

  const toggleCase = (caseId: string) => {
    setSelectedCases(prev => 
      prev.includes(caseId)
        ? prev.filter(id => id !== caseId)
        : [...prev, caseId]
    )
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length
  const charCount = text.length
  const lineCount = text.split('\n').filter(l => l.trim().length > 0).length

  const cases = [
    { id: 'uppercase', name: 'UPPERCASE', description: 'ALL CAPS' },
    { id: 'lowercase', name: 'lowercase', description: 'all small' },
    { id: 'title', name: 'Title Case', description: 'Every Word Capitalized' },
    { id: 'sentence', name: 'Sentence case', description: 'First letter capitalized' },
    { id: 'camel', name: 'camelCase', description: 'camelCaseFormat' },
    { id: 'pascal', name: 'PascalCase', description: 'PascalCaseFormat' },
    { id: 'snake', name: 'snake_case', description: 'snake_case_format' },
    { id: 'kebab', name: 'kebab-case', description: 'kebab-case-format' },
    { id: 'constant', name: 'CONSTANT_CASE', description: 'UPPERCASE_WITH_UNDERSCORES' },
    { id: 'train', name: 'Train-Case', description: 'Title-Case-With-Hyphens' },
    { id: 'dot', name: 'dot.case', description: 'lowercase.with.dots' },
    { id: 'path', name: 'path/case', description: 'lowercase/with/slashes' },
    { id: 'alternating', name: 'AlTeRnAtInG', description: 'Alternating Case' },
    { id: 'inverse', name: 'iNvErSe', description: 'Inverse Case' },
    { id: 'swap', name: 'Swap Case', description: 'Swap upper/lower' },
    { id: 'capitalize', name: 'Capitalize', description: 'First letter only' },
    { id: 'flat', name: 'flatcase', description: 'alllowercasenospaces' },
    { id: 'pascal-snake', name: 'Pascal_Snake', description: 'PascalCase_With_Underscores' },
    { id: 'cobol', name: 'COBOL-CASE', description: 'UPPERCASE-WITH-HYPHENS' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <SidebarAd position="right" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 mb-3 sm:mb-4">
              <Type className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">Case Converter</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Convert text to different cases instantly</p>
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
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Show Case Types</label>
                <div className="flex flex-wrap gap-2">
                  {cases.map(caseType => (
                    <button
                      key={caseType.id}
                      onClick={() => toggleCase(caseType.id)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs sm:text-sm touch-manipulation active:scale-95 ${
                        selectedCases.includes(caseType.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {caseType.name}
                    </button>
                  ))}
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
                          <p className="text-sm sm:text-base text-gray-900 font-medium line-clamp-2 break-words">
                            {item.text.length > 100 ? item.text.substring(0, 100) + '...' : item.text}
                          </p>
                        </div>
                        <div className="flex gap-1 sm:gap-2">
                          <button
                            onClick={() => loadHistoryItem(item)}
                            className="p-1.5 sm:p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors touch-manipulation active:scale-95"
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
            {/* Input Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm sm:text-base font-medium text-gray-900">Your Text</label>
                {text && (
                  <button
                    onClick={() => setText('')}
                    className="p-1 text-gray-400 hover:text-gray-600 touch-manipulation active:scale-95"
                    title="Clear"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to convert..."
                rows={6}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base text-gray-900"
              />
            </div>

            {/* Statistics */}
            {text && (
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">Statistics</h4>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="text-center">
                    <p className="text-lg sm:text-xl font-bold text-blue-600">{wordCount}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Words</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-xl font-bold text-blue-600">{charCount}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Characters</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-xl font-bold text-blue-600">{lineCount}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Lines</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {text && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={copyAllConversions}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base flex items-center justify-center gap-2 touch-manipulation active:scale-95"
                >
                  <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Copy All</span>
                </button>
                <button
                  onClick={() => exportConversions('txt')}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base flex items-center justify-center gap-2 touch-manipulation active:scale-95"
                >
                  <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Export</span>
                </button>
                <button
                  onClick={shareConversions}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base flex items-center justify-center gap-2 touch-manipulation active:scale-95"
                >
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Share</span>
                </button>
              </div>
            )}

            {/* Case Conversions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {cases
                .filter(caseType => selectedCases.includes(caseType.id))
                .map((caseType) => {
                  const userText = text.trim()
                  const sampleText = 'Hello World 123'
                  const sourceText = userText || sampleText
                  const converted = convert(caseType.id, sourceText)
                  const isSample = !userText
                  const hasOutput = converted.length > 0
                  const isDifferent = hasOutput && converted !== sourceText
                  
                  return (
                    <div 
                      key={caseType.id} 
                      className={`border-2 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all bg-white ${
                        isDifferent ? 'border-blue-300' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{caseType.name}</h3>
                          <p className="text-xs text-gray-600 mt-1">{caseType.description}</p>
                          {isSample && (
                            <p className="text-[11px] text-gray-500 mt-1 italic">Sample preview (enter text to use your own)</p>
                          )}
                        </div>
                        {hasOutput && (
                          <button
                            onClick={() => copyToClipboard(converted, caseType.id)}
                            className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors touch-manipulation active:scale-95 flex-shrink-0 ml-2"
                            title="Copy"
                          >
                            {copied === caseType.id ? (
                              <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className={`rounded p-2 sm:p-3 min-h-[50px] sm:min-h-[60px] ${
                        hasOutput ? (isDifferent ? 'bg-blue-50' : 'bg-gray-50') : 'bg-gray-100'
                      }`}>
                        {hasOutput ? (
                          <p className={`text-xs sm:text-sm font-mono break-words whitespace-pre-wrap ${
                            isDifferent ? 'text-blue-900 font-semibold' : 'text-gray-900'
                          }`}>
                            {converted}
                          </p>
                        ) : (
                          <p className="text-xs sm:text-sm text-gray-400 italic">Enter text to see conversion...</p>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* Empty State */}
            {selectedCases.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm sm:text-base">No case types selected. Enable them in Settings.</p>
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

