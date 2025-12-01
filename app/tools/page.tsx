'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import MobileBottomNav from '@/components/MobileBottomNav'
import { 
  Image, FileText, Sparkles, Mic, QrCode, 
  GraduationCap, FileCheck, Type, Scissors, 
  Maximize2, Languages, ArrowRight, Minimize2,
  RefreshCw, Hash, Lock, Link as LinkIcon,
  Palette, Calculator, Clock, Key, Code, Search, X,
  Crop, RotateCw, Globe, Filter, Heart, Calendar,
  HardDrive, Shield, DollarSign, CheckSquare, Target,
  Instagram, Eye, EyeOff, Mail, Grid, Merge, Wand2,
  PenTool, Video
} from 'lucide-react'

const allTools = [
  {
    id: 'background-remover',
    name: 'Background Remover',
    description: 'Remove backgrounds from images instantly with AI',
    icon: Scissors,
    color: 'from-purple-500 to-pink-500',
    category: 'Image Tools',
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Resize images to any dimension while maintaining quality',
    icon: Maximize2,
    color: 'from-blue-500 to-cyan-500',
    category: 'Image Tools',
  },
  {
    id: 'pdf-tools',
    name: 'PDF Tools',
    description: 'Create PDFs, convert PDF to JPG, JPG to PNG',
    icon: FileText,
    color: 'from-red-500 to-orange-500',
    category: 'Document Tools',
  },
  {
    id: 'meme-generator',
    name: 'Meme Generator',
    description: 'Create hilarious memes with custom text and images',
    icon: Image,
    color: 'from-yellow-500 to-orange-500',
    category: 'Creative Tools',
  },
  {
    id: 'ai-resume-builder',
    name: 'AI Resume Builder',
    description: 'Build professional resumes with AI assistance',
    icon: FileCheck,
    color: 'from-green-500 to-emerald-500',
    category: 'AI Tools',
  },
  {
    id: 'ai-summarizer',
    name: 'AI Summarizer',
    description: 'Summarize long texts and documents instantly',
    icon: Sparkles,
    color: 'from-indigo-500 to-purple-500',
    category: 'AI Tools',
  },
  {
    id: 'text-to-speech',
    name: 'Text to Speech',
    description: 'Convert text to natural-sounding speech',
    icon: Mic,
    color: 'from-pink-500 to-rose-500',
    category: 'AI Tools',
  },
  {
    id: 'qr-generator',
    name: 'QR Generator',
    description: 'Generate QR codes for URLs, text, and more',
    icon: QrCode,
    color: 'from-gray-700 to-gray-900',
    category: 'Utility Tools',
  },
  {
    id: 'ai-note-summarizer',
    name: 'AI Note Summarizer',
    description: 'Summarize your notes and study materials',
    icon: Type,
    color: 'from-teal-500 to-cyan-500',
    category: 'Study Tools',
  },
  {
    id: 'english-improvement',
    name: 'AI English Improvement',
    description: 'Improve your English writing with AI suggestions',
    icon: Languages,
    color: 'from-blue-600 to-indigo-600',
    category: 'AI Tools',
  },
  {
    id: 'study-tools',
    name: 'Study Tools',
    description: 'Essential tools for students - flashcards, timers, and more',
    icon: GraduationCap,
    color: 'from-violet-500 to-purple-500',
    category: 'Study Tools',
  },
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Reduce image file size while maintaining quality',
    icon: Minimize2,
    color: 'from-green-500 to-emerald-500',
    category: 'Image Tools',
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Convert images between PNG, JPG, and WEBP formats',
    icon: RefreshCw,
    color: 'from-blue-500 to-indigo-500',
    category: 'Image Tools',
  },
  {
    id: 'word-counter',
    name: 'Word Counter',
    description: 'Count words, characters, sentences, and more',
    icon: FileText,
    color: 'from-purple-500 to-pink-500',
    category: 'Text Tools',
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate strong, secure passwords instantly',
    icon: Key,
    color: 'from-orange-500 to-red-500',
    category: 'Security Tools',
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, and minify JSON data',
    icon: Code,
    color: 'from-indigo-500 to-purple-500',
    category: 'Developer Tools',
  },
  {
    id: 'base64-encoder',
    name: 'Base64 Encoder',
    description: 'Encode and decode Base64 strings',
    icon: Hash,
    color: 'from-teal-500 to-cyan-500',
    category: 'Developer Tools',
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    description: 'Convert text to different cases instantly',
    icon: Type,
    color: 'from-blue-500 to-indigo-500',
    category: 'Text Tools',
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes',
    icon: Lock,
    color: 'from-red-500 to-pink-500',
    category: 'Security Tools',
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate unique identifiers (UUID v4)',
    icon: Hash,
    color: 'from-violet-500 to-purple-500',
    category: 'Developer Tools',
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder',
    description: 'Encode and decode URL strings',
    icon: LinkIcon,
    color: 'from-blue-500 to-cyan-500',
    category: 'Developer Tools',
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    description: 'Pick colors and get values in multiple formats',
    icon: Palette,
    color: 'from-pink-500 to-rose-500',
    category: 'Design Tools',
  },
  {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text for your designs',
    icon: FileText,
    color: 'from-amber-500 to-orange-500',
    category: 'Design Tools',
  },
  {
    id: 'barcode-generator',
    name: 'Barcode Generator',
    description: 'Generate barcodes in multiple formats',
    icon: Hash,
    color: 'from-gray-700 to-gray-900',
    category: 'Utility Tools',
  },
  {
    id: 'unit-converter',
    name: 'Unit Converter',
    description: 'Convert between different units of measurement',
    icon: Calculator,
    color: 'from-green-500 to-emerald-500',
    category: 'Utility Tools',
  },
  {
    id: 'timezone-converter',
    name: 'Time Zone Converter',
    description: 'Convert time between different time zones',
    icon: Clock,
    color: 'from-blue-500 to-indigo-500',
    category: 'Utility Tools',
  },
  {
    id: 'image-cropper',
    name: 'Image Cropper',
    description: 'Crop images with custom dimensions',
    icon: Crop,
    color: 'from-green-500 to-emerald-500',
    category: 'Image Tools',
  },
  {
    id: 'image-rotator',
    name: 'Image Rotator',
    description: 'Rotate images 90°, 180°, or 270°',
    icon: RotateCw,
    color: 'from-blue-500 to-cyan-500',
    category: 'Image Tools',
  },
  {
    id: 'image-filters',
    name: 'Image Filters',
    description: 'Apply filters to your images',
    icon: Image,
    color: 'from-purple-500 to-pink-500',
    category: 'Image Tools',
  },
  {
    id: 'code-formatter',
    name: 'Code Formatter',
    description: 'Format and minify code in multiple languages',
    icon: Code,
    color: 'from-indigo-500 to-purple-500',
    category: 'Developer Tools',
  },
  {
    id: 'ip-address-info',
    name: 'IP Address Info',
    description: 'Get information about your IP address',
    icon: Globe,
    color: 'from-blue-500 to-cyan-500',
    category: 'Utility Tools',
  },
  {
    id: 'qr-code-scanner',
    name: 'QR Code Scanner',
    description: 'Scan QR codes from images',
    icon: QrCode,
    color: 'from-gray-700 to-gray-900',
    category: 'Utility Tools',
  },
  {
    id: 'favicon-generator',
    name: 'Favicon Generator',
    description: 'Generate favicons from images in multiple sizes',
    icon: Image,
    color: 'from-pink-500 to-rose-500',
    category: 'Design Tools',
  },
  {
    id: 'text-extractor',
    name: 'Text Extractor',
    description: 'Extract text from images using OCR',
    icon: FileText,
    color: 'from-indigo-500 to-purple-500',
    category: 'Text Tools',
  },
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    description: 'Calculate your exact age from your birthdate',
    icon: Calendar,
    color: 'from-blue-500 to-cyan-500',
    category: 'Utility Tools',
  },
  {
    id: 'date-calculator',
    name: 'Date Calculator',
    description: 'Calculate the difference between two dates',
    icon: Calendar,
    color: 'from-green-500 to-emerald-500',
    category: 'Utility Tools',
  },
  {
    id: 'percentage-calculator',
    name: 'Percentage Calculator',
    description: 'Calculate percentages easily',
    icon: Calculator,
    color: 'from-purple-500 to-pink-500',
    category: 'Utility Tools',
  },
  {
    id: 'tip-calculator',
    name: 'Tip Calculator',
    description: 'Calculate tips and split bills easily',
    icon: Calculator,
    color: 'from-orange-500 to-red-500',
    category: 'Utility Tools',
  },
  {
    id: 'random-color-generator',
    name: 'Random Color Generator',
    description: 'Generate random colors with hex codes',
    icon: Palette,
    color: 'from-pink-500 to-rose-500',
    category: 'Design Tools',
  },
  {
    id: 'file-size-converter',
    name: 'File Size Converter',
    description: 'Convert between different file size units',
    icon: HardDrive,
    color: 'from-indigo-500 to-purple-500',
    category: 'Utility Tools',
  },
  {
    id: 'password-strength-checker',
    name: 'Password Strength Checker',
    description: 'Check the strength of your password',
    icon: Lock,
    color: 'from-red-500 to-pink-500',
    category: 'Security Tools',
  },
  {
    id: 'two-factor-authenticator',
    name: 'Two-Factor Authenticator',
    description: 'Generate 2FA codes for your accounts',
    icon: Shield,
    color: 'from-blue-500 to-indigo-500',
    category: 'Security Tools',
  },
  {
    id: 'currency-converter',
    name: 'Currency Converter',
    description: 'Convert between different currencies',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-500',
    category: 'Utility Tools',
  },
  {
    id: 'pomodoro-timer',
    name: 'Pomodoro Timer',
    description: 'Focus timer for productive work sessions',
    icon: Clock,
    color: 'from-red-500 to-pink-500',
    category: 'Productivity Tools',
  },
  {
    id: 'note-taker',
    name: 'Note Taker',
    description: 'Take and organize your notes',
    icon: FileText,
    color: 'from-blue-500 to-indigo-500',
    category: 'Productivity Tools',
  },
  {
    id: 'task-manager',
    name: 'Task Manager',
    description: 'Manage your tasks and stay organized',
    icon: CheckSquare,
    color: 'from-green-500 to-emerald-500',
    category: 'Productivity Tools',
  },
  {
    id: 'habit-tracker',
    name: 'Habit Tracker',
    description: 'Track your daily habits and build streaks',
    icon: Target,
    color: 'from-purple-500 to-pink-500',
    category: 'Productivity Tools',
  },
  {
    id: 'expense-tracker',
    name: 'Expense Tracker',
    description: 'Track your expenses and manage your budget',
    icon: DollarSign,
    color: 'from-orange-500 to-red-500',
    category: 'Productivity Tools',
  },
  {
    id: 'instagram-bio-generator',
    name: 'Instagram Bio Generator',
    description: 'Generate creative Instagram bios',
    icon: Instagram,
    color: 'from-pink-500 to-rose-500',
    category: 'Creative Tools',
  },
  {
    id: 'logo-maker',
    name: 'Logo Maker',
    description: 'Create simple logos with text and shapes',
    icon: Image,
    color: 'from-purple-500 to-pink-500',
    category: 'Design Tools',
  },
  {
    id: 'email-template-builder',
    name: 'Email Template Builder',
    description: 'Create professional email templates',
    icon: Mail,
    color: 'from-blue-500 to-indigo-500',
    category: 'Business Tools',
  },
  {
    id: 'instagram-story-maker',
    name: 'Instagram Story Maker',
    description: 'Create Instagram stories with text and images',
    icon: Image,
    color: 'from-pink-500 to-rose-500',
    category: 'Creative Tools',
  },
  {
    id: 'image-collage-maker',
    name: 'Image Collage Maker',
    description: 'Create beautiful photo collages',
    icon: Grid,
    color: 'from-purple-500 to-pink-500',
    category: 'Image Tools',
  },
  {
    id: 'pdf-merger',
    name: 'PDF Merger',
    description: 'Combine multiple PDF files into one',
    icon: Merge,
    color: 'from-red-500 to-orange-500',
    category: 'Document Tools',
  },
  {
    id: 'ai-image-generator',
    name: 'AI Image Generator',
    description: 'Generate images from text prompts using AI',
    icon: Wand2,
    color: 'from-indigo-500 to-purple-500',
    category: 'AI Tools',
  },
  {
    id: 'document-signer',
    name: 'Document Signer',
    description: 'Add digital signatures to PDF documents',
    icon: PenTool,
    color: 'from-green-500 to-emerald-500',
    category: 'Document Tools',
  },
  {
    id: 'ai-code-generator',
    name: 'AI Code Generator',
    description: 'Generate code from natural language descriptions',
    icon: Code,
    color: 'from-indigo-500 to-purple-500',
    category: 'AI Tools',
  },
  {
    id: 'ai-grammar-checker',
    name: 'AI Grammar Checker',
    description: 'Check and improve your grammar with AI',
    icon: Languages,
    color: 'from-blue-500 to-indigo-500',
    category: 'AI Tools',
  },
  {
    id: 'ai-text-expander',
    name: 'AI Text Expander',
    description: 'Expand short text into longer, detailed content',
    icon: Type,
    color: 'from-purple-500 to-pink-500',
    category: 'AI Tools',
  },
  {
    id: 'ai-keyword-extractor',
    name: 'AI Keyword Extractor',
    description: 'Extract important keywords from text using AI',
    icon: Search,
    color: 'from-teal-500 to-cyan-500',
    category: 'AI Tools',
  },
  {
    id: 'screen-recorder',
    name: 'Screen Recorder',
    description: 'Record your screen and audio',
    icon: Video,
    color: 'from-red-500 to-pink-500',
    category: 'Utility Tools',
  },
]

