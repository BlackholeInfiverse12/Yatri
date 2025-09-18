import { NextRequest, NextResponse } from "next/server"

interface LastMileRequest {
  location: string
  radius?: number // in meters
  types?: ("auto" | "taxi" | "bike" | "bus")[]
}

interface LastMileOption {
  id: string
  type: "auto" | "taxi" | "bike" | "bus"
  name: string
  location: {
    lat: number
    lng: number
    address: string
  }
  availability: {
    available: boolean
    count?: number
    estimatedWait: number // in minutes
  }
  pricing: {
    baseFare: number
    perKm?: number
    estimatedCost: number
  }
  provider?: string
  deepLink?: string
  distance: number // in meters
  walkingTime: number // in minutes
}

// Mock data for Mumbai last-mile options
const MUMBAI_AUTO_ZONES = [
  { name: "Bandra Auto Stand", lat: 19.0544, lng: 72.8406 },
  { name: "Andheri Auto Stand", lat: 19.1197, lng: 72.8464 },
  { name: "Dadar Auto Stand", lat: 19.0176, lng: 72.8562 },
  { name: "CSMT Auto Stand", lat: 18.9398, lng: 72.8355 },
  { name: "Kurla Auto Stand", lat: 19.0728, lng: 72.8826 },
]

const BIKE_SHARING_STATIONS = [
  { name: "Yulu Station - BKC", lat: 19.0728, lng: 72.8826, bikes: 8 },
  { name: "Yulu Station - Bandra", lat: 19.0544, lng: 72.8406, bikes: 12 },
  { name: "Yulu Station - Andheri", lat: 19.1197, lng: 72.8464, bikes: 5 },
  { name: "Yulu Station - Powai", lat: 19.1176, lng: 72.906, bikes: 15 },
]

const RIDE_HAIL_PROVIDERS = [
  { name: "Ola", baseFare: 25, perKm: 12, deepLink: "https://book.olacabs.com" },
  { name: "Uber", baseFare: 30, perKm: 14, deepLink: "https://m.uber.com" },
  { name: "Rapido", baseFare: 15, perKm: 8, deepLink: "https://rapido.bike" },
]

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

function getLocationCoordinates(location: string): { lat: number; lng: number } {
  // Mock coordinate lookup - in real app, this would use geocoding
  const locationMap: Record<string, { lat: number; lng: number }> = {
    bandra: { lat: 19.0544, lng: 72.8406 },
    andheri: { lat: 19.1197, lng: 72.8464 },
    dadar: { lat: 19.0176, lng: 72.8562 },
    csmt: { lat: 18.9398, lng: 72.8355 },
    bkc: { lat: 19.0728, lng: 72.8826 },
    powai: { lat: 19.1176, lng: 72.906 },
  }

  const key = location.toLowerCase().split(" ")[0]
  return locationMap[key] || { lat: 19.076, lng: 72.8777 } // Default to Mumbai center
}

