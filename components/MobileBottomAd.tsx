'use client'

import { useEffect, useRef } from 'react'

const MOBILE_INLINE_AD_KEY = '36d691042d95ac1ac33375038ec47a5c'

export default function MobileBottomAd({ adKey = MOBILE_INLINE_AD_KEY }: { adKey?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current || scriptLoadedRef.current) return

    // Only load on mobile devices (screen width < 1024px)
    const isMobile = window.innerWidth < 1024
    if (!isMobile) return

    const containerId = 'mobile-bottom-ad'
    containerRef.current.id = containerId

    // Ensure container is visible
    if (containerRef.current) {
      containerRef.current.style.display = 'flex'
      containerRef.current.style.visibility = 'visible'
      containerRef.current.style.opacity = '1'
    }

    // Create a wrapper function that sets atOptions and loads the script
    const loadAd = () => {
      if (!containerRef.current) return

      // Set atOptions right before loading the script
      ;(window as any).atOptions = {
        'key': adKey,
        'format': 'iframe',
        'height': 50,
        'width': 320,
        'params': {}
      }

      // Check if script already exists
      const existingScript = document.getElementById('ad-script-mobile-bottom')
      if (existingScript) {
        existingScript.remove()
      }

      // Create and append the invoke script to document head
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `//www.highperformanceformat.com/${adKey}/invoke.js`
      script.async = true
      script.id = 'ad-script-mobile-bottom'
      
      script.onload = () => {
        scriptLoadedRef.current = true
        console.log('Mobile bottom ad script loaded successfully')
        // Clear placeholder once ad loads
        if (containerRef.current && containerRef.current.querySelector('.text-xs')) {
          const placeholder = containerRef.current.querySelector('.text-xs')
          if (placeholder) placeholder.remove()
        }
      }
      script.onerror = () => {
        console.error('Failed to load mobile bottom ad script')
        // Show placeholder if ad fails to load
        if (containerRef.current) {
          const existingPlaceholder = containerRef.current.querySelector('.text-xs')
          if (!existingPlaceholder) {
            containerRef.current.innerHTML = '<div class="text-xs text-gray-400 text-center">Ad unavailable</div>'
          }
        }
      }
      
      // Append script to document head for better loading
      document.head.appendChild(script)
    }

    // Load ad after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(loadAd, 1000)

    return () => {
      clearTimeout(timeoutId)
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
        scriptLoadedRef.current = false
      }
      // Remove script element if it exists
      const existingScript = document.getElementById('ad-script-mobile-bottom')
      if (existingScript) {
        existingScript.remove()
      }
      // Clean up atOptions if this was the last ad
      if ((window as any).atOptions && (window as any).atOptions.key === adKey) {
        delete (window as any).atOptions
      }
    }
  }, [adKey])

  return (
    <div className="lg:hidden w-full flex justify-center items-center py-3 px-2 sm:px-4 bg-gray-50 border-t border-gray-200">
      <div 
        ref={containerRef} 
        id="mobile-bottom-ad"
        className="w-full max-w-[320px] min-w-[280px] h-[50px] flex items-center justify-center bg-white rounded-lg shadow-md border border-gray-200 overflow-visible"
        style={{ 
          minHeight: '50px',
          height: '50px',
          width: '100%',
          maxWidth: '320px'
        }}
      >
        {/* Placeholder while ad loads */}
        <div className="text-xs text-gray-400 text-center">Loading ad...</div>
      </div>
    </div>
  )
}

