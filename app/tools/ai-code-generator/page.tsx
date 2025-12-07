'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'
import { Code, Sparkles, Copy, Check, Wand2 } from 'lucide-react'
import toast from 'react-hot-toast'

// Dynamically import ad components to avoid SSR issues
const SidebarAd = dynamic(() => import('@/components/SidebarAd'), { ssr: false })
const MobileBottomAd = dynamic(() => import('@/components/MobileBottomAd'), { ssr: false })

export default function AICodeGenerator() {
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [generatedCode, setGeneratedCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const languages = ['javascript', 'python', 'java', 'cpp', 'html', 'css', 'typescript', 'php', 'ruby', 'go']

  const generateCode = async () => {
    if (!description.trim()) {
      toast.error('Please enter a description')
      return
    }

    setLoading(true)
    toast.info('AI code generation requires an API key. This is a demo interface.')
    
    // Simulate API call
    setTimeout(() => {
      setGeneratedCode(`// Generated ${language} code for: ${description}\n// This is a demo. In production, integrate with OpenAI, Anthropic, or similar API\n\nfunction example() {\n  // Your code here\n}`)
      setLoading(false)
      toast.success('Code generated! (Demo mode)')
    }, 2000)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    toast.success('Code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <SidebarAd position="right" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 mb-3 sm:mb-4">
              <Code className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">AI Code Generator</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Generate code from natural language descriptions</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Programming Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Code Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you want the code to do... e.g., 'Create a function that calculates the factorial of a number'"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            </div>

            <button
              onClick={generateCode}
              disabled={loading || !description.trim()}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wand2 className="h-5 w-5" />
              <span>{loading ? 'Generating...' : 'Generate Code'}</span>
            </button>

            {generatedCode && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">Generated Code</h3>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 font-mono text-sm">
                    <code>{generatedCode}</code>
                  </pre>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This tool requires integration with an AI API (e.g., OpenAI GPT, Anthropic Claude, GitHub Copilot). Add your API key in the backend to enable code generation.
              </p>
            </div>
          </div>
        </div>
      </main>

      <MobileBottomAd adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <Footer />
    </div>
  )
}

