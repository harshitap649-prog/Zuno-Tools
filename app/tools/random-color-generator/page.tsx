'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'
import { Palette, Copy, Check, Download, Share2, Heart, Eye, Settings, X, Grid, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

// Dynamically import ad components to avoid SSR issues
const SidebarAd = dynamic(() => import('@/components/SidebarAd'), { ssr: false })
const MobileBottomAd = dynamic(() => import('@/components/MobileBottomAd'), { ssr: false })

interface ColorInfo {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  cmyk: { c: number; m: number; y: number; k: number }
}

export default function RandomColorGenerator() {
  const [colors, setColors] = useState<string[]>([])
  const [colorInfos, setColorInfos] = useState<ColorInfo[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [colorHistory, setColorHistory] = useState<string[]>([])
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [customColor, setCustomColor] = useState('#000000')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [colorFormat, setColorFormat] = useState<'hex' | 'rgb' | 'hsl' | 'cmyk'>('hex')
  const [showSettings, setShowSettings] = useState(false)
  const { triggerPopunder } = usePopunderAd()

  // Load favorites and history on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('color-favorites')
    const savedHistory = localStorage.getItem('color-history')
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (e) {
        console.error('Failed to load favorites:', e)
      }
    }
    if (savedHistory) {
      try {
        setColorHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Failed to load history:', e)
      }
    }
  }, [])

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return { r, g, b }
  }

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  const rgbToCmyk = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255
    const k = 1 - Math.max(r, g, b)
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 }
    const c = (1 - r - k) / (1 - k)
    const m = (1 - g - k) / (1 - k)
    const y = (1 - b - k) / (1 - k)
    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    }
  }

  const getColorInfo = (hex: string): ColorInfo => {
    const rgb = hexToRgb(hex)
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b)
    return { hex, rgb, hsl, cmyk }
  }

  const formatColor = (color: string, format: 'hex' | 'rgb' | 'hsl' | 'cmyk'): string => {
    const info = getColorInfo(color)
    switch (format) {
      case 'hex':
        return info.hex
      case 'rgb':
        return `rgb(${info.rgb.r}, ${info.rgb.g}, ${info.rgb.b})`
      case 'hsl':
        return `hsl(${info.hsl.h}, ${info.hsl.s}%, ${info.hsl.l}%)`
      case 'cmyk':
        return `cmyk(${info.cmyk.c}%, ${info.cmyk.m}%, ${info.cmyk.y}%, ${info.cmyk.k}%)`
      default:
        return color
    }
  }

  const generateColor = () => {
    const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    return hex.toUpperCase()
  }

  const generateColors = (count: number = 1) => {
    const newColors: string[] = []
    const newInfos: ColorInfo[] = []
    
    for (let i = 0; i < count; i++) {
      const color = generateColor()
      newColors.push(color)
      newInfos.push(getColorInfo(color))
    }
    
    setColors(newColors)
    setColorInfos(newInfos)
    
    // Add to history
    const updatedHistory = [...newColors, ...colorHistory].slice(0, 50)
    setColorHistory(updatedHistory)
    localStorage.setItem('color-history', JSON.stringify(updatedHistory))
  }

  const copyToClipboard = (color: string) => {
    const formatted = formatColor(color, colorFormat)
    navigator.clipboard.writeText(formatted)
    setCopied(color)
    toast.success('Color copied!')
    setTimeout(() => setCopied(null), 2000)
    
    // Trigger popunder after copy
    setTimeout(() => {
      triggerPopunder()
    }, 2000)
  }

  const copyAllColors = () => {
    if (colors.length === 0) {
      toast.error('No colors to copy')
      return
    }
    
    const formatted = colors.map(c => formatColor(c, colorFormat)).join('\n')
    navigator.clipboard.writeText(formatted)
    toast.success(`Copied ${colors.length} colors!`)
  }

  const toggleFavorite = (color: string) => {
    const updated = favorites.includes(color)
      ? favorites.filter(c => c !== color)
      : [...favorites, color]
    setFavorites(updated)
    localStorage.setItem('color-favorites', JSON.stringify(updated))
    toast.success(favorites.includes(color) ? 'Removed from favorites' : 'Added to favorites!')
  }

  const addCustomColor = () => {
    if (!customColor || !customColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      toast.error('Invalid hex color')
      return
    }
    
    const upperColor = customColor.toUpperCase()
    setColors([upperColor, ...colors])
    setColorInfos([getColorInfo(upperColor), ...colorInfos])
    setShowColorPicker(false)
    toast.success('Color added!')
  }

  const generateColorScheme = (type: 'complementary' | 'triadic' | 'analogous' | 'monochromatic') => {
    if (colors.length === 0) {
      toast.error('Generate a color first')
      return
    }
    
    const baseColor = colors[0]
    const rgb = hexToRgb(baseColor)
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    const scheme: string[] = [baseColor]
    
    if (type === 'complementary') {
      const compH = (hsl.h + 180) % 360
      scheme.push(hslToHex(compH, hsl.s, hsl.l))
    } else if (type === 'triadic') {
      const h1 = (hsl.h + 120) % 360
      const h2 = (hsl.h + 240) % 360
      scheme.push(hslToHex(h1, hsl.s, hsl.l))
      scheme.push(hslToHex(h2, hsl.s, hsl.l))
    } else if (type === 'analogous') {
      const h1 = (hsl.h + 30) % 360
      const h2 = (hsl.h - 30 + 360) % 360
      scheme.push(hslToHex(h1, hsl.s, hsl.l))
      scheme.push(hslToHex(h2, hsl.s, hsl.l))
    } else if (type === 'monochromatic') {
      scheme.push(hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 20)))
      scheme.push(hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 20)))
    }
    
    const infos = scheme.map(c => getColorInfo(c))
    setColors(scheme)
    setColorInfos(infos)
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} scheme generated!`)
  }

  const hslToHex = (h: number, s: number, l: number): string => {
    s /= 100
    l /= 100
    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs((h / 60) % 2 - 1))
    const m = l - c / 2
    let r = 0, g = 0, b = 0

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x
    }

    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)

    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('').toUpperCase()
  }

  const exportColors = () => {
    if (colors.length === 0) {
      toast.error('No colors to export')
      return
    }
    
    const data = colors.map((color, i) => ({
      hex: color,
      ...colorInfos[i]
    }))
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `colors-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Colors exported!')
  }

  const shareColors = async () => {
    if (colors.length === 0) {
      toast.error('No colors to share')
      return
    }
    
    const text = colors.map(c => formatColor(c, colorFormat)).join(', ')
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Random Colors',
          text: text,
        })
        toast.success('Colors shared!')
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          copyAllColors()
        }
      }
    } else {
      copyAllColors()
    }
  }

  const getContrastColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128 ? '#000000' : '#FFFFFF'
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <SidebarAd position="right" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 mb-3 sm:mb-4">
              <Palette className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">Random Color Generator</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Generate random colors with hex codes</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            {/* Settings Panel */}
            {showSettings && (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 sm:p-6 space-y-4">
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
                  <label className="block text-sm font-medium text-gray-900 mb-2">Color Format</label>
                  <select
                    value={colorFormat}
                    onChange={(e) => setColorFormat(e.target.value as 'hex' | 'rgb' | 'hsl' | 'cmyk')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
                  >
                    <option value="hex">HEX</option>
                    <option value="rgb">RGB</option>
                    <option value="hsl">HSL</option>
                    <option value="cmyk">CMYK</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">View Mode</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all text-sm touch-manipulation active:scale-95 ${
                        viewMode === 'grid' ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all text-sm touch-manipulation active:scale-95 ${
                        viewMode === 'list' ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      List
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Color Picker */}
            {showColorPicker && (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Add Custom Color</h3>
                  <button
                    onClick={() => setShowColorPicker(false)}
                    className="text-gray-500 hover:text-gray-700 touch-manipulation active:scale-95"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-full sm:w-auto h-12 sm:h-16 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base text-gray-900 font-mono"
                  />
                  <button
                    onClick={addCustomColor}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold transition-all text-sm sm:text-base touch-manipulation active:scale-95"
                  >
                    Add Color
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-all text-sm sm:text-base flex items-center justify-center gap-2 touch-manipulation active:scale-95"
              >
                <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Custom Color</span>
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-all text-sm sm:text-base flex items-center justify-center gap-2 touch-manipulation active:scale-95"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Settings</span>
              </button>
            </div>

            {/* Generate Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => generateColors(1)}
                className="flex-1 bg-gradient-to-r from-pink-500 to-pink-400 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all active:scale-95 touch-manipulation text-sm sm:text-base shadow-md"
              >
                Generate 1 Color
              </button>
              <button
                onClick={() => generateColors(5)}
                className="flex-1 bg-gradient-to-r from-pink-500 to-pink-400 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all active:scale-95 touch-manipulation text-sm sm:text-base shadow-md"
              >
                Generate 5 Colors
              </button>
              <button
                onClick={() => generateColors(10)}
                className="flex-1 bg-gradient-to-r from-pink-500 to-pink-400 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all active:scale-95 touch-manipulation text-sm sm:text-base shadow-md"
              >
                Generate 10 Colors
              </button>
            </div>

            {/* Color Schemes */}
            {colors.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3">Color Schemes</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => generateColorScheme('complementary')}
                    className="px-3 py-1.5 sm:py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation active:scale-95"
                  >
                    Complementary
                  </button>
                  <button
                    onClick={() => generateColorScheme('triadic')}
                    className="px-3 py-1.5 sm:py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation active:scale-95"
                  >
                    Triadic
                  </button>
                  <button
                    onClick={() => generateColorScheme('analogous')}
                    className="px-3 py-1.5 sm:py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation active:scale-95"
                  >
                    Analogous
                  </button>
                  <button
                    onClick={() => generateColorScheme('monochromatic')}
                    className="px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation active:scale-95"
                  >
                    Monochromatic
                  </button>
                </div>
              </div>
            )}

            {/* Export/Share Actions */}
            {colors.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={copyAllColors}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all text-sm sm:text-base flex items-center justify-center gap-2 touch-manipulation active:scale-95"
                >
                  <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Copy All</span>
                </button>
                <button
                  onClick={shareColors}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all text-sm sm:text-base flex items-center justify-center gap-2 touch-manipulation active:scale-95"
                >
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Share</span>
                </button>
                <button
                  onClick={exportColors}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all text-sm sm:text-base flex items-center justify-center gap-2 touch-manipulation active:scale-95"
                >
                  <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Export</span>
                </button>
              </div>
            )}

            {/* Colors Display */}
            {colors.length > 0 && (
              <div className="space-y-4">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                    {colors.map((color, index) => {
                      const info = colorInfos[index] || getColorInfo(color)
                      const isFavorite = favorites.includes(color)
                      return (
                        <div
                          key={index}
                          className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all bg-white"
                        >
                          <div
                            className="h-24 sm:h-32 md:h-40 flex items-center justify-center cursor-pointer"
                            style={{ backgroundColor: color }}
                            onClick={() => copyToClipboard(color)}
                          >
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                              {copied === color ? (
                                <Check className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                              ) : (
                                <Copy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite(color)
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation active:scale-95"
                            >
                              <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedColor(selectedColor === color ? null : color)
                              }}
                              className="absolute top-2 left-2 p-1.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation active:scale-95"
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                            </button>
                          </div>
                          <div className="p-2 sm:p-3 bg-white">
                            <div
                              className="text-xs sm:text-sm font-mono font-semibold text-center text-gray-900 mb-1"
                            >
                              {formatColor(color, colorFormat)}
                            </div>
                            {selectedColor === color && (
                              <div className="mt-2 pt-2 border-t border-gray-200 space-y-1 text-xs">
                                <div className="text-gray-600">RGB: {info.rgb.r}, {info.rgb.g}, {info.rgb.b}</div>
                                <div className="text-gray-600">HSL: {info.hsl.h}°, {info.hsl.s}%, {info.hsl.l}%</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {colors.map((color, index) => {
                      const info = colorInfos[index] || getColorInfo(color)
                      const isFavorite = favorites.includes(color)
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg shadow-md cursor-pointer flex-shrink-0"
                            style={{ backgroundColor: color }}
                            onClick={() => copyToClipboard(color)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm sm:text-base font-mono font-semibold text-gray-900">
                                {formatColor(color, colorFormat)}
                              </span>
                              <button
                                onClick={() => toggleFavorite(color)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors touch-manipulation active:scale-95"
                              >
                                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                              </button>
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 space-y-0.5">
                              <div>RGB: {info.rgb.r}, {info.rgb.g}, {info.rgb.b}</div>
                              <div>HSL: {info.hsl.h}°, {info.hsl.s}%, {info.hsl.l}%</div>
                            </div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(color)}
                            className="p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors touch-manipulation active:scale-95"
                          >
                            {copied === color ? (
                              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Favorites Section */}
            {favorites.length > 0 && (
              <div className="border-t border-gray-200 pt-4 sm:pt-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 fill-red-500" />
                    Favorites ({favorites.length})
                  </h3>
                  <button
                    onClick={() => {
                      setFavorites([])
                      localStorage.removeItem('color-favorites')
                      toast.success('Favorites cleared!')
                    }}
                    className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium touch-manipulation active:scale-95"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                  {favorites.map((color, index) => (
                    <div
                      key={index}
                      className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
                      onClick={() => copyToClipboard(color)}
                    >
                      <div
                        className="h-16 sm:h-20 flex items-center justify-center"
                        style={{ backgroundColor: color }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                          {copied === color ? (
                            <Check className="h-4 w-4 text-white" />
                          ) : (
                            <Copy className="h-4 w-4 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="p-1.5 sm:p-2 bg-white">
                        <div className="text-[10px] sm:text-xs font-mono font-semibold text-center text-gray-900 truncate">
                          {color}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Color History */}
            {colorHistory.length > 0 && (
              <div className="border-t border-gray-200 pt-4 sm:pt-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
                    Recent Colors ({colorHistory.length})
                  </h3>
                  <button
                    onClick={() => {
                      setColorHistory([])
                      localStorage.removeItem('color-history')
                      toast.success('History cleared!')
                    }}
                    className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium touch-manipulation active:scale-95"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-64 overflow-y-auto">
                  {colorHistory.slice(0, 20).map((color, index) => (
                    <div
                      key={index}
                      className="relative group cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
                      onClick={() => {
                        setColors([color, ...colors])
                        setColorInfos([getColorInfo(color), ...colorInfos])
                        toast.success('Color added!')
                      }}
                    >
                      <div
                        className="h-12 sm:h-16 flex items-center justify-center"
                        style={{ backgroundColor: color }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
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

