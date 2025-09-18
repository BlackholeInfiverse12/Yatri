"use client"

import { useState, useEffect } from "react"
import { MapPin, Navigation, Loader2, AlertCircle, Train } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MUMBAI_STATIONS, type Station } from "@/lib/mumbai-railway-data"

interface NearbyStation extends Station {
  distance: number
  walkingTime: number
}

interface NearbyStationsProps {
  onStationSelect?: (station: Station) => void
  onClose?: () => void
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calculate walking time based on distance (assuming 4 km/h walking speed)
function calculateWalkingTime(distanceKm: number): number {
  return Math.round((distanceKm / 4) * 60) // Convert to minutes
}

const LINE_COLORS = {
  CR: "bg-blue-100 text-blue-700 border-blue-200",
  WR: "bg-green-100 text-green-700 border-green-200",
  "CR-Harbor": "bg-purple-100 text-purple-700 border-purple-200",
}

const LINE_NAMES = {
  CR: "Central Railway",
  WR: "Western Railway",
  "CR-Harbor": "Harbor Line",
}

export function NearbyStations({ onStationSelect, onClose }: NearbyStationsProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [nearbyStations, setNearbyStations] = useState<NearbyStation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "prompt">("prompt")

  const getCurrentLocation = () => {
    setIsLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser")
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lon: longitude })
        setLocationPermission("granted")
        findNearbyStations(latitude, longitude)
      },
      (error) => {
        setLocationPermission("denied")
        setIsLoading(false)

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError("Location access denied. Please enable location services.")
            break
          case error.POSITION_UNAVAILABLE:
            setError("Location information unavailable.")
            break
          case error.TIMEOUT:
            setError("Location request timed out.")
            break
          default:
            setError("An unknown error occurred while retrieving location.")
            break
        }

        // Fallback to Mumbai center for demo purposes
        const mumbaiCenter = { lat: 19.076, lon: 72.8777 }
        setUserLocation(mumbaiCenter)
        findNearbyStations(mumbaiCenter.lat, mumbaiCenter.lon)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    )
  }

  const findNearbyStations = (userLat: number, userLon: number) => {
    const stationsWithDistance = MUMBAI_STATIONS.map((station) => {
      const distance = calculateDistance(userLat, userLon, station.coordinates[0], station.coordinates[1])
      const walkingTime = calculateWalkingTime(distance)

      return {
        ...station,
        distance,
        walkingTime,
      }
    })

    // Sort by distance and take the closest 10 stations
    const sortedStations = stationsWithDistance.sort((a, b) => a.distance - b.distance).slice(0, 10)

    setNearbyStations(sortedStations)
    setIsLoading(false)
  }

  const handleStationSelect = (station: Station) => {
    onStationSelect?.(station)
    onClose?.()
  }

  useEffect(() => {
    getCurrentLocation()
  }, [])

  return (
    <div className="space-y-4 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Nearby Stations</h2>
        <p className="text-muted-foreground">Find the closest railway stations to your location</p>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
            {locationPermission === "denied" && (
              <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={getCurrentLocation}>
                Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Finding nearby stations...</p>
          </CardContent>
        </Card>
      )}

      {userLocation && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Navigation className="h-5 w-5 text-primary" />
              Your Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Latitude: {userLocation.lat.toFixed(4)}, Longitude: {userLocation.lon.toFixed(4)}
            </div>
          </CardContent>
        </Card>
      )}

      {nearbyStations.length > 0 && (
        <div className="space-y-3">
          {nearbyStations.map((station, index) => (
            <Card
              key={`${station.code}-${station.line}`}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleStationSelect(station)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-primary/10 p-1 rounded">
                        <Train className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-medium text-sm">{station.name}</h3>
                      <Badge variant="outline" className={`text-xs ${LINE_COLORS[station.line]}`}>
                        {LINE_NAMES[station.line]}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {station.distance.toFixed(2)} km away
                      </div>
                      <div className="flex items-center gap-1">
                        <Navigation className="h-3 w-3" />
                        {station.walkingTime} min walk
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Zone {station.zone}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">#{index + 1}</div>
                    <div className="text-xs text-muted-foreground">Closest</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {nearbyStations.length === 0 && !isLoading && !error && (
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No nearby stations found</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 bg-transparent" onClick={getCurrentLocation} disabled={isLoading}>
          <Navigation className="h-4 w-4 mr-2" />
          Refresh Location
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}
