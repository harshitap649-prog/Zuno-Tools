'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Calendar } from 'lucide-react'

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState('')
  const [age, setAge] = useState<{ years: number; months: number; days: number; totalDays: number } | null>(null)

  const calculateAge = () => {
    if (!birthDate) return

    const birth = new Date(birthDate)
    const today = new Date()

    if (birth > today) {
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

    const totalDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))

    setAge({ years, months, days, totalDays })
  }

  const reset = () => {
    setBirthDate('')
    setAge(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Age Calculator</h1>
            <p className="text-gray-600">Calculate your age from birthdate</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Birth Date
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                onBlur={calculateAge}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={calculateAge}
              disabled={!birthDate}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Calculate Age
            </button>

            {age && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-2">Your Age</p>
                  <p className="text-5xl font-bold text-gray-900 mb-2">
                    {age.years}
                  </p>
                  <p className="text-lg text-gray-600">
                    {age.years} {age.years === 1 ? 'year' : 'years'}, {age.months} {age.months === 1 ? 'month' : 'months'}, {age.days} {age.days === 1 ? 'day' : 'days'}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-purple-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{age.years}</p>
                    <p className="text-sm text-gray-600">Years</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{age.months}</p>
                    <p className="text-sm text-gray-600">Months</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{age.days}</p>
                    <p className="text-sm text-gray-600">Days</p>
                  </div>
                </div>
                <div className="text-center mt-4 pt-4 border-t border-purple-200">
                  <p className="text-sm text-gray-600">Total Days</p>
                  <p className="text-2xl font-bold text-gray-900">{age.totalDays.toLocaleString()}</p>
                </div>
              </div>
            )}

            <button
              onClick={reset}
              className="w-full text-gray-600 hover:text-gray-900 py-2"
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


