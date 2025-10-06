'use client'

import { useTheme } from 'next-themes'
import { useAccessibility } from './theme-provider'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { 
  Palette, 
  Eye, 
  Moon, 
  Sun, 
  Monitor,
  Accessibility,
  Zap
} from 'lucide-react'

interface AccessibilityControlsProps {
  className?: string
}

export function AccessibilityControls({ className }: AccessibilityControlsProps) {
  const { theme, setTheme } = useTheme()
  const { 
    highContrast, 
    toggleHighContrast, 
    reducedMotion, 
    toggleReducedMotion 
  } = useAccessibility()

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Accessibility className="h-5 w-5" />
          <CardTitle>Accessibility Settings</CardTitle>
        </div>
        <CardDescription>
          Customize your viewing experience for better accessibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Color Theme
          </Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
              className="flex items-center gap-2"
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
              className="flex items-center gap-2"
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('system')}
              className="flex items-center gap-2"
            >
              <Monitor className="h-4 w-4" />
              System
            </Button>
          </div>
        </div>

        <Separator />

        {/* High Contrast Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label 
              htmlFor="high-contrast"
              className="text-sm font-medium flex items-center gap-2 cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              High Contrast Mode
            </Label>
            <p className="text-xs text-muted-foreground">
              Increases contrast for better visibility
            </p>
          </div>
          <Switch
            id="high-contrast"
            checked={highContrast}
            onCheckedChange={toggleHighContrast}
            aria-label="Toggle high contrast mode"
          />
        </div>

        {/* Reduced Motion Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label 
              htmlFor="reduced-motion"
              className="text-sm font-medium flex items-center gap-2 cursor-pointer"
            >
              <Zap className="h-4 w-4" />
              Reduce Animations
            </Label>
            <p className="text-xs text-muted-foreground">
              Minimizes motion for users sensitive to movement
            </p>
          </div>
          <Switch
            id="reduced-motion"
            checked={reducedMotion}
            onCheckedChange={toggleReducedMotion}
            aria-label="Toggle reduced motion"
          />
        </div>

        <Separator />

        {/* Status Information */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Current Settings</Label>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Theme: <span className="font-medium">{theme || 'system'}</span></p>
            <p>High Contrast: <span className="font-medium">{highContrast ? 'On' : 'Off'}</span></p>
            <p>Reduced Motion: <span className="font-medium">{reducedMotion ? 'On' : 'Off'}</span></p>
          </div>
        </div>

        {/* Accessibility Tips */}
        <div className="rounded-lg bg-muted/50 p-4 space-y-2">
          <Label className="text-sm font-medium">💡 Accessibility Tips</Label>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Use keyboard navigation with Tab and Enter keys</li>
            <li>• Enable high contrast if you have difficulty reading text</li>
            <li>• Reduce motion if animations cause discomfort</li>
            <li>• These settings sync with your system preferences</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}