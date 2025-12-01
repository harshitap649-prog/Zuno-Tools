'use client'

import { useState } from 'react'
import Footer from '@/components/Footer'
import { Mail, Sparkles, Copy, Check, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const templates = [
  {
    name: 'Welcome Email',
    subject: 'Welcome to {{company}}!',
    body: `Hi {{name}},

Welcome to {{company}}! We're thrilled to have you on board.

Thank you for joining us. We're here to help you succeed.

Best regards,
The {{company}} Team`,
  },
  {
    name: 'Newsletter',
    subject: '{{month}} Newsletter - {{company}}',
    body: `Hello {{name}},

Here's what's new this month:

• Feature updates
• Latest news
• Upcoming events

Stay tuned for more updates!

Best,
{{company}} Team`,
  },
  {
    name: 'Promotional',
    subject: 'Special Offer Just for You!',
    body: `Hi {{name}},

We have an exclusive offer just for you!

Get {{discount}}% off on your next purchase. Use code: {{code}}

This offer expires on {{date}}.

Don't miss out!

{{company}}`,
  },
]

export default function EmailTemplateBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState(0)
  const [subject, setSubject] = useState(templates[0].subject)
  const [body, setBody] = useState(templates[0].body)
  const [copied, setCopied] = useState(false)

  const loadTemplate = (index: number) => {
    setSelectedTemplate(index)
    setSubject(templates[index].subject)
    setBody(templates[index].body)
  }

  const copyToClipboard = () => {
    const email = `Subject: ${subject}\n\n${body}`
    navigator.clipboard.writeText(email)
    setCopied(true)
    toast.success('Email template copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 mb-3 sm:mb-4">
              <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Email Template Builder</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Create professional email templates</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Choose Template</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {templates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => loadTemplate(index)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedTemplate === index
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 font-mono text-sm"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Use variables like {'{{name}}'}, {'{{company}}'}, {'{{date}}'} that can be replaced when sending.
              </p>
            </div>

            <button
              onClick={copyToClipboard}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              <span>{copied ? 'Copied!' : 'Copy Template'}</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

