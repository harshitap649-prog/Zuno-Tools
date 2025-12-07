'use client'

import { useState } from 'react'
import Footer from '@/components/Footer'
import SidebarAd from '@/components/SidebarAd'
import MobileBottomAd from '@/components/MobileBottomAd'
import { Sparkles, Loader2, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AISummarizer() {
  const [text, setText] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const summarize = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to summarize')
      return
    }

    setLoading(true)
    try {
      // Simulate AI summarization (in production, use OpenAI API or similar)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simple summarization logic (in production, use actual AI)
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
      const wordCount = text.split(/\s+/).length
      const targetSentences = Math.max(1, Math.floor(sentences.length * 0.3))
      
      const summaryText = sentences
        .slice(0, targetSentences)
        .map(s => s.trim())
        .join('. ') + '.'
      
      setSummary(summaryText)
      toast.success('Text summarized successfully!')
    } catch (error) {
      toast.error('Failed to summarize text')
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
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <SidebarAd position="right" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">AI Summarizer</h1>
            <p className="text-gray-900">Summarize long texts and documents instantly</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Input Text</h2>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or type the text you want to summarize here..."
                rows={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-gray-900"
              />
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-900">
                  {text.split(/\s+/).filter(w => w.length > 0).length} words
                </p>
                <button
                  onClick={summarize}
                  disabled={loading || !text.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Summarizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      <span>Summarize</span>
                    </>
                  )}
                </button>
              </div>
            </div>

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
              <div className="border border-gray-300 rounded-lg p-4 min-h-[400px] bg-gray-50">
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
              {summary && (
                <div className="mt-4 text-sm text-gray-900">
                  Summary: {summary.split(/\s+/).filter(w => w.length > 0).length} words
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <MobileBottomAd adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <Footer />
    </div>
  )
}

