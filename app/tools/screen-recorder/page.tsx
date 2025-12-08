'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Footer from '@/components/Footer'
import { Video, Play, Square, Download, Pause, Settings, Mic, MicOff, Volume2, VolumeX, Clock, Trash2, Share2, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

// Dynamically import ad components to avoid SSR issues
const SidebarAd = dynamic(() => import('@/components/SidebarAd'), { ssr: false })
const MobileBottomAd = dynamic(() => import('@/components/MobileBottomAd'), { ssr: false })

export default function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null) 
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [systemAudio, setSystemAudio] = useState(true)
  const [micAudio, setMicAudio] = useState(false)
  const [videoQuality, setVideoQuality] = useState<'high' | 'medium' | 'low'>('high')
  const [recordings, setRecordings] = useState<Array<{ id: string; url: string; blob: Blob; timestamp: number; duration: number }>>([])
  const [copied, setCopied] = useState(false)
  const isMobile = typeof navigator !== 'undefined' ? /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) : false
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const { triggerPopunder } = usePopunderAd()

  // Ensure mobile defaults avoid system audio (often unsupported) and stop tracks on unmount
  useEffect(() => {
    if (isMobile) {
      setSystemAudio(false)
    }
    return () => {
      stopRecording()
      stopStreams()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Timer effect
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording, isPaused])

  // Load saved recordings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('screen-recordings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setRecordings(parsed)
      } catch (e) {
        console.error('Failed to load recordings:', e)
      }
    }
  }, [])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const stopStreams = () => {
    try {
      streamRef.current?.getTracks().forEach(t => t.stop())
      audioStreamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
      audioStreamRef.current = null
    } catch {}
  }

  const startRecording = async () => {
    try {
      chunksRef.current = []
      setRecordingTime(0)
      
      if (typeof MediaRecorder === 'undefined') {
        toast.error('MediaRecorder not supported in this browser.')
        return
      }

      const videoConstraints: any = {
        mediaSource: 'screen',
      }

      // Set video quality
      if (videoQuality === 'high') {
        videoConstraints.width = { ideal: 1920 }
        videoConstraints.height = { ideal: 1080 }
        videoConstraints.frameRate = { ideal: 30 }
      } else if (videoQuality === 'medium') {
        videoConstraints.width = { ideal: 1280 }
        videoConstraints.height = { ideal: 720 }
        videoConstraints.frameRate = { ideal: 24 }
      } else {
        videoConstraints.width = { ideal: 854 }
        videoConstraints.height = { ideal: 480 }
        videoConstraints.frameRate = { ideal: 20 }
      }

      // Request screen share; many mobile browsers do not support system audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: videoConstraints,
        audio: !isMobile && systemAudio && audioEnabled,
      })

      streamRef.current = displayStream

      let finalStream = displayStream

      // Add microphone audio if enabled
      if (micAudio && audioEnabled) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          audioStreamRef.current = micStream
          
          // Create a new stream with video from display and audio from both sources
          const videoTrack = displayStream.getVideoTracks()[0]
          const audioTracks: MediaStreamTrack[] = []
          
          // Add system audio if available
          if (displayStream.getAudioTracks().length > 0) {
            audioTracks.push(...displayStream.getAudioTracks())
          }
          
          // Add microphone audio
          audioTracks.push(...micStream.getAudioTracks())
          
          finalStream = new MediaStream([videoTrack, ...audioTracks])
        } catch (micError) {
          console.warn('Microphone access denied, continuing without mic audio')
          // Continue with just system audio
        }
      }

      // Determine the best mime type
      let mimeType = 'video/webm;codecs=vp9'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8'
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm'
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Last resort - let browser decide
        mimeType = ''
      }

      const options: MediaRecorderOptions = mimeType ? { mimeType } : {}

      const mediaRecorder = new MediaRecorder(finalStream, options)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        toast.error('Recording error occurred')
      }

      mediaRecorder.onstop = () => {
        try {
          if (chunksRef.current.length === 0) {
            toast.error('No recording data captured')
            return
          }

          const blob = new Blob(chunksRef.current, { 
            type: mimeType || 'video/webm' 
          })
          
          if (blob.size === 0) {
            toast.error('Recording is empty')
            return
          }

          const url = URL.createObjectURL(blob)
          const duration = recordingTime
          
          setRecordedBlob(blob)
          setVideoUrl(url)
          
          // Save to recordings list
          const newRecording = {
            id: Date.now().toString(),
            url,
            blob,
            timestamp: Date.now(),
            duration,
          }
          const updatedRecordings = [newRecording, ...recordings]
          setRecordings(updatedRecordings)
          
          // Save metadata only (not blob) to localStorage
          try {
            localStorage.setItem('screen-recordings', JSON.stringify(updatedRecordings.map(r => ({
              id: r.id,
              timestamp: r.timestamp,
              duration: r.duration,
            }))))
          } catch (e) {
            console.warn('Failed to save to localStorage:', e)
          }
          
          toast.success('Recording stopped and saved!')
        } catch (error) {
          console.error('Error processing recording:', error)
          toast.error('Failed to process recording')
        }
      }

      // Start recording with timeslice to ensure data is collected regularly
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setIsPaused(false)
      toast.success('Recording started!')

      // Stop recording when user stops sharing screen
      displayStream.getVideoTracks()[0].addEventListener('ended', () => {
      if (isRecording) {
        stopRecording()
        }
      })

      // Handle audio track ending
      displayStream.getAudioTracks().forEach(track => {
        track.addEventListener('ended', () => {
          console.log('Audio track ended')
        })
      })
    } catch (error: any) {
      console.error('Error starting recording:', error)
      if (error.name === 'NotAllowedError') {
        toast.error('Permission denied. Please allow screen sharing.')
      } else if (error.name === 'NotFoundError') {
        toast.error('No screen/window available to record.')
      } else if (isMobile) {
        toast.error('Your mobile browser may not support screen recording. Try Chrome/Edge on Android.')
      } else {
        toast.error('Failed to start recording. Please try again.')
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      try {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.pause()
          setIsPaused(true)
          toast('Recording paused', { icon: '⏸️' })
        }
      } catch (error) {
        console.error('Error pausing recording:', error)
        toast.error('Failed to pause recording')
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      try {
        if (mediaRecorderRef.current.state === 'paused') {
          mediaRecorderRef.current.resume()
          setIsPaused(false)
          toast('Recording resumed', { icon: '▶️' })
        }
      } catch (error) {
        console.error('Error resuming recording:', error)
        toast.error('Failed to resume recording')
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop()
        }
      } catch (error) {
        console.error('Error stopping recorder:', error)
        toast.error('Error stopping recording')
      }
    }
    stopStreams()
    setIsRecording(false)
    setIsPaused(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const resetRecording = () => {
    stopRecording()
    setRecordedBlob(null)
    setVideoUrl(null)
    setRecordingTime(0)
    chunksRef.current = []
    toast.success('Recording cleared')
  }

  // Check browser support
  const isSupported = typeof MediaRecorder !== 'undefined' && 
                      typeof navigator.mediaDevices !== 'undefined' && 
                      typeof navigator.mediaDevices.getDisplayMedia !== 'undefined'

  const downloadRecording = (blob?: Blob, url?: string, id?: string) => {
    const recordingBlob = blob || recordedBlob
    const recordingUrl = url || videoUrl
    if (!recordingBlob || !recordingUrl) return

    const link = document.createElement('a')
    link.href = recordingUrl
    link.download = `screen-recording-${id || Date.now()}.webm`
    link.click()
    
    // Trigger popunder ad after 2 seconds
    setTimeout(() => {
      triggerPopunder()
    }, 2000)
    
    toast.success('Recording downloaded!')
  }

  const shareRecording = async (url: string, id: string) => {
    if (navigator.share) {
      try {
        const recording = recordings.find(r => r.id === id)
        const fileName = `screen-recording-${id}.webm`
        
        if (recording?.blob) {
          const file = new File([recording.blob], fileName, { type: 'video/webm' })
          await navigator.share({
            title: 'Screen Recording',
            text: 'Check out this screen recording',
            files: [file],
          })
          toast.success('Recording shared!')
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          // Fallback to copy link
          copyRecordingLink(url)
        }
      }
    } else {
      copyRecordingLink(url)
    }
  }

  const copyRecordingLink = async (url: string) => {
    try {
      // For local blob URLs, we can't share the link directly
      // Instead, we'll copy a message
      const text = 'Screen recording - Download from Zuno Tools'
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const deleteRecording = (id: string) => {
    const updated = recordings.filter(r => r.id !== id)
    setRecordings(updated)
    
    // Revoke URL to free memory
    const recording = recordings.find(r => r.id === id)
    if (recording?.url) {
      URL.revokeObjectURL(recording.url)
    }
    
    // If deleting current recording
    if (videoUrl === recording?.url) {
      setRecordedBlob(null)
      setVideoUrl(null)
    }
    
    localStorage.setItem('screen-recordings', JSON.stringify(updated.map(r => ({
      id: r.id,
      url: r.url,
      timestamp: r.timestamp,
      duration: r.duration,
    }))))
    
    toast.success('Recording deleted!')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <SidebarAd position="right" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 mb-3 sm:mb-4">
              <Video className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">Screen Recorder</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Record your screen and audio</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            {/* Settings Panel */}
            {showSettings && !isRecording && (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Recording Settings
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Square className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Video Quality</label>
                    <select
                      value={videoQuality}
                      onChange={(e) => setVideoQuality(e.target.value as 'high' | 'medium' | 'low')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
                    >
                      <option value="high">High (1080p)</option>
                      <option value="medium">Medium (720p)</option>
                      <option value="low">Low (480p)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-900">Audio Options</label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={audioEnabled}
                        onChange={(e) => setAudioEnabled(e.target.checked)}
                        className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-900">Enable Audio</span>
                    </label>
                    
                    {audioEnabled && (
                      <>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={systemAudio}
                            onChange={(e) => setSystemAudio(e.target.checked)}
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                          />
                          <div className="flex items-center gap-2">
                            {systemAudio ? <Volume2 className="h-4 w-4 text-gray-600" /> : <VolumeX className="h-4 w-4 text-gray-400" />}
                            <span className="text-sm text-gray-900">System Audio</span>
                          </div>
                        </label>
                        
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={micAudio}
                            onChange={(e) => setMicAudio(e.target.checked)}
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                          />
                          <div className="flex items-center gap-2">
                            {micAudio ? <Mic className="h-4 w-4 text-gray-600" /> : <MicOff className="h-4 w-4 text-gray-400" />}
                            <span className="text-sm text-gray-900">Microphone</span>
                          </div>
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Browser Support Warning */}
            {!isSupported && (
              <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4 text-center">
                <p className="text-sm text-yellow-800">
                  <strong>Browser not supported:</strong> Screen recording requires a modern browser with MediaRecorder API support. Please use Chrome, Edge, Firefox, or Opera.
                </p>
              </div>
            )}

            {/* Recording Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              {!isRecording ? (
                <>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation active:scale-95"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={startRecording}
                    disabled={!isSupported}
                    className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-pink-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-base sm:text-lg touch-manipulation active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span>Start Recording</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={isPaused ? resumeRecording : pauseRecording}
                    className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation active:scale-95"
                  >
                    {isPaused ? (
                      <>
                        <Play className="h-5 w-5" />
                        <span>Resume</span>
                      </>
                    ) : (
                      <>
                        <Pause className="h-5 w-5" />
                        <span>Pause</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={stopRecording}
                    className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-pink-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-base sm:text-lg animate-pulse touch-manipulation active:scale-95"
                  >
                    <Square className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span>Stop Recording</span>
                  </button>
                </>
              )}
            </div>

            {/* Recording Status */}
            {isRecording && (
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 text-center">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-red-600">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 bg-red-600 rounded-full ${isPaused ? '' : 'animate-pulse'}`}></div>
                    <span className="font-semibold text-sm sm:text-base">
                      {isPaused ? 'Recording Paused' : 'Recording in progress...'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-red-700">
                    <Clock className="h-4 w-4" />
                    <span className="font-mono font-bold text-sm sm:text-base">{formatTime(recordingTime)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Current Recording Preview */}
            {videoUrl && recordedBlob && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Recording Preview</h3>
                  <video
                    src={videoUrl}
                    controls
                    className="w-full rounded-lg bg-black"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => downloadRecording()}
                    className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation active:scale-95"
                  >
                    <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => {
                      const currentRecording = recordings.find(r => r.url === videoUrl)
                      if (currentRecording) {
                        shareRecording(videoUrl, currentRecording.id)
                      } else {
                        toast.error('Recording not found')
                      }
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation active:scale-95"
                  >
                    <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={resetRecording}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation active:scale-95"
                  >
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>
            )}

            {/* Recordings History */}
            {recordings.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Previous Recordings</h3>
                  <button
                    onClick={() => {
                      recordings.forEach(r => URL.revokeObjectURL(r.url))
                      setRecordings([])
                      localStorage.removeItem('screen-recordings')
                      toast.success('All recordings cleared!')
                    }}
                    className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recordings.map((recording) => (
                    <div
                      key={recording.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Video className="h-4 w-4 text-gray-600 flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-gray-600 font-mono">
                            {new Date(recording.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{formatTime(recording.duration)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => downloadRecording(recording.blob, recording.url, recording.id)}
                          className="flex-1 sm:flex-none px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 touch-manipulation active:scale-95"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Download</span>
                        </button>
                        <button
                          onClick={() => shareRecording(recording.url, recording.id)}
                          className="flex-1 sm:flex-none px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 touch-manipulation active:scale-95"
                        >
                          <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Share</span>
                        </button>
                        <button
                          onClick={() => deleteRecording(recording.id)}
                          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center touch-manipulation active:scale-95"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                <strong>Note:</strong> Screen recording requires browser permissions. Click "Start Recording" and select the screen/window you want to record. The recording will be saved as a WebM file. 
                <span className="block mt-2">
                  <strong>Mobile:</strong> Screen recording works best on desktop browsers. Some mobile browsers may have limited support.
                </span>
              </p>
            </div>
          </div>
        </div>
      </main>

      <MobileBottomAd adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <Footer />
    </div>
  )
}

