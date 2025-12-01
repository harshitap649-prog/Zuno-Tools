'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Link as LinkIcon, Copy, Check, ArrowLeftRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function URLEncoder() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [copied, setCopied] = useState(false)

  const encode = () => {
    try {
      const encoded = encodeURIComponent(input)
      setOutput(encoded)
      toast.success('Encoded successfully!')
    } catch (error) {
      toast.error('Failed to encode')
    }
  }

  const decode = () => {
    try {
      const decoded = decodeURIComponent(input)
      setOutput(decoded)
      toast.success('Decoded successfully!')
    } catch (error) {
      toast.error('Invalid URL encoded string')
    }
  }

  const handleConvert = () => {
    if (!input.trim()) {
      toast.error('Please enter some text')
      return
    }
    if (mode === 'encode') {
      encode()
    } else {
      decode()
    }
  }

  const copyToClipboard = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const swapMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode')
    setInput(output)
    setOutput(input)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 mb-3 sm:mb-4">
              <LinkIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">URL Encoder/Decoder</h1>
            <p className="text-sm sm:text-base text-gray-600 px-4">Encode and decode URL strings</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div className="flex justify-center">
              <div className="inline-flex rounded-lg border-2 border-gray-200 p-1">
                <button
                  onClick={() => setMode('encode')}
                  className={`px-6 py-2 rounded-md font-semibold transition-all ${
                    mode === 'encode'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Encode
                </button>
                <button
                  onClick={() => setMode('decode')}
                  className={`px-6 py-2 rounded-md font-semibold transition-all ${
                    mode === 'decode'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Decode
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mode === 'encode' ? 'Text to Encode' : 'URL to Decode'}
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter URL encoded string...'}
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {mode === 'encode' ? 'Encoded Result' : 'Decoded Result'}
                  </label>
                  {output && (
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span className="text-xs">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span className="text-xs">Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <textarea
                  value={output}
                  readOnly
                  placeholder="Result will appear here..."
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 resize-none font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleConvert}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95 touch-manipulation"
              >
                <ArrowLeftRight className="h-5 w-5" />
                <span>{mode === 'encode' ? 'Encode' : 'Decode'}</span>
              </button>
              <button
                onClick={swapMode}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95 touch-manipulation"
              >
                <ArrowLeftRight className="h-5 w-5" />
                <span>Swap</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

