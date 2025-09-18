"use client"

import { MapPin, Clock, Star, Edit, Camera } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ProfilePage() {
  const userStats = {
    totalJourneys: 127,
    favoriteStations: ["CSMT", "Dadar", "Bandra"],
    totalDistance: "2,340 km",
    carbonSaved: "45.2 kg",
    memberSince: "March 2024",
  }

  const recentJourneys = [
    { from: "CSMT", to: "Andheri", date: "Today", time: "09:15 AM", duration: "42 min" },
    { from: "Bandra", to: "Churchgate", date: "Yesterday", time: "06:30 PM", duration: "28 min" },
    { from: "Dadar", to: "Thane", date: "2 days ago", time: "08:45 AM", duration: "35 min" },
  ]

  return (
    <div className="space-y-6 p-4">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/user-profile-illustration.png" />
                <AvatarFallback className="text-lg">MU</AvatarFallback>
              </Avatar>
              <Button size="sm" variant="secondary" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">Mumbai User</h2>
                <Button size="sm" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-muted-foreground mb-2">Regular Commuter</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Mumbai, Maharashtra
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Member since {userStats.memberSince}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{userStats.totalJourneys}</div>
            <div className="text-sm text-muted-foreground">Total Journeys</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{userStats.totalDistance}</div>
            <div className="text-sm text-muted-foreground">Distance Traveled</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">{userStats.carbonSaved}</div>
            <div className="text-sm text-muted-foreground">CO₂ Saved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{userStats.favoriteStations.length}</div>
            <div className="text-sm text-muted-foreground">Favorite Stations</div>
          </CardContent>
        </Card>
      </div>

      {/* Favorite Stations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Favorite Stations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {userStats.favoriteStations.map((station) => (
              <Badge key={station} variant="secondary" className="px-3 py-1">
                {station}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Journeys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Journeys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentJourneys.map((journey, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">
                    {journey.from} → {journey.to}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {journey.duration}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  <div>{journey.date}</div>
                  <div>{journey.time}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button className="flex-1">
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          <Star className="h-4 w-4 mr-2" />
          Manage Favorites
        </Button>
      </div>
    </div>
  )
}
