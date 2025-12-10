'use client'

import { useState, useRef, useEffect } from 'react'
import Footer from '@/components/Footer'
import MobileBottomNavWrapper from '@/components/MobileBottomNavWrapper'
import SidebarAd from '@/components/SidebarAd'
import MobileBottomAd from '@/components/MobileBottomAd'
import { 
  Mic, Play, Pause, Volume2, Download, FileText, 
  Globe, Music, Share2, Copy, Check, Loader2, RotateCw,
  SkipBack, SkipForward, Repeat, Settings, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

interface Voice {
  name: string
  lang: string
  default?: boolean
  localService?: boolean
  voiceURI: string
}

interface Preset {
  name: string
  rate: number
  pitch: number
  volume: number
  description: string
}

const presets: Preset[] = [
  { name: 'Slow & Clear', rate: 0.7, pitch: 1.0, volume: 1.0, description: 'Easy to understand' },
  { name: 'Normal', rate: 1.0, pitch: 1.0, volume: 1.0, description: 'Standard speed' },
  { name: 'Fast Narration', rate: 1.5, pitch: 1.0, volume: 1.0, description: 'Quick reading' },
  { name: 'Dramatic', rate: 0.9, pitch: 0.8, volume: 1.0, description: 'Deep and expressive' },
  { name: 'Energetic', rate: 1.3, pitch: 1.2, volume: 1.0, description: 'High energy' },
  { name: 'Calm', rate: 0.8, pitch: 0.9, volume: 0.9, description: 'Relaxing tone' },
]

const examples = [
  'Hello! Welcome to our text to speech converter. This tool can help you convert any text into natural-sounding speech.',
  'The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.',
  'In a world where technology continues to evolve, text-to-speech technology has become an essential tool for accessibility and convenience.',
  'Once upon a time, in a land far away, there lived a wise old wizard who could speak all languages of the world.',
  'Today is a beautiful day. The sun is shining, birds are singing, and everything seems perfect.',
]

export default function TextToSpeech() {
  const [text, setText] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')
  const [voice, setVoice] = useState<string>('')
  const [voices, setVoices] = useState<Voice[]>([])
  const [pauseType, setPauseType] = useState<'none' | 'short' | 'medium' | 'long'>('none')
  const [sentenceBreaks, setSentenceBreaks] = useState(true)
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)
  const [progress, setProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [wordsPerMinute, setWordsPerMinute] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const [loop, setLoop] = useState(false)
  const [backgroundMusic, setBackgroundMusic] = useState(false)
  const [musicVolume, setMusicVolume] = useState(0.3)
  const [shareLink, setShareLink] = useState<string>('')
  const [linkCopied, setLinkCopied] = useState(false)
  
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const wordsRef = useRef<string[]>([])
  const { triggerPopunder } = usePopunderAd()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis
      
      const loadVoices = () => {
        const availableVoices = synthRef.current?.getVoices() || []
        setVoices(availableVoices as Voice[])
      }
      
      loadVoices()
      synthRef.current?.addEventListener('voiceschanged', loadVoices)
      
      return () => {
        synthRef.current?.removeEventListener('voiceschanged', loadVoices)
      }
    }
  }, [])

  useEffect(() => {
    // Calculate reading time and words per minute
    if (text.trim()) {
      const words = text.trim().split(/\s+/).length
      const estimatedTime = (words / (rate * 150)) * 60 // 150 WPM base
      setReadingTime(Math.ceil(estimatedTime))
      setWordsPerMinute(Math.round(words / (estimatedTime / 60)))
      wordsRef.current = text.trim().split(/\s+/)
    } else {
      setReadingTime(0)
      setWordsPerMinute(0)
      wordsRef.current = []
    }
  }, [text, rate])

  // Auto-detect language
  const detectLanguage = (text: string): string => {
    // Simple language detection based on common patterns
    const patterns: { [key: string]: RegExp } = {
      'en': /[a-zA-Z]/,
      'es': /[áéíóúñü]/i,
      'fr': /[àâäéèêëïîôùûüÿç]/i,
      'de': /[äöüß]/i,
      'it': /[àèéìíîòóùú]/i,
      'pt': /[ãõáéíóúâêô]/i,
      'ru': /[а-яё]/i,
      'zh': /[\u4e00-\u9fff]/,
      'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
      'ko': /[\uac00-\ud7a3]/,
      'ar': /[\u0600-\u06ff]/,
    }
    
    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return lang
      }
    }
    return 'en'
  }

  const filteredVoices = selectedLanguage
    ? voices.filter(v => v.lang.startsWith(selectedLanguage))
    : voices

  const languages = Array.from(new Set(voices.map(v => v.lang.split('-')[0]))).sort()

  const addPause = (text: string, pauseType: string): string => {
    if (pauseType === 'none') return text
    
    const pauseMap = {
      short: '...',
      medium: '....',
      long: '.....'
    }
    
    return text.replace(/\s+/g, ` ${pauseMap[pauseType as keyof typeof pauseMap]} `)
  }

  const addSentenceBreaks = (text: string): string => {
    if (!sentenceBreaks) return text
    return text.replace(/([.!?])\s+/g, '$1 ... ')
  }

  const processText = (inputText: string): string => {
    let processed = inputText
    if (sentenceBreaks) {
      processed = addSentenceBreaks(processed)
    }
    if (pauseType !== 'none') {
      processed = addPause(processed, pauseType)
    }
    return processed
  }

  const speak = () => {
    if (!text.trim()) {
      toast.error('Please enter some text to speak')
      return
    }

    if (synthRef.current && synthRef.current.speaking && !isPaused) {
      synthRef.current.cancel()
    }

    const processedText = processText(text)
    const utterance = new SpeechSynthesisUtterance(processedText)
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    if (voice) {
      const selectedVoice = filteredVoices.find(v => v.name === voice)
      if (selectedVoice) {
        utterance.voice = selectedVoice as SpeechSynthesisVoice
      }
    } else if (selectedLanguage) {
      const langVoice = filteredVoices.find(v => v.lang.startsWith(selectedLanguage))
      if (langVoice) {
        utterance.voice = langVoice as SpeechSynthesisVoice
      }
    }

    let currentIndex = 0
    const words = text.trim().split(/\s+/)
    const wordDuration = (readingTime * 1000) / words.length

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const wordIndex = words.findIndex((w, i) => {
          const charIndex = text.indexOf(w, i > 0 ? text.indexOf(words[i - 1]) + words[i - 1].length : 0)
          return charIndex <= event.charIndex && event.charIndex < charIndex + w.length
        })
        if (wordIndex !== -1) {
          setCurrentWordIndex(wordIndex)
        }
      }
    }

    utterance.onstart = () => {
      setIsPlaying(true)
      setIsPaused(false)
      setProgress(0)
      setCurrentWordIndex(0)
      const duration = readingTime * 1000
      setTimeRemaining(duration)
      
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + 100, 100)
          setTimeRemaining(prevTime => Math.max(0, prevTime - 100))
          return newProgress
        })
      }, 100)
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
      setCurrentWordIndex(-1)
      setProgress(100)
      setTimeRemaining(0)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      if (loop) {
        setTimeout(() => speak(), 500)
      }
    }

    utterance.onerror = () => {
      toast.error('Error occurred during speech synthesis')
      setIsPlaying(false)
      setIsPaused(false)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }

    utteranceRef.current = utterance
    synthRef.current?.speak(utterance)
  }

  const pause = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.pause()
      setIsPaused(true)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }

  const resume = () => {
    if (synthRef.current && synthRef.current.paused) {
      synthRef.current.resume()
      setIsPaused(false)
      const duration = readingTime * 1000
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + 100, 100)
          setTimeRemaining(prevTime => Math.max(0, prevTime - 100))
          return newProgress
        })
      }, 100)
    }
  }

  const stop = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsPlaying(false)
      setIsPaused(false)
      setCurrentWordIndex(-1)
      setProgress(0)
      setTimeRemaining(0)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }

  const applyPreset = (preset: Preset) => {
    setRate(preset.rate)
    setPitch(preset.pitch)
    setVolume(preset.volume)
    toast.success(`Applied "${preset.name}" preset`)
  }

  const loadExample = (example: string) => {
    setText(example)
    toast.success('Example loaded!')
  }

  const downloadAudio = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text first')
      return
    }

    try {
      toast.loading('Generating audio file...', { id: 'download-audio' })

      const processedText = processText(text)
      const lang = selectedLanguage || detectLanguage(text) || 'en'
      
      // Split text into chunks (Google TTS has character limits)
      const maxChunkLength = 200
      const textChunks = processedText.match(new RegExp(`.{1,${maxChunkLength}}`, 'g')) || [processedText]
      
      const audioBlobs: Blob[] = []
      
      // Generate audio for each chunk
      for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i]
        const encodedChunk = encodeURIComponent(chunk)
        
        // Use Google Translate TTS API (free, public endpoint)
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedChunk}&tl=${lang}&client=tw-ob&idx=${i}&total=${textChunks.length}&textlen=${chunk.length}`
        
        try {
          const response = await fetch(ttsUrl, {
            method: 'GET',
            headers: {
              'Referer': 'https://translate.google.com/',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          })

          if (response.ok) {
            const blob = await response.blob()
            if (blob.size > 0) {
              audioBlobs.push(blob)
            }
          }
        } catch (chunkError) {
          console.warn(`Error fetching chunk ${i}:`, chunkError)
        }
        
        // Small delay between requests to avoid rate limiting
        if (i < textChunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      }

      if (audioBlobs.length === 0) {
        throw new Error('Failed to generate audio. Please try again or use the Speak button.')
      }

      // Combine all audio blobs into one
      const combinedBlob = audioBlobs.length === 1 
        ? audioBlobs[0]
        : new Blob(audioBlobs, { type: 'audio/mpeg' })

      // Create download link
      const audioUrl = URL.createObjectURL(combinedBlob)
      const link = document.createElement('a')
      link.href = audioUrl
      link.download = `text-to-speech-${Date.now()}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up after a delay
      setTimeout(() => {
        URL.revokeObjectURL(audioUrl)
      }, 100)

      toast.success('Audio downloaded successfully!', { id: 'download-audio' })
      
      // Trigger popunder after download
      setTimeout(() => {
        triggerPopunder()
      }, 2000)
    } catch (error: any) {
      console.error('Error downloading audio:', error)
      
      // Fallback message with helpful instructions
      toast.error('Download feature is currently unavailable. We\'re working on bringing it back soon!', {
        id: 'download-audio',
        duration: 5000
      })
      
      // Auto-trigger speak as fallback
      setTimeout(() => {
        speak()
      }, 2000)
    }
  }

  const generateShareLink = () => {
    const params = new URLSearchParams({
      text: encodeURIComponent(text),
      rate: rate.toString(),
      pitch: pitch.toString(),
      volume: volume.toString(),
      lang: selectedLanguage || detectLanguage(text),
    })
    const link = `${window.location.origin}${window.location.pathname}?${params.toString()}`
    setShareLink(link)
    navigator.clipboard.writeText(link).then(() => {
      setLinkCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setLinkCopied(false), 2000)
    })
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const highlightText = (text: string, currentIndex: number): JSX.Element[] => {
    const words = text.split(/(\s+)/)
    return words.map((word, index) => {
      const wordIndex = Math.floor(index / 2)
      const isCurrent = wordIndex === currentIndex && currentIndex !== -1
      return (
        <span
          key={index}
          className={isCurrent ? 'bg-yellow-300 px-1 rounded transition-all' : ''}
        >
          {word}
        </span>
      )
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-pink-50/30 to-rose-50/20">
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="36d691042d95ac1ac33375038ec47a5c" />
      <SidebarAd position="right" adKey="36d691042d95ac1ac33375038ec47a5c" />
      
      <main className="flex-grow py-3 sm:py-5 md:py-8 pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
              <Mic className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">Text to Speech</h1>
            <p className="text-gray-900">Convert text to natural-sounding speech with advanced controls</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
              {/* Text Input */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-4 sm:p-5 md:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 sm:mb-4">
                  <label className="block text-sm sm:text-base font-bold text-gray-900 flex items-center space-x-2">
                    <span className="w-1 h-5 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></span>
                    <span>Enter Text</span>
                  </label>
                </div>
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type or paste the text you want to convert to speech..."
                    rows={8}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none text-gray-900 text-sm sm:text-base bg-white"
                  />
                  {isPlaying && currentWordIndex >= 0 && (
                    <div className="absolute top-3 left-4 right-4 pointer-events-none text-sm sm:text-base leading-relaxed">
                      {highlightText(text, currentWordIndex)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mt-3">
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded-lg font-medium">{text.length} chars</span>
                    <span className="bg-gray-100 px-2 py-1 rounded-lg font-medium">{text.trim().split(/\s+/).filter(w => w).length} words</span>
                    {readingTime > 0 && (
                      <>
                        <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-lg font-medium">~{readingTime}s</span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-medium">{wordsPerMinute} WPM</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {examples.slice(0, 2).map((example, idx) => (
                      <button
                        key={idx}
                        onClick={() => loadExample(example)}
                        className="px-2.5 py-1.5 text-xs bg-gradient-to-r from-pink-100 to-rose-100 hover:from-pink-200 hover:to-rose-200 text-pink-700 rounded-lg transition-all font-semibold active:scale-95 touch-manipulation"
                      >
                        Example {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {isPlaying && (
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-4 sm:p-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs sm:text-sm font-bold text-gray-900 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
                      <span>Progress</span>
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-lg">{formatTime(timeRemaining / 1000)} remaining</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 mb-2 overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 h-3 sm:h-4 rounded-full transition-all duration-100 shadow-lg"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm text-gray-500 font-medium">
                    <span>0:00</span>
                    <span>{formatTime(readingTime)}</span>
                  </div>
                </div>
              )}

              {/* Quick Presets */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-4 sm:p-5 md:p-6">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500">
                    <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span>Quick Presets</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {presets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 via-pink-50/20 to-rose-50/20 border-2 border-gray-200 rounded-xl hover:border-pink-400 hover:shadow-lg hover:scale-[1.02] transition-all text-left group active:scale-95 touch-manipulation"
                    >
                      <div className="font-bold text-xs sm:text-sm text-gray-900 mb-1 group-hover:text-pink-700">{preset.name}</div>
                      <div className="text-[10px] sm:text-xs text-gray-600">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Examples */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-4 sm:p-5 md:p-6">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                    <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span>Pre-written Examples</span>
                </h3>
                <div className="space-y-2 sm:space-y-2.5">
                  {examples.map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadExample(example)}
                      className="w-full p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-blue-50/30 hover:from-pink-50 hover:to-rose-50/30 border-2 border-gray-200 hover:border-pink-300 rounded-xl text-left transition-all group shadow-sm hover:shadow-md active:scale-[0.98] touch-manipulation"
                    >
                      <div className="text-xs sm:text-sm text-gray-700 line-clamp-2 group-hover:text-gray-900 font-medium">
                        {example}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Controls Sidebar */}
            <div className="space-y-3 sm:space-y-4 md:space-y-5">
              {/* Voice Settings */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-4 sm:p-5">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500">
                    <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span>Voice Settings</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => {
                        setSelectedLanguage(e.target.value)
                        if (e.target.value) {
                        const autoDetected = detectLanguage(text)
                        if (autoDetected !== e.target.value && text.trim()) {
                          toast.success(`Auto-detected: ${autoDetected}, but you selected: ${e.target.value}`)
                        }
                        }
                      }}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm text-gray-900 bg-white font-medium shadow-sm hover:border-pink-300 transition-colors"
                    >
                      <option value="">Auto-detect</option>
                      {languages.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Voice
                    </label>
                    <select
                      value={voice}
                      onChange={(e) => setVoice(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm text-gray-900 bg-white font-medium shadow-sm hover:border-pink-300 transition-colors"
                    >
                      <option value="">Default Voice</option>
                      {filteredVoices.map((v, index) => (
                        <option key={index} value={v.name}>
                          {v.name} {v.lang && `(${v.lang})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Speech Controls */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-4 sm:p-5">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
                    <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span>Speech Controls</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Speed: {rate.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600 hover:accent-pink-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Pitch: {pitch.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={pitch}
                      onChange={(e) => setPitch(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600 hover:accent-pink-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Volume: {Math.round(volume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600 hover:accent-pink-700"
                    />
                  </div>
                </div>
              </div>

              {/* Pause Settings */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-4 sm:p-5">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                    <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span>Pause Settings</span>
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Word Pauses
                    </label>
                    <select
                      value={pauseType}
                      onChange={(e) => setPauseType(e.target.value as any)}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm text-gray-900 bg-white font-medium shadow-sm hover:border-pink-300 transition-colors"
                    >
                      <option value="none">None</option>
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="sentenceBreaks"
                      checked={sentenceBreaks}
                      onChange={(e) => setSentenceBreaks(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <label htmlFor="sentenceBreaks" className="text-xs sm:text-sm text-gray-700">
                      Add breaks between sentences
                    </label>
                  </div>
                </div>
              </div>

              {/* Export Settings (fixed best-supported format) */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-4 sm:p-5">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500">
                    <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span>Export Format</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-700">
                  Downloads use the most reliable browser format automatically (WEBM / OGG with Opus audio).
                </p>
              </div>

              {/* Background Music */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500">
                      <Music className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <span>Background Music</span>
                  </h3>
                  <input
                    type="checkbox"
                    checked={backgroundMusic}
                    onChange={(e) => setBackgroundMusic(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-pink-600 focus:ring-2 focus:ring-pink-500 cursor-pointer"
                  />
                </div>
                {backgroundMusic && (
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Music Volume: {Math.round(musicVolume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={musicVolume}
                      onChange={(e) => setMusicVolume(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600 hover:accent-pink-700"
                    />
                  </div>
                )}
              </div>

              {/* Playback Controls */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500">
                      <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <span>Playback</span>
                  </h3>
                  <div className="flex items-center space-x-2 bg-gray-100 px-2 py-1 rounded-lg">
                    <input
                      type="checkbox"
                      id="loop"
                      checked={loop}
                      onChange={(e) => setLoop(e.target.checked)}
                      className="w-4 h-4 rounded border-2 border-gray-300 text-pink-600 focus:ring-2 focus:ring-pink-500 cursor-pointer"
                    />
                    <label htmlFor="loop" className="text-xs sm:text-sm text-gray-700 flex items-center space-x-1 cursor-pointer">
                      <Repeat className="h-3.5 w-3.5" />
                      <span>Loop</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isPlaying ? (
                    <button
                      onClick={speak}
                      disabled={!text.trim()}
                      className="flex-1 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 text-white px-4 sm:px-5 py-3 rounded-xl font-bold text-sm sm:text-base hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 active:scale-95 touch-manipulation"
                    >
                      <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Speak</span>
                    </button>
                  ) : (
                    <>
                      {isPaused ? (
                        <button
                          onClick={resume}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-5 py-3 rounded-xl font-bold text-sm sm:text-base hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 active:scale-95 touch-manipulation"
                        >
                          <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>Resume</span>
                        </button>
                      ) : (
                        <button
                          onClick={pause}
                          className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 sm:px-5 py-3 rounded-xl font-bold text-sm sm:text-base hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 active:scale-95 touch-manipulation"
                        >
                          <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>Pause</span>
                        </button>
                      )}
                      <button
                        onClick={stop}
                        className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 sm:px-5 py-3 rounded-xl font-bold text-sm sm:text-base hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 active:scale-95 touch-manipulation"
                      >
                        <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={downloadAudio}
                  disabled={!text.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 text-white px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 active:scale-95 touch-manipulation"
                >
                  <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Download Audio</span>
                </button>
                <button
                  onClick={generateShareLink}
                  disabled={!text.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 active:scale-95 touch-manipulation"
                >
                  {linkCopied ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />}
                  <span>{linkCopied ? 'Link Copied!' : 'Share Link'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileBottomAd adKey="36d691042d95ac1ac33375038ec47a5c" />
      <Footer />
      <MobileBottomNavWrapper />
    </div>
  )
}

