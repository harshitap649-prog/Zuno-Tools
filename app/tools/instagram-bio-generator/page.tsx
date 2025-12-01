'use client'

import { useState } from 'react'
import Footer from '@/components/Footer'
import { Instagram, Sparkles, Copy, Check, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InstagramBioGenerator() {
  const [name, setName] = useState('')
  const [profession, setProfession] = useState('')
  const [interests, setInterests] = useState('')
  const [bio, setBio] = useState('')
  const [copied, setCopied] = useState(false)

  const templates = [
    {
      name: 'Professional',
      generate: () => `👋 Hi, I'm ${name || 'Your Name'}\n${profession ? `💼 ${profession}\n` : ''}${interests ? `✨ ${interests}\n` : ''}\n📧 DM for collaborations\n\n#${(name || 'yourname').toLowerCase().replace(/\s+/g, '')}`,
    },
    {
      name: 'Creative',
      generate: () => `✨ ${name || 'Your Name'}\n${profession ? `🎨 ${profession}\n` : ''}${interests ? `🌟 ${interests}\n` : ''}\n💫 Creating magic daily\n📸 Check out my work!\n\n#${(name || 'yourname').toLowerCase().replace(/\s+/g, '')}`,
    },
    {
      name: 'Personal',
      generate: () => `Hey! I'm ${name || 'Your Name'} 👋\n${profession ? `Working as ${profession}\n` : ''}${interests ? `Love ${interests}\n` : ''}\n📍 Living my best life\n💬 Let's connect!\n\n#${(name || 'yourname').toLowerCase().replace(/\s+/g, '')}`,
    },
    {
      name: 'Business',
      generate: () => `${name || 'Your Business'}\n${profession ? `🚀 ${profession}\n` : ''}${interests ? `💡 ${interests}\n` : ''}\n📞 Contact us for inquiries\n🌐 Visit our website\n\n#${(name || 'yourname').toLowerCase().replace(/\s+/g, '')}`,
    },
  ]

  const generateBio = (templateIndex: number = 0) => {
    const template = templates[templateIndex]
    const generated = template.generate()
    setBio(generated)
  }

  const copyToClipboard = () => {
    if (!bio) return
    navigator.clipboard.writeText(bio)
    setCopied(true)
    toast.success('Bio copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-6">
            <div className="flex flex-col items-center justify-center mb-4 sm:mb-6">
              <div className="relative inline-flex items-center justify-center mb-3 sm:mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-pink-500 to-rose-500 p-2 sm:p-3 rounded-xl shadow-lg">
                  <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                  Zuno Tools
                </span>
              </h1>
              <div className="mt-2 h-0.5 w-20 sm:w-24 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mx-auto"></div>
            </div>
          </div>
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 mb-3 sm:mb-4">
              <Instagram className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Instagram Bio Generator</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Generate creative Instagram bios</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Profession</label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="e.g., Designer, Developer, Writer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Interests/Hobbies</label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g., Photography, Travel, Food"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Choose Template</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {templates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => generateBio(index)}
                    className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-medium hover:shadow-lg transition-all text-sm"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>

            {bio && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Generated Bio</h3>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="whitespace-pre-line text-gray-900 font-medium">{bio}</div>
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

