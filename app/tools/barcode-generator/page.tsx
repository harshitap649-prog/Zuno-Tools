'use client'

import { useState, useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'
import Footer from '@/components/Footer'
import SidebarAd from '@/components/SidebarAd'
import MobileBottomAd from '@/components/MobileBottomAd'
import { 
  Hash, Download, Copy, Check, RefreshCw, Share2, 
  Settings, Info, FileImage, FileText, FileDown,
  Palette, Type, Maximize2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

interface BarcodeFormat {
  value: string
  label: string
  description: string
  minLength?: number
  maxLength?: number
  pattern?: RegExp
}

export default function BarcodeGenerator() {
  const [text, setText] = useState('123456789012')
  const [format, setFormat] = useState('CODE128')
  const [width, setWidth] = useState(2)
  const [height, setHeight] = useState(100)
  const [displayValue, setDisplayValue] = useState(true)
  const [fontSize, setFontSize] = useState(20)
  const [margin, setMargin] = useState(10)
  const [background, setBackground] = useState('#FFFFFF')
  const [foreground, setForeground] = useState('#000000')
  const [textMargin, setTextMargin] = useState(2)
  const [copied, setCopied] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { triggerPopunder } = usePopunderAd()

  const formats: BarcodeFormat[] = [
    { 
      value: 'CODE128', 
      label: 'CODE128', 
      description: 'Most versatile, supports alphanumeric',
      minLength: 1,
      maxLength: 255
    },
    { 
      value: 'CODE39', 
      label: 'CODE39', 
      description: 'Alphanumeric, uppercase letters and numbers',
      pattern: /^[A-Z0-9\s\-\.\$\/\+\%]+$/
    },
    { 
      value: 'EAN13', 
      label: 'EAN-13', 
      description: '13 digits (product barcodes)',
      minLength: 12,
      maxLength: 13,
      pattern: /^\d{12,13}$/
    },
    { 
      value: 'EAN8', 
      label: 'EAN-8', 
      description: '8 digits (small products)',
      minLength: 7,
      maxLength: 8,
      pattern: /^\d{7,8}$/
    },
    { 
      value: 'UPC', 
      label: 'UPC-A', 
      description: '12 digits (US product codes)',
      minLength: 11,
      maxLength: 12,
      pattern: /^\d{11,12}$/
    },
    { 
      value: 'ITF14', 
      label: 'ITF-14', 
      description: '14 digits (shipping containers)',
      minLength: 13,
      maxLength: 14,
      pattern: /^\d{13,14}$/
    },
    { 
      value: 'MSI', 
      label: 'MSI', 
      description: 'Numeric only',
      pattern: /^\d+$/
    },
    { 
      value: 'pharmacode', 
      label: 'Pharmacode', 
      description: 'Pharmaceutical packaging',
      pattern: /^\d+$/
    },
    { 
      value: 'codabar', 
      label: 'Codabar', 
      description: 'Library and blood bank systems',
      pattern: /^[0-9A-D\-\$:\.\/\+]+$/
    },
  ]

  const presets = [
    { name: 'Product Code', text: '123456789012', format: 'EAN13' },
    { name: 'ISBN', text: '9780123456789', format: 'EAN13' },
    { name: 'UPC Code', text: '012345678905', format: 'UPC' },
    { name: 'Custom Text', text: 'HELLO123', format: 'CODE128' },
  ]

  const validateInput = (value: string, format: BarcodeFormat): boolean => {
    if (!value.trim()) return false
    
    if (format.minLength && value.length < format.minLength) return false
    if (format.maxLength && value.length > format.maxLength) return false
    if (format.pattern && !format.pattern.test(value)) return false
    
    return true
  }

  const currentFormat = formats.find(f => f.value === format) || formats[0]

  useEffect(() => {
    if (text.trim() && canvasRef.current) {
      try {
        if (!validateInput(text, currentFormat)) {
          return
        }

        JsBarcode(canvasRef.current, text, {
          format: format,
          width: width,
          height: height,
          displayValue: displayValue,
          fontSize: fontSize,
          margin: margin,
          background: background,
          lineColor: foreground,
          textMargin: textMargin,
          valid: () => {
            // Barcode generated successfully
          },
        })
      } catch (error) {
        console.error('Barcode generation error:', error)
        toast.error('Failed to generate barcode. Check format requirements.')
      }
    }
  }, [text, format, width, height, displayValue, fontSize, margin, background, foreground, textMargin, currentFormat])

  const downloadBarcode = (fileType: 'png' | 'svg' = 'png') => {
    if (!canvasRef.current) {
      toast.error('No barcode to download')
      return
    }
    
    try {
      if (fileType === 'png') {
        const link = document.createElement('a')
        link.download = `barcode-${text}-${format}.png`
        link.href = canvasRef.current.toDataURL('image/png')
        link.click()
        toast.success('Barcode downloaded as PNG!', { icon: '📥', duration: 3000 })
      } else if (fileType === 'svg') {
        // For SVG, we need to create a new canvas or use a different approach
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        const img = document.createElement('img')
        img.src = canvasRef.current.toDataURL('image/png')
        
        // Create SVG wrapper
        svg.setAttribute('width', canvasRef.current.width.toString())
        svg.setAttribute('height', canvasRef.current.height.toString())
        svg.innerHTML = `<image href="${canvasRef.current.toDataURL('image/png')}" width="100%" height="100%"/>`
        
        const svgBlob = new Blob([svg.outerHTML], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(svgBlob)
        const link = document.createElement('a')
        link.download = `barcode-${text}-${format}.svg`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
        toast.success('Barcode downloaded as SVG!', { icon: '📥', duration: 3000 })
      }
      
      // Trigger popunder ad after 2 seconds
      setTimeout(() => {
        triggerPopunder()
      }, 2000)
    } catch (error) {
      toast.error('Failed to download barcode')
    }
  }

  const copyToClipboard = async () => {
    if (!canvasRef.current) {
      toast.error('No barcode to copy')
      return
    }
    
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ])
          setCopied(true)
          toast.success('Barcode copied to clipboard!', { icon: '📋', duration: 3000 })
          setTimeout(() => setCopied(false), 2000)
        }
      })
    } catch (error) {
      toast.error('Failed to copy barcode')
    }
  }

  const shareBarcode = async () => {
    if (!canvasRef.current) {
      toast.error('No barcode to share')
      return
    }
    
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (blob && navigator.share) {
          const file = new File([blob], `barcode-${text}.png`, { type: 'image/png' })
          await navigator.share({
            title: 'Barcode',
            text: `Barcode: ${text}`,
            files: [file]
          })
          toast.success('Barcode shared!', { duration: 2000 })
        } else {
          copyToClipboard()
        }
      })
    } catch (error) {
      toast.error('Sharing not supported or failed')
    }
  }

  const resetSettings = () => {
    setWidth(2)
    setHeight(100)
    setFontSize(20)
    setMargin(10)
    setBackground('#FFFFFF')
    setForeground('#000000')
    setTextMargin(2)
    toast.success('Settings reset!', { duration: 2000 })
  }

  const applyPreset = (preset: typeof presets[0]) => {
    setText(preset.text)
    setFormat(preset.format)
    toast.success(`Applied preset: ${preset.name}`, { duration: 2000 })
  }

  const isValid = validateInput(text, currentFormat)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SidebarAd position="left" adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      <SidebarAd position="right" adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      
      <main className="flex-grow py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="relative inline-flex items-center justify-center mb-3 sm:mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
              <div className="relative inline-flex p-2 sm:p-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 shadow-lg">
                <Hash className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">
              Barcode Generator
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-4">Generate barcodes in multiple formats</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Panel - Controls */}
            <div className="space-y-4 sm:space-y-6">
              {/* Main Settings Card */}
              <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl sm:rounded-2xl shadow-xl border-2 border-purple-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  Settings
                </h2>

                {/* Presets */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Quick Presets</label>
                  <div className="grid grid-cols-2 gap-2">
                    {presets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => applyPreset(preset)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all text-xs sm:text-sm"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Barcode Data */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Barcode Data
                    {!isValid && text.trim() && (
                      <span className="ml-2 text-xs text-red-600">⚠ Invalid format</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter barcode data..."
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium ${
                      !isValid && text.trim() ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {currentFormat.description && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      {currentFormat.description}
                    </p>
                  )}
                </div>

                {/* Format */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                  >
                    {formats.map((fmt) => (
                      <option key={fmt.value} value={fmt.value}>
                        {fmt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Basic Controls */}
                <div className="space-y-4 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Width: {width}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.5"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Height: {height}px
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="300"
                      step="10"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="displayValue"
                      checked={displayValue}
                      onChange={(e) => setDisplayValue(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="displayValue" className="text-sm font-medium text-gray-900">
                      Display value below barcode
                    </label>
                  </div>
                </div>

                {/* Advanced Settings Toggle */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-sm mb-4"
                >
                  <Settings className="h-4 w-4" />
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
                </button>

                {/* Advanced Settings */}
                {showAdvanced && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Type className="h-4 w-4 text-purple-600" />
                        Font Size: {fontSize}px
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="40"
                        step="2"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Margin: {margin}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="5"
                        value={margin}
                        onChange={(e) => setMargin(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Palette className="h-4 w-4 text-purple-600" />
                        Background Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={background}
                          onChange={(e) => setBackground(e.target.value)}
                          className="w-16 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={background}
                          onChange={(e) => setBackground(e.target.value)}
                          className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-medium text-sm"
                          placeholder="#FFFFFF"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Palette className="h-4 w-4 text-purple-600" />
                        Foreground Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={foreground}
                          onChange={(e) => setForeground(e.target.value)}
                          className="w-16 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={foreground}
                          onChange={(e) => setForeground(e.target.value)}
                          className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-medium text-sm"
                          placeholder="#000000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Text Margin: {textMargin}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={textMargin}
                        onChange={(e) => setTextMargin(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>

                    <button
                      onClick={resetSettings}
                      className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reset Settings
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl sm:rounded-2xl shadow-xl border-2 border-purple-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Maximize2 className="h-5 w-5 text-purple-600" />
                  Preview
                </h2>
                <div className="flex gap-2">
                  {isValid && text.trim() && (
                    <>
                      <button
                        onClick={copyToClipboard}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={shareBarcode}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                        title="Share barcode"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div 
                className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 md:p-8 bg-gray-50 min-h-[200px] sm:min-h-[300px]"
                style={{ backgroundColor: background }}
              >
                {isValid && text.trim() ? (
                  <div className="flex flex-col items-center">
                    <canvas 
                      ref={canvasRef} 
                      className="max-w-full h-auto"
                      style={{ maxHeight: '400px' }}
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <Hash className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-2 opacity-50" />
                    <p className="text-sm sm:text-base">Enter valid data to generate barcode</p>
                    {!isValid && text.trim() && (
                      <p className="text-xs text-red-500 mt-2">
                        {currentFormat.pattern 
                          ? `Must match pattern: ${currentFormat.pattern.toString()}`
                          : currentFormat.minLength 
                            ? `Length: ${currentFormat.minLength}-${currentFormat.maxLength || 'unlimited'}`
                            : 'Invalid format'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isValid && text.trim() && (
                <div className="mt-4 sm:mt-6 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => downloadBarcode('png')}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95 touch-manipulation min-h-[48px]"
                    >
                      <FileImage className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Download PNG</span>
                    </button>
                    <button
                      onClick={() => downloadBarcode('svg')}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95 touch-manipulation min-h-[48px]"
                    >
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Download SVG</span>
                    </button>
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
