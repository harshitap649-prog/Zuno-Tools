'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FileText, Copy, Check, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoremIpsum() {
  const [type, setType] = useState<'words' | 'sentences' | 'paragraphs'>('paragraphs')
  const [count, setCount] = useState(3)
  const [generated, setGenerated] = useState('')
  const [copied, setCopied] = useState(false)

  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ]

  const generateWords = (num: number) => {
    const words: string[] = []
    for (let i = 0; i < num; i++) {
      words.push(loremWords[Math.floor(Math.random() * loremWords.length)])
    }
    return words.join(' ')
  }

  const generateSentences = (num: number) => {
    const sentences: string[] = []
    for (let i = 0; i < num; i++) {
      const wordCount = Math.floor(Math.random() * 10) + 10 // 10-20 words per sentence
      const words = generateWords(wordCount)
      sentences.push(words.charAt(0).toUpperCase() + words.slice(1) + '.')
    }
    return sentences.join(' ')
  }

  const generateParagraphs = (num: number) => {
    const paragraphs: string[] = []
    for (let i = 0; i < num; i++) {
      const sentenceCount = Math.floor(Math.random() * 3) + 3 // 3-6 sentences per paragraph
      paragraphs.push(generateSentences(sentenceCount))
    }
    return paragraphs.join('\n\n')
  }

  const generate = () => {
    let text = ''
    switch (type) {
      case 'words':
        text = generateWords(count)
        break
      case 'sentences':
        text = generateSentences(count)
        break
      case 'paragraphs':
        text = generateParagraphs(count)
        break
    }
    setGenerated(text)
    toast.success('Lorem ipsum generated!')
  }

  const copyToClipboard = () => {
    if (!generated) return
    navigator.clipboard.writeText(generated)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 mb-3 sm:mb-4">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Lorem Ipsum Generator</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Generate placeholder text for your designs</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'words' | 'sentences' | 'paragraphs')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="words">Words</option>
                  <option value="sentences">Sentences</option>
                  <option value="paragraphs">Paragraphs</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Count</label>
                <input
                  type="number"
                  min="1"
                  max={type === 'words' ? 1000 : type === 'sentences' ? 100 : 50}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={generate}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95 touch-manipulation"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Generate</span>
            </button>

            {generated && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">Generated Text</h2>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                  >
                    {copied ? (
                      <>
                        <Check className="h-5 w-5" />
                        <span className="text-sm">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-5 w-5" />
                        <span className="text-sm">Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {generated}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

