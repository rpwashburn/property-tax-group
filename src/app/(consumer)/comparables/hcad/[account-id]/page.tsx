import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, MapPin, Home, BarChart3, CheckCircle, FileText, Download } from "lucide-react"
import Link from "next/link"
import { getPropertyDataByAccountNumber } from "@/lib/properties"
import { formatCurrency } from "@/lib/utils"
import { getComparablesForProperty } from "@/lib/comparables/server"

interface ComparablesPageProps {
  params: Promise<{
    "account-id": string
  }>
}

export default async function ComparablesPage({ params }: ComparablesPageProps) {
  const { "account-id": accountId } = await params

  // Fetch property data from API
  let propertyData = null;
  let comparablesData = null;
  let error = null;

  try {
    propertyData = await getPropertyDataByAccountNumber(accountId);
    if (propertyData) {
      comparablesData = await getComparablesForProperty(accountId, propertyData);
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch property data';
    console.error('Error fetching property data:', err);
  }

  if (error) {
    return (
      <div className="py-6 px-4 sm:py-12">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Property Not Found</h1>
            <p className="text-muted-foreground">Account #{accountId}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Error Loading Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{error}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please check the account number and try again.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!propertyData) {
    return (
      <div className="py-6 px-4 sm:py-12">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Property Not Found</h1>
            <p className="text-muted-foreground">Account #{accountId}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>No Property Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No property was found for account number: <span className="font-mono">{accountId}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please verify the account number and try again.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!comparablesData) {
    return (
      <div className="py-6 px-4 sm:py-12">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Comparables Not Available</h1>
            <p className="text-muted-foreground">Account #{accountId}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">Unable to Load Comparables</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We were unable to load comparable properties for this account. This may be due to:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
                <li>The comparables service is temporarily unavailable</li>
                <li>Insufficient comparable properties in this neighborhood</li>
                <li>Technical issues with the analysis system</li>
              </ul>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/view-my-property/hcad/${accountId}`}>
                    View Property Details
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/comparables/hcad/${accountId}`}>
                    Try Again
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate year-over-year changes
  const currentTotal = parseFloat(propertyData.currentValues.totalAppraisedValue?.replace(/[^0-9.-]+/g, "") || "0");

  // Use real API data for comparables - Freemium model: show 3 full, tease the rest
  const freeComparables = comparablesData.comparables.slice(0, 3); // Show first 3 fully

  return (
    <div className="py-6 px-4 sm:py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Comparables Report</h1>
            <p className="text-muted-foreground">Account #{accountId}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-2">
              <MapPin className="h-3 w-3" />
              Houston, TX (HCAD)
            </Badge>
            <Badge variant="outline" className="gap-2">
              <BarChart3 className="h-3 w-3" />
              Analysis Complete
            </Badge>
          </div>
        </div>

        {/* Subject Property Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Subject Property Overview
            </CardTitle>
            <CardDescription>
              Your property details for this comparables analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div>
                <div className="font-semibold text-muted-foreground">Property Address</div>
                <div>{propertyData.address.formattedAddress || propertyData.address.siteAddress1}</div>
                <div className="text-xs text-muted-foreground">
                  Account #{accountId}
                </div>
              </div>
              <div>
                <div className="font-semibold text-muted-foreground">Property Details</div>
                <div>{(propertyData.characteristics?.buildingArea || 0).toLocaleString()} sq ft</div>
                <div className="text-xs text-muted-foreground">
                  Built {propertyData.characteristics?.yearImproved || 'Unknown'}
                </div>
              </div>
              <div>
                <div className="font-semibold text-muted-foreground">Current Assessment</div>
                <div className="font-mono">{formatCurrency(currentTotal)}</div>
                <div className="text-xs text-muted-foreground">
                  Total Appraised Value
                </div>
              </div>
              <div>
                <div className="font-semibold text-muted-foreground">Neighborhood</div>
                <div className="font-mono">{propertyData.classification?.neighborhoodCode || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">
                  {propertyData.classification?.stateClass || 'N/A'} Class
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparable Properties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Comparable Properties
            </CardTitle>
            <CardDescription>
              Preview of similar properties - Get full access to all {comparablesData.total_found} comparables with detailed analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Free Comparables - Full Access */}
              {freeComparables.map((comp) => {
                const varianceVsYours = ((comp.financial_data.adjusted_value - currentTotal) / currentTotal) * 100;
                return (
                  <div key={comp.account_id} className="p-4 border rounded-lg bg-white shadow-sm">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <div className="font-semibold text-lg">{comp.address}</div>
                        <div className="text-sm text-muted-foreground">Account #{comp.account_id}</div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Year Built:</span>
                          <span className="font-medium">{comp.basic_info.year_built}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Square Feet:</span>
                          <span className="font-medium">{comp.basic_info.square_footage?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Condition:</span>
                          <span className="font-medium">{comp.basic_info.building_condition}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quality:</span>
                          <span className="font-medium">{comp.basic_info.building_quality}</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Adjusted Value:</span>
                          <span className="font-bold text-primary text-lg">
                            {formatCurrency(comp.financial_data.adjusted_value)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">vs Your Property:</span>
                          <Badge 
                            variant={varianceVsYours < -10 ? 'destructive' : varianceVsYours < -5 ? 'secondary' : 'outline'} 
                            className="text-xs font-medium"
                          >
                            {varianceVsYours > 0 ? '+' : ''}{varianceVsYours.toFixed(1)}%
                          </Badge>
                        </div>
                        {varianceVsYours < -10 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Appeal Status:</span>
                            <span className="text-xs text-red-600 font-medium">💡 Strong appeal evidence</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end justify-start space-y-2">
                      </div>
                    </div>
                    {/* Professional Adjustment Analysis */}
                    <div className="mt-4 pt-4 border-t bg-gradient-to-r from-blue-50 to-indigo-50 -mx-4 -mb-4 px-4 pb-4 rounded-b-lg">
                      <div className="text-sm">
                        <div className="font-semibold text-blue-900 mb-2">📊 Professional Adjustment Analysis:</div>
                        <div className="text-blue-800">
                          This feature is coming soon.
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Call to Action for More Comparables */}
              <div className="p-6 border-2 border-dashed border-primary/30 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 text-center">
                <div className="space-y-3">
                  <div className="text-lg font-bold text-primary">
                    Analyze All {comparablesData.total_found} Comparables
                  </div>
                  <div className="text-sm text-muted-foreground">
                    We analyze all {comparablesData.total_found} comparable properties and deliver the most effective ones for protesting your assessment
                  </div>
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Find properties with lower assessments</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Evidence-backed valuation insights</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <Button variant="outline" className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Download Example Report
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 flex-1" asChild>
                      <Link href={`/purchase?jurisdiction=HCAD&account=${accountId}`}>
                        <Download className="h-4 w-4 mr-2" />
                        Get Report
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Actions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">View Full Property Details</CardTitle>
              <CardDescription>
                See complete property information and assessment history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/view-my-property/hcad/${accountId}`}>
                  <Building2 className="h-4 w-4 mr-2" />
                  View Property Details
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Start New Search</CardTitle>
              <CardDescription>
                Search for comparables for a different property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/comparables">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Find New Comparables
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 