"use client"

import { Bell, MapPin, Shield, Palette, Globe, HelpCircle, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export function SettingsPage() {
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
        <p className="text-muted-foreground">Customize your Yatri experience</p>
      </div>

      {settingSections.map((section) => {
        const IconComponent = section.icon
        return (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconComponent className="h-5 w-5 text-primary" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                  </div>
                  <div className="ml-4">
                    {item.type === "switch" && (
                      <Switch
                        checked={item.value as boolean}
                        onCheckedChange={item.onChange as (value: boolean) => void}
                      />
                    )}
                    {item.type === "select" && (
                      <Select value={item.value as string} onValueChange={item.onChange as (value: string) => void}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {item.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}

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
        <p>Yatri Mumbai Transit v1.0.0</p>
        <p>Made with ❤️ for Mumbai commuters</p>
      </div>
    </div>
  )
}
