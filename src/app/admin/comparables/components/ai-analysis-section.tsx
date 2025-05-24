"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Brain, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  CheckCircle,
  Copy,
  Download,
  Target,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import type { SubjectProperty } from "@/lib/property-analysis/types"
import type { UseAiAnalysisReturn } from "../../../(consumer)/report/hooks/use-ai-analysis"
import type { UseOverrideStateReturn } from "../../../(consumer)/report/hooks/use-override-state"
import { calculateMedianAssessment } from "@/lib/property-analysis/services/analysis-service"

interface AiAnalysisSectionProps {
  subjectProperty: SubjectProperty
  aiAnalysis: UseAiAnalysisReturn
  overrideState: UseOverrideStateReturn
  onGenerateAnalysis: () => void
  onReset: () => void
}

export function AiAnalysisSection({ 
  subjectProperty, 
  aiAnalysis, 
  overrideState,
  onGenerateAnalysis, 
  onReset 
}: AiAnalysisSectionProps) {
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

  const handleExportSelectedComparables = () => {
    if (!aiAnalysis.parsedData?.top_comps) return

    const headers = [
      'Rank', 'Account', 'Address', 'Adjusted Value', 'Adjusted PSF', 'Rationale'
    ]

    const csvRows = [
      headers.join(','),
      ...aiAnalysis.parsedData.top_comps.map(comp => [
        comp.rank,
        comp.acct,
        comp.address || '',
        comp.adjusted_value || '',
        comp.adjusted_psf || '',
        `"${comp.rationale || ''}"`
      ].join(','))
    ]

    const csvString = csvRows.join('\n')
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ai_selected_comparables_${subjectProperty.acct}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const medianData = calculateMedianAssessment(aiAnalysis.parsedData, subjectProperty)

  const canGenerateAnalysis = !aiAnalysis.isLoading
  const hasResults = aiAnalysis.isLoading || aiAnalysis.error || aiAnalysis.isComplete

  return (
    <div className="space-y-6">
      {/* AI Analysis Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">AI Property Analysis</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Generate AI-powered comparable property rankings and analysis
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
        
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={onGenerateAnalysis}
              disabled={!canGenerateAnalysis}
              size="lg"
              className="px-8"
            >
              <Brain className="h-4 w-4 mr-2" />
              {aiAnalysis.isLoading ? "Analyzing..." : "Generate AI Analysis"}
            </Button>

            {hasResults && (
              <Button
                variant="outline"
                onClick={onReset}
                disabled={aiAnalysis.isLoading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}

            {aiAnalysis.isComplete && (
              <Button
                variant="outline"
                onClick={handleExportSelectedComparables}
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Selected
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {aiAnalysis.isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Analyzing property data with AI...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error States */}
      {aiAnalysis.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Analysis Error:</strong> {aiAnalysis.error}
          </AlertDescription>
        </Alert>
      )}

      {aiAnalysis.parseError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Parse Error:</strong> {aiAnalysis.parseError}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Results */}
      {aiAnalysis.isComplete && aiAnalysis.parsedData && (
        <>
          {/* Success Indicator */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Analysis completed successfully! Found {aiAnalysis.parsedData.top_comps?.length || 0} top comparable properties.
            </AlertDescription>
          </Alert>

          {/* Recommended Assessment Value */}
          {medianData && (
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2 text-green-800">
                  <Target className="h-6 w-6 text-green-600" />
                  AI-Recommended Assessment Analysis
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
                    <div className="text-sm text-muted-foreground mb-1">AI Recommended</div>
                    <div className="text-xl font-bold text-green-600">
                      ${medianData.medianValue.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Based on {medianData.comparableCount} AI selections
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
                  <p>
                    <strong>AI Analysis Summary:</strong> The AI selected {medianData.comparableCount} properties 
                    with values ranging from ${medianData.minValue.toLocaleString()} to ${medianData.maxValue.toLocaleString()}, 
                    resulting in a median recommended assessment of ${medianData.medianValue.toLocaleString()}.
                    {medianData.potentialSavings > 0 ? (
                      ` This represents a potential ${medianData.percentageDifference.toFixed(1)}% reduction from the current appraised value.`
                    ) : (
                      ` The current appraised value is at or below the AI-recommended median.`
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Selected Comparables Table */}
          {aiAnalysis.parsedData.top_comps && aiAnalysis.parsedData.top_comps.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    AI-Selected Comparable Properties
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={handleExportSelectedComparables}>
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
                        <TableHead>Account</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Adjusted Value</TableHead>
                        <TableHead>Adjusted PSF</TableHead>
                        <TableHead>AI Rationale</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {aiAnalysis.parsedData.top_comps.map((comp) => (
                        <TableRow key={comp.acct}>
                          <TableCell>
                            <Badge variant="outline">#{comp.rank}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{comp.acct}</TableCell>
                          <TableCell className="font-medium">{comp.address}</TableCell>
                          <TableCell className="font-semibold">{comp.adjusted_value}</TableCell>
                          <TableCell>{comp.adjusted_psf}</TableCell>
                          <TableCell className="text-sm">{comp.rationale}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Excluded Properties */}
          {aiAnalysis.parsedData.excluded && aiAnalysis.parsedData.excluded.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  AI-Excluded Properties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {aiAnalysis.parsedData.excluded.map((item) => (
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

          {/* Raw Analysis Data (Admin View) */}
          {aiAnalysis.analysisResult && (
            <Collapsible open={showRawData} onOpenChange={setShowRawData}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Raw AI Analysis Response</CardTitle>
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
                        onClick={() => handleCopyToClipboard(aiAnalysis.analysisResult || "")}
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-96 whitespace-pre-wrap">
                      {aiAnalysis.analysisResult}
                    </pre>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* AI Prompt Used (Admin View) */}
          {aiAnalysis.promptUsed && (
            <Collapsible open={showPrompt} onOpenChange={setShowPrompt}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">AI Prompt Used</CardTitle>
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
                        onClick={() => handleCopyToClipboard(aiAnalysis.promptUsed || "")}
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-96 whitespace-pre-wrap">
                      {aiAnalysis.promptUsed}
                    </pre>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}
        </>
      )}

      {/* No Results State */}
      {!aiAnalysis.isLoading && !aiAnalysis.error && !aiAnalysis.isComplete && (
        <Card>
          <CardContent className="text-center py-10">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Click "Generate AI Analysis" to analyze comparable properties using AI.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 