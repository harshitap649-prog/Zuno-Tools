'use client'

import { useState, useEffect, useMemo } from 'react'
import Footer from '@/components/Footer'
import SidebarAd from '@/components/SidebarAd'
import MobileBottomAd from '@/components/MobileBottomAd'
import toast from 'react-hot-toast'
import {
  Palette, Copy, Check, History, Star, Download, 
  Contrast, Eye, Sliders, Layers, Sparkles, 
  X, Plus, Trash2, Save, ChevronDown, ChevronUp,
  FileText, Code, FileJson
} from 'lucide-react'

interface FavoriteColor {
  id: string
  hex: string
  name: string
  category?: string
}

interface ColorHistory {
  hex: string
  timestamp: number
}

const COLOR_NAMES: Record<string, string> = {
  '#000000': 'Black',
  '#FFFFFF': 'White',
  '#FF0000': 'Red',
  '#00FF00': 'Green',
  '#0000FF': 'Blue',
  '#FFFF00': 'Yellow',
  '#FF00FF': 'Magenta',
  '#00FFFF': 'Cyan',
  '#FFA500': 'Orange',
  '#800080': 'Purple',
  '#FFC0CB': 'Pink',
  '#A52A2A': 'Brown',
  '#808080': 'Gray',
  '#3b82f6': 'Blue',
  '#10b981': 'Emerald',
  '#f59e0b': 'Amber',
  '#ef4444': 'Red',
  '#8b5cf6': 'Violet',
  '#ec4899': 'Pink',
}

