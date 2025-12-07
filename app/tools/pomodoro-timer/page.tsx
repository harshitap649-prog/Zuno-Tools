'use client'

import { useState, useEffect, useRef } from 'react'
import Footer from '@/components/Footer'
import SidebarAd from '@/components/SidebarAd'
import MobileBottomAd from '@/components/MobileBottomAd'
import { 
  Clock, Play, Pause, RotateCcw, Settings, Save, Trash2, X, Plus, 
  Volume2, VolumeX, Bell, BarChart3, Target, CheckSquare, Moon, Sun,
  Download, TrendingUp, Award, Zap, SkipForward, List, Edit, Download as DownloadIcon
} from 'lucide-react'
import toast from 'react-hot-toast'

interface TimerPreset {
  id: string
  name: string
  workMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
}

interface Task {
  id: string
  text: string
  completed: boolean
  pomodoros: number
  priority: 'low' | 'medium' | 'high'
  createdAt: string
}

interface SessionRecord {
  id: string
  date: string
  type: 'work' | 'break'
  duration: number
  completed: boolean
  taskId?: string
}

interface DailyStats {
  date: string
  pomodoros: number
  totalMinutes: number
  tasksCompleted: number
}

export default function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<'work' | 'break'>('work')
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Custom timer states
  const [workDuration, setWorkDuration] = useState(25)
  const [shortBreakDuration, setShortBreakDuration] = useState(5)
  const [longBreakDuration, setLongBreakDuration] = useState(15)
  const [showCustomSettings, setShowCustomSettings] = useState(false)
  const [savedPresets, setSavedPresets] = useState<TimerPreset[]>([])
  const [showPresetsModal, setShowPresetsModal] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const [showNewPresetInput, setShowNewPresetInput] = useState(false)
  
  // Sound & Notifications
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [soundType, setSoundType] = useState<'bell' | 'chime' | 'nature'>('bell')
  const [soundVolume, setSoundVolume] = useState(0.7)
  const [browserNotifications, setBrowserNotifications] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Statistics & Analytics
  const [showStats, setShowStats] = useState(false)
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [totalFocusTime, setTotalFocusTime] = useState(0)
  
  // Task Management
  const [tasks, setTasks] = useState<Task[]>([])
  const [showTasks, setShowTasks] = useState(false)
  const [newTaskText, setNewTaskText] = useState('')
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  
  // Themes & Visual
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [showProgressRing, setShowProgressRing] = useState(true)
  
  // Goals & Targets
  const [dailyGoal, setDailyGoal] = useState(4)
  const [weeklyGoal, setWeeklyGoal] = useState(20)
  const [showGoals, setShowGoals] = useState(false)
  
  // Auto-start
  const [autoStartBreaks, setAutoStartBreaks] = useState(false)
  const [autoStartWork, setAutoStartWork] = useState(false)
  
  // Session tracking
  const sessionStartTime = useRef<Date | null>(null)
  const currentSessionDuration = useRef(0)

  // Load all saved data from localStorage
  useEffect(() => {
    // Load presets
    const saved = localStorage.getItem('pomodoro-presets')
    if (saved) {
      try {
        const presets = JSON.parse(saved)
        setSavedPresets(presets)
      } catch (e) {
        console.error('Error loading presets:', e)
      }
    }
    
    // Load durations
    const savedDurations = localStorage.getItem('pomodoro-durations')
    if (savedDurations) {
      try {
        const durations = JSON.parse(savedDurations)
        setWorkDuration(durations.work || 25)
        setShortBreakDuration(durations.shortBreak || 5)
        setLongBreakDuration(durations.longBreak || 15)
        if (mode === 'work') {
          setMinutes(durations.work || 25)
        }
      } catch (e) {
        console.error('Error loading durations:', e)
      }
    }
    
    // Load settings
    const savedSettings = localStorage.getItem('pomodoro-settings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setSoundEnabled(settings.soundEnabled !== false)
        setSoundType(settings.soundType || 'bell')
        setSoundVolume(settings.soundVolume ?? 0.7)
        setBrowserNotifications(settings.browserNotifications || false)
        setTheme(settings.theme || 'light')
        setAutoStartBreaks(settings.autoStartBreaks || false)
        setAutoStartWork(settings.autoStartWork || false)
        setDailyGoal(settings.dailyGoal || 4)
        setWeeklyGoal(settings.weeklyGoal || 20)
      } catch (e) {
        console.error('Error loading settings:', e)
      }
    }
    
    // Load tasks
    const savedTasks = localStorage.getItem('pomodoro-tasks')
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks))
      } catch (e) {
        console.error('Error loading tasks:', e)
      }
    }
    
    // Load statistics
    const savedHistory = localStorage.getItem('pomodoro-history')
    if (savedHistory) {
      try {
        setSessionHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Error loading history:', e)
      }
    }
    
    const savedStats = localStorage.getItem('pomodoro-stats')
    if (savedStats) {
      try {
        const stats = JSON.parse(savedStats)
        setCurrentStreak(stats.currentStreak || 0)
        setBestStreak(stats.bestStreak || 0)
        setTotalFocusTime(stats.totalFocusTime || 0)
      } catch (e) {
        console.error('Error loading stats:', e)
      }
    }
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Save durations to localStorage when changed
  useEffect(() => {
    localStorage.setItem('pomodoro-durations', JSON.stringify({
      work: workDuration,
      shortBreak: shortBreakDuration,
      longBreak: longBreakDuration
    }))
  }, [workDuration, shortBreakDuration, longBreakDuration])
  
  // Save settings
  useEffect(() => {
    localStorage.setItem('pomodoro-settings', JSON.stringify({
      soundEnabled,
      soundType,
      soundVolume,
      browserNotifications,
      theme,
      autoStartBreaks,
      autoStartWork,
      dailyGoal,
      weeklyGoal
    }))
  }, [soundEnabled, soundType, soundVolume, browserNotifications, theme, autoStartBreaks, autoStartWork, dailyGoal, weeklyGoal])
  
  // Save tasks
  useEffect(() => {
    localStorage.setItem('pomodoro-tasks', JSON.stringify(tasks))
  }, [tasks])
  
  // Save history
  useEffect(() => {
    localStorage.setItem('pomodoro-history', JSON.stringify(sessionHistory))
  }, [sessionHistory])
  
  // Save stats
  useEffect(() => {
    localStorage.setItem('pomodoro-stats', JSON.stringify({
      currentStreak,
      bestStreak,
      totalFocusTime
    }))
  }, [currentStreak, bestStreak, totalFocusTime])
  
  // Play sound notification
  const playSound = () => {
    if (!soundEnabled || !audioRef.current) return
    
    try {
      audioRef.current.volume = soundVolume
      audioRef.current.play().catch(e => console.error('Error playing sound:', e))
    } catch (e) {
      console.error('Error with audio:', e)
    }
  }
  
  // Show browser notification
  const showNotification = (title: string, body: string) => {
    if (!browserNotifications || !('Notification' in window)) return
    
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      })
    }
  }
  
  // Calculate progress percentage
  const getProgress = () => {
    const totalSeconds = mode === 'work' 
      ? workDuration * 60 
      : (minutes === shortBreakDuration ? shortBreakDuration : longBreakDuration) * 60
    const elapsed = (totalSeconds - (minutes * 60 + seconds))
    return Math.max(0, Math.min(100, (elapsed / totalSeconds) * 100))
  }
  
  // Calculate statistics
  useEffect(() => {
    const sortedHistory = [...sessionHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    
    for (const session of sortedHistory) {
      const sessionDate = new Date(session.date)
      sessionDate.setHours(0, 0, 0, 0)
      const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === streak && session.type === 'work' && session.completed) {
        streak++
        currentDate = new Date(sessionDate)
        currentDate.setDate(currentDate.getDate() - 1)
      } else if (daysDiff > streak) {
        break
      }
    }
    
    setCurrentStreak(streak)
    if (streak > bestStreak) {
      setBestStreak(streak)
    }
    
    // Calculate total focus time
    const total = sessionHistory
      .filter(s => s.type === 'work' && s.completed)
      .reduce((sum, s) => sum + s.duration, 0)
    setTotalFocusTime(total)
  }, [sessionHistory, bestStreak])

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
        // Track session duration
        if (sessionStartTime.current) {
          currentSessionDuration.current = Math.floor((new Date().getTime() - sessionStartTime.current.getTime()) / 1000 / 60)
        }
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
    
    // Record session
    const sessionDuration = currentSessionDuration.current || (mode === 'work' ? workDuration : (minutes === shortBreakDuration ? shortBreakDuration : longBreakDuration))
    const sessionRecord: SessionRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: mode,
      duration: sessionDuration,
      completed: true,
      taskId: currentTaskId || undefined
    }
    setSessionHistory(prev => [...prev, sessionRecord])
    
    // Update task pomodoros if there's a current task
    if (currentTaskId && mode === 'work') {
      setTasks(prev => prev.map(task => 
        task.id === currentTaskId 
          ? { ...task, pomodoros: task.pomodoros + 1 }
          : task
      ))
    }
    
    if (mode === 'work') {
      setCompletedPomodoros(prev => prev + 1)
      playSound()
      showNotification('Pomodoro Completed!', 'Time for a well-deserved break!')
      toast.success('Pomodoro completed! Time for a break!', { duration: 5000 })
      setMode('break')
      setMinutes(shortBreakDuration)
      setSeconds(0)
      currentSessionDuration.current = 0
      
      // Auto-start break if enabled
      if (autoStartBreaks) {
        setTimeout(() => {
          setIsRunning(true)
        }, 1000)
      }
    } else {
      playSound()
      showNotification('Break Finished!', 'Ready for another productive session?')
      toast.success('Break finished! Ready for another session?', { duration: 5000 })
      setMode('work')
      setMinutes(workDuration)
      setSeconds(0)
      currentSessionDuration.current = 0
      
      // Auto-start work if enabled
      if (autoStartWork) {
        setTimeout(() => {
          setIsRunning(true)
        }, 1000)
      }
    }
  }

  const start = () => {
    setIsRunning(true)
    sessionStartTime.current = new Date()
    currentSessionDuration.current = 0
  }

  const pause = () => {
    setIsRunning(false)
  }

  const reset = () => {
    setIsRunning(false)
    if (mode === 'work') {
      setMinutes(workDuration)
    } else {
      setMinutes(shortBreakDuration)
    }
    setSeconds(0)
  }

  const setWorkTime = (customMinutes?: number) => {
    setIsRunning(false)
    setMode('work')
    setMinutes(customMinutes || workDuration)
    setSeconds(0)
  }

  const setShortBreak = (customMinutes?: number) => {
    setIsRunning(false)
    setMode('break')
    setMinutes(customMinutes || shortBreakDuration)
    setSeconds(0)
  }

  const setLongBreak = (customMinutes?: number) => {
    setIsRunning(false)
    setMode('break')
    setMinutes(customMinutes || longBreakDuration)
    setSeconds(0)
  }

  // Quick preset functions
  const setQuickPreset = (minutes: number) => {
    setIsRunning(false)
    setMode('work')
    setMinutes(minutes)
    setSeconds(0)
    setWorkDuration(minutes)
    toast.success(`Work duration set to ${minutes} minutes`)
  }

  // Preset management functions
  const saveCurrentAsPreset = () => {
    if (!newPresetName.trim()) {
      toast.error('Please enter a preset name')
      return
    }
    
    const newPreset: TimerPreset = {
      id: Date.now().toString(),
      name: newPresetName.trim(),
      workMinutes: workDuration,
      shortBreakMinutes: shortBreakDuration,
      longBreakMinutes: longBreakDuration
    }
    
    const updatedPresets = [...savedPresets, newPreset]
    setSavedPresets(updatedPresets)
    localStorage.setItem('pomodoro-presets', JSON.stringify(updatedPresets))
    setNewPresetName('')
    setShowNewPresetInput(false)
    toast.success('Preset saved!')
  }

  const loadPreset = (preset: TimerPreset) => {
    setWorkDuration(preset.workMinutes)
    setShortBreakDuration(preset.shortBreakMinutes)
    setLongBreakDuration(preset.longBreakMinutes)
    setWorkTime(preset.workMinutes)
    setShowPresetsModal(false)
    toast.success(`Loaded preset: ${preset.name}`)
  }

  const deletePreset = (id: string) => {
    const updatedPresets = savedPresets.filter(p => p.id !== id)
    setSavedPresets(updatedPresets)
    localStorage.setItem('pomodoro-presets', JSON.stringify(updatedPresets))
    toast.success('Preset deleted')
  }

  const applyCustomDurations = () => {
    if (workDuration < 1 || workDuration > 120) {
      toast.error('Work duration must be between 1 and 120 minutes')
      return
    }
    if (shortBreakDuration < 1 || shortBreakDuration > 60) {
      toast.error('Short break duration must be between 1 and 60 minutes')
      return
    }
    if (longBreakDuration < 1 || longBreakDuration > 60) {
      toast.error('Long break duration must be between 1 and 60 minutes')
      return
    }
    
    if (mode === 'work') {
      setMinutes(workDuration)
    } else if (minutes === shortBreakDuration) {
      setMinutes(shortBreakDuration)
    } else if (minutes === longBreakDuration) {
      setMinutes(longBreakDuration)
    }
    setSeconds(0)
    setShowCustomSettings(false)
    toast.success('Custom durations applied!')
  }

  const formatTime = (mins: number, secs: number) => {
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  
  // Task management functions
  const addTask = () => {
    if (!newTaskText.trim()) {
      toast.error('Please enter a task')
      return
    }
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
      pomodoros: 0,
      priority: 'medium',
      createdAt: new Date().toISOString()
    }
    setTasks(prev => [...prev, newTask])
    setNewTaskText('')
    toast.success('Task added!')
  }
  
  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }
  
  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id))
    if (currentTaskId === id) {
      setCurrentTaskId(null)
    }
  }
  
  const setTaskPriority = (id: string, priority: 'low' | 'medium' | 'high') => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, priority } : task
    ))
  }
  
  // Export statistics
  const exportStats = (format: 'csv' | 'json') => {
    const today = new Date().toDateString()
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const recentSessions = sessionHistory.filter(s => new Date(s.date) >= weekAgo)
    const stats = {
      totalPomodoros: completedPomodoros,
      currentStreak,
      bestStreak,
      totalFocusTime,
      recentSessions,
      tasks: tasks.map(t => ({
        text: t.text,
        completed: t.completed,
        pomodoros: t.pomodoros,
        priority: t.priority
      }))
    }
    
    if (format === 'json') {
      const dataStr = JSON.stringify(stats, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `pomodoro-stats-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    } else {
      // CSV format
      let csv = 'Date,Type,Duration (min),Completed,Task\n'
      recentSessions.forEach(s => {
        const task = s.taskId ? tasks.find(t => t.id === s.taskId) : null
        csv += `${new Date(s.date).toLocaleDateString()},${s.type},${s.duration},${s.completed},${task?.text || ''}\n`
      })
      const dataBlob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `pomodoro-stats-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
    }
    toast.success(`Statistics exported as ${format.toUpperCase()}!`)
  }
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return
      }
      
      if (e.code === 'Space' && !e.shiftKey) {
        e.preventDefault()
        if (isRunning) {
          pause()
        } else {
          start()
        }
      } else if (e.code === 'KeyR' && !e.shiftKey) {
        e.preventDefault()
        reset()
      } else if (e.code === 'KeyS' && e.ctrlKey) {
        e.preventDefault()
        setShowStats(!showStats)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isRunning, showStats])
  
  // Get today's pomodoros
  const getTodayPomodoros = () => {
    const today = new Date().toDateString()
    return sessionHistory.filter(s => 
      new Date(s.date).toDateString() === today && 
      s.type === 'work' && 
      s.completed
    ).length
  }
  
  // Get weekly pomodoros
  const getWeeklyPomodoros = () => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return sessionHistory.filter(s => 
      new Date(s.date) >= weekAgo && 
      s.type === 'work' && 
      s.completed
    ).length
  }

  // Get sound file path
  const getSoundPath = () => {
    switch (soundType) {
      case 'bell': return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzGFzvLZijMIG2m98OScTgwOUKfk8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQcxhc7y2YozCBtpvfDknE4MDlCn5PC2YxwGOJHX8sx5LAUkd8fw3ZBAC'
      case 'chime': return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzGFzvLZijMIG2m98OScTgwOUKfk8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQcxhc7y2YozCBtpvfDknE4MDlCn5PC2YxwGOJHX8sx5LAUkd8fw3ZBAC'
      case 'nature': return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzGFzvLZijMIG2m98OScTgwOUKfk8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQcxhc7y2YozCBtpvfDknE4MDlCn5PC2YxwGOJHX8sx5LAUkd8fw3ZBAC'
      default: return ''
    }
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hidden audio element for sounds */}
      <audio ref={audioRef} preload="auto">
        <source src={getSoundPath()} type="audio/wav" />
      </audio>
      
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <SidebarAd position="right" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              {currentStreak > 0 && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${theme === 'dark' ? 'bg-orange-900/30 border border-orange-700' : 'bg-orange-50 border border-orange-200'}`}>
                  <Zap className={`h-4 w-4 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-orange-300' : 'text-orange-700'}`}>
                    {currentStreak} day streak
                  </span>
                </div>
              )}
              {getTodayPomodoros() > 0 && (
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Today: {getTodayPomodoros()}/{dailyGoal} pomodoros
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTasks(!showTasks)}
                className={`p-2.5 rounded-xl transition-all active:scale-95 ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-300 shadow-sm' : 'hover:bg-gray-100 text-gray-700 shadow-sm border border-gray-200'}`}
                title="Tasks"
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowStats(true)}
                className={`p-2.5 rounded-xl transition-all active:scale-95 ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-300 shadow-sm' : 'hover:bg-gray-100 text-gray-700 shadow-sm border border-gray-200'}`}
                title="Statistics"
              >
                <BarChart3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowGoals(true)}
                className={`p-2.5 rounded-xl transition-all active:scale-95 ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-300 shadow-sm' : 'hover:bg-gray-100 text-gray-700 shadow-sm border border-gray-200'}`}
                title="Goals"
              >
                <Target className="h-5 w-5" />
              </button>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className={`p-2.5 rounded-xl transition-all active:scale-95 ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-300 shadow-sm' : 'hover:bg-gray-100 text-gray-700 shadow-sm border border-gray-200'}`}
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${
              mode === 'work' ? 'from-red-500 to-pink-500' : 'from-green-500 to-emerald-500'
            } mb-4`}>
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h1 className={`text-xl sm:text-2xl md:text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Pomodoro Timer</h1>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>Focus timer for productive work sessions</p>
          </div>

          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} p-6 sm:p-8 md:p-10`}>
            <div className="text-center mb-6 sm:mb-8">
              {/* Progress Ring */}
              {showProgressRing && (
                <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-6">
                  <svg className="transform -rotate-90 w-full h-full">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                      strokeWidth="3"
                      fill="none"
                      className="opacity-30"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      stroke={mode === 'work' ? '#dc2626' : '#10b981'}
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 drop-shadow-lg"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`text-5xl sm:text-7xl md:text-8xl font-mono font-bold tracking-tight ${
                      mode === 'work' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatTime(minutes, seconds)}
                    </div>
                  </div>
                </div>
              )}
              {!showProgressRing && (
                <div className={`text-5xl sm:text-7xl md:text-8xl font-mono font-bold mb-6 tracking-tight ${
                  mode === 'work' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatTime(minutes, seconds)}
                </div>
              )}
              <div className="mb-6 sm:mb-8">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                  mode === 'work'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {mode === 'work' ? 'Work Session' : 'Break Time'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6">
                {!isRunning ? (
                  <button
                    onClick={start}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3.5 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl active:scale-95 transform"
                  >
                    <Play className="h-5 w-5" />
                    <span>Start</span>
                  </button>
                ) : (
                  <button
                    onClick={pause}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl active:scale-95 transform"
                  >
                    <Pause className="h-5 w-5" />
                    <span>Pause</span>
                  </button>
                )}
                <button
                  onClick={reset}
                  className={`px-8 py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl active:scale-95 transform ${
                    theme === 'dark' 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-red-50 text-gray-900 hover:bg-red-100 border border-red-200'
                  }`}
                >
                  <RotateCcw className="h-5 w-5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} pt-6 sm:pt-8 space-y-6 sm:space-y-8`}>
              {/* Quick Presets */}
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <h3 className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Quick Presets</h3>
                  <button
                    onClick={() => setShowPresetsModal(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Manage Presets
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                  {[15, 20, 25, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setQuickPreset(mins)}
                      className={`px-3 py-2.5 sm:py-3 rounded-xl font-medium transition-all text-sm active:scale-95 ${
                        mode === 'work' && minutes === mins && !isRunning
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                          : theme === 'dark'
                            ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                            : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200 shadow-sm hover:shadow'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Standard Settings */}
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <h3 className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Standard Settings</h3>
                  <button
                    onClick={() => setShowCustomSettings(!showCustomSettings)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-700 hover:text-gray-900'}`}
                  >
                    <Settings className="h-4 w-4" />
                    {showCustomSettings ? 'Hide' : 'Customize'}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setWorkTime()}
                    className={`px-4 py-3.5 rounded-xl font-medium transition-all active:scale-95 ${
                      mode === 'work' && minutes === workDuration && !isRunning
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                        : theme === 'dark'
                          ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                          : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200 shadow-sm hover:shadow'
                    }`}
                  >
                    Work ({workDuration} min)
                  </button>
                  <button
                    onClick={() => setShortBreak()}
                    className={`px-4 py-3.5 rounded-xl font-medium transition-all active:scale-95 ${
                      mode === 'break' && minutes === shortBreakDuration && !isRunning
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                        : theme === 'dark'
                          ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                          : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200 shadow-sm hover:shadow'
                    }`}
                  >
                    Short Break ({shortBreakDuration} min)
                  </button>
                  <button
                    onClick={() => setLongBreak()}
                    className={`px-4 py-3.5 rounded-xl font-medium transition-all active:scale-95 ${
                      mode === 'break' && minutes === longBreakDuration && !isRunning
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                        : theme === 'dark'
                          ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                          : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200 shadow-sm hover:shadow'
                    }`}
                  >
                    Long Break ({longBreakDuration} min)
                  </button>
                </div>
              </div>

              {/* Custom Settings Panel */}
              {showCustomSettings && (
                <div className={`rounded-2xl p-5 sm:p-6 space-y-5 sm:space-y-6 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} shadow-inner`}>
                  <h4 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Custom Durations</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Work Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={workDuration}
                        onChange={(e) => setWorkDuration(parseInt(e.target.value) || 1)}
                        className={`w-full px-4 py-2.5 border rounded-xl transition-all ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900 shadow-sm'} focus:ring-2 focus:ring-red-500 focus:border-transparent focus:shadow-md`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Short Break (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={shortBreakDuration}
                        onChange={(e) => setShortBreakDuration(parseInt(e.target.value) || 1)}
                        className={`w-full px-4 py-2.5 border rounded-xl transition-all ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900 shadow-sm'} focus:ring-2 focus:ring-green-500 focus:border-transparent focus:shadow-md`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Long Break (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={longBreakDuration}
                        onChange={(e) => setLongBreakDuration(parseInt(e.target.value) || 1)}
                        className={`w-full px-4 py-2.5 border rounded-xl transition-all ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900 shadow-sm'} focus:ring-2 focus:ring-green-500 focus:border-transparent focus:shadow-md`}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={applyCustomDurations}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                    >
                      <Save className="h-4 w-4" />
                      Apply
                    </button>
                    <button
                      onClick={() => {
                        setWorkDuration(25)
                        setShortBreakDuration(5)
                        setLongBreakDuration(15)
                        toast.success('Reset to default durations')
                      }}
                      className={`px-6 py-3 border rounded-xl font-semibold transition-all active:scale-95 ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-600 text-gray-300' : 'border-gray-300 hover:bg-gray-100 text-gray-900 shadow-sm'}`}
                    >
                      Reset
                    </button>
                  </div>
                  
                  {/* Sound Settings */}
                  <div className="border-t pt-4 mt-4">
                    <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sound & Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Enable Sounds</label>
                        <button
                          onClick={() => setSoundEnabled(!soundEnabled)}
                          className={`w-12 h-6 rounded-full transition-colors ${soundEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      {soundEnabled && (
                        <>
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              Sound Type
                            </label>
                            <select
                              value={soundType}
                              onChange={(e) => setSoundType(e.target.value as 'bell' | 'chime' | 'nature')}
                              className={`w-full px-3 py-2 border rounded-lg ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                            >
                              <option value="bell">Bell</option>
                              <option value="chime">Chime</option>
                              <option value="nature">Nature</option>
                            </select>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              Volume: {Math.round(soundVolume * 100)}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={soundVolume}
                              onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                              className="w-full"
                            />
                          </div>
                        </>
                      )}
                      <div className="flex items-center justify-between">
                        <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Browser Notifications</label>
                        <button
                          onClick={() => {
                            if ('Notification' in window && Notification.permission === 'default') {
                              Notification.requestPermission()
                            }
                            setBrowserNotifications(!browserNotifications)
                          }}
                          className={`w-12 h-6 rounded-full transition-colors ${browserNotifications ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${browserNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Auto-start Settings */}
                  <div className="border-t pt-4 mt-4">
                    <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Auto-Start</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Auto-start Breaks</label>
                        <button
                          onClick={() => setAutoStartBreaks(!autoStartBreaks)}
                          className={`w-12 h-6 rounded-full transition-colors ${autoStartBreaks ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${autoStartBreaks ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Auto-start Work</label>
                        <button
                          onClick={() => setAutoStartWork(!autoStartWork)}
                          className={`w-12 h-6 rounded-full transition-colors ${autoStartWork ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${autoStartWork ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Ring Toggle */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <label className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Show Progress Ring</label>
                      <button
                        onClick={() => setShowProgressRing(!showProgressRing)}
                        className={`w-12 h-6 rounded-full transition-colors ${showProgressRing ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${showProgressRing ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {completedPomodoros > 0 && (
              <div className={`mt-6 sm:mt-8 pt-6 sm:pt-8 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} text-center`}>
                <p className={`text-sm sm:text-base mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Completed Pomodoros</p>
                <p className={`text-4xl sm:text-5xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{completedPomodoros}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Presets Modal */}
      {showPresetsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className={`sticky top-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} px-4 sm:px-6 py-4 flex items-center justify-between`}>
              <h2 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Saved Presets</h2>
              <button
                onClick={() => {
                  setShowPresetsModal(false)
                  setShowNewPresetInput(false)
                  setNewPresetName('')
                }}
                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`} />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4">
              {/* Save Current as Preset */}
              {!showNewPresetInput ? (
                <button
                  onClick={() => setShowNewPresetInput(true)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed ${theme === 'dark' ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-700' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'} rounded-xl transition-all font-medium active:scale-95 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}
                >
                  <Plus className="h-5 w-5" />
                  Save Current Settings as Preset
                </button>
              ) : (
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 sm:p-5 space-y-3 border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                  <input
                    type="text"
                    placeholder="Enter preset name..."
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-xl transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:shadow-md ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 shadow-sm'}`}
                    autoFocus
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={saveCurrentAsPreset}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowNewPresetInput(false)
                        setNewPresetName('')
                      }}
                      className={`px-4 py-2.5 border rounded-xl font-semibold transition-all active:scale-95 ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-600 text-gray-300' : 'border-gray-300 hover:bg-gray-100 text-gray-900 shadow-sm'}`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Saved Presets List */}
              {savedPresets.length === 0 ? (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-900'}`}>
                  <p>No saved presets yet.</p>
                  <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-700'}`}>Save your current settings to create a preset!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl transition-all border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 shadow-sm hover:shadow'}`}
                    >
                      <div className="flex-1">
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{preset.name}</h3>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                          Work: {preset.workMinutes}min • Short Break: {preset.shortBreakMinutes}min • Long Break: {preset.longBreakMinutes}min
                        </p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => loadPreset(preset)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg active:scale-95 text-sm"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deletePreset(preset.id)}
                          className={`p-2 rounded-xl transition-all active:scale-95 ${theme === 'dark' ? 'text-red-400 hover:bg-gray-600' : 'text-red-600 hover:bg-red-50'} shadow-sm`}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tasks Panel */}
      {showTasks && (
        <div className={`fixed right-0 top-0 h-full w-full sm:w-80 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-2xl z-40 transform transition-transform`}>
          <div className={`p-4 sm:p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Tasks</h2>
            <button
              onClick={() => setShowTasks(false)}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-900'}`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4 sm:p-6 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                placeholder="Add a task..."
                className={`flex-1 px-4 py-2.5 border rounded-xl transition-all ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 shadow-sm'} focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:shadow-md`}
              />
              <button
                onClick={addTask}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            {tasks.length === 0 ? (
              <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-900'}`}>No tasks yet. Add one to get started!</p>
            ) : (
              <div className="space-y-2">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-3 sm:p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200 shadow-sm'} ${
                      currentTaskId === task.id ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className={`${task.completed ? 'line-through opacity-60' : ''} ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                          {task.text}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                            {task.pomodoros} pomodoros
                          </span>
                          <select
                            value={task.priority}
                            onChange={(e) => setTaskPriority(task.id, e.target.value as 'low' | 'medium' | 'high')}
                            className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'}`}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {!task.completed && (
                          <button
                            onClick={() => setCurrentTaskId(currentTaskId === task.id ? null : task.id)}
                            className={`p-1 rounded ${currentTaskId === task.id ? 'bg-blue-600 text-white' : theme === 'dark' ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
                            title="Set as current task"
                          >
                            <Zap className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-200 text-red-600'}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className={`sticky top-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
              <h2 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Statistics & Analytics</h2>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => exportStats('csv')}
                  className="flex-1 sm:flex-none px-3 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-1 shadow-md hover:shadow-lg active:scale-95"
                >
                  <DownloadIcon className="h-4 w-4" />
                  CSV
                </button>
                <button
                  onClick={() => exportStats('json')}
                  className="flex-1 sm:flex-none px-3 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-1 shadow-md hover:shadow-lg active:scale-95"
                >
                  <DownloadIcon className="h-4 w-4" />
                  JSON
                </button>
                <button
                  onClick={() => setShowStats(false)}
                  className={`p-2 rounded-xl transition-all active:scale-95 ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-900'}`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} shadow-sm`}>
                  <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Pomodoros</p>
                  <p className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{completedPomodoros}</p>
                </div>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} shadow-sm`}>
                  <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Current Streak</p>
                  <p className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{currentStreak}</p>
                </div>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} shadow-sm`}>
                  <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Best Streak</p>
                  <p className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{bestStreak}</p>
                </div>
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} shadow-sm`}>
                  <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Focus Time</p>
                  <p className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{Math.floor(totalFocusTime / 60)}h</p>
                </div>
              </div>
              
              {/* Today's Stats */}
              <div>
                <h3 className={`text-lg sm:text-xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Today</h3>
                <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} shadow-sm`}>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    Completed: <span className="font-bold">{getTodayPomodoros()}</span> pomodoros
                  </p>
                  <div className="mt-2 w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (getTodayPomodoros() / dailyGoal) * 100)}%` }}
                    />
                  </div>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {getTodayPomodoros()} / {dailyGoal} goal
                  </p>
                </div>
              </div>
              
              {/* Weekly Stats */}
              <div>
                <h3 className={`text-lg sm:text-xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>This Week</h3>
                <div className={`p-4 sm:p-5 rounded-xl border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} shadow-sm`}>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    Completed: <span className="font-bold">{getWeeklyPomodoros()}</span> pomodoros
                  </p>
                  <div className="mt-2 w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (getWeeklyPomodoros() / weeklyGoal) * 100)}%` }}
                    />
                  </div>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {getWeeklyPomodoros()} / {weeklyGoal} goal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goals Modal */}
      {showGoals && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-2xl w-full border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className={`sticky top-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} px-4 sm:px-6 py-4 flex items-center justify-between`}>
              <h2 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Goals & Targets</h2>
              <button
                onClick={() => setShowGoals(false)}
                className={`p-2 rounded-xl transition-all active:scale-95 ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-900'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Daily Pomodoro Goal
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(parseInt(e.target.value) || 4)}
                  className={`w-full px-4 py-2.5 border rounded-xl transition-all ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900 shadow-sm'} focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:shadow-md`}
                />
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Current: {getTodayPomodoros()} / {dailyGoal}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Weekly Pomodoro Goal
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(parseInt(e.target.value) || 20)}
                  className={`w-full px-4 py-2.5 border rounded-xl transition-all ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900 shadow-sm'} focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:shadow-md`}
                />
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Current: {getWeeklyPomodoros()} / {weeklyGoal}
                </p>
              </div>
              {getTodayPomodoros() >= dailyGoal && (
                <div className={`p-4 rounded-lg bg-green-100 border border-green-300 ${theme === 'dark' ? 'bg-green-900/30 border-green-700' : ''}`}>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-600" />
                    <p className={`font-semibold ${theme === 'dark' ? 'text-green-300' : 'text-green-800'}`}>
                      Daily goal achieved! 🎉
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <MobileBottomAd adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <Footer />
    </div>
  )
}


