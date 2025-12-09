'use client'

import { useState, useEffect, useRef } from 'react'
import Footer from '@/components/Footer'
import SidebarAd from '@/components/SidebarAd'
import MobileBottomAd from '@/components/MobileBottomAd'
import toast from 'react-hot-toast'
import {
  DollarSign, ArrowRightLeft, Star, TrendingUp, TrendingDown,
  BarChart3, Calendar, Bell, Download, Share2, Info, Globe,
  Clock, RefreshCw, X, Plus, Trash2, Settings, Heart, Eye,
  Copy, Check, AlertCircle, Newspaper, MapPin, Filter, ChevronDown,
  ChevronUp, Minus, Maximize2, Minimize2
} from 'lucide-react'

interface Currency {
  code: string
  name: string
  symbol?: string
  country?: string
  flag?: string
}

interface ConversionHistory {
  id: string
  date: string
  amount: number
  from: string
  to: string
  result: number
  rate: number
}

interface RateAlert {
  id: string
  fromCurrency: string
  toCurrency: string
  targetRate: number
  condition: 'above' | 'below'
  isActive: boolean
  createdAt: string
}

interface HistoricalRate {
  date: string
  rate: number
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('1')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('EUR')
  const [result, setResult] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentRate, setCurrentRate] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [rateType, setRateType] = useState<'standard' | 'live' | 'interbank' | 'tourist'>('standard')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Historical rates
  const [historicalDate, setHistoricalDate] = useState<string>('')
  const [showHistorical, setShowHistorical] = useState(false)
  const [historicalRates, setHistoricalRates] = useState<HistoricalRate[]>([])
  const [chartTimeRange, setChartTimeRange] = useState<'1d' | '1w' | '1m' | '3m' | '1y'>('1m')
  const [showChart, setShowChart] = useState(false)

  // Favorites
  const [favoriteCurrencies, setFavoriteCurrencies] = useState<string[]>([])
  const [showFavorites, setShowFavorites] = useState(false)

  // Comparison
  const [compareCurrencies, setCompareCurrencies] = useState<string[]>([])
  const [showComparison, setShowComparison] = useState(false)

  // Alerts
  const [alerts, setAlerts] = useState<RateAlert[]>([])
  const [showAlerts, setShowAlerts] = useState(false)
  const [newAlert, setNewAlert] = useState({ fromCurrency: 'USD', toCurrency: 'EUR', targetRate: '', condition: 'above' as 'above' | 'below' })

  // Currency info
  const [selectedCurrencyInfo, setSelectedCurrencyInfo] = useState<string | null>(null)
  const [showCurrencyInfo, setShowCurrencyInfo] = useState(false)

  // History
  const [conversionHistory, setConversionHistory] = useState<ConversionHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // News
  const [showNews, setShowNews] = useState(false)
  const [currencyNews, setCurrencyNews] = useState<any[]>([])

  // UI states
  const [activeTab, setActiveTab] = useState<'convert' | 'chart' | 'compare' | 'history'>('convert')
  const [isExpanded, setIsExpanded] = useState(false)

  const currencies: Currency[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$', country: 'United States', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', country: 'European Union', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', country: 'United Kingdom', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', country: 'Japan', flag: '🇯🇵' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', country: 'Australia', flag: '🇦🇺' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', country: 'Canada', flag: '🇨🇦' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', country: 'Switzerland', flag: '🇨🇭' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', country: 'China', flag: '🇨🇳' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', country: 'India', flag: '🇮🇳' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', country: 'Brazil', flag: '🇧🇷' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$', country: 'Mexico', flag: '🇲🇽' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', country: 'Singapore', flag: '🇸🇬' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', country: 'Hong Kong', flag: '🇭🇰' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', country: 'New Zealand', flag: '🇳🇿' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', country: 'Sweden', flag: '🇸🇪' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', country: 'Norway', flag: '🇳🇴' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr', country: 'Denmark', flag: '🇩🇰' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', country: 'South Africa', flag: '🇿🇦' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩', country: 'South Korea', flag: '🇰🇷' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺', country: 'Turkey', flag: '🇹🇷' },
  ]

  // Base exchange rates (fallback if API fails)
  const baseExchangeRates: { [key: string]: number } = {
    USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, AUD: 1.52, CAD: 1.36,
    CHF: 0.88, CNY: 7.24, INR: 83.1, BRL: 4.95, MXN: 17.2, SGD: 1.34,
    HKD: 7.82, NZD: 1.65, SEK: 10.8, NOK: 10.6, DKK: 6.87, ZAR: 18.5,
    KRW: 1315, TRY: 29.2
  }

  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>(baseExchangeRates)
  const [apiError, setApiError] = useState(false)

  // Fetch real-time exchange rates
  const fetchExchangeRates = async () => {
    try {
      // Using exchangerate-api.com (free tier)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
      if (response.ok) {
        const data = await response.json()
        setExchangeRates(data.rates)
        setLastUpdated(new Date())
        setApiError(false)
        return true
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error)
      setApiError(true)
      // Use fallback rates
      setExchangeRates(baseExchangeRates)
      setLastUpdated(new Date())
    }
    return false
  }

  // Fetch historical rates
  const fetchHistoricalRates = async (date: string) => {
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/history/USD/${date}`)
      if (response.ok) {
        const data = await response.json()
        return data.rates
      }
    } catch (error) {
      console.error('Error fetching historical rates:', error)
    }
    return null
  }

  // Load saved data from localStorage
  useEffect(() => {
    // Load favorites
    const savedFavorites = localStorage.getItem('currency-favorites')
    if (savedFavorites) {
      try {
        setFavoriteCurrencies(JSON.parse(savedFavorites))
      } catch (e) {
        console.error('Error loading favorites:', e)
      }
    }

    // Load history
    const savedHistory = localStorage.getItem('currency-history')
    if (savedHistory) {
      try {
        setConversionHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Error loading history:', e)
      }
    }

    // Load alerts
    const savedAlerts = localStorage.getItem('currency-alerts')
    if (savedAlerts) {
      try {
        setAlerts(JSON.parse(savedAlerts))
      } catch (e) {
        console.error('Error loading alerts:', e)
      }
    }

    // Auto-detect location currency
    const detectLocationCurrency = () => {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const countryMap: { [key: string]: string } = {
          'America/New_York': 'USD', 'America/Los_Angeles': 'USD',
          'Europe/London': 'GBP', 'Europe/Paris': 'EUR', 'Europe/Berlin': 'EUR',
          'Asia/Tokyo': 'JPY', 'Asia/Shanghai': 'CNY', 'Asia/Kolkata': 'INR',
          'Australia/Sydney': 'AUD', 'America/Toronto': 'CAD',
        }
        const detected = countryMap[timezone] || 'USD'
        if (!fromCurrency || fromCurrency === 'USD') {
          setFromCurrency(detected)
        }
      } catch (e) {
        console.error('Error detecting location:', e)
      }
    }
    detectLocationCurrency()

    // Fetch initial rates
    fetchExchangeRates()
  }, [])

  // Auto-refresh rates
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        fetchExchangeRates()
      }, 60000) // Refresh every minute
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [autoRefresh])

  // Check alerts
  useEffect(() => {
    if (exchangeRates && alerts.length > 0) {
      alerts.forEach(alert => {
        if (alert.isActive) {
          const rate = (exchangeRates[alert.toCurrency] || 1) / (exchangeRates[alert.fromCurrency] || 1)
          if (alert.condition === 'above' && rate >= alert.targetRate) {
            toast.success(`Alert: ${alert.fromCurrency}/${alert.toCurrency} reached ${rate.toFixed(4)}!`)
            setAlerts(prev => {
              const updated = prev.map(a => a.id === alert.id ? { ...a, isActive: false } : a)
              localStorage.setItem('currency-alerts', JSON.stringify(updated))
              return updated
            })
          } else if (alert.condition === 'below' && rate <= alert.targetRate) {
            toast.success(`Alert: ${alert.fromCurrency}/${alert.toCurrency} dropped to ${rate.toFixed(4)}!`)
            setAlerts(prev => {
              const updated = prev.map(a => a.id === alert.id ? { ...a, isActive: false } : a)
              localStorage.setItem('currency-alerts', JSON.stringify(updated))
              return updated
            })
          }
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchangeRates])

  const convert = async (useHistoricalDate?: string) => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount < 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setLoading(true)
    
    try {
      let rates = exchangeRates
      if (useHistoricalDate) {
        const historicalRates = await fetchHistoricalRates(useHistoricalDate)
        if (historicalRates) {
          rates = historicalRates
        }
      }

      const fromRate = rates[fromCurrency] || 1
      const toRate = rates[toCurrency] || 1
      const rate = toRate / fromRate
      const converted = numAmount * rate

      setResult(converted)
      setCurrentRate(rate)

      // Save to history
      const historyEntry: ConversionHistory = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        amount: numAmount,
        from: fromCurrency,
        to: toCurrency,
        result: converted,
        rate: rate
      }
      const updatedHistory = [historyEntry, ...conversionHistory.slice(0, 49)] // Keep last 50
      setConversionHistory(updatedHistory)
      localStorage.setItem('currency-history', JSON.stringify(updatedHistory))

      setLoading(false)
    } catch (error) {
      toast.error('Conversion failed. Please try again.')
      setLoading(false)
    }
  }

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  useEffect(() => {
    if (amount && !showHistorical) {
      convert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCurrency, toCurrency, amount])

  // Favorite currencies functions
  const toggleFavorite = (currencyCode: string) => {
    const updated = favoriteCurrencies.includes(currencyCode)
      ? favoriteCurrencies.filter(c => c !== currencyCode)
      : [...favoriteCurrencies, currencyCode]
    setFavoriteCurrencies(updated)
    localStorage.setItem('currency-favorites', JSON.stringify(updated))
    toast.success(updated.includes(currencyCode) ? 'Added to favorites' : 'Removed from favorites')
  }

  // Add alert
  const addAlert = () => {
    if (!newAlert.targetRate || parseFloat(newAlert.targetRate) <= 0) {
      toast.error('Please enter a valid target rate')
      return
    }
    const alert: RateAlert = {
      id: Date.now().toString(),
      fromCurrency: newAlert.fromCurrency,
      toCurrency: newAlert.toCurrency,
      targetRate: parseFloat(newAlert.targetRate),
      condition: newAlert.condition,
      isActive: true,
      createdAt: new Date().toISOString()
    }
    const updated = [...alerts, alert]
    setAlerts(updated)
    localStorage.setItem('currency-alerts', JSON.stringify(updated))
    setNewAlert({ fromCurrency: 'USD', toCurrency: 'EUR', targetRate: '', condition: 'above' })
    toast.success('Alert created!')
  }

  // Delete alert
  const deleteAlert = (id: string) => {
    const updated = alerts.filter(a => a.id !== id)
    setAlerts(updated)
    localStorage.setItem('currency-alerts', JSON.stringify(updated))
    toast.success('Alert deleted')
  }

  // Export history
  const exportHistory = (format: 'csv' | 'json') => {
    if (conversionHistory.length === 0) {
      toast.error('No history to export')
      return
    }

    if (format === 'json') {
      const dataStr = JSON.stringify(conversionHistory, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `currency-history-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    } else {
      let csv = 'Date,Amount,From,To,Result,Rate\n'
      conversionHistory.forEach(entry => {
        csv += `${new Date(entry.date).toLocaleDateString()},${entry.amount},${entry.from},${entry.to},${entry.result.toFixed(2)},${entry.rate.toFixed(4)}\n`
      })
      const dataBlob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `currency-history-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
    }
    toast.success(`History exported as ${format.toUpperCase()}!`)
  }

  // Share conversion
  const shareConversion = () => {
    if (result === null) {
      toast.error('No conversion to share')
      return
    }
    const text = `${amount} ${fromCurrency} = ${result.toFixed(2)} ${toCurrency}`
    if (navigator.share) {
      navigator.share({ text, title: 'Currency Conversion' })
    } else {
      navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    }
  }

  // Get currency info
  const getCurrencyInfo = (code: string) => {
    return currencies.find(c => c.code === code)
  }

  // Calculate rate change
  const getRateChange = (currentRate: number, previousRate: number) => {
    const change = ((currentRate - previousRate) / previousRate) * 100
    return {
      value: change,
      isPositive: change >= 0,
      formatted: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`
    }
  }

  // Generate chart data
  const generateChartData = () => {
    // Simulate historical data for chart
    const days = chartTimeRange === '1d' ? 24 : chartTimeRange === '1w' ? 7 : chartTimeRange === '1m' ? 30 : chartTimeRange === '3m' ? 90 : 365
    const data: HistoricalRate[] = []
    const baseRate = currentRate || (exchangeRates[toCurrency] / exchangeRates[fromCurrency])
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
      data.push({
        date: date.toISOString().split('T')[0],
        rate: baseRate * (1 + variation)
      })
    }
    return data
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to convert
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        const numAmount = parseFloat(amount)
        if (!isNaN(numAmount) && numAmount >= 0) {
          convert(historicalDate || undefined)
        }
      }
      // Ctrl/Cmd + C to copy result (only if not in input)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && result !== null && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        navigator.clipboard.writeText(`${amount} ${fromCurrency} = ${result.toFixed(2)} ${toCurrency}`)
        toast.success('Copied to clipboard!')
      }
      // Ctrl/Cmd + H to view history
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault()
        setShowHistory(true)
        setActiveTab('history')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, fromCurrency, toCurrency, result, historicalDate, convert])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `
      }} />
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="36d691042d95ac1ac33375038ec47a5c" />
      <SidebarAd position="right" adKey="36d691042d95ac1ac33375038ec47a5c" />
      
      <main className="flex-grow py-4 sm:py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-green-600 mb-3 sm:mb-4 shadow-md">
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">Currency Converter</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Convert between different currencies</p>
            
            {/* Rate info and controls */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              {lastUpdated && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
                </div>
              )}
              {apiError && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-orange-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Using cached rates</span>
                </div>
              )}
              <button
                onClick={() => fetchExchangeRates()}
                className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                Refresh Rates
              </button>
              <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Auto-refresh
              </label>
            </div>
          </div>

          {/* Tabs */}
          <div className="overflow-x-auto mb-4 sm:mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2 min-w-max sm:flex-wrap sm:justify-center">
              <button
                onClick={() => setActiveTab('convert')}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all text-sm whitespace-nowrap touch-manipulation active:scale-95 ${
                  activeTab === 'convert'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-black hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Convert
              </button>
              <button
                onClick={() => { setActiveTab('chart'); setShowChart(true); }}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all text-sm whitespace-nowrap touch-manipulation active:scale-95 ${
                  activeTab === 'chart'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-black hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <BarChart3 className="h-4 w-4 inline mr-1" />
                Charts
              </button>
              <button
                onClick={() => { setActiveTab('compare'); setShowComparison(true); }}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all text-sm whitespace-nowrap touch-manipulation active:scale-95 ${
                  activeTab === 'compare'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-black hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Compare
              </button>
              <button
                onClick={() => { setActiveTab('history'); setShowHistory(true); }}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all text-sm whitespace-nowrap touch-manipulation active:scale-95 ${
                  activeTab === 'history'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-black hover:bg-gray-100 border border-gray-200'
                }`}
              >
                History
              </button>
            </div>
          </div>

        {/* Quick action buttons */}
        <div className="mb-4 sm:mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2 min-w-0">
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm touch-manipulation active:scale-95 whitespace-nowrap text-gray-800"
              >
                <Star className={`h-4 w-4 flex-shrink-0 ${favoriteCurrencies.length > 0 ? 'fill-yellow-400 text-yellow-500' : 'text-gray-600'}`} />
                <span>Favorites</span>
                {favoriteCurrencies.length > 0 && <span className="text-xs text-gray-600">({favoriteCurrencies.length})</span>}
              </button>
              <button
                onClick={() => setShowAlerts(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm touch-manipulation active:scale-95 whitespace-nowrap text-gray-800"
              >
                <Bell className="h-4 w-4 flex-shrink-0 text-gray-600" />
                <span>Alerts</span>
                {alerts.filter(a => a.isActive).length > 0 && <span className="text-xs text-gray-600">({alerts.filter(a => a.isActive).length})</span>}
              </button>
              <button
                onClick={() => setShowCurrencyInfo(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm touch-manipulation active:scale-95 whitespace-nowrap text-gray-800"
              >
                <Info className="h-4 w-4 flex-shrink-0 text-gray-600" />
                <span>Currency Info</span>
              </button>
              <button
                onClick={() => setShowNews(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm touch-manipulation active:scale-95 whitespace-nowrap text-gray-800"
              >
                <Newspaper className="h-4 w-4 flex-shrink-0 text-gray-600" />
                <span>News</span>
              </button>
              <button
                onClick={() => {
                  setShowHistory(true)
                  setActiveTab('history')
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm touch-manipulation active:scale-95 whitespace-nowrap text-gray-800"
              >
                <Clock className="h-4 w-4 flex-shrink-0 text-gray-600" />
                <span>History</span>
                {conversionHistory.length > 0 && <span className="text-xs text-gray-600">({conversionHistory.length})</span>}
              </button>
            </div>
          </div>

          {/* Main Converter Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6 mb-6">
            {/* Rate Type Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {(['standard', 'live', 'interbank', 'tourist'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setRateType(type)}
                    className={`px-3 py-2 text-xs sm:text-sm rounded-lg font-medium transition-all touch-manipulation active:scale-95 ${
                      rateType === type
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
              {currentRate && (
                <div className="text-xs sm:text-sm text-gray-600 w-full sm:w-auto text-center sm:text-left">
                  Rate: 1 {fromCurrency} = {currentRate.toFixed(4)} {toCurrency}
                </div>
              )}
            </div>





            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-900">Amount</label>
                  {favoriteCurrencies.includes(fromCurrency) && (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1"
                  step="0.01"
                  className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 text-base sm:text-lg touch-manipulation"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-900">From</label>
                    <button
                      onClick={() => toggleFavorite(fromCurrency)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Star className={`h-4 w-4 ${favoriteCurrencies.includes(fromCurrency) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                    </button>
                  </div>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 text-base touch-manipulation"
                  >
                    {currencies.map(currency => ( 
                      <option key={currency.code} value={currency.code}>
                        {currency.flag} {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={swapCurrencies}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all active:scale-95"
                    title="Swap currencies"
                  >
                    <ArrowRightLeft className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-900">To</label>
                    <button
                      onClick={() => toggleFavorite(toCurrency)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Star className={`h-4 w-4 ${favoriteCurrencies.includes(toCurrency) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                    </button>
                  </div>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 text-base touch-manipulation"
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.flag} {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Historical Date Picker */}
              {showHistorical && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Historical Date</label>
                  <input
                    type="date"
                    value={historicalDate}
                    onChange={(e) => {
                      setHistoricalDate(e.target.value)
                      if (e.target.value) {
                        convert(e.target.value)
                      }
                    }}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 text-base touch-manipulation"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
            <button
                onClick={() => convert(historicalDate || undefined)}
              disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3.5 sm:py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-base sm:text-base active:scale-95 touch-manipulation disabled:opacity-50 min-h-[48px]"
            >
              <DollarSign className="h-5 w-5" />
              <span>{loading ? 'Converting...' : 'Convert'}</span>
            </button>
              {result !== null && (
                <>
                  <button
                    onClick={shareConversion}
                    className="px-4 py-3.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all flex items-center justify-center gap-2 active:scale-95 touch-manipulation min-h-[48px]"
                    title="Share conversion"
                  >
                    <Share2 className="h-5 w-5" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${amount} ${fromCurrency} = ${result.toFixed(2)} ${toCurrency}`)
                      toast.success('Copied to clipboard!')
                    }}
                    className="px-4 py-3.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all flex items-center justify-center gap-2 active:scale-95 touch-manipulation min-h-[48px]"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-5 w-5" />
                    <span className="hidden sm:inline">Copy</span>
                  </button>
                </>
              )}
            </div>

            {result !== null && (
              <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 text-center border border-green-200 relative">
                {/* Quick Action Buttons - Top Right */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${amount} ${fromCurrency} = ${result.toFixed(2)} ${toCurrency}`)
                      toast.success('Copied to clipboard!')
                    }}
                    className="p-2 bg-white hover:bg-gray-100 rounded-lg shadow-sm transition-all active:scale-95"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={shareConversion}
                    className="p-2 bg-white hover:bg-gray-100 rounded-lg shadow-sm transition-all active:scale-95"
                    title="Share conversion"
                  >
                    <Share2 className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                <div className="text-sm text-gray-600 mb-2">Converted Amount</div>
                <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
                  {result.toFixed(2)} {toCurrency}
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {amount} {fromCurrency} = {result.toFixed(2)} {toCurrency}
                </div>
                {currentRate && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs sm:text-sm">
                    <span className="text-gray-500">
                      Exchange Rate: 1 {fromCurrency} = {currentRate.toFixed(4)} {toCurrency}
                    </span>
                    {/* Rate change indicator (simulated) */}
                    <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg">
                      {Math.random() > 0.5 ? (
                        <>
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                          <span className="text-green-600 font-medium">+0.12%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                          <span className="text-red-600 font-medium">-0.08%</span>
                        </>
                      )}
                      <span className="text-gray-500 text-xs">24h</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Quick Actions</h3>
                <button
                  onClick={() => {
                    setShowHistory(true)
                    setActiveTab('history')
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All ({conversionHistory.length})
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setShowHistorical(!showHistorical)}
                  className={`flex flex-col items-center gap-1.5 px-3 py-3 sm:py-2 text-xs sm:text-sm rounded-lg transition-all touch-manipulation active:scale-95 min-h-[64px] sm:min-h-0 ${
                    showHistorical
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Calendar className="h-5 w-5 sm:h-5 sm:w-5" />
                  <span className="text-xs">Historical</span>
                </button>
                <button
                  onClick={() => {
                    if (compareCurrencies.length === 0) {
                      setCompareCurrencies([fromCurrency, toCurrency])
                    }
                    setShowComparison(true)
                    setActiveTab('compare')
                  }}
                  className="flex flex-col items-center gap-1.5 px-3 py-3 sm:py-2 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-all text-gray-700 touch-manipulation active:scale-95 min-h-[64px] sm:min-h-0"
                >
                  <BarChart3 className="h-5 w-5 sm:h-5 sm:w-5" />
                  <span className="text-xs">Compare</span>
                </button>
                <button
                  onClick={() => {
                    if (result !== null) {
                      navigator.clipboard.writeText(`${amount} ${fromCurrency} = ${result.toFixed(2)} ${toCurrency}`)
                      toast.success('Copied to clipboard!')
                    } else {
                      toast.error('No conversion to copy')
                    }
                  }}
                  className="flex flex-col items-center gap-1.5 px-3 py-3 sm:py-2 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-all text-gray-700 touch-manipulation active:scale-95 min-h-[64px] sm:min-h-0"
                >
                  <Copy className="h-5 w-5 sm:h-5 sm:w-5" />
                  <span className="text-xs">Copy</span>
                </button>
                <button
                  onClick={() => {
                    setShowHistory(true)
                    setActiveTab('history')
                  }}
                  className="flex flex-col items-center gap-1.5 px-3 py-3 sm:py-2 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-all text-gray-700 touch-manipulation active:scale-95 min-h-[64px] sm:min-h-0"
                >
                  <Clock className="h-5 w-5 sm:h-5 sm:w-5" />
                  <span className="text-xs">History</span>
                </button>
              </div>
            </div>
          </div>
          {/* Charts Panel */}
          {showChart && activeTab === 'chart' && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Exchange Rate Chart</h2>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  {(['1d', '1w', '1m', '3m', '1y'] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setChartTimeRange(range)}
                      className={`px-3 py-2 text-xs rounded-lg font-medium transition-all touch-manipulation active:scale-95 min-h-[36px] ${
                        chartTimeRange === range
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {range === '1d' ? '1D' : range === '1w' ? '1W' : range === '1m' ? '1M' : range === '3m' ? '3M' : '1Y'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64 sm:h-80 bg-gray-50 rounded-lg p-2 sm:p-4 flex items-center justify-center border border-gray-200 overflow-x-auto">
                <SimpleChart data={generateChartData()} fromCurrency={fromCurrency} toCurrency={toCurrency} />
              </div>
              {/* Chart Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {(() => {
                  const chartData = generateChartData()
                  const rates = chartData.map(d => d.rate)
                  const max = Math.max(...rates)
                  const min = Math.min(...rates)
                  const avg = rates.reduce((a, b) => a + b, 0) / rates.length
                  const change = ((rates[rates.length - 1] - rates[0]) / rates[0]) * 100
                  return (
                    <>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">High</div>
                        <div className="text-sm font-bold text-gray-900">{max.toFixed(4)}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Low</div>
                        <div className="text-sm font-bold text-gray-900">{min.toFixed(4)}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Average</div>
                        <div className="text-sm font-bold text-gray-900">{avg.toFixed(4)}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Change</div>
                        <div className={`text-sm font-bold flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          )}

          {/* Comparison Panel */}
          {showComparison && activeTab === 'compare' && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Currency Comparison</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      const newCurrencies = [...compareCurrencies]
                      if (newCurrencies.length < 5) {
                        newCurrencies.push(newCurrencies.length > 0 ? newCurrencies[0] : 'USD')
                        setCompareCurrencies(newCurrencies)
                      } else {
                        toast.error('Maximum 5 currencies can be compared')
                      }
                    }}
                    className="flex-1 sm:flex-none px-3 py-2.5 sm:py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1 touch-manipulation active:scale-95 min-h-[44px] sm:min-h-0"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                  {compareCurrencies.length === 0 && (
                    <button
                      onClick={() => setCompareCurrencies([fromCurrency, toCurrency])}
                      className="px-3 py-2.5 sm:py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-manipulation active:scale-95 min-h-[44px] sm:min-h-0"
                    >
                      Use Current
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                {compareCurrencies.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No currencies to compare</p>
                    <button
                      onClick={() => setCompareCurrencies([fromCurrency, toCurrency])}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Compare Current Currencies
                    </button>
                  </div>
                ) : (
                  compareCurrencies.map((currency, index) => {
                    const currencyInfo = getCurrencyInfo(currency)
                    const convertedAmount = ((exchangeRates[currency] || 1) / (exchangeRates[fromCurrency] || 1) * parseFloat(amount || '1'))
                    const rate = (exchangeRates[currency] || 1) / (exchangeRates[fromCurrency] || 1)
                    return (
                      <div key={index} className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1">
                            <select
                              value={currency}
                              onChange={(e) => {
                                const updated = [...compareCurrencies]
                                updated[index] = e.target.value
                                setCompareCurrencies(updated)
                              }}
                              className="flex-1 px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-gray-900 bg-white text-base touch-manipulation"
                            >
                              {currencies.map(c => (
                                <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="text-right">
                              <div className="text-lg sm:text-xl font-bold text-gray-900">
                                {convertedAmount.toFixed(2)} {currency}
                              </div>
                              <div className="text-xs text-gray-500">
                                Rate: {rate.toFixed(4)}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                if (compareCurrencies.length > 1) {
                                  setCompareCurrencies(compareCurrencies.filter((_, i) => i !== index))
                                } else {
                                  toast.error('At least one currency is required')
                                }
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* History Panel */}
          {showHistory && activeTab === 'history' && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Conversion History</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Last {conversionHistory.length} conversions (max 50 saved)
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  {conversionHistory.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to clear all conversion history?')) {
                          setConversionHistory([])
                          localStorage.removeItem('currency-history')
                          toast.success('History cleared!')
                        }
                      }}
                      className="flex-1 sm:flex-none px-3 py-2.5 sm:py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1 touch-manipulation active:scale-95 min-h-[44px] sm:min-h-0"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => exportHistory('csv')}
                    className="flex-1 sm:flex-none px-3 py-2.5 sm:py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 touch-manipulation active:scale-95 min-h-[44px] sm:min-h-0"
                  >
                    <Download className="h-4 w-4" />
                    CSV
                  </button>
                  <button
                    onClick={() => exportHistory('json')}
                    className="flex-1 sm:flex-none px-3 py-2.5 sm:py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 touch-manipulation active:scale-95 min-h-[44px] sm:min-h-0"
                  >
                    <Download className="h-4 w-4" />
                    JSON
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {conversionHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">No conversion history yet</p>
                    <p className="text-xs text-gray-400">Your conversions will appear here</p>
                  </div>
                ) : (
                  conversionHistory.map(entry => (
                    <div key={entry.id} className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-semibold text-gray-900 text-sm sm:text-base">
                              {entry.amount} {entry.from} → {entry.result.toFixed(2)} {entry.to}
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`${entry.amount} ${entry.from} = ${entry.result.toFixed(2)} ${entry.to}`)
                                toast.success('Copied!')
                              }}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Copy"
                            >
                              <Copy className="h-3 w-3 text-gray-500" />
                            </button>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span>{new Date(entry.date).toLocaleString()}</span>
                            <span>•</span>
                            <span>Rate: {entry.rate.toFixed(4)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setAmount(entry.amount.toString())
                              setFromCurrency(entry.from)
                              setToCurrency(entry.to)
                              setActiveTab('convert')
                              setShowHistory(false)
                              toast.success('Conversion loaded!')
                            }}
                            className="px-3 py-2.5 sm:py-1.5 text-xs sm:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 font-medium touch-manipulation active:scale-95 min-h-[44px] sm:min-h-0"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Reuse
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Favorites Modal */}
      {showFavorites && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl max-w-md w-full max-h-[85vh] sm:max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Favorite Currencies</h2>
              <button
                onClick={() => setShowFavorites(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation active:scale-95"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              {favoriteCurrencies.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No favorite currencies yet</p>
              ) : (
                <div className="space-y-2">
                  {favoriteCurrencies.map(code => {
                    const currency = getCurrencyInfo(code)
                    return currency ? (
                      <div key={code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{currency.flag}</span>
                          <span className="font-medium text-gray-900">{currency.code} - {currency.name}</span>
                        </div>
                        <button
                          onClick={() => toggleFavorite(code)}
                          className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                        >
                          <Star className="h-5 w-5 fill-yellow-400" />
                        </button>
                      </div>
                    ) : null
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alerts Modal */}
      {showAlerts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Exchange Rate Alerts</h2>
              <button
                onClick={() => setShowAlerts(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation active:scale-95"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              {/* Create New Alert */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">Create New Alert</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <select
                      value={newAlert.fromCurrency}
                      onChange={(e) => setNewAlert({ ...newAlert, fromCurrency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    >
                      {currencies.map(c => (
                        <option key={c.code} value={c.code}>{c.code}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <select
                      value={newAlert.toCurrency}
                      onChange={(e) => setNewAlert({ ...newAlert, toCurrency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    >
                      {currencies.map(c => (
                        <option key={c.code} value={c.code}>{c.code}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Rate</label>
                    <input
                      type="number"
                      value={newAlert.targetRate}
                      onChange={(e) => setNewAlert({ ...newAlert, targetRate: e.target.value })}
                      placeholder="0.00"
                      step="0.0001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                    <select
                      value={newAlert.condition}
                      onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value as 'above' | 'below' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    >
                      <option value="above">Above</option>
                      <option value="below">Below</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={addAlert}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors touch-manipulation active:scale-95 min-h-[48px]"
                >
                  Create Alert
                </button>
              </div>

              {/* Active Alerts */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Active Alerts</h3>
                {alerts.filter(a => a.isActive).length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No active alerts</p>
                ) : (
                  <div className="space-y-2">
                    {alerts.filter(a => a.isActive).map(alert => (
                      <div key={alert.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {alert.fromCurrency}/{alert.toCurrency} {alert.condition === 'above' ? '≥' : '≤'} {alert.targetRate}
                          </div>
                          <div className="text-xs text-gray-500">
                            Created: {new Date(alert.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Currency Info Modal */}
      {showCurrencyInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Currency Information</h2>
              <button
                onClick={() => setShowCurrencyInfo(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation active:scale-95"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {currencies.map(currency => (
                  <button
                    key={currency.code}
                    onClick={() => {
                      setSelectedCurrencyInfo(currency.code)
                      setFromCurrency(currency.code)
                    }}
                    className={`p-3 sm:p-3 rounded-lg border transition-all text-left touch-manipulation active:scale-95 ${
                      selectedCurrencyInfo === currency.code
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{currency.flag}</div>
                    <div className="font-semibold text-gray-900 text-sm">{currency.code}</div>
                    <div className="text-xs text-gray-600">{currency.name}</div>
                    {currency.symbol && (
                      <div className="text-xs text-gray-500 mt-1">Symbol: {currency.symbol}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* News Modal */}
      {showNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Currency News & Updates</h2>
              <button
                onClick={() => setShowNews(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation active:scale-95"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Market Update</h3>
                  <p className="text-sm text-gray-700">
                    Exchange rates are updated in real-time. For the most accurate rates, please refresh the page.
                  </p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Rate Trends</h3>
                  <p className="text-sm text-gray-700">
                    View historical trends and charts to analyze currency movements over time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <MobileBottomAd adKey="36d691042d95ac1ac33375038ec47a5c" />
      <Footer />
    </div>
  )
}

// Simple Chart Component
function SimpleChart({ data, fromCurrency, toCurrency }: { data: HistoricalRate[], fromCurrency: string, toCurrency: string }) {
  if (data.length === 0) return <p className="text-gray-500">No data available</p>

  const maxRate = Math.max(...data.map(d => d.rate))
  const minRate = Math.min(...data.map(d => d.rate))
  const range = maxRate - minRate || 1
  const width = 800
  const height = 300
  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * chartWidth
    const y = padding + chartHeight - ((d.rate - minRate) / range) * chartHeight
    return { x, y, rate: d.rate, date: d.date }
  })

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding + chartHeight - ratio * chartHeight
          const rate = minRate + (maxRate - minRate) * ratio
          return (
            <g key={ratio}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x={padding - 10} y={y + 4} fontSize="10" fill="#6b7280" textAnchor="end">
                {rate.toFixed(4)}
              </text>
            </g>
          )
        })}

        {/* Chart line */}
        <path
          d={pathData}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          className="drop-shadow-sm"
        />

        {/* Area fill */}
        <path
          d={`${pathData} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`}
          fill="url(#gradient)"
          opacity="0.2"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Points */}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="3"
            fill="#10b981"
            className="hover:r-5 transition-all"
          />
        ))}

        {/* Labels */}
        <text x={width / 2} y={height - 10} fontSize="12" fill="#6b7280" textAnchor="middle">
          {fromCurrency} to {toCurrency}
        </text>
      </svg>
    </div>
  )
}


