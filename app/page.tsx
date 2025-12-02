'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import MobileBottomNav from '@/components/MobileBottomNav'
import { 
  Image, FileText, Sparkles, Mic, QrCode, 
  GraduationCap, FileCheck, Type, 
  Scissors, Maximize2, Languages,
  Minimize2, RefreshCw, Hash, Lock, Link as LinkIcon,
  Palette, Calculator, Clock, Key, Code, Search, X,
  Crop, RotateCw, Globe, Heart
} from 'lucide-react'

const tools = [
  {
    id: 'background-remover',
    name: 'Background Remover',
    description: 'Remove backgrounds from images instantly with AI',
    icon: Scissors,
    color: 'from-purple-500 to-pink-500',
    href: '/tools/background-remover',
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Resize images to any dimension while maintaining quality',
    icon: Maximize2,
    color: 'from-blue-500 to-cyan-500',
    href: '/tools/image-resizer',
  },
  {
    id: 'pdf-tools',
    name: 'PDF Tools',
    description: 'Create PDFs, convert PDF to JPG, JPG to PNG',
    icon: FileText,
    color: 'from-red-500 to-orange-500',
    href: '/tools/pdf-tools',
  },
  {
    id: 'meme-generator',
    name: 'Meme Generator',
    description: 'Create hilarious memes with custom text and images',
    icon: Image,
    color: 'from-yellow-500 to-orange-500',
    href: '/tools/meme-generator',
  },
  {
    id: 'ai-resume-builder',
    name: 'AI Resume Builder',
    description: 'Build professional resumes with AI assistance',
    icon: FileCheck,
    color: 'from-green-500 to-emerald-500',
    href: '/tools/ai-resume-builder',
  },
  {
    id: 'ai-summarizer',
    name: 'AI Summarizer',
    description: 'Summarize long texts and documents instantly',
    icon: Sparkles,
    color: 'from-indigo-500 to-purple-500',
    href: '/tools/ai-summarizer',
  },
  {
    id: 'text-to-speech',
    name: 'Text to Speech',
    description: 'Convert text to natural-sounding speech',
    icon: Mic,
    color: 'from-pink-500 to-rose-500',
    href: '/tools/text-to-speech',
  },
  {
    id: 'qr-generator',
    name: 'QR Generator',
    description: 'Generate QR codes for URLs, text, and more',
    icon: QrCode,
    color: 'from-gray-700 to-gray-900',
    href: '/tools/qr-generator',
  },
  {
    id: 'ai-note-summarizer',
    name: 'AI Note Summarizer',
    description: 'Summarize your notes and study materials',
    icon: Type,
    color: 'from-teal-500 to-cyan-500',
    href: '/tools/ai-note-summarizer',
  },
  {
    id: 'english-improvement',
    name: 'AI English Improvement',
    description: 'Improve your English writing with AI suggestions',
    icon: Languages,
    color: 'from-blue-600 to-indigo-600',
    href: '/tools/english-improvement',
  },
  {
    id: 'study-tools',
    name: 'Study Tools',
    description: 'Essential tools for students - flashcards, timers, and more',
    icon: GraduationCap,
    color: 'from-violet-500 to-purple-500',
    href: '/tools/study-tools',
  },
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Reduce image file size while maintaining quality',
    icon: Minimize2,
    color: 'from-green-500 to-emerald-500',
    href: '/tools/image-compressor',
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Convert images between PNG, JPG, and WEBP formats',
    icon: RefreshCw,
    color: 'from-blue-500 to-indigo-500',
    href: '/tools/image-converter',
  },
  {
    id: 'word-counter',
    name: 'Word Counter',
    description: 'Count words, characters, sentences, and more',
    icon: FileText,
    color: 'from-purple-500 to-pink-500',
    href: '/tools/word-counter',
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate strong, secure passwords instantly',
    icon: Key,
    color: 'from-orange-500 to-red-500',
    href: '/tools/password-generator',
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, and minify JSON data',
    icon: Code,
    color: 'from-indigo-500 to-purple-500',
    href: '/tools/json-formatter',
  },
  {
    id: 'base64-encoder',
    name: 'Base64 Encoder',
    description: 'Encode and decode Base64 strings',
    icon: Hash,
    color: 'from-teal-500 to-cyan-500',
    href: '/tools/base64-encoder',
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    description: 'Convert text to different cases instantly',
    icon: Type,
    color: 'from-blue-500 to-indigo-500',
    href: '/tools/case-converter',
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes',
    icon: Lock,
    color: 'from-red-500 to-pink-500',
    href: '/tools/hash-generator',
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate unique identifiers (UUID v4)',
    icon: Hash,
    color: 'from-violet-500 to-purple-500',
    href: '/tools/uuid-generator',
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder',
    description: 'Encode and decode URL strings',
    icon: LinkIcon,
    color: 'from-blue-500 to-cyan-500',
    href: '/tools/url-encoder',
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    description: 'Pick colors and get values in multiple formats',
    icon: Palette,
    color: 'from-pink-500 to-rose-500',
    href: '/tools/color-picker',
  },
  {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text for your designs',
    icon: FileText,
    color: 'from-amber-500 to-orange-500',
    href: '/tools/lorem-ipsum',
  },
  {
    id: 'barcode-generator',
    name: 'Barcode Generator',
    description: 'Generate barcodes in multiple formats',
    icon: Hash,
    color: 'from-gray-700 to-gray-900',
    href: '/tools/barcode-generator',
  },
  {
    id: 'unit-converter',
    name: 'Unit Converter',
    description: 'Convert between different units of measurement',
    icon: Calculator,
    color: 'from-green-500 to-emerald-500',
    href: '/tools/unit-converter',
  },
  {
    id: 'timezone-converter',
    name: 'Time Zone Converter',
    description: 'Convert time between different time zones',
    icon: Clock,
    color: 'from-blue-500 to-indigo-500',
    href: '/tools/timezone-converter',
  },
  {
    id: 'image-cropper',
    name: 'Image Cropper',
    description: 'Crop images with custom dimensions',
    icon: Crop,
    color: 'from-green-500 to-emerald-500',
    href: '/tools/image-cropper',
  },
  {
    id: 'image-rotator',
    name: 'Image Rotator',
    description: 'Rotate images 90°, 180°, or 270°',
    icon: RotateCw,
    color: 'from-blue-500 to-cyan-500',
    href: '/tools/image-rotator',
  },
  {
    id: 'image-filters',
    name: 'Image Filters',
    description: 'Apply filters to your images',
    icon: Image,
    color: 'from-purple-500 to-pink-500',
    href: '/tools/image-filters',
  },
  {
    id: 'code-formatter',
    name: 'Code Formatter',
    description: 'Format and minify code in multiple languages',
    icon: Code,
    color: 'from-indigo-500 to-purple-500',
    href: '/tools/code-formatter',
  },
  {
    id: 'ip-address-info',
    name: 'IP Address Info',
    description: 'Get information about your IP address',
    icon: Globe,
    color: 'from-blue-500 to-cyan-500',
    href: '/tools/ip-address-info',
  },
  {
    id: 'qr-code-scanner',
    name: 'QR Code Scanner',
    description: 'Scan QR codes from images',
    icon: QrCode,
    color: 'from-gray-700 to-gray-900',
    href: '/tools/qr-code-scanner',
  },
  {
    id: 'favicon-generator',
    name: 'Favicon Generator',
    description: 'Generate favicons from images in multiple sizes',
    icon: Image,
    color: 'from-pink-500 to-rose-500',
    href: '/tools/favicon-generator',
  },
  {
    id: 'text-extractor',
    name: 'Text Extractor',
    description: 'Extract text from images using OCR',
    icon: FileText,
    color: 'from-indigo-500 to-purple-500',
    href: '/tools/text-extractor',
  },
]