export default function ColorPicker() {
  const [color, setColor] = useState('#3b82f6')
  const [alpha, setAlpha] = useState(100)
  const [copied, setCopied] = useState<string | null>(null)
  const [colorHistory, setColorHistory] = useState<ColorHistory[]>([])
  const [favorites, setFavorites] = useState<FavoriteColor[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [activeTab, setActiveTab] = useState<'picker' | 'palette' | 'shades' | 'contrast'>('picker')
  const [paletteType, setPaletteType] = useState<'complementary' | 'triadic' | 'analogous' | 'monochromatic'>('complementary')
  const [showExport, setShowExport] = useState(false)

  // Load favorites and history from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('color-picker-favorites')
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (e) {
        console.error('Failed to load favorites')
      }
    }
    const savedHistory = localStorage.getItem('color-picker-history')
    if (savedHistory) {
      try {
        setColorHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Failed to load history')
      }
    }
  }, [])

  // Add to history when color changes
  useEffect(() => {
    if (color) {
      const newHistory: ColorHistory = {
        hex: color,
        timestamp: Date.now()
      }
      setColorHistory(prev => {
        const filtered = prev.filter(h => h.hex !== color)
        const updated = [newHistory, ...filtered].slice(0, 20)
        localStorage.setItem('color-picker-history', JSON.stringify(updated))
        return updated
      })
    }
  }, [color])

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6
          break
        case g:
          h = ((b - r) / d + 2) / 6
          break
        case b:
          h = ((r - g) / d + 4) / 6
          break
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    }
  }

  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360
    s /= 100
    l /= 100

    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q

      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    }
  }

  const rgbToCmyk = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255

    const k = 1 - Math.max(r, g, b)
    const c = k === 1 ? 0 : (1 - r - k) / (1 - k)
    const m = k === 1 ? 0 : (1 - g - k) / (1 - k)
    const y = k === 1 ? 0 : (1 - b - k) / (1 - k)

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100),
    }
  }

  const rgb = hexToRgb(color)
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null
  const cmyk = rgb ? rgbToCmyk(rgb.r, rgb.g, rgb.b) : null
  const alphaValue = alpha / 100

  // Get color name
  const getColorName = (hex: string) => {
    return COLOR_NAMES[hex.toUpperCase()] || null
  }

  const colorName = getColorName(color)

  // Generate color palettes
  const generatePalette = () => {
    if (!hsl) return []

    const { h, s, l } = hsl
    const colors: string[] = [color]

    switch (paletteType) {
      case 'complementary':
        const compH = (h + 180) % 360
        const compRgb = hslToRgb(compH, s, l)
        colors.push(rgbToHex(compRgb.r, compRgb.g, compRgb.b))
        break

      case 'triadic':
        const tri1 = (h + 120) % 360
        const tri2 = (h + 240) % 360
        const tri1Rgb = hslToRgb(tri1, s, l)
        const tri2Rgb = hslToRgb(tri2, s, l)
        colors.push(rgbToHex(tri1Rgb.r, tri1Rgb.g, tri1Rgb.b))
        colors.push(rgbToHex(tri2Rgb.r, tri2Rgb.g, tri2Rgb.b))
        break

      case 'analogous':
        const ana1 = (h + 30) % 360
        const ana2 = (h - 30 + 360) % 360
        const ana1Rgb = hslToRgb(ana1, s, l)
        const ana2Rgb = hslToRgb(ana2, s, l)
        colors.push(rgbToHex(ana1Rgb.r, ana1Rgb.g, ana1Rgb.b))
        colors.push(rgbToHex(ana2Rgb.r, ana2Rgb.g, ana2Rgb.b))
        break

      case 'monochromatic':
        const mono1 = hslToRgb(h, s, Math.max(0, l - 20))
        const mono2 = hslToRgb(h, s, Math.min(100, l + 20))
        colors.push(rgbToHex(mono1.r, mono1.g, mono1.b))
        colors.push(rgbToHex(mono2.r, mono2.g, mono2.b))
        break
    }

    return colors
  }

  // Generate shades and tints
  const generateShadesTints = () => {
    if (!hsl) return []

    const { h, s } = hsl
    const variations: { hex: string; type: string; lightness: number }[] = []

    // Tints (lighter)
    for (let i = 1; i <= 5; i++) {
      const lightness = Math.min(100, hsl.l + (i * 10))
      const rgb = hslToRgb(h, s, lightness)
      variations.push({
        hex: rgbToHex(rgb.r, rgb.g, rgb.b),
        type: 'Tint',
        lightness
      })
    }

    // Original
    variations.push({
      hex: color,
      type: 'Original',
      lightness: hsl.l
    })

    // Shades (darker)
    for (let i = 1; i <= 5; i++) {
      const lightness = Math.max(0, hsl.l - (i * 10))
      const rgb = hslToRgb(h, s, lightness)
      variations.push({
        hex: rgbToHex(rgb.r, rgb.g, rgb.b),
        type: 'Shade',
        lightness
      })
    }

    return variations.reverse()
  }

  // Calculate contrast ratio
  const getContrastRatio = (color1: string, color2: string) => {
    const getLuminance = (hex: string) => {
      const rgb = hexToRgb(hex)
      if (!rgb) return 0

      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
        val = val / 255
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
      })

      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    const lighter = Math.max(lum1, lum2)
    const darker = Math.min(lum1, lum2)

    return (lighter + 0.05) / (darker + 0.05)
  }

  const contrastWhite = rgb ? getContrastRatio(color, '#FFFFFF') : 0
  const contrastBlack = rgb ? getContrastRatio(color, '#000000') : 0

  const getWCAGLevel = (ratio: number) => {
    if (ratio >= 7) return { level: 'AAA', pass: true }
    if (ratio >= 4.5) return { level: 'AA', pass: true }
    if (ratio >= 3) return { level: 'AA Large', pass: true }
    return { level: 'Fail', pass: false }
  }

  const formats = useMemo(() => {
    if (!rgb || !hsl) return []
    
    return [
      { name: 'HEX', value: color },
      { name: 'HEX (8-digit)', value: `${color}${Math.round(alphaValue * 255).toString(16).padStart(2, '0')}` },
      { name: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
      { name: 'RGBA', value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alphaValue.toFixed(2)})` },
      { name: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
      { name: 'HSLA', value: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alphaValue.toFixed(2)})` },
      { name: 'HSV', value: `hsv(${hsl.h}, ${hsl.s}%, ${Math.round((Math.max(rgb.r/255, rgb.g/255, rgb.b/255)) * 100)}%)` },
      cmyk ? { name: 'CMYK', value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` } : null,
    ].filter(Boolean) as Array<{ name: string; value: string }>
  }, [color, rgb, hsl, cmyk, alphaValue])

  const copyToClipboard = (value: string, format: string) => {
    navigator.clipboard.writeText(value)
    setCopied(format)
    toast.success(`${format} copied!`)
    setTimeout(() => setCopied(null), 2000)
  }

  const saveFavorite = () => {
    const name = prompt('Enter a name for this color:') || 'Unnamed'
    const newFavorite: FavoriteColor = {
      id: Date.now().toString(),
      hex: color,
      name,
    }
    const updated = [...favorites, newFavorite]
    setFavorites(updated)
    localStorage.setItem('color-picker-favorites', JSON.stringify(updated))
    toast.success('Color saved to favorites!')
  }

  const deleteFavorite = (id: string) => {
    const updated = favorites.filter(f => f.id !== id)
    setFavorites(updated)
    localStorage.setItem('color-picker-favorites', JSON.stringify(updated))
    toast.success('Favorite removed!')
  }

  const exportColor = (format: 'css' | 'scss' | 'json') => {
    if (!rgb || !hsl) return

    let content = ''
    const varName = 'primary-color'

    switch (format) {
      case 'css':
        content = `:root {\n  --${varName}: ${color};\n  --${varName}-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};\n  --${varName}-hsl: ${hsl.h}, ${hsl.s}%, ${hsl.l}%;\n}`
        break
      case 'scss':
        content = `$${varName}: ${color};\n$${varName}-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};\n$${varName}-hsl: ${hsl.h}, ${hsl.s}%, ${hsl.l}%;`
        break
      case 'json':
        content = JSON.stringify({
          hex: color,
          rgb: { r: rgb.r, g: rgb.g, b: rgb.b },
          hsl: { h: hsl.h, s: hsl.s, l: hsl.l },
          alpha: alphaValue,
        }, null, 2)
        break
    }

    navigator.clipboard.writeText(content)
    toast.success(`${format.toUpperCase()} exported and copied!`)
  }

  const updateColorFromRgb = (r: number, g: number, b: number) => {
    setColor(rgbToHex(r, g, b))
  }

  const updateColorFromHsl = (h: number, s: number, l: number) => {
    const rgb = hslToRgb(h, s, l)
    setColor(rgbToHex(rgb.r, rgb.g, rgb.b))
  }

  const palette = generatePalette()
  const shadesTints = generateShadesTints()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SidebarAd position="left" adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      <SidebarAd position="right" adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      
      <main className="flex-grow py-4 sm:py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-4 sm:mb-6">
            <div className="relative inline-flex items-center justify-center mb-4 sm:mb-5">
              {/* Multiple animated glow layers */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 rounded-full blur-xl opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="relative inline-flex p-2 sm:p-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 shadow-2xl transform transition-transform hover:scale-110">
                <Palette className="h-6 w-6 sm:h-8 sm:w-8 text-white drop-shadow-lg" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2 sm:mb-3">
              Color Picker
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 px-4 font-medium">Professional color picker with palette generator and contrast checker</p>
          </div>

          {/* Tabs */}
          <div className="bg-gradient-to-br from-white via-pink-50/30 to-rose-50/30 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-2 sm:p-3 mb-4 sm:mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'picker', label: 'Picker', icon: Palette, gradient: 'from-blue-500 to-cyan-500' },
                { id: 'palette', label: 'Palette', icon: Sparkles, gradient: 'from-purple-500 to-pink-500' },
                { id: 'shades', label: 'Shades', icon: Layers, gradient: 'from-orange-500 to-red-500' },
                { id: 'contrast', label: 'Contrast', icon: Contrast, gradient: 'from-green-500 to-emerald-500' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any)
                    toast.success(`Switched to ${tab.label}`, { duration: 1000 })
                  }}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm transition-all transform ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105`
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 hover:scale-105'
                  }`}
                >
                  <tab.icon className="h-4 w-4 sm:h-5 sm:w-5 inline mr-1.5 sm:mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Color Display */}
          <div className="bg-gradient-to-br from-white via-pink-50/20 to-rose-50/20 rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-200 via-rose-200 to-pink-300 rounded-xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div
                  className="relative w-full sm:w-64 h-48 sm:h-64 rounded-xl shadow-2xl border-4 border-white overflow-hidden transition-transform hover:scale-105"
                  style={{ backgroundColor: color }}
                >
                  {/* Transparency checkerboard pattern */}
                  <div 
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
                    }}
                  />
                  <div 
                    className="absolute inset-0 transition-opacity duration-300"
                    style={{ backgroundColor: color, opacity: alphaValue }}
                  />
                  {/* Opacity indicator */}
                  {alpha < 100 && (
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                      {alpha}%
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 w-full space-y-4">
                {/* Color Name */}
                {colorName && (
                  <div className="text-center sm:text-left">
                    <span className="text-xs text-gray-500">Color Name:</span>
                    <div className="text-lg sm:text-xl font-bold text-gray-900">{colorName}</div>
                  </div>
                )}

                {/* Color Input */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">Select Color</label>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg cursor-pointer border-2 border-gray-300 flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => {
                        const hex = e.target.value
                        if (/^#?[0-9A-Fa-f]{0,6}$/.test(hex.replace('#', ''))) {
                          setColor(hex.startsWith('#') ? hex : `#${hex}`)
                        }
                      }}
                      placeholder="#000000"
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 font-mono text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Alpha Slider */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">
                    Opacity: {alpha}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={alpha}
                    onChange={(e) => setAlpha(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={saveFavorite}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-yellow-400 to-pink-400 text-white rounded-xl hover:from-yellow-500 hover:to-pink-500 transition-all font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 touch-manipulation min-h-[44px]"
                  >
                    <Star className="h-4 w-4" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowExport(!showExport)
                      toast.success(showExport ? 'Export panel hidden' : 'Export panel shown', { duration: 1500 })
                    }}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 touch-manipulation min-h-[44px]"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                  <button
                    onClick={() => {
                      setShowHistory(!showHistory)
                      toast.success(showHistory ? 'History hidden' : 'History shown', { duration: 1500 })
                    }}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 touch-manipulation min-h-[44px]"
                  >
                    <History className="h-4 w-4" />
                    History
                  </button>
                  <button
                    onClick={() => {
                      setShowFavorites(!showFavorites)
                      toast.success(showFavorites ? 'Favorites hidden' : 'Favorites shown', { duration: 1500 })
                    }}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 touch-manipulation min-h-[44px]"
                  >
                    <Star className="h-4 w-4" />
                    Favorites
                  </button>
                </div>
              </div>
            </div>

            {/* RGB/HSL Sliders */}
            {activeTab === 'picker' && rgb && hsl && (
              <div className="mt-6 space-y-4 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* RGB Sliders */}
                  <div className="bg-gradient-to-br from-red-50/50 via-white to-white rounded-xl p-4 sm:p-5 border-2 border-red-100 shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-red-500 rounded-full blur-sm opacity-50"></div>
                        <div className="relative w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-sm"></div>
                      </div>
                      RGB Sliders
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-xs text-gray-700">Red</label>
                          <span className="text-xs font-mono text-gray-900">{rgb.r}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="255"
                          value={rgb.r}
                          onChange={(e) => updateColorFromRgb(Number(e.target.value), rgb.g, rgb.b)}
                          className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-xs text-gray-700">Green</label>
                          <span className="text-xs font-mono text-gray-900">{rgb.g}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="255"
                          value={rgb.g}
                          onChange={(e) => updateColorFromRgb(rgb.r, Number(e.target.value), rgb.b)}
                          className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-xs text-gray-700">Blue</label>
                          <span className="text-xs font-mono text-gray-900">{rgb.b}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="255"
                          value={rgb.b}
                          onChange={(e) => updateColorFromRgb(rgb.r, rgb.g, Number(e.target.value))}
                          className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* HSL Sliders */}
                  <div className="bg-gradient-to-br from-purple-50/50 via-white to-white rounded-xl p-4 sm:p-5 border-2 border-purple-100 shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-purple-500 rounded-full blur-sm opacity-50"></div>
                        <div className="relative w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 shadow-sm"></div>
                      </div>
                      HSL Sliders
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-xs text-gray-700">Hue</label>
                          <span className="text-xs font-mono text-gray-900">{hsl.h}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={hsl.h}
                          onChange={(e) => updateColorFromHsl(Number(e.target.value), hsl.s, hsl.l)}
                          className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-purple-500 to-red-500 rounded-lg appearance-none cursor-pointer"
                          style={{ background: `linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))` }}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-xs text-gray-700">Saturation</label>
                          <span className="text-xs font-mono text-gray-900">{hsl.s}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={hsl.s}
                          onChange={(e) => updateColorFromHsl(hsl.h, Number(e.target.value), hsl.l)}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-xs text-gray-700">Lightness</label>
                          <span className="text-xs font-mono text-gray-900">{hsl.l}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={hsl.l}
                          onChange={(e) => updateColorFromHsl(hsl.h, hsl.s, Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Color Formats */}
            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 sm:mb-5 flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-pink-500 rounded-full blur-sm opacity-40"></div>
                  <Sparkles className="relative h-5 w-5 text-pink-600" />
                </div>
                Color Formats
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {formats.map((format) => (
                  <div key={format.name} className="group border-2 border-gray-200 rounded-xl p-3 sm:p-4 bg-gradient-to-br from-white via-gray-50/50 to-white hover:from-pink-50 hover:via-rose-50/50 hover:to-pink-50 transition-all shadow-md hover:shadow-xl transform hover:scale-105">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs sm:text-sm font-bold text-gray-900">{format.name}</span>
                      <button
                        onClick={() => copyToClipboard(format.value, format.name)}
                        className="text-pink-600 hover:text-pink-700 transition-all transform hover:scale-125 active:scale-95 touch-manipulation p-1.5 rounded-lg hover:bg-pink-100"
                      >
                        {copied === format.name ? (
                          <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </button>
                    </div>
                    <div className="bg-white rounded-lg p-2.5 sm:p-3 min-h-[40px] sm:min-h-[50px] border-2 border-gray-100 shadow-inner">
                      <code className="text-xs sm:text-sm font-mono text-gray-900 break-all font-semibold">
                        {format.value || 'N/A'}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Palette Generator */}
          {activeTab === 'palette' && (
            <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl sm:rounded-2xl shadow-2xl border-2 border-purple-100 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
              <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                {[
                  { type: 'complementary', gradient: 'from-blue-500 to-cyan-500' },
                  { type: 'triadic', gradient: 'from-purple-500 to-pink-500' },
                  { type: 'analogous', gradient: 'from-green-500 to-emerald-500' },
                  { type: 'monochromatic', gradient: 'from-orange-500 to-red-500' },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => {
                      setPaletteType(item.type as any)
                      toast.success(`${item.type.charAt(0).toUpperCase() + item.type.slice(1)} palette selected`, { duration: 1500 })
                    }}
                    className={`px-3 sm:px-4 py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all transform ${
                      paletteType === item.type
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-105`
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 hover:scale-105'
                    }`}
                  >
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {palette.map((paletteColor, index) => (
                  <div
                    key={index}
                    className="group cursor-pointer"
                    onClick={() => {
                      setColor(paletteColor)
                      toast.success('Color selected!', { duration: 1000 })
                    }}
                  >
                    <div className="relative">
                      {/* Enhanced blur effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500 group-hover:blur-2xl"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div
                        className="relative w-full h-24 sm:h-32 rounded-xl shadow-xl border-4 border-white mb-2 transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:border-pink-200"
                        style={{ backgroundColor: paletteColor }}
                      >
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <code className="text-xs font-mono text-gray-900 block mb-1 font-semibold">{paletteColor}</code>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(paletteColor, 'HEX')
                        }}
                        className="text-pink-600 hover:text-pink-700 transition-all transform hover:scale-125 active:scale-95 touch-manipulation p-1 rounded-lg hover:bg-pink-50"
                      >
                        <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shades and Tints */}
          {activeTab === 'shades' && (
            <div className="bg-gradient-to-br from-white via-orange-50/30 to-red-50/30 rounded-xl sm:rounded-2xl shadow-2xl border-2 border-orange-100 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                <Layers className="h-5 w-5 text-orange-500" />
                Color Variations (Shades & Tints)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {shadesTints.map((variation, index) => (
                  <div
                    key={index}
                    className="group cursor-pointer"
                    onClick={() => {
                      setColor(variation.hex)
                      toast.success(`${variation.type} selected!`, { duration: 1000 })
                    }}
                  >
                    <div className="relative">
                      {/* Enhanced blur and glow effects */}
                      <div className={`absolute inset-0 rounded-lg blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500 group-hover:blur-2xl ${
                        variation.type === 'Tint' ? 'bg-gradient-to-r from-blue-200 to-cyan-200' : 
                        variation.type === 'Shade' ? 'bg-gradient-to-r from-gray-300 to-gray-400' : 
                        'bg-gradient-to-r from-pink-200 to-rose-200'
                      }`}></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div
                        className={`relative w-full h-20 sm:h-24 rounded-xl shadow-xl border-4 border-white mb-2 transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl ${
                          variation.type === 'Tint' ? 'group-hover:border-blue-200' : 
                          variation.type === 'Shade' ? 'group-hover:border-gray-300' : 
                          'group-hover:border-pink-200'
                        }`}
                        style={{ backgroundColor: variation.hex }}
                      >
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xs font-bold mb-1 px-2 py-0.5 rounded-full inline-block ${
                        variation.type === 'Tint' ? 'text-blue-700 bg-blue-100' : 
                        variation.type === 'Shade' ? 'text-gray-700 bg-gray-100' : 
                        'text-pink-700 bg-pink-100'
                      }`}>
                        {variation.type}
                      </div>
                      <code className="text-xs font-mono text-gray-900 block font-semibold mt-1">{variation.hex}</code>
                      <div className="text-xs text-gray-500 mt-1 font-medium">L: {variation.lightness}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contrast Checker */}
          {activeTab === 'contrast' && rgb && (
            <div className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 rounded-xl sm:rounded-2xl shadow-2xl border-2 border-green-100 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                <Contrast className="h-5 w-5 text-green-500" />
                WCAG Contrast Checker
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* White Background */}
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 bg-white transform hover:scale-105">
                  <div className="relative">
                    <div
                      className="h-32 sm:h-40 flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-bold transition-all relative z-10"
                      style={{ backgroundColor: '#FFFFFF', color: color }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                      <span className="relative z-10">Sample Text</span>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 via-white to-gray-50">
                    <div className="text-xs sm:text-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-semibold">Contrast Ratio:</span>
                        <span className="font-mono font-bold text-lg sm:text-xl text-gray-900 bg-gray-100 px-2 py-1 rounded">{contrastWhite.toFixed(2)}:1</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-semibold">WCAG Level:</span>
                        <span className={`font-bold text-sm sm:text-base px-3 py-1.5 rounded-full shadow-sm ${
                          getWCAGLevel(contrastWhite).pass 
                            ? 'text-green-800 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300' 
                            : 'text-red-800 bg-gradient-to-r from-red-100 to-rose-100 border-2 border-red-300'
                        }`}>
                          {getWCAGLevel(contrastWhite).pass ? '✓ ' : '✗ '}
                          {getWCAGLevel(contrastWhite).level}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Black Background */}
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 bg-white transform hover:scale-105">
                  <div className="relative">
                    <div
                      className="h-32 sm:h-40 flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-bold transition-all relative z-10"
                      style={{ backgroundColor: '#000000', color: color }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                      <span className="relative z-10">Sample Text</span>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 via-white to-gray-50">
                    <div className="text-xs sm:text-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-semibold">Contrast Ratio:</span>
                        <span className="font-mono font-bold text-lg sm:text-xl text-gray-900 bg-gray-100 px-2 py-1 rounded">{contrastBlack.toFixed(2)}:1</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-semibold">WCAG Level:</span>
                        <span className={`font-bold text-sm sm:text-base px-3 py-1.5 rounded-full shadow-sm ${
                          getWCAGLevel(contrastBlack).pass 
                            ? 'text-green-800 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300' 
                            : 'text-red-800 bg-gradient-to-r from-red-100 to-rose-100 border-2 border-red-300'
                        }`}>
                          {getWCAGLevel(contrastBlack).pass ? '✓ ' : '✗ '}
                          {getWCAGLevel(contrastBlack).level}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Options */}
          {showExport && rgb && hsl && (
            <div className="bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/30 rounded-xl sm:rounded-2xl shadow-2xl border-2 border-blue-100 p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                  <Download className="h-5 w-5 text-blue-500" />
                  Export Options
                </h3>
                <button
                  onClick={() => setShowExport(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => exportColor('css')}
                  className="relative px-4 py-3 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 transition-all font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 touch-manipulation min-h-[48px] overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <FileText className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">CSS Variables</span>
                </button>
                <button
                  onClick={() => exportColor('scss')}
                  className="relative px-4 py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white rounded-xl hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 transition-all font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 touch-manipulation min-h-[48px] overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Code className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">SCSS Variables</span>
                </button>
                <button
                  onClick={() => exportColor('json')}
                  className="relative px-4 py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:via-emerald-600 hover:to-green-700 transition-all font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 touch-manipulation min-h-[48px] overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <FileJson className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">JSON</span>
                </button>
              </div>
            </div>
          )}

          {/* Color History */}
          {showHistory && (
            <div className="bg-gradient-to-br from-white via-gray-50/50 to-gray-100/50 rounded-xl sm:rounded-2xl shadow-2xl border-2 border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                  <History className="h-5 w-5 text-gray-500" />
                  Recent Colors
                </h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {colorHistory.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full blur-xl opacity-50"></div>
                    <History className="relative h-12 w-12 sm:h-16 sm:w-16 text-gray-300" />
                  </div>
                  <p className="text-sm sm:text-base text-gray-500 font-medium">No color history yet</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">Start picking colors to see them here!</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-10 gap-2 sm:gap-3">
                  {colorHistory.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setColor(item.hex)
                        toast.success('Color loaded from history!', { duration: 1000 })
                      }}
                      className="cursor-pointer group"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                        <div
                          className="relative w-full h-12 sm:h-16 rounded-lg shadow-md border-2 border-white mb-1 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                          style={{ backgroundColor: item.hex }}
                        />
                      </div>
                      <code className="text-xs font-mono text-gray-900 block text-center truncate">{item.hex}</code>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Favorites */}
          {showFavorites && (
            <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl sm:rounded-2xl shadow-2xl border-2 border-purple-100 p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  Favorite Colors
                </h3>
                <button
                  onClick={() => setShowFavorites(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {favorites.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 to-pink-100 rounded-full blur-xl opacity-50"></div>
                    <Star className="relative h-12 w-12 sm:h-16 sm:w-16 text-gray-300" />
                  </div>
                  <p className="text-sm sm:text-base text-gray-500 font-medium">No favorites yet</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">Save colors to see them here!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {favorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="border-2 border-gray-200 rounded-xl p-3 sm:p-4 bg-gradient-to-br from-white to-gray-50 hover:from-purple-50 hover:to-pink-50 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                        <div
                          className="relative w-full h-20 sm:h-24 rounded-lg shadow-lg border-2 border-white mb-2 cursor-pointer transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl"
                          style={{ backgroundColor: fav.hex }}
                          onClick={() => {
                            setColor(fav.hex)
                            toast.success(`Loaded ${fav.name}!`, { duration: 1000 })
                          }}
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-xs sm:text-sm font-bold text-gray-900 mb-1">{fav.name}</div>
                        <code className="text-xs font-mono text-gray-700 block mb-2">{fav.hex}</code>
                        <button
                          onClick={() => deleteFavorite(fav.id)}
                          className="text-red-600 hover:text-red-700 text-xs font-medium transition-colors flex items-center justify-center gap-1 mx-auto"
                        >
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <MobileBottomAd adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      <Footer />
    </div>
  )
}
