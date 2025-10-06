'use client'

import { useEffect } from 'react'

export function CSSLoader() {
  useEffect(() => {
    // Load deferred CSS after critical render
    const loadDeferredCSS = () => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/styles/deferred.css'
      link.media = 'all'
      document.head.appendChild(link)
    }

    // Load after DOM is ready and critical CSS has been applied
    if (document.readyState === 'complete') {
      loadDeferredCSS()
    } else {
      window.addEventListener('load', loadDeferredCSS)
    }

    return () => {
      window.removeEventListener('load', loadDeferredCSS)
    }
  }, [])

  return null
}

// Hook for loading component-specific CSS modules dynamically
export function useComponentCSS(cssPath: string, condition = true) {
  useEffect(() => {
    if (!condition) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = cssPath
    link.media = 'all'
    document.head.appendChild(link)

    return () => {
      // Clean up when component unmounts
      const existingLink = document.head.querySelector(`link[href="${cssPath}"]`)
      if (existingLink) {
        document.head.removeChild(existingLink)
      }
    }
  }, [cssPath, condition])
}

// Utility to preload CSS for faster subsequent loads
export function preloadCSS(href: string) {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'style'
    link.href = href
    document.head.appendChild(link)
    
    // Convert to stylesheet after preload
    setTimeout(() => {
      link.rel = 'stylesheet'
    }, 0)
  }
}