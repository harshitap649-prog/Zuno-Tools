'use client'

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Footer from '@/components/Footer'
import MobileBottomNavWrapper from '@/components/MobileBottomNavWrapper'
import SidebarAd from '@/components/SidebarAd'
import MobileBottomAd from '@/components/MobileBottomAd'
import { 
  Image, FileText, Sparkles, Mic, QrCode, 
  GraduationCap, FileCheck, Type, Scissors, 
  Maximize2, Languages, ArrowRight, Minimize2,
  RefreshCw, Hash, Lock, Link as LinkIcon,
  Palette, Calculator, Clock, Key, Code, Search, X,
  Crop, RotateCw, Globe, Filter, Heart, Calendar,
  Shield, DollarSign, CheckSquare, Target,
  Instagram, Eye, EyeOff, Mail, Wand2,
  PenTool, Video, MessageCircle
} from 'lucide-react'

const allTools = [
  {
    id: 'ai-image-generator',
    name: 'AI Image Generator',
    description: 'Generate images from text prompts using AI',
    icon: Wand2,
    color: 'from-indigo-500 to-purple-500',
    category: 'AI Tools',
  },
  {
    id: 'instagram-bio-generator',
    name: 'Instagram 650+ Bio/Captions',
    description: 'Browse and copy from 650+ pre-made Instagram bios and captions',
    icon: Instagram,
    color: 'from-pink-500 to-rose-500',
    category: 'Creative Tools',
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
    id: 'task-manager',
    name: 'Task Manager',
    description: 'Manage your tasks and stay organized',
    icon: CheckSquare,
    color: 'from-green-500 to-emerald-500',
    category: 'Productivity Tools',
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
    id: 'tip-calculator',
    name: 'Tip Calculator',
    description: 'Calculate tips and split bills easily',
    icon: Calculator,
    color: 'from-orange-500 to-red-500',
    category: 'Utility Tools',
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
    id: 'random-color-generator',
    name: 'Random Color Generator',
    description: 'Generate random colors with hex codes',
    icon: Palette,
    color: 'from-pink-500 to-rose-500',
    category: 'Design Tools',
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
    id: 'age-calculator',
    name: 'Age Calculator',
    description: 'Calculate your exact age from your birthdate',
    icon: Calendar,
    color: 'from-blue-500 to-cyan-500',
    category: 'Utility Tools',
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
    id: 'barcode-generator',
    name: 'Barcode Generator',
    description: 'Generate barcodes in multiple formats',
    icon: Hash,
    color: 'from-gray-700 to-gray-900',
    category: 'Utility Tools',
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
    id: 'ai-resume-builder',
    name: 'AI Resume Builder',
    description: 'Build professional resumes with AI assistance',
    icon: FileCheck,
    color: 'from-green-500 to-emerald-500',
    category: 'AI Tools',
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
    id: 'percentage-calculator',
    name: 'Percentage Calculator',
    description: 'Calculate percentages easily',
    icon: Calculator,
    color: 'from-purple-500 to-pink-500',
    category: 'Utility Tools',
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
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate strong, secure passwords instantly',
    icon: Key,
    color: 'from-orange-500 to-red-500',
    category: 'Security Tools',
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
    id: 'color-picker',
    name: 'Color Picker',
    description: 'Pick colors and get values in multiple formats',
    icon: Palette,
    color: 'from-pink-500 to-rose-500',
    category: 'Design Tools',
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
    id: 'pomodoro-timer',
    name: 'Pomodoro Timer',
    description: 'Focus timer for productive work sessions',
    icon: Clock,
    color: 'from-red-500 to-pink-500',
    category: 'Productivity Tools',
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
    id: 'case-converter',
    name: 'Case Converter',
    description: 'Convert text to different cases instantly',
    icon: Type,
    color: 'from-blue-500 to-indigo-500',
    category: 'Text Tools',
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
    id: 'image-rotator',
    name: 'Image Rotator',
    description: 'Rotate images 90°, 180°, or 270°',
    icon: RotateCw,
    color: 'from-blue-500 to-cyan-500',
    category: 'Image Tools',
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
    id: 'study-tools',
    name: 'Study Tools',
    description: 'Essential tools for students - flashcards, timers, and more',
    icon: GraduationCap,
    color: 'from-violet-500 to-purple-500',
    category: 'Study Tools',
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
    id: 'image-cropper',
    name: 'Image Cropper',
    description: 'Crop images with custom dimensions',
    icon: Crop,
    color: 'from-green-500 to-emerald-500',
    category: 'Image Tools',
  },
  {
    id: 'screen-recorder',
    name: 'Screen Recorder',
    description: 'Record your screen and audio',
    icon: Video,
    color: 'from-red-500 to-pink-500',
    category: 'Utility Tools',
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
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Resize images to any dimension while maintaining quality',
    icon: Maximize2,
    color: 'from-blue-500 to-cyan-500',
    category: 'Image Tools',
  },
]

const categories = ['All', 'Image Tools', 'Document Tools', 'AI Tools', 'Creative Tools', 'Utility Tools', 'Study Tools', 'Text Tools', 'Developer Tools', 'Security Tools', 'Design Tools', 'Productivity Tools', 'Business Tools']

