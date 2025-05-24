"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Download, Target, Info, Clock, Ruler, TrendingDown } from "lucide-react"
import type { SubjectProperty, AdjustedComparable } from "@/lib/property-analysis/types"

interface FinalComparablesViewProps {
  finalComparables: AdjustedComparable[]
  groupMembershipIds: {
    closestByAgeIds: Set<string>
    closestBySqFtIds: Set<string>
    lowestByValueIds: Set<string>
  }
  subjectProperty: SubjectProperty
}

export function FinalComparablesView({ 
  finalComparables, 
  groupMembershipIds, 
  subjectProperty 
}: FinalComparablesViewProps) {
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

  const handleExportFinalSet = () => {
    const headers = [
      'Account', 'Address', 'Neighborhood', 'Year Built', 'Building SqFt', 'Land SqFt',
      'Grade', 'Condition', 'Market Value', 'Land Value', 'Building Value', 
      'Comp Impr PSF', 'Size Adjustment', 'Age Adjustment', 'Land Adjustment',
      'Adjusted Improvement Value', 'Total Adjusted Value', 'Adjusted PSF', 'Group Membership'
    ]

    const csvRows = [
      headers.join(','),
      ...finalComparables.map(comp => {
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
          comp.neighborhoodCode || '',
          comp.yrImpr || '',
          comp.bldAr || '',
          comp.landAr || '',
          comp.grade || '',
          comp.condition || '',
          comp.totMktVal || '',
          comp.landVal || '',
          comp.bldVal || '',
          comp.adjustments?.compImprPSF || '',
          comp.adjustments?.sizeAdjustment || '',
          comp.adjustments?.ageAdjustment || '',
          comp.adjustments?.landAdjustmentAmount || '',
          comp.adjustments?.adjustedImprovementValue || '',
          comp.adjustments?.totalAdjustedValue || '',
          adjustedPSF,
          `"${groups.join(', ')}"`
        ].map(field => {
          const stringField = String(field)
          return stringField.includes(',') && !stringField.startsWith('"') ? `"${stringField}"` : stringField
        }).join(',')
      })
    ]

    const csvString = csvRows.join('\n')
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `final_comparable_set_${subjectProperty.acct}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Calculate statistics
  const groupStats = {
    ageOnly: finalComparables.filter(c => 
      groupMembershipIds.closestByAgeIds.has(c.id) && 
      !groupMembershipIds.closestBySqFtIds.has(c.id) && 
      !groupMembershipIds.lowestByValueIds.has(c.id)
    ).length,
    sqftOnly: finalComparables.filter(c => 
      !groupMembershipIds.closestByAgeIds.has(c.id) && 
      groupMembershipIds.closestBySqFtIds.has(c.id) && 
      !groupMembershipIds.lowestByValueIds.has(c.id)
    ).length,
    valueOnly: finalComparables.filter(c => 
      !groupMembershipIds.closestByAgeIds.has(c.id) && 
      !groupMembershipIds.closestBySqFtIds.has(c.id) && 
      groupMembershipIds.lowestByValueIds.has(c.id)
    ).length,
    multipleGroups: finalComparables.filter(c => {
      const groupCount = [
        groupMembershipIds.closestByAgeIds.has(c.id),
        groupMembershipIds.closestBySqFtIds.has(c.id),
        groupMembershipIds.lowestByValueIds.has(c.id)
      ].filter(Boolean).length
      return groupCount > 1
    }).length
  }

  const getGroupBadges = (comp: AdjustedComparable) => {
    const badges = []
    if (groupMembershipIds.closestByAgeIds.has(comp.id)) {
      badges.push({ label: 'Age', icon: Clock, color: 'bg-blue-100 text-blue-800' })
    }
    if (groupMembershipIds.closestBySqFtIds.has(comp.id)) {
      badges.push({ label: 'SqFt', icon: Ruler, color: 'bg-green-100 text-green-800' })
    }
    if (groupMembershipIds.lowestByValueIds.has(comp.id)) {
      badges.push({ label: 'Value', icon: TrendingDown, color: 'bg-orange-100 text-orange-800' })
    }
    return badges
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Final Comparable Set for AI Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Deduplicated set of {finalComparables.length} properties that will be sent to AI for ranking and selection
              </p>
            </div>
            <Button onClick={handleExportFinalSet} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Final Set
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This is the exact dataset that gets formatted and sent to the AI for analysis. 
              The AI will select the best comparable properties from this set based on similarity and value considerations.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="p-3 border rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{groupStats.ageOnly}</div>
              <div className="text-sm text-muted-foreground">Age Group Only</div>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{groupStats.sqftOnly}</div>
              <div className="text-sm text-muted-foreground">SqFt Group Only</div>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{groupStats.valueOnly}</div>
              <div className="text-sm text-muted-foreground">Value Group Only</div>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{groupStats.multipleGroups}</div>
              <div className="text-sm text-muted-foreground">Multiple Groups</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Comparables Table */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Dataset for AI Analysis</CardTitle>
          <p className="text-sm text-muted-foreground">
            Each property shows which selection group(s) it belongs to. Properties in multiple groups 
            are considered stronger candidates.
          </p>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Address</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Year Built</TableHead>
                  <TableHead>Building SqFt</TableHead>
                  <TableHead>Grade/Condition</TableHead>
                  <TableHead>Market Value</TableHead>
                  <TableHead>Adjusted Value</TableHead>
                  <TableHead>Adj PSF</TableHead>
                  <TableHead>Selection Groups</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {finalComparables.map((comp) => {
                  const groupBadges = getGroupBadges(comp)
                  
                  return (
                    <TableRow key={comp.id}>
                      <TableCell className="font-medium">
                        {comp.siteAddr1 || 'N/A'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {comp.acct}
                      </TableCell>
                      <TableCell>{comp.yrImpr}</TableCell>
                      <TableCell>{parseInt(comp.bldAr || '0', 10).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{comp.grade || 'N/A'}</span>
                          <span className="text-xs text-muted-foreground">
                            {comp.condition || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(parseInt(comp.totMktVal || '0', 10))}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(comp.adjustments?.totalAdjustedValue)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPSF(comp.adjustments?.totalAdjustedValue, comp.bldAr)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {groupBadges.map(({ label, icon: Icon, color }) => (
                            <Badge 
                              key={label} 
                              variant="outline" 
                              className={`text-xs ${color} border-transparent`}
                            >
                              <Icon className="h-3 w-3 mr-1" />
                              {label}
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
    </div>
  )
} 