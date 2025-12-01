'use client'

import { useState, useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'
import Footer from '@/components/Footer'
import { Hash, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

export default function BarcodeGenerator() {
  const [text, setText] = useState('123456789012')
  const [format, setFormat] = useState('CODE128')
  const [width, setWidth] = useState(2)
  const [height, setHeight] = useState(100)
  const [displayValue, setDisplayValue] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { triggerPopunder } = usePopunderAd()

  useEffect(() => {
    if (text.trim() && canvasRef.current) {
      try {
        JsBarcode(canvasRef.current, text, {
          format: format,
          width: width,
          height: height,
          displayValue: displayValue,
        })
      } catch (error) {
        toast.error('Failed to generate barcode')
      }
    }
  }, [text, format, width, height, displayValue])

  const downloadBarcode = () => {
    if (!canvasRef.current) return
    
    const link = document.createElement('a')
    link.download = `barcode-${text}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
    
    // Trigger popunder ad after 2 seconds
    triggerPopunder()
    
    toast.success('Barcode downloaded!')
  }

  const formats = [
    'CODE128',
    'CODE39',
    'EAN13',
    'EAN8',
    'UPC',
    'ITF14',
    'MSI',
    'pharmacode',
    'codabar',
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-gray-700 to-gray-900 mb-3 sm:mb-4">
              <Hash className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Barcode Generator</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Generate barcodes in multiple formats</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Barcode Data</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter barcode data..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {formats.map((fmt) => (
                    <option key={fmt} value={fmt}>{fmt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Width: {width}</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Height: {height}px</label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="10"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="displayValue"
                  checked={displayValue}
                  onChange={(e) => setDisplayValue(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="displayValue" className="text-sm font-medium text-gray-900">
                  Display value below barcode
                </label>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
              <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 md:p-8 bg-gray-50 min-h-[200px]">
                {text.trim() ? (
                  <canvas ref={canvasRef} className="max-w-full h-auto" />
                ) : (
                  <div className="text-center text-gray-400">
                    <Hash className="h-16 w-16 mx-auto mb-2" />
                    <p>Enter data to generate barcode</p>
                  </div>
                )}
              </div>
              {text.trim() && (
                <button
                  onClick={downloadBarcode}
                  className="w-full mt-4 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95 touch-manipulation"
                >
                  <Download className="h-5 w-5" />
                  <span>Download Barcode</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

