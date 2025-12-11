'use client'

import { useState, useMemo } from 'react'
import Footer from '@/components/Footer'
import MobileBottomAd from '@/components/MobileBottomAd'
import { Languages, Loader2, Copy, Check, Sparkles, X, Download, BarChart3, TrendingUp, FileText, Zap, RefreshCw, AlertCircle, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

interface Suggestion {
  original: string
  improved: string
  reason: string
  type: 'grammar' | 'spelling' | 'style' | 'punctuation' | 'clarity'
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
  readingTime: number
}

export default function EnglishImprovement() {
  const [text, setText] = useState('')
  const [improvedText, setImprovedText] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showStats, setShowStats] = useState(true)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [lastPopunderTime, setLastPopunderTime] = useState(0)
  const { triggerPopunder } = usePopunderAd()
  
  // Debounced popunder trigger - only allow once per 10 seconds
  const safeTriggerPopunder = () => {
    const now = Date.now()
    if (now - lastPopunderTime > 10000) {
      setLastPopunderTime(now)
      try {
        triggerPopunder()
      } catch (error) {
        // Silently fail to prevent breaking the app
        console.warn('Popunder trigger failed:', error)
      }
    }
  }

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
        passiveVoiceCount: 0,
        readingTime: 0
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
    } else if (lowerText.includes('sorry') || lowerText.includes('apologize') || lowerText.includes('regret')) {
      tone = 'Apologetic'
    } else if (lowerText.includes('must') || lowerText.includes('should') || lowerText.includes('need to')) {
      tone = 'Assertive'
    } else if (questionCount > 2) {
      tone = 'Inquisitive'
    } else if (lowerText.includes('happy') || lowerText.includes('great') || lowerText.includes('wonderful')) {
      tone = 'Positive'
    } else if (lowerText.includes('unfortunately') || lowerText.includes('problem') || lowerText.includes('issue')) {
      tone = 'Concerned'
    }

    // Reading time (average 200 words per minute)
    const readingTime = Math.ceil(words.length / 200)

    return {
      words: words.length,
      characters,
      charactersNoSpaces,
      sentences: Math.max(sentences, 1),
      paragraphs: Math.max(paragraphs, 1),
      readability: Math.round(readability),
      tone,
      avgWordsPerSentence: Math.round(avgSentenceLength * 10) / 10,
      passiveVoiceCount: passiveCount,
      readingTime
    }
  }, [text])

  const improve = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to improve')
      return
    }

    setLoading(true)
    try {
      let improved = text.trim()
      const suggestionsList: Suggestion[] = []
      
      // STEP 0: Use LanguageTool API for professional grammar checking (free, no API key needed)
      try {
        const languageToolResponse = await fetch('https://api.languagetool.org/v2/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            text: improved,
            language: 'en-US',
            enabledOnly: 'false',
          }),
        })
        
        if (languageToolResponse.ok) {
          const ltData = await languageToolResponse.json()
          
          // Apply LanguageTool suggestions in reverse order to maintain correct positions
          if (ltData.matches && ltData.matches.length > 0) {
            const sortedMatches = [...ltData.matches].sort((a, b) => b.offset - a.offset)
            
            sortedMatches.forEach((match: any) => {
              if (match.replacements && match.replacements.length > 0) {
                const bestReplacement = match.replacements[0].value
                const originalText = improved.substring(match.offset, match.offset + match.length)
                
                // Only apply if the replacement is different and makes sense
                if (bestReplacement !== originalText && bestReplacement.trim().length > 0) {
                  improved = improved.substring(0, match.offset) + 
                             bestReplacement + 
                             improved.substring(match.offset + match.length)
                  
                  // Add to suggestions list
                  const errorType = match.rule?.category?.id || 'grammar'
                  suggestionsList.push({
                    original: originalText,
                    improved: bestReplacement,
                    reason: match.message || match.rule?.description || 'Grammar improvement',
                    type: errorType.includes('TYPOS') ? 'spelling' : 
                          errorType.includes('STYLE') ? 'style' : 
                          errorType.includes('PUNCTUATION') ? 'punctuation' : 
                          errorType.includes('GRAMMAR') ? 'grammar' : 'clarity'
                  })
                }
              }
            })
          }
        }
      } catch (ltError) {
        // If LanguageTool API fails, continue with rule-based improvements
        console.warn('LanguageTool API unavailable, using rule-based improvements:', ltError)
      }
      
      // Calculate sentence count for use in the function
      const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
      
      // STEP 1: Fix sentence structure issues first (before other corrections)
      // Fix "I am name is [name]" or "i am name is [name]" → "My name is [Name]"
      improved = improved.replace(/\b(I|i)\s+am\s+name\s+is\s+(\w+)/gi, (match, pronoun, name) => {
        // Capitalize the name properly
        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        return `My name is ${capitalizedName}`
      })
      if (/\b(I|i)\s+am\s+name\s+is\b/gi.test(text)) {
        suggestionsList.push({
          original: 'I am name is',
          improved: 'My name is',
          reason: 'Fixed redundant verb structure - use "My name is" instead of "I am name is"',
          type: 'grammar'
        })
      }
      
      // Fix "I am [name]" - capitalize the name (but not common words like "here", "there", etc.)
      const commonWordsAfterAm = ['here', 'there', 'fine', 'good', 'ok', 'okay', 'well', 'sick', 'tired', 'happy', 'sad', 'ready', 'done', 'finished', 'busy', 'free', 'available', 'away', 'back', 'home', 'out', 'in', 'up', 'down']
      improved = improved.replace(/\b(I|i)\s+am\s+([a-z][a-z]+)(\s|$|\.|,|!|\?)/gi, (match, pronoun, name, ending) => {
        const lowerName = name.toLowerCase()
        // Don't capitalize common words after "I am"
        if (commonWordsAfterAm.includes(lowerName)) {
          return `I am ${lowerName}${ending}`
        }
        // Capitalize names that appear after "I am"
        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1)
        return `I am ${capitalizedName}${ending}`
      })
      
      // Fix "am" and "is" together (redundant verbs)
      if (/\bam\s+is\b/gi.test(improved)) {
        improved = improved.replace(/\bam\s+is\b/gi, 'is')
        suggestionsList.push({
          original: 'am is',
          improved: 'is',
          reason: 'Removed redundant verb - use only one verb',
          type: 'grammar'
        })
      }
      
      // Fix "is is" (double verb)
      if (/\bis\s+is\b/gi.test(improved)) {
        improved = improved.replace(/\bis\s+is\b/gi, 'is')
        suggestionsList.push({
          original: 'is is',
          improved: 'is',
          reason: 'Removed duplicate verb',
          type: 'grammar'
        })
      }
      
      // Fix "are are"
      if (/\bare\s+are\b/gi.test(improved)) {
        improved = improved.replace(/\bare\s+are\b/gi, 'are')
        suggestionsList.push({
          original: 'are are',
          improved: 'are',
          reason: 'Removed duplicate verb',
          type: 'grammar'
        })
      }
      
      // Fix common typos first (before capitalization fixes)
      // Fix "j" typo → "I" (common keyboard typo)
      if (/\bj\s+(was|am|will|have|had|do|did|can|could|should|would)\b/gi.test(improved)) {
        improved = improved.replace(/\bj\s+(was|am|will|have|had|do|did|can|could|should|would)\b/gi, 'I $1')
        suggestionsList.push({
          original: 'j [verb]',
          improved: 'I [verb]',
          reason: 'Fixed typo: "j" should be "I"',
          type: 'spelling'
        })
      }
      
      // Fix capitalization of "I"
      if (/\bi\b/.test(improved)) {
        improved = improved.replace(/\bi\b/g, 'I')
        if (!suggestionsList.some(s => s.original === 'i')) {
          suggestionsList.push({
            original: 'i',
            improved: 'I',
            reason: 'First person pronoun should be capitalized',
            type: 'grammar'
          })
        }
      }
      
      // Fix common contractions
      const contractions = [
        { wrong: /\bwont\b/gi, correct: "won't", reason: "Use proper contraction", type: 'punctuation' as const },
        { wrong: /\bcant\b/gi, correct: "can't", reason: "Use proper contraction", type: 'punctuation' as const },
        { wrong: /\bdont\b/gi, correct: "don't", reason: "Use proper contraction", type: 'punctuation' as const },
        { wrong: /\bisnt\b/gi, correct: "isn't", reason: "Use proper contraction", type: 'punctuation' as const },
        { wrong: /\barent\b/gi, correct: "aren't", reason: "Use proper contraction", type: 'punctuation' as const },
        { wrong: /\bwasnt\b/gi, correct: "wasn't", reason: "Use proper contraction", type: 'punctuation' as const },
        { wrong: /\bwerent\b/gi, correct: "weren't", reason: "Use proper contraction", type: 'punctuation' as const },
        { wrong: /\bhavent\b/gi, correct: "haven't", reason: "Use proper contraction", type: 'punctuation' as const },
        { wrong: /\bhasnt\b/gi, correct: "hasn't", reason: "Use proper contraction", type: 'punctuation' as const },
        { wrong: /\bhadnt\b/gi, correct: "hadn't", reason: "Use proper contraction", type: 'punctuation' as const },
        { wrong: /\bwouldnt\b/gi, correct: "wouldn't", reason: "Use proper contraction", type: 'punctuation' as const },
        { wrong: /\bcouldnt\b/gi, correct: "couldn't", reason: "Use proper contraction", type: 'punctuation' as const },
        { wrong: /\bshouldnt\b/gi, correct: "shouldn't", reason: "Use proper contraction", type: 'punctuation' as const },
        { wrong: /\bim\b/gi, correct: "I'm", reason: "Use proper contraction", type: 'punctuation' as const },
        { wrong: /\byoure\b/gi, correct: "you're", reason: "Use proper contraction", type: 'punctuation' as const },
        { wrong: /\btheyre\b/gi, correct: "they're", reason: "Use proper contraction", type: 'punctuation' as const },
        { wrong: /\bwere\b/gi, correct: "we're", reason: "Use proper contraction", type: 'punctuation' as const },
      ]
      
      contractions.forEach(({ wrong, correct, reason, type }) => {
        if (wrong.test(improved)) {
          const matches = improved.match(wrong)
          if (matches) {
            suggestionsList.push({
              original: matches[0],
              improved: correct,
              reason: reason,
              type
            })
          }
          improved = improved.replace(wrong, correct)
        }
      })
      
      // Fix double spaces
      if (/\s{2,}/.test(improved)) {
        improved = improved.replace(/\s{2,}/g, ' ')
        suggestionsList.push({
          original: 'multiple spaces',
          improved: 'single space',
          reason: 'Remove extra spaces for better readability',
          type: 'style'
        })
      }
      
      // Fix common grammar mistakes
      improved = improved.replace(/\byour\s+(?:so|very|really|too)\b/gi, (match) => {
        if (match.toLowerCase().includes('your so')) {
          suggestionsList.push({
            original: 'your so',
            improved: "you're so",
            reason: "Use 'you're' (you are) instead of 'your' (possessive)",
            type: 'grammar'
          })
          return match.replace(/\byour\b/gi, "you're")
        }
        return match
      })
      
      improved = improved.replace(/\btheir\s+(?:is|are|was|were)\b/gi, (match) => {
        suggestionsList.push({
          original: match,
          improved: match.replace(/\btheir\b/gi, "there"),
          reason: "Use 'there' for existence, not 'their' (possessive)",
          type: 'grammar'
        })
        return match.replace(/\btheir\b/gi, "there")
      })
      
      improved = improved.replace(/\bits\s+(?:is|was|will|has|had)\b/gi, (match) => {
        suggestionsList.push({
          original: match,
          improved: match.replace(/\bits\b/gi, "it's"),
          reason: "Use 'it's' (it is) instead of 'its' (possessive) when followed by a verb",
          type: 'grammar'
        })
        return match.replace(/\bits\b/gi, "it's")
      })
      
      // Capitalize first letter of sentence
      improved = improved.trim()
      if (improved.length > 0 && !/[A-Z]/.test(improved[0])) {
        improved = improved.charAt(0).toUpperCase() + improved.slice(1)
        suggestionsList.push({
          original: 'lowercase start',
          improved: 'capitalized start',
          reason: 'Sentences should start with a capital letter',
          type: 'grammar'
        })
      }
      
      // Add period at end if missing (only if it's a single sentence)
      const trimmed = improved.trim()
      if (trimmed.length > 0 && !/[.!?]$/.test(trimmed) && sentenceCount === 1) {
        improved = trimmed + '.'
        suggestionsList.push({
          original: 'missing punctuation',
          improved: 'added period',
          reason: 'Sentences should end with proper punctuation',
          type: 'punctuation'
        })
      }
      
      // STEP 2: Fix common word mistakes and spelling
      const wordFixes = [
        { wrong: /\bcam\b/gi, correct: 'came', reason: 'Correct spelling - past tense of come', type: 'spelling' as const },
        { wrong: /\bharshita\b/gi, correct: 'Harshita', reason: 'Capitalize proper noun (name)', type: 'grammar' as const },
        { wrong: /\bshool\b/gi, correct: 'school', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bscool\b/gi, correct: 'school', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bschol\b/gi, correct: 'school', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bshcool\b/gi, correct: 'school', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\brecieve\b/gi, correct: 'receive', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bseperate\b/gi, correct: 'separate', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bdefinately\b/gi, correct: 'definitely', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\boccured\b/gi, correct: 'occurred', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bteh\b/gi, correct: 'the', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\btaht\b/gi, correct: 'that', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bthier\b/gi, correct: 'their', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\badn\b/gi, correct: 'and', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bnad\b/gi, correct: 'and', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bbecuase\b/gi, correct: 'because', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bbecasue\b/gi, correct: 'because', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bwich\b/gi, correct: 'which', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bwoudl\b/gi, correct: 'would', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bshoudl\b/gi, correct: 'should', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bcoudl\b/gi, correct: 'could', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bwritting\b/gi, correct: 'writing', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bbeleive\b/gi, correct: 'believe', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bacheive\b/gi, correct: 'achieve', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bneccessary\b/gi, correct: 'necessary', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\baccomodate\b/gi, correct: 'accommodate', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bembarass\b/gi, correct: 'embarrass', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bexistance\b/gi, correct: 'existence', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bgoverment\b/gi, correct: 'government', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bindependant\b/gi, correct: 'independent', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bmaintainance\b/gi, correct: 'maintenance', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\bpriviledge\b/gi, correct: 'privilege', reason: 'Correct spelling', type: 'spelling' as const },
        { wrong: /\buntill\b/gi, correct: 'until', reason: 'Correct spelling', type: 'spelling' as const },
      ]
      
      wordFixes.forEach(({ wrong, correct, reason, type }) => {
        if (wrong.test(improved)) {
          const matches = improved.match(wrong)
          if (matches) {
            suggestionsList.push({
              original: matches[0],
              improved: correct,
              reason: reason,
              type
            })
          }
          improved = improved.replace(wrong, correct)
        }
      })

      // Style improvements
      // Replace "very" with stronger alternatives
      const veryReplacements = [
        { pattern: /\bvery\s+good\b/gi, replacement: 'excellent', reason: "Use 'excellent' instead of 'very good' for stronger impact", type: 'style' as const },
        { pattern: /\bvery\s+bad\b/gi, replacement: 'terrible', reason: "Use 'terrible' instead of 'very bad' for stronger impact", type: 'style' as const },
        { pattern: /\bvery\s+important\b/gi, replacement: 'crucial', reason: "Use 'crucial' instead of 'very important' for stronger impact", type: 'style' as const },
      ]

      veryReplacements.forEach(({ pattern, replacement, reason, type }) => {
        if (pattern.test(improved)) {
          improved = improved.replace(pattern, replacement)
          suggestionsList.push({
            original: pattern.source,
            improved: replacement,
            reason,
            type
          })
        }
      })

      // Clarity improvements
      // Replace "a lot" with "many" or "much"
      if (/\ba\s+lot\s+of\b/gi.test(improved)) {
        improved = improved.replace(/\ba\s+lot\s+of\b/gi, 'many')
        suggestionsList.push({
          original: 'a lot of',
          improved: 'many',
          reason: "Use 'many' instead of 'a lot of' for more formal writing",
          type: 'clarity'
        })
      }

      // Fix redundant prepositions (e.g., "to from" → "from", "back to from" → "back from")
      // Check for "back to from" first (more specific pattern)
      if (/\bback\s+to\s+from\b/gi.test(improved)) {
        improved = improved.replace(/\bback\s+to\s+from\b/gi, 'back from')
        if (!suggestionsList.some(s => s.original === 'back to from')) {
          suggestionsList.push({
            original: 'back to from',
            improved: 'back from',
            reason: "Remove redundant preposition 'to'",
            type: 'grammar'
          })
        }
      }
      // Then check for general "to from" pattern (must have word boundaries)
      if (/\bto\s+from\b/gi.test(improved)) {
        improved = improved.replace(/\bto\s+from\b/gi, 'from')
        if (!suggestionsList.some(s => s.original === 'to from')) {
          suggestionsList.push({
            original: 'to from',
            improved: 'from',
            reason: "Remove redundant preposition 'to'",
            type: 'grammar'
          })
        }
      }
      // Check for "from to" pattern
      if (/\bfrom\s+to\b/gi.test(improved)) {
        improved = improved.replace(/\bfrom\s+to\b/gi, 'to')
        if (!suggestionsList.some(s => s.original === 'from to')) {
          suggestionsList.push({
            original: 'from to',
            improved: 'to',
            reason: "Remove redundant preposition 'from'",
            type: 'grammar'
          })
        }
      }
      
      // STEP 3: Fix subject-verb agreement and sentence structure
      // Fix "I is" → "I am"
      if (/\bI\s+is\b/gi.test(improved)) {
        improved = improved.replace(/\bI\s+is\b/gi, 'I am')
        suggestionsList.push({
          original: 'I is',
          improved: 'I am',
          reason: 'Subject-verb agreement: "I" requires "am", not "is"',
          type: 'grammar'
        })
      }
      
      // Fix "you is" → "you are"
      if (/\byou\s+is\b/gi.test(improved)) {
        improved = improved.replace(/\byou\s+is\b/gi, 'you are')
        suggestionsList.push({
          original: 'you is',
          improved: 'you are',
          reason: 'Subject-verb agreement: "you" requires "are", not "is"',
          type: 'grammar'
        })
      }
      
      // Fix "he are" or "she are" → "he is" or "she is"
      if (/\b(he|she|it)\s+are\b/gi.test(improved)) {
        improved = improved.replace(/\b(he|she|it)\s+are\b/gi, (match, subj) => `${subj} is`)
        suggestionsList.push({
          original: 'he/she/it are',
          improved: 'he/she/it is',
          reason: 'Subject-verb agreement: singular subjects require "is"',
          type: 'grammar'
        })
      }
      
      // Fix "they is" → "they are"
      if (/\bthey\s+is\b/gi.test(improved)) {
        improved = improved.replace(/\bthey\s+is\b/gi, 'they are')
        suggestionsList.push({
          original: 'they is',
          improved: 'they are',
          reason: 'Subject-verb agreement: "they" requires "are", not "is"',
          type: 'grammar'
        })
      }
      
      // STEP 4: Capitalize proper nouns (names) - common names
      const commonNames = ['harshita', 'john', 'mary', 'david', 'sarah', 'michael', 'emily', 'james', 'jennifer', 'robert', 'lisa', 'william', 'jessica', 'richard', 'ashley', 'joseph', 'amanda', 'thomas', 'melissa', 'charles', 'michelle', 'daniel', 'kimberly', 'matthew', 'amy', 'anthony', 'angela', 'mark', 'rebecca', 'donald', 'virginia', 'steven', 'kathleen', 'paul', 'pamela', 'andrew', 'martha', 'joshua', 'debra', 'kenneth', 'rachel', 'kevin', 'carolyn', 'brian', 'janet', 'george', 'catherine', 'edward', 'frances', 'ronald', 'ann', 'timothy', 'joyce', 'jason', 'diane', 'jeffrey', 'alice', 'ryan', 'julie', 'jacob', 'heather', 'gary', 'teresa', 'nicholas', 'doris', 'eric', 'gloria', 'jonathan', 'evelyn', 'stephen', 'jean', 'larry', 'cheryl', 'justin', 'mildred', 'scott', 'katherine', 'brandon', 'joan', 'benjamin', 'judith', 'samuel', 'rose', 'frank', 'janice', 'gregory', 'kelly', 'raymond', 'nicole', 'alexander', 'judy', 'patrick', 'christina', 'jack', 'maria', 'dennis', 'frances', 'jerry', 'ann', 'tyler', 'helen', 'aaron', 'sandra', 'jose', 'donna', 'henry', 'carol', 'adam', 'ruth', 'douglas', 'sharon', 'nathan', 'michelle', 'zachary', 'laura', 'kyle', 'sarah', 'noah', 'kimberly', 'e than', 'deborah']
      
      commonNames.forEach(name => {
        const regex = new RegExp(`\\b${name}\\b`, 'gi')
        if (regex.test(improved)) {
          // Only capitalize if it's not already capitalized and appears to be a name (after "is", "am", "name is", etc.)
          improved = improved.replace(regex, (match, offset, string) => {
            // Check if it's likely a name (after "is", "am", "name is", "called", "named", etc.)
            const before = string.substring(Math.max(0, offset - 20), offset).toLowerCase()
            const isNameContext = /\b(is|am|are|was|were|name\s+is|called|named|my\s+name|i\s+am)\s+$/.test(before)
            
            if (isNameContext && match[0] === match[0].toLowerCase()) {
              return name.charAt(0).toUpperCase() + name.slice(1)
            }
            return match
          })
        }
      })
      
      // STEP 5: Fix article usage
      // Fix "a apple" → "an apple"
      if (/\ba\s+[aeiouAEIOU]/g.test(improved)) {
        improved = improved.replace(/\ba\s+([aeiouAEIOU][a-z]+)/g, (match, word) => {
          return `an ${word}`
        })
        if (!suggestionsList.some(s => s.original.includes('a apple') || s.original.includes('a orange'))) {
          suggestionsList.push({
            original: 'a [vowel]',
            improved: 'an [vowel]',
            reason: 'Use "an" before words starting with a vowel sound',
            type: 'grammar'
          })
        }
      }
      
      // Fix "an book" → "a book" (before consonants)
      improved = improved.replace(/\ban\s+([bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ][a-z]+)/g, (match, word) => {
        // Don't fix if it's "an hour" or "an honor" (silent h)
        if (word.toLowerCase().startsWith('hour') || word.toLowerCase().startsWith('honor')) {
          return match
        }
        return `a ${word}`
      })
      
      // STEP 6: Fix redundant words and phrases
      // Remove "very very" → "very"
      if (/\bvery\s+very\b/gi.test(improved)) {
        improved = improved.replace(/\bvery\s+very\b/gi, 'very')
        suggestionsList.push({
          original: 'very very',
          improved: 'very',
          reason: 'Remove redundant intensifier',
          type: 'style'
        })
      }
      
      // Fix "the the" → "the"
      if (/\bthe\s+the\b/gi.test(improved)) {
        improved = improved.replace(/\bthe\s+the\b/gi, 'the')
        suggestionsList.push({
          original: 'the the',
          improved: 'the',
          reason: 'Remove duplicate article',
          type: 'grammar'
        })
      }
      
      // Fix "a a" → "a"
      if (/\ba\s+a\b/gi.test(improved)) {
        improved = improved.replace(/\ba\s+a\b/gi, 'a')
        suggestionsList.push({
          original: 'a a',
          improved: 'a',
          reason: 'Remove duplicate article',
          type: 'grammar'
        })
      }
      
      // Fix duplicate words (common issue)
      // Fix "and and" → "and"
      if (/\band\s+and\b/gi.test(improved)) {
        improved = improved.replace(/\band\s+and\b/gi, 'and')
        suggestionsList.push({
          original: 'and and',
          improved: 'and',
          reason: 'Remove duplicate word',
          type: 'grammar'
        })
      }
      
      // Fix "the the" → "the" (if not already fixed)
      if (/\bthe\s+the\b/gi.test(improved)) {
        improved = improved.replace(/\bthe\s+the\b/gi, 'the')
        if (!suggestionsList.some(s => s.original === 'the the')) {
          suggestionsList.push({
            original: 'the the',
            improved: 'the',
            reason: 'Remove duplicate article',
            type: 'grammar'
          })
        }
      }
      
      // Fix "to to" → "to"
      if (/\bto\s+to\b/gi.test(improved)) {
        improved = improved.replace(/\bto\s+to\b/gi, 'to')
        suggestionsList.push({
          original: 'to to',
          improved: 'to',
          reason: 'Remove duplicate word',
          type: 'grammar'
        })
      }
      
      // Fix "for for" → "for"
      if (/\bfor\s+for\b/gi.test(improved)) {
        improved = improved.replace(/\bfor\s+for\b/gi, 'for')
        suggestionsList.push({
          original: 'for for',
          improved: 'for',
          reason: 'Remove duplicate word',
          type: 'grammar'
        })
      }
      
      // STEP 7: Fix possessive pronouns
      // Fix "you pleasure" → "your pleasure"
      if (/\bthank\s+you\s+for\s+you\s+pleasure\b/gi.test(improved)) {
        improved = improved.replace(/\bthank\s+you\s+for\s+you\s+pleasure\b/gi, 'thank you for your pleasure')
        suggestionsList.push({
          original: 'thank you for you pleasure',
          improved: 'thank you for your pleasure',
          reason: 'Use possessive pronoun "your" instead of "you"',
          type: 'grammar'
        })
      }
      // Fix "for you [noun]" when it should be "for your [noun]"
      improved = improved.replace(/\bfor\s+you\s+([a-z]+)\b/gi, (match, noun) => {
        // Common nouns that need possessive
        const possessiveNouns = ['pleasure', 'help', 'support', 'time', 'attention', 'patience', 'understanding', 'kindness', 'generosity', 'assistance', 'cooperation', 'consideration']
        if (possessiveNouns.includes(noun.toLowerCase())) {
          return `for your ${noun}`
        }
        return match
      })
      
      // Fix "you [noun]" when it should be "your [noun]" in certain contexts
      improved = improved.replace(/\bthank\s+you\s+for\s+you\s+(\w+)\b/gi, 'thank you for your $1')
      
      // Fix "for you" when followed by common nouns needing possessive
      improved = improved.replace(/\bfor\s+you\s+(pleasure|help|support|time|attention|patience|understanding|kindness|generosity|assistance|cooperation|consideration)\b/gi, 'for your $1')
      
      // STEP 8: Fix common phrase improvements
      // Fix "since last night or day" → "since last night" or "since yesterday"
      if (/\bsince\s+last\s+night\s+or\s+day\b/gi.test(improved)) {
        improved = improved.replace(/\bsince\s+last\s+night\s+or\s+day\b/gi, 'since last night')
        suggestionsList.push({
          original: 'since last night or day',
          improved: 'since last night',
          reason: 'Removed redundant phrase - "since last night" is clearer',
          type: 'clarity'
        })
      }
      
      // Fix "i will make this" → "I will do this" or "I will complete this"
      if (/\b(I|i)\s+will\s+make\s+this\b/gi.test(improved)) {
        improved = improved.replace(/\b(I|i)\s+will\s+make\s+this\b/gi, 'I will complete this')
        suggestionsList.push({
          original: 'I will make this',
          improved: 'I will complete this',
          reason: 'Use "complete" for tasks - clearer and more professional',
          type: 'clarity'
        })
      }
      
      // Fix "make this" when it means "do this" or "complete this"
      improved = improved.replace(/\bwill\s+make\s+this\s+(tonight|today|tomorrow|now)\b/gi, 'will complete this $1')
      
      // STEP 9: Fix excessive punctuation
      // Fix multiple exclamation marks (!!! → !)
      if (/!{2,}/g.test(improved)) {
        improved = improved.replace(/!{2,}/g, '!')
        suggestionsList.push({
          original: 'multiple exclamation marks',
          improved: 'single exclamation mark',
          reason: 'Use only one exclamation mark for professional writing',
          type: 'style'
        })
      }
      
      // Fix multiple periods (..... → .)
      if (/\.{3,}/g.test(improved)) {
        improved = improved.replace(/\.{3,}/g, '.')
        suggestionsList.push({
          original: 'multiple periods',
          improved: 'single period',
          reason: 'Use only one period to end sentences',
          type: 'punctuation'
        })
      }
      
      // Fix multiple question marks (??? → ?)
      if (/\?{2,}/g.test(improved)) {
        improved = improved.replace(/\?{2,}/g, '?')
        suggestionsList.push({
          original: 'multiple question marks',
          improved: 'single question mark',
          reason: 'Use only one question mark',
          type: 'punctuation'
        })
      }
      
      // STEP 10: Fix punctuation and spacing
      
      // Add space after punctuation if missing
      improved = improved.replace(/([.!?,:;])([a-zA-Z])/g, '$1 $2')
      
      // Remove space before punctuation
      improved = improved.replace(/\s+([.!?,:;])/g, '$1')
      
      // Fix multiple punctuation marks (should already be fixed, but double-check)
      improved = improved.replace(/[.!?]{2,}/g, (match) => match[0])
      
      // Final cleanup - remove any remaining double spaces and ensure proper spacing
      improved = improved.replace(/\s{2,}/g, ' ').trim()
      
      // Ensure proper capitalization at the start
      if (improved.length > 0 && !/[A-Z]/.test(improved[0])) {
        improved = improved.charAt(0).toUpperCase() + improved.slice(1)
      }
      
      // Capitalize first letter after sentence-ending punctuation
      improved = improved.replace(/([.!?]\s+)([a-z])/g, (match, punct, letter) => {
        return punct + letter.toUpperCase()
      })
      
      // Fix capitalization of common words that shouldn't be capitalized mid-sentence
      // Fix "I am Here" → "I am here" (after previous capitalization)
      improved = improved.replace(/\bI\s+am\s+Here\b/g, 'I am here')
      improved = improved.replace(/\bI\s+am\s+There\b/g, 'I am there')
      improved = improved.replace(/\bI\s+am\s+Fine\b/g, 'I am fine')
      improved = improved.replace(/\bI\s+am\s+Good\b/g, 'I am good')
      improved = improved.replace(/\bI\s+am\s+Well\b/g, 'I am well')
      improved = improved.replace(/\bI\s+am\s+Sick\b/g, 'I am sick')
      improved = improved.replace(/\bI\s+am\s+Tired\b/g, 'I am tired')
      improved = improved.replace(/\bI\s+am\s+Happy\b/g, 'I am happy')
      improved = improved.replace(/\bI\s+am\s+Sad\b/g, 'I am sad')
      improved = improved.replace(/\bI\s+am\s+Ready\b/g, 'I am ready')
      improved = improved.replace(/\bI\s+am\s+Done\b/g, 'I am done')
      improved = improved.replace(/\bI\s+am\s+Finished\b/g, 'I am finished')
      improved = improved.replace(/\bI\s+am\s+Busy\b/g, 'I am busy')
      improved = improved.replace(/\bI\s+am\s+Free\b/g, 'I am free')
      improved = improved.replace(/\bI\s+am\s+Available\b/g, 'I am available')
      improved = improved.replace(/\bI\s+am\s+Away\b/g, 'I am away')
      improved = improved.replace(/\bI\s+am\s+Back\b/g, 'I am back')
      improved = improved.replace(/\bI\s+am\s+Home\b/g, 'I am home')
      improved = improved.replace(/\bI\s+am\s+Out\b/g, 'I am out')
      improved = improved.replace(/\bI\s+am\s+In\b/g, 'I am in')
      improved = improved.replace(/\bI\s+am\s+Up\b/g, 'I am up')
      improved = improved.replace(/\bI\s+am\s+Down\b/g, 'I am down')
      
      // STEP 11: Final sentence structure improvements
      // Fix "hey" at the start → "Hello" or "Hi" (more professional)
      if (/^hey\s*[!.]*/gi.test(improved)) {
        improved = improved.replace(/^hey\s*[!.]*/gi, 'Hello,')
        suggestionsList.push({
          original: 'hey',
          improved: 'Hello,',
          reason: 'Use "Hello" for more professional greeting with proper punctuation',
          type: 'style'
        })
      }
      
      // Add comma after greeting if missing
      improved = improved.replace(/^(Hello|Hi|Hey)\s+([A-Z])/g, '$1, $2')
      
      // Ensure proper capitalization after periods
      improved = improved.replace(/(\.\s+)([a-z])/g, (match, punct, letter) => {
        return punct + letter.toUpperCase()
      })
      
      // Fix "but" after period - should be capitalized
      improved = improved.replace(/\.\s+but\s+/gi, '. But ')
      
      // Fix "and" after period - should be capitalized (if starting a new sentence)
      improved = improved.replace(/\.\s+and\s+([a-z])/gi, (match, letter) => {
        // Only capitalize if it's starting a new independent clause
        return `. And ${letter.toUpperCase()}`
      })
      
      // Fix "also thank you" → "and thank you" or restructure
      if (/\balso\s+thank\s+you\b/gi.test(improved)) {
        improved = improved.replace(/\balso\s+thank\s+you\b/gi, 'and thank you')
        suggestionsList.push({
          original: 'also thank you',
          improved: 'and thank you',
          reason: 'Use "and" to connect clauses more naturally',
          type: 'grammar'
        })
      }
      
      // Fix awkward time phrases
      // "since last night or day" → "since last night"
      improved = improved.replace(/\bsince\s+last\s+night\s+or\s+day\b/gi, 'since last night')
      
      // "last night or day" → "last night"
      improved = improved.replace(/\blast\s+night\s+or\s+day\b/gi, 'last night')
      
      // STEP 12: Ensure proper sentence flow
      // Fix "but i will" → "but I will" (capitalize after "but" in middle of sentence)
      improved = improved.replace(/\bbut\s+i\s+/gi, 'but I ')
      
      // Fix "and also" → "and" (redundant)
      if (/\band\s+also\b/gi.test(improved)) {
        improved = improved.replace(/\band\s+also\b/gi, 'and')
        suggestionsList.push({
          original: 'and also',
          improved: 'and',
          reason: 'Remove redundant "also" - "and" is sufficient',
          type: 'style'
        })
      }
      
      // Fix "also thank you" → "and thank you"
      if (/\balso\s+thank\s+you\b/gi.test(improved)) {
        improved = improved.replace(/\balso\s+thank\s+you\b/gi, 'and thank you')
        if (!suggestionsList.some(s => s.original === 'also thank you')) {
          suggestionsList.push({
            original: 'also thank you',
            improved: 'and thank you',
            reason: 'Use "and" to connect clauses more naturally',
            type: 'grammar'
          })
        }
      }
      
      // STEP 13: Professional writing enhancements
      // Replace informal phrases with professional alternatives
      const professionalReplacements = [
        { pattern: /\bhey\b/gi, replacement: 'Hello', reason: 'Use professional greeting', type: 'style' as const },
        { pattern: /\bhi\s+there\b/gi, replacement: 'Hello', reason: 'Use professional greeting', type: 'style' as const },
        { pattern: /\bthanks\s+a\s+lot\b/gi, replacement: 'Thank you very much', reason: 'More professional expression', type: 'style' as const },
        { pattern: /\bthx\b/gi, replacement: 'Thank you', reason: 'Use full professional form', type: 'style' as const },
        { pattern: /\bpls\b/gi, replacement: 'please', reason: 'Use full word for professionalism', type: 'style' as const },
        { pattern: /\bplz\b/gi, replacement: 'please', reason: 'Use full word for professionalism', type: 'style' as const },
        { pattern: /\bu\b/gi, replacement: 'you', reason: 'Use full word for professional writing', type: 'style' as const },
        { pattern: /\bur\b/gi, replacement: 'your', reason: 'Use full word for professional writing', type: 'style' as const },
        { pattern: /\bwanna\b/gi, replacement: 'want to', reason: 'Use formal language', type: 'style' as const },
        { pattern: /\bgonna\b/gi, replacement: 'going to', reason: 'Use formal language', type: 'style' as const },
        { pattern: /\bgotta\b/gi, replacement: 'have to', reason: 'Use formal language', type: 'style' as const },
        { pattern: /\bim\b/gi, replacement: "I'm", reason: 'Use proper contraction', type: 'punctuation' as const },
        { pattern: /\bive\b/gi, replacement: "I've", reason: 'Use proper contraction', type: 'punctuation' as const },
        { pattern: /\bim\s+not\b/gi, replacement: "I'm not", reason: 'Use proper contraction', type: 'punctuation' as const },
        { pattern: /\baint\b/gi, replacement: "isn't", reason: 'Use proper negation', type: 'grammar' as const },
        { pattern: /\bain't\b/gi, replacement: "isn't", reason: 'Use proper negation', type: 'grammar' as const },
        { pattern: /\bya\b/gi, replacement: 'you', reason: 'Use full word', type: 'style' as const },
        { pattern: /\byeah\b/gi, replacement: 'yes', reason: 'Use formal affirmative', type: 'style' as const },
        { pattern: /\bnope\b/gi, replacement: 'no', reason: 'Use formal negative', type: 'style' as const },
        { pattern: /\bok\b/gi, replacement: 'okay', reason: 'Use full word for professional writing', type: 'style' as const },
        { pattern: /\bokay\b/gi, replacement: 'all right', reason: 'More professional alternative', type: 'style' as const },
        { pattern: /\bcoz\b/gi, replacement: 'because', reason: 'Use full word', type: 'style' as const },
        { pattern: /\bcuz\b/gi, replacement: 'because', reason: 'Use full word', type: 'style' as const },
        { pattern: /\bcos\b/gi, replacement: 'because', reason: 'Use full word', type: 'style' as const },
        { pattern: /\bthru\b/gi, replacement: 'through', reason: 'Use full word', type: 'style' as const },
        { pattern: /\btho\b/gi, replacement: 'though', reason: 'Use full word', type: 'style' as const },
        { pattern: /\bwanna\b/gi, replacement: 'want to', reason: 'Use formal language', type: 'style' as const },
        { pattern: /\blemme\b/gi, replacement: 'let me', reason: 'Use formal language', type: 'style' as const },
        { pattern: /\bgimme\b/gi, replacement: 'give me', reason: 'Use formal language', type: 'style' as const },
        { pattern: /\bshoulda\b/gi, replacement: 'should have', reason: 'Use formal language', type: 'style' as const },
        { pattern: /\bcoulda\b/gi, replacement: 'could have', reason: 'Use formal language', type: 'style' as const },
        { pattern: /\bwoulda\b/gi, replacement: 'would have', reason: 'Use formal language', type: 'style' as const },
        { pattern: /\boutta\b/gi, replacement: 'out of', reason: 'Use formal language', type: 'style' as const },
        { pattern: /\bkinda\b/gi, replacement: 'kind of', reason: 'Use formal language', type: 'style' as const },
        { pattern: /\bsorta\b/gi, replacement: 'sort of', reason: 'Use formal language', type: 'style' as const },
        { pattern: /\blotta\b/gi, replacement: 'lot of', reason: 'Use formal language', type: 'style' as const },
        { pattern: /\blotsa\b/gi, replacement: 'lots of', reason: 'Use formal language', type: 'style' as const },
      ]
      
      professionalReplacements.forEach(({ pattern, replacement, reason, type }) => {
        if (pattern.test(improved)) {
          const matches = improved.match(pattern)
          if (matches && !suggestionsList.some(s => s.original === matches[0])) {
            improved = improved.replace(pattern, replacement)
            suggestionsList.push({
              original: matches[0],
              improved: replacement,
              reason,
              type
            })
          }
        }
      })
      
      // Improve word choice for professional writing
      const wordChoiceImprovements = [
        { pattern: /\bvery\s+good\b/gi, replacement: 'excellent', reason: 'Use stronger, more professional word', type: 'style' as const },
        { pattern: /\bvery\s+bad\b/gi, replacement: 'poor', reason: 'Use more professional alternative', type: 'style' as const },
        { pattern: /\bvery\s+important\b/gi, replacement: 'crucial', reason: 'Use stronger, more professional word', type: 'style' as const },
        { pattern: /\bvery\s+big\b/gi, replacement: 'significant', reason: 'Use more professional alternative', type: 'style' as const },
        { pattern: /\bvery\s+small\b/gi, replacement: 'minimal', reason: 'Use more professional alternative', type: 'style' as const },
        { pattern: /\bvery\s+fast\b/gi, replacement: 'rapid', reason: 'Use more professional alternative', type: 'style' as const },
        { pattern: /\bvery\s+slow\b/gi, replacement: 'gradual', reason: 'Use more professional alternative', type: 'style' as const },
        { pattern: /\bget\s+rid\s+of\b/gi, replacement: 'remove', reason: 'Use more concise professional language', type: 'style' as const },
        { pattern: /\bmake\s+sure\b/gi, replacement: 'ensure', reason: 'Use more professional verb', type: 'style' as const },
        { pattern: /\bfind\s+out\b/gi, replacement: 'determine', reason: 'Use more professional verb', type: 'style' as const },
        { pattern: /\blook\s+into\b/gi, replacement: 'investigate', reason: 'Use more professional verb', type: 'style' as const },
        { pattern: /\bput\s+off\b/gi, replacement: 'postpone', reason: 'Use more professional verb', type: 'style' as const },
        { pattern: /\bdeal\s+with\b/gi, replacement: 'address', reason: 'Use more professional verb', type: 'style' as const },
        { pattern: /\bgo\s+over\b/gi, replacement: 'review', reason: 'Use more professional verb', type: 'style' as const },
        { pattern: /\bthink\s+about\b/gi, replacement: 'consider', reason: 'Use more professional verb', type: 'style' as const },
        { pattern: /\btalk\s+about\b/gi, replacement: 'discuss', reason: 'Use more professional verb', type: 'style' as const },
        { pattern: /\bcome\s+up\s+with\b/gi, replacement: 'develop', reason: 'Use more professional verb', type: 'style' as const },
        { pattern: /\bgo\s+through\b/gi, replacement: 'review', reason: 'Use more professional verb', type: 'style' as const },
        { pattern: /\bpoint\s+out\b/gi, replacement: 'indicate', reason: 'Use more professional verb', type: 'style' as const },
        { pattern: /\bset\s+up\b/gi, replacement: 'establish', reason: 'Use more professional verb', type: 'style' as const },
        { pattern: /\bturn\s+out\b/gi, replacement: 'result', reason: 'Use more professional verb', type: 'style' as const },
        { pattern: /\bend\s+up\b/gi, replacement: 'conclude', reason: 'Use more professional verb', type: 'style' as const },
      ]
      
      wordChoiceImprovements.forEach(({ pattern, replacement, reason, type }) => {
        if (pattern.test(improved)) {
          const matches = improved.match(pattern)
          if (matches && !suggestionsList.some(s => s.original.toLowerCase() === matches[0].toLowerCase())) {
            improved = improved.replace(pattern, (match) => {
              // Preserve capitalization
              if (match[0] === match[0].toUpperCase()) {
                return replacement.charAt(0).toUpperCase() + replacement.slice(1)
              }
              return replacement
            })
            suggestionsList.push({
              original: matches[0],
              improved: replacement,
              reason,
              type
            })
          }
        }
      })
      
      // Remove filler words for more concise professional writing
      const fillerWords = [
        { pattern: /\bactually,\s*/gi, replacement: '', reason: 'Remove filler word for more concise writing', type: 'style' as const },
        { pattern: /\breally,\s*/gi, replacement: '', reason: 'Remove filler word for more concise writing', type: 'style' as const },
        { pattern: /\bjust\s+/gi, replacement: '', reason: 'Remove filler word for more concise writing', type: 'style' as const },
        { pattern: /\bquite\s+/gi, replacement: '', reason: 'Remove filler word for more concise writing', type: 'style' as const },
        { pattern: /\bpretty\s+much\b/gi, replacement: 'largely', reason: 'Use more professional alternative', type: 'style' as const },
        { pattern: /\bkind\s+of\b/gi, replacement: 'somewhat', reason: 'Use more professional alternative', type: 'style' as const },
        { pattern: /\bsort\s+of\b/gi, replacement: 'somewhat', reason: 'Use more professional alternative', type: 'style' as const },
      ]
      
      fillerWords.forEach(({ pattern, replacement, reason, type }) => {
        if (pattern.test(improved)) {
          improved = improved.replace(pattern, replacement)
          if (replacement && !suggestionsList.some(s => s.reason === reason)) {
            suggestionsList.push({
              original: pattern.source,
              improved: replacement || '[removed]',
              reason,
              type
            })
          }
        }
      })
      
      // Final cleanup - ensure no double spaces remain
      improved = improved.replace(/\s{2,}/g, ' ').trim()
      
      // STEP 14: Improve sentence structure and flow
      // Fix run-on sentences by adding proper punctuation
      // Split very long sentences (over 40 words) at natural break points
      const sentenceParts = improved.split(/([.!?]+)/)
      let restructuredText = ''
      for (let i = 0; i < sentenceParts.length; i += 2) {
        const sentence = sentenceParts[i]?.trim()
        const punctuation = sentenceParts[i + 1] || '.'
        if (sentence) {
          const words = sentence.split(/\s+/)
          if (words.length > 40) {
            // Split at natural break points (conjunctions, commas)
            const splitPoint = sentence.search(/,\s+(and|but|or|so|yet|for|nor)\s+/i)
            if (splitPoint > sentence.length * 0.3 && splitPoint < sentence.length * 0.7) {
              restructuredText += sentence.substring(0, splitPoint) + punctuation + ' ' + 
                                 sentence.substring(splitPoint + 1).charAt(0).toUpperCase() + 
                                 sentence.substring(splitPoint + 2) + punctuation
            } else {
              restructuredText += sentence + punctuation
            }
          } else {
            restructuredText += sentence + punctuation
          }
          if (i + 2 < sentenceParts.length) restructuredText += ' '
        }
      }
      if (restructuredText) improved = restructuredText.trim()
      
      // Ensure proper spacing around punctuation
      improved = improved.replace(/\s+([,.!?;:])/g, '$1') // Remove space before punctuation
      improved = improved.replace(/([,.!?;:])([a-zA-Z])/g, '$1 $2') // Add space after punctuation
      
      // STEP 15: Final pass to fix any remaining issues
      // Remove any remaining duplicate words (catch-all)
      const duplicateWords = ['and', 'the', 'a', 'to', 'for', 'of', 'in', 'on', 'at', 'is', 'are', 'was', 'were']
      duplicateWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\s+${word}\\b`, 'gi')
        if (regex.test(improved)) {
          improved = improved.replace(regex, word)
        }
      })
      
      // Ensure proper sentence endings
      // If sentence doesn't end with punctuation, add period
      const finalTrimmed = improved.trim()
      if (finalTrimmed.length > 0 && !/[.!?]$/.test(finalTrimmed)) {
        improved = finalTrimmed + '.'
      }
      
      // Final check: ensure proper capitalization after all fixes
      // Capitalize first letter
      if (improved.length > 0 && !/[A-Z]/.test(improved[0])) {
        improved = improved.charAt(0).toUpperCase() + improved.slice(1)
      }
      
      // Capitalize after sentence-ending punctuation
      improved = improved.replace(/([.!?]\s+)([a-z])/g, (match, punct, letter) => {
        return punct + letter.toUpperCase()
      })
      
      // Final cleanup: remove any extra spaces and ensure proper formatting
      improved = improved.replace(/\s{2,}/g, ' ').trim()
      
      // Ensure proper paragraph breaks are maintained
      improved = improved.replace(/\n\s*\n\s*\n/g, '\n\n') // Max 2 newlines
      
      // Final polish: ensure consistent spacing
      improved = improved.replace(/\s+([,.!?;:])/g, '$1') // No space before punctuation
      improved = improved.replace(/([,.!?;:])([a-zA-Z])/g, '$1 $2') // Space after punctuation
      improved = improved.trim()

      setImprovedText(improved)
      setSuggestions(suggestionsList)
      toast.success(`Text improved! ${suggestionsList.length} suggestion${suggestionsList.length !== 1 ? 's' : ''} applied.`)
      safeTriggerPopunder()
    } catch (error) {
      console.error('Improvement error:', error)
      toast.error('Failed to improve text')
    } finally {
      setLoading(false)
    }
  }


  const copyToClipboard = () => {
    if (!improvedText) {
      toast.error('No improved text to copy')
      return
    }
    navigator.clipboard.writeText(improvedText)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
    // Don't trigger popunder on copy - too frequent
  }

  const downloadText = () => {
    if (!improvedText) {
      toast.error('No improved text to download')
      return
    }
    const blob = new Blob([improvedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'improved-text.txt'
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Text downloaded!')
    safeTriggerPopunder()
  }

  const clearAll = () => {
    setText('')
    setImprovedText('')
    setSuggestions([])
    toast.success('Cleared!')
  }

  const getReadabilityLabel = (score: number) => {
    if (score >= 90) return 'Very Easy'
    if (score >= 80) return 'Easy'
    if (score >= 70) return 'Fairly Easy'
    if (score >= 60) return 'Standard'
    if (score >= 50) return 'Fairly Difficult'
    if (score >= 30) return 'Difficult'
    return 'Very Difficult'
  }

  const getReadabilityColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSuggestionTypeColor = (type: string) => {
    switch (type) {
      case 'grammar': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'spelling': return 'bg-red-100 text-red-700 border-red-300'
      case 'style': return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'punctuation': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'clarity': return 'bg-green-100 text-green-700 border-green-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-6 md:mb-8">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 mb-3 sm:mb-4">
              <Languages className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">AI English Improvement</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Improve your English writing with AI suggestions</p>
          </div>


          {/* Text Statistics */}
          {showStats && text.trim() && (
            <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">Text Statistics</h3>
                </div>
                <button
                  onClick={() => setShowStats(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-gray-900">{textStats.words}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Words</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-gray-900">{textStats.characters}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Characters</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-gray-900">{textStats.sentences}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Sentences</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-gray-900">{textStats.readingTime}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Min Read</div>
                </div>
                <div className="text-center col-span-2 sm:col-span-1">
                  <div className={`text-lg sm:text-xl font-bold ${getReadabilityColor(textStats.readability)}`}>
                    {textStats.readability}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {getReadabilityLabel(textStats.readability)}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="text-center sm:text-left">
                  <div className="text-xs sm:text-sm text-gray-600">Tone</div>
                  <div className="text-sm sm:text-base font-medium text-gray-900">{textStats.tone}</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xs sm:text-sm text-gray-600">Avg Words/Sentence</div>
                  <div className="text-sm sm:text-base font-medium text-gray-900">{textStats.avgWordsPerSentence}</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xs sm:text-sm text-gray-600">Passive Voice</div>
                  <div className="text-sm sm:text-base font-medium text-gray-900">{textStats.passiveVoiceCount}</div>
                </div>
              </div>
            </div>
          )}

          {!showStats && text.trim() && (
            <button
              onClick={() => setShowStats(true)}
              className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Show Statistics</span>
            </button>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Original Text */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Original Text</h2>
                {text && (
                  <button
                    onClick={clearAll}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Clear all"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                )}
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the text you want to improve. The AI will suggest corrections for grammar, spelling, and style..."
                rows={15}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-gray-900"
              />
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-xs sm:text-sm text-gray-600">
                  {text.split(/\s+/).filter(w => w.length > 0).length} words • {text.length} characters
                </p>
                <button
                  onClick={improve}
                  disabled={loading || !text.trim()}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      <span>Improving...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Improve Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Improved Text */}
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Improved Text</h2>
                  {improvedText && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center space-x-1.5 sm:space-x-2 text-sm sm:text-base text-primary-600 hover:text-primary-700 transition-colors px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-primary-50"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="hidden sm:inline">Copy</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={downloadText}
                        className="flex items-center space-x-1.5 sm:space-x-2 text-sm sm:text-base text-gray-600 hover:text-gray-700 transition-colors px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-50"
                      >
                        <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                    </div>
                  )}
                </div>
                <div className="border border-gray-300 rounded-lg p-3 sm:p-4 min-h-[200px] sm:min-h-[300px] bg-gray-50">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 animate-spin" />
                    </div>
                  ) : improvedText ? (
                    <p className="text-sm sm:text-base text-gray-900 whitespace-pre-wrap leading-relaxed">{improvedText}</p>
                  ) : (
                    <p className="text-sm sm:text-base text-gray-400 text-center">Your improved text will appear here...</p>
                  )}
                </div>
                {improvedText && (
                  <div className="mt-3 text-xs sm:text-sm text-gray-600">
                    {improvedText.split(/\s+/).filter(w => w.length > 0).length} words • {improvedText.length} characters
                  </div>
                )}
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Suggestions ({suggestions.length})
                    </h2>
                    <button
                      onClick={() => setShowSuggestions(!showSuggestions)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showSuggestions ? (
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Info className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                  </div>
                  {showSuggestions && (
                    <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-96 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <div key={index} className={`border rounded-lg p-3 sm:p-4 ${getSuggestionTypeColor(suggestion.type)}`}>
                          <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                                <span className="text-xs sm:text-sm font-semibold">"{suggestion.original}"</span>
                                <span className="text-gray-500">→</span>
                                <span className="text-xs sm:text-sm font-semibold">"{suggestion.improved}"</span>
                              </div>
                              <p className="text-xs sm:text-sm opacity-90">{suggestion.reason}</p>
                            </div>
                            <span className="text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-white/50">
                              {suggestion.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Writing Tips */}
          {improvedText && (
            <div className="mt-4 sm:mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">Writing Tips</h3>
                  <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Keep sentences concise (aim for 15-20 words per sentence)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Use active voice when possible for clearer, more direct writing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Vary sentence length to maintain reader interest</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Proofread for spelling and grammar errors before finalizing</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <MobileBottomAd adKey="9a58c0a87879d1b02e85ebd073651ab3" />
      <Footer />
    </div>
  )
}
