"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Brain, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Check, 
  X,
  Info,
  Building,
  MapPin,
  ArrowLeft,
  ArrowRight
} from "lucide-react"
import type { OverrideState } from "@/lib/property-analysis/types/override-types"
import type { AnalysisData } from "@/lib/property-analysis/types/analysis-types"
import type { EnrichedPropertyData } from "@/lib/property-analysis/types/index"
import { convertPropertyDataToSubjectProperty } from "@/lib/property-analysis/utils/property-utils"

// Import our hooks and components
import { useAiAnalysis } from "../../hooks/use-ai-analysis"
import { useOverrideState } from "../../hooks/use-override-state"
import { AnalysisResults } from "../shared/analysis-results"

interface AiAnalyzerStepProps {
  subjectProperty: EnrichedPropertyData
  onBack: () => void
  onNext: (finalOverrides: OverrideState, analysisData: AnalysisData | null) => void
}

export function AiAnalyzerStep({ subjectProperty: propertyData, onBack, onNext }: AiAnalyzerStepProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  
  // Convert PropertyData to SubjectProperty using unified service
  const subjectProperty = convertPropertyDataToSubjectProperty(propertyData)
  
  // Use our custom hooks
  const aiAnalysis = useAiAnalysis()
  const overrideState = useOverrideState(subjectProperty)

  const handleGenerateAnalysis = async () => {
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

  const handleNext = () => {
    onNext(overrideState.overrideState, aiAnalysis.parsedData)
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

  const canGenerateAnalysis = !aiAnalysis.isLoading
  const hasResults = aiAnalysis.isLoading || aiAnalysis.error || aiAnalysis.isComplete
  const canProceed = aiAnalysis.isComplete && !aiAnalysis.error && !aiAnalysis.parseError

  return (
    <div className="space-y-6">
      {/* Main Analysis Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">AI Property Analysis</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Generate comparable property rankings using AI
                </p>
              </div>
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
        
        <CardContent className="space-y-6">
          {/* Property Summary - Compact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Building className="h-4 w-4" />
                Property Details
              </div>
              
              <div className="space-y-3 pl-6">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Account</span>
                  <span className="text-sm font-mono">{subjectProperty.acct}</span>
                </div>
                
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Address</span>
                  <div className="text-right">
                    <span className="text-sm font-medium">{subjectProperty.siteAddr1 || "N/A"}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      {subjectProperty.neighborhoodCode || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Market Value</span>
                  <span className="text-sm font-medium">
                    {subjectProperty.totMktVal 
                      ? `$${parseInt(subjectProperty.totMktVal, 10).toLocaleString()}` 
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Editable Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Edit className="h-4 w-4" />
                Analysis Parameters
              </div>
              
              <div className="space-y-3 pl-6">
                <div className="flex justify-between items-center">
                  <Label className="text-sm text-muted-foreground">Year Built</Label>
                  <div className="min-w-[120px]">
                    <EditableField
                      value={overrideState.overrideState.yearBuilt.value}
                      originalValue={overrideState.originalValues.yearBuilt}
                      fieldKey="yearBuilt"
                      type="year"
                      placeholder="e.g., 1995"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Label className="text-sm text-muted-foreground">Building SqFt</Label>
                  <div className="min-w-[120px]">
                    <EditableField
                      value={overrideState.overrideState.buildingSqFt.value}
                      originalValue={overrideState.originalValues.buildingSqFt}
                      fieldKey="buildingSqFt"
                      type="sqft"
                      placeholder="e.g., 2,500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleGenerateAnalysis}
                  disabled={!canGenerateAnalysis}
                  size="lg"
                  className="px-8"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  {aiAnalysis.isLoading ? "Analyzing..." : "Generate Analysis"}
                </Button>

                {hasResults && (
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={aiAnalysis.isLoading}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                )}
              </div>

              {/* Property Details Toggle */}
              <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Info className="h-4 w-4 mr-2" />
                    {showDetails ? 'Less' : 'More'} Details
                    {showDetails ? (
                      <ChevronUp className="h-4 w-4 ml-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg text-sm">
                    <div>
                      <span className="text-muted-foreground">Grade</span>
                      <div className="font-medium">{subjectProperty.grade || "N/A"}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Condition</span>
                      <div className="font-medium">{subjectProperty.condition || "N/A"}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Land Area</span>
                      <div className="font-medium">
                        {subjectProperty.landAr 
                          ? `${parseInt(subjectProperty.landAr, 10).toLocaleString()} sqft`
                          : "N/A"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">State Class</span>
                      <div className="font-medium">{subjectProperty.stateClass || "N/A"}</div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </CardContent>

        {/* Navigation Footer */}
        <CardFooter className="flex justify-between bg-muted/30 border-t">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button 
            onClick={handleNext} 
            className="gap-2" 
            disabled={!canProceed}
          >
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* Results Section - Only show when there are results */}
      {hasResults && (
        <AnalysisResults
          isLoading={aiAnalysis.isLoading}
          error={aiAnalysis.error}
          parseError={aiAnalysis.parseError}
          isComplete={aiAnalysis.isComplete}
          analysisResult={aiAnalysis.analysisResult}
          parsedData={aiAnalysis.parsedData}
          promptUsed={aiAnalysis.promptUsed}
          subjectProperty={subjectProperty}
        />
      )}
    </div>
  )
} 