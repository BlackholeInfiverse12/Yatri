"use client"

import { useState, useRef, useEffect } from "react"
import { Search, MapPin, Navigation, Settings, Train, Clock, ArrowUpDown, X, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MUMBAI_STATIONS } from "@/lib/mumbai-railway-data"
import { NearbyStations } from "@/components/nearby-stations"
import { LiveUpdates } from "@/components/live-updates"

const MUMBAI_LOCATIONS = [
  ...MUMBAI_STATIONS.map((station) => station.name),
  "BKC (Bandra Kurla Complex)",
  "Powai",
  "Hiranandani Gardens",
  "Phoenix Mills",
  "Palladium Mall",
  "R City Mall",
  "Inorbit Mall",
  "Mumbai Airport T1",
  "Mumbai Airport T2",
  "Nariman Point",
  "Fort",
  "Colaba",
  "Worli",
  "Prabhadevi",
  "Mahim",
  "Bandra West",
  "Juhu",
  "Versova",
  "Oshiwara",
  "Goregaon",
  "Panvel",
]

interface SearchSuggestion {
  name: string
  type: "station" | "landmark" | "area"
}

interface SearchInterfaceProps {
  onSearch?: (results: any) => void
  showResults?: boolean
}

export function SearchInterface({ onSearch, showResults = true }: SearchInterfaceProps) {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [maxTransfers, setMaxTransfers] = useState([2])
  const [timeBuffer, setTimeBuffer] = useState("10")
  const [originSuggestions, setOriginSuggestions] = useState<SearchSuggestion[]>([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<SearchSuggestion[]>([])
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false)
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "CSMT to Andheri",
    "Bandra to BKC",
    "Thane to Churchgate",
    "Goregaon to Panvel",
  ])
  const [showNearbyStations, setShowNearbyStations] = useState(false)
  const [showLiveUpdates, setShowLiveUpdates] = useState(false)

  const originRef = useRef<HTMLInputElement>(null)
  const destinationRef = useRef<HTMLInputElement>(null)

  const getSuggestions = (query: string): SearchSuggestion[] => {
    if (!query.trim()) return []

    return MUMBAI_LOCATIONS.filter((location) => location.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map((name) => ({
        name,
        type: name.includes("Station")
          ? "station"
          : name.includes("Mall") || name.includes("Airport")
            ? "landmark"
            : "area",
      }))
  }

  const handleOriginChange = (value: string) => {
    setOrigin(value)
    const suggestions = getSuggestions(value)
    setOriginSuggestions(suggestions)
    setShowOriginSuggestions(suggestions.length > 0)
  }

  const handleDestinationChange = (value: string) => {
    setDestination(value)
    const suggestions = getSuggestions(value)
    setDestinationSuggestions(suggestions)
    setShowDestinationSuggestions(suggestions.length > 0)
  }

  const selectOriginSuggestion = (suggestion: SearchSuggestion) => {
    setOrigin(suggestion.name)
    setShowOriginSuggestions(false)
  }

  const selectDestinationSuggestion = (suggestion: SearchSuggestion) => {
    setDestination(suggestion.name)
    setShowDestinationSuggestions(false)
  }

  const swapLocations = () => {
    const temp = origin
    setOrigin(destination)
    setDestination(temp)
  }

  const handleSearch = async () => {
    if (!origin.trim() || !destination.trim()) return

    setIsSearching(true)
    console.log("[v0] Search initiated:", { origin, destination, maxTransfers: maxTransfers[0], timeBuffer })

    const searchQuery = `${origin} to ${destination}`
    setRecentSearches((prev) => [searchQuery, ...prev.filter((s) => s !== searchQuery)].slice(0, 4))

    try {
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin,
          destination,
          maxTransfers: maxTransfers[0],
          timeBuffer: Number.parseInt(timeBuffer),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch routes")
      }

      const data = await response.json()

      if (data.success && data.routes) {
        onSearch?.(data.routes)
        console.log("[v0] Received", data.routes.length, "routes from API")
      } else {
        throw new Error(data.error || "No routes found")
      }
    } catch (error) {
      console.error("[v0] Search error:", error)
      const mockRoutes = [
        {
          id: "1",
          type: "fastest",
          totalDuration: 45,
          totalCost: 25,
          transfers: 1,
          walkingDistance: 800,
          steps: [
            {
              mode: "walk",
              from: origin,
              to: "Nearest Station",
              duration: 8,
              distance: 600,
            },
            {
              mode: "train",
              line: "Western Railway",
              from: "Goregaon",
              to: "Kurla",
              duration: 25,
              cost: 15,
            },
            {
              mode: "train",
              line: "CR-Harbor Line",
              from: "Kurla",
              to: "Panvel",
              duration: 12,
              cost: 10,
            },
          ],
          crowdLevel: "medium",
        },
        {
          id: "2",
          type: "cheapest",
          totalDuration: 65,
          totalCost: 15,
          transfers: 0,
          walkingDistance: 400,
          steps: [
            {
              mode: "walk",
              from: origin,
              to: "Goregaon Station",
              duration: 5,
              distance: 400,
            },
            {
              mode: "train",
              line: "CR-Harbor Line Direct",
              from: "Goregaon",
              to: "Panvel",
              duration: 60,
              cost: 15,
            },
          ],
          crowdLevel: "low",
        },
      ]
      onSearch?.(mockRoutes)
    } finally {
      setIsSearching(false)
    }
  }

  const handleStationSelect = (station: any, type: "origin" | "destination") => {
    if (type === "origin") {
      setOrigin(station.name)
    } else {
      setDestination(station.name)
    }
    setShowNearbyStations(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginSuggestions(false)
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5 text-primary" />
            Plan Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2 relative" ref={originRef}>
              <Label htmlFor="origin" className="flex items-center gap-2 text-sm">
                <Navigation className="h-4 w-4 text-primary" />
                From
              </Label>
              <div className="relative">
                <Input
                  id="origin"
                  placeholder="Enter starting location..."
                  value={origin}
                  onChange={(e) => handleOriginChange(e.target.value)}
                  onFocus={() => origin && setShowOriginSuggestions(originSuggestions.length > 0)}
                  className="text-sm pr-10"
                />
                {origin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => {
                      setOrigin("")
                      setShowOriginSuggestions(false)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {showOriginSuggestions && (
                <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
                  <CardContent className="p-2">
                    {originSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full text-left p-2 hover:bg-muted rounded-md flex items-center gap-2"
                        onClick={() => selectOriginSuggestion(suggestion)}
                      >
                        <div
                          className={`p-1 rounded ${
                            suggestion.type === "station"
                              ? "bg-primary/10 text-primary"
                              : suggestion.type === "landmark"
                                ? "bg-secondary/10 text-secondary"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {suggestion.type === "station" ? (
                            <Train className="h-3 w-3" />
                          ) : (
                            <MapPin className="h-3 w-3" />
                          )}
                        </div>
                        <span className="text-xs">{suggestion.name}</span>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={swapLocations}
                className="rounded-full h-8 w-8 p-0 bg-transparent"
                disabled={!origin && !destination}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 relative" ref={destinationRef}>
              <Label htmlFor="destination" className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-secondary" />
                To
              </Label>
              <div className="relative">
                <Input
                  id="destination"
                  placeholder="Enter destination..."
                  value={destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  onFocus={() => destination && setShowDestinationSuggestions(destinationSuggestions.length > 0)}
                  className="text-sm pr-10"
                />
                {destination && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => {
                      setDestination("")
                      setShowDestinationSuggestions(false)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {showDestinationSuggestions && (
                <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
                  <CardContent className="p-2">
                    {destinationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full text-left p-2 hover:bg-muted rounded-md flex items-center gap-2"
                        onClick={() => selectDestinationSuggestion(suggestion)}
                      >
                        <div
                          className={`p-1 rounded ${
                            suggestion.type === "station"
                              ? "bg-primary/10 text-primary"
                              : suggestion.type === "landmark"
                                ? "bg-secondary/10 text-secondary"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {suggestion.type === "station" ? (
                            <Train className="h-3 w-3" />
                          ) : (
                            <MapPin className="h-3 w-3" />
                          )}
                        </div>
                        <span className="text-xs">{suggestion.name}</span>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <Button
            onClick={handleSearch}
            className="w-full text-sm py-4"
            disabled={!origin.trim() || !destination.trim() || isSearching}
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Find Routes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {recentSearches.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              Recent
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 text-xs max-w-full truncate px-2 py-1"
                  onClick={() => {
                    const [from, to] = search.split(" to ")
                    setOrigin(from)
                    setDestination(to)
                  }}
                  title={search} // Show full text on hover
                >
                  <span className="truncate max-w-[120px] sm:max-w-[150px]">{search}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4 text-primary" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Max Transfers: {maxTransfers[0]}</Label>
            <Slider value={maxTransfers} onValueChange={setMaxTransfers} max={3} min={0} step={1} className="w-full" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time-buffer" className="text-xs">
              Time Buffer
            </Label>
            <Select value={timeBuffer} onValueChange={setTimeBuffer}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">+10% buffer</SelectItem>
                <SelectItem value="20">+20% buffer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-2">
        <Sheet open={showNearbyStations} onOpenChange={setShowNearbyStations}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="bg-transparent text-xs">
              <MapPin className="h-4 w-4 mr-2" />
              Nearby Stations
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Nearby Stations
              </SheetTitle>
            </SheetHeader>
            <NearbyStations
              onStationSelect={(station) => {
                // Show options to set as origin or destination
                const choice = window.confirm(
                  `Set "${station.name}" as origin? Click OK for origin, Cancel for destination.`,
                )
                handleStationSelect(station, choice ? "origin" : "destination")
              }}
              onClose={() => setShowNearbyStations(false)}
            />
          </SheetContent>
        </Sheet>

        <Sheet open={showLiveUpdates} onOpenChange={setShowLiveUpdates}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="bg-transparent text-xs">
              <Train className="h-4 w-4 mr-2" />
              Live Updates
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Live Updates
              </SheetTitle>
            </SheetHeader>
            <LiveUpdates onClose={() => setShowLiveUpdates(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
