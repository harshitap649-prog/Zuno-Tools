'use client'

import { useState } from 'react'
import Footer from '@/components/Footer'
import { Lock, Sparkles, Eye, EyeOff } from 'lucide-react'

export default function PasswordStrengthChecker() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const checkStrength = (pwd: string) => {
    let strength = 0
    const checks = {
      length: pwd.length >= 8,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      numbers: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
      long: pwd.length >= 12,
    }

    if (checks.length) strength++
    if (checks.lowercase) strength++
    if (checks.uppercase) strength++
    if (checks.numbers) strength++
    if (checks.special) strength++
    if (checks.long) strength++

    let level = 'Very Weak'
    let color = 'bg-red-500'
    let percentage = 0

    if (strength <= 1) {
      level = 'Very Weak'
      color = 'bg-red-500'
      percentage = 16
    } else if (strength === 2) {
      level = 'Weak'
      color = 'bg-orange-500'
      percentage = 33
    } else if (strength === 3) {
      level = 'Fair'
      color = 'bg-yellow-500'
      percentage = 50
    } else if (strength === 4) {
      level = 'Good'
      color = 'bg-blue-500'
      percentage = 66
    } else if (strength === 5) {
      level = 'Strong'
      color = 'bg-green-500'
      percentage = 83
    } else {
      level = 'Very Strong'
      color = 'bg-green-600'
      percentage = 100
    }

    return { level, color, percentage, checks, strength }
  }

  const result = password ? checkStrength(password) : null

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
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 mb-3 sm:mb-4">
              <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Password Strength Checker</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Check the strength of your password</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password to check"
                  className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {result && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Strength: {result.level}</span>
                    <span className="text-sm font-medium text-gray-700">{result.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${result.color}`}
                      style={{ width: `${result.percentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-gray-900 mb-2">Password Requirements:</h3>
                  <div className="space-y-2">
                    <div className={`flex items-center space-x-2 ${result.checks.length ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${result.checks.length ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                      <span className="text-sm">At least 8 characters</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${result.checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${result.checks.lowercase ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                      <span className="text-sm">Contains lowercase letters</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${result.checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${result.checks.uppercase ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                      <span className="text-sm">Contains uppercase letters</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${result.checks.numbers ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${result.checks.numbers ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                      <span className="text-sm">Contains numbers</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${result.checks.special ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${result.checks.special ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                      <span className="text-sm">Contains special characters</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${result.checks.long ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${result.checks.long ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                      <span className="text-sm">At least 12 characters (recommended)</span>
                    </div>
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

