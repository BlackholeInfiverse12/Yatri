"use client"

import type React from "react"

import { Clock, IndianRupee, Footprints, ArrowRight, AlertCircle, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TransportIcon } from "@/components/transport-icons"
import { InteractiveMap } from "@/components/interactive-map"
import { LastMileOptions } from "@/components/lastmile-options"
import { useState } from "react"

export interface RouteStep {
  mode: "train" | "bus" | "metro" | "monorail" | "walk" | "auto"
  line?: string
  from: string
  to: string
  duration: number
  distance?: number
  cost?: number
  color?: string
}

export interface Route {
  id: string
  type: "fastest" | "fewest-transfers" | "cheapest"
  totalDuration: number
  totalCost: number
  transfers: number
  walkingDistance: number
  steps: RouteStep[]
  path?: string[]
  delay?: number
  crowdLevel?: "low" | "medium" | "high"
}

interface RouteResultsProps {
  results: Route[] // Changed from routes to results to match parent component
  onRouteSelect?: (route: Route) => void // Changed from onSelectRoute to onRouteSelect to match parent
  selectedRoute?: Route | null // Added selectedRoute prop from parent
  showMap?: boolean // Added showMap prop to control map display
}

const ROUTE_TYPE_CONFIG = {
  fastest: {
    title: "Fastest Route",
    icon: Clock,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  "fewest-transfers": {
    title: "Fewest Transfers",
    icon: ArrowRight,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  cheapest: {
    title: "Cheapest Route",
    icon: IndianRupee,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
}

const TRANSPORT_COLORS = {
  train: "bg-blue-100 text-blue-700 border-blue-200",
  bus: "bg-red-100 text-red-700 border-red-200",
  metro: "bg-purple-100 text-purple-700 border-purple-200",
  monorail: "bg-green-100 text-green-700 border-green-200",
  walk: "bg-gray-100 text-gray-700 border-gray-200",
  auto: "bg-yellow-100 text-yellow-700 border-yellow-200",
}

const CROWD_COLORS = {
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-red-600",
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

function RouteCard({
  route,
  onSelect,
  isSelected,
}: { route: Route; onSelect?: (route: Route) => void; isSelected?: boolean }) {
  const config = ROUTE_TYPE_CONFIG[route.type]
  const IconComponent = config.icon

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    onSelect?.(route) // This will highlight the route on the map
  }

  return (
    <Card
      className={`hover:shadow-md transition-shadow cursor-pointer ${isSelected ? "ring-2 ring-primary" : ""}`}
      onClick={() => onSelect?.(route)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <IconComponent className={`h-4 w-4 ${config.color}`} />
            </div>
            {config.title}
          </CardTitle>
          {route.delay && route.delay > 0 && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              {route.delay}min delay
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Route Summary */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-foreground">{formatDuration(route.totalDuration)}</div>
            <div className="text-xs text-muted-foreground">Total Time</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{route.transfers}</div>
            <div className="text-xs text-muted-foreground">Transfers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">₹{route.totalCost}</div>
            <div className="text-xs text-muted-foreground">Total Cost</div>
          </div>
        </div>

        {/* Consolidated Path */}
        <div className="mb-2">
          <div className="text-sm text-center mb-1">Path</div>
          <div className="text-xs">
            {route.steps.reduce((acc: string, step: any, index: number) => {
              if (step.mode === "transfer") return acc;
              return acc + (index > 0 ? " → " : "") + step.from + (step.line ? ` (${step.line})` : "");
            }, route.steps[0].from)}
          </div>
        </div>

        {/* Next Train Info */}
        {route.steps.some((step: any) => step.mode === "train" && step.nextTrain) && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <div className="flex gap-4">
              {route.steps.filter((step: any) => step.mode === "train" && step.nextTrain).slice(0, 2).map((step: any, index: number) => (
                <span key={index}>
                  Next {step.line}: {step.nextTrain?.number} at {new Date(step.nextTrain!.nextDeparture * 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function RouteResults({ results, onRouteSelect, selectedRoute, showMap = true }: RouteResultsProps) {
  const [internalSelectedRoute, setInternalSelectedRoute] = useState<Route | undefined>(results[0])
  const [showLastMile, setShowLastMile] = useState(false)

  const currentSelectedRoute = selectedRoute || internalSelectedRoute

  const handleRouteSelect = (route: Route) => {
    setInternalSelectedRoute(route)
    onRouteSelect?.(route)
  }

  const getFinalTransitStop = (route: Route) => {
    const transitSteps = route.steps.filter((step) => step.mode !== "walk")
    return transitSteps.length > 0 ? transitSteps[transitSteps.length - 1].to : route.steps[route.steps.length - 1].to
  }

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Routes Found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria or check your locations.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Route Options</h2>
        <p className="text-muted-foreground">
          Found {results.length} route{results.length > 1 ? "s" : ""} for your journey
        </p>
      </div>

      {showMap && (
        <InteractiveMap routes={results} selectedRoute={currentSelectedRoute} onRouteSelect={handleRouteSelect} />
      )}

      <div className="space-y-4">
        {results.map((route) => (
          <RouteCard
            key={route.id}
            route={route}
            onSelect={handleRouteSelect}
            isSelected={currentSelectedRoute?.id === route.id}
          />
        ))}
      </div>

      {currentSelectedRoute && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Complete Your Journey</h3>
            <Button variant="outline" size="sm" onClick={() => setShowLastMile(!showLastMile)}>
              {showLastMile ? "Hide" : "Show"} Last-Mile Options
            </Button>
          </div>

          {showLastMile && (
            <LastMileOptions
              fromLocation={getFinalTransitStop(currentSelectedRoute)}
              toLocation="Destination" // Use generic destination since we don't have origin/destination props
              onOptionSelect={(option) => {
                console.log("[v0] Selected last-mile option:", option)
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}
