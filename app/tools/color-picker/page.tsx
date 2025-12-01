'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Palette, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ColorPicker() {
  const [color, setColor] = useState('#3b82f6')
  const [copied, setCopied] = useState<string | null>(null)

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

  const rgb = hexToRgb(color)
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null

  const formats = [
    { name: 'HEX', value: color },
    { name: 'RGB', value: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '' },
    { name: 'RGBA', value: rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` : '' },
    { name: 'HSL', value: hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : '' },
  ]

  const copyToClipboard = (value: string, format: string) => {
    navigator.clipboard.writeText(value)
    setCopied(format)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 mb-3 sm:mb-4">
              <Palette className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Color Picker</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Pick colors and get values in multiple formats</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div className="flex flex-col items-center space-y-6">
              <div
                className="w-full h-64 rounded-lg shadow-lg border-4 border-white"
                style={{ backgroundColor: color }}
              ></div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-900 mb-2">Select Color</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-20 h-20 rounded-lg cursor-pointer border-2 border-gray-300"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {formats.map((format) => (
                <div key={format.name} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-900">{format.name}</span>
                    {format.value && (
                      <button
                        onClick={() => copyToClipboard(format.value, format.name)}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {copied === format.name ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded p-2 min-h-[50px]">
                    <code className="text-xs font-mono text-gray-900 break-all">
                      {format.value || 'N/A'}
                    </code>
                  </div>
                </div>
              ))}
            </div>

            {rgb && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Color Values</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-900">Red:</span>
                    <span className="ml-2 font-semibold text-gray-900">{rgb.r}</span>
                  </div>
                  <div>
                    <span className="text-gray-900">Green:</span>
                    <span className="ml-2 font-semibold text-gray-900">{rgb.g}</span>
                  </div>
                  <div>
                    <span className="text-gray-900">Blue:</span>
                    <span className="ml-2 font-semibold text-gray-900">{rgb.b}</span>
                  </div>
                </div>
                {hsl && (
                  <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                    <div>
                      <span className="text-gray-900">Hue:</span>
                      <span className="ml-2 font-semibold text-gray-900">{hsl.h}°</span>
                    </div>
                    <div>
                      <span className="text-gray-900">Saturation:</span>
                      <span className="ml-2 font-semibold text-gray-900">{hsl.s}%</span>
                    </div>
                    <div>
                      <span className="text-gray-900">Lightness:</span>
                      <span className="ml-2 font-semibold text-gray-900">{hsl.l}%</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

