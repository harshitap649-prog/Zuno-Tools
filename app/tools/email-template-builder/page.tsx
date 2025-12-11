'use client'

import { useState, useEffect, useRef } from 'react'
import Footer from '@/components/Footer'
import MobileBottomAd from '@/components/MobileBottomAd'
import toast from 'react-hot-toast'
import {
  Mail, Copy, Check, Save, Download, Eye, EyeOff, 
  Bold, Italic, Underline, List, Link as LinkIcon,
  Undo, Redo, History, X, Plus, Trash2, FileText,
  Smartphone, Monitor, Type, Zap, RotateCcw, 
  ChevronDown, ChevronUp, HelpCircle, Grid3x3
} from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  category: string
  isCustom?: boolean
}

interface TemplateHistory {
  subject: string
  body: string
  timestamp: Date
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to {{company}}!',
    body: `Hi {{name}},

Welcome to {{company}}! We're thrilled to have you on board.

Thank you for joining us. We're here to help you succeed.

Best regards,
The {{company}} Team`,
    category: 'Welcome'
  },
  {
    id: 'newsletter',
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
    category: 'Newsletter'
  },
  {
    id: 'promotional',
    name: 'Promotional',
    subject: 'Special Offer Just for You!',
    body: `Hi {{name}},

We have an exclusive offer just for you!

Get {{discount}}% off on your next purchase. Use code: {{code}}

This offer expires on {{date}}.

Don't miss out!

{{company}}`,
    category: 'Promotional'
  },
  {
    id: 'transactional',
    name: 'Order Confirmation',
    subject: 'Order Confirmation - {{orderNumber}}',
    body: `Hi {{name}},

Thank you for your order!

Order Number: {{orderNumber}}
Date: {{date}}
Total: {{amount}}

Your order will be shipped to:
{{address}}

We'll send you tracking information once your order ships.

Best regards,
{{company}}`,
    category: 'Transactional'
  },
  {
    id: 'followup',
    name: 'Follow-up Email',
    subject: 'Following up on {{topic}}',
    body: `Hi {{name}},

I wanted to follow up on our recent conversation about {{topic}}.

{{message}}

Please let me know if you have any questions.

Best regards,
{{senderName}}
{{company}}`,
    category: 'Follow-up'
  },
  {
    id: 'thankyou',
    name: 'Thank You Email',
    subject: 'Thank You from {{company}}',
    body: `Dear {{name}},

Thank you for {{reason}}!

We truly appreciate your {{action}} and wanted to express our gratitude.

{{additionalMessage}}

Warm regards,
{{company}} Team`,
    category: 'Thank You'
  },
  {
    id: 'announcement',
    name: 'Announcement',
    subject: 'Important Announcement from {{company}}',
    body: `Hello {{name}},

We have an important announcement to share:

{{announcement}}

{{details}}

If you have any questions, please don't hesitate to reach out.

Best regards,
{{company}}`,
    category: 'Announcement'
  },
  {
    id: 'invitation',
    name: 'Invitation',
    subject: 'You\'re Invited: {{eventName}}',
    body: `Hi {{name}},

You're cordially invited to {{eventName}}!

Date: {{date}}
Time: {{time}}
Location: {{location}}

{{description}}

We hope to see you there!

RSVP: {{rsvpLink}}

Best regards,
{{company}}`,
    category: 'Invitation'
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    subject: 'Reset Your Password',
    body: `Hi {{name}},

We received a request to reset your password for your {{company}} account.

Click the link below to reset your password:
{{resetLink}}

This link will expire in {{expiryTime}}.

If you didn't request this, please ignore this email.

Best regards,
{{company}} Security Team`,
    category: 'Transactional'
  },
  {
    id: 'reminder',
    name: 'Reminder Email',
    subject: 'Reminder: {{reminderTitle}}',
    body: `Hi {{name}},

This is a friendly reminder about {{reminderTitle}}.

{{reminderDetails}}

{{actionRequired}}

Best regards,
{{company}}`,
    category: 'Reminder'
  }
]

const commonVariables = [
  'name', 'company', 'email', 'date', 'time', 'amount', 
  'discount', 'code', 'orderNumber', 'address', 'phone',
  'month', 'year', 'senderName', 'topic', 'message', 
  'reason', 'action', 'announcement', 'eventName', 
  'location', 'resetLink', 'rsvpLink', 'expiryTime'
]

