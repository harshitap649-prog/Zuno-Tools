'use client'

import { useState, useEffect, useMemo } from 'react'
import Footer from '@/components/Footer'
import SidebarAd from '@/components/SidebarAd'
import MobileBottomAd from '@/components/MobileBottomAd'
import { 
  Key, Copy, Check, RefreshCw, Eye, EyeOff, History, 
  Trash2, Save, Settings, Shield, AlertCircle, X,
  ChevronDown, ChevronUp, FileText, Lock, Unlock,
  Calculator, Search, Filter, Calendar, Clock, Info,
  TrendingUp, TrendingDown, Zap, Ban, Type, Target
} from 'lucide-react'
import toast from 'react-hot-toast'

interface PasswordHistory {
  id: string
  password: string
  timestamp: number
  strength: string
}

interface PasswordPreset {
  id: string
  name: string
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeSimilar: boolean
  excludeAmbiguous: boolean
}

interface PasswordRequirement {
  minLength: number
  maxLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSymbols: boolean
  minUppercase?: number
  minLowercase?: number
  minNumbers?: number
  minSymbols?: number
}

interface PasswordVault {
  id: string
  label: string
  password: string
  notes: string
  createdAt: number
  expiresAt?: number
  strength: string
}

interface StrengthBreakdown {
  length: { score: number; max: number; feedback: string }
  variety: { score: number; max: number; feedback: string }
  complexity: { score: number; max: number; feedback: string }
  patterns: { score: number; max: number; feedback: string }
  suggestions: string[]
}

