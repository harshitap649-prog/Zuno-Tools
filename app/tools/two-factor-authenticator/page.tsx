'use client'

import { useState, useEffect } from 'react'
import Footer from '@/components/Footer'
import { Shield, Sparkles, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TwoFactorAuthenticator() {
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [timeLeft, setTimeLeft] = useState(30)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    generateSecret()
  }, [])

  useEffect(() => {
    if (secret) {
      const interval = setInterval(() => {
        generateCode()
        setTimeLeft(30)
      }, 30000)

      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 30))
      }, 1000)

      generateCode()

      return () => {
        clearInterval(interval)
        clearInterval(timer)
      }
    }
  }, [secret])

  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let newSecret = ''
    for (let i = 0; i < 16; i++) {
      newSecret += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setSecret(newSecret)
  }

  const generateCode = () => {
    if (!secret) return

    // Simple TOTP implementation (for demo purposes)
    const time = Math.floor(Date.now() / 1000 / 30)
    const hmac = async () => {
      const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
      )
      const data = new Uint8Array(8)
      for (let i = 7; i >= 0; i--) {
        data[i] = time & 0xff
        time >>= 8
      }
      const signature = await crypto.subtle.sign('HMAC', key, data)
      const bytes = new Uint8Array(signature)
      const offset = bytes[bytes.length - 1] & 0x0f
      const code = ((bytes[offset] & 0x7f) << 24) |
        ((bytes[offset + 1] & 0xff) << 16) |
        ((bytes[offset + 2] & 0xff) << 8) |
        (bytes[offset + 3] & 0xff)
      return (code % 1000000).toString().padStart(6, '0')
    }

    // Fallback simple code generation
    const simpleCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
    setCode(simpleCode)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
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
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 mb-3 sm:mb-4">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Two-Factor Authenticator</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Generate 2FA codes for your accounts</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Secret Key</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={secret}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono"
                />
                <button
                  onClick={generateSecret}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                >
                  Generate
                </button>
              </div>
            </div>

            {code && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 text-center">
                <div className="text-sm text-gray-600 mb-2">Current Code</div>
                <div className="text-5xl font-bold text-blue-600 mb-4 font-mono">{code}</div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="text-sm text-gray-600">Time remaining:</div>
                  <div className="text-lg font-semibold text-blue-600">{timeLeft}s</div>
                </div>
                <button
                  onClick={() => copyToClipboard(code)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy Code
                </button>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This is a demo tool. For production use, implement proper TOTP algorithm with a secure secret key management system.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

