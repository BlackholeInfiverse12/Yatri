import { type NextRequest, NextResponse } from "next/server"

interface RealtimeRequest {
  routes?: string[]
  lines?: string[]
  stations?: string[]
  vehicleTypes?: ("train" | "bus" | "metro" | "monorail")[]
}

interface VehiclePosition {
  id: string
  line: string
  vehicleType: "train" | "bus" | "metro" | "monorail"
  position: {
    lat: number
    lng: number
  }
  heading: number
  speed: number // km/h
  status: "on_time" | "delayed" | "early" | "stopped"
  delay: number // minutes
  nextStation: string
  destination: string
  crowdLevel: "low" | "medium" | "high"
  lastUpdated: string
  eta: {
    station: string
    minutes: number
  }[]
}

interface StationUpdate {
  stationId: string
  stationName: string
  line: string
  vehicleType: "train" | "bus" | "metro" | "monorail"
  arrivals: {
    vehicleId: string
    destination: string
    eta: number // minutes
    delay: number
    crowdLevel: "low" | "medium" | "high"
    status: "on_time" | "delayed" | "early" | "cancelled"
  }[]
  alerts: {
    id: string
    type: "delay" | "disruption" | "maintenance" | "crowding"
    message: string
    severity: "low" | "medium" | "high"
    startTime: string
    endTime?: string
  }[]
}

// Mock real-time data for Mumbai transport
const MUMBAI_LINES_DATA = {
  "Western Line": {
    stations: [
      "Churchgate",
      "Marine Lines",
      "Charni Road",
      "Grant Road",
      "Mumbai Central",
      "Mahalaxmi",
      "Lower Parel",
      "Prabhadevi",
      "Dadar",
      "Matunga",
      "Mahim",
      "Bandra",
      "Khar",
      "Santacruz",
      "Vile Parle",
      "Andheri",
      "Jogeshwari",
      "Ram Mandir",
      "Goregaon",
      "Malad",
      "Kandivali",
      "Borivali",
    ],
    coordinates: [
      [18.9322, 72.8264],
      [18.9387, 72.8235],
      [18.9506, 72.819],
      [18.9629, 72.8147],
      [18.9685, 72.8205],
      [18.9827, 72.8235],
      [18.9963, 72.8266],
      [19.017, 72.83],
      [19.0176, 72.8562],
      [19.027, 72.848],
      [19.041, 72.842],
      [19.0544, 72.8406],
      [19.0696, 72.837],
      [19.081, 72.837],
      [19.0993, 72.847],
      [19.1197, 72.8464],
      [19.1347, 72.8478],
      [19.1442, 72.8421],
      [19.1626, 72.8497],
      [19.1875, 72.8489],
      [19.2041, 72.854],
      [19.2307, 72.8567],
    ],
  },
  "Central Line": {
    stations: [
      "CSMT",
      "Masjid",
      "Sandhurst Road",
      "Byculla",
      "Chinchpokli",
      "Currey Road",
      "Parel",
      "Dadar",
      "Matunga",
      "Sion",
      "Kurla",
      "Vidyavihar",
      "Ghatkopar",
      "Vikhroli",
      "Kanjurmarg",
      "Bhandup",
      "Nahur",
      "Mulund",
      "Thane",
    ],
    coordinates: [
      [18.9398, 72.8355],
      [18.9478, 72.842],
      [18.952, 72.845],
      [18.975, 72.831],
      [18.989, 72.832],
      [19.001, 72.841],
      [19.003, 72.833],
      [19.0176, 72.8562],
      [19.027, 72.848],
      [19.041, 72.87],
      [19.0728, 72.8826],
      [19.0822, 72.897],
      [19.0863, 72.9081],
      [19.1094, 72.925],
      [19.132, 72.937],
      [19.148, 72.939],
      [19.164, 72.952],
      [19.172, 72.956],
      [19.1972, 72.9568],
    ],
  },
  "Metro Line 1": {
    stations: [
      "Versova",
      "D.N. Nagar",
      "Azad Nagar",
      "Andheri",
      "Western Express Highway",
      "Chakala",
      "Airport Road",
      "Marol Naka",
      "Saki Naka",
      "Asalpha",
      "Jagruti Nagar",
      "Ghatkopar",
    ],
    coordinates: [
      [19.1317, 72.8067],
      [19.138, 72.829],
      [19.142, 72.835],
      [19.1197, 72.8464],
      [19.11, 72.868],
      [19.099, 72.875],
      [19.093, 72.868],
      [19.089, 72.879],
      [19.072, 72.889],
      [19.065, 72.895],
      [19.072, 72.902],
      [19.0863, 72.9081],
    ],
  },
}

