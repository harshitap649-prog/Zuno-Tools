'use client'

import { useState, useEffect } from 'react'
import Footer from '@/components/Footer'
import { FileText, Sparkles, Plus, Trash2, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
}

export default function NoteTaker() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    const savedNotes = localStorage.getItem('zuno-notes')
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('zuno-notes', JSON.stringify(notes))
  }, [notes])

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date().toISOString(),
    }
    setNotes([newNote, ...notes])
    setSelectedNote(newNote)
    setTitle(newNote.title)
    setContent(newNote.content)
  }

  const selectNote = (note: Note) => {
    setSelectedNote(note)
    setTitle(note.title)
    setContent(note.content)
  }

  const saveNote = () => {
    if (!selectedNote) return

    const updatedNotes = notes.map(note =>
      note.id === selectedNote.id
        ? { ...note, title: title || 'Untitled Note', content }
        : note
    )
    setNotes(updatedNotes)
    setSelectedNote({ ...selectedNote, title: title || 'Untitled Note', content })
    toast.success('Note saved!')
  }

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id)
    setNotes(updatedNotes)
    if (selectedNote?.id === id) {
      setSelectedNote(null)
      setTitle('')
      setContent('')
    }
    toast.success('Note deleted!')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-6 sm:py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 mb-3 sm:mb-4">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Note Taker</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Take and organize your notes</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="flex flex-col md:flex-row h-[600px]">
              {/* Sidebar */}
              <div className="w-full md:w-64 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <button
                    onClick={createNewNote}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>New Note</span>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {notes.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <p>No notes yet. Create one!</p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-2">
                      {notes.map(note => (
                        <div
                          key={note.id}
                          onClick={() => selectNote(note)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedNote?.id === note.id
                              ? 'bg-blue-50 border-2 border-blue-500'
                              : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">{note.title}</h3>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(note.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNote(note.id)
                              }}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 flex flex-col">
                {selectedNote ? (
                  <>
                    <div className="p-4 border-b border-gray-200">
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Note title..."
                        className="w-full text-xl font-bold text-gray-900 border-none outline-none bg-transparent"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start writing your note..."
                        className="w-full h-full resize-none border-none outline-none text-gray-900"
                      />
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <button
                        onClick={saveNote}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
                      >
                        <Save className="h-5 w-5" />
                        <span>Save</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Select a note or create a new one</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

