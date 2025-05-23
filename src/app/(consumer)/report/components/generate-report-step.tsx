"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { ArrowLeft, FileCheck2, AlertTriangle, Leaf, ShieldCheck, Info } from 'lucide-react';
import type { PropertyData } from "@/lib/property-analysis/types";
import type { OverrideState } from "@/lib/property-analysis/types/override-types";
import type { AnalysisData } from "@/lib/property-analysis/types/analysis-types";
import type { Comparable } from "@/lib/comparables/types";
import type { Deduction } from "@/lib/property-analysis/types/deduction-types";
import { deductionTypes as allDeductionTypes } from "@/lib/property-analysis/types/deduction-types";

interface GenerateReportStepProps {
  onBack: () => void;
  onGenerateReport: () => void;
  accountNumber: string | null;
  propertyData: PropertyData | null;
  overrides: OverrideState | null;
  aiAnalysisData: AnalysisData | null;
  additionalDeductions: Deduction[];
}

export function GenerateReportStep({
  onBack,
  onGenerateReport,
  accountNumber,
  propertyData,
  overrides,
  aiAnalysisData,
  additionalDeductions
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

  const overrideYearBuilt = overrides?.yearBuilt?.value || propertyData.yrImpr;
  const overrideBuildingSqFt = overrides?.buildingSqFt?.value || propertyData.bldAr;

  return (
    <Card className="mb-8 shadow-lg border-gray-200 overflow-hidden rounded-xl">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
            <FileCheck2 className="h-7 w-7 text-primary"/>
            Final Report Summary & Generation
        </CardTitle>
        <CardDescription className="text-gray-600">
          Review the complete summary of your property analysis and deductions. 
          Click &quot;Generate Report&quot; to create the protest document.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 p-6">
        
        {/* Property Information Section */}
        <section>
            <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" /> Property Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <p className="text-gray-500 mb-1">Account Number:</p> 
                    <p className="font-medium text-gray-800 text-base">{accountNumber}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <p className="text-gray-500 mb-1">Property Address:</p> 
                    <p className="font-medium text-gray-800 text-base">{propertyData.siteAddr1 || 'N/A'}</p>
                </div>
            </div>
        </section>

        {/* Overridden Values Section */}
        {(overrides?.yearBuilt?.value || overrides?.buildingSqFt?.value) && (
            <section>
                <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-amber-600" /> Corrected Property Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {overrides?.yearBuilt?.value && overrides.yearBuilt.value !== propertyData.yrImpr && (
                        <div className='bg-amber-50 p-4 rounded-lg border border-amber-300 shadow-sm'>
                            <p className="text-amber-700 mb-1">Year Built (Corrected):</p> 
                            <p className="font-medium text-amber-900 text-base">{overrideYearBuilt || 'N/A'}
                                <span className="text-xs text-amber-700 ml-1 font-normal">(Original: {propertyData.yrImpr || 'N/A'})</span>
                            </p>
                            {overrides.yearBuilt.fileName && <p className="text-xs text-gray-500 mt-1">Evidence: {overrides.yearBuilt.fileName}</p>}
                        </div>
                    )}
                    {overrides?.buildingSqFt?.value && overrides.buildingSqFt.value !== propertyData.bldAr && (
                        <div className='bg-amber-50 p-4 rounded-lg border border-amber-300 shadow-sm'>
                            <p className="text-amber-700 mb-1">Building SqFt (Corrected):</p> 
                            <p className="font-medium text-amber-900 text-base">{overrideBuildingSqFt ? parseInt(overrideBuildingSqFt).toLocaleString() : 'N/A'}
                                <span className="text-xs text-amber-700 ml-1 font-normal">(Original: {propertyData.bldAr ? parseInt(propertyData.bldAr).toLocaleString() : 'N/A'} SqFt)</span>
                            </p>
                            {overrides.buildingSqFt.fileName && <p className="text-xs text-gray-500 mt-1">Evidence: {overrides.buildingSqFt.fileName}</p>}
                        </div>
                    )}
                </div>
            </section>
        )}

        {/* AI Comparables Analysis Section */}
        <section>
            <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Leaf className="h-5 w-5 text-teal-600" /> AI Comparables Analysis
            </h3>
            <div className="bg-white p-4 rounded-lg border shadow-sm text-sm">
                <p className="text-gray-500 mb-2">Top Comparable Properties:</p> 
                {(aiAnalysisData && aiAnalysisData.top_comps && aiAnalysisData.top_comps.length > 0) ? (
                    <ul className="space-y-1 list-disc list-inside pl-2 font-medium text-gray-700">
                        {aiAnalysisData.top_comps.slice(0,3).map((comp: Comparable) => 
                            <li key={comp.acct}>Acct: {comp.acct} - Adjusted Value: {comp.adjusted_value || 'N/A'}</li>
                        )}
                        {aiAnalysisData.top_comps.length > 3 && <li className='text-xs text-gray-500'>...and {aiAnalysisData.top_comps.length - 3} more in the report.</li>}
                    </ul>
                ) : (
                    <p className="font-medium text-gray-700 italic">No comparable data from AI analysis.</p>
                )}
                {(aiAnalysisData && aiAnalysisData.excluded && aiAnalysisData.excluded.length > 0) && (
                    <div className="mt-3">
                        <p className="text-gray-500 mb-1">Excluded Properties:</p>
                        <p className="text-xs text-gray-600">
                            {aiAnalysisData.excluded.length} properties were excluded by the AI for specific reasons (detailed in report).
                        </p>
                    </div>
                )}
            </div>
        </section>

        {/* Additional Deductions Section */}
        <section>
             <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-indigo-600" /> Additional Deductions Summary
            </h3>
            {additionalDeductions && additionalDeductions.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm space-y-3">
                    {additionalDeductions.map((deduction, index) => {
                    const deductionTypeLabel = allDeductionTypes.find(dt => dt.value === deduction.type)?.label || deduction.type;
                    return (
                        <div key={deduction.id} className={`p-3 rounded-md border ${index > 0 ? 'mt-3' : ''}`}>
                            <p className="font-semibold text-gray-700 text-base">{index + 1}. {deductionTypeLabel}</p>
                            <p className="text-sm text-primary font-medium mb-1">Estimated Cost: ${deduction.amount.toLocaleString()}</p>
                            <p className="text-xs text-gray-600 line-clamp-2" title={deduction.description}>{deduction.description}</p>
                            <div className="flex gap-4 mt-1.5 text-xs text-gray-500">
                                {deduction.evidence.length > 0 && (
                                    <span>Evidence: {deduction.evidence.length} file(s)</span>
                                )}
                                {deduction.quotes.length > 0 && (
                                    <span>Quotes: {deduction.quotes.length} quote(s)</span>
                                )}
                            </div>
                        </div>
                    );
                    })}
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-300 shadow-sm text-base">
                    <p className="font-semibold text-green-800">
                        Total Estimated Deduction Value: ${additionalDeductions.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
                    </p>
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-lg border shadow-sm text-sm">
                <p className="italic text-gray-600">No additional deductions were specified.</p>
              </div>
            )}
        </section>

        <p className="text-sm text-gray-500 pt-4 text-center italic">
            All details, including AI analysis, comparable properties, evidence references, and full deduction descriptions, will be compiled into the final protest document.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between p-6 bg-gray-100 border-t">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={onGenerateReport} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3">
          Generate & Download Report <FileCheck2 className="h-5 w-5 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
} 