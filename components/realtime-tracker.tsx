"use client"

import { useState, useEffect, useRef } from "react"
import { Train, AlertTriangle, Users, MapPin, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TransportIcon } from "@/components/transport-icons"

interface VehiclePosition {
  id: string
  line: string
  vehicleType: "train" | "bus" | "metro" | "monorail"
  position: {
    lat: number
    lng: number
  }
  heading: number
  speed: number
  status: "on_time" | "delayed" | "early" | "stopped"
  delay: number
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
    eta: number
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

interface RealtimeTrackerProps {
  lines?: string[]
  stations?: string[]
  onVehicleUpdate?: (vehicles: VehiclePosition[]) => void
}

const STATUS_COLORS = {
  on_time: "bg-green-100 text-green-700 border-green-200",
  delayed: "bg-red-100 text-red-700 border-red-200",
  early: "bg-blue-100 text-blue-700 border-blue-200",
  stopped: "bg-gray-100 text-gray-700 border-gray-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
}

const CROWD_COLORS = {
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-red-600",
}

const ALERT_COLORS = {
  low: "bg-blue-50 border-blue-200 text-blue-800",
  medium: "bg-yellow-50 border-yellow-200 text-yellow-800",
  high: "bg-red-50 border-red-200 text-red-800",
}

export function RealtimeTracker({ lines, stations, onVehicleUpdate }: RealtimeTrackerProps) {
  const [vehicles, setVehicles] = useState<VehiclePosition[]>([])
  const [stationUpdates, setStationUpdates] = useState<StationUpdate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchRealtimeData = async () => {
    try {
      setError(null)

      const response = await fetch("/api/realtime", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lines,
          stations,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch real-time data")
      }

      const data = await response.json()

      if (data.success) {
        setVehicles(data.vehicles || [])
        setStationUpdates(data.stations || [])
        setLastUpdated(new Date())
        onVehicleUpdate?.(data.vehicles || [])
        console.log(
          "[v0] Real-time data updated:",
          data.vehicles?.length,
          "vehicles,",
          data.stations?.length,
          "stations",
        )
      } else {
        throw new Error(data.error || "Failed to fetch data")
      }
    } catch (err) {
      console.error("[v0] Real-time fetch error:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  const startPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(fetchRealtimeData, 30000) // Update every 30 seconds
  }

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    fetchRealtimeData()
    startPolling()

    return () => stopPolling()
  }, [lines, stations])

  const formatTime = (minutes: number): string => {
    if (minutes < 1) return "Now"
    if (minutes === 1) return "1 min"
    return `${minutes} mins`
  }

  const getStatusText = (status: string): string => {
    const statusMap = {
      on_time: "On Time",
      delayed: "Delayed",
      early: "Early",
      stopped: "Stopped",
      cancelled: "Cancelled",
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <div className="text-destructive mb-2">Real-time Data Error</div>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchRealtimeData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Train className="h-5 w-5 text-primary" />
              Live Tracking
            </CardTitle>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">Updated {lastUpdated.toLocaleTimeString()}</span>
              )}
              <Button onClick={fetchRealtimeData} variant="outline" size="sm" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">{vehicles.length}</div>
              <div className="text-xs text-muted-foreground">Active Vehicles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {vehicles.filter((v) => v.status === "delayed").length}
              </div>
              <div className="text-xs text-muted-foreground">Delayed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Station Updates */}
      {stationUpdates.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Station Updates</h3>
          {stationUpdates.map((station) => (
            <Card key={`${station.stationId}-${station.line}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TransportIcon type={station.vehicleType} className="h-4 w-4" />
                  {station.stationName}
                  <Badge variant="outline" className="text-xs">
                    {station.line}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Arrivals */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Next Arrivals</h4>
                  <div className="space-y-2">
                    {station.arrivals.slice(0, 3).map((arrival, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">{arrival.destination}</span>
                          <Badge className={`text-xs ${STATUS_COLORS[arrival.status]}`}>
                            {getStatusText(arrival.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{formatTime(arrival.eta)}</span>
                          {arrival.delay > 0 && <span className="text-red-600 text-xs">+{arrival.delay}min</span>}
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span className={`text-xs ${CROWD_COLORS[arrival.crowdLevel]}`}>{arrival.crowdLevel}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alerts */}
                {station.alerts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Service Alerts</h4>
                    <div className="space-y-2">
                      {station.alerts.map((alert) => (
                        <div key={alert.id} className={`p-3 rounded-md border ${ALERT_COLORS[alert.severity]}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium capitalize">{alert.type}</span>
                            <Badge variant="outline" className="text-xs">
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm">{alert.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vehicle List */}
      {vehicles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Live Vehicles</h3>
          <div className="grid gap-3">
            {vehicles.slice(0, 6).map((vehicle) => (
              <Card key={vehicle.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TransportIcon type={vehicle.vehicleType} className="h-5 w-5" />
                    <div>
                      <div className="font-medium text-sm">{vehicle.line}</div>
                      <div className="text-xs text-muted-foreground">→ {vehicle.destination}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${STATUS_COLORS[vehicle.status]}`}>
                      {getStatusText(vehicle.status)}
                    </Badge>
                    {vehicle.delay > 0 && <span className="text-xs text-red-600">+{vehicle.delay}min</span>}
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span className={`text-xs ${CROWD_COLORS[vehicle.crowdLevel]}`}>{vehicle.crowdLevel}</span>
                    </div>
                  </div>
                </div>
                {vehicle.eta.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <div className="text-xs text-muted-foreground mb-1">Next stops:</div>
                    <div className="flex gap-3 text-xs">
                      {vehicle.eta.slice(0, 2).map((stop, index) => (
                        <span key={index}>
                          {stop.station} ({formatTime(stop.minutes)})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {isLoading && vehicles.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
            <div className="text-muted-foreground">Loading real-time data...</div>
          </CardContent>
        </Card>
      )}

      {!isLoading && vehicles.length === 0 && !error && (
        <Card>
          <CardContent className="p-6 text-center">
            <Train className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <div className="text-muted-foreground">No vehicles currently tracked</div>
            <p className="text-sm text-muted-foreground mt-1">Real-time data will appear here when available</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