function generateVehiclePositions(): VehiclePosition[] {
  const vehicles: VehiclePosition[] = []
  let vehicleId = 1

  Object.entries(MUMBAI_LINES_DATA).forEach(([lineName, lineData]) => {
    const vehicleType = lineName.includes("Metro") ? "metro" : "train"

    // Generate 3-5 vehicles per line
    const vehicleCount = Math.floor(Math.random() * 3) + 3

    for (let i = 0; i < vehicleCount; i++) {
      const stationIndex = Math.floor(Math.random() * lineData.stations.length)
      const station = lineData.stations[stationIndex]
      const coords = lineData.coordinates[stationIndex]

      // Add some random offset to simulate movement
      const latOffset = (Math.random() - 0.5) * 0.005
      const lngOffset = (Math.random() - 0.5) * 0.005

      const delay = Math.random() > 0.7 ? Math.floor(Math.random() * 15) + 1 : 0
      const crowdLevels: ("low" | "medium" | "high")[] = ["low", "medium", "high"]

      // Generate ETA for next few stations
      const eta = []
      for (let j = 1; j <= 3 && stationIndex + j < lineData.stations.length; j++) {
        eta.push({
          station: lineData.stations[stationIndex + j],
          minutes: j * 3 + Math.floor(Math.random() * 4) + delay,
        })
      }

      vehicles.push({
        id: `${vehicleType}-${vehicleId++}`,
        line: lineName,
        vehicleType,
        position: {
          lat: coords[0] + latOffset,
          lng: coords[1] + lngOffset,
        },
        heading: Math.floor(Math.random() * 360),
        speed: Math.floor(Math.random() * 40) + 20,
        status: delay > 0 ? "delayed" : Math.random() > 0.9 ? "early" : "on_time",
        delay,
        nextStation: stationIndex + 1 < lineData.stations.length ? lineData.stations[stationIndex + 1] : station,
        destination: lineData.stations[lineData.stations.length - 1],
        crowdLevel: crowdLevels[Math.floor(Math.random() * crowdLevels.length)],
        lastUpdated: new Date().toISOString(),
        eta,
      })
    }
  })

  return vehicles
}

function generateStationUpdates(): StationUpdate[] {
  const updates: StationUpdate[] = []

  // Generate updates for major stations
  const majorStations = [
    { id: "dadar", name: "Dadar Station", lines: ["Western Line", "Central Line"] },
    { id: "bandra", name: "Bandra Station", lines: ["Western Line"] },
    { id: "andheri", name: "Andheri Station", lines: ["Western Line", "Metro Line 1"] },
    { id: "ghatkopar", name: "Ghatkopar Station", lines: ["Central Line", "Metro Line 1"] },
    { id: "csmt", name: "CSMT", lines: ["Central Line"] },
  ]

  majorStations.forEach((station) => {
    station.lines.forEach((line) => {
      const vehicleType = line.includes("Metro") ? "metro" : "train"
      const arrivalCount = Math.floor(Math.random() * 4) + 2

      const arrivals = []
      for (let i = 0; i < arrivalCount; i++) {
        const delay = Math.random() > 0.8 ? Math.floor(Math.random() * 10) + 1 : 0
        const crowdLevels: ("low" | "medium" | "high")[] = ["low", "medium", "high"]

        arrivals.push({
          vehicleId: `${vehicleType}-${Math.floor(Math.random() * 100)}`,
          destination:
            MUMBAI_LINES_DATA[line as keyof typeof MUMBAI_LINES_DATA].stations[
              Math.floor(Math.random() * MUMBAI_LINES_DATA[line as keyof typeof MUMBAI_LINES_DATA].stations.length)
            ],
          eta: (i + 1) * 4 + Math.floor(Math.random() * 3),
          delay,
          crowdLevel: crowdLevels[Math.floor(Math.random() * crowdLevels.length)],
          status: delay > 0 ? "delayed" : Math.random() > 0.95 ? "cancelled" : "on_time",
        })
      }

      // Generate alerts
      const alerts = []
      if (Math.random() > 0.7) {
        const alertTypes: ("delay" | "disruption" | "maintenance" | "crowding")[] = [
          "delay",
          "disruption",
          "maintenance",
          "crowding",
        ]
        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)]

        alerts.push({
          id: `alert-${Date.now()}-${Math.random()}`,
          type: alertType,
          message: getAlertMessage(alertType, station.name),
          severity: Math.random() > 0.7 ? "high" : Math.random() > 0.5 ? "medium" : "low",
          startTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          endTime:
            alertType === "maintenance" ? new Date(Date.now() + Math.random() * 7200000).toISOString() : undefined,
        })
      }

      updates.push({
        stationId: station.id,
        stationName: station.name,
        line,
        vehicleType,
        arrivals: arrivals.sort((a, b) => a.eta - b.eta),
        alerts,
      })
    })
  })

  return updates
}

