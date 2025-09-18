"use client"

import { Train, Menu, User, Settings, MapPin, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ProfilePage } from "@/components/profile-page"
import { SettingsPage } from "@/components/settings-page"
import { useState } from "react"

export function Header() {
  const [activeSheet, setActiveSheet] = useState<"menu" | "profile" | "settings" | null>(null)

  const menuItems = [
    {
      icon: User,
      label: "Profile",
      description: "View your journey history",
      action: () => setActiveSheet("profile"),
    },
    {
      icon: Settings,
      label: "Settings",
      description: "Customize your experience",
      action: () => setActiveSheet("settings"),
    },
    {
      icon: MapPin,
      label: "Nearby Stations",
      description: "Find stations near you",
      action: () => console.log("Navigate to nearby stations"),
    },
    {
      icon: Bell,
      label: "Live Updates",
      description: "Latest news and alerts",
      action: () => console.log("Navigate to live updates"),
    },
  ]

  return (
    <>
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Train className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-card-foreground">Yatri</h1>
                <p className="text-sm text-muted-foreground">Mumbai Transit</p>
              </div>
            </div>

            <Sheet open={activeSheet === "menu"} onOpenChange={(open) => setActiveSheet(open ? "menu" : null)}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Train className="h-5 w-5 text-primary" />
                    Yatri Menu
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  {menuItems.map((item, index) => {
                    const IconComponent = item.icon
                    return (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start h-auto p-4"
                        onClick={() => {
                          item.action()
                          if (item.label !== "Profile" && item.label !== "Settings") {
                            setActiveSheet(null)
                          }
                        }}
                      >
                        <div className="flex items-center gap-3 text-left">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <IconComponent className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          </div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Profile Sheet */}
      <Sheet open={activeSheet === "profile"} onOpenChange={(open) => setActiveSheet(open ? "profile" : null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile
            </SheetTitle>
          </SheetHeader>
          <ProfilePage />
        </SheetContent>
      </Sheet>

      {/* Settings Sheet */}
      <Sheet open={activeSheet === "settings"} onOpenChange={(open) => setActiveSheet(open ? "settings" : null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Settings
            </SheetTitle>
          </SheetHeader>
          <SettingsPage />
        </SheetContent>
      </Sheet>
    </>
  )
}
