'use client'

import { useEffect } from 'react'

export default function AdScriptBlocker() {
  useEffect(() => {
    // Block any ad scripts that try to create 160x600 ads
    const originalAppendChild = Node.prototype.appendChild
    Node.prototype.appendChild = function(child: any) {
      if (child && child.tagName === 'SCRIPT' && child.src) {
        // Block scripts that might load 160x600 sidebar ads
        if (
          child.src.includes('highperformanceformat') &&
          (child.id?.includes('left') || child.id?.includes('right') || child.id?.includes('sidebar'))
        ) {
          console.log('Blocked 160x600 sidebar ad script:', child.src)
          return child
        }
      }
      if (child && child.tagName === 'IFRAME') {
        const width = child.getAttribute('width')
        const height = child.getAttribute('height')
        if (width === '160' && height === '600') {
          console.log('Blocked 160x600 iframe ad')
          return child
        }
      }
      return originalAppendChild.call(this, child)
    }

    // Block atOptions from setting 160x600 dimensions
    let atOptionsProxy: any = undefined
    Object.defineProperty(window, 'atOptions', {
      set: function(value: any) {
        if (value && value.height === 600 && value.width === 160) {
          console.log('Blocked 160x600 ad atOptions')
          return // Block 160x600 ads
        }
        atOptionsProxy = value
      },
      get: function() {
        return atOptionsProxy
      },
      configurable: true,
    })

    // Also intercept document.createElement to block ad containers
    const originalCreateElement = document.createElement.bind(document)
    document.createElement = function(tagName: string, options?: any) {
      const element = originalCreateElement(tagName, options)
      
      // If it's a div and might be for sidebar ads, add a check
      if (tagName.toLowerCase() === 'div') {
        const originalSetAttribute = element.setAttribute.bind(element)
        element.setAttribute = function(name: string, value: string) {
          if (name === 'id' && (value.includes('sidebar') || value.includes('ad-left') || value.includes('ad-right'))) {
            // Monitor this element
            setTimeout(() => {
              const styles = window.getComputedStyle(element)
              const width = parseInt(styles.width) || 0
              const height = parseInt(styles.height) || 0
              if (width >= 155 && width <= 165 && height >= 595 && height <= 605) {
                element.remove()
              }
            }, 100)
          }
          return originalSetAttribute(name, value)
        }
      }
      
      return element
    }

    return () => {
      // Restore original functions on unmount
      Node.prototype.appendChild = originalAppendChild
      delete (window as any).atOptions
    }
  }, [])

  return null
}

