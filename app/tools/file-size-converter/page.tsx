'use client'

import { useState } from 'react'
import Footer from '@/components/Footer'
import { HardDrive, Sparkles } from 'lucide-react'

export default function FileSizeConverter() {
  const [value, setValue] = useState('')
  const [fromUnit, setFromUnit] = useState('bytes')
  const [toUnit, setToUnit] = useState('kb')
  const [result, setResult] = useState<number | null>(null)

  const units = [
    { value: 'bytes', label: 'Bytes', multiplier: 1 },
    { value: 'kb', label: 'KB', multiplier: 1024 },
    { value: 'mb', label: 'MB', multiplier: 1024 * 1024 },
    { value: 'gb', label: 'GB', multiplier: 1024 * 1024 * 1024 },
    { value: 'tb', label: 'TB', multiplier: 1024 * 1024 * 1024 * 1024 },
  ]

  const convert = () => {
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue < 0) {
      alert('Please enter a valid number')
      return
    }

    const fromMultiplier = units.find(u => u.value === fromUnit)?.multiplier || 1
    const toMultiplier = units.find(u => u.value === toUnit)?.multiplier || 1

    const bytes = numValue * fromMultiplier
    const converted = bytes / toMultiplier

    setResult(converted)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 mb-3 sm:mb-4">
              <HardDrive className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">File Size Converter</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Convert between different file size units</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Value</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">From</label>
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                >
                  {units.map(unit => (
                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">To</label>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                >
                  {units.map(unit => (
                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={convert}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95 touch-manipulation"
            >
              <HardDrive className="h-5 w-5" />
              <span>Convert</span>
            </button>

            {result !== null && (
              <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 text-center">
                <div className="text-sm text-gray-600 mb-2">Result</div>
                <div className="text-4xl font-bold text-indigo-600">
                  {result.toFixed(4)} {units.find(u => u.value === toUnit)?.label}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

