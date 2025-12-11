'use client'

import { useState, useEffect } from 'react'
import Footer from '@/components/Footer'
import MobileBottomAd from '@/components/MobileBottomAd'
import { 
  Calculator, Copy, Share2, History, Star, Download, 
  TrendingUp, TrendingDown, DollarSign, Users, Percent,
  X, Check, RotateCcw
} from 'lucide-react'
import toast from 'react-hot-toast'

interface CalculationHistory {
  id: string
  billAmount: number
  tipPercentage: number
  taxPercentage: number
  numberOfPeople: number
  tipAmount: number
  taxAmount: number
  totalAmount: number
  perPerson: number
  timestamp: number
}

export default function TipCalculator() {
  const [billAmount, setBillAmount] = useState('')
  const [tipPercentage, setTipPercentage] = useState('15')
  const [taxPercentage, setTaxPercentage] = useState('0')
  const [numberOfPeople, setNumberOfPeople] = useState('1')
  const [roundOption, setRoundOption] = useState<'none' | 'up' | 'down'>('none')
  const [currency, setCurrency] = useState('$')
  const [result, setResult] = useState<{
    tipAmount: number
    taxAmount: number
    totalAmount: number
    perPerson: number
    billAmount: number
  } | null>(null)
  const [history, setHistory] = useState<CalculationHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [favoriteTip, setFavoriteTip] = useState<string | null>(null)

  // Load history and favorite from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('tip-calculator-history')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Failed to load history')
      }
    }
    const savedFavorite = localStorage.getItem('tip-calculator-favorite')
    if (savedFavorite) {
      setFavoriteTip(savedFavorite)
      setTipPercentage(savedFavorite)
    }
  }, [])

  const calculate = () => {
    const bill = parseFloat(billAmount)
    const tip = parseFloat(tipPercentage)
    const tax = parseFloat(taxPercentage)
    const people = parseInt(numberOfPeople)

    if (isNaN(bill) || bill <= 0) {
      toast.error('Please enter a valid bill amount')
      return
    }

    if (isNaN(people) || people <= 0) {
      toast.error('Please enter a valid number of people')
      return
    }

    let tipAmount = (bill * tip) / 100
    let taxAmount = (bill * tax) / 100
    let totalAmount = bill + tipAmount + taxAmount
    let perPerson = totalAmount / people

    // Apply rounding
    if (roundOption === 'up') {
      perPerson = Math.ceil(perPerson)
      totalAmount = perPerson * people
    } else if (roundOption === 'down') {
      perPerson = Math.floor(perPerson)
      totalAmount = perPerson * people
    }

    const calculationResult = {
      tipAmount,
      taxAmount,
      totalAmount,
      perPerson,
      billAmount: bill
    }

    setResult(calculationResult)

    // Save to history
    const historyEntry: CalculationHistory = {
      id: Date.now().toString(),
      billAmount: bill,
      tipPercentage: tip,
      taxPercentage: tax,
      numberOfPeople: people,
      tipAmount,
      taxAmount,
      totalAmount,
      perPerson,
      timestamp: Date.now()
    }

    const newHistory = [historyEntry, ...history].slice(0, 20)
    setHistory(newHistory)
    localStorage.setItem('tip-calculator-history', JSON.stringify(newHistory))

    toast.success('Calculation completed!')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const shareResults = () => {
    if (!result) return

    const shareText = `Tip Calculator Results:
Bill: ${currency}${result.billAmount.toFixed(2)}
Tip (${tipPercentage}%): ${currency}${result.tipAmount.toFixed(2)}
${taxPercentage !== '0' ? `Tax (${taxPercentage}%): ${currency}${result.taxAmount.toFixed(2)}\n` : ''}Total: ${currency}${result.totalAmount.toFixed(2)}
${parseInt(numberOfPeople) > 1 ? `Per Person: ${currency}${result.perPerson.toFixed(2)}` : ''}`

    if (navigator.share) {
      navigator.share({
        title: 'Tip Calculation',
        text: shareText
      }).catch(() => {
        copyToClipboard(shareText)
      })
    } else {
      copyToClipboard(shareText)
    }
  }

  const saveFavoriteTip = () => {
    setFavoriteTip(tipPercentage)
    localStorage.setItem('tip-calculator-favorite', tipPercentage)
    toast.success('Favorite tip percentage saved!')
  }

  const loadFromHistory = (entry: CalculationHistory) => {
    setBillAmount(entry.billAmount.toString())
    setTipPercentage(entry.tipPercentage.toString())
    setTaxPercentage(entry.taxPercentage.toString())
    setNumberOfPeople(entry.numberOfPeople.toString())
    setResult({
      tipAmount: entry.tipAmount,
      taxAmount: entry.taxAmount,
      totalAmount: entry.totalAmount,
      perPerson: entry.perPerson,
      billAmount: entry.billAmount
    })
    toast.success('Loaded from history!')
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('tip-calculator-history')
    toast.success('History cleared!')
  }

  const reset = () => {
    setBillAmount('')
    setTipPercentage('15')
    setTaxPercentage('0')
    setNumberOfPeople('1')
    setRoundOption('none')
    setResult(null)
    toast.success('Reset!')
  }

  const servicePresets = [
    { label: 'Poor', tip: 10, color: 'from-red-500 to-red-600' },
    { label: 'Fair', tip: 15, color: 'from-yellow-500 to-yellow-600' },
    { label: 'Good', tip: 18, color: 'from-blue-500 to-blue-600' },
    { label: 'Great', tip: 20, color: 'from-green-500 to-green-600' },
    { label: 'Excellent', tip: 25, color: 'from-purple-500 to-purple-600' },
  ]

  const tipPresets = [0, 10, 12, 15, 18, 20, 22, 25, 30]

  const formatCurrency = (amount: number) => {
    return `${currency}${amount.toFixed(2)}`
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-4 sm:mb-6">
            <div className="relative inline-flex items-center justify-center mb-3 sm:mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
              <div className="relative inline-flex p-2 sm:p-3 rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 shadow-lg">
                <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">
              Tip Calculator
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 px-4">Calculate tips, tax, and split bills easily</p>
          </div>

          <div className="bg-gradient-to-br from-white via-orange-50/20 to-red-50/20 rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            {/* Currency Selector */}
            <div className="flex items-center gap-2 mb-4">
              <label className="text-sm font-semibold text-gray-900">Currency:</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-1.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-sm"
              >
                <option value="$">$ USD</option>
                <option value="€">€ EUR</option>
                <option value="£">£ GBP</option>
                <option value="¥">¥ JPY</option>
                <option value="₹">₹ INR</option>
                <option value="₽">₽ RUB</option>
                <option value="₩">₩ KRW</option>
                <option value="₪">₪ ILS</option>
              </select>
            </div>

            {/* Bill Amount */}
            <div>
              <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-orange-600" />
                Bill Amount
              </label>
              <input
                type="number"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg font-semibold text-gray-900"
              />
            </div>

            {/* Service Quality Presets */}
            <div>
              <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-orange-600" />
                Service Quality
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {servicePresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setTipPercentage(preset.tip.toString())}
                    className={`px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all transform ${
                      tipPercentage === preset.tip.toString()
                        ? `bg-gradient-to-r ${preset.color} text-white shadow-lg scale-105`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                    } active:scale-95 touch-manipulation min-h-[44px]`}
                  >
                    {preset.label}
                    <div className="text-xs mt-0.5">{preset.tip}%</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tip Percentage */}
            <div>
              <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Percent className="h-4 w-4 text-orange-600" />
                Tip Percentage (%)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  value={tipPercentage}
                  onChange={(e) => setTipPercentage(e.target.value)}
                  placeholder="15"
                  min="0"
                  max="100"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg font-semibold text-gray-900"
                />
                {favoriteTip && favoriteTip !== tipPercentage && (
                  <button
                    onClick={() => setTipPercentage(favoriteTip)}
                    className="px-4 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors font-semibold"
                    title="Use favorite tip"
                  >
                    <Star className="h-5 w-5 fill-current" />
                  </button>
                )}
                <button
                  onClick={saveFavoriteTip}
                  className={`px-4 py-3 rounded-xl transition-colors font-semibold ${
                    favoriteTip === tipPercentage
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  title="Save as favorite"
                >
                  <Star className={`h-5 w-5 ${favoriteTip === tipPercentage ? 'fill-current' : ''}`} />
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {tipPresets.map((percent) => (
                  <button
                    key={percent}
                    onClick={() => setTipPercentage(percent.toString())}
                    className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all transform ${
                      tipPercentage === percent.toString()
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                    } active:scale-95 touch-manipulation min-h-[44px]`}
                  >
                    {percent}%
                  </button>
                ))}
              </div>
            </div>

            {/* Tax Percentage */}
            <div>
              <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2">Tax Percentage (%)</label>
              <input
                type="number"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(e.target.value)}
                placeholder="0"
                min="0"
                max="100"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg font-semibold text-gray-900"
              />
            </div>

            {/* Number of People */}
            <div>
              <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-600" />
                Number of People
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={numberOfPeople}
                  onChange={(e) => setNumberOfPeople(e.target.value)}
                  placeholder="1"
                  min="1"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg font-semibold text-gray-900"
                />
                <button
                  onClick={() => setNumberOfPeople(Math.max(1, parseInt(numberOfPeople) - 1).toString())}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-bold text-lg min-w-[48px]"
                >
                  -
                </button>
                <button
                  onClick={() => setNumberOfPeople((parseInt(numberOfPeople) + 1).toString())}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-bold text-lg min-w-[48px]"
                >
                  +
                </button>
              </div>
            </div>

            {/* Rounding Options */}
            <div>
              <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2">Rounding Option</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setRoundOption('none')}
                  className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                    roundOption === 'none'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } active:scale-95 touch-manipulation min-h-[48px]`}
                >
                  None
                </button>
                <button
                  onClick={() => setRoundOption('up')}
                  className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-1 ${
                    roundOption === 'up'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } active:scale-95 touch-manipulation min-h-[48px]`}
                >
                  <TrendingUp className="h-4 w-4" />
                  Round Up
                </button>
                <button
                  onClick={() => setRoundOption('down')}
                  className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-1 ${
                    roundOption === 'down'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } active:scale-95 touch-manipulation min-h-[48px]`}
                >
                  <TrendingDown className="h-4 w-4" />
                  Round Down
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={calculate}
                className="flex-1 sm:flex-none sm:flex-1 bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 text-white px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base hover:shadow-xl transition-all flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 touch-manipulation min-h-[48px]"
              >
                <Calculator className="h-5 w-5" />
                <span>Calculate</span>
              </button>
              <button
                onClick={reset}
                className="px-4 py-3.5 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 touch-manipulation min-h-[48px]"
              >
                <RotateCcw className="h-5 w-5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-3.5 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-all flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 touch-manipulation min-h-[48px]"
              >
                <History className="h-5 w-5" />
                <span className="hidden sm:inline">History</span>
              </button>
            </div>

            {/* Results */}
            {result && (
              <div className="mt-6 space-y-4">
                <div className="bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 rounded-xl p-4 sm:p-6 border-2 border-orange-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Results</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(`Bill: ${formatCurrency(result.billAmount)}\nTip: ${formatCurrency(result.tipAmount)}\nTax: ${formatCurrency(result.taxAmount)}\nTotal: ${formatCurrency(result.totalAmount)}\nPer Person: ${formatCurrency(result.perPerson)}`)}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        title="Copy results"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={shareResults}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        title="Share results"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-sm sm:text-base font-semibold text-gray-700">Bill Amount:</span>
                      <span className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(result.billAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-sm sm:text-base font-semibold text-gray-700">Tip ({tipPercentage}%):</span>
                      <span className="text-xl sm:text-2xl font-bold text-orange-600">{formatCurrency(result.tipAmount)}</span>
                    </div>
                    {taxPercentage !== '0' && (
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="text-sm sm:text-base font-semibold text-gray-700">Tax ({taxPercentage}%):</span>
                        <span className="text-xl sm:text-2xl font-bold text-blue-600">{formatCurrency(result.taxAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white">
                      <span className="text-sm sm:text-base font-bold">Total Amount:</span>
                      <span className="text-2xl sm:text-3xl font-extrabold">{formatCurrency(result.totalAmount)}</span>
                    </div>
                    {parseInt(numberOfPeople) > 1 && (
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg border-2 border-orange-300">
                        <span className="text-sm sm:text-base font-semibold text-gray-700">Per Person ({numberOfPeople} people):</span>
                        <span className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(result.perPerson)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* History */}
            {showHistory && (
              <div className="mt-6 bg-white rounded-xl p-4 sm:p-6 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <History className="h-5 w-5 text-purple-600" />
                    Calculation History
                  </h3>
                  <div className="flex gap-2">
                    {history.length > 0 && (
                      <button
                        onClick={clearHistory}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm font-semibold"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      onClick={() => setShowHistory(false)}
                      className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {history.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No calculation history yet</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {history.map((entry) => (
                      <div
                        key={entry.id}
                        onClick={() => loadFromHistory(entry)}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{formatCurrency(entry.totalAmount)} total</div>
                            <div className="text-xs text-gray-600">
                              {entry.tipPercentage}% tip • {entry.numberOfPeople} {entry.numberOfPeople === 1 ? 'person' : 'people'}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileBottomAd adKey="36d691042d95ac1ac33375038ec47a5c" />
      <Footer />
    </div>
  )
}

