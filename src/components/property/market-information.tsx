import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"
import type { ApiPropertyResponse } from "@/lib/properties/types/types"

interface MarketInformationProps {
  propertyData: ApiPropertyResponse
}

export function MarketInformation({ propertyData }: MarketInformationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Market Area Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="p-4 rounded-lg border bg-muted/30">
            <div className="text-sm text-muted-foreground mb-1">Market Area 1</div>
            <div className="font-medium break-words">
              {propertyData.marketInfo.marketArea1} - {propertyData.marketInfo.marketArea1Description}
            </div>
          </div>
          {propertyData.marketInfo.marketArea2Description && (
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="text-sm text-muted-foreground mb-1">Market Area 2</div>
              <div className="font-medium break-words">
                {propertyData.marketInfo.marketArea2} - {propertyData.marketInfo.marketArea2Description}
              </div>
            </div>
          )}
        </div>
        {propertyData.classification.jurisdiction && (
          <div className="mt-6 p-4 rounded-lg border bg-muted/30">
            <div className="text-sm text-muted-foreground mb-2">Jurisdictions</div>
            <div className="font-mono text-sm break-all">{propertyData.classification.jurisdiction}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
