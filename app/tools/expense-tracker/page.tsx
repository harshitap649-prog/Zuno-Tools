'use client'

import { useState, useEffect, useMemo } from 'react'
import Footer from '@/components/Footer'
import SidebarAd from '@/components/SidebarAd'
import MobileBottomAd from '@/components/MobileBottomAd'
import { 
  DollarSign, Plus, Trash2, Edit2, Search, Filter, 
  Calendar, Download, TrendingUp, TrendingDown, BarChart3,
  X, Check, Save, Copy, FileText, PieChart, Target,
  ArrowUp, ArrowDown, SortAsc, SortDesc, Clock, Repeat
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
  notes?: string
  isRecurring?: boolean
  recurringType?: 'daily' | 'weekly' | 'monthly'
}

interface Budget {
  category: string
  amount: number
}

const categoryConfig = {
  'Food': { icon: '🍔', color: 'from-orange-500 to-red-500', bg: 'bg-orange-50' },
  'Transport': { icon: '🚗', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
  'Shopping': { icon: '🛍️', color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50' },
  'Bills': { icon: '📄', color: 'from-purple-500 to-indigo-500', bg: 'bg-purple-50' },
  'Entertainment': { icon: '🎬', color: 'from-green-500 to-emerald-500', bg: 'bg-green-50' },
  'Healthcare': { icon: '🏥', color: 'from-red-500 to-pink-500', bg: 'bg-red-50' },
  'Education': { icon: '📚', color: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-50' },
  'Other': { icon: '📦', color: 'from-gray-500 to-gray-600', bg: 'bg-gray-50' },
}

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringType, setRecurringType] = useState<'daily' | 'weekly' | 'monthly'>('monthly')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('All')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [showBudget, setShowBudget] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [currency, setCurrency] = useState('$')
  const [viewMode, setViewMode] = useState<'list' | 'category'>('list')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const categories = Object.keys(categoryConfig)

  // Load data from localStorage
  useEffect(() => {
    const savedExpenses = localStorage.getItem('zuno-expenses')
    if (savedExpenses) {
      try {
      setExpenses(JSON.parse(savedExpenses))
      } catch (e) {
        console.error('Failed to load expenses')
      }
    }
    const savedBudgets = localStorage.getItem('zuno-expense-budgets')
    if (savedBudgets) {
      try {
        setBudgets(JSON.parse(savedBudgets))
      } catch (e) {
        console.error('Failed to load budgets')
      }
    }
    const savedCurrency = localStorage.getItem('zuno-expense-currency')
    if (savedCurrency) {
      setCurrency(savedCurrency)
    }
  }, [])

  // Save expenses to localStorage
  useEffect(() => {
    localStorage.setItem('zuno-expenses', JSON.stringify(expenses))
  }, [expenses])

  // Save budgets to localStorage
  useEffect(() => {
    localStorage.setItem('zuno-expense-budgets', JSON.stringify(budgets))
  }, [budgets])

  // Save currency to localStorage
  useEffect(() => {
    localStorage.setItem('zuno-expense-currency', currency)
  }, [currency])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && deleteConfirmId) {
        setDeleteConfirmId(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deleteConfirmId])

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (filterCategory !== 'All') {
      filtered = filtered.filter(expense => expense.category === filterCategory)
    }

    // Date filter
    const now = new Date()
    if (dateFilter === 'today') {
      const today = now.toISOString().split('T')[0]
      filtered = filtered.filter(expense => expense.date === today)
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(expense => new Date(expense.date) >= weekAgo)
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      filtered = filtered.filter(expense => new Date(expense.date) >= monthAgo)
    } else if (dateFilter === 'year') {
      const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      filtered = filtered.filter(expense => new Date(expense.date) >= yearAgo)
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category)
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [expenses, searchQuery, filterCategory, dateFilter, sortBy, sortOrder])

  const addExpense = () => {
    if (!description.trim() || !amount) {
      toast.error('Please fill in description and amount')
      return
    }

    const expense: Expense = {
      id: Date.now().toString(),
      description: description.trim(),
      amount: parseFloat(amount),
      category,
      date,
      notes: notes.trim() || undefined,
      isRecurring,
      recurringType: isRecurring ? recurringType : undefined,
    }
    setExpenses([expense, ...expenses])
    setDescription('')
    setAmount('')
    setNotes('')
    setIsRecurring(false)
    setDate(new Date().toISOString().split('T')[0])
    toast.success(`Expense added: ${formatCurrency(parseFloat(amount))}`, {
      icon: '✅',
      duration: 3000,
    })
  }

  const updateExpense = () => {
    if (!editingId || !description.trim() || !amount) {
      toast.error('Please fill in description and amount')
      return
    }

    setExpenses(expenses.map(expense =>
      expense.id === editingId
        ? {
            ...expense,
            description: description.trim(),
            amount: parseFloat(amount),
            category,
            date,
            notes: notes.trim() || undefined,
            isRecurring,
            recurringType: isRecurring ? recurringType : undefined,
          }
        : expense
    ))
    setEditingId(null)
    setDescription('')
    setAmount('')
    setNotes('')
    setIsRecurring(false)
    toast.success(`Expense updated: ${formatCurrency(parseFloat(amount))}`, {
      icon: '✏️',
      duration: 3000,
    })
  }

  const startEdit = (expense: Expense) => {
    setEditingId(expense.id)
    setDescription(expense.description)
    setAmount(expense.amount.toString())
    setCategory(expense.category)
    setDate(expense.date)
    setNotes(expense.notes || '')
    setIsRecurring(expense.isRecurring || false)
    setRecurringType(expense.recurringType || 'monthly')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDescription('')
    setAmount('')
    setNotes('')
    setIsRecurring(false)
    setDate(new Date().toISOString().split('T')[0])
  }

  const deleteExpense = (id: string) => {
    setDeleteConfirmId(id)
  }

  const confirmDelete = () => {
    if (deleteConfirmId) {
      const expense = expenses.find(e => e.id === deleteConfirmId)
      const amount = expense?.amount || 0
      setExpenses(expenses.filter(expense => expense.id !== deleteConfirmId))
      toast.success(`Expense deleted: ${formatCurrency(amount)}`, {
        icon: '🗑️',
        duration: 3000,
      })
      setDeleteConfirmId(null)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmId(null)
  }

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const filteredTotal = filteredAndSortedExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  const categoryTotals = categories.map(cat => ({
    category: cat,
    total: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0),
    budget: budgets.find(b => b.category === cat)?.amount || 0,
  }))

  // Statistics
  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = expenses.filter(e => {
      const expenseDate = new Date(e.date)
      return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
    })
    const lastMonth = expenses.filter(e => {
      const expenseDate = new Date(e.date)
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      return expenseDate.getMonth() === lastMonthDate.getMonth() && expenseDate.getFullYear() === lastMonthDate.getFullYear()
    })

    const thisMonthTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0)
    const lastMonthTotal = lastMonth.reduce((sum, e) => sum + e.amount, 0)
    const avgExpense = expenses.length > 0 ? total / expenses.length : 0
    const largestExpense = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0

    return {
      thisMonthTotal,
      lastMonthTotal,
      change: thisMonthTotal - lastMonthTotal,
      changePercent: lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0,
      avgExpense,
      largestExpense,
      totalExpenses: expenses.length,
    }
  }, [expenses, total])

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Notes', 'Recurring']
    const rows = expenses.map(expense => [
      expense.date,
      expense.description,
      expense.category,
      expense.amount.toFixed(2),
      expense.notes || '',
      expense.isRecurring ? `${expense.recurringType}` : 'No'
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${expenses.length} expenses to CSV!`, {
      icon: '📊',
      duration: 3000,
    })
  }

  const exportToJSON = () => {
    const data = JSON.stringify(expenses, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `expenses-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${expenses.length} expenses to JSON!`, {
      icon: '📄',
      duration: 3000,
    })
  }

  const copyAllExpenses = () => {
    const text = expenses.map(e => 
      `${e.date} - ${e.description} (${e.category}): ${currency}${e.amount.toFixed(2)}`
    ).join('\n')
    navigator.clipboard.writeText(text)
    toast.success(`Copied ${expenses.length} expenses to clipboard!`, {
      icon: '📋',
      duration: 3000,
    })
  }

  const formatCurrency = (amount: number) => {
    return `${currency}${amount.toFixed(2)}`
  }

  const getCategoryIcon = (cat: string) => {
    return categoryConfig[cat as keyof typeof categoryConfig]?.icon || '📦'
  }

  const getCategoryColor = (cat: string) => {
    return categoryConfig[cat as keyof typeof categoryConfig]?.color || 'from-gray-500 to-gray-600'
  }

  const getCategoryBg = (cat: string) => {
    return categoryConfig[cat as keyof typeof categoryConfig]?.bg || 'bg-gray-50'
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SidebarAd position="left" adKey="36d691042d95ac1ac33375038ec47a5c" />
      <SidebarAd position="right" adKey="36d691042d95ac1ac33375038ec47a5c" />
      <main className="flex-grow py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-4 sm:mb-6">
              <div className="relative inline-flex items-center justify-center mb-3 sm:mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
              <div className="relative inline-flex p-2 sm:p-3 rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 shadow-lg">
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">
              Expense Tracker
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 px-4">Track your expenses and manage your budget</p>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <label className="text-sm font-semibold text-gray-900">Currency:</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-3 py-1.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-sm text-gray-900"
            >
              <option value="$">$ USD</option>
              <option value="€">€ EUR</option>
              <option value="£">£ GBP</option>
              <option value="¥">¥ JPY</option>
              <option value="₹">₹ INR</option>
            </select>
          </div>

          {/* Total Expenses Card */}
          <div className="bg-gradient-to-br from-white via-orange-50/30 to-red-50/30 rounded-xl sm:rounded-2xl shadow-2xl border-2 border-orange-200 p-4 sm:p-6 mb-4 sm:mb-6 relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-red-400/20 to-orange-400/20 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 rounded-xl p-4 sm:p-6 text-center text-white shadow-lg">
              <div className="text-xs sm:text-sm font-medium mb-2 opacity-90">Total Expenses</div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 drop-shadow-lg">{formatCurrency(total)}</div>
              {expenses.length > 0 && (
                <div className="text-xs sm:text-sm opacity-80">
                  {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'} recorded
                </div>
              )}
            </div>

            {/* Quick Stats */}
            {expenses.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">This Month</div>
                  <div className="text-lg font-bold text-gray-900">{formatCurrency(stats.thisMonthTotal)}</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">Average</div>
                  <div className="text-lg font-bold text-gray-900">{formatCurrency(stats.avgExpense)}</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">Largest</div>
                  <div className="text-lg font-bold text-gray-900">{formatCurrency(stats.largestExpense)}</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">Change</div>
                  <div className={`text-lg font-bold flex items-center justify-center gap-1 ${
                    stats.change >= 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {stats.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {Math.abs(stats.changePercent).toFixed(1)}%
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Add/Edit Expense Form */}
          <div className="bg-gradient-to-br from-white via-orange-50/30 to-red-50/30 rounded-xl sm:rounded-2xl shadow-2xl border-2 border-orange-200 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 relative overflow-hidden">
            {/* Subtle animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-100/10 via-red-100/10 to-orange-100/10"></div>
            <div className="relative">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              {editingId ? (
                <>
                  <Edit2 className="h-5 w-5 text-orange-600" />
                  Edit Expense
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-orange-600" />
                  Add New Expense
                </>
              )}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter expense description"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-semibold"
                />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{getCategoryIcon(cat)} {cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Recurring Expense</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsRecurring(!isRecurring)}
                      className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                        isRecurring
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <Repeat className="h-4 w-4" />
                      {isRecurring ? 'Yes' : 'No'}
                    </button>
                    {isRecurring && (
                      <select
                        value={recurringType}
                        onChange={(e) => setRecurringType(e.target.value as 'daily' | 'weekly' | 'monthly')}
                        className="flex-1 px-3 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 text-sm font-medium text-gray-900"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium resize-none"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {editingId ? (
                  <>
                    <button
                      onClick={updateExpense}
                      className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 touch-manipulation min-h-[48px]"
                    >
                      <Save className="h-5 w-5" />
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 sm:flex-none bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 touch-manipulation min-h-[48px]"
                    >
                      <X className="h-5 w-5" />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={addExpense}
                    className="w-full bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 text-white px-6 py-3.5 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 touch-manipulation min-h-[48px]"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Expense</span>
                  </button>
                )}
              </div>
            </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="bg-gradient-to-br from-white via-gray-50/50 to-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-gray-200">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search expenses..."
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium"
                  />
                </div>
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 font-medium text-sm min-w-[120px] text-gray-900"
              >
                <option value="All">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 font-medium text-sm min-w-[120px] text-gray-900"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className="px-4 py-2.5 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all flex items-center gap-2 text-sm"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Statistics</span>
              </button>
              <button
                onClick={() => setShowBudget(!showBudget)}
                className="px-4 py-2.5 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-all flex items-center gap-2 text-sm"
              >
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Budget</span>
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'category' : 'list')}
                className="px-4 py-2.5 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-all flex items-center gap-2 text-sm"
              >
                {viewMode === 'list' ? <PieChart className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                <span className="hidden sm:inline">{viewMode === 'list' ? 'Category View' : 'List View'}</span>
              </button>
              <div className="flex gap-2 ml-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 font-medium text-xs sm:text-sm text-gray-900"
                >
                  <option value="date">Sort by Date</option>
                  <option value="amount">Sort by Amount</option>
                  <option value="category">Sort by Category</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all"
                  title={sortOrder === 'asc' ? 'Descending' : 'Ascending'}
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={exportToCSV}
                className="px-4 py-2.5 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all flex items-center gap-2 text-sm"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
              <button
                onClick={exportToJSON}
                className="px-4 py-2.5 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all flex items-center gap-2 text-sm"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export JSON</span>
              </button>
              <button
                onClick={copyAllExpenses}
                className="px-4 py-2.5 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all flex items-center gap-2 text-sm"
              >
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Copy All</span>
              </button>
            </div>
          </div>

          {/* Statistics Panel */}
          {showStats && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Statistics & Insights
                </h3>
                <button
                  onClick={() => setShowStats(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">This Month</div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.thisMonthTotal)}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.change >= 0 ? '+' : ''}{formatCurrency(stats.change)} vs last month
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">Average Expense</div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avgExpense)}</div>
                  <div className="text-xs text-gray-500 mt-1">Per transaction</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">Largest Expense</div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.largestExpense)}</div>
                  <div className="text-xs text-gray-500 mt-1">Single transaction</div>
                </div>
              </div>
            </div>
          )}

          {/* Budget Panel */}
          {showBudget && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Budget Management
                </h3>
                <button
                  onClick={() => setShowBudget(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3">
                {categories.map(cat => {
                  const categoryTotal = categoryTotals.find(ct => ct.category === cat)?.total || 0
                  const budget = budgets.find(b => b.category === cat)?.amount || 0
                  const remaining = budget - categoryTotal
                  const percentage = budget > 0 ? (categoryTotal / budget) * 100 : 0

                  return (
                    <div key={cat} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getCategoryIcon(cat)}</span>
                          <span className="font-semibold text-gray-900">{cat}</span>
                        </div>
                        <input
                          type="number"
                          placeholder="Budget"
                          value={budgets.find(b => b.category === cat)?.amount || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value)
                            if (isNaN(value)) {
                              setBudgets(budgets.filter(b => b.category !== cat))
                            } else {
                              const existing = budgets.find(b => b.category === cat)
                              if (existing) {
                                setBudgets(budgets.map(b => b.category === cat ? { ...b, amount: value } : b))
                              } else {
                                setBudgets([...budgets, { category: cat, amount: value }])
                              }
                            }
                          }}
                          className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-sm font-semibold text-right"
                        />
                      </div>
                      {budget > 0 && (
                        <>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Spent: {formatCurrency(categoryTotal)}</span>
                            <span>Remaining: {formatCurrency(remaining)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-orange-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {percentage.toFixed(1)}% of budget used
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Category Totals */}
          <div className="bg-gradient-to-br from-white via-orange-50/20 to-red-50/20 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-orange-200">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-orange-600" />
              Category Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {categoryTotals.map(({ category, total, budget }) => (
                <div
                  key={category}
                  className={`${getCategoryBg(category)} rounded-xl p-4 border-2 border-gray-200 text-center`}
                >
                  <div className="text-2xl mb-1">{getCategoryIcon(category)}</div>
                  <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">{category}</div>
                  <div className={`text-lg sm:text-xl font-bold bg-gradient-to-r ${getCategoryColor(category)} bg-clip-text text-transparent`}>
                    {formatCurrency(total)}
                  </div>
                  {budget > 0 && (
                    <div className="text-xs text-gray-600 mt-1">
                      Budget: {formatCurrency(budget)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Expenses List */}
          <div className="bg-gradient-to-br from-white via-gray-50/30 to-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                {viewMode === 'list' ? 'All Expenses' : 'Expenses by Category'}
                {filteredAndSortedExpenses.length !== expenses.length && (
                  <span className="text-sm font-normal text-gray-500">
                    ({filteredAndSortedExpenses.length} of {expenses.length})
                  </span>
                )}
              </h3>
              {filteredAndSortedExpenses.length > 0 && (
                <div className="text-sm font-semibold text-gray-700">
                  Filtered Total: {formatCurrency(filteredTotal)}
                </div>
              )}
            </div>

            {filteredAndSortedExpenses.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full blur-xl opacity-50"></div>
                  <DollarSign className="relative h-16 w-16 sm:h-20 sm:w-20 text-gray-300" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {expenses.length === 0 ? 'No Expenses Yet' : 'No Matching Expenses'}
                </h3>
                <p className="text-sm sm:text-base text-gray-500 font-medium mb-4 max-w-md mx-auto">
                  {expenses.length === 0 
                    ? 'Start tracking your expenses by adding your first expense above!' 
                    : 'Try adjusting your search or filter criteria to see more results.'}
                </p>
                {expenses.length > 0 && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setFilterCategory('All')
                      setDateFilter('all')
                      toast.success('Filters cleared!', { duration: 2000 })
                    }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
                </div>
              ) : (
              <div className="space-y-3">
                {filteredAndSortedExpenses.map(expense => (
                    <div
                      key={expense.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-white via-gray-50/50 to-white rounded-xl border-2 border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all transform hover:scale-[1.02]"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-2xl">{getCategoryIcon(expense.category)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900 text-sm sm:text-base truncate">
                            {expense.description}
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <span className={`px-2 py-0.5 rounded-full font-semibold bg-gradient-to-r ${getCategoryColor(expense.category)} text-white`}>
                              {expense.category}
                            </span>
                            <span>•</span>
                            <span>{new Date(expense.date).toLocaleDateString()}</span>
                            {expense.isRecurring && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Repeat className="h-3 w-3" />
                                  {expense.recurringType}
                                </span>
                              </>
                            )}
                          </div>
                          {expense.notes && (
                            <div className="text-xs text-gray-500 mt-1 italic truncate">
                              {expense.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        <div className="text-lg sm:text-xl font-bold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(expense)}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          title="Edit expense"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="Delete expense"
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
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={cancelDelete}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border-2 border-red-200 animate-in fade-in zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-red-100 rounded-full mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Delete Expense?</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Are you sure you want to delete this expense? This action cannot be undone.
              </p>
              {deleteConfirmId && (() => {
                const expense = expenses.find(e => e.id === deleteConfirmId)
                return expense ? (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="font-semibold text-gray-900">{expense.description}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatCurrency(expense.amount)} • {expense.category}
                    </div>
                  </div>
                ) : null
              })()}
            </div>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all transform hover:scale-105 active:scale-95 touch-manipulation min-h-[48px]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 active:scale-95 touch-manipulation min-h-[48px] flex items-center justify-center gap-2"
              >
                <Trash2 className="h-5 w-5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileBottomAd adKey="36d691042d95ac1ac33375038ec47a5c" />
      <Footer />
    </div>
  )
}

