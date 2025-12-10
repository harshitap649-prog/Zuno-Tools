'use client'

import { useEffect, useRef } from 'react'

export default function SidebarAd({ position, adKey }: { position: 'left' | 'right', adKey: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptLoadedRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Helper function to check if desktop
    const checkDesktop = () => {
      return window.innerWidth >= 1024
    }

    // Create a wrapper function that sets atOptions and loads the script
    const loadAd = () => {
      if (!containerRef.current || scriptLoadedRef.current) return
      
      // Ensure container ID is set
      const containerId = `sidebar-ad-${position}`
      if (containerRef.current.id !== containerId) {
        containerRef.current.id = containerId
      }

      // Ensure container is visible and ready
      containerRef.current.style.display = 'flex'
      containerRef.current.style.visibility = 'visible'
      containerRef.current.style.opacity = '1'
      
      // Check if script already exists
      const existingScript = document.getElementById(`ad-script-${position}`)
      if (existingScript) {
        existingScript.remove()
      }

      // Set atOptions right before loading the script
      // Use a closure to ensure each ad instance has its own atOptions context
      const setAdOptions = () => {
        ;(window as any).atOptions = {
          'key': adKey,
          'format': 'iframe',
          'height': 600,
          'width': 160,
          'params': {}
        }
      }

      // Create and append the invoke script
      const script = document.createElement('script')
      script.type = 'text/javascript'
      
      // Set atOptions just before setting script source
      setAdOptions()
      
      script.src = `//www.highperformanceformat.com/${adKey}/invoke.js`
      script.async = true
      script.id = `ad-script-${position}`
      script.setAttribute('data-position', position)
      script.setAttribute('data-ad-key', adKey)
      script.setAttribute('data-container-id', containerId)
      
      script.onload = () => {
        scriptLoadedRef.current = true
        // Clear placeholder once ad loads
        if (containerRef.current) {
          const placeholder = containerRef.current.querySelector('.text-xs')
          if (placeholder) {
            placeholder.remove()
          }
          // Ensure container is visible
          containerRef.current.style.display = 'flex'
          containerRef.current.style.visibility = 'visible'
          containerRef.current.style.opacity = '1'
        }
      }
      script.onerror = () => {
        console.error(`Failed to load ad script for ${position} position`)
        scriptLoadedRef.current = false
        // Show error message
        if (containerRef.current) {
          const placeholder = containerRef.current.querySelector('.text-xs')
          if (placeholder) {
            placeholder.textContent = 'Ad unavailable'
            placeholder.className = 'text-xs text-red-400 text-center'
          }
        }
      }
      
      // Append script to document head for better execution
      // The ad script will look for the container by ID
      document.head.appendChild(script)
    }

    // Handle window resize to show/hide based on screen size
    const handleResize = () => {
      const isDesktopNow = checkDesktop()
      if (containerRef.current) {
        if (isDesktopNow) {
          // Show on desktop
          containerRef.current.style.display = 'flex'
          containerRef.current.style.visibility = 'visible'
          containerRef.current.style.opacity = '1'
          // Load ad if not already loaded
          if (!scriptLoadedRef.current) {
            const delay = position === 'left' ? 500 : 2500
            setTimeout(() => {
              if (checkDesktop() && containerRef.current) {
                loadAd()
              }
            }, delay)
          }
        } else {
          // Hide on mobile
          containerRef.current.style.display = 'none'
        }
      }
    }

    // Check initial screen size
    const isDesktop = checkDesktop()
    if (!isDesktop) {
      // Hide container on mobile
      if (containerRef.current) {
        containerRef.current.style.display = 'none'
      }
      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }

    const containerId = `sidebar-ad-${position}`
    if (containerRef.current) {
      containerRef.current.id = containerId
      // Ensure container is visible and ready
      containerRef.current.style.display = 'flex'
      containerRef.current.style.visibility = 'visible'
      containerRef.current.style.opacity = '1'
      // Make sure container is in viewport
      containerRef.current.style.position = 'relative'
    }

    // Wait for DOM to be fully ready before loading ads
    const waitForDOM = () => {
      return new Promise<void>((resolve) => {
        if (document.readyState === 'complete') {
          resolve()
        } else {
          window.addEventListener('load', () => resolve(), { once: true })
          // Fallback timeout
          setTimeout(() => resolve(), 2000)
        }
      })
    }

    // Stagger the loading significantly to avoid conflicts
    // Left ad loads after DOM ready, right ad loads after additional delay
    waitForDOM().then(() => {
      const delay = position === 'left' ? 1000 : 3000
      timeoutRef.current = setTimeout(() => {
        // Double check desktop and container before loading
        if (checkDesktop() && containerRef.current && !scriptLoadedRef.current) {
          loadAd()
        }
      }, delay)
    })

    // Add resize listener
    window.addEventListener('resize', handleResize)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      window.removeEventListener('resize', handleResize)
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
        scriptLoadedRef.current = false
      }
      // Remove script element if it exists
      const existingScript = document.getElementById(`ad-script-${position}`)
      if (existingScript) {
        existingScript.remove()
      }
      // Clean up atOptions if this was the last ad
      if ((window as any).atOptions && (window as any).atOptions.key === adKey) {
        delete (window as any).atOptions
      }
    }
  }, [position, adKey])

  return (
    <div className={`hidden lg:block fixed ${position === 'left' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 z-40`}>
      <div 
        ref={containerRef} 
        id={`sidebar-ad-${position}`}
        className="w-[160px] h-[600px] flex items-center justify-center bg-gray-50 rounded-lg shadow-lg border border-gray-200 overflow-visible"
        style={{ 
          minHeight: '600px', 
          minWidth: '160px',
          display: 'flex',
          visibility: 'visible',
          opacity: '1',
          position: 'relative',
          zIndex: 40
        }}
      >
        {/* Placeholder while ad loads */}
        <div className="text-xs text-gray-400 text-center absolute inset-0 flex items-center justify-center pointer-events-none">Loading ad...</div>
      </div>
    </div>
  )
}

