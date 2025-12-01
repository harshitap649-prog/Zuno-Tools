'use client'

import { useState, useRef } from 'react'
import Footer from '@/components/Footer'
import { Video, Sparkles, Play, Square, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

export default function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { triggerPopunder } = usePopunderAd()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' } as any,
        audio: true,
      })

      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        setRecordedBlob(blob)
        const url = URL.createObjectURL(blob)
        setVideoUrl(url)
        toast.success('Recording stopped!')
      }

      mediaRecorder.start()
      setIsRecording(true)
      toast.success('Recording started!')

      // Stop recording when user stops sharing
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopRecording()
      })
    } catch (error) {
      toast.error('Failed to start recording. Please grant screen sharing permissions.')
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      streamRef.current?.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  const downloadRecording = () => {
    if (!recordedBlob) return

    const link = document.createElement('a')
    link.href = videoUrl || ''
    link.download = `screen-recording-${Date.now()}.webm`
    link.click()
    
    // Trigger popunder ad after 2 seconds
    triggerPopunder()
    
    toast.success('Recording downloaded!')
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
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 mb-3 sm:mb-4">
              <Video className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Screen Recorder</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Record your screen and audio</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div className="flex gap-4 justify-center">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2 text-lg"
                >
                  <Play className="h-6 w-6" />
                  <span>Start Recording</span>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2 text-lg animate-pulse"
                >
                  <Square className="h-6 w-6" />
                  <span>Stop Recording</span>
                </button>
              )}
            </div>

            {isRecording && (
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-red-600">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                  <span className="font-semibold">Recording in progress...</span>
                </div>
              </div>
            )}

            {videoUrl && recordedBlob && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Recording Preview</h3>
                  <video
                    src={videoUrl}
                    controls
                    className="w-full rounded-lg bg-black"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
                <button
                  onClick={downloadRecording}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Download className="h-5 w-5" />
                  <span>Download Recording</span>
                </button>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Screen recording requires browser permissions. Click "Start Recording" and select the screen/window you want to record. The recording will be saved as a WebM file.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

