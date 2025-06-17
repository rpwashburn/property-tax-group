import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { ApiPropertyResponse } from "@/lib/properties/types/types"

interface CurrentAssessmentValuesProps {
  propertyData: ApiPropertyResponse
}

export function CurrentAssessmentValues({ propertyData }: CurrentAssessmentValuesProps) {
  return (
    <Card className="border-2 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Current Assessment Values
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <ValueCard
            title="Total Appraised Value"
            value={formatCurrency(propertyData.currentValues.totalAppraisedValue)}
            isPrimary={true}
          />
          <ValueCard title="Land Value" value={formatCurrency(propertyData.currentValues.landValue)} />
          <ValueCard title="Building Value" value={formatCurrency(propertyData.currentValues.buildingValue)} />
        </div>

        <Separator className="my-6" />

        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          {[
            { label: "Market Value", value: formatCurrency(propertyData.currentValues.totalMarketValue) },
            { label: "Assessed Value", value: formatCurrency(propertyData.currentValues.assessedValue) },
            ...(propertyData.currentValues.extraFeaturesValue !== "0.00"
              ? [
                  {
                    label: "Extra Features",
                    value: formatCurrency(propertyData.currentValues.extraFeaturesValue),
                  },
                ]
              : []),
            {
              label: "Replacement Cost",
              value: formatCurrency(propertyData.currentValues.totalReplacementCostValue),
            },
          ].map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2 px-3 rounded-lg bg-muted/30">
              <span className="text-muted-foreground font-medium">{item.label}:</span>
              <span className="font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ValueCard({ title, value, isPrimary = false }: { title: string; value: string; isPrimary?: boolean }) {
  return (
    <div
      className={cn("text-center p-4 rounded-lg", isPrimary ? "bg-primary/10 border border-primary/20" : "bg-muted/50")}
    >
      <div className={cn("text-2xl sm:text-3xl font-bold", isPrimary ? "text-primary" : "text-foreground")}>
        {value}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{title}</div>
    </div>
  )
}
