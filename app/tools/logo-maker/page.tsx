'use client'

import { useState, useRef, useEffect } from 'react'
import Footer from '@/components/Footer'
import { Image, Sparkles, Download, RefreshCw, Type, Palette } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

export default function LogoMaker() {
  const [logoText, setLogoText] = useState('LOGO')
  const [fontSize, setFontSize] = useState(48)
  const [textColor, setTextColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [shape, setShape] = useState('circle')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { triggerPopunder } = usePopunderAd()

  const downloadLogo = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `${logoText.toLowerCase()}-logo.png`
    link.href = canvas.toDataURL()
    link.click()
    
    // Trigger popunder ad after 2 seconds
    triggerPopunder()
    
    toast.success('Logo downloaded!')
  }

  const drawLogo = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 400
    canvas.height = 400

    // Draw background shape
    ctx.fillStyle = bgColor
    ctx.beginPath()
    if (shape === 'circle') {
      ctx.arc(200, 200, 180, 0, Math.PI * 2)
    } else if (shape === 'square') {
      ctx.rect(20, 20, 360, 360)
    } else if (shape === 'rounded') {
      const x = 20
      const y = 20
      const w = 360
      const h = 360
      const r = 40
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + r)
      ctx.lineTo(x + w, y + h - r)
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      ctx.lineTo(x + r, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
    }
    ctx.fill()

    // Draw text
    ctx.fillStyle = textColor
    ctx.font = `bold ${fontSize}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(logoText, 200, 200)
  }

  useEffect(() => {
    drawLogo()
  }, [logoText, fontSize, textColor, bgColor, shape])

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
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 mb-3 sm:mb-4">
              <Image className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">Logo Maker</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Create simple logos with text and shapes</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Logo Text</label>
                  <input
                    type="text"
                    value={logoText}
                    onChange={(e) => {
                      setLogoText(e.target.value)
                      setTimeout(drawLogo, 100)
                    }}
                    maxLength={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Font Size: {fontSize}px</label>
                  <input
                    type="range"
                    min="24"
                    max="72"
                    value={fontSize}
                    onChange={(e) => {
                      setFontSize(Number(e.target.value))
                      setTimeout(drawLogo, 100)
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Text Color</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => {
                      setTextColor(e.target.value)
                      setTimeout(drawLogo, 100)
                    }}
                    className="w-full h-12 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Background Color</label>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => {
                      setBgColor(e.target.value)
                      setTimeout(drawLogo, 100)
                    }}
                    className="w-full h-12 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Shape</label>
                  <select
                    value={shape}
                    onChange={(e) => {
                      setShape(e.target.value)
                      setTimeout(drawLogo, 100)
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                  >
                    <option value="circle">Circle</option>
                    <option value="square">Square</option>
                    <option value="rounded">Rounded Square</option>
                  </select>
                </div>
                <button
                  onClick={downloadLogo}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Download className="h-5 w-5" />
                  <span>Download Logo</span>
                </button>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-gray-100 rounded-lg p-4">
                  <canvas
                    ref={canvasRef}
                    className="border-2 border-gray-300 rounded-lg"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

