'use client'

import { useState, useEffect, useMemo } from 'react'
import Footer from '@/components/Footer'
import SidebarAd from '@/components/SidebarAd'
import MobileBottomAd from '@/components/MobileBottomAd'
import { GraduationCap, BookOpen, Plus, X, Search, Download, Upload, Copy, Check, Target, TrendingUp, Calendar, Award, Shuffle, Edit2, Save, FileText, BarChart3, Clock, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

interface Flashcard {
  id: string
  front: string
  back: string
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  lastReviewed?: number
  reviewCount?: number
}

interface StudyNote {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

interface StudySession {
  date: string
  cardsStudied: number
  timeSpent: number
}

export default function StudyTools() {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'notes' | 'stats'>('flashcards')
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentCard, setCurrentCard] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [newCard, setNewCard] = useState({ front: '', back: '', category: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [quizMode, setQuizMode] = useState(false)
  const [quizCards, setQuizCards] = useState<Flashcard[]>([])
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 })
  const [showAnswer, setShowAnswer] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  
  const [notes, setNotes] = useState<StudyNote[]>([])
  const [activeNote, setActiveNote] = useState<string | null>(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteSearch, setNoteSearch] = useState('')
  
  const [studyGoal, setStudyGoal] = useState({ dailyCards: 10, dailyMinutes: 30 })
  const [studyStats, setStudyStats] = useState({
    totalCards: 0,
    cardsStudied: 0,
    studyStreak: 0,
    totalStudyTime: 0,
    lastStudyDate: ''
  })
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  
  const { triggerPopunder } = usePopunderAd()

  // Load data from localStorage
  useEffect(() => {
    const savedCards = localStorage.getItem('study-tools-flashcards')
    const savedNotes = localStorage.getItem('study-tools-notes')
    const savedStats = localStorage.getItem('study-tools-stats')
    const savedGoal = localStorage.getItem('study-tools-goal')
    const savedSessions = localStorage.getItem('study-tools-sessions')
    
    if (savedCards) setFlashcards(JSON.parse(savedCards))
    if (savedNotes) setNotes(JSON.parse(savedNotes))
    if (savedStats) setStudyStats(JSON.parse(savedStats))
    if (savedGoal) setStudyGoal(JSON.parse(savedGoal))
    if (savedSessions) setStudySessions(JSON.parse(savedSessions))
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('study-tools-flashcards', JSON.stringify(flashcards))
    localStorage.setItem('study-tools-notes', JSON.stringify(notes))
    localStorage.setItem('study-tools-stats', JSON.stringify(studyStats))
    localStorage.setItem('study-tools-goal', JSON.stringify(studyGoal))
    localStorage.setItem('study-tools-sessions', JSON.stringify(studySessions))
  }, [flashcards, notes, studyStats, studyGoal, studySessions])

  // Update stats
  useEffect(() => {
    setStudyStats(prev => ({
      ...prev,
      totalCards: flashcards.length
    }))
  }, [flashcards.length])

  const categories = useMemo(() => {
    const cats = new Set(flashcards.map(c => c.category).filter(Boolean))
    return Array.from(cats)
  }, [flashcards])

  const filteredFlashcards = useMemo(() => {
    let filtered = flashcards
    if (searchQuery) {
      filtered = filtered.filter(card => 
        card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.back.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(card => card.category === selectedCategory)
    }
    return filtered
  }, [flashcards, searchQuery, selectedCategory])

  const addFlashcard = () => {
    if (!newCard.front.trim() || !newCard.back.trim()) {
      toast.error('Please fill in both front and back of the card')
      return
    }
    const card: Flashcard = {
      id: Date.now().toString(),
      front: newCard.front,
      back: newCard.back,
      category: newCard.category || undefined,
      difficulty: 'medium',
      reviewCount: 0
    }
    setFlashcards([...flashcards, card])
    setNewCard({ front: '', back: '', category: '' })
    toast.success('Flashcard added!')
  }

  const deleteFlashcard = (id: string) => {
    setFlashcards(flashcards.filter(card => card.id !== id))
    if (currentCard >= flashcards.length - 1) {
      setCurrentCard(Math.max(0, currentCard - 1))
    }
    toast.success('Flashcard deleted!')
  }

  const editFlashcard = (id: string, updates: Partial<Flashcard>) => {
    setFlashcards(flashcards.map(card => 
      card.id === id ? { ...card, ...updates } : card
    ))
  }

  const nextCard = () => {
    if (quizMode && quizCards.length > 0) {
      setQuizIndex((quizIndex + 1) % quizCards.length)
    } else {
      setCurrentCard((currentCard + 1) % filteredFlashcards.length)
    }
    setIsFlipped(false)
    setShowAnswer(false)
    setUserAnswer('')
  }

  const prevCard = () => {
    if (quizMode && quizCards.length > 0) {
      setQuizIndex((quizIndex - 1 + quizCards.length) % quizCards.length)
    } else {
      setCurrentCard((currentCard - 1 + filteredFlashcards.length) % filteredFlashcards.length)
    }
    setIsFlipped(false)
    setShowAnswer(false)
    setUserAnswer('')
  }

  const startQuiz = () => {
    if (filteredFlashcards.length === 0) {
      toast.error('No flashcards available for quiz')
      return
    }
    const shuffled = [...filteredFlashcards].sort(() => Math.random() - 0.5)
    setQuizCards(shuffled)
    setQuizIndex(0)
    setQuizMode(true)
    setQuizScore({ correct: 0, total: 0 })
    setShowAnswer(false)
    setUserAnswer('')
    toast.success('Quiz started!')
  }

  const endQuiz = () => {
    setQuizMode(false)
    const percentage = Math.round((quizScore.correct / quizScore.total) * 100)
    toast.success(`Quiz completed! Score: ${quizScore.correct}/${quizScore.total} (${percentage}%)`)
    
    // Update stats
    const today = new Date().toISOString().split('T')[0]
    setStudyStats(prev => ({
      ...prev,
      cardsStudied: prev.cardsStudied + quizScore.total,
      lastStudyDate: today
    }))
    
    // Add study session
    const session: StudySession = {
      date: today,
      cardsStudied: quizScore.total,
      timeSpent: Math.ceil(quizScore.total * 0.5) // Estimate 30 seconds per card
    }
    setStudySessions(prev => {
      const existing = prev.find(s => s.date === today)
      if (existing) {
        return prev.map(s => s.date === today 
          ? { ...s, cardsStudied: s.cardsStudied + session.cardsStudied, timeSpent: s.timeSpent + session.timeSpent }
          : s
        )
      }
      return [...prev, session]
    })
    
    // Update streak
    updateStreak()
  }

  const checkQuizAnswer = () => {
    if (!showAnswer) {
      setShowAnswer(true)
      setQuizScore(prev => ({ ...prev, total: prev.total + 1 }))
      const current = quizCards[quizIndex]
      const isCorrect = userAnswer.toLowerCase().trim() === current.back.toLowerCase().trim()
      if (isCorrect) {
        setQuizScore(prev => ({ ...prev, correct: prev.correct + 1 }))
        toast.success('Correct!')
      } else {
        toast.error(`Incorrect. The answer is: ${current.back}`)
      }
    }
  }

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    
    setStudyStats(prev => {
      if (prev.lastStudyDate === today) {
        return prev // Already studied today
      } else if (prev.lastStudyDate === yesterday) {
        return { ...prev, studyStreak: prev.studyStreak + 1, lastStudyDate: today }
      } else {
        return { ...prev, studyStreak: 1, lastStudyDate: today }
      }
    })
  }

  const createNote = () => {
    const note: StudyNote = {
      id: Date.now().toString(),
      title: noteTitle || 'Untitled Note',
      content: noteContent,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    setNotes([...notes, note])
    setNoteTitle('')
    setNoteContent('')
    setActiveNote(null)
    toast.success('Note created!')
  }

  const updateNote = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id 
        ? { ...note, title: noteTitle, content: noteContent, updatedAt: Date.now() }
        : note
    ))
    setActiveNote(null)
    setNoteTitle('')
    setNoteContent('')
    toast.success('Note updated!')
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id))
    if (activeNote === id) {
      setActiveNote(null)
      setNoteTitle('')
      setNoteContent('')
    }
    toast.success('Note deleted!')
  }

  const openNote = (note: StudyNote) => {
    setActiveNote(note.id)
    setNoteTitle(note.title)
    setNoteContent(note.content)
  }

  const exportFlashcards = () => {
    const dataStr = JSON.stringify(flashcards, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'flashcards.json'
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Flashcards exported!')
    triggerPopunder()
  }

  const importFlashcards = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string)
        if (Array.isArray(imported)) {
          setFlashcards([...flashcards, ...imported])
          toast.success(`Imported ${imported.length} flashcards!`)
        } else {
          toast.error('Invalid file format')
        }
      } catch (error) {
        toast.error('Failed to import flashcards')
      }
    }
    reader.readAsText(file)
  }

  const exportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'study-notes.json'
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Notes exported!')
    triggerPopunder()
  }

  const filteredNotes = useMemo(() => {
    if (!noteSearch) return notes
    return notes.filter(note => 
      note.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
      note.content.toLowerCase().includes(noteSearch.toLowerCase())
    )
  }, [notes, noteSearch])

  const currentCardData = quizMode && quizCards.length > 0 
    ? quizCards[quizIndex] 
    : filteredFlashcards[currentCard]

  const progressPercentage = studyGoal.dailyCards > 0 
    ? Math.min(100, Math.round((studyStats.cardsStudied / studyGoal.dailyCards) * 100))
    : 0

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SidebarAd position="left" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <SidebarAd position="right" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <main className="flex-grow py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-6 md:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 mb-3 sm:mb-4">
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">Study Tools</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Essential tools for students - flashcards, notes, and study tracking</p>
          </div>

          {/* Study Stats Bar */}
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center">
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Total Cards</div>
                <div className="text-lg sm:text-xl font-bold text-gray-900">{studyStats.totalCards}</div>
              </div>
              <div className="text-center">
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Studied Today</div>
                <div className="text-lg sm:text-xl font-bold text-gray-900">{studyStats.cardsStudied}</div>
              </div>
              <div className="text-center">
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Study Streak</div>
                <div className="text-lg sm:text-xl font-bold text-violet-600 flex items-center justify-center gap-1">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                  {studyStats.studyStreak} days
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Daily Goal</div>
                <div className="text-lg sm:text-xl font-bold text-gray-900">
                  {progressPercentage}%
                </div>
              </div>
            </div>
            {studyGoal.dailyCards > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs sm:text-sm text-gray-600">Progress</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                    {studyStats.cardsStudied} / {studyGoal.dailyCards} cards
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto">
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`flex-1 min-w-[100px] sm:min-w-[120px] px-3 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-colors touch-manipulation ${
                  activeTab === 'flashcards'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-900 hover:text-gray-900 active:bg-gray-50'
                }`}
              >
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 inline-block mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Flashcards</span>
                <span className="sm:hidden">Cards</span>
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 min-w-[100px] sm:min-w-[120px] px-3 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-colors touch-manipulation ${
                  activeTab === 'notes'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-900 hover:text-gray-900 active:bg-gray-50'
                }`}
              >
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 inline-block mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Study Notes</span>
                <span className="sm:hidden">Notes</span>
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 min-w-[100px] sm:min-w-[120px] px-3 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-colors touch-manipulation ${
                  activeTab === 'stats'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-900 hover:text-gray-900 active:bg-gray-50'
                }`}
              >
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 inline-block mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Statistics</span>
                <span className="sm:hidden">Stats</span>
              </button>
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              {/* Flashcards */}
              {activeTab === 'flashcards' && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search flashcards..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base text-gray-900"
                      />
                    </div>
                    {categories.length > 0 && (
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base text-gray-900"
                      >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Quiz Mode */}
                  {!quizMode ? (
                    <>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <button
                          onClick={startQuiz}
                          disabled={filteredFlashcards.length === 0}
                          className="flex-1 sm:flex-none bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                          <Shuffle className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>Start Quiz</span>
                        </button>
                        <button
                          onClick={exportFlashcards}
                          className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base text-gray-900"
                        >
                          <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="hidden sm:inline">Export</span>
                        </button>
                        <label className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base text-gray-900 cursor-pointer">
                          <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="hidden sm:inline">Import</span>
                          <input
                            type="file"
                            accept=".json"
                            onChange={importFlashcards}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-3 sm:space-y-4">
                          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add New Card</h2>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">Front</label>
                            <textarea
                              value={newCard.front}
                              onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                              placeholder="Question or term..."
                              rows={3}
                              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">Back</label>
                            <textarea
                              value={newCard.back}
                              onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                              placeholder="Answer or definition..."
                              rows={3}
                              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">Category (optional)</label>
                            <input
                              type="text"
                              value={newCard.category}
                              onChange={(e) => setNewCard({ ...newCard, category: e.target.value })}
                              placeholder="e.g., Math, History, Science"
                              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                            />
                          </div>
                          <button
                            onClick={addFlashcard}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
                          >
                            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span>Add Card</span>
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                              Cards ({filteredFlashcards.length})
                            </h2>
                            {filteredFlashcards.length > 0 && (
                              <span className="text-xs sm:text-sm text-gray-500">
                                Showing {filteredFlashcards.length} of {flashcards.length}
                              </span>
                            )}
                          </div>
                          {filteredFlashcards.length > 0 ? (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                              {filteredFlashcards.map((card) => (
                                <div key={card.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 flex justify-between items-start hover:bg-gray-50 transition-colors">
                                  <div className="flex-1 min-w-0">
                                    {card.category && (
                                      <span className="inline-block text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded mb-1">
                                        {card.category}
                                      </span>
                                    )}
                                    <p className="text-sm sm:text-base font-medium text-gray-900 break-words">{card.front}</p>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">{card.back}</p>
                                  </div>
                                  <button
                                    onClick={() => deleteFlashcard(card.id)}
                                    className="text-red-600 hover:text-red-700 ml-2 flex-shrink-0"
                                  >
                                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-400 text-center py-8 text-sm sm:text-base">
                              {searchQuery || selectedCategory !== 'all' 
                                ? 'No flashcards match your search' 
                                : 'No flashcards yet. Add one to get started!'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Flashcard Viewer */}
                      {filteredFlashcards.length > 0 && (
                        <div className="border-t pt-4 sm:pt-6 mt-4 sm:mt-6">
                          <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-3 sm:mb-4">
                              <span className="text-xs sm:text-sm text-gray-900">
                                Card {currentCard + 1} of {filteredFlashcards.length}
                              </span>
                            </div>
                            <div
                              className="relative h-48 sm:h-64 cursor-pointer touch-manipulation"
                              onClick={() => setIsFlipped(!isFlipped)}
                            >
                              <div className={`absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg p-4 sm:p-8 flex items-center justify-center transition-all duration-500 ${
                                isFlipped ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                              }`}>
                                <p className="text-white text-base sm:text-xl font-semibold text-center break-words">
                                  {currentCardData?.front}
                                </p>
                              </div>
                              <div className={`absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg p-4 sm:p-8 flex items-center justify-center transition-all duration-500 ${
                                isFlipped ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                              }`}>
                                <p className="text-white text-base sm:text-xl font-semibold text-center break-words">
                                  {currentCardData?.back}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4 sm:mt-6">
                              <button
                                onClick={prevCard}
                                className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base text-gray-900"
                              >
                                Previous
                              </button>
                              <button
                                onClick={() => setIsFlipped(!isFlipped)}
                                className="px-4 sm:px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
                              >
                                {isFlipped ? 'Show Front' : 'Flip Card'}
                              </button>
                              <button
                                onClick={nextCard}
                                className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base text-gray-900"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Quiz Mode */
                    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                          <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                          Quiz Mode
                        </div>
                        <div className="text-sm sm:text-base text-gray-600 mb-2">
                          Question {quizIndex + 1} of {quizCards.length}
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                          Score: {quizScore.correct} / {quizScore.total}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg p-4 sm:p-8 min-h-[200px] sm:min-h-[300px] flex items-center justify-center">
                        <p className="text-white text-lg sm:text-2xl font-semibold text-center break-words">
                          {quizCards[quizIndex]?.front}
                        </p>
                      </div>

                      {!showAnswer ? (
                        <div className="space-y-3 sm:space-y-4">
                          <label className="block text-sm sm:text-base font-medium text-gray-900">
                            Your Answer:
                          </label>
                          <textarea
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Type your answer here..."
                            rows={3}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                          />
                          <button
                            onClick={checkQuizAnswer}
                            className="w-full bg-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm sm:text-base"
                          >
                            Check Answer
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                            <div className="text-xs sm:text-sm text-gray-600 mb-1">Correct Answer:</div>
                            <div className="text-sm sm:text-base font-medium text-gray-900">
                              {quizCards[quizIndex]?.back}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <button
                              onClick={nextCard}
                              className="flex-1 bg-primary-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-sm sm:text-base"
                            >
                              {quizIndex + 1 < quizCards.length ? 'Next Question' : 'Finish Quiz'}
                            </button>
                            <button
                              onClick={endQuiz}
                              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
                            >
                              End Quiz
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Study Notes */}
              {activeTab === 'notes' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                    <div className="flex-1 relative w-full sm:w-auto">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search notes..."
                        value={noteSearch}
                        onChange={(e) => setNoteSearch(e.target.value)}
                        className="w-full sm:w-64 pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base text-gray-900"
                      />
                    </div>
                    <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                      <button
                        onClick={exportNotes}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base text-gray-900"
                      >
                        <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">Export</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveNote(null)
                          setNoteTitle('')
                          setNoteContent('')
                        }}
                        className="flex-1 sm:flex-none bg-gradient-to-r from-violet-600 to-purple-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
                      >
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>New Note</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Notes List */}
                    <div className="lg:col-span-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                        Notes ({filteredNotes.length})
                      </h3>
                      <div className="space-y-2 max-h-96 lg:max-h-[600px] overflow-y-auto">
                        {filteredNotes.length > 0 ? (
                          filteredNotes
                            .sort((a, b) => b.updatedAt - a.updatedAt)
                            .map((note) => (
                              <div
                                key={note.id}
                                onClick={() => openNote(note)}
                                className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${
                                  activeNote === note.id
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                                      {note.title}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                                      {note.content.substring(0, 100)}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                      {new Date(note.updatedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteNote(note.id)
                                    }}
                                    className="text-red-600 hover:text-red-700 flex-shrink-0"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))
                        ) : (
                          <p className="text-gray-400 text-center py-8 text-sm sm:text-base">
                            {noteSearch ? 'No notes match your search' : 'No notes yet. Create one to get started!'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Note Editor */}
                    <div className="lg:col-span-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                        {activeNote ? 'Edit Note' : 'New Note'}
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        <input
                          type="text"
                          value={noteTitle}
                          onChange={(e) => setNoteTitle(e.target.value)}
                          placeholder="Note title..."
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                        />
                        <textarea
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                          placeholder="Write your study notes here..."
                          rows={15}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y text-gray-900"
                        />
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                          <p className="text-xs sm:text-sm text-gray-600">
                            {noteContent.split(/\s+/).filter(w => w.length > 0).length} words, {noteContent.length} characters
                          </p>
                          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(noteContent)
                                toast.success('Note copied!')
                              }}
                              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base text-gray-900"
                            >
                              <Copy className="h-4 w-4" />
                              <span>Copy</span>
                            </button>
                            <button
                              onClick={activeNote ? () => updateNote(activeNote) : createNote}
                              disabled={!noteTitle.trim() && !noteContent.trim()}
                              className="flex-1 sm:flex-none bg-gradient-to-r from-violet-600 to-purple-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                              <Save className="h-4 w-4" />
                              <span>{activeNote ? 'Update' : 'Save'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Statistics */}
              {activeTab === 'stats' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Study Goal */}
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-violet-200">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <Target className="h-5 w-5 sm:h-6 sm:w-6 text-violet-600" />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Study Goals</h3>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="block text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2">
                            Daily Cards Goal
                          </label>
                          <input
                            type="number"
                            value={studyGoal.dailyCards}
                            onChange={(e) => setStudyGoal({ ...studyGoal, dailyCards: Math.max(0, parseInt(e.target.value) || 0) })}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2">
                            Daily Minutes Goal
                          </label>
                          <input
                            type="number"
                            value={studyGoal.dailyMinutes}
                            onChange={(e) => setStudyGoal({ ...studyGoal, dailyMinutes: Math.max(0, parseInt(e.target.value) || 0) })}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Study Streak */}
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 sm:p-6 border border-yellow-200">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <Award className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Study Streak</h3>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl font-bold text-yellow-600 mb-2">
                          {studyStats.studyStreak}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">days in a row</div>
                        {studyStats.studyStreak > 0 && (
                          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-700">
                            Last studied: {studyStats.lastStudyDate || 'Never'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Total Progress */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Total Progress</h3>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        <div>
                          <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
                            <span>Cards Studied</span>
                            <span className="font-medium text-gray-900">{studyStats.cardsStudied}</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
                            <span>Total Cards</span>
                            <span className="font-medium text-gray-900">{studyStats.totalCards}</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
                            <span>Study Time</span>
                            <span className="font-medium text-gray-900">{Math.round(studyStats.totalStudyTime)} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Study Sessions History */}
                  {studySessions.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Study History</h3>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {studySessions
                          .sort((a, b) => b.date.localeCompare(a.date))
                          .slice(0, 10)
                          .map((session, index) => (
                            <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                <div>
                                  <div className="text-xs sm:text-sm font-medium text-gray-900">
                                    {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {session.cardsStudied} cards • {session.timeSpent} min
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Reset Stats */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-red-900 mb-2 sm:mb-3">Reset Statistics</h3>
                    <p className="text-xs sm:text-sm text-red-700 mb-3 sm:mb-4">
                      This will reset all your study statistics. This action cannot be undone.
                    </p>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to reset all statistics?')) {
                          setStudyStats({
                            totalCards: flashcards.length,
                            cardsStudied: 0,
                            studyStreak: 0,
                            totalStudyTime: 0,
                            lastStudyDate: ''
                          })
                          setStudySessions([])
                          toast.success('Statistics reset!')
                        }
                      }}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                    >
                      Reset Statistics
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <MobileBottomAd adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <Footer />
    </div>
  )
}
