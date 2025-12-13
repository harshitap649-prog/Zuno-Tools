let scriptLoaded = false
let scriptLoading = false
let lastTriggerTime = 0
const MIN_TRIGGER_INTERVAL = 30000 // 30 seconds minimum between triggers

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
    script.src = '//pl28220032.effectivegatecpm.com/ae/e1/74/aee174c2b9abf65e83a1821b853f20eb.js'
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

// REMOVED: Early script loading on user interaction
// Script will ONLY load when triggerPopunder() is explicitly called
// This prevents popunder ads from showing on every click

export const usePopunderAd = () => {
  const triggerPopunder = async () => {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }

    // Throttle: Don't trigger if called too soon after last trigger
    const now = Date.now()
    if (now - lastTriggerTime < MIN_TRIGGER_INTERVAL) {
      console.log('Popunder throttled - too soon after last trigger')
      return
    }

    try {
      // Only load script when explicitly triggered (on download/save/share)
      await loadPopunderScript()
      
      // Update last trigger time
      lastTriggerTime = now
      
      // Wait 2 seconds after action before triggering the popunder
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
