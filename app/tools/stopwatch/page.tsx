'use client'

import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Play, Pause, Square, RotateCcw } from 'lucide-react'

export default function Stopwatch() {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 10)
      }, 10)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const centiseconds = Math.floor((ms % 1000) / 10)
    
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`
  }

  const start = () => {
    setIsRunning(true)
  }

  const pause = () => {
    setIsRunning(false)
  }

  const reset = () => {
    setIsRunning(false)
    setTime(0)
    setLaps([])
  }

  const addLap = () => {
    if (isRunning) {
      setLaps(prev => [time, ...prev])
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 mb-4">
              <Play className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Stopwatch</h1>
            <p className="text-gray-600">Simple and accurate stopwatch</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="text-6xl sm:text-7xl md:text-8xl font-mono font-bold text-gray-900 mb-6">
                {formatTime(time)}
              </div>

              <div className="flex justify-center gap-4 mb-6">
                {!isRunning ? (
                  <button
                    onClick={start}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Play className="h-5 w-5" />
                    <span>Start</span>
                  </button>
                ) : (
                  <button
                    onClick={pause}
                    className="bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                  >
                    <Pause className="h-5 w-5" />
                    <span>Pause</span>
                  </button>
                )}
                <button
                  onClick={addLap}
                  disabled={!isRunning}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Square className="h-5 w-5" />
                  <span>Lap</span>
                </button>
                <button
                  onClick={reset}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {laps.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Laps</h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {laps.map((lap, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Lap {laps.length - index}</span>
                      <span className="text-gray-900 font-mono font-semibold">{formatTime(lap)}</span>
                    </div>
                  ))}
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


