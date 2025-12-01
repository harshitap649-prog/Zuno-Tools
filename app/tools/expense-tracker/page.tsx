'use client'

import { useState, useEffect } from 'react'
import Footer from '@/components/Footer'
import { DollarSign, Sparkles, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import toast from 'react-hot-toast'

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
}

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other']

  useEffect(() => {
    const savedExpenses = localStorage.getItem('zuno-expenses')
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('zuno-expenses', JSON.stringify(expenses))
  }, [expenses])

  const addExpense = () => {
    if (!description.trim() || !amount) return

    const expense: Expense = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString(),
    }
    setExpenses([expense, ...expenses])
    setDescription('')
    setAmount('')
    toast.success('Expense added!')
  }

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id))
    toast.success('Expense deleted!')
  }

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const categoryTotals = categories.map(cat => ({
    category: cat,
    total: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0),
  }))

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
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 mb-3 sm:mb-4">
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Expense Tracker</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Track your expenses and manage your budget</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 text-center">
              <div className="text-sm text-gray-600 mb-2">Total Expenses</div>
              <div className="text-4xl font-bold text-orange-600">${total.toFixed(2)}</div>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                  step="0.01"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={addExpense}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Expense</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categoryTotals.map(({ category, total }) => (
                <div key={category} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-600 mb-1">{category}</div>
                  <div className="text-lg font-bold text-gray-900">${total.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Recent Expenses</h3>
              {expenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No expenses yet. Add one to get started!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {expenses.map(expense => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{expense.description}</div>
                        <div className="text-sm text-gray-600">
                          {expense.category} • {new Date(expense.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-gray-900">${expense.amount.toFixed(2)}</div>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="text-red-500 hover:text-red-700"
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
      </main>

      <Footer />
    </div>
  )
}

