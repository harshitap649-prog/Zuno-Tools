'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'
import { Code, Copy, Check, Download, Settings, Share2, FileText, AlertCircle, X, History, Trash2, Maximize2, Minimize2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

// Dynamically import ad components to avoid SSR issues
const SidebarAd = dynamic(() => import('@/components/SidebarAd'), { ssr: false })
const MobileBottomAd = dynamic(() => import('@/components/MobileBottomAd'), { ssr: false })

type Language = 'json' | 'javascript' | 'typescript' | 'html' | 'css' | 'xml' | 'python' | 'sql' | 'yaml' | 'markdown'

export default function CodeFormatter() {
  const [code, setCode] = useState('')
  const [formattedCode, setFormattedCode] = useState('')
  const [language, setLanguage] = useState<Language>('json')
  const [copied, setCopied] = useState(false)
  const [indentSize, setIndentSize] = useState(2)
  const [useTabs, setUseTabs] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [codeHistory, setCodeHistory] = useState<Array<{ id: string; language: Language; code: string; timestamp: number }>>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { triggerPopunder } = usePopunderAd()

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('code-formatter-history')
    if (saved) {
      try {
        setCodeHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load history:', e)
      }
    }
  }, [])

  const getIndent = (level: number) => {
    if (useTabs) return '\t'.repeat(level)
    return ' '.repeat(level * indentSize)
  }

  const formatCode = () => {
    if (!code.trim()) {
      toast.error('Please enter some code')
      return
    }

    setError(null)
    try {
      let formatted = ''

      if (language === 'json') {
        const parsed = JSON.parse(code)
        formatted = JSON.stringify(parsed, null, useTabs ? '\t' : indentSize)
      } else if (language === 'javascript' || language === 'typescript') {
        formatted = formatJavaScript(code, indentSize, useTabs)
      } else if (language === 'html' || language === 'xml') {
        formatted = formatHTML(code, indentSize, useTabs)
      } else if (language === 'css') {
        formatted = formatCSS(code, indentSize, useTabs)
      } else if (language === 'python') {
        formatted = formatPython(code, indentSize, useTabs)
      } else if (language === 'sql') {
        formatted = formatSQL(code, indentSize, useTabs)
      } else if (language === 'yaml') {
        formatted = formatYAML(code, indentSize, useTabs)
      } else if (language === 'markdown') {
        formatted = code // Markdown is already formatted
      }

      setFormattedCode(formatted)
      
      // Save to history
      const historyItem = {
        id: Date.now().toString(),
        language,
        code: formatted,
        timestamp: Date.now(),
      }
      const updatedHistory = [historyItem, ...codeHistory.slice(0, 9)]
      setCodeHistory(updatedHistory)
      localStorage.setItem('code-formatter-history', JSON.stringify(updatedHistory))
      
      toast.success('Code formatted successfully!')
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to format code. Please check syntax.'
      setError(errorMsg)
      toast.error(errorMsg)
      console.error('Format error:', error)
    }
  }

  const formatJavaScript = (code: string, indent: number, tabs: boolean): string => {
    let indentLevel = 0
    const indentStr = tabs ? '\t' : ' '.repeat(indent)
    const lines = code.split('\n')
    const formatted: string[] = []

    for (let line of lines) {
      line = line.trim()
      if (!line) {
        formatted.push('')
        continue
      }

      // Decrease indent before closing braces/brackets
      if (line.startsWith('}') || line.startsWith(']')) {
        indentLevel = Math.max(0, indentLevel - 1)
      }

      formatted.push((tabs ? '\t' : ' ').repeat(indentLevel) + line)

      // Increase indent after opening braces/brackets
      if (line.endsWith('{') || line.endsWith('[')) {
        indentLevel++
      }
    }

    return formatted.join('\n')
  }

  const formatHTML = (code: string, indent: number, tabs: boolean): string => {
    const indentStr = tabs ? '\t' : ' '.repeat(indent)
    let indentLevel = 0
    const formatted: string[] = []
    const lines = code.replace(/></g, '>\n<').split('\n')

    for (let line of lines) {
      line = line.trim()
      if (!line) continue

      const isClosing = line.startsWith('</')
      const isSelfClosing = line.endsWith('/>') || line.match(/^<[^>]+\/>$/)

      if (isClosing) {
        indentLevel = Math.max(0, indentLevel - 1)
      }

      formatted.push(indentStr.repeat(indentLevel) + line)

      if (!isClosing && !isSelfClosing && line.startsWith('<')) {
        indentLevel++
      }
    }

    return formatted.join('\n')
  }

  const formatCSS = (code: string, indent: number, tabs: boolean): string => {
    const indentStr = tabs ? '\t' : ' '.repeat(indent)
    let indentLevel = 0
    const formatted: string[] = []
    const lines = code.split('\n')

    for (let line of lines) {
      line = line.trim()
      if (!line) {
        formatted.push('')
        continue
      }

      if (line.includes('}')) {
        indentLevel = Math.max(0, indentLevel - 1)
      }

      formatted.push(indentStr.repeat(indentLevel) + line)

      if (line.includes('{') && !line.includes('}')) {
        indentLevel++
      }
    }

    return formatted.join('\n')
  }

  const formatPython = (code: string, indent: number, tabs: boolean): string => {
    // Python uses indentation, so we just normalize it
    const indentStr = tabs ? '\t' : ' '.repeat(indent)
    const lines = code.split('\n')
    return lines.map(line => {
      if (!line.trim()) return ''
      // Count leading spaces/tabs and normalize
      const match = line.match(/^(\s*)/)
      if (match) {
        const leading = match[1]
        const normalized = leading.replace(/\t/g, indentStr).replace(/ +/g, (m) => {
          const spaces = m.length
          return indentStr.repeat(Math.floor(spaces / indent))
        })
        return normalized + line.trim()
      }
      return line
    }).join('\n')
  }

  const formatSQL = (code: string, indent: number, tabs: boolean): string => {
    const indentStr = tabs ? '\t' : ' '.repeat(indent)
    const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'UNION']
    let formatted = code.toUpperCase()
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      formatted = formatted.replace(regex, `\n${keyword}`)
    })
    
    return formatted.split('\n').map((line, i) => {
      if (i === 0) return line.trim()
      return indentStr + line.trim()
    }).join('\n').trim()
  }

  const formatYAML = (code: string, indent: number, tabs: boolean): string => {
    // YAML is sensitive to indentation, so we just normalize spaces
    const indentStr = tabs ? '\t' : ' '.repeat(indent)
    const lines = code.split('\n')
    return lines.map(line => {
      if (!line.trim()) return ''
      const match = line.match(/^(\s*)/)
      if (match) {
        const leading = match[1]
        const level = leading.length / 2 // YAML typically uses 2 spaces
        return indentStr.repeat(level) + line.trim()
      }
      return line
    }).join('\n')
  }

  const minifyCode = () => {
    if (!code.trim()) {
      toast.error('Please enter some code')
      return
    }

    setError(null)
    try {
      let minified = ''

      if (language === 'json') {
        const parsed = JSON.parse(code)
        minified = JSON.stringify(parsed)
      } else if (language === 'html' || language === 'xml') {
        minified = code
          .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
          .replace(/>\s+</g, '><') // Remove whitespace between tags
          .replace(/\s+/g, ' ') // Replace multiple spaces
          .trim()
      } else if (language === 'css') {
        minified = code
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
          .replace(/\s+/g, ' ') // Replace multiple spaces
          .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around operators
          .replace(/;\s*}/g, '}') // Remove semicolon before closing brace
          .trim()
      } else if (language === 'yaml') {
        minified = code.replace(/\n\s*\n/g, '\n').trim()
      } else {
        minified = code
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
          .replace(/\/\/.*/g, '') // Remove line comments
          .replace(/#.*/g, '') // Remove Python-style comments
          .replace(/--.*/g, '') // Remove SQL comments
          .replace(/\s+/g, ' ') // Replace multiple spaces
          .replace(/\s*([{}();,=+\-*/])\s*/g, '$1') // Remove spaces around operators
          .trim()
      }

      setFormattedCode(minified)
      toast.success('Code minified successfully!')
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to minify code. Please check syntax.'
      setError(errorMsg)
      toast.error(errorMsg)
      console.error('Minify error:', error)
    }
  }

  const getStats = () => {
    const originalLines = code.split('\n').length
    const originalChars = code.length
    const formattedLines = formattedCode.split('\n').length
    const formattedChars = formattedCode.length
    return {
      original: { lines: originalLines, chars: originalChars },
      formatted: { lines: formattedLines, chars: formattedChars },
    }
  }

  const shareCode = async () => {
    if (!formattedCode) {
      toast.error('No code to share')
      return
    }

    const text = `\`\`\`${language}\n${formattedCode}\n\`\`\``
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Formatted Code',
          text: text,
        })
        toast.success('Code shared!')
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          copyToClipboard(formattedCode)
        }
      }
    } else {
      copyToClipboard(formattedCode)
    }
  }

  const loadFromHistory = (item: typeof codeHistory[0]) => {
    setCode(item.code)
    setLanguage(item.language)
    setFormattedCode('')
    setError(null)
    toast.success('Code loaded from history!')
  }

  const deleteHistoryItem = (id: string) => {
    const updated = codeHistory.filter(item => item.id !== id)
    setCodeHistory(updated)
    localStorage.setItem('code-formatter-history', JSON.stringify(updated))
    toast.success('History item deleted!')
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedCode)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadCode = () => {
    if (!formattedCode) {
      toast.error('No code to download')
      return
    }

    const extensions: Record<Language, string> = {
      json: 'json',
      javascript: 'js',
      typescript: 'ts',
      html: 'html',
      css: 'css',
      xml: 'xml',
      python: 'py',
      sql: 'sql',
      yaml: 'yaml',
      markdown: 'md',
    }
    
    const extension = extensions[language] || 'txt'
    const blob = new Blob([formattedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `formatted.${extension}`
    link.click()
    URL.revokeObjectURL(url)
    
    // Trigger popunder ad after 2 seconds
    setTimeout(() => {
      triggerPopunder()
    }, 2000)
    
    toast.success('Code downloaded!')
  }

  const reset = () => {
    setCode('')
    setFormattedCode('')
    setError(null)
    toast.success('Reset complete!')
  }

  const validateCode = () => {
    if (!code.trim()) {
      toast.error('Please enter some code')
      return
    }

    setError(null)
    try {
      if (language === 'json') {
        JSON.parse(code)
        toast.success('Valid JSON!')
      } else {
        toast.success('Code syntax appears valid!')
      }
    } catch (error: any) {
      setError(error.message)
      toast.error('Invalid syntax: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <SidebarAd position="right" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 mb-3 sm:mb-4">
              <Code className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">Code Formatter</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Format and minify code in multiple languages</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            {/* Settings Panel */}
            {showSettings && (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Formatting Settings
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-500 hover:text-gray-700 touch-manipulation active:scale-95"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Indentation Size</label>
                    <select
                      value={indentSize}
                      onChange={(e) => setIndentSize(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
                    >
                      <option value="2">2 Spaces</option>
                      <option value="4">4 Spaces</option>
                      <option value="8">8 Spaces</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Indentation Type</label>
                    <select
                      value={useTabs ? 'tabs' : 'spaces'}
                      onChange={(e) => setUseTabs(e.target.value === 'tabs')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
                    >
                      <option value="spaces">Spaces</option>
                      <option value="tabs">Tabs</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Language and Settings */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Format Your Code</h2>
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value as Language)
                    setFormattedCode('')
                    setError(null)
                  }}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base text-gray-900 bg-white touch-manipulation"
                >
                  <option value="json">JSON</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="xml">XML</option>
                  <option value="python">Python</option>
                  <option value="sql">SQL</option>
                  <option value="yaml">YAML</option>
                  <option value="markdown">Markdown</option>
                </select>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-all flex items-center gap-2 text-sm sm:text-base touch-manipulation active:scale-95"
                >
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Settings</span>
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 sm:p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-900 mb-1">Error</p>
                  <p className="text-xs sm:text-sm text-red-800 break-words">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-700 touch-manipulation active:scale-95"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Code Statistics */}
            {code && (
              <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <span>Original: {code.split('\n').length} lines, {code.length} chars</span>
                {formattedCode && (
                  <span>Formatted: {formattedCode.split('\n').length} lines, {formattedCode.length} chars</span>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Original Code
                  </label>
                  {code && (
                    <button
                      onClick={validateCode}
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium touch-manipulation active:scale-95"
                    >
                      Validate
                    </button>
                  )}
                </div>
                <textarea
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value)
                    setError(null)
                  }}
                  placeholder={`Enter your ${language.toUpperCase()} code here...`}
                  rows={isFullscreen ? 20 : 12}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-xs sm:text-sm text-gray-900"
                />
              </div>

              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Formatted Code
                  </label>
                  {formattedCode && (
                    <div className="flex gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 text-xs sm:text-sm px-2 py-1 rounded touch-manipulation active:scale-95"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Copy</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={shareCode}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-xs sm:text-sm px-2 py-1 rounded touch-manipulation active:scale-95"
                      >
                        <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Share</span>
                      </button>
                      <button
                        onClick={downloadCode}
                        className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-xs sm:text-sm px-2 py-1 rounded touch-manipulation active:scale-95"
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                    </div>
                  )}
                </div>
                <textarea
                  value={formattedCode}
                  readOnly
                  placeholder="Formatted code will appear here..."
                  rows={isFullscreen ? 20 : 12}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 resize-none font-mono text-xs sm:text-sm text-gray-900"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:gap-4">
              <button
                onClick={formatCode}
                disabled={!code.trim()}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation active:scale-95"
              >
                <Code className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Format Code</span>
              </button>
              <button
                onClick={minifyCode}
                disabled={!code.trim()}
                className="flex-1 bg-gray-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base touch-manipulation active:scale-95"
              >
                Minify Code
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="px-4 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-all flex items-center justify-center text-sm sm:text-base touch-manipulation active:scale-95"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5" /> : <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={reset}
                className="w-full sm:w-auto text-gray-600 hover:text-gray-900 py-2 text-sm sm:text-base touch-manipulation active:scale-95"
              >
                Reset
              </button>
            </div>

            {/* Code History */}
            {codeHistory.length > 0 && (
              <div className="border-t border-gray-200 pt-4 sm:pt-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <History className="h-4 w-4 sm:h-5 sm:w-5" />
                    Recent Formats
                  </h3>
                  <button
                    onClick={() => {
                      setCodeHistory([])
                      localStorage.removeItem('code-formatter-history')
                      toast.success('History cleared!')
                    }}
                    className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium touch-manipulation active:scale-95"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {codeHistory.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-semibold text-gray-900 uppercase">{item.language}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {item.code.substring(0, 50)}...
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadFromHistory(item)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation active:scale-95"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteHistoryItem(item.id)}
                          className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation active:scale-95"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
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

