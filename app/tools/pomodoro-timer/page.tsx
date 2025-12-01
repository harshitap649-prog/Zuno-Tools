'use client'

import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Clock, Play, Pause, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<'work' | 'break'>('work')
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev > 0) return prev - 1
          setMinutes(prev => {
            if (prev > 0) return prev - 1
            // Timer finished
            handleTimerComplete()
            return 0
          })
          return 59
        })
      }, 1000)
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

  const handleTimerComplete = () => {
    setIsRunning(false)
    if (mode === 'work') {
      setCompletedPomodoros(prev => prev + 1)
      toast.success('Pomodoro completed! Time for a break!', { duration: 5000 })
      setMode('break')
      setMinutes(5)
      setSeconds(0)
    } else {
      toast.success('Break finished! Ready for another session?', { duration: 5000 })
      setMode('work')
      setMinutes(25)
      setSeconds(0)
    }
  }

  const start = () => {
    setIsRunning(true)
  }

  const pause = () => {
    setIsRunning(false)
  }

  const reset = () => {
    setIsRunning(false)
    if (mode === 'work') {
      setMinutes(25)
    } else {
      setMinutes(5)
    }
    setSeconds(0)
  }

  const setWorkTime = () => {
    setIsRunning(false)
    setMode('work')
    setMinutes(25)
    setSeconds(0)
  }

  const setShortBreak = () => {
    setIsRunning(false)
    setMode('break')
    setMinutes(5)
    setSeconds(0)
  }

  const setLongBreak = () => {
    setIsRunning(false)
    setMode('break')
    setMinutes(15)
    setSeconds(0)
  }

  const formatTime = (mins: number, secs: number) => {
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${
              mode === 'work' ? 'from-red-500 to-pink-500' : 'from-green-500 to-emerald-500'
            } mb-4`}>
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Pomodoro Timer</h1>
            <p className="text-gray-900">Focus timer for productive work sessions</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className={`text-7xl sm:text-8xl font-mono font-bold mb-6 ${
                mode === 'work' ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatTime(minutes, seconds)}
              </div>
              <div className="mb-6">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  mode === 'work'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {mode === 'work' ? 'Work Session' : 'Break Time'}
                </span>
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
                  onClick={reset}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Settings</h3>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={setWorkTime}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    mode === 'work' && !isRunning
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Work (25 min)
                </button>
                <button
                  onClick={setShortBreak}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    mode === 'break' && minutes === 5 && !isRunning
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Short Break (5 min)
                </button>
                <button
                  onClick={setLongBreak}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    mode === 'break' && minutes === 15 && !isRunning
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Long Break (15 min)
                </button>
              </div>
            </div>

            {completedPomodoros > 0 && (
              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-gray-900 mb-2">Completed Pomodoros</p>
                <p className="text-4xl font-bold text-gray-900">{completedPomodoros}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}


