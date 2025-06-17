"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Database, Edit, Check, X, AlertCircle, Filter, Target, Layers } from "lucide-react"
import type { SubjectProperty, AdjustedComparable } from "@/lib/comparables/types"
import type { PropertySearchCriteria } from "@/lib/comparables/types"

// Import services
import { getSubjectProperty } from "@/lib/property-analysis/services/property-service"
import { fetchAndAdjustComparables } from "@/lib/comparables/server"
import { 
  fetchAndProcessComparables, 
  applySubjectPropertyOverrides 
} from "@/lib/property-analysis/services/comparable-service"

// Import hooks from consumer components
import { useAiAnalysis } from "../../../(consumer)/report/hooks/use-ai-analysis"
import { useOverrideState } from "../../../(consumer)/report/hooks/use-override-state"

// Import our data table components
import { AllComparablesTable } from "./all-comparables-table"
import { GroupedComparablesView } from "./grouped-comparables-view"
import { FinalComparablesView } from "./final-comparables-view"
import { AiAnalysisSection } from "./ai-analysis-section"

interface AdminComparablesAnalyzerProps {
  subjectAcctNumber: string
}

interface ComparableDataPipeline {
  rawComparables: AdjustedComparable[]
  groupedComparables: {
    closestByAge: AdjustedComparable[]
    closestBySqFt: AdjustedComparable[]
    lowestByValue: AdjustedComparable[]
  }
  finalComparables: AdjustedComparable[]
  groupMembershipIds: {
    closestByAgeIds: Set<string>
    closestBySqFtIds: Set<string>
    lowestByValueIds: Set<string>
  }
}

