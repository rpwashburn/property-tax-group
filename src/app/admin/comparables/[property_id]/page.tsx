import { Button } from "@/components/ui/button"
import { FileText, /* BarChart3, */ MapPin, /* Users, */ Building } from "lucide-react"
import Link from "next/link"
import { getPropertyByAccount } from "@/lib/properties/server"
import { getComparablesData } from "@/lib/properties/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SavingsCalculator } from "@/components/admin/savings-calculator"
import { formatCurrency } from "@/lib/utils"
import type { DetailedComparablesResponse } from "@/lib/properties/types/types"

interface ComparablesPageProps {
  params: Promise<{ property_id: string }>
}

export default async function ComparablesPage({ params }: ComparablesPageProps) {
  const { property_id } = await params

  // Fetch the subject property data
  const propertyResult = await getPropertyByAccount(property_id)
  
  if (!propertyResult) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-destructive">Property not found for account: {property_id}</p>
        </div>
      </div>
    )
  }

  // Extract the required parameters for comparables API
  const stateClass = propertyResult.classification?.stateClass
  const neighborhoodCode = propertyResult.classification?.neighborhoodCode
  
  // Extract building quality code and grade adjustment from buildings data
  // These are critical for accurate comparable searches - we should not default them
  const primaryBuilding = propertyResult.buildings?.[0] // Get primary building
  const buildingQualityCode = primaryBuilding?.buildingQualityCode
  const gradeAdjustment = primaryBuilding?.gradeAdjustment

  // Validate ALL required data - no dangerous defaults
  if (!stateClass || !neighborhoodCode || !buildingQualityCode || !gradeAdjustment) {
    const missingFields = []
    if (!stateClass) missingFields.push("State Class")
    if (!neighborhoodCode) missingFields.push("Neighborhood Code")
    if (!buildingQualityCode) missingFields.push("Building Quality Code")
    if (!gradeAdjustment) missingFields.push("Grade Adjustment")

    return (
      <div className="max-w-4xl mx-auto py-10">
        <Card className="border-destructive/20">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive flex items-center justify-center gap-2">
              <Building className="h-6 w-6" />
              Cannot Perform Comparable Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Missing required property data needed for accurate comparable searches:
            </p>
            <div className="inline-flex flex-wrap gap-2 justify-center">
              {missingFields.map(field => (
                <Badge key={field} variant="destructive">{field}</Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Check the property API - it may not be returning buildings data correctly.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch comparables data without AI analysis for fast loading
  // All required parameters are now validated above
  let comparablesResult = null
  let comparablesError = null
  
  try {
    comparablesResult = await getComparablesData(
      property_id,
      stateClass,
      neighborhoodCode,
      buildingQualityCode,
      gradeAdjustment,
      false, // includeProtestAnalysis = false for fast loading
    )
  } catch (error) {
    comparablesError = error instanceof Error ? error.message : "Failed to fetch comparables"
  }

  const comparables = (comparablesResult as unknown as DetailedComparablesResponse)?.comparables || []
  const medianValue = (comparablesResult as unknown as DetailedComparablesResponse)?.median_comparable_value

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Comparables Analysis</h1>
          <p className="text-muted-foreground">Account: {property_id}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            {comparables.length} Comparables Found
          </Badge>
          
          <Button asChild className="gap-2">
                            <Link href={`/admin/comparables/${property_id}/pdf`}>
              <FileText className="h-4 w-4" />
              Export Analysis
            </Link>
          </Button>
        </div>
      </div>

      {/* Subject Property Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Subject Property
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Address</label>
              <p className="font-medium">{propertyResult.address?.formattedAddress || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Market Value</label>
              <p className="font-medium text-lg">{formatCurrency(propertyResult.currentValues?.totalMarketValue)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Building Area</label>
              <p className="font-medium">{propertyResult.characteristics?.buildingArea?.toLocaleString() || "N/A"} sq ft</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Year Built</label>
              <p className="font-medium">{propertyResult.characteristics?.yearImproved || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Savings Calculator */}
      <SavingsCalculator
        currentAppraisedValue={propertyResult.currentValues?.totalMarketValue}
        proposedMedianValue={(comparablesResult as unknown as DetailedComparablesResponse)?.median_comparable_value}
      />

      {/* Comparables Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Comparable Properties
          </CardTitle>
          <p className="text-sm text-gray-600">
            {comparables.length} comparable properties found | 
            Search criteria: State Class {stateClass}, Neighborhood {neighborhoodCode}, Quality {buildingQualityCode}, Grade {gradeAdjustment}
          </p>
        </CardHeader>
        <CardContent>
          {comparablesError ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading comparables: {comparablesError}</p>
            </div>
          ) : comparables.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No comparable properties found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Statistics */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Comparables</p>
                  <p className="text-2xl font-bold">{comparables.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Median Value</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(medianValue)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Avg Price/SqFt</p>
                  <p className="text-2xl font-bold">
                    {comparables.length > 0 
                      ? formatCurrency(comparables.reduce((sum, comp) => sum + (comp.financial_data?.adjusted_price_per_sqft || 0), 0) / comparables.length)
                      : "N/A"
                    }
                  </p>
                </div>
              </div>

              {/* Comparables Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Account ID</th>
                      <th className="text-left p-3">Address</th>
                      <th className="text-right p-3">Sq Ft</th>
                      <th className="text-right p-3">Year Built</th>
                      <th className="text-right p-3">Original Value</th>
                      <th className="text-right p-3">Adjusted Value</th>
                      <th className="text-right p-3">Price/SqFt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparables.map((comp, index) => (
                      <tr key={comp.account_id || index} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-xs">{comp.account_id}</td>
                        <td className="p-3">{comp.address}</td>
                        <td className="p-3 text-right">{comp.basic_info?.square_footage?.toLocaleString() || 'N/A'}</td>
                        <td className="p-3 text-right">{comp.basic_info?.year_built || 'N/A'}</td>
                        <td className="p-3 text-right">{formatCurrency(comp.financial_data?.original_market_value)}</td>
                        <td className="p-3 text-right font-medium">{formatCurrency(comp.financial_data?.adjusted_value)}</td>
                        <td className="p-3 text-right">{formatCurrency(comp.financial_data?.adjusted_price_per_sqft)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 