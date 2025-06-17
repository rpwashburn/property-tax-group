"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download, Filter, SortAsc, SortDesc } from "lucide-react"
import type { SubjectProperty, AdjustedComparable } from "@/lib/comparables/types"

interface AllComparablesTableProps {
  comparables: AdjustedComparable[]
  subjectProperty: SubjectProperty
  title?: string
  description?: string
}

type SortField = 'address' | 'yearBuilt' | 'sqft' | 'marketValue' | 'adjustedValue' | 'adjustedPSF' | 'comparableScore'
type SortDirection = 'asc' | 'desc'

export function AllComparablesTable({ comparables, subjectProperty, title, description }: AllComparablesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [conditionFilter, setConditionFilter] = useState("all")
  const [sortField, setSortField] = useState<SortField>('adjustedValue')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Filter and sort logic
  const filteredAndSortedComparables = useMemo(() => {
    const filtered = comparables.filter(comp => {
      const matchesSearch = !searchTerm || 
        comp.siteAddr1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.acct.includes(searchTerm)
      
      const matchesGrade = gradeFilter === "all" || comp.grade === gradeFilter
      const matchesCondition = conditionFilter === "all" || comp.condition === conditionFilter
      
      return matchesSearch && matchesGrade && matchesCondition
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
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

    return filtered
  }, [comparables, searchTerm, gradeFilter, conditionFilter, sortField, sortDirection])

  // Get unique values for filters
  const uniqueGrades = [...new Set(comparables.map(c => c.grade).filter((grade): grade is string => Boolean(grade)))].sort()
  const uniqueConditions = [...new Set(comparables.map(c => c.condition).filter((condition): condition is string => Boolean(condition)))].sort()

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
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

  const handleExportCsv = () => {
    const headers = [
      'Account', 'Address', 'Neighborhood', 'Year Built', 'Building SqFt', 'Land SqFt',
      'Grade', 'Condition', 'Market Value', 'Land Value', 'Building Value', 
      'Comp Impr PSF', 'Size Adjustment', 'Age Adjustment', 'Features Adjustment', 'Land Adjustment',
      'Adjusted Improvement Value', 'Total Adjusted Value', 'Adjusted PSF', 'Comparable Score'
    ]

    const csvRows = [
      headers.join(','),
      ...filteredAndSortedComparables.map(comp => {
        const sqft = parseInt(comp.bldAr || '0', 10)
        const adjustedPSF = comp.adjustments?.totalAdjustedValue && sqft > 0 
          ? (comp.adjustments.totalAdjustedValue / sqft).toFixed(2)
          : 'N/A'

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
          comp.adjustments?.featuresAdjustment || '',
          comp.adjustments?.landAdjustmentAmount || '',
          comp.adjustments?.adjustedImprovementValue || '',
          comp.adjustments?.totalAdjustedValue || '',
          adjustedPSF,
          comp.adjustments?.comparableScore || 'N/A'
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
    link.download = `all_comparables_${subjectProperty.acct}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Header with summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                {title || "All Comparable Properties"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {description || `Showing ${filteredAndSortedComparables.length} of ${comparables.length} properties`}
              </p>
            </div>
            <Button onClick={handleExportCsv} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Address or account..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="grade">Grade</Label>
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All grades</SelectItem>
                  {uniqueGrades.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Select value={conditionFilter} onValueChange={setConditionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All conditions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All conditions</SelectItem>
                  {uniqueConditions.map(condition => (
                    <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("")
                  setGradeFilter("all")
                  setConditionFilter("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Table */}
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
                  <TableHead>Neighborhood</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleSort('yearBuilt')}
                  >
                    <div className="flex items-center gap-1">
                      Year <SortIcon field="yearBuilt" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleSort('sqft')}
                  >
                    <div className="flex items-center gap-1">
                      SqFt <SortIcon field="sqft" />
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
                  <TableHead>Size Adj</TableHead>
                  <TableHead>Age Adj</TableHead>
                  <TableHead>Features Adj</TableHead>
                  <TableHead>Land Adj</TableHead>
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
                  <TableHead 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleSort('comparableScore')}
                  >
                    <div className="flex items-center gap-1">
                      Score <SortIcon field="comparableScore" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedComparables.map((comp) => (
                  <TableRow key={comp.id}>
                    <TableCell className="font-medium">
                      {comp.siteAddr1 || 'N/A'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {comp.acct}
                    </TableCell>
                    <TableCell>{comp.neighborhoodCode}</TableCell>
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
                    <TableCell>
                      {comp.adjustments?.sizeAdjustment ? 
                        formatCurrency(comp.adjustments.sizeAdjustment) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {comp.adjustments?.ageAdjustment ? 
                        formatCurrency(comp.adjustments.ageAdjustment) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {comp.adjustments?.featuresAdjustment ? 
                        formatCurrency(comp.adjustments.featuresAdjustment) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {comp.adjustments?.landAdjustmentAmount ? 
                        formatCurrency(comp.adjustments.landAdjustmentAmount) : 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(comp.adjustments?.totalAdjustedValue)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPSF(comp.adjustments?.totalAdjustedValue, comp.bldAr)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {comp.adjustments?.comparableScore || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 