export default function EmailTemplateBuilder() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [showPreview, setShowPreview] = useState(true)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [showVariableHelper, setShowVariableHelper] = useState(false)
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [templateCategory, setTemplateCategory] = useState<string>('all')
  const [showRichText, setShowRichText] = useState(false)
  const [history, setHistory] = useState<TemplateHistory[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [savedTemplates, setSavedTemplates] = useState<EmailTemplate[]>([])
  const [showSavedTemplates, setShowSavedTemplates] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showMobileCategories, setShowMobileCategories] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load saved templates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('email-templates')
    if (saved) {
      try {
        setSavedTemplates(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load saved templates')
      }
    }
  }, [])

  // Initialize with first template
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      loadTemplate(templates[0].id)
    }
  }, [])

  // Save to history on change
  useEffect(() => {
    if (subject || body) {
      const newHistory: TemplateHistory = {
        subject,
        body,
        timestamp: new Date()
      }
      setHistory(prev => {
        const newHist = [...prev.slice(0, historyIndex + 1), newHistory]
        return newHist.slice(-50) // Keep last 50
      })
      setHistoryIndex(prev => Math.min(prev + 1, 49))
    }
  }, [subject, body])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S: Save template
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        setShowSaveDialog(prev => {
          if (!prev) {
            toast.loading('Opening save dialog...', { id: 'save-dialog', duration: 1000 })
          }
          return true
        })
      }
      
      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (historyIndex > 0) {
          const prevState = history[historyIndex - 1]
          setHistoryIndex(prev => prev - 1)
          setSubject(prevState.subject)
          setBody(prevState.body)
          toast.success('Undone', { duration: 1000 })
        } else {
          toast.error('Nothing to undo', { duration: 1500 })
        }
      }
      
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault()
        if (historyIndex < history.length - 1) {
          const nextState = history[historyIndex + 1]
          setHistoryIndex(prev => prev + 1)
          setSubject(nextState.subject)
          setBody(nextState.body)
          toast.success('Redone', { duration: 1000 })
        } else {
          toast.error('Nothing to redo', { duration: 1500 })
        }
      }
      
      // Ctrl/Cmd + H: Copy as HTML
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault()
        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${replaceVariables(subject, variableValues)}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #2563eb;">${replaceVariables(subject, variableValues)}</h2>
  <div style="white-space: pre-wrap;">${replaceVariables(body, variableValues).replace(/\n/g, '<br>')}</div>
