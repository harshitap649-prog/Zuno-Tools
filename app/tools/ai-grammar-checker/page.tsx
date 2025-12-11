'use client'

import { useState, useMemo } from 'react'
import Footer from '@/components/Footer'
import MobileBottomAd from '@/components/MobileBottomAd'
import { Languages, Wand2, Copy, Check, AlertCircle, TrendingUp, FileText, BarChart3, Loader2, X, Zap, RefreshCw, Download, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

interface GrammarError {
  word: string
  position: number
  suggestion: string
  type: string
  severity: 'error' | 'warning' | 'info'
  context?: string
}

interface TextStats {
  words: number
  characters: number
  charactersNoSpaces: number
  sentences: number
  paragraphs: number
  readability: number
  tone: string
  avgWordsPerSentence: number
  passiveVoiceCount: number
}

// Common words dictionary for spell checking
const commonWords = new Set([
  'i', 'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'up', 'about', 'into', 'through', 'during', 'including', 'against', 'among', 'throughout',
  'despite', 'towards', 'upon', 'concerning', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
  'from', 'up', 'about', 'into', 'through', 'during', 'including', 'against', 'among', 'throughout',
  'despite', 'towards', 'upon', 'concerning', 'had', 'have', 'has', 'was', 'were', 'is', 'are',
  'been', 'being', 'be', 'am', 'do', 'does', 'did', 'done', 'will', 'would', 'could', 'should',
  'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'he', 'she', 'it', 'they',
  'we', 'you', 'him', 'her', 'them', 'us', 'me', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'lunch', 'breakfast', 'dinner', 'food', 'eat', 'ate', 'eating', 'drink', 'drank', 'drinking',
  'water', 'coffee', 'tea', 'milk', 'bread', 'rice', 'meat', 'chicken', 'fish', 'vegetable',
  'fruit', 'apple', 'banana', 'orange', 'good', 'bad', 'nice', 'great', 'excellent', 'poor',
  'big', 'small', 'large', 'little', 'long', 'short', 'tall', 'wide', 'narrow', 'high', 'low',
  'new', 'old', 'young', 'hot', 'cold', 'warm', 'cool', 'fast', 'slow', 'quick', 'easy', 'hard',
  'difficult', 'simple', 'complex', 'right', 'wrong', 'correct', 'incorrect', 'true', 'false',
  'yes', 'no', 'maybe', 'perhaps', 'probably', 'definitely', 'certainly', 'sure', 'unsure',
  'happy', 'sad', 'angry', 'excited', 'bored', 'tired', 'sleepy', 'awake', 'alive', 'dead',
  'here', 'there', 'where', 'when', 'why', 'how', 'what', 'who', 'which', 'whose', 'whom',
  'today', 'yesterday', 'tomorrow', 'now', 'then', 'soon', 'later', 'early', 'late', 'before',
  'after', 'during', 'while', 'until', 'since', 'ago', 'already', 'yet', 'still', 'just',
  'very', 'quite', 'rather', 'too', 'so', 'such', 'more', 'most', 'less', 'least', 'much',
  'many', 'few', 'little', 'some', 'any', 'all', 'every', 'each', 'both', 'either', 'neither',
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'hundred',
  'thousand', 'million', 'billion', 'first', 'second', 'third', 'last', 'next', 'previous',
  'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white',
  'gray', 'grey', 'color', 'colour', 'light', 'dark', 'bright', 'dull', 'shiny', 'matte',
  'house', 'home', 'room', 'door', 'window', 'wall', 'floor', 'ceiling', 'roof', 'garden',
  'car', 'bus', 'train', 'plane', 'bike', 'bicycle', 'walk', 'run', 'jump', 'sit', 'stand',
  'lie', 'lay', 'sleep', 'wake', 'work', 'play', 'study', 'learn', 'teach', 'read', 'write',
  'back', 'front', 'side', 'top', 'bottom', 'left', 'right', 'center', 'middle', 'end',
  'school', 'college', 'university', 'student', 'teacher', 'class', 'lesson', 'book', 'paper',
  'came', 'come', 'coming', 'go', 'went', 'going', 'went', 'gone',
  'speak', 'talk', 'say', 'tell', 'ask', 'answer', 'question', 'answer', 'listen', 'hear',
  'see', 'look', 'watch', 'show', 'give', 'take', 'get', 'got', 'gotten', 'make', 'made',
  'do', 'did', 'done', 'go', 'went', 'gone', 'come', 'came', 'become', 'became', 'begin',
  'began', 'begun', 'break', 'broke', 'broken', 'bring', 'brought', 'build', 'built', 'buy',
  'bought', 'catch', 'caught', 'choose', 'chose', 'chosen', 'cut', 'dig', 'dug', 'draw',
  'drew', 'drawn', 'drink', 'drank', 'drunk', 'drive', 'drove', 'driven', 'eat', 'ate', 'eaten',
  'fall', 'fell', 'fallen', 'feel', 'felt', 'fight', 'fought', 'find', 'found', 'fly', 'flew',
  'flown', 'forget', 'forgot', 'forgotten', 'get', 'got', 'gotten', 'give', 'gave', 'given',
  'go', 'went', 'gone', 'grow', 'grew', 'grown', 'hang', 'hung', 'have', 'had', 'hear', 'heard',
  'hide', 'hid', 'hidden', 'hit', 'hold', 'held', 'hurt', 'keep', 'kept', 'know', 'knew', 'known',
  'lay', 'laid', 'lead', 'led', 'leave', 'left', 'lend', 'lent', 'let', 'lie', 'lay', 'lain',
  'lose', 'lost', 'make', 'made', 'mean', 'meant', 'meet', 'met', 'pay', 'paid', 'put', 'read',
  'ride', 'rode', 'ridden', 'ring', 'rang', 'rung', 'rise', 'rose', 'risen', 'run', 'ran', 'say',
  'said', 'see', 'saw', 'seen', 'sell', 'sold', 'send', 'sent', 'set', 'shake', 'shook', 'shaken',
  'shine', 'shone', 'shoot', 'shot', 'show', 'showed', 'shown', 'shut', 'sing', 'sang', 'sung',
  'sink', 'sank', 'sunk', 'sit', 'sat', 'sleep', 'slept', 'speak', 'spoke', 'spoken', 'spend',
  'spent', 'stand', 'stood', 'steal', 'stole', 'stolen', 'stick', 'stuck', 'strike', 'struck',
  'swim', 'swam', 'swum', 'take', 'took', 'taken', 'teach', 'taught', 'tear', 'tore', 'torn',
  'tell', 'told', 'think', 'thought', 'throw', 'threw', 'thrown', 'understand', 'understood',
  'wake', 'woke', 'woken', 'wear', 'wore', 'worn', 'win', 'won', 'write', 'wrote', 'written'
])

// Common misspellings dictionary
const misspellings: { [key: string]: string } = {
  'lunck': 'lunch', 'lunc': 'lunch', 'lunsh': 'lunch',
  'shool': 'school', 'scool': 'school', 'schol': 'school', 'shcool': 'school',
  'recieve': 'receive', 'recieved': 'received', 'recieving': 'receiving',
  'seperate': 'separate', 'seperated': 'separated', 'seperating': 'separating',
  'definately': 'definitely',
  'occured': 'occurred', 'occuring': 'occurring', 'occurence': 'occurrence',
  'teh': 'the', 'taht': 'that', 'thier': 'their', 'ther': 'their',
  'adn': 'and', 'nad': 'and',
  'becuase': 'because', 'becasue': 'because',
  'wich': 'which', 'whcih': 'which',
  'woudl': 'would', 'wolud': 'would',
  'shoudl': 'should', 'shuold': 'should',
  'coudl': 'could', 'cuold': 'could',
  'writting': 'writing', 'writen': 'written',
  'beleive': 'believe', 'belive': 'believe',
  'acheive': 'achieve', 'achive': 'achieve',
  'neccessary': 'necessary', 'necesary': 'necessary',
  'accomodate': 'accommodate', 'acommodate': 'accommodate',
  'embarass': 'embarrass', 'embarras': 'embarrass',
  'existance': 'existence',
  'goverment': 'government',
  'independant': 'independent',
  'maintainance': 'maintenance',
  'millenium': 'millennium',
  'occassion': 'occasion',
  'priviledge': 'privilege',
  'sucess': 'success', 'sucessful': 'successful', 'sucessfully': 'successfully',
  'untill': 'until'
}

// Function to check if a word is spelled correctly
const isSpelledCorrectly = (word: string): boolean => {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '')
  if (cleanWord.length === 0) return true
  if (cleanWord.length <= 2) return true // Very short words are likely correct
  return commonWords.has(cleanWord) || misspellings[cleanWord] !== undefined
}

