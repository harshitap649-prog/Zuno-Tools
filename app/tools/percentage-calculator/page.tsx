'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Calculator } from 'lucide-react'

export default function PercentageCalculator() {
  const [value, setValue] = useState('')
  const [percentage, setPercentage] = useState('')
  const [result, setResult] = useState<number | null>(null)

  const calculate = () => {
    const numValue = parseFloat(value)
    const numPercentage = parseFloat(percentage)

    if (isNaN(numValue) || isNaN(numPercentage)) {
      return
    }

    setResult((numValue * numPercentage) / 100)
  }

  const reset = () => {
    setValue('')
    setPercentage('')
    setResult(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 mb-4">
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Percentage Calculator</h1>
            <p className="text-gray-900">Calculate percentages easily</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Value
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onBlur={calculate}
                  placeholder="Enter value"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Percentage (%)
                </label>
                <input
                  type="number"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  onBlur={calculate}
                  placeholder="Enter percentage"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={calculate}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Calculate
            </button>

            {result !== null && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                <div className="text-center">
                  <p className="text-sm text-gray-900 mb-2">Result</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {result.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-900 mt-2">
                    {percentage}% of {value} = {result.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900 mb-1">What is X% of Y?</p>
                <p className="text-xs text-gray-900">Enter Y in Value, X in Percentage</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900 mb-1">X is what % of Y?</p>
                <p className="text-xs text-gray-900">Enter X in Value, Y in Percentage</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900 mb-1">What % increase/decrease?</p>
                <p className="text-xs text-gray-900">Calculate percentage change</p>
              </div>
            </div>

            <button
              onClick={reset}
              className="w-full text-gray-900 hover:text-gray-900 py-2"
            >
              Reset
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}


