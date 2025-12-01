'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Key, Copy, Check, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    let charset = ''
    if (includeUppercase) charset += uppercase
    if (includeLowercase) charset += lowercase
    if (includeNumbers) charset += numbers
    if (includeSymbols) charset += symbols

    if (!charset) {
      toast.error('Please select at least one character type')
      return
    }

    let generated = ''
    for (let i = 0; i < length; i++) {
      generated += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    
    setPassword(generated)
    setCopied(false)
  }

  const copyToClipboard = () => {
    if (!password) return
    navigator.clipboard.writeText(password)
    setCopied(true)
    toast.success('Password copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const getStrength = () => {
    if (!password) return { level: 0, text: '', color: '' }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (password.length >= 16) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++

    if (strength <= 2) return { level: strength, text: 'Weak', color: 'bg-red-500' }
    if (strength <= 4) return { level: strength, text: 'Medium', color: 'bg-yellow-500' }
    return { level: strength, text: 'Strong', color: 'bg-green-500' }
  }

  const strength = getStrength()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 mb-3 sm:mb-4">
              <Key className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Password Generator</h1>
            <p className="text-sm sm:text-base text-gray-600 px-4">Generate strong, secure passwords instantly</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Password Length: {length}</label>
                <span className="text-xs text-gray-500">{length} characters</span>
              </div>
              <input
                type="range"
                min="4"
                max="64"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-3">Include:</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeUppercase}
                    onChange={(e) => setIncludeUppercase(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Uppercase Letters (A-Z)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeLowercase}
                    onChange={(e) => setIncludeLowercase(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Lowercase Letters (a-z)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Numbers (0-9)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSymbols}
                    onChange={(e) => setIncludeSymbols(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Symbols (!@#$%...)</span>
                </label>
              </div>
            </div>

            <button
              onClick={generatePassword}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95 touch-manipulation"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Generate Password</span>
            </button>

            {password && (
              <>
                <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Generated Password</span>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span className="text-sm">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span className="text-sm">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-lg sm:text-xl font-semibold text-gray-900 break-all select-all">
                    {password}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Password Strength</span>
                    <span className={`text-sm font-semibold ${strength.color.replace('bg-', 'text-')}`}>
                      {strength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${strength.color}`}
                      style={{ width: `${(strength.level / 6) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