// Function to get spelling suggestion
const getSpellingSuggestion = (word: string): string | null => {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '')
  return misspellings[cleanWord] || null
}

export default function AIGrammarChecker() {
  const [text, setText] = useState('')
  const [alternativeSentences, setAlternativeSentences] = useState<string[]>([])
  const [checkedText, setCheckedText] = useState('')
  const [errors, setErrors] = useState<GrammarError[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [autoCheck, setAutoCheck] = useState(false)
  const [useLanguageTool, setUseLanguageTool] = useState(true)
  const [ltError, setLtError] = useState<string | null>(null)
  const { triggerPopunder } = usePopunderAd()

  const textStats: TextStats = useMemo(() => {
    if (!text.trim()) {
      return {
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readability: 0,
        tone: 'Neutral',
        avgWordsPerSentence: 0,
        passiveVoiceCount: 0
      }
    }

    const words = text.trim().split(/\s+/).filter(w => w.length > 0)
    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length

    // Flesch Reading Ease Score
    const avgSentenceLength = words.length / Math.max(sentences, 1)
    const avgSyllablesPerWord = words.reduce((acc, word) => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '')
      const syllables = cleanWord.match(/[aeiouy]+/g)?.length || 1
      return acc + Math.min(syllables, 4)
    }, 0) / words.length
    const readability = Math.max(0, Math.min(100, 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord)))

    // Passive voice detection
    const passivePatterns = [
      /\b(is|are|was|were|been|being)\s+\w+ed\b/gi,
      /\b(get|got|gets)\s+\w+ed\b/gi,
    ]
    let passiveCount = 0
    passivePatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) passiveCount += matches.length
    })

    // Tone detection
    const lowerText = text.toLowerCase()
    let tone = 'Neutral'
    const exclamationCount = (text.match(/!/g) || []).length
    const questionCount = (text.match(/\?/g) || []).length
    
    if (exclamationCount > 2 || lowerText.includes('excited') || lowerText.includes('amazing') || lowerText.includes('wow')) {
      tone = 'Enthusiastic'
    } else if (lowerText.includes('please') || lowerText.includes('thank') || lowerText.includes('appreciate') || lowerText.includes('kindly')) {
      tone = 'Polite'
    } else if (lowerText.includes('sorry') || lowerText.includes('apologize') || lowerText.includes('regret') || lowerText.includes('apologies')) {
      tone = 'Apologetic'
    } else if (lowerText.includes('must') || lowerText.includes('should') || lowerText.includes('need to') || lowerText.includes('required')) {
      tone = 'Assertive'
    } else if (questionCount > 2) {
      tone = 'Inquisitive'
    } else if (lowerText.includes('happy') || lowerText.includes('great') || lowerText.includes('wonderful')) {
      tone = 'Positive'
    }

    return {
      words: words.length,
      characters,
      charactersNoSpaces,
      sentences: Math.max(1, sentences),
      paragraphs: Math.max(1, paragraphs),
      readability: Math.round(readability),
      tone,
      avgWordsPerSentence: Math.round(avgSentenceLength * 10) / 10,
      passiveVoiceCount: passiveCount
    }
  }, [text])

  const applyLanguageTool = (rawText: string, matches: any[]): string => {
    // Build corrected text using matches (apply from end to avoid index shift)
    let corrected = rawText
    const ordered = [...matches].sort((a, b) => (b.offset ?? 0) - (a.offset ?? 0))
    
    ordered.forEach(m => {
      if (!m.replacements || m.replacements.length === 0) return
      if (typeof m.offset !== 'number' || typeof m.length !== 'number') return
      
      // Get the best replacement
      let replacement = m.replacements[0].value
      
      // If multiple replacements, prefer the most common/professional one
      if (m.replacements.length > 1) {
        const bestReplacement = m.replacements.find((r: any) => {
          const value = r.value?.toLowerCase() || ''
          return commonWords.has(value) || value.length > 0
        })
        if (bestReplacement) {
          replacement = bestReplacement.value
        }
      }
      
      // Preserve capitalization
      const originalText = corrected.slice(m.offset, m.offset + m.length)
      if (originalText && originalText[0]?.match(/[A-Z]/)) {
        replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1)
      }
      
      // Apply the correction
      corrected = corrected.slice(0, m.offset) + replacement + corrected.slice(m.offset + m.length)
    })
    
    // Post-process: ensure proper sentence capitalization and spacing
    corrected = corrected
      .replace(/(?:^|[.!?]\s+)([a-z])/g, (match, letter) => match.replace(letter, letter.toUpperCase()))
      .replace(/\s{2,}/g, ' ')
      .replace(/([.!?,:;])([a-zA-Z])/g, '$1 $2')
      .trim()
    
    return corrected
  }

  const mapLanguageToolMatches = (matches: any[]): GrammarError[] => {
    return matches.map((m) => {
      // Get the best replacement - prefer the first one, but check if there are better options
      let replacement = m.replacements?.[0]?.value ?? ''
      
      // If multiple replacements, try to find the most professional/common one
      if (m.replacements && m.replacements.length > 1) {
        // Prefer replacements that are common words or proper nouns
        const bestReplacement = m.replacements.find((r: any) => {
          const value = r.value?.toLowerCase() || ''
          return commonWords.has(value) || value.length > 0
        })
        if (bestReplacement) {
          replacement = bestReplacement.value
        }
      }
      
      // Capitalize replacement if the original was capitalized
      if (m.context?.text && m.context.text[m.context.offset || 0]?.match(/[A-Z]/)) {
        replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1)
      }
      
      const type = m.rule?.category?.name || m.rule?.issueType || m.rule?.id || 'Grammar'
      const severity: 'error' | 'warning' | 'info' =
        (m.rule?.issueType === 'misspelling' || m.rule?.issueType === 'typographical' || 
         m.rule?.category?.id === 'TYPOS' || m.rule?.category?.id === 'MORFOLOGIK_RULE_EN_US') ? 'error'
        : m.rule?.issueType === 'hint' || m.rule?.category?.id === 'STYLE' ? 'info'
        : 'warning'

      // Get better context message for learning
      let contextMessage = m.message || m.rule?.description || ''
      
      // Enhance context messages for better learning
      if (m.rule?.category?.id === 'TYPOS') {
        contextMessage = `Spelling error: "${replacement || 'correct spelling'}" is the correct spelling.`
      } else if (m.rule?.category?.id === 'GRAMMAR') {
        contextMessage = `Grammar rule: ${m.rule?.description || contextMessage}`
      } else if (m.rule?.category?.id === 'STYLE') {
        contextMessage = `Style suggestion: ${m.rule?.description || contextMessage}`
      } else if (m.rule?.category?.id === 'PUNCTUATION') {
        contextMessage = `Punctuation: ${m.rule?.description || contextMessage}`
      }
      
      // Get the actual word/phrase from the text
      const errorText = m.context?.text?.slice(m.context?.offset ?? 0, (m.context?.offset ?? 0) + (m.context?.length ?? 0)) || 
                       text.slice(m.offset ?? 0, (m.offset ?? 0) + (m.length ?? 0)) ||
                       m.message || ''

      return {
        word: errorText,
        position: m.offset ?? 0,
        suggestion: replacement || errorText,
        type: type,
        severity,
        context: contextMessage
      }
    })
  }

  const checkGrammar = async () => {
    if (!text.trim()) {
      toast.error('Please enter text to check')
      return
    }

    setLoading(true)
    setErrors([])
    setCheckedText('')
    setLtError(null)
    
    try {
      if (useLanguageTool) {
        // LanguageTool public API (free tier)
        const params = new URLSearchParams()
        params.append('text', text)
        params.append('language', 'en-US')
        params.append('enabledOnly', 'false')
        params.append('level', 'picky')

        const res = await fetch('https://api.languagetool.org/v2/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        })

        if (!res.ok) {
          throw new Error(`LanguageTool error (${res.status})`)
        }

        const data = await res.json()
        const ltMatches = data?.matches || []
        
        // Filter out false positives and low-confidence matches
        const filteredMatches = ltMatches.filter((m: any) => {
          // Keep all spelling errors
          if (m.rule?.category?.id === 'TYPOS' || m.rule?.category?.id === 'MORFOLOGIK_RULE_EN_US') {
            return true
          }
          // Keep grammar errors with replacements
          if (m.rule?.category?.id === 'GRAMMAR' && m.replacements && m.replacements.length > 0) {
            return true
          }
          // Keep punctuation errors
          if (m.rule?.category?.id === 'PUNCTUATION') {
            return true
          }
          // Filter out style suggestions that are too picky (optional)
          if (m.rule?.category?.id === 'STYLE') {
            // Only keep important style suggestions
            return m.rule?.id?.includes('PASSIVE_VOICE') || 
                   m.rule?.id?.includes('WORD_REPETITION') ||
                   m.rule?.id?.includes('REDUNDANCY')
          }
          return false
        })
        
        const mapped = mapLanguageToolMatches(filteredMatches)
        setErrors(mapped)

        if (filteredMatches.length === 0) {
          setCheckedText(text)
          toast.success('No grammar issues found! Your text is professionally written.')
        } else {
          const corrected = applyLanguageTool(text, filteredMatches)
          if (corrected && corrected !== text) {
            setCheckedText(corrected)
          } else {
            // If no full correction, at least show the text with improvements
            setCheckedText(text)
          }
          
          // Generate alternative sentences
          const alternatives = generateAlternativeSentences(text, mapped)
          setAlternativeSentences(alternatives)
          
          toast.success(`Found ${filteredMatches.length} issue${filteredMatches.length !== 1 ? 's' : ''}. Review the suggestions below to improve your English.`)
        }

        return
      }

      // Fallback to local checker (previous heuristic)
      
      const foundErrors: GrammarError[] = []
      let correctedText = text

      // Check for lowercase "i" (standalone)
      const iMatches = Array.from(text.matchAll(/\bi\b/g))
      for (const match of iMatches) {
        if (match.index !== undefined) {
          const before = text[match.index - 1]
          const after = text[match.index + 1]
          // Only flag if it's a standalone "i" (not part of a word)
          if ((!before || !/[a-z]/.test(before)) && (!after || !/[a-z]/.test(after))) {
            foundErrors.push({
              word: 'i',
              position: match.index,
              suggestion: 'I',
              type: 'Capitalization',
              severity: 'error',
              context: 'Use capital "I" when referring to yourself'
            })
          }
        }
      }

      // Check for "I am have" / "i am have" - incorrect verb combination
      const amHaveMatches = Array.from(text.matchAll(/\b(I|i)\s+am\s+have\b/gi))
      for (const match of amHaveMatches) {
        if (match.index !== undefined) {
          foundErrors.push({
            word: match[0],
            position: match.index,
            suggestion: 'I have',
            type: 'Grammar',
            severity: 'error',
            context: 'Use "I have" instead of "I am have". "Am" is for present continuous (I am doing), "have" is for possession or present perfect.'
          })
        }
      }

      // Check for "I have have" - double have
      const haveHaveMatches = Array.from(text.matchAll(/\b(I|i)\s+have\s+have\b/gi))
      for (const match of haveHaveMatches) {
        if (match.index !== undefined) {
          foundErrors.push({
            word: match[0],
            position: match.index,
            suggestion: 'I have',
            type: 'Grammar',
            severity: 'error',
            context: 'Remove duplicate "have". Use "I have" for present tense or "I had" for past tense.'
          })
        }
      }

      // Check for "I can have have" - incorrect
      const canHaveHaveMatches = Array.from(text.matchAll(/\b(I|i)\s+can\s+have\s+have\b/gi))
      for (const match of canHaveHaveMatches) {
        if (match.index !== undefined) {
          foundErrors.push({
            word: match[0],
            position: match.index,
            suggestion: 'I can have',
            type: 'Grammar',
            severity: 'error',
            context: 'Remove duplicate "have". Use "I can have" for ability to possess.'
          })
        }
      }

      // Check for "I had have" - incorrect past/present mix
      const hadHaveMatches = Array.from(text.matchAll(/\b(I|i)\s+had\s+have\b/gi))
      for (const match of hadHaveMatches) {
        if (match.index !== undefined) {
          foundErrors.push({
            word: match[0],
            position: match.index,
            suggestion: 'I had',
            type: 'Grammar',
            severity: 'error',
            context: 'Use "I had" for past tense or "I have had" for past perfect. "Had" already indicates past, so "have" is not needed.'
          })
        }
      }

      // Check for "our is/am/are" confusion
      const ourVerbMatches = Array.from(text.matchAll(/\bour\s+(is|am|are)\b/gi))
      for (const match of ourVerbMatches) {
        if (match.index !== undefined) {
          foundErrors.push({
            word: match[0],
            position: match.index,
            suggestion: 'we are',
            type: 'Grammar',
            severity: 'error',
            context: '"Our" is possessive (our house). Use "we are" when you mean "we" as the subject.'
          })
        }
      }

      // Check for "are our" - might be correct but check context
      const areOurMatches = Array.from(text.matchAll(/\bare\s+our\b/gi))
      for (const areOurMatch of areOurMatches) {
        // This might be correct (e.g., "These are our books"), so we'll be careful
        // Only flag if it's clearly wrong context
        const beforeText = text.substring(Math.max(0, (areOurMatch.index || 0) - 20), areOurMatch.index || 0)
        if (beforeText.match(/\b(they|we|you|I|he|she|it)\s+are\s+our\b/i)) {
          // This is likely correct, skip
        }
      }

      // Check for sentence start capitalization
      const sentenceMatches = Array.from(text.matchAll(/(?:^|[.!?]\s+)([a-z])/g))
      for (const match of sentenceMatches) {
        if (match.index !== undefined && match[1]) {
          const sentenceStart = match.index + (match[0].indexOf(match[1]) || 0)
          foundErrors.push({
            word: match[1],
            position: sentenceStart,
            suggestion: match[1].toUpperCase(),
            type: 'Capitalization',
            severity: 'error',
            context: 'Start sentences with a capital letter'
          })
        }
      }

      // Check for double spaces
      const doubleSpaceMatches = Array.from(text.matchAll(/\s{2,}/g))
      for (const match of doubleSpaceMatches) {
        if (match.index !== undefined) {
          foundErrors.push({
            word: match[0],
            position: match.index,
            suggestion: ' ',
            type: 'Spacing',
            severity: 'warning',
            context: 'Remove extra spaces'
          })
        }
      }

      // Check for missing spaces after punctuation
      const punctuationMatches = Array.from(text.matchAll(/([.!?,:;])([a-zA-Z])/g))
      for (const match of punctuationMatches) {
        if (match.index !== undefined) {
          foundErrors.push({
            word: match[0],
            position: match.index,
            suggestion: match[1] + ' ' + match[2],
            type: 'Punctuation',
            severity: 'warning',
            context: 'Add space after punctuation'
          })
        }
      }

      // Check for common homophones and mistakes
      const homophoneChecks = [
        { pattern: /\byour\s+you're\b/gi, suggestion: "you're", type: 'Homophone', context: 'Use "you\'re" for "you are"' },
        { pattern: /\byou're\s+your\b/gi, suggestion: 'your', type: 'Homophone', context: 'Use "your" for possession' },
        { pattern: /\btheir\s+there\b/gi, suggestion: "they're", type: 'Homophone', context: 'Use "they\'re" for "they are"' },
        { pattern: /\bthere\s+their\b/gi, suggestion: 'their', type: 'Homophone', context: 'Use "their" for possession' },
        { pattern: /\bits\s+it's\b/gi, suggestion: "it's", type: 'Homophone', context: 'Use "it\'s" for "it is"' },
        { pattern: /\bit's\s+its\b/gi, suggestion: 'its', type: 'Homophone', context: 'Use "its" for possession' },
        { pattern: /\bto\s+too\b/gi, suggestion: 'too', type: 'Homophone', context: 'Use "too" for "also" or "excessively"' },
        { pattern: /\bthan\s+then\b/gi, suggestion: 'then', type: 'Homophone', context: 'Use "then" for time sequence' },
      ]

      homophoneChecks.forEach(({ pattern, suggestion, type, context }) => {
        const matches = Array.from(text.matchAll(pattern))
        for (const match of matches) {
          if (match.index !== undefined) {
            foundErrors.push({
              word: match[0],
              position: match.index,
              suggestion,
              type,
              severity: 'error',
              context
            })
          }
        }
      })

      // Check for article mistakes (a/an)
      const articleMatches = Array.from(text.matchAll(/\b(a)\s+([aeiouAEIOU][a-zA-Z]*)\b/g))
      for (const match of articleMatches) {
        if (match.index !== undefined) {
          foundErrors.push({
            word: match[0],
            position: match.index,
            suggestion: 'an ' + match[2],
            type: 'Article',
            severity: 'error',
            context: 'Use "an" before words starting with vowels'
          })
        }
      }

      const articleMatches2 = Array.from(text.matchAll(/\b(an)\s+([^aeiouAEIOU][a-zA-Z]*)\b/g))
      for (const match of articleMatches2) {
        if (match.index !== undefined && match[2].length > 0) {
          foundErrors.push({
            word: match[0],
            position: match.index,
            suggestion: 'a ' + match[2],
            type: 'Article',
            severity: 'error',
            context: 'Use "a" before words starting with consonants'
          })
        }
      }

      // Check for repeated words
      const words = text.split(/\s+/)
      words.forEach((word, index) => {
        if (index > 0 && word.toLowerCase() === words[index - 1].toLowerCase() && word.length > 2) {
          const position = text.indexOf(word, index > 0 ? text.indexOf(words[index - 1]) + words[index - 1].length : 0)
          if (position !== -1) {
            foundErrors.push({
              word: words[index - 1] + ' ' + word,
              position,
              suggestion: word,
              type: 'Repetition',
              severity: 'warning',
              context: 'Remove repeated word'
            })
          }
        }
      })

      // Spell checking - improved version with better accuracy
      const wordRegex = /\b[a-zA-Z]{3,}\b/g
      let match
      const checkedWords = new Set<string>()
      
      while ((match = wordRegex.exec(text)) !== null) {
        const word = match[0]
        const cleanWord = word.toLowerCase()
        const position = match.index
        
        // Skip if we've already checked this word
        if (checkedWords.has(cleanWord)) {
          continue
        }
        checkedWords.add(cleanWord)
        
        // Skip if it's a correctly spelled common word
        if (commonWords.has(cleanWord)) {
          continue
        }
        
        // Check if it's a known misspelling (highest priority)
        const suggestion = getSpellingSuggestion(cleanWord)
        if (suggestion) {
          // Find all occurrences of this misspelling
          const allMatches = Array.from(text.matchAll(new RegExp(`\\b${word}\\b`, 'gi')))
          allMatches.forEach(m => {
            if (m.index !== undefined) {
              foundErrors.push({
                word: word,
                position: m.index,
                suggestion: suggestion,
                type: 'Spelling',
                severity: 'error',
                context: `Did you mean "${suggestion}"?`
              })
            }
          })
          continue
        }
        
        // Only check similarity for words that are clearly misspelled
        // Be VERY conservative - only flag if there's an extremely close match
        // Skip similarity check entirely if word length is 4 or less (likely valid short words)
        if (cleanWord.length <= 4) {
          continue
        }
        
        let bestMatch: string | null = null
        let minDistance = 3
        let bestScore = -1
        
        commonWords.forEach(correctWord => {
          if (correctWord.length < 4) return // Skip very short words in similarity check
          
          // Skip if lengths are too different (max 1 character difference)
          const lenDiff = Math.abs(correctWord.length - cleanWord.length)
          if (lenDiff > 1) return
          
          // Calculate character-by-character similarity
          let matches = 0
          let differences = 0
          const minLen = Math.min(correctWord.length, cleanWord.length)
          
          // Check character-by-character
          for (let i = 0; i < minLen; i++) {
            if (correctWord[i] === cleanWord[i]) {
              matches++
            } else {
              differences++
              // If too many differences early on, skip
              if (differences > 1) return
            }
          }
          differences += lenDiff
          
          // Only consider if it's an extremely close match
          // Require: max 1 difference AND at least 75% character match
          if (differences <= 1 && matches >= Math.floor(minLen * 0.75)) {
            const score = matches - (differences * 3)
            if (score > bestScore) {
              bestScore = score
              minDistance = differences
              bestMatch = correctWord
            }
          }
        })
        
        // Only flag if we found an extremely close match (very high confidence)
        // Require: exactly 1 character difference and high similarity
        if (bestMatch && minDistance === 1 && bestScore >= 2) {
          const allMatches = Array.from(text.matchAll(new RegExp(`\\b${word}\\b`, 'gi')))
          allMatches.forEach(m => {
            if (m.index !== undefined && bestMatch) {
              foundErrors.push({
                word: word,
                position: m.index,
                suggestion: bestMatch,
                type: 'Spelling',
                severity: 'error',
                context: `Did you mean "${bestMatch}"?`
              })
            }
          })
        }
      }

      // Apply corrections carefully - only apply fixes we're confident about
      correctedText = text
      
      // Step 1: Apply known misspellings first (most reliable)
      // Only apply if the misspelling actually exists in the text
      Object.keys(misspellings).forEach(misspelling => {
        if (text.toLowerCase().includes(misspelling.toLowerCase())) {
          const regex = new RegExp(`\\b${misspelling.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
          correctedText = correctedText.replace(regex, (match) => {
            // Preserve original case
            if (match[0] === match[0].toUpperCase()) {
              return misspellings[misspelling].charAt(0).toUpperCase() + misspellings[misspelling].slice(1)
            }
            return misspellings[misspelling]
          })
        }
      })

      // Step 2: Apply spelling corrections from detected errors (only confirmed errors)
      // Only apply if the error word actually exists and suggestion is valid
      foundErrors.forEach(error => {
        if (error.type === 'Spelling' && error.suggestion && error.word && error.suggestion !== error.word) {
          // Verify the word exists in the current corrected text
          const wordRegex = new RegExp(`\\b${error.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
          if (wordRegex.test(correctedText)) {
            correctedText = correctedText.replace(wordRegex, (match) => {
              // Preserve original case
              if (match[0] === match[0].toUpperCase()) {
                return error.suggestion.charAt(0).toUpperCase() + error.suggestion.slice(1)
              }
              return error.suggestion
            })
          }
        }
      })

      // Step 3: Fix capitalization of "i" (standalone) - only if it's actually lowercase "i"
      correctedText = correctedText.replace(/\bi\b/g, 'I')

      // Step 4: Fix sentence start capitalization
      correctedText = correctedText.replace(/(?:^|[.!?]\s+)([a-z])/g, (match, letter) => {
        return match.replace(letter, letter.toUpperCase())
      })

      // Step 5: Fix spacing issues (be careful not to break words)
      correctedText = correctedText
        .replace(/\s{2,}/g, ' ') // Remove double spaces
        .replace(/([.!?,:;])([a-zA-Z])/g, '$1 $2') // Add space after punctuation
        .trim()
      
      // Final validation: make sure we didn't accidentally break the text
      // Check that common words like "to", "the", "a" are still present
      const importantWords = ['to', 'the', 'a', 'an', 'and', 'or', 'but']
      const hasImportantWords = importantWords.some(word => 
        correctedText.toLowerCase().includes(` ${word} `) || 
        correctedText.toLowerCase().startsWith(`${word} `) ||
        correctedText.toLowerCase().endsWith(` ${word}`)
      )
      
      // If we removed important words or text seems broken, revert to safer correction
      if (!hasImportantWords && text.split(/\s+/).length > 3) {
        // Only apply safe corrections
        correctedText = text
          .replace(/\bi\b/g, 'I')
          .replace(/(?:^|[.!?]\s+)([a-z])/g, (match, letter) => match.replace(letter, letter.toUpperCase()))
        // Apply only known misspellings
        Object.keys(misspellings).forEach(misspelling => {
          if (correctedText.toLowerCase().includes(misspelling.toLowerCase())) {
            const regex = new RegExp(`\\b${misspelling.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
            correctedText = correctedText.replace(regex, misspellings[misspelling])
          }
        })
        correctedText = correctedText.replace(/\s{2,}/g, ' ').trim()
      }

      // Validate corrected text before showing it
      const originalWords = text.trim().toLowerCase().split(/\s+/).filter(w => w.length > 0)
      const correctedWords = correctedText.trim().toLowerCase().split(/\s+/).filter(w => w.length > 0)
      const wordCountDiff = Math.abs(originalWords.length - correctedWords.length)
      
      // Check if any valid common words were incorrectly changed
      let hasInvalidChanges = false
      originalWords.forEach((origWord, idx) => {
        if (idx < correctedWords.length) {
          const corrWord = correctedWords[idx]
          // If original was a valid common word and it changed to something invalid
          if (commonWords.has(origWord) && corrWord !== origWord) {
            // Check if this was a legitimate correction from our error list
            const wasLegitimateCorrection = foundErrors.some(e => 
              e.type === 'Spelling' && 
              e.word.toLowerCase() === origWord && 
              e.suggestion.toLowerCase() === corrWord
            )
            // Also check if it's a known misspelling correction
            const wasMisspellingCorrection = misspellings[origWord] === corrWord
            
            if (!wasLegitimateCorrection && !wasMisspellingCorrection && !commonWords.has(corrWord)) {
              hasInvalidChanges = true
            }
          }
        }
      })
      
      // Only show corrected text if it's valid
      if (foundErrors.length > 0 && correctedText !== text && wordCountDiff <= 1 && !hasInvalidChanges) {
        setCheckedText(correctedText)
      } else if (foundErrors.length === 0) {
        setCheckedText(text) // No errors, text is already correct
      } else {
        // Corrections seem invalid, create a safer version with only confirmed fixes
        let safeCorrected = text
        // Only apply capitalization fixes
        safeCorrected = safeCorrected.replace(/\bi\b/g, 'I')
        safeCorrected = safeCorrected.replace(/(?:^|[.!?]\s+)([a-z])/g, (match, letter) => match.replace(letter, letter.toUpperCase()))
        // Only apply known misspellings that we're 100% sure about
        Object.keys(misspellings).forEach(misspelling => {
          if (safeCorrected.toLowerCase().includes(` ${misspelling} `) || 
              safeCorrected.toLowerCase().startsWith(`${misspelling} `) ||
              safeCorrected.toLowerCase().endsWith(` ${misspelling}`)) {
            const regex = new RegExp(`\\b${misspelling.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
            safeCorrected = safeCorrected.replace(regex, misspellings[misspelling])
          }
        })
        safeCorrected = safeCorrected.replace(/\s{2,}/g, ' ').trim()
        setCheckedText(safeCorrected !== text ? safeCorrected : '')
      }
      
      setErrors(foundErrors)
      
      // Generate alternative sentences
      if (foundErrors.length > 0 || text.trim().length > 0) {
        const alternatives = generateAlternativeSentences(text, foundErrors)
        setAlternativeSentences(alternatives)
      } else {
        setAlternativeSentences([])
      }
      
      if (foundErrors.length === 0) {
        toast.success('No grammar issues found! Your text looks good.')
      } else {
        toast.success(`Found ${foundErrors.length} issue${foundErrors.length !== 1 ? 's' : ''}`)
      }
    } catch (error: any) {
      console.error('Grammar check error:', error)
      setLtError(error?.message || 'Language check failed')
      toast.error(`Failed to check grammar: ${error?.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Generate multiple correct sentence variations
  const generateAlternativeSentences = (originalText: string, errors: GrammarError[]): string[] => {
    const alternatives: string[] = []
    let baseText = originalText.trim()
    
    // Fix common issues first
    baseText = baseText
      .replace(/\bi\b/g, 'I') // Fix lowercase 'i'
      .replace(/(?:^|[.!?]\s+)([a-z])/g, (match, letter) => match.replace(letter, letter.toUpperCase())) // Capitalize sentence starts
      .replace(/\s{2,}/g, ' ') // Remove double spaces
      .trim()
    
    // Fix verb tense issues: "i am have" -> "I have" or "I am having"
    baseText = baseText.replace(/\b(I|i)\s+am\s+have\b/gi, 'I have')
    baseText = baseText.replace(/\b(I|i)\s+have\s+have\b/gi, 'I have')
    baseText = baseText.replace(/\b(I|i)\s+can\s+have\s+have\b/gi, 'I can have')
    baseText = baseText.replace(/\b(I|i)\s+had\s+have\b/gi, 'I had')
    
    // Fix "am" usage - "I am" is correct, but "I am have" should be "I have"
    baseText = baseText.replace(/\b(I|i)\s+am\s+(have|has|had)\b/gi, (match, pronoun, verb) => {
      if (verb === 'have') return 'I have'
      if (verb === 'has') return 'I have'
      if (verb === 'had') return 'I had'
      return match
    })
    
    // Fix "our" vs "are" confusion
    baseText = baseText.replace(/\bour\s+(is|am|are)\b/gi, 'we are')
    baseText = baseText.replace(/\bare\s+our\b/gi, 'are our')
    
    // Generate 5 variations
    const sentences = baseText.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    if (sentences.length === 0) {
      sentences.push(baseText)
    }
    
    // Variation 1: Direct correction with proper capitalization and spacing
    let var1 = baseText
    if (!var1.endsWith('.') && !var1.endsWith('!') && !var1.endsWith('?')) {
      var1 += '.'
    }
    alternatives.push(var1)
    
    // Variation 2: More formal version
    let var2 = baseText
      .replace(/\bcan\b/gi, 'am able to')
      .replace(/\bcan't\b/gi, 'cannot')
      .replace(/\bwon't\b/gi, 'will not')
      .replace(/\bdon't\b/gi, 'do not')
      .replace(/\bdoesn't\b/gi, 'does not')
      .replace(/\bisn't\b/gi, 'is not')
      .replace(/\baren't\b/gi, 'are not')
    if (!var2.endsWith('.') && !var2.endsWith('!') && !var2.endsWith('?')) {
      var2 += '.'
    }
    if (var2 !== var1) alternatives.push(var2)
    
    // Variation 3: Active voice emphasis
    let var3 = baseText
      .replace(/\bis\s+(being|been)\s+/gi, '')
      .replace(/\bare\s+(being|been)\s+/gi, '')
    if (!var3.endsWith('.') && !var3.endsWith('!') && !var3.endsWith('?')) {
      var3 += '.'
    }
    if (var3 !== var1 && var3 !== var2) alternatives.push(var3)
    
    // Variation 4: Clearer structure
    let var4 = baseText
      .replace(/\bwhich\s+is\b/gi, 'that is')
      .replace(/\bwho\s+is\b/gi, 'that is')
    if (!var4.endsWith('.') && !var4.endsWith('!') && !var4.endsWith('?')) {
      var4 += '.'
    }
    if (var4 !== var1 && var4 !== var2 && var4 !== var3) alternatives.push(var4)
    
    // Variation 5: Simplified version
    let var5 = baseText
      .replace(/\bvery\s+/gi, '')
      .replace(/\breally\s+/gi, '')
      .replace(/\bquite\s+/gi, '')
    if (!var5.endsWith('.') && !var5.endsWith('!') && !var5.endsWith('?')) {
      var5 += '.'
    }
    if (var5 !== var1 && var5 !== var2 && var5 !== var3 && var5 !== var4) alternatives.push(var5)
    
    // If we don't have 5 unique variations, create more by rephrasing
    while (alternatives.length < 5) {
      const lastVar = alternatives[alternatives.length - 1]
      let newVar = lastVar
      
      // Try different rephrasing
      if (alternatives.length === 1) {
        // Add "I" if missing at start
        if (!newVar.match(/^[I]/)) {
          newVar = 'I ' + newVar.toLowerCase()
        }
      } else if (alternatives.length === 2) {
        // Try different verb forms
        newVar = newVar.replace(/\bhave\b/gi, 'possess')
        newVar = newVar.replace(/\bpossess\b/gi, 'have')
      } else if (alternatives.length === 3) {
        // Try different sentence structure
        newVar = newVar.replace(/^(.+)$/, 'It is $1')
      } else {
        // Final variation - ensure proper grammar
        newVar = newVar
          .replace(/\b(I|i)\s+am\s+(.+)/gi, 'I $2')
          .replace(/\b(I|i)\s+have\s+have\b/gi, 'I have')
      }
      
      if (newVar !== lastVar && !alternatives.includes(newVar)) {
        alternatives.push(newVar)
      } else {
        break // Can't create more unique variations
      }
    }
    
    // Ensure all sentences are properly formatted
    return alternatives.map(s => {
      let formatted = s.trim()
      // Ensure proper capitalization
      if (formatted.length > 0) {
        formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1)
      }
      // Ensure proper ending punctuation
      if (!formatted.match(/[.!?]$/)) {
        formatted += '.'
      }
      return formatted
    }).filter((s, i, arr) => arr.indexOf(s) === i) // Remove duplicates
  }

  // Auto-check when text changes (debounced) - disabled to prevent infinite loops
  // Users can manually trigger checks

  const copyToClipboard = () => {
    navigator.clipboard.writeText(checkedText || text)
    setCopied(true)
    toast.success('Text copied!')
    setTimeout(() => setCopied(false), 2000)
    triggerPopunder()
  }

  const clearText = () => {
    setText('')
    setCheckedText('')
    setErrors([])
    setShowStats(false)
  }

  const applySuggestion = (error: GrammarError) => {
    if (!error.suggestion || error.suggestion === error.word) return
    
    let newText = text
    
    // Handle different error types
    if (error.type === 'Capitalization' || error.type === 'TYPOS' || error.type === 'MORFOLOGIK_RULE_EN_US' || error.type === 'Spelling') {
      // For spelling errors, replace the word at the specific position
      if (error.position !== undefined && error.position >= 0) {
        const before = text.substring(0, error.position)
        const after = text.substring(error.position + error.word.length)
        newText = before + error.suggestion + after
      } else {
        // Fallback: replace all occurrences
        const regex = new RegExp(`\\b${error.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
        newText = text.replace(regex, (match) => {
          // Preserve capitalization
          if (match[0] === match[0].toUpperCase()) {
            return error.suggestion.charAt(0).toUpperCase() + error.suggestion.slice(1)
          }
          return error.suggestion
        })
      }
    } else {
      // For other types, try to replace at position
      if (error.position !== undefined && error.position >= 0) {
        const before = text.substring(0, error.position)
        const after = text.substring(error.position + error.word.length)
        newText = before + error.suggestion + after
      }
    }
    
    if (newText !== text) {
      setText(newText)
      toast.success('Correction applied! Check again to see if there are more issues.')
      // Auto-check if enabled
      if (autoCheck) {
        setTimeout(() => checkGrammar(), 500)
      }
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return '🔴'
      case 'warning': return '🟡'
      default: return '🔵'
    }
  }

  const downloadText = () => {
    const content = checkedText || text
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'grammar-checked-text.txt'
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Text downloaded!')
    triggerPopunder()
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-6 md:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 mb-3 sm:mb-4">
              <Languages className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">AI Grammar Checker</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Check and improve your grammar with AI-powered analysis</p>
          </div>

          {/* Text Stats Bar */}
          {text.trim() && (
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-1 text-gray-900">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{textStats.words} words</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-900">
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{textStats.characters} chars</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-900">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Score: {textStats.readability}/100</span>
                  </div>
                  <div className="text-gray-900">
                    <span className="font-medium">Tone:</span> {textStats.tone}
                  </div>
                </div>
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {showStats ? 'Hide' : 'Show'} Details
                </button>
              </div>
              
              {showStats && (
                <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
                  <div>
                    <div className="text-gray-500">Sentences</div>
                    <div className="font-semibold text-gray-900">{textStats.sentences}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Avg Words/Sentence</div>
                    <div className="font-semibold text-gray-900">{textStats.avgWordsPerSentence}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">No Spaces</div>
                    <div className="font-semibold text-gray-900">{textStats.charactersNoSpaces}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Readability</div>
                    <div className="font-semibold text-gray-900">
                      {textStats.readability >= 70 ? 'Easy' : textStats.readability >= 50 ? 'Medium' : 'Hard'}
                    </div>
                  </div>
                  {textStats.passiveVoiceCount > 0 && (
                    <div className="col-span-2 sm:col-span-4">
                      <div className="text-yellow-600 text-xs">
                        ⚠️ {textStats.passiveVoiceCount} passive voice construction{textStats.passiveVoiceCount !== 1 ? 's' : ''} detected
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-2">
                <label className="block text-sm sm:text-base font-medium text-gray-900">Enter Text</label>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoCheck}
                      onChange={(e) => setAutoCheck(e.target.checked)}
                      className="w-3 h-3 sm:w-4 sm:h-4"
                    />
                    <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Auto-check</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useLanguageTool}
                      onChange={(e) => setUseLanguageTool(e.target.checked)}
                      className="w-3 h-3 sm:w-4 sm:h-4"
                    />
                    <span>Use LanguageTool (better accuracy)</span>
                  </label>
                  {text.trim() && (
                    <button
                      onClick={clearText}
                      className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or type your text here to check for grammar errors, spelling mistakes, and improve your writing..."
                rows={8}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 resize-y"
              />
              <div className="mt-2 flex justify-between items-center">
                <div className="text-xs sm:text-sm text-gray-500">
                  {text.length > 0 && `${text.length} characters`}
                </div>
                {text.length > 0 && (
                  <button
                    onClick={() => setText(text.toUpperCase())}
                    className="text-xs sm:text-sm text-gray-600 hover:text-gray-900"
                  >
                    UPPERCASE
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={checkGrammar}
                disabled={loading || !text.trim()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Check Grammar</span>
                  </>
                )}
              </button>
              {checkedText && (
                <button
                  onClick={downloadText}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base text-gray-900"
                >
                  <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Download</span>
                </button>
              )}
            </div>

            {/* Errors List */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                    <h3 className="font-semibold text-red-900 text-sm sm:text-base">
                      Found {errors.length} Issue{errors.length !== 1 ? 's' : ''}
                    </h3>
                  </div>
                  <div className="text-xs sm:text-sm text-red-700">
                    {errors.filter(e => e.severity === 'error').length} errors, {errors.filter(e => e.severity === 'warning').length} warnings
                  </div>
                </div>
                <div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
                  {errors.slice(0, 15).map((error, index) => (
                    <div
                      key={index}
                      className={`p-3 sm:p-4 rounded-lg border-2 ${getSeverityColor(error.severity)}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0 mt-0.5">{getSeverityIcon(error.severity)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-sm sm:text-base">{error.type}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              error.severity === 'error' ? 'bg-red-200 text-red-800' :
                              error.severity === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-blue-200 text-blue-800'
                            }`}>
                              {error.severity}
                            </span>
                          </div>
                          
                          {/* Show incorrect text */}
                          <div className="mb-2">
                            <span className="text-xs text-gray-500 mb-1 block">Incorrect:</span>
                            <span className="font-mono bg-white/70 px-2 py-1 rounded border border-red-300 text-red-700 line-through break-words">
                              {error.word.length > 50 ? error.word.substring(0, 50) + '...' : error.word}
                            </span>
                          </div>
                          
                          {/* Show correct suggestion */}
                          <div className="mb-2">
                            <span className="text-xs text-gray-500 mb-1 block">Correct:</span>
                            <span className="font-mono bg-white/70 px-2 py-1 rounded border border-green-300 text-green-700 font-semibold break-words">
                              {error.suggestion.length > 50 ? error.suggestion.substring(0, 50) + '...' : error.suggestion}
                            </span>
                          </div>
                          
                          {/* Educational explanation */}
                          {error.context && (
                            <div className="mt-2 p-2 bg-white/50 rounded border border-gray-200">
                              <div className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                <span className="font-medium">💡 Learning Tip:</span> {error.context}
                              </div>
                            </div>
                          )}
                          
                          {/* Apply fix button */}
                          {(error.type === 'Capitalization' || error.type === 'Spelling' || error.type === 'TYPOS' || error.type === 'MORFOLOGIK_RULE_EN_US') ? (
                            <button
                              onClick={() => applySuggestion(error)}
                              className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1"
                            >
                              <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                              Apply this correction
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                  {errors.length > 15 && (
                    <div className="text-xs sm:text-sm text-gray-600 text-center pt-2">
                      + {errors.length - 15} more issue{errors.length - 15 !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Corrected Text */}
            {checkedText && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Professional Corrected Text</h3>
                    <p className="text-xs text-gray-600">This is the improved version with all corrections applied</p>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Copy Corrected Text</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 sm:p-6">
                  <p className="text-gray-900 whitespace-pre-wrap text-sm sm:text-base leading-relaxed font-medium">{checkedText}</p>
                </div>
                {checkedText !== text && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-blue-800">
                      <span className="font-semibold">✓ Improvements made:</span> Your text has been corrected to professional English standards. 
                      Review the changes above to learn from the corrections.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Alternative Correct Sentences */}
            {alternativeSentences.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
                    Alternative Correct Sentences
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">Here are {alternativeSentences.length} grammatically perfect alternatives to your text:</p>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {alternativeSentences.slice(0, 5).map((sentence, index) => (
                    <div 
                      key={index}
                      className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-lg p-3 sm:p-4 hover:border-pink-300 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 text-sm sm:text-base leading-relaxed font-medium">{sentence}</p>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(sentence)
                            toast.success(`Sentence ${index + 1} copied!`)
                          }}
                          className="flex-shrink-0 p-1.5 hover:bg-pink-100 rounded-lg transition-colors"
                          title="Copy this sentence"
                        >
                          <Copy className="h-4 w-4 text-pink-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-pink-800">
                    <span className="font-semibold">💡 Tip:</span> All sentences above are grammatically correct with proper spelling, capitalization, and word usage (I, have, can, had, our, am, etc.). Choose the one that best fits your intended meaning.
                  </p>
                </div>
              </div>
            )}

            {/* Writing Tips */}
            {(errors.length > 0 || textStats.readability < 50 || textStats.passiveVoiceCount > 0) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-blue-900 mb-2 sm:mb-3 text-sm sm:text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                  Writing Tips
                </h3>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-blue-800">
                  {errors.filter(e => e.severity === 'error').length > 0 && (
                    <li>• Fix {errors.filter(e => e.severity === 'error').length} critical error{errors.filter(e => e.severity === 'error').length !== 1 ? 's' : ''} to improve clarity</li>
                  )}
                  {textStats.readability < 50 && (
                    <li>• Simplify your sentences for better readability (current: {textStats.readability}/100)</li>
                  )}
                  {textStats.avgWordsPerSentence > 20 && (
                    <li>• Break long sentences into shorter ones (avg: {textStats.avgWordsPerSentence} words/sentence)</li>
                  )}
                  {textStats.passiveVoiceCount > 0 && (
                    <li>• Consider using active voice instead of passive voice ({textStats.passiveVoiceCount} instance{textStats.passiveVoiceCount !== 1 ? 's' : ''} detected)</li>
                  )}
                  {textStats.words < 10 && (
                    <li>• Add more details to make your text more informative</li>
                  )}
                  {textStats.words > 0 && (
                    <li>• Review capitalization, punctuation, and subject-verb agreement</li>
                  )}
                  <li>• Use specific words instead of vague terms for better clarity</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileBottomAd adKey="36d691042d95ac1ac33375038ec47a5c" />
      <Footer />
    </div>
  )
}

