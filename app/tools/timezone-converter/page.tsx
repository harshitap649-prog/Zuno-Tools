'use client'

import { useState, useEffect, useMemo } from 'react'
import Footer from '@/components/Footer'
import SidebarAd from '@/components/SidebarAd'
import MobileBottomAd from '@/components/MobileBottomAd'
import { 
  Clock, Copy, Check, Search, Globe, RefreshCw, ArrowLeftRight,
  Sun, Moon, MapPin
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Timezone {
  value: string
  label: string
  region: string
}

export default function TimezoneConverter() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16))
  const [fromTimezone, setFromTimezone] = useState('UTC')
  const [toTimezone, setToTimezone] = useState('America/New_York')
  const [hourFormat, setHourFormat] = useState<'12' | '24'>('24')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'convert' | 'world-clock'>('convert')
  const [copied, setCopied] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every second for world clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const timezones: Timezone[] = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)', region: 'Global' },
    { value: 'America/New_York', label: 'America/New_York (EST/EDT)', region: 'North America' },
    { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)', region: 'North America' },
    { value: 'America/Denver', label: 'America/Denver (MST/MDT)', region: 'North America' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT)', region: 'North America' },
    { value: 'America/Toronto', label: 'America/Toronto (EST/EDT)', region: 'North America' },
    { value: 'America/Mexico_City', label: 'America/Mexico_City (CST/CDT)', region: 'North America' },
    { value: 'Europe/London', label: 'Europe/London (GMT/BST)', region: 'Europe' },
    { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)', region: 'Europe' },
    { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST)', region: 'Europe' },
    { value: 'Europe/Madrid', label: 'Europe/Madrid (CET/CEST)', region: 'Europe' },
    { value: 'Europe/Rome', label: 'Europe/Rome (CET/CEST)', region: 'Europe' },
    { value: 'Europe/Moscow', label: 'Europe/Moscow (MSK)', region: 'Europe' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)', region: 'Asia' },
    { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)', region: 'Asia' },
    { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)', region: 'Asia' },
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)', region: 'Asia' },
    { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)', region: 'Asia' },
    { value: 'Asia/Hong_Kong', label: 'Asia/Hong_Kong (HKT)', region: 'Asia' },
    { value: 'Asia/Seoul', label: 'Asia/Seoul (KST)', region: 'Asia' },
    { value: 'Australia/Sydney', label: 'Australia/Sydney (AEDT/AEST)', region: 'Oceania' },
    { value: 'Australia/Melbourne', label: 'Australia/Melbourne (AEDT/AEST)', region: 'Oceania' },
    { value: 'Pacific/Auckland', label: 'Pacific/Auckland (NZDT/NZST)', region: 'Oceania' },
    { value: 'Africa/Cairo', label: 'Africa/Cairo (EET)', region: 'Africa' },
    { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (SAST)', region: 'Africa' },
  ]

  // Common timezone presets
  const commonTimezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'New York' },
    { value: 'America/Los_Angeles', label: 'Los Angeles' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Asia/Shanghai', label: 'Shanghai' },
    { value: 'Asia/Kolkata', label: 'Mumbai' },
    { value: 'Australia/Sydney', label: 'Sydney' },
  ]

  // Filter timezones based on search
  const filteredTimezones = useMemo(() => {
    if (!searchQuery.trim()) return timezones
    const query = searchQuery.toLowerCase()
    return timezones.filter(tz => 
      tz.label.toLowerCase().includes(query) ||
      tz.value.toLowerCase().includes(query) ||
      tz.region.toLowerCase().includes(query)
    )
  }, [searchQuery])

  // World clock - popular timezones
  const worldClockTimezones = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney',
  ]

  const formatTime = (date: Date, timezone: string, format: '12' | '24' = '24') => {
    try {
      return date.toLocaleString('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: format === '12',
      })
    } catch (error) {
      return 'Invalid timezone'
    }
  }

  const convertTime = () => {
    try {
      const localDate = new Date(date)
      const fromTime = new Date(localDate.toLocaleString('en-US', { timeZone: fromTimezone }))
      const toTime = new Date(localDate.toLocaleString('en-US', { timeZone: toTimezone }))
      
      const offset = toTime.getTime() - fromTime.getTime()
      const result = new Date(localDate.getTime() + offset)
      
      return formatTime(result, toTimezone, hourFormat)
    } catch (error) {
      return 'Invalid date/time'
    }
  }

  const getTimeDifference = () => {
    try {
      const now = new Date()
      const fromTime = new Date(now.toLocaleString('en-US', { timeZone: fromTimezone }))
      const toTime = new Date(now.toLocaleString('en-US', { timeZone: toTimezone }))
      const diff = (toTime.getTime() - fromTime.getTime()) / (1000 * 60 * 60) // hours
      return diff
    } catch (error) {
      return 0
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard!', { icon: '📋', duration: 2000 })
    setTimeout(() => setCopied(false), 2000)
  }

  const swapTimezones = () => {
    const temp = fromTimezone
    setFromTimezone(toTimezone)
    setToTimezone(temp)
    toast.success('Timezones swapped!', { duration: 2000 })
  }

  const setToCurrentTime = () => {
    setDate(new Date().toISOString().slice(0, 16))
    toast.success('Set to current time!', { duration: 2000 })
  }

  const selectPreset = (timezone: string, type: 'from' | 'to') => {
    if (type === 'from') {
      setFromTimezone(timezone)
    } else {
      setToTimezone(timezone)
    }
    toast.success(`Timezone set to ${timezones.find(tz => tz.value === timezone)?.label}`, { duration: 2000 })
  }

  const timeDifference = getTimeDifference()
  const convertedTime = convertTime()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SidebarAd position="left" adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      <SidebarAd position="right" adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      <main className="flex-grow py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="relative inline-flex items-center justify-center mb-3 sm:mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
              <div className="relative inline-flex p-2 sm:p-3 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 shadow-lg">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">
              Time Zone Converter
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-4">Convert time between different time zones</p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="inline-flex bg-white rounded-xl p-1 shadow-lg border-2 border-gray-200">
              <button
                onClick={() => setViewMode('convert')}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold text-sm sm:text-base transition-all flex items-center gap-2 ${
                  viewMode === 'convert'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span>Converter</span>
              </button>
              <button
                onClick={() => setViewMode('world-clock')}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold text-sm sm:text-base transition-all flex items-center gap-2 ${
                  viewMode === 'world-clock'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Globe className="h-4 w-4" />
                <span>World Clock</span>
              </button>
            </div>
          </div>

          {viewMode === 'convert' ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Converter Card */}
              <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 rounded-xl sm:rounded-2xl shadow-xl border-2 border-blue-200 p-4 sm:p-6 md:p-8">
                {/* Quick Actions */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <button
                    onClick={setToCurrentTime}
                    className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all flex items-center gap-2 text-xs sm:text-sm"
                  >
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Now</span>
                  </button>
                  <button
                    onClick={swapTimezones}
                    className="px-3 sm:px-4 py-2 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-all flex items-center gap-2 text-xs sm:text-sm"
                  >
                    <ArrowLeftRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Swap</span>
                  </button>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => setHourFormat('12')}
                      className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                        hourFormat === '12'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      12h
                    </button>
                    <button
                      onClick={() => setHourFormat('24')}
                      className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                        hourFormat === '24'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      24h
                    </button>
                  </div>
                </div>

                {/* Date & Time Input */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                  />
                </div>

                {/* Timezone Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">From Timezone</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search timezones..."
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 mb-2 text-gray-900 font-medium text-sm"
                      />
                    </div>
                    <select
                      value={fromTimezone}
                      onChange={(e) => setFromTimezone(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                    >
                      {filteredTimezones.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">To Timezone</label>
                    <select
                      value={toTimezone}
                      onChange={(e) => setToTimezone(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                    >
                      {filteredTimezones.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Quick Select</label>
                  <div className="flex flex-wrap gap-2">
                    {commonTimezones.map((tz) => (
                      <button
                        key={tz.value}
                        onClick={() => {
                          if (fromTimezone !== tz.value) {
                            selectPreset(tz.value, 'from')
                          } else {
                            selectPreset(tz.value, 'to')
                          }
                        }}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                          fromTimezone === tz.value || toTimezone === tz.value
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {tz.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Difference */}
                {timeDifference !== 0 && (
                  <div className="mb-4 sm:mb-6 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                    <div className="text-sm font-semibold text-gray-900">
                      Time Difference: <span className="text-yellow-700">{timeDifference > 0 ? '+' : ''}{timeDifference.toFixed(1)} hours</span>
                    </div>
                  </div>
                )}

                {/* Converted Time Result */}
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-xl p-4 sm:p-6 border-2 border-blue-200 relative">
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => copyToClipboard(`${convertedTime} (${toTimezone})`)}
                      className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-all"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 font-medium">Converted Time</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-all">
                      {convertedTime}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">{toTimezone}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* World Clock View */
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 rounded-xl sm:rounded-2xl shadow-xl border-2 border-blue-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    World Clock
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setHourFormat('12')}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                        hourFormat === '12'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      12h
                    </button>
                    <button
                      onClick={() => setHourFormat('24')}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                        hourFormat === '24'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      24h
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {worldClockTimezones.map((tz) => {
                    const time = formatTime(currentTime, tz, hourFormat)
                    const tzInfo = timezones.find(t => t.value === tz)
                    return (
                      <div
                        key={tz}
                        className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-blue-300 transition-all hover:shadow-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <span className="text-xs sm:text-sm font-semibold text-gray-900">{tzInfo?.label.split('(')[0].trim() || tz}</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(`${time} (${tz})`)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-all"
                            title="Copy time"
                          >
                            <Copy className="h-3 w-3 text-gray-500" />
                          </button>
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-gray-900">{time}</div>
                        <div className="text-xs text-gray-500 mt-1">{tz}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <MobileBottomAd adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      <Footer />
    </div>
  )
}
