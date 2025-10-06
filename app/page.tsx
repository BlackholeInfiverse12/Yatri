"use client"

import { useState } from "react"
import { EnhancedSearchInterface } from "@/components/enhanced-search-interface"
import { Header } from "@/components/header"
import { RouteResults } from "@/components/route-results"
import { InteractiveMap } from "@/components/interactive-map"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles } from "lucide-react"

export default function HomePage() {
  const [searchResults, setSearchResults] = useState(null)
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [showResults, setShowResults] = useState(false)

  const handleSearch = (results: any) => {
    console.log("[v0] Search results received:", results)
    setSearchResults(results)
    setShowResults(true)
  }

  const handleBackToSearch = () => {
    setShowResults(false)
    setSearchResults(null)
    setSelectedRoute(null)
  }

  const handleRouteSelect = (route: any) => {
    setSelectedRoute(route)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="flex h-[calc(100vh-4rem)]">
        {/* Left Column - Search Interface */}
        <div className="w-80 border-r border-border bg-card/50 backdrop-blur-sm overflow-y-auto">
          <div className="p-4 space-y-4">
            {showResults && (
              <Button
                variant="ghost"
                onClick={handleBackToSearch}
                className="w-full justify-start animate-fade-in hover:bg-muted/50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Search
              </Button>
            )}

            <div className="space-y-2 animate-slide-up">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-primary to-accent p-2 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-hierarchy-2 text-foreground">Yatri</h1>
                  <p className="text-xs text-muted-foreground font-medium">Journey Planner</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-pretty">
                Smart multimodal transportation for Mumbai commuters
              </p>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <EnhancedSearchInterface onSearch={handleSearch} showResults={false} />
            </div>
          </div>
        </div>

        {/* Middle Column - Route Results */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-background to-muted/20">
          <div className="p-6">
            {showResults && searchResults ? (
              <div className="animate-slide-up">
                <RouteResults
                  results={searchResults}
                  onRouteSelect={handleRouteSelect}
                  selectedRoute={selectedRoute}
                  showMap={false}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center animate-fade-in">
                <div className="max-w-md space-y-4">
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-8 rounded-2xl">
                    <div className="bg-gradient-to-r from-primary to-accent p-3 rounded-xl w-fit mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-hierarchy-2 text-foreground mb-2">Plan Your Journey</h2>
                    <p className="text-muted-foreground text-pretty">
                      Enter your source and destination to discover the fastest, most efficient routes across Mumbai's
                      transit network
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-card rounded-lg border">
                      <div className="text-lg font-bold text-primary">3</div>
                      <div className="text-xs text-muted-foreground">Railway Lines</div>
                    </div>
                    <div className="p-3 bg-card rounded-lg border">
                      <div className="text-lg font-bold text-accent">50+</div>
                      <div className="text-xs text-muted-foreground">Stations</div>
                    </div>
                    <div className="p-3 bg-card rounded-lg border">
                      <div className="text-lg font-bold text-secondary-foreground">Live</div>
                      <div className="text-xs text-muted-foreground">Updates</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Interactive Map */}
        <div className="w-96 border-l border-border bg-card/30 backdrop-blur-sm">
          <div className="h-full animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <InteractiveMap selectedRoute={selectedRoute || undefined} routes={searchResults || undefined} className="h-full rounded-none" />
          </div>
        </div>
      </main>
    </div>
  )
}
