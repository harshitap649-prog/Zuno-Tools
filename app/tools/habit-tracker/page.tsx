'use client'

import { useState, useEffect, useMemo } from 'react'
import Footer from '@/components/Footer'
import SidebarAd from '@/components/SidebarAd'
import MobileBottomAd from '@/components/MobileBottomAd'
import { 
  Target, Sparkles, Plus, Trash2, Check, Edit2, Calendar,
  TrendingUp, Flame, Award, BarChart3, Settings, X, Save,
  Clock, Bell, Star, Trophy, Zap, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Filter, Search, Download,
  Share2, RefreshCw, Info, FileText, Archive
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Habit {
  id: string
  name: string
  color: string
  streak: number
  longestStreak: number
  totalCompletions: number
  lastCompleted: string | null
  createdAt: string
  goal?: number // days per week
  reminder?: string // time of day
  icon?: string
  notes?: string
  category?: string
  archived?: boolean
  priority?: 'low' | 'medium' | 'high'
  frequency?: 'daily' | 'weekly' | 'custom'
}

interface Completion {
  habitId: string
  date: string
}

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabit, setNewHabit] = useState('')
  const [selectedColor, setSelectedColor] = useState('from-blue-500 to-cyan-500')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'calendar' | 'stats'>('grid')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [goal, setGoal] = useState(7)
  const [reminder, setReminder] = useState('')
  const [completions, setCompletions] = useState<Completion[]>([])
  const [selectedIcon, setSelectedIcon] = useState('')
  const [notes, setNotes] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showArchived, setShowArchived] = useState(false)

  const colors = [
    { value: 'from-blue-500 to-cyan-500', name: 'Blue' },
    { value: 'from-green-500 to-emerald-500', name: 'Green' },
    { value: 'from-purple-500 to-pink-500', name: 'Purple' },
    { value: 'from-orange-500 to-red-500', name: 'Orange' },
    { value: 'from-yellow-400 to-pink-400', name: 'Yellow' },
    { value: 'from-indigo-500 to-purple-500', name: 'Indigo' },
    { value: 'from-pink-500 to-rose-500', name: 'Pink' },
    { value: 'from-teal-500 to-cyan-500', name: 'Teal' },
  ]

  const icons = ['🎯', '💪', '📚', '🏃', '🧘', '💧', '🍎', '📖', '✍️', '🎨', '🎵', '🌱', '🏋️', '🚶', '🧠', '💤', '☕', '🥗', '📱', '🎮', '🎬', '🎤', '📸', '✈️']
  const categories = ['Health', 'Fitness', 'Learning', 'Productivity', 'Social', 'Creative', 'Finance', 'Spiritual', 'Other']

  // Load data from localStorage
  useEffect(() => {
    const savedHabits = localStorage.getItem('zuno-habits')
    const savedCompletions = localStorage.getItem('zuno-habit-completions')
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits))
    }
    if (savedCompletions) {
      setCompletions(JSON.parse(savedCompletions))
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('zuno-habits', JSON.stringify(habits))
  }, [habits])

  useEffect(() => {
    localStorage.setItem('zuno-habit-completions', JSON.stringify(completions))
  }, [completions])

  const addHabit = () => {
    if (!newHabit.trim()) {
      toast.error('Please enter a habit name')
      return
    }

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.trim(),
      color: selectedColor,
      streak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      lastCompleted: null,
      createdAt: new Date().toISOString(),
      goal: goal || undefined,
      reminder: reminder || undefined,
      icon: selectedIcon || icons[Math.floor(Math.random() * icons.length)],
      notes: notes.trim() || undefined,
      category: category || undefined,
      priority: priority || undefined,
      frequency: frequency || 'daily',
    }
    setHabits([...habits, habit])
    setNewHabit('')
    setGoal(7)
    setReminder('')
    setSelectedIcon('')
    setNotes('')
    setCategory('')
    setPriority('medium')
    setFrequency('daily')
    setShowAddForm(false)
    toast.success('Habit added!', { icon: '✅', duration: 3000 })
  }

  const completeHabit = (id: string, date?: Date) => {
    const targetDate = date || new Date()
    const dateString = targetDate.toISOString().split('T')[0]
    const today = new Date().toISOString().split('T')[0]

    // Check if already completed for this date
    const alreadyCompleted = completions.some(
      c => c.habitId === id && c.date === dateString
    )

    if (alreadyCompleted && dateString === today) {
      toast('Already completed today!', { duration: 2000, icon: 'ℹ️' })
      return
    }

    // Add completion
    if (!alreadyCompleted) {
      setCompletions([...completions, { habitId: id, date: dateString }])
    }

    // Update habit stats
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const lastCompleted = habit.lastCompleted 
          ? new Date(habit.lastCompleted).toISOString().split('T')[0] 
          : null
        
        const yesterday = new Date(targetDate)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayString = yesterday.toISOString().split('T')[0]
        
        const isConsecutive = lastCompleted === yesterdayString
        const newStreak = isConsecutive ? habit.streak + 1 : (dateString === today ? 1 : habit.streak)
        const newLongestStreak = Math.max(habit.longestStreak, newStreak)

        return {
          ...habit,
          streak: newStreak,
          longestStreak: newLongestStreak,
          totalCompletions: habit.totalCompletions + (alreadyCompleted ? 0 : 1),
          lastCompleted: targetDate.toISOString(),
        }
      }
      return habit
    }))

    if (!alreadyCompleted) {
      toast.success('Habit completed!', { icon: '🎉', duration: 3000 })
    }
  }

  const uncompleteHabit = (id: string, date: string) => {
    setCompletions(completions.filter(c => !(c.habitId === id && c.date === date)))
    
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const newTotal = Math.max(0, habit.totalCompletions - 1)
        return {
          ...habit,
          totalCompletions: newTotal,
        }
      }
      return habit
    }))
    
    toast.success('Completion removed!', { duration: 2000 })
  }

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(habit => habit.id !== id))
    setCompletions(completions.filter(c => c.habitId !== id))
    toast.success('Habit deleted!', { duration: 2000 })
  }

  const startEdit = (habit: Habit) => {
    setEditingId(habit.id)
    setEditName(habit.name)
    setSelectedColor(habit.color)
    setGoal(habit.goal || 7)
    setReminder(habit.reminder || '')
    setSelectedIcon(habit.icon || '')
    setNotes(habit.notes || '')
    setCategory(habit.category || '')
    setPriority(habit.priority || 'medium')
    setFrequency(habit.frequency || 'daily')
  }

  const saveEdit = () => {
    if (!editName.trim()) {
      toast.error('Habit name cannot be empty')
      return
    }
    setHabits(habits.map(habit => 
      habit.id === editingId
        ? { 
            ...habit, 
            name: editName.trim(), 
            color: selectedColor, 
            goal, 
            reminder,
            icon: selectedIcon || habit.icon,
            notes: notes.trim() || undefined,
            category: category || undefined,
            priority: priority || undefined,
            frequency: frequency || 'daily',
          }
        : habit
    ))
    setEditingId(null)
    setEditName('')
    setSelectedIcon('')
    setNotes('')
    setCategory('')
    setPriority('medium')
    setFrequency('daily')
    toast.success('Habit updated!', { duration: 2000 })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setSelectedIcon('')
    setNotes('')
    setCategory('')
    setPriority('medium')
    setFrequency('daily')
  }

  const archiveHabit = (id: string) => {
    setHabits(habits.map(habit =>
      habit.id === id ? { ...habit, archived: true } : habit
    ))
    toast.success('Habit archived!', { duration: 2000 })
  }

  const unarchiveHabit = (id: string) => {
    setHabits(habits.map(habit =>
      habit.id === id ? { ...habit, archived: false } : habit
    ))
    toast.success('Habit unarchived!', { duration: 2000 })
  }

  const duplicateHabit = (habit: Habit) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      name: `${habit.name} (Copy)`,
      streak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      lastCompleted: null,
      createdAt: new Date().toISOString(),
    }
    setHabits([...habits, newHabit])
    toast.success('Habit duplicated!', { duration: 2000 })
  }

  const isCompletedOnDate = (habitId: string, date: string) => {
    return completions.some(c => c.habitId === habitId && c.date === date)
  }

  const getCompletionRate = (habit: Habit) => {
    if (!habit.goal) return null
    const daysSinceCreation = Math.floor(
      (new Date().getTime() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1
    const weeks = Math.ceil(daysSinceCreation / 7)
    const expectedCompletions = weeks * habit.goal
    return expectedCompletions > 0 ? (habit.totalCompletions / expectedCompletions) * 100 : 0
  }

  const filteredHabits = useMemo(() => {
    let filtered = habits.filter(h => showArchived ? true : !h.archived)
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(habit => 
        habit.name.toLowerCase().includes(query) ||
        habit.icon?.includes(query) ||
        habit.category?.toLowerCase().includes(query) ||
        habit.notes?.toLowerCase().includes(query)
      )
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(habit => habit.category === filterCategory)
    }
    
    return filtered
  }, [habits, searchQuery, filterCategory, showArchived])

  const stats = useMemo(() => {
    const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0)
    const totalCompletions = habits.reduce((sum, h) => sum + h.totalCompletions, 0)
    const longestStreak = Math.max(...habits.map(h => h.longestStreak), 0)
    const completedToday = habits.filter(h => 
      h.lastCompleted && new Date(h.lastCompleted).toDateString() === new Date().toDateString()
    ).length

    return {
      totalStreak,
      totalCompletions,
      longestStreak,
      completedToday,
      totalHabits: habits.length,
    }
  }, [habits])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const exportData = () => {
    const data = {
      habits,
      completions,
      exportDate: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `habits-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Data exported!', { icon: '📥', duration: 3000 })
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(selectedDate)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SidebarAd position="left" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <SidebarAd position="right" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      
      <main className="flex-grow py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="relative inline-flex items-center justify-center mb-3 sm:mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
              <div className="relative inline-flex p-2 sm:p-3 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 shadow-lg">
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">
              Habit Tracker
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-4">Track your daily habits and build streaks</p>
          </div>

          {/* Stats Cards */}
          {habits.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 sm:p-4 border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-gray-600">Total Streak</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalStreak}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 border-2 border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-gray-600">Today</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.completedToday}/{habits.length}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 sm:p-4 border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-purple-500" />
                  <span className="text-xs text-gray-600">Longest</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.longestStreak}</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-3 sm:p-4 border-2 border-orange-200">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-gray-600">Total</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalCompletions}</div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl sm:rounded-2xl shadow-xl border-2 border-purple-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {habits.length > 0 && (
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search habits..."
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium text-sm"
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-xl font-semibold text-sm transition-all ${
                    viewMode === 'grid'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-2 rounded-xl font-semibold text-sm transition-all ${
                    viewMode === 'calendar'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('stats')}
                  className={`px-3 py-2 rounded-xl font-semibold text-sm transition-all ${
                    viewMode === 'stats'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                </button>
              </div>
              {habits.length > 0 && (
                <>
                  <button
                    onClick={exportData}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                  <button
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = '.json'
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (event) => {
                            try {
                              const data = JSON.parse(event.target?.result as string)
                              if (data.habits && Array.isArray(data.habits)) {
                                setHabits([...data.habits, ...habits])
                                if (data.completions) {
                                  setCompletions([...data.completions, ...completions])
                                }
                                toast.success(`${data.habits.length} habits imported!`, { icon: '📥', duration: 3000 })
                              } else {
                                toast.error('Invalid file format')
                              }
                            } catch (error) {
                              toast.error('Failed to import habits')
                            }
                          }
                          reader.readAsText(file)
                        }
                      }
                      input.click()
                    }}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Import</span>
                  </button>
                </>
              )}
            </div>

            {/* Filters */}
            {habits.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900 font-medium text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2 ml-auto">
                  <input
                    type="checkbox"
                    id="showArchived"
                    checked={showArchived}
                    onChange={(e) => setShowArchived(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="showArchived" className="text-sm font-medium text-gray-900">
                    Show Archived
                  </label>
                </div>
              </div>
            )}

            {/* Add Habit Form */}
            {showAddForm ? (
              <div className="space-y-4 p-4 bg-white rounded-xl border-2 border-purple-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Add New Habit</h3>
                  <button
                    onClick={() => {
                      setShowAddForm(false)
                      setNewHabit('')
                      setGoal(7)
                      setReminder('')
                      setSelectedIcon('')
                      setNotes('')
                      setCategory('')
                      setPriority('medium')
                      setFrequency('daily')
                    }}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                  placeholder="Enter habit name..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Icon</label>
                    <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto p-2 border-2 border-gray-200 rounded-xl">
                      {icons.map(icon => (
                        <button
                          key={icon}
                          onClick={() => setSelectedIcon(icon)}
                          className={`w-8 h-8 text-xl rounded-lg transition-all ${
                            selectedIcon === icon ? 'ring-2 ring-purple-500 bg-purple-50 scale-110' : 'hover:bg-gray-100'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {colors.map(color => (
                        <button
                          key={color.value}
                          onClick={() => setSelectedColor(color.value)}
                          className={`w-10 h-10 rounded-lg bg-gradient-to-r ${color.value} transition-all ${
                            selectedColor === color.value ? 'ring-4 ring-gray-900 scale-110' : 'hover:scale-105'
                          }`}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900 font-medium"
                    >
                      <option value="">No Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900 font-medium"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Frequency</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'custom')}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900 font-medium"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Goal (days/week)</label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={goal}
                      onChange={(e) => setGoal(Number(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Reminder (optional)</label>
                  <input
                    type="time"
                    value={reminder}
                    onChange={(e) => setReminder(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this habit..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900 font-medium resize-none"
                  />
                </div>
                <button
                  onClick={addHabit}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 touch-manipulation min-h-[48px]"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Habit</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 touch-manipulation min-h-[48px]"
              >
                <Plus className="h-5 w-5" />
                <span>Add New Habit</span>
              </button>
            )}
          </div>

          {/* Main Content */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredHabits.length === 0 ? (
                <div className="col-span-full text-center py-12 sm:py-16">
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full blur-xl opacity-50"></div>
                    <Target className="relative h-16 w-16 sm:h-20 sm:w-20 text-gray-300" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    {habits.length === 0 ? 'No Habits Yet' : 'No Matching Habits'}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 font-medium mb-4 max-w-md mx-auto">
                    {habits.length === 0 
                      ? 'Start building better habits by adding your first one above!' 
                      : 'Try adjusting your search to see more results.'}
                  </p>
                </div>
              ) : (
                filteredHabits.map(habit => {
                  const completed = isCompletedOnDate(habit.id, new Date().toISOString().split('T')[0])
                  const completionRate = getCompletionRate(habit)
                  const isEditing = editingId === habit.id

                  return (
                    <div
                      key={habit.id}
                      className={`bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl sm:rounded-2xl shadow-xl border-2 p-4 sm:p-6 transition-all hover:shadow-2xl ${
                        completed ? 'border-green-400 bg-green-50/50' : 'border-purple-200'
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 font-medium text-sm"
                            autoFocus
                            placeholder="Habit name..."
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-semibold text-gray-900 mb-1">Icon</label>
                              <div className="flex gap-1 flex-wrap max-h-20 overflow-y-auto p-1 border border-gray-200 rounded">
                                {icons.slice(0, 12).map(icon => (
                                  <button
                                    key={icon}
                                    onClick={() => setSelectedIcon(icon)}
                                    className={`w-6 h-6 text-sm rounded ${selectedIcon === icon ? 'ring-1 ring-purple-500 bg-purple-50' : 'hover:bg-gray-100'}`}
                                  >
                                    {icon}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-900 mb-1">Color</label>
                              <div className="flex gap-1 flex-wrap">
                                {colors.slice(0, 6).map(color => (
                                  <button
                                    key={color.value}
                                    onClick={() => setSelectedColor(color.value)}
                                    className={`w-6 h-6 rounded bg-gradient-to-r ${color.value} ${selectedColor === color.value ? 'ring-2 ring-gray-900' : ''}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                              className="px-2 py-1.5 border border-gray-300 rounded text-gray-900 text-xs"
                            >
                              <option value="">No Category</option>
                              {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                            <select
                              value={priority}
                              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                              className="px-2 py-1.5 border border-gray-300 rounded text-gray-900 text-xs"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Notes..."
                            rows={2}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-gray-900 text-xs resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={saveEdit}
                              className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all text-sm active:scale-95 touch-manipulation min-h-[44px]"
                            >
                              <Save className="h-4 w-4 inline mr-1" />
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all text-sm active:scale-95 touch-manipulation min-h-[44px]"
                            >
                              <X className="h-4 w-4 inline mr-1" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-2xl flex-shrink-0">{habit.icon}</span>
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-bold text-gray-900 text-lg ${habit.archived ? 'line-through opacity-60' : ''}`}>
                                  {habit.name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  {habit.category && (
                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                                      {habit.category}
                                    </span>
                                  )}
                                  {habit.priority && (
                                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                                      habit.priority === 'high' ? 'bg-red-100 text-red-700' :
                                      habit.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-blue-100 text-blue-700'
                                    }`}>
                                      {habit.priority.toUpperCase()}
                                    </span>
                                  )}
                                  {habit.frequency && habit.frequency !== 'daily' && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                                      {habit.frequency}
                                    </span>
                                  )}
                                  {habit.archived && (
                                    <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-lg text-xs font-medium">
                                      Archived
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => duplicateHabit(habit)}
                                className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-all"
                                title="Duplicate"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => startEdit(habit)}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              {!habit.archived ? (
                                <button
                                  onClick={() => archiveHabit(habit.id)}
                                  className="p-1.5 text-purple-500 hover:bg-purple-50 rounded-lg transition-all"
                                  title="Archive"
                                >
                                  <Archive className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => unarchiveHabit(habit.id)}
                                  className="p-1.5 text-purple-500 hover:bg-purple-50 rounded-lg transition-all"
                                  title="Unarchive"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteHabit(habit.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-xs text-gray-600 mb-1">Current Streak</div>
                                <div className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                                  <Flame className="h-5 w-5 text-orange-500" />
                                  {habit.streak} {habit.streak === 1 ? 'day' : 'days'}
                                </div>
                              </div>
                              <button
                                onClick={() => completeHabit(habit.id)}
                                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                                  completed
                                    ? 'bg-green-500 text-white scale-110'
                                    : `bg-gradient-to-r ${habit.color} text-white hover:scale-110 active:scale-95`
                                }`}
                              >
                                <Check className="h-6 w-6 sm:h-7 sm:w-7" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                              <div>
                                <div className="text-xs text-gray-600 mb-1">Longest</div>
                                <div className="text-lg font-bold text-gray-900">{habit.longestStreak} days</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-600 mb-1">Total</div>
                                <div className="text-lg font-bold text-gray-900">{habit.totalCompletions}</div>
                              </div>
                            </div>

                            {habit.goal && completionRate !== null && (
                              <div>
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                  <span>Weekly Goal: {habit.goal} days</span>
                                  <span>{Math.round(completionRate)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, completionRate)}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {habit.reminder && (
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Bell className="h-3 w-3" />
                                <span>Reminder: {habit.reminder}</span>
                              </div>
                            )}
                            {habit.notes && (
                              <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2 mt-2">
                                <p className="line-clamp-2">{habit.notes}</p>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}

          {viewMode === 'calendar' && (
            <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl sm:rounded-2xl shadow-xl border-2 border-purple-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => {
                    const newDate = new Date(selectedDate)
                    newDate.setMonth(newDate.getMonth() - 1)
                    setSelectedDate(newDate)
                  }}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => {
                    const newDate = new Date(selectedDate)
                    newDate.setMonth(newDate.getMonth() + 1)
                    setSelectedDate(newDate)
                  }}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const isToday = dateStr === new Date().toISOString().split('T')[0]
                  const isPast = new Date(dateStr) < new Date(new Date().toISOString().split('T')[0])

                  return (
                    <div
                      key={day}
                      className={`aspect-square border-2 rounded-lg p-1 ${
                        isToday ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="text-xs font-semibold text-gray-900 mb-1">{day}</div>
                      <div className="flex flex-wrap gap-0.5">
                        {habits.map(habit => {
                          const completed = isCompletedOnDate(habit.id, dateStr)
                          return (
                            <button
                              key={habit.id}
                              onClick={() => {
                                if (isPast || isToday) {
                                  if (completed) {
                                    uncompleteHabit(habit.id, dateStr)
                                  } else {
                                    completeHabit(habit.id, new Date(dateStr))
                                  }
                                }
                              }}
                              className={`w-2 h-2 rounded-full ${
                                completed
                                  ? `bg-gradient-to-r ${habit.color}`
                                  : 'bg-gray-200'
                              } ${isPast || isToday ? 'cursor-pointer hover:scale-150' : 'cursor-not-allowed opacity-50'}`}
                              title={habit.name}
                            />
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {viewMode === 'stats' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl sm:rounded-2xl shadow-xl border-2 border-purple-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Statistics
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {habits.map(habit => {
                    const completionRate = getCompletionRate(habit)
                    return (
                      <div key={habit.id} className="bg-white rounded-xl p-4 border-2 border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">{habit.icon}</span>
                          <h3 className="font-bold text-gray-900">{habit.name}</h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Streak:</span>
                            <span className="font-semibold text-gray-900">{habit.streak} days</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Longest:</span>
                            <span className="font-semibold text-gray-900">{habit.longestStreak} days</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total:</span>
                            <span className="font-semibold text-gray-900">{habit.totalCompletions} times</span>
                          </div>
                          {completionRate !== null && (
                            <div>
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Goal Progress</span>
                                <span>{Math.round(completionRate)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                  style={{ width: `${Math.min(100, completionRate)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <MobileBottomAd adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <Footer />
    </div>
  )
}
