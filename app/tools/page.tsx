'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import MobileBottomNav from '@/components/MobileBottomNav'
import { 
  Image, FileText, Sparkles, Mic, QrCode, 
  GraduationCap, FileCheck, Type, Scissors, 
  Maximize2, Languages, ArrowRight, Minimize2,
  RefreshCw, Hash, Lock, Link as LinkIcon,
  Palette, Calculator, Clock, Key, Code, Search, X,
  Crop, RotateCw, Globe, Filter, Heart
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
]

const categories = ['All', 'Image Tools', 'Document Tools', 'AI Tools', 'Creative Tools', 'Utility Tools', 'Study Tools', 'Text Tools', 'Developer Tools', 'Security Tools', 'Design Tools']

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
      <Navbar />
      
      <main className="flex-grow py-5 sm:py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-4">
              All Tools
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-gray-900 max-w-2xl mx-auto px-4">
              Discover our complete collection of professional tools
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
                    className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all touch-manipulation active:scale-90 z-10"
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                </div>
              )
            })}
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
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}

