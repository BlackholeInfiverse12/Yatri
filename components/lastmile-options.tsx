"use client"

import { useState, useEffect } from "react"
import { Car, Bike, MapPin, Clock, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface LastMileOption {
  id: string
  type: "auto" | "taxi" | "bike" | "walk"
  provider: string
  distance: number
  duration: number
  cost: number
  rating?: number
  availability: "available" | "limited" | "unavailable"
  location: {
    lat: number
    lng: number
    address: string
  }
  eta?: number
  surge?: number
}

interface LastMileOptionsProps {
  fromLocation: string
  toLocation: string
  coordinates?: {
    from: { lat: number; lng: number }
    to: { lat: number; lng: number }
  }
  onOptionSelect?: (option: LastMileOption) => void
}

const OPTION_ICONS = {
  auto: Car,
  taxi: Car,
  bike: Bike,
  walk: MapPin,
}

const OPTION_COLORS = {
  auto: "bg-yellow-100 text-yellow-700 border-yellow-200",
  taxi: "bg-blue-100 text-blue-700 border-blue-200",
  bike: "bg-green-100 text-green-700 border-green-200",
  walk: "bg-gray-100 text-gray-700 border-gray-200",
}

const AVAILABILITY_COLORS = {
  available: "bg-green-100 text-green-700",
  limited: "bg-yellow-100 text-yellow-700",
  unavailable: "bg-red-100 text-red-700",
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`
  }
  return `${meters}m`
}

export function LastMileOptions({ fromLocation, toLocation, coordinates, onOptionSelect }: LastMileOptionsProps) {
  const [options, setOptions] = useState<LastMileOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (fromLocation && toLocation) {
      fetchLastMileOptions()
    }
  }, [fromLocation, toLocation, coordinates])

  const fetchLastMileOptions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/lastmile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromLocation,
          to: toLocation,
          coordinates,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch last-mile options")
      }

      const data = await response.json()

      if (data.success) {
        setOptions(data.options || [])
      } else {
        throw new Error(data.error || "Failed to fetch options")
      }
    } catch (err) {
      console.error("[v0] Last-mile fetch error:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <div className="text-muted-foreground">Finding last-mile options...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-destructive mb-2">Unable to load options</div>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchLastMileOptions} variant="outline" size="sm">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (options.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Last-Mile Options
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Complete your journey from {fromLocation} to {toLocation}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {options.map((option) => {
          const IconComponent = OPTION_ICONS[option.type]

          return (
            <div
              key={option.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onOptionSelect?.(option)}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg border ${OPTION_COLORS[option.type]}`}>
                  <IconComponent className="h-5 w-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{option.provider}</span>
                    <Badge className={`text-xs ${AVAILABILITY_COLORS[option.availability]}`}>
                      {option.availability}
                    </Badge>
                    {option.surge && option.surge > 1 && (
                      <Badge variant="destructive" className="text-xs">
                        {option.surge}x surge
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(option.duration)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {formatDistance(option.distance)}
                    </div>
                    {option.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current text-yellow-500" />
                        {option.rating.toFixed(1)}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {option.location.address}
                    {option.eta && ` • ${option.eta}min pickup`}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-foreground">₹{option.cost}</div>
                {option.type === "auto" && <div className="text-xs text-muted-foreground">+ waiting charges</div>}
              </div>
            </div>
          )
        })}

        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center text-sm">
            <div>
              <div className="font-medium text-foreground">
                {options.filter((o) => o.availability === "available").length}
              </div>
              <div className="text-muted-foreground">Available Now</div>
            </div>
            <div>
              <div className="font-medium text-foreground">
                ₹{Math.min(...options.map((o) => o.cost))} - ₹{Math.max(...options.map((o) => o.cost))}
              </div>
              <div className="text-muted-foreground">Price Range</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
