'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'
import { Code, Sparkles, Copy, Check, Wand2, Wifi, WifiOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

// Dynamically import ad components to avoid SSR issues
const SidebarAd = dynamic(() => import('@/components/SidebarAd'), { ssr: false })
const MobileBottomAd = dynamic(() => import('@/components/MobileBottomAd'), { ssr: false })

interface OllamaModel {
  name: string
  size: number
  modified: string
}

export default function AICodeGenerator() {
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [generatedCode, setGeneratedCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [ollamaConnected, setOllamaConnected] = useState(false)
  const [checkingConnection, setCheckingConnection] = useState(true)
  const [models, setModels] = useState<OllamaModel[]>([])
  const [selectedModel, setSelectedModel] = useState('llama3')

  const languages = ['javascript', 'python', 'java', 'cpp', 'html', 'css', 'typescript', 'php', 'ruby', 'go']

  // Check Ollama connection on mount
  useEffect(() => {
    checkOllamaConnection()
  }, [])

  const checkOllamaConnection = async () => {
    setCheckingConnection(true)
    try {
      const response = await fetch('/api/ollama')
      
      if (!response.ok) {
        // If response is not ok, try to get error details
        const errorData = await response.json().catch(() => ({}))
        setOllamaConnected(false)
        console.error('Ollama connection failed:', response.status, errorData)
        toast.error(errorData.error || 'Cannot connect to Ollama', {
          duration: 5000,
        })
        return
      }
      
      const data = await response.json()
      console.log('Ollama connection response:', data)
      
      if (data.connected) {
        setOllamaConnected(true)
        setModels(data.models || [])
        if (data.models && data.models.length > 0) {
          setSelectedModel(data.models[0].name)
        }
        toast.success('Ollama connected successfully!', { duration: 2000 })
      } else {
        setOllamaConnected(false)
        toast.error(data.error || 'Ollama is not running. Please start Ollama to use this tool.', {
          duration: 5000,
        })
      }
    } catch (error: any) {
      setOllamaConnected(false)
      console.error('Error checking Ollama connection:', error)
      toast.error('Failed to check Ollama connection: ' + (error.message || 'Unknown error'), {
        duration: 5000,
      })
    } finally {
      setCheckingConnection(false)
    }
  }

  const generateCode = async () => {
    if (!description.trim()) {
      toast.error('Please enter a description')
      return
    }

    if (!ollamaConnected) {
      toast.error('Ollama is not connected. Please make sure Ollama is running.')
      return
    }

    setLoading(true)
    setGeneratedCode('')
    
    try {
      const response = await fetch('/api/ollama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: description,
          language: language,
          model: selectedModel,
        }),
      })

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        const text = await response.text().catch(() => 'Unknown error')
        throw new Error(`Failed to parse response: ${text}`)
      }

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to generate code')
      }

      if (!data.code || data.code.trim() === '') {
        throw new Error('No code was generated. Please try a different prompt.')
      }

      setGeneratedCode(data.code)
      toast.success('Code generated successfully!')
    } catch (error: any) {
      console.error('Error generating code:', error)
      const errorMessage = error.message || 'Failed to generate code. Make sure Ollama is running.'
      toast.error(errorMessage, { duration: 5000 })
      
      // If connection error, update connection status
      if (errorMessage.includes('connect') || errorMessage.includes('Ollama') || errorMessage.includes('503')) {
        setOllamaConnected(false)
        // Try to reconnect
        setTimeout(() => checkOllamaConnection(), 2000)
      }
    } finally {
      setLoading(false)
    }
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
      <SidebarAd position="left" adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      <SidebarAd position="right" adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      
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
            {/* Connection Status */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-2">
                {checkingConnection ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    <span className="text-sm text-gray-600">Checking Ollama connection...</span>
                  </>
                ) : ollamaConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700 font-medium">Ollama Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700 font-medium">Ollama Not Connected</span>
                  </>
                )}
              </div>
              <button
                onClick={checkOllamaConnection}
                disabled={checkingConnection}
                className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors disabled:opacity-50"
              >
                Refresh
              </button>
            </div>

            {/* Model Selection */}
            {ollamaConnected && models.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Ollama Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                >
                  {models.map(model => (
                    <option key={model.name} value={model.name}>
                      {model.name} {model.size ? `(${(model.size / 1024 / 1024 / 1024).toFixed(2)} GB)` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
              disabled={loading || !description.trim() || !ollamaConnected}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generating Code...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5" />
                  <span>Generate Code</span>
                </>
              )}
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

            <div className={`border rounded-lg p-4 ${ollamaConnected ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <p className={`text-sm ${ollamaConnected ? 'text-blue-800' : 'text-yellow-800'}`}>
                <strong>Note:</strong> {
                  ollamaConnected 
                    ? 'This tool uses Ollama for local AI code generation. Make sure you have the selected model downloaded.'
                    : 'This tool requires Ollama to be installed and running. Download Ollama from https://ollama.ai and make sure it\'s running before using this tool.'
                }
              </p>
              {!ollamaConnected && (
                <div className="mt-2 text-xs text-yellow-700">
                  <p>To get started:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Install Ollama from <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="underline">ollama.ai</a></li>
                    <li>Start the Ollama application</li>
                    <li>Download a model: <code className="bg-yellow-100 px-1 rounded">ollama pull llama3</code></li>
                    <li>Refresh the connection status above</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <MobileBottomAd adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      <Footer />
    </div>
  )
}

