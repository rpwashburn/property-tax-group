"use client"

import { useState, useRef } from "react"
import type React from "react"
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Home,
  BarChart,
  AlertCircle,
  CheckCircle2,
  ArrowUp,
  X,
  RefreshCw,
  Loader2,
  FileText,
  Edit,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { performAnalysisAction } from "@/lib/property-analysis/actions"
import yaml from "js-yaml"
import type { PropertyData, SubjectProperty } from "@/lib/property-analysis/types"
import type { OverrideState } from "@/lib/property-analysis/types/override-types"
import type { AnalysisData /*, ExcludedProperty*/ } from "@/lib/property-analysis/types/analysis-types"
import { AiAnalysisSummary } from "./ai-analysis-summary"
import { Comparable } from "@/lib/comparables/types"

interface AiAnalyzerStepProps {
  onBack: () => void
  onNext: (finalOverrides: OverrideState, analysisData: AnalysisData | null) => void
  subjectProperty: PropertyData | null
}

export function AiAnalyzerStep({ onBack, onNext, subjectProperty }: AiAnalyzerStepProps) {
  const [editableOverrides, setEditableOverrides] = useState<OverrideState>(() => ({
    yearBuilt: {
      value: subjectProperty?.yrImpr || "",
      file: null,
      fileName: "",
    },
    buildingSqFt: {
      value: subjectProperty?.bldAr || "",
      file: null,
      fileName: "",
    },
  }));

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<"yearBuilt" | "buildingSqFt" | null>(null);
  const [modalValue, setModalValue] = useState("");
  const [modalFile, setModalFile] = useState<File | null>(null);
  const [modalFileName, setModalFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentYear = new Date().getFullYear();

  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<AnalysisData | null>(null)
  const [promptUsed, setPromptUsed] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState<boolean>(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [isPromptModalOpen, setIsPromptModalOpen] = useState<boolean>(false)

  if (!subjectProperty) {
    return (
      <Card className="mb-8 shadow-md border-slate-200 overflow-hidden">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Property data is not available for AI Analysis.</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-start p-6 bg-slate-50 border-t">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const originalYrImpr = subjectProperty.yrImpr || "N/A"
  const originalBldAr = subjectProperty.bldAr
    ? parseInt(subjectProperty.bldAr, 10).toLocaleString()
    : "N/A"

  const displayYrImpr = editableOverrides.yearBuilt.value || originalYrImpr
  const displayBldAr = editableOverrides.buildingSqFt.value 
    ? parseInt(editableOverrides.buildingSqFt.value, 10).toLocaleString() 
    : originalBldAr
  
  const yrImprChanged = editableOverrides.yearBuilt.value !== (subjectProperty.yrImpr || "")
  const bldArChanged = editableOverrides.buildingSqFt.value !== (subjectProperty.bldAr || "")

  const handleGenerateAnalysis = async () => {
    if (!subjectProperty) {
      setError("Subject property data is missing.")
      return
    }

    setIsLoading(true)
    setError(null)
    setAnalysisResult(null)
    setPromptUsed(null)
    setIsComplete(false)
    setParsedData(null)
    setParseError(null)

    try {
      const analysisOverridesForAPI: { bldAr?: string; yrImpr?: string } = {}
      if (
        editableOverrides.buildingSqFt.value &&
        editableOverrides.buildingSqFt.value !== (subjectProperty.bldAr || "")
      ) {
        analysisOverridesForAPI.bldAr = editableOverrides.buildingSqFt.value
      }
      if (
        editableOverrides.yearBuilt.value &&
        editableOverrides.yearBuilt.value !== (subjectProperty.yrImpr || "")
      ) {
        analysisOverridesForAPI.yrImpr = editableOverrides.yearBuilt.value
      }

      const result = await performAnalysisAction(
        subjectProperty as SubjectProperty, 
        Object.keys(analysisOverridesForAPI).length > 0 ? analysisOverridesForAPI : undefined
      )

      if (result.prompt) {
        setPromptUsed(result.prompt)
      } else if (result.error) {
        setPromptUsed("Could not generate prompt before error occurred.")
      }

      if (result.error) {
        setError(result.error)
      } else if (result.analysis) {
        setAnalysisResult(result.analysis)
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

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1: return "bg-green-500";
      case 2: return "bg-emerald-500";
      case 3: return "bg-blue-500";
      case 4: return "bg-indigo-500";
      case 5: return "bg-purple-500";
      default: return "bg-slate-500";
    }
  }

  const openEditModal = (field: "yearBuilt" | "buildingSqFt") => {
    setEditingField(field);
    setModalValue(editableOverrides[field].value);
    setModalFile(editableOverrides[field].file);
    setModalFileName(editableOverrides[field].fileName || "");
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingField(null);
  };

  const handleEditModalSave = () => {
    if (editingField) {
      setEditableOverrides(prev => ({
        ...prev,
        [editingField]: { value: modalValue, file: modalFile, fileName: modalFileName },
      }));
    }
    setAnalysisResult(null);
    setParsedData(null);
    setIsComplete(false);
    setError(null);
    setParseError(null);
    closeEditModal();
  };
  
  const handleModalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setModalFile(file);
      setModalFileName(file.name);
    } else {
      setModalFile(null);
      setModalFileName("");
    }
  };
  
  const handleRemoveModalFile = () => {
    setModalFile(null);
    setModalFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="mb-8 shadow-md border-slate-200 overflow-hidden">
      <CardHeader className="bg-linear-to-r from-slate-50 to-white border-b">
        <div className="flex items-center gap-2 text-primary mb-1">
          <BrainCircuit className="h-5 w-5" />
          <Badge variant="outline" className="text-xs font-normal">
            Step 3 of 3
          </Badge>
        </div>
        <CardTitle className="text-2xl">AI Comparables Analysis</CardTitle>
        <CardDescription>
          Review your property details below. Then, generate an AI-powered analysis to find comparable properties.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <Home className="h-5 w-5 mr-2 text-slate-600" /> Property Details for Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-md border mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Account Number</p>
              <p className="text-base font-semibold">{subjectProperty.acct}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Site Address</p>
              <p className="text-base font-semibold">{subjectProperty.siteAddr1 || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-muted-foreground">Year Built</Label>
                <Button variant="outline" size="sm" onClick={() => openEditModal('yearBuilt')} className="gap-1 h-7">
                  <Edit className="h-3 w-3" /> Edit
                </Button>
              </div>
              <p className={`text-base font-semibold ${yrImprChanged ? 'text-blue-600' : ''}`}>
                {displayYrImpr}
                {yrImprChanged && <span className="text-xs text-muted-foreground ml-1">(Original: {originalYrImpr})</span>}
              </p>
              {editableOverrides.yearBuilt.fileName && (
                <div className="text-xs text-blue-500 flex items-center gap-1 mt-0.5">
                  <FileText className="h-3 w-3" /> {editableOverrides.yearBuilt.fileName}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-muted-foreground">Building SqFt</Label>
                <Button variant="outline" size="sm" onClick={() => openEditModal('buildingSqFt')} className="gap-1 h-7">
                  <Edit className="h-3 w-3" /> Edit
                </Button>
              </div>
              <p className={`text-base font-semibold ${bldArChanged ? 'text-blue-600' : ''}`}>
                {displayBldAr}
                {bldArChanged && <span className="text-xs text-muted-foreground ml-1">(Original: {originalBldAr})</span>}
              </p>
              {editableOverrides.buildingSqFt.fileName && (
                <div className="text-xs text-blue-500 flex items-center gap-1 mt-0.5">
                  <FileText className="h-3 w-3" /> {editableOverrides.buildingSqFt.fileName}
                </div>
              )}
            </div>
          </div>
        </div>

        {!isComplete && !analysisResult && (
          <div className="flex flex-col items-center justify-center py-8 border-t border-dashed mt-6 pt-8">
            <BarChart className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">Ready to Generate Analysis</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Click the button below to generate an AI analysis ranking the top comparable properties.
            </p>
            <Button onClick={handleGenerateAnalysis} size="lg" className="px-8 py-6 h-auto text-base font-medium">
              Generate Comparables Ranking
            </Button>
          </div>
        )}

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
              Our AI is ranking the most relevant comparable properties...
            </p>
          </div>
        )}

        {(error || parseError) && !isLoading && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Analysis Error</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span>{error || parseError}</span>
              <Button variant="outline" size="sm" onClick={handleGenerateAnalysis} className="mt-2 sm:mt-0 sm:ml-4 shrink-0">
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-run Analysis
              </Button>
            </AlertDescription>
          </Alert>
        )}

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

            {parsedData && subjectProperty.totMktVal && (
              <AiAnalysisSummary
                comparables={parsedData.top_comps}
                subjectProperty={subjectProperty}
              />
            )}

            <Tabs defaultValue="visual" className="w-full">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
                <TabsTrigger value="visual">Visual Ranking</TabsTrigger>
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="raw">Raw Data</TabsTrigger>
              </TabsList>

              <TabsContent value="visual" className="mt-4">
                {parsedData ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ArrowUp className="h-4 w-4 text-green-600" /> Top Comparable Properties
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {parsedData.top_comps.map((comp) => renderComparableCard(comp))}
                      </div>
                    </div>
                    {parsedData.excluded && parsedData.excluded.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <X className="h-4 w-4 text-red-600" /> Excluded Properties
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
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Could not parse the analysis data into a visual format.
                  </div>
                )}
              </TabsContent>

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
                              <TableHead className="text-right">Adj. Value</TableHead>
                              <TableHead className="text-right">Adj. PSF</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {parsedData.top_comps.map((comp) => (
                              <TableRow key={comp.acct}>
                                <TableCell><Badge variant="outline" className={`font-semibold ${comp.rank === 1 ? "bg-green-50 text-green-700 border-green-200" : ""}`}>#{comp.rank}</Badge></TableCell>
                                <TableCell><div className="font-medium">{comp.address}</div><div className="text-xs text-muted-foreground mt-1 max-w-xs truncate" title={comp.rationale}>{comp.rationale}</div></TableCell>
                                <TableCell className="font-mono text-xs">{comp.acct}</TableCell>
                                <TableCell className="text-right font-medium">{comp.adjusted_value}</TableCell>
                                <TableCell className="text-right">{comp.adjusted_psf}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                     {parsedData.excluded && parsedData.excluded.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Excluded Properties</h3>
                       <div className="rounded-md border">
                        <Table>
                          <TableHeader><TableRow><TableHead>Account</TableHead><TableHead>Reason for Exclusion</TableHead></TableRow></TableHeader>
                          <TableBody>
                            {parsedData.excluded.map((item) => (
                              <TableRow key={item.acct}><TableCell className="font-mono">{item.acct}</TableCell><TableCell>{item.note}</TableCell></TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                     )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Could not parse the analysis data into a table format.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="raw" className="mt-4">
                <div className="bg-slate-50 border rounded-lg p-6">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-slate-700">{analysisResult}</pre>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col items-stretch p-6 bg-slate-50 border-t">
        {promptUsed && (
          <div className="w-full flex justify-center mb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="link"
                    className="text-xs text-muted-foreground hover:text-primary p-0 h-auto"
                    onClick={() => setIsPromptModalOpen(true)}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    View AI Prompt Details
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to see the full prompt sent to the AI.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        <div className="flex justify-between w-full">
            <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={() => onNext(editableOverrides, parsedData)} className="gap-2" disabled={isLoading || (!isComplete && !error && !parseError)}>
            Next <ArrowRight className="h-4 w-4" />
            </Button>
        </div>
      </CardFooter>

      <Dialog open={isPromptModalOpen} onOpenChange={setIsPromptModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>AI Prompt Details</DialogTitle>
            <DialogDescription>
              This is the exact prompt that was sent to the AI for analysis.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-slate-50 border p-4 overflow-hidden my-4 max-h-[400px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-xs font-mono text-slate-700 overflow-x-auto">
              {promptUsed || "No prompt information available."}
            </pre>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPromptModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Edit {editingField === "yearBuilt" ? "Year Built" : "Building Square Footage"}
            </DialogTitle>
            <DialogDescription>
              Enter the correct value and upload a supporting document if available. 
              This will update the details used for the AI analysis.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="modalValueInput" className="text-sm font-medium">
                {editingField === "yearBuilt" ? "Corrected Year Built" : "Corrected Building SqFt"}
              </Label>
              <Input
                id="modalValueInput"
                type="number"
                placeholder={editingField === "yearBuilt" ? `YYYY (e.g., ${currentYear - 20})` : "Total SqFt (e.g., 2500)"}
                value={modalValue}
                onChange={(e) => setModalValue(e.target.value)}
                min={editingField === "yearBuilt" ? 1800 : 100}
                max={editingField === "yearBuilt" ? currentYear : undefined}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="modalFileInput" className="text-sm font-medium">
                Supporting Document (Optional)
              </Label>
              <Input
                id="modalFileInput"
                type="file"
                ref={fileInputRef}
                onChange={handleModalFileChange}
                className="mt-1"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              {modalFileName && (
                <div className="mt-2 text-xs text-slate-600 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3 text-blue-500" /> {modalFileName}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleRemoveModalFile} className="text-red-500 hover:text-red-600 h-auto p-1">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal}>Cancel</Button>
            <Button onClick={handleEditModalSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 