'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Code, Copy, Check, Minimize2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function JSONFormatter() {
  const [jsonInput, setJsonInput] = useState('')
  const [formattedJson, setFormattedJson] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const formatJSON = () => {
    try {
      setError('')
      const parsed = JSON.parse(jsonInput)
      const formatted = JSON.stringify(parsed, null, 2)
      setFormattedJson(formatted)
      toast.success('JSON formatted successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON'
      setError(errorMessage)
      setFormattedJson('')
      toast.error('Invalid JSON format')
    }
  }

  const minifyJSON = () => {
    try {
      setError('')
      const parsed = JSON.parse(jsonInput)
      const minified = JSON.stringify(parsed)
      setFormattedJson(minified)
      toast.success('JSON minified successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON'
      setError(errorMessage)
      setFormattedJson('')
      toast.error('Invalid JSON format')
    }
  }

  const validateJSON = () => {
    try {
      JSON.parse(jsonInput)
      setError('')
      toast.success('Valid JSON!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON'
      setError(errorMessage)
      toast.error('Invalid JSON')
    }
  }

  const copyToClipboard = () => {
    if (!formattedJson) return
    navigator.clipboard.writeText(formattedJson)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 mb-3 sm:mb-4">
              <Code className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">JSON Formatter</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Format, validate, and minify JSON data</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Input JSON</h2>
                <button
                  onClick={validateJSON}
                  className="text-xs sm:text-sm px-3 py-1 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Validate
                </button>
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value)
                  setError('')
                  setFormattedJson('')
                }}
                placeholder='{"key": "value"}'
                rows={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
              />
              {error && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Formatted JSON</h2>
                {formattedJson && (
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span className="text-sm">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span className="text-sm">Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <textarea
                value={formattedJson}
                readOnly
                placeholder="Formatted JSON will appear here..."
                rows={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 resize-none font-mono text-sm"
              />
            </div>
          </div>

          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={formatJSON}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95 touch-manipulation"
            >
              <Code className="h-5 w-5" />
              <span>Format JSON</span>
            </button>
            <button
              onClick={minifyJSON}
              className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95 touch-manipulation"
            >
              <Minimize2 className="h-5 w-5" />
              <span>Minify JSON</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

