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
    if (favorites.length === 0) {
      // Show message or navigate to a page explaining how to add favorites
      alert('No favorite tools yet. Tap the heart icon on any tool to add it to favorites!')
    } else {
      // Navigate to favorites page or show favorites
      router.push('/tools?favorites=true')
    }
  }

  const handleRecentClick = () => {
    if (recentTools.length === 0) {
      alert('No recently used tools yet. Start using tools to see them here!')
    } else {
      router.push('/tools?recent=true')
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50 md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors touch-manipulation active:scale-95 ${
            pathname === '/'
              ? 'text-primary-600'
              : 'text-gray-600 hover:text-primary-600'
          }`}
        >
          <Home className={`h-6 w-6 mb-1 ${pathname === '/' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* Favorites */}
        <button
          onClick={handleFavoritesClick}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors touch-manipulation active:scale-95 relative ${
            favorites.length > 0 ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
          }`}
        >
          <div className="relative">
            <Heart className={`h-6 w-6 mb-1 ${favorites.length > 0 ? 'fill-current' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {favorites.length > 9 ? '9+' : favorites.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Favorites</span>
        </button>

        {/* Recently Used */}
        <button
          onClick={handleRecentClick}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors touch-manipulation active:scale-95 relative ${
            recentTools.length > 0 ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
          }`}
        >
          <div className="relative">
            <Clock className={`h-6 w-6 mb-1 ${recentTools.length > 0 ? 'fill-current' : ''}`} />
            {recentTools.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {recentTools.length > 9 ? '9+' : recentTools.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Recent</span>
        </button>
      </div>
    </nav>
  )
}

