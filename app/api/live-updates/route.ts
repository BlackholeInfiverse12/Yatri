import { type NextRequest, NextResponse } from "next/server"

interface LiveUpdate {
  id: string
  title: string
  description: string
  source: "Mumbai Local" | "BMC" | "Western Railway" | "Central Railway" | "Harbor Line" | "Traffic Police"
  category: "delay" | "maintenance" | "notice" | "emergency" | "general"
  timestamp: string
  severity: "low" | "medium" | "high"
  affectedLines?: string[]
  affectedStations?: string[]
}

// Mock live updates data - in a real app, this would fetch from actual news APIs
const MOCK_UPDATES: LiveUpdate[] = [
  {
    id: "1",
    title: "Western Railway Services Delayed",
    description:
      "Due to technical issues at Andheri station, WR services are running 10-15 minutes late. Passengers are advised to plan accordingly.",
    source: "Western Railway",
    category: "delay",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    severity: "medium",
    affectedLines: ["WR"],
    affectedStations: ["Andheri", "Jogeshwari", "Goregaon"],
  },
  {
    id: "2",
    title: "BMC Issues Monsoon Advisory",
    description:
      "BMC advises commuters to avoid low-lying areas during high tide. Waterlogging expected at Sion, Kurla, and Bandra stations.",
    source: "BMC",
    category: "notice",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    severity: "high",
    affectedStations: ["Sion", "Kurla", "Bandra"],
  },
  {
    id: "3",
    title: "New Fast Train Service Introduced",
    description:
      "Central Railway introduces new fast train service between CSMT and Thane during peak hours. Service starts from Monday.",
    source: "Central Railway",
    category: "general",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    severity: "low",
    affectedLines: ["CR"],
    affectedStations: ["CSMT", "Dadar", "Thane"],
  },
  {
    id: "4",
    title: "Platform Maintenance at Churchgate",
    description:
      "Platform 1 at Churchgate station will be under maintenance from 11 PM to 5 AM. Trains will operate from platforms 2-6.",
    source: "Western Railway",
    category: "maintenance",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    severity: "medium",
    affectedLines: ["WR"],
    affectedStations: ["Churchgate"],
  },
  {
    id: "5",
    title: "Harbor Line Running Smoothly",
    description: "All Harbor Line services are running on time. No delays reported between Panvel and CSMT route.",
    source: "Harbor Line",
    category: "general",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    severity: "low",
    affectedLines: ["CR-Harbor"],
  },
  {
    id: "6",
    title: "Traffic Diversion Near Bandra Station",
    description:
      "Due to road construction, traffic is diverted near Bandra station. Auto-rickshaw and taxi services may be affected.",
    source: "Traffic Police",
    category: "notice",
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 90 minutes ago
    severity: "medium",
    affectedStations: ["Bandra"],
  },
  {
    id: "7",
    title: "Emergency Services Alert",
    description: "Medical emergency at Dadar station resolved. Normal services resumed on both CR and WR lines.",
    source: "Mumbai Local",
    category: "emergency",
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 minutes ago
    severity: "high",
    affectedLines: ["CR", "WR"],
    affectedStations: ["Dadar"],
  },
  {
    id: "8",
    title: "Weekend Mega Block Schedule",
    description:
      "Mega block on CR main line this Sunday from 10:30 AM to 4:30 PM between Kurla and Thane. Bus services will be available.",
    source: "Central Railway",
    category: "maintenance",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    severity: "high",
    affectedLines: ["CR"],
    affectedStations: ["Kurla", "Ghatkopar", "Vikhroli", "Thane"],
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const source = searchParams.get("source")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    console.log("[v0] Fetching live updates:", { category, source, limit })

    let filteredUpdates = [...MOCK_UPDATES]

    // Filter by category if specified
    if (category && category !== "all") {
      filteredUpdates = filteredUpdates.filter((update) => update.category === category)
    }

    // Filter by source if specified
    if (source && source !== "all") {
      filteredUpdates = filteredUpdates.filter((update) => update.source === source)
    }

    // Sort by timestamp (newest first)
    filteredUpdates.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Limit results
    filteredUpdates = filteredUpdates.slice(0, limit)

    console.log("[v0] Returning", filteredUpdates.length, "live updates")

    return NextResponse.json({
      success: true,
      updates: filteredUpdates,
      total: filteredUpdates.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error fetching live updates:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch live updates",
        updates: [],
        total: 0,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // In a real app, this would allow submitting user reports or feedback
    const body = await request.json()

    console.log("[v0] Received update submission:", body)

    // Mock response for user-submitted updates
    return NextResponse.json({
      success: true,
      message: "Update submitted successfully",
      id: `user-${Date.now()}`,
    })
  } catch (error) {
    console.error("[v0] Error submitting update:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit update",
      },
      { status: 500 },
    )
  }
}
