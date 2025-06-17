"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { ArrowLeft, Camera, FileText, HelpCircle, Info, Lightbulb, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Deduction, EvidenceFile, QuoteFile } from "@/lib/property-analysis/types/deduction-types";
import { deductionTypes } from "@/lib/property-analysis/types/deduction-types";

const textAreaPlaceholder = `Describe the issue in detail (e.g., 'Large crack in the west foundation wall, approximately 5 feet long.')`;

interface AdditionalDeductionsStepProps {
  onBack: () => void;
  onNext: (deductions: Deduction[]) => void;
  initialDeductions?: Deduction[];
}

export function AdditionalDeductionsStep({
  onBack,
  onNext,
  initialDeductions = [],
}: AdditionalDeductionsStepProps) {
  const [deductions, setDeductions] = useState<Deduction[]>(initialDeductions);
  const [currentTab, setCurrentTab] = useState("add");
  const [totalDeductionsValue, setTotalDeductionsValue] = useState(0);

  useEffect(() => {
    setTotalDeductionsValue(deductions.reduce((sum, d) => sum + d.amount, 0));
  }, [deductions]);

  const [newDeduction, setNewDeduction] = useState<Omit<Deduction, "id">>({
    type: "",
    description: "",
    amount: 0,
    evidence: [],
    quotes: [],
  });

  const [tempEvidenceFiles, setTempEvidenceFiles] = useState<File[]>([]);
  const [tempQuoteDetails, setTempQuoteDetails] = useState<{
    file: File | null;
    amount: number;
    company: string;
  }>({
    file: null,
    amount: 0,
    company: "",
  });

  const handleAddDeduction = () => {
    if (!newDeduction.type || !newDeduction.description || newDeduction.amount <= 0) {
      // TODO: Add user feedback for validation (e.g., toast notification)
      console.warn("Validation failed for new deduction");
      return;
    }

    const newId = `deduction-${Date.now()}`;
    const preparedEvidence: EvidenceFile[] = newDeduction.evidence.map(ev => ({...ev, url: URL.createObjectURL(ev.file as File)}))
    const preparedQuotes: QuoteFile[] = newDeduction.quotes.map(q => ({...q, url: URL.createObjectURL(q.file as File)}))

    const deductionToAdd: Deduction = {
      ...newDeduction,
      id: newId,
      evidence: preparedEvidence,
      quotes: preparedQuotes
    };

    setDeductions([...deductions, deductionToAdd]);

    setNewDeduction({
      type: "",
      description: "",
      amount: 0,
      evidence: [],
      quotes: [],
    });
    setTempEvidenceFiles([]);
    setTempQuoteDetails({ file: null, amount: 0, company: "" });
    setCurrentTab("review");
  };

  const handleEvidenceFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setTempEvidenceFiles([...tempEvidenceFiles, ...filesArray]);
    }
  };

  const handleAddTempEvidenceToDeduction = () => {
    if (tempEvidenceFiles.length === 0) return;

    const newEvidenceObjects: EvidenceFile[] = tempEvidenceFiles.map((file) => ({
      id: `evidence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type.startsWith("image/") ? "photo" : "document",
      url: "", // URL will be created on final add deduction or submission
      file: file, 
    }));

    setNewDeduction({
      ...newDeduction,
      evidence: [...newDeduction.evidence, ...newEvidenceObjects],
    });
    setTempEvidenceFiles([]); 
  };
  
  const handleRemoveEvidenceFromNewDeduction = (id: string) => {
    setNewDeduction({
      ...newDeduction,
      evidence: newDeduction.evidence.filter((e) => e.id !== id),
    });
  };

  const handleQuoteFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTempQuoteDetails({
        ...tempQuoteDetails,
        file: e.target.files[0],
      });
    }
  };

  const handleAddTempQuoteToDeduction = () => {
    if (!tempQuoteDetails.file || tempQuoteDetails.amount <= 0 || !tempQuoteDetails.company) return;

    const newQuoteObject: QuoteFile = {
      id: `quote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: tempQuoteDetails.file.name,
      amount: tempQuoteDetails.amount,
      company: tempQuoteDetails.company,
      url: "", // URL will be created on final add deduction or submission
      file: tempQuoteDetails.file,
    };

    setNewDeduction({
      ...newDeduction,
      quotes: [...newDeduction.quotes, newQuoteObject],
    });
    setTempQuoteDetails({ file: null, amount: 0, company: "" });
  };

  const handleRemoveQuoteFromNewDeduction = (id: string) => {
    setNewDeduction({
      ...newDeduction,
      quotes: newDeduction.quotes.filter((q) => q.id !== id),
    });
  };

  const handleRemoveDeduction = (id: string) => {
    setDeductions(deductions.filter((d) => d.id !== id));
  };

  const handleSubmitAllDeductions = () => {
    // Create blob URLs right before passing to next step
    const finalDeductions = deductions.map(ded => ({
      ...ded,
      evidence: ded.evidence.map(ev => ({
        ...ev,
        url: ev.file ? URL.createObjectURL(ev.file) : ev.url // if URL already exists (e.g. from initialDeductions)
      })),
      quotes: ded.quotes.map(q => ({
        ...q,
        url: q.file ? URL.createObjectURL(q.file) : q.url // if URL already exists
      }))
    }));
    onNext(finalDeductions);
  };

  // Clean up Blob URLs when component unmounts or when deductions/evidence/quotes are removed
  useEffect(() => {
    return () => {
      deductions.forEach(deduction => {
        deduction.evidence.forEach(ev => ev.url && URL.revokeObjectURL(ev.url));
        deduction.quotes.forEach(q => q.url && URL.revokeObjectURL(q.url));
      });
      // Also cleanup newDeduction temporary blob urls if any (though less likely here)
      newDeduction.evidence.forEach(ev => ev.url && URL.revokeObjectURL(ev.url));
      newDeduction.quotes.forEach(q => q.url && URL.revokeObjectURL(q.url));
    };
  }, [deductions, newDeduction]);


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Additional Property Deductions</h2>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Why add deductions?</AlertTitle>
        <AlertDescription>
          Property tax assessments are based on your property's market value. Documenting issues that reduce your
          property's value (like necessary repairs) can help lower your assessment and save you money on taxes.
        </AlertDescription>
      </Alert>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add">Add Deduction</TabsTrigger>
          <TabsTrigger value="review">Review Deductions ({deductions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add a New Deduction
              </CardTitle>
              <CardDescription>Document an issue with your property and provide supporting evidence and quotes for repair.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="deduction-type">Type of Issue</Label>
                  <Select
                    value={newDeduction.type}
                    onValueChange={(value) => setNewDeduction({ ...newDeduction, type: value })}
                  >
                    <SelectTrigger id="deduction-type">
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      {deductionTypes.map((type) => (
                        <SelectItem key={`deduction-type-${type.value}`} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deduction-amount">Estimated Repair Cost ($)</Label>
                  <Input
                    id="deduction-amount"
                    type="number"
                    min="0"
                    placeholder="e.g., 5000"
                    value={newDeduction.amount || ""}
                    onChange={(e) =>
                      setNewDeduction({
                        ...newDeduction,
                        amount: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deduction-description">Description of Issue</Label>
                <Textarea
                  id="deduction-description"
                  placeholder={textAreaPlaceholder}
                  rows={3}
                  value={newDeduction.description}
                  onChange={(e) => setNewDeduction({ ...newDeduction, description: e.target.value })}
                />
              </div>

              {/* Evidence Section */}
              <div className="space-y-4 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Supporting Evidence</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1 text-xs">
                        <HelpCircle className="h-3.5 w-3.5" />
                        Evidence Tips
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Evidence Guidelines</DialogTitle>
                        <DialogDescription>
                          Strong evidence increases your chances of a successful protest.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="rounded-lg bg-muted p-4">
                          <h4 className="font-semibold">Recommended Evidence:</h4>
                          <ul className="mt-2 space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <Camera className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                              <span>Clear photos showing the damage or issue.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                              <span>Inspection reports documenting the issues.</span>
                            </li>
                             <li className="flex items-start gap-2">
                              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                              <span>Receipts for repairs already completed (if applicable and recent).</span>
                            </li>
                          </ul>
                        </div>
                        <div className="rounded-lg border p-4">
                          <h4 className="font-semibold">Tips for Better Photos:</h4>
                          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <li>• Ensure good lighting so damage is clearly visible.</li>
                            <li>• Include wide shots for context and close-ups of specific damage.</li>
                            <li>• Use a ruler or tape measure in photos for scale, if relevant.</li>
                            <li>• Take photos from multiple angles.</li>
                          </ul>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" className="w-full" onClick={(e) => ((e.target as HTMLElement)?.closest('[role="dialog"]')?.querySelector('[aria-label="Close"]') as HTMLElement)?.click()}>Close</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div>
                  <Label htmlFor="evidence-upload" className="text-sm font-medium">
                    Upload Photos & Documents
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      id="evidence-upload"
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      className="flex-1"
                      onChange={handleEvidenceFileSelect}
                      key={tempEvidenceFiles.map(f => f.name).join('-') } // Reset input for re-uploading same file name
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleAddTempEvidenceToDeduction}
                      disabled={tempEvidenceFiles.length === 0}
                    >
                      Add Files to Deduction
                    </Button>
                  </div>
                  {tempEvidenceFiles.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {tempEvidenceFiles.length} file(s) ready to be added. Click &quot;Add Files to Deduction&quot;.
                    </p>
                  )}
                </div>
                {newDeduction.evidence.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Attached Evidence ({newDeduction.evidence.length})</Label>
                    <div className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded-md border p-2">
                      {newDeduction.evidence.map((file) => (
                        <div key={`evidence-${file.id}`} className="flex items-center justify-between rounded-md bg-muted p-2 text-sm">
                          <div className="flex items-center gap-2 truncate">
                            {file.type === "photo" ? (
                              <Camera className="h-4 w-4 flex-shrink-0 text-primary" />
                            ) : (
                              <FileText className="h-4 w-4 flex-shrink-0 text-primary" />
                            )}
                            <span className="truncate" title={file.name}>{file.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => handleRemoveEvidenceFromNewDeduction(file.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quotes Section */}
              <div className="space-y-4 rounded-md border p-4">
                <h3 className="font-medium">Repair Quotes</h3>
                 <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label htmlFor="quote-company" className="text-sm">
                          Contractor/Company Name
                        </Label>
                        <Input
                          id="quote-company"
                          placeholder="e.g., ABC Repairs Inc."
                          value={tempQuoteDetails.company}
                          onChange={(e) => setTempQuoteDetails({ ...tempQuoteDetails, company: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="quote-amount" className="text-sm">
                          Quote Amount ($)
                        </Label>
                        <Input
                          id="quote-amount"
                          type="number"
                          min="0"
                          placeholder="e.g., 1200"
                          value={tempQuoteDetails.amount || ""}
                          onChange={(e) =>
                            setTempQuoteDetails({
                              ...tempQuoteDetails,
                              amount: Number.parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="quote-upload" className="text-sm">
                          Upload Quote Document (PDF, Image, Doc)
                        </Label>
                        <div className="mt-1 flex items-center gap-2">
                           <Input
                            id="quote-upload"
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.heic"
                            className="flex-1"
                            onChange={handleQuoteFileSelect}
                            key={tempQuoteDetails.file?.name || 'quote-file-input'} // Reset for re-upload
                          />
                          <TooltipProvider>
                            <Tooltip open={(!tempQuoteDetails.file || tempQuoteDetails.amount <= 0 || !tempQuoteDetails.company) ? undefined : false }>
                              <TooltipTrigger asChild>
                                <div tabIndex={0}> {/* Wrap button in a div for TooltipTrigger when button is disabled */} 
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleAddTempQuoteToDeduction}
                                    disabled={!tempQuoteDetails.file || tempQuoteDetails.amount <= 0 || !tempQuoteDetails.company}
                                    className="w-full md:w-auto" // Ensure it takes space
                                  >
                                    Add Quote to Deduction
                                  </Button>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Please provide:</p>
                                <ul className="list-disc list-inside text-xs">
                                  {!tempQuoteDetails.company && <li>Contractor/Company Name</li>}
                                  {!(tempQuoteDetails.amount > 0) && <li>Quote Amount</li>}
                                  {!tempQuoteDetails.file && <li>Quote Document</li>}
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                 </div>

                {newDeduction.quotes.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Attached Quotes ({newDeduction.quotes.length})</Label>
                    <div className="mt-2 max-h-48 space-y-2 overflow-y-auto rounded-md border p-2">
                      {newDeduction.quotes.map((quote) => (
                        <div key={`quote-${quote.id}`} className="rounded-md bg-muted p-3">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-primary">{quote.company}</div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 flex-shrink-0"
                              onClick={() => handleRemoveQuoteFromNewDeduction(quote.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 truncate text-muted-foreground">
                              <FileText className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate" title={quote.name}>{quote.name}</span>
                            </div>
                            <span className="font-semibold">${quote.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                 setNewDeduction({ type: "", description: "", amount: 0, evidence: [], quotes: [] });
                 setTempEvidenceFiles([]);
                 setTempQuoteDetails({ file: null, amount: 0, company: "" });
                 setCurrentTab("review");
              }}>
                Cancel New Deduction
              </Button>
              <Button onClick={handleAddDeduction} disabled={!newDeduction.type || !newDeduction.description || newDeduction.amount <= 0}>
                Save and Add This Deduction
              </Button>
            </CardFooter>
          </Card>

          <div className="rounded-lg border bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <h3 className="font-medium">Common Deduction Types & Examples</h3>
            </div>
            <div className="mt-4 grid gap-x-4 gap-y-2 md:grid-cols-2">
              <Accordion type="multiple" className="w-full">
                {deductionTypes.slice(0, Math.ceil(deductionTypes.length / 2)).map(dt => (
                  <AccordionItem value={dt.value} key={`dt-first-${dt.value}`}>
                    <AccordionTrigger className="text-sm">{dt.label}</AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground">
                      {/* Placeholder for specific examples - can be expanded later */}
                      E.g., Visible cracks, water damage, non-functional systems.
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Accordion type="multiple" className="w-full">
                {deductionTypes.slice(Math.ceil(deductionTypes.length / 2)).map(dt => (
                  <AccordionItem value={dt.value} key={`dt-second-${dt.value}`}>
                    <AccordionTrigger className="text-sm">{dt.label}</AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground">
                      E.g., Leaks, Pests, Outdated features impacting value.
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="review" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Your Added Deductions</CardTitle>
              <CardDescription>
                Review all property issues you've documented. These will be included in your protest report.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deductions.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No Deductions Added Yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Go to the &quot;Add Deduction&quot; tab to document property issues that could reduce its assessed value.
                  </p>
                  <Button className="mt-6" variant="outline" onClick={() => setCurrentTab("add")}>
                    <Plus className="mr-2 h-4 w-4" /> Add Your First Deduction
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <Alert variant="default" className="bg-green-50 border-green-200">
                     <Info className="h-4 w-4 !text-green-700" />
                    <AlertTitle className="text-green-800">Total Estimated Deduction Value</AlertTitle>
                    <AlertDescription className="text-base font-semibold text-green-700">
                      ${totalDeductionsValue.toLocaleString()}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    {deductions.map((deduction) => {
                      const DeductionKey = `deduction-${deduction.type}-${deduction.amount}`
                      const deductionTypeInfo = deductionTypes.find((t) => t.value === deduction.type);
                      return (
                        <Card key={DeductionKey} className="border-l-4 border-l-orange-500">
                          <CardHeader className="flex flex-row items-start justify-between bg-muted/50 px-4 py-3">
                            <div>
                               <CardTitle className="text-lg">{deductionTypeInfo?.label || deduction.type}</CardTitle>
                               <p className="text-sm text-destructive-foreground font-semibold">
                                Amount: ${deduction.amount.toLocaleString()}
                               </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleRemoveDeduction(deduction.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove Deduction</span>
                            </Button>
                          </CardHeader>
                          <CardContent className="space-y-3 p-4">
                             <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">Description: </span> {deduction.description}
                            </p>
                            
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                                  Evidence ({deduction.evidence.length})
                                </h4>
                                {deduction.evidence.length === 0 ? (
                                  <p className="mt-1 text-xs text-muted-foreground italic">No evidence attached.</p>
                                ) : (
                                  <ul className="mt-1 space-y-1">
                                    {deduction.evidence.map((file) => (
                                      <li key={`deduction-evidence-${file.id}`} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        {file.type === "photo" ? (
                                          <Camera className="h-3.5 w-3.5 flex-shrink-0 text-sky-600" />
                                        ) : (
                                          <FileText className="h-3.5 w-3.5 flex-shrink-0 text-sky-600" />
                                        )}
                                        <span className="truncate" title={file.name}>{file.name}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>

                              <div>
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                                  Quotes ({deduction.quotes.length})
                                </h4>
                                {deduction.quotes.length === 0 ? (
                                  <p className="mt-1 text-xs text-muted-foreground italic">No quotes attached.</p>
                                ) : (
                                  <ul className="mt-1 space-y-1">
                                    {deduction.quotes.map((quote) => (
                                      <li key={`deduction-quote-${quote.id}`} className="text-xs text-muted-foreground">
                                        <div className="flex items-center justify-between">
                                          <span className="truncate" title={`${quote.company} - ${quote.name}`}>{quote.company}</span>
                                          <span className="font-medium text-foreground">${quote.amount.toLocaleString()}</span>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t px-4 py-3">
               <Button variant="ghost" onClick={() => setCurrentTab("add")}>
                <Plus className="mr-2 h-4 w-4" /> Add Another Deduction
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleSubmitAllDeductions} disabled={deductions.length === 0}>
                  Next: Generate Report
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 