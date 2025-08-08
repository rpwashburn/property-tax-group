import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Scale, Users, Calendar, CheckCircle, AlertCircle } from "lucide-react"
import type { ApiPropertyResponse } from "@/lib/properties/types/types"

interface PropertyDetailsGridProps {
  propertyData: ApiPropertyResponse
}

export function PropertyDetailsGrid({ propertyData }: PropertyDetailsGridProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Building Details */}
      {propertyData.buildings && propertyData.buildings.length > 0 && (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Building Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {propertyData.buildings.map((building) => (
                <div key={`building-${building.buildingNumber}-${building.improvementModelCode}`} className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge variant="outline">Building {building.buildingNumber}</Badge>
                    <Badge variant="secondary">{building.typeDescription}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: "Type", value: building.buildingType },
                      { label: "Quality", value: building.buildingQuality },
                      { label: "Quality Code", value: building.buildingQualityCode },
                      { label: "Condition", value: building.buildingCondition },
                      { label: "Year Built", value: building.yearBuilt?.toString() },
                      { label: "Effective Year", value: building.effectiveYear?.toString() },
                      { label: "Square Feet", value: building.squareFeet?.toLocaleString() },
                      { label: "Replacement Cost", value: building.replacementCost?.toLocaleString() },
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-muted-foreground">{item.label}:</span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Characteristics */}
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Property Characteristics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "Land Area", value: `${propertyData.characteristics.landArea} sq ft` },
              { label: "Acreage", value: propertyData.characteristics.acreage },
              { label: "Building Area", value: `${propertyData.characteristics.buildingArea} sq ft` },
              ...(propertyData.characteristics.yearImproved
                ? [{ label: "Year Improved", value: propertyData.characteristics.yearImproved }]
                : []),
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 px-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground font-medium">{item.label}:</span>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Owner Information */}
      {propertyData.owners && propertyData.owners.length > 0 && (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Owner Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {propertyData.owners.map((owner, ownerIndex: number) => (
                <div key={`owner-${ownerIndex}-${owner.name}`} className="p-4 rounded-lg border bg-muted/30">
                  <div className="font-semibold text-lg mb-2 break-words">{owner.name}</div>
                  {owner.mailingAddress && (
                    <div className="text-muted-foreground text-sm whitespace-pre-line break-words mb-3">
                      {owner.mailingAddress}
                    </div>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {owner.ownershipType}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment Status & Timeline - Only show if status data is available */}
      {propertyData.status && (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Assessment Status & Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {propertyData.status.valueStatus && (
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground font-medium">Status:</span>
                  <Badge variant={propertyData.status.valueStatus === "Noticed" ? "destructive" : "secondary"}>
                    {propertyData.status.valueStatus}
                  </Badge>
                </div>
              )}

              {[
                ...(propertyData.status.noticeDate
                  ? [
                      {
                        label: "Notice Date",
                        value: new Date(propertyData.status.noticeDate).toLocaleDateString(),
                      },
                    ]
                  : []),
                ...(propertyData.status.newOwnerDate
                  ? [
                      {
                        label: "New Owner Date",
                        value: new Date(propertyData.status.newOwnerDate).toLocaleDateString(),
                      },
                    ]
                  : []),
                ...(propertyData.status.revisionDate
                  ? [
                      {
                        label: "Last Revision",
                        value: new Date(propertyData.status.revisionDate).toLocaleDateString(),
                      },
                    ]
                  : []),
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground font-medium">{item.label}:</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}

              {propertyData.status.protested && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  {propertyData.status.protested === "Y" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-medium">
                    {propertyData.status.protested === "Y" ? "Protest Filed" : "No Protest Filed"}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
