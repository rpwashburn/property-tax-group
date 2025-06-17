import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"
import type { ApiPropertyResponse } from "@/lib/properties/types/types"

interface PropertyOverviewProps {
  propertyData: ApiPropertyResponse
}

export function PropertyOverview({ propertyData }: PropertyOverviewProps) {
  return (
    <Card className="overflow-hidden border-2">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/60" />
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-4 w-4 text-primary" />
          Property Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 pb-4">
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Address Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-2">
            <div className="text-lg sm:text-xl font-bold text-primary">
              {propertyData.address.formattedAddress || propertyData.address.siteAddress1}
            </div>
            <div className="text-sm text-muted-foreground">
              {propertyData.address.siteAddress2}, {propertyData.address.siteAddress3}
            </div>
            {propertyData.legal.description && (
              <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                <span className="font-medium">Legal:</span> {propertyData.legal.description}
              </div>
            )}
          </div>
          
          {/* Property Details - Takes 1 column on large screens */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 text-sm">
            {[
              { label: "Type", value: propertyData.classification.stateClass },
              { label: "School District", value: propertyData.classification.schoolDistrict },
              { label: "Neighborhood", value: propertyData.classification.neighborhoodCode },
              { label: "Data Year", value: propertyData.characteristics.dataYear },
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-muted-foreground">{item.label}:</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
