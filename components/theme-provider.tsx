'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

// Context for accessibility features
interface AccessibilityContextType {
  highContrast: boolean
  toggleHighContrast: () => void
  reducedMotion: boolean
  toggleReducedMotion: () => void
}

const AccessibilityContext = React.createContext<AccessibilityContextType | undefined>(undefined)

export function useAccessibility() {
  const context = React.useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

interface AccessibilityProviderProps {
  children: React.ReactNode
}

function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [highContrast, setHighContrast] = React.useState(false)
  const [reducedMotion, setReducedMotion] = React.useState(false)

  // Check for system preferences on mount
  React.useEffect(() => {
    // Check for prefers-contrast
    const contrastMediaQuery = window.matchMedia('(prefers-contrast: more)')
    setHighContrast(contrastMediaQuery.matches)

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches)
    }
    contrastMediaQuery.addEventListener('change', handleContrastChange)

    // Check for prefers-reduced-motion
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(motionMediaQuery.matches)

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }
    motionMediaQuery.addEventListener('change', handleMotionChange)

    // Load saved preferences
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast')
    if (savedHighContrast !== null) {
      setHighContrast(JSON.parse(savedHighContrast))
    }

    const savedReducedMotion = localStorage.getItem('accessibility-reduced-motion')
    if (savedReducedMotion !== null) {
      setReducedMotion(JSON.parse(savedReducedMotion))
    }

    return () => {
      contrastMediaQuery.removeEventListener('change', handleContrastChange)
      motionMediaQuery.removeEventListener('change', handleMotionChange)
    }
  }, [])

  // Apply accessibility classes to document
  React.useEffect(() => {
    const root = document.documentElement
    
    if (highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    if (reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }
  }, [highContrast, reducedMotion])

  const toggleHighContrast = React.useCallback(() => {
    setHighContrast(prev => {
      const newValue = !prev
      localStorage.setItem('accessibility-high-contrast', JSON.stringify(newValue))
      return newValue
    })
  }, [])

  const toggleReducedMotion = React.useCallback(() => {
    setReducedMotion(prev => {
      const newValue = !prev
      localStorage.setItem('accessibility-reduced-motion', JSON.stringify(newValue))
      return newValue
    })
  }, [])

  const value = React.useMemo(() => ({
    highContrast,
    toggleHighContrast,
    reducedMotion,
    toggleReducedMotion,
  }), [highContrast, toggleHighContrast, reducedMotion, toggleReducedMotion])

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <AccessibilityProvider>
        {children}
      </AccessibilityProvider>
    </NextThemesProvider>
  )
}
