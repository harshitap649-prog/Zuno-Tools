'use client'

import { useState, useEffect, useMemo } from 'react'
import Footer from '@/components/Footer'
import SidebarAd from '@/components/SidebarAd'
import MobileBottomAd from '@/components/MobileBottomAd'
import { 
  CheckSquare, Plus, Trash2, Check, Edit2, Calendar, 
  Flag, Tag, Search, Filter, SortAsc, SortDesc, 
  BarChart3, Download, Share2, Copy, X, Save,
  Clock, Star, AlertCircle, FileText, Archive,
  RefreshCw, MoreVertical, List, Grid
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Subtask {
  id: string
  text: string
  completed: boolean
}

interface Task {
  id: string
  text: string
  completed: boolean
  createdAt: string
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string
  category?: string
  notes?: string
  completedAt?: string
  subtasks?: Subtask[]
  tags?: string[]
  color?: string
  archived?: boolean
  recurring?: 'daily' | 'weekly' | 'monthly' | 'none'
  estimatedTime?: number
  actualTime?: number
  reminder?: string
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'name'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showCompleted, setShowCompleted] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState('')
  const [notes, setNotes] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [showTaskDetails, setShowTaskDetails] = useState<string | null>(null)

  const categories = ['Work', 'Personal', 'Shopping', 'Health', 'Learning', 'Other']
  const priorities = [
    { value: 'low', label: 'Low', color: 'from-blue-500 to-cyan-500', icon: Flag },
    { value: 'medium', label: 'Medium', color: 'from-yellow-500 to-orange-500', icon: AlertCircle },
    { value: 'high', label: 'High', color: 'from-red-500 to-pink-500', icon: Star },
  ]

  useEffect(() => {
    const savedTasks = localStorage.getItem('zuno-tasks')
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks))
      } catch (e) {
        console.error('Failed to load tasks')
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('zuno-tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (!newTask.trim()) {
      toast.error('Please enter a task')
      return
    }

    const task: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      priority,
      dueDate: dueDate || undefined,
      category: category || undefined,
      notes: notes.trim() || undefined,
    }
    setTasks([task, ...tasks])
    setNewTask('')
    setPriority('medium')
    setDueDate('')
    setCategory('')
    setNotes('')
    setShowAddForm(false)
    toast.success('Task added!', { icon: '✅', duration: 3000 })
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const newCompleted = !task.completed
        const updatedTask = {
          ...task,
          completed: newCompleted,
          completedAt: newCompleted ? new Date().toISOString() : undefined,
        }
        toast.success(newCompleted ? 'Task completed! ✅' : 'Task marked as incomplete! ↩️', { 
          duration: 2000 
        })
        return updatedTask
      }
      return task
    }))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id))
    toast.success('Task deleted!', { duration: 2000 })
  }

  const startEdit = (task: Task) => {
    setEditingId(task.id)
    setEditText(task.text)
    setPriority(task.priority || 'medium')
    setDueDate(task.dueDate || '')
    setCategory(task.category || '')
    setNotes(task.notes || '')
  }

  const saveEdit = () => {
    if (!editText.trim()) {
      toast.error('Task text cannot be empty')
      return
    }
    setTasks(tasks.map(task =>
      task.id === editingId
        ? { ...task, text: editText.trim(), priority, dueDate: dueDate || undefined, category: category || undefined, notes: notes.trim() || undefined }
        : task
    ))
    setEditingId(null)
    setEditText('')
    toast.success('Task updated!', { duration: 2000 })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
    setPriority('medium')
    setDueDate('')
    setCategory('')
    setNotes('')
  }

  const filteredAndSortedTasks = useMemo(() => {
    // Filter out archived tasks
    let filtered = tasks.filter(task => !task.archived)

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(task =>
        task.text.toLowerCase().includes(query) ||
        task.category?.toLowerCase().includes(query) ||
        task.notes?.toLowerCase().includes(query) ||
        (task.tags && task.tags.some(tag => tag.toLowerCase().includes(query)))
      )
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority)
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(task => task.category === filterCategory)
    }

    // Completed filter
    if (!showCompleted) {
      filtered = filtered.filter(task => !task.completed)
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0
      if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        comparison = (priorityOrder[a.priority || 'medium'] || 0) - (priorityOrder[b.priority || 'medium'] || 0)
      } else if (sortBy === 'name') {
        comparison = a.text.localeCompare(b.text)
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [tasks, searchQuery, filterPriority, filterCategory, showCompleted, sortBy, sortOrder])

  const activeTasks = useMemo(() => tasks.filter(t => !t.archived), [tasks])
  const completedCount = activeTasks.filter(t => t.completed).length
  const totalCount = activeTasks.length
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const stats = useMemo(() => {
    const highPriority = activeTasks.filter(t => t.priority === 'high' && !t.completed).length
    const overdue = activeTasks.filter(t => {
      if (!t.dueDate || t.completed) return false
      const today = new Date().toISOString().split('T')[0]
      return new Date(t.dueDate) < new Date(today)
    }).length
    const today = activeTasks.filter(t => {
      if (!t.dueDate) return false
      return t.dueDate === new Date().toISOString().split('T')[0]
    }).length

    return { highPriority, overdue, today }
  }, [activeTasks])

  const exportTasks = () => {
    const data = {
      tasks,
      exportDate: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Tasks exported!', { icon: '📥', duration: 3000 })
  }

  const clearCompleted = () => {
    setTasks(tasks.filter(task => !task.completed))
    toast.success('Completed tasks cleared!', { duration: 2000 })
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-pink-500'
      case 'medium': return 'from-yellow-500 to-orange-500'
      case 'low': return 'from-blue-500 to-cyan-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const isOverdue = (dueDate?: string, taskId?: string) => {
    if (!dueDate) return false
    const task = taskId ? tasks.find(t => t.id === taskId) : tasks.find(t => t.dueDate === dueDate)
    if (!task || task.completed) return false
    const today = new Date().toISOString().split('T')[0]
    return new Date(dueDate) < new Date(today)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SidebarAd position="left" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <SidebarAd position="right" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      
      <main className="flex-grow py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
              <div className="relative inline-flex items-center justify-center mb-3 sm:mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
              <div className="relative inline-flex p-2 sm:p-3 rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 shadow-lg">
                <CheckSquare className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">
              Task Manager
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-4">Manage your tasks and stay organized</p>
          </div>

          {/* Stats Cards */}
          {tasks.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 border-2 border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckSquare className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-gray-600">Completed</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{completedCount}/{totalCount}</div>
                <div className="text-xs text-gray-500 mt-1">{completionPercentage}%</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-3 sm:p-4 border-2 border-red-200">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-4 w-4 text-red-500" />
                  <span className="text-xs text-gray-600">High Priority</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.highPriority}</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl p-3 sm:p-4 border-2 border-orange-200">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-gray-600">Overdue</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.overdue}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 sm:p-4 border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-gray-600">Due Today</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.today}</div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 rounded-xl sm:rounded-2xl shadow-xl border-2 border-green-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {tasks.length > 0 && (
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tasks..."
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium text-sm"
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                  className="p-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                  title="Toggle view"
                >
                  {viewMode === 'list' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                </button>
                {tasks.length > 0 && (
                  <button
                    onClick={exportTasks}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                )}
          </div>
            </div>

            {/* Filters */}
            {tasks.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as any)}
                  className="px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-gray-900 font-medium text-sm"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-gray-900 font-medium text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-gray-900 font-medium text-sm"
                >
                  <option value="date">Sort by Date</option>
                  <option value="priority">Sort by Priority</option>
                  <option value="name">Sort by Name</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                  title="Toggle sort order"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </button>
                <div className="flex items-center gap-2 ml-auto">
                  <input
                    type="checkbox"
                    id="showCompleted"
                    checked={showCompleted}
                    onChange={(e) => setShowCompleted(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="showCompleted" className="text-sm font-medium text-gray-900">
                    Show Completed
                  </label>
                </div>
                {completedCount > 0 && (
                  <button
                    onClick={clearCompleted}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition-all text-sm"
                  >
                    Clear Completed
                  </button>
                )}
          </div>
            )}

            {/* Add Task Form */}
            {showAddForm ? (
              <div className="space-y-4 p-4 bg-white rounded-xl border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Add New Task</h3>
                  <button
                    onClick={() => {
                      setShowAddForm(false)
                      setNewTask('')
                      setPriority('medium')
                      setDueDate('')
                      setCategory('')
                      setNotes('')
                    }}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  placeholder="Enter task name..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Priority</label>
                    <div className="flex gap-2">
                      {priorities.map(p => {
                        const priorityValue = p.value as 'low' | 'medium' | 'high'
                        return (
                          <button
                            key={p.value}
                            onClick={() => setPriority(priorityValue)}
                            className={`flex-1 px-3 py-2 rounded-xl font-semibold text-sm transition-all ${
                              priority === p.value
                                ? `bg-gradient-to-r ${p.color} text-white shadow-lg`
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <p.icon className="h-4 w-4 inline mr-1" />
                            {p.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-gray-900 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-gray-900 font-medium"
                  >
                    <option value="">No Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes..."
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 text-gray-900 font-medium resize-none"
                  />
                </div>
                <button
                  onClick={addTask}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 touch-manipulation min-h-[48px]"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Task</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 touch-manipulation min-h-[48px]"
              >
                <Plus className="h-5 w-5" />
                <span>Add New Task</span>
              </button>
            )}
          </div>

          {/* Tasks List */}
          <div className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 rounded-xl sm:rounded-2xl shadow-xl border-2 border-green-200 p-4 sm:p-6">
            {filteredAndSortedTasks.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full blur-xl opacity-50"></div>
                  <CheckSquare className="relative h-16 w-16 sm:h-20 sm:w-20 text-gray-300" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {tasks.length === 0 ? 'No Tasks Yet' : 'No Matching Tasks'}
                </h3>
                <p className="text-sm sm:text-base text-gray-500 font-medium mb-4 max-w-md mx-auto">
                  {tasks.length === 0 
                    ? 'Start organizing your life by adding your first task above!' 
                    : 'Try adjusting your filters to see more results.'}
                </p>
                {tasks.length > 0 && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setFilterPriority('all')
                      setFilterCategory('all')
                      setShowCompleted(true)
                      toast.success('Filters cleared!', { duration: 2000 })
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                {filteredAndSortedTasks.map(task => {
                  const isEditing = editingId === task.id
                  const overdue = isOverdue(task.dueDate, task.id)
                  const dueToday = task.dueDate === new Date().toISOString().split('T')[0]

                  return (
                    <div
                      key={task.id}
                      className={`bg-gradient-to-br from-white via-green-50/20 to-emerald-50/20 rounded-xl sm:rounded-2xl shadow-lg border-2 p-4 sm:p-5 transition-all hover:shadow-xl ${
                        task.completed
                          ? 'border-green-300 bg-green-50/50 opacity-75'
                          : overdue
                          ? 'border-red-300 bg-red-50/30'
                          : dueToday
                          ? 'border-orange-300 bg-orange-50/30'
                          : 'border-gray-200'
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 font-medium text-sm"
                            autoFocus
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={priority}
                              onChange={(e) => setPriority(e.target.value as any)}
                              className="px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-medium text-xs"
                            >
                              {priorities.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                              ))}
                            </select>
                            <input
                              type="date"
                              value={dueDate}
                              onChange={(e) => setDueDate(e.target.value)}
                              className="px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-medium text-xs"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={saveEdit}
                              className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all text-sm"
                            >
                              <Save className="h-4 w-4 inline mr-1" />
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all text-sm"
                            >
                              <X className="h-4 w-4 inline mr-1" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start gap-3 mb-3">
                            <button
                              onClick={() => toggleTask(task.id)}
                              className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 ${
                                task.completed
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                              }`}
                            >
                              {task.completed && <Check className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                    <span
                                  className={`font-semibold text-gray-900 break-words ${
                        task.completed
                          ? 'line-through text-gray-500'
                                      : ''
                      }`}
                    >
                      {task.text}
                    </span>
                                <div className="flex gap-1 flex-shrink-0">
                                  <button
                                    onClick={() => startEdit(task)}
                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                    title="Edit"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Delete"
                    >
                                    <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                              </div>
                              {task.notes && (
                                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{task.notes}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-200">
                            {task.priority && (
                              <span className={`px-2 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r ${getPriorityColor(task.priority)} text-white`}>
                                {task.priority.toUpperCase()}
                              </span>
                            )}
                            {task.category && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {task.category}
                              </span>
                            )}
                            {task.dueDate && (
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                                overdue
                                  ? 'bg-red-100 text-red-700'
                                  : dueToday
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                <Calendar className="h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {overdue && ' (Overdue)'}
                              </span>
                            )}
                            {task.completedAt && (
                              <span className="text-xs text-gray-500 ml-auto">
                                Completed {new Date(task.completedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </>
              )}
            </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileBottomAd adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <Footer />
    </div>
  )
}

