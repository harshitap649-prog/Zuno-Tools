'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, Menu, X, Grid3x3 } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home' },
  ]

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo and Brand Name */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="bg-gradient-to-r from-pink-500 to-pink-400 p-1 sm:p-1.5 rounded-lg group-hover:scale-105 transition-transform shadow-md">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="text-base sm:text-lg md:text-xl font-bold text-black">
              Zuno Tools
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-pink-500 bg-pink-50 font-semibold'
                    : 'text-gray-700 hover:text-pink-500 hover:bg-pink-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              className="p-2 rounded-md text-gray-700 hover:text-pink-500 hover:bg-pink-50 transition-colors"
              onClick={() => setMobileCategoriesOpen((v) => !v)}
              aria-label="Open tool categories"
            >
              {mobileCategoriesOpen ? <X className="h-6 w-6" /> : <Grid3x3 className="h-6 w-6" />}
            </button>
            <button
              className="p-2 rounded-md text-gray-700 hover:text-pink-500 hover:bg-pink-50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-md text-base font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-pink-500 bg-pink-50 font-semibold'
                    : 'text-gray-700 hover:text-pink-500 hover:bg-pink-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Mobile Categories */}
        {mobileCategoriesOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: '/tools', label: 'All' },
                { href: '/tools?category=Image%20Tools', label: 'Image Tools' },
                { href: '/tools?category=Document%20Tools', label: 'Document Tools' },
                { href: '/tools?category=AI%20Tools', label: 'AI Tools' },
                { href: '/tools?category=Utility%20Tools', label: 'Utility Tools' },
                { href: '/tools?category=Security', label: 'Security' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileCategoriesOpen(false)}
                  className="w-full text-center px-3 py-3 rounded-xl bg-pink-50 text-pink-600 font-semibold shadow-sm hover:bg-pink-100 transition-colors touch-manipulation active:scale-95"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

