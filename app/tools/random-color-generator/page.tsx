'use client'

import { useState } from 'react'
import Footer from '@/components/Footer'
import { Palette, Sparkles, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RandomColorGenerator() {
  const [colors, setColors] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  const generateColor = () => {
    const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    return hex.toUpperCase()
  }

  const generateColors = (count: number = 1) => {
    const newColors: string[] = []
    for (let i = 0; i < count; i++) {
      newColors.push(generateColor())
    }
    setColors(newColors)
  }

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color)
    setCopied(true)
    toast.success('Color copied!')
    setTimeout(() => setCopied(false), 2000)
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
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-6">
            <div className="flex flex-col items-center justify-center mb-4 sm:mb-6">
              <div className="relative inline-flex items-center justify-center mb-3 sm:mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-pink-500 to-rose-500 p-2 sm:p-3 rounded-xl shadow-lg">
                  <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                  Zuno Tools
                </span>
              </h1>
              <div className="mt-2 h-0.5 w-20 sm:w-24 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mx-auto"></div>
            </div>
          </div>
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 mb-3 sm:mb-4">
              <Palette className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Random Color Generator</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Generate random colors with hex codes</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => generateColors(1)}
                className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all active:scale-95 touch-manipulation"
              >
                Generate 1 Color
              </button>
              <button
                onClick={() => generateColors(5)}
                className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all active:scale-95 touch-manipulation"
              >
                Generate 5 Colors
              </button>
              <button
                onClick={() => generateColors(10)}
                className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all active:scale-95 touch-manipulation"
              >
                Generate 10 Colors
              </button>
            </div>

            {colors.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {colors.map((color, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
                    onClick={() => copyToClipboard(color)}
                  >
                    <div
                      className="h-32 sm:h-40 flex items-center justify-center"
                      style={{ backgroundColor: color }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        {copied ? (
                          <Check className="h-6 w-6 text-white" />
                        ) : (
                          <Copy className="h-6 w-6 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="p-3 bg-white">
                      <div
                        className="text-sm font-mono font-semibold text-center"
                        style={{ color: getContrastColor(color) === '#FFFFFF' ? color : '#000000' }}
                      >
                        {color}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

