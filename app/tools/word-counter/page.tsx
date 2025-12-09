'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Footer from '@/components/Footer'
import SidebarAd from '@/components/SidebarAd'
import MobileBottomAd from '@/components/MobileBottomAd'
import { 
  FileText, Copy, Check, Download, Share2, Printer, 
  Type, Trash2, ArrowUpDown, ArrowDownUp, RotateCcw, RotateCw,
  Search, Replace, Maximize2, Minimize2, X, Star, Clock,
  TrendingUp, BarChart3, Target, Globe, Languages, 
  FileDown, FileText as FileTextIcon, File, Eye, EyeOff,
  ChevronDown, ChevronUp, Filter, Zap, History, Heart
} from 'lucide-react'
import toast from 'react-hot-toast'

interface TextHistory {
  id: string
  text: string
  timestamp: number
  wordCount: number
}

interface Favorite {
  id: string
  text: string
  timestamp: number
  wordCount: number
}

export default function WordCounter() {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [searchQuery, setSearchQuery] = useState('')
  const [replaceQuery, setReplaceQuery] = useState('')
  const [replaceWith, setReplaceWith] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showReplace, setShowReplace] = useState(false)
  const [highlightWord, setHighlightWord] = useState('')
  const [textHistory, setTextHistory] = useState<TextHistory[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [comparisonText, setComparisonText] = useState('')
  const [wordGoal, setWordGoal] = useState(1000)
  const [writingStreak, setWritingStreak] = useState(0)
  const [lastWritingDate, setLastWritingDate] = useState('')
  const [undoHistory, setUndoHistory] = useState<string[]>([''])
  const [undoIndex, setUndoIndex] = useState(0)
  const isUndoRedoRef = useRef(false)
  const undoHandlerRef = useRef<() => void>()
  const redoHandlerRef = useRef<() => void>()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('word-counter-history')
    const savedFavorites = localStorage.getItem('word-counter-favorites')
    const savedStreak = localStorage.getItem('word-counter-streak')
    const savedDate = localStorage.getItem('word-counter-last-date')
    const savedGoal = localStorage.getItem('word-counter-goal')
    
    if (savedHistory) setTextHistory(JSON.parse(savedHistory))
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
    if (savedStreak) setWritingStreak(Number(savedStreak))
    if (savedDate) setLastWritingDate(savedDate)
    if (savedGoal) setWordGoal(Number(savedGoal))
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (textHistory.length > 0) {
      localStorage.setItem('word-counter-history', JSON.stringify(textHistory))
    }
  }, [textHistory])

  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem('word-counter-favorites', JSON.stringify(favorites))
    }
  }, [favorites])

  useEffect(() => {
    localStorage.setItem('word-counter-streak', writingStreak.toString())
  }, [writingStreak])

  useEffect(() => {
    if (lastWritingDate) {
      localStorage.setItem('word-counter-last-date', lastWritingDate)
    }
  }, [lastWritingDate])

  useEffect(() => {
    localStorage.setItem('word-counter-goal', wordGoal.toString())
  }, [wordGoal])

  // Update writing streak
  useEffect(() => {
    if (text.trim().length > 0) {
      const today = new Date().toDateString()
      if (lastWritingDate !== today) {
        if (lastWritingDate && new Date(lastWritingDate).getTime() === new Date(today).getTime() - 86400000) {
          setWritingStreak(prev => prev + 1)
        } else if (!lastWritingDate) {
          setWritingStreak(1)
        } else {
          setWritingStreak(1)
        }
        setLastWritingDate(today)
      }
    }
  }, [text, lastWritingDate])

  // Save to history when text changes significantly
  useEffect(() => {
    if (text.trim().length > 50) {
      const timer = setTimeout(() => {
        const newEntry: TextHistory = {
          id: Date.now().toString(),
          text: text,
          timestamp: Date.now(),
          wordCount: text.trim().split(/\s+/).length
        }
        setTextHistory(prev => [newEntry, ...prev.filter(item => item.text !== text)].slice(0, 20))
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [text])

  // Basic stats
  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).filter(w => w.length > 0) : []
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    const questions = (text.match(/\?/g) || []).length
    const exclamations = (text.match(/!/g) || []).length
    const statements = sentences.length - questions - exclamations

    return {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
      words: words.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length || 1,
      readingTimeSlow: Math.ceil(words.length / 150),
      readingTimeAverage: Math.ceil(words.length / 200),
      readingTimeFast: Math.ceil(words.length / 250),
      speakingTime: Math.ceil(words.length / 150), // Average speaking speed
      avgWordsPerParagraph: paragraphs.length > 0 ? Math.round(words.length / paragraphs.length) : 0,
      avgWordsPerSentence: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
      questions,
      exclamations,
      statements,
      longestWord: words.length > 0 ? words.reduce((a, b) => a.length > b.length ? a : b) : '',
      shortestWord: words.length > 0 ? words.reduce((a, b) => a.length < b.length ? a : b) : '',
      avgWordLength: words.length > 0 ? Math.round(words.join('').length / words.length) : 0
    }
  }, [text])

  // Word frequency
  const wordFrequency = useMemo(() => {
    const words = text.toLowerCase().match(/\b\w+\b/g) || []
    const freq: Record<string, number> = {}
    words.forEach(word => {
      freq[word] = (freq[word] || 0) + 1
    })
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  }, [text])

  // Character frequency
  const charFrequency = useMemo(() => {
    const chars = text.toLowerCase().replace(/\s/g, '').split('')
    const freq: Record<string, number> = {}
    chars.forEach(char => {
      if (char.match(/[a-z0-9]/)) {
        freq[char] = (freq[char] || 0) + 1
      }
    })
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  }, [text])

  // Language detection (simple heuristic)
  const detectedLanguage = useMemo(() => {
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length
    const japaneseChars = (text.match(/[\u3040-\u309f\u30a0-\u30ff]/g) || []).length
    const arabicChars = (text.match(/[\u0600-\u06ff]/g) || []).length
    
    if (chineseChars > text.length * 0.1) return 'Chinese'
    if (japaneseChars > text.length * 0.1) return 'Japanese'
    if (arabicChars > text.length * 0.1) return 'Arabic'
    return 'English'
  }, [text])

  // Character count by language
  const charCountByLanguage = useMemo(() => {
    const chinese = (text.match(/[\u4e00-\u9fff]/g) || []).length
    const japanese = (text.match(/[\u3040-\u309f\u30a0-\u30ff]/g) || []).length
    const arabic = (text.match(/[\u0600-\u06ff]/g) || []).length
    const english = text.match(/[a-zA-Z]/g)?.length || 0
    
    return { chinese, japanese, arabic, english }
  }, [text])

  // Progress toward goal
  const progress = useMemo(() => {
    return Math.min((stats.words / wordGoal) * 100, 100)
  }, [stats.words, wordGoal])

  // Text Transformations
  const transformText = (type: 'uppercase' | 'lowercase' | 'title' | 'sentence') => {
    saveToUndoHistory(text) // Save state before transformation
    let transformed = text
    switch (type) {
      case 'uppercase':
        transformed = text.toUpperCase()
        break
      case 'lowercase':
        transformed = text.toLowerCase()
        break
      case 'title':
        transformed = text.replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        )
        break
      case 'sentence':
        transformed = text.toLowerCase().replace(/(^\w{1}|\.\s*\w{1})/gi, (txt) => 
          txt.toUpperCase()
        )
        break
    }
    setText(transformed)
    toast.success(`Text converted to ${type} case`)
  }

  // Remove duplicates
  const removeDuplicates = (type: 'lines' | 'words') => {
    saveToUndoHistory(text) // Save state before transformation
    let result = text
    if (type === 'lines') {
      const lines = text.split('\n')
      result = Array.from(new Set(lines)).join('\n')
    } else {
      const words = text.split(/\s+/)
      result = Array.from(new Set(words)).join(' ')
    }
    setText(result)
    toast.success(`Removed duplicate ${type}`)
  }

  // Remove extra spaces
  const removeExtraSpaces = () => {
    saveToUndoHistory(text) // Save state before transformation
    const result = text.replace(/\s+/g, ' ').trim()
    setText(result)
    toast.success('Extra spaces removed')
  }

  // Remove line breaks
  const removeLineBreaks = () => {
    saveToUndoHistory(text) // Save state before transformation
    const result = text.replace(/\n/g, ' ')
    setText(result)
    toast.success('Line breaks removed')
  }

  // Add line breaks
  const addLineBreaks = (interval: number) => {
    saveToUndoHistory(text) // Save state before transformation
    const words = text.split(' ')
    const result = words.map((word, i) => 
      (i + 1) % interval === 0 ? word + '\n' : word
    ).join(' ')
    setText(result)
    toast.success(`Line breaks added every ${interval} words`)
  }

  // Reverse text
  const reverseText = (type: 'all' | 'words') => {
    saveToUndoHistory(text) // Save state before transformation
    let result = text
    if (type === 'all') {
      result = text.split('').reverse().join('')
    } else {
      result = text.split(' ').map(word => word.split('').reverse().join('')).join(' ')
    }
    setText(result)
    toast.success(`Text reversed (${type})`)
  }

  // Export functions
  const exportToFile = (format: 'txt' | 'pdf' | 'docx') => {
    if (!text.trim()) {
      toast.error('No text to export')
      return
    }

    if (format === 'txt') {
      const blob = new Blob([text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `word-counter-${Date.now()}.txt`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Text exported as TXT')
    } else if (format === 'pdf') {
      // Simple PDF export using print
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Word Counter Export</title></head>
            <body style="font-family: Arial; padding: 20px;">
              <h1>Word Counter Statistics</h1>
              <pre style="white-space: pre-wrap;">${text}</pre>
              <hr>
              <h2>Statistics</h2>
              <p>Words: ${stats.words}</p>
              <p>Characters: ${stats.characters}</p>
              <p>Sentences: ${stats.sentences}</p>
              <p>Paragraphs: ${stats.paragraphs}</p>
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
        toast.success('PDF export initiated')
      }
    } else {
      // DOCX would require a library, for now export as text
      toast('DOCX export requires additional library. Exporting as TXT instead.', { icon: 'ℹ️' })
      exportToFile('txt')
    }
  }

  // Copy statistics
  const copyStatistics = () => {
    const statsText = `
Word Counter Statistics
=======================
Words: ${stats.words}
Characters: ${stats.characters}
Characters (no spaces): ${stats.charactersNoSpaces}
Sentences: ${stats.sentences}
Paragraphs: ${stats.paragraphs}
Reading Time (slow): ${stats.readingTimeSlow} min
Reading Time (average): ${stats.readingTimeAverage} min
Reading Time (fast): ${stats.readingTimeFast} min
Speaking Time: ${stats.speakingTime} min
Average words per paragraph: ${stats.avgWordsPerParagraph}
Average words per sentence: ${stats.avgWordsPerSentence}
Questions: ${stats.questions}
Exclamations: ${stats.exclamations}
Statements: ${stats.statements}
Longest word: ${stats.longestWord}
Shortest word: ${stats.shortestWord}
Average word length: ${stats.avgWordLength} characters
    `.trim()
    
    navigator.clipboard.writeText(statsText)
    toast.success('Statistics copied to clipboard!')
  }

  // Share results
  const shareResults = () => {
    const shareText = `Word Counter Results:
Words: ${stats.words}
Characters: ${stats.characters}
Sentences: ${stats.sentences}
Reading Time: ${stats.readingTimeAverage} min

${text.substring(0, 100)}...`

    if (navigator.share) {
      navigator.share({
        title: 'Word Counter Results',
        text: shareText
      }).catch(() => {
        copyStatistics()
      })
    } else {
      copyStatistics()
    }
  }

  // Print view
  const printView = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Word Counter - Print View</title>
            <style>
              body { font-family: Arial; padding: 20px; }
              .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 20px 0; }
              .stat-item { padding: 10px; background: #f5f5f5; border-radius: 5px; }
            </style>
          </head>
          <body>
            <h1>Word Counter Statistics</h1>
            <div class="stats">
              <div class="stat-item"><strong>Words:</strong> ${stats.words}</div>
              <div class="stat-item"><strong>Characters:</strong> ${stats.characters}</div>
              <div class="stat-item"><strong>Sentences:</strong> ${stats.sentences}</div>
              <div class="stat-item"><strong>Paragraphs:</strong> ${stats.paragraphs}</div>
              <div class="stat-item"><strong>Reading Time:</strong> ${stats.readingTimeAverage} min</div>
              <div class="stat-item"><strong>Speaking Time:</strong> ${stats.speakingTime} min</div>
            </div>
            <h2>Text Content</h2>
            <pre style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 5px;">${text}</pre>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Find and replace
  const handleReplace = () => {
    if (!replaceQuery) {
      toast.error('Please enter text to find')
      return
    }
    saveToUndoHistory(text) // Save state before transformation
    const regex = new RegExp(replaceQuery, 'g')
    const result = text.replace(regex, replaceWith)
    setText(result)
    toast.success('Text replaced')
  }

  // Highlight text in textarea (using mark)
  const highlightText = (query: string) => {
    if (!query) return text
    const regex = new RegExp(`(${query})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }

  // Save to favorites
  const saveToFavorites = () => {
    if (!text.trim()) {
      toast.error('No text to save')
      return
    }
    const newFavorite: Favorite = {
      id: Date.now().toString(),
      text: text,
      timestamp: Date.now(),
      wordCount: stats.words
    }
    setFavorites(prev => [newFavorite, ...prev].slice(0, 50))
    toast.success('Saved to favorites!')
  }

  // Load from history/favorites
  const loadText = (loadedText: string) => {
    setText(loadedText)
    toast.success('Text loaded')
  }

  // Delete from history/favorites
  const deleteItem = (id: string, type: 'history' | 'favorite') => {
    if (type === 'history') {
      setTextHistory(prev => prev.filter(item => item.id !== id))
    } else {
      setFavorites(prev => prev.filter(item => item.id !== id))
    }
    toast.success('Deleted')
  }

  // Clear all
  const clearAll = () => {
    setText('')
    toast.success('Text cleared')
  }

  // Comparison stats
  const comparisonStats = useMemo(() => {
    if (!comparisonText) return null
    const words = comparisonText.trim() ? comparisonText.trim().split(/\s+/).filter(w => w.length > 0) : []
    return {
      words: words.length,
      characters: comparisonText.length,
      sentences: comparisonText.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    }
  }, [comparisonText])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Text copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Save state to undo history
  const saveToUndoHistory = (newText: string) => {
    setUndoHistory(prev => {
      const newHistory = prev.slice(0, undoIndex + 1)
      newHistory.push(newText)
      // Limit history to 50 states
      if (newHistory.length > 50) {
        newHistory.shift()
        return newHistory
      }
      return newHistory
    })
    setUndoIndex(prev => Math.min(prev + 1, 49))
  }

  // Undo function
  const handleUndo = () => {
    if (undoIndex > 0) {
      isUndoRedoRef.current = true
      const newIndex = undoIndex - 1
      setUndoIndex(newIndex)
      setText(undoHistory[newIndex])
      setTimeout(() => {
        isUndoRedoRef.current = false
      }, 100)
      toast.success('Undone')
    } else {
      toast.error('Nothing to undo')
    }
  }
  undoHandlerRef.current = handleUndo

  // Redo function
  const handleRedo = () => {
    if (undoIndex < undoHistory.length - 1) {
      isUndoRedoRef.current = true
      const newIndex = undoIndex + 1
      setUndoIndex(newIndex)
      setText(undoHistory[newIndex])
      setTimeout(() => {
        isUndoRedoRef.current = false
      }, 100)
      toast.success('Redone')
    } else {
      toast.error('Nothing to redo')
    }
  }
  redoHandlerRef.current = handleRedo

  // Update undo history when text changes (but not on undo/redo operations)
  useEffect(() => {
    // Skip if this is an undo/redo operation
    if (isUndoRedoRef.current) {
      return
    }
    
    // Only save if the text actually changed
    if (text !== undoHistory[undoIndex]) {
      // Debounce manual typing
      const timeoutId = setTimeout(() => {
        if (!isUndoRedoRef.current && text !== undoHistory[undoIndex]) {
          saveToUndoHistory(text)
        }
      }, 1000) // Debounce manual typing

      return () => clearTimeout(timeoutId)
    }
  }, [text])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in an input field (except textarea)
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT') {
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undoHandlerRef.current?.()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redoHandlerRef.current?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      <SidebarAd position="left" adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      <SidebarAd position="right" adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      
      <main className="flex-grow py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 p-3 sm:p-4 rounded-2xl shadow-xl">
                  <FileText className="h-7 w-7 sm:h-9 sm:w-9 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2 sm:mb-3">
              Word Counter
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-2 max-w-2xl mx-auto">
              Count words, characters, sentences, and more with advanced features
            </p>
          </div>

          {/* Writing Streak & Goal - Enhanced Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100/50 p-4 sm:p-5 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Writing Streak</p>
                  <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {writingStreak} {writingStreak === 1 ? 'day' : 'days'}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-xl shadow-lg">
                  <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100/50 p-4 sm:p-5 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Word Goal</p>
                <input
                  type="number"
                  value={wordGoal}
                  onChange={(e) => setWordGoal(Number(e.target.value))}
                  className="w-16 sm:w-20 px-2 py-1.5 border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-2 font-medium">
                <span className="font-bold text-purple-600">{stats.words.toLocaleString()}</span> / <span className="text-gray-500">{wordGoal.toLocaleString()}</span> words
              </p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100/50 p-4 sm:p-5 hover:shadow-2xl transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Detected Language</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{detectedLanguage}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-400 to-cyan-500 p-3 rounded-xl shadow-lg">
                  <Globe className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Text Area */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100/50 p-4 sm:p-5 md:p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Your Text
                  </h2>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                        title="Decrease font size"
                      >
                        <Minimize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-700" />
                      </button>
                      <span className="text-xs sm:text-sm text-gray-700 font-medium px-2 min-w-[45px] text-center">{fontSize}px</span>
                      <button
                        onClick={() => setFontSize(prev => Math.min(24, prev + 2))}
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                        title="Increase font size"
                      >
                        <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-700" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={handleUndo}
                        disabled={undoIndex === 0}
                        className={`p-1.5 rounded transition-colors ${
                          undoIndex === 0 
                            ? 'opacity-40 cursor-not-allowed' 
                            : 'hover:bg-gray-200'
                        }`}
                        title="Undo (Ctrl+Z)"
                      >
                        <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-700" />
                      </button>
                      <button
                        onClick={handleRedo}
                        disabled={undoIndex >= undoHistory.length - 1}
                        className={`p-1.5 rounded transition-colors ${
                          undoIndex >= undoHistory.length - 1 
                            ? 'opacity-40 cursor-not-allowed' 
                            : 'hover:bg-gray-200'
                        }`}
                        title="Redo (Ctrl+Y)"
                      >
                        <RotateCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-700" />
                      </button>
                    </div>
                    <button
                      onClick={() => setShowSearch(!showSearch)}
                      className={`p-2 rounded-lg transition-all ${showSearch ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                      title="Search"
                    >
                      <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  <button
                      onClick={() => setShowReplace(!showReplace)}
                      className={`p-2 rounded-lg transition-all ${showReplace ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                      title="Find & Replace"
                    >
                      <Replace className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                {text && (
                      <>
                  <button
                    onClick={copyToClipboard}
                          className={`p-2 rounded-lg transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                          title="Copy"
                        >
                          {copied ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : <Copy className="h-4 w-4 sm:h-5 sm:w-5" />}
                        </button>
                        <button
                          onClick={clearAll}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                          title="Clear"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Search Bar */}
                {showSearch && (
                  <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search in text..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white text-gray-900"
                        />
                      </div>
                      <div className="flex-1 relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Highlight word..."
                          value={highlightWord}
                          onChange={(e) => setHighlightWord(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white text-gray-900"
                        />
                      </div>
                      <button
                        onClick={() => setShowSearch(false)}
                        className="p-2.5 bg-white hover:bg-gray-100 border-2 border-gray-200 rounded-lg transition-all"
                      >
                        <X className="h-4 w-4 text-gray-600" />
                  </button>
                    </div>
                  </div>
                )}

                {/* Replace Bar */}
                {showReplace && (
                  <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Find..."
                          value={replaceQuery}
                          onChange={(e) => setReplaceQuery(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900"
                        />
                      </div>
                      <div className="flex-1 relative">
                        <Replace className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Replace with..."
                          value={replaceWith}
                          onChange={(e) => setReplaceWith(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900"
                        />
                      </div>
                      <button
                        onClick={handleReplace}
                        className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm whitespace-nowrap"
                      >
                        Replace
                      </button>
                      <button
                        onClick={() => setShowReplace(false)}
                        className="p-2.5 bg-white hover:bg-gray-100 border-2 border-gray-200 rounded-lg transition-all"
                      >
                        <X className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
              </div>
                )}

              <textarea
                  ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Start typing or paste your text here..."
                  rows={12}
                  style={{ fontSize: `${fontSize}px` }}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-gray-900 bg-white shadow-inner transition-all leading-relaxed"
              />
            </div>

              {/* Text Transformations */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100/50 p-4 sm:p-5 md:p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <Type className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Text Transformations</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <button
                    onClick={() => transformText('uppercase')}
                    className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md border border-gray-200 text-gray-900"
                  >
                    UPPERCASE
                  </button>
                  <button
                    onClick={() => transformText('lowercase')}
                    className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md border border-gray-200 text-gray-900"
                  >
                    lowercase
                  </button>
                  <button
                    onClick={() => transformText('title')}
                    className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md border border-gray-200 text-gray-900"
                  >
                    Title Case
                  </button>
                  <button
                    onClick={() => transformText('sentence')}
                    className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md border border-gray-200 text-gray-900"
                  >
                    Sentence case
                  </button>
                </div>
              </div>

              {/* Text Cleaning */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100/50 p-4 sm:p-5 md:p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Text Cleaning</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  <button
                    onClick={() => removeDuplicates('lines')}
                    className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md border border-blue-200 text-blue-700"
                  >
                    Remove Duplicate Lines
                  </button>
                  <button
                    onClick={() => removeDuplicates('words')}
                    className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md border border-blue-200 text-blue-700"
                  >
                    Remove Duplicate Words
                  </button>
                  <button
                    onClick={removeExtraSpaces}
                    className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md border border-blue-200 text-blue-700"
                  >
                    Remove Extra Spaces
                  </button>
                  <button
                    onClick={removeLineBreaks}
                    className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md border border-blue-200 text-blue-700"
                  >
                    Remove Line Breaks
                  </button>
                  <button
                    onClick={() => addLineBreaks(10)}
                    className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md border border-blue-200 text-blue-700"
                  >
                    Add Line Breaks
                  </button>
                  <button
                    onClick={() => reverseText('all')}
                    className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md border border-blue-200 text-blue-700"
                  >
                    Reverse Text
                  </button>
                  <button
                    onClick={() => reverseText('words')}
                    className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md border border-blue-200 text-blue-700"
                  >
                    Reverse Words
                  </button>
                </div>
              </div>

              {/* Export & Share */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 p-4 sm:p-5 md:p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <Download className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Export & Share</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  <button
                    onClick={() => exportToFile('txt')}
                    className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md border border-green-200 text-green-700 flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    <FileTextIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Export</span> TXT
                  </button>
                  <button
                    onClick={() => exportToFile('pdf')}
                    className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md border border-green-200 text-green-700 flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    <File className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Export</span> PDF
                  </button>
                  <button
                    onClick={copyStatistics}
                    className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md border border-green-200 text-green-700 flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Copy Stats
                  </button>
                  <button
                    onClick={shareResults}
                    className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md border border-green-200 text-green-700 flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Share
                  </button>
                  <button
                    onClick={printView}
                    className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md border border-green-200 text-green-700 flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Print
                  </button>
                  <button
                    onClick={saveToFavorites}
                    className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md border border-pink-100 text-pink-500 flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Save</span> Favorite
                  </button>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md border border-purple-200 text-purple-700 flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    History
                  </button>
                  <button
                    onClick={() => setShowFavorites(!showFavorites)}
                    className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md border border-pink-100 text-pink-500 flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Favorites
                  </button>
                </div>
              </div>

              {/* Text Comparison */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/50 p-4 sm:p-5 md:p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Text Comparison</h3>
                  </div>
                  <button
                    onClick={() => setShowComparison(!showComparison)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    {showComparison ? <ChevronUp className="h-5 w-5 text-gray-600" /> : <ChevronDown className="h-5 w-5 text-gray-600" />}
                  </button>
                </div>
                {showComparison && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Original Text</label>
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <p className="text-2xl font-bold text-purple-600">{stats.words}</p>
                              <p className="text-xs text-gray-600">Words</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-purple-600">{stats.characters}</p>
                              <p className="text-xs text-gray-600">Chars</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-purple-600">{stats.sentences}</p>
                              <p className="text-xs text-gray-600">Sentences</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Comparison Text</label>
                        <textarea
                          value={comparisonText}
                          onChange={(e) => setComparisonText(e.target.value)}
                          placeholder="Enter text to compare..."
                          rows={4}
                          className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all mb-3"
                        />
                        {comparisonStats && (
                          <div className="p-3 bg-white rounded-lg shadow-sm">
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                <p className="text-xl font-bold text-blue-600">{comparisonStats.words}</p>
                                <p className="text-xs text-gray-600">Words</p>
                              </div>
                              <div>
                                <p className="text-xl font-bold text-blue-600">{comparisonStats.characters}</p>
                                <p className="text-xs text-gray-600">Chars</p>
                              </div>
                              <div>
                                <p className="text-xl font-bold text-blue-600">{comparisonStats.sentences}</p>
                                <p className="text-xs text-gray-600">Sentences</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {comparisonStats && (
                      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Difference
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-2 bg-white rounded-lg">
                            <p className={`text-lg font-bold ${stats.words - comparisonStats.words >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {stats.words - comparisonStats.words > 0 ? '+' : ''}{stats.words - comparisonStats.words}
                            </p>
                            <p className="text-xs text-gray-600">Words</p>
                          </div>
                          <div className="text-center p-2 bg-white rounded-lg">
                            <p className={`text-lg font-bold ${stats.characters - comparisonStats.characters >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {stats.characters - comparisonStats.characters > 0 ? '+' : ''}{stats.characters - comparisonStats.characters}
                            </p>
                            <p className="text-xs text-gray-600">Characters</p>
                          </div>
                          <div className="text-center p-2 bg-white rounded-lg">
                            <p className={`text-lg font-bold ${stats.sentences - comparisonStats.sentences >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {stats.sentences - comparisonStats.sentences > 0 ? '+' : ''}{stats.sentences - comparisonStats.sentences}
                            </p>
                            <p className="text-xs text-gray-600">Sentences</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* History & Favorites */}
              {(showHistory || showFavorites) && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100/50 p-4 sm:p-5 md:p-6 hover:shadow-2xl transition-all duration-300">
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => { setShowHistory(true); setShowFavorites(false) }}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        showHistory 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <History className="h-4 w-4 inline mr-2" />
                      History
                    </button>
                    <button
                      onClick={() => { setShowFavorites(true); setShowHistory(false) }}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        showFavorites 
                          ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <Heart className="h-4 w-4 inline mr-2" />
                      Favorites
                    </button>
                  </div>
                  <div className="max-h-60 sm:max-h-80 overflow-y-auto space-y-2 pr-2">
                    {showHistory && textHistory.map((item) => (
                      <div key={item.id} className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:shadow-md transition-all flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 truncate font-medium">{item.text.substring(0, 80)}...</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">{item.wordCount} words</span>
                            <span className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => loadText(item.text)}
                            className="p-2 hover:bg-white rounded-lg transition-all"
                            title="Load"
                          >
                            <Eye className="h-4 w-4 text-purple-600" />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id, 'history')}
                            className="p-2 hover:bg-red-100 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {showFavorites && favorites.map((item) => (
                      <div key={item.id} className="p-3 sm:p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100 hover:shadow-md transition-all flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 truncate font-medium">{item.text.substring(0, 80)}...</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="px-2 py-1 bg-pink-100 text-pink-500 rounded-lg text-xs font-semibold">{item.wordCount} words</span>
                            <span className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => loadText(item.text)}
                            className="p-2 hover:bg-white rounded-lg transition-all"
                            title="Load"
                          >
                            <Eye className="h-4 w-4 text-pink-400" />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id, 'favorite')}
                            className="p-2 hover:bg-red-100 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {showHistory && textHistory.length === 0 && (
                      <div className="text-center py-8">
                        <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No history yet</p>
                      </div>
                    )}
                    {showFavorites && favorites.length === 0 && (
                      <div className="text-center py-8">
                        <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No favorites yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
                </div>
                
            {/* Statistics Sidebar */}
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100/50 p-4 sm:p-5 md:p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-2 mb-4 sm:mb-5">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Statistics</h2>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-xl p-4 sm:p-5 shadow-lg">
                    <div className="relative z-10">
                      <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-1">{stats.words.toLocaleString()}</div>
                      <div className="text-sm sm:text-base text-white/90 font-medium">Words</div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-2">
                    <div className="flex justify-between items-center p-3 sm:p-3.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">Characters</span>
                      <span className="font-bold text-gray-900 text-sm sm:text-base">{stats.characters.toLocaleString()}</span>
                  </div>
                    <div className="flex justify-between items-center p-3 sm:p-3.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">No Spaces</span>
                      <span className="font-bold text-gray-900 text-sm sm:text-base">{stats.charactersNoSpaces.toLocaleString()}</span>
                  </div>
                    <div className="flex justify-between items-center p-3 sm:p-3.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">Sentences</span>
                      <span className="font-bold text-gray-900 text-sm sm:text-base">{stats.sentences}</span>
                  </div>
                    <div className="flex justify-between items-center p-3 sm:p-3.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">Paragraphs</span>
                      <span className="font-bold text-gray-900 text-sm sm:text-base">{stats.paragraphs}</span>
                  </div>
                </div>
              </div>
              </div>

              {/* Reading & Speaking Time */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100/50 p-4 sm:p-5 md:p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-2 mb-4 sm:mb-5">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Reading Time</h3>
                </div>
                <div className="space-y-2 sm:space-y-2.5">
                  <div className="flex justify-between items-center p-3 sm:p-3.5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 hover:shadow-md transition-all">
                    <span className="text-xs sm:text-sm text-gray-700 font-medium">Slow (150 wpm)</span>
                    <span className="font-bold text-blue-600 text-sm sm:text-base">{stats.readingTimeSlow} min</span>
                  </div>
                  <div className="flex justify-between items-center p-3 sm:p-3.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all">
                    <span className="text-xs sm:text-sm text-gray-700 font-medium">Average (200 wpm)</span>
                    <span className="font-bold text-green-600 text-sm sm:text-base">{stats.readingTimeAverage} min</span>
                  </div>
                  <div className="flex justify-between items-center p-3 sm:p-3.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:shadow-md transition-all">
                    <span className="text-xs sm:text-sm text-gray-700 font-medium">Fast (250 wpm)</span>
                    <span className="font-bold text-purple-600 text-sm sm:text-base">{stats.readingTimeFast} min</span>
                  </div>
                  <div className="flex justify-between items-center p-3 sm:p-3.5 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl border border-orange-200 hover:shadow-md transition-all">
                    <span className="text-xs sm:text-sm text-gray-700 font-medium">Speaking Time</span>
                    <span className="font-bold text-orange-600 text-sm sm:text-base">{stats.speakingTime} min</span>
                  </div>
                </div>
                </div>
                
              {/* Advanced Statistics */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/50 p-4 sm:p-5 md:p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-2 mb-4 sm:mb-5">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Advanced Stats</h3>
                </div>
                <div className="space-y-2 sm:space-y-2.5">
                  <div className="flex justify-between items-center p-3 sm:p-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 hover:shadow-md transition-all">
                    <span className="text-xs sm:text-sm text-gray-700 font-medium">Avg words/paragraph</span>
                    <span className="font-bold text-indigo-600 text-sm sm:text-base">{stats.avgWordsPerParagraph}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 sm:p-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 hover:shadow-md transition-all">
                    <span className="text-xs sm:text-sm text-gray-700 font-medium">Avg words/sentence</span>
                    <span className="font-bold text-indigo-600 text-sm sm:text-base">{stats.avgWordsPerSentence}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 sm:p-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 hover:shadow-md transition-all">
                    <span className="text-xs sm:text-sm text-gray-700 font-medium">Avg word length</span>
                    <span className="font-bold text-indigo-600 text-sm sm:text-base">{stats.avgWordLength} chars</span>
                  </div>
                  {stats.longestWord && (
                    <div className="flex justify-between items-center p-3 sm:p-3.5 bg-gradient-to-r from-pink-50 to-yellow-50 rounded-xl border border-pink-100 hover:shadow-md transition-all">
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">Longest word</span>
                      <span className="font-bold text-pink-400 text-sm sm:text-base">{stats.longestWord}</span>
                    </div>
                  )}
                  {stats.shortestWord && (
                    <div className="flex justify-between items-center p-3 sm:p-3.5 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200 hover:shadow-md transition-all">
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">Shortest word</span>
                      <span className="font-bold text-teal-600 text-sm sm:text-base">{stats.shortestWord}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sentence Structure */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-rose-100/50 p-4 sm:p-5 md:p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-2 mb-4 sm:mb-5">
                  <Type className="h-5 w-5 sm:h-6 sm:w-6 text-rose-600" />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Sentence Structure</h3>
                </div>
                <div className="space-y-2 sm:space-y-2.5">
                  <div className="flex justify-between items-center p-3 sm:p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-all">
                    <span className="text-xs sm:text-sm text-gray-700 font-medium flex items-center gap-1.5">
                      <span className="text-lg">?</span> Questions
                    </span>
                    <span className="font-bold text-blue-600 text-sm sm:text-base">{stats.questions}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 sm:p-3.5 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 hover:shadow-md transition-all">
                    <span className="text-xs sm:text-sm text-gray-700 font-medium flex items-center gap-1.5">
                      <span className="text-lg">!</span> Exclamations
                    </span>
                    <span className="font-bold text-orange-600 text-sm sm:text-base">{stats.exclamations}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 sm:p-3.5 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                    <span className="text-xs sm:text-sm text-gray-700 font-medium flex items-center gap-1.5">
                      <span className="text-lg">.</span> Statements
                    </span>
                    <span className="font-bold text-gray-700 text-sm sm:text-base">{stats.statements}</span>
                  </div>
                </div>
              </div>

              {/* Language Stats */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Analysis</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Detected: <span className="font-semibold text-gray-900">{detectedLanguage}</span></p>
                    {charCountByLanguage.chinese > 0 && (
                      <p className="text-xs text-gray-500">Chinese: {charCountByLanguage.chinese} chars</p>
                    )}
                    {charCountByLanguage.japanese > 0 && (
                      <p className="text-xs text-gray-500">Japanese: {charCountByLanguage.japanese} chars</p>
                    )}
                    {charCountByLanguage.arabic > 0 && (
                      <p className="text-xs text-gray-500">Arabic: {charCountByLanguage.arabic} chars</p>
                    )}
                    {charCountByLanguage.english > 0 && (
                      <p className="text-xs text-gray-500">English: {charCountByLanguage.english} chars</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Word Frequency Chart */}
              {wordFrequency.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Words</h3>
                  <div className="space-y-2">
                    {wordFrequency.map(([word, count], idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            style={{ width: `${(count / wordFrequency[0][1]) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 min-w-[60px] text-right">{word}</span>
                        <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Character Frequency Chart */}
              {charFrequency.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Characters</h3>
                  <div className="space-y-2">
                    {charFrequency.map(([char, count], idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                            style={{ width: `${(count / charFrequency[0][1]) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 min-w-[30px] text-center">{char}</span>
                        <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
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
