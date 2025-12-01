'use client'

import { useState } from 'react'
import Footer from '@/components/Footer'
import { RotateCcw, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TextReverser() {
  const [text, setText] = useState('')
  const [reversedText, setReversedText] = useState('')
  const [copied, setCopied] = useState(false)

  const reverseText = () => {
    if (!text.trim()) {
      toast.error('Please enter some text')
      return
    }
    setReversedText(text.split('').reverse().join(''))
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(reversedText)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const reset = () => {
    setText('')
    setReversedText('')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 mb-4">
              <RotateCcw className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Text Reverser</h1>
            <p className="text-gray-900">Reverse text order instantly</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Enter Text
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste text here..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            <button
              onClick={reverseText}
              disabled={!text.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <RotateCcw className="h-5 w-5" />
              <span>Reverse Text</span>
            </button>

            {reversedText && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Reversed Text
                  </label>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                  >
                    {copied ? (
                      <>
                        <Check className="h-5 w-5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-5 w-5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[100px]">
                  <p className="text-gray-900 whitespace-pre-wrap break-words">{reversedText}</p>
                </div>
              </div>
            )}

            <button
              onClick={reset}
              className="w-full text-gray-900 hover:text-gray-900 py-2"
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


