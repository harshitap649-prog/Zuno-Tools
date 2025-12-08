'use client'

import { useEffect, useRef } from 'react'

export default function SidebarAd({ position, adKey }: { position: 'left' | 'right', adKey: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current || scriptLoadedRef.current) return

    const containerId = `sidebar-ad-${position}`
    containerRef.current.id = containerId

    // Create a wrapper function that sets atOptions and loads the script
    const loadAd = () => {
      // Set atOptions right before loading the script
      // Each ad instance will set this, but the script should handle it
      ;(window as any).atOptions = {
        'key': adKey,
        'format': 'iframe',
        'height': 600,
        'width': 160,
        'params': {}
      }

      // Create and append the invoke script
      // Following the pattern from BannerAd - append to container
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `//www.highperformanceformat.com/${adKey}/invoke.js`
      script.async = true
      script.id = `ad-script-${position}`
      
      script.onload = () => {
        scriptLoadedRef.current = true
      }
      script.onerror = () => {
        console.error(`Failed to load ad script for ${position} position`)
      }
      
      // Append script to container (matching BannerAd pattern)
      if (containerRef.current) {
        containerRef.current.appendChild(script)
      }
    }

    // Stagger the loading significantly to avoid conflicts
    // Left ad loads immediately, right ad loads after 1.5 seconds
    const delay = position === 'left' ? 0 : 1500
    const timeoutId = setTimeout(loadAd, delay)

    return () => {
      clearTimeout(timeoutId)
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
    <div className={`hidden xl:block fixed ${position === 'left' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 z-40`}>
      <div 
        ref={containerRef} 
        id={`sidebar-ad-${position}`}
        className="w-[160px] h-[600px] flex items-center justify-center bg-gray-50 rounded-lg shadow-lg border border-gray-200"
        style={{ minHeight: '600px', minWidth: '160px' }}
      ></div>
    </div>
  )
}

