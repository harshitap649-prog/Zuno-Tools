'use client'

import { useState } from 'react'
import CryptoJS from 'crypto-js'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Lock, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function HashGenerator() {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const generateHash = (algorithm: string) => {
    if (!text.trim()) return ''
    
    switch (algorithm) {
      case 'md5':
        return CryptoJS.MD5(text).toString()
      case 'sha1':
        return CryptoJS.SHA1(text).toString()
      case 'sha256':
        return CryptoJS.SHA256(text).toString()
      case 'sha512':
        return CryptoJS.SHA512(text).toString()
      default:
        return ''
    }
  }

  const copyToClipboard = (hash: string, type: string) => {
    navigator.clipboard.writeText(hash)
    setCopied(type)
    toast.success('Hash copied to clipboard!')
    setTimeout(() => setCopied(null), 2000)
  }

  const hashes = [
    { id: 'md5', name: 'MD5', description: '128-bit hash' },
    { id: 'sha1', name: 'SHA-1', description: '160-bit hash' },
    { id: 'sha256', name: 'SHA-256', description: '256-bit hash' },
    { id: 'sha512', name: 'SHA-512', description: '512-bit hash' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 mb-3 sm:mb-4">
              <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Hash Generator</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Generate MD5, SHA-1, SHA-256, and SHA-512 hashes</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Input Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to generate hash..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hashes.map((hash) => {
                const hashValue = generateHash(hash.id)
                return (
                  <div key={hash.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{hash.name}</h3>
                        <p className="text-xs text-gray-900">{hash.description}</p>
                      </div>
                      {hashValue && (
                        <button
                          onClick={() => copyToClipboard(hashValue, hash.id)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          {copied === hash.id ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <Copy className="h-5 w-5" />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded p-3 min-h-[80px]">
                      <p className="text-xs font-mono text-gray-900 break-all">
                        {hashValue || 'Hash will appear here...'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

