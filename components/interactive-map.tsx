"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Route } from "@/components/route-results"
import { MUMBAI_STATIONS, LINE_SEQUENCES } from "@/lib/mumbai-railway-data"

// Leaflet types and imports (will be loaded dynamically)
declare global {
  interface Window {
    L: any
  }
}

interface MapProps {
  routes?: Route[]
  selectedRoute?: Route
  onRouteSelect?: (route: Route) => void
  center?: [number, number]
  zoom?: number
  className?: string
}

const MUMBAI_CENTER: [number, number] = [19.076, 72.8777]
const DEFAULT_ZOOM = 11

const TRANSPORT_COLORS = {
  train: "#3b82f6",
  bus: "#ef4444",
  metro: "#8b5cf6",
  monorail: "#10b981",
  walk: "#6b7280",
  auto: "#f59e0b",
}

const TRANSPORT_ICONS = {
  train: "🚆",
  bus: "🚌",
  metro: "🚇",
  monorail: "🚝",
  walk: "🚶",
  auto: "🛺",
}

// Mock coordinates for Mumbai locations
const LOCATION_COORDS: Record<string, [number, number]> = {
  CSMT: [18.9398, 72.8355],
  "Dadar Station": [19.0176, 72.8562],
  "Bandra Station": [19.0544, 72.8406],
  "Andheri Station": [19.1197, 72.8464],
  "Borivali Station": [19.2307, 72.8567],
  "Thane Station": [19.1972, 72.9568],
  "Churchgate Station": [18.9322, 72.8264],
  "BKC (Bandra Kurla Complex)": [19.0728, 72.8826],
  "Mumbai Airport T1": [19.0896, 72.8656],
  "Mumbai Airport T2": [19.0886, 72.8678],
  "Nearest Station": [19.05, 72.83],
  "Transfer Station": [19.06, 72.84],
  "Destination Station": [19.07, 72.85],
  "Direct Station": [19.04, 72.82],
  "Final Station": [19.08, 72.86],
  "Bus Stop": [19.045, 72.825],
  Junction: [19.055, 72.835],
  "Transfer Point": [19.075, 72.855],
}

function getCoordinates(locationName: string): [number, number] {
  // Try exact match first
  if (LOCATION_COORDS[locationName]) {
    return LOCATION_COORDS[locationName]
  }

  // Try partial match
  const partialMatch = Object.keys(LOCATION_COORDS).find(
    (key) =>
      key.toLowerCase().includes(locationName.toLowerCase()) || locationName.toLowerCase().includes(key.toLowerCase()),
  )

  if (partialMatch) {
    return LOCATION_COORDS[partialMatch]
  }

  // Return default Mumbai coordinates with some random offset
  const offset = Math.random() * 0.02 - 0.01
  return [MUMBAI_CENTER[0] + offset, MUMBAI_CENTER[1] + offset]
}