</body>
</html>`
        navigator.clipboard.writeText(html)
        toast.success('HTML copied to clipboard!')
      }
      
      // Ctrl/Cmd + D: Download HTML
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${replaceVariables(subject, variableValues)}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #2563eb;">${replaceVariables(subject, variableValues)}</h2>
  <div style="white-space: pre-wrap;">${replaceVariables(body, variableValues).replace(/\n/g, '<br>')}</div>
</body>
</html>`
        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'email-template.html'
        a.click()
        URL.revokeObjectURL(url)
        toast.success('HTML file downloaded!')
      }
      
      // Ctrl/Cmd + P: Toggle preview
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        setShowPreview(prev => {
          toast.success(prev ? 'Preview hidden' : 'Preview shown', { duration: 1500 })
          return !prev
        })
      }
      
      // Ctrl/Cmd + V: Toggle variable helper (only when not in input/textarea)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && 
          e.target instanceof HTMLElement && 
          !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault()
        setShowVariableHelper(prev => {
          toast.success(prev ? 'Variable helper hidden' : 'Variable helper shown', { duration: 1500 })
          return !prev
        })
      }
      
      // Ctrl/Cmd + R: Toggle rich text (only when not in input/textarea)
      if ((e.ctrlKey || e.metaKey) && e.key === 'r' && 
          e.target instanceof HTMLElement && 
          !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault()
        setShowRichText(prev => {
          toast.success(prev ? 'Rich text toolbar hidden' : 'Rich text toolbar shown', { duration: 1500 })
          return !prev
        })
      }
      
      // Escape: Close dialogs
      if (e.key === 'Escape') {
        setShowSaveDialog(prev => {
          if (prev) {
            setTemplateName('')
            toast('Dialog closed', { duration: 1000 })
            return false
          }
          return prev
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [historyIndex, history, variableValues, subject, body])

  const loadTemplate = (templateId: string) => {
    const template = [...templates, ...savedTemplates].find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setSubject(template.subject)
      setBody(template.body)
      setTemplateName('')
      toast.success(`Loaded template: ${template.name}`, { duration: 2000 })
    }
  }

  const filteredTemplates = templates.filter(t => 
    templateCategory === 'all' || t.category === templateCategory
  )

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))]

  const replaceVariables = (text: string, values: Record<string, string>) => {
    let result = text
    Object.entries(values).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      result = result.replace(regex, value || `{{${key}}}`)
    })
    // Replace remaining variables with sample data
    const sampleData: Record<string, string> = {
      name: values.name || 'John Doe',
      company: values.company || 'Acme Inc.',
      email: values.email || 'john@example.com',
      date: values.date || new Date().toLocaleDateString(),
      time: values.time || new Date().toLocaleTimeString(),
      amount: values.amount || '$99.99',
      discount: values.discount || '20',
      code: values.code || 'SAVE20',
      orderNumber: values.orderNumber || 'ORD-12345',
      address: values.address || '123 Main St, City, State 12345',
      phone: values.phone || '+1 (555) 123-4567',
      month: values.month || new Date().toLocaleString('default', { month: 'long' }),
      year: values.year || new Date().getFullYear().toString(),
      senderName: values.senderName || 'Jane Smith',
      topic: values.topic || 'our project',
      message: values.message || 'I wanted to touch base with you.',
      reason: values.reason || 'your support',
      action: values.action || 'support',
      announcement: values.announcement || 'We are launching a new product!',
      details: values.details || 'More information will be available soon.',
      eventName: values.eventName || 'Annual Conference 2025',
      location: values.location || 'Convention Center, City',
      resetLink: values.resetLink || 'https://example.com/reset',
      rsvpLink: values.rsvpLink || 'https://example.com/rsvp',
      expiryTime: values.expiryTime || '24 hours',
      reminderTitle: values.reminderTitle || 'upcoming meeting',
      reminderDetails: values.reminderDetails || 'Your meeting is scheduled for tomorrow.',
      actionRequired: values.actionRequired || 'Please confirm your attendance.'
    }
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      result = result.replace(regex, value)
    })
    return result
  }

  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = body
      const before = text.substring(0, start)
      const after = text.substring(end)
      const newText = before + `{{${variable}}}` + after
      setBody(newText)
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4)
      }, 0)
    } else {
      setBody(body + `{{${variable}}}`)
    }
    toast.success(`Inserted {{${variable}}}`)
  }

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = body.substring(start, end)
      const text = body
      const beforeText = text.substring(0, start)
      const afterText = text.substring(end)
      const newText = beforeText + before + selectedText + after + afterText
      setBody(newText)
      setTimeout(() => {
        textarea.focus()
        const newPos = start + before.length + selectedText.length + after.length
        textarea.setSelectionRange(newPos, newPos)
      }, 0)
    }
  }

  const formatText = (format: 'bold' | 'italic' | 'underline' | 'link') => {
    switch (format) {
      case 'bold':
        insertText('**', '**')
        break
      case 'italic':
        insertText('*', '*')
        break
      case 'underline':
        insertText('<u>', '</u>')
        break
      case 'link':
        const url = prompt('Enter URL:')
        if (url) {
          const textarea = textareaRef.current
          if (textarea) {
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const selectedText = body.substring(start, end) || 'link text'
            const text = body
            const before = text.substring(0, start)
            const after = text.substring(end)
            setBody(before + `[${selectedText}](${url})` + after)
          }
        }
        break
    }
  }

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setHistoryIndex(prev => prev - 1)
      setSubject(prevState.subject)
      setBody(prevState.body)
      toast.success('Undone', { duration: 1000 })
    } else {
      toast.error('Nothing to undo', { duration: 1500 })
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setHistoryIndex(prev => prev + 1)
      setSubject(nextState.subject)
      setBody(nextState.body)
      toast.success('Redone', { duration: 1000 })
    } else {
      toast.error('Nothing to redo', { duration: 1500 })
    }
  }

  const saveTemplate = () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name', { duration: 2000 })
      return
    }
    // Check if template name already exists
    if (savedTemplates.some(t => t.name.toLowerCase() === templateName.toLowerCase())) {
      toast.error('Template name already exists. Please choose a different name.', { duration: 3000 })
      return
    }
    const newTemplate: EmailTemplate = {
      id: `custom-${Date.now()}`,
      name: templateName,
      subject,
      body,
      category: 'Custom',
      isCustom: true
    }
    const updated = [...savedTemplates, newTemplate]
    setSavedTemplates(updated)
    localStorage.setItem('email-templates', JSON.stringify(updated))
    setShowSaveDialog(false)
    setTemplateName('')
    toast.success(`Template "${templateName}" saved successfully!`, { duration: 2500 })
  }

  const deleteTemplate = (id: string) => {
    const template = savedTemplates.find(t => t.id === id)
    const updated = savedTemplates.filter(t => t.id !== id)
    setSavedTemplates(updated)
    localStorage.setItem('email-templates', JSON.stringify(updated))
    if (selectedTemplate === id) {
      if (templates.length > 0) {
        loadTemplate(templates[0].id)
      }
    }
    toast.success(`Template "${template?.name || 'Template'}" deleted!`, { duration: 2000 })
  }

  const copyAsHTML = () => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${replaceVariables(subject, variableValues)}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #2563eb;">${replaceVariables(subject, variableValues)}</h2>
  <div style="white-space: pre-wrap;">${replaceVariables(body, variableValues).replace(/\n/g, '<br>')}</div>
