"use client"

import { useState, useEffect } from "react"
import { Bell, Clock, AlertTriangle, Info, Wrench, Filter, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

interface LiveUpdatesProps {
  onClose?: () => void
}

const CATEGORY_CONFIG = {
  delay: {
    icon: Clock,
    label: "Delays",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 border-yellow-200",
  },
  maintenance: {
    icon: Wrench,
    label: "Maintenance",
    color: "text-blue-600",
    bgColor: "bg-blue-100 border-blue-200",
  },
  notice: {
    icon: Info,
    label: "Notices",
    color: "text-purple-600",
    bgColor: "bg-purple-100 border-purple-200",
  },
  emergency: {
    icon: AlertTriangle,
    label: "Emergency",
    color: "text-red-600",
    bgColor: "bg-red-100 border-red-200",
  },
  general: {
    icon: Bell,
    label: "General",
    color: "text-green-600",
    bgColor: "bg-green-100 border-green-200",
  },
}

const SEVERITY_COLORS = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  high: "bg-red-100 text-red-700 border-red-200",
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const updateTime = new Date(timestamp)
  const diffMs = now.getTime() - updateTime.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return updateTime.toLocaleDateString()
}

export function LiveUpdates({ onClose }: LiveUpdatesProps) {
  const [updates, setUpdates] = useState<LiveUpdate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedSource, setSelectedSource] = useState<string>("all")
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchUpdates = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        category: selectedCategory,
        source: selectedSource,
        limit: "20",
      })

      const response = await fetch(`/api/live-updates?${params}`)

      if (!response.ok) {
        throw new Error("Failed to fetch updates")
      }

      const data = await response.json()

      if (data.success) {
        setUpdates(data.updates)
        setLastRefresh(new Date())
      } else {
        throw new Error(data.error || "Failed to load updates")
      }
    } catch (err) {
      console.error("[v0] Error fetching live updates:", err)
      setError("Failed to load live updates. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUpdates()
  }, [selectedCategory, selectedSource])

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(fetchUpdates, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedCategory, selectedSource])

  const groupedUpdates = updates.reduce(
    (acc, update) => {
      if (!acc[update.category]) {
        acc[update.category] = []
      }
      acc[update.category].push(update)
      return acc
    },
    {} as Record<string, LiveUpdate[]>,
  )

  return (
    <div className="space-y-4 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Live Updates</h2>
        <p className="text-muted-foreground">Latest news and alerts from Mumbai transit</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchUpdates} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="delay">Delays</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="notice">Notices</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Source</label>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="Mumbai Local">Mumbai Local</SelectItem>
                  <SelectItem value="BMC">BMC</SelectItem>
                  <SelectItem value="Western Railway">Western Railway</SelectItem>
                  <SelectItem value="Central Railway">Central Railway</SelectItem>
                  <SelectItem value="Harbor Line">Harbor Line</SelectItem>
                  <SelectItem value="Traffic Police">Traffic Police</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-xs text-muted-foreground mt-2">Last updated: {lastRefresh.toLocaleTimeString()}</div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="p-6 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Loading live updates...</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && updates.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No updates found for the selected filters</p>
          </CardContent>
        </Card>
      )}

      {/* Updates List */}
      {!isLoading && updates.length > 0 && (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Updates</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {updates.map((update) => {
              const config = CATEGORY_CONFIG[update.category]
              const IconComponent = config.icon

              return (
                <Card key={update.id} className={`${config.bgColor} border`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-white/50`}>
                        <IconComponent className={`h-4 w-4 ${config.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm">{update.title}</h3>
                          <Badge variant="outline" className={`text-xs ${SEVERITY_COLORS[update.severity]}`}>
                            {update.severity}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">{update.description}</p>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-xs">
                              {update.source}
                            </Badge>
                            {update.affectedLines && (
                              <div className="flex gap-1">
                                {update.affectedLines.map((line) => (
                                  <Badge key={line} variant="outline" className="text-xs">
                                    {line}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-muted-foreground">{formatTimeAgo(update.timestamp)}</span>
                        </div>

                        {update.affectedStations && update.affectedStations.length > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Affected stations: {update.affectedStations.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="critical" className="space-y-3">
            {updates
              .filter((update) => update.severity === "high" || update.category === "emergency")
              .map((update) => {
                const config = CATEGORY_CONFIG[update.category]
                const IconComponent = config.icon

                return (
                  <Card key={update.id} className={`${config.bgColor} border`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-white/50`}>
                          <IconComponent className={`h-4 w-4 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-sm">{update.title}</h3>
                            <Badge variant="outline" className={`text-xs ${SEVERITY_COLORS[update.severity]}`}>
                              {update.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{update.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <Badge variant="secondary" className="text-xs">
                              {update.source}
                            </Badge>
                            <span className="text-muted-foreground">{formatTimeAgo(update.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </TabsContent>

          <TabsContent value="recent" className="space-y-3">
            {updates
              .filter((update) => {
                const updateTime = new Date(update.timestamp)
                const now = new Date()
                const diffHours = (now.getTime() - updateTime.getTime()) / (1000 * 60 * 60)
                return diffHours <= 2 // Last 2 hours
              })
              .map((update) => {
                const config = CATEGORY_CONFIG[update.category]
                const IconComponent = config.icon

                return (
                  <Card key={update.id} className={`${config.bgColor} border`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-white/50`}>
                          <IconComponent className={`h-4 w-4 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-sm">{update.title}</h3>
                            <Badge variant="outline" className={`text-xs ${SEVERITY_COLORS[update.severity]}`}>
                              {update.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{update.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <Badge variant="secondary" className="text-xs">
                              {update.source}
                            </Badge>
                            <span className="text-muted-foreground">{formatTimeAgo(update.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </TabsContent>
        </Tabs>
      )}

      <Button variant="outline" className="w-full bg-transparent" onClick={onClose}>
        Close
      </Button>
    </div>
  )
}
