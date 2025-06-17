"use client"

import { useState, useMemo } from "react"
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
import { Download, Target, Info, Clock, Ruler, TrendingDown, SortAsc, SortDesc } from "lucide-react"
import type { SubjectProperty, AdjustedComparable } from "@/lib/comparables/types"

interface FinalComparablesViewProps {
  finalComparables: AdjustedComparable[]
  groupMembershipIds: {
    closestByAgeIds: Set<string>
    closestBySqFtIds: Set<string>
    lowestByValueIds: Set<string>
  }
  subjectProperty: SubjectProperty
}

type SortField = 'address' | 'yearBuilt' | 'sqft' | 'marketValue' | 'adjustedValue' | 'adjustedPSF' | 'comparableScore'
type SortDirection = 'asc' | 'desc'

export function FinalComparablesView({ 
  finalComparables, 
  groupMembershipIds, 
  subjectProperty 
}: FinalComparablesViewProps) {
  const [sortField, setSortField] = useState<SortField>('comparableScore')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc') // Start with highest scores first

  // Sort the comparables based on the current sort settings
  const sortedComparables = useMemo(() => {
    return [...finalComparables].sort((a, b) => {
      let aVal: number | string = 0
      let bVal: number | string = 0
      
      switch (sortField) {
        case 'address':
          aVal = a.siteAddr1 || ''
          bVal = b.siteAddr1 || ''
          break
        case 'yearBuilt':
          aVal = parseInt(a.yrImpr || '0', 10)
          bVal = parseInt(b.yrImpr || '0', 10)
          break
        case 'sqft':
          aVal = parseInt(a.bldAr || '0', 10)
          bVal = parseInt(b.bldAr || '0', 10)
          break
        case 'marketValue':
          aVal = parseInt(a.totMktVal || '0', 10)
          bVal = parseInt(b.totMktVal || '0', 10)
          break
        case 'adjustedValue':
          aVal = a.adjustments?.totalAdjustedValue || 0
          bVal = b.adjustments?.totalAdjustedValue || 0
          break
        case 'adjustedPSF':
          const aSqft = parseInt(a.bldAr || '0', 10)
          const bSqft = parseInt(b.bldAr || '0', 10)
          aVal = aSqft > 0 ? (a.adjustments?.totalAdjustedValue || 0) / aSqft : 0
          bVal = bSqft > 0 ? (b.adjustments?.totalAdjustedValue || 0) / bSqft : 0
          break
        case 'comparableScore':
          aVal = a.adjustments?.comparableScore || 0
          bVal = b.adjustments?.comparableScore || 0
          break
      }
      
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal)
      } else {
        return sortDirection === 'asc' ? aVal - (bVal as number) : (bVal as number) - aVal
      }
    })
  }, [finalComparables, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection(field === 'comparableScore' ? 'desc' : 'asc') // Default to desc for score, asc for others
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
  }

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
      'Adjusted Improvement Value', 'Total Adjusted Value', 'Adjusted PSF', 'Group Membership',
      'Comparable Score'
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
          `"${groups.join(', ')}"`,
          comp.adjustments?.comparableScore || 'N/A'
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

  // Calculate score statistics
  const scores = finalComparables
    .map(c => c.adjustments?.comparableScore)
    .filter((score): score is number => score !== undefined && score !== null)
  
  const scoreStats = {
    average: scores.length > 0 ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100 : 0,
    highest: scores.length > 0 ? Math.max(...scores) : 0,
    lowest: scores.length > 0 ? Math.min(...scores) : 0,
    count: scores.length
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
                Intelligently Selected Comparable Properties
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Properties selected through intelligent criteria combining score quality and value strategy. 
                Count varies based on data - minimum 3, expanded for lower-value properties with competitive scores.
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
              Properties are selected through a three-step intelligent process:
              <br />
              <strong>Step 1:</strong> Group by age, square footage, and value criteria, then deduplicate to get quality comparables.
              <br />
              <strong>Step 2:</strong> Select the top 3 comparables by score (minimum set).
              <br />
              <strong>Step 3:</strong> Add properties with scores within 15% of the lowest initial score AND adjusted values lower than the highest in the initial set.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mt-4">
            {/* Group Statistics */}
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
            
            {/* Score Statistics */}
            <div className="p-3 border rounded-lg text-center bg-emerald-50">
              <div className="text-2xl font-bold text-emerald-600">{scoreStats.highest}</div>
              <div className="text-sm text-muted-foreground">Highest Score</div>
            </div>
            <div className="p-3 border rounded-lg text-center bg-yellow-50">
              <div className="text-2xl font-bold text-yellow-600">{scoreStats.average}</div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
            <div className="p-3 border rounded-lg text-center bg-red-50">
              <div className="text-2xl font-bold text-red-600">{scoreStats.lowest}</div>
              <div className="text-sm text-muted-foreground">Lowest Score</div>
            </div>
            <div className="p-3 border rounded-lg text-center bg-slate-50">
              <div className="text-2xl font-bold text-slate-600">{scoreStats.count}</div>
              <div className="text-sm text-muted-foreground">With Scores</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Comparables Table */}
      <Card>
        <CardHeader>
          <CardTitle>Selected Comparable Properties Dataset</CardTitle>
          <p className="text-sm text-muted-foreground">
            Properties selected through intelligent criteria combining score quality and value strategy. 
            Additional comparables must be lower than the highest value in the top-scoring set and have competitive scores.
          </p>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleSort('address')}
                  >
                    <div className="flex items-center gap-1">
                      Address <SortIcon field="address" />
                    </div>
                  </TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleSort('yearBuilt')}
                  >
                    <div className="flex items-center gap-1">
                      Year Built <SortIcon field="yearBuilt" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleSort('sqft')}
                  >
                    <div className="flex items-center gap-1">
                      Building SqFt <SortIcon field="sqft" />
                    </div>
                  </TableHead>
                  <TableHead>Grade/Condition</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleSort('marketValue')}
                  >
                    <div className="flex items-center gap-1">
                      Market Value <SortIcon field="marketValue" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleSort('adjustedValue')}
                  >
                    <div className="flex items-center gap-1">
                      Adjusted Value <SortIcon field="adjustedValue" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleSort('adjustedPSF')}
                  >
                    <div className="flex items-center gap-1">
                      Adj PSF <SortIcon field="adjustedPSF" />
                    </div>
                  </TableHead>
                  <TableHead>Selection Groups</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleSort('comparableScore')}
                  >
                    <div className="flex items-center gap-1">
                      Comparable Score <SortIcon field="comparableScore" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedComparables.map((comp) => {
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
                      <TableCell>{comp.adjustments?.comparableScore || 'N/A'}</TableCell>
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