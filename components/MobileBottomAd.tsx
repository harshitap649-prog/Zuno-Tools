'use client'

import { useEffect, useRef } from 'react'

const MOBILE_INLINE_AD_KEY = '34970aed813cbee86887c4caa5c6c712'

export default function MobileBottomAd({ adKey = MOBILE_INLINE_AD_KEY }: { adKey?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current || scriptLoadedRef.current) return

    const containerId = 'mobile-bottom-ad'
    containerRef.current.id = containerId

    // Create a wrapper function that sets atOptions and loads the script
    const loadAd = () => {
      // Set atOptions right before loading the script
      ;(window as any).atOptions = {
        'key': adKey,
        'format': 'iframe',
        'height': 50,
        'width': 320,
        'params': {}
      }

      // Create and append the invoke script
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `//www.highperformanceformat.com/${adKey}/invoke.js`
      script.async = true
      script.id = 'ad-script-mobile-bottom'
      
      script.onload = () => {
        scriptLoadedRef.current = true
      }
      script.onerror = () => {
        console.error('Failed to load mobile bottom ad script')
      }
      
      // Append script to container
      if (containerRef.current) {
        containerRef.current.appendChild(script)
      }
    }

    // Load ad after a short delay
    const timeoutId = setTimeout(loadAd, 2000)

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
    <div className="lg:hidden w-full flex justify-center py-3 px-4 bg-gray-50 border-t border-gray-200">
      <div 
        ref={containerRef} 
        id="mobile-bottom-ad"
        className="w-full max-w-[320px] h-[50px] flex items-center justify-center bg-gray-50 rounded-lg shadow-md border border-gray-200"
        style={{ minHeight: '50px', minWidth: '320px' }}
      ></div>
    </div>
  )
}

