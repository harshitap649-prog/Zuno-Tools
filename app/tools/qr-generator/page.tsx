'use client'

import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { QrCode as QrCodeIcon, Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function QRGenerator() {
  const [text, setText] = useState('')
  const [size, setSize] = useState(256)
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [fgColor, setFgColor] = useState('#000000')
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (text.trim() && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, text, {
        width: size,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorCorrectionLevel,
      }, (error) => {
        if (error) {
          toast.error('Failed to generate QR code')
        } else {
          setQrCodeUrl(canvasRef.current?.toDataURL() || '')
        }
      })
    }
  }, [text, size, bgColor, fgColor, errorCorrectionLevel])

  const downloadQR = () => {
    if (!text.trim()) {
      toast.error('Please enter text or URL to generate QR code')
      return
    }

    if (!qrCodeUrl) return

    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = qrCodeUrl
    link.click()
    toast.success('QR code downloaded!')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-gray-700 to-gray-900 mb-3 sm:mb-4">
              <QrCodeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">QR Code Generator</h1>
            <p className="text-sm sm:text-base text-gray-600 px-4">Generate QR codes for URLs, text, and more</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text or URL
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text, URL, email, phone number, etc..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size: {size}px
                </label>
                <input
                  type="range"
                  min="128"
                  max="512"
                  step="32"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foreground Color
                  </label>
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Error Correction Level
                </label>
                <select
                  value={errorCorrectionLevel}
                  onChange={(e) => setErrorCorrectionLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="L">Low (~7%)</option>
                  <option value="M">Medium (~15%)</option>
                  <option value="Q">Quartile (~25%)</option>
                  <option value="H">High (~30%)</option>
                </select>
              </div>

              <button
                onClick={downloadQR}
                disabled={!text.trim()}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Download className="h-5 w-5" />
                <span>Download QR Code</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
              <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 md:p-8 bg-gray-50 min-h-[250px] sm:min-h-[300px] md:min-h-[400px]">
                {text.trim() ? (
                  <canvas ref={canvasRef} className="max-w-full h-auto" />
                ) : (
                  <div className="text-center text-gray-400">
                    <QrCodeIcon className="h-16 w-16 mx-auto mb-2" />
                    <p>Enter text to generate QR code</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

