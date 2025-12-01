'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Code, Copy, Check, Download } from 'lucide-react'
import toast from 'react-hot-toast'

type Language = 'json' | 'javascript' | 'html' | 'css' | 'xml'

export default function CodeFormatter() {
  const [code, setCode] = useState('')
  const [formattedCode, setFormattedCode] = useState('')
  const [language, setLanguage] = useState<Language>('json')
  const [copied, setCopied] = useState(false)

  const formatCode = () => {
    if (!code.trim()) {
      toast.error('Please enter some code')
      return
    }

    try {
      let formatted = ''

      if (language === 'json') {
        const parsed = JSON.parse(code)
        formatted = JSON.stringify(parsed, null, 2)
      } else if (language === 'javascript') {
        // Simple JavaScript formatting (basic indentation)
        formatted = code
          .replace(/\{/g, '{\n  ')
          .replace(/\}/g, '\n}')
          .replace(/;/g, ';\n')
          .split('\n')
          .map(line => line.trim())
          .filter(line => line)
          .join('\n')
      } else if (language === 'html') {
        // Basic HTML formatting
        formatted = code
          .replace(/></g, '>\n<')
          .split('\n')
          .map(line => line.trim())
          .filter(line => line)
          .join('\n')
      } else if (language === 'css') {
        // Basic CSS formatting
        formatted = code
          .replace(/\{/g, ' {\n  ')
          .replace(/\}/g, '\n}\n')
          .replace(/;/g, ';\n  ')
          .split('\n')
          .map(line => line.trim())
          .filter(line => line)
          .join('\n')
      } else if (language === 'xml') {
        formatted = code
          .replace(/></g, '>\n<')
          .split('\n')
          .map(line => line.trim())
          .filter(line => line)
          .join('\n')
      }

      setFormattedCode(formatted)
      toast.success('Code formatted successfully!')
    } catch (error) {
      console.error('Format error:', error)
      toast.error('Failed to format code. Please check syntax.')
    }
  }

  const minifyCode = () => {
    if (!code.trim()) {
      toast.error('Please enter some code')
      return
    }

    try {
      let minified = ''

      if (language === 'json') {
        const parsed = JSON.parse(code)
        minified = JSON.stringify(parsed)
      } else {
        minified = code
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
          .replace(/\/\/.*/g, '') // Remove line comments
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .replace(/\s*([{}();,=])\s*/g, '$1') // Remove spaces around operators
          .trim()
      }

      setFormattedCode(minified)
      toast.success('Code minified successfully!')
    } catch (error) {
      console.error('Minify error:', error)
      toast.error('Failed to minify code. Please check syntax.')
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedCode)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadCode = () => {
    const extension = language === 'javascript' ? 'js' : language
    const blob = new Blob([formattedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `formatted.${extension}`
    link.click()
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    setCode('')
    setFormattedCode('')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 mb-4">
              <Code className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Code Formatter</h1>
            <p className="text-gray-600">Format and minify code in multiple languages</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Format Your Code</h2>
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as Language)
                  setFormattedCode('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="json">JSON</option>
                <option value="javascript">JavaScript</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="xml">XML</option>
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Code
                </label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`Enter your ${language.toUpperCase()} code here...`}
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Formatted Code
                  </label>
                  {formattedCode && (
                    <div className="flex gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={downloadCode}
                        className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  )}
                </div>
                <textarea
                  value={formattedCode}
                  readOnly
                  placeholder="Formatted code will appear here..."
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 resize-none font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={formatCode}
                disabled={!code.trim()}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Code className="h-5 w-5" />
                <span>Format Code</span>
              </button>
              <button
                onClick={minifyCode}
                disabled={!code.trim()}
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Minify Code
              </button>
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