function ToolsPageContent() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFavorites, setShowFavorites] = useState(false)
  const [showRecent, setShowRecent] = useState(false)

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('zuno-favorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // React to URL search params changes
  useEffect(() => {
    const fav = searchParams.get('favorites') === 'true'
    const rec = searchParams.get('recent') === 'true'
    
    if (fav) {
      setShowFavorites(true)
      setShowRecent(false)
      setSelectedCategory('All')
      setSearchQuery('')
    } else if (rec) {
      setShowRecent(true)
      setShowFavorites(false)
      setSelectedCategory('All')
      setSearchQuery('')
    } else {
      setShowFavorites(false)
      setShowRecent(false)
    }
  }, [searchParams])

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
    <div className="min-h-screen flex flex-col bg-white pb-16 md:pb-0">
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="36d691042d95ac1ac33375038ec47a5c" />
      <SidebarAd position="right" adKey="36d691042d95ac1ac33375038ec47a5c" />
      
      <main className="flex-grow py-5 sm:py-8 md:py-12">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Powerful Tools at Your Fingertips
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl mx-auto px-4 font-medium mb-4 sm:mb-6">
              Everything you need to get things done, all in one place
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-4 sm:mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-4 border border-gray-200 sm:border-2 rounded-lg sm:rounded-xl focus:ring-1 sm:focus:ring-2 focus:ring-pink-300/20 focus:border-pink-300 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 bg-white shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-900 active:scale-95"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter - Desktop Only (hidden on mobile) */}
          <div className="mb-6 sm:mb-8 hidden md:block">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-md hover:shadow-lg'
                      : 'bg-white text-gray-900 hover:bg-pink-50 border border-gray-300 hover:border-pink-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
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
                  className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-pink-400 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
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
                  className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-pink-400 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
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
              {filteredTools.map((tool, index) => {
              const Icon = tool.icon
              if (!Icon) {
                console.error(`Icon is undefined for tool: ${tool.id}`)
                return null
              }
              const isFavorite = favorites.includes(tool.id)
              return (
                <React.Fragment key={tool.id}>
                  <div className="relative group">
                    <Link
                      href={`/tools/${tool.id}`}
                      prefetch
                      className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200/80 flex flex-col active:scale-95 touch-manipulation hover:-translate-y-0.5 hover:border-gray-300"
                    >
                      <div className={`h-1.5 bg-gradient-to-r ${tool.color} opacity-95`}></div>
                      <div className="p-4 sm:p-5 lg:p-6 flex flex-col items-center text-center flex-grow relative">
                        {/* Icon with enhanced styling */}
                        <div className="relative mb-3 sm:mb-4">
                          <div className={`inline-flex p-3 sm:p-3.5 lg:p-4 rounded-2xl bg-gradient-to-r ${tool.color} group-hover:scale-105 transition-transform duration-300 shadow-xl group-hover:shadow-2xl`}>
                            {Icon && <Icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" strokeWidth={2.5} />}
                          </div>
                          {/* Subtle glow behind icon */}
                          <div className={`absolute inset-0 bg-gradient-to-r ${tool.color} rounded-2xl blur-lg opacity-15 group-hover:opacity-25 transition-opacity duration-300 -z-10 scale-110`}></div>
                        </div>
                        
                        {/* Category badge */}
                        <div className="mb-2">
                          <span className="text-[10px] sm:text-xs font-semibold text-gray-700 bg-gray-100 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-gray-200/60">
                            {tool.category}
                          </span>
                        </div>
                        
                        {/* Tool name */}
                        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors leading-tight line-clamp-2">
                          {tool.name}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-gray-600 text-xs sm:text-sm lg:text-xs leading-relaxed line-clamp-3 flex-grow">
                          {tool.description}
                        </p>
                      </div>
                    </Link>
                    
                  {/* Favorite button (mobile + desktop) */}
                  <button
                    onClick={(e) => toggleFavorite(tool.id, e)}
                    className="flex absolute top-2 right-2 p-1 sm:p-2 bg-white/95 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all touch-manipulation active:scale-90 z-10 items-center justify-center border border-gray-200/60 hover:border-gray-300 hover:bg-gray-50/80"
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 transition-all duration-200 ${isFavorite ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-400 hover:text-gray-500'}`} />
                  </button>
                  </div>
                  {(index + 1) % 10 === 0 && (
                    <div className="col-span-2 sm:col-span-2 lg:hidden" key={`mobile-ad-${index}`}>
                      <MobileBottomAd adKey="36d691042d95ac1ac33375038ec47a5c" />
                    </div>
                  )}
                </React.Fragment>
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
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-300 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                          <div className="relative bg-gradient-to-r from-pink-400 to-pink-500 p-4 sm:p-5 rounded-full">
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
                        className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-pink-400 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-95 touch-manipulation"
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
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-300 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                          <div className="relative bg-gradient-to-r from-pink-400 to-pink-500 p-4 sm:p-5 rounded-full">
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
                        className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-pink-400 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-95 touch-manipulation"
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
                    className="text-pink-500 hover:text-pink-500 font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <MobileBottomAd adKey="36d691042d95ac1ac33375038ec47a5c" />
      <Footer />
      <MobileBottomNavWrapper />
    </div>
  )
}

export default function ToolsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tools...</p>
        </div>
      </div>
    }>
      <ToolsPageContent />
    </Suspense>
  )
}