export function AdminComparablesAnalyzer({ subjectAcctNumber }: AdminComparablesAnalyzerProps) {
  const [subjectProperty, setSubjectProperty] = useState<SubjectProperty | null>(null)
  const [searchCriteria, setSearchCriteria] = useState<PropertySearchCriteria>({})
  const [pipelineData, setPipelineData] = useState<ComparableDataPipeline | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPipelineLoading, setIsPipelineLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)

  // Use the same hooks as the consumer AI analyzer
  const aiAnalysis = useAiAnalysis()
  const overrideState = useOverrideState(subjectProperty || undefined)

  // Available options for dropdowns
  const [availableGrades, setAvailableGrades] = useState<string[]>([])
  const [availableConditions, setAvailableConditions] = useState<string[]>([])

  const runComparablePipeline = useCallback(async (property: SubjectProperty, criteria: PropertySearchCriteria) => {
    try {
      setIsPipelineLoading(true)
      
      // Step 1: Get raw comparables matching criteria
      const rawComparables = await fetchAndAdjustComparables(subjectAcctNumber, criteria, 1000)
      
      // Step 2: Apply overrides to create effective subject property
      const overrides = {
        ...(overrideState.overrideState.yearBuilt.value && { yrImpr: overrideState.overrideState.yearBuilt.value }),
        ...(overrideState.overrideState.buildingSqFt.value && { bldAr: overrideState.overrideState.buildingSqFt.value }),
      }
      const effectiveSubjectProperty = applySubjectPropertyOverrides(property, overrides)
      
      // Step 3: Process comparables through the consumer pipeline
      const comparableData = await fetchAndProcessComparables(effectiveSubjectProperty)
      
      setPipelineData({
        rawComparables,
        groupedComparables: comparableData.groupedComparables,
        finalComparables: comparableData.finalComparables,
        groupMembershipIds: comparableData.groupMembershipIds
      })
      
    } catch (err) {
      console.error("Error running pipeline:", err)
      setError(err instanceof Error ? err.message : "Failed to run comparable pipeline")
    } finally {
      setIsPipelineLoading(false)
    }
  }, [subjectAcctNumber, overrideState.overrideState.yearBuilt.value, overrideState.overrideState.buildingSqFt.value])

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch subject property
        const property = await getSubjectProperty(subjectAcctNumber)
        if (!property) {
          throw new Error(`Property not found for account ${subjectAcctNumber}`)
        }
        setSubjectProperty(property)

        // Set default search criteria based on subject property
        const defaultCriteria: PropertySearchCriteria = {
          neighborhoodCode: property.neighborhoodCode ?? undefined,
          grade: property.grade ?? undefined,
          condition: property.condition ?? undefined,
        }
        setSearchCriteria(defaultCriteria)

        // Fetch a broader set to get available options
        const allComparables = await fetchAndAdjustComparables(subjectAcctNumber, {}, 2000)
        const grades = [...new Set(allComparables.map(c => c.grade).filter(Boolean))].sort()
        const conditions = [...new Set(allComparables.map(c => c.condition).filter(Boolean))].sort()
        setAvailableGrades(grades as string[])
        setAvailableConditions(conditions as string[])

        // Run initial pipeline
        await runComparablePipeline(property, defaultCriteria)

      } catch (err) {
        console.error("Error loading data:", err)
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [subjectAcctNumber, runComparablePipeline])

  const handleCriteriaChange = async () => {
    if (!subjectProperty) return
    await runComparablePipeline(subjectProperty, searchCriteria)
  }

  const handleGenerateAnalysis = async () => {
    if (!subjectProperty) return

    const overrides = {
      ...(overrideState.overrideState.yearBuilt.value && { yrImpr: overrideState.overrideState.yearBuilt.value }),
      ...(overrideState.overrideState.buildingSqFt.value && { bldAr: overrideState.overrideState.buildingSqFt.value }),
    }

    await aiAnalysis.generateAnalysis(subjectProperty, overrides)
  }

  const handleReset = () => {
    aiAnalysis.resetAnalysis()
    overrideState.resetOverrides()
  }

  const handleSaveField = (field: string, value: string) => {
    if (field === 'yearBuilt') {
      overrideState.updateYearBuilt(value)
    } else if (field === 'buildingSqFt') {
      overrideState.updateBuildingSqFt(value)
    }
    setEditingField(null)
  }

  const formatValue = (value: string, type: 'sqft' | 'year') => {
    if (!value) return "N/A"
    if (type === 'sqft' && !isNaN(Number(value))) {
      return Number(value).toLocaleString()
    }
    return value
  }

  const EditableField = ({ 
    value, 
    originalValue, 
    fieldKey, 
    type = 'text',
    placeholder 
  }: {
    value: string
    originalValue: string
    fieldKey: string
    type?: 'text' | 'sqft' | 'year'
    placeholder?: string
  }) => {
    const isEditing = editingField === fieldKey
    const isChanged = value !== originalValue
    const displayValue = value || originalValue
    const formattedValue = type === 'sqft' ? formatValue(displayValue, 'sqft') : displayValue

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <Input
            value={value}
            onChange={(e) => {
              if (fieldKey === 'yearBuilt') {
                overrideState.updateYearBuilt(e.target.value)
              } else if (fieldKey === 'buildingSqFt') {
                overrideState.updateBuildingSqFt(e.target.value)
              }
            }}
            placeholder={placeholder}
            className="h-8 text-sm"
            autoFocus
          />
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0"
            onClick={() => handleSaveField(fieldKey, value)}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0"
            onClick={() => setEditingField(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-between group">
        <div>
          <span className={`text-sm ${isChanged ? 'text-blue-600 font-medium' : ''}`}>
            {formattedValue}
          </span>
          {isChanged && (
            <div className="text-xs text-muted-foreground">
              was: {type === 'sqft' ? formatValue(originalValue, 'sqft') : originalValue}
            </div>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setEditingField(fieldKey)}
        >
          <Edit className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Loading property analysis...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!subjectProperty) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No property data found for account {subjectAcctNumber}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Subject Property Overview */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Subject Property: {subjectAcctNumber}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {subjectProperty.siteAddr1} • {subjectProperty.neighborhoodCode}
              </p>
            </div>
            {overrideState.hasOverrides && (
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                {Object.values([
                  overrideState.isYearBuiltChanged,
                  overrideState.isBuildingSqFtChanged
                ]).filter(Boolean).length} override{Object.values([
                  overrideState.isYearBuiltChanged,
                  overrideState.isBuildingSqFtChanged
                ]).filter(Boolean).length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Market Value</Label>
              <div className="font-medium">
                {subjectProperty.totMktVal 
                  ? `$${parseInt(subjectProperty.totMktVal, 10).toLocaleString()}` 
                  : "N/A"}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Year Built</Label>
              <EditableField
                value={overrideState.overrideState.yearBuilt.value}
                originalValue={overrideState.originalValues.yearBuilt}
                fieldKey="yearBuilt"
                type="year"
                placeholder="e.g., 1995"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Building SqFt</Label>
              <EditableField
                value={overrideState.overrideState.buildingSqFt.value}
                originalValue={overrideState.originalValues.buildingSqFt}
                fieldKey="buildingSqFt"
                type="sqft"
                placeholder="e.g., 2,500"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Grade/Condition</Label>
              <div className="text-sm">
                {subjectProperty.grade || "N/A"} / {subjectProperty.condition || "N/A"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Criteria Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search Criteria & Pipeline Control
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Control how comparables are filtered at each step of the analysis pipeline
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <Label htmlFor="neighborhood">Same Neighborhood</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Switch
                  id="neighborhood"
                  checked={!!searchCriteria.neighborhoodCode}
                  onCheckedChange={(checked) => {
                    setSearchCriteria(prev => ({
                      ...prev,
                      neighborhoodCode: checked ? subjectProperty.neighborhoodCode ?? undefined : undefined
                    }))
                  }}
                />
                <span className="text-sm text-muted-foreground">
                  {searchCriteria.neighborhoodCode || 'Any'}
                </span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="grade">Grade Filter</Label>
              <Select
                value={searchCriteria.grade || "any"}
                onValueChange={(value) => {
                  setSearchCriteria(prev => ({
                    ...prev,
                    grade: value === "any" ? undefined : value
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Grade</SelectItem>
                  {availableGrades.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="condition">Condition Filter</Label>
              <Select
                value={searchCriteria.condition || "any"}
                onValueChange={(value) => {
                  setSearchCriteria(prev => ({
                    ...prev,
                    condition: value === "any" ? undefined : value
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Condition</SelectItem>
                  {availableConditions.map(condition => (
                    <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleCriteriaChange}
                disabled={isPipelineLoading}
                className="w-full"
              >
                {isPipelineLoading ? "Processing..." : "Update Pipeline"}
              </Button>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline"
                onClick={() => {
                  const defaultCriteria = {
                    neighborhoodCode: subjectProperty.neighborhoodCode ?? undefined,
                    grade: subjectProperty.grade ?? undefined,
                    condition: subjectProperty.condition ?? undefined,
                  }
                  setSearchCriteria(defaultCriteria)
                  runComparablePipeline(subjectProperty, defaultCriteria)
                }}
              >
                Reset to Defaults
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Results Tabs */}
      {pipelineData && (
        <Tabs defaultValue="raw-results" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="raw-results" className="gap-2">
              <Database className="h-4 w-4" />
              Raw Results ({pipelineData.rawComparables.length})
            </TabsTrigger>
            <TabsTrigger value="grouped-comparables" className="gap-2">
              <Layers className="h-4 w-4" />
              Grouped Comparables
            </TabsTrigger>
            <TabsTrigger value="final-set" className="gap-2">
              <Target className="h-4 w-4" />
              Intelligent Selection ({pipelineData.finalComparables.length})
            </TabsTrigger>
            <TabsTrigger value="ai-analysis" className="gap-2">
              <Brain className="h-4 w-4" />
              AI Analysis
              {aiAnalysis.isComplete && (
                <Badge variant="secondary" className="ml-2">
                  {aiAnalysis.parsedData?.top_comps?.length || 0} selected
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="raw-results" className="space-y-6">
            <AllComparablesTable 
              comparables={pipelineData.rawComparables}
              subjectProperty={subjectProperty}
              title="Raw Search Results"
              description={`All comparable properties matching the search criteria: ${Object.entries(searchCriteria).filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`).join(', ') || 'No filters applied'}`}
            />
          </TabsContent>

          <TabsContent value="grouped-comparables" className="space-y-6">
            <GroupedComparablesView
              groupedComparables={pipelineData.groupedComparables}
              groupMembershipIds={pipelineData.groupMembershipIds}
              subjectProperty={subjectProperty}
            />
          </TabsContent>

          <TabsContent value="final-set" className="space-y-6">
            <FinalComparablesView
              finalComparables={pipelineData.finalComparables}
              groupMembershipIds={pipelineData.groupMembershipIds}
              subjectProperty={subjectProperty}
            />
          </TabsContent>

          <TabsContent value="ai-analysis" className="space-y-6">
            <AiAnalysisSection
              subjectProperty={subjectProperty}
              aiAnalysis={aiAnalysis}
              overrideState={overrideState}
              onGenerateAnalysis={handleGenerateAnalysis}
              onReset={handleReset}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
} 