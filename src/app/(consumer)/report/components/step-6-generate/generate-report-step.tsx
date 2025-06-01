"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { ArrowLeft, FileCheck2, AlertTriangle, Leaf, ShieldCheck, Info, Building, DollarSign } from 'lucide-react';
import type { EnrichedPropertyData } from "@/lib/property-analysis/types/index";
import type { OverrideState } from "@/lib/property-analysis/types/override-types";
import type { AnalysisData } from "@/lib/property-analysis/types/analysis-types";
import type { Comparable } from "@/lib/comparables/types";
import type { Deduction } from "@/lib/property-analysis/types/deduction-types";
import type { ExtraFeaturesDisputeSummary } from "@/lib/property-analysis/types/extra-features-types";
import type { HousingMarketAdjustment } from "@/lib/property-analysis/types/housing-market-types";
import { deductionTypes as allDeductionTypes } from "@/lib/property-analysis/types/deduction-types";

interface GenerateReportStepProps {
  onBack: () => void;
  onGenerateReport: () => void;
  accountNumber: string | null;
  propertyData: EnrichedPropertyData | null;
  overrides: OverrideState | null;
  aiAnalysisData: AnalysisData | null;
  additionalDeductions: Deduction[];
  extraFeatureDisputes: ExtraFeaturesDisputeSummary | null;
  housingMarketAdjustment: HousingMarketAdjustment | null;
}