export default function PasswordGenerator() {
  // Basic settings
  const [length, setLength] = useState(16)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [excludeSimilar, setExcludeSimilar] = useState(false)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
  const [customCharset, setCustomCharset] = useState('')
  const [useCustomCharset, setUseCustomCharset] = useState(false)
  
  // Advanced settings
  const [passwordType, setPasswordType] = useState<'random' | 'pattern' | 'passphrase'>('random')
  const [pattern, setPattern] = useState('word-number-symbol-word')
  const [passphraseLength, setPassphraseLength] = useState(4)
  const [passphraseSeparator, setPassphraseSeparator] = useState('-')
  
  // Multiple passwords
  const [generateMultiple, setGenerateMultiple] = useState(false)
  const [multipleCount, setMultipleCount] = useState(5)
  
  // Password requirements
  const [useRequirements, setUseRequirements] = useState(false)
  const [requirements, setRequirements] = useState<PasswordRequirement>({
    minLength: 8,
    maxLength: 64,
    requireUppercase: false,
    requireLowercase: false,
    requireNumbers: false,
    requireSymbols: false
  })
  
  // Output
  const [password, setPassword] = useState('')
  const [passwords, setPasswords] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // History
  const [history, setHistory] = useState<PasswordHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  
  // Password patterns
  const [noConsecutive, setNoConsecutive] = useState(false)
  const [noRepeated, setNoRepeated] = useState(false)
  const [pronounceable, setPronounceable] = useState(false)
  
  // Password vault
  const [vault, setVault] = useState<PasswordVault[]>([])
  const [showVault, setShowVault] = useState(false)
  const [vaultSearch, setVaultSearch] = useState('')
  const [vaultFilter, setVaultFilter] = useState<'all' | 'expired' | 'expiring'>('all')
  const [vaultLabel, setVaultLabel] = useState('')
  const [vaultNotes, setVaultNotes] = useState('')
  const [vaultExpiration, setVaultExpiration] = useState<number | null>(null)
  
  // Common passwords list (top 1000 most common)
  const commonPasswords = useMemo(() => [
    'password', '123456', '123456789', '12345678', '12345', '1234567', '1234567890',
    'qwerty', 'abc123', '111111', '123123', 'admin', 'letmein', 'welcome',
    'monkey', '1234567890', 'password1', 'qwerty123', 'dragon', 'sunshine',
    'princess', 'football', 'iloveyou', 'master', 'hello', 'freedom', 'whatever',
    'qazwsx', 'trustno1', '654321', 'jordan23', 'harley', 'password123', 'shadow',
    'superman', 'qwertyuiop', '123qwe', 'zxcvbnm', 'hunter', 'buster', 'soccer',
    'batman', 'andrew', 'tigger', 'charlie', 'robert', 'thomas', 'hockey',
    'ranger', 'daniel', 'hannah', 'michael', 'chocolate', 'michelle', 'jennifer',
    'joshua', 'jordan', 'taylor', 'justin', 'thomas', 'michelle', 'jennifer'
  ], [])
  
  // Presets
  const [presets, setPresets] = useState<PasswordPreset[]>([
    {
      id: 'strong',
      name: 'Strong',
      length: 20,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false
    },
    {
      id: 'pin',
      name: 'PIN',
      length: 6,
      includeUppercase: false,
      includeLowercase: false,
      includeNumbers: true,
      includeSymbols: false,
      excludeSimilar: true,
      excludeAmbiguous: false
    },
    {
      id: 'memorable',
      name: 'Memorable',
      length: 12,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false,
      excludeSimilar: true,
      excludeAmbiguous: false
    },
    {
      id: 'alphanumeric',
      name: 'Alphanumeric Only',
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false,
      excludeSimilar: false,
      excludeAmbiguous: false
    }
  ])
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  
  // UI states
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showRequirements, setShowRequirements] = useState(false)

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('password-generator-history')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
    const savedPresets = localStorage.getItem('password-generator-presets')
    if (savedPresets) {
      const customPresets = JSON.parse(savedPresets)
      setPresets(prev => [...prev, ...customPresets])
    }
  }, [])

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('password-generator-history', JSON.stringify(history.slice(0, 50)))
    }
  }, [history])

  // Word list for passphrases
  const wordList = [
    'apple', 'banana', 'cherry', 'dolphin', 'elephant', 'forest', 'guitar', 'happiness',
    'island', 'journey', 'knight', 'lighthouse', 'mountain', 'nature', 'ocean', 'penguin',
    'quantum', 'rainbow', 'sunset', 'thunder', 'universe', 'victory', 'waterfall', 'xylophone',
    'yesterday', 'zeppelin', 'adventure', 'butterfly', 'chocolate', 'diamond', 'elephant', 'firefly',
    'galaxy', 'harmony', 'infinity', 'jasmine', 'kingdom', 'liberty', 'mystery', 'nostalgia',
    'optimism', 'paradise', 'quasar', 'resilience', 'serenity', 'tranquil', 'umbrella', 'velocity',
    'wisdom', 'xenon', 'yogurt', 'zephyr', 'aurora', 'brilliant', 'cascade', 'destiny',
    'eternity', 'fantasy', 'glimmer', 'horizon', 'inspire', 'jubilee', 'kaleidoscope', 'luminous'
  ]

  // Get character set based on settings
  const getCharset = () => {
    if (useCustomCharset && customCharset) {
      return customCharset
    }

    let charset = ''
    let uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let lowercase = 'abcdefghijklmnopqrstuvwxyz'
    let numbers = '0123456789'
    let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

    // Exclude similar characters
    if (excludeSimilar) {
      uppercase = uppercase.replace(/[O0Il1]/g, '')
      lowercase = lowercase.replace(/[O0Il1]/g, '')
      numbers = numbers.replace(/[O0Il1]/g, '')
    }

    // Exclude ambiguous characters
    if (excludeAmbiguous) {
      symbols = symbols.replace(/[{}[\]()\\\/'"~,;.<>]/g, '')
    }

    if (includeUppercase) charset += uppercase
    if (includeLowercase) charset += lowercase
    if (includeNumbers) charset += numbers
    if (includeSymbols) charset += symbols

    return charset
  }

  // Generate random password
  const generateRandomPassword = (len: number = length): string => {
    const charset = getCharset()
    
    if (!charset) {
      toast.error('Please select at least one character type')
      return ''
    }

    let generated = ''
    const array = new Uint32Array(len)
    crypto.getRandomValues(array)
    
    for (let i = 0; i < len; i++) {
      generated += charset[array[i] % charset.length]
    }
    
    return generated
  }

  // Generate pattern-based password
  const generatePatternPassword = (): string => {
    const parts = pattern.split('-')
    let result = ''
    
    for (const part of parts) {
      if (part === 'word') {
        const word = wordList[Math.floor(Math.random() * wordList.length)]
        result += word.charAt(0).toUpperCase() + word.slice(1)
      } else if (part === 'number') {
        result += Math.floor(Math.random() * 9000 + 1000).toString()
      } else if (part === 'symbol') {
        const syms = excludeAmbiguous ? '!@#$%^&*' : '!@#$%^&*()_+-=[]{}|;:,.<>?'
        result += syms[Math.floor(Math.random() * syms.length)]
      } else if (part === 'lower') {
        const lower = excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz'
        result += lower[Math.floor(Math.random() * lower.length)]
      } else if (part === 'upper') {
        const upper = excludeSimilar ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        result += upper[Math.floor(Math.random() * upper.length)]
      }
    }
    
    return result
  }

  // Generate passphrase
  const generatePassphrase = (): string => {
    const words: string[] = []
    for (let i = 0; i < passphraseLength; i++) {
      words.push(wordList[Math.floor(Math.random() * wordList.length)])
    }
    return words.join(passphraseSeparator)
  }

  // Validate password against requirements
  const validatePassword = (pwd: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (pwd.length < requirements.minLength) {
      errors.push(`Password must be at least ${requirements.minLength} characters`)
    }
    if (pwd.length > requirements.maxLength) {
      errors.push(`Password must be at most ${requirements.maxLength} characters`)
    }
    if (requirements.requireUppercase && !/[A-Z]/.test(pwd)) {
      errors.push('Password must contain uppercase letters')
    }
    if (requirements.requireLowercase && !/[a-z]/.test(pwd)) {
      errors.push('Password must contain lowercase letters')
    }
    if (requirements.requireNumbers && !/\d/.test(pwd)) {
      errors.push('Password must contain numbers')
    }
    if (requirements.requireSymbols && !/[^a-zA-Z0-9]/.test(pwd)) {
      errors.push('Password must contain symbols')
    }
    
    if (requirements.minUppercase) {
      const count = (pwd.match(/[A-Z]/g) || []).length
      if (count < requirements.minUppercase) {
        errors.push(`Password must contain at least ${requirements.minUppercase} uppercase letters`)
      }
    }
    if (requirements.minLowercase) {
      const count = (pwd.match(/[a-z]/g) || []).length
      if (count < requirements.minLowercase) {
        errors.push(`Password must contain at least ${requirements.minLowercase} lowercase letters`)
      }
    }
    if (requirements.minNumbers) {
      const count = (pwd.match(/\d/g) || []).length
      if (count < requirements.minNumbers) {
        errors.push(`Password must contain at least ${requirements.minNumbers} numbers`)
      }
    }
    if (requirements.minSymbols) {
      const count = (pwd.match(/[^a-zA-Z0-9]/g) || []).length
      if (count < requirements.minSymbols) {
        errors.push(`Password must contain at least ${requirements.minSymbols} symbols`)
      }
    }
    
    return { valid: errors.length === 0, errors }
  }

  // Generate password(s)
  const generatePassword = () => {
    let generated: string[] = []
    
    if (generateMultiple) {
      for (let i = 0; i < multipleCount; i++) {
        let pwd = ''
        if (passwordType === 'random') {
          if (pronounceable) {
            pwd = generatePronounceablePassword()
          } else if (noConsecutive) {
            pwd = generateNoConsecutivePassword()
          } else if (noRepeated) {
            pwd = generateNoRepeatedPassword()
          } else {
            pwd = generateRandomPassword()
          }
        } else if (passwordType === 'pattern') {
          pwd = generatePatternPassword()
        } else if (passwordType === 'passphrase') {
          pwd = generatePassphrase()
        }
        
        // Validate if requirements are enabled
        if (useRequirements) {
          let attempts = 0
          while (attempts < 100) {
            const validation = validatePassword(pwd)
            if (validation.valid) break
            if (passwordType === 'random') {
              pwd = generateRandomPassword()
            } else if (passwordType === 'pattern') {
              pwd = generatePatternPassword()
            } else {
              pwd = generatePassphrase()
            }
            attempts++
          }
        }
        
        generated.push(pwd)
      }
      setPasswords(generated)
      setPassword('')
    } else {
      let pwd = ''
      if (passwordType === 'random') {
        if (pronounceable) {
          pwd = generatePronounceablePassword()
        } else if (noConsecutive) {
          pwd = generateNoConsecutivePassword()
        } else if (noRepeated) {
          pwd = generateNoRepeatedPassword()
        } else {
          pwd = generateRandomPassword()
        }
      } else if (passwordType === 'pattern') {
        pwd = generatePatternPassword()
      } else if (passwordType === 'passphrase') {
        pwd = generatePassphrase()
      }
      
      // Validate if requirements are enabled
      if (useRequirements) {
        let attempts = 0
        while (attempts < 100) {
          const validation = validatePassword(pwd)
          if (validation.valid) break
          if (passwordType === 'random') {
            pwd = generateRandomPassword()
          } else if (passwordType === 'pattern') {
            pwd = generatePatternPassword()
          } else {
            pwd = generatePassphrase()
          }
          attempts++
        }
        if (attempts >= 100) {
          toast.error('Could not generate password matching requirements. Try adjusting settings.')
        }
      }
      
      setPassword(pwd)
      setPasswords([])
      
      // Add to history
      if (pwd) {
        const strength = getStrength(pwd)
        const newHistory: PasswordHistory = {
          id: Date.now().toString(),
          password: pwd,
          timestamp: Date.now(),
          strength: strength.text
        }
        setHistory(prev => [newHistory, ...prev].slice(0, 50))
      }
    }
    
    setCopied(false)
  }

  // Apply preset
  const applyPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId)
    if (preset) {
      setLength(preset.length)
      setIncludeUppercase(preset.includeUppercase)
      setIncludeLowercase(preset.includeLowercase)
      setIncludeNumbers(preset.includeNumbers)
      setIncludeSymbols(preset.includeSymbols)
      setExcludeSimilar(preset.excludeSimilar)
      setExcludeAmbiguous(preset.excludeAmbiguous)
      setPasswordType('random')
      setSelectedPreset(presetId)
      toast.success(`Preset "${preset.name}" applied`)
    }
  }

  // Save custom preset
  const savePreset = () => {
    const name = prompt('Enter preset name:')
    if (!name) return
    
    const newPreset: PasswordPreset = {
      id: `custom-${Date.now()}`,
      name,
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
      excludeSimilar,
      excludeAmbiguous
    }
    
    setPresets(prev => [...prev, newPreset])
    const customPresets = presets.filter(p => p.id.startsWith('custom-'))
    customPresets.push(newPreset)
    localStorage.setItem('password-generator-presets', JSON.stringify(customPresets))
    toast.success('Preset saved!')
  }

  // Get password strength
  const getStrength = (pwd: string = password) => {
    if (!pwd) return { level: 0, text: '', color: '' }
    
    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++
    if (pwd.length >= 16) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++

    if (strength <= 2) return { level: strength, text: 'Weak', color: 'bg-red-500' }
    if (strength <= 4) return { level: strength, text: 'Medium', color: 'bg-yellow-500' }
    return { level: strength, text: 'Strong', color: 'bg-green-500' }
  }

  // Calculate password entropy
  const calculateEntropy = (pwd: string): { bits: number; timeToCrack: string } => {
    if (!pwd) return { bits: 0, timeToCrack: 'N/A' }
    
    const charset = getCharset()
    const charsetSize = charset.length
    const passwordLength = pwd.length
    
    // Calculate entropy bits: log2(charset_size^password_length)
    const entropyBits = Math.log2(Math.pow(charsetSize, passwordLength))
    
    // Estimate time to crack (assuming 10^9 guesses per second)
    const guessesPerSecond = 1e9
    const totalGuesses = Math.pow(charsetSize, passwordLength)
    const secondsToCrack = totalGuesses / guessesPerSecond
    
    let timeToCrack = ''
    if (secondsToCrack < 1) {
      timeToCrack = '< 1 second'
    } else if (secondsToCrack < 60) {
      timeToCrack = `${Math.round(secondsToCrack)} seconds`
    } else if (secondsToCrack < 3600) {
      timeToCrack = `${Math.round(secondsToCrack / 60)} minutes`
    } else if (secondsToCrack < 86400) {
      timeToCrack = `${Math.round(secondsToCrack / 3600)} hours`
    } else if (secondsToCrack < 31536000) {
      timeToCrack = `${Math.round(secondsToCrack / 86400)} days`
    } else if (secondsToCrack < 31536000000) {
      timeToCrack = `${Math.round(secondsToCrack / 31536000)} years`
    } else {
      timeToCrack = `${(secondsToCrack / 31536000000).toFixed(1)} billion years`
    }
    
    return { bits: Math.round(entropyBits * 10) / 10, timeToCrack }
  }

  // Check if password is common
  const checkCommonPassword = (pwd: string): boolean => {
    return commonPasswords.some(common => 
      pwd.toLowerCase().includes(common.toLowerCase()) || 
      common.toLowerCase().includes(pwd.toLowerCase())
    )
  }

  // Generate pronounceable password
  const generatePronounceablePassword = (len: number = length): string => {
    const vowels = 'aeiou'
    const consonants = 'bcdfghjklmnpqrstvwxyz'
    let result = ''
    
    for (let i = 0; i < len; i++) {
      if (i % 2 === 0) {
        result += consonants[Math.floor(Math.random() * consonants.length)]
      } else {
        result += vowels[Math.floor(Math.random() * vowels.length)]
      }
    }
    
    // Capitalize first letter
    return result.charAt(0).toUpperCase() + result.slice(1)
  }

  // Generate password with no consecutive characters
  const generateNoConsecutivePassword = (len: number = length): string => {
    const charset = getCharset()
    if (!charset) return ''
    
    let result = ''
    let lastChar = ''
    
    for (let i = 0; i < len; i++) {
      let char = charset[Math.floor(Math.random() * charset.length)]
      let attempts = 0
      while (char === lastChar && attempts < 100) {
        char = charset[Math.floor(Math.random() * charset.length)]
        attempts++
      }
      result += char
      lastChar = char
    }
    
    return result
  }

  // Generate password with no repeated characters
  const generateNoRepeatedPassword = (len: number = length): string => {
    const charset = getCharset()
    if (!charset) return ''
    
    const usedChars = new Set<string>()
    let result = ''
    
    for (let i = 0; i < len && usedChars.size < charset.length; i++) {
      let char = charset[Math.floor(Math.random() * charset.length)]
      let attempts = 0
      while (usedChars.has(char) && attempts < 100) {
        char = charset[Math.floor(Math.random() * charset.length)]
        attempts++
      }
      result += char
      usedChars.add(char)
    }
    
    return result
  }

  // Get strength breakdown and suggestions
  const getStrengthBreakdown = (pwd: string = password): StrengthBreakdown => {
    if (!pwd) {
      return {
        length: { score: 0, max: 3, feedback: 'No password' },
        variety: { score: 0, max: 3, feedback: 'No password' },
        complexity: { score: 0, max: 3, feedback: 'No password' },
        patterns: { score: 0, max: 3, feedback: 'No password' },
        suggestions: []
      }
    }
    
    const suggestions: string[] = []
    
    // Length analysis
    let lengthScore = 0
    let lengthFeedback = ''
    if (pwd.length >= 16) {
      lengthScore = 3
      lengthFeedback = 'Excellent length (16+ characters)'
    } else if (pwd.length >= 12) {
      lengthScore = 2
      lengthFeedback = 'Good length (12-15 characters)'
    } else if (pwd.length >= 8) {
      lengthScore = 1
      lengthFeedback = 'Minimum length (8-11 characters)'
    } else {
      lengthScore = 0
      lengthFeedback = 'Too short (less than 8 characters)'
      suggestions.push('Increase password length to at least 12 characters')
    }
    
    // Variety analysis
    let varietyScore = 0
    let varietyFeedback = ''
    const hasUpper = /[A-Z]/.test(pwd)
    const hasLower = /[a-z]/.test(pwd)
    const hasNumbers = /\d/.test(pwd)
    const hasSymbols = /[^a-zA-Z0-9]/.test(pwd)
    
    const varietyCount = [hasUpper, hasLower, hasNumbers, hasSymbols].filter(Boolean).length
    if (varietyCount === 4) {
      varietyScore = 3
      varietyFeedback = 'Uses all character types'
    } else if (varietyCount === 3) {
      varietyScore = 2
      varietyFeedback = 'Uses 3 character types'
    } else if (varietyCount === 2) {
      varietyScore = 1
      varietyFeedback = 'Uses 2 character types'
    } else {
      varietyScore = 0
      varietyFeedback = 'Limited character variety'
    }
    
    if (!hasUpper) suggestions.push('Add uppercase letters (A-Z)')
    if (!hasLower) suggestions.push('Add lowercase letters (a-z)')
    if (!hasNumbers) suggestions.push('Add numbers (0-9)')
    if (!hasSymbols) suggestions.push('Add symbols (!@#$...)')
    
    // Complexity analysis
    let complexityScore = 0
    let complexityFeedback = ''
    const uniqueChars = new Set(pwd).size
    const complexityRatio = uniqueChars / pwd.length
    
    if (complexityRatio >= 0.8) {
      complexityScore = 3
      complexityFeedback = 'High character diversity'
    } else if (complexityRatio >= 0.6) {
      complexityScore = 2
      complexityFeedback = 'Moderate character diversity'
    } else if (complexityRatio >= 0.4) {
      complexityScore = 1
      complexityFeedback = 'Low character diversity'
    } else {
      complexityScore = 0
      complexityFeedback = 'Very low character diversity'
    }
    
    if (complexityRatio < 0.6) {
      suggestions.push('Use more diverse characters to increase complexity')
    }
    
    // Pattern analysis
    let patternScore = 3
    let patternFeedback = 'No obvious patterns detected'
    
    // Check for common patterns
    if (/(.)\1{2,}/.test(pwd)) {
      patternScore -= 1
      patternFeedback = 'Contains repeated characters'
      suggestions.push('Avoid repeating the same character multiple times')
    }
    if (/123|abc|qwe/i.test(pwd)) {
      patternScore -= 1
      patternFeedback = 'Contains sequential patterns'
      suggestions.push('Avoid sequential patterns like "123" or "abc"')
    }
    if (pwd.toLowerCase() === pwd || pwd.toUpperCase() === pwd) {
      patternScore -= 1
      patternFeedback = 'All same case'
      suggestions.push('Mix uppercase and lowercase letters')
    }
    
    if (suggestions.length === 0) {
      suggestions.push('Password looks strong! Keep it secure.')
    }
    
    return {
      length: { score: lengthScore, max: 3, feedback: lengthFeedback },
      variety: { score: varietyScore, max: 3, feedback: varietyFeedback },
      complexity: { score: complexityScore, max: 3, feedback: complexityFeedback },
      patterns: { score: patternScore, max: 3, feedback: patternFeedback },
      suggestions
    }
  }

  // Save to vault
  const saveToVault = () => {
    if (!password) {
      toast.error('No password to save')
      return
    }
    
    if (!vaultLabel.trim()) {
      toast.error('Please enter a label')
      return
    }
    
    const strength = getStrength(password)
    const newEntry: PasswordVault = {
      id: Date.now().toString(),
      label: vaultLabel,
      password: password,
      notes: vaultNotes,
      createdAt: Date.now(),
      expiresAt: vaultExpiration || undefined,
      strength: strength.text
    }
    
    setVault(prev => [...prev, newEntry])
    setVaultLabel('')
    setVaultNotes('')
    setVaultExpiration(null)
    toast.success('Password saved to vault!')
  }

  // Load vault from localStorage
  useEffect(() => {
    const savedVault = localStorage.getItem('password-generator-vault')
    if (savedVault) {
      try {
        // Simple base64 decode (not real encryption, but obfuscation)
        const decoded = atob(savedVault)
        setVault(JSON.parse(decoded))
      } catch (e) {
        // If decode fails, try direct parse
        setVault(JSON.parse(savedVault))
      }
    }
  }, [])

  // Save vault to localStorage
  useEffect(() => {
    if (vault.length > 0) {
      // Simple base64 encode (not real encryption, but obfuscation)
      const encoded = btoa(JSON.stringify(vault))
      localStorage.setItem('password-generator-vault', encoded)
    }
  }, [vault])

  // Filter vault entries
  const filteredVault = useMemo(() => {
    let filtered = vault
    
    // Filter by search
    if (vaultSearch) {
      filtered = filtered.filter(entry => 
        entry.label.toLowerCase().includes(vaultSearch.toLowerCase()) ||
        entry.notes.toLowerCase().includes(vaultSearch.toLowerCase())
      )
    }
    
    // Filter by expiration
    if (vaultFilter === 'expired') {
      filtered = filtered.filter(entry => 
        entry.expiresAt && entry.expiresAt < Date.now()
      )
    } else if (vaultFilter === 'expiring') {
      const weekFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000
      filtered = filtered.filter(entry => 
        entry.expiresAt && entry.expiresAt > Date.now() && entry.expiresAt < weekFromNow
      )
    }
    
    return filtered
  }, [vault, vaultSearch, vaultFilter])

  const strength = getStrength()

  // Calculate entropy and breakdown for display
  const passwordEntropy = useMemo(() => {
    if (!password || generateMultiple) return null
    return calculateEntropy(password)
  }, [password, generateMultiple])

  const passwordBreakdown = useMemo(() => {
    if (!password || generateMultiple) return null
    return getStrengthBreakdown(password)
  }, [password, generateMultiple])

  // Copy to clipboard
  const copyToClipboard = (text?: string) => {
    const textToCopy = text || password
    if (!textToCopy) return
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    toast.success('Password copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Load from history
  const loadFromHistory = (pwd: string) => {
    setPassword(pwd)
    setPasswords([])
    setShowHistory(false)
    toast.success('Password loaded from history')
  }

  // Clear history
  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all password history?')) {
      setHistory([])
      localStorage.removeItem('password-generator-history')
      toast.success('History cleared')
    }
  }

  // Auto-generate on mount
  useEffect(() => {
    generatePassword()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      <SidebarAd position="left" adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      <SidebarAd position="right" adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      
      <main className="flex-grow py-4 sm:py-6 md:py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <div className="inline-flex items-center justify-center mb-4 sm:mb-5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 p-4 sm:p-5 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <Key className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-3 sm:mb-4">
              Password Generator
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-900 px-4 max-w-3xl mx-auto leading-relaxed">
              Generate strong, secure passwords with advanced customization options
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {/* Main Generator */}
            <div className="lg:col-span-2 space-y-4">
              {/* Presets */}
              <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-purple-100/60 p-5 sm:p-6 hover:shadow-3xl transition-all duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-5">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2.5">
                    <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                      <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                    </div>
                    Quick Presets
                  </h3>
                  <button
                    onClick={savePreset}
                    className="w-full sm:w-auto text-sm px-4 py-2.5 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md border border-purple-200"
                  >
                    <Save className="h-4 w-4 inline mr-2" />
                    Save Current
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {presets.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset.id)}
                      className={`px-4 py-2.5 rounded-xl text-sm sm:text-base font-semibold transition-all transform hover:scale-105 ${
                        selectedPreset === preset.id
                          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-lg scale-105'
                          : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 border border-gray-200 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generator Card */}
              <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-purple-100/60 p-5 sm:p-6 md:p-7 lg:p-8 space-y-6 hover:shadow-3xl transition-all duration-300">
                {/* Password Type */}
                <div>
                  <label className="block text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Type className="h-5 w-5 text-purple-600" />
                    Password Type
                  </label>
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                    <button
                      onClick={() => setPasswordType('random')}
                      className={`px-4 py-3 rounded-xl text-sm sm:text-base font-bold transition-all transform hover:scale-105 ${
                        passwordType === 'random'
                          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-xl scale-105'
                          : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 border border-gray-200 shadow-sm hover:shadow-md'
                      }`}
                    >
                      Random
                    </button>
                    <button
                      onClick={() => setPasswordType('pattern')}
                      className={`px-4 py-3 rounded-xl text-sm sm:text-base font-bold transition-all transform hover:scale-105 ${
                        passwordType === 'pattern'
                          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-xl scale-105'
                          : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 border border-gray-200 shadow-sm hover:shadow-md'
                      }`}
                    >
                      Pattern
                    </button>
                    <button
                      onClick={() => setPasswordType('passphrase')}
                      className={`px-4 py-3 rounded-xl text-sm sm:text-base font-bold transition-all transform hover:scale-105 ${
                        passwordType === 'passphrase'
                          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-xl scale-105'
                          : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 border border-gray-200 shadow-sm hover:shadow-md'
                      }`}
                    >
                      Passphrase
                    </button>
                  </div>
                </div>

                {/* Pattern Settings */}
                {passwordType === 'pattern' && (
                  <div>
                    <label className="block text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      Pattern
                    </label>
                    <input
                      type="text"
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      placeholder="word-number-symbol-word"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm sm:text-base text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md"
                    />
                    <p className="text-xs sm:text-sm text-gray-900 mt-2 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Use: word, number, symbol, upper, lower
                    </p>
                  </div>
                )}

                {/* Passphrase Settings */}
                {passwordType === 'passphrase' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Word Count</label>
                      <input
                        type="number"
                        min="3"
                        max="10"
                        value={passphraseLength}
                        onChange={(e) => setPassphraseLength(Number(e.target.value))}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Separator</label>
                      <input
                        type="text"
                        maxLength={1}
                        value={passphraseSeparator}
                        onChange={(e) => setPassphraseSeparator(e.target.value || '-')}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                )}

                {/* Length */}
                {passwordType === 'random' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Target className="h-5 w-5 text-purple-600" />
                        Length: <span className="text-purple-600">{length}</span>
                      </label>
                      <span className="text-sm sm:text-base text-gray-900 font-semibold bg-gray-100 px-3 py-1 rounded-lg">{length} chars</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="64"
                      value={length}
                      onChange={(e) => setLength(Number(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      style={{
                        background: `linear-gradient(to right, rgb(147 51 234) 0%, rgb(147 51 234) ${((length - 4) / 60) * 100}%, rgb(229 231 235) ${((length - 4) / 60) * 100}%, rgb(229 231 235) 100%)`
                      }}
                    />
                  </div>
                )}

                {/* Character Options */}
                {passwordType === 'random' && (
                  <div>
                    <label className="block text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Check className="h-5 w-5 text-purple-600" />
                      Include Characters
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all">
                        <input
                          type="checkbox"
                          checked={includeUppercase}
                          onChange={(e) => setIncludeUppercase(e.target.checked)}
                          className="rounded w-5 h-5 accent-purple-600 cursor-pointer"
                        />
                        <span className="text-sm sm:text-base font-semibold text-gray-900">Uppercase (A-Z)</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all">
                        <input
                          type="checkbox"
                          checked={includeLowercase}
                          onChange={(e) => setIncludeLowercase(e.target.checked)}
                          className="rounded w-5 h-5 accent-purple-600 cursor-pointer"
                        />
                        <span className="text-sm sm:text-base font-semibold text-gray-900">Lowercase (a-z)</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all">
                        <input
                          type="checkbox"
                          checked={includeNumbers}
                          onChange={(e) => setIncludeNumbers(e.target.checked)}
                          className="rounded w-5 h-5 accent-purple-600 cursor-pointer"
                        />
                        <span className="text-sm sm:text-base font-semibold text-gray-900">Numbers (0-9)</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all">
                        <input
                          type="checkbox"
                          checked={includeSymbols}
                          onChange={(e) => setIncludeSymbols(e.target.checked)}
                          className="rounded w-5 h-5 accent-purple-600 cursor-pointer"
                        />
                        <span className="text-sm sm:text-base font-semibold text-gray-900">Symbols (!@#$...)</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Advanced Options */}
                {passwordType === 'random' && (
                  <div>
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 mb-3"
                    >
                      <span>Advanced Options</span>
                      {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {showAdvanced && (
                      <div className="space-y-3 p-3 bg-gray-50 rounded-xl">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={excludeSimilar}
                            onChange={(e) => setExcludeSimilar(e.target.checked)}
                            className="rounded w-4 h-4"
                          />
                          <span className="text-sm text-gray-900">Exclude Similar (0, O, l, 1, I)</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={excludeAmbiguous}
                            onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                            className="rounded w-4 h-4"
                          />
                          <span className="text-sm text-gray-900">Exclude Ambiguous (special chars: braces, brackets, quotes, etc.)</span>
                        </label>
                        <div className="border-t pt-3">
                          <label className="block text-xs font-semibold text-gray-900 mb-2">Password Patterns</label>
                          <div className="space-y-2">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name="pattern"
                                checked={!pronounceable && !noConsecutive && !noRepeated}
                                onChange={() => {
                                  setPronounceable(false)
                                  setNoConsecutive(false)
                                  setNoRepeated(false)
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-900">Random (default)</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name="pattern"
                                checked={pronounceable}
                                onChange={() => {
                                  setPronounceable(true)
                                  setNoConsecutive(false)
                                  setNoRepeated(false)
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-900">Pronounceable</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name="pattern"
                                checked={noConsecutive}
                                onChange={() => {
                                  setPronounceable(false)
                                  setNoConsecutive(true)
                                  setNoRepeated(false)
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-900">No Consecutive Characters</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name="pattern"
                                checked={noRepeated}
                                onChange={() => {
                                  setPronounceable(false)
                                  setNoConsecutive(false)
                                  setNoRepeated(true)
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-900">No Repeated Characters</span>
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="flex items-center space-x-3 cursor-pointer mb-2">
                            <input
                              type="checkbox"
                              checked={useCustomCharset}
                              onChange={(e) => setUseCustomCharset(e.target.checked)}
                              className="rounded w-4 h-4"
                            />
                            <span className="text-sm text-gray-900">Use Custom Character Set</span>
                          </label>
                          {useCustomCharset && (
                            <input
                              type="text"
                              value={customCharset}
                              onChange={(e) => setCustomCharset(e.target.value)}
                              placeholder="Enter custom characters..."
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Multiple Passwords */}
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generateMultiple}
                      onChange={(e) => setGenerateMultiple(e.target.checked)}
                      className="rounded w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-gray-900">Generate Multiple Passwords</span>
                  </label>
                  {generateMultiple && (
                    <div className="mt-2">
                      <input
                        type="number"
                        min="2"
                        max="50"
                        value={multipleCount}
                        onChange={(e) => setMultipleCount(Number(e.target.value))}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  )}
                </div>

                {/* Requirements */}
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      checked={useRequirements}
                      onChange={(e) => setUseRequirements(e.target.checked)}
                      className="rounded w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-gray-900">Use Password Requirements</span>
                  </label>
                  {useRequirements && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-xl space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-900">Min Length</label>
                          <input
                            type="number"
                            min="4"
                            max="64"
                            value={requirements.minLength}
                            onChange={(e) => setRequirements({...requirements, minLength: Number(e.target.value)})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-900">Max Length</label>
                          <input
                            type="number"
                            min="4"
                            max="64"
                            value={requirements.maxLength}
                            onChange={(e) => setRequirements({...requirements, maxLength: Number(e.target.value)})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={requirements.requireUppercase}
                            onChange={(e) => setRequirements({...requirements, requireUppercase: e.target.checked})}
                            className="rounded w-3 h-3"
                          />
                          <span className="text-xs text-gray-900">Require Uppercase</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={requirements.requireLowercase}
                            onChange={(e) => setRequirements({...requirements, requireLowercase: e.target.checked})}
                            className="rounded w-3 h-3"
                          />
                          <span className="text-xs text-gray-900">Require Lowercase</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={requirements.requireNumbers}
                            onChange={(e) => setRequirements({...requirements, requireNumbers: e.target.checked})}
                            className="rounded w-3 h-3"
                          />
                          <span className="text-xs text-gray-900">Require Numbers</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={requirements.requireSymbols}
                            onChange={(e) => setRequirements({...requirements, requireSymbols: e.target.checked})}
                            className="rounded w-3 h-3"
                          />
                          <span className="text-xs text-gray-900">Require Symbols</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Generate Button */}
                <button
                  onClick={generatePassword}
                  className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white px-6 py-4 rounded-2xl font-bold hover:shadow-2xl transition-all flex items-center justify-center space-x-3 text-base sm:text-lg transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                  <RefreshCw className="h-6 w-6 animate-spin-slow" />
                  <span>Generate Password{generateMultiple ? 's' : ''}</span>
                </button>

                {/* Generated Password(s) */}
                {password && !generateMultiple && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 sm:p-6 border-2 border-gray-200 shadow-xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                      <span className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-600" />
                        Generated Password
                      </span>
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-2.5 bg-white hover:bg-gray-100 rounded-xl transition-all shadow-sm hover:shadow-md border border-gray-200"
                          title="Show/Hide"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5 text-gray-900" /> : <Eye className="h-5 w-5 text-gray-900" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard()}
                          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md ${
                            copied 
                              ? 'bg-green-100 hover:bg-green-200 text-green-700 border border-green-200' 
                              : 'bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {copied ? (
                            <>
                              <Check className="h-5 w-5" />
                              <span className="text-sm sm:text-base">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-5 w-5" />
                              <span className="text-sm sm:text-base">Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="font-mono text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-all select-all bg-white p-4 rounded-xl border-2 border-gray-200 shadow-inner min-h-[60px] flex items-center">
                      {showPassword ? password : '•'.repeat(password.length)}
                    </div>
                    {useRequirements && (
                      <div className="mt-3">
                        {(() => {
                          const validation = validatePassword(password)
                          if (validation.valid) {
                            return <div className="text-xs text-green-600 flex items-center gap-1"><Check className="h-3 w-3" /> Meets all requirements</div>
                          } else {
                            return (
                              <div className="text-xs text-red-600">
                                <div className="flex items-center gap-1 mb-1"><AlertCircle className="h-3 w-3" /> Requirements not met:</div>
                                <ul className="list-disc list-inside ml-2">
                                  {validation.errors.map((err, i) => <li key={i}>{err}</li>)}
                                </ul>
                              </div>
                            )
                          }
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {passwords.length > 0 && generateMultiple && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">Generated Passwords ({passwords.length})</span>
                      <button
                        onClick={() => {
                          const allPasswords = passwords.join('\n')
                          copyToClipboard(allPasswords)
                        }}
                        className="text-xs px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-semibold"
                      >
                        Copy All
                      </button>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {passwords.map((pwd, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between">
                          <span className="font-mono text-sm text-gray-900 flex-1 break-all">{pwd}</span>
                          <button
                            onClick={() => copyToClipboard(pwd)}
                            className="ml-2 p-1.5 hover:bg-gray-200 rounded-lg transition-all"
                            title="Copy"
                          >
                            <Copy className="h-4 w-4 text-gray-900" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Common Password Warning */}
                {password && !generateMultiple && checkCommonPassword(password) && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-900">Common Password Detected</p>
                        <p className="text-xs text-red-700 mt-1">This password or similar patterns are commonly used and easily guessed. Consider generating a new one.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Entropy Calculator */}
                {passwordEntropy && (
                  <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-5 sm:p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <Calculator className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="text-lg sm:text-xl font-bold text-gray-900">Password Entropy</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
                        <p className="text-xs sm:text-sm text-gray-900 mb-2 font-medium">Entropy Bits</p>
                        <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          {passwordEntropy.bits} bits
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
                        <p className="text-xs sm:text-sm text-gray-900 mb-2 font-medium">Time to Crack</p>
                        <p className="text-lg sm:text-xl font-bold text-blue-600 break-words">
                          {passwordEntropy.timeToCrack}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t-2 border-blue-200 bg-white rounded-xl p-3">
                      <p className={`text-sm font-semibold ${
                        passwordEntropy.bits < 40 ? 'text-red-600' :
                        passwordEntropy.bits < 60 ? 'text-yellow-600' :
                        passwordEntropy.bits < 80 ? 'text-green-600' :
                        'text-blue-600'
                      }`}>
                        {passwordEntropy.bits < 40 ? '⚠️ Low entropy - easily crackable' :
                         passwordEntropy.bits < 60 ? '✓ Moderate entropy - decent security' :
                         passwordEntropy.bits < 80 ? '✓✓ Good entropy - strong security' :
                         '✓✓✓ Excellent entropy - very strong security'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Strength Breakdown */}
                {passwordBreakdown && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        <h4 className="text-sm font-semibold text-gray-900">Strength Breakdown</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-gray-900">Length</span>
                            <span className="text-xs text-gray-900">{passwordBreakdown.length.score}/{passwordBreakdown.length.max}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                passwordBreakdown.length.score === 3 ? 'bg-green-500' :
                                passwordBreakdown.length.score === 2 ? 'bg-yellow-500' :
                                passwordBreakdown.length.score === 1 ? 'bg-orange-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${(passwordBreakdown.length.score / passwordBreakdown.length.max) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-900 mt-1">{passwordBreakdown.length.feedback}</p>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-gray-900">Character Variety</span>
                            <span className="text-xs text-gray-900">{passwordBreakdown.variety.score}/{passwordBreakdown.variety.max}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                passwordBreakdown.variety.score === 3 ? 'bg-green-500' :
                                passwordBreakdown.variety.score === 2 ? 'bg-yellow-500' :
                                passwordBreakdown.variety.score === 1 ? 'bg-orange-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${(passwordBreakdown.variety.score / passwordBreakdown.variety.max) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-900 mt-1">{passwordBreakdown.variety.feedback}</p>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-gray-900">Complexity</span>
                            <span className="text-xs text-gray-900">{passwordBreakdown.complexity.score}/{passwordBreakdown.complexity.max}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                passwordBreakdown.complexity.score === 3 ? 'bg-green-500' :
                                passwordBreakdown.complexity.score === 2 ? 'bg-yellow-500' :
                                passwordBreakdown.complexity.score === 1 ? 'bg-orange-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${(passwordBreakdown.complexity.score / passwordBreakdown.complexity.max) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-900 mt-1">{passwordBreakdown.complexity.feedback}</p>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-gray-900">Patterns</span>
                            <span className="text-xs text-gray-900">{passwordBreakdown.patterns.score}/{passwordBreakdown.patterns.max}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                passwordBreakdown.patterns.score === 3 ? 'bg-green-500' :
                                passwordBreakdown.patterns.score === 2 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${(passwordBreakdown.patterns.score / passwordBreakdown.patterns.max) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-900 mt-1">{passwordBreakdown.patterns.feedback}</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-purple-200">
                        <p className="text-xs font-semibold text-gray-900 mb-2">Suggestions:</p>
                        <ul className="space-y-1">
                          {passwordBreakdown.suggestions.map((suggestion, i) => (
                            <li key={i} className="text-xs text-gray-900 flex items-start gap-2">
                              <Info className="h-3 w-3 text-purple-600 flex-shrink-0 mt-0.5" />
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                )}

                {/* Strength Indicator */}
                {password && !generateMultiple && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-900">Password Strength</span>
                      <span className={`text-sm font-semibold ${strength.color.replace('bg-', 'text-')}`}>
                        {strength.text}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${strength.color}`}
                        style={{ width: `${(strength.level / 6) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Save to Vault */}
                {password && !generateMultiple && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-green-600" />
                      Save to Vault
                    </h4>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={vaultLabel}
                        onChange={(e) => setVaultLabel(e.target.value)}
                        placeholder="Label (e.g., Gmail, Facebook)"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      <textarea
                        value={vaultNotes}
                        onChange={(e) => setVaultNotes(e.target.value)}
                        placeholder="Notes (optional)"
                        rows={2}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={vaultExpiration ? new Date(vaultExpiration).toISOString().split('T')[0] : ''}
                          onChange={(e) => setVaultExpiration(e.target.value ? new Date(e.target.value).getTime() : null)}
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <button
                          onClick={saveToVault}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-all"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - History & Vault */}
            <div className="space-y-4 sm:space-y-5">
              <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-purple-100/60 p-5 sm:p-6 hover:shadow-3xl transition-all duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2.5">
                    <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                      <History className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                    </div>
                    History
                  </h3>
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="w-full sm:w-auto text-sm px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md border border-red-200"
                    >
                      <Trash2 className="h-4 w-4 inline mr-2" />
                      Clear
                    </button>
                  )}
                </div>
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                      <History className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-900 text-sm sm:text-base">No password history yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {history.slice(0, 20).map(item => (
                      <div key={item.id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border-2 border-gray-200 hover:shadow-lg hover:border-purple-300 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs sm:text-sm px-3 py-1 rounded-lg font-bold ${
                            item.strength === 'Strong' ? 'bg-green-100 text-green-700 border border-green-200' :
                            item.strength === 'Medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                            'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {item.strength}
                          </span>
                          <span className="text-xs text-gray-900 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="font-mono text-sm sm:text-base text-gray-900 break-all mb-3 bg-white p-3 rounded-lg border border-gray-200">
                          {item.password}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadFromHistory(item.password)}
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md border border-purple-200"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => copyToClipboard(item.password)}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md border border-gray-200"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Password Vault */}
              <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-green-100/60 p-5 sm:p-6 hover:shadow-3xl transition-all duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2.5">
                    <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                      <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                    Password Vault
                  </h3>
                  <button
                    onClick={() => setShowVault(!showVault)}
                    className="w-full sm:w-auto text-sm px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-700 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md border border-green-200"
                  >
                    {showVault ? (
                      <>
                        <EyeOff className="h-4 w-4 inline mr-2" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 inline mr-2" />
                        Show
                      </>
                    )}
                  </button>
                </div>
                {showVault && (
                  <div className="space-y-3">
                    {/* Search and Filter */}
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={vaultSearch}
                          onChange={(e) => setVaultSearch(e.target.value)}
                          placeholder="Search vault..."
                          className="w-full pl-8 pr-3 py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setVaultFilter('all')}
                          className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition-all ${
                            vaultFilter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setVaultFilter('expiring')}
                          className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition-all ${
                            vaultFilter === 'expiring' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          Expiring
                        </button>
                        <button
                          onClick={() => setVaultFilter('expired')}
                          className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition-all ${
                            vaultFilter === 'expired' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          Expired
                        </button>
                      </div>
                    </div>

                    {/* Vault Entries */}
                    {filteredVault.length === 0 ? (
                      <div className="text-center py-8">
                        <Lock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-900 text-sm">No passwords in vault</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredVault.map(entry => {
                          const isExpired = entry.expiresAt && entry.expiresAt < Date.now()
                          const isExpiring = entry.expiresAt && entry.expiresAt > Date.now() && entry.expiresAt < Date.now() + 7 * 24 * 60 * 60 * 1000
                          return (
                            <div key={entry.id} className={`bg-gray-50 rounded-lg p-3 border ${
                              isExpired ? 'border-red-200 bg-red-50' :
                              isExpiring ? 'border-yellow-200 bg-yellow-50' :
                              'border-gray-200'
                            } hover:shadow-md transition-all`}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold text-gray-900">{entry.label}</span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                                      entry.strength === 'Strong' ? 'bg-green-100 text-green-700' :
                                      entry.strength === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    } font-semibold`}>
                                      {entry.strength}
                                    </span>
                                  </div>
                                  {entry.notes && (
                                    <p className="text-xs text-gray-900 mb-1">{entry.notes}</p>
                                  )}
                                  {entry.expiresAt && (
                                    <div className="flex items-center gap-1 text-xs">
                                      <Calendar className="h-3 w-3 text-gray-900" />
                                      <span className={isExpired ? 'text-red-600 font-semibold' : isExpiring ? 'text-yellow-600 font-semibold' : 'text-gray-900'}>
                                        {isExpired ? 'Expired' : isExpiring ? 'Expires soon' : 'Expires'}: {new Date(entry.expiresAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    setVault(prev => prev.filter(e => e.id !== entry.id))
                                    toast.success('Password removed from vault')
                                  }}
                                  className="p-1 hover:bg-red-100 rounded transition-all"
                                >
                                  <Trash2 className="h-3 w-3 text-red-600" />
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setPassword(entry.password)
                                    setShowVault(false)
                                    toast.success('Password loaded')
                                  }}
                                  className="flex-1 px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-semibold transition-all"
                                >
                                  Load
                                </button>
                                <button
                                  onClick={() => copyToClipboard(entry.password)}
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold transition-all"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileBottomAd adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      <Footer />
    </div>
  )
}
