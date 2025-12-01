'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FileText, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function WordCounter() {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)

  const stats = {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    sentences: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
    paragraphs: text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length,
    readingTime: Math.ceil(text.trim().split(/\s+/).length / 200) // Average reading speed: 200 words/min
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Text copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 mb-3 sm:mb-4">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Word Counter</h1>
            <p className="text-sm sm:text-base text-gray-600 px-4">Count words, characters, sentences, and more</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Your Text</h2>
                {text && (
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
                )}
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Start typing or paste your text here..."
                rows={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm sm:text-base"
              />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistics</h2>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{stats.words}</div>
                  <div className="text-sm text-gray-600">Words</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Characters</span>
                    <span className="font-semibold text-gray-900">{stats.characters.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Characters (no spaces)</span>
                    <span className="font-semibold text-gray-900">{stats.charactersNoSpaces.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Sentences</span>
                    <span className="font-semibold text-gray-900">{stats.sentences}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Paragraphs</span>
                    <span className="font-semibold text-gray-900">{stats.paragraphs}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Reading Time</span>
                    <span className="font-semibold text-gray-900">{stats.readingTime} min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

