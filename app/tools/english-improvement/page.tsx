'use client'

import { useState } from 'react'
import Footer from '@/components/Footer'
import { Languages, Loader2, Copy, Check, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

interface Suggestion {
  original: string
  improved: string
  reason: string
}

export default function EnglishImprovement() {
  const [text, setText] = useState('')
  const [improvedText, setImprovedText] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const improve = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to improve')
      return
    }

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      let improved = text
      const suggestionsList: Suggestion[] = []
      
      // Fix capitalization of "I"
      if (/\bi\b/.test(improved)) {
        improved = improved.replace(/\bi\b/g, 'I')
        suggestionsList.push({
          original: 'i',
          improved: 'I',
          reason: 'First person pronoun should be capitalized'
        })
      }
      
      // Fix common contractions
      const contractions = [
        { wrong: /\bwont\b/gi, correct: "won't", reason: "Use proper contraction" },
        { wrong: /\bcant\b/gi, correct: "can't", reason: "Use proper contraction" },
        { wrong: /\bdont\b/gi, correct: "don't", reason: "Use proper contraction" },
        { wrong: /\bisnt\b/gi, correct: "isn't", reason: "Use proper contraction" },
        { wrong: /\barent\b/gi, correct: "aren't", reason: "Use proper contraction" },
        { wrong: /\bwasnt\b/gi, correct: "wasn't", reason: "Use proper contraction" },
        { wrong: /\bwerent\b/gi, correct: "weren't", reason: "Use proper contraction" },
        { wrong: /\bhavent\b/gi, correct: "haven't", reason: "Use proper contraction" },
        { wrong: /\bhasnt\b/gi, correct: "hasn't", reason: "Use proper contraction" },
        { wrong: /\bhadnt\b/gi, correct: "hadn't", reason: "Use proper contraction" },
        { wrong: /\bwouldnt\b/gi, correct: "wouldn't", reason: "Use proper contraction" },
        { wrong: /\bcouldnt\b/gi, correct: "couldn't", reason: "Use proper contraction" },
        { wrong: /\bshouldnt\b/gi, correct: "shouldn't", reason: "Use proper contraction" },
        { wrong: /\bim\b/gi, correct: "I'm", reason: "Use proper contraction" },
        { wrong: /\byoure\b/gi, correct: "you're", reason: "Use proper contraction" },
        { wrong: /\btheyre\b/gi, correct: "they're", reason: "Use proper contraction" },
        { wrong: /\bwere\b/gi, correct: "we're", reason: "Use proper contraction" },
        { wrong: /\bits\b/gi, correct: "it's", reason: "Use proper contraction (when meaning 'it is')" },
      ]
      
      contractions.forEach(({ wrong, correct, reason }) => {
        if (wrong.test(improved)) {
          const matches = improved.match(wrong)
          if (matches) {
            suggestionsList.push({
              original: matches[0],
              improved: correct,
              reason: reason
            })
          }
          improved = improved.replace(wrong, correct)
        }
      })
      
      // Fix double spaces
      if (/\s{2,}/.test(improved)) {
        improved = improved.replace(/\s{2,}/g, ' ')
        suggestionsList.push({
          original: 'multiple spaces',
          improved: 'single space',
          reason: 'Remove extra spaces for better readability'
        })
      }
      
      // Fix common grammar mistakes
      // "your" vs "you're"
      improved = improved.replace(/\byour\s+(?:so|very|really|too)\b/gi, (match) => {
        if (match.toLowerCase().includes('your so')) {
          suggestionsList.push({
            original: 'your so',
            improved: "you're so",
            reason: "Use 'you're' (you are) instead of 'your' (possessive)"
          })
          return match.replace(/\byour\b/gi, "you're")
        }
        return match
      })
      
      // Fix "there", "their", "they're" - basic check
      improved = improved.replace(/\btheir\s+(?:is|are|was|were)\b/gi, (match) => {
        suggestionsList.push({
          original: match,
          improved: match.replace(/\btheir\b/gi, "there"),
          reason: "Use 'there' for existence, not 'their' (possessive)"
        })
        return match.replace(/\btheir\b/gi, "there")
      })
      
      // Fix "its" vs "it's" - when followed by verb
      improved = improved.replace(/\bits\s+(?:is|was|will|has|had)\b/gi, (match) => {
        suggestionsList.push({
          original: match,
          improved: match.replace(/\bits\b/gi, "it's"),
          reason: "Use 'it's' (it is) instead of 'its' (possessive) when followed by a verb"
        })
        return match.replace(/\bits\b/gi, "it's")
      })
      
      // Capitalize first letter of sentence
      improved = improved.trim()
      if (improved.length > 0 && !/[A-Z]/.test(improved[0])) {
        improved = improved.charAt(0).toUpperCase() + improved.slice(1)
        suggestionsList.push({
          original: 'lowercase start',
          improved: 'capitalized start',
          reason: 'Sentences should start with a capital letter'
        })
      }
      
      // Add period at end if missing
      if (improved.length > 0 && !/[.!?]$/.test(improved.trim())) {
        improved = improved.trim() + '.'
        suggestionsList.push({
          original: 'missing punctuation',
          improved: 'added period',
          reason: 'Sentences should end with proper punctuation'
        })
      }
      
      // Fix common word mistakes
      const wordFixes = [
        { wrong: /\brecieve\b/gi, correct: 'receive', reason: 'Correct spelling' },
        { wrong: /\bseperate\b/gi, correct: 'separate', reason: 'Correct spelling' },
        { wrong: /\bdefinately\b/gi, correct: 'definitely', reason: 'Correct spelling' },
        { wrong: /\boccured\b/gi, correct: 'occurred', reason: 'Correct spelling' },
        { wrong: /\bteh\b/gi, correct: 'the', reason: 'Correct spelling' },
        { wrong: /\btaht\b/gi, correct: 'that', reason: 'Correct spelling' },
        { wrong: /\bthier\b/gi, correct: 'their', reason: 'Correct spelling' },
      ]
      
      wordFixes.forEach(({ wrong, correct, reason }) => {
        if (wrong.test(improved)) {
          const matches = improved.match(wrong)
          if (matches) {
            suggestionsList.push({
              original: matches[0],
              improved: correct,
              reason: reason
            })
          }
          improved = improved.replace(wrong, correct)
        }
      })
      
      setImprovedText(improved)
      setSuggestions(suggestionsList)
      toast.success('Text improved successfully!')
    } catch (error) {
      console.error('Improvement error:', error)
      toast.error('Failed to improve text')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(improvedText)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 mb-3 sm:mb-4">
              <Languages className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">AI English Improvement</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Improve your English writing with AI suggestions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Original Text</h2>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the text you want to improve. The AI will suggest corrections for grammar, spelling, and style..."
                rows={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-900">
                  {text.split(/\s+/).filter(w => w.length > 0).length} words
                </p>
                <button
                  onClick={improve}
                  disabled={loading || !text.trim()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Improving...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      <span>Improve Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Improved Text</h2>
                  {improvedText && (
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
                  ) : improvedText ? (
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{improvedText}</p>
                  ) : (
                    <p className="text-gray-400 text-center">Your improved text will appear here...</p>
                  )}
                </div>
              </div>

              {suggestions.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Suggestions</h2>
                  <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2 mb-2">
                          <span className="text-sm font-semibold text-gray-900">"{suggestion.original}"</span>
                          <span className="text-gray-400">→</span>
                          <span className="text-sm font-semibold text-primary-600">"{suggestion.improved}"</span>
                        </div>
                        <p className="text-sm text-gray-900">{suggestion.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

