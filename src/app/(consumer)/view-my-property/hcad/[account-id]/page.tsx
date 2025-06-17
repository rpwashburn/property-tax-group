import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building2, MapPin, Home, DollarSign, Calendar, Users, FileText, TrendingUp, AlertCircle, CheckCircle, Clock, Scale, BarChart3, FileCheck } from "lucide-react"
import { getPropertyDataByAccountNumber, diagnosePropertyApiIssues } from "@/lib/properties"
import { formatCurrency } from "@/lib/utils"
import { CTACard } from "@/components/shared/CTACard"

interface ViewPropertyPageProps {
  params: Promise<{
    "account-id": string
  }>
}

export default async function ViewPropertyPage({ params }: ViewPropertyPageProps) {
  const { "account-id": accountId } = await params

  // Fetch property data from API
  let propertyData = null;
  let error = null;
  let diagnostics = null;

  try {
    propertyData = await getPropertyDataByAccountNumber(accountId);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch property data';
    console.error('Error fetching property data:', err);
    
    // Run diagnostics when there's an error
    try {
      diagnostics = await diagnosePropertyApiIssues();
    } catch (diagErr) {
      console.error('Failed to run diagnostics:', diagErr);
    }
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
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{error}</p>
              <p className="text-sm text-muted-foreground">
                Please check the account number and try again.
              </p>
              
              {/* Diagnostic Information */}
              {diagnostics && (
                <details className="mt-4 p-4 border rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                    🔍 Diagnostic Information (Click to expand)
                  </summary>
                  <div className="mt-2 space-y-2 text-xs font-mono">
                    <div><strong>Environment:</strong> {diagnostics.environment}</div>
                    <div><strong>Base URL:</strong> {diagnostics.baseUrl}</div>
                    <div><strong>Env Var Set:</strong> {diagnostics.envVarSet ? '✅' : '❌'}</div>
                    <div><strong>Health Check:</strong> {JSON.stringify(diagnostics.healthCheck)}</div>
                    <div><strong>Connectivity:</strong> {diagnostics.connectivityTest ? '✅' : '❌'}</div>
                    <div><strong>Sample URL:</strong> {diagnostics.sampleUrl}</div>
                    <div><strong>Timestamp:</strong> {diagnostics.timestamp}</div>
                  </div>
                </details>
              )}
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

  // Calculate year-over-year changes for both Market and Appraised values
  const currentMarket = parseFloat(propertyData.currentValues.totalMarketValue?.replace(/[^0-9.-]+/g, "") || "0");
  const priorMarket = parseFloat(propertyData.priorValues.totalMarketValue?.replace(/[^0-9.-]+/g, "") || "0");
  const marketChange = currentMarket - priorMarket;
  const marketPercentChange = priorMarket > 0 ? ((marketChange / priorMarket) * 100) : 0;

  const currentAppraised = parseFloat(propertyData.currentValues.totalAppraisedValue?.replace(/[^0-9.-]+/g, "") || "0");
  const priorAppraised = parseFloat(propertyData.priorValues.totalAppraisedValue?.replace(/[^0-9.-]+/g, "") || "0");
  const appraisedChange = currentAppraised - priorAppraised;
  const appraisedPercentChange = priorAppraised > 0 ? ((appraisedChange / priorAppraised) * 100) : 0;

  const currentLand = parseFloat(propertyData.currentValues.landValue?.replace(/[^0-9.-]+/g, "") || "0");
  const priorLand = parseFloat(propertyData.priorValues.landValue?.replace(/[^0-9.-]+/g, "") || "0");
  const landChange = currentLand - priorLand;

  const currentBuilding = parseFloat(propertyData.currentValues.buildingValue?.replace(/[^0-9.-]+/g, "") || "0");
  const priorBuilding = parseFloat(propertyData.priorValues.buildingValue?.replace(/[^0-9.-]+/g, "") || "0");
  const buildingChange = currentBuilding - priorBuilding;

  const currentExtraFeatures = parseFloat(propertyData.currentValues.extraFeaturesValue?.replace(/[^0-9.-]+/g, "") || "0");
  const priorExtraFeatures = parseFloat(propertyData.priorValues.extraFeaturesValue?.replace(/[^0-9.-]+/g, "") || "0");
  const extraFeaturesChange = currentExtraFeatures - priorExtraFeatures;

  // Determine if assessment increased significantly (for CTA messaging) - use appraised value
  const hasSignificantIncrease = appraisedChange > 0 && appraisedPercentChange > 5;

  return (
    <div className="py-6 px-4 sm:py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Property Details</h1>
            <p className="text-muted-foreground">Account #{accountId}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-2">
              <MapPin className="h-3 w-3" />
              Houston, TX (HCAD)
            </Badge>
            {propertyData.status.protested === 'Y' && (
              <Badge variant="destructive" className="gap-2">
                <AlertCircle className="h-3 w-3" />
                Protested
              </Badge>
            )}
            {propertyData.status.noticed === 'Y' && (
              <Badge variant="outline" className="gap-2">
                <Clock className="h-3 w-3" />
                Noticed
              </Badge>
            )}
          </div>
        </div>

        {/* Property Address & Key Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Property Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <div className="text-xl sm:text-2xl font-bold">
                  {propertyData.address.formattedAddress || propertyData.address.siteAddress1}
                </div>
                <div className="text-muted-foreground">
                  {propertyData.address.siteAddress2}, {propertyData.address.siteAddress3}
                </div>
                {propertyData.legal.description && (
                  <div className="text-sm text-muted-foreground mt-2">
                    Legal: {propertyData.legal.description}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">Property Type:</span>
                  <span className="font-medium text-right">{propertyData.classification.stateClass}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">School District:</span>
                  <span className="font-medium text-right">{propertyData.classification.schoolDistrict}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">Neighborhood:</span>
                  <span className="font-medium text-right">{propertyData.classification.neighborhoodCode}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">Data Year:</span>
                  <span className="font-medium text-right">{propertyData.characteristics.dataYear}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call-to-Action Section - Moved to top for better visibility */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-primary/20">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold">
              {hasSignificantIncrease 
                ? `Your Assessment Increased by ${formatCurrency(appraisedChange)} (${appraisedPercentChange.toFixed(1)}%)`
                : "Take Action on Your Property Assessment"
              }
            </CardTitle>
            <CardDescription className="text-base sm:text-lg">
              {hasSignificantIncrease 
                ? "That's a significant increase! Let us help you determine if it's fair and build a case if needed."
                : "Get professional insights to understand your property's true value and protect your investment."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              <CTACard
                title="View Comparables"
                description="See how your property assessment compares to similar properties in your neighborhood"
                icon={<BarChart3 className="h-5 w-5 text-primary" />}
                features={[
                  "Find properties with lower assessments",
                  "Evidence-backed valuation insights", 
                  "Professional PDF report for your records"
                ]}
                button={{
                  text: "View Comparables",
                  href: `/comparables/hcad/${accountId}`,
                  variant: "default"
                }}
                borderColor="border-primary/30"
              />

              <CTACard
                title="Get Protest Report"
                description="Protest documentation with comprehensive comparables analysis"
                icon={<FileCheck className="h-5 w-5 text-green-600" />}
                features={[
                  "Ready-to-file protest documents",
                  "Includes complete comparables report & evidence",
                  "Step-by-step filing instructions"
                ]}
                button={{
                  text: "Get Protest Report",
                  variant: "green"
                }}
                borderColor="border-green-300"
              />
            </div>

            {/* Additional messaging for high increases */}
            {hasSignificantIncrease && (() => {
              const currentDate = new Date();
              const currentMonth = currentDate.getMonth(); // 0-based: 0 = January, 4 = May
              const isPastMay = currentMonth > 4; // After May
              
              return (
                <div className={`mt-6 p-4 border rounded-lg ${isPastMay ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className={`h-5 w-5 mt-0.5 ${isPastMay ? 'text-red-600' : 'text-yellow-600'}`} />
                    <div>
                      <p className={`font-semibold ${isPastMay ? 'text-red-800' : 'text-yellow-800'}`}>
                        {isPastMay ? 'Verify Your Assessment' : 'Time-Sensitive Opportunity'}
                      </p>
                      <p className={`text-sm ${isPastMay ? 'text-red-700' : 'text-yellow-700'}`}>
                        {isPastMay ? (
                          <>
                            With an increase of {appraisedPercentChange.toFixed(1)}%, verify your assessment accuracy and get professional documentation for refinancing, insurance claims, or estate planning.
                          </>
                        ) : (
                          <>
                            With an increase of {appraisedPercentChange.toFixed(1)}%, you may have strong grounds for a successful protest. 
                            Property tax protest deadlines are typically in late May - don't wait!
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                ✓ 30-day money-back guarantee
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Values - Prominent Display */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Current Assessment Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  {formatCurrency(propertyData.currentValues.totalAppraisedValue)}
                </div>
                <div className="text-sm text-muted-foreground">Total Appraised Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold">
                  {formatCurrency(propertyData.currentValues.landValue)}
                </div>
                <div className="text-sm text-muted-foreground">Land Value</div>
              </div>
              <div className="text-center sm:col-span-2 lg:col-span-1">
                <div className="text-2xl sm:text-3xl font-bold">
                  {formatCurrency(propertyData.currentValues.buildingValue)}
                </div>
                <div className="text-sm text-muted-foreground">Building Value</div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Market Value:</span>
                <span className="font-medium">{formatCurrency(propertyData.currentValues.totalMarketValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assessed Value:</span>
                <span className="font-medium">{formatCurrency(propertyData.currentValues.assessedValue)}</span>
              </div>
              {propertyData.currentValues.extraFeaturesValue !== "0.00" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Extra Features:</span>
                  <span className="font-medium">{formatCurrency(propertyData.currentValues.extraFeaturesValue)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Replacement Cost:</span>
                <span className="font-medium">{formatCurrency(propertyData.currentValues.totalReplacementCostValue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Year-over-Year Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Year-over-Year Assessment Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Market Value vs Appraised Value Summary */}
            <div className="grid gap-4 sm:grid-cols-2 mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <div className="text-lg font-semibold">Market Value</div>
                <div className="text-sm text-muted-foreground">Sum of Land + Building + Extra Features</div>
                <div className="flex justify-between">
                  <span>Previous:</span>
                  <span>{formatCurrency(propertyData.priorValues.totalMarketValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current:</span>
                  <span className="font-medium">{formatCurrency(propertyData.currentValues.totalMarketValue)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span>Change:</span>
                  <div className="text-right">
                    <div className={`font-semibold ${marketChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {marketChange >= 0 ? '+' : ''}{formatCurrency(marketChange)}
                    </div>
                    <div className={`text-xs ${marketChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ({marketChange >= 0 ? '+' : ''}{marketPercentChange.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-lg font-semibold">Appraised Value</div>
                <div className="text-sm text-muted-foreground">Market value with assessment limitations</div>
                <div className="flex justify-between">
                  <span>Previous:</span>
                  <span>{formatCurrency(propertyData.priorValues.totalAppraisedValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current:</span>
                  <span className="font-medium">{formatCurrency(propertyData.currentValues.totalAppraisedValue)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span>Change:</span>
                  <div className="text-right">
                    <div className={`font-semibold ${appraisedChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {appraisedChange >= 0 ? '+' : ''}{formatCurrency(appraisedChange)}
                    </div>
                    <div className={`text-xs ${appraisedChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ({appraisedChange >= 0 ? '+' : ''}{appraisedPercentChange.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Component Breakdown */}
            <div className="mb-4">
              <h4 className="font-semibold mb-3">Market Value Components</h4>
            </div>
            <div className={`grid gap-6 sm:grid-cols-2 ${(currentExtraFeatures > 0 || priorExtraFeatures > 0) ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
              
              <div className="space-y-3">
                <div className="text-lg font-semibold">Land Value</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Previous:</span>
                    <span>{formatCurrency(propertyData.priorValues.landValue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current:</span>
                    <span className="font-medium">{formatCurrency(propertyData.currentValues.landValue)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-muted-foreground">Change:</span>
                    <div className={`font-semibold ${landChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {landChange >= 0 ? '+' : ''}{formatCurrency(landChange)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="text-lg font-semibold">Building Value</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Previous:</span>
                    <span>{formatCurrency(propertyData.priorValues.buildingValue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current:</span>
                    <span className="font-medium">{formatCurrency(propertyData.currentValues.buildingValue)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-muted-foreground">Change:</span>
                    <div className={`font-semibold ${buildingChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {buildingChange >= 0 ? '+' : ''}{formatCurrency(buildingChange)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra Features - only show if there are any values */}
              {(currentExtraFeatures > 0 || priorExtraFeatures > 0) && (
                <div className="space-y-3">
                  <div className="text-lg font-semibold">Extra Features</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Previous:</span>
                      <span>{formatCurrency(propertyData.priorValues.extraFeaturesValue || "0")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current:</span>
                      <span className="font-medium">{formatCurrency(propertyData.currentValues.extraFeaturesValue || "0")}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-muted-foreground">Change:</span>
                      <div className={`font-semibold ${extraFeaturesChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {extraFeaturesChange >= 0 ? '+' : ''}{formatCurrency(extraFeaturesChange)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Math validation note */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Breakdown:</strong> Current Market Value ({formatCurrency(currentMarket)}) = 
                Land ({formatCurrency(currentLand)}) + Building ({formatCurrency(currentBuilding)})
                {currentExtraFeatures > 0 && ` + Extra Features (${formatCurrency(currentExtraFeatures)})`}
                <br />
                <strong>Note:</strong> Appraised Value ({formatCurrency(currentAppraised)}) may be lower due to assessment limitations or homestead caps.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Building Details */}
          {propertyData.buildings && propertyData.buildings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Building Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {propertyData.buildings.map((building) => (
                  <div key={`building-${building.bldNum}-${building.code}`} className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">Building {building.bldNum}</Badge>
                      <Badge variant="secondary">{building.categoryDscr}</Badge>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between items-start">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium text-right">{building.typeDscr}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-muted-foreground">Code:</span>
                        <span className="font-medium text-right">{building.code}</span>
                      </div>
                      {building.adj && (
                        <div className="flex justify-between items-start">
                          <span className="text-muted-foreground">Adjustment:</span>
                          <span className="font-medium text-right">{building.adj}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Property Characteristics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Property Characteristics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Land Area:</span>
                <span className="font-medium text-right">{propertyData.characteristics.landArea} sq ft</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Acreage:</span>
                <span className="font-medium text-right">{propertyData.characteristics.acreage}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Building Area:</span>
                <span className="font-medium text-right">{propertyData.characteristics.buildingArea} sq ft</span>
              </div>
              {propertyData.characteristics.yearImproved && (
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">Year Improved:</span>
                  <span className="font-medium text-right">{propertyData.characteristics.yearImproved}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Owner Information */}
          {propertyData.owners && propertyData.owners.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Owner Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {propertyData.owners.map((owner, index) => (
                  <div key={`owner-${index}-${owner.name}`} className="space-y-2">
                    <div className="font-semibold break-words">{owner.name}</div>
                    {owner.mailingAddress && (
                      <div className="text-muted-foreground text-sm whitespace-pre-line break-words">
                        {owner.mailingAddress}
                      </div>
                    )}
                    <Badge variant="outline" className="text-xs">{owner.ownershipType}</Badge>
                    {index < propertyData.owners.length - 1 && <Separator className="my-3" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Assessment Status & Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Assessment Status & Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={propertyData.status.valueStatus === 'Noticed' ? 'destructive' : 'secondary'}>
                  {propertyData.status.valueStatus}
                </Badge>
              </div>
              {propertyData.status.noticeDate && (
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">Notice Date:</span>
                  <span className="font-medium text-right">
                    {new Date(propertyData.status.noticeDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {propertyData.status.newOwnerDate && (
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">New Owner Date:</span>
                  <span className="font-medium text-right">
                    {new Date(propertyData.status.newOwnerDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {propertyData.status.revisionDate && (
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">Last Revision:</span>
                  <span className="font-medium text-right">
                    {new Date(propertyData.status.revisionDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 pt-2">
                {propertyData.status.protested === 'Y' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">
                  {propertyData.status.protested === 'Y' ? 'Protest Filed' : 'No Protest Filed'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Information */}
        {propertyData.marketInfo.marketArea1Description && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Market Area Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-sm text-muted-foreground">Market Area 1</div>
                  <div className="font-medium break-words">{propertyData.marketInfo.marketArea1} - {propertyData.marketInfo.marketArea1Description}</div>
                </div>
                {propertyData.marketInfo.marketArea2Description && (
                  <div>
                    <div className="text-sm text-muted-foreground">Market Area 2</div>
                    <div className="font-medium break-words">{propertyData.marketInfo.marketArea2} - {propertyData.marketInfo.marketArea2Description}</div>
                  </div>
                )}
              </div>
              {propertyData.classification.jurisdiction && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">Jurisdictions</div>
                  <div className="font-mono text-sm break-all">{propertyData.classification.jurisdiction}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 