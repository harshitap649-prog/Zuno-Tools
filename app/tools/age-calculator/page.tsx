'use client'

import { useState, useEffect } from 'react'
import Footer from '@/components/Footer'
import MobileBottomNavWrapper from '@/components/MobileBottomNavWrapper'
import SidebarAd from '@/components/SidebarAd'
import MobileBottomAd from '@/components/MobileBottomAd'
import { 
  Calendar, Clock, Star, Users, TrendingUp, Share2, 
  Download, Save, Gift, Target, Heart, 
  Sparkles, Award, History, Globe, Zap, Moon, Sun
} from 'lucide-react'
import toast from 'react-hot-toast'

interface AgeResult {
  years: number
  months: number
  days: number
  totalDays: number
  totalMonths: number
  totalWeeks: number
  totalHours: number
  totalMinutes: number
  totalSeconds: number
  totalMilliseconds: number
}

interface Person {
  id: string
  name: string
  birthDate: string
  age?: AgeResult
}

const zodiacSigns = [
  { name: 'Capricorn', dates: [[12, 22], [1, 19]], symbol: '♑' },
  { name: 'Aquarius', dates: [[1, 20], [2, 18]], symbol: '♒' },
  { name: 'Pisces', dates: [[2, 19], [3, 20]], symbol: '♓' },
  { name: 'Aries', dates: [[3, 21], [4, 19]], symbol: '♈' },
  { name: 'Taurus', dates: [[4, 20], [5, 20]], symbol: '♉' },
  { name: 'Gemini', dates: [[5, 21], [6, 20]], symbol: '♊' },
  { name: 'Cancer', dates: [[6, 21], [7, 22]], symbol: '♋' },
  { name: 'Leo', dates: [[7, 23], [8, 22]], symbol: '♌' },
  { name: 'Virgo', dates: [[8, 23], [9, 22]], symbol: '♍' },
  { name: 'Libra', dates: [[9, 23], [10, 22]], symbol: '♎' },
  { name: 'Scorpio', dates: [[10, 23], [11, 21]], symbol: '♏' },
  { name: 'Sagittarius', dates: [[11, 22], [12, 21]], symbol: '♐' },
]

const chineseZodiac = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig']

const birthstones = [
  { month: 1, stone: 'Garnet', color: 'Deep Red' },
  { month: 2, stone: 'Amethyst', color: 'Purple' },
  { month: 3, stone: 'Aquamarine', color: 'Blue' },
  { month: 4, stone: 'Diamond', color: 'Clear/White' },
  { month: 5, stone: 'Emerald', color: 'Green' },
  { month: 6, stone: 'Pearl', color: 'White/Cream' },
  { month: 7, stone: 'Ruby', color: 'Red' },
  { month: 8, stone: 'Peridot', color: 'Green' },
  { month: 9, stone: 'Sapphire', color: 'Blue' },
  { month: 10, stone: 'Opal', color: 'Multi-color' },
  { month: 11, stone: 'Topaz', color: 'Yellow' },
  { month: 12, stone: 'Turquoise', color: 'Blue-Green' },
]

const birthFlowers = [
  { month: 1, flower: 'Carnation / Snowdrop' },
  { month: 2, flower: 'Violet / Primrose' },
  { month: 3, flower: 'Daffodil / Jonquil' },
  { month: 4, flower: 'Daisy / Sweet Pea' },
  { month: 5, flower: 'Lily of the Valley / Hawthorn' },
  { month: 6, flower: 'Rose / Honeysuckle' },
  { month: 7, flower: 'Larkspur / Water Lily' },
  { month: 8, flower: 'Gladiolus / Poppy' },
  { month: 9, flower: 'Aster / Morning Glory' },
  { month: 10, flower: 'Marigold / Cosmos' },
  { month: 11, flower: 'Chrysanthemum' },
  { month: 12, flower: 'Narcissus / Holly' },
]

