'use client'

import { useState } from 'react'
import Footer from '@/components/Footer'
import { Hash, Copy, Check, RefreshCw, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UUIDGenerator() {
  const [count, setCount] = useState(1)
  const [uuids, setUuids] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  const generateUUIDs = () => {
    const newUUIDs: string[] = []
    for (let i = 0; i < count; i++) {
      newUUIDs.push(generateUUID())
    }
    setUuids(newUUIDs)
    toast.success(`Generated ${count} UUID${count > 1 ? 's' : ''}!`)
  }

  const copyToClipboard = (uuid?: string) => {
    const textToCopy = uuid || uuids.join('\n')
    navigator.clipboard.writeText(textToCopy)
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
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 mb-3 sm:mb-4">
              <Hash className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">UUID Generator</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Generate unique identifiers (UUID v4)</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 w-full sm:w-auto">
                <label className="block text-sm font-medium text-gray-900 mb-2">Number of UUIDs</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
              </div>
              <button
                onClick={generateUUIDs}
                className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95 touch-manipulation"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Generate</span>
              </button>
            </div>

            {uuids.length > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Generated UUIDs</h2>
                  <button
                    onClick={() => copyToClipboard()}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                  >
                    {copied ? (
                      <>
                        <Check className="h-5 w-5" />
                        <span className="text-sm">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-5 w-5" />
                        <span className="text-sm">Copy All</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    {uuids.map((uuid, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded border border-gray-200 hover:border-primary-300 transition-colors"
                      >
                        <code className="text-sm font-mono text-gray-900 flex-1">{uuid}</code>
                        <button
                          onClick={() => copyToClipboard(uuid)}
                          className="ml-3 text-gray-400 hover:text-primary-600 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
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

