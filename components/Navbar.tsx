'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home' },
  ]

  // Hide navbar on specific pages
  if (pathname === '/tools/ai-resume-builder' || pathname === '/tools/image-resizer' || pathname === '/tools/meme-generator' || pathname === '/tools/text-to-speech' || pathname === '/tools/age-calculator' || pathname === '/tools/instagram-bio-generator') {
    return null
  }

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
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-pink-500 hover:bg-pink-50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
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
      </div>
    </nav>
  )
}