export function GenerateReportStep({
  onBack,
  onGenerateReport,
  accountNumber,
  propertyData,
  overrides,
  aiAnalysisData,
  additionalDeductions,
  extraFeatureDisputes,
  housingMarketAdjustment
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

  // Calculate final values
  const originalTotalValue = Number(propertyData.totMktVal || 0);
  
  // Get equity adjusted value (median of comparables) from AI analysis
  const getEquityAdjustedValue = () => {
    if (!aiAnalysisData?.top_comps || aiAnalysisData.top_comps.length === 0) {
      return originalTotalValue; // Fallback to original if no comparables
    }
    
    // Extract adjusted values and calculate median
    const adjustedValues = aiAnalysisData.top_comps
      .map(comp => {
        const value = typeof comp.adjusted_value === 'string' 
          ? parseFloat(comp.adjusted_value.replace(/[$,]/g, '')) 
          : comp.adjusted_value;
        return isNaN(value) ? 0 : value;
      })
      .filter(value => value > 0)
      .sort((a, b) => a - b);
    
    if (adjustedValues.length === 0) return originalTotalValue;
    
    const midIndex = Math.floor(adjustedValues.length / 2);
    return adjustedValues.length % 2 === 0
      ? (adjustedValues[midIndex - 1] + adjustedValues[midIndex]) / 2
      : adjustedValues[midIndex];
  };
  
  const equityAdjustedValue = getEquityAdjustedValue();
  const equityAdjustment = equityAdjustedValue - originalTotalValue; // Delta from original
  const extraFeaturesReduction = extraFeatureDisputes?.totalValueReduction || 0;
  const additionalDeductionsTotal = additionalDeductions.reduce((sum, d) => sum + d.amount, 0);
  
  // Calculate value before housing market adjustment
  const valueBeforeMarketAdjustment = Math.max(0, equityAdjustedValue - extraFeaturesReduction - additionalDeductionsTotal);
  
  // Apply housing market adjustment
  const housingMarketReduction = housingMarketAdjustment 
    ? (valueBeforeMarketAdjustment * housingMarketAdjustment.percentage) / 100 
    : 0;
  
  const finalValue = Math.max(0, valueBeforeMarketAdjustment - housingMarketReduction);
  const totalReduction = originalTotalValue - finalValue; // Total reduction from original
  const percentageReduction = originalTotalValue > 0 ? (totalReduction / originalTotalValue) * 100 : 0;

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

        {/* Value Summary Section */}
        <section>
            <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" /> Value Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
                    <p className="text-gray-500 mb-1 text-sm">Original Assessed Value</p>
                    <p className="font-bold text-gray-800 text-lg">${originalTotalValue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">County's assessment</p>
                </div>
                {equityAdjustment !== 0 && (
                    <div className={`p-4 rounded-lg border shadow-sm text-center ${
                        equityAdjustment > 0 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-blue-50 border-blue-200'
                    }`}>
                        <p className={`mb-1 text-sm ${
                            equityAdjustment > 0 ? 'text-red-700' : 'text-blue-700'
                        }`}>Equity Adjustment</p>
                        <p className={`font-bold text-lg ${
                            equityAdjustment > 0 ? 'text-red-800' : 'text-blue-800'
                        }`}>
                            {equityAdjustment > 0 ? '+' : ''}${equityAdjustment.toLocaleString()}
                        </p>
                        <p className={`text-xs mt-1 ${
                            equityAdjustment > 0 ? 'text-red-600' : 'text-blue-600'
                        }`}>Based on comparables</p>
                    </div>
                )}
                {extraFeaturesReduction > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm text-center">
                        <p className="text-red-700 mb-1 text-sm">Extra Features Reduction</p>
                        <p className="font-bold text-red-800 text-lg">-${extraFeaturesReduction.toLocaleString()}</p>
                    </div>
                )}
                {additionalDeductionsTotal > 0 && (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 shadow-sm text-center">
                        <p className="text-orange-700 mb-1 text-sm">Additional Deductions</p>
                        <p className="font-bold text-orange-800 text-lg">-${additionalDeductionsTotal.toLocaleString()}</p>
                    </div>
                )}
                {housingMarketReduction > 0 && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 shadow-sm text-center">
                        <p className="text-purple-700 mb-1 text-sm">Market Adjustment</p>
                        <p className="font-bold text-purple-800 text-lg">-${housingMarketReduction.toLocaleString()}</p>
                        <p className="text-xs text-purple-600 mt-1">{housingMarketAdjustment?.percentage}% decline</p>
                    </div>
                )}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm text-center">
                    <p className="text-green-700 mb-1 text-sm">Proposed Value</p>
                    <p className="font-bold text-green-800 text-lg">${finalValue.toLocaleString()}</p>
                    {percentageReduction > 0 && (
                        <p className="text-xs text-green-600 mt-1">{percentageReduction.toFixed(1)}% reduction</p>
                    )}
                </div>
            </div>
            
            {/* Calculation Flow */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-600 mb-2 font-medium">Calculation:</p>
                <div className="text-sm text-gray-700 space-y-1">
                    <div className="flex justify-between">
                        <span>Original Assessed Value:</span>
                        <span className="font-medium">${originalTotalValue.toLocaleString()}</span>
                    </div>
                    {equityAdjustment !== 0 && (
                        <div className={`flex justify-between ${
                            equityAdjustment > 0 ? 'text-red-600' : 'text-blue-600'
                        }`}>
                            <span>{equityAdjustment > 0 ? 'Plus' : 'Less'}: Equity Adjustment:</span>
                            <span className="font-medium">
                                {equityAdjustment > 0 ? '+' : ''}${equityAdjustment.toLocaleString()}
                            </span>
                        </div>
                    )}
                    {extraFeaturesReduction > 0 && (
                        <div className="flex justify-between text-red-600">
                            <span>Less: Extra Features Reduction:</span>
                            <span className="font-medium">-${extraFeaturesReduction.toLocaleString()}</span>
                        </div>
                    )}
                    {additionalDeductionsTotal > 0 && (
                        <div className="flex justify-between text-orange-600">
                            <span>Less: Additional Deductions:</span>
                            <span className="font-medium">-${additionalDeductionsTotal.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-bold text-green-700">
                        <span>Proposed Market Value:</span>
                        <span>${finalValue.toLocaleString()}</span>
                    </div>
                    {totalReduction > 0 && (
                        <div className="mt-2 pt-2 border-t text-xs text-gray-500">
                            <span>Total Reduction from Original: ${totalReduction.toLocaleString()} ({percentageReduction.toFixed(1)}%)</span>
                        </div>
                    )}
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

        {/* Extra Features Disputes Section */}
        {extraFeatureDisputes && extraFeatureDisputes.disputes.some(d => d.disputed) && (
            <section>
                <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Building className="h-5 w-5 text-purple-600" /> Extra Features Disputes
                </h3>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                        <div className="text-center">
                            <p className="text-gray-500 mb-1">Original Extra Features Value</p>
                            <p className="font-medium text-gray-800">${extraFeatureDisputes.totalOriginalValue.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-500 mb-1">Your Estimated Value</p>
                            <p className="font-medium text-gray-800">${extraFeatureDisputes.totalDisputedValue.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-500 mb-1">Value Reduction</p>
                            <p className="font-medium text-red-600">${extraFeatureDisputes.totalValueReduction.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-gray-500 mb-2 text-sm">Disputed Features:</p>
                        {extraFeatureDisputes.disputes.filter(d => d.disputed).map((dispute, index) => (
                            <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                                <span className="font-medium">{dispute.description}</span>
                                <span className="text-gray-600 ml-2">
                                    (${Number(dispute.originalValue).toLocaleString()} → ${Number(dispute.disputedValue).toLocaleString()})
                                </span>
                            </div>
                        ))}
                    </div>
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