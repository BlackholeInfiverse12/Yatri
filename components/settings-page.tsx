"use client"

import { Bell, MapPin, Shield, Palette, Globe, HelpCircle, ChevronRight, Accessibility, User, MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccessibilityControls } from "@/components/accessibility-controls"
import { ProfileSettingsForm, NotificationSettingsForm, FeedbackForm } from "@/components/settings-forms"
import { useState } from "react"

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [notifications, setNotifications] = useState({
    delays: true,
    crowdUpdates: false,
    newRoutes: true,
    maintenance: true,
  })

  const [preferences, setPreferences] = useState({
    theme: "system",
    language: "english",
    defaultTransfers: "2",
    walkingSpeed: "normal",
  })

  const settingSections = [
    {
      title: "Notifications",
      icon: Bell,
      items: [
        {
          label: "Delay Alerts",
          description: "Get notified about train delays",
          type: "switch",
          value: notifications.delays,
          onChange: (value: boolean) => setNotifications((prev) => ({ ...prev, delays: value })),
        },
        {
          label: "Crowd Updates",
          description: "Real-time crowd level notifications",
          type: "switch",
          value: notifications.crowdUpdates,
          onChange: (value: boolean) => setNotifications((prev) => ({ ...prev, crowdUpdates: value })),
        },
        {
          label: "New Routes",
          description: "Notify about new route suggestions",
          type: "switch",
          value: notifications.newRoutes,
          onChange: (value: boolean) => setNotifications((prev) => ({ ...prev, newRoutes: value })),
        },
        {
          label: "Maintenance Alerts",
          description: "Track maintenance and service updates",
          type: "switch",
          value: notifications.maintenance,
          onChange: (value: boolean) => setNotifications((prev) => ({ ...prev, maintenance: value })),
        },
      ],
    },
    {
      title: "Journey Preferences",
      icon: MapPin,
      items: [
        {
          label: "Maximum Transfers",
          description: "Default transfer limit for routes",
          type: "select",
          value: preferences.defaultTransfers,
          options: [
            { value: "0", label: "Direct routes only" },
            { value: "1", label: "1 transfer" },
            { value: "2", label: "2 transfers" },
            { value: "3", label: "3+ transfers" },
          ],
          onChange: (value: string) => setPreferences((prev) => ({ ...prev, defaultTransfers: value })),
        },
        {
          label: "Walking Speed",
          description: "Affects walking time calculations",
          type: "select",
          value: preferences.walkingSpeed,
          options: [
            { value: "slow", label: "Slow (3 km/h)" },
            { value: "normal", label: "Normal (4 km/h)" },
            { value: "fast", label: "Fast (5 km/h)" },
          ],
          onChange: (value: string) => setPreferences((prev) => ({ ...prev, walkingSpeed: value })),
        },
      ],
    },
    {
      title: "Appearance",
      icon: Palette,
      items: [
        {
          label: "Theme",
          description: "Choose your preferred theme",
          type: "select",
          value: preferences.theme,
          options: [
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "system", label: "System" },
          ],
          onChange: (value: string) => setPreferences((prev) => ({ ...prev, theme: value })),
        },
        {
          label: "Language",
          description: "App display language",
          type: "select",
          value: preferences.language,
          options: [
            { value: "english", label: "English" },
            { value: "hindi", label: "हिंदी" },
            { value: "marathi", label: "मराठी" },
          ],
          onChange: (value: string) => setPreferences((prev) => ({ ...prev, language: value })),
        },
      ],
    },
  ]

  const quickActions = [
    { label: "Privacy & Security", icon: Shield, action: () => {} },
    { label: "Help & Support", icon: HelpCircle, action: () => {} },
    { label: "About Yatri", icon: Globe, action: () => {} },
  ]

  return (
    <div className="space-y-6 p-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Settings</h2>
        <p className="text-muted-foreground">Customize your Yatri experience with validated forms</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="journey" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Journey
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettingsForm />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettingsForm />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackForm />
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Appearance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">Theme</div>
                  <div className="text-sm text-muted-foreground">Choose your preferred theme</div>
                </div>
                <div className="ml-4">
                  <Select value={preferences.theme} onValueChange={(value) => setPreferences(prev => ({ ...prev, theme: value }))}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">Language</div>
                  <div className="text-sm text-muted-foreground">App display language</div>
                </div>
                <div className="ml-4">
                  <Select value={preferences.language} onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">हिंदी</SelectItem>
                      <SelectItem value="marathi">मराठी</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Accessibility Controls */}
              <div className="pt-4 border-t">
                <AccessibilityControls />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journey">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Journey Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">Maximum Transfers</div>
                  <div className="text-sm text-muted-foreground">Default transfer limit for routes</div>
                </div>
                <div className="ml-4">
                  <Select value={preferences.defaultTransfers} onValueChange={(value) => setPreferences(prev => ({ ...prev, defaultTransfers: value }))}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Direct routes only</SelectItem>
                      <SelectItem value="1">1 transfer</SelectItem>
                      <SelectItem value="2">2 transfers</SelectItem>
                      <SelectItem value="3">3+ transfers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">Walking Speed</div>
                  <div className="text-sm text-muted-foreground">Affects walking time calculations</div>
                </div>
                <div className="ml-4">
                  <Select value={preferences.walkingSpeed} onValueChange={(value) => setPreferences(prev => ({ ...prev, walkingSpeed: value }))}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow (3 km/h)</SelectItem>
                      <SelectItem value="normal">Normal (4 km/h)</SelectItem>
                      <SelectItem value="fast">Fast (5 km/h)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>More Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon
            return (
              <Button key={index} variant="ghost" className="w-full justify-between h-auto p-4" onClick={action.action}>
                <div className="flex items-center gap-3">
                  <IconComponent className="h-5 w-5 text-muted-foreground" />
                  <span>{action.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            )
          })}
        </CardContent>
      </Card>

      {/* App Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Yatri Mumbai Transit v1.0.0 - Enhanced with Form Validation</p>
        <p>Made with ❤️ for Mumbai commuters</p>
      </div>
    </div>
  )
}
