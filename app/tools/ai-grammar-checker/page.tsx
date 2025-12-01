'use client'

import { useState } from 'react'
import Footer from '@/components/Footer'
import { Languages, Sparkles, Wand2, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AIGrammarChecker() {
  const [text, setText] = useState('')
  const [checkedText, setCheckedText] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const checkGrammar = async () => {
    if (!text.trim()) {
      toast.error('Please enter text to check')
      return
    }

    setLoading(true)
    toast.info('Grammar checking requires an API key. This is a demo interface.')
    
    // Simulate API call
    setTimeout(() => {
      setCheckedText(text) // In production, this would be the corrected text
      setSuggestions([
        'Consider using active voice',
        'Check for subject-verb agreement',
        'Review punctuation',
      ])
      setLoading(false)
      toast.success('Grammar check complete! (Demo mode)')
    }, 2000)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(checkedText || text)
    setCopied(true)
    toast.success('Text copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <Languages className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">AI Grammar Checker</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Check and improve your grammar with AI</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Enter Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or type your text here to check for grammar errors..."
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            </div>

            <button
              onClick={checkGrammar}
              disabled={loading || !text.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wand2 className="h-5 w-5" />
              <span>{loading ? 'Checking...' : 'Check Grammar'}</span>
            </button>

            {checkedText && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">Corrected Text</h3>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">{checkedText}</p>
                </div>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Suggestions</h3>
                <ul className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-700">• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This tool requires integration with an AI API (e.g., OpenAI GPT, Grammarly API). Add your API key in the backend to enable grammar checking.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

