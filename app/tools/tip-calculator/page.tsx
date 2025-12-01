'use client'

import { useState } from 'react'
import Footer from '@/components/Footer'
import { Calculator, Sparkles } from 'lucide-react'

export default function TipCalculator() {
  const [billAmount, setBillAmount] = useState('')
  const [tipPercentage, setTipPercentage] = useState('15')
  const [numberOfPeople, setNumberOfPeople] = useState('1')
  const [result, setResult] = useState<{
    tipAmount: number
    totalAmount: number
    perPerson: number
  } | null>(null)

  const calculate = () => {
    const bill = parseFloat(billAmount)
    const tip = parseFloat(tipPercentage)
    const people = parseInt(numberOfPeople)

    if (isNaN(bill) || bill <= 0) {
      alert('Please enter a valid bill amount')
      return
    }

    if (isNaN(people) || people <= 0) {
      alert('Please enter a valid number of people')
      return
    }

    const tipAmount = (bill * tip) / 100
    const totalAmount = bill + tipAmount
    const perPerson = totalAmount / people

    setResult({
      tipAmount,
      totalAmount,
      perPerson,
    })
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
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 mb-3 sm:mb-4">
              <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Tip Calculator</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Calculate tips and split bills easily</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Bill Amount ($)</label>
                <input
                  type="number"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Tip Percentage (%)</label>
                <input
                  type="number"
                  value={tipPercentage}
                  onChange={(e) => setTipPercentage(e.target.value)}
                  placeholder="15"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
                <div className="flex gap-2 mt-2">
                  {[10, 15, 18, 20, 25].map((percent) => (
                    <button
                      key={percent}
                      onClick={() => setTipPercentage(percent.toString())}
                      className={`flex-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        tipPercentage === percent.toString()
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {percent}%
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Number of People</label>
                <input
                  type="number"
                  value={numberOfPeople}
                  onChange={(e) => setNumberOfPeople(e.target.value)}
                  placeholder="1"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            <button
              onClick={calculate}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95 touch-manipulation"
            >
              <Calculator className="h-5 w-5" />
              <span>Calculate</span>
            </button>

            {result && (
              <div className="mt-6 space-y-4">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Results</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Tip Amount:</span>
                      <span className="text-2xl font-bold text-orange-600">${result.tipAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Total Amount:</span>
                      <span className="text-2xl font-bold text-orange-600">${result.totalAmount.toFixed(2)}</span>
                    </div>
                    {parseInt(numberOfPeople) > 1 && (
                      <div className="flex justify-between items-center pt-3 border-t border-orange-200">
                        <span className="text-gray-700">Per Person:</span>
                        <span className="text-2xl font-bold text-orange-600">${result.perPerson.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
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