async function fetchLastMileOptions(request: LastMileRequest): Promise<LastMileOption[]> {
  const { location, radius = 1000, types = ["auto", "taxi", "bike", "bus"] } = request
  const locationCoords = getLocationCoordinates(location)
  const options: LastMileOption[] = []

  console.log("[v0] Fetching last-mile options for:", location, "within", radius, "meters")

  // Auto-rickshaw zones
  if (types.includes("auto")) {
    MUMBAI_AUTO_ZONES.forEach((zone, index) => {
      const distance = calculateDistance(locationCoords.lat, locationCoords.lng, zone.lat, zone.lng)
      if (distance <= radius) {
        options.push({
          id: `auto-${index}`,
          type: "auto",
          name: zone.name,
          location: {
            lat: zone.lat,
            lng: zone.lng,
            address: zone.name,
          },
          availability: {
            available: Math.random() > 0.2,
            count: Math.floor(Math.random() * 8) + 2,
            estimatedWait: Math.floor(Math.random() * 10) + 2,
          },
          pricing: {
            baseFare: 25,
            perKm: 15,
            estimatedCost: 25 + Math.floor(distance / 1000) * 15,
          },
          distance: Math.floor(distance),
          walkingTime: Math.floor(distance / 80), // ~80m/min walking speed
        })
      }
    })
  }

  // Ride-hailing services
  if (types.includes("taxi")) {
    RIDE_HAIL_PROVIDERS.forEach((provider, index) => {
      const estimatedDistance = Math.random() * 3 + 1 // 1-4 km estimated trip
      options.push({
        id: `taxi-${provider.name.toLowerCase()}-${index}`,
        type: "taxi",
        name: provider.name,
        location: {
          lat: locationCoords.lat + (Math.random() - 0.5) * 0.01,
          lng: locationCoords.lng + (Math.random() - 0.5) * 0.01,
          address: `${provider.name} Pickup Point`,
        },
        availability: {
          available: Math.random() > 0.1,
          estimatedWait: Math.floor(Math.random() * 8) + 3,
        },
        pricing: {
          baseFare: provider.baseFare,
          perKm: provider.perKm,
          estimatedCost: provider.baseFare + Math.floor(estimatedDistance * provider.perKm),
        },
        provider: provider.name,
        deepLink: provider.deepLink,
        distance: Math.floor(Math.random() * 200) + 50,
        walkingTime: 1,
      })
    })
  }

  // Bike-sharing stations
  if (types.includes("bike")) {
    BIKE_SHARING_STATIONS.forEach((station, index) => {
      const distance = calculateDistance(locationCoords.lat, locationCoords.lng, station.lat, station.lng)
      if (distance <= radius) {
        options.push({
          id: `bike-${index}`,
          type: "bike",
          name: station.name,
          location: {
            lat: station.lat,
            lng: station.lng,
            address: station.name,
          },
          availability: {
            available: station.bikes > 0,
            count: station.bikes,
            estimatedWait: station.bikes > 0 ? 0 : Math.floor(Math.random() * 15) + 5,
          },
          pricing: {
            baseFare: 10,
            perKm: 5,
            estimatedCost: 10 + Math.floor(Math.random() * 20),
          },
          provider: "Yulu",
          deepLink: "https://www.yulu.bike",
          distance: Math.floor(distance),
          walkingTime: Math.floor(distance / 80),
        })
      }
    })
  }

  // Sort by distance and availability
  return options
    .sort((a, b) => {
      if (a.availability.available && !b.availability.available) return -1
      if (!a.availability.available && b.availability.available) return 1
      return a.distance - b.distance
    })
    .slice(0, 10) // Limit to top 10 options
}

export async function POST(request: NextRequest) {
  try {
    const body: LastMileRequest = await request.json()

    if (!body.location) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 })
    }

    console.log("[v0] Processing last-mile request:", body)

    // Simulate API processing time
    await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 300))

    const options = await fetchLastMileOptions(body)

    console.log("[v0] Returning", options.length, "last-mile options")

    return NextResponse.json({
      success: true,
      options,
      metadata: {
        searchTime: Date.now(),
        location: body.location,
        radius: body.radius || 1000,
        totalOptions: options.length,
        availableOptions: options.filter((o) => o.availability.available).length,
      },
    })
  } catch (error) {
    console.error("[v0] Last-mile API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get("location")
  const radius = Number.parseInt(searchParams.get("radius") || "1000")
  const types = searchParams.get("types")?.split(",") as ("auto" | "taxi" | "bike" | "bus")[]

  if (!location) {
    return NextResponse.json({ error: "Location query parameter is required" }, { status: 400 })
  }

  const lastMileRequest: LastMileRequest = {
    location,
    radius,
    types,
  }

  return POST(
    new NextRequest(request.url, {
      method: "POST",
      body: JSON.stringify(lastMileRequest),
      headers: { "Content-Type": "application/json" },
    }),
  )
}
