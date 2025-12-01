'use client'

import { useState } from 'react'
import Footer from '@/components/Footer'
import { Type, Loader2, Copy, Check, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AINoteSummarizer() {
  const [notes, setNotes] = useState('')
  const [summary, setSummary] = useState('')
  const [keyPoints, setKeyPoints] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const summarize = async () => {
    if (!notes.trim()) {
      toast.error('Please enter your notes')
      return
    }

    setLoading(true)
    try {
      // Simulate AI summarization
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const sentences = notes.split(/[.!?]+/).filter(s => s.trim().length > 0)
      const wordCount = notes.split(/\s+/).filter(w => w.length > 0).length
      const targetSentences = Math.max(1, Math.floor(sentences.length * 0.25))
      
      const summaryText = sentences
        .slice(0, targetSentences)
        .map(s => s.trim())
        .join('. ') + '.'
      
      setSummary(summaryText)

      // Extract key points (simple implementation)
      const keyPointsList = sentences
        .slice(0, Math.min(5, sentences.length))
        .map(s => s.trim())
        .filter(s => s.length > 20)
      
      setKeyPoints(keyPointsList)
      toast.success('Notes summarized successfully!')
    } catch (error) {
      toast.error('Failed to summarize notes')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 mb-3 sm:mb-4">
              <Type className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">AI Note Summarizer</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Summarize your notes and study materials</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Your Notes</span>
              </h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste or type your notes here. The AI will create a concise summary and extract key points..."
                rows={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-900">
                  {notes.split(/\s+/).filter(w => w.length > 0).length} words
                </p>
                <button
                  onClick={summarize}
                  disabled={loading || !notes.trim()}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Summarizing...</span>
                    </>
                  ) : (
                    <>
                      <Type className="h-5 w-5" />
                      <span>Summarize Notes</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Summary</h2>
                  {summary && (
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
                <div className="border border-gray-300 rounded-lg p-4 min-h-[200px] bg-gray-50">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                    </div>
                  ) : summary ? (
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{summary}</p>
                  ) : (
                    <p className="text-gray-400 text-center">Your summary will appear here...</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Points</h2>
                <div className="space-y-2">
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                    </div>
                  ) : keyPoints.length > 0 ? (
                    <ul className="space-y-2">
                      {keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-gray-900">{point}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-center">Key points will appear here...</p>
                  )}
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

