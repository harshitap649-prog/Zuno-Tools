'use client'

import { useState } from 'react'
import Footer from '@/components/Footer'
import { Link as LinkIcon, Copy, Check, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

export default function URLShortener() {
  const [longUrl, setLongUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const shortenUrl = () => {
    if (!longUrl.trim()) {
      toast.error('Please enter a URL')
      return
    }

    let url = longUrl.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }

    // Generate a short code (in production, this would use a backend service)
    const shortCode = Math.random().toString(36).substring(2, 8)
    const baseUrl = window.location.origin
    const shortened = `${baseUrl}/s/${shortCode}`

    setShortUrl(shortened)
    toast.success('URL shortened!')
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const reset = () => {
    setLongUrl('')
    setShortUrl('')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
              <LinkIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">URL Shortener</h1>
            <p className="text-gray-900">Shorten long URLs instantly</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Long URL
              </label>
              <input
                type="text"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && shortenUrl()}
                placeholder="https://example.com/very/long/url/here"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={shortenUrl}
              disabled={!longUrl.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <LinkIcon className="h-5 w-5" />
              <span>Shorten URL</span>
            </button>

            {shortUrl && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-900">
                    Shortened URL
                  </label>
                  <div className="flex gap-2">
                    <a
                      href={longUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
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
                </div>
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <p className="text-gray-900 font-mono break-all">{shortUrl}</p>
                </div>
                <p className="mt-2 text-xs text-gray-900">
                  Original: {longUrl}
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This is a client-side URL shortener. For production use, integrate with a URL shortening service like bit.ly or create a backend service.
              </p>
            </div>

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


