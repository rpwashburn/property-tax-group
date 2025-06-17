import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Minus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { ApiPropertyResponse } from "@/lib/properties/types/types"

interface CalculatedValues {
  currentMarket: number;
  currentLand: number;
  currentBuilding: number;
  currentExtraFeatures: number;
  currentAppraised: number;
  marketChange: number;
  appraisedChange: number;
  landChange: number;
  buildingChange: number;
  extraFeaturesChange: number;
  priorExtraFeatures: number;
}

interface YearOverYearComparisonProps {
  propertyData: ApiPropertyResponse
  comparisonData: CalculatedValues
}

export function YearOverYearComparison({ propertyData, comparisonData }: YearOverYearComparisonProps) {
  const {
    currentMarket,
    currentLand,
    currentBuilding,
    currentExtraFeatures,
    currentAppraised,
    marketChange,
    appraisedChange,
    landChange,
    buildingChange,
    extraFeaturesChange,
    priorExtraFeatures,
  } = comparisonData

  return (
    <Card className="border-2 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-400" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Year-over-Year Assessment Changes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <ComparisonCard
            title="Market Value"
            subtitle="Sum of Land + Building + Extra Features"
            previousValue={formatCurrency(propertyData.priorValues.totalMarketValue)}
            currentValue={formatCurrency(propertyData.currentValues.totalMarketValue)}
            change={marketChange}
          />
          <ComparisonCard
            title="Appraised Value"
            subtitle="Market value with assessment limitations"
            previousValue={formatCurrency(propertyData.priorValues.totalAppraisedValue)}
            currentValue={formatCurrency(propertyData.currentValues.totalAppraisedValue)}
            change={appraisedChange}
          />
        </div>

        {/* Component Breakdown */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Market Value Components</h4>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ComponentCard
              title="Land Value"
              previousValue={formatCurrency(propertyData.priorValues.landValue)}
              currentValue={formatCurrency(propertyData.currentValues.landValue)}
              change={landChange}
            />
            <ComponentCard
              title="Building Value"
              previousValue={formatCurrency(propertyData.priorValues.buildingValue)}
              currentValue={formatCurrency(propertyData.currentValues.buildingValue)}
              change={buildingChange}
            />
            {(currentExtraFeatures > 0 || priorExtraFeatures > 0) && (
              <ComponentCard
                title="Extra Features"
                previousValue={formatCurrency(propertyData.priorValues.extraFeaturesValue || "0")}
                currentValue={formatCurrency(propertyData.currentValues.extraFeaturesValue || "0")}
                change={extraFeaturesChange}
              />
            )}
          </div>
        </div>

        {/* Explanation */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-start gap-3">
            <Minus className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Assessment Breakdown:</p>
              <p>
                Current Market Value ({formatCurrency(currentMarket)}) = Land ({formatCurrency(currentLand)}) + Building
                ({formatCurrency(currentBuilding)})
                {currentExtraFeatures > 0 && ` + Extra Features (${formatCurrency(currentExtraFeatures)})`}
              </p>
              <p className="mt-2">
                <strong>Note:</strong> Appraised Value ({formatCurrency(currentAppraised)}) may be lower due to
                assessment limitations or homestead caps.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ComparisonCard({
  title,
  subtitle,
  previousValue,
  currentValue,
  change,
}: {
  title: string
  subtitle: string
  previousValue: string
  currentValue: string
  change: number
}) {
  return (
    <Card className="p-4 bg-muted/30">
      <div className="space-y-3">
        <div>
          <div className="text-lg font-semibold">{title}</div>
          <div className="text-sm text-muted-foreground">{subtitle}</div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Previous:</span>
            <span>{previousValue}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Current:</span>
            <span className="font-medium">{currentValue}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span>Change:</span>
            <div className={cn("text-right", change >= 0 ? "text-red-600" : "text-green-600")}>
              {change >= 0 ? "+" : ""}
              {formatCurrency(change)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

function ComponentCard({
  title,
  previousValue,
  currentValue,
  change,
}: {
  title: string
  previousValue: string
  currentValue: string
  change: number
}) {
  return (
    <Card className="p-4 bg-muted/30">
      <div className="space-y-3">
        <div className="text-lg font-semibold">{title}</div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Previous:</span>
            <span>{previousValue}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current:</span>
            <span className="font-medium">{currentValue}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-muted-foreground">Change:</span>
            <div className={cn("font-semibold", change >= 0 ? "text-red-600" : "text-green-600")}>
              {change >= 0 ? "+" : ""}
              {formatCurrency(change)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
