import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, Building2, Home, TrendingUp } from "lucide-react"

export default function ComparablesLoading() {
  return (
    <div className="py-6 px-4 sm:py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-32 mt-2" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>

        {/* Analysis Progress */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary animate-pulse" />
              Analyzing Comparable Properties...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">Processing your property data and finding similar properties in your area</div>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="animate-pulse h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Property data retrieved</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="animate-pulse h-2 w-2 rounded-full bg-blue-500"></div>
                  <span>Searching neighborhood properties...</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-muted"></div>
                  <span>Analyzing market data</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-muted"></div>
                  <span>Generating comparables report</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject Property Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Your Property
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg border">
                  <Skeleton className="h-10 w-32 mx-auto" />
                  <Skeleton className="h-4 w-40 mx-auto mt-2" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-muted rounded">
                    <Skeleton className="h-5 w-16 mx-auto" />
                    <Skeleton className="h-3 w-8 mx-auto mt-1" />
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <Skeleton className="h-5 w-16 mx-auto" />
                    <Skeleton className="h-3 w-12 mx-auto mt-1" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Summary Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <Skeleton className="h-6 w-48" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-2">
                <Skeleton className="h-8 w-24 mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
              <div className="text-center space-y-2">
                <Skeleton className="h-8 w-16 mx-auto" />
                <Skeleton className="h-4 w-36 mx-auto" />
              </div>
              <div className="text-center space-y-2 sm:col-span-2 lg:col-span-1">
                <Skeleton className="h-8 w-8 mx-auto" />
                <Skeleton className="h-4 w-40 mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparable Properties Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <Skeleton className="h-6 w-48" />
            </CardTitle>
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-14" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <div className="flex items-center justify-end">
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 