'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Home, Heart, Clock } from 'lucide-react'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [favorites, setFavorites] = useState<string[]>([])
  const [recentTools, setRecentTools] = useState<string[]>([])

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('zuno-favorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }

    // Load recently used tools from localStorage
    const savedRecent = localStorage.getItem('zuno-recent-tools')
    if (savedRecent) {
      setRecentTools(JSON.parse(savedRecent))
    }
  }, [])

  // Track current page as recently used
  useEffect(() => {
    if (pathname.startsWith('/tools/') && pathname !== '/tools') {
      const toolId = pathname.replace('/tools/', '')
      const recent = JSON.parse(localStorage.getItem('zuno-recent-tools') || '[]')
      const updatedRecent = [toolId, ...recent.filter((id: string) => id !== toolId)].slice(0, 10)
      localStorage.setItem('zuno-recent-tools', JSON.stringify(updatedRecent))
      setRecentTools(updatedRecent)
    }
  }, [pathname])

  const handleFavoritesClick = () => {
    router.push('/tools?favorites=true')
  }

  const handleRecentClick = () => {
    router.push('/tools?recent=true')
  }

  const onHomeClick = () => {
    router.push('/tools')
  }

  const isHome = pathname === '/tools' && !searchParams.get('favorites') && !searchParams.get('recent')
  const isFavorites = pathname === '/tools' && searchParams.get('favorites') === 'true'
  const isRecent = pathname === '/tools' && searchParams.get('recent') === 'true'

  // Only show on mobile for tools pages (home grid)
  if (!pathname.startsWith('/tools')) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t-2 border-pink-100 shadow-[0_-4px_18px_rgba(0,0,0,0.08)] z-50 md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        <button
          onClick={onHomeClick}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all touch-manipulation active:scale-95 rounded-lg ${
            isHome ? 'text-pink-600 bg-pink-50' : 'text-gray-600 hover:text-pink-500'
          }`}
          aria-label="Home"
        >
          <Home className={`h-6 w-6 mb-1 ${isHome ? 'fill-current' : ''}`} strokeWidth={2.5} />
          <span className="text-[11px] font-semibold">Home</span>
        </button>

        <button
          onClick={handleFavoritesClick}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all touch-manipulation active:scale-95 rounded-lg ${
            isFavorites ? 'text-pink-600 bg-pink-50' : 'text-gray-600 hover:text-pink-500'
          }`}
          aria-label="Favorites"
        >
          <Heart className={`h-6 w-6 mb-1 ${isFavorites ? 'fill-red-500 text-red-500' : ''}`} strokeWidth={2.5} />
          <span className="text-[11px] font-semibold">Favorites</span>
        </button>

        <button
          onClick={handleRecentClick}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all touch-manipulation active:scale-95 rounded-lg ${
            isRecent ? 'text-pink-600 bg-pink-50' : 'text-gray-600 hover:text-pink-500'
          }`}
          aria-label="Recent"
        >
          <Clock className={`h-6 w-6 mb-1 ${isRecent ? 'fill-current' : ''}`} strokeWidth={2.5} />
          <span className="text-[11px] font-semibold">Recent</span>
        </button>
      </div>
    </nav>
  )
}

