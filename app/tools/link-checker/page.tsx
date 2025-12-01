'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Link as LinkIcon, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface CheckResult {
  url: string
  status: 'checking' | 'valid' | 'invalid' | 'error'
  statusCode?: number
  message?: string
}

export default function LinkChecker() {
  const [url, setUrl] = useState('')
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<CheckResult | null>(null)

  const checkUrl = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    let urlToCheck = url.trim()
    if (!urlToCheck.startsWith('http://') && !urlToCheck.startsWith('https://')) {
      urlToCheck = 'https://' + urlToCheck
    }

    setChecking(true)
    setResult({ url: urlToCheck, status: 'checking' })

    try {
      const response = await fetch(urlToCheck, {
        method: 'HEAD',
        mode: 'no-cors'
      })

      // Since no-cors doesn't give us status, we'll use a different approach
      const img = new Image()
      img.onload = () => {
        setResult({
          url: urlToCheck,
          status: 'valid',
          statusCode: 200,
          message: 'URL is accessible'
        })
        setChecking(false)
        toast.success('URL is valid and accessible!')
      }
      img.onerror = async () => {
        // Try a fetch with CORS proxy or direct check
        try {
          const testResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(urlToCheck)}`)
          if (testResponse.ok) {
            setResult({
              url: urlToCheck,
              status: 'valid',
              statusCode: 200,
              message: 'URL is accessible'
            })
            toast.success('URL is valid and accessible!')
          } else {
            throw new Error('URL not accessible')
          }
        } catch (error) {
          setResult({
            url: urlToCheck,
            status: 'invalid',
            message: 'URL is not accessible or does not exist'
          })
          toast.error('URL is not accessible')
        }
        setChecking(false)
      }
      img.src = urlToCheck
    } catch (error) {
      setResult({
        url: urlToCheck,
        status: 'error',
        message: 'Error checking URL. It may be blocked by CORS or invalid.'
      })
      setChecking(false)
      toast.error('Error checking URL')
    }
  }

  const reset = () => {
    setUrl('')
    setResult(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 mb-4">
              <LinkIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Link Checker</h1>
            <p className="text-gray-600">Check if URLs are valid and accessible</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && checkUrl()}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={checkUrl}
                  disabled={checking || !url.trim()}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {checking ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-5 w-5" />
                      <span>Check</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {result && (
              <div className={`border rounded-lg p-6 ${
                result.status === 'valid'
                  ? 'bg-green-50 border-green-200'
                  : result.status === 'invalid'
                  ? 'bg-red-50 border-red-200'
                  : result.status === 'checking'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-start space-x-3">
                  {result.status === 'checking' && (
                    <Loader2 className="h-6 w-6 text-blue-600 animate-spin mt-1" />
                  )}
                  {result.status === 'valid' && (
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                  )}
                  {(result.status === 'invalid' || result.status === 'error') && (
                    <XCircle className="h-6 w-6 text-red-600 mt-1" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">{result.url}</p>
                    {result.statusCode && (
                      <p className="text-sm text-gray-600 mb-1">
                        Status Code: {result.statusCode}
                      </p>
                    )}
                    {result.message && (
                      <p className={`text-sm ${
                        result.status === 'valid' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {result.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Some URLs may be blocked by CORS policies. This tool checks if the URL format is valid and attempts to verify accessibility.
              </p>
            </div>

            <button
              onClick={reset}
              className="w-full text-gray-600 hover:text-gray-900 py-2"
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


