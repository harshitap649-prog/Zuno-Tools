'use client'

import { useState } from 'react'
import Footer from '@/components/Footer'
import { Calendar, Sparkles } from 'lucide-react'

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState('')
  const [result, setResult] = useState<{
    years: number
    months: number
    days: number
    totalDays: number
    totalMonths: number
    totalWeeks: number
  } | null>(null)

  const calculateAge = () => {
    if (!birthDate) {
      alert('Please enter your birth date')
      return
    }

    const birth = new Date(birthDate)
    const today = new Date()

    if (birth > today) {
      alert('Birth date cannot be in the future')
      return
    }

    let years = today.getFullYear() - birth.getFullYear()
    let months = today.getMonth() - birth.getMonth()
    let days = today.getDate() - birth.getDate()

    if (days < 0) {
      months--
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      days += lastMonth.getDate()
    }

    if (months < 0) {
      years--
      months += 12
    }

    const diffTime = Math.abs(today.getTime() - birth.getTime())
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const totalMonths = years * 12 + months
    const totalWeeks = Math.floor(totalDays / 7)

    setResult({
      years,
      months,
      days,
      totalDays,
      totalMonths,
      totalWeeks,
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
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 mb-3 sm:mb-4">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Age Calculator</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Calculate your exact age from your birthdate</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Birth Date</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            </div>

            <button
              onClick={calculateAge}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95 touch-manipulation"
            >
              <Calendar className="h-5 w-5" />
              <span>Calculate Age</span>
            </button>

            {result && (
              <div className="mt-6 space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Your Age</h2>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-blue-600">{result.years}</div>
                      <div className="text-sm text-gray-600">Years</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-blue-600">{result.months}</div>
                      <div className="text-sm text-gray-600">Months</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-blue-600">{result.days}</div>
                      <div className="text-sm text-gray-600">Days</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{result.totalDays.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Days</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{result.totalMonths.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Months</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{result.totalWeeks.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Weeks</div>
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

