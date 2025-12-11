'use client'

import { useState, useRef, useEffect } from 'react'
import Footer from '@/components/Footer'
import MobileBottomAd from '@/components/MobileBottomAd'
import { MessageCircle, Send, Loader2, Copy, Check, Trash2, Sparkles, User, Bot } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export default function ChatAssistance() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you with questions, problem-solving, explanations, writing assistance, and much more. What would you like to know?',
      timestamp: Date.now()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { triggerPopunder } = usePopunderAd()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load chat history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('chat-assistance-history')
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
        }
      } catch (e) {
        console.error('Failed to load chat history:', e)
      }
    }
  }, [])

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem('chat-assistance-history', JSON.stringify(messages))
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    // Don't trigger popunder on every message - only occasionally
    // Removed automatic popunder trigger

    try {
      const response = await fetch('/api/chat-assistance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'I apologize, but I couldn\'t generate a response. Please try again.',
        timestamp: Date.now()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again in a moment. If the problem persists, try rephrasing your question.',
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorMessage])
      toast.error('Failed to get response. Please try again.')
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard!')
  }

  const clearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. I can help you with questions, problem-solving, explanations, writing assistance, and much more. What would you like to know?',
        timestamp: Date.now()
      }])
      localStorage.removeItem('chat-assistance-history')
      toast.success('Chat cleared!')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-pink-50/30 to-rose-50/20 md:bg-gradient-to-br md:from-gray-50 md:via-pink-50/30 md:to-rose-50/20">
      {/* Mobile Header - Full Width */}
      <div className="md:hidden bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white px-4 py-3 flex items-center justify-between shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Chat Assistance</h1>
            <p className="text-xs text-white/90">AI Assistant</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          title="Clear chat"
        >
          <Trash2 className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Desktop Header */}
      <main className="hidden md:block flex-grow py-4 sm:py-6 md:py-8">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-4 sm:mb-6">
            <div className="relative inline-flex items-center justify-center mb-3 sm:mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
              <div className="relative inline-flex p-3 sm:p-4 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 shadow-lg">
                <MessageCircle className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Chat Assistance
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Ask anything, share anything - Your AI assistant is here to help
            </p>
          </div>
        </div>
      </main>

      {/* Chat Container - Full Screen on Mobile */}
      <div className="flex-1 flex flex-col md:max-w-4xl md:mx-auto md:px-3 md:px-4 lg:px-6 md:pb-4 md:pb-6 md:pb-8">
        <div className="flex-1 bg-white md:rounded-2xl md:shadow-xl md:border md:border-gray-200 flex flex-col overflow-hidden h-full md:h-[calc(100vh-20rem)]">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 sm:gap-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 sm:w-9 md:w-10 sm:h-9 md:h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center shadow-md">
                      <Bot className="h-4 w-4 sm:h-4 md:h-5 sm:w-4 md:w-5 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] sm:max-w-[75%] md:max-w-[70%] rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-md ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed">
                      {message.content}
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-1.5 sm:mt-2">
                      <button
                        onClick={() => copyMessage(message.content)}
                        className={`p-1 sm:p-1.5 rounded-lg transition-colors active:scale-95 ${
                          message.role === 'user'
                            ? 'hover:bg-white/20 active:bg-white/30 text-white/80'
                            : 'hover:bg-gray-200 active:bg-gray-300 text-gray-600'
                        }`}
                        title="Copy message"
                      >
                        <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </button>
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 sm:w-9 md:w-10 sm:h-9 md:h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center shadow-md">
                      <User className="h-4 w-4 sm:h-4 md:h-5 sm:w-4 md:w-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3 sm:gap-4 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-9 md:w-10 sm:h-9 md:h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center shadow-md">
                    <Bot className="h-4 w-4 sm:h-4 md:h-5 sm:w-4 md:w-5 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-pink-500" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-2 sm:p-3 md:p-4 bg-gray-50 md:bg-gray-50">
              <div className="flex items-end gap-2 sm:gap-3">
                <button
                  onClick={clearChat}
                  className="hidden md:flex p-2 sm:p-2.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 transition-colors text-gray-600 hover:text-red-600"
                  title="Clear chat"
                >
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 pr-10 sm:pr-12 md:pr-14 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none text-sm sm:text-base bg-white text-gray-900 placeholder-gray-400"
                    rows={1}
                    style={{
                      minHeight: '44px',
                      maxHeight: '120px',
                      height: 'auto',
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      target.style.height = `${Math.min(target.scrollHeight, 120)}px`
                    }}
                  />
                </div>
                
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="p-2.5 sm:p-3 md:p-3.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px] sm:min-w-[48px]"
                  title="Send message"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>
              
              <p className="hidden md:block text-xs text-gray-500 mt-2 text-center">
                AI responses are generated and may contain errors. Always verify important information.
              </p>
            </div>
          </div>
        </div>

      <MobileBottomAd adKey="36d691042d95ac1ac33375038ec47a5c" />
      <Footer />
    </div>
  )
}

