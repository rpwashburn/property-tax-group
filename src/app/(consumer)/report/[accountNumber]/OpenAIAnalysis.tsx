"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, BarChart, AlertCircle, CheckCircle2, Home, ArrowUp, X, RefreshCw } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IndicatedValueAnalysisCard } from "@/components/shared/IndicatedValueAnalysisCard"
import { performAnalysisAction } from "@/lib/property-analysis/actions"
import yaml from "js-yaml"
import type { SubjectProperty } from '@/lib/property-analysis/types';
import { useSearchParams } from "next/navigation"

interface OpenAIAnalysisProps {
  accountNumber: string
  subjectProperty: SubjectProperty
}

// Define types for the YAML structure
interface Comparable {
  rank: number
  acct: string
  address: string
  adjusted_value: string
  adjusted_psf: string
  rationale: string
}

interface ExcludedProperty {
  acct: string
  note: string
}

interface AnalysisData {
  top_comps: Comparable[]
  excluded: ExcludedProperty[]
}

export function OpenAIAnalysis({ subjectProperty }: OpenAIAnalysisProps) {
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<AnalysisData | null>(null)
  const [promptUsed, setPromptUsed] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState<boolean>(false)
  const [parseError, setParseError] = useState<string | null>(null)

  // Get search params for overrides
  const searchParams = useSearchParams();
  const overrideYrImpr = searchParams.get('overrideYrImpr');
  const overrideBldAr = searchParams.get('overrideBldAr');

  // Helper to safely parse market value from the passed subjectProperty
  const parseMarketValue = (value: string | null | undefined): number => {
    if (!value) return 0;
    return parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
  };

  const handleGenerateAnalysis = async () => {
    setIsLoading(true)
    setError(null)
    setAnalysisResult(null)
    setPromptUsed(null)
    setIsComplete(false)
    setParsedData(null)
    setParseError(null)

    try {
      // Construct overrides object from query params
      const overrides: { bldAr?: string; yrImpr?: string } = {};
      if (overrideBldAr) {
        overrides.bldAr = overrideBldAr;
      }
      if (overrideYrImpr) {
        overrides.yrImpr = overrideYrImpr;
      }

      // TODO: Get overrides from where they are now set (e.g., query params or state)
      const result = await performAnalysisAction(
        subjectProperty,
        Object.keys(overrides).length > 0 ? overrides : undefined
      );

      if (result.prompt) {
        setPromptUsed(result.prompt)
      } else if (result.error) {
        setPromptUsed("Could not generate prompt before error occurred.")
      }

      if (result.error) {
        setError(result.error)
      } else if (result.analysis) {
        setAnalysisResult(result.analysis)

        // Try to parse the YAML
        try {
          const data = yaml.load(result.analysis) as AnalysisData
          setParsedData(data)
        } catch (yamlError) {
          console.error("Error parsing YAML:", yamlError)
          setParseError("Could not parse the analysis data format.")
        }

        setIsComplete(true)
      } else {
        setError("Analysis completed but returned no content.")
      }
    } catch (err: unknown) {
      console.error("Error calling performAnalysisAction:", err)
      if (err instanceof Error) {
        setError(`An unexpected error occurred: ${err.message}`)
      } else {
        setError("An unexpected error occurred: Unknown client error")
      }
      setPromptUsed(promptUsed ?? "Prompt state unknown due to client error.")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to render the comparable property card
  const renderComparableCard = (comp: Comparable) => {
    return (
      <Card key={comp.acct} className="overflow-hidden transition-all hover:shadow-md">
        <div className={`h-2 ${getRankColor(comp.rank)}`}></div>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <Badge variant="outline" className="mb-2 font-semibold">
                Rank #{comp.rank}
              </Badge>
              <CardTitle className="text-base">{comp.address}</CardTitle>
              <CardDescription className="text-xs">Account: {comp.acct}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-50 p-3 rounded-md">
              <div className="text-xs text-muted-foreground mb-1">Adjusted Value</div>
              <div className="text-lg font-semibold">{comp.adjusted_value}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-md">
              <div className="text-xs text-muted-foreground mb-1">Price per SqFt</div>
              <div className="text-lg font-semibold">{comp.adjusted_psf}</div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <strong className="text-foreground">Rationale:</strong> {comp.rationale}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Function to get color based on rank
  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return "bg-green-500"
      case 2:
        return "bg-emerald-500"
      case 3:
        return "bg-blue-500"
      case 4:
        return "bg-indigo-500"
      case 5:
        return "bg-purple-500"
      default:
        return "bg-slate-500"
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-primary" />
          Property Comparables Analysis
        </CardTitle>
        <CardDescription>
          Our AI will analyze your property and rank the most relevant comparable properties to help determine market
          value.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Progress Steps */}
        {!isComplete && (
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${isLoading || analysisResult ? "bg-primary text-white" : "bg-slate-100"}`}
              >
                1
              </div>
              <span className="text-xs mt-1">Start</span>
            </div>
            <div className={`h-1 flex-1 mx-2 ${isLoading || analysisResult ? "bg-primary" : "bg-slate-200"}`}></div>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${isLoading ? "bg-primary text-white" : "bg-slate-100"}`}
              >
                2
              </div>
              <span className="text-xs mt-1">Processing</span>
            </div>
            <div className={`h-1 flex-1 mx-2 ${analysisResult ? "bg-primary" : "bg-slate-200"}`}></div>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${analysisResult ? "bg-primary text-white" : "bg-slate-100"}`}
              >
                3
              </div>
              <span className="text-xs mt-1">Complete</span>
            </div>
          </div>
        )}

        {/* Generate Button (only show if not already generated or loading) */}
        {!analysisResult && !isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Home className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">Ready to Generate Analysis</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Click the button below to generate an AI analysis ranking the top comparable properties for your property.
            </p>
            <Button onClick={handleGenerateAnalysis} size="lg" className="px-8 py-6 h-auto text-base font-medium">
              Generate Comparables Ranking
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-background"></div>
              </div>
            </div>
            <h3 className="text-lg font-medium mt-6 mb-2">Analyzing Comparable Properties</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Our AI is ranking the most relevant comparable properties based on adjusted values and other factors...
            </p>
          </div>
        )}

        {/* Error Display */}
        {(error || parseError) && !isLoading && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Analysis Error</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>{error || parseError}</span>
              <Button variant="outline" size="sm" onClick={handleGenerateAnalysis} className="ml-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-run Analysis
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Analysis Result Area */}
        {analysisResult && !isLoading && !error && (
          <div className="mt-2 space-y-6">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Analysis Complete
              </Badge>
              <Button variant="outline" size="sm" onClick={handleGenerateAnalysis}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-run Analysis
              </Button>
            </div>

            {/* Render Indicated Value Analysis Card */}
            {parsedData && (
              <IndicatedValueAnalysisCard
                comparables={parsedData.top_comps}
                subjectPropertyValue={parseMarketValue(subjectProperty.totMktVal)}
              />
            )}

            <Tabs defaultValue="visual" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="visual">Visual Ranking</TabsTrigger>
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="raw">Raw Data</TabsTrigger>
              </TabsList>

              {/* Visual Ranking Tab */}
              <TabsContent value="visual" className="mt-4">
                {parsedData ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ArrowUp className="h-4 w-4 text-green-600" />
                        Top Comparable Properties
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {parsedData.top_comps.map((comp) => renderComparableCard(comp))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <X className="h-4 w-4 text-red-600" />
                        Excluded Properties
                      </h3>
                      <div className="bg-slate-50 rounded-lg p-4 border">
                        <ul className="space-y-3">
                          {parsedData.excluded.map((item) => (
                            <li key={item.acct} className="flex items-start gap-3">
                              <div className="bg-red-100 text-red-800 p-1 rounded-full mt-0.5">
                                <X className="h-3 w-3" />
                              </div>
                              <div>
                                <div className="font-medium">Account: {item.acct}</div>
                                <div className="text-sm text-muted-foreground">{item.note}</div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Could not parse the analysis data into a visual format.
                  </div>
                )}
              </TabsContent>

              {/* Table View Tab */}
              <TabsContent value="table" className="mt-4">
                {parsedData ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Top Comparable Properties</h3>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[80px]">Rank</TableHead>
                              <TableHead>Address</TableHead>
                              <TableHead>Account</TableHead>
                              <TableHead className="text-right">Adjusted Value</TableHead>
                              <TableHead className="text-right">Price/SqFt</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {parsedData.top_comps.map((comp) => (
                              <TableRow key={comp.acct}>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={`font-semibold ${comp.rank === 1 ? "bg-green-50 text-green-700 border-green-200" : ""}`}
                                  >
                                    #{comp.rank}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{comp.address}</div>
                                  <div className="text-xs text-muted-foreground mt-1">{comp.rationale}</div>
                                </TableCell>
                                <TableCell className="font-mono text-xs">{comp.acct}</TableCell>
                                <TableCell className="text-right font-medium">{comp.adjusted_value}</TableCell>
                                <TableCell className="text-right">{comp.adjusted_psf}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Excluded Properties</h3>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Account</TableHead>
                              <TableHead>Reason for Exclusion</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {parsedData.excluded.map((item) => (
                              <TableRow key={item.acct}>
                                <TableCell className="font-mono">{item.acct}</TableCell>
                                <TableCell>{item.note}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Could not parse the analysis data into a table format.
                  </div>
                )}
              </TabsContent>

              {/* Raw Data Tab */}
              <TabsContent value="raw" className="mt-4">
                <div className="bg-slate-50 border rounded-lg p-6">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-slate-700">{analysisResult}</pre>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>

      {/* Accordion for Full Prompt */}
      {promptUsed && (
        <CardFooter className="flex-col items-start pt-0">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b-0">
              <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground">
                View AI Prompt Details
              </AccordionTrigger>
              <AccordionContent>
                <div className="rounded-md bg-slate-50 border p-4 overflow-hidden">
                  <pre className="whitespace-pre-wrap text-xs font-mono text-slate-700 overflow-x-auto">
                    {promptUsed}
                  </pre>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardFooter>
      )}
    </Card>
  )
}
