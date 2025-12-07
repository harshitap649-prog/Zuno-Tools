'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'
import { Type, Loader2, Copy, Check, BookOpen, Download, Share2, Trash2, History, Settings, X, FileText, Maximize2, Minimize2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

// Dynamically import ad components to avoid SSR issues
const SidebarAd = dynamic(() => import('@/components/SidebarAd'), { ssr: false })
const MobileBottomAd = dynamic(() => import('@/components/MobileBottomAd'), { ssr: false })

interface SummaryHistory {
  id: string
  notes: string
  summary: string
  keyPoints: string[]
  timestamp: number
  wordCount: number
}

export default function AINoteSummarizer() {
  const [notes, setNotes] = useState('')
  const [summary, setSummary] = useState('')
  const [keyPoints, setKeyPoints] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [summaryLength, setSummaryLength] = useState<'short' | 'medium' | 'long'>('medium')
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<SummaryHistory[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const { triggerPopunder } = usePopunderAd()

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('note-summarizer-history')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Failed to load history:', e)
      }
    }
  }, [])

  const summarize = async () => {
    if (!notes.trim()) {
      toast.error('Please enter your notes')
      return
    }

    setLoading(true)
    try {
      // Simulate AI summarization
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const sentences = notes.split(/[.!?]+/).filter(s => s.trim().length > 0)
      const wordCount = notes.split(/\s+/).filter(w => w.length > 0).length
      
      // Adjust summary length based on setting
      let targetRatio = 0.25
      if (summaryLength === 'short') targetRatio = 0.15
      else if (summaryLength === 'long') targetRatio = 0.4
      
      const targetSentences = Math.max(1, Math.floor(sentences.length * targetRatio))
      
      const summaryText = sentences
        .slice(0, targetSentences)
        .map(s => s.trim())
        .join('. ') + '.'
      
      setSummary(summaryText)

      // Extract key points (improved implementation)
      const keyPointsList = sentences
        .slice(0, Math.min(8, sentences.length))
        .map(s => s.trim())
        .filter(s => s.length > 15)
        .slice(0, 6)
      
      setKeyPoints(keyPointsList)
      
      // Save to history
      const historyItem: SummaryHistory = {
        id: Date.now().toString(),
        notes: notes.substring(0, 200) + (notes.length > 200 ? '...' : ''),
        summary: summaryText,
        keyPoints: keyPointsList,
        timestamp: Date.now(),
        wordCount: wordCount
      }
      
      const updatedHistory = [historyItem, ...history].slice(0, 20)
      setHistory(updatedHistory)
      localStorage.setItem('note-summarizer-history', JSON.stringify(updatedHistory))
      
      toast.success('Notes summarized successfully!')
      
      // Trigger popunder after successful summary
      setTimeout(() => {
        triggerPopunder()
      }, 2000)
    } catch (error) {
      toast.error('Failed to summarize notes')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text?: string) => {
    const textToCopy = text || summary
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const copyKeyPoints = () => {
    const text = keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')
    copyToClipboard(text)
  }

  const exportSummary = (format: 'txt' | 'json') => {
    if (!summary) {
      toast.error('No summary to export')
      return
    }

    let content = ''
    let filename = ''
    let mimeType = ''

    if (format === 'txt') {
      content = `AI Note Summarizer - Summary\n${'='.repeat(50)}\n\n`
      content += `Original Notes (${notes.split(/\s+/).filter(w => w.length > 0).length} words):\n${notes}\n\n`
      content += `Summary:\n${summary}\n\n`
      content += `Key Points:\n${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n`
      filename = `summary-${Date.now()}.txt`
      mimeType = 'text/plain'
    } else {
      content = JSON.stringify({
        notes,
        summary,
        keyPoints,
        wordCount: notes.split(/\s+/).filter(w => w.length > 0).length,
        timestamp: new Date().toISOString()
      }, null, 2)
      filename = `summary-${Date.now()}.json`
      mimeType = 'application/json'
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Summary exported!')
  }

  const shareSummary = async () => {
    if (!summary) {
      toast.error('No summary to share')
      return
    }

    const text = `Summary:\n${summary}\n\nKey Points:\n${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Note Summary',
          text: text,
        })
        toast.success('Summary shared!')
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          copyToClipboard(text)
        }
      }
    } else {
      copyToClipboard(text)
    }
  }

  const loadHistoryItem = (item: SummaryHistory) => {
    setNotes(item.notes.endsWith('...') ? item.notes : item.notes)
    setSummary(item.summary)
    setKeyPoints(item.keyPoints)
    setShowHistory(false)
    toast.success('History item loaded!')
  }

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(item => item.id !== id)
    setHistory(updated)
    localStorage.setItem('note-summarizer-history', JSON.stringify(updated))
    toast.success('History item deleted!')
  }

  const clearAll = () => {
    setNotes('')
    setSummary('')
    setKeyPoints([])
    toast.success('Cleared!')
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('note-summarizer-history')
    toast.success('History cleared!')
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const wordCount = notes.split(/\s+/).filter(w => w.length > 0).length
  const charCount = notes.length
  const summaryWordCount = summary.split(/\s+/).filter(w => w.length > 0).length

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <SidebarAd position="right" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 mb-3 sm:mb-4">
              <Type className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">AI Note Summarizer</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Summarize your notes and study materials</p>
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
                <label className="block text-sm font-medium text-gray-900 mb-2">Summary Length</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSummaryLength('short')}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all text-sm touch-manipulation active:scale-95 ${
                      summaryLength === 'short' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    Short
                  </button>
                  <button
                    onClick={() => setSummaryLength('medium')}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all text-sm touch-manipulation active:scale-95 ${
                      summaryLength === 'medium' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => setSummaryLength('long')}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all text-sm touch-manipulation active:scale-95 ${
                      summaryLength === 'long' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    Long
                  </button>
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
                          <p className="text-sm sm:text-base text-gray-900 font-medium line-clamp-2">{item.notes}</p>
                          <p className="text-xs text-gray-600 mt-1">{item.wordCount} words</p>
                        </div>
                        <div className="flex gap-1 sm:gap-2">
                          <button
                            onClick={() => loadHistoryItem(item)}
                            className="p-1.5 sm:p-2 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-lg transition-colors touch-manipulation active:scale-95"
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Input Section */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Your Notes</span>
                </h2>
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors touch-manipulation active:scale-95"
                  title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullScreen ? <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5" /> : <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste or type your notes here. The AI will create a concise summary and extract key points..."
                rows={isFullScreen ? 30 : 20}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm sm:text-base text-gray-900"
              />
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  <span>{wordCount} words</span>
                  <span>{charCount} characters</span>
                </div>
                <button
                  onClick={summarize}
                  disabled={loading || !notes.trim()}
                  className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      <span>Summarizing...</span>
                    </>
                  ) : (
                    <>
                      <Type className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Summarize Notes</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Output Section */}
            <div className="space-y-4 sm:space-y-6">
              {/* Summary Section */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Summary</h2>
                    {summary && (
                      <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {summaryWordCount} words
                      </span>
                    )}
                  </div>
                  {summary && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => copyToClipboard()}
                        className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all text-xs sm:text-sm font-medium touch-manipulation active:scale-95"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => exportSummary('txt')}
                        className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all text-xs sm:text-sm font-medium touch-manipulation active:scale-95"
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Export</span>
                      </button>
                      <button
                        onClick={shareSummary}
                        className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all text-xs sm:text-sm font-medium touch-manipulation active:scale-95"
                      >
                        <Share2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Share</span>
                      </button>
                    </div>
                  )}
                </div>
                <div className="border border-gray-300 rounded-lg p-3 sm:p-4 min-h-[150px] sm:min-h-[200px] bg-gray-50">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-teal-600 animate-spin" />
                    </div>
                  ) : summary ? (
                    <p className="text-sm sm:text-base text-gray-900 whitespace-pre-wrap leading-relaxed">{summary}</p>
                  ) : (
                    <p className="text-gray-400 text-center text-sm sm:text-base">Your summary will appear here...</p>
                  )}
                </div>
              </div>

              {/* Key Points Section */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Key Points</h2>
                  {keyPoints.length > 0 && (
                    <button
                      onClick={copyKeyPoints}
                      className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all text-xs sm:text-sm font-medium touch-manipulation active:scale-95"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Copy All</span>
                    </button>
                  )}
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {loading ? (
                    <div className="flex items-center justify-center h-24 sm:h-32">
                      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-teal-600 animate-spin" />
                    </div>
                  ) : keyPoints.length > 0 ? (
                    <ul className="space-y-2 sm:space-y-3">
                      {keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start space-x-2 sm:space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-sm sm:text-base text-gray-900 flex-1">{point}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-center text-sm sm:text-base py-8">Key points will appear here...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileBottomAd adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <Footer />
    </div>
  )
}