function getAlertMessage(type: string, stationName: string): string {
  const messages = {
    delay: `Trains on this line are running 5-10 minutes late due to signal issues`,
    disruption: `Service disruption between ${stationName} and next station due to technical fault`,
    maintenance: `Planned maintenance work in progress. Expect delays`,
    crowding: `Heavy crowding expected during peak hours. Consider alternative routes`,
  }
  return messages[type as keyof typeof messages] || "Service update available"
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "vehicles"
    const lines = searchParams.get("lines")?.split(",")
    const stations = searchParams.get("stations")?.split(",")

    console.log("[v0] Real-time data request:", { type, lines, stations })

    // Simulate API processing time
    await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300))

    if (type === "vehicles") {
      const vehicles = generateVehiclePositions()
      const filteredVehicles = lines ? vehicles.filter((v) => lines.includes(v.line)) : vehicles

      return NextResponse.json({
        success: true,
        data: filteredVehicles,
        metadata: {
          timestamp: new Date().toISOString(),
          totalVehicles: filteredVehicles.length,
          dataSource: "GTFS-RT Mock",
          updateInterval: 30, // seconds
        },
      })
    }

    if (type === "stations") {
      const stationUpdates = generateStationUpdates()
      const filteredUpdates = stations ? stationUpdates.filter((s) => stations.includes(s.stationId)) : stationUpdates

      return NextResponse.json({
        success: true,
        data: filteredUpdates,
        metadata: {
          timestamp: new Date().toISOString(),
          totalStations: filteredUpdates.length,
          dataSource: "GTFS-RT Mock",
          updateInterval: 60, // seconds
        },
      })
    }

    return NextResponse.json({ error: 'Invalid type parameter. Use "vehicles" or "stations"' }, { status: 400 })
  } catch (error) {
    console.error("[v0] Real-time API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RealtimeRequest = await request.json()

    console.log("[v0] Real-time POST request:", body)

    // Simulate API processing time
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200))

    const vehicles = generateVehiclePositions()
    const stationUpdates = generateStationUpdates()

    // Filter based on request parameters
    const filteredVehicles = body.lines ? vehicles.filter((v) => body.lines!.includes(v.line)) : vehicles

    const filteredStations = body.stations
      ? stationUpdates.filter((s) => body.stations!.includes(s.stationId))
      : stationUpdates

    return NextResponse.json({
      success: true,
      vehicles: filteredVehicles,
      stations: filteredStations,
      metadata: {
        timestamp: new Date().toISOString(),
        vehicleCount: filteredVehicles.length,
        stationCount: filteredStations.length,
        dataSource: "GTFS-RT Mock",
        updateInterval: 30,
      },
    })
  } catch (error) {
    console.error("[v0] Real-time POST API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
