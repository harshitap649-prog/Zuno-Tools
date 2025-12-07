let scriptLoaded = false
let scriptLoading = false

const loadPopunderScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      reject(new Error('Not in browser environment'))
      return
    }

    // If script is already loaded, resolve immediately
    if (scriptLoaded) {
      resolve()
      return
    }

    // If script is currently loading, wait for it
    if (scriptLoading) {
      const checkInterval = setInterval(() => {
        if (scriptLoaded) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)
      return
    }

    // Start loading the script
    scriptLoading = true
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = '//pl28169842.effectivegatecpm.com/5c/c7/46/5cc74644083b1ea098136c62aaa39ff3.js'
    script.async = true
    
    script.onload = () => {
      scriptLoaded = true
      scriptLoading = false
      resolve()
    }
    
    script.onerror = () => {
      scriptLoading = false
      reject(new Error('Failed to load popunder script'))
    }
    
    document.head.appendChild(script)
  })
}

// Load script early when module loads (if in browser)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  try {
    // Load script on first page interaction or after a short delay
    const loadEarly = () => {
      loadPopunderScript().catch(() => {
        // Silently fail if script can't load
      })
    }
    
    // Try to load on first user interaction
    const events = ['mousedown', 'touchstart', 'keydown']
    const loadOnInteraction = () => {
      events.forEach(event => {
        document.addEventListener(event, loadEarly, { once: true, passive: true })
      })
    }
    
    // Also try to load after page load
    if (document.readyState === 'complete') {
      setTimeout(loadEarly, 1000)
    } else {
      window.addEventListener('load', () => {
        setTimeout(loadEarly, 1000)
      })
    }
    
    loadOnInteraction()
  } catch (error) {
    // Silently fail if initialization fails
    console.warn('Popunder ad initialization failed:', error)
  }
}

export const usePopunderAd = () => {
  const triggerPopunder = async () => {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }

    try {
      // Ensure script is loaded
      await loadPopunderScript()
      
      // Wait 2 seconds after download click before triggering the popunder
      setTimeout(() => {
        // Popunder scripts typically need to be triggered within a user interaction context
        // Since we're 2 seconds after the click, we need to simulate a user interaction
        try {
          // Method 1: Create and click a temporary link
          // This maintains some user interaction context
          const tempLink = document.createElement('a')
          tempLink.href = window.location.href
          tempLink.target = '_blank'
          tempLink.style.position = 'fixed'
          tempLink.style.left = '-9999px'
          tempLink.style.top = '-9999px'
          tempLink.style.opacity = '0'
          tempLink.style.pointerEvents = 'none'
          document.body.appendChild(tempLink)
          
          // Trigger click
          tempLink.click()
          
          // Method 2: Try window.open (some popunder scripts intercept this)
          try {
            const popunder = window.open('', '_blank')
            if (popunder) {
              popunder.blur()
              window.focus()
              setTimeout(() => {
                if (popunder && !popunder.closed) {
                  popunder.close()
                }
              }, 50)
            }
          } catch (e) {
            // Popup blocked or other error
          }
          
          // Clean up
          setTimeout(() => {
            if (tempLink.parentNode) {
              tempLink.parentNode.removeChild(tempLink)
            }
          }, 500)
        } catch (error) {
          console.error('Error triggering popunder:', error)
        }
      }, 2000)
    } catch (error) {
      // Silently fail - don't break the app if popunder fails
      console.warn('Failed to trigger popunder ad:', error)
    }
  }

  return { triggerPopunder }
}
