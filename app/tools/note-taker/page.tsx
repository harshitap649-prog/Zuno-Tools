'use client'

import { useState, useEffect, useRef } from 'react'
import Footer from '@/components/Footer'
import SidebarAd from '@/components/SidebarAd'
import MobileBottomAd from '@/components/MobileBottomAd'
import { 
  FileText, Plus, Trash2, Save, Bold, Italic, 
  Heading1, Heading2, Heading3, List, ListOrdered, 
  Code, Link, Image, Eye, EyeOff, Maximize2, Minimize2,
  Star, Pin, Tag, Folder, Search, Filter, X, Calendar,
  SortAsc, SortDesc, Hash, Download, Upload, Share2,
  MessageSquare, History, Users, Lock, Unlock, Copy,
  Check, MoreVertical, Edit, Eye as EyeIcon, Bell,
  Clock, CalendarDays, Layers, BookOpen,
  CheckSquare, FileEdit, Zap, Library, BarChart3,
  TrendingUp, Shield, Key, Undo2, Redo2, Search as FindIcon, Replace,
  Type, Moon, Sun, Settings, Command, Timer, Target,
  Activity, Flame, Database, Cloud, RefreshCw, Palette,
  Archive, FolderPlus, Link2, Merge, File, Table, Calculator,
  Mail, Printer, Award, Trophy, TrendingDown, Brain, Sparkles,
  Lightbulb, BookMarked, Grid3x3, Columns, Zap as ZapIcon,
  FileCheck, FileX, FolderTree, Network, Globe, Rss, Send,
  Mic, Camera, Wand2, Languages, Smile, Frown, Meh,
  BarChart, PieChart, GitBranch, Rocket, CheckCircle2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt?: string
  tags?: string[]
  category?: string
  color?: string
  isFavorite?: boolean
  isPinned?: boolean
  sharedWith?: string[]
  permissions?: Record<string, 'read' | 'edit' | 'owner'>
  comments?: Comment[]
  versions?: NoteVersion[]
  reminder?: Reminder
  dueDate?: string
  templateId?: string
  embeddedImages?: string[]
  isLocked?: boolean
  password?: string
  editCount?: number
  lastEdited?: string
  wordCount?: number
  characterCount?: number
  folderId?: string
  linkedNotes?: string[]
  isArchived?: boolean
  isTrashed?: boolean
  trashedAt?: string
  attachments?: Attachment[]
  wordCountGoal?: number
  writingTime?: number
  sentiment?: 'positive' | 'negative' | 'neutral'
  readabilityScore?: number
  achievements?: string[]
  autoTags?: string[]
}

interface Comment {
  id: string
  text: string
  author: string
  createdAt: string
}

interface NoteVersion {
  id: string
  title: string
  content: string
  createdAt: string
}

interface Reminder {
  id: string
  date: string
  time: string
  message?: string
  isCompleted: boolean
  notificationSent: boolean
}

interface NoteTemplate {
  id: string
  name: string
  description: string
  content: string
  category: string
  isCustom: boolean
  icon?: string
}

interface ActivityLog {
  id: string
  noteId: string
  action: string
  timestamp: string
}

interface WritingStreak {
  current: number
  longest: number
  lastDate: string
}

interface NoteStats {
  totalNotes: number
  totalWords: number
  totalCharacters: number
  averageWordsPerNote: number
  mostEditedNote?: Note
  notesCreatedToday: number
  notesCreatedThisWeek: number
  notesCreatedThisMonth: number
}

interface Folder {
  id: string
  name: string
  parentId?: string
  color?: string
  createdAt: string
}

interface Attachment {
  id: string
  name: string
  type: string
  size: number
  data: string // base64 or URL
  uploadedAt: string
}

interface SavedSearch {
  id: string
  name: string
  query: string
  filters: {
    tags?: string[]
    category?: string
    dateRange?: { start: string; end: string }
    wordCount?: { min?: number; max?: number }
  }
  createdAt: string
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: string
  progress?: number
  target?: number
}

interface WritingGoal {
  daily: number
  weekly: number
  monthly: number
  currentDaily: number
  currentWeekly: number
  currentMonthly: number
}

interface TopicAnalysis {
  word: string
  count: number
  frequency: number
}

interface NoteRelationship {
  sourceId: string
  targetId: string
  type: 'link' | 'reference' | 'related'
}

const NOTE_COLORS = [
  { name: 'Default', value: 'bg-white border-gray-200' },
  { name: 'Blue', value: 'bg-blue-50 border-blue-200' },
  { name: 'Green', value: 'bg-green-50 border-green-200' },
  { name: 'Yellow', value: 'bg-yellow-50 border-yellow-200' },
  { name: 'Red', value: 'bg-red-50 border-red-200' },
  { name: 'Purple', value: 'bg-purple-50 border-purple-200' },
  { name: 'Pink', value: 'bg-pink-50 border-pink-200' },
  { name: 'Orange', value: 'bg-orange-50 border-orange-200' },
]

const CATEGORIES = [
  'Personal', 'Work', 'Study', 'Ideas', 'Shopping', 'Travel', 'Health', 'Other'
]

// Predefined templates
const DEFAULT_TEMPLATES: NoteTemplate[] = [
  {
    id: 'meeting',
    name: 'Meeting Notes',
    description: 'Template for meeting notes',
    content: `# Meeting Notes\n\n**Date:** ${new Date().toLocaleDateString()}\n**Attendees:** \n- \n\n**Agenda:**\n1. \n2. \n3. \n\n**Discussion Points:**\n- \n\n**Action Items:**\n- [ ] \n- [ ] \n\n**Next Steps:**\n- \n\n**Notes:**\n`,
    category: 'Work',
    isCustom: false,
    icon: 'Users'
  },
  {
    id: 'todo',
    name: 'Todo List',
    description: 'Template for todo lists',
    content: `# Todo List\n\n**Date:** ${new Date().toLocaleDateString()}\n\n## Today\n- [ ] \n- [ ] \n- [ ] \n\n## This Week\n- [ ] \n- [ ] \n\n## Important\n- [ ] \n\n## Completed\n- [x] \n`,
    category: 'Personal',
    isCustom: false,
    icon: 'CheckSquare'
  },
  {
    id: 'journal',
    name: 'Journal Entry',
    description: 'Template for journal entries',
    content: `# Journal Entry\n\n**Date:** ${new Date().toLocaleDateString()}\n**Time:** ${new Date().toLocaleTimeString()}\n\n## How am I feeling today?\n\n\n## What happened today?\n\n\n## What am I grateful for?\n\n\n## What did I learn?\n\n\n## Tomorrow's goals:\n- \n- \n`,
    category: 'Personal',
    isCustom: false,
    icon: 'BookOpen'
  },
  {
    id: 'quick',
    name: 'Quick Note',
    description: 'Simple quick note template',
    content: `# Quick Note\n\n${new Date().toLocaleString()}\n\n`,
    category: 'Personal',
    isCustom: false,
    icon: 'Zap'
  }
]

