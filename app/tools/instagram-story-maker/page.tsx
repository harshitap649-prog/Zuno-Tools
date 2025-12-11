'use client'

import { useState, useRef, useEffect } from 'react'
import Footer from '@/components/Footer'
import MobileBottomAd from '@/components/MobileBottomAd'
import { 
  Image, X, Palette, Download, Upload, Type, 
  RotateCw, Trash2, Edit2, Save
} from 'lucide-react'
import toast from 'react-hot-toast'
import { usePopunderAd } from '@/hooks/usePopunderAd'

interface StoryTemplate {
  id: string
  name: string
  category: string
  layout: 'centered' | 'top' | 'bottom' | 'split' | 'minimal' | 'bold' | 'quote' | 'announcement' | 'photo' | 'collage'
  bgGradient: string[]
  textColor: string
  textPosition: 'center' | 'top' | 'bottom'
  exampleText: string
  description: string
  hasImagePlaceholder?: boolean
  imagePosition?: 'full' | 'top' | 'bottom' | 'center' | 'left' | 'right'
  defaultImageUrl?: string
  defaultImageUrls?: string[] // For collage templates
}

const storyTemplates: StoryTemplate[] = [
  {
    id: 't1',
    name: 'Centered Quote',
    category: 'Quote',
    layout: 'centered',
    bgGradient: ['#667EEA', '#764BA2'],
    textColor: '#FFFFFF',
    textPosition: 'center',
    exampleText: 'Dream big, work hard',
    description: 'Perfect for motivational quotes',
    hasImagePlaceholder: false
  },
  {
    id: 't2',
    name: 'Photo with Top Text',
    category: 'Lifestyle',
    layout: 'top',
    bgGradient: ['#F093FB', '#F5576C'],
    textColor: '#FFFFFF',
    textPosition: 'top',
    exampleText: 'New Launch! 🚀',
    description: 'Image with text overlay at top',
    hasImagePlaceholder: true,
    imagePosition: 'full',
    defaultImageUrl: 'https://p16-capcut-sign-sg.ibyteimg.com/tos-alisg-v-643f9f/owAv7irPAEBIrYkEdADTsi49WAksIiEZAQmAv~tplv-4d650qgzx3-image.image?lk3s=2d54f6b1&x-expires=1796279555&x-signature=3i0cjT%2B1nQdz8uVB2Isi30Dee0s%3D'
  },
  {
    id: 't3',
    name: 'Photo with Bottom Text',
    category: 'Lifestyle',
    layout: 'bottom',
    bgGradient: ['#4ECDC4', '#44A08D'],
    textColor: '#FFFFFF',
    textPosition: 'bottom',
    exampleText: 'Weekend vibes only 🌴',
    description: 'Image with text at bottom',
    hasImagePlaceholder: true,
    imagePosition: 'full',
    defaultImageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeq7nHx6sBDA72JfXewRMPF7C6YCv3FlHJOQ&s'
  },
  {
    id: 't4',
    name: 'Minimalist',
    category: 'Minimal',
    layout: 'minimal',
    bgGradient: ['#FFFFFF', '#F5F5F5'],
    textColor: '#333333',
    textPosition: 'center',
    exampleText: 'Less is more',
    description: 'Clean and simple design',
    hasImagePlaceholder: false
  },
  {
    id: 't5',
    name: 'Bold Statement',
    category: 'Bold',
    layout: 'bold',
    bgGradient: ['#FF6B6B', '#FFE66D'],
    textColor: '#FFFFFF',
    textPosition: 'center',
    exampleText: 'MAKE IT HAPPEN',
    description: 'Eye-catching bold design',
    hasImagePlaceholder: false
  },
  {
    id: 't6',
    name: 'Quote Card',
    category: 'Quote',
    layout: 'quote',
    bgGradient: ['#A8EDEA', '#FED6E3'],
    textColor: '#333333',
    textPosition: 'center',
    exampleText: 'Be yourself; everyone else is already taken.',
    description: 'Elegant quote presentation',
    hasImagePlaceholder: false
  },
  {
    id: 't7',
    name: 'Event Announcement',
    category: 'Announcement',
    layout: 'announcement',
    bgGradient: ['#FA709A', '#FEE140'],
    textColor: '#FFFFFF',
    textPosition: 'center',
    exampleText: 'Save the Date 📅',
    description: 'Perfect for events',
    hasImagePlaceholder: false
  },
  {
    id: 't8',
    name: 'Split Design',
    category: 'Creative',
    layout: 'split',
    bgGradient: ['#89F7FE', '#66A6FF'],
    textColor: '#FFFFFF',
    textPosition: 'center',
    exampleText: 'New Collection',
    description: 'Modern split layout',
    hasImagePlaceholder: true,
    imagePosition: 'left'
  },
  {
    id: 't9',
    name: 'Photo Collage',
    category: 'Creative',
    layout: 'collage',
    bgGradient: ['#FF6B6B', '#FFE66D', '#FF6B9D'],
    textColor: '#FFFFFF',
    textPosition: 'center',
    exampleText: 'Golden hour ✨',
    description: 'Multiple photos in one story',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't10',
    name: 'Photo Background',
    category: 'Lifestyle',
    layout: 'photo',
    bgGradient: ['#4ECDC4', '#44A08D', '#00C9FF'],
    textColor: '#FFFFFF',
    textPosition: 'bottom',
    exampleText: 'Beach day 🏖️',
    description: 'Photo as background with text',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't11',
    name: 'Purple Dream',
    category: 'Creative',
    layout: 'centered',
    bgGradient: ['#667EEA', '#764BA2', '#F093FB'],
    textColor: '#FFFFFF',
    textPosition: 'center',
    exampleText: 'Creative vibes',
    description: 'Dreamy purple gradient',
    hasImagePlaceholder: false
  },
  {
    id: 't12',
    name: 'Pink Blush',
    category: 'Feminine',
    layout: 'top',
    bgGradient: ['#F093FB', '#F5576C', '#FA709A'],
    textColor: '#FFFFFF',
    textPosition: 'top',
    exampleText: 'Pretty in pink 💕',
    description: 'Soft pink gradient',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't13',
    name: 'Neon Glow',
    category: 'Bold',
    layout: 'centered',
    bgGradient: ['#000000', '#1a1a2e', '#16213e'],
    textColor: '#00FFFF',
    textPosition: 'center',
    exampleText: 'NEON DREAMS',
    description: 'Dark with neon accent',
    hasImagePlaceholder: false
  },
  {
    id: 't14',
    name: 'Pastel Dreams',
    category: 'Feminine',
    layout: 'centered',
    bgGradient: ['#FFE5F1', '#FFF0F5', '#FFE4E1'],
    textColor: '#D946EF',
    textPosition: 'center',
    exampleText: 'Soft & Sweet',
    description: 'Gentle pastel colors',
    hasImagePlaceholder: false
  },
  {
    id: 't15',
    name: 'Forest Green',
    category: 'Lifestyle',
    layout: 'bottom',
    bgGradient: ['#2D5016', '#3A7D44', '#4A9B5A'],
    textColor: '#FFFFFF',
    textPosition: 'bottom',
    exampleText: 'Nature vibes 🌿',
    description: 'Earthy green tones',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't16',
    name: 'Midnight Blue',
    category: 'Creative',
    layout: 'centered',
    bgGradient: ['#0F2027', '#203A43', '#2C5364'],
    textColor: '#FFFFFF',
    textPosition: 'center',
    exampleText: 'Night mode',
    description: 'Deep blue gradient',
    hasImagePlaceholder: false
  },
  {
    id: 't17',
    name: 'Coral Sunset',
    category: 'Lifestyle',
    layout: 'top',
    bgGradient: ['#FF6B6B', '#FF8E53', '#FFA07A'],
    textColor: '#FFFFFF',
    textPosition: 'top',
    exampleText: 'Summer feels ☀️',
    description: 'Warm coral tones',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't18',
    name: 'Lavender Fields',
    category: 'Feminine',
    layout: 'centered',
    bgGradient: ['#E6E6FA', '#DDA0DD', '#DA70D6'],
    textColor: '#6B46C1',
    textPosition: 'center',
    exampleText: 'Lavender dreams',
    description: 'Soft purple palette',
    hasImagePlaceholder: false
  },
  {
    id: 't19',
    name: 'Fire Orange',
    category: 'Bold',
    layout: 'bold',
    bgGradient: ['#FF4500', '#FF6347', '#FF7F50'],
    textColor: '#FFFFFF',
    textPosition: 'center',
    exampleText: 'ON FIRE 🔥',
    description: 'Vibrant orange energy',
    hasImagePlaceholder: false
  },
  {
    id: 't20',
    name: 'Ice Blue',
    category: 'Minimal',
    layout: 'minimal',
    bgGradient: ['#E0F7FA', '#B2EBF2', '#80DEEA'],
    textColor: '#00695C',
    textPosition: 'center',
    exampleText: 'Cool & Calm',
    description: 'Fresh ice blue',
    hasImagePlaceholder: false
  },
  {
    id: 't21',
    name: 'Rose Gold',
    category: 'Feminine',
    layout: 'centered',
    bgGradient: ['#F8BBD0', '#F48FB1', '#E91E63'],
    textColor: '#FFFFFF',
    textPosition: 'center',
    exampleText: 'Rose gold elegance',
    description: 'Luxurious rose gold',
    hasImagePlaceholder: false
  },
  {
    id: 't22',
    name: 'Tropical Paradise',
    category: 'Lifestyle',
    layout: 'bottom',
    bgGradient: ['#00CED1', '#20B2AA', '#48D1CC'],
    textColor: '#FFFFFF',
    textPosition: 'bottom',
    exampleText: 'Tropical vibes 🏝️',
    description: 'Tropical turquoise',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't23',
    name: 'Dark Mode',
    category: 'Minimal',
    layout: 'minimal',
    bgGradient: ['#1a1a1a', '#2d2d2d', '#404040'],
    textColor: '#FFFFFF',
    textPosition: 'center',
    exampleText: 'Dark & Modern',
    description: 'Sleek dark theme',
    hasImagePlaceholder: false
  },
  {
    id: 't24',
    name: 'Cherry Blossom',
    category: 'Feminine',
    layout: 'centered',
    bgGradient: ['#FFB6C1', '#FFC0CB', '#FFDAB9'],
    textColor: '#8B0000',
    textPosition: 'center',
    exampleText: 'Spring blooms 🌸',
    description: 'Delicate pink tones',
    hasImagePlaceholder: false
  },
  {
    id: 't25',
    name: 'Polaroid Collage',
    category: 'Creative',
    layout: 'collage',
    bgGradient: ['#FFF8E7', '#F5F5DC', '#FAF0E6'],
    textColor: '#333333',
    textPosition: 'center',
    exampleText: 'Memories 📸',
    description: 'Polaroid-style photo frames',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't26',
    name: 'Circular Photo Grid',
    category: 'Creative',
    layout: 'collage',
    bgGradient: ['#FFE5B4', '#FFCCCB', '#FFB6C1'],
    textColor: '#8B0000',
    textPosition: 'top',
    exampleText: 'LIKE COLD WEATHER',
    description: 'Circular photo cutouts',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't27',
    name: 'Monthly Dump',
    category: 'Lifestyle',
    layout: 'collage',
    bgGradient: ['#E8F4F8', '#D4E6F1', '#AED6F1'],
    textColor: '#1B4F72',
    textPosition: 'top',
    exampleText: 'JANUARY DUMP',
    description: 'Photo dump style layout',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't28',
    name: 'Music Player',
    category: 'Lifestyle',
    layout: 'centered',
    bgGradient: ['#1a1a1a', '#2d2d2d', '#1a1a1a'],
    textColor: '#FFFFFF',
    textPosition: 'center',
    exampleText: 'Now Playing 🎵',
    description: 'Music player style',
    hasImagePlaceholder: false
  },
  {
    id: 't29',
    name: 'Travel Adventure',
    category: 'Lifestyle',
    layout: 'photo',
    bgGradient: ['#FFD700', '#FFA500', '#FF6347'],
    textColor: '#FFFFFF',
    textPosition: 'bottom',
    exampleText: 'Wanderlust ✈️',
    description: 'Perfect for travel photos',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't30',
    name: 'Foodie Vibes',
    category: 'Lifestyle',
    layout: 'photo',
    bgGradient: ['#FF6B6B', '#FF8E53', '#FFA07A'],
    textColor: '#FFFFFF',
    textPosition: 'top',
    exampleText: 'Food Diary 🍕',
    description: 'Great for food photos',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't31',
    name: 'Birthday Celebration',
    category: 'Announcement',
    layout: 'announcement',
    bgGradient: ['#FF69B4', '#FF1493', '#FFB6C1'],
    textColor: '#FFFFFF',
    textPosition: 'center',
    exampleText: 'Happy Birthday! 🎉',
    description: 'Birthday party style',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't32',
    name: 'Valentine\'s Day',
    category: 'Feminine',
    layout: 'centered',
    bgGradient: ['#FF1493', '#FF69B4', '#FFB6C1'],
    textColor: '#FFFFFF',
    textPosition: 'center',
    exampleText: 'Love is in the air 💕',
    description: 'Romantic Valentine theme',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't33',
    name: 'POV Style',
    category: 'Creative',
    layout: 'photo',
    bgGradient: ['#4A90E2', '#5BA3F5', '#6BB6FF'],
    textColor: '#FFFFFF',
    textPosition: 'top',
    exampleText: 'POV: You asked for ideas',
    description: 'POV photo story style',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't34',
    name: 'Coffee Time',
    category: 'Lifestyle',
    layout: 'photo',
    bgGradient: ['#8B4513', '#A0522D', '#CD853F'],
    textColor: '#FFFFFF',
    textPosition: 'center',
    exampleText: 'Coffee first ☕',
    description: 'Perfect for coffee photos',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't35',
    name: 'Good Morning',
    category: 'Lifestyle',
    layout: 'top',
    bgGradient: ['#FFD700', '#FFA500', '#FF8C00'],
    textColor: '#FFFFFF',
    textPosition: 'top',
    exampleText: 'Good Morning ☀️',
    description: 'Morning vibes template',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't36',
    name: 'Good Night',
    category: 'Lifestyle',
    layout: 'photo',
    bgGradient: ['#191970', '#000080', '#4169E1'],
    textColor: '#FFFFFF',
    textPosition: 'center',
    exampleText: 'Good Night 🌙',
    description: 'Nighttime story template',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't37',
    name: 'Rainbow Vibes',
    category: 'Creative',
    layout: 'centered',
    bgGradient: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
    textColor: '#FFFFFF',
    textPosition: 'center',
    exampleText: 'Colorful Day 🌈',
    description: 'Vibrant rainbow gradient',
    hasImagePlaceholder: false
  },
  {
    id: 't38',
    name: 'Fashion Frame',
    category: 'Feminine',
    layout: 'photo',
    bgGradient: ['#FFFFFF', '#F5F5F5', '#E8E8E8'],
    textColor: '#333333',
    textPosition: 'bottom',
    exampleText: 'OOTD 👗',
    description: 'Fashion outfit template',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't39',
    name: 'Behind the Scenes',
    category: 'Lifestyle',
    layout: 'photo',
    bgGradient: ['#2C3E50', '#34495E', '#5D6D7E'],
    textColor: '#FFFFFF',
    textPosition: 'top',
    exampleText: 'BTS ✨',
    description: 'Behind the scenes style',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't40',
    name: 'Ask Me Anything',
    category: 'Interactive',
    layout: 'centered',
    bgGradient: ['#9B59B6', '#8E44AD', '#7D3C98'],
    textColor: '#FFFFFF',
    textPosition: 'center',
    exampleText: 'Ask Me Anything?',
    description: 'Q&A story template',
    hasImagePlaceholder: false
  },
  {
    id: 't41',
    name: 'New Collection',
    category: 'Announcement',
    layout: 'top',
    bgGradient: ['#E74C3C', '#C0392B', '#A93226'],
    textColor: '#FFFFFF',
    textPosition: 'top',
    exampleText: 'New Collection 🛍️',
    description: 'Product launch style',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't42',
    name: 'Sale Alert',
    category: 'Announcement',
    layout: 'bold',
    bgGradient: ['#FF0000', '#FF4500', '#FF6347'],
    textColor: '#FFFFFF',
    textPosition: 'center',
    exampleText: 'FLASH SALE!',
    description: 'Sale announcement template',
    hasImagePlaceholder: false
  },
  {
    id: 't43',
    name: 'Quote with Frame',
    category: 'Quote',
    layout: 'quote',
    bgGradient: ['#F8F9FA', '#E9ECEF', '#DEE2E6'],
    textColor: '#212529',
    textPosition: 'center',
    exampleText: 'Be yourself',
    description: 'Framed quote style',
    hasImagePlaceholder: false
  },
  {
    id: 't44',
    name: 'Gradient Overlay',
    category: 'Creative',
    layout: 'photo',
    bgGradient: ['#667EEA', '#764BA2'],
    textColor: '#FFFFFF',
    textPosition: 'bottom',
    exampleText: 'Dream Big',
    description: 'Gradient photo overlay',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't45',
    name: 'Minimalist Photo',
    category: 'Minimal',
    layout: 'photo',
    bgGradient: ['#FFFFFF', '#F8F8F8'],
    textColor: '#000000',
    textPosition: 'bottom',
    exampleText: 'Simple & Clean',
    description: 'Minimal photo template',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't46',
    name: 'Bold Typography',
    category: 'Bold',
    layout: 'bold',
    bgGradient: ['#000000', '#1a1a1a'],
    textColor: '#FFFFFF',
    textPosition: 'center',
    exampleText: 'MAKE IT BOLD',
    description: 'Strong typography focus',
    hasImagePlaceholder: false
  },
  {
    id: 't47',
    name: 'Wedding Story',
    category: 'Announcement',
    layout: 'photo',
    bgGradient: ['#FFE4E1', '#FFB6C1', '#FFC0CB'],
    textColor: '#8B0000',
    textPosition: 'center',
    exampleText: 'Just Married 💒',
    description: 'Wedding celebration',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
  {
    id: 't48',
    name: 'Workout Motivation',
    category: 'Quote',
    layout: 'bold',
    bgGradient: ['#FF6B6B', '#4ECDC4'],
    textColor: '#FFFFFF',
    textPosition: 'center',
    exampleText: 'NO PAIN NO GAIN',
    description: 'Fitness motivation',
    hasImagePlaceholder: true,
    imagePosition: 'full'
  },
]

export default function InstagramStoryIdeas() {
  const [selectedTemplate, setSelectedTemplate] = useState<StoryTemplate | null>(null)
  const [templateCategory, setTemplateCategory] = useState('All')
  const [customText, setCustomText] = useState('')
  const [customTextColor, setCustomTextColor] = useState('#FFFFFF')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([]) // For collage
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { triggerPopunder } = usePopunderAd()

  // Initialize custom text when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      setCustomText(selectedTemplate.exampleText)
      setCustomTextColor(selectedTemplate.textColor)
      // Load default images from URLs if available
      if (selectedTemplate.defaultImageUrl) {
        loadImageFromUrl(selectedTemplate.defaultImageUrl).then(url => {
          setUploadedImage(url)
        }).catch(() => {
          setUploadedImage(null)
        })
      } else if (selectedTemplate.defaultImageUrls && selectedTemplate.defaultImageUrls.length > 0) {
        Promise.all(selectedTemplate.defaultImageUrls.map(url => loadImageFromUrl(url)))
          .then(urls => {
            const validUrls = urls.filter((url): url is string => url !== null)
            setUploadedImages(validUrls)
          })
          .catch(() => setUploadedImages([]))
      } else {
        setUploadedImage(null)
        setUploadedImages([])
      }
    }
  }, [selectedTemplate])

  const loadImageFromUrl = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url, { mode: 'cors' })
      if (!response.ok) throw new Error('Failed to load image')
      const blob = await response.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      // Try direct URL if CORS fails
      return url
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (selectedTemplate?.layout === 'collage') {
      // Handle multiple files for collage
      const fileArray = Array.from(files).slice(0, 4)
      const readers = fileArray.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (event) => resolve(event.target?.result as string)
          reader.readAsDataURL(file)
        })
      })
      Promise.all(readers).then(results => {
        setUploadedImages(results)
        setTimeout(drawStory, 100)
      })
    } else {
      // Handle single file
      const file = files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
        setTimeout(drawStory, 100)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUrlInput = async (url: string) => {
    if (!url.trim()) return
    
    try {
      const imageUrl = await loadImageFromUrl(url)
      if (imageUrl) {
        if (selectedTemplate?.layout === 'collage') {
          setUploadedImages(prev => [...prev, imageUrl].slice(0, 4))
        } else {
          setUploadedImage(imageUrl)
        }
        setTimeout(drawStory, 100)
        toast.success('Image loaded successfully!')
      }
    } catch (error) {
      toast.error('Failed to load image from URL')
    }
  }

  const drawStory = () => {
    const canvas = canvasRef.current
    if (!canvas || !selectedTemplate) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1080
    canvas.height = 1920

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1920)
    if (selectedTemplate.bgGradient.length > 2) {
      gradient.addColorStop(0, selectedTemplate.bgGradient[0])
      gradient.addColorStop(0.5, selectedTemplate.bgGradient[1])
      gradient.addColorStop(1, selectedTemplate.bgGradient[2])
    } else {
      gradient.addColorStop(0, selectedTemplate.bgGradient[0])
      gradient.addColorStop(1, selectedTemplate.bgGradient[1])
    }
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1080, 1920)

    // Draw uploaded image
    if (uploadedImage && selectedTemplate.hasImagePlaceholder) {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        // Redraw background
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 1080, 1920)
        
        if (selectedTemplate.imagePosition === 'full') {
          // Full background image with overlay
          ctx.drawImage(img, 0, 0, 1080, 1920)
          // Dark overlay for text readability
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
          ctx.fillRect(0, 0, 1080, 1920)
        } else if (selectedTemplate.imagePosition === 'left' && selectedTemplate.layout === 'split') {
          // Split layout - image on left
          ctx.drawImage(img, 0, 0, 540, 1920)
        } else if (selectedTemplate.imagePosition === 'top') {
          ctx.drawImage(img, 0, 0, 1080, 1200)
        } else if (selectedTemplate.imagePosition === 'bottom') {
          ctx.drawImage(img, 0, 720, 1080, 1200)
        } else {
          ctx.drawImage(img, 0, 0, 1080, 1920)
        }
        drawText(ctx)
      }
      img.onerror = () => {
        drawText(ctx)
      }
      img.src = uploadedImage
    } else if (selectedTemplate.layout === 'collage' && uploadedImages.length > 0) {
      // Draw collage
      const cols = uploadedImages.length <= 2 ? 2 : 2
      const rows = Math.ceil(uploadedImages.length / cols)
      const cellWidth = 1080 / cols
      const cellHeight = 1920 / rows
      
      let loadedCount = 0
      const images: HTMLImageElement[] = []
      
      uploadedImages.forEach((imgSrc, index) => {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          loadedCount++
          if (loadedCount === uploadedImages.length) {
            // Redraw background
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, 1080, 1920)
            
            // Draw all images
            images.forEach((loadedImg, idx) => {
              const col = idx % cols
              const row = Math.floor(idx / cols)
              const x = col * cellWidth
              const y = row * cellHeight
              ctx.drawImage(loadedImg, x, y, cellWidth, cellHeight)
            })
            
            drawText(ctx)
          }
        }
        img.onerror = () => {
          loadedCount++
          if (loadedCount === uploadedImages.length) {
            drawText(ctx)
          }
        }
        img.src = imgSrc
        images.push(img)
      })
    } else {
      drawText(ctx)
    }
  }

  const drawText = (ctx: CanvasRenderingContext2D) => {
    if (!selectedTemplate || !customText) return

    ctx.fillStyle = customTextColor
    ctx.font = selectedTemplate.layout === 'bold' 
      ? 'bold 120px Arial' 
      : selectedTemplate.layout === 'minimal'
      ? '300 80px Arial'
      : 'bold 90px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Add text shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 15
    ctx.shadowOffsetX = 3
    ctx.shadowOffsetY = 3

    let y = 960 // center
    if (selectedTemplate.textPosition === 'top') {
      y = 200
    } else if (selectedTemplate.textPosition === 'bottom') {
      y = 1720
    }

    // Handle text wrapping
    const maxWidth = 900
    const words = customText.split(' ')
    let line = ''
    let lineY = y - (words.length > 3 ? 60 : 0)

    words.forEach((word, index) => {
      const testLine = line + word + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && index > 0) {
        ctx.fillText(line, 540, lineY)
        line = word + ' '
        lineY += 100
      } else {
        line = testLine
      }
    })
    ctx.fillText(line, 540, lineY)
  }

  useEffect(() => {
    if (selectedTemplate) {
      drawStory()
    }
  }, [selectedTemplate, customText, customTextColor, uploadedImage, uploadedImages])

  const downloadStory = () => {
    const canvas = canvasRef.current
    if (!canvas || !selectedTemplate) return

    const link = document.createElement('a')
    link.download = `instagram-story-${selectedTemplate.name.toLowerCase().replace(/\s+/g, '-')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    
    triggerPopunder()
    toast.success('Story downloaded!')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      <main className="flex-grow py-4 sm:py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 mb-3 sm:mb-4">
              <Image className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">Instagram Story Templates</h1>
            <p className="text-sm sm:text-base text-gray-900 px-4">Create beautiful Instagram stories with customizable templates</p>
          </div>

          {/* Editor Mode */}
          {selectedTemplate ? (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Editing: {selectedTemplate.name}</h2>
                  <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedTemplate(null)
                    setUploadedImage(null)
                    setUploadedImages([])
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation active:scale-95"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Editor Controls */}
                <div className="space-y-4">
                  {/* Text Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Story Text</label>
                    <textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Enter your story text..."
                      maxLength={100}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 text-base touch-manipulation resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">{customText.length}/100 characters</p>
                  </div>

                  {/* Text Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Text Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={customTextColor}
                        onChange={(e) => setCustomTextColor(e.target.value)}
                        className="w-16 h-12 rounded-lg cursor-pointer border border-gray-300"
                      />
                      <input
                        type="text"
                        value={customTextColor}
                        onChange={(e) => setCustomTextColor(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  {selectedTemplate.hasImagePlaceholder && (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        {selectedTemplate.layout === 'collage' ? 'Upload Images (up to 4)' : 'Upload Image'}
                      </label>
                      
                      {/* URL Input for Google Images */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Or paste image URL (Google Images)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            id="imageUrlInput"
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement
                                handleImageUrlInput(input.value)
                                input.value = ''
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              const input = document.getElementById('imageUrlInput') as HTMLInputElement
                              if (input?.value) {
                                handleImageUrlInput(input.value)
                                input.value = ''
                              }
                            }}
                            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium touch-manipulation active:scale-95"
                          >
                            Load
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Paste Google Image URL and click Load</p>
                      </div>

                      {/* File Upload */}
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          multiple={selectedTemplate.layout === 'collage'}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-pink-500 transition-colors flex items-center justify-center gap-2 text-gray-600 bg-gray-50 touch-manipulation active:scale-95"
                        >
                          <Upload className="h-5 w-5" />
                          <span>{selectedTemplate.layout === 'collage' ? 'Upload Images from Device' : 'Upload Image from Device'}</span>
                        </button>
                      </div>

                      {/* Current Images Display */}
                      {(uploadedImage || uploadedImages.length > 0) && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-700">Current {selectedTemplate.layout === 'collage' ? 'Images' : 'Image'}:</p>
                          <div className={`grid ${selectedTemplate.layout === 'collage' ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                            {selectedTemplate.layout === 'collage' ? (
                              uploadedImages.map((img, idx) => (
                                <div key={idx} className="relative group">
                                  <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                                  <button
                                    onClick={() => {
                                      setUploadedImages(prev => prev.filter((_, i) => i !== idx))
                                      setTimeout(drawStory, 100)
                                    }}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))
                            ) : (
                              uploadedImage && (
                                <div className="relative group">
                                  <img src={uploadedImage} alt="Uploaded" className="w-full h-48 object-cover rounded-lg" />
                                  <button
                                    onClick={() => {
                                      setUploadedImage(null)
                                      setTimeout(drawStory, 100)
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setUploadedImage(null)
                              setUploadedImages([])
                              setTimeout(drawStory, 100)
                            }}
                            className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium touch-manipulation active:scale-95"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove All {selectedTemplate.layout === 'collage' ? 'Images' : 'Image'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Download Button */}
                  <button
                    onClick={downloadStory}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-base touch-manipulation active:scale-95"
                  >
                    <Download className="h-5 w-5" />
                    Download Story
                  </button>
                </div>

                {/* Preview */}
                <div className="flex items-center justify-center">
                  <div className="bg-gray-100 rounded-xl p-4 w-full max-w-[300px]">
                    <div className="aspect-[9/16] bg-white rounded-lg overflow-hidden shadow-lg">
                      <canvas
                        ref={canvasRef}
                        className="w-full h-full"
                        style={{ display: 'block' }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">Instagram Story Preview (9:16)</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Category Filter */}
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-wrap gap-2 justify-center">
                  {['All', 'Quote', 'Announcement', 'Lifestyle', 'Minimal', 'Bold', 'Creative', 'Feminine', 'Interactive'].map((cat: string) => (
                    <button
                      key={cat}
                      onClick={() => setTemplateCategory(cat)}
                      className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-medium transition-all touch-manipulation active:scale-95 ${
                        templateCategory === cat
                          ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Templates Grid */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {storyTemplates.filter(t => templateCategory === 'All' || t.category === templateCategory).length} Templates
                  </h2>
                  <p className="text-sm text-gray-600 hidden sm:block">Click a template to customize</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {storyTemplates
                    .filter(t => templateCategory === 'All' || t.category === templateCategory)
                    .map((template) => (
                    <div
                      key={template.id}
                      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 overflow-hidden cursor-pointer group"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      {/* Template Preview */}
                      <div className="relative aspect-[9/16] overflow-hidden">
                        <div
                          className="w-full h-full flex items-center justify-center p-4 relative"
                          style={{
                            background: template.bgGradient.length > 2
                              ? `linear-gradient(135deg, ${template.bgGradient[0]} 0%, ${template.bgGradient[1]} 50%, ${template.bgGradient[2]} 100%)`
                              : `linear-gradient(135deg, ${template.bgGradient[0]} 0%, ${template.bgGradient[1]} 100%)`
                          }}
                        >
                          {/* Image Placeholder */}
                          {template.hasImagePlaceholder && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                              <div className="text-center">
                                <Image className="h-12 w-12 text-white opacity-50 mx-auto mb-2" />
                                <p className="text-white text-xs opacity-75">Add Photo</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Text Preview */}
                          <div
                            className={`text-center w-full z-10 ${
                              template.textPosition === 'top' ? 'self-start mt-8' :
                              template.textPosition === 'bottom' ? 'self-end mb-8' :
                              'self-center'
                            }`}
                          >
                            <p
                              className={`font-bold text-sm sm:text-base ${
                                template.layout === 'bold' ? 'text-lg sm:text-xl' :
                                template.layout === 'minimal' ? 'text-xs sm:text-sm' :
                                'text-sm sm:text-base'
                              }`}
                              style={{ color: template.textColor }}
                            >
                              {template.exampleText}
                            </p>
                          </div>
                        </div>
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white rounded-lg px-4 py-2">
                              <p className="text-sm font-semibold text-gray-900">Customize</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Template Info */}
                      <div className="p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{template.name}</h3>
                          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                            {template.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{template.description}</p>
                        {template.hasImagePlaceholder && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-pink-600">
                            <Image className="h-3 w-3" />
                            <span>Supports images</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <MobileBottomAd adKey="36d691042d95ac1ac33375038ec47a5c" />
      <Footer />
    </div>
  )
}