export function InteractiveMap({
  routes,
  selectedRoute,
  onRouteSelect,
  center = MUMBAI_CENTER,
  zoom = DEFAULT_ZOOM,
  className,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const routeLayersRef = useRef<any[]>([])
  const fixedLayersRef = useRef<any[]>([])
  const [currentZoom, setCurrentZoom] = useState(zoom)

  useEffect(() => {
    let mounted = true

    const initializeMap = async () => {
      try {
        // Load Leaflet dynamically
        if (!window.L) {
          // Create script and CSS link elements
          const script = document.createElement("script")
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          script.crossOrigin = ""

          const css = document.createElement("link")
          css.rel = "stylesheet"
          css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          css.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          css.crossOrigin = ""

          document.head.appendChild(css)
          document.body.appendChild(script)

          await new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = reject
          })
        }

        if (!mounted) return

        // Initialize map
        if (mapRef.current && !mapInstanceRef.current) {
          mapInstanceRef.current = window.L.map(mapRef.current, {
            scrollWheelZoom: true,
            doubleClickZoom: true,
            touchZoom: true,
            zoomControl: false, // We'll add custom zoom controls
          }).setView(center, zoom)

          mapInstanceRef.current.on("zoomend", () => {
            setCurrentZoom(mapInstanceRef.current.getZoom())
          })

          // Add OpenStreetMap tiles
          window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
            maxZoom: 19,
            minZoom: 8, // Set minimum zoom for Mumbai area
          }).addTo(mapInstanceRef.current)

          console.log("[v0] Map initialized successfully")
          setMapReady(true)
        }

        setIsLoading(false)
      } catch (err) {
        console.error("[v0] Error initializing map:", err)
        setError("Failed to load map")
        setIsLoading(false)
      }
    }
    initializeMap()

    return () => {
      mounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [center, zoom])

  // Draw fixed line polylines on map init (after map load)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.L || !LINE_SEQUENCES) return;

    const lineColors = {
      Western: "#3b82f6",
      Central: "#ef4444",
      Harbour: "#10b981",
      "Trans-Harbour": "#8b5cf6",
    };

    Object.entries(LINE_SEQUENCES).forEach(([line, codes]) => {
      const coords = codes.map(code => {
        const station = MUMBAI_STATIONS.find(s => s.code === code);
        return station?.coordinates || MUMBAI_CENTER;
      });

      if (coords.length > 1) {
        const polyline = window.L.polyline(coords, {
          color: lineColors[line as keyof typeof lineColors] || "#6b7280",
          weight: 4,
          opacity: 0.7,
        }).addTo(mapInstanceRef.current);

        fixedLayersRef.current.push(polyline);
      }
    });

    // Add station markers
    MUMBAI_STATIONS.forEach(station => {
      if (station.coordinates) {
        const marker = window.L.marker(station.coordinates, {
          icon: window.L.divIcon({
            html: `<div style="background: #3b82f6; color: white; border-radius: 50%; width: 12px; height: 12px; border: 2px solid white;"></div>`,
            className: "station-marker",
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          }),
        }).addTo(mapInstanceRef.current);

        marker.bindPopup(`<strong>${station.name}</strong><br/>Lines: ${station.lines.join(", ")}`);

        fixedLayersRef.current.push(marker);
      }
    });
  }, [mapReady]);

  // Route display useEffect
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.L) return

    // Clear only route layers (keep fixed line/station layers)
    routeLayersRef.current.forEach(layer => {
      if (layer instanceof window.L.Layer) mapInstanceRef.current.removeLayer(layer);
    });
    routeLayersRef.current = [];

    if (!routes || routes.length === 0) return

    routes.forEach((route, routeIndex) => {
      const isSelected = selectedRoute ? route.id === selectedRoute.id : routeIndex === 0
      const opacity = isSelected ? 1 : 0.3
      const weight = isSelected ? 6 : 3

      if (!route.steps) return

      const bounds = window.L.latLngBounds()

      // Add route polylines and markers
      route.steps.forEach((step: any, index: number) => {
        const fromCoords = getCoordinates(step.from);
        const toCoords = getCoordinates(step.to);

        if (!Array.isArray(fromCoords) || !Array.isArray(toCoords) || fromCoords.length < 2 || toCoords.length < 2) {
          console.warn("Invalid coordinates for step:", step);
          return;
        }

        bounds.extend(fromCoords)
        bounds.extend(toCoords)

        const polyline = window.L.polyline([fromCoords, toCoords], {
          color: step.line ? (TRANSPORT_COLORS[step.mode as keyof typeof TRANSPORT_COLORS] || "#6b7280") : TRANSPORT_COLORS[step.mode as keyof typeof TRANSPORT_COLORS] || "#6b7280",
          weight: weight,
          opacity: opacity,
          dashArray: isSelected ? undefined : "5, 10",
        }).addTo(mapInstanceRef.current)

        polyline.on("click", () => {
          onRouteSelect?.(route)
        })

        routeLayersRef.current.push(polyline)

        // Markers for selected
        if (isSelected) {
          const startMarker = window.L.marker(fromCoords, {
            icon: window.L.divIcon({
              html: `<div style="background: ${TRANSPORT_COLORS[step.mode as keyof typeof TRANSPORT_COLORS] || "#6b7280"}; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3);">${TRANSPORT_ICONS[step.mode as keyof typeof TRANSPORT_ICONS] || "📍"}</div>`,
              className: "custom-marker",
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            }),
          }).addTo(mapInstanceRef.current)

          startMarker.bindPopup(`
            <div style="font-family: system-ui; font-size: 14px;">
              <strong>${step.from}</strong><br/>
              ${step.line ? `<span style="color: ${TRANSPORT_COLORS[step.mode as keyof typeof TRANSPORT_COLORS] || "#6b7280"};">${step.line}</span><br/>` : ""}
              Duration: ${step.duration}min<br/>
              ${step.cost ? `Cost: ₹${step.cost}` : ""}
            </div>
          `)

          routeLayersRef.current.push(startMarker)

          if (index === route.steps.length - 1) {
            const endMarker = window.L.marker(toCoords, {
              icon: window.L.divIcon({
                html: `<div style="background: #ef4444; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3);">🎯</div>`,
                className: "custom-marker",
                iconSize: [28, 28],
                iconAnchor: [14, 14],
              }),
            }).addTo(mapInstanceRef.current)

            endMarker.bindPopup(`
              <div style="font-family: system-ui; font-size: 14px;">
                <strong>${step.to}</strong><br/>
                <span style="color: #ef4444;">Destination</span>
              </div>
            `)

            routeLayersRef.current.push(endMarker)
          }
        }
      })

      if (isSelected && bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] })
      }
    })

    console.log("[v0] Routes displayed on map, selected:", selectedRoute?.type || "first route")
  }, [routes, selectedRoute, onRouteSelect, mapReady])

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut()
    }
  }

  const handleFitBounds = () => {
    if (mapInstanceRef.current && routes && routes.length > 0) {
      const routeToShow = selectedRoute || routes[0]
      if (routeToShow && routeToShow.steps) {
        const bounds = window.L.latLngBounds()
        routeToShow.steps.forEach((step: any) => {
          bounds.extend(getCoordinates(step.from))
          bounds.extend(getCoordinates(step.to))
        })
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] })
        }
      }
    }
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="text-destructive mb-2">Map Error</div>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`overflow-hidden ${className || ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Route Map
          </CardTitle>
          {routes && routes.length > 1 && (
            <div className="flex gap-2">
              {routes.map((route: any) => (
                <Button
                  key={route.id}
                  variant={selectedRoute?.id === route.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onRouteSelect?.(route)}
                  className="text-xs"
                >
                  {route.type === "fastest" ? "Fastest" : route.type === "fewest-transfers" ? "Fewest" : "Cheapest"}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          <div ref={mapRef} className="w-full h-full bg-muted" style={{ minHeight: "500px" }} />

          <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleZoomIn}
              className="w-10 h-10 p-0 shadow-lg"
              disabled={currentZoom >= 19}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleZoomOut}
              className="w-10 h-10 p-0 shadow-lg"
              disabled={currentZoom <= 8}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleFitBounds}
              className="w-10 h-10 p-0 shadow-lg"
              disabled={!routes || routes.length === 0}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
          {!isLoading && !routes && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Search for routes to see them on the map</p>
              </div>
            </div>
          )}
        </div>

        {selectedRoute && selectedRoute.steps && (
          <div className="p-4 border-t bg-card">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Route Legend</h4>
              <Badge variant="outline">
                {selectedRoute.totalDuration}min • {selectedRoute.transfers} transfers
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(TRANSPORT_COLORS).map(([mode, color]) => {
                const hasMode = selectedRoute.steps.some((step: any) => step.mode === mode)
                if (!hasMode) return null

                return (
                  <div key={mode} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="capitalize">{mode}</span>
                  </div>
                )
              })}
            </div>
            {routes && routes.length > 1 && (
              <p className="text-xs text-muted-foreground mt-2">Click on route lines to switch between options</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
