"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, ZoomIn, ZoomOut, Maximize2, Play, Pause, RotateCcw, Gauge } from "lucide-react"
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

  // Return default Mumbai coordinates (no random offset)
  return MUMBAI_CENTER
}

function getStationCoordinates(code: string): [number, number] | null {
  const station = MUMBAI_STATIONS.find(s => s.code === code);
  return station?.coordinates || null;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`
  }
  return `${meters}m`
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

  // Train simulation state
  const trainMarkerRef = useRef<any>(null)
  const animationRef = useRef<any>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(1) // 1x speed
  const [currentRoutePath, setCurrentRoutePath] = useState<[number, number][]>([])

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
            if (mapInstanceRef.current) {
              setCurrentZoom(mapInstanceRef.current.getZoom())
            }
          })

          // Add cleaner tile layer (minimal roads, focus on landmarks)
          window.L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors, Humanitarian map style",
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

  // Draw fixed line polylines on map init (after map load) - only when no routes are present
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.L || !LINE_SEQUENCES) return;

    // Clear existing fixed layers
    fixedLayersRef.current.forEach(layer => {
      if (layer instanceof window.L.Layer) mapInstanceRef.current.removeLayer(layer);
    });
    fixedLayersRef.current = [];

    // Only show all lines and stations when no routes are being displayed
    if (!routes || routes.length === 0) {
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
        }).filter(c => c && Array.isArray(c) && c.length === 2) as [number, number][];

        if (coords.length > 1 && mapInstanceRef.current) {
          const polyline = window.L.polyline(coords, {
            color: lineColors[line as keyof typeof lineColors] || "#6b7280",
            weight: 4,
            opacity: 0.7,
          }).addTo(mapInstanceRef.current);

          fixedLayersRef.current.push(polyline);
        }
      });

      // Add all station markers only when no routes are present
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
    }
  }, [mapReady, routes]);

  // Route display useEffect
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.L || !routes || routes.length === 0) return

    // Clear all layers (both route and fixed layers when routes are present)
    routeLayersRef.current.forEach(layer => {
      if (layer instanceof window.L.Layer) mapInstanceRef.current.removeLayer(layer);
    });
    routeLayersRef.current = [];

    // Clear fixed layers when routes are present to hide all railway lines and stations
    if (routes && routes.length > 0) {
      fixedLayersRef.current.forEach(layer => {
        if (layer instanceof window.L.Layer) mapInstanceRef.current.removeLayer(layer);
      });
      fixedLayersRef.current = [];
    }

    if (!routes || routes.length === 0) return

    // Get all unique stations from railway routes only
    const routeStationCodes = new Set<string>();
    const railwayRoutes = routes.filter(route =>
      route.steps && route.steps.some((step: any) => step.mode === "train")
    );

    railwayRoutes.forEach(route => {
      if (route.path) {
        route.path.forEach(code => routeStationCodes.add(code));
      } else {
        route.steps.forEach((step: any) => {
          if (step.mode === "train") { // Only include train/railway steps
            const fromStation = MUMBAI_STATIONS.find(s => s.name === step.from || s.code === step.from);
            const toStation = MUMBAI_STATIONS.find(s => s.name === step.to || s.code === step.to);
            if (fromStation) routeStationCodes.add(fromStation.code);
            if (toStation) routeStationCodes.add(toStation.code);
          }
        });
      }
    });

    // Add only stations that are part of the route
    routeStationCodes.forEach(code => {
      const station = MUMBAI_STATIONS.find(s => s.code === code);
      if (station && station.coordinates) {
        if (!mapInstanceRef.current) return;

        const marker = window.L.marker(station.coordinates, {
          icon: window.L.divIcon({
            html: `<div style="background: #1e40af; color: white; border-radius: 50%; width: 16px; height: 16px; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3); font-size: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold;">●</div>`,
            className: "route-station-marker",
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          }),
        }).addTo(mapInstanceRef.current);

        marker.bindPopup(`<div style="font-family: Arial, sans-serif;"><strong style="color: #1e40af; font-size: 14px;">${station.name}</strong><br/><span style="color: #666;">Lines: ${station.lines.join(", ")}</span></div>`);
        routeLayersRef.current.push(marker);
      }
    });

    const bounds = window.L.latLngBounds([]);

    // Process only railway routes (already filtered above)
    if (railwayRoutes.length === 0) return;

    // Determine which route should be used for simulation
    const simulationRoute = selectedRoute || railwayRoutes[0]
    const simulationRouteIndex = selectedRoute ? railwayRoutes.findIndex(r => r.id === selectedRoute.id) : 0

    railwayRoutes.forEach((route, routeIndex) => {
      const isSelected = selectedRoute ? route.id === selectedRoute.id : routeIndex === 0
      const opacity = isSelected ? 1 : 0.3
      const weight = isSelected ? 8 : 5

      if (!route.steps) return

      // Define route color for consistent use
      const routeColor = route.type === "fastest" ? "#2563eb" : route.type === "fewest-transfers" ? "#1d4ed8" : "#1e40af";

      // Use path for accurate polyline if available
      if (route.path && route.path.length > 1) {
        const pathCoords: [number, number][] = route.path.map(code => {
          const coords = getStationCoordinates(code)
          return coords || MUMBAI_CENTER
        }).filter((coords, index, arr) => index === 0 || coords[0] !== arr[index - 1][0] || coords[1] !== arr[index - 1][1]) // remove duplicates
        if (pathCoords.length > 1) {
          pathCoords.forEach(coord => bounds.extend(coord));

          // Store route path for animation if this is the route used for simulation
          if (route.id === simulationRoute.id) {
            setCurrentRoutePath(pathCoords)
            console.log("[v0] Set currentRoutePath for simulation:", pathCoords.length, "points")
          }

          if (!mapInstanceRef.current) return;

          const polyline = window.L.polyline(pathCoords, {
            color: routeColor,
            weight: weight,
            opacity: opacity,
            dashArray: isSelected ? undefined : "5, 10",
          }).addTo(mapInstanceRef.current);

          polyline.bindTooltip(`
            <div style="font-family: Arial, sans-serif; font-weight: bold; font-size: 14px; color: ${routeColor};">${route.type.toUpperCase()} Route</div>
            <div style="color: #333;">⏱️ ${formatDuration(route.totalDuration)}</div>
            <div style="color: #666;">🔄 ${route.transfers} transfers</div>
            <div style="color: #888;">${route.walkingDistance ? `🚶 ${formatDistance(route.walkingDistance)} walk` : ''}</div>
          `);

          polyline.on("click", () => {
            onRouteSelect?.(route)
          });

          routeLayersRef.current.push(polyline);
        }
      } else {
        // Fallback to step coords, only show train/railway steps
        const stepCoords: [number, number][] = []
        route.steps.forEach((step: any) => {
          if (step.mode !== "train") return; // Only show railway/train routes
          const fromCoords = getStationCoordinates(step.from) || getCoordinates(step.from);
          const toCoords = getStationCoordinates(step.to) || getCoordinates(step.to);
          if (Array.isArray(fromCoords) && Array.isArray(toCoords) && fromCoords.length >= 2 && toCoords.length >= 2 && (fromCoords[0] !== toCoords[0] || fromCoords[1] !== toCoords[1])) {
            bounds.extend(fromCoords);
            bounds.extend(toCoords);

            // Collect coordinates for simulation path
            if (!stepCoords.find(coord => coord[0] === fromCoords[0] && coord[1] === fromCoords[1])) {
              stepCoords.push(fromCoords)
            }
            if (!stepCoords.find(coord => coord[0] === toCoords[0] && coord[1] === toCoords[1])) {
              stepCoords.push(toCoords)
            }

            if (!mapInstanceRef.current) return;

            const polyline = window.L.polyline([fromCoords, toCoords], {
              color: routeColor, // Use the consistent route color
              weight: weight,
              opacity: opacity,
              dashArray: isSelected ? undefined : "5, 10",
            }).addTo(mapInstanceRef.current);

            polyline.on("click", () => {
              onRouteSelect?.(route)
            });

            routeLayersRef.current.push(polyline);
          }
        });

        // Store step coordinates for animation if this is the route used for simulation
        if (route.id === simulationRoute.id && stepCoords.length > 0) {
          setCurrentRoutePath(stepCoords)
          console.log("[v0] Set currentRoutePath from steps for simulation:", stepCoords.length, "points")
        }
      }

      // Markers for origin and destination - show for primary route
      if (isSelected || routeIndex === 0) {
        const firstStep = route.steps[0];
        const lastStep = route.steps[route.steps.length - 1];

        // Enhanced coordinate lookup with multiple fallback methods
        let originCoords = getStationCoordinates(firstStep.from);
        if (!originCoords) {
          // Try exact name match
          let station = MUMBAI_STATIONS.find(s => s.name === firstStep.from);
          if (!station) {
            // Try partial name match
            station = MUMBAI_STATIONS.find(s =>
              s.name.toLowerCase().includes(firstStep.from.toLowerCase()) ||
              firstStep.from.toLowerCase().includes(s.name.toLowerCase())
            );
          }
          if (!station) {
            // Try code match
            station = MUMBAI_STATIONS.find(s => s.code === firstStep.from);
          }
          originCoords = station?.coordinates || null;
        }
        if (!originCoords) {
          // Fallback: use first station from path if available
          if (route.path && route.path.length > 0) {
            originCoords = getStationCoordinates(route.path[0]);
          }
        }
        if (!originCoords) {
          originCoords = getCoordinates(firstStep.from);
        }

        let destCoords = getStationCoordinates(lastStep.to);
        if (!destCoords) {
          // Try exact name match
          let station = MUMBAI_STATIONS.find(s => s.name === lastStep.to);
          if (!station) {
            // Try partial name match
            station = MUMBAI_STATIONS.find(s =>
              s.name.toLowerCase().includes(lastStep.to.toLowerCase()) ||
              lastStep.to.toLowerCase().includes(s.name.toLowerCase())
            );
          }
          if (!station) {
            // Try code match
            station = MUMBAI_STATIONS.find(s => s.code === lastStep.to);
          }
          destCoords = station?.coordinates || null;
        }
        if (!destCoords) {
          // Fallback: use last station from path if available
          if (route.path && route.path.length > 0) {
            destCoords = getStationCoordinates(route.path[route.path.length - 1]);
          }
        }
        if (!destCoords) {
          destCoords = getCoordinates(lastStep.to);
        }

        if (Array.isArray(originCoords) && originCoords.length >= 2) {
          console.log("[v0] Creating start marker at:", originCoords, "for station:", firstStep.from);
          if (!mapInstanceRef.current) return;

          const startSvg = `
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <style>
                  .start-circle { fill: #22c55e; stroke: #ffffff; stroke-width: 3; }
                  .start-icon { fill: #ffffff; }
                </style>
              </defs>
              <circle cx="20" cy="20" r="18" class="start-circle"/>
              <path d="M12 16 L20 10 L28 16 L28 24 L20 30 L12 24 Z" class="start-icon"/>
              <circle cx="20" cy="20" r="3" fill="#ffffff"/>
            </svg>
          `

          const startMarker = window.L.marker(originCoords, {
            icon: window.L.divIcon({
              html: `<div style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">${startSvg}</div>`,
              className: "start-marker",
              iconSize: [40, 40],
              iconAnchor: [20, 20],
            }),
          }).addTo(mapInstanceRef.current);

          startMarker.bindPopup(`<strong style="color: #22c55e; font-size: 16px;">🚆 START: ${firstStep.from}</strong>`);
          routeLayersRef.current.push(startMarker);
          bounds.extend(originCoords);
          console.log("[v0] Start marker added successfully");
        } else {
          console.log("[v0] Could not create start marker - invalid coordinates:", originCoords, "for station:", firstStep.from);
        }

        if (Array.isArray(destCoords) && destCoords.length >= 2) {
          console.log("[v0] Creating destination marker at:", destCoords, "for station:", lastStep.to);
          if (!mapInstanceRef.current) return;

          const destinationSvg = `
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <style>
                  .dest-circle { fill: #dc2626; stroke: #ffffff; stroke-width: 3; }
                  .dest-icon { fill: #ffffff; }
                </style>
              </defs>
              <circle cx="20" cy="20" r="18" class="dest-circle"/>
              <rect x="16" y="12" width="8" height="8" rx="1" class="dest-icon"/>
              <rect x="18" y="14" width="4" height="4" rx="0.5" fill="#dc2626"/>
              <circle cx="20" cy="24" r="2" class="dest-icon"/>
              <rect x="19" y="22" width="2" height="6" class="dest-icon"/>
            </svg>
          `

          const endMarker = window.L.marker(destCoords, {
            icon: window.L.divIcon({
              html: `<div style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">${destinationSvg}</div>`,
              className: "destination-marker",
              iconSize: [40, 40],
              iconAnchor: [20, 20],
            }),
          }).addTo(mapInstanceRef.current);

          endMarker.bindPopup(`<strong style="color: #dc2626; font-size: 16px;">🎯 DESTINATION: ${lastStep.to}</strong>`);
          routeLayersRef.current.push(endMarker);
          bounds.extend(destCoords);
          console.log("[v0] Destination marker added successfully");
        } else {
          console.log("[v0] Could not create destination marker - invalid coordinates:", destCoords, "for station:", lastStep.to);
        }

        // Add transfer markers
        route.steps.forEach((step: any) => {
          if (step.mode === "transfer") {
            // Try to find station coordinates by code first, then by name
            let coords = getStationCoordinates(step.from);
            if (!coords) {
              const station = MUMBAI_STATIONS.find(s => s.name === step.from || s.code === step.from);
              coords = station?.coordinates || null;
            }
            if (!coords) {
              coords = getCoordinates(step.from);
            }
            if (!coords) {
              coords = MUMBAI_CENTER;
            }
            if (!mapInstanceRef.current) return;

            const transferSvg = `
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <style>
                    .transfer-circle { fill: #ea580c; stroke: #ffffff; stroke-width: 2; }
                    .transfer-arrow { fill: #ffffff; }
                  </style>
                </defs>
                <circle cx="12" cy="12" r="10" class="transfer-circle"/>
                <path d="M8 12 L12 8 L16 12 L12 16 Z" class="transfer-arrow"/>
              </svg>
            `

            const marker = window.L.marker(coords, {
              icon: window.L.divIcon({
                html: `<div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">${transferSvg}</div>`,
                className: "transfer-marker",
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              }),
            }).addTo(mapInstanceRef.current);

            marker.bindPopup(`<div style="font-family: Arial, sans-serif;"><strong style="color: #ea580c; font-size: 14px;">🔄 TRANSFER POINT</strong><br/><span style="color: #666;">${step.from}</span><br/><span style="color: #888;">${formatDuration(step.duration)} transfer time</span></div>`);
            routeLayersRef.current.push(marker);
            bounds.extend(coords);
          }
        });
      }

    })

    // Fit bounds to show all routes, with preference for selected route
    if (bounds.isValid() && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] })
    }

    console.log("[v0] Routes displayed on map, selected:", selectedRoute?.type || "first route")
  }, [routes, selectedRoute, onRouteSelect, mapReady])

  const handleZoomIn = () => {
    if (mapInstanceRef.current && mapReady) {
      mapInstanceRef.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (mapInstanceRef.current && mapReady) {
      mapInstanceRef.current.zoomOut()
    }
  }

  const handleFitBounds = () => {
    if (mapInstanceRef.current && mapReady && routes && routes.length > 0) {
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

  // Train simulation functions
  const createTrainMarker = (position: [number, number]) => {
    if (!mapInstanceRef.current || !window.L) return null

    // Create a more realistic train SVG icon
    const trainSvg = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .train-body { fill: #dc2626; stroke: #ffffff; stroke-width: 1; }
            .train-window { fill: #ffffff; stroke: #374151; stroke-width: 0.5; }
            .train-wheel { fill: #374151; }
            .train-connector { fill: #6b7280; }
            @keyframes pulse-train {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
            .train-icon { animation: pulse-train 1s infinite; }
          </style>
        </defs>

        <!-- Train body -->
        <rect x="4" y="12" width="20" height="8" rx="2" class="train-body"/>

        <!-- Train cabin -->
        <rect x="2" y="10" width="6" height="6" rx="1" class="train-body"/>
        <rect x="24" y="10" width="6" height="6" rx="1" class="train-body"/>

        <!-- Windows -->
        <rect x="6" y="14" width="3" height="4" rx="0.5" class="train-window"/>
        <rect x="10" y="14" width="3" height="4" rx="0.5" class="train-window"/>
        <rect x="14" y="14" width="3" height="4" rx="0.5" class="train-window"/>
        <rect x="18" y="14" width="3" height="4" rx="0.5" class="train-window"/>

        <!-- Wheels -->
        <circle cx="6" cy="22" r="2" class="train-wheel"/>
        <circle cx="12" cy="22" r="2" class="train-wheel"/>
        <circle cx="18" cy="22" r="2" class="train-wheel"/>
        <circle cx="24" cy="22" r="2" class="train-wheel"/>

        <!-- Wheel connectors -->
        <rect x="5" y="20" width="14" height="1" class="train-connector"/>
        <rect x="19" y="20" width="6" height="1" class="train-connector"/>

        <!-- Front coupling -->
        <circle cx="1" cy="13" r="1" class="train-connector"/>
        <circle cx="30" cy="13" r="1" class="train-connector"/>
      </svg>
    `

    return window.L.marker(position, {
      icon: window.L.divIcon({
        html: `<div class="train-icon" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">${trainSvg}</div>`,
        className: "train-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
    }).addTo(mapInstanceRef.current)
  }

  const startTrainAnimation = () => {
    const simulationRoute = selectedRoute || (routes && routes.length > 0 ? routes[0] : null)
    if (!simulationRoute || !currentRoutePath.length || !mapInstanceRef.current) {
      console.log("[v0] Cannot start animation:", {
        simulationRoute: !!simulationRoute,
        currentRoutePathLength: currentRoutePath.length,
        mapReady: !!mapInstanceRef.current
      })
      return
    }

    setIsAnimating(true)
    const totalDuration = simulationRoute.totalDuration * 60 * 1000 // Convert to milliseconds
    const animationDuration = totalDuration / animationSpeed
    const startTime = Date.now()
    console.log("[v0] Starting train animation for route:", simulationRoute.type, "duration:", totalDuration, "ms")

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / animationDuration, 1)
      setAnimationProgress(progress)

      if (progress < 1) {
        // Calculate current position along the path
        const totalDistance = currentRoutePath.length - 1
        const currentSegment = progress * totalDistance
        const segmentIndex = Math.floor(currentSegment)
        const segmentProgress = currentSegment - segmentIndex

        if (segmentIndex < currentRoutePath.length - 1) {
          const startPoint = currentRoutePath[segmentIndex]
          const endPoint = currentRoutePath[segmentIndex + 1]

          const currentLat = startPoint[0] + (endPoint[0] - startPoint[0]) * segmentProgress
          const currentLng = startPoint[1] + (endPoint[1] - startPoint[1]) * segmentProgress

          if (trainMarkerRef.current) {
            trainMarkerRef.current.setLatLng([currentLat, currentLng])
          } else {
            trainMarkerRef.current = createTrainMarker([currentLat, currentLng])
          }
        }

        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
        setAnimationProgress(1)
      }
    }

    animate()
  }

  const pauseTrainAnimation = () => {
    setIsAnimating(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }

  const resetTrainAnimation = () => {
    setIsAnimating(false)
    setAnimationProgress(0)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    if (trainMarkerRef.current) {
      mapInstanceRef.current?.removeLayer(trainMarkerRef.current)
      trainMarkerRef.current = null
    }
  }

  const handleSpeedChange = (speed: number) => {
    setAnimationSpeed(speed)
    if (isAnimating) {
      pauseTrainAnimation()
      setTimeout(() => startTrainAnimation(), 100) // Restart with new speed
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
    <>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .train-marker .train-icon {
          animation: pulse 1s infinite;
        }
      `}</style>
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

          {/* Train Simulation Controls */}
          {(() => {
            const simulationRoute = selectedRoute || (routes && routes.length > 0 ? routes[0] : null)
            const shouldShow = simulationRoute && currentRoutePath.length > 0
            console.log("[v0] Train simulation check:", {
              selectedRoute: !!selectedRoute,
              simulationRoute: !!simulationRoute,
              currentRoutePathLength: currentRoutePath.length,
              shouldShow: shouldShow
            })
            return shouldShow
          })() && (
            <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border z-[1000]">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Train Simulation</span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Button
                  size="sm"
                  variant={isAnimating ? "secondary" : "default"}
                  onClick={isAnimating ? pauseTrainAnimation : startTrainAnimation}
                  className="w-8 h-8 p-0"
                  disabled={!currentRoutePath.length}
                >
                  {isAnimating ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetTrainAnimation}
                  className="w-8 h-8 p-0"
                  disabled={!currentRoutePath.length}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">Speed:</span>
                <select
                  value={animationSpeed}
                  onChange={(e) => handleSpeedChange(Number(e.target.value))}
                  className="text-xs bg-background border rounded px-2 py-1"
                >
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={4}>4x</option>
                  <option value={8}>8x</option>
                </select>
              </div>

              <div className="w-32 bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${animationProgress * 100}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1 text-center">
                {Math.round(animationProgress * 100)}%
              </div>
            </div>
          )}

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
    </>
  )
}
