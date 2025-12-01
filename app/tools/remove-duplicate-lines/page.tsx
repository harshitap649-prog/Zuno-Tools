'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Filter, Copy, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RemoveDuplicateLines() {
  const [text, setText] = useState('')
  const [processedText, setProcessedText] = useState('')
  const [copied, setCopied] = useState(false)
  const [removedCount, setRemovedCount] = useState(0)

  const removeDuplicates = () => {
    if (!text.trim()) {
      toast.error('Please enter some text')
      return
    }

    const lines = text.split('\n')
    const originalCount = lines.length
    const uniqueLines = Array.from(new Set(lines.map(line => line.trim())))
    const newCount = uniqueLines.length
    const removed = originalCount - newCount

    setProcessedText(uniqueLines.join('\n'))
    setRemovedCount(removed)
    toast.success(`Removed ${removed} duplicate line${removed !== 1 ? 's' : ''}`)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(processedText)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const reset = () => {
    setText('')
    setProcessedText('')
    setRemovedCount(0)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 mb-4">
              <Filter className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Remove Duplicate Lines</h1>
            <p className="text-gray-600">Remove duplicate lines from your text</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Text (one line per item)
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your text here, one item per line..."
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
              />
              <p className="mt-2 text-sm text-gray-500">
                {text.split('\n').filter(l => l.trim()).length} lines
              </p>
            </div>

            <button
              onClick={removeDuplicates}
              disabled={!text.trim()}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Filter className="h-5 w-5" />
              <span>Remove Duplicates</span>
            </button>

            {processedText && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Processed Text
                    </label>
                    {removedCount > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        Removed {removedCount} duplicate line{removedCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
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
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[200px]">
                  <p className="text-gray-700 whitespace-pre-wrap break-words font-mono text-sm">
                    {processedText}
                  </p>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {processedText.split('\n').filter(l => l.trim()).length} unique lines
                </p>
              </div>
            )}

            <button
              onClick={reset}
              className="w-full text-gray-600 hover:text-gray-900 py-2 flex items-center justify-center space-x-2"
            >
              <X className="h-5 w-5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}


