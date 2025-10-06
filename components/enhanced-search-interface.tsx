"use client"

import { useState, useRef, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Search, MapPin, Navigation, Settings, Train, Clock, ArrowUpDown, X, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MUMBAI_STATIONS } from "@/lib/mumbai-railway-data"
import { NearbyStations } from "@/components/nearby-stations"
import { LiveUpdates } from "@/components/live-updates"
import { journeySearchSchema, JourneySearchData, validateField } from "@/lib/validation-schemas"
import { cn } from "@/lib/utils"

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

interface EnhancedSearchInterfaceProps {
  onSearch?: (results: any) => void
  showResults?: boolean
}

export function EnhancedSearchInterface({ onSearch, showResults = true }: EnhancedSearchInterfaceProps) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<JourneySearchData>({
    resolver: zodResolver(journeySearchSchema),
    defaultValues: {
      origin: "",
      destination: "",
      maxTransfers: 2,
      timeBuffer: 10,
      travelTime: "now",
      travelDate: new Date()
    },
    mode: 'onBlur'
  })

  // Watch form values for real-time validation
  const watchedOrigin = watch('origin')
  const watchedDestination = watch('destination')
  const watchedMaxTransfers = watch('maxTransfers')
  const watchedTimeBuffer = watch('timeBuffer')

  // UI state
  const [originSuggestions, setOriginSuggestions] = useState<SearchSuggestion[]>([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<SearchSuggestion[]>([])
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false)
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false)
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

    return MUMBAI_LOCATIONS.filter((location) => 
      location.toLowerCase().includes(query.toLowerCase())
    )
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
    setValue('origin', value, { shouldValidate: true })
    const suggestions = getSuggestions(value)
    setOriginSuggestions(suggestions)
    setShowOriginSuggestions(suggestions.length > 0)
  }

  const handleDestinationChange = (value: string) => {
    setValue('destination', value, { shouldValidate: true })
    const suggestions = getSuggestions(value)
    setDestinationSuggestions(suggestions)
    setShowDestinationSuggestions(suggestions.length > 0)
  }

  const selectOriginSuggestion = (suggestion: SearchSuggestion) => {
    setValue('origin', suggestion.name, { shouldValidate: true })
    setShowOriginSuggestions(false)
  }

  const selectDestinationSuggestion = (suggestion: SearchSuggestion) => {
    setValue('destination', suggestion.name, { shouldValidate: true })
    setShowDestinationSuggestions(false)
  }

  const swapLocations = () => {
    const currentValues = getValues()
    setValue('origin', currentValues.destination, { shouldValidate: true })
    setValue('destination', currentValues.origin, { shouldValidate: true })
  }

  const onSubmit = async (data: JourneySearchData) => {
    console.log("[Enhanced Search] Validated search initiated:", data)

    const searchQuery = `${data.origin} to ${data.destination}`
    setRecentSearches((prev) => 
      [searchQuery, ...prev.filter((s) => s !== searchQuery)].slice(0, 4)
    )

    try {
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch routes")
      }

      const responseData = await response.json()

      if (responseData.success && responseData.routes) {
        onSearch?.(responseData.routes)
        console.log("[Enhanced Search] Received", responseData.routes.length, "routes from API")
      } else {
        throw new Error(responseData.error || "No routes found")
      }
    } catch (error) {
      console.error("[Enhanced Search] Search error:", error)
      // Mock routes for demo
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
              from: data.origin,
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
              from: data.origin,
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
    }
  }

  const handleStationSelect = (station: any, type: "origin" | "destination") => {
    if (type === "origin") {
      setValue('origin', station.name, { shouldValidate: true })
    } else {
      setValue('destination', station.name, { shouldValidate: true })
    }
    setShowNearbyStations(false)
  }

  // Form validation state
  const hasErrors = Object.keys(errors).length > 0
  const canSubmit = watchedOrigin && watchedDestination && !hasErrors

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
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Validation Summary */}
            {hasErrors && (
              <Alert variant="destructive" className="animate-in slide-in-from-top-2">
                <AlertDescription>
                  Please fix {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''} before searching.
                </AlertDescription>
              </Alert>
            )}

            {/* Origin Field */}
            <div className="space-y-2 relative" ref={originRef}>
              <Label className={cn(
                "text-sm font-medium flex items-center gap-2",
                errors.origin ? "text-destructive" : "text-foreground"
              )}>
                <Navigation className="h-4 w-4 text-primary" />
                From
                <span className="text-destructive">*</span>
              </Label>
              
              <Controller
                name="origin"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <Input
                      {...field}
                      placeholder="Enter starting location..."
                      onChange={(e) => {
                        field.onChange(e)
                        handleOriginChange(e.target.value)
                      }}
                      onFocus={() => field.value && setShowOriginSuggestions(originSuggestions.length > 0)}
                      className={cn(
                        errors.origin && "border-destructive focus:ring-destructive"
                      )}
                      aria-invalid={!!errors.origin}
                    />
                    
                    {field.value && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => {
                          setValue('origin', '', { shouldValidate: true })
                          setShowOriginSuggestions(false)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              />

              {errors.origin && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.origin.message}
                </p>
              )}

              {/* Origin suggestions */}
              {showOriginSuggestions && (
                <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
                  <CardContent className="p-2">
                    {originSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full text-left p-2 hover:bg-muted rounded-md flex items-center gap-2 transition-colors"
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

            {/* Swap button */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={swapLocations}
                className="rounded-full h-8 w-8 p-0 bg-transparent"
                disabled={!watchedOrigin && !watchedDestination}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Destination Field */}
            <div className="space-y-2 relative" ref={destinationRef}>
              <Label className={cn(
                "text-sm font-medium flex items-center gap-2",
                errors.destination ? "text-destructive" : "text-foreground"
              )}>
                <MapPin className="h-4 w-4 text-secondary" />
                To
                <span className="text-destructive">*</span>
              </Label>
              
              <Controller
                name="destination"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <Input
                      {...field}
                      placeholder="Enter destination..."
                      onChange={(e) => {
                        field.onChange(e)
                        handleDestinationChange(e.target.value)
                      }}
                      onFocus={() => field.value && setShowDestinationSuggestions(destinationSuggestions.length > 0)}
                      className={cn(
                        errors.destination && "border-destructive focus:ring-destructive"
                      )}
                      aria-invalid={!!errors.destination}
                    />
                    
                    {field.value && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => {
                          setValue('destination', '', { shouldValidate: true })
                          setShowDestinationSuggestions(false)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              />

              {errors.destination && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.destination.message}
                </p>
              )}

              {/* Destination suggestions */}
              {showDestinationSuggestions && (
                <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
                  <CardContent className="p-2">
                    {destinationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full text-left p-2 hover:bg-muted rounded-md flex items-center gap-2 transition-colors"
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

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full text-sm py-4 relative"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                </div>
              )}
              <span className={isSubmitting ? 'opacity-0' : 'opacity-100'}>
                {isSubmitting ? (
                  'Searching Routes...'
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Find Routes
                  </>
                )}
              </span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent searches */}
      {recentSearches.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              Recent Searches
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
                    setValue('origin', from, { shouldValidate: true })
                    setValue('destination', to, { shouldValidate: true })
                  }}
                  title={search}
                >
                  <span className="truncate max-w-[120px] sm:max-w-[150px]">{search}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preferences */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4 text-primary" />
            Journey Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Controller
              name="maxTransfers"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Max Transfers: {field.value}
                  </Label>
                  <Slider
                    value={[field.value || 2]}
                    onValueChange={([value]) => field.onChange(value)}
                    max={3}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <Controller
              name="timeBuffer"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Time Buffer</Label>
                  <Select
                    value={(field.value || 10).toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time buffer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No buffer</SelectItem>
                      <SelectItem value="5">+5% buffer</SelectItem>
                      <SelectItem value="10">+10% buffer</SelectItem>
                      <SelectItem value="20">+20% buffer</SelectItem>
                      <SelectItem value="30">+30% buffer</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Add extra time for connections and delays
                  </p>
                </div>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional options */}
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
                const choice = window.confirm(
                  `Set "${station.name}" as origin? Click OK for origin, Cancel for destination.`
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