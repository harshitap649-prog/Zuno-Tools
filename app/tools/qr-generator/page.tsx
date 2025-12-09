'use client'

import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import Footer from '@/components/Footer'
import SidebarAd from '@/components/SidebarAd'
import MobileBottomAd from '@/components/MobileBottomAd'
import { 
  QrCode as QrCodeIcon, Download, Copy, Check, Share2, 
  RefreshCw, Settings, Info, FileImage, FileText, 
  Link as LinkIcon, Mail, Phone, MessageSquare, Wifi,
  User, Calendar, MapPin, Globe, Type, Image as ImageIcon,
  Maximize2, Palette, Sparkles, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

type QRType = 'text' | 'url' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard' | 'event'

interface QRData {
  type: QRType
  content: string
  [key: string]: any
}

export default function QRGenerator() {
  const [qrType, setQrType] = useState<QRType>('text')
  const [text, setText] = useState('')
  const [size, setSize] = useState(256)
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [fgColor, setFgColor] = useState('#000000')
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [margin, setMargin] = useState(4)
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [logoSize, setLogoSize] = useState(60)
  const [copied, setCopied] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const { triggerPopunder } = usePopunderAd()

  // QR Type specific fields
  const [email, setEmail] = useState({ address: '', subject: '', body: '' })
  const [phone, setPhone] = useState('')
  const [sms, setSms] = useState({ number: '', message: '' })
  const [wifi, setWifi] = useState({ ssid: '', password: '', security: 'WPA', hidden: false })
  const [vcard, setVcard] = useState({ 
    name: '', org: '', tel: '', email: '', url: '', address: '', note: '' 
  })
  const [event, setEvent] = useState({ 
    title: '', description: '', location: '', start: '', end: '' 
  })

  const presets = [
    { name: 'Website', type: 'url' as QRType, content: 'https://example.com' },
    { name: 'Email', type: 'email' as QRType, content: 'contact@example.com' },
    { name: 'Phone', type: 'phone' as QRType, content: '+1234567890' },
    { name: 'Text', type: 'text' as QRType, content: 'Hello World' },
  ]

  const getQRContent = (): string => {
    switch (qrType) {
      case 'url':
        return text.startsWith('http') ? text : `https://${text}`
      case 'email':
        const emailParams = new URLSearchParams()
        if (email.subject) emailParams.set('subject', email.subject)
        if (email.body) emailParams.set('body', email.body)
        const emailQuery = emailParams.toString()
        return `mailto:${email.address}${emailQuery ? '?' + emailQuery : ''}`
      case 'phone':
        return `tel:${phone}`
      case 'sms':
        const smsParams = new URLSearchParams()
        if (sms.message) smsParams.set('body', sms.message)
        const smsQuery = smsParams.toString()
        return `sms:${sms.number}${smsQuery ? '?' + smsQuery : ''}`
      case 'wifi':
        return `WIFI:T:${wifi.security};S:${wifi.ssid};P:${wifi.password};H:${wifi.hidden ? 'true' : 'false'};;`
      case 'vcard':
        let vcardData = 'BEGIN:VCARD\nVERSION:3.0\n'
        if (vcard.name) vcardData += `FN:${vcard.name}\n`
        if (vcard.org) vcardData += `ORG:${vcard.org}\n`
        if (vcard.tel) vcardData += `TEL:${vcard.tel}\n`
        if (vcard.email) vcardData += `EMAIL:${vcard.email}\n`
        if (vcard.url) vcardData += `URL:${vcard.url}\n`
        if (vcard.address) vcardData += `ADR:${vcard.address}\n`
        if (vcard.note) vcardData += `NOTE:${vcard.note}\n`
        vcardData += 'END:VCARD'
        return vcardData
      case 'event':
        let eventData = 'BEGIN:VEVENT\n'
        if (event.title) eventData += `SUMMARY:${event.title}\n`
        if (event.description) eventData += `DESCRIPTION:${event.description}\n`
        if (event.location) eventData += `LOCATION:${event.location}\n`
        if (event.start) eventData += `DTSTART:${event.start.replace(/[-:]/g, '').replace(' ', 'T')}\n`
        if (event.end) eventData += `DTEND:${event.end.replace(/[-:]/g, '').replace(' ', 'T')}\n`
        eventData += 'END:VEVENT'
        return eventData
      default:
        return text
    }
  }

  useEffect(() => {
    const content = getQRContent()
    if (content.trim() && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      // Set canvas size
      canvas.width = size
      canvas.height = size

      // Generate QR code
      QRCode.toCanvas(canvas, content, {
        width: size,
        margin: margin,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorCorrectionLevel,
      }, async (error) => {
        if (error) {
          toast.error('Failed to generate QR code')
          return
        }

        // Add logo if provided
        if (logoUrl && ctx) {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            const logoSizePx = logoSize
            const x = (size - logoSizePx) / 2
            const y = (size - logoSizePx) / 2
            
            // Draw white background for logo
            ctx.fillStyle = bgColor
            ctx.fillRect(x - 5, y - 5, logoSizePx + 10, logoSizePx + 10)
            
            // Draw logo
            ctx.drawImage(img, x, y, logoSizePx, logoSizePx)
            setQrCodeUrl(canvas.toDataURL())
          }
          img.onerror = () => {
            toast.error('Failed to load logo image')
            setQrCodeUrl(canvas.toDataURL())
          }
          img.src = logoUrl
        } else {
          setQrCodeUrl(canvas.toDataURL())
        }
      })
    }
  }, [text, size, bgColor, fgColor, errorCorrectionLevel, margin, logoUrl, logoSize, qrType, email, phone, sms, wifi, vcard, event])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 500000) {
        toast.error('Logo file too large. Max 500KB')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setLogoUrl(event.target?.result as string)
        toast.success('Logo added!', { duration: 2000 })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoUrl('')
    toast.success('Logo removed!', { duration: 2000 })
  }

  const downloadQR = (format: 'png' | 'svg' = 'png') => {
    const content = getQRContent()
    if (!content.trim()) {
      toast.error('Please enter content to generate QR code')
      return
    }

    if (format === 'png') {
      if (!qrCodeUrl) return
      const link = document.createElement('a')
      link.download = `qrcode-${Date.now()}.png`
      link.href = qrCodeUrl
      link.click()
      toast.success('QR code downloaded as PNG!', { icon: '📥', duration: 3000 })
    } else if (format === 'svg') {
      QRCode.toString(content, {
        type: 'svg',
        width: size,
        margin: margin,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorCorrectionLevel,
      }, (err, svgString) => {
        if (err) {
          toast.error('Failed to generate SVG')
          return
        }
        const blob = new Blob([svgString], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `qrcode-${Date.now()}.svg`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
        toast.success('QR code downloaded as SVG!', { icon: '📥', duration: 3000 })
      })
    }
    
    setTimeout(() => {
      triggerPopunder()
    }, 2000)
  }

  const copyToClipboard = async () => {
    if (!qrCodeUrl) {
      toast.error('No QR code to copy')
      return
    }
    
    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      setCopied(true)
      toast.success('QR code copied to clipboard!', { icon: '📋', duration: 3000 })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy QR code')
    }
  }

  const shareQR = async () => {
    if (!qrCodeUrl) {
      toast.error('No QR code to share')
      return
    }
    
    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      const file = new File([blob], `qrcode-${Date.now()}.png`, { type: 'image/png' })
      
      if (navigator.share) {
        await navigator.share({
          title: 'QR Code',
          text: `QR Code: ${getQRContent()}`,
          files: [file]
        })
        toast.success('QR code shared!', { duration: 2000 })
      } else {
        copyToClipboard()
      }
    } catch (error) {
      toast.error('Sharing not supported or failed')
    }
  }

  const applyPreset = (preset: typeof presets[0]) => {
    setQrType(preset.type)
    if (preset.type === 'text' || preset.type === 'url') {
      setText(preset.content)
    }
    toast.success(`Applied preset: ${preset.name}`, { duration: 2000 })
  }

  const resetSettings = () => {
    setSize(256)
    setBgColor('#FFFFFF')
    setFgColor('#000000')
    setMargin(4)
    setErrorCorrectionLevel('M')
    setLogoUrl('')
    setLogoSize(60)
    toast.success('Settings reset!', { duration: 2000 })
  }

  const qrContent = getQRContent()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SidebarAd position="left" adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      <SidebarAd position="right" adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      
      <main className="flex-grow py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="relative inline-flex items-center justify-center mb-3 sm:mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
              <div className="relative inline-flex p-2 sm:p-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 shadow-lg">
                <QrCodeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">
              QR Code Generator
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-4">Generate QR codes for URLs, text, and more</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Panel - Controls */}
            <div className="space-y-4 sm:space-y-6">
              {/* QR Type Selection */}
              <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl sm:rounded-2xl shadow-xl border-2 border-purple-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Type className="h-5 w-5 text-purple-600" />
                  QR Code Type
                </h2>
                
                {/* Quick Presets */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Quick Presets</label>
                  <div className="grid grid-cols-2 gap-2">
                    {presets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => applyPreset(preset)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all text-xs sm:text-sm"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type Selector */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Select Type</label>
                  <select
                    value={qrType}
                    onChange={(e) => setQrType(e.target.value as QRType)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                  >
                    <option value="text">Text</option>
                    <option value="url">URL/Website</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone Number</option>
                    <option value="sms">SMS</option>
                    <option value="wifi">WiFi Network</option>
                    <option value="vcard">vCard (Contact)</option>
                    <option value="event">Calendar Event</option>
                  </select>
                </div>

                {/* Type-specific inputs */}
                {qrType === 'text' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Text Content</label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Enter text..."
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium resize-none"
                    />
                  </div>
                )}

                {qrType === 'url' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-purple-600" />
                      Website URL
                    </label>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                    />
                  </div>
                )}

                {qrType === 'email' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-purple-600" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email.address}
                        onChange={(e) => setEmail({ ...email, address: e.target.value })}
                        placeholder="contact@example.com"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Subject (Optional)</label>
                      <input
                        type="text"
                        value={email.subject}
                        onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                        placeholder="Email subject"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Body (Optional)</label>
                      <textarea
                        value={email.body}
                        onChange={(e) => setEmail({ ...email, body: e.target.value })}
                        placeholder="Email body"
                        rows={2}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium resize-none"
                      />
                    </div>
                  </div>
                )}

                {qrType === 'phone' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-purple-600" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1234567890"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                    />
                  </div>
                )}

                {qrType === 'sms' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={sms.number}
                        onChange={(e) => setSms({ ...sms, number: e.target.value })}
                        placeholder="+1234567890"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Message (Optional)</label>
                      <textarea
                        value={sms.message}
                        onChange={(e) => setSms({ ...sms, message: e.target.value })}
                        placeholder="SMS message"
                        rows={2}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium resize-none"
                      />
                    </div>
                  </div>
                )}

                {qrType === 'wifi' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-purple-600" />
                        Network Name (SSID)
                      </label>
                      <input
                        type="text"
                        value={wifi.ssid}
                        onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                        placeholder="WiFi Network Name"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
                      <input
                        type="password"
                        value={wifi.password}
                        onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                        placeholder="WiFi Password"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Security Type</label>
                      <select
                        value={wifi.security}
                        onChange={(e) => setWifi({ ...wifi, security: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                      >
                        <option value="WPA">WPA/WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">No Password</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="hidden"
                        checked={wifi.hidden}
                        onChange={(e) => setWifi({ ...wifi, hidden: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="hidden" className="text-sm font-medium text-gray-900">
                        Hidden Network
                      </label>
                    </div>
                  </div>
                )}

                {qrType === 'vcard' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <User className="h-4 w-4 text-purple-600" />
                        Name
                      </label>
                      <input
                        type="text"
                        value={vcard.name}
                        onChange={(e) => setVcard({ ...vcard, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Organization</label>
                        <input
                          type="text"
                          value={vcard.org}
                          onChange={(e) => setVcard({ ...vcard, org: e.target.value })}
                          placeholder="Company"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={vcard.tel}
                          onChange={(e) => setVcard({ ...vcard, tel: e.target.value })}
                          placeholder="+1234567890"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                      <input
                        type="email"
                        value={vcard.email}
                        onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                        placeholder="email@example.com"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Website</label>
                      <input
                        type="url"
                        value={vcard.url}
                        onChange={(e) => setVcard({ ...vcard, url: e.target.value })}
                        placeholder="https://example.com"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Address</label>
                      <input
                        type="text"
                        value={vcard.address}
                        onChange={(e) => setVcard({ ...vcard, address: e.target.value })}
                        placeholder="Street, City, Country"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Notes</label>
                      <textarea
                        value={vcard.note}
                        onChange={(e) => setVcard({ ...vcard, note: e.target.value })}
                        placeholder="Additional notes"
                        rows={2}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium resize-none"
                      />
                    </div>
                  </div>
                )}

                {qrType === 'event' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        Event Title
                      </label>
                      <input
                        type="text"
                        value={event.title}
                        onChange={(e) => setEvent({ ...event, title: e.target.value })}
                        placeholder="Meeting Title"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                      <textarea
                        value={event.description}
                        onChange={(e) => setEvent({ ...event, description: e.target.value })}
                        placeholder="Event description"
                        rows={2}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-purple-600" />
                        Location
                      </label>
                      <input
                        type="text"
                        value={event.location}
                        onChange={(e) => setEvent({ ...event, location: e.target.value })}
                        placeholder="Event location"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Start Date & Time</label>
                        <input
                          type="datetime-local"
                          value={event.start}
                          onChange={(e) => setEvent({ ...event, start: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">End Date & Time</label>
                        <input
                          type="datetime-local"
                          value={event.end}
                          onChange={(e) => setEvent({ ...event, end: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Appearance Settings */}
              <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl sm:rounded-2xl shadow-xl border-2 border-purple-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-600" />
                  Appearance
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Size: {size}px
                    </label>
                    <input
                      type="range"
                      min="128"
                      max="512"
                      step="32"
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Background</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-12 h-11 rounded-lg border-2 border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="flex-1 h-11 px-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium text-sm"
                          placeholder="#FFFFFF"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Foreground</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="w-12 h-11 rounded-lg border-2 border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="flex-1 h-11 px-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium text-sm"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Margin: {margin}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={margin}
                      onChange={(e) => setMargin(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Error Correction Level
                    </label>
                    <select
                      value={errorCorrectionLevel}
                      onChange={(e) => setErrorCorrectionLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                    >
                      <option value="L">Low (~7%)</option>
                      <option value="M">Medium (~15%)</option>
                      <option value="Q">Quartile (~25%)</option>
                      <option value="H">High (~30%)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Higher levels allow more damage before becoming unreadable
                    </p>
                  </div>
                </div>

                {/* Advanced Settings Toggle */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-sm mt-4"
                >
                  <Settings className="h-4 w-4" />
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
                </button>

                {/* Advanced Settings */}
                {showAdvanced && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 mt-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-purple-600" />
                        Logo/Image (Optional)
                      </label>
                      {logoUrl ? (
                        <div className="space-y-2">
                          <div className="relative inline-block">
                            <img src={logoUrl} alt="Logo" className="w-20 h-20 object-contain rounded-lg border-2 border-gray-300" />
                            <button
                              onClick={removeLogo}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-900 mb-1">
                              Logo Size: {logoSize}px
                            </label>
                            <input
                              type="range"
                              min="30"
                              max="120"
                              step="10"
                              value={logoSize}
                              onChange={(e) => setLogoSize(Number(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => logoInputRef.current?.click()}
                          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 transition-all text-gray-600 font-medium"
                        >
                          <ImageIcon className="h-5 w-5 mx-auto mb-1" />
                          <span className="text-sm">Add Logo/Image</span>
                        </button>
                      )}
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </div>

                    <button
                      onClick={resetSettings}
                      className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reset Settings
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl sm:rounded-2xl shadow-xl border-2 border-purple-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Maximize2 className="h-5 w-5 text-purple-600" />
                  Preview
                </h2>
                <div className="flex gap-2">
                  {qrContent.trim() && (
                    <>
                      <button
                        onClick={copyToClipboard}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={shareQR}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                        title="Share QR code"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div 
                className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 md:p-8 bg-gray-50 min-h-[250px] sm:min-h-[300px] md:min-h-[400px]"
                style={{ backgroundColor: bgColor }}
              >
                {qrContent.trim() ? (
                  <div className="flex flex-col items-center">
                    <canvas 
                      ref={canvasRef} 
                      className="max-w-full h-auto"
                      style={{ maxHeight: '400px' }}
                    />
                    {qrType !== 'text' && (
                      <p className="text-xs text-gray-500 mt-2 text-center max-w-xs break-all">
                        {qrContent.length > 100 ? qrContent.substring(0, 100) + '...' : qrContent}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <QrCodeIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-2 opacity-50" />
                    <p className="text-sm sm:text-base">Enter content to generate QR code</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {qrContent.trim() && (
                <div className="mt-4 sm:mt-6 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => downloadQR('png')}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95 touch-manipulation min-h-[48px]"
                    >
                      <FileImage className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>PNG</span>
                    </button>
                    <button
                      onClick={() => downloadQR('svg')}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95 touch-manipulation min-h-[48px]"
                    >
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>SVG</span>
                    </button>
                  </div>
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