function BannerAd({ id }: { id: string }) {
  const adRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Set atOptions in window scope
    ;(window as any).atOptions = {
      'key': '34970aed813cbee86887c4caa5c6c712',
      'format': 'iframe',
      'height': 50,
      'width': 320,
      'params': {}
    }

    // Create and append the invoke script
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = '//www.highperformanceformat.com/34970aed813cbee86887c4caa5c6c712/invoke.js'
    script.async = true
    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
      delete (window as any).atOptions
    }
  }, [id])

  return (
    <div className="col-span-2 lg:col-span-3 md:hidden flex justify-center items-center py-4">
      <div ref={containerRef} id={`ad-container-${id}`} className="w-full max-w-[320px] h-[50px] flex items-center justify-center"></div>
    </div>
  )
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const savedFavorites = localStorage.getItem('zuno-favorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
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
    if (!searchQuery.trim()) {
      return tools.slice(0, 6) // Show first 6 tools on home page
    }
    const query = searchQuery.toLowerCase()
    return tools.filter(tool =>
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query)
    )
  }, [searchQuery])

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-transparent py-8 sm:py-12 md:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className="flex flex-col items-center justify-center mb-4 sm:mb-6 animate-fade-in">
                <div className="relative inline-flex items-center justify-center mb-3 sm:mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-pink-500 to-rose-500 p-2 sm:p-3 rounded-xl shadow-xl">
                    <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                    Zuno Tools
                  </span>
                </h1>
                <div className="mt-2 sm:mt-3 h-1 w-24 sm:w-32 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mx-auto"></div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-6 animate-fade-in">
                All-in-One
                <span className="block bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                  Professional Tools
                </span>
              </h2>
              <p className="text-sm sm:text-lg md:text-xl text-gray-900 max-w-3xl mx-auto mb-5 sm:mb-8 px-4 animate-slide-up">
                Transform images, create PDFs, generate AI-powered content, and boost your productivity 
                with our comprehensive suite of professional tools.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mb-5 sm:mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base shadow-sm text-gray-900 placeholder:text-gray-400 bg-white"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="py-8 sm:py-12 md:py-20 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-12">
              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
                Powerful Tools at Your Fingertips
              </h2>
              <p className="text-sm sm:text-lg md:text-xl text-gray-900 px-4">
                Everything you need to get things done, all in one place
              </p>
            </div>

            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {filteredTools.map((tool, index) => {
                const Icon = tool.icon
                if (!Icon) {
                  console.error(`Icon is undefined for tool: ${tool.id}`)
                  return null
                }
                const isFavorite = favorites.includes(tool.id)
                const showAd = (index + 1) % 10 === 0 && index > 0
                
                return (
                  <>
                    <div key={tool.id} className="relative group">
                      <Link
                        href={tool.href}
                        className="block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-0 flex flex-col active:scale-95 touch-manipulation"
                      >
                        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${tool.color}`}></div>
                        <div className="p-4 sm:p-5 lg:p-6 flex flex-col items-center text-center flex-grow">
                          <div className={`inline-flex p-3 sm:p-3.5 lg:p-4 rounded-2xl bg-gradient-to-r ${tool.color} mb-3 sm:mb-4 group-active:scale-95 transition-transform shadow-lg`}>
                            {Icon && <Icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" strokeWidth={2.5} />}
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
                    {showAd && <BannerAd key={`ad-${index}`} id={`${index}`} />}
                  </>
                )
              })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tools found</h3>
                <p className="text-gray-900 mb-4">Try a different search term</p>
                <Link
                  href="/tools"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  View all tools →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Why Choose Zuno Tools?
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center p-6">
                <div className="inline-flex p-4 rounded-full bg-primary-100 mb-4">
                  <Sparkles className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered</h3>
                <p className="text-gray-900">
                  Leverage cutting-edge AI technology for the best results
                </p>
              </div>
              <div className="text-center p-6">
                <div className="inline-flex p-4 rounded-full bg-primary-100 mb-4">
                  <FileText className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Quality</h3>
                <p className="text-gray-900">
                  Enterprise-grade tools for professional use
                </p>
              </div>
              <div className="text-center p-6">
                <div className="inline-flex p-4 rounded-full bg-primary-100 mb-4">
                  <Sparkles className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy to Use</h3>
                <p className="text-gray-900">
                  Intuitive interface designed for everyone
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}

