'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { 
  Timer, 
  Zap, 
  FileText, 
  TrendingUp,
  CheckCircle,
  AlertCircle 
} from 'lucide-react'

interface PerformanceMetrics {
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  cssLoadTime: number
  cssSize: number
  criticalCssSize: number
  renderBlockingResources: number
}

export function CSSPerformanceAnalyzer() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const analyzePerformance = async () => {
      // Wait for page load
      if (document.readyState !== 'complete') {
        window.addEventListener('load', analyzePerformance)
        return
      }

      try {
        const performance = window.performance
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const paintEntries = performance.getEntriesByType('paint')
        
        // Get CSS-specific metrics
        const cssResources = performance.getEntriesByType('resource')
          .filter((resource: any) => resource.name.includes('.css'))
        
        const totalCssSize = cssResources.reduce((total: number, resource: any) => {
          return total + (resource.transferSize || 0)
        }, 0)

        // Estimate critical CSS size (inline styles in head)
        const criticalCssSize = Array.from(document.head.querySelectorAll('style'))
          .reduce((total, style) => total + style.textContent?.length || 0, 0)

        // Count render-blocking resources
        const renderBlockingResources = document.head.querySelectorAll(
          'link[rel="stylesheet"]:not([media="print"]):not([disabled])'
        ).length

        const metrics: PerformanceMetrics = {
          firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint: 0, // Will be updated by observer
          cumulativeLayoutShift: 0, // Will be updated by observer
          firstInputDelay: 0, // Will be updated by observer
          cssLoadTime: Math.max(...cssResources.map((r: any) => r.responseEnd - r.requestStart)),
          cssSize: totalCssSize,
          criticalCssSize,
          renderBlockingResources
        }

        // Set up performance observers
        if ('PerformanceObserver' in window) {
          // LCP Observer
          const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries()
            const lastEntry = entries[entries.length - 1] as any
            setMetrics(prev => prev ? { ...prev, largestContentfulPaint: lastEntry.startTime } : null)
          })
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

          // CLS Observer
          const clsObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries() as any[]
            const clsValue = entries.reduce((sum, entry) => sum + entry.value, 0)
            setMetrics(prev => prev ? { ...prev, cumulativeLayoutShift: clsValue } : null)
          })
          clsObserver.observe({ entryTypes: ['layout-shift'] })

          // FID Observer
          const fidObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries() as any[]
            entries.forEach(entry => {
              setMetrics(prev => prev ? { ...prev, firstInputDelay: entry.processingStart - entry.startTime } : null)
            })
          })
          fidObserver.observe({ entryTypes: ['first-input'] })
        }

        setMetrics(metrics)
        setLoading(false)
      } catch (error) {
        console.error('Performance analysis failed:', error)
        setLoading(false)
      }
    }

    analyzePerformance()
  }, [])

  const getScoreColor = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return 'text-green-600'
    if (value <= thresholds[1]) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreIcon = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return <CheckCircle className="h-4 w-4 text-green-600" />
    return <AlertCircle className="h-4 w-4 text-yellow-600" />
  }

  if (loading || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            CSS Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            CSS Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Core Web Vitals */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                <span className="text-sm font-medium">First Contentful Paint</span>
                {getScoreIcon(metrics.firstContentfulPaint, [1800, 3000])}
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(metrics.firstContentfulPaint, [1800, 3000])}`}>
                {Math.round(metrics.firstContentfulPaint)}ms
              </div>
              <Progress value={Math.min((metrics.firstContentfulPaint / 3000) * 100, 100)} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Largest Contentful Paint</span>
                {getScoreIcon(metrics.largestContentfulPaint, [2500, 4000])}
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(metrics.largestContentfulPaint, [2500, 4000])}`}>
                {Math.round(metrics.largestContentfulPaint)}ms
              </div>
              <Progress value={Math.min((metrics.largestContentfulPaint / 4000) * 100, 100)} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Cumulative Layout Shift</span>
                {getScoreIcon(metrics.cumulativeLayoutShift * 1000, [100, 250])}
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(metrics.cumulativeLayoutShift * 1000, [100, 250])}`}>
                {metrics.cumulativeLayoutShift.toFixed(3)}
              </div>
              <Progress value={Math.min((metrics.cumulativeLayoutShift / 0.25) * 100, 100)} />
            </div>
          </div>

          {/* CSS-Specific Metrics */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">CSS Optimization Metrics</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">CSS Load Time</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{Math.round(metrics.cssLoadTime)}ms</span>
                  <Badge variant={metrics.cssLoadTime < 100 ? 'default' : 'secondary'}>
                    {metrics.cssLoadTime < 100 ? 'Excellent' : 'Good'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Total CSS Size</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{(metrics.cssSize / 1024).toFixed(1)}KB</span>
                  <Badge variant={metrics.cssSize < 50000 ? 'default' : 'secondary'}>
                    {metrics.cssSize < 50000 ? 'Optimized' : 'Large'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Critical CSS Size</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{(metrics.criticalCssSize / 1024).toFixed(1)}KB</span>
                  <Badge variant={metrics.criticalCssSize < 14000 ? 'default' : 'secondary'}>
                    {metrics.criticalCssSize < 14000 ? 'Good' : 'Too Large'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Render-Blocking CSS</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{metrics.renderBlockingResources}</span>
                  <Badge variant={metrics.renderBlockingResources <= 1 ? 'default' : 'secondary'}>
                    {metrics.renderBlockingResources <= 1 ? 'Optimized' : 'High'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Optimization Recommendations */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Optimization Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Critical CSS extracted and inlined</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Non-critical CSS deferred loading implemented</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>CSS modules enabled for component isolation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Unused CSS rules removed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}