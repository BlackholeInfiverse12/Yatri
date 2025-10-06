'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useTheme } from 'next-themes'
import { useAccessibility } from './theme-provider'
import { 
  EyeIcon, 
  MoonIcon, 
  SunIcon, 
  PauseIcon,
  UserCheck
} from 'lucide-react'

interface AccessibilityToggleProps {
  className?: string
}

export function AccessibilityToggle({ className }: AccessibilityToggleProps) {
  const { theme, setTheme } = useTheme()
  const { highContrast, toggleHighContrast, reducedMotion, toggleReducedMotion } = useAccessibility()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="size-5" />
          Accessibility Settings
        </CardTitle>
        <CardDescription>
          Customize your viewing experience for better accessibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-medium">
              {theme === 'dark' ? (
                <MoonIcon className="size-4" />
              ) : (
                <SunIcon className="size-4" />
              )}
              Dark Mode
            </div>
            <p className="text-sm text-muted-foreground">
              Switch between light and dark themes
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <SunIcon className="size-4" />
            ) : (
              <MoonIcon className="size-4" />
            )}
          </Button>
        </div>

        {/* High Contrast Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-medium">
              <EyeIcon className="size-4" />
              High Contrast
            </div>
            <p className="text-sm text-muted-foreground">
              Enhance color contrast for better visibility
            </p>
          </div>
          <Switch
            checked={highContrast}
            onCheckedChange={toggleHighContrast}
            aria-label="Toggle high contrast mode"
          />
        </div>

        {/* Reduced Motion Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-medium">
              <PauseIcon className="size-4" />
              Reduce Motion
            </div>
            <p className="text-sm text-muted-foreground">
              Minimize animations and transitions
            </p>
          </div>
          <Switch
            checked={reducedMotion}
            onCheckedChange={toggleReducedMotion}
            aria-label="Toggle reduced motion"
          />
        </div>

        {/* Information */}
        <div className="rounded-lg border bg-muted/50 p-4 text-sm">
          <p className="font-medium">WCAG Compliance</p>
          <p className="mt-1 text-muted-foreground">
            These settings help meet WCAG 2.1 AA/AAA accessibility standards for users with visual impairments or vestibular disorders.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function AccessibilityQuickToggle() {
  const { highContrast, toggleHighContrast } = useAccessibility()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          <SunIcon className="size-4" />
        ) : (
          <MoonIcon className="size-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleHighContrast}
        aria-label="Toggle high contrast mode"
        title="Toggle high contrast mode"
        data-active={highContrast}
        className="data-[active=true]:bg-accent"
      >
        <EyeIcon className="size-4" />
      </Button>
    </div>
  )
}