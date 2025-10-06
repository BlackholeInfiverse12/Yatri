'use client'

import { AccessibilityControls } from '@/components/accessibility-controls'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Train, 
  MapPin, 
  Clock, 
  Star, 
  Heart,
  ArrowLeft 
} from 'lucide-react'

export default function AccessibilityTestPage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Accessibility Test Page</h1>
            <p className="text-muted-foreground">
              Test and configure accessibility features for the Yatri app
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Accessibility Controls */}
          <div className="lg:col-span-1">
            <AccessibilityControls />
          </div>

          {/* Sample UI Elements */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sample Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Train className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Mumbai Local</CardTitle>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <CardDescription>
                    Western Line • Platform 2
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Bandra → Churchgate</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Arrives in 3 minutes</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      Track Train
                    </Button>
                    <Button size="sm" variant="outline">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Train className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Harbour Line</CardTitle>
                    </div>
                    <Badge variant="destructive">Delayed</Badge>
                  </div>
                  <CardDescription>
                    Harbour Line • Platform 1
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Panvel → CST</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Delayed by 8 minutes</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" className="flex-1">
                      View Updates
                    </Button>
                    <Button size="sm" variant="outline">
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sample Form */}
            <Card>
              <CardHeader>
                <CardTitle>Journey Planner</CardTitle>
                <CardDescription>
                  Plan your route with accessibility-friendly options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="from">From Station</Label>
                    <Input 
                      id="from" 
                      placeholder="Enter departure station" 
                      aria-describedby="from-help"
                    />
                    <p id="from-help" className="text-xs text-muted-foreground">
                      Start typing to see suggestions
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="to">To Station</Label>
                    <Input 
                      id="to" 
                      placeholder="Enter destination station"
                      aria-describedby="to-help" 
                    />
                    <p id="to-help" className="text-xs text-muted-foreground">
                      Choose your destination
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="preferences">Accessibility Preferences</Label>
                  <Textarea
                    id="preferences"
                    placeholder="Let us know about any accessibility needs (wheelchair access, platform assistance, etc.)"
                    rows={3}
                    aria-describedby="preferences-help"
                  />
                  <p id="preferences-help" className="text-xs text-muted-foreground">
                    Optional: Help us provide better route suggestions
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    Find Routes
                  </Button>
                  <Button variant="outline">
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Button Variants Test */}
            <Card>
              <CardHeader>
                <CardTitle>Button Variants Test</CardTitle>
                <CardDescription>
                  Test different button styles with current accessibility settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Button variant="default">Default Button</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link Button</Button>
                </div>
              </CardContent>
            </Card>

            {/* Color Contrast Test */}
            <Card>
              <CardHeader>
                <CardTitle>Color Contrast Test</CardTitle>
                <CardDescription>
                  Verify text readability with current settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Normal Text</h4>
                    <p className="text-sm">Regular body text should be easily readable.</p>
                    <p className="text-xs text-muted-foreground">
                      Muted text maintains adequate contrast.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-primary">Primary Color</h4>
                    <p className="text-sm text-primary">
                      Primary colored text for emphasis.
                    </p>
                    <Badge>Default Badge</Badge>
                    <Badge variant="secondary">Secondary Badge</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-medium">Accessibility Features Active</h3>
              <p className="text-sm text-muted-foreground">
                This page demonstrates the accessibility improvements made to the Yatri app. 
                Toggle settings above to see real-time changes in contrast, motion, and focus indicators.
              </p>
              <div className="flex justify-center gap-2 text-xs text-muted-foreground">
                <span>WCAG 2.1 AA Compliant</span>
                <span>•</span>
                <span>Keyboard Navigable</span>
                <span>•</span>
                <span>Screen Reader Friendly</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}