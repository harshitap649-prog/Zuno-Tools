'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Clock } from 'lucide-react'

export default function TimezoneConverter() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16))
  const [fromTimezone, setFromTimezone] = useState('UTC')
  const [toTimezone, setToTimezone] = useState('America/New_York')

  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
    { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' },
    { value: 'America/Denver', label: 'America/Denver (MST/MDT)' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT)' },
    { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
    { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
    { value: 'Australia/Sydney', label: 'Australia/Sydney (AEDT/AEST)' },
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  ]

  const convertTime = () => {
    try {
      const localDate = new Date(date)
      const fromTime = new Date(localDate.toLocaleString('en-US', { timeZone: fromTimezone }))
      const toTime = new Date(localDate.toLocaleString('en-US', { timeZone: toTimezone }))
      
      const offset = toTime.getTime() - fromTime.getTime()
      const result = new Date(localDate.getTime() + offset)
      
      return result.toLocaleString('en-US', {
        timeZone: toTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    } catch (error) {
      return 'Invalid date/time'
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 mb-3 sm:mb-4">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Time Zone Converter</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Convert time between different time zones</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Date & Time</label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">From Timezone</label>
                <select
                  value={fromTimezone}
                  onChange={(e) => setFromTimezone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">To Timezone</label>
                <select
                  value={toTimezone}
                  onChange={(e) => setToTimezone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
              <div className="text-center">
                <p className="text-sm text-gray-900 mb-2">Converted Time</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {convertTime()}
                </p>
                <p className="text-sm text-gray-900 mt-2">{toTimezone}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