const generations = [
  { name: 'Gen Alpha', start: 2013, end: 2025 },
  { name: 'Gen Z', start: 1997, end: 2012 },
  { name: 'Millennial', start: 1981, end: 1996 },
  { name: 'Gen X', start: 1965, end: 1980 },
  { name: 'Baby Boomer', start: 1946, end: 1964 },
  { name: 'Silent Generation', start: 1928, end: 1945 },
  { name: 'Greatest Generation', start: 1901, end: 1927 },
]

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState('')
  const [calculateAtDate, setCalculateAtDate] = useState(new Date().toISOString().split('T')[0])
  const [result, setResult] = useState<AgeResult | null>(null)
  const [nextBirthday, setNextBirthday] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)
  const [countdownActive, setCountdownActive] = useState(false)
  const [people, setPeople] = useState<Person[]>([])
  const [newPersonName, setNewPersonName] = useState('')
  const [newPersonBirthDate, setNewPersonBirthDate] = useState('')
  const [comparePerson1, setComparePerson1] = useState<Person | null>(null)
  const [comparePerson2, setComparePerson2] = useState<Person | null>(null)
  const [comparison, setComparison] = useState<{ older: Person; difference: number; percentage: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'calculator' | 'compare' | 'multiple'>('calculator')

  useEffect(() => {
    // Load saved birthdate
    const saved = localStorage.getItem('ageCalculatorBirthDate')
    if (saved) {
      setBirthDate(saved)
      const ageResult = calculateAge(saved, calculateAtDate)
      if (ageResult) {
        setResult(ageResult)
        updateCountdown()
        setCountdownActive(true)
      }
    } else {
      // Ensure result is null when no birthdate
      setResult(null)
      setNextBirthday(null)
      setCountdownActive(false)
    }
  }, [])

  useEffect(() => {
    if (countdownActive && birthDate) {
      const interval = setInterval(() => {
        updateCountdown()
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [countdownActive, birthDate])

  const calculateAge = (birth: string, atDate?: string) => {
    if (!birth) return null

    const birthDateObj = new Date(birth)
    const targetDate = atDate ? new Date(atDate) : new Date()

    if (birthDateObj > targetDate) {
      toast.error('Birth date cannot be after the target date')
      return null
    }

    let years = targetDate.getFullYear() - birthDateObj.getFullYear()
    let months = targetDate.getMonth() - birthDateObj.getMonth()
    let days = targetDate.getDate() - birthDateObj.getDate()

    if (days < 0) {
      months--
      const lastMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0)
      days += lastMonth.getDate()
    }

    if (months < 0) {
      years--
      months += 12
    }

    const diffTime = Math.abs(targetDate.getTime() - birthDateObj.getTime())
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const totalHours = totalDays * 24
    const totalMinutes = totalHours * 60
    const totalSeconds = totalMinutes * 60
    const totalMilliseconds = totalSeconds * 1000
    const totalMonths = years * 12 + months
    const totalWeeks = Math.floor(totalDays / 7)

    return {
      years,
      months,
      days,
      totalDays,
      totalMonths,
      totalWeeks,
      totalHours,
      totalMinutes,
      totalSeconds,
      totalMilliseconds,
    }
  }

  const handleCalculate = () => {
    if (!birthDate) {
      toast.error('Please enter your birth date')
      // Set result to null/zero values when no birth date
      setResult(null)
      setNextBirthday(null)
      setCountdownActive(false)
      return
    }

    const ageResult = calculateAge(birthDate, calculateAtDate || new Date().toISOString().split('T')[0])
    if (ageResult) {
      setResult(ageResult)
      localStorage.setItem('ageCalculatorBirthDate', birthDate)
      updateCountdown()
      setCountdownActive(true)
    } else {
      setResult(null)
      setNextBirthday(null)
      setCountdownActive(false)
    }
  }

  const updateCountdown = () => {
    if (!birthDate) return

    const birth = new Date(birthDate)
    const today = new Date()
    const currentYear = today.getFullYear()
    
    let nextBirthdayDate = new Date(currentYear, birth.getMonth(), birth.getDate())
    if (nextBirthdayDate < today) {
      nextBirthdayDate = new Date(currentYear + 1, birth.getMonth(), birth.getDate())
    }

    const diff = nextBirthdayDate.getTime() - today.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    setNextBirthday({ days, hours, minutes, seconds })
  }

  const getZodiacSign = (date: string): string => {
    if (!date) return ''
    const d = new Date(date)
    const month = d.getMonth() + 1
    const day = d.getDate()

    for (const sign of zodiacSigns) {
      const [startMonth, startDay] = sign.dates[0]
      const [endMonth, endDay] = sign.dates[1]
      
      if (startMonth === endMonth) {
        if (month === startMonth && day >= startDay && day <= endDay) {
          return `${sign.name} ${sign.symbol}`
        }
      } else {
        if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
          return `${sign.name} ${sign.symbol}`
        }
      }
    }
    return ''
  }

  const getChineseZodiac = (date: string): string => {
    if (!date) return ''
    const year = new Date(date).getFullYear()
    return chineseZodiac[(year - 1900) % 12]
  }

  const getDayOfWeek = (date: string): string => {
    if (!date) return ''
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[new Date(date).getDay()]
  }

  const getBirthstone = (date: string) => {
    if (!date) return null
    const month = new Date(date).getMonth() + 1
    return birthstones.find(s => s.month === month)
  }

  const getBirthFlower = (date: string) => {
    if (!date) return null
    const month = new Date(date).getMonth() + 1
    return birthFlowers.find(f => f.month === month)
  }

  const getGeneration = (date: string): string => {
    if (!date) return ''
    const year = new Date(date).getFullYear()
    for (const gen of generations) {
      if (year >= gen.start && year <= gen.end) {
        return gen.name
      }
    }
    return 'Unknown'
  }

  const calculateMilestone = (targetAge: number): string => {
    if (!birthDate || !result) return ''
    const birth = new Date(birthDate)
    const milestoneDate = new Date(birth.getFullYear() + targetAge, birth.getMonth(), birth.getDate())
    return milestoneDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }


  const addPerson = () => {
    if (!newPersonName || !newPersonBirthDate) {
      toast.error('Please enter name and birth date')
      return
    }
    const age = calculateAge(newPersonBirthDate)
    const person: Person = {
      id: Date.now().toString(),
      name: newPersonName,
      birthDate: newPersonBirthDate,
      age: age || undefined,
    }
    setPeople([...people, person])
    setNewPersonName('')
    setNewPersonBirthDate('')
    toast.success('Person added!')
  }

  const removePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id))
  }

  const handleCompareAges = () => {
    if (!comparePerson1 || !comparePerson2) {
      toast.error('Please select two people to compare')
      setComparison(null)
      return
    }
    if (!comparePerson1.birthDate || !comparePerson2.birthDate) {
      toast.error('Please enter birth dates for both people')
      setComparison(null)
      return
    }
    if (!comparePerson1.age || !comparePerson2.age) {
      toast.error('Please ensure both people have valid birth dates')
      setComparison(null)
      return
    }

    const age1 = comparePerson1.age.totalDays
    const age2 = comparePerson2.age.totalDays
    const diff = Math.abs(age1 - age2)
    const older = age1 > age2 ? comparePerson1 : comparePerson2
    const percentage = ((diff / Math.max(age1, age2)) * 100).toFixed(2)

    setComparison({
      older,
      difference: diff,
      percentage,
    })
    toast.success('Ages compared successfully!')
  }

  const getLifeProgress = () => {
    if (!result) return 0
    const averageLifespan = 80 // years
    return Math.min(100, (result.years / averageLifespan) * 100)
  }

  const shareResult = async () => {
    if (!result || !birthDate) {
      toast.error('Please calculate age first')
      return
    }
    
    const text = `I am ${result.years} years, ${result.months} months, and ${result.days} days old! 🎂`
    
    // Try Web Share API first (for mobile and modern browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Age',
          text: text,
        })
        toast.success('Shared successfully!')
        return
      } catch (error) {
        // User cancelled or share failed, fall back to clipboard
      }
    }
    
    // Fall back to clipboard
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Age result copied to clipboard!')
    } catch (error) {
      toast.error('Failed to share. Please try again.')
    }
  }

  const generateShareableImage = () => {
    if (!result || !birthDate) {
      toast.error('Please calculate age first')
      return
    }

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        toast.error('Failed to create image')
        return
      }

      // Set canvas size for high quality - larger to fit all details
      canvas.width = 1600
      canvas.height = 2000

      // Beautiful gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      bgGradient.addColorStop(0, '#667eea')
      bgGradient.addColorStop(0.3, '#764ba2')
      bgGradient.addColorStop(0.7, '#f093fb')
      bgGradient.addColorStop(1, '#4facfe')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add subtle pattern overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
      for (let i = 0; i < 30; i++) {
        ctx.beginPath()
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 80, 0, Math.PI * 2)
        ctx.fill()
      }

      // White card background
      const cardPadding = 80
      const cardX = cardPadding
      const cardY = cardPadding
      const cardWidth = canvas.width - (cardPadding * 2)
      const cardHeight = canvas.height - (cardPadding * 2)

      // Card shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.fillRect(cardX + 15, cardY + 15, cardWidth, cardHeight)

      // Card background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(cardX, cardY, cardWidth, cardHeight)

      // Title section with gradient
      const titleGradient = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + 140)
      titleGradient.addColorStop(0, '#667eea')
      titleGradient.addColorStop(1, '#764ba2')
      ctx.fillStyle = titleGradient
      ctx.fillRect(cardX, cardY, cardWidth, 140)

      // Title text
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 64px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Your Age Details', canvas.width / 2, cardY + 70)

      let currentY = cardY + 180

      // Age cards section
      const cardSpacing = 50
      const ageCardWidth = (cardWidth - (cardSpacing * 2)) / 3
      const ageCardHeight = 320

      // Years card
      const yearsGradient = ctx.createLinearGradient(0, 0, 0, ageCardHeight)
      yearsGradient.addColorStop(0, '#3b82f6')
      yearsGradient.addColorStop(1, '#1e40af')
      ctx.fillStyle = yearsGradient
      ctx.fillRect(cardX + cardSpacing, currentY, ageCardWidth, ageCardHeight)
      
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 110px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`${result.years}`, cardX + cardSpacing + ageCardWidth / 2, currentY + 150)
      ctx.font = '36px Arial, sans-serif'
      ctx.fillText('Years', cardX + cardSpacing + ageCardWidth / 2, currentY + 240)

      // Months card
      const monthsGradient = ctx.createLinearGradient(0, 0, 0, ageCardHeight)
      monthsGradient.addColorStop(0, '#06b6d4')
      monthsGradient.addColorStop(1, '#0891b2')
      ctx.fillStyle = monthsGradient
      ctx.fillRect(cardX + cardSpacing + ageCardWidth + cardSpacing, currentY, ageCardWidth, ageCardHeight)
      
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 110px Arial, sans-serif'
      ctx.fillText(`${result.months}`, cardX + cardSpacing + ageCardWidth + cardSpacing + ageCardWidth / 2, currentY + 150)
      ctx.font = '36px Arial, sans-serif'
      ctx.fillText('Months', cardX + cardSpacing + ageCardWidth + cardSpacing + ageCardWidth / 2, currentY + 240)

      // Days card
      const daysGradient = ctx.createLinearGradient(0, 0, 0, ageCardHeight)
      daysGradient.addColorStop(0, '#8b5cf6')
      daysGradient.addColorStop(1, '#6d28d9')
      ctx.fillStyle = daysGradient
      ctx.fillRect(cardX + cardSpacing + (ageCardWidth + cardSpacing) * 2, currentY, ageCardWidth, ageCardHeight)
      
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 110px Arial, sans-serif'
      ctx.fillText(`${result.days}`, cardX + cardSpacing + (ageCardWidth + cardSpacing) * 2 + ageCardWidth / 2, currentY + 150)
      ctx.font = '36px Arial, sans-serif'
      ctx.fillText('Days', cardX + cardSpacing + (ageCardWidth + cardSpacing) * 2 + ageCardWidth / 2, currentY + 240)

      currentY += ageCardHeight + 80

      // Life Progress Section
      const lifeProgress = getLifeProgress()
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 32px Arial, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('Life Progress', cardX + 60, currentY)
      
      ctx.fillStyle = '#64748b'
      ctx.font = '22px Arial, sans-serif'
      ctx.fillText('Based on 80-year average lifespan', cardX + 60, currentY + 40)

      // Progress bar background
      const progressBarX = cardX + 60
      const progressBarY = currentY + 70
      const progressBarWidth = cardWidth - 120
      const progressBarHeight = 40
      
      ctx.fillStyle = '#e2e8f0'
      ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight)
      
      // Progress bar fill
      const progressGradient = ctx.createLinearGradient(progressBarX, progressBarY, progressBarX + progressBarWidth, progressBarY)
      progressGradient.addColorStop(0, '#667eea')
      progressGradient.addColorStop(1, '#764ba2')
      ctx.fillStyle = progressGradient
      ctx.fillRect(progressBarX, progressBarY, (progressBarWidth * lifeProgress) / 100, progressBarHeight)
      
      // Progress percentage
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 28px Arial, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(`${lifeProgress.toFixed(1)}%`, cardX + cardWidth - 60, currentY + 100)

      currentY += 150

      // Two column layout for details
      const columnWidth = (cardWidth - 180) / 2
      const leftColumnX = cardX + 60
      const rightColumnX = cardX + 60 + columnWidth + 60

      // Left Column - Personal Info
      const birthDateFormatted = new Date(birthDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      const dayOfWeek = getDayOfWeek(birthDate)
      const zodiac = getZodiacSign(birthDate)
      const chineseZodiac = getChineseZodiac(birthDate)
      const generation = getGeneration(birthDate)
      const birthstone = getBirthstone(birthDate)
      const birthFlower = getBirthFlower(birthDate)

      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 28px Arial, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('Personal Information', leftColumnX, currentY)

      let detailY = currentY + 50
      const detailSpacing = 45

      const leftDetails = [
        ['Birth Date', birthDateFormatted],
        ['Day of Week', dayOfWeek],
        ['Zodiac Sign', zodiac],
        ['Chinese Zodiac', chineseZodiac],
        ['Generation', generation],
        ['Birthstone', birthstone?.stone || 'N/A'],
        ['Birth Flower', birthFlower?.flower || 'N/A'],
      ]

      leftDetails.forEach(([label, value]) => {
        ctx.fillStyle = '#64748b'
        ctx.font = '20px Arial, sans-serif'
        ctx.fillText(label + ':', leftColumnX, detailY)
        ctx.fillStyle = '#1e293b'
        ctx.font = 'bold 22px Arial, sans-serif'
        ctx.fillText(value, leftColumnX + 180, detailY)
        detailY += detailSpacing
      })

      // Right Column - Age Statistics
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 28px Arial, sans-serif'
      ctx.fillText('Age Statistics', rightColumnX, currentY)

      detailY = currentY + 50

      const centuryProgress = (result.years / 100) * 100
      const dogYears = Math.round(result.years * 7)
      const catYears = Math.round(result.years * 4)
      const leapYears = Math.floor(result.years / 4)

      const rightDetails = [
        ['Total Days', result.totalDays.toLocaleString()],
        ['Total Hours', result.totalHours.toLocaleString()],
        ['Total Minutes', result.totalMinutes.toLocaleString()],
        ['Total Seconds', result.totalSeconds.toLocaleString()],
        ['Century Progress', `${centuryProgress.toFixed(2)}%`],
        ['Dog Years', `~${dogYears} years`],
        ['Cat Years', `~${catYears} years`],
        ['Leap Years', `~${leapYears} leap years`],
      ]

      rightDetails.forEach(([label, value]) => {
        ctx.fillStyle = '#64748b'
        ctx.font = '20px Arial, sans-serif'
        ctx.fillText(label + ':', rightColumnX, detailY)
        ctx.fillStyle = '#667eea'
        ctx.font = 'bold 22px Arial, sans-serif'
        ctx.fillText(value, rightColumnX + 180, detailY)
        detailY += detailSpacing
      })

      currentY += 450

      // Next Birthday Section
      if (nextBirthday) {
        ctx.strokeStyle = '#e2e8f0'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(cardX + 60, currentY - 20)
        ctx.lineTo(cardWidth - 60, currentY - 20)
        ctx.stroke()

        ctx.fillStyle = '#1e293b'
        ctx.font = 'bold 28px Arial, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Next Birthday Countdown', canvas.width / 2, currentY + 20)

        const countdownY = currentY + 80
        const countdownCardWidth = (cardWidth - 280) / 4
        const countdownCardHeight = 120
        const countdownSpacing = 40

        const countdownData = [
          { value: nextBirthday.days, label: 'Days', color: '#ec4899' },
          { value: nextBirthday.hours, label: 'Hours', color: '#f97316' },
          { value: nextBirthday.minutes, label: 'Minutes', color: '#eab308' },
          { value: nextBirthday.seconds, label: 'Seconds', color: '#22c55e' },
        ]

        countdownData.forEach((item, index) => {
          const countdownX = cardX + 60 + index * (countdownCardWidth + countdownSpacing)
          
          const countdownGradient = ctx.createLinearGradient(0, 0, 0, countdownCardHeight)
          countdownGradient.addColorStop(0, item.color)
          countdownGradient.addColorStop(1, item.color + 'dd')
          ctx.fillStyle = countdownGradient
          ctx.fillRect(countdownX, countdownY, countdownCardWidth, countdownCardHeight)

          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 48px Arial, sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(`${item.value}`, countdownX + countdownCardWidth / 2, countdownY + 60)
          ctx.font = '22px Arial, sans-serif'
          ctx.fillText(item.label, countdownX + countdownCardWidth / 2, countdownY + 100)
        })

        currentY += 250
      }

      // Footer with logo
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cardX + 60, currentY)
      ctx.lineTo(cardWidth - 60, currentY)
      ctx.stroke()

      ctx.fillStyle = '#94a3b8'
      ctx.font = '22px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Generated by Zuno Tools', canvas.width / 2, canvas.height - 50)

      // Convert to image and download
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Failed to generate image')
          return
        }
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `my-age-details-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success('Image downloaded successfully!')
      }, 'image/png', 1.0)
    } catch (error) {
      console.error('Error generating image:', error)
      toast.error('Failed to generate image')
    }
  }

  const lifeProgress = getLifeProgress()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30">
      {/* Sidebar Ads for Desktop */}
      <SidebarAd position="left" adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      <SidebarAd position="right" adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      
      <main className="flex-grow py-3 sm:py-5 md:py-8 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">Age Calculator</h1>
            <p className="text-gray-900">Calculate your exact age with advanced features and insights</p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-5 sm:mb-6 justify-center">
            {[
              { id: 'calculator', label: 'Calculator', icon: Calendar },
              { id: 'compare', label: 'Compare', icon: Users },
              { id: 'multiple', label: 'Multiple', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 scale-105'
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg border border-gray-200/50'
                }`}
              >
                <tab.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-600'}`} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Calculator Tab */}
          {activeTab === 'calculator' && (
            <div className="space-y-4 sm:space-y-5">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/60 p-5 sm:p-6 md:p-8 ring-1 ring-gray-100/50">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2.5 flex items-center space-x-2">
                      <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 via-cyan-500 to-indigo-500 rounded-full shadow-lg shadow-blue-500/30"></div>
                      <span>Birth Date</span>
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 text-sm sm:text-base font-medium transition-all bg-gray-50/50 hover:bg-white hover:border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2.5 flex items-center space-x-2">
                      <div className="w-1.5 h-6 bg-gradient-to-b from-cyan-500 via-indigo-500 to-blue-500 rounded-full shadow-lg shadow-cyan-500/30"></div>
                      <span>Calculate Age At (Optional)</span>
                    </label>
                    <input
                      type="date"
                      value={calculateAtDate}
                      onChange={(e) => setCalculateAtDate(e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 text-sm sm:text-base font-medium transition-all bg-gray-50/50 hover:bg-white hover:border-gray-300"
                    />
                    {calculateAtDate !== new Date().toISOString().split('T')[0] && (
                      <button
                        onClick={() => setCalculateAtDate(new Date().toISOString().split('T')[0])}
                        className="mt-2.5 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                      >
                        Use today's date instead
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleCalculate}
                    className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-bold text-sm sm:text-base hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-2 active:scale-95 touch-manipulation ring-4 ring-blue-500/20"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Calculate Age</span>
                  </button>
                </div>
              </div>

              {/* Main Age Display - Always show, with 0 values if no birth date */}
              <div className="bg-gradient-to-br from-blue-50 via-cyan-50/80 to-indigo-50 rounded-3xl shadow-2xl border-2 border-blue-200/60 p-5 sm:p-7 md:p-10 ring-1 ring-blue-100/50">
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-5 sm:mb-7 text-center tracking-tight">
                  <span className="bg-gradient-to-r from-blue-700 via-cyan-700 to-indigo-700 bg-clip-text text-transparent">Your Age</span>
                </h2>
                <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-5 text-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-xl border border-blue-100/50 hover:scale-105 transition-transform">
                    <div className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">{result?.years ?? 0}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-2 font-semibold">Years</div>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-xl border border-cyan-100/50 hover:scale-105 transition-transform">
                    <div className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-br from-cyan-600 to-indigo-600 bg-clip-text text-transparent">{result?.months ?? 0}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-2 font-semibold">Months</div>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-xl border border-indigo-100/50 hover:scale-105 transition-transform">
                    <div className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-br from-indigo-600 to-blue-600 bg-clip-text text-transparent">{result?.days ?? 0}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-2 font-semibold">Days</div>
                  </div>
                </div>
              </div>

              {result && (
                <>

                  {/* Next Birthday Countdown */}
                  {nextBirthday && (
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/60 p-5 sm:p-6 md:p-7 ring-1 ring-gray-100/50">
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-5 flex items-center space-x-2.5">
                        <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-lg">
                          <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Next Birthday Countdown</span>
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        {[
                          { label: 'Days', value: nextBirthday.days, color: 'from-pink-500 via-rose-500 to-pink-600', shadow: 'shadow-pink-500/40' },
                          { label: 'Hours', value: nextBirthday.hours, color: 'from-orange-500 via-red-500 to-orange-600', shadow: 'shadow-orange-500/40' },
                          { label: 'Minutes', value: nextBirthday.minutes, color: 'from-yellow-500 via-orange-500 to-yellow-600', shadow: 'shadow-yellow-500/40' },
                          { label: 'Seconds', value: nextBirthday.seconds, color: 'from-green-500 via-emerald-500 to-green-600', shadow: 'shadow-green-500/40' },
                        ].map((item) => (
                          <div key={item.label} className={`bg-gradient-to-br ${item.color} rounded-2xl p-4 sm:p-5 text-center text-white shadow-xl ${item.shadow} hover:scale-105 transition-transform border border-white/20`}>
                            <div className="text-3xl sm:text-4xl md:text-5xl font-black mb-1">{item.value}</div>
                            <div className="text-xs sm:text-sm font-bold opacity-95 uppercase tracking-wide">{item.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Age in Different Units */}
                  <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/60 p-5 sm:p-6 md:p-7 ring-1 ring-gray-100/50">
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-5 flex items-center space-x-2.5">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                        <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Age in Different Units</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {[
                        { label: 'Days', value: result?.totalDays ?? 0, color: 'from-blue-50 to-cyan-50', border: 'border-blue-200' },
                        { label: 'Hours', value: result?.totalHours ?? 0, color: 'from-cyan-50 to-indigo-50', border: 'border-cyan-200' },
                        { label: 'Minutes', value: result?.totalMinutes ?? 0, color: 'from-indigo-50 to-blue-50', border: 'border-indigo-200' },
                        { label: 'Seconds', value: result?.totalSeconds ?? 0, color: 'from-blue-50 to-cyan-50', border: 'border-blue-200' },
                      ].map((item) => (
                        <div key={item.label} className={`bg-gradient-to-br ${item.color} rounded-2xl p-4 sm:p-5 text-center border-2 ${item.border} shadow-lg hover:scale-105 transition-transform`}>
                          <div className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-1">{item.value.toLocaleString()}</div>
                          <div className="text-xs sm:text-sm text-gray-600 font-bold uppercase tracking-wide">{item.label}</div>
                        </div>
                      ))}
                      <div className={`bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-4 sm:p-5 text-center border-2 border-gray-300 shadow-lg col-span-2 sm:col-span-4`}>
                        <div className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-1">{(result?.totalMilliseconds ?? 0).toLocaleString()}</div>
                        <div className="text-xs sm:text-sm text-gray-600 font-bold uppercase tracking-wide">Milliseconds</div>
                      </div>
                    </div>
                  </div>

                  {/* Zodiac & Astrology */}
                  {birthDate && (
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/60 p-5 sm:p-6 md:p-7 ring-1 ring-gray-100/50">
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-5 flex items-center space-x-2.5">
                        <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                          <Star className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Zodiac & Astrology</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-2xl p-4 sm:p-5 border-2 border-purple-200/60 shadow-lg hover:scale-105 transition-transform">
                          <div className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">Zodiac Sign</div>
                          <div className="text-base sm:text-lg md:text-xl font-black text-gray-900">{getZodiacSign(birthDate)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 via-orange-50 to-red-50 rounded-2xl p-4 sm:p-5 border-2 border-red-200/60 shadow-lg hover:scale-105 transition-transform">
                          <div className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">Chinese Zodiac</div>
                          <div className="text-base sm:text-lg md:text-xl font-black text-gray-900">{getChineseZodiac(birthDate)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 rounded-2xl p-4 sm:p-5 border-2 border-blue-200/60 shadow-lg hover:scale-105 transition-transform">
                          <div className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">Day of Week</div>
                          <div className="text-base sm:text-lg md:text-xl font-black text-gray-900">{getDayOfWeek(birthDate)}</div>
                        </div>
                        {getBirthstone(birthDate) && (
                          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 rounded-2xl p-4 sm:p-5 border-2 border-green-200/60 shadow-lg hover:scale-105 transition-transform">
                            <div className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">Birthstone</div>
                            <div className="text-base sm:text-lg md:text-xl font-black text-gray-900">{getBirthstone(birthDate)?.stone}</div>
                            <div className="text-xs text-gray-600 mt-1 font-medium">{getBirthstone(birthDate)?.color}</div>
                          </div>
                        )}
                        {getBirthFlower(birthDate) && (
                          <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 rounded-2xl p-4 sm:p-5 border-2 border-pink-200/60 shadow-lg hover:scale-105 transition-transform">
                            <div className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">Birth Flower</div>
                            <div className="text-base sm:text-lg md:text-xl font-black text-gray-900">{getBirthFlower(birthDate)?.flower}</div>
                          </div>
                        )}
                        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 rounded-2xl p-4 sm:p-5 border-2 border-indigo-200/60 shadow-lg hover:scale-105 transition-transform">
                          <div className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">Generation</div>
                          <div className="text-base sm:text-lg md:text-xl font-black text-gray-900">{getGeneration(birthDate)}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Age Milestones */}
                  <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/60 p-5 sm:p-6 md:p-7 ring-1 ring-gray-100/50">
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-5 flex items-center space-x-2.5">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                        <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Age Milestones</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {[25, 30, 40, 50, 60, 70, 80, 100].map((age) => (
                        <div key={age} className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 rounded-2xl p-3 sm:p-4 border-2 border-green-200/60 text-center shadow-lg hover:scale-105 transition-transform">
                          <div className="text-xs sm:text-sm text-gray-600 mb-1.5 font-bold uppercase tracking-wide">Age {age}</div>
                          <div className="text-xs sm:text-sm font-black text-gray-900 leading-tight">{calculateMilestone(age)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Life Progress Bar */}
                  <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/60 p-5 sm:p-6 md:p-7 ring-1 ring-gray-100/50">
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-5 flex items-center space-x-2.5">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Life Progress</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm sm:text-base font-bold text-gray-700">
                        <span>Progress (Based on 80-year average)</span>
                        <span className="text-lg font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{lifeProgress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200/80 rounded-full h-5 sm:h-6 overflow-hidden shadow-inner">
                        <div
                          className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 h-5 sm:h-6 rounded-full transition-all duration-700 shadow-lg shadow-pink-500/30"
                          style={{ width: `${lifeProgress}%` }}
                        />
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 font-semibold">
                        Estimated years remaining: <span className="font-black text-gray-900">{Math.max(0, 80 - result.years)} years</span>
                      </div>
                    </div>
                  </div>

                  {/* Fun Facts */}
                  <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/60 p-5 sm:p-6 md:p-7 ring-1 ring-gray-100/50">
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-5 flex items-center space-x-2.5">
                      <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Fun Facts</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {[
                        { label: 'Century Progress', value: `${((result.years / 100) * 100).toFixed(2)}% of a century`, color: 'from-yellow-50 via-orange-50 to-yellow-50', border: 'border-yellow-200/60' },
                        { label: 'Dog Years', value: `~${Math.round(result.years * 7)} years`, color: 'from-blue-50 via-cyan-50 to-blue-50', border: 'border-blue-200/60' },
                        { label: 'Cat Years', value: `~${Math.round(result.years * 4)} years`, color: 'from-pink-50 via-rose-50 to-pink-50', border: 'border-pink-200/60' },
                        { label: 'Leap Years', value: `~${Math.floor(result.years / 4)} leap years`, color: 'from-green-50 via-emerald-50 to-green-50', border: 'border-green-200/60' },
                      ].map((fact) => (
                        <div key={fact.label} className={`bg-gradient-to-br ${fact.color} rounded-2xl p-4 sm:p-5 border-2 ${fact.border} shadow-lg hover:scale-105 transition-transform`}>
                          <div className="text-xs sm:text-sm text-gray-600 mb-2 font-bold uppercase tracking-wide">{fact.label}</div>
                          <div className="text-base sm:text-lg font-black text-gray-900">{fact.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Share & Save */}
                  <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/60 p-5 sm:p-6 md:p-7 ring-1 ring-gray-100/50">
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-5 flex items-center space-x-2.5">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                        <Share2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Share & Save</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      {[
                        { label: 'Share', icon: Share2, onClick: shareResult, color: 'from-blue-500 via-cyan-500 to-blue-600', shadow: 'shadow-blue-500/40' },
                        { label: 'Save', icon: Save, onClick: () => { localStorage.setItem('ageCalculatorBirthDate', birthDate); toast.success('Birthdate saved!'); }, color: 'from-green-500 via-emerald-500 to-green-600', shadow: 'shadow-green-500/40' },
                        { label: 'Download Image', icon: Download, onClick: generateShareableImage, color: 'from-purple-500 via-indigo-500 to-purple-600', shadow: 'shadow-purple-500/40' },
                      ].map((btn) => (
                        <button
                          key={btn.label}
                          onClick={btn.onClick}
                          className={`bg-gradient-to-r ${btn.color} text-white px-4 py-3.5 sm:py-4 rounded-xl font-bold hover:shadow-xl ${btn.shadow} transition-all flex items-center justify-center space-x-2 text-sm sm:text-base active:scale-95 touch-manipulation hover:scale-105`}
                        >
                          <btn.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>{btn.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Compare Tab */}
          {activeTab === 'compare' && (
            <div className="space-y-4 sm:space-y-5">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/60 p-5 sm:p-6 md:p-8 ring-1 ring-gray-100/50">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-5 flex items-center space-x-2.5">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <span className="text-gray-900">Compare Two Ages</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2.5">Person 1</label>
                    <input
                      type="text"
                      placeholder="Name"
                      value={comparePerson1?.name || ''}
                      onChange={(e) => {
                        if (comparePerson1) {
                          setComparePerson1({ ...comparePerson1, name: e.target.value })
                        } else {
                          setComparePerson1({ id: '1', name: e.target.value, birthDate: '' })
                        }
                      }}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl mb-3 text-gray-900 text-sm sm:text-base font-medium transition-all bg-gray-50/50 hover:bg-white hover:border-gray-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <input
                      type="date"
                      value={comparePerson1?.birthDate || ''}
                      onChange={(e) => {
                        if (comparePerson1) {
                          const age = calculateAge(e.target.value)
                          setComparePerson1({ ...comparePerson1, birthDate: e.target.value, age: age || undefined })
                        } else {
                          const age = calculateAge(e.target.value)
                          setComparePerson1({ id: '1', name: '', birthDate: e.target.value, age: age || undefined })
                        }
                      }}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base font-medium transition-all bg-gray-50/50 hover:bg-white hover:border-gray-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2.5">Person 2</label>
                    <input
                      type="text"
                      placeholder="Name"
                      value={comparePerson2?.name || ''}
                      onChange={(e) => {
                        if (comparePerson2) {
                          setComparePerson2({ ...comparePerson2, name: e.target.value })
                        } else {
                          setComparePerson2({ id: '2', name: e.target.value, birthDate: '' })
                        }
                      }}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl mb-3 text-gray-900 text-sm sm:text-base font-medium transition-all bg-gray-50/50 hover:bg-white hover:border-gray-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <input
                      type="date"
                      value={comparePerson2?.birthDate || ''}
                      onChange={(e) => {
                        if (comparePerson2) {
                          const age = calculateAge(e.target.value)
                          setComparePerson2({ ...comparePerson2, birthDate: e.target.value, age: age || undefined })
                        } else {
                          const age = calculateAge(e.target.value)
                          setComparePerson2({ id: '2', name: '', birthDate: e.target.value, age: age || undefined })
                        }
                      }}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base font-medium transition-all bg-gray-50/50 hover:bg-white hover:border-gray-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCompareAges}
                  className="w-full mt-5 sm:mt-6 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-bold text-sm sm:text-base hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-2 active:scale-95 touch-manipulation ring-4 ring-blue-500/20"
                >
                  <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span>Compare Ages</span>
                </button>

                {comparison && (
                  <div className="mt-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 rounded-2xl p-5 sm:p-7 border-2 border-blue-200/60 shadow-xl">
                    <h4 className="text-xl sm:text-2xl font-black text-gray-900 mb-5">
                      <span className="bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent">Comparison Result</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-blue-100/50">
                        <div className="text-xs sm:text-sm text-gray-600 mb-1.5 font-bold uppercase tracking-wide">Older Person</div>
                        <div className="text-lg sm:text-xl font-black text-gray-900">{comparison.older.name || 'Person'}</div>
                      </div>
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-cyan-100/50">
                        <div className="text-xs sm:text-sm text-gray-600 mb-1.5 font-bold uppercase tracking-wide">Age Difference</div>
                        <div className="text-lg sm:text-xl font-black text-gray-900">{comparison.difference} days</div>
                        <div className="text-xs text-gray-600 mt-1">({Math.floor(comparison.difference / 365)} years)</div>
                      </div>
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-indigo-100/50">
                        <div className="text-xs sm:text-sm text-gray-600 mb-1.5 font-bold uppercase tracking-wide">Percentage Difference</div>
                        <div className="text-lg sm:text-xl font-black text-gray-900">{comparison.percentage}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Multiple People Tab */}
          {activeTab === 'multiple' && (
            <div className="space-y-4 sm:space-y-5">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/60 p-5 sm:p-6 md:p-8 ring-1 ring-gray-100/50">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-5 flex items-center space-x-2.5">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl shadow-lg">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <span className="text-gray-900">Multiple People Age Calculator</span>
                </h3>
                <div className="space-y-4 mb-5">
                  <input
                    type="text"
                    placeholder="Person Name"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base font-medium transition-all bg-gray-50/50 hover:bg-white hover:border-gray-300 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                  <input
                    type="date"
                    placeholder="Birth Date"
                    value={newPersonBirthDate}
                    onChange={(e) => setNewPersonBirthDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base font-medium transition-all bg-gray-50/50 hover:bg-white hover:border-gray-300 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                  <button
                    onClick={addPerson}
                    className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl font-bold text-sm sm:text-base hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300 active:scale-95 touch-manipulation ring-4 ring-purple-500/20"
                  >
                    Add Person
                  </button>
                </div>

                {people.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-lg sm:text-xl font-black text-gray-900 mb-4">
                      <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">People ({people.length})</span>
                    </h4>
                    <div className="space-y-3">
                      {people
                        .sort((a, b) => (b.age?.totalDays || 0) - (a.age?.totalDays || 0))
                        .map((person, index) => (
                          <div key={person.id} className="bg-gradient-to-br from-gray-50 via-blue-50/40 to-indigo-50/30 rounded-2xl p-4 sm:p-5 border-2 border-gray-200/60 shadow-lg hover:scale-[1.02] transition-transform">
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2.5 mb-3 flex-wrap">
                                  <div className="p-1.5 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg shadow-md">
                                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                  </div>
                                  <span className="font-black text-gray-900 text-base sm:text-lg">{person.name}</span>
                                  <span className="text-xs sm:text-sm bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 px-2.5 py-1 rounded-full font-bold border border-yellow-200">#{index + 1}</span>
                                </div>
                                {person.age && (
                                  <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                                    <div className="bg-white/80 rounded-xl p-2 sm:p-3 text-center border border-blue-100/50 shadow-sm min-w-0">
                                      <div className="text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent break-words">{person.age.years}</div>
                                      <div className="text-xs text-gray-600 font-bold uppercase tracking-wide mt-1">Years</div>
                                    </div>
                                    <div className="bg-white/80 rounded-xl p-2 sm:p-3 text-center border border-cyan-100/50 shadow-sm min-w-0">
                                      <div className="text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-br from-cyan-600 to-indigo-600 bg-clip-text text-transparent break-words">{person.age.months}</div>
                                      <div className="text-xs text-gray-600 font-bold uppercase tracking-wide mt-1">Months</div>
                                    </div>
                                    <div className="bg-white/80 rounded-xl p-2 sm:p-3 text-center border border-indigo-100/50 shadow-sm min-w-0">
                                      <div className="text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-br from-indigo-600 to-blue-600 bg-clip-text text-transparent break-words">{person.age.days}</div>
                                      <div className="text-xs text-gray-600 font-bold uppercase tracking-wide mt-1">Days</div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => removePerson(person.id)}
                                className="flex-shrink-0 p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110 active:scale-95 font-bold text-xl"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      <MobileBottomAd adKey="e1c8b9ca26b310c0a3bef912e548c08d" />
      <Footer />
      <MobileBottomNavWrapper />
    </div>
  )
}
