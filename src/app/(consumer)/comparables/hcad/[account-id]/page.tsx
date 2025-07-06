import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Building2,
  MapPin,
  Home,
  BarChart3,
  CheckCircle,
  FileText,
  Eye,
  Lock,
  Unlock,
  ArrowRight,
  Search,
  Ruler,
  Calendar,
  Target,
  DollarSign,
} from "lucide-react"
import Link from "next/link"
import { getPropertyDataByAccountNumber } from "@/lib/properties"
import { formatCurrency, safeParseFloat } from "@/lib/utils"
import { getComparablesForProperty, type PropertiesSearchResponse } from "@/lib/comparables/server"
import { InteractiveSummary } from "@/components/interactive-summary"

interface ComparablesPageProps {
  params: Promise<{
    "account-id": string
  }>
}

export default async function ComparablesPage({ params }: ComparablesPageProps) {
  const { "account-id": accountId } = await params

  // Fetch property data from API
  let propertyData = null
  let similarPropertiesData: PropertiesSearchResponse | null = null
  let error = null

  try {
    propertyData = await getPropertyDataByAccountNumber(accountId)
    if (propertyData) {
      similarPropertiesData = await getComparablesForProperty(accountId, propertyData)
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch property data"
    console.error("Error fetching property data:", err)
  }

  if (error || !propertyData || !similarPropertiesData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-600">Unable to Load Property Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">
                {error || "Property not found. Please check the account number and try again."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentTotal = safeParseFloat(propertyData.currentValues.totalAppraisedValue)
  const freeProperties = similarPropertiesData.results.slice(0, 3)
  const hiddenCount = similarPropertiesData.total - 3

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              <Search className="h-4 w-4" />
              Property Search Results
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Nearby Properties Found</h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              We found {similarPropertiesData.total} properties in your area that could potentially be used as
              comparables for your property assessment analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Badge variant="secondary" className="gap-2 bg-white/20 text-white border-white/30">
                <MapPin className="h-4 w-4" />
                Houston, TX (HCAD)
              </Badge>
              <Badge variant="secondary" className="gap-2 bg-white/20 text-white border-white/30">
                <Building2 className="h-4 w-4" />
                Account #{accountId}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Interactive Neighborhood Summary */}
        <InteractiveSummary summary={similarPropertiesData.summary} />


        {/* Your Property Overview */}
        <Card className="border-0 shadow-lg overflow-hidden p-0">
          <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-600 text-white pt-6 px-6 pb-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Home className="h-6 w-6" />
              Your Property
            </CardTitle>
            <CardDescription className="text-slate-200 text-base">The subject property for comparable analysis</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-medium">{propertyData.address.formattedAddress}</p>
                    <p className="text-sm text-slate-600">Account #{accountId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Ruler className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-medium">{(propertyData.characteristics.buildingArea ?? 0).toLocaleString()} sq ft</p>
                    <p className="text-sm text-slate-600">Living area</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-medium">Built in {propertyData.characteristics.yearImproved ?? 'N/A'}</p>
                    <p className="text-sm text-slate-600">
                      {propertyData.characteristics.yearImproved ? new Date().getFullYear() - propertyData.characteristics.yearImproved : 'N/A'} years old
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Current Assessment</span>
                    <span className="text-xl font-bold text-slate-900">{formatCurrency(currentTotal)}</span>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Neighborhood</span>
                    <span className="font-medium">{propertyData.classification?.neighborhoodCode || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nearby Properties Preview */}
        <Card className="border-0 shadow-lg overflow-hidden p-0">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white pt-6 px-6 pb-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Building2 className="h-6 w-6" />
              Nearby Properties Preview
            </CardTitle>
            <CardDescription className="text-emerald-50 text-base">
              Showing 3 of {similarPropertiesData.total} nearby properties - Professional analysis required to determine
              comparable suitability
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Free Properties */}
              {freeProperties.map((property, index) => {
                const propertyValue = safeParseFloat(property.assessedValue)
                const pricePerSqFt = propertyValue / safeParseFloat(property.sqFt)

                return (
                  <div
                    key={property.accountId}
                    className="p-4 md:p-6 rounded-lg border border-slate-200 bg-white hover:shadow-md transition-shadow"
                  >
                    {/* Mobile-First Layout */}
                    <div className="space-y-4">
                      {/* Header with address and number */}
                      <div className="flex items-start gap-3">
                        <div className="h-7 w-7 md:h-8 md:w-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-medium text-slate-600 flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-base md:text-lg text-slate-900 leading-tight">{property.address}</h3>
                          <p className="text-xs md:text-sm text-slate-600">Account #{property.accountId}</p>
                        </div>
                      </div>

                      {/* Property Details Grid - Mobile Optimized */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {/* Year & Size */}
                        <div className="col-span-2 md:col-span-1">
                          <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 mb-1">
                            <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                            <span>{property.yearBuilt}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500">
                            <Ruler className="h-3 w-3 md:h-4 md:w-4" />
                            <span>{safeParseFloat(property.sqFt).toLocaleString()} sq ft</span>
                          </div>
                        </div>

                        {/* Assessed Value */}
                        <div>
                          <p className="text-xs text-slate-600 mb-1">Assessed Value</p>
                          <p className="text-sm md:text-lg font-semibold text-slate-900 leading-tight">
                            {formatCurrency(propertyValue)}
                          </p>
                        </div>

                        {/* Price/Sq Ft */}
                        <div>
                          <p className="text-xs text-slate-600 mb-1">Price/Sq Ft</p>
                          <p className="text-sm md:text-base font-medium text-slate-700">
                            ${pricePerSqFt.toFixed(0)}
                          </p>
                        </div>

                        {/* Condition */}
                        <div>
                          <p className="text-xs text-slate-600 mb-1">Condition</p>
                          <p className="text-sm md:text-base font-medium text-slate-700">{property.condition}</p>
                        </div>

                        {/* Quality */}
                        <div>
                          <p className="text-xs text-slate-600 mb-1">Quality</p>
                          <p className="text-sm md:text-base font-medium text-slate-700">{property.quality}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Separator */}
              <div className="border-t border-slate-200 my-8"></div>

              {/* Premium Analysis CTA - Separate Container */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm">
                    <Lock className="h-4 w-4" />
                    {hiddenCount} More Properties Available
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900">Professional Analysis Required</h3>

                  <p className="text-slate-600 max-w-2xl mx-auto">
                    To determine which of these {similarPropertiesData.total} properties are truly comparable to yours,
                    you need professional analysis that considers location, condition, size, age, and market factors.
                  </p>

                  <div className="grid gap-3 text-sm max-w-lg mx-auto">
                    <div className="flex items-center gap-2 justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Access all {similarPropertiesData.total} nearby properties</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Professional comparable analysis</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Appeal-ready documentation</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                      <Link href={`/purchase?jurisdiction=HCAD&account=${accountId}`}>
                        <Unlock className="h-4 w-4 mr-2" />
                        Get Professional Analysis
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg">
                      <Eye className="h-4 w-4 mr-2" />
                      View Sample Report
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What You Get Section - Add proper spacing */}
        <div className="pt-4">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">What Professional Analysis Includes</CardTitle>
              <CardDescription className="text-blue-700">
                Our experts will analyze these properties to determine true comparables for your appeal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Comparable Selection</h4>
                      <p className="text-sm text-slate-600">
                        Identify which properties are truly comparable based on location, size, age, and condition
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Market Analysis</h4>
                      <p className="text-sm text-slate-600">
                        Statistical analysis of neighborhood trends and property values
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Appeal Documentation</h4>
                      <p className="text-sm text-slate-600">
                        Professional report formatted for property tax appeal submissions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Value Assessment</h4>
                      <p className="text-sm text-slate-600">
                        Determine if your property is over-assessed compared to true comparables
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-slate-900 to-slate-700 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Analyze Your Comparables?</h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Don't guess about your property's assessment. Get professional analysis of these{" "}
            {similarPropertiesData.total} nearby properties to build a strong appeal case.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100" asChild>
              <Link href={`/purchase?jurisdiction=HCAD&account=${accountId}`}>
                Get Professional Analysis
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-slate-900 bg-transparent"
            >
              <Link href={`/view-my-property/hcad/${accountId}`}>View Property Details</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 