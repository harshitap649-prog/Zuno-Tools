'use client'

import { useState } from 'react'
import Footer from '@/components/Footer'
import { Calculator, ArrowLeftRight } from 'lucide-react'

export default function UnitConverter() {
  const [category, setCategory] = useState<'length' | 'weight' | 'temperature' | 'volume'>('length')
  const [fromValue, setFromValue] = useState('1')
  const [fromUnit, setFromUnit] = useState('meter')
  const [toUnit, setToUnit] = useState('kilometer')

  const conversions: Record<string, Record<string, number>> = {
    length: {
      meter: 1,
      kilometer: 0.001,
      centimeter: 100,
      millimeter: 1000,
      inch: 39.3701,
      foot: 3.28084,
      yard: 1.09361,
      mile: 0.000621371,
    },
    weight: {
      kilogram: 1,
      gram: 1000,
      pound: 2.20462,
      ounce: 35.274,
      ton: 0.001,
      stone: 0.157473,
    },
    temperature: {
      celsius: 1,
      fahrenheit: 1,
      kelvin: 1,
    },
    volume: {
      liter: 1,
      milliliter: 1000,
      gallon: 0.264172,
      quart: 1.05669,
      pint: 2.11338,
      cup: 4.22675,
      fluidounce: 33.814,
    },
  }

  const convert = () => {
    const value = parseFloat(fromValue)
    if (isNaN(value)) return ''

    if (category === 'temperature') {
      const num = parseFloat(fromValue)
      if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
        return ((num * 9/5) + 32).toFixed(2)
      } else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
        return ((num - 32) * 5/9).toFixed(2)
      } else if (fromUnit === 'celsius' && toUnit === 'kelvin') {
        return (num + 273.15).toFixed(2)
      } else if (fromUnit === 'kelvin' && toUnit === 'celsius') {
        return (num - 273.15).toFixed(2)
      } else if (fromUnit === 'fahrenheit' && toUnit === 'kelvin') {
        return (((num - 32) * 5/9) + 273.15).toFixed(2)
      } else if (fromUnit === 'kelvin' && toUnit === 'fahrenheit') {
        return (((num - 273.15) * 9/5) + 32).toFixed(2)
      }
      return num.toFixed(2)
    }

    const fromFactor = conversions[category][fromUnit]
    const toFactor = conversions[category][toUnit]
    const baseValue = value / fromFactor
    const result = baseValue * toFactor
    return result.toFixed(6)
  }

  const swapUnits = () => {
    const temp = fromUnit
    setFromUnit(toUnit)
    setToUnit(temp)
  }

  const units = {
    length: ['meter', 'kilometer', 'centimeter', 'millimeter', 'inch', 'foot', 'yard', 'mile'],
    weight: ['kilogram', 'gram', 'pound', 'ounce', 'ton', 'stone'],
    temperature: ['celsius', 'fahrenheit', 'kelvin'],
    volume: ['liter', 'milliliter', 'gallon', 'quart', 'pint', 'cup', 'fluidounce'],
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 mb-3 sm:mb-4">
              <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Unit Converter</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Convert between different units of measurement</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['length', 'weight', 'temperature', 'volume'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat)
                      setFromUnit(units[cat][0])
                      setToUnit(units[cat][1] || units[cat][0])
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
                      category === cat
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">From</label>
                <input
                  type="number"
                  value={fromValue}
                  onChange={(e) => setFromValue(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Unit</label>
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent capitalize"
                >
                  {units[category].map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={swapUnits}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeftRight className="h-5 w-5 text-gray-900" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">To</label>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent capitalize"
                >
                  {units[category].map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Result</label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold text-lg">
                  {convert() || '0'}
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

