'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  Image, FileText, Sparkles, Mic, QrCode, 
  GraduationCap, FileCheck, Type, Scissors, 
  Maximize2, Languages, ArrowRight, Minimize2,
  RefreshCw, Hash, Lock, Link as LinkIcon,
  Palette, Calculator, Clock, Key, Code, Search, X,
  Crop, RotateCw, Globe, Filter
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

  const filteredTools = useMemo(() => {
    let filtered = allTools

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
  }, [searchQuery, selectedCategory])

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              All Tools
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-900 max-w-2xl mx-auto px-4">
              Discover our complete collection of professional tools
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6 sm:mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base text-gray-900 placeholder:text-gray-400"
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
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${
                selectedCategory !== 'All'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-gray-900 border border-gray-300'
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
              <div className="mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 space-y-1 max-h-64 overflow-y-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category)
                      setMobileCategoryMenuOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-md font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results Count */}
          {(searchQuery || selectedCategory !== 'All') && (
            <div className="mb-4 text-center text-gray-900">
              Found {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''}
            </div>
          )}

          {/* Tools Grid */}
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
              {filteredTools.map((tool) => {
              const Icon = tool.icon
              if (!Icon) {
                console.error(`Icon is undefined for tool: ${tool.id}`)
                return null
              }
              return (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="group bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-md hover:shadow-lg sm:hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  <div className={`h-0.5 sm:h-2 bg-gradient-to-r ${tool.color}`}></div>
                  <div className="p-2 sm:p-4 lg:p-6">
                    <div className="flex items-start justify-between mb-1.5 sm:mb-3 lg:mb-4">
                      <div className={`inline-flex p-1.5 sm:p-2 lg:p-3 rounded-md sm:rounded-lg bg-gradient-to-r ${tool.color} group-hover:scale-110 transition-transform`}>
                        {Icon && <Icon className="h-3.5 w-3.5 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />}
                      </div>
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all hidden sm:block" />
                    </div>
                    <div className="mb-1 sm:mb-2">
                      <span className="text-[9px] sm:text-xs font-semibold text-primary-600 bg-primary-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                        {tool.category}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-base lg:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 group-hover:text-primary-600 transition-colors leading-tight line-clamp-2">
                      {tool.name}
                    </h3>
                    <p className="text-gray-900 text-[10px] sm:text-xs lg:text-sm leading-tight line-clamp-2 sm:line-clamp-none">
                      {tool.description}
                    </p>
                  </div>
                </Link>
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
    </div>
  )
}

