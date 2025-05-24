"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Download, Clock, Ruler, TrendingDown, Users, LucideIcon } from "lucide-react"
import type { SubjectProperty, AdjustedComparable } from "@/lib/property-analysis/types"

interface GroupedComparablesViewProps {
  groupedComparables: {
    closestByAge: AdjustedComparable[]
    closestBySqFt: AdjustedComparable[]
    lowestByValue: AdjustedComparable[]
  }
  groupMembershipIds: {
    closestByAgeIds: Set<string>
    closestBySqFtIds: Set<string>
    lowestByValueIds: Set<string>
  }
  subjectProperty: SubjectProperty
}

export function GroupedComparablesView({ 
  groupedComparables, 
  groupMembershipIds, 
  subjectProperty 
}: GroupedComparablesViewProps) {
  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'N/A'
    return `$${value.toLocaleString()}`
  }

  const formatPSF = (adjustedValue: number | undefined, sqft: string | null) => {
    if (!adjustedValue || !sqft) return 'N/A'
    const sqftNum = parseInt(sqft, 10)
    if (sqftNum <= 0) return 'N/A'
    return `$${(adjustedValue / sqftNum).toFixed(2)}`
  }

  // Calculate the actual square footage range being used (matches the logic in comparable-service.ts)
  const calculateSqFtRange = (subjectSqFt: number): number => {
    if (subjectSqFt <= 1500) {
      return 150;
    } else if (subjectSqFt <= 2500) {
      return 300;
    } else if (subjectSqFt <= 3500) {
      return 450;
    } else {
      return Infinity; // No limit for properties > 3500 sqft
    }
  }

  const handleExportGroup = (groupName: string, comparables: AdjustedComparable[]) => {
    const headers = [
      'Account', 'Address', 'Year Built', 'Building SqFt', 'Market Value',
      'Adjusted Value', 'Adjusted PSF', 'Age Diff', 'SqFt Diff', 'Membership'
    ]

    const subjectYear = parseInt(subjectProperty.yrImpr || '0', 10)
    const subjectSqFt = parseInt(subjectProperty.bldAr || '0', 10)

    const csvRows = [
      headers.join(','),
      ...comparables.map(comp => {
        const ageDiff = Math.abs(parseInt(comp.yrImpr || '0', 10) - subjectYear)
        const sqftDiff = Math.abs(parseInt(comp.bldAr || '0', 10) - subjectSqFt)
        const sqft = parseInt(comp.bldAr || '0', 10)
        const adjustedPSF = comp.adjustments?.totalAdjustedValue && sqft > 0 
          ? (comp.adjustments.totalAdjustedValue / sqft).toFixed(2)
          : 'N/A'

        // Determine group membership
        const groups: string[] = []
        if (groupMembershipIds.closestByAgeIds.has(comp.id)) groups.push('Age')
        if (groupMembershipIds.closestBySqFtIds.has(comp.id)) groups.push('SqFt')
        if (groupMembershipIds.lowestByValueIds.has(comp.id)) groups.push('Value')

        return [
          comp.acct,
          comp.siteAddr1 || '',
          comp.yrImpr || '',
          comp.bldAr || '',
          comp.totMktVal || '',
          comp.adjustments?.totalAdjustedValue || '',
          adjustedPSF,
          ageDiff,
          sqftDiff,
          groups.join(', ')
        ].map(field => {
          const stringField = String(field)
          return stringField.includes(',') ? `"${stringField}"` : stringField
        }).join(',')
      })
    ]

    const csvString = csvRows.join('\n')
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${groupName}_group_${subjectProperty.acct}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const ComparableTable = ({ 
    comparables, 
    groupName,
    icon: Icon,
    description,
    sortMetric
  }: {
    comparables: AdjustedComparable[]
    groupName: string
    icon: LucideIcon
    description: string
    sortMetric: (comp: AdjustedComparable) => string | number
  }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              {groupName} ({comparables.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExportGroup(groupName.toLowerCase().replace(' ', '_'), comparables)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Year Built</TableHead>
                <TableHead>Building SqFt</TableHead>
                <TableHead>Market Value</TableHead>
                <TableHead>Adjusted Value</TableHead>
                <TableHead>Adj PSF</TableHead>
                <TableHead>Sort Metric</TableHead>
                <TableHead>Groups</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparables.map((comp, index) => {
                // Determine group membership
                const groups: string[] = []
                if (groupMembershipIds.closestByAgeIds.has(comp.id)) groups.push('Age')
                if (groupMembershipIds.closestBySqFtIds.has(comp.id)) groups.push('SqFt')
                if (groupMembershipIds.lowestByValueIds.has(comp.id)) groups.push('Value')

                return (
                  <TableRow key={comp.id}>
                    <TableCell>
                      <Badge variant="outline">#{index + 1}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {comp.siteAddr1 || 'N/A'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {comp.acct}
                    </TableCell>
                    <TableCell>{comp.yrImpr}</TableCell>
                    <TableCell>{parseInt(comp.bldAr || '0', 10).toLocaleString()}</TableCell>
                    <TableCell>{formatCurrency(parseInt(comp.totMktVal || '0', 10))}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(comp.adjustments?.totalAdjustedValue)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPSF(comp.adjustments?.totalAdjustedValue, comp.bldAr)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {sortMetric(comp)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {groups.map(group => (
                          <Badge key={group} variant="outline" className="text-xs">
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )

  const subjectYear = parseInt(subjectProperty.yrImpr || '0', 10)
  const subjectSqFt = parseInt(subjectProperty.bldAr || '0', 10)
  const actualSqFtRange = calculateSqFtRange(subjectSqFt)

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Grouped Comparables Overview
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Properties are grouped into 3 categories based on their similarity to the subject property:
            Age group (±10 years), Size group (tiered ranges), and Value group (top 5 lowest). 
            The final set combines and deduplicates these groups.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Closest by Age</span>
              </div>
              <div className="text-2xl font-bold">{groupedComparables.closestByAge.length}</div>
              <div className="text-sm text-muted-foreground">
                Properties within ±10 years of {subjectYear}
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="h-4 w-4 text-green-600" />
                <span className="font-medium">Closest by Size</span>
              </div>
              <div className="text-2xl font-bold">{groupedComparables.closestBySqFt.length}</div>
              <div className="text-sm text-muted-foreground">
                {actualSqFtRange === Infinity 
                  ? `All properties (no size limit for ${subjectSqFt.toLocaleString()}+ sqft)`
                  : `Properties within ±${actualSqFtRange} sqft of ${subjectSqFt.toLocaleString()}`
                }
              </div>
              {actualSqFtRange !== Infinity && (
                <div className="text-xs text-muted-foreground mt-1">
                  Range: {(subjectSqFt - actualSqFtRange).toLocaleString()} - {(subjectSqFt + actualSqFtRange).toLocaleString()} sqft
                </div>
              )}
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Lowest Value</span>
              </div>
              <div className="text-2xl font-bold">{groupedComparables.lowestByValue.length}</div>
              <div className="text-sm text-muted-foreground">
                Properties with lowest adjusted values
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grouped Tables */}
      <Tabs defaultValue="closest-age" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="closest-age">Closest by Age</TabsTrigger>
          <TabsTrigger value="closest-sqft">Closest by Size</TabsTrigger>
          <TabsTrigger value="lowest-value">Lowest Value</TabsTrigger>
        </TabsList>

        <TabsContent value="closest-age">
          <ComparableTable
            comparables={groupedComparables.closestByAge}
            groupName="Closest by Age"
            icon={Clock}
            description="Properties within ±10 years of the subject property's year built"
            sortMetric={(comp) => `${Math.abs(parseInt(comp.yrImpr || '0', 10) - subjectYear)} yrs`}
          />
        </TabsContent>

        <TabsContent value="closest-sqft">
          <ComparableTable
            comparables={groupedComparables.closestBySqFt}
            groupName="Closest by Size"
            icon={Ruler}
            description={
              actualSqFtRange === Infinity 
                ? "All properties included (no size restrictions for properties >3500 sqft)"
                : `Properties within tiered square footage range (≤1500: ±150, 1500-2500: ±300, 2500-3500: ±450)`
            }
            sortMetric={(comp) => `${Math.abs(parseInt(comp.bldAr || '0', 10) - subjectSqFt).toLocaleString()} sqft`}
          />
        </TabsContent>

        <TabsContent value="lowest-value">
          <ComparableTable
            comparables={groupedComparables.lowestByValue}
            groupName="Lowest Value"
            icon={TrendingDown}
            description="Properties with the lowest adjusted values (favorable for tax appeals)"
            sortMetric={(comp) => formatCurrency(comp.adjustments?.totalAdjustedValue)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 