export default function NoteTaker() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedColor, setSelectedColor] = useState<string>('all')
  const [showFavorites, setShowFavorites] = useState(false)
  const [showPinned, setShowPinned] = useState(false)
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' })
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'modified'>('modified')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Tag management
  const [newTag, setNewTag] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)
  
  // Export/Import/Share states
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareEmail, setShareEmail] = useState('')
  const [sharePermission, setSharePermission] = useState<'read' | 'edit'>('read')
  const [sharedLink, setSharedLink] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)
  
  // Comments states
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('You')
  
  // Version history states
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  
  // Permissions states
  const [showPermissions, setShowPermissions] = useState(false)
  
  // Template states
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false)
  const [showCustomTemplateModal, setShowCustomTemplateModal] = useState(false)
  const [customTemplates, setCustomTemplates] = useState<NoteTemplate[]>([])
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateDescription, setNewTemplateDescription] = useState('')
  const [newTemplateContent, setNewTemplateContent] = useState('')
  const [newTemplateCategory, setNewTemplateCategory] = useState('Personal')
  
  // Reminder states
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [reminderDate, setReminderDate] = useState('')
  const [reminderTime, setReminderTime] = useState('')
  const [reminderMessage, setReminderMessage] = useState('')
  const [showDueDatePicker, setShowDueDatePicker] = useState(false)
  const [dueDateInput, setDueDateInput] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    sound: true,
    email: false
  })
  
  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false)
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null)
  
  // Security states
  const [showLockModal, setShowLockModal] = useState(false)
  const [lockPassword, setLockPassword] = useState('')
  const [unlockPassword, setUnlockPassword] = useState('')
  const [lockedNotes, setLockedNotes] = useState<Set<string>>(new Set())
  const [autoLockTimeout, setAutoLockTimeout] = useState<number | null>(null)
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now())
  
  // Advanced editing states
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [findCaseSensitive, setFindCaseSensitive] = useState(false)
  
  // Statistics & insights states
  const [showStats, setShowStats] = useState(false)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [writingStreak, setWritingStreak] = useState<WritingStreak>({
    current: 0,
    longest: 0,
    lastDate: ''
  })
  
  // Customization states
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [fontSize, setFontSize] = useState(14)
  const [fontFamily, setFontFamily] = useState('monospace')
  const [showSettings, setShowSettings] = useState(false)
  
  // Quick actions states
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')
  
  // Productivity states
  const [showPomodoro, setShowPomodoro] = useState(false)
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25)
  const [pomodoroSeconds, setPomodoroSeconds] = useState(0)
  const [pomodoroActive, setPomodoroActive] = useState(false)
  
  // Auto-save state
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Enhanced organization states
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string>('all')
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showArchive, setShowArchive] = useState(false)
  const [showTrash, setShowTrash] = useState(false)
  const [linkedNotes, setLinkedNotes] = useState<NoteRelationship[]>([])
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showMergeModal, setShowMergeModal] = useState(false)
  const [notesToMerge, setNotesToMerge] = useState<string[]>([])
  
  // Rich media states
  const [showAttachmentModal, setShowAttachmentModal] = useState(false)
  const [showTableModal, setShowTableModal] = useState(false)
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)
  const [showMathModal, setShowMathModal] = useState(false)
  const [mathEquation, setMathEquation] = useState('')
  
  // Advanced search states
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showSavedSearches, setShowSavedSearches] = useState(false)
  const [highlightSearch, setHighlightSearch] = useState(false)
  const [searchMatches, setSearchMatches] = useState<number>(0)
  
  // Productivity states
  const [focusMode, setFocusMode] = useState(false)
  const [writingTimer, setWritingTimer] = useState(0)
  const [writingTimerActive, setWritingTimerActive] = useState(false)
  const [writingGoals, setWritingGoals] = useState<WritingGoal>({
    daily: 500,
    weekly: 2500,
    monthly: 10000,
    currentDaily: 0,
    currentWeekly: 0,
    currentMonthly: 0
  })
  const [showGoalsModal, setShowGoalsModal] = useState(false)
  
  // Analytics states
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [topicAnalysis, setTopicAnalysis] = useState<TopicAnalysis[]>([])
  const [mostProductiveTime, setMostProductiveTime] = useState<string>('')
  const [showRelationshipGraph, setShowRelationshipGraph] = useState(false)
  
  // Customization states
  const [customThemes, setCustomThemes] = useState<any[]>([])
  const [layoutMode, setLayoutMode] = useState<'single' | 'multi'>('single')
  const [showCustomShortcuts, setShowCustomShortcuts] = useState(false)
  const [customShortcuts, setCustomShortcuts] = useState<Record<string, string>>({})
  
  // Workflow automation states
  const [autoTaggingRules, setAutoTaggingRules] = useState<any[]>([])
  const [autoCategorizationRules, setAutoCategorizationRules] = useState<any[]>([])
  const [showAutomationModal, setShowAutomationModal] = useState(false)
  const [backupSchedule, setBackupSchedule] = useState<string>('daily')
  
  // Learning & improvement states
  const [showGrammarCheck, setShowGrammarCheck] = useState(false)
  const [grammarIssues, setGrammarIssues] = useState<any[]>([])
  const [readabilityScore, setReadabilityScore] = useState<number>(0)
  const [showWritingTips, setShowWritingTips] = useState(false)
  const [writingTips, setWritingTips] = useState<string[]>([])
  
  // Gamification states
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [showAchievements, setShowAchievements] = useState(false)
  const [progressMilestones, setProgressMilestones] = useState<any[]>([])
  
  // Export states
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'doc' | 'html' | 'notion' | 'obsidian'>('pdf')
  
  // Focus mode ref
  const focusModeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedNotes = localStorage.getItem('zuno-notes')
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('zuno-notes', JSON.stringify(notes))
  }, [notes])

  // Load saved data
  useEffect(() => {
    const savedTemplates = localStorage.getItem('zuno-custom-templates')
    if (savedTemplates) {
      setCustomTemplates(JSON.parse(savedTemplates))
    }
    const savedSettings = localStorage.getItem('zuno-note-settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setTheme(settings.theme || 'light')
      setFontSize(settings.fontSize || 14)
      setFontFamily(settings.fontFamily || 'monospace')
      setAutoSaveEnabled(settings.autoSaveEnabled !== false)
    }
    const savedStreak = localStorage.getItem('zuno-writing-streak')
    if (savedStreak) {
      setWritingStreak(JSON.parse(savedStreak))
    }
    const savedActivity = localStorage.getItem('zuno-activity-logs')
    if (savedActivity) {
      setActivityLogs(JSON.parse(savedActivity))
    }
    const savedLocked = localStorage.getItem('zuno-locked-notes')
    if (savedLocked) {
      setLockedNotes(new Set(JSON.parse(savedLocked)))
    }
  }, [])

  // Save settings
  useEffect(() => {
    localStorage.setItem('zuno-custom-templates', JSON.stringify(customTemplates))
  }, [customTemplates])

  useEffect(() => {
    localStorage.setItem('zuno-note-settings', JSON.stringify({
      theme,
      fontSize,
      fontFamily,
      autoSaveEnabled
    }))
  }, [theme, fontSize, fontFamily, autoSaveEnabled])

  useEffect(() => {
    localStorage.setItem('zuno-writing-streak', JSON.stringify(writingStreak))
  }, [writingStreak])

  useEffect(() => {
    localStorage.setItem('zuno-activity-logs', JSON.stringify(activityLogs))
  }, [activityLogs])

  useEffect(() => {
    if (lockedNotes.size > 0) {
      localStorage.setItem('zuno-locked-notes', JSON.stringify(Array.from(lockedNotes)))
    }
  }, [lockedNotes])

  // Load enhanced organization data
  useEffect(() => {
    const savedFolders = localStorage.getItem('zuno-folders')
    if (savedFolders) {
      setFolders(JSON.parse(savedFolders))
    }
    const savedLinkedNotes = localStorage.getItem('zuno-linked-notes')
    if (savedLinkedNotes) {
      setLinkedNotes(JSON.parse(savedLinkedNotes))
    }
    const savedGoals = localStorage.getItem('zuno-writing-goals')
    if (savedGoals) {
      setWritingGoals(JSON.parse(savedGoals))
    }
    const savedSearches = localStorage.getItem('zuno-saved-searches')
    if (savedSearches) {
      setSavedSearches(JSON.parse(savedSearches))
    }
    const savedAchievements = localStorage.getItem('zuno-achievements')
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements))
    }
  }, [])

  // Save enhanced organization data
  useEffect(() => {
    localStorage.setItem('zuno-folders', JSON.stringify(folders))
  }, [folders])

  useEffect(() => {
    localStorage.setItem('zuno-linked-notes', JSON.stringify(linkedNotes))
  }, [linkedNotes])

  useEffect(() => {
    localStorage.setItem('zuno-writing-goals', JSON.stringify(writingGoals))
  }, [writingGoals])

  useEffect(() => {
    localStorage.setItem('zuno-saved-searches', JSON.stringify(savedSearches))
  }, [savedSearches])

  useEffect(() => {
    localStorage.setItem('zuno-achievements', JSON.stringify(achievements))
  }, [achievements])

  // Writing timer effect
  useEffect(() => {
    if (writingTimerActive) {
      const interval = setInterval(() => {
        setWritingTimer(prev => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [writingTimerActive])

  // Auto-tagging on note creation
  useEffect(() => {
    if (selectedNote && selectedNote.content && !selectedNote.autoTags) {
      applyAutoTagging(selectedNote)
    }
  }, [selectedNote?.content])

  // Check achievements periodically
  useEffect(() => {
    if (notes.length > 0 || writingStreak.current > 0) {
      checkAchievements()
    }
  }, [notes.length, writingStreak.current])

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && selectedNote && content) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        if (selectedNote && (selectedNote.content !== content || selectedNote.title !== title)) {
          saveNote()
          toast.success('Auto-saved', { duration: 1000 })
        }
      }, 2000) // Auto-save after 2 seconds of inactivity
    }
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [content, title, selectedNote, autoSaveEnabled])

  // Auto-lock after inactivity
  useEffect(() => {
    const handleActivity = () => {
      setLastActivityTime(Date.now())
    }
    window.addEventListener('mousedown', handleActivity)
    window.addEventListener('keydown', handleActivity)
    
    const checkInactivity = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityTime
      if (inactiveTime > 300000 && selectedNote?.isLocked) { // 5 minutes
        setLockedNotes(prev => new Set(Array.from(prev).concat(selectedNote.id)))
        toast.success('Note auto-locked due to inactivity')
      }
    }, 60000) // Check every minute

    return () => {
      window.removeEventListener('mousedown', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      clearInterval(checkInactivity)
    }
  }, [lastActivityTime, selectedNote])

  // Check reminders
  useEffect(() => {
    if (!notificationSettings.enabled) return
    const checkReminders = () => {
      const now = new Date()
      notes.forEach(note => {
        if (note.reminder && !note.reminder.isCompleted && !note.reminder.notificationSent) {
          const reminderDateTime = new Date(`${note.reminder.date}T${note.reminder.time}`)
          if (reminderDateTime <= now) {
            toast.success(`Reminder: ${note.title}${note.reminder.message ? ` - ${note.reminder.message}` : ''}`, {
              duration: 5000,
            })
            const updatedNotes = notes.map(n =>
              n.id === note.id && n.reminder
                ? { ...n, reminder: { ...n.reminder, notificationSent: true } }
                : n
            )
            setNotes(updatedNotes)
          }
        }
      })
    }
    const interval = setInterval(checkReminders, 60000)
    checkReminders()
    return () => clearInterval(interval)
  }, [notes, notificationSettings.enabled])

  // Update writing streak
  useEffect(() => {
    const today = new Date().toDateString()
    if (writingStreak.lastDate !== today && notes.length > 0) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      if (writingStreak.lastDate === yesterday.toDateString()) {
        setWritingStreak(prev => ({
          ...prev,
          current: prev.current + 1,
          longest: Math.max(prev.current + 1, prev.longest),
          lastDate: today
        }))
      } else {
        setWritingStreak(prev => ({
          ...prev,
          current: 1,
          lastDate: today
        }))
      }
    }
  }, [notes.length, writingStreak.lastDate])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Ctrl + K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowCommandPalette(true)
      }
      // Command/Ctrl + S for save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (selectedNote) saveNote()
      }
      // Command/Ctrl + F for find
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        setShowFindReplace(true)
      }
      // Command/Ctrl + Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      // Command/Ctrl + Shift + Z for redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        redo()
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        setShowCommandPalette(false)
        setShowFindReplace(false)
        setShowStats(false)
        setShowSettings(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNote])

  const createNewNote = (template?: NoteTemplate) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: template ? template.name : 'Untitled Note',
      content: template ? template.content : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      category: template ? template.category : 'Personal',
      color: 'bg-white border-gray-200',
      isFavorite: false,
      isPinned: false,
      sharedWith: [],
      permissions: {},
      comments: [],
      versions: [{
        id: Date.now().toString(),
        title: template ? template.name : 'Untitled Note',
        content: template ? template.content : '',
        createdAt: new Date().toISOString(),
      }],
      templateId: template?.id,
      embeddedImages: [],
      wordCount: 0,
      characterCount: 0,
      editCount: 0
    }
    setNotes([newNote, ...notes])
    setSelectedNote(newNote)
    setTitle(newNote.title)
    setContent(newNote.content)
    addActivityLog(newNote.id, 'created')
    if (template) {
      setShowTemplateModal(false)
    }
  }

  const selectNote = (note: Note) => {
    if (note.isLocked && lockedNotes.has(note.id)) {
      setShowLockModal(true)
      setUnlockPassword('')
      return
    }
    setSelectedNote(note)
    setTitle(note.title)
    setContent(note.content)
    if (note.content) {
      addToHistory(note.content)
      setHistoryIndex(0)
    }
    addActivityLog(note.id, 'viewed')
  }

  const saveNote = () => {
    if (!selectedNote) return

    // Create version history entry if content changed
    const contentChanged = selectedNote.content !== content || selectedNote.title !== title
    const newVersion: NoteVersion = {
      id: Date.now().toString(),
      title: selectedNote.title,
      content: selectedNote.content,
      createdAt: new Date().toISOString(),
    }

    const words = content.split(/\s+/).filter(w => w.length > 0).length
    const characters = content.length

    const updatedNote = {
      ...selectedNote,
      title: title || 'Untitled Note',
      content,
      updatedAt: new Date().toISOString(),
      versions: contentChanged && selectedNote.versions
        ? [newVersion, ...selectedNote.versions].slice(0, 10) // Keep last 10 versions
        : selectedNote.versions || [],
      wordCount: words,
      characterCount: characters,
      editCount: (selectedNote.editCount || 0) + (contentChanged ? 1 : 0),
      lastEdited: new Date().toISOString()
    }

    const updatedNotes = notes.map(note =>
      note.id === selectedNote.id ? updatedNote : note
    )
    setNotes(updatedNotes)
    setSelectedNote(updatedNote)
    
    if (contentChanged) {
      addActivityLog(selectedNote.id, 'edited')
      addToHistory(content)
    }
    
    toast.success('Note saved!')
  }

  const toggleFavorite = (noteId: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId ? { ...note, isFavorite: !note.isFavorite } : note
    )
    setNotes(updatedNotes)
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, isFavorite: !selectedNote.isFavorite })
    }
    toast.success(notes.find(n => n.id === noteId)?.isFavorite ? 'Removed from favorites' : 'Added to favorites')
  }

  const togglePin = (noteId: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
    )
    setNotes(updatedNotes)
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, isPinned: !selectedNote.isPinned })
    }
    toast.success(notes.find(n => n.id === noteId)?.isPinned ? 'Unpinned' : 'Pinned')
  }

  const updateNoteColor = (noteId: string, color: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId ? { ...note, color } : note
    )
    setNotes(updatedNotes)
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, color })
    }
  }

  const updateNoteCategory = (noteId: string, category: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId ? { ...note, category } : note
    )
    setNotes(updatedNotes)
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, category })
    }
  }

  const addTag = (noteId: string, tag: string) => {
    if (!tag.trim()) return
    const tagLower = tag.trim().toLowerCase()
    const note = notes.find(n => n.id === noteId)
    if (note && !note.tags?.includes(tagLower)) {
      const updatedNotes = notes.map(n =>
        n.id === noteId ? { ...n, tags: [...(n.tags || []), tagLower] } : n
      )
      setNotes(updatedNotes)
      if (selectedNote?.id === noteId) {
        setSelectedNote({ ...selectedNote, tags: [...(selectedNote.tags || []), tagLower] })
      }
      setNewTag('')
      setShowTagInput(false)
    }
  }

  const removeTag = (noteId: string, tag: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? { ...note, tags: note.tags?.filter(t => t !== tag) || [] }
        : note
    )
    setNotes(updatedNotes)
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, tags: selectedNote.tags?.filter(t => t !== tag) || [] })
    }
  }

  // Export functions
  const exportNote = (note: Note, format: 'json' | 'txt' | 'md' = 'json') => {
    let content = ''
    let filename = ''

    if (format === 'json') {
      content = JSON.stringify(note, null, 2)
      filename = `${note.title.replace(/[^a-z0-9]/gi, '_')}.json`
    } else if (format === 'txt') {
      content = `${note.title}\n\n${note.content}`
      filename = `${note.title.replace(/[^a-z0-9]/gi, '_')}.txt`
    } else if (format === 'md') {
      content = `# ${note.title}\n\n${note.content}`
      filename = `${note.title.replace(/[^a-z0-9]/gi, '_')}.md`
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Note exported!')
  }

  const exportAllNotes = (format: 'json' | 'txt' | 'md' = 'json') => {
    const notesToExport = filteredAndSortedNotes.length > 0 ? filteredAndSortedNotes : notes
    
    if (format === 'json') {
      const content = JSON.stringify(notesToExport, null, 2)
      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `notes_export_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(`Exported ${notesToExport.length} notes!`)
    } else {
      // Export as individual files in a zip-like structure (simplified - export as combined text)
      let content = `# Notes Export\n\nExported on: ${new Date().toLocaleString()}\n\n`
      notesToExport.forEach((note, index) => {
        content += `\n## ${index + 1}. ${note.title}\n\n`
        content += `${note.content}\n\n`
        content += `---\n\n`
      })
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `notes_export_${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(`Exported ${notesToExport.length} notes!`)
    }
  }

  const importNotes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const imported = JSON.parse(content)
        const importedNotes = Array.isArray(imported) ? imported : [imported]
        
        // Add imported notes with new IDs to avoid conflicts
        const newNotes = importedNotes.map((note: Note) => ({
          ...note,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: note.createdAt || new Date().toISOString(),
          updatedAt: note.updatedAt || new Date().toISOString(),
        }))
        
        setNotes([...newNotes, ...notes])
        toast.success(`Imported ${newNotes.length} note(s)!`)
      } catch (error) {
        toast.error('Failed to import notes. Invalid file format.')
      }
    }
    reader.readAsText(file)
    // Reset input
    event.target.value = ''
  }

  // Share functions
  const generateShareLink = (noteId: string) => {
    const baseUrl = window.location.origin
    const shareId = btoa(noteId + '|' + Date.now()).replace(/[+/=]/g, '')
    const link = `${baseUrl}/tools/note-taker?share=${shareId}`
    setSharedLink(link)
    
    // Store share data in localStorage
    localStorage.setItem(`note-share-${shareId}`, JSON.stringify({
      noteId,
      createdAt: new Date().toISOString(),
    }))
    
    return link
  }

  const copyShareLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      setLinkCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  const shareNote = (noteId: string, email: string, permission: 'read' | 'edit') => {
    if (!email.trim()) {
      toast.error('Please enter an email address')
      return
    }

    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? {
            ...note,
            sharedWith: [...(note.sharedWith || []), email],
            permissions: {
              ...(note.permissions || {}),
              [email]: permission,
            },
          }
        : note
    )
    setNotes(updatedNotes)
    if (selectedNote?.id === noteId) {
      setSelectedNote({
        ...selectedNote,
        sharedWith: [...(selectedNote.sharedWith || []), email],
        permissions: {
          ...(selectedNote.permissions || {}),
          [email]: permission,
        },
      })
    }
    setShareEmail('')
    setShowShareModal(false)
    toast.success(`Note shared with ${email}`)
  }

  const removeShare = (noteId: string, email: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? {
            ...note,
            sharedWith: note.sharedWith?.filter(e => e !== email) || [],
            permissions: Object.fromEntries(
              Object.entries(note.permissions || {}).filter(([key]) => key !== email)
            ),
          }
        : note
    )
    setNotes(updatedNotes)
    if (selectedNote?.id === noteId) {
      setSelectedNote({
        ...selectedNote,
        sharedWith: selectedNote.sharedWith?.filter(e => e !== email) || [],
        permissions: Object.fromEntries(
          Object.entries(selectedNote.permissions || {}).filter(([key]) => key !== email)
        ),
      })
    }
    toast.success('Access removed')
  }

  const updatePermission = (noteId: string, email: string, permission: 'read' | 'edit') => {
    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? {
            ...note,
            permissions: {
              ...(note.permissions || {}),
              [email]: permission,
            },
          }
        : note
    )
    setNotes(updatedNotes)
    if (selectedNote?.id === noteId) {
      setSelectedNote({
        ...selectedNote,
        permissions: {
          ...(selectedNote.permissions || {}),
          [email]: permission,
        },
      })
    }
    toast.success('Permission updated')
  }

  // Comment functions
  const addComment = (noteId: string) => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment,
      author: commentAuthor || 'You',
      createdAt: new Date().toISOString(),
    }

    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? { ...note, comments: [...(note.comments || []), comment] }
        : note
    )
    setNotes(updatedNotes)
    if (selectedNote?.id === noteId) {
      setSelectedNote({
        ...selectedNote,
        comments: [...(selectedNote.comments || []), comment],
      })
    }
    setNewComment('')
    toast.success('Comment added')
  }

  const deleteComment = (noteId: string, commentId: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? { ...note, comments: note.comments?.filter(c => c.id !== commentId) || [] }
        : note
    )
    setNotes(updatedNotes)
    if (selectedNote?.id === noteId) {
      setSelectedNote({
        ...selectedNote,
        comments: selectedNote.comments?.filter(c => c.id !== commentId) || [],
      })
    }
    toast.success('Comment deleted')
  }

  const restoreVersion = (noteId: string, version: NoteVersion) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? {
            ...note,
            title: version.title,
            content: version.content,
            updatedAt: new Date().toISOString(),
            versions: note.versions ? [version, ...note.versions] : [version],
          }
        : note
    )
    setNotes(updatedNotes)
    if (selectedNote?.id === noteId) {
      const updated = {
        ...selectedNote,
        title: version.title,
        content: version.content,
        updatedAt: new Date().toISOString(),
      }
      setSelectedNote(updated)
      setTitle(version.title)
      setContent(version.content)
    }
    setShowVersionHistory(false)
    toast.success('Version restored')
  }

  // Get all unique tags from notes
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags || [])))

  // Filter and sort notes
  const filteredAndSortedNotes = notes
    .filter(note => {
      // Archive/Trash filter
      if (showArchive && !note.isArchived) return false
      if (showTrash && !note.isTrashed) return false
      if (!showArchive && !showTrash && (note.isArchived || note.isTrashed)) return false

      // Folder filter
      if (selectedFolder !== 'all') {
        if (selectedFolder === 'none' && note.folderId) return false
        if (selectedFolder !== 'none' && note.folderId !== selectedFolder) return false
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = note.title.toLowerCase().includes(query)
        const matchesContent = note.content.toLowerCase().includes(query)
        const matchesTags = note.tags?.some(tag => tag.includes(query))
        if (!matchesTitle && !matchesContent && !matchesTags) return false
      }

      // Tags filter
      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every(tag => note.tags?.includes(tag))
        if (!hasAllTags) return false
      }

      // Category filter
      if (selectedCategory !== 'all' && note.category !== selectedCategory) {
        return false
      }

      // Color filter
      if (selectedColor !== 'all') {
        const colorMatch = NOTE_COLORS.find(c => c.value === selectedColor)
        if (note.color !== colorMatch?.value) return false
      }

      // Favorites filter
      if (showFavorites && !note.isFavorite) return false

      // Pinned filter
      if (showPinned && !note.isPinned) return false

      // Date range filter
      if (dateRange.start || dateRange.end) {
        const noteDate = new Date(note.createdAt)
        if (dateRange.start && noteDate < new Date(dateRange.start)) return false
        if (dateRange.end && noteDate > new Date(dateRange.end)) return false
      }

      return true
    })
    .sort((a, b) => {
      // Pinned notes first
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1

      let comparison = 0
      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title)
      } else if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else if (sortBy === 'modified') {
        const aDate = a.updatedAt || a.createdAt
        const bDate = b.updatedAt || b.createdAt
        comparison = new Date(aDate).getTime() - new Date(bDate).getTime()
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id)
    setNotes(updatedNotes)
    if (selectedNote?.id === id) {
      setSelectedNote(null)
      setTitle('')
      setContent('')
    }
    addActivityLog(id, 'deleted')
    toast.success('Note deleted!')
  }

  // Statistics & Insights Functions
  const calculateReadingTime = (text: string): number => {
    const wordsPerMinute = 200
    const words = text.split(/\s+/).filter(w => w.length > 0).length
    return Math.ceil(words / wordsPerMinute)
  }

  const getNoteStats = (): NoteStats => {
    const totalWords = notes.reduce((sum, note) => {
      const words = note.content.split(/\s+/).filter(w => w.length > 0).length
      return sum + words
    }, 0)
    const totalCharacters = notes.reduce((sum, note) => sum + note.content.length, 0)
    const today = new Date().toDateString()
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const notesCreatedToday = notes.filter(n => new Date(n.createdAt).toDateString() === today).length
    const notesCreatedThisWeek = notes.filter(n => new Date(n.createdAt) >= weekAgo).length
    const notesCreatedThisMonth = notes.filter(n => new Date(n.createdAt) >= monthAgo).length
    
    const mostEditedNote = notes.reduce((max, note) => 
      (note.editCount || 0) > (max?.editCount || 0) ? note : max, notes[0] || null
    )

    return {
      totalNotes: notes.length,
      totalWords,
      totalCharacters,
      averageWordsPerNote: notes.length > 0 ? Math.round(totalWords / notes.length) : 0,
      mostEditedNote: mostEditedNote || undefined,
      notesCreatedToday,
      notesCreatedThisWeek,
      notesCreatedThisMonth
    }
  }

  const addActivityLog = (noteId: string, action: string) => {
    const log: ActivityLog = {
      id: Date.now().toString(),
      noteId,
      action,
      timestamp: new Date().toISOString()
    }
    setActivityLogs(prev => [log, ...prev].slice(0, 100)) // Keep last 100 activities
  }

  // Security Functions
  const lockNote = (noteId: string, password: string) => {
    if (!password.trim()) {
      toast.error('Please enter a password')
      return
    }
    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? { ...note, isLocked: true, password: btoa(password) }
        : note
    )
    setNotes(updatedNotes)
    setLockedNotes(prev => new Set(Array.from(prev).concat(noteId)))
    setLockPassword('')
    setShowLockModal(false)
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, isLocked: true, password: btoa(password) })
      setTitle('')
      setContent('')
    }
    toast.success('Note locked')
  }

  const unlockNote = (noteId: string, password: string) => {
    const note = notes.find(n => n.id === noteId)
    if (!note) return
    
    const storedPassword = note.password ? atob(note.password) : ''
    if (password !== storedPassword) {
      toast.error('Incorrect password')
      return
    }
    
    const updatedNotes = notes.map(n =>
      n.id === noteId ? { ...n, isLocked: false } : n
    )
    setNotes(updatedNotes)
    setLockedNotes(prev => {
      const newSet = new Set(prev)
      newSet.delete(noteId)
      return newSet
    })
    setUnlockPassword('')
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, isLocked: false })
      setTitle(selectedNote.title)
      setContent(selectedNote.content)
    }
    toast.success('Note unlocked')
  }

  // Advanced Editing Functions
  const addToHistory = (text: string) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(text)
      return newHistory.slice(-50) // Keep last 50 states
    })
    setHistoryIndex(prev => Math.min(prev + 1, 49))
  }

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setContent(history[newIndex])
      toast.success('Undone')
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setContent(history[newIndex])
      toast.success('Redone')
    }
  }

  const findAndReplace = (find: string, replace: string, caseSensitive: boolean) => {
    if (!find.trim()) {
      toast.error('Please enter text to find')
      return
    }
    
    const flags = caseSensitive ? 'g' : 'gi'
    const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags)
    
    if (content.includes(find) || content.match(regex)) {
      const newContent = content.replace(regex, replace)
      setContent(newContent)
      addToHistory(newContent)
      toast.success('Text replaced')
    } else {
      toast.error('Text not found')
    }
  }

  const replaceAll = (find: string, replace: string, caseSensitive: boolean) => {
    if (!find.trim()) {
      toast.error('Please enter text to find')
      return
    }
    
    const flags = caseSensitive ? 'g' : 'gi'
    const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags)
    const matches = content.match(regex)
    
    if (matches) {
      const newContent = content.replace(regex, replace)
      setContent(newContent)
      addToHistory(newContent)
      toast.success(`Replaced ${matches.length} occurrence(s)`)
    } else {
      toast.error('Text not found')
    }
  }

  // Template Functions
  const createNoteFromTemplate = (template: NoteTemplate) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: template.name,
      content: template.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      category: template.category,
      color: 'bg-white border-gray-200',
      isFavorite: false,
      isPinned: false,
      sharedWith: [],
      permissions: {},
      comments: [],
      versions: [{
        id: Date.now().toString(),
        title: template.name,
        content: template.content,
        createdAt: new Date().toISOString(),
      }],
      templateId: template.id,
      embeddedImages: [],
    }
    setNotes([newNote, ...notes])
    setSelectedNote(newNote)
    setTitle(newNote.title)
    setContent(newNote.content)
    setShowTemplateModal(false)
    addActivityLog(newNote.id, 'created from template')
    toast.success(`Created note from "${template.name}" template`)
  }

  const saveCustomTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateContent.trim()) {
      toast.error('Please provide a name and content for the template')
      return
    }
    const newTemplate: NoteTemplate = {
      id: Date.now().toString(),
      name: newTemplateName,
      description: newTemplateDescription,
      content: newTemplateContent,
      category: newTemplateCategory,
      isCustom: true,
    }
    setCustomTemplates([...customTemplates, newTemplate])
    setNewTemplateName('')
    setNewTemplateDescription('')
    setNewTemplateContent('')
    setNewTemplateCategory('Personal')
    setShowCustomTemplateModal(false)
    toast.success('Custom template saved!')
  }

  // Reminder Functions
  const setReminder = () => {
    if (!selectedNote) {
      toast.error('Please select a note first')
      return
    }
    if (!reminderDate || !reminderTime) {
      toast.error('Please select both date and time')
      return
    }
    const reminder: Reminder = {
      id: Date.now().toString(),
      date: reminderDate,
      time: reminderTime,
      message: reminderMessage,
      isCompleted: false,
      notificationSent: false,
    }
    const updatedNotes = notes.map(note =>
      note.id === selectedNote.id ? { ...note, reminder } : note
    )
    setNotes(updatedNotes)
    setSelectedNote({ ...selectedNote, reminder })
    setReminderDate('')
    setReminderTime('')
    setReminderMessage('')
    setShowReminderModal(false)
    toast.success('Reminder set!')
  }

  const updateDueDate = (noteId: string, date: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId ? { ...note, dueDate: date } : note
    )
    setNotes(updatedNotes)
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, dueDate: date })
    }
    setShowDueDatePicker(false)
    toast.success('Due date set!')
  }

  // Pomodoro Timer Functions
  const startPomodoro = () => {
    setPomodoroActive(true)
    setPomodoroMinutes(25)
    setPomodoroSeconds(0)
  }

  const stopPomodoro = () => {
    setPomodoroActive(false)
  }

  useEffect(() => {
    if (pomodoroActive && (pomodoroMinutes > 0 || pomodoroSeconds > 0)) {
      const timer = setInterval(() => {
        if (pomodoroSeconds > 0) {
          setPomodoroSeconds(prev => prev - 1)
        } else if (pomodoroMinutes > 0) {
          setPomodoroMinutes(prev => prev - 1)
          setPomodoroSeconds(59)
        } else {
          setPomodoroActive(false)
          toast.success('Pomodoro session complete! 🎉')
        }
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [pomodoroActive, pomodoroMinutes, pomodoroSeconds])

  // Update note stats on save
  useEffect(() => {
    if (selectedNote && content) {
      const words = content.split(/\s+/).filter(w => w.length > 0).length
      const characters = content.length
      const updatedNotes = notes.map(note =>
        note.id === selectedNote.id
          ? {
              ...note,
              wordCount: words,
              characterCount: characters,
              editCount: (note.editCount || 0) + 1,
              lastEdited: new Date().toISOString()
            }
          : note
      )
      setNotes(updatedNotes)
      if (selectedNote.id === selectedNote.id) {
        setSelectedNote({
          ...selectedNote,
          wordCount: words,
          characterCount: characters,
          editCount: (selectedNote.editCount || 0) + 1,
          lastEdited: new Date().toISOString()
        })
      }
    }
  }, [content])

  // Enhanced Organization Functions
  const createFolder = () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name')
      return
    }
    const newFolder: Folder = {
      id: Date.now().toString(),
      name: newFolderName,
      createdAt: new Date().toISOString()
    }
    setFolders([...folders, newFolder])
    setNewFolderName('')
    setShowFolderModal(false)
    toast.success('Folder created')
  }

  const moveNoteToFolder = (noteId: string, folderId: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId ? { ...note, folderId } : note
    )
    setNotes(updatedNotes)
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, folderId })
    }
    toast.success('Note moved to folder')
  }

  const archiveNote = (noteId: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId ? { ...note, isArchived: true } : note
    )
    setNotes(updatedNotes)
    toast.success('Note archived')
  }

  const unarchiveNote = (noteId: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId ? { ...note, isArchived: false } : note
    )
    setNotes(updatedNotes)
    toast.success('Note unarchived')
  }

  const trashNote = (noteId: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId 
        ? { ...note, isTrashed: true, trashedAt: new Date().toISOString() }
        : note
    )
    setNotes(updatedNotes)
    toast.success('Note moved to trash')
  }

  const restoreNote = (noteId: string) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId 
        ? { ...note, isTrashed: false, trashedAt: undefined }
        : note
    )
    setNotes(updatedNotes)
    toast.success('Note restored')
  }

  const permanentlyDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId)
    setNotes(updatedNotes)
    if (selectedNote?.id === noteId) {
      setSelectedNote(null)
      setTitle('')
      setContent('')
    }
    toast.success('Note permanently deleted')
  }

  const linkNotes = (sourceId: string, targetId: string) => {
    const relationship: NoteRelationship = {
      sourceId,
      targetId,
      type: 'link'
    }
    setLinkedNotes([...linkedNotes, relationship])
    
    const updatedNotes = notes.map(note => {
      if (note.id === sourceId) {
        return { ...note, linkedNotes: [...(note.linkedNotes || []), targetId] }
      }
      return note
    })
    setNotes(updatedNotes)
    toast.success('Notes linked')
  }

  const mergeNotes = (noteIds: string[]) => {
    if (noteIds.length < 2) {
      toast.error('Select at least 2 notes to merge')
      return
    }
    
    const notesToMerge = notes.filter(n => noteIds.includes(n.id))
    const mergedTitle = notesToMerge[0].title
    const mergedContent = notesToMerge.map(n => `# ${n.title}\n\n${n.content}`).join('\n\n---\n\n')
    
    const newNote: Note = {
      id: Date.now().toString(),
      title: mergedTitle + ' (Merged)',
      content: mergedContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: Array.from(new Set(notesToMerge.flatMap(n => n.tags || []))),
      category: notesToMerge[0].category,
      color: notesToMerge[0].color,
      isFavorite: notesToMerge.some(n => n.isFavorite),
      isPinned: notesToMerge.some(n => n.isPinned),
      sharedWith: [],
      permissions: {},
      comments: [],
      versions: []
    }
    
    const updatedNotes = notes.filter(n => !noteIds.includes(n.id))
    setNotes([newNote, ...updatedNotes])
    setNotesToMerge([])
    setShowMergeModal(false)
    toast.success(`${noteIds.length} notes merged`)
  }

  // Rich Media Functions
  const insertTable = (rows: number, cols: number) => {
    let table = '|'
    for (let i = 0; i < cols; i++) {
      table += ' Header |'
    }
    table += '\n|'
    for (let i = 0; i < cols; i++) {
      table += ' --- |'
    }
    for (let r = 0; r < rows; r++) {
      table += '\n|'
      for (let c = 0; c < cols; c++) {
        table += ' Cell |'
      }
    }
    
    const start = textareaRef.current?.selectionStart || 0
    const newContent = content.substring(0, start) + '\n' + table + '\n' + content.substring(start)
    setContent(newContent)
    setShowTableModal(false)
    toast.success('Table inserted')
  }

  const insertMathEquation = (equation: string) => {
    const mathBlock = `$$\n${equation}\n$$`
    const start = textareaRef.current?.selectionStart || 0
    const newContent = content.substring(0, start) + '\n' + mathBlock + '\n' + content.substring(start)
    setContent(newContent)
    setShowMathModal(false)
    setMathEquation('')
    toast.success('Math equation inserted')
  }

  const attachFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const attachment: Attachment = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        data: e.target?.result as string,
        uploadedAt: new Date().toISOString()
      }
      
      if (selectedNote) {
        const updatedNotes = notes.map(note =>
          note.id === selectedNote.id
            ? { ...note, attachments: [...(note.attachments || []), attachment] }
            : note
        )
        setNotes(updatedNotes)
        setSelectedNote({
          ...selectedNote,
          attachments: [...(selectedNote.attachments || []), attachment]
        })
        toast.success('File attached')
      }
    }
    reader.readAsDataURL(file)
  }

  // Advanced Search Functions
  const saveSearch = (name: string) => {
    if (!name.trim()) {
      toast.error('Please enter a name for the search')
      return
    }
    const savedSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      query: searchQuery,
      filters: {
        tags: selectedTags,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        dateRange: dateRange.start || dateRange.end ? dateRange : undefined
      },
      createdAt: new Date().toISOString()
    }
    setSavedSearches([...savedSearches, savedSearch])
    toast.success('Search saved')
  }

  const loadSavedSearch = (search: SavedSearch) => {
    setSearchQuery(search.query)
    setSelectedTags(search.filters.tags || [])
    setSelectedCategory(search.filters.category || 'all')
    if (search.filters.dateRange) {
      setDateRange(search.filters.dateRange)
    }
    setShowSavedSearches(false)
    toast.success('Search loaded')
  }

  const highlightSearchResults = (query: string) => {
    if (!query.trim()) return content
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const matches = content.match(regex)
    setSearchMatches(matches ? matches.length : 0)
    return content.replace(regex, '<mark>$1</mark>')
  }

  // Productivity Functions
  const toggleFocusMode = () => {
    setFocusMode(!focusMode)
    if (!focusMode) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }

  const startWritingTimer = () => {
    setWritingTimerActive(true)
    const interval = setInterval(() => {
      setWritingTimer(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }

  const stopWritingTimer = () => {
    setWritingTimerActive(false)
    if (selectedNote) {
      const updatedNotes = notes.map(note =>
        note.id === selectedNote.id
          ? { ...note, writingTime: (note.writingTime || 0) + writingTimer }
          : note
      )
      setNotes(updatedNotes)
    }
  }

  const updateWritingGoals = (type: 'daily' | 'weekly' | 'monthly', value: number) => {
    setWritingGoals(prev => ({
      ...prev,
      [type]: value
    }))
    toast.success('Writing goal updated')
  }

  // Analytics Functions
  const analyzeTopics = () => {
    const allText = notes.map(n => n.content).join(' ')
    const words: string[] = allText.toLowerCase().match(/\b\w+\b/g) || []
    const wordFreq: Record<string, number> = {}
    
    words.forEach(word => {
      if (word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1
      }
    })
    
    const topics = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({
        word,
        count,
        frequency: (count / words.length) * 100
      }))
    
    setTopicAnalysis(topics)
  }

  const analyzeProductiveTime = () => {
    const hourCounts: Record<number, number> = {}
    notes.forEach(note => {
      const hour = new Date(note.createdAt).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })
    
    const mostProductive = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])[0]
    
    if (mostProductive) {
      setMostProductiveTime(`${mostProductive[0]}:00`)
    }
  }

  // Learning & Improvement Functions
  const checkGrammar = () => {
    // Simple grammar checking (can be enhanced with API)
    const issues: any[] = []
    const sentences = content.split(/[.!?]+/)
    
    sentences.forEach((sentence, index) => {
      if (sentence.trim().length > 0) {
        // Check for common issues
        if (!/^[A-Z]/.test(sentence.trim())) {
          issues.push({
            type: 'capitalization',
            message: 'Sentence should start with capital letter',
            position: index
          })
        }
        if (sentence.trim().length < 10) {
          issues.push({
            type: 'length',
            message: 'Very short sentence',
            position: index
          })
        }
      }
    })
    
    setGrammarIssues(issues)
    setShowGrammarCheck(true)
    toast.success(`Found ${issues.length} potential issues`)
  }

  const calculateReadability = () => {
    // Flesch Reading Ease simplified calculation
    const words = content.split(/\s+/).filter(w => w.length > 0).length
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    const syllables = content.toLowerCase().match(/[aeiouy]+/g)?.length || 0
    
    if (words === 0 || sentences === 0) {
      setReadabilityScore(0)
      return
    }
    
    const avgSentenceLength = words / sentences
    const avgSyllablesPerWord = syllables / words
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord)
    
    setReadabilityScore(Math.max(0, Math.min(100, score)))
    toast.success('Readability calculated')
  }

  const analyzeSentiment = () => {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'happy', 'love', 'best', 'perfect']
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'sad', 'angry', 'disappointed']
    
    const text = content.toLowerCase()
    let positive = 0
    let negative = 0
    
    positiveWords.forEach(word => {
      const matches = text.match(new RegExp(word, 'g'))
      if (matches) positive += matches.length
    })
    
    negativeWords.forEach(word => {
      const matches = text.match(new RegExp(word, 'g'))
      if (matches) negative += matches.length
    })
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
    if (positive > negative) sentiment = 'positive'
    else if (negative > positive) sentiment = 'negative'
    
    if (selectedNote) {
      const updatedNotes = notes.map(note =>
        note.id === selectedNote.id ? { ...note, sentiment } : note
      )
      setNotes(updatedNotes)
      setSelectedNote({ ...selectedNote, sentiment })
    }
    
    toast.success(`Sentiment: ${sentiment}`)
  }

  // Gamification Functions
  const checkAchievements = () => {
    const newAchievements: Achievement[] = []
    
    // Word count achievements
    const totalWords = notes.reduce((sum, n) => sum + (n.wordCount || 0), 0)
    if (totalWords >= 10000 && !achievements.find(a => a.id === 'words-10k')) {
      newAchievements.push({
        id: 'words-10k',
        name: 'Word Master',
        description: 'Written 10,000 words',
        icon: '📝'
      })
    }
    
    // Note count achievements
    if (notes.length >= 100 && !achievements.find(a => a.id === 'notes-100')) {
      newAchievements.push({
        id: 'notes-100',
        name: 'Note Collector',
        description: 'Created 100 notes',
        icon: '📚'
      })
    }
    
    // Streak achievements
    if (writingStreak.current >= 7 && !achievements.find(a => a.id === 'streak-7')) {
      newAchievements.push({
        id: 'streak-7',
        name: 'Week Warrior',
        description: '7 day writing streak',
        icon: '🔥'
      })
    }
    
    if (newAchievements.length > 0) {
      setAchievements([...achievements, ...newAchievements])
      newAchievements.forEach(ach => {
        toast.success(`Achievement unlocked: ${ach.name}! 🎉`)
      })
    }
  }

  // Export Functions
  const exportToPDF = (note: Note) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${note.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            pre { background: #f5f5f5; padding: 15px; border-radius: 5px; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <h1>${note.title}</h1>
          <div>${markdownToHtml(note.content)}</div>
          <p style="margin-top: 40px; color: #666; font-size: 12px;">
            Created: ${new Date(note.createdAt).toLocaleString()}
          </p>
        </body>
      </html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  const emailNote = (note: Note) => {
    const subject = encodeURIComponent(note.title)
    const body = encodeURIComponent(`\n\n---\n\n${note.content}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  // Auto-tagging and categorization
  const applyAutoTagging = (note: Note) => {
    const autoTags: string[] = []
    const contentLower = note.content.toLowerCase()
    
    // Simple keyword-based tagging
    const tagKeywords: Record<string, string[]> = {
      'work': ['meeting', 'project', 'deadline', 'task', 'client'],
      'personal': ['family', 'friend', 'home', 'personal'],
      'study': ['learn', 'study', 'exam', 'homework', 'course'],
      'ideas': ['idea', 'brainstorm', 'concept', 'thought']
    }
    
    Object.entries(tagKeywords).forEach(([tag, keywords]) => {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        autoTags.push(tag)
      }
    })
    
    if (autoTags.length > 0) {
      const updatedNotes = notes.map(n =>
        n.id === note.id ? { ...n, autoTags, tags: [...(n.tags || []), ...autoTags.filter(t => !n.tags?.includes(t))] } : n
      )
      setNotes(updatedNotes)
    }
  }

  // Markdown formatting functions
  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    if (!textareaRef.current) return
    
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const textToInsert = selectedText || placeholder
    
    const newContent = 
      content.substring(0, start) + 
      before + textToInsert + after + 
      content.substring(end)
    
    setContent(newContent)
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + before.length + textToInsert.length
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  const formatBold = () => insertText('**', '**', 'bold text')
  const formatItalic = () => insertText('*', '*', 'italic text')
  const formatHeading1 = () => {
    const start = textareaRef.current?.selectionStart || 0
    const lineStart = content.lastIndexOf('\n', start - 1) + 1
    const newContent = content.substring(0, lineStart) + '# ' + content.substring(lineStart)
    setContent(newContent)
  }
  const formatHeading2 = () => {
    const start = textareaRef.current?.selectionStart || 0
    const lineStart = content.lastIndexOf('\n', start - 1) + 1
    const newContent = content.substring(0, lineStart) + '## ' + content.substring(lineStart)
    setContent(newContent)
  }
  const formatHeading3 = () => {
    const start = textareaRef.current?.selectionStart || 0
    const lineStart = content.lastIndexOf('\n', start - 1) + 1
    const newContent = content.substring(0, lineStart) + '### ' + content.substring(lineStart)
    setContent(newContent)
  }
  const formatList = () => {
    const start = textareaRef.current?.selectionStart || 0
    const lineStart = content.lastIndexOf('\n', start - 1) + 1
    const newContent = content.substring(0, lineStart) + '- ' + content.substring(lineStart)
    setContent(newContent)
  }
  const formatOrderedList = () => {
    const start = textareaRef.current?.selectionStart || 0
    const lineStart = content.lastIndexOf('\n', start - 1) + 1
    const newContent = content.substring(0, lineStart) + '1. ' + content.substring(lineStart)
    setContent(newContent)
  }
  const formatCode = () => insertText('`', '`', 'code')
  const formatCodeBlock = () => {
    const start = textareaRef.current?.selectionStart || 0
    const end = textareaRef.current?.selectionEnd || 0
    const selectedText = content.substring(start, end)
    const codeBlock = selectedText 
      ? `\`\`\`\n${selectedText}\n\`\`\``
      : '```\n\n```'
    const newContent = content.substring(0, start) + codeBlock + content.substring(end)
    setContent(newContent)
  }
  const formatLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      const start = textareaRef.current?.selectionStart || 0
      const end = textareaRef.current?.selectionEnd || 0
      const selectedText = content.substring(start, end)
      const linkText = selectedText || 'link text'
      insertText(`[${linkText}](`, ')', url)
    }
  }
  const formatImage = () => {
    const url = prompt('Enter image URL:')
    if (url) {
      const alt = prompt('Enter alt text (optional):') || 'image'
      insertText(`![${alt}](`, ')', url)
    }
  }

  // Markdown to HTML converter
  const markdownToHtml = (text: string): string => {
    if (!text) return ''
    
    let html = text
    
    // Code blocks (must be processed first)
    html = html.replace(/```([\s\S]*?)```/gim, (match, code) => {
      const escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
      return `<pre><code>${escaped}</code></pre>`
    })
    
    // Headers (process before other formatting)
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
    
    // Process lists line by line
    const lines = html.split('\n')
    const processedLines: string[] = []
    let inOrderedList = false
    let inUnorderedList = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const orderedMatch = line.match(/^\d+\.\s+(.*)$/)
      const unorderedMatch = line.match(/^-\s+(.*)$/)
      
      if (orderedMatch) {
        if (!inOrderedList) {
          if (inUnorderedList) {
            processedLines.push('</ul>')
            inUnorderedList = false
          }
          processedLines.push('<ol>')
          inOrderedList = true
        }
        processedLines.push(`<li>${orderedMatch[1]}</li>`)
      } else if (unorderedMatch) {
        if (!inUnorderedList) {
          if (inOrderedList) {
            processedLines.push('</ol>')
            inOrderedList = false
          }
          processedLines.push('<ul>')
          inUnorderedList = true
        }
        processedLines.push(`<li>${unorderedMatch[1]}</li>`)
      } else {
        if (inOrderedList) {
          processedLines.push('</ol>')
          inOrderedList = false
        }
        if (inUnorderedList) {
          processedLines.push('</ul>')
          inUnorderedList = false
        }
        if (line.trim()) {
          processedLines.push(line)
        } else {
          processedLines.push('<br />')
        }
      }
    }
    
    if (inOrderedList) processedLines.push('</ol>')
    if (inUnorderedList) processedLines.push('</ul>')
    
    html = processedLines.join('\n')
    
    // Images (before links)
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;" />')
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Inline code (after code blocks)
    html = html.replace(/`([^`\n]+)`/gim, '<code>$1</code>')
    
    // Bold (after code to avoid conflicts)
    html = html.replace(/\*\*([^*]+)\*\*/gim, '<strong>$1</strong>')
    
    // Italic (after bold)
    html = html.replace(/\*([^*]+)\*/gim, '<em>$1</em>')
    
    // Convert remaining line breaks to paragraphs
    html = html.split('\n').map(line => {
      if (line.trim() && !line.match(/^<(h[1-6]|ul|ol|li|pre|code|img|a)/)) {
        return `<p>${line}</p>`
      }
      return line
    }).join('\n')
    
    return html
  }

  return (
    <>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <SidebarAd position="right" adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      
      <main className="flex-grow py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${theme === 'dark' ? 'from-blue-500 to-indigo-500' : 'from-blue-500 to-indigo-500'} mb-4`}>
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className={`text-xl sm:text-2xl md:text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Note Taker</h1>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Take and organize your notes</p>
          </div>
          
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {writingStreak.current > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-700">
                    {writingStreak.current} day streak
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStats(true)}
                className="p-2.5 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-200 hover:border-gray-300 transition-all active:scale-95"
                title="Statistics"
              >
                <BarChart3 className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2.5 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-200 hover:border-gray-300 transition-all active:scale-95"
                title="Settings"
              >
                <Settings className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2.5 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-200 hover:border-gray-300 transition-all active:scale-95"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="h-5 w-5 text-gray-700" /> : <Sun className="h-5 w-5 text-gray-700" />}
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 mb-4 sm:mb-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    if (e.target.value.trim()) {
                      setSearchHistory(prev => [e.target.value, ...prev.filter(s => s !== e.target.value)].slice(0, 10))
                    }
                    setHighlightSearch(e.target.value.length > 0)
                  }}
                  placeholder="Search notes by title, content, or tags..."
                  className="w-full pl-11 pr-20 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 bg-gray-50/50 transition-all placeholder:text-gray-400"
                />
                {searchQuery && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {searchMatches > 0 && (
                      <span className="text-xs text-gray-500">{searchMatches} matches</span>
                    )}
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setHighlightSearch(false)
                        setSearchMatches(0)
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {savedSearches.length > 0 && (
                  <button
                    onClick={() => setShowSavedSearches(!showSavedSearches)}
                    className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                    title="Saved Searches"
                  >
                    <BookMarked className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* Saved Searches Dropdown */}
              {showSavedSearches && savedSearches.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-2 max-h-48 overflow-y-auto">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <span className="text-xs font-semibold text-gray-700">Saved Searches</span>
                    <button
                      onClick={() => {
                        if (searchQuery.trim()) {
                          const name = prompt('Name for this search:')
                          if (name) saveSearch(name)
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Save Current
                    </button>
                  </div>
                  {savedSearches.map(search => (
                    <button
                      key={search.id}
                      onClick={() => loadSavedSearch(search)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm flex items-center justify-between"
                    >
                      <span className="text-gray-700">{search.name}</span>
                      <X
                        className="h-3 w-3 text-gray-400"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSavedSearches(savedSearches.filter(s => s.id !== search.id))
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Filters Row */}
              <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Color Filter */}
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="all">All Colors</option>
                  {NOTE_COLORS.map(color => (
                    <option key={color.value} value={color.value}>{color.name}</option>
                  ))}
                </select>

                {/* Tag Filter */}
                {allTags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="h-4 w-4 text-gray-500" />
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSelectedTags(prev =>
                            prev.includes(tag)
                              ? prev.filter(t => t !== tag)
                              : [...prev, tag]
                          )
                        }}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Filters */}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => setShowFavorites(!showFavorites)}
                    className={`p-2 rounded-lg transition-all ${
                      showFavorites
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    title="Show Favorites"
                  >
                    <Star className={`h-4 w-4 ${showFavorites ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => setShowPinned(!showPinned)}
                    className={`p-2 rounded-lg transition-all ${
                      showPinned
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    title="Show Pinned"
                  >
                    <Pin className={`h-4 w-4 ${showPinned ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Sort & Date Range */}
              <div className="flex flex-wrap gap-2 items-center text-sm">
                <div className="flex items-center gap-2">
                  <SortAsc className="h-4 w-4 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'modified')}
                    className="px-2 py-1 border border-gray-200 rounded text-gray-900 bg-white"
                  >
                    <option value="modified">Recently Modified</option>
                    <option value="date">Date Created</option>
                    <option value="title">Title</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="px-2 py-1 border border-gray-200 rounded text-gray-900 bg-white text-xs"
                    placeholder="Start date"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="px-2 py-1 border border-gray-200 rounded text-gray-900 bg-white text-xs"
                    placeholder="End date"
                  />
                  {(dateRange.start || dateRange.end) && (
                    <button
                      onClick={() => setDateRange({ start: '', end: '' })}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Active Filters Display */}
              {(selectedTags.length > 0 || selectedCategory !== 'all' || selectedColor !== 'all' || showFavorites || showPinned || searchQuery) && (
                <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-500">Active filters:</span>
                  {searchQuery && (
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                      Search: "{searchQuery}"
                    </span>
                  )}
                  {selectedCategory !== 'all' && (
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-blue-100">
                      <Folder className="h-3.5 w-3.5" />
                      {selectedCategory}
                    </span>
                  )}
                  {selectedTags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-blue-100">
                      <Tag className="h-3.5 w-3.5" />
                      #{tag}
                    </span>
                  ))}
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedTags([])
                      setSelectedCategory('all')
                      setSelectedColor('all')
                      setShowFavorites(false)
                      setShowPinned(false)
                      setDateRange({ start: '', end: '' })
                    }}
                    className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 flex items-center gap-1.5 transition-colors border border-gray-200"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-col lg:flex-row h-[calc(100vh-280px)] sm:h-[600px] min-h-[500px]">
              {/* Sidebar */}
              <div className="w-full lg:w-72 xl:w-80 border-r border-gray-100 flex flex-col bg-gray-50/30">
                <div className="p-4 sm:p-5 border-b border-gray-100 space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => createNewNote()}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="hidden sm:inline">New Note</span>
                      <span className="sm:hidden">New</span>
                    </button>
                    <button
                      onClick={() => setShowTemplateModal(true)}
                      className="bg-white hover:bg-gray-50 text-gray-700 px-3 sm:px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow"
                      title="Templates"
                    >
                      <Layers className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Export/Import Buttons */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="w-full bg-white hover:bg-gray-50 text-gray-700 px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center space-x-1.5 border border-gray-200 hover:border-gray-300 shadow-sm"
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Export</span>
                      </button>
                      {showExportMenu && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowExportMenu(false)}
                          />
                          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                            <div className="p-1">
                              {selectedNote ? (
                                <>
                                  <button
                                    onClick={() => {
                                      exportNote(selectedNote, 'json')
                                      setShowExportMenu(false)
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                                  >
                                    Export as JSON
                                  </button>
                                  <button
                                    onClick={() => {
                                      exportNote(selectedNote, 'txt')
                                      setShowExportMenu(false)
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                                  >
                                    Export as TXT
                                  </button>
                                  <button
                                    onClick={() => {
                                      exportNote(selectedNote, 'md')
                                      setShowExportMenu(false)
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                                  >
                                    Export as Markdown
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      exportAllNotes('json')
                                      setShowExportMenu(false)
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                                  >
                                    Export All as JSON
                                  </button>
                                  <button
                                    onClick={() => {
                                      exportAllNotes('txt')
                                      setShowExportMenu(false)
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                                  >
                                    Export All as TXT
                                  </button>
                                  <button
                                    onClick={() => {
                                      exportAllNotes('md')
                                      setShowExportMenu(false)
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                                  >
                                    Export All as Markdown
                                  </button>
                                  <div className="border-t border-gray-200 my-1"></div>
                                  <div className="px-3 py-2 text-xs text-gray-500">
                                    Exporting {filteredAndSortedNotes.length} filtered notes
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <label className="flex-1 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center space-x-1.5 cursor-pointer border border-gray-200 hover:border-gray-300 shadow-sm">
                      <Upload className="h-4 w-4" />
                      <span className="hidden sm:inline">Import</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={importNotes}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <div className="text-xs text-gray-500 text-center font-medium mb-2">
                    <span className="text-gray-700 font-semibold">{filteredAndSortedNotes.length}</span> of <span className="text-gray-700 font-semibold">{notes.length}</span> notes
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex flex-col gap-2 px-4 pb-2">
                    <button
                      onClick={() => setShowFolderModal(true)}
                      className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-all border border-gray-200"
                    >
                      <FolderPlus className="h-4 w-4" />
                      <span>New Folder</span>
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowArchive(!showArchive)
                          setShowTrash(false)
                        }}
                        className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                          showArchive
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        <Archive className="h-4 w-4" />
                        <span className="hidden sm:inline">Archive</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowTrash(!showTrash)
                          setShowArchive(false)
                        }}
                        className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                          showTrash
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Trash</span>
                      </button>
                    </div>
                  </div>
                </div>
                {/* Folder Selector */}
                {folders.length > 0 && (
                  <div className="px-4 py-2 border-b border-gray-100">
                    <select
                      value={selectedFolder}
                      onChange={(e) => setSelectedFolder(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white"
                    >
                      <option value="all">All Folders</option>
                      <option value="none">No Folder</option>
                      {folders.map(folder => (
                        <option key={folder.id} value={folder.id}>{folder.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {filteredAndSortedNotes.length === 0 ? (
                    <div className="p-6 sm:p-8 text-center">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 font-medium">{notes.length === 0 ? 'No notes yet. Create one!' : 'No notes match your filters'}</p>
                    </div>
                  ) : (
                    <div className="p-2 sm:p-3 space-y-2">
                      {filteredAndSortedNotes.map(note => (
                        <div
                          key={note.id}
                          onClick={() => selectNote(note)}
                          className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all border ${
                            selectedNote?.id === note.id
                              ? 'border-blue-500 shadow-md shadow-blue-500/10 bg-blue-50/50'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                          }`}
                          style={{
                            backgroundColor: note.color?.includes('blue') ? '#dbeafe' :
                                          note.color?.includes('green') ? '#dcfce7' :
                                          note.color?.includes('yellow') ? '#fef9c3' :
                                          note.color?.includes('red') ? '#fee2e2' :
                                          note.color?.includes('purple') ? '#f3e8ff' :
                                          note.color?.includes('pink') ? '#fce7f3' :
                                          note.color?.includes('orange') ? '#fed7aa' :
                                          '#ffffff',
                            borderColor: note.color?.includes('blue') ? '#bfdbfe' :
                                        note.color?.includes('green') ? '#bbf7d0' :
                                        note.color?.includes('yellow') ? '#fde047' :
                                        note.color?.includes('red') ? '#fecaca' :
                                        note.color?.includes('purple') ? '#e9d5ff' :
                                        note.color?.includes('pink') ? '#fbcfe8' :
                                        note.color?.includes('orange') ? '#fdba74' :
                                        '#e5e7eb'
                          }}
                        >
                          <div className="flex items-start justify-between mb-2.5">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              {note.isPinned && (
                                <Pin className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" fill="currentColor" />
                              )}
                              <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{note.title}</h3>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFavorite(note.id)
                                }}
                                className={`p-1.5 rounded-lg transition-all ${
                                  note.isFavorite
                                    ? 'text-yellow-500 hover:bg-yellow-50'
                                    : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100'
                                }`}
                              >
                                <Star className={`h-4 w-4 ${note.isFavorite ? 'fill-current' : ''}`} />
                              </button>
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (note.isTrashed) {
                                    if (confirm('Permanently delete this note?')) {
                                      permanentlyDeleteNote(note.id)
                                    }
                                  } else if (note.isArchived) {
                                    unarchiveNote(note.id)
                                  } else {
                                    trashNote(note.id)
                                  }
                                }}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                                title={note.isTrashed ? 'Delete Permanently' : note.isArchived ? 'Unarchive' : 'Move to Trash'}
                              >
                                {note.isTrashed ? <Trash2 className="h-4 w-4" /> : note.isArchived ? <Archive className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                              </button>
                            </div>
                            </div>
                          </div>
                          
                          {note.category && (
                            <div className="flex items-center gap-1.5 mb-2">
                              <Folder className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-xs font-medium text-gray-600">{note.category}</span>
                            </div>
                          )}
                          
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap mb-2">
                              {note.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                                  #{tag}
                                </span>
                              ))}
                              {note.tags.length > 3 && (
                                <span className="text-xs text-gray-400 font-medium">+{note.tags.length - 3}</span>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 font-medium">
                              {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                            </p>
                            {note.isArchived && (
                              <Archive className="h-3 w-3 text-gray-400" aria-label="Archived" role="img" />
                            )}
                            {note.isTrashed && (
                              <Trash2 className="h-3 w-3 text-red-400" aria-label="Trashed" role="img" />
                            )}
                            {note.linkedNotes && note.linkedNotes.length > 0 && (
                              <Link2 className="h-3 w-3 text-blue-400" aria-label={`Linked to ${note.linkedNotes.length} note(s)`} role="img" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 flex flex-col bg-white">
                {selectedNote ? (
                  <>
                    <div className="p-4 sm:p-5 sm:p-6 border-b border-gray-100 space-y-4 bg-gray-50/30">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Note title..."
                          className="flex-1 text-xl sm:text-2xl font-bold text-gray-900 border-none outline-none bg-transparent placeholder:text-gray-400"
                        />
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => togglePin(selectedNote.id)}
                            className={`p-2.5 rounded-xl transition-all ${
                              selectedNote.isPinned
                                ? 'bg-blue-100 text-blue-600 shadow-sm'
                                : 'bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-600 border border-gray-200'
                            }`}
                            title={selectedNote.isPinned ? 'Unpin' : 'Pin'}
                          >
                            <Pin className={`h-4 w-4 ${selectedNote.isPinned ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={() => toggleFavorite(selectedNote.id)}
                            className={`p-2.5 rounded-xl transition-all ${
                              selectedNote.isFavorite
                                ? 'bg-yellow-100 text-yellow-600 shadow-sm'
                                : 'bg-white text-gray-400 hover:bg-gray-100 hover:text-yellow-500 border border-gray-200'
                            }`}
                            title={selectedNote.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Star className={`h-4 w-4 ${selectedNote.isFavorite ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag className="h-4 w-4 text-gray-400" />
                        {selectedNote.tags?.map(tag => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-blue-100"
                          >
                            #{tag}
                            <button
                              onClick={() => removeTag(selectedNote.id, tag)}
                              className="hover:text-blue-900 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                        {showTagInput ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  addTag(selectedNote.id, newTag)
                                }
                              }}
                              placeholder="Tag name"
                              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                if (newTag.trim()) addTag(selectedNote.id, newTag)
                                else setShowTagInput(false)
                              }}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => {
                                setShowTagInput(false)
                                setNewTag('')
                              }}
                              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowTagInput(true)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
                          >
                            + Add Tag
                          </button>
                        )}
                      </div>

                      {/* Word Count Goal */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            if (selectedNote) {
                              const goal = prompt('Set word count goal:', selectedNote.wordCountGoal?.toString() || '500')
                              if (goal) {
                                const updatedNotes = notes.map(note =>
                                  note.id === selectedNote.id
                                    ? { ...note, wordCountGoal: Number(goal) }
                                    : note
                                )
                                setNotes(updatedNotes)
                                setSelectedNote({ ...selectedNote, wordCountGoal: Number(goal) })
                                toast.success('Word count goal set')
                              }
                            }
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center gap-1.5"
                        >
                          <Target className="h-3.5 w-3.5" />
                          <span>Set Word Goal</span>
                        </button>
                        {selectedNote.wordCountGoal && (
                          <span className="text-xs text-gray-500">
                            Goal: {selectedNote.wordCountGoal} words
                          </span>
                        )}
                      </div>

                      {/* Category & Color */}
                      <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <Folder className="h-4 w-4 text-gray-400" />
                          <select
                            value={selectedNote.category || 'Personal'}
                            onChange={(e) => updateNoteCategory(selectedNote.id, e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-medium text-gray-500">Color:</span>
                          <div className="flex items-center gap-1.5">
                            {NOTE_COLORS.map(color => {
                              const bgColor = color.value.includes('blue') ? 'bg-blue-200' :
                                            color.value.includes('green') ? 'bg-green-200' :
                                            color.value.includes('yellow') ? 'bg-yellow-200' :
                                            color.value.includes('red') ? 'bg-red-200' :
                                            color.value.includes('purple') ? 'bg-purple-200' :
                                            color.value.includes('pink') ? 'bg-pink-200' :
                                            color.value.includes('orange') ? 'bg-orange-200' :
                                            'bg-white'
                              return (
                                <button
                                  key={color.value}
                                  onClick={() => updateNoteColor(selectedNote.id, color.value)}
                                  className={`w-7 h-7 rounded-full border-2 transition-all ${bgColor} ${
                                    selectedNote.color === color.value
                                      ? 'border-gray-800 scale-110 ring-2 ring-gray-400 ring-offset-1'
                                      : 'border-gray-300 hover:border-gray-500 hover:scale-105'
                                  }`}
                                  title={color.name}
                                />
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Toolbar */}
                    <div className="border-b border-gray-100 bg-white p-3 flex flex-wrap items-center gap-1.5 sm:gap-2 overflow-x-auto">
                      <div className="flex items-center gap-1 border-r border-gray-200 pr-2.5 mr-2.5">
                        <button
                          onClick={formatBold}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                          title="Bold (Ctrl+B)"
                        >
                          <Bold className="h-4 w-4 text-gray-700" />
                        </button>
                        <button
                          onClick={formatItalic}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                          title="Italic (Ctrl+I)"
                        >
                          <Italic className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1 border-r border-gray-200 pr-2.5 mr-2.5">
                        <button
                          onClick={formatHeading1}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                          title="Heading 1"
                        >
                          <Heading1 className="h-4 w-4 text-gray-700" />
                        </button>
                        <button
                          onClick={formatHeading2}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                          title="Heading 2"
                        >
                          <Heading2 className="h-4 w-4 text-gray-700" />
                        </button>
                        <button
                          onClick={formatHeading3}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                          title="Heading 3"
                        >
                          <Heading3 className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1 border-r border-gray-200 pr-2.5 mr-2.5">
                        <button
                          onClick={formatList}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                          title="Unordered List"
                        >
                          <List className="h-4 w-4 text-gray-700" />
                        </button>
                        <button
                          onClick={formatOrderedList}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                          title="Ordered List"
                        >
                          <ListOrdered className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1 border-r border-gray-200 pr-2.5 mr-2.5">
                        <button
                          onClick={formatCode}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                          title="Inline Code"
                        >
                          <Code className="h-4 w-4 text-gray-700" />
                        </button>
                        <button
                          onClick={formatCodeBlock}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                          title="Code Block"
                        >
                          <Code className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1 border-r border-gray-200 pr-2.5 mr-2.5">
                        <button
                          onClick={formatLink}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                          title="Insert Link"
                        >
                          <Link className="h-4 w-4 text-gray-700" />
                        </button>
                        <button
                          onClick={formatImage}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                          title="Insert Image"
                        >
                          <Image className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1 border-r border-gray-200 pr-2.5 mr-2.5">
                        <button
                          onClick={undo}
                          disabled={historyIndex <= 0}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                          title="Undo (Ctrl+Z)"
                        >
                          <Undo2 className="h-4 w-4 text-gray-700" />
                        </button>
                        <button
                          onClick={redo}
                          disabled={historyIndex >= history.length - 1}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                          title="Redo (Ctrl+Shift+Z)"
                        >
                          <Redo2 className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1 border-r border-gray-200 pr-2.5 mr-2.5">
                        <button
                          onClick={() => setShowFindReplace(true)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                          title="Find & Replace (Ctrl+F)"
                        >
                          <FindIcon className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {selectedNote?.isLocked ? (
                          <button
                            onClick={() => {
                              if (lockedNotes.has(selectedNote.id)) {
                                setShowLockModal(true)
                                setUnlockPassword('')
                              } else {
                                unlockNote(selectedNote.id, '')
                              }
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                            title="Unlock Note"
                          >
                            <Unlock className="h-4 w-4 text-gray-700" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowLockModal(true)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                            title="Lock Note"
                          >
                            <Lock className="h-4 w-4 text-gray-700" />
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 border-r border-gray-200 pr-2.5 mr-2.5">
                        <button
                          onClick={() => setShowTableModal(true)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                          title="Insert Table"
                        >
                          <Table className="h-4 w-4 text-gray-700" />
                        </button>
                        <button
                          onClick={() => setShowMathModal(true)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                          title="Insert Math Equation"
                        >
                          <Calculator className="h-4 w-4 text-gray-700" />
                        </button>
                        <button
                          onClick={() => setShowAttachmentModal(true)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                          title="Attach File"
                        >
                          <File className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1 border-r border-gray-200 pr-2.5 mr-2.5">
                        <button
                          onClick={toggleFocusMode}
                          className={`p-2 rounded-lg transition-colors active:scale-95 ${
                            focusMode
                              ? 'bg-blue-100 text-blue-700'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                          title="Focus Mode"
                        >
                          <ZapIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (writingTimerActive) stopWritingTimer()
                            else startWritingTimer()
                          }}
                          className={`p-2 rounded-lg transition-colors active:scale-95 ${
                            writingTimerActive
                              ? 'bg-green-100 text-green-700'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                          title="Writing Timer"
                        >
                          <Timer className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-auto">
                        <button
                          onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : viewMode === 'preview' ? 'split' : 'edit')}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                          title={`View: ${viewMode === 'edit' ? 'Edit' : viewMode === 'preview' ? 'Preview' : 'Split'}`}
                        >
                          {viewMode === 'edit' ? (
                            <Eye className="h-4 w-4 text-gray-700" />
                          ) : viewMode === 'preview' ? (
                            <EyeOff className="h-4 w-4 text-gray-700" />
                          ) : (
                            <Maximize2 className="h-4 w-4 text-gray-700" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Editor/Preview Area */}
                    <div className="flex-1 flex overflow-hidden">
                      {(viewMode === 'edit' || viewMode === 'split') && (
                        <div className={`flex-1 ${viewMode === 'split' ? 'border-r border-gray-200' : ''}`}>
                      <textarea
                            ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                            placeholder="Start writing your note... Use Markdown syntax or the toolbar above."
                            className="w-full h-full p-4 sm:p-6 resize-none border-none outline-none text-gray-900 font-mono text-sm sm:text-base bg-white custom-scrollbar leading-relaxed"
                            style={{ fontFamily: fontFamily, fontSize: `${fontSize}px` }}
                          />
                        </div>
                      )}
                      
                      {(viewMode === 'preview' || viewMode === 'split') && (
                        <div className={`flex-1 overflow-y-auto ${viewMode === 'split' ? 'bg-gray-50' : ''}`}>
                          <div 
                            className="p-4"
                            dangerouslySetInnerHTML={{ 
                              __html: `<style>
                                .markdown-preview code {
                                  background-color: #f3f4f6;
                                  padding: 2px 6px;
                                  border-radius: 4px;
                                  font-family: 'Courier New', monospace;
                                  font-size: 0.9em;
                                  color: #e11d48;
                                }
                                .markdown-preview pre {
                                  background-color: #1f2937;
                                  color: #f9fafb;
                                  padding: 16px;
                                  border-radius: 8px;
                                  overflow-x: auto;
                                  margin: 16px 0;
                                }
                                .markdown-preview pre code {
                                  background-color: transparent;
                                  color: #f9fafb;
                                  padding: 0;
                                }
                                .markdown-preview h1 {
                                  font-size: 2em;
                                  font-weight: bold;
                                  margin: 16px 0 8px 0;
                                  color: #111827;
                                }
                                .markdown-preview h2 {
                                  font-size: 1.5em;
                                  font-weight: bold;
                                  margin: 14px 0 6px 0;
                                  color: #111827;
                                }
                                .markdown-preview h3 {
                                  font-size: 1.25em;
                                  font-weight: bold;
                                  margin: 12px 0 4px 0;
                                  color: #111827;
                                }
                                .markdown-preview ul, .markdown-preview ol {
                                  margin: 8px 0;
                                  padding-left: 24px;
                                }
                                .markdown-preview li {
                                  margin: 4px 0;
                                }
                                .markdown-preview a {
                                  color: #2563eb;
                                  text-decoration: underline;
                                }
                                .markdown-preview a:hover {
                                  color: #1d4ed8;
                                }
                                .markdown-preview img {
                                  max-width: 100%;
                                  height: auto;
                                  border-radius: 8px;
                                  margin: 10px 0;
                                }
                                .markdown-preview p {
                                  margin: 8px 0;
                                  line-height: 1.6;
                                }
                              </style>
                              <div class="markdown-preview">${content ? markdownToHtml(content) : '<p style="color: #9ca3af;">Start typing to see preview...</p>'}</div>`
                            }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-gray-500">
                          {content.length} characters • {content.split(/\s+/).filter(w => w.length > 0).length} words
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const link = generateShareLink(selectedNote.id)
                              setShowShareModal(true)
                            }}
                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                            title="Share Note"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowComments(!showComments)}
                            className={`p-2 rounded-lg transition-all ${
                              showComments
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            title="Comments"
                          >
                            <MessageSquare className="h-4 w-4" />
                            {selectedNote.comments && selectedNote.comments.length > 0 && (
                              <span className="ml-1 text-xs">{selectedNote.comments.length}</span>
                            )}
                          </button>
                          <button
                            onClick={() => setShowVersionHistory(!showVersionHistory)}
                            className={`p-2 rounded-lg transition-all ${
                              showVersionHistory
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            title="Version History"
                          >
                            <History className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowPermissions(!showPermissions)}
                            className={`p-2 rounded-lg transition-all ${
                              showPermissions
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            title="Permissions"
                          >
                            <Users className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowExportOptions(true)}
                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                            title="Export Options"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (selectedNote.isArchived) {
                                unarchiveNote(selectedNote.id)
                              } else {
                                archiveNote(selectedNote.id)
                              }
                            }}
                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                            title={selectedNote.isArchived ? 'Unarchive' : 'Archive'}
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowLinkModal(true)}
                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                            title="Link Notes"
                          >
                            <Link2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              checkGrammar()
                              calculateReadability()
                              analyzeSentiment()
                            }}
                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                            title="Analyze Note"
                          >
                            <Brain className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowGoalsModal(true)}
                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                            title="Writing Goals"
                          >
                            <Target className="h-4 w-4" />
                          </button>
                          {selectedNote && !selectedNote.isTrashed && (
                            <button
                              onClick={() => {
                                if (selectedNote.isArchived) {
                                  unarchiveNote(selectedNote.id)
                                } else {
                                  archiveNote(selectedNote.id)
                                }
                              }}
                              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                              title={selectedNote.isArchived ? 'Unarchive' : 'Archive'}
                            >
                              <Archive className="h-4 w-4" />
                            </button>
                          )}
                          {selectedNote && selectedNote.isTrashed && (
                            <button
                              onClick={() => restoreNote(selectedNote.id)}
                              className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-all"
                              title="Restore"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setShowAnalytics(true)}
                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                            title="Analytics"
                          >
                            <BarChart className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowAchievements(true)}
                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all relative"
                            title="Achievements"
                          >
                            <Trophy className="h-4 w-4" />
                            {achievements.filter(a => a.unlockedAt).length > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {achievements.filter(a => a.unlockedAt).length}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Writing Timer & Goals Display */}
                      {(writingTimerActive || writingTimer > 0) && (
                        <div className="px-4 py-2 bg-green-50 border-b border-green-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Timer className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">
                              Writing Time: {Math.floor(writingTimer / 60)}:{(writingTimer % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              stopWritingTimer()
                              setWritingTimer(0)
                            }}
                            className="text-xs text-green-600 hover:text-green-700"
                          >
                            Reset
                          </button>
                        </div>
                      )}
                      
                      {/* Word Count Goal Progress */}
                      {selectedNote.wordCountGoal && selectedNote.wordCount && (
                        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-blue-700">Word Count Goal</span>
                            <span className="text-xs font-medium text-blue-700">
                              {selectedNote.wordCount} / {selectedNote.wordCountGoal}
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(100, (selectedNote.wordCount / selectedNote.wordCountGoal) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <button
                        onClick={saveNote}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
                      >
                        <Save className="h-5 w-5" />
                        <span>Save</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {showComments && selectedNote && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50 max-h-64 overflow-y-auto">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Comments ({selectedNote.comments?.length || 0})
                          </h4>
                          <button
                            onClick={() => setShowComments(false)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="space-y-3 mb-3">
                          {selectedNote.comments && selectedNote.comments.length > 0 ? (
                            selectedNote.comments.map(comment => (
                              <div key={comment.id} className="bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-semibold text-gray-900">{comment.author}</span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(comment.createdAt).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700">{comment.text}</p>
                                  </div>
                                  <button
                                    onClick={() => deleteComment(selectedNote.id, comment.id)}
                                    className="p-1 text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={commentAuthor}
                            onChange={(e) => setCommentAuthor(e.target.value)}
                            placeholder="Your name"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                          />
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && newComment.trim()) {
                                addComment(selectedNote.id)
                              }
                            }}
                            placeholder="Add a comment..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                          />
                          <button
                            onClick={() => addComment(selectedNote.id)}
                            disabled={!newComment.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Version History Section */}
                    {showVersionHistory && selectedNote && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50 max-h-64 overflow-y-auto">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Version History ({selectedNote.versions?.length || 0})
                          </h4>
                          <button
                            onClick={() => setShowVersionHistory(false)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {selectedNote.versions && selectedNote.versions.length > 0 ? (
                            selectedNote.versions.map((version, index) => (
                              <div key={version.id} className="bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-semibold text-gray-900">
                                        Version {selectedNote.versions!.length - index}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(version.createdAt).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600 truncate">{version.title}</p>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{version.content.substring(0, 100)}...</p>
                                  </div>
                                  <button
                                    onClick={() => restoreVersion(selectedNote.id, version)}
                                    className="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                                  >
                                    Restore
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-4">No version history</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Permissions Section */}
                    {showPermissions && selectedNote && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50 max-h-64 overflow-y-auto">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Shared With ({selectedNote.sharedWith?.length || 0})
                          </h4>
                          <button
                            onClick={() => setShowPermissions(false)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="space-y-2 mb-3">
                          {selectedNote.sharedWith && selectedNote.sharedWith.length > 0 ? (
                            selectedNote.sharedWith.map(email => (
                              <div key={email} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                                <div className="flex-1">
                                  <span className="text-sm font-medium text-gray-900">{email}</span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <select
                                      value={selectedNote.permissions?.[email] || 'read'}
                                      onChange={(e) => updatePermission(selectedNote.id, email, e.target.value as 'read' | 'edit')}
                                      className="text-xs px-2 py-1 border border-gray-300 rounded text-gray-900 bg-white"
                                    >
                                      <option value="read">Read Only</option>
                                      <option value="edit">Can Edit</option>
                                    </select>
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeShare(selectedNote.id, email)}
                                  className="ml-2 p-1 text-red-500 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-4">Not shared with anyone</p>
                          )}
                        </div>
                      </div>
                    )}
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

      {/* Share Modal */}
      {showShareModal && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Share Note</h3>
              <button
                onClick={() => {
                  setShowShareModal(false)
                  setSharedLink('')
                }}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Share Link */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Shareable Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sharedLink || generateShareLink(selectedNote.id)}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-gray-50"
                  />
                  <button
                    onClick={() => copyShareLink(sharedLink || generateShareLink(selectedNote.id))}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                  >
                    {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {linkCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Share with Email */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">Share with Email</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                    />
                    <select
                      value={sharePermission}
                      onChange={(e) => setSharePermission(e.target.value as 'read' | 'edit')}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
                    >
                      <option value="read">Read Only</option>
                      <option value="edit">Can Edit</option>
                    </select>
                  </div>
                  <button
                    onClick={() => shareNote(selectedNote.id, shareEmail, sharePermission)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Share
                  </button>
                </div>
              </div>

              {/* Shared With List */}
              {selectedNote.sharedWith && selectedNote.sharedWith.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Currently Shared With</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedNote.sharedWith.map(email => (
                      <div key={email} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <span className="text-sm text-gray-900">{email}</span>
                          <span className="ml-2 text-xs text-gray-500">
                            ({selectedNote.permissions?.[email] || 'read'})
                          </span>
                        </div>
                        <button
                          onClick={() => removeShare(selectedNote.id, email)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Statistics & Insights
              </h3>
              <button onClick={() => setShowStats(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {(() => {
                const stats = getNoteStats()
                const readingTime = calculateReadingTime(selectedNote?.content || '')
                return (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalNotes}</div>
                        <div className="text-sm text-gray-600">Total Notes</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats.totalWords.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Total Words</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{stats.averageWordsPerNote}</div>
                        <div className="text-sm text-gray-600">Avg Words/Note</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{writingStreak.current}</div>
                        <div className="text-sm text-gray-600">Day Streak 🔥</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">Today</div>
                        <div className="text-2xl font-bold text-gray-700">{stats.notesCreatedToday}</div>
                        <div className="text-sm text-gray-600">Notes Created</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">This Week</div>
                        <div className="text-2xl font-bold text-gray-700">{stats.notesCreatedThisWeek}</div>
                        <div className="text-sm text-gray-600">Notes Created</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">This Month</div>
                        <div className="text-2xl font-bold text-gray-700">{stats.notesCreatedThisMonth}</div>
                        <div className="text-sm text-gray-600">Notes Created</div>
                      </div>
                    </div>
                    {stats.mostEditedNote && (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900 mb-2">Most Edited Note</div>
                        <div className="font-medium">{stats.mostEditedNote.title}</div>
                        <div className="text-sm text-gray-600">{stats.mostEditedNote.editCount || 0} edits</div>
                      </div>
                    )}
                    {selectedNote && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900 mb-2">Current Note</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-600">Words</div>
                            <div className="text-xl font-bold">{selectedNote.wordCount || 0}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Characters</div>
                            <div className="text-xl font-bold">{selectedNote.characterCount || 0}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Reading Time</div>
                            <div className="text-xl font-bold">{readingTime} min</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Edits</div>
                            <div className="text-xl font-bold">{selectedNote.editCount || 0}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900 mb-2">Recent Activity</div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {activityLogs.slice(0, 10).map(log => (
                          <div key={log.id} className="text-sm text-gray-600 flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            <span>{log.action}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Settings
              </h3>
              <button onClick={() => setShowSettings(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Theme</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-4 py-2 rounded-lg ${theme === 'light' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Dark
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Font Size: {fontSize}px</label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="monospace">Monospace</option>
                  <option value="sans-serif">Sans Serif</option>
                  <option value="serif">Serif</option>
                </select>
              </div>
              <div>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-gray-900">Auto-save</span>
                  <input
                    type="checkbox"
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Find & Replace Modal */}
      {showFindReplace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FindIcon className="h-5 w-5" />
                Find & Replace
              </h3>
              <button onClick={() => setShowFindReplace(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Find</label>
                <input
                  type="text"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter text to find..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Replace</label>
                <input
                  type="text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter replacement text..."
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={findCaseSensitive}
                    onChange={(e) => setFindCaseSensitive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Case sensitive</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => findAndReplace(findText, replaceText, findCaseSensitive)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Replace
                </button>
                <button
                  onClick={() => replaceAll(findText, replaceText, findCaseSensitive)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Replace All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lock/Unlock Modal */}
      {showLockModal && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {lockedNotes.has(selectedNote.id) ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                {lockedNotes.has(selectedNote.id) ? 'Unlock Note' : 'Lock Note'}
              </h3>
              <button
                onClick={() => {
                  setShowLockModal(false)
                  setLockPassword('')
                  setUnlockPassword('')
                }}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              {lockedNotes.has(selectedNote.id) ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Password</label>
                    <input
                      type="password"
                      value={unlockPassword}
                      onChange={(e) => setUnlockPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter password to unlock"
                    />
                  </div>
                  <button
                    onClick={() => unlockNote(selectedNote.id, unlockPassword)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Unlock
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Set Password</label>
                    <input
                      type="password"
                      value={lockPassword}
                      onChange={(e) => setLockPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter password"
                    />
                  </div>
                  <button
                    onClick={() => lockNote(selectedNote.id, lockPassword)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Lock Note
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Command Palette */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
              <Command className="h-5 w-5 text-gray-500" />
              <input
                type="text"
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 border-none outline-none text-gray-900"
                autoFocus
              />
              <button onClick={() => setShowCommandPalette(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-2 max-h-96 overflow-y-auto">
              <div className="space-y-1">
                <button
                  onClick={() => {
                    createNewNote()
                    setShowCommandPalette(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Note</span>
                </button>
                <button
                  onClick={() => {
                    setShowTemplateModal(true)
                    setShowCommandPalette(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                >
                  <Layers className="h-4 w-4" />
                  <span>Templates</span>
                </button>
                <button
                  onClick={() => {
                    setShowStats(true)
                    setShowCommandPalette(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Statistics</span>
                </button>
                <button
                  onClick={() => {
                    setShowSettings(true)
                    setShowCommandPalette(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal - Simplified version */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Layers className="h-6 w-6" />
                Templates
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCustomTemplateModal(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
                >
                  Create Custom
                </button>
                <button onClick={() => setShowTemplateModal(false)} className="p-1 text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...DEFAULT_TEMPLATES, ...customTemplates].map(template => (
                <button
                  key={template.id}
                  onClick={() => createNoteFromTemplate(template)}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all text-left"
                >
                  <div className="font-semibold text-gray-900 mb-1">{template.name}</div>
                  <div className="text-sm text-gray-600">{template.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FolderPlus className="h-5 w-5" />
                Create Folder
              </h3>
              <button onClick={() => setShowFolderModal(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') createFolder()
                }}
              />
              <button
                onClick={createFolder}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Table className="h-5 w-5" />
                Insert Table
              </h3>
              <button onClick={() => setShowTableModal(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Rows</label>
                  <input
                    type="number"
                    value={tableRows}
                    onChange={(e) => setTableRows(Number(e.target.value))}
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Columns</label>
                  <input
                    type="number"
                    value={tableCols}
                    onChange={(e) => setTableCols(Number(e.target.value))}
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <button
                onClick={() => insertTable(tableRows, tableCols)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Insert Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Math Equation Modal */}
      {showMathModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Insert Math Equation
              </h3>
              <button onClick={() => setShowMathModal(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={mathEquation}
                onChange={(e) => setMathEquation(e.target.value)}
                placeholder="e.g., E = mc^2 or \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
              />
              <button
                onClick={() => insertMathEquation(mathEquation)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Insert Equation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Modal */}
      {showAttachmentModal && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <File className="h-5 w-5" />
                Attach File
              </h3>
              <button onClick={() => setShowAttachmentModal(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) attachFile(file)
                    }}
                    className="hidden"
                  />
                </div>
              </label>
              {selectedNote.attachments && selectedNote.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Attachments</h4>
                  {selectedNote.attachments.map(att => (
                    <div key={att.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{att.name}</span>
                      <span className="text-xs text-gray-500">{(att.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Link Notes Modal */}
      {showLinkModal && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Link Notes
              </h3>
              <button onClick={() => setShowLinkModal(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Select notes to link with "{selectedNote.title}"</p>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {notes.filter(n => n.id !== selectedNote.id).map(note => (
                  <button
                    key={note.id}
                    onClick={() => {
                      linkNotes(selectedNote.id, note.id)
                      setShowLinkModal(false)
                    }}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-gray-900">{note.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{note.content.substring(0, 50)}...</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Merge Notes Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Merge className="h-5 w-5" />
                Merge Notes
              </h3>
              <button onClick={() => setShowMergeModal(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Select notes to merge (at least 2)</p>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {notes.map(note => (
                  <label key={note.id} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notesToMerge.includes(note.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNotesToMerge([...notesToMerge, note.id])
                        } else {
                          setNotesToMerge(notesToMerge.filter(id => id !== note.id))
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{note.title}</div>
                      <div className="text-xs text-gray-500">{note.content.substring(0, 50)}...</div>
                    </div>
                  </label>
                ))}
              </div>
              <button
                onClick={() => mergeNotes(notesToMerge)}
                disabled={notesToMerge.length < 2}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Merge {notesToMerge.length} Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Writing Goals Modal */}
      {showGoalsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Writing Goals
              </h3>
              <button onClick={() => setShowGoalsModal(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Daily Goal (words)</label>
                <input
                  type="number"
                  value={writingGoals.daily}
                  onChange={(e) => updateWritingGoals('daily', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <div className="mt-1 text-xs text-gray-500">Current: {writingGoals.currentDaily} words</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Weekly Goal (words)</label>
                <input
                  type="number"
                  value={writingGoals.weekly}
                  onChange={(e) => updateWritingGoals('weekly', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <div className="mt-1 text-xs text-gray-500">Current: {writingGoals.currentWeekly} words</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Monthly Goal (words)</label>
                <input
                  type="number"
                  value={writingGoals.monthly}
                  onChange={(e) => updateWritingGoals('monthly', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <div className="mt-1 text-xs text-gray-500">Current: {writingGoals.currentMonthly} words</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart className="h-6 w-6" />
                Analytics & Insights
              </h3>
              <button onClick={() => setShowAnalytics(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{getNoteStats().totalNotes}</div>
                  <div className="text-sm text-gray-600">Total Notes</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{getNoteStats().totalWords.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Words</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{mostProductiveTime || 'N/A'}</div>
                  <div className="text-sm text-gray-600">Most Productive Time</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{writingStreak.current}</div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Topic Analysis</h4>
                <button
                  onClick={() => {
                    analyzeTopics()
                    analyzeProductiveTime()
                  }}
                  className="mb-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Analyze Topics
                </button>
                {topicAnalysis.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {topicAnalysis.slice(0, 12).map((topic, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900">{topic.word}</div>
                        <div className="text-xs text-gray-500">{topic.count} occurrences</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Modal */}
      {showAchievements && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="h-6 w-6" />
                Achievements
              </h3>
              <button onClick={() => setShowAchievements(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'words-10k', name: 'Word Master', desc: 'Written 10,000 words', icon: '📝' },
                  { id: 'notes-100', name: 'Note Collector', desc: 'Created 100 notes', icon: '📚' },
                  { id: 'streak-7', name: 'Week Warrior', desc: '7 day writing streak', icon: '🔥' },
                  { id: 'words-50k', name: 'Writing Pro', desc: 'Written 50,000 words', icon: '✍️' },
                ].map(ach => {
                  const unlocked = achievements.find(a => a.id === ach.id)?.unlockedAt
                  return (
                    <div
                      key={ach.id}
                      className={`p-4 rounded-lg border-2 ${
                        unlocked
                          ? 'bg-yellow-50 border-yellow-300'
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{ach.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{ach.name}</div>
                          <div className="text-sm text-gray-600">{ach.desc}</div>
                          {unlocked && (
                            <div className="text-xs text-yellow-600 mt-1">
                              Unlocked: {new Date(unlocked).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        {unlocked && <CheckCircle2 className="h-5 w-5 text-yellow-600" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grammar Check Modal */}
      {showGrammarCheck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Grammar & Analysis
              </h3>
              <button onClick={() => setShowGrammarCheck(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {readabilityScore > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="font-semibold text-gray-900 mb-2">Readability Score</div>
                  <div className="text-3xl font-bold text-blue-600">{readabilityScore.toFixed(1)}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {readabilityScore >= 70 ? 'Easy to read' : readabilityScore >= 50 ? 'Moderate' : 'Difficult'}
                  </div>
                </div>
              )}
              {selectedNote?.sentiment && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="font-semibold text-gray-900 mb-2">Sentiment</div>
                  <div className="flex items-center gap-2">
                    {selectedNote.sentiment === 'positive' && <Smile className="h-6 w-6 text-green-600" />}
                    {selectedNote.sentiment === 'negative' && <Frown className="h-6 w-6 text-red-600" />}
                    {selectedNote.sentiment === 'neutral' && <Meh className="h-6 w-6 text-gray-600" />}
                    <span className="text-lg font-medium capitalize">{selectedNote.sentiment}</span>
                  </div>
                </div>
              )}
              {grammarIssues.length > 0 && (
                <div>
                  <div className="font-semibold text-gray-900 mb-2">Grammar Issues ({grammarIssues.length})</div>
                  <div className="space-y-2">
                    {grammarIssues.map((issue, idx) => (
                      <div key={idx} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="font-medium text-yellow-900">{issue.type}</div>
                        <div className="text-sm text-yellow-700">{issue.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Options Modal */}
      {showExportOptions && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Export Options</h3>
              <button onClick={() => setShowExportOptions(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  exportToPDF(selectedNote)
                  setShowExportOptions(false)
                }}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-3"
              >
                <FileText className="h-5 w-5 text-red-600" />
                <span>Export as PDF</span>
              </button>
              <button
                onClick={() => {
                  emailNote(selectedNote)
                  setShowExportOptions(false)
                }}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-3"
              >
                <Mail className="h-5 w-5 text-blue-600" />
                <span>Email Note</span>
              </button>
              <button
                onClick={() => {
                  window.print()
                  setShowExportOptions(false)
                }}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-3"
              >
                <Printer className="h-5 w-5 text-gray-600" />
                <span>Print</span>
              </button>
              <button
                onClick={() => {
                  exportNote(selectedNote, 'md')
                  setShowExportOptions(false)
                }}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-3"
              >
                <FileText className="h-5 w-5 text-purple-600" />
                <span>Export as Markdown</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Focus Mode Overlay */}
      {focusMode && (
        <div
          ref={focusModeRef}
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={() => setFocusMode(false)}
        >
          <div className="max-w-4xl w-full mx-4 bg-white rounded-xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedNote?.title || 'Focus Mode'}</h2>
              <button
                onClick={() => setFocusMode(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
            />
          </div>
        </div>
      )}

      <MobileBottomAd adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <Footer />
      </div>
    </>
  )
}

