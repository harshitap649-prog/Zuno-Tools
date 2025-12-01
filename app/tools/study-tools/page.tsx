'use client'

import { useState, useEffect } from 'react'
import Footer from '@/components/Footer'
import { GraduationCap, Clock, BookOpen, Plus, X, Play, Pause, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

interface Flashcard {
  id: string
  front: string
  back: string
}

export default function StudyTools() {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'timer' | 'notes'>('flashcards')
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentCard, setCurrentCard] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [newCard, setNewCard] = useState({ front: '', back: '' })
  
  const [timerMinutes, setTimerMinutes] = useState(25)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60)

  const [notes, setNotes] = useState('')

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            setIsRunning(false)
            toast.success('Timer completed!')
            return 0
          }
          return timeLeft - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft])

  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    setTimerMinutes(minutes)
    setTimerSeconds(seconds)
  }, [timeLeft])

  const addFlashcard = () => {
    if (!newCard.front.trim() || !newCard.back.trim()) {
      toast.error('Please fill in both front and back of the card')
      return
    }
    setFlashcards([...flashcards, { id: Date.now().toString(), ...newCard }])
    setNewCard({ front: '', back: '' })
    toast.success('Flashcard added!')
  }

  const deleteFlashcard = (id: string) => {
    setFlashcards(flashcards.filter(card => card.id !== id))
    if (currentCard >= flashcards.length - 1) {
      setCurrentCard(Math.max(0, currentCard - 1))
    }
  }

  const nextCard = () => {
    setCurrentCard((currentCard + 1) % flashcards.length)
    setIsFlipped(false)
  }

  const prevCard = () => {
    setCurrentCard((currentCard - 1 + flashcards.length) % flashcards.length)
    setIsFlipped(false)
  }

  const startTimer = () => {
    setIsRunning(true)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(25 * 60)
    setTimerMinutes(25)
    setTimerSeconds(0)
  }

  const setTimer = (minutes: number) => {
    setTimeLeft(minutes * 60)
    setTimerMinutes(minutes)
    setTimerSeconds(0)
    setIsRunning(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 mb-3 sm:mb-4">
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Study Tools</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Essential tools for students - flashcards, timers, and notes</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto">
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`flex-1 min-w-[120px] px-3 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-colors touch-manipulation ${
                  activeTab === 'flashcards'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-900 hover:text-gray-900 active:bg-gray-50'
                }`}
              >
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 inline-block mr-1 sm:mr-2" />
                Flashcards
              </button>
              <button
                onClick={() => setActiveTab('timer')}
                className={`flex-1 min-w-[120px] px-3 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-colors touch-manipulation ${
                  activeTab === 'timer'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-900 hover:text-gray-900 active:bg-gray-50'
                }`}
              >
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 inline-block mr-1 sm:mr-2" />
                Pomodoro Timer
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 min-w-[120px] px-3 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-colors touch-manipulation ${
                  activeTab === 'notes'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-900 hover:text-gray-900 active:bg-gray-50'
                }`}
              >
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 inline-block mr-1 sm:mr-2" />
                Study Notes
              </button>
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              {/* Flashcards */}
              {activeTab === 'flashcards' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-900">Add New Card</h2>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Front</label>
                        <textarea
                          value={newCard.front}
                          onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                          placeholder="Question or term..."
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Back</label>
                        <textarea
                          value={newCard.back}
                          onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                          placeholder="Answer or definition..."
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={addFlashcard}
                        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                      >
                        <Plus className="h-5 w-5" />
                        <span>Add Card</span>
                      </button>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Cards ({flashcards.length})
                      </h2>
                      {flashcards.length > 0 ? (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {flashcards.map((card, index) => (
                            <div key={card.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{card.front}</p>
                                <p className="text-xs text-gray-900 mt-1">{card.back}</p>
                              </div>
                              <button
                                onClick={() => deleteFlashcard(card.id)}
                                className="text-red-600 hover:text-red-700 ml-2"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center py-8">No flashcards yet. Add one to get started!</p>
                      )}
                    </div>
                  </div>

                  {flashcards.length > 0 && (
                    <div className="border-t pt-6">
                      <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-4">
                          <span className="text-sm text-gray-900">
                            Card {currentCard + 1} of {flashcards.length}
                          </span>
                        </div>
                        <div
                          className="relative h-64 cursor-pointer"
                          onClick={() => setIsFlipped(!isFlipped)}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg p-8 flex items-center justify-center transition-transform duration-500 ${
                            isFlipped ? 'rotate-y-180 opacity-0' : 'opacity-100'
                          }`}>
                            <p className="text-white text-xl font-semibold text-center">
                              {flashcards[currentCard]?.front}
                            </p>
                          </div>
                          <div className={`absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg p-8 flex items-center justify-center transition-transform duration-500 ${
                            isFlipped ? 'opacity-100' : 'rotate-y-180 opacity-0'
                          }`}>
                            <p className="text-white text-xl font-semibold text-center">
                              {flashcards[currentCard]?.back}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-center space-x-4 mt-6">
                          <button
                            onClick={prevCard}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => setIsFlipped(!isFlipped)}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                          >
                            {isFlipped ? 'Show Front' : 'Flip Card'}
                          </button>
                          <button
                            onClick={nextCard}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Timer */}
              {activeTab === 'timer' && (
                <div className="max-w-md mx-auto space-y-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-gray-900 mb-4">
                      {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                    </div>
                    <div className="flex justify-center space-x-4">
                      {!isRunning ? (
                        <button
                          onClick={startTimer}
                          className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center space-x-2"
                        >
                          <Play className="h-5 w-5" />
                          <span>Start</span>
                        </button>
                      ) : (
                        <button
                          onClick={pauseTimer}
                          className="bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-700 flex items-center space-x-2"
                        >
                          <Pause className="h-5 w-5" />
                          <span>Pause</span>
                        </button>
                      )}
                      <button
                        onClick={resetTimer}
                        className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <RotateCcw className="h-5 w-5" />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => setTimer(5)}
                      className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                    >
                      5 min
                    </button>
                    <button
                      onClick={() => setTimer(15)}
                      className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                    >
                      15 min
                    </button>
                    <button
                      onClick={() => setTimer(25)}
                      className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                    >
                      25 min
                    </button>
                    <button
                      onClick={() => setTimer(45)}
                      className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                    >
                      45 min
                    </button>
                  </div>
                </div>
              )}

              {/* Notes */}
              {activeTab === 'notes' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Study Notes</h2>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write your study notes here..."
                    rows={20}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-sm text-gray-900">
                      {notes.split(/\s+/).filter(w => w.length > 0).length} words
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(notes)
                        toast.success('Notes copied to clipboard!')
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Copy Notes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

