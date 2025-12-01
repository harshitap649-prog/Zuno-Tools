'use client'

import { useState, useEffect } from 'react'
import Footer from '@/components/Footer'
import { Target, Sparkles, Plus, Trash2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface Habit {
  id: string
  name: string
  color: string
  streak: number
  lastCompleted: string | null
}

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabit, setNewHabit] = useState('')
  const [selectedColor, setSelectedColor] = useState('from-blue-500 to-cyan-500')

  const colors = [
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-purple-500 to-pink-500',
    'from-orange-500 to-red-500',
    'from-yellow-500 to-amber-500',
    'from-indigo-500 to-purple-500',
  ]

  useEffect(() => {
    const savedHabits = localStorage.getItem('zuno-habits')
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('zuno-habits', JSON.stringify(habits))
  }, [habits])

  const addHabit = () => {
    if (!newHabit.trim()) return

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit,
      color: selectedColor,
      streak: 0,
      lastCompleted: null,
    }
    setHabits([...habits, habit])
    setNewHabit('')
    toast.success('Habit added!')
  }

  const completeHabit = (id: string) => {
    const today = new Date().toDateString()
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted).toDateString() : null
        const isToday = lastCompleted === today
        const isConsecutive = lastCompleted && new Date(today).getTime() - new Date(lastCompleted).getTime() === 86400000

        if (!isToday) {
          return {
            ...habit,
            streak: isConsecutive ? habit.streak + 1 : 1,
            lastCompleted: new Date().toISOString(),
          }
        }
      }
      return habit
    }))
    toast.success('Habit completed!')
  }

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(habit => habit.id !== id))
    toast.success('Habit deleted!')
  }

  const isCompletedToday = (habit: Habit) => {
    if (!habit.lastCompleted) return false
    return new Date(habit.lastCompleted).toDateString() === new Date().toDateString()
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 mb-3 sm:mb-4">
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Habit Tracker</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Track your daily habits and build streaks</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div className="space-y-4">
              <input
                type="text"
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                placeholder="Enter habit name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
              <div className="flex gap-2 flex-wrap">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-lg bg-gradient-to-r ${color} ${
                      selectedColor === color ? 'ring-2 ring-gray-900' : ''
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={addHabit}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Habit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {habits.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No habits yet. Add one to start tracking!</p>
                </div>
              ) : (
                habits.map(habit => {
                  const completed = isCompletedToday(habit)
                  return (
                    <div
                      key={habit.id}
                      className={`p-4 rounded-lg border-2 ${
                        completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{habit.name}</h3>
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600">Streak</div>
                          <div className="text-2xl font-bold text-gray-900">{habit.streak} days</div>
                        </div>
                        <button
                          onClick={() => completeHabit(habit.id)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                            completed
                              ? 'bg-green-500 text-white'
                              : `bg-gradient-to-r ${habit.color} text-white hover:opacity-90`
                          }`}
                        >
                          <Check className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

