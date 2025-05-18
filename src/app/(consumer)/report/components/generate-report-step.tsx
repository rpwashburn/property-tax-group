"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { ArrowLeft, FileCheck2, AlertTriangle } from 'lucide-react';
import type { PropertyData } from "@/lib/property-analysis/types";
import type { OverrideState } from "@/lib/property-analysis/types/override-types";
import type { AnalysisData, ExcludedProperty } from "@/lib/property-analysis/types/analysis-types";
import type { Comparable } from "@/lib/comparables/types";

interface GenerateReportStepProps {
  onBack: () => void;
  onGenerateReport: () => void;
  accountNumber: string | null;
  propertyData: PropertyData | null;
  overrides: OverrideState | null;
  aiAnalysisData: AnalysisData | null;
  evidenceFiles: File[];
  testimonial: string;
}

export function GenerateReportStep({
  onBack,
  onGenerateReport,
  accountNumber,
  propertyData,
  overrides,
  aiAnalysisData,
  evidenceFiles,
  testimonial
}: GenerateReportStepProps) {

  if (!propertyData || !accountNumber) {
    return (
        <Card className="mb-8 shadow-md border-destructive overflow-hidden">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-6 w-6" />
                    Error: Missing Information
                </CardTitle>
                <CardDescription>
                    Critical information like property data or account number is missing. Cannot proceed to report generation.
                </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-start p-6 bg-slate-50 border-t">
                <Button variant="outline" onClick={onBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Go Back
                </Button>
            </CardFooter>
        </Card>
    );
  }

  // Create a summary of data to be included in the report
  const overrideYearBuilt = overrides?.yearBuilt?.value || propertyData.yrImpr;
  const overrideBuildingSqFt = overrides?.buildingSqFt?.value || propertyData.bldAr;

  return (
    <Card className="mb-8 shadow-md border-slate-200 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-primary"/>
            Generate Protest Report
        </CardTitle>
        <CardDescription>
          Review the summary of information that will be included in your property tax protest report. 
          Click &quot;Generate Report&quot; to create the PDF document.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Report Summary:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 p-3 rounded-md border">
                    <p className="text-muted-foreground mb-1">Account Number:</p> 
                    <p className="font-medium text-slate-700">{accountNumber}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-md border">
                    <p className="text-muted-foreground mb-1">Property Address:</p> 
                    <p className="font-medium text-slate-700">{propertyData.siteAddr1 || 'N/A'}</p>
                </div>
            </div>

            <h4 className="text-md font-semibold text-slate-700 pt-2">Property Details:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className={`p-3 rounded-md border ${overrides?.yearBuilt?.value && overrides.yearBuilt.value !== propertyData.yrImpr ? 'bg-amber-50 border-amber-300' : 'bg-slate-50'}`}>
                    <p className="text-muted-foreground mb-1">Year Built:</p> 
                    <p className="font-medium">{overrideYearBuilt || 'N/A'}
                        {overrides?.yearBuilt?.value && overrides.yearBuilt.value !== propertyData.yrImpr && <span className="text-xs text-amber-700 ml-1">(Override)</span>}
                    </p>
                     {overrides?.yearBuilt?.fileName && <p className="text-xs text-slate-500 mt-0.5">File: {overrides.yearBuilt.fileName}</p>}
                </div>
                <div className={`p-3 rounded-md border ${overrides?.buildingSqFt?.value && overrides.buildingSqFt.value !== propertyData.bldAr ? 'bg-amber-50 border-amber-300' : 'bg-slate-50'}`}>
                    <p className="text-muted-foreground mb-1">Building SqFt:</p> 
                    <p className="font-medium">{overrideBuildingSqFt ? parseInt(overrideBuildingSqFt).toLocaleString() : 'N/A'}
                        {overrides?.buildingSqFt?.value && overrides.buildingSqFt.value !== propertyData.bldAr && <span className="text-xs text-amber-700 ml-1">(Override)</span>}
                    </p>
                    {overrides?.buildingSqFt?.fileName && <p className="text-xs text-slate-500 mt-0.5">File: {overrides.buildingSqFt.fileName}</p>}
                </div>
            </div>

            <h4 className="text-md font-semibold text-slate-700 pt-2">AI Comparables Analysis:</h4>
            <div className="bg-slate-50 p-3 rounded-md border text-sm">
                <p className="text-muted-foreground mb-1">Comparable Properties:</p> 
                {(aiAnalysisData && aiAnalysisData.top_comps && aiAnalysisData.top_comps.length > 0) ? (
                    <ul className="list-disc list-inside pl-2 font-medium text-slate-700">
                        {aiAnalysisData.top_comps.map((comp: Comparable) => <li key={comp.acct}>Acct: {comp.acct} - Value: {comp.adjusted_value}</li>)}
                    </ul>
                ) : (
                    <p className="font-medium text-slate-700">No comparable data from AI analysis.</p>
                )}
                {(aiAnalysisData && aiAnalysisData.excluded && aiAnalysisData.excluded.length > 0) && (
                    <div className="mt-2">
                        <p className="text-muted-foreground mb-1">Excluded Properties:</p>
                        <ul className="list-disc list-inside pl-2 font-medium text-slate-700">
                            {aiAnalysisData.excluded.map((excl: ExcludedProperty) => <li key={excl.acct}>Acct: {excl.acct} - Note: {excl.note}</li>)}
                        </ul>
                    </div>
                )}
            </div>

            <h4 className="text-md font-semibold text-slate-700 pt-2">Evidence:</h4>
            <div className="bg-slate-50 p-3 rounded-md border text-sm">
                <p className="text-muted-foreground mb-1">Uploaded Documents:</p> 
                {evidenceFiles.length > 0 ? (
                    <ul className="list-disc list-inside pl-2 font-medium text-slate-700">
                        {evidenceFiles.map(file => <li key={file.name}>{file.name} ({ (file.size / 1024).toFixed(1) } KB)</li>)}
                    </ul>
                ) : (
                    <p className="font-medium text-slate-700">No documents uploaded.</p>
                )}
            </div>
             <div className="bg-slate-50 p-3 rounded-md border text-sm">
                <p className="text-muted-foreground mb-1">Testimonial/Notes:</p> 
                {testimonial ? (
                    <p className="font-medium text-slate-700 whitespace-pre-wrap">{testimonial}</p>
                ) : (
                    <p className="font-medium text-slate-700">No testimonial provided.</p>
                )}
            </div>
            <p className="text-xs text-slate-500 pt-2">
                The AI analysis, comparable properties, and detailed calculations will also be included in the final PDF report.
            </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-6 bg-slate-50 border-t">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={onGenerateReport} className="gap-2 bg-primary hover:bg-primary-focus text-primary-foreground">
          Generate PDF Report <FileCheck2 className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
} 