"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { AlertCircle, ChevronDown, ChevronUp, Copy, CheckCircle, TrendingUp, TrendingDown, Target } from "lucide-react"
import { useState } from "react"
import type { AnalysisData } from "@/lib/property-analysis/types/analysis-types"
import { Badge } from "@/components/ui/badge"
import { calculateMedianAssessment } from "@/lib/property-analysis/services/analysis-service"

interface AnalysisResultsProps {
  isLoading: boolean
  error: string | null
  parseError: string | null
  isComplete: boolean
  analysisResult: string | null
  parsedData: AnalysisData | null
  promptUsed: string | null
  subjectProperty?: {
    totApprVal?: string | null
  }
}

export function AnalysisResults({
  isLoading,
  error,
  parseError,
  isComplete,
  analysisResult,
  parsedData,
  promptUsed,
  subjectProperty
}: AnalysisResultsProps) {
  const [showRawData, setShowRawData] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  // Use the utility function to calculate median assessment
  const medianData = calculateMedianAssessment(parsedData, subjectProperty)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Analyzing property data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Analysis Error:</strong> {error}
        </AlertDescription>
      </Alert>
    )
  }

  if (parseError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Parse Error:</strong> {parseError}
        </AlertDescription>
      </Alert>
    )
  }

  if (!isComplete || !parsedData) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Success indicator */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Analysis completed successfully! Found {parsedData.top_comps?.length || 0} top comparable properties.
        </AlertDescription>
      </Alert>

      {/* Recommended Assessment Value - Primary Result */}
      {medianData && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2 text-green-800">
              <Target className="h-6 w-6 text-green-600" />
              Recommended Property Tax Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg border border-green-200 text-center">
                <div className="text-sm text-muted-foreground mb-1">Market Value</div>
                <div className="text-xl font-bold text-blue-600">
                  ${medianData.marketValue.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">County's market assessment</div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-green-200 text-center">
                <div className="text-sm text-muted-foreground mb-1">Appraised Value</div>
                <div className="text-xl font-bold text-red-600">
                  ${medianData.appraisedValue.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">What you're taxed on</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-green-200 text-center">
                <div className="text-sm text-muted-foreground mb-1">Recommended Assessment</div>
                <div className="text-xl font-bold text-green-600">
                  ${medianData.medianValue.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Median of {medianData.comparableCount} comparables
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-green-200 text-center">
                <div className="text-sm text-muted-foreground mb-1">Potential Savings</div>
                <div className="text-xl font-bold text-green-600">
                  ${medianData.potentialSavings.toLocaleString()}
                </div>
                {medianData.percentageDifference > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {medianData.percentageDifference.toFixed(1)}% reduction
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-sm text-gray-700 bg-white/50 p-3 rounded-lg border border-green-100">
              <p className="mb-2">
                <strong>Analysis Summary:</strong> Based on {medianData.comparableCount} comparable properties 
                selected by AI, the median adjusted value is ${medianData.medianValue.toLocaleString()}.
              </p>
              <p>
                The comparable properties range from ${medianData.minValue.toLocaleString()} to ${medianData.maxValue.toLocaleString()}.
                {medianData.potentialSavings > 0 ? (
                  ` Your current appraised value appears to be ${medianData.percentageDifference.toFixed(1)}% higher than the median, 
                  indicating potential for a property tax reduction through an appeal.`
                ) : (
                  ` Your current appraised value is at or below the median of comparable properties.`
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Comparables Summary */}
      {parsedData.top_comps && parsedData.top_comps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              AI-Selected Comparable Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {parsedData.top_comps.map((comp) => (
                <div
                  key={comp.acct}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{comp.rank}
                      </Badge>
                      <span className="font-medium">{comp.address}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {comp.rationale}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{comp.adjusted_value}</div>
                    <div className="text-sm text-muted-foreground">{comp.adjusted_psf}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Excluded Properties */}
      {parsedData.excluded && parsedData.excluded.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              Excluded Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {parsedData.excluded.map((item) => (
                <div
                  key={item.acct}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <span className="font-mono text-sm">{item.acct}</span>
                  <span className="text-sm text-muted-foreground">{item.note}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw Analysis Data (Collapsible) */}
      {analysisResult && (
        <Collapsible open={showRawData} onOpenChange={setShowRawData}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Raw Analysis Data</CardTitle>
                  {showRawData ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="flex justify-end mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyToClipboard(analysisResult)}
                  >
                    {copied ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-96">
                  {analysisResult}
                </pre>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Prompt Used (Collapsible) */}
      {promptUsed && (
        <Collapsible open={showPrompt} onOpenChange={setShowPrompt}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Prompt Used</CardTitle>
                  {showPrompt ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="flex justify-end mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyToClipboard(promptUsed)}
                  >
                    {copied ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-96">
                  {promptUsed}
                </pre>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  )
} 