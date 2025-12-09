'use client'

import { useState, useEffect } from 'react'
import Footer from '@/components/Footer'
import SidebarAd from '@/components/SidebarAd'
import MobileBottomAd from '@/components/MobileBottomAd'
import toast from 'react-hot-toast'
import {
  Calculator, Copy, Check, RotateCcw, TrendingUp, TrendingDown,
  Percent, ArrowUp, ArrowDown, DollarSign, PieChart, History,
  X, Plus, Minus, RefreshCw, Info, Share2
} from 'lucide-react'

type CalculationMode = 
  | 'percentage-of' 
  | 'what-percentage' 
  | 'increase-decrease' 
  | 'add-subtract' 
  | 'reverse' 
  | 'discount' 
  | 'markup-margin'
  | 'converters'

interface CalculationHistory {
  id: string
  mode: CalculationMode
  inputs: any
  result: number | string
  formula: string
  timestamp: Date
}

export default function PercentageCalculator() {
  const [activeTab, setActiveTab] = useState<CalculationMode>('percentage-of')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [history, setHistory] = useState<CalculationHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const hasResult = () => {
    if (activeTab === 'percentage-of') return result1 !== null
    if (activeTab === 'what-percentage') return result2 !== null
    if (activeTab === 'increase-decrease') return result3 !== null
    if (activeTab === 'add-subtract') return result4 !== null
    if (activeTab === 'reverse') return result5 !== null
    if (activeTab === 'discount') return result6 !== null
    if (activeTab === 'markup-margin') return result7 !== null
    if (activeTab === 'converters') return result8 !== null
    return false
  }

  // Percentage Of
  const [value1, setValue1] = useState('')
  const [percentage1, setPercentage1] = useState('')
  const [result1, setResult1] = useState<number | null>(null)

  // What Percentage
  const [part, setPart] = useState('')
  const [whole, setWhole] = useState('')
  const [result2, setResult2] = useState<number | null>(null)

  // Increase/Decrease
  const [fromValue, setFromValue] = useState('')
  const [toValue, setToValue] = useState('')
  const [result3, setResult3] = useState<{ percentage: number; type: 'increase' | 'decrease' } | null>(null)

  // Add/Subtract
  const [baseValue, setBaseValue] = useState('')
  const [percentage2, setPercentage2] = useState('')
  const [operation, setOperation] = useState<'add' | 'subtract'>('add')
  const [result4, setResult4] = useState<number | null>(null)

  // Reverse
  const [partialValue, setPartialValue] = useState('')
  const [percentage3, setPercentage3] = useState('')
  const [result5, setResult5] = useState<number | null>(null)

  // Discount
  const [originalPrice, setOriginalPrice] = useState('')
  const [discountPercent, setDiscountPercent] = useState('')
  const [result6, setResult6] = useState<{ finalPrice: number; savings: number } | null>(null)

  // Markup/Margin
  const [cost, setCost] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [markupType, setMarkupType] = useState<'markup' | 'margin'>('markup')
  const [result7, setResult7] = useState<number | null>(null)

  // Converters
  const [decimalValue, setDecimalValue] = useState('')
  const [fractionValue, setFractionValue] = useState('')
  const [result8, setResult8] = useState<{ decimal: number; percentage: number; fraction: string } | null>(null)

  const commonPercentages = [5, 10, 15, 20, 25, 50, 75, 100]

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetAll()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Real-time calculation
  useEffect(() => {
    if (activeTab === 'percentage-of' && value1 && percentage1) {
      const val = parseFloat(value1)
      const perc = parseFloat(percentage1)
      if (!isNaN(val) && !isNaN(perc)) {
        const result = (val * perc) / 100
        setResult1(result)
      } else {
        setResult1(null)
      }
    } else if (activeTab !== 'percentage-of') {
      setResult1(null)
    }
  }, [value1, percentage1, activeTab])

  useEffect(() => {
    if (activeTab === 'what-percentage' && part && whole) {
      const p = parseFloat(part)
      const w = parseFloat(whole)
      if (!isNaN(p) && !isNaN(w) && w !== 0) {
        setResult2((p / w) * 100)
      } else {
        setResult2(null)
      }
    } else if (activeTab !== 'what-percentage') {
      setResult2(null)
    }
  }, [part, whole, activeTab])

  useEffect(() => {
    if (activeTab === 'increase-decrease' && fromValue && toValue) {
      const from = parseFloat(fromValue)
      const to = parseFloat(toValue)
      if (!isNaN(from) && !isNaN(to) && from !== 0) {
        const change = ((to - from) / from) * 100
        setResult3({ percentage: Math.abs(change), type: change >= 0 ? 'increase' : 'decrease' })
      } else {
        setResult3(null)
      }
    } else if (activeTab !== 'increase-decrease') {
      setResult3(null)
    }
  }, [fromValue, toValue, activeTab])

  useEffect(() => {
    if (activeTab === 'add-subtract' && baseValue && percentage2) {
      const base = parseFloat(baseValue)
      const perc = parseFloat(percentage2)
      if (!isNaN(base) && !isNaN(perc)) {
        const change = (base * perc) / 100
        setResult4(operation === 'add' ? base + change : base - change)
      } else {
        setResult4(null)
      }
    } else if (activeTab !== 'add-subtract') {
      setResult4(null)
    }
  }, [baseValue, percentage2, operation, activeTab])

  useEffect(() => {
    if (activeTab === 'reverse' && partialValue && percentage3) {
      const partial = parseFloat(partialValue)
      const perc = parseFloat(percentage3)
      if (!isNaN(partial) && !isNaN(perc) && perc !== 0) {
        setResult5((partial / perc) * 100)
      } else {
        setResult5(null)
      }
    } else if (activeTab !== 'reverse') {
      setResult5(null)
    }
  }, [partialValue, percentage3, activeTab])

  useEffect(() => {
    if (activeTab === 'discount' && originalPrice && discountPercent) {
      const original = parseFloat(originalPrice)
      const discount = parseFloat(discountPercent)
      if (!isNaN(original) && !isNaN(discount)) {
        const savings = (original * discount) / 100
        setResult6({ finalPrice: original - savings, savings })
      } else {
        setResult6(null)
      }
    } else if (activeTab !== 'discount') {
      setResult6(null)
    }
  }, [originalPrice, discountPercent, activeTab])

  useEffect(() => {
    if (activeTab === 'markup-margin' && cost && sellingPrice) {
      const c = parseFloat(cost)
      const sp = parseFloat(sellingPrice)
      if (!isNaN(c) && !isNaN(sp) && c !== 0) {
        if (markupType === 'markup') {
          setResult7(((sp - c) / c) * 100)
        } else {
          setResult7(((sp - c) / sp) * 100)
        }
      } else {
        setResult7(null)
      }
    } else if (activeTab !== 'markup-margin') {
      setResult7(null)
    }
  }, [cost, sellingPrice, markupType, activeTab])

  useEffect(() => {
    if (activeTab === 'converters') {
      let decimal = 0
      let percentage = 0
      let fraction = ''

      if (decimalValue) {
        const d = parseFloat(decimalValue)
        if (!isNaN(d)) {
          decimal = d
          percentage = d * 100
          // Convert to fraction
          const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
          const denominator = 100
          const numerator = Math.round(percentage)
          const divisor = gcd(numerator, denominator)
          fraction = `${numerator / divisor}/${denominator / divisor}`
        }
      } else if (fractionValue) {
        const parts = fractionValue.split('/')
        if (parts.length === 2) {
          const num = parseFloat(parts[0])
          const den = parseFloat(parts[1])
          if (!isNaN(num) && !isNaN(den) && den !== 0) {
            decimal = num / den
            percentage = decimal * 100
            fraction = fractionValue
          }
        }
      }

      if (decimal !== 0 || percentage !== 0) {
        setResult8({ decimal, percentage, fraction })
      } else {
        setResult8(null)
      }
    } else {
      setResult8(null)
    }
  }, [decimalValue, fractionValue, activeTab])

  const addToHistory = (mode: CalculationMode, inputs: any, result: number | string, formula: string) => {
    const newEntry: CalculationHistory = {
      id: Date.now().toString(),
      mode,
      inputs,
      result,
      formula,
      timestamp: new Date()
    }
    setHistory([newEntry, ...history].slice(0, 10)) // Keep last 10
    toast.success('Added to history!')
  }

  const addCurrentToHistory = () => {
    if (!hasResult()) {
      toast.error('No result to save')
      return
    }

    switch (activeTab) {
      case 'percentage-of':
        if (result1 !== null) {
          addToHistory(
            'percentage-of',
            { value: value1, percentage: percentage1 },
            result1,
            `${percentage1 || 0}% of ${value1 || 0} = ${result1.toFixed(2)}`
          )
        }
        break
      case 'what-percentage':
        if (result2 !== null) {
          addToHistory(
            'what-percentage',
            { part, whole },
            result2,
            `${part || 0} is ${result2.toFixed(2)}% of ${whole || 0}`
          )
        }
        break
      case 'increase-decrease':
        if (result3 !== null) {
          addToHistory(
            'increase-decrease',
            { fromValue, toValue },
            result3.percentage,
            `${fromValue || 0} → ${toValue || 0}: ${result3.type} ${result3.percentage.toFixed(2)}%`
          )
        }
        break
      case 'add-subtract':
        if (result4 !== null) {
          addToHistory(
            'add-subtract',
            { baseValue, percentage2, operation },
            result4,
            `${operation === 'add' ? '+' : '-'}${percentage2 || 0}% of ${baseValue || 0} = ${result4.toFixed(2)}`
          )
        }
        break
      case 'reverse':
        if (result5 !== null) {
          addToHistory(
            'reverse',
            { partialValue, percentage3 },
            result5,
            `${partialValue || 0} is ${percentage3 || 0}% of ${result5.toFixed(2)}`
          )
        }
        break
      case 'discount':
        if (result6 !== null) {
          addToHistory(
            'discount',
            { originalPrice, discountPercent },
            result6.finalPrice,
            `${discountPercent || 0}% off ${originalPrice || 0} = ${result6.finalPrice.toFixed(2)} (save ${result6.savings.toFixed(2)})`
          )
        }
        break
      case 'markup-margin':
        if (result7 !== null) {
          addToHistory(
            'markup-margin',
            { cost, sellingPrice, markupType },
            result7,
            `${markupType === 'markup' ? 'Markup' : 'Margin'} from ${cost || 0} to ${sellingPrice || 0} = ${result7.toFixed(2)}%`
          )
        }
        break
      case 'converters':
        if (result8 !== null) {
          addToHistory(
            'converters',
            { decimalValue, fractionValue },
            result8.percentage,
            `${result8.decimal.toFixed(2)} = ${result8.percentage.toFixed(2)}% (${result8.fraction})`
          )
        }
        break
      default:
        break
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  const resetAll = () => {
    setValue1('')
    setPercentage1('')
    setResult1(null)
    setPart('')
    setWhole('')
    setResult2(null)
    setFromValue('')
    setToValue('')
    setResult3(null)
    setBaseValue('')
    setPercentage2('')
    setResult4(null)
    setPartialValue('')
    setPercentage3('')
    setResult5(null)
    setOriginalPrice('')
    setDiscountPercent('')
    setResult6(null)
    setCost('')
    setSellingPrice('')
    setResult7(null)
    setDecimalValue('')
    setFractionValue('')
    setResult8(null)
    toast.success('Reset!')
  }

  const tabs = [
    { id: 'percentage-of' as CalculationMode, label: 'X% of Y', icon: Percent },
    { id: 'what-percentage' as CalculationMode, label: 'What %?', icon: Calculator },
    { id: 'increase-decrease' as CalculationMode, label: 'Change %', icon: TrendingUp },
    { id: 'add-subtract' as CalculationMode, label: 'Add/Subtract', icon: Plus },
    { id: 'reverse' as CalculationMode, label: 'Reverse', icon: RefreshCw },
    { id: 'discount' as CalculationMode, label: 'Discount', icon: DollarSign },
    { id: 'markup-margin' as CalculationMode, label: 'Markup/Margin', icon: PieChart },
    { id: 'converters' as CalculationMode, label: 'Converters', icon: ArrowUp },
  ]

  const renderPercentageOf = () => (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <div>
        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-2.5">Value (Y)</label>
        <input
          type="number"
          value={value1}
          onChange={(e) => setValue1(e.target.value)}
          placeholder="Enter value"
          className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-base sm:text-lg transition-all duration-200 bg-white hover:border-gray-300 shadow-sm min-h-[48px]"
          onKeyDown={(e) => e.key === 'Enter' && result1 !== null && addToHistory('percentage-of', { value: value1, percentage: percentage1 }, result1, `${percentage1}% of ${value1} = ${result1.toFixed(2)}`)}
        />
      </div>
      <div>
        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-2.5">Percentage (%)</label>
        <input
          type="number"
          value={percentage1}
          onChange={(e) => setPercentage1(e.target.value)}
          placeholder="Enter percentage"
          className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-base sm:text-lg transition-all duration-200 bg-white hover:border-gray-300 shadow-sm min-h-[48px]"
          onKeyDown={(e) => e.key === 'Enter' && result1 !== null && addToHistory('percentage-of', { value: value1, percentage: percentage1 }, result1, `${percentage1}% of ${value1} = ${result1.toFixed(2)}`)}
        />
        <div className="flex flex-wrap gap-2 sm:gap-2.5 mt-2 sm:mt-3">
          {commonPercentages.map((p) => (
            <button
              key={p}
              onClick={() => setPercentage1(p.toString())}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 touch-manipulation min-h-[44px] sm:min-h-[48px] flex items-center justify-center shadow-sm flex-1 sm:flex-none min-w-[60px] ${
                percentage1 === p.toString()
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-200'
                  : 'bg-gray-50 text-gray-700 active:bg-gray-100 border border-gray-200'
              }`}
            >
              {p}%
            </button>
          ))}
        </div>
      </div>
      {result1 !== null && (
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 border border-purple-100 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 sm:mb-2">Result</div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent break-all">{result1.toFixed(2)}</div>
            </div>
            <button
              onClick={() => copyToClipboard(result1.toFixed(2), 'result1')}
              className="p-2.5 sm:p-3 hover:bg-white/80 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation min-w-[44px] sm:min-w-[48px] min-h-[44px] sm:min-h-[48px] flex items-center justify-center shadow-sm bg-white/50 border border-purple-100 flex-shrink-0"
            >
              {copiedId === 'result1' ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-gray-600" />}
            </button>
          </div>
          <div className="pt-3 sm:pt-4 border-t border-purple-100">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Formula</div>
            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-3.5 rounded-xl border border-purple-100 shadow-sm font-mono text-xs sm:text-sm text-gray-700 break-all">
              {percentage1}% × {value1} = {result1.toFixed(2)}
            </div>
          </div>
          <div className="pt-2">
            <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.min(percentage1 ? parseFloat(percentage1) : 0, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderWhatPercentage = () => (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <div>
        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-2.5">Part (X)</label>
        <input
          type="number"
          value={part}
          onChange={(e) => setPart(e.target.value)}
          placeholder="Enter part value"
          className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-base sm:text-lg transition-all duration-200 bg-white hover:border-gray-300 shadow-sm min-h-[48px]"
        />
      </div>
      <div>
        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-2.5">Whole (Y)</label>
        <input
          type="number"
          value={whole}
          onChange={(e) => setWhole(e.target.value)}
          placeholder="Enter whole value"
          className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-base sm:text-lg transition-all duration-200 bg-white hover:border-gray-300 shadow-sm min-h-[48px]"
        />
      </div>
      {result2 !== null && (
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 border border-purple-100 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 sm:mb-2">Result</div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent break-all">{result2.toFixed(2)}%</div>
            </div>
            <button
              onClick={() => copyToClipboard(`${result2.toFixed(2)}%`, 'result2')}
              className="p-2.5 sm:p-3 hover:bg-white/80 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation min-w-[44px] sm:min-w-[48px] min-h-[44px] sm:min-h-[48px] flex items-center justify-center shadow-sm bg-white/50 border border-purple-100 flex-shrink-0"
            >
              {copiedId === 'result2' ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-gray-600" />}
            </button>
          </div>
          <div className="pt-3 sm:pt-4 border-t border-purple-100">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Formula</div>
            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-3.5 rounded-xl border border-purple-100 shadow-sm font-mono text-xs sm:text-sm text-gray-700 break-all">
              ({part} ÷ {whole}) × 100 = {result2.toFixed(2)}%
            </div>
          </div>
          <div className="pt-2">
            <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.min(result2, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderIncreaseDecrease = () => (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <div>
        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-2.5">From Value</label>
        <input
          type="number"
          value={fromValue}
          onChange={(e) => setFromValue(e.target.value)}
          placeholder="Enter initial value"
          className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-base sm:text-lg transition-all duration-200 bg-white hover:border-gray-300 shadow-sm min-h-[48px]"
        />
      </div>
      <div>
        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-2.5">To Value</label>
        <input
          type="number"
          value={toValue}
          onChange={(e) => setToValue(e.target.value)}
          placeholder="Enter final value"
          className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-base sm:text-lg transition-all duration-200 bg-white hover:border-gray-300 shadow-sm min-h-[48px]"
        />
      </div>
      {result3 !== null && (
        <div className={`bg-gradient-to-br rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 border shadow-lg ${
          result3.type === 'increase' 
            ? 'from-green-50 via-emerald-50 to-green-50 border-green-100' 
            : 'from-red-50 via-pink-50 to-red-50 border-red-100'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
              <div className={`p-2 sm:p-3 rounded-xl shadow-sm flex-shrink-0 ${
                result3.type === 'increase' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {result3.type === 'increase' ? (
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-red-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 sm:mb-2">Percentage Change</div>
                <div className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold break-all ${
                  result3.type === 'increase' 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent' 
                    : 'bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent'
                }`}>
                  {result3.type === 'increase' ? '+' : '-'}{result3.percentage.toFixed(2)}%
                </div>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(`${result3.type === 'increase' ? '+' : '-'}${result3.percentage.toFixed(2)}%`, 'result3')}
              className="p-2.5 sm:p-3 hover:bg-white/80 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation min-w-[44px] sm:min-w-[48px] min-h-[44px] sm:min-h-[48px] flex items-center justify-center shadow-sm bg-white/50 border border-gray-200 flex-shrink-0"
            >
              {copiedId === 'result3' ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-gray-600" />}
            </button>
          </div>
          <div className="pt-3 sm:pt-4 border-t border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Formula</div>
            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-3.5 rounded-xl border border-gray-200 shadow-sm font-mono text-xs sm:text-sm text-gray-700 break-all">
              (({toValue} - {fromValue}) ÷ {fromValue}) × 100 = {result3.type === 'increase' ? '+' : '-'}{result3.percentage.toFixed(2)}%
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderAddSubtract = () => (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <div>
        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-2.5">Base Value</label>
        <input
          type="number"
          value={baseValue}
          onChange={(e) => setBaseValue(e.target.value)}
          placeholder="Enter base value"
          className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-base sm:text-lg transition-all duration-200 bg-white hover:border-gray-300 shadow-sm min-h-[48px]"
        />
      </div>
      <div>
        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-2.5">Operation</label>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => setOperation('add')}
            className={`flex-1 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 sm:gap-2.5 shadow-sm border-2 min-h-[48px] text-sm sm:text-base touch-manipulation active:scale-95 ${
              operation === 'add'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-600 shadow-md'
                : 'bg-white text-gray-700 active:bg-gray-50 border-gray-200'
            }`}
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            Add
          </button>
          <button
            onClick={() => setOperation('subtract')}
            className={`flex-1 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 sm:gap-2.5 shadow-sm border-2 min-h-[48px] text-sm sm:text-base touch-manipulation active:scale-95 ${
              operation === 'subtract'
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-600 shadow-md'
                : 'bg-white text-gray-700 active:bg-gray-50 border-gray-200'
            }`}
          >
            <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
            Subtract
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-2.5">Percentage (%)</label>
        <input
          type="number"
          value={percentage2}
          onChange={(e) => setPercentage2(e.target.value)}
          placeholder="Enter percentage"
          className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-base sm:text-lg transition-all duration-200 bg-white hover:border-gray-300 shadow-sm min-h-[48px]"
        />
        <div className="flex flex-wrap gap-2 sm:gap-2.5 mt-2 sm:mt-3">
          {commonPercentages.map((p) => (
            <button
              key={p}
              onClick={() => setPercentage2(p.toString())}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 touch-manipulation min-h-[44px] sm:min-h-[48px] flex items-center justify-center shadow-sm flex-1 sm:flex-none min-w-[60px] ${
                percentage2 === p.toString()
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-200'
                  : 'bg-gray-50 text-gray-700 active:bg-gray-100 border border-gray-200'
              }`}
            >
              {p}%
            </button>
          ))}
        </div>
      </div>
      {result4 !== null && (
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 border border-purple-100 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 sm:mb-2">Result</div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent break-all">{result4.toFixed(2)}</div>
            </div>
            <button
              onClick={() => copyToClipboard(result4.toFixed(2), 'result4')}
              className="p-2.5 sm:p-3 hover:bg-white/80 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation min-w-[44px] sm:min-w-[48px] min-h-[44px] sm:min-h-[48px] flex items-center justify-center shadow-sm bg-white/50 border border-purple-100 flex-shrink-0"
            >
              {copiedId === 'result4' ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-gray-600" />}
            </button>
          </div>
          <div className="pt-3 sm:pt-4 border-t border-purple-100">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Formula</div>
            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-3.5 rounded-xl border border-purple-100 shadow-sm font-mono text-xs sm:text-sm text-gray-700 break-all">
              {baseValue} {operation === 'add' ? '+' : '-'} ({percentage2}% × {baseValue}) = {result4.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderReverse = () => (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <div>
        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-2.5">Partial Value (X)</label>
        <input
          type="number"
          value={partialValue}
          onChange={(e) => setPartialValue(e.target.value)}
          placeholder="Enter partial value"
          className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-base sm:text-lg transition-all duration-200 bg-white hover:border-gray-300 shadow-sm min-h-[48px]"
        />
      </div>
      <div>
        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-2.5">Percentage (%)</label>
        <input
          type="number"
          value={percentage3}
          onChange={(e) => setPercentage3(e.target.value)}
          placeholder="Enter percentage"
          className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-base sm:text-lg transition-all duration-200 bg-white hover:border-gray-300 shadow-sm min-h-[48px]"
        />
      </div>
      {result5 !== null && (
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 border border-purple-100 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Original Number</div>
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{result5.toFixed(2)}</div>
            </div>
            <button
              onClick={() => copyToClipboard(result5.toFixed(2), 'result5')}
              className="p-2.5 sm:p-3 hover:bg-white/80 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation min-w-[44px] sm:min-w-[48px] min-h-[44px] sm:min-h-[48px] flex items-center justify-center shadow-sm bg-white/50 border border-purple-100 flex-shrink-0"
            >
              {copiedId === 'result5' ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-gray-600" />}
            </button>
          </div>
          <div className="pt-3 sm:pt-4 border-t border-purple-100">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Formula</div>
            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-3.5 rounded-xl border border-purple-100 shadow-sm font-mono text-xs sm:text-sm text-gray-700 break-all">
              {partialValue} ÷ {percentage3}% × 100 = {result5.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderDiscount = () => (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <div>
        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-2.5">Original Price ($)</label>
        <input
          type="number"
          value={originalPrice}
          onChange={(e) => setOriginalPrice(e.target.value)}
          placeholder="Enter original price"
          className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-base sm:text-lg transition-all duration-200 bg-white hover:border-gray-300 shadow-sm min-h-[48px]"
        />
      </div>
      <div>
        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-2.5">Discount Percentage (%)</label>
        <input
          type="number"
          value={discountPercent}
          onChange={(e) => setDiscountPercent(e.target.value)}
          placeholder="Enter discount %"
          className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-base sm:text-lg transition-all duration-200 bg-white hover:border-gray-300 shadow-sm min-h-[48px]"
        />
        <div className="flex flex-wrap gap-2 sm:gap-2.5 mt-2 sm:mt-3">
          {[10, 15, 20, 25, 30, 50].map((p) => (
            <button
              key={p}
              onClick={() => setDiscountPercent(p.toString())}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 touch-manipulation min-h-[44px] sm:min-h-[48px] flex items-center justify-center shadow-sm flex-1 sm:flex-none min-w-[60px] ${
                discountPercent === p.toString()
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-200'
                  : 'bg-gray-50 text-gray-700 active:bg-gray-100 border border-gray-200'
              }`}
            >
              {p}%
            </button>
          ))}
        </div>
      </div>
      {result6 !== null && (
        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 border border-green-100 shadow-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
            <div className="bg-white/60 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-green-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 sm:mb-2">Final Price</div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent break-all">${result6.finalPrice.toFixed(2)}</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-green-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 sm:mb-2">You Save</div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent break-all">${result6.savings.toFixed(2)}</div>
            </div>
          </div>
          <div className="pt-3 sm:pt-4 border-t border-green-100">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Formula</div>
            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-3.5 rounded-xl border border-green-200 shadow-sm font-mono text-xs sm:text-sm text-gray-700 break-all">
              Savings = ${originalPrice} × {discountPercent}% = ${result6.savings.toFixed(2)}<br />
              Final Price = ${originalPrice} - ${result6.savings.toFixed(2)} = ${result6.finalPrice.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderMarkupMargin = () => (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <div>
        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-2.5">Calculation Type</label>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => setMarkupType('markup')}
            className={`flex-1 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-sm border-2 min-h-[48px] text-sm sm:text-base touch-manipulation active:scale-95 ${
              markupType === 'markup'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-700 shadow-md'
                : 'bg-white text-gray-700 active:bg-gray-50 border-gray-200'
            }`}
          >
            Markup %
          </button>
          <button
            onClick={() => setMarkupType('margin')}
            className={`flex-1 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-sm border-2 min-h-[48px] text-sm sm:text-base touch-manipulation active:scale-95 ${
              markupType === 'margin'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-700 shadow-md'
                : 'bg-white text-gray-700 active:bg-gray-50 border-gray-200'
            }`}
          >
            Margin %
          </button>
        </div>
        <div className="mt-3 p-4 bg-blue-50/80 backdrop-blur-sm rounded-xl border border-blue-200 text-sm text-gray-700 shadow-sm">
          <Info className="h-4 w-4 inline mr-2 text-blue-600" />
          <span className="font-medium">{markupType === 'markup' 
            ? 'Markup is calculated on cost: ((Selling - Cost) ÷ Cost) × 100'
            : 'Margin is calculated on selling price: ((Selling - Cost) ÷ Selling) × 100'}</span>
        </div>
      </div>
      <div>
        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-2.5">Cost ($)</label>
        <input
          type="number"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="Enter cost"
          className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-base sm:text-lg transition-all duration-200 bg-white hover:border-gray-300 shadow-sm min-h-[48px]"
        />
      </div>
      <div>
        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-2.5">Selling Price ($)</label>
        <input
          type="number"
          value={sellingPrice}
          onChange={(e) => setSellingPrice(e.target.value)}
          placeholder="Enter selling price"
          className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-base sm:text-lg transition-all duration-200 bg-white hover:border-gray-300 shadow-sm min-h-[48px]"
        />
      </div>
      {result7 !== null && (
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 border border-purple-100 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{markupType === 'markup' ? 'Markup' : 'Margin'} Percentage</div>
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{result7.toFixed(2)}%</div>
            </div>
            <button
              onClick={() => copyToClipboard(`${result7.toFixed(2)}%`, 'result7')}
              className="p-2.5 sm:p-3 hover:bg-white/80 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation min-w-[44px] sm:min-w-[48px] min-h-[44px] sm:min-h-[48px] flex items-center justify-center shadow-sm bg-white/50 border border-purple-100 flex-shrink-0"
            >
              {copiedId === 'result7' ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-gray-600" />}
            </button>
          </div>
          <div className="pt-3 sm:pt-4 border-t border-purple-100">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Formula</div>
            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-3.5 rounded-xl border border-purple-100 shadow-sm font-mono text-xs sm:text-sm text-gray-700 break-all">
              {markupType === 'markup' 
                ? `((${sellingPrice} - ${cost}) ÷ ${cost}) × 100 = ${result7.toFixed(2)}%`
                : `((${sellingPrice} - ${cost}) ÷ ${sellingPrice}) × 100 = ${result7.toFixed(2)}%`}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderConverters = () => (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <div>
        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-2.5">Decimal Value</label>
        <input
          type="number"
          value={decimalValue}
          onChange={(e) => {
            setDecimalValue(e.target.value)
            setFractionValue('')
          }}
          placeholder="Enter decimal (e.g., 0.25)"
          step="0.01"
          className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-base sm:text-lg transition-all duration-200 bg-white hover:border-gray-300 shadow-sm min-h-[48px]"
        />
      </div>
      <div className="text-center">
        <span className="inline-block px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-semibold">OR</span>
      </div>
      <div>
        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-2.5">Fraction (e.g., 1/4)</label>
        <input
          type="text"
          value={fractionValue}
          onChange={(e) => {
            setFractionValue(e.target.value)
            setDecimalValue('')
          }}
          placeholder="Enter fraction (e.g., 1/4)"
          className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-base sm:text-lg transition-all duration-200 bg-white hover:border-gray-300 shadow-sm min-h-[48px]"
        />
      </div>
      {result8 !== null && (
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 border border-purple-100 shadow-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-purple-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 sm:mb-2">Decimal</div>
              <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent break-all">{result8.decimal.toFixed(4)}</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-purple-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 sm:mb-2">Percentage</div>
              <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent break-all">{result8.percentage.toFixed(2)}%</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-purple-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 sm:mb-2">Fraction</div>
              <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent break-all">{result8.fraction}</div>
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(`${result8.decimal} = ${result8.percentage}% = ${result8.fraction}`, 'result8')}
            className="w-full flex items-center justify-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-3 sm:py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-md shadow-purple-200 active:scale-95 touch-manipulation min-h-[48px] text-sm sm:text-base"
          >
            {copiedId === 'result8' ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : <Copy className="h-4 w-4 sm:h-5 sm:w-5" />}
            Copy All
          </button>
        </div>
      )}
    </div>
  )

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'percentage-of':
        return renderPercentageOf()
      case 'what-percentage':
        return renderWhatPercentage()
      case 'increase-decrease':
        return renderIncreaseDecrease()
      case 'add-subtract':
        return renderAddSubtract()
      case 'reverse':
        return renderReverse()
      case 'discount':
        return renderDiscount()
      case 'markup-margin':
        return renderMarkupMargin()
      case 'converters':
        return renderConverters()
      default:
        return renderPercentageOf()
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SidebarAd position="left" adKey="36d691042d95ac1ac33375038ec47a5c" />
      <SidebarAd position="right" adKey="36d691042d95ac1ac33375038ec47a5c" />
      
      <main className="flex-grow py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-6 md:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 mb-2 sm:mb-3 md:mb-4">
              <Calculator className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-1 sm:mb-2">Percentage Calculator</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-900 px-2 sm:px-4">Advanced percentage calculations made easy</p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white overflow-x-auto scrollbar-hide -mx-px">
              <div className="flex min-w-max px-px">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 md:py-4 flex items-center gap-1.5 sm:gap-2 md:gap-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap border-b-2 relative min-h-[48px] touch-manipulation ${
                        activeTab === tab.id
                          ? 'border-purple-600 text-purple-700 bg-white shadow-sm'
                          : 'border-transparent text-gray-500 active:text-gray-700 active:bg-gray-50/50'
                      }`}
                    >
                      <Icon className={`h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 flex-shrink-0 transition-colors ${
                        activeTab === tab.id ? 'text-purple-600' : 'text-gray-400'
                      }`} />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden text-xs font-semibold">{tab.label.split(' ')[0]}</span>
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6 md:p-8 lg:p-10 bg-gradient-to-b from-white to-gray-50/30">
              {renderActiveTab()}
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-100 bg-gray-50/50 p-3 sm:p-4 md:p-5 lg:p-6 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <button
                onClick={resetAll}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-white hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2 sm:gap-2.5 active:scale-95 touch-manipulation font-semibold shadow-sm bg-white min-h-[48px] text-sm sm:text-base"
              >
                <RotateCcw className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                Reset <span className="hidden md:inline text-xs text-gray-400 font-normal">(Esc)</span>
              </button>
              <button
                onClick={addCurrentToHistory}
                disabled={!hasResult()}
                className={`flex-1 sm:flex-none px-4 sm:px-5 py-3 sm:py-3.5 border-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 sm:gap-2.5 active:scale-95 touch-manipulation font-semibold shadow-sm min-h-[48px] text-sm sm:text-base ${
                  hasResult()
                    ? 'border-purple-500 bg-purple-50 text-purple-700 hover:bg-purple-100'
                    : 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
                }`}
              >
                <History className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                Save to History
              </button>
            <button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex-1 sm:flex-none px-4 sm:px-5 py-3 sm:py-3.5 border-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 sm:gap-2.5 active:scale-95 touch-manipulation font-semibold shadow-sm min-h-[48px] text-sm sm:text-base ${
                  showHistory
                    ? 'border-purple-500 bg-purple-50 text-purple-700 hover:bg-purple-100'
                    : 'border-gray-200 text-gray-700 hover:bg-white hover:border-gray-300 bg-white'
                }`}
              >
                <History className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                History {history.length > 0 && <span className="ml-1 sm:ml-1.5 text-xs bg-purple-600 text-white px-1.5 sm:px-2 py-0.5 rounded-full font-bold">{history.length}</span>}
            </button>
            </div>
          </div>

          {/* History Panel */}
          {showHistory && history.length > 0 && (
            <div className="mt-4 sm:mt-6 bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-5 md:p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-gray-100">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Calculation History</h3>
                <button
                  onClick={() => setHistory([])}
                  className="text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors touch-manipulation active:scale-95 min-h-[36px] sm:min-h-[40px]"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-2 sm:space-y-2.5 max-h-64 overflow-y-auto pr-1 sm:pr-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl flex items-center justify-between active:shadow-md transition-all duration-200 border border-gray-100 gap-2 sm:gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate mb-1 break-words">{item.formula}</div>
                      <div className="text-xs text-gray-500 font-medium">
                        {item.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(item.formula, item.id)}
                      className="ml-2 sm:ml-3 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 active:scale-95 border border-gray-200 min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] flex items-center justify-center flex-shrink-0 touch-manipulation"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                ))}
                </div>
              </div>
            )}
        </div>
      </main>

      <MobileBottomAd adKey="36d691042d95ac1ac33375038ec47a5c" />
      <Footer />
    </div>
  )
}