const categories = ['All', 'Image Tools', 'Document Tools', 'AI Tools', 'Creative Tools', 'Utility Tools', 'Study Tools', 'Text Tools', 'Developer Tools', 'Security Tools', 'Design Tools', 'Productivity Tools', 'Business Tools']

function SidebarAd({ position, adKey }: { position: 'left' | 'right', adKey: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current || scriptLoadedRef.current) return

    const containerId = `sidebar-ad-${position}`
    containerRef.current.id = containerId

    // Create a wrapper function that sets atOptions and loads the script
    const loadAd = () => {
      // Set atOptions right before loading the script
      ;(window as any).atOptions = {
        'key': adKey,
        'format': 'iframe',
        'height': 600,
        'width': 160,
        'params': {}
      }

      // Create and append the invoke script
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `//www.highperformanceformat.com/${adKey}/invoke.js`
      script.async = true
      script.id = `ad-script-${position}`
      script.onload = () => {
        scriptLoadedRef.current = true
      }
      script.onerror = () => {
        console.error(`Failed to load ad script for ${position} position`)
      }
      
      if (containerRef.current) {
        containerRef.current.appendChild(script)
      }
    }

    // Stagger the loading to avoid conflicts
    const delay = position === 'left' ? 0 : 500
    const timeoutId = setTimeout(loadAd, delay)

    return () => {
      clearTimeout(timeoutId)
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
        scriptLoadedRef.current = false
      }
      // Remove script element if it exists
      const existingScript = document.getElementById(`ad-script-${position}`)
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [position, adKey])

  return (
    <div className={`hidden lg:block fixed ${position === 'left' ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 z-40`}>
      <div ref={containerRef} id={`sidebar-ad-${position}`} className="w-[160px] h-[600px] flex items-center justify-center bg-gray-50 rounded-lg shadow-lg"></div>
    </div>
  )
}

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [mobileCategoryMenuOpen, setMobileCategoryMenuOpen] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFavorites, setShowFavorites] = useState(false)
  const [showRecent, setShowRecent] = useState(false)

  // Load favorites and check URL params
  useEffect(() => {
    const savedFavorites = localStorage.getItem('zuno-favorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }

    // Check URL params
    const params = new URLSearchParams(window.location.search)
    if (params.get('favorites') === 'true') {
      setShowFavorites(true)
    }
    if (params.get('recent') === 'true') {
      setShowRecent(true)
    }
  }, [])

  const toggleFavorite = (toolId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const updatedFavorites = favorites.includes(toolId)
      ? favorites.filter(id => id !== toolId)
      : [...favorites, toolId]
    setFavorites(updatedFavorites)
    localStorage.setItem('zuno-favorites', JSON.stringify(updatedFavorites))
  }

  const filteredTools = useMemo(() => {
    let filtered = allTools

    // Filter by favorites
    if (showFavorites) {
      filtered = filtered.filter(tool => favorites.includes(tool.id))
    }

    // Filter by recent
    if (showRecent) {
      const recent = JSON.parse(localStorage.getItem('zuno-recent-tools') || '[]')
      filtered = filtered.filter(tool => recent.includes(tool.id))
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(tool => tool.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [searchQuery, selectedCategory, favorites, showFavorites, showRecent])

  return (
    <div className="min-h-screen flex flex-col bg-transparent pb-16 md:pb-0">
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <SidebarAd position="right" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      
      <main className="flex-grow py-5 sm:py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-12">
            <div className="flex flex-col items-center justify-center mb-4 sm:mb-6">
              <div className="relative inline-flex items-center justify-center mb-4 sm:mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-pink-500 to-rose-500 p-3 sm:p-4 rounded-2xl shadow-xl">
                  <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                  Zuno Tools
                </span>
              </h1>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 mt-6 sm:mt-8">
              Powerful Tools at Your Fingertips
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl mx-auto px-4 font-medium mb-4 sm:mb-6">
              Everything you need to get things done, all in one place
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-5 sm:mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base text-gray-900 placeholder:text-gray-400 bg-white shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-900"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter - Desktop */}
          <div className="mb-6 sm:mb-8 hidden md:block">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter - Mobile */}
          <div className="mb-4 md:hidden">
            <button
              onClick={() => setMobileCategoryMenuOpen(!mobileCategoryMenuOpen)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-semibold transition-all touch-manipulation active:scale-95 ${
                selectedCategory !== 'All'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white text-gray-900 border-2 border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Category: {selectedCategory}</span>
              </div>
              <X className={`h-5 w-5 transition-transform ${mobileCategoryMenuOpen ? 'rotate-90' : ''}`} />
            </button>

            {/* Mobile Category Menu */}
            {mobileCategoryMenuOpen && (
              <div className="mt-3 bg-white border-2 border-gray-200 rounded-2xl shadow-xl p-2 space-y-1 max-h-64 overflow-y-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category)
                      setMobileCategoryMenuOpen(false)
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all touch-manipulation active:scale-95 ${
                      selectedCategory === category
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Indicators */}
          {(showFavorites || showRecent) && (
            <div className="mb-4 flex items-center justify-center gap-2 flex-wrap">
              {showFavorites && (
                <button
                  onClick={() => {
                    setShowFavorites(false)
                    window.history.replaceState({}, '', '/tools')
                  }}
                  className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <Heart className="h-4 w-4 fill-current" />
                  Favorites ({favorites.length})
                  <X className="h-4 w-4" />
                </button>
              )}
              {showRecent && (
                <button
                  onClick={() => {
                    setShowRecent(false)
                    window.history.replaceState({}, '', '/tools')
                  }}
                  className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Recent
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Results Count */}
          {(searchQuery || selectedCategory !== 'All' || showFavorites || showRecent) && (
            <div className="mb-4 text-center text-gray-900">
              Found {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''}
            </div>
          )}

          {/* Tools Grid */}
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {filteredTools.map((tool) => {
              const Icon = tool.icon
              if (!Icon) {
                console.error(`Icon is undefined for tool: ${tool.id}`)
                return null
              }
              const isFavorite = favorites.includes(tool.id)
              return (
                <div key={tool.id} className="relative group">
                  <Link
                    href={`/tools/${tool.id}`}
                    className="block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-0 flex flex-col active:scale-95 touch-manipulation"
                  >
                    <div className={`h-1.5 bg-gradient-to-r ${tool.color}`}></div>
                    <div className="p-4 sm:p-5 lg:p-6 flex flex-col items-center text-center flex-grow">
                      <div className={`inline-flex p-3 sm:p-3.5 lg:p-4 rounded-2xl bg-gradient-to-r ${tool.color} mb-3 sm:mb-4 group-active:scale-95 transition-transform shadow-lg`}>
                        {Icon && <Icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" strokeWidth={2.5} />}
                      </div>
                      <div className="mb-2">
                        <span className="text-[10px] sm:text-xs font-semibold text-primary-600 bg-primary-50 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg">
                          {tool.category}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors leading-tight line-clamp-2">
                        {tool.name}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm lg:text-xs leading-relaxed line-clamp-3 flex-grow">
                        {tool.description}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => toggleFavorite(tool.id, e)}
                    className="hidden md:flex absolute top-2 right-2 p-1 sm:p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all touch-manipulation active:scale-90 z-10 items-center justify-center"
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                </div>
              )
            })}
            </div>
          ) : (
            <>
              {showRecent ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 px-4">
                  <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 md:p-12 max-w-md w-full">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-6 sm:mb-8">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                          <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-4 sm:p-5 rounded-full">
                            <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-white" strokeWidth={2} />
                          </div>
                        </div>
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                        No Recent Tools Yet
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                        You haven't used any tools yet. Start exploring our collection of professional tools and they'll appear here for quick access!
                      </p>
                      <Link
                        href="/tools"
                        onClick={() => {
                          setShowRecent(false)
                          setSelectedCategory('All')
                          setSearchQuery('')
                          window.history.replaceState({}, '', '/tools')
                        }}
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-95 touch-manipulation"
                      >
                        <Sparkles className="h-5 w-5" />
                        <span>Explore Tools</span>
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : showFavorites ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 px-4">
                  <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 md:p-12 max-w-md w-full">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-6 sm:mb-8">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                          <div className="relative bg-gradient-to-r from-pink-500 to-rose-600 p-4 sm:p-5 rounded-full">
                            <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-white fill-white" strokeWidth={2} />
                          </div>
                        </div>
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                        No Favorites Yet
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                        You haven't added any tools to favorites yet. Tap the heart icon on any tool to add it to your favorites!
                      </p>
                      <Link
                        href="/tools"
                        onClick={() => {
                          setShowFavorites(false)
                          setSelectedCategory('All')
                          setSearchQuery('')
                          window.history.replaceState({}, '', '/tools')
                        }}
                        className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-95 touch-manipulation"
                      >
                        <Sparkles className="h-5 w-5" />
                        <span>Explore Tools</span>
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No tools found</h3>
                    <p className="text-gray-900 mb-4">Try adjusting your search or category filter</p>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('All')
                    }}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}

