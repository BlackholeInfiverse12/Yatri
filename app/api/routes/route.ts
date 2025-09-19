import { NextRequest, NextResponse } from "next/server"
import { MUMBAI_STATIONS, findOptimalRoutes, calculateFare } from "@/lib/mumbai-railway-data"

interface RouteRequest {
  origin: string
  destination: string
  maxTransfers: number
  timeBuffer: number
  departureTime?: string
}

interface GTFSRoute {
  id: string
  type: "fastest" | "fewest-transfers" | "cheapest"
  totalDuration: number
  totalCost: number
  transfers: number
  walkingDistance: number
  steps: Array<{
    mode: "train" | "transfer" | "walk" // added transfer
    line?: string
    from: string
    to: string
    duration: number
    distance?: number
    cost?: number
    nextTrain?: {
      number: string
      name: string
      type: "Fast" | "Slow" | "Express"
      departureTime: number // minutes from midnight
    }
  }>
  path?: string[] // station codes for map
  delay?: number
  crowdLevel?: "low" | "medium" | "high"
  confidence: number
}

function findNearestStation(location: string): string | null {
  const station = MUMBAI_STATIONS.find(s => s.name.toLowerCase().includes(location.toLowerCase()) || location.toLowerCase().includes(s.name.toLowerCase().split(" ")[0]));
  return station ? station.code : null;
}

function addWalkingSteps(steps: any[], origin: string, destination: string) {
  const originStation = findNearestStation(origin);
  if (originStation && origin !== originStation) {
    steps.unshift({
      mode: "walk",
      from: origin,
      to: originStation,
      duration: 5,
      distance: 500,
    });
  }

  const destStation = findNearestStation(destination);
  if (destStation && destination !== destStation) {
    steps.push({
      mode: "walk",
      from: destStation,
      to: destination,
      duration: 5,
      distance: 500,
    });
  }

  return steps;
}


function calculateOptimalRoutes(request: RouteRequest): GTFSRoute[] {
  const { origin, destination, maxTransfers, timeBuffer } = request
  const currentTime = new Date(); // Use current time for next trains

  console.log("[v0] Calculating routes for:", { origin, destination, maxTransfers, timeBuffer })

  // Find nearest stations
  const originStation = findNearestStation(origin) || origin;
  const destinationStation = findNearestStation(destination) || destination;

  // Use enhanced lib function
  const libRoutes = findOptimalRoutes(originStation, destinationStation, maxTransfers, currentTime);

  if (libRoutes.length === 0) {
    // Fallback mock
    return [{
      id: "fallback",
      type: "fastest",
      totalDuration: 45,
      totalCost: 25,
      transfers: 1,
      walkingDistance: 1000,
      steps: [
        { mode: "walk", from: origin, to: originStation, duration: 5, distance: 500 },
        { mode: "train", line: "Western Line", from: originStation, to: destinationStation, duration: 35, cost: 20 },
        { mode: "walk", from: destinationStation, to: destination, duration: 5, distance: 500 },
      ],
      confidence: 0.5,
    }];
  }

  const routes: GTFSRoute[] = libRoutes.map((libRoute) => {
    let steps = addWalkingSteps(libRoute.steps, origin, destination);
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    const totalCost = libRoute.fare; // Use calculated fare for whole route
    const walkingDistance = steps.filter((s) => s.mode === "walk").reduce((sum, s) => sum + (s.distance || 0), 0);

    return {
      id: libRoute.type + "-" + Date.now(),
      type: libRoute.type,
      totalDuration,
      totalCost,
      transfers: libRoute.transfers,
      walkingDistance,
      steps,
      path: libRoute.path,
      crowdLevel: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as "low" | "medium" | "high",
      confidence: 0.9,
    };
  });

  // Sort and apply buffer if needed
  routes.sort((a, b) => {
    if (a.type === "fastest") return -1;
    return a.totalDuration - b.totalDuration;
  });

  const fastest = routes.find(r => r.type === "fastest") || routes[0];
  routes.forEach((route) => {
    if (route.type !== "fastest") {
      route.totalDuration = Math.floor(fastest.totalDuration * (1 + parseInt(timeBuffer) / 100));
    }
  });

  return routes.filter((route) => route.transfers <= maxTransfers);
}

export async function POST(request: NextRequest) {
  try {
    const body: RouteRequest = await request.json()

    // Validate request
    if (!body.origin || !body.destination) {
      return NextResponse.json({ error: "Origin and destination are required" }, { status: 400 })
    }

    if (body.maxTransfers < 0 || body.maxTransfers > 3) {
      return NextResponse.json({ error: "Max transfers must be between 0 and 3" }, { status: 400 })
    }

    console.log("[v0] Processing route request:", body)

    // Simulate API processing time
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700))

    // Calculate optimal routes
    const routes = calculateOptimalRoutes(body)

    // Apply time buffer filter (if needed, but already applied)
    const filteredRoutes = routes;

    console.log("[v0] Returning", filteredRoutes.length, "optimized routes")

    return NextResponse.json({
      success: true,
      routes: filteredRoutes,
      metadata: {
        searchTime: Date.now(),
        totalOptions: routes.length,
        filteredOptions: filteredRoutes.length,
        criteria: {
          maxTransfers: body.maxTransfers,
          timeBuffer: body.timeBuffer + "%",
        },
      },
    })
  } catch (error) {
    console.error("[v0] Route API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const origin = searchParams.get("origin")
  const destination = searchParams.get("destination")
  const maxTransfers = Number.parseInt(searchParams.get("maxTransfers") || "2")
  const timeBuffer = Number.parseInt(searchParams.get("timeBuffer") || "10")

  if (!origin || !destination) {
    return NextResponse.json({ error: "Origin and destination query parameters are required" }, { status: 400 })
  }

  // Convert GET to POST format
  const routeRequest: RouteRequest = {
    origin,
    destination,
    maxTransfers,
    timeBuffer,
  }

  return POST(
    new NextRequest(request.url, {
      method: "POST",
      body: JSON.stringify(routeRequest),
      headers: { "Content-Type": "application/json" },
    }),
  )
}
