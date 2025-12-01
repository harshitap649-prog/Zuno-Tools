'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Type, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CaseConverter() {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)

  const convert = (type: string) => {
    switch (type) {
      case 'uppercase':
        return text.toUpperCase()
      case 'lowercase':
        return text.toLowerCase()
      case 'title':
        return text.replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        )
      case 'sentence':
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
      case 'camel':
        return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
          index === 0 ? word.toLowerCase() : word.toUpperCase()
        ).replace(/\s+/g, '')
      case 'pascal':
        return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => 
          word.toUpperCase()
        ).replace(/\s+/g, '')
      case 'snake':
        return text.toLowerCase().replace(/\s+/g, '_')
      case 'kebab':
        return text.toLowerCase().replace(/\s+/g, '-')
      default:
        return text
    }
  }

  const copyToClipboard = (convertedText: string) => {
    navigator.clipboard.writeText(convertedText)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const cases = [
    { id: 'uppercase', name: 'UPPERCASE', description: 'ALL CAPS' },
    { id: 'lowercase', name: 'lowercase', description: 'all small' },
    { id: 'title', name: 'Title Case', description: 'Every Word Capitalized' },
    { id: 'sentence', name: 'Sentence case', description: 'First letter capitalized' },
    { id: 'camel', name: 'camelCase', description: 'camelCaseFormat' },
    { id: 'pascal', name: 'PascalCase', description: 'PascalCaseFormat' },
    { id: 'snake', name: 'snake_case', description: 'snake_case_format' },
    { id: 'kebab', name: 'kebab-case', description: 'kebab-case-format' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 mb-3 sm:mb-4">
              <Type className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Case Converter</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Convert text to different cases instantly</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Your Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to convert..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {cases.map((caseType) => {
                const converted = convert(caseType.id)
                return (
                  <div key={caseType.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-400 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{caseType.name}</h3>
                        <p className="text-xs text-gray-900 mt-1">{caseType.description}</p>
                      </div>
                      {converted && (
                        <button
                          onClick={() => copyToClipboard(converted)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded p-2 min-h-[60px]">
                      <p className="text-sm font-mono text-gray-900 break-words">
                        {converted || 'Converted text...'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

