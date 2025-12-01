'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CheckSquare, Plus, X, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')

  const addTodo = () => {
    if (!input.trim()) {
      toast.error('Please enter a task')
      return
    }

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: input.trim(),
      completed: false,
      createdAt: new Date()
    }

    setTodos([...todos, newTodo])
    setInput('')
    toast.success('Task added!')
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id))
    toast.success('Task deleted!')
  }

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed))
    toast.success('Completed tasks cleared!')
  }

  const completedCount = todos.filter(t => t.completed).length
  const totalCount = todos.length

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 mb-4">
              <CheckSquare className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Todo List</h1>
            <p className="text-gray-600">Manage your tasks efficiently</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                placeholder="Add a new task..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={addTodo}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add</span>
              </button>
            </div>

            {totalCount > 0 && (
              <div className="flex justify-between items-center text-sm text-gray-600 pb-4 border-b">
                <span>
                  {completedCount} of {totalCount} tasks completed
                </span>
                {completedCount > 0 && (
                  <button
                    onClick={clearCompleted}
                    className="text-red-600 hover:text-red-700"
                  >
                    Clear completed
                  </button>
                )}
              </div>
            )}

            {todos.length === 0 ? (
              <div className="text-center py-12">
                <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No tasks yet. Add one above!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                      todo.completed
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-white border-gray-300 hover:border-primary-300'
                    }`}
                  >
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                        todo.completed
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {todo.completed && <CheckSquare className="h-4 w-4" />}
                    </button>
                    <span
                      className={`flex-1 ${
                        todo.completed
                          ? 'text-gray-500 line-through'
                          : 'text-gray-900'
                      }`}
                    >
                      {todo.text}
                    </span>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}