</body>
</html>`
    navigator.clipboard.writeText(html)
    toast.success('HTML copied to clipboard!')
  }

  const copyAsPlainText = () => {
    const text = `Subject: ${replaceVariables(subject, variableValues)}\n\n${replaceVariables(body, variableValues)}`
    navigator.clipboard.writeText(text)
    toast.success('Plain text copied!')
  }

  const downloadAsHTML = () => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${replaceVariables(subject, variableValues)}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #2563eb;">${replaceVariables(subject, variableValues)}</h2>
  <div style="white-space: pre-wrap;">${replaceVariables(body, variableValues).replace(/\n/g, '<br>')}</div>
</body>
</html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'email-template.html'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('HTML file downloaded!')
  }

  const resetTemplate = () => {
    if (selectedTemplate) {
      const template = [...templates, ...savedTemplates].find(t => t.id === selectedTemplate)
      if (template) {
        setSubject(template.subject)
        setBody(template.body)
        toast.success('Template reset to original!', { duration: 2000 })
      }
    } else {
      toast.error('No template selected to reset', { duration: 2000 })
    }
  }

  const previewSubject = replaceVariables(subject, variableValues)
  const previewBody = replaceVariables(body, variableValues)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      <main className="flex-grow py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex p-2 sm:p-3 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 mb-3 sm:mb-4 shadow-lg">
              <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2 sm:mb-3">
              Email Template Builder
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 px-4">Create professional email templates with preview and variable replacement</p>
            <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-1 bg-gray-100 rounded">Ctrl/Cmd + S to save</span>
              <span className="px-2 py-1 bg-gray-100 rounded">Ctrl/Cmd + Z to undo</span>
              <span className="px-2 py-1 bg-gray-100 rounded">Ctrl/Cmd + P to preview</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column - Editor */}
            <div className="space-y-4 sm:space-y-6">
              {/* Template Selection */}
              <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <label className="block text-sm sm:text-base font-semibold text-gray-900">Choose Template</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSavedTemplates(!showSavedTemplates)}
                      className="px-3 py-1.5 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      <Save className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                      Saved ({savedTemplates.length})
                    </button>
                    <button
                      onClick={() => setShowSaveDialog(true)}
                      className="px-3 py-1.5 text-xs sm:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                      Save
                    </button>
                    <button
                      onClick={() => setShowMobileCategories(true)}
                      className="md:hidden px-3 py-1.5 text-xs sm:text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium flex items-center gap-1"
                      aria-label="Open template categories"
                    >
                      <Grid3x3 className="h-4 w-4" />
                      Categories
                    </button>
                  </div>
                </div>
                
              {/* Category Filter */}
              <div className="mb-3 sm:mb-4">
                <div className="hidden md:flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const isActive = templateCategory === cat
                    const categoryColors: Record<string, string> = {
                      'all': 'from-gray-500 to-gray-600',
                      'Welcome': 'from-green-500 to-emerald-600',
                      'Newsletter': 'from-blue-500 to-cyan-600',
                      'Promotional': 'from-orange-500 to-red-600',
                      'Transactional': 'from-purple-500 to-pink-600',
                      'Follow-up': 'from-indigo-500 to-blue-600',
                      'Thank You': 'from-yellow-500 to-orange-600',
                      'Announcement': 'from-red-500 to-pink-600',
                      'Invitation': 'from-pink-500 to-rose-600',
                      'Reminder': 'from-teal-500 to-cyan-600',
                      'Custom': 'from-violet-500 to-purple-600'
                    }
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setTemplateCategory(cat)
                          toast.success(`Filtered by: ${cat.charAt(0).toUpperCase() + cat.slice(1)}`, { duration: 1500 })
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                          isActive
                            ? `bg-gradient-to-r ${categoryColors[cat] || 'from-blue-500 to-indigo-600'} text-white shadow-md transform scale-105`
                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                        }`}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    )
                  })}
                </div>
              </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 sm:max-h-64 overflow-y-auto">
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => loadTemplate(template.id)}
                      className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all text-left ${
                        selectedTemplate === template.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>

              {/* Saved Templates */}
                {showSavedTemplates && savedTemplates.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Saved Templates</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {savedTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <button
                            onClick={() => loadTemplate(template.id)}
                            className={`flex-1 text-left text-xs sm:text-sm font-medium ${
                              selectedTemplate === template.id
                                ? 'text-blue-600'
                                : 'text-gray-700 hover:text-blue-600'
                            }`}
                          >
                            {template.name}
                          </button>
                          <button
                            onClick={() => deleteTemplate(template.id)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Subject */}
              <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
                <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="w-full px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm sm:text-base transition-all"
                />
              </div>

              {/* Body Editor */}
              <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <label className="block text-sm sm:text-base font-semibold text-gray-900">Body</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowRichText(!showRichText)}
                      className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                        showRichText ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title="Rich Text Formatting"
                    >
                      <Type className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={() => setShowVariableHelper(!showVariableHelper)}
                      className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                        showVariableHelper ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title="Variable Helper"
                    >
                      <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>

                {/* Rich Text Toolbar */}
                {showRichText && (
                  <div className="mb-3 p-2 bg-gray-50 rounded-lg flex flex-wrap gap-1 sm:gap-2">
                    <button
                      onClick={() => formatText('bold')}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Bold"
                    >
                      <Bold className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => formatText('italic')}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Italic"
                    >
                      <Italic className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => formatText('underline')}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Underline"
                    >
                      <Underline className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => formatText('link')}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Insert Link"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </button>
                    <div className="border-l border-gray-300 mx-1"></div>
                    <button
                      onClick={undo}
                      disabled={historyIndex <= 0}
                      className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Undo"
                    >
                      <Undo className="h-4 w-4" />
                    </button>
                    <button
                      onClick={redo}
                      disabled={historyIndex >= history.length - 1}
                      className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Redo"
                    >
                      <Redo className="h-4 w-4" />
                    </button>
                    <button
                      onClick={resetTemplate}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Reset Template"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Variable Helper */}
                {showVariableHelper && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-semibold text-blue-900">Quick Insert Variables</span>
                      <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {commonVariables.slice(0, 8).map((variable) => (
                        <button
                          key={variable}
                          onClick={() => insertVariable(variable)}
                          className="px-2 py-1 text-xs bg-white border border-blue-200 text-blue-700 rounded hover:bg-blue-100 transition-colors font-mono"
                        >
                          {`{{${variable}}}`}
                        </button>
                      ))}
                    </div>
                    {commonVariables.length > 8 && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-700 cursor-pointer hover:text-blue-900">Show more variables</summary>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {commonVariables.slice(8).map((variable) => (
                            <button
                              key={variable}
                              onClick={() => insertVariable(variable)}
                              className="px-2 py-1 text-xs bg-white border border-blue-200 text-blue-700 rounded hover:bg-blue-100 transition-colors font-mono"
                            >
                              {`{{${variable}}}`}
                            </button>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={12}
                  placeholder="Enter email body. Use {{variable}} for dynamic content."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm sm:text-base font-mono resize-y min-h-[200px] transition-all"
                />
              </div>

              {/* Variable Testing */}
              <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm sm:text-base font-semibold text-gray-900">Test Variables</label>
                  <button
                    onClick={() => {
                      const defaults: Record<string, string> = {}
                      commonVariables.forEach(v => {
                        defaults[v] = ''
                      })
                      setVariableValues(defaults)
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                  {commonVariables.slice(0, 6).map((variable) => (
                    <div key={variable} className="flex items-center gap-2">
                      <label className="text-xs sm:text-sm text-gray-600 w-24 sm:w-32 font-mono">{`{{${variable}}}`}</label>
                      <input
                        type="text"
                        value={variableValues[variable] || ''}
                        onChange={(e) => setVariableValues({ ...variableValues, [variable]: e.target.value })}
                        placeholder={`Enter ${variable}`}
                        className="flex-1 px-3 py-1.5 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                    </div>
                  ))}
                  {commonVariables.length > 6 && (
                    <details>
                      <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900 mb-2">Show more variables</summary>
                      <div className="space-y-2">
                        {commonVariables.slice(6).map((variable) => (
                          <div key={variable} className="flex items-center gap-2">
                            <label className="text-xs sm:text-sm text-gray-600 w-24 sm:w-32 font-mono">{`{{${variable}}}`}</label>
                            <input
                              type="text"
                              value={variableValues[variable] || ''}
                              onChange={(e) => setVariableValues({ ...variableValues, [variable]: e.target.value })}
                              placeholder={`Enter ${variable}`}
                              className="flex-1 px-3 py-1.5 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            />
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <button
                    onClick={copyAsPlainText}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="hidden sm:inline">Copy Text</span>
                    <span className="sm:hidden">Text</span>
                  </button>
                  <button
                    onClick={copyAsHTML}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Copy HTML</span>
                    <span className="sm:hidden">HTML</span>
                  </button>
                  <button
                    onClick={downloadAsHTML}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
                    <span className="sm:hidden">DL</span>
                  </button>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="hidden sm:inline">Preview</span>
                    <span className="sm:hidden">View</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Preview */}
            {showPreview && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Email Preview</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewMode('desktop')}
                        className={`p-2 rounded-lg transition-colors ${
                          previewMode === 'desktop'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Desktop View"
                      >
                        <Monitor className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        onClick={() => setPreviewMode('mobile')}
                        className={`p-2 rounded-lg transition-colors ${
                          previewMode === 'mobile'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Mobile View"
                      >
                        <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className={`bg-gray-100 rounded-lg p-4 sm:p-6 ${
                    previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
                  }`}>
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
                      <div className="border-b border-gray-200 pb-3 mb-4">
                        <div className="text-xs text-gray-500 mb-1">From: noreply@example.com</div>
                        <div className="text-xs text-gray-500 mb-1">To: {variableValues.email || 'recipient@example.com'}</div>
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">{previewSubject || 'Email Subject'}</div>
                      </div>
                      <div className="text-gray-900 text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
                        {previewBody || 'Email body will appear here...'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Save Template Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                  <Save className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Save Template</h3>
              </div>
              <button
                onClick={() => {
                  setShowSaveDialog(false)
                  setTemplateName('')
                }}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Template Name</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name (e.g., My Custom Email)"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveTemplate()
                  } else if (e.key === 'Escape') {
                    setShowSaveDialog(false)
                    setTemplateName('')
                  }
                }}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">Press Enter to save or Escape to cancel</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-800">
                <strong>Tip:</strong> Choose a descriptive name so you can easily find this template later.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={saveTemplate}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Save className="h-4 w-4 inline mr-2" />
                Save Template
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false)
                  setTemplateName('')
                }}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Keyboard shortcut: <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl/Cmd + S</kbd>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Categories Drawer */}
      {showMobileCategories && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
            onClick={() => setShowMobileCategories(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-gray-900">Template Categories</h3>
              <button
                onClick={() => setShowMobileCategories(false)}
                className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const isActive = templateCategory === cat
                const categoryColors: Record<string, string> = {
                  'all': 'from-gray-500 to-gray-600',
                  'Welcome': 'from-green-500 to-emerald-600',
                  'Newsletter': 'from-blue-500 to-cyan-600',
                  'Promotional': 'from-orange-500 to-red-600',
                  'Transactional': 'from-purple-500 to-pink-600',
                  'Follow-up': 'from-indigo-500 to-blue-600',
                  'Thank You': 'from-yellow-500 to-orange-600',
                  'Announcement': 'from-red-500 to-pink-600',
                  'Invitation': 'from-pink-500 to-rose-600',
                  'Reminder': 'from-teal-500 to-cyan-600',
                  'Custom': 'from-violet-500 to-purple-600'
                }
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setTemplateCategory(cat)
                      setShowMobileCategories(false)
                      toast.success(`Filtered by: ${cat.charAt(0).toUpperCase() + cat.slice(1)}`, { duration: 1500 })
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? `bg-gradient-to-r ${categoryColors[cat] || 'from-blue-500 to-indigo-600'} text-white shadow-md`
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <MobileBottomAd adKey="36d691042d95ac1ac33375038ec47a5c" />
      <Footer />
    </div>
  )
}

