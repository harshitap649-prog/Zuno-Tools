'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Heart, Clock } from 'lucide-react'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
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

  // Only show on mobile for tools pages (home grid)
  if (!pathname.startsWith('/tools')) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50 md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {/* Home */}
        <Link
          href="/tools"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors touch-manipulation active:scale-95 bg-transparent outline-none focus:outline-none ${
            pathname === '/tools'
              ? 'text-pink-500'
              : 'text-gray-600 hover:text-pink-500'
          }`}
        >
          <Home className={`h-6 w-6 mb-1 ${pathname === '/tools' ? 'fill-current' : ''}`} strokeWidth={2.5} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* Favorites */}
        <button
          onClick={handleFavoritesClick}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors touch-manipulation active:scale-95 bg-transparent outline-none focus:outline-none ${
            favorites.length > 0 ? 'text-pink-500' : 'text-gray-600 hover:text-pink-500'
          }`}
        >
          <Heart className={`h-6 w-6 mb-1 ${favorites.length > 0 ? 'fill-red-500 text-red-500' : ''}`} strokeWidth={2.5} />
          <span className="text-[10px] font-medium">Favorites</span>
        </button>

        {/* Recently Used */}
        <button
          onClick={handleRecentClick}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors touch-manipulation active:scale-95 bg-transparent outline-none focus:outline-none ${
            recentTools.length > 0 ? 'text-pink-500' : 'text-gray-600 hover:text-pink-500'
          }`}
        >
          <Clock className={`h-6 w-6 mb-1 ${recentTools.length > 0 ? 'fill-current' : ''}`} strokeWidth={2.5} />
          <span className="text-[10px] font-medium">Recent</span>
        </button>
      </div>
    </nav>
  )
}

