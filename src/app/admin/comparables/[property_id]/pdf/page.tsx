import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Loader2, RefreshCw, Trash2 } from "lucide-react"
import Link from "next/link"
import { getPropertyByAccount, getComparablesData } from "@/lib/properties/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { PrintButton } from "./print-button"
import { 
  loadCachedData, 
  cacheComparablesData, 
  clearCachedData 
} from "@/lib/pdf-cache"
import type { DetailedComparablesResponse, ApiPropertyResponse } from "@/lib/properties/types/types"

interface PDFPageProps {
  params: Promise<{ property_id: string }>
}

// Cache Management Buttons Component (Client-side only)
function CacheManagementButtons({ property_id }: { property_id: string }) {
  const handleRefreshCache = () => {
    // Clear cache and reload page to fetch fresh data
    try {
      clearCachedData(property_id)
      window.location.reload()
    } catch (error) {
      console.error('Error refreshing cache:', error)
      alert('Error refreshing cache. Please try again.')
    }
  }

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear the cached data? This will require a fresh API call next time.')) {
      try {
        clearCachedData(property_id)
        window.location.reload()
      } catch (error) {
        console.error('Error clearing cache:', error)
        alert('Error clearing cache. Please try again.')
      }
    }
  }

  // Only render on client-side
  if (typeof window === 'undefined') {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefreshCache}
        className="gap-1"
        title="Fetch fresh data from API"
      >
        <RefreshCw className="h-3 w-3" />
        Refresh
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClearCache}
        className="gap-1 text-red-600 hover:text-red-700"
        title="Clear cached data"
      >
        <Trash2 className="h-3 w-3" />
        Clear
      </Button>
    </div>
  )
}

// Loading component for PDF generation
function PDFPreparationLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preparing PDF Data...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg">Analyzing comparables and generating PDF content...</span>
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Component that handles data fetching and PDF generation
async function PDFDataFetcher({ property_id }: { property_id: string }) {
  let property: ApiPropertyResponse | null = null
  let comparablesData: DetailedComparablesResponse | null = null
  let comparablesError: string | null = null
  let isFromCache = false

  // Check cache first
  const cachedData = loadCachedData(property_id)
  
  if (cachedData) {
    // Use cached data
    property = cachedData.property
    comparablesData = cachedData.comparablesData
    isFromCache = true
    console.log(`📂 Using cached data for account ${property_id}`)
  } else {
    // Fetch fresh data
    console.log(`🔄 Fetching fresh data for account ${property_id}`)
    
    // Fetch the subject property data
    const propertyResult = await getPropertyByAccount(property_id)
    
    if (!propertyResult) {
      return (
        <div className="text-center py-12">
          <p className="text-destructive">Property not found for account: {property_id}</p>
        </div>
      )
    }

    property = propertyResult

    // Extract the required parameters for comparables API
    const stateClass = property.classification?.stateClass
    const neighborhoodCode = property.classification?.neighborhoodCode
    const firstBuilding = property.buildings?.[0]
    const buildingQualityCode = firstBuilding?.buildingQualityCode
    const gradeAdjustment = firstBuilding?.gradeAdjustment

    // Fetch comparables data WITH AI analysis for PDF export
    try {
      if (stateClass && neighborhoodCode && buildingQualityCode && gradeAdjustment) {
        const result = await getComparablesData(
          property_id,
          stateClass,
          neighborhoodCode,
          buildingQualityCode,
          gradeAdjustment,
          true, // includeProtestAnalysis = true for PDF with full AI analysis
        )
        comparablesData = result as unknown as DetailedComparablesResponse
        
        // Cache the fresh data
        if (comparablesData) {
          cacheComparablesData(property_id, property, comparablesData)
        }
      } else {
        comparablesError = "Missing required parameters for comparables (stateClass, neighborhoodCode, buildingQualityCode, gradeAdjustment)"
      }
    } catch (error) {
      comparablesError = error instanceof Error ? error.message : "Failed to fetch comparables"
    }
  }

  if (comparablesError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error loading comparables: {comparablesError}</p>
      </div>
    )
  }

  if (!comparablesData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No comparables data available</p>
      </div>
    )
  }

  const comparables = comparablesData.comparables || []

  return (
    <div className="space-y-6">
      {/* PDF Generation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PDF Export Ready
            {isFromCache && (
              <Badge variant="secondary" className="ml-2">
                📂 Cached Data
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-800">
                  PDF data prepared successfully {isFromCache ? '(from cache)' : '(fresh data)'}
                </p>
                <p className="text-sm text-green-600">
                  Analysis complete with {comparables.length} comparables and AI insights
                </p>
                {isFromCache && cachedData && (
                  <p className="text-xs text-green-500 mt-1">
                    Cached on: {new Date(cachedData.cachedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <PrintButton property={property} comparablesData={comparablesData} />
                {isFromCache && (
                  <CacheManagementButtons property_id={property_id} />
                )}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>The PDF will include:</p>
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>Subject property summary and details</li>
                <li>Analysis summary with key statistics</li>
                <li>Comparables table with market values and adjustments</li>
                <li>Detailed AI analysis for each comparable</li>
                <li>Professional formatting and multiple pages</li>
              </ul>
              {isFromCache && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 text-sm font-medium">💡 Development Mode</p>
                  <p className="text-blue-700 text-xs mt-1">
                    Using cached data to avoid expensive AI calls during PDF development. 
                    Use the refresh button to fetch fresh data when needed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Information */}
      <Card>
        <CardHeader>
          <CardTitle>Export Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Subject Property</label>
              <p className="font-medium">{property.address?.formattedAddress || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Market Value</label>
              <p className="font-medium text-lg">{formatCurrency(property.currentValues?.totalMarketValue)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Comparables Found</label>
              <p className="font-medium">{comparables.length}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Median Comparable Value</label>
              <p className="font-medium">{formatCurrency(comparablesData.median_comparable_value)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function PDFPage({ params }: PDFPageProps) {
  const { property_id } = await params

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/comparables/${property_id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Analysis
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">PDF Export - Comparables Analysis</h1>
            <p className="text-muted-foreground">Account: {property_id}</p>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <Suspense fallback={<PDFPreparationLoading />}>
          <PDFDataFetcher property_id={property_id} />
        </Suspense>
      </div>
    </div>
  )
} 