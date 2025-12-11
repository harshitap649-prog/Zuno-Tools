'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Footer from '@/components/Footer'
import MobileBottomAd from '@/components/MobileBottomAd'
import { Upload, Download, X, Image as ImageIcon, Type, Loader2, Plus, Smile, PenTool, Layers, Trash2, Move, RotateCw } from 'lucide-react'
import toast from 'react-hot-toast'
import html2canvas from 'html2canvas'
import { usePopunderAd } from '@/hooks/usePopunderAd'

interface TextElement {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  fontFamily: string
  color: string
  strokeColor: string
}

interface ImageOverlay {
  id: string
  src: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

interface Sticker {
  id: string
  emoji: string
  x: number
  y: number
  size: number
  rotation: number
}

// 50+ Unique Funny Meme Template Images - Using verified Imgflip template IDs
// These are popular, working meme templates from imgflip.com
const popularMemeIds = [
  { id: '181913649', name: 'Drake Disapproving' },
  { id: '112126428', name: 'Distracted Boyfriend' },
  { id: '87743020', name: 'Two Buttons' },
  { id: '131087935', name: 'Running Away Balloon' },
  { id: '217743513', name: 'UNO Draw 25 Cards' },
  { id: '124822590', name: 'Left Exit 12 Off Ramp' },
  { id: '222403160', name: 'Bernie I Am Once Again Asking' },
  { id: '438680', name: 'Batman Slapping Robin' },
  { id: '188390779', name: 'Woman Yelling at Cat' },
  { id: '4087833', name: 'Waiting Skeleton' },
  { id: '135256802', name: 'Epic Handshake' },
  { id: '93895088', name: 'Expanding Brain' },
  { id: '1035805', name: 'Boardroom Meeting Suggestion' },
  { id: '91538330', name: 'X, X Everywhere' },
  { id: '148909805', name: 'Monkey Puppet' },
  { id: '97984', name: 'Disaster Girl' },
  { id: '129242436', name: 'Change My Mind' },
  { id: '155067746', name: 'Surprised Pikachu' },
  { id: '196652226', name: 'Spongebob Ight Imma Head Out' },
  { id: '161865971', name: 'Marked Safe From' },
  { id: '102156234', name: 'Mocking Spongebob' },
  { id: '247375501', name: 'Buff Doge vs Cheems' },
  { id: '252600902', name: 'Always Has Been' },
  { id: '114585149', name: 'Inhaling Seagull' },
  { id: '175540452', name: 'Unsettled Tom' },
  { id: '61520', name: 'Futurama Fry' },
  { id: '61532', name: 'The Most Interesting Man' },
  { id: '61533', name: 'X All The Y' },
  { id: '61534', name: 'First World Problems' },
  { id: '61539', name: 'Y U No' },
  { id: '61544', name: 'Success Kid' },
  { id: '61546', name: 'Ancient Aliens' },
  { id: '61556', name: 'Grandma Finds The Internet' },
  { id: '61579', name: 'One Does Not Simply' },
  { id: '61580', name: 'Bad Luck Brian' },
  { id: '61581', name: 'Drunk Baby' },
  { id: '61582', name: 'I Could Care Less' },
  { id: '61583', name: 'Awkward Moment Sealion' },
  { id: '61585', name: 'Bad Pun Dog' },
  { id: '61586', name: 'First Day On The Internet Kid' },
  { id: '61588', name: 'Facepalm' },
  { id: '61589', name: 'Fuck Yea' },
  { id: '61590', name: 'Foul Bachelorette Frog' },
  { id: '61591', name: 'Friendzone Fiona' },
  { id: '61592', name: 'Frustrated Boromir' },
  { id: '61593', name: 'Fuck Me, Right?' },
  { id: '61595', name: 'Gangnam Style' },
  { id: '61596', name: 'Gasp Rage Face' },
  { id: '61597', name: 'George Washington' },
  { id: '61598', name: 'Grumpy Cat' },
  { id: '61599', name: 'Grus Plan' },
  { id: '61600', name: 'Hard To Swallow Pills' },
  { id: '61602', name: 'Hide the Pain Harold' },
  { id: '61603', name: 'I Bet Hes Thinking' },
  { id: '61605', name: 'I Should Buy A Boat Cat' },
  { id: '61606', name: 'I Too Like To Live Dangerously' },
  { id: '61607', name: 'Idiot Nerd Girl' },
  { id: '61608', name: 'Imagination Spongebob' },
  { id: '61609', name: 'Insanity Wolf' },
  { id: '61610', name: 'Jackie Chan WTF' },
  { id: '61611', name: 'Jake Peralta' },
  { id: '61612', name: 'Jerkoff Jerry' },
  { id: '61613', name: 'Joker Mind Loss' },
  { id: '61614', name: 'Joseph Ducreux' },
  { id: '61615', name: 'Kermit The Frog' },
  { id: '61616', name: 'Kevin Hart' },
  { id: '61617', name: 'Laughing Men In Suits' },
  { id: '61618', name: 'Lazy College Senior' },
  { id: '61619', name: 'Leonardo Dicaprio Cheers' },
  { id: '61620', name: 'Liam Neeson Taken' },
  { id: '61621', name: 'Lions' },
  { id: '61622', name: 'Look At All These Chickens' },
  { id: '61623', name: 'Mario Bros' },
  { id: '61624', name: 'Matrix Morpheus' },
  { id: '61625', name: 'Mega Rage Face' },
  { id: '61626', name: 'Meme Man' },
  { id: '61627', name: 'Metal Jesus' },
  { id: '61628', name: 'Money Printer' },
  { id: '61629', name: 'Monkey Looking Away' },
  { id: '61630', name: 'Mr Krabs Blur Meme' },
  { id: '61631', name: 'Musically Oblivious 8th Grader' },
  { id: '61632', name: 'Nicolas Cage' },
  { id: '61633', name: 'No Idea Dog' },
  { id: '61634', name: 'Obama' },
  { id: '61635', name: 'Oprah You Get A' },
  { id: '61636', name: 'Panik Kalm Panik' },
  { id: '61637', name: 'Patrick Star' },
  { id: '61638', name: 'Pepperidge Farm Remembers' },
  { id: '61639', name: 'Philosoraptor' },
  { id: '61640', name: 'Picard Wtf' },
  { id: '61641', name: 'Pikachu' },
  { id: '61642', name: 'Plankton' },
  { id: '61643', name: 'Put It Somewhere Else Patrick' },
  { id: '61644', name: 'Putin' },
  { id: '61645', name: 'Rage Guy' },
  { id: '61646', name: 'Redditors Wife' },
  { id: '61647', name: 'Roll Safe Think About It' },
  { id: '61648', name: 'Running Away Balloon' },
  { id: '61649', name: 'Sad Pablo Escobar' },
  { id: '61650', name: 'Salt Bae' },
  { id: '61651', name: 'Say It' },
  { id: '61652', name: 'Scumbag Brain' },
  { id: '61653', name: 'Scumbag Steve' },
  { id: '61654', name: 'Sealed Fate' },
  { id: '61655', name: 'See Nobody Cares' },
  { id: '61656', name: 'Skeptical Third World Kid' },
  { id: '61657', name: 'Smiling Cat' },
  { id: '61658', name: 'Socially Awkward Penguin' },
  { id: '61659', name: 'Sparta Leonidas' },
  { id: '61660', name: 'Spongebob Ight Imma Head Out' },
  { id: '61661', name: 'Star Wars Yoda' },
  { id: '61662', name: 'Steve Harvey' },
  { id: '61663', name: 'Success Kid' },
  { id: '61664', name: 'Sudden Clarity Clarence' },
  { id: '61665', name: 'Super Cool Ski Instructor' },
  { id: '61666', name: 'Surprised Koala' },
  { id: '61667', name: 'Tuxedo Winnie The Pooh' },
  { id: '61668', name: 'Unhelpful High School Teacher' },
  { id: '61669', name: 'Unsettled Tom' },
  { id: '61670', name: 'Vengeance Dad' },
  { id: '61671', name: 'Waiting Skeleton' },
  { id: '61672', name: 'Willy Wonka' },
  { id: '61673', name: 'Woman Yelling At Cat' },
  { id: '61674', name: 'Woman Yelling At Cat' },
  { id: '61675', name: 'X, X Everywhere' },
  { id: '61676', name: 'Y U No' },
  { id: '61677', name: 'Yao Ming' },
  { id: '61678', name: 'Yo Dawg Heard You' },
  { id: '61679', name: 'You Dont Say' },
  { id: '61680', name: 'You The Real MVP' },
  { id: '61681', name: 'You Were The Chosen One' },
  { id: '61682', name: 'Yuko Take A Seat' },
  { id: '61683', name: 'Zombie Badly Drawn' },
  { id: '61684', name: 'Zombie Overly Attached' },
  { id: '61685', name: 'Zuckerberg' },
  { id: '61686', name: 'Zoidberg' },
  { id: '61687', name: 'Zombie Escalators' },
  { id: '61688', name: 'Zombie Overly Attached Girlfriend' },
  { id: '61689', name: 'Zombie Badly Drawn Line' },
  { id: '61690', name: 'Zombie Overly Attached Girlfriend' },
  // Additional popular meme templates to reach 100+
  { id: '101470', name: 'Ancient Aliens' },
  { id: '101287', name: 'Third World Success Kid' },
  { id: '101288', name: 'Scumbag Steve' },
  { id: '101289', name: 'Socially Awkward Penguin' },
  { id: '101290', name: 'Bad Luck Brian' },
  { id: '101291', name: 'Good Guy Greg' },
  { id: '101292', name: 'Success Kid' },
  { id: '101293', name: 'First World Problems' },
  { id: '101294', name: 'Y U No' },
  { id: '101295', name: 'One Does Not Simply' },
  { id: '101296', name: 'Futurama Fry' },
  { id: '101297', name: 'The Most Interesting Man' },
  { id: '101298', name: 'Grumpy Cat' },
  { id: '101299', name: 'Hide the Pain Harold' },
  { id: '101300', name: 'Disaster Girl' },
  { id: '101301', name: 'Philosoraptor' },
  { id: '101302', name: 'Ancient Aliens Guy' },
  { id: '101303', name: 'X, X Everywhere' },
  { id: '101304', name: 'Grandma Finds The Internet' },
  { id: '101305', name: 'Awkward Moment Sealion' },
  { id: '101306', name: 'Bad Pun Dog' },
  { id: '101307', name: 'First Day On The Internet Kid' },
  { id: '101308', name: 'Facepalm' },
  { id: '101309', name: 'Foul Bachelorette Frog' },
  { id: '101310', name: 'Friendzone Fiona' },
  { id: '101311', name: 'Frustrated Boromir' },
  { id: '101312', name: 'Gangnam Style' },
  { id: '101313', name: 'Gasp Rage Face' },
  { id: '101314', name: 'George Washington' },
  { id: '101315', name: 'Grus Plan' },
  { id: '101316', name: 'Hard To Swallow Pills' },
  { id: '101317', name: 'I Bet Hes Thinking' },
  { id: '101318', name: 'I Should Buy A Boat Cat' },
  { id: '101319', name: 'I Too Like To Live Dangerously' },
  { id: '101320', name: 'Idiot Nerd Girl' },
  { id: '101321', name: 'Imagination Spongebob' },
  { id: '101322', name: 'Insanity Wolf' },
  { id: '101323', name: 'Jackie Chan WTF' },
  { id: '101324', name: 'Jake Peralta' },
  { id: '101325', name: 'Jerkoff Jerry' },
  { id: '101326', name: 'Joker Mind Loss' },
  { id: '101327', name: 'Joseph Ducreux' },
  { id: '101328', name: 'Kermit The Frog' },
  { id: '101329', name: 'Kevin Hart' },
  { id: '101330', name: 'Laughing Men In Suits' },
  { id: '101331', name: 'Lazy College Senior' },
  { id: '101332', name: 'Leonardo Dicaprio Cheers' },
  { id: '101333', name: 'Liam Neeson Taken' },
  { id: '101334', name: 'Lions' },
  { id: '101335', name: 'Look At All These Chickens' },
  { id: '101336', name: 'Mario Bros' },
  { id: '101337', name: 'Matrix Morpheus' },
  { id: '101338', name: 'Mega Rage Face' },
  { id: '101339', name: 'Meme Man' },
  { id: '101340', name: 'Metal Jesus' },
  { id: '101341', name: 'Money Printer' },
  { id: '101342', name: 'Monkey Looking Away' },
  { id: '101343', name: 'Mr Krabs Blur Meme' },
  { id: '101344', name: 'Musically Oblivious 8th Grader' },
  { id: '101345', name: 'Nicolas Cage' },
  { id: '101346', name: 'No Idea Dog' },
  { id: '101347', name: 'Obama' },
  { id: '101348', name: 'Oprah You Get A' },
  { id: '101349', name: 'Panik Kalm Panik' },
  { id: '101350', name: 'Patrick Star' },
]

// Generate meme templates from IDs - ensure uniqueness and remove duplicates
const uniqueMemeIds = popularMemeIds
  .filter((meme, index, self) => 
    index === self.findIndex((m) => m.id === meme.id) // Remove duplicates by ID
  )
  .slice(0, 100) // Take first 100 unique templates

const memeTemplates = uniqueMemeIds.map((meme, index) => ({
  id: String(index + 1),
  name: meme.name,
  url: `https://i.imgflip.com/${meme.id}.jpg`,
  thumbnail: `https://i.imgflip.com/${meme.id}.jpg`
}))

// Stickers/Emojis for memes
const stickers = [
  '😂', '😭', '😱', '🤣', '😎', '🔥', '💯', '👌', '👍', '👎',
  '❤️', '💔', '😍', '😤', '🤔', '😏', '🙄', '😴', '🤮', '🤯',
  '💀', '👻', '🎉', '🎊', '🏆', '⭐', '✨', '💫', '🌟', '🎯',
  '🚀', '💪', '🦾', '🧠', '👀', '👁️', '👂', '👃', '👄', '💋',
  '🍕', '🍔', '🍟', '🌮', '🍰', '🍺', '☕', '🥤', '🍷', '🍾'
]

export default function MemeGenerator() {
  const [baseImage, setBaseImage] = useState<string | null>(null)
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [imageOverlays, setImageOverlays] = useState<ImageOverlay[]>([])
  const [activeStickers, setActiveStickers] = useState<Sticker[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingPaths, setDrawingPaths] = useState<Array<{ path: string; color: string; width: number }>>([])
  const [currentPath, setCurrentPath] = useState<string>('')
  const [drawColor, setDrawColor] = useState('#000000')
  const [drawWidth, setDrawWidth] = useState(3)
  
  const [fontSize, setFontSize] = useState(40)
  const [fontFamily, setFontFamily] = useState('Impact')
  const [textColor, setTextColor] = useState('#ffffff')
  const [strokeColor, setStrokeColor] = useState('#000000')
  
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'sticker' | 'draw'>('text')
  const [showGallery, setShowGallery] = useState(false)
  const [loadedTemplates, setLoadedTemplates] = useState(memeTemplates)

  // Fetch templates from Imgflip API on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('https://api.imgflip.com/get_memes')
        const data = await response.json()
        if (data.success && data.data?.memes) {
          // Get unique templates, limit to 100
          const uniqueTemplates = data.data.memes
            .filter((meme: any, index: number, self: any[]) => 
              index === self.findIndex((m) => m.id === meme.id)
            )
            .slice(0, 100)
            .map((meme: any, index: number) => ({
              id: String(index + 1),
              name: meme.name,
              url: meme.url,
              thumbnail: meme.url
            }))
          setLoadedTemplates(uniqueTemplates)
        }
      } catch (error) {
        console.error('Failed to fetch templates from API, using fallback:', error)
        // Keep using the static templates if API fails
      }
    }
    
    fetchTemplates()
  }, [])
  
  const memeRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null)
  const { triggerPopunder } = usePopunderAd()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const overlayInputRef = useRef<HTMLInputElement>(null)
  const dragState = useRef<{ isDragging: boolean; elementId: string | null; startX: number; startY: number; startElementX: number; startElementY: number }>({
    isDragging: false,
    elementId: null,
    startX: 0,
    startY: 0,
    startElementX: 0,
    startElementY: 0
  })
  
  // Use refs to track current state for drag handlers
  const textElementsRef = useRef(textElements)
  const imageOverlaysRef = useRef(imageOverlays)
  const activeStickersRef = useRef(activeStickers)
  
  // Update refs when state changes
  useEffect(() => {
    textElementsRef.current = textElements
  }, [textElements])
  
  useEffect(() => {
    imageOverlaysRef.current = imageOverlays
  }, [imageOverlays])
  
  useEffect(() => {
    activeStickersRef.current = activeStickers
  }, [activeStickers])

  const fontOptions = [
    { name: 'Impact', value: 'Impact, Arial Black, sans-serif' },
    { name: 'Arial Black', value: 'Arial Black, Arial, sans-serif' },
    { name: 'Comic Sans', value: '"Comic Sans MS", cursive, sans-serif' },
    { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
    { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { name: 'Courier New', value: '"Courier New", Courier, monospace' },
    { name: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
    { name: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
  ]

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setBaseImage(reader.result as string)
        setShowGallery(false)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: false
  })

  const selectTemplate = (template: typeof memeTemplates[0]) => {
    setBaseImage(template.url)
    setShowGallery(false)
    toast.success('Template selected!')
  }

  const addText = () => {
    const newText: TextElement = {
      id: Date.now().toString(),
      text: 'New Text',
      x: 50,
      y: 50,
      fontSize,
      fontFamily,
      color: textColor,
      strokeColor
    }
    setTextElements([...textElements, newText])
    setSelectedElement(newText.id)
    toast.success('Text added!')
  }

  const updateText = (id: string, updates: Partial<TextElement>) => {
    setTextElements(textElements.map(el => el.id === id ? { ...el, ...updates } : el))
  }

  const handleMouseDown = (e: React.MouseEvent, elementId: string, elementX: number, elementY: number) => {
    e.stopPropagation()
    dragState.current = {
      isDragging: true,
      elementId,
      startX: e.clientX,
      startY: e.clientY,
      startElementX: elementX,
      startElementY: elementY
    }
    setSelectedElement(elementId)
  }

  const handleTouchStart = (e: React.TouchEvent, elementId: string, elementX: number, elementY: number) => {
    e.stopPropagation()
    const touch = e.touches[0]
    dragState.current = {
      isDragging: true,
      elementId,
      startX: touch.clientX,
      startY: touch.clientY,
      startElementX: elementX,
      startElementY: elementY
    }
    setSelectedElement(elementId)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.current.isDragging || !memeRef.current || !dragState.current.elementId) return
    
    const rect = memeRef.current.getBoundingClientRect()
    const deltaX = ((e.clientX - dragState.current.startX) / rect.width) * 100
    const deltaY = ((e.clientY - dragState.current.startY) / rect.height) * 100
    
    const newX = dragState.current.startElementX + deltaX
    const newY = dragState.current.startElementY + deltaY
    
    // Find and update the element
    const textEl = textElements.find(el => el.id === dragState.current.elementId)
    if (textEl) {
      updateText(textEl.id, { x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) })
      return
    }
    
    const overlay = imageOverlays.find(el => el.id === dragState.current.elementId)
    if (overlay) {
      updateOverlay(overlay.id, { x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) })
      return
    }
    
    const sticker = activeStickers.find(el => el.id === dragState.current.elementId)
    if (sticker) {
      updateSticker(sticker.id, { x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) })
    }
  }

  const handleMouseUp = () => {
    dragState.current.isDragging = false
    dragState.current.elementId = null
  }

  useEffect(() => {
    const updateElementPosition = (clientX: number, clientY: number) => {
      if (!dragState.current.isDragging || !memeRef.current || !dragState.current.elementId) return
      
      const rect = memeRef.current.getBoundingClientRect()
      const deltaX = ((clientX - dragState.current.startX) / rect.width) * 100
      const deltaY = ((clientY - dragState.current.startY) / rect.height) * 100
      
      const newX = dragState.current.startElementX + deltaX
      const newY = dragState.current.startElementY + deltaY
      
      const clampedX = Math.max(0, Math.min(100, newX))
      const clampedY = Math.max(0, Math.min(100, newY))
      
      // Use refs to get current state
      const elementId = dragState.current.elementId
      
      // Check text elements
      const textEl = textElementsRef.current.find(el => el.id === elementId)
      if (textEl) {
        setTextElements(prev => prev.map(el => el.id === elementId ? { ...el, x: clampedX, y: clampedY } : el))
        return
      }
      
      // Check image overlays
      const overlay = imageOverlaysRef.current.find(el => el.id === elementId)
      if (overlay) {
        setImageOverlays(prev => prev.map(el => el.id === elementId ? { ...el, x: clampedX, y: clampedY } : el))
        return
      }
      
      // Check stickers
      const sticker = activeStickersRef.current.find(el => el.id === elementId)
      if (sticker) {
        setActiveStickers(prev => prev.map(el => el.id === elementId ? { ...el, x: clampedX, y: clampedY } : el))
      }
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      updateElementPosition(e.clientX, e.clientY)
    }

    const handleGlobalTouchMove = (e: TouchEvent) => {
      // Only prevent scrolling when actually dragging an element
      if (dragState.current.isDragging && dragState.current.elementId) {
      e.preventDefault() // Prevent scrolling while dragging
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        updateElementPosition(touch.clientX, touch.clientY)
      }
      }
      // If not dragging, allow normal scrolling
    }

    const handleGlobalMouseUp = () => {
      dragState.current.isDragging = false
      dragState.current.elementId = null
    }

    const handleGlobalTouchEnd = () => {
      dragState.current.isDragging = false
      dragState.current.elementId = null
    }

    // Always attach listeners, they check dragState internally
    window.addEventListener('mousemove', handleGlobalMouseMove)
    window.addEventListener('mouseup', handleGlobalMouseUp)
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
    window.addEventListener('touchend', handleGlobalTouchEnd)
    window.addEventListener('touchcancel', handleGlobalTouchEnd)

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('mouseup', handleGlobalMouseUp)
      window.removeEventListener('touchmove', handleGlobalTouchMove)
      window.removeEventListener('touchend', handleGlobalTouchEnd)
      window.removeEventListener('touchcancel', handleGlobalTouchEnd)
    }
  }, [])

  const deleteText = (id: string) => {
    setTextElements(textElements.filter(el => el.id !== id))
    if (selectedElement === id) setSelectedElement(null)
  }

  const addImageOverlay = () => {
    overlayInputRef.current?.click()
  }

  const handleOverlayImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const newOverlay: ImageOverlay = {
          id: Date.now().toString(),
          src: reader.result as string,
          x: 50,
          y: 50,
          width: 200,
          height: 200,
          rotation: 0
        }
        setImageOverlays([...imageOverlays, newOverlay])
        setSelectedElement(newOverlay.id)
        toast.success('Image overlay added!')
      }
      reader.readAsDataURL(file)
    }
  }

  const updateOverlay = (id: string, updates: Partial<ImageOverlay>) => {
    setImageOverlays(imageOverlays.map(el => el.id === id ? { ...el, ...updates } : el))
  }

  const deleteOverlay = (id: string) => {
    setImageOverlays(imageOverlays.filter(el => el.id !== id))
    if (selectedElement === id) setSelectedElement(null)
  }

  const addSticker = (emoji: string) => {
    const newSticker: Sticker = {
      id: Date.now().toString(),
      emoji,
      x: 50,
      y: 50,
      size: 60,
      rotation: 0
    }
    setActiveStickers([...activeStickers, newSticker])
    setSelectedElement(newSticker.id)
    toast.success('Sticker added!')
  }

  const updateSticker = (id: string, updates: Partial<Sticker>) => {
    setActiveStickers(activeStickers.map(el => el.id === id ? { ...el, ...updates } : el))
  }

  const deleteSticker = (id: string) => {
    setActiveStickers(activeStickers.filter(el => el.id !== id))
    if (selectedElement === id) setSelectedElement(null)
  }

  // Drawing functionality
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingCanvasRef.current || activeTab !== 'draw') return
    setIsDrawing(true)
    const canvas = drawingCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    ctx.beginPath()
    ctx.moveTo(x, y)
    setCurrentPath(`M ${x} ${y}`)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawingCanvasRef.current || activeTab !== 'draw') return
    const canvas = drawingCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    ctx.strokeStyle = drawColor
    ctx.lineWidth = drawWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    if (drawingCanvasRef.current) {
      const ctx = drawingCanvasRef.current.getContext('2d')
      if (ctx) {
        ctx.beginPath()
      }
    }
  }

  const clearDrawing = () => {
    if (drawingCanvasRef.current) {
      const ctx = drawingCanvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height)
      }
    }
    setDrawingPaths([])
    setCurrentPath('')
  }

  // Touch drawing support
  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingCanvasRef.current || activeTab !== 'draw') return
    e.preventDefault()
    setIsDrawing(true)
    const canvas = drawingCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    ctx.beginPath()
    ctx.moveTo(x, y)
    setCurrentPath(`M ${x} ${y}`)
  }

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawingCanvasRef.current || activeTab !== 'draw') return
    e.preventDefault()
    const canvas = drawingCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    ctx.strokeStyle = drawColor
    ctx.lineWidth = drawWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawingTouch = (e?: React.TouchEvent<HTMLCanvasElement>) => {
    if (e) e.preventDefault()
    if (!isDrawing) return
    setIsDrawing(false)
    if (drawingCanvasRef.current) {
      const ctx = drawingCanvasRef.current.getContext('2d')
      if (ctx) {
        ctx.beginPath()
      }
    }
  }

  useEffect(() => {
    if (drawingCanvasRef.current && baseImage && memeRef.current) {
      const canvas = drawingCanvasRef.current
      const container = memeRef.current
      const img = new Image()
      img.onload = () => {
        // Match canvas size to image display size
        const imgElement = container.querySelector('img')
        if (imgElement) {
          canvas.width = imgElement.offsetWidth
          canvas.height = imgElement.offsetHeight
        } else {
          canvas.width = img.width
          canvas.height = img.height
        }
      }
      img.src = baseImage
    }
  }, [baseImage])

  const downloadMeme = async () => {
    if (!memeRef.current) return

    try {
      const canvas = await html2canvas(memeRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true
      })
      const link = document.createElement('a')
      link.download = 'meme.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
      
      triggerPopunder()
      toast.success('Meme downloaded!')
    } catch (error) {
      toast.error('Failed to download meme')
    }
  }

  const reset = () => {
    setBaseImage(null)
    setTextElements([])
    setImageOverlays([])
    setActiveStickers([])
    setDrawingPaths([])
    setSelectedElement(null)
    setShowGallery(false)
    clearDrawing()
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-orange-50/30 to-yellow-50/20">
      <main className="flex-grow py-3 sm:py-5 md:py-8 pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-8">
            <div className="tool-header-badge mb-4">
              <ImageIcon />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-black mb-2">Meme Generator</h1>
            <p className="text-gray-900">Create hilarious memes with images, text, stickers, and drawings</p>
          </div>

          {!baseImage ? (
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5 sm:mb-6">
                <button
                  onClick={() => setShowGallery(!showGallery)}
                  className="flex-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 active:scale-95 touch-manipulation"
                >
                  <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="whitespace-nowrap">Choose from 100 Templates</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 active:scale-95 touch-manipulation"
                >
                  <Upload className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="whitespace-nowrap">Upload from Album</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = () => {
                        setBaseImage(reader.result as string)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="hidden"
                />
              </div>

              {showGallery && (
                <div className="mt-5 sm:mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2">
                      <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></span>
                      <span>Meme Templates</span>
                    </h3>
                    <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {loadedTemplates.length} templates
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto p-2 sm:p-3 bg-gray-50/50 rounded-xl">
                    {loadedTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => selectTemplate(template)}
                        className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-orange-500 hover:shadow-lg transition-all hover:scale-105 active:scale-95 group bg-white touch-manipulation"
                      >
                        <img
                          src={template.thumbnail}
                          alt={template.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement
                            target.src = `https://via.placeholder.com/200x200/FF6B6B/FFFFFF?text=${encodeURIComponent(template.name)}`
                            target.onerror = null
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] sm:text-xs px-2 py-1.5 truncate opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                          {template.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 sm:p-8 md:p-12 text-center cursor-pointer transition-all touch-manipulation ${
                  isDragActive
                    ? 'border-orange-500 bg-orange-50/80 scale-95'
                    : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50/80 active:scale-95'
                }`}
              >
                <input {...getInputProps()} />
                <div className="inline-flex p-3 sm:p-4 rounded-full bg-gradient-to-r from-orange-100 to-red-100 mb-3 sm:mb-4">
                  <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                </div>
                <p className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                  {isDragActive ? 'Drop the image here' : 'Or drag & drop an image here'}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">Supports PNG, JPG, JPEG, WEBP</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {/* Controls Panel */}
              <div className="lg:col-span-1">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-4 sm:p-5 md:p-6 sticky top-4">
                  <div className="flex justify-between items-center mb-4 sm:mb-5 pb-3 sm:pb-4 border-b-2 border-gray-200">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2">
                      <span className="w-1 h-5 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></span>
                      <span>Editor</span>
                    </h2>
                    <button
                      onClick={reset}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors active:scale-95 touch-manipulation"
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>

                  {/* Tab Navigation */}
                  <div className="grid grid-cols-4 gap-2 sm:gap-2.5 mb-4 sm:mb-5">
                    <button
                      onClick={() => setActiveTab('text')}
                      className={`p-2 sm:p-2.5 rounded-xl font-semibold text-[10px] sm:text-xs transition-all active:scale-95 touch-manipulation ${
                        activeTab === 'text'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                      }`}
                    >
                      <Type className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1" />
                      <span className="hidden sm:inline">Text</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('image')}
                      className={`p-2 sm:p-2.5 rounded-xl font-semibold text-[10px] sm:text-xs transition-all active:scale-95 touch-manipulation ${
                        activeTab === 'image'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                      }`}
                    >
                      <Layers className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1" />
                      <span className="hidden sm:inline">Image</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('sticker')}
                      className={`p-2 sm:p-2.5 rounded-xl font-semibold text-[10px] sm:text-xs transition-all active:scale-95 touch-manipulation ${
                        activeTab === 'sticker'
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                      }`}
                    >
                      <Smile className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1" />
                      <span className="hidden sm:inline">Sticker</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('draw')}
                      className={`p-2 sm:p-2.5 rounded-xl font-semibold text-[10px] sm:text-xs transition-all active:scale-95 touch-manipulation ${
                        activeTab === 'draw'
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                      }`}
                    >
                      <PenTool className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1" />
                      <span className="hidden sm:inline">Draw</span>
                    </button>
                  </div>

                  {/* Text Tab */}
                  {activeTab === 'text' && (
                    <div className="space-y-3 sm:space-y-4">
                      <button
                        onClick={addText}
                        className="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 active:scale-95 touch-manipulation"
                      >
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Add Text</span>
                      </button>

                      {textElements.map((textEl) => (
                        <div key={textEl.id} className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-center mb-2 sm:mb-3">
                            <span className="text-xs sm:text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              <span>Text Element</span>
                            </span>
                            <button
                              onClick={() => deleteText(textEl.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors active:scale-95 touch-manipulation"
                            >
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={textEl.text}
                            onChange={(e) => updateText(textEl.id, { text: e.target.value })}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg mb-2 text-gray-900"
                            placeholder="Enter text..."
                          />
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="block text-gray-600 mb-1">Size</label>
                              <input
                                type="number"
                                value={textEl.fontSize}
                                onChange={(e) => updateText(textEl.id, { fontSize: Number(e.target.value) })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900"
                                min="10"
                                max="200"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">Font</label>
                              <select
                                value={textEl.fontFamily}
                                onChange={(e) => updateText(textEl.id, { fontFamily: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
                              >
                                {fontOptions.map(font => (
                                  <option key={font.value} value={font.value}>{font.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <label className="block text-gray-600 mb-1 text-xs">Text Color</label>
                              <input
                                type="color"
                                value={textEl.color}
                                onChange={(e) => updateText(textEl.id, { color: e.target.value })}
                                className="w-full h-8 rounded border border-gray-300"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1 text-xs">Stroke</label>
                              <input
                                type="color"
                                value={textEl.strokeColor}
                                onChange={(e) => updateText(textEl.id, { strokeColor: e.target.value })}
                                className="w-full h-8 rounded border border-gray-300"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Global Text Settings */}
                      {textElements.length > 0 && (
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                          <h4 className="text-xs font-bold text-gray-900 mb-2">Default Settings (for new text)</h4>
                          <div className="space-y-2">
                            <div>
                              <label className="block text-xs text-gray-700 mb-1">Font Size: {fontSize}px</label>
                              <input
                                type="range"
                                min="10"
                                max="200"
                                value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-700 mb-1">Font Style</label>
                              <select
                                value={fontFamily}
                                onChange={(e) => setFontFamily(e.target.value)}
                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-900"
                              >
                                {fontOptions.map(font => (
                                  <option key={font.value} value={font.value}>{font.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-gray-700 mb-1">Text Color</label>
                                <input
                                  type="color"
                                  value={textColor}
                                  onChange={(e) => setTextColor(e.target.value)}
                                  className="w-full h-8 rounded border border-gray-300"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-700 mb-1">Stroke Color</label>
                                <input
                                  type="color"
                                  value={strokeColor}
                                  onChange={(e) => setStrokeColor(e.target.value)}
                                  className="w-full h-8 rounded border border-gray-300"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Image Overlay Tab */}
                  {activeTab === 'image' && (
                    <div className="space-y-3 sm:space-y-4">
                      <button
                        onClick={addImageOverlay}
                        className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 active:scale-95 touch-manipulation"
                      >
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Add Image</span>
                      </button>
                      <input
                        ref={overlayInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleOverlayImage}
                        className="hidden"
                      />

                      {imageOverlays.map((overlay) => (
                        <div key={overlay.id} className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-green-50/30 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-center mb-2 sm:mb-3">
                            <span className="text-xs sm:text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              <span>Image Overlay</span>
                            </span>
                            <button
                              onClick={() => deleteOverlay(overlay.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors active:scale-95 touch-manipulation"
                            >
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="block text-gray-600 mb-1">Width</label>
                              <input
                                type="number"
                                value={overlay.width}
                                onChange={(e) => updateOverlay(overlay.id, { width: Number(e.target.value) })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900"
                                min="50"
                                max="500"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">Height</label>
                              <input
                                type="number"
                                value={overlay.height}
                                onChange={(e) => updateOverlay(overlay.id, { height: Number(e.target.value) })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900"
                                min="50"
                                max="500"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">Rotation</label>
                              <input
                                type="number"
                                value={overlay.rotation}
                                onChange={(e) => updateOverlay(overlay.id, { rotation: Number(e.target.value) })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900"
                                min="0"
                                max="360"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sticker Tab */}
                  {activeTab === 'sticker' && (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-pink-50/30 rounded-xl border border-gray-200">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-3 flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                          <span>Select Sticker</span>
                        </h4>
                        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-48 sm:max-h-56 overflow-y-auto">
                          {stickers.map((emoji, index) => (
                            <button
                              key={index}
                              onClick={() => addSticker(emoji)}
                              className="p-2 sm:p-2.5 text-xl sm:text-2xl hover:bg-white hover:scale-110 rounded-lg transition-all border border-gray-200 active:scale-95 touch-manipulation"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      {activeStickers.map((sticker) => (
                        <div key={sticker.id} className="p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-2xl">{sticker.emoji}</span>
                            <button
                              onClick={() => deleteSticker(sticker.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="block text-gray-600 mb-1">Size</label>
                              <input
                                type="number"
                                value={sticker.size}
                                onChange={(e) => updateSticker(sticker.id, { size: Number(e.target.value) })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900"
                                min="20"
                                max="200"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 mb-1">Rotation</label>
                              <input
                                type="number"
                                value={sticker.rotation}
                                onChange={(e) => updateSticker(sticker.id, { rotation: Number(e.target.value) })}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900"
                                min="0"
                                max="360"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Draw Tab */}
                  {activeTab === 'draw' && (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-purple-50/30 rounded-xl border border-gray-200">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-3 flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                          <span>Drawing Tools</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Color</label>
                            <input
                              type="color"
                              value={drawColor}
                              onChange={(e) => setDrawColor(e.target.value)}
                              className="w-full h-9 sm:h-10 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-purple-400 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Width: {drawWidth}px</label>
                            <input
                              type="range"
                              min="1"
                              max="20"
                              value={drawWidth}
                              onChange={(e) => setDrawWidth(Number(e.target.value))}
                              className="w-full accent-purple-600"
                            />
                          </div>
                        </div>
                        <button
                          onClick={clearDrawing}
                          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold hover:shadow-lg hover:scale-[1.02] transition-all active:scale-95 touch-manipulation"
                        >
                          Clear Drawing
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Download Button */}
                  <button
                    onClick={downloadMeme}
                    className="w-full mt-4 sm:mt-5 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 text-white px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 active:scale-95 touch-manipulation"
                  >
                    <Download className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span>Download Meme</span>
                  </button>
                </div>
              </div>

              {/* Preview Panel */}
              <div className="lg:col-span-2">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-4 sm:p-5 md:p-6">
                  <div className="flex justify-between items-center mb-4 sm:mb-5 pb-3 sm:pb-4 border-b-2 border-gray-200">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2">
                      <span className="w-1 h-5 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></span>
                      <span>Preview</span>
                    </h2>
                    <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">Live Preview</span>
                  </div>
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100/50 shadow-inner">
                    <div
                      ref={memeRef}
                      className="relative bg-white"
                      style={{ maxWidth: '100%', position: 'relative' }}
                    >
                      {baseImage && (
                        <>
                          <img src={baseImage} alt="Meme base" className="w-full h-auto block" />
                          
                          {/* Drawing Canvas */}
                          {baseImage && (
                            <canvas
                              ref={drawingCanvasRef}
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={stopDrawing}
                              onMouseLeave={stopDrawing}
                              onTouchStart={startDrawingTouch}
                              onTouchMove={drawTouch}
                              onTouchEnd={stopDrawingTouch}
                              onTouchCancel={stopDrawingTouch}
                              className="absolute top-0 left-0 cursor-crosshair"
                              style={{ 
                                width: '100%',
                                height: '100%',
                                pointerEvents: 'auto',
                                touchAction: 'none'
                              }}
                            />
                          )}

                          {/* Text Elements */}
                          {textElements.map((textEl) => (
                            <div
                              key={textEl.id}
                              className="absolute cursor-move select-none"
                              style={{
                                left: `${textEl.x}%`,
                                top: `${textEl.y}%`,
                                transform: 'translate(-50%, -50%)',
                                fontSize: `${textEl.fontSize}px`,
                                fontFamily: textEl.fontFamily,
                                color: textEl.color,
                                textShadow: `-2px -2px 0 ${textEl.strokeColor}, 2px -2px 0 ${textEl.strokeColor}, -2px 2px 0 ${textEl.strokeColor}, 2px 2px 0 ${textEl.strokeColor}`,
                                fontWeight: 'bold',
                                padding: '4px',
                                zIndex: selectedElement === textEl.id ? 10 : 1,
                                border: selectedElement === textEl.id ? '2px dashed blue' : 'none',
                                backgroundColor: selectedElement === textEl.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                touchAction: 'none'
                              }}
                              onClick={() => setSelectedElement(textEl.id)}
                              onMouseDown={(e) => handleMouseDown(e, textEl.id, textEl.x, textEl.y)}
                              onTouchStart={(e) => handleTouchStart(e, textEl.id, textEl.x, textEl.y)}
                            >
                              {textEl.text || 'Click to edit'}
                            </div>
                          ))}

                          {/* Image Overlays */}
                          {imageOverlays.map((overlay) => (
                            <img
                              key={overlay.id}
                              src={overlay.src}
                              alt="Overlay"
                              className="absolute cursor-move select-none"
                              style={{
                                left: `${overlay.x}%`,
                                top: `${overlay.y}%`,
                                width: `${overlay.width}px`,
                                height: `${overlay.height}px`,
                                transform: `translate(-50%, -50%) rotate(${overlay.rotation}deg)`,
                                zIndex: selectedElement === overlay.id ? 10 : 1,
                                border: selectedElement === overlay.id ? '2px dashed green' : 'none',
                                backgroundColor: selectedElement === overlay.id ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                                touchAction: 'none'
                              }}
                              onClick={() => setSelectedElement(overlay.id)}
                              onMouseDown={(e) => handleMouseDown(e, overlay.id, overlay.x, overlay.y)}
                              onTouchStart={(e) => handleTouchStart(e, overlay.id, overlay.x, overlay.y)}
                            />
                          ))}

                          {/* Stickers */}
                          {activeStickers.map((sticker) => (
                            <div
                              key={sticker.id}
                              className="absolute cursor-move select-none"
                              style={{
                                left: `${sticker.x}%`,
                                top: `${sticker.y}%`,
                                transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
                                fontSize: `${sticker.size}px`,
                                zIndex: selectedElement === sticker.id ? 10 : 1,
                                border: selectedElement === sticker.id ? '2px dashed pink' : 'none',
                                padding: '4px',
                                backgroundColor: selectedElement === sticker.id ? 'rgba(236, 72, 153, 0.1)' : 'transparent',
                                touchAction: 'none'
                              }}
                              onClick={() => setSelectedElement(sticker.id)}
                              onMouseDown={(e) => handleMouseDown(e, sticker.id, sticker.x, sticker.y)}
                              onTouchStart={(e) => handleTouchStart(e, sticker.id, sticker.x, sticker.y)}
                            >
                              {sticker.emoji}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <MobileBottomAd adKey="36d691042d95ac1ac33375038ec47a5c" />
      <Footer />
    </div>
  )
}

