'use client'

import { useState, useRef } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Mic, Play, Pause, Volume2, Loader2, Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TextToSpeech() {
  const [text, setText] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)
  const [voice, setVoice] = useState<string>('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  if (typeof window !== 'undefined' && !synthRef.current) {
    synthRef.current = window.speechSynthesis
  }

  const speak = () => {
    if (!text.trim()) {
      toast.error('Please enter some text to speak')
      return
    }

    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    if (voice) {
      const voices = synthRef.current?.getVoices() || []
      const selectedVoice = voices.find(v => v.name === voice)
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
    }

    utterance.onend = () => {
      setIsPlaying(false)
    }

    utterance.onerror = () => {
      toast.error('Error occurred during speech synthesis')
      setIsPlaying(false)
    }

    utteranceRef.current = utterance
    synthRef.current?.speak(utterance)
    setIsPlaying(true)
  }

  const downloadAudio = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text first')
      return
    }

    toast.loading('Generating audio file...', { id: 'download' })
    
    try {
      // Use Web Audio API to capture speech synthesis
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const mediaStreamDestination = audioContext.createMediaStreamDestination()
      const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream)
      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      const recordingPromise = new Promise<Blob>((resolve, reject) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' })
          resolve(blob)
        }
        mediaRecorder.onerror = reject
      })

      // Start recording
      mediaRecorder.start()

      // Create and configure utterance
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.volume = volume

      if (voice) {
        const voices = synthRef.current?.getVoices() || []
        const selectedVoice = voices.find(v => v.name === voice)
        if (selectedVoice) {
          utterance.voice = selectedVoice
        }
      }

      // Estimate duration and set timeout
      const estimatedDuration = (text.length / 10) * 1000 * (1 / rate) // Rough estimate
      const timeout = Math.max(estimatedDuration + 2000, 5000)

      utterance.onend = () => {
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop()
          }
          audioContext.close()
        }, 500)
      }

      utterance.onerror = () => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop()
        }
        audioContext.close()
      }

      // Speak the text
      synthRef.current?.speak(utterance)

      // Fallback timeout
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop()
        }
        audioContext.close()
      }, timeout)

      // Wait for recording to complete
      const blob = await recordingPromise

      // Download the file
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `speech-${Date.now()}.webm`
      link.click()
      URL.revokeObjectURL(url)
      
      toast.success('Audio downloaded successfully!', { id: 'download' })
    } catch (error) {
      console.error('Download error:', error)
      // Fallback: provide instructions
      toast.error('Download requires browser support. Try using the Speak button and record your screen audio instead.', { 
        id: 'download',
        duration: 5000
      })
    }
  }

  const stop = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsPlaying(false)
    }
  }

  const voices = typeof window !== 'undefined' ? window.speechSynthesis.getVoices() : []

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 mb-3 sm:mb-4">
              <Mic className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Text to Speech</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Convert text to natural-sounding speech</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Enter Text
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste the text you want to convert to speech..."
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
              <p className="mt-2 text-sm text-gray-900">
                {text.length} characters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Speed: {rate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Pitch: {pitch.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Volume: {Math.round(volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {voices.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Voice
                </label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Default Voice</option>
                  {voices.map((v, index) => (
                    <option key={index} value={v.name}>
                      {v.name} {v.lang && `(${v.lang})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-4">
              {!isPlaying ? (
                <>
                  <button
                    onClick={speak}
                    disabled={!text.trim()}
                    className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Play className="h-5 w-5" />
                    <span>Speak</span>
                  </button>
                  <button
                    onClick={downloadAudio}
                    disabled={!text.trim()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={stop}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Pause className="h-5 w-5" />
                  <span>Stop</span>
                </button>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Volume2 className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Tips:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Adjust speed, pitch, and volume to your preference</li>
                    <li>Different voices may have different accents and languages</li>
                    <li>Longer texts may take more time to process</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

