"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation';
import { ArrowLeft, Info } from "lucide-react"
import type { PropertyData } from "@/lib/property-analysis/types"
import type { OverrideState } from "@/lib/property-analysis/types/override-types"
import type { AnalysisData, ExcludedProperty } from "@/lib/property-analysis/types/analysis-types"
import type { Comparable } from "@/lib/comparables/types"
import type { Deduction, EvidenceFile as DeductionEvidenceFile, QuoteFile as DeductionQuoteFile } from "@/lib/property-analysis/types/deduction-types"
import { deductionTypes as allDeductionTypes } from "@/lib/property-analysis/types/deduction-types"
import { StepIndicator } from "./components/step-indicator"
import { PropertyValuesStep } from "./components/property-values-step"
import { AiAnalyzerStep } from "./components/ai-analyzer-step"
import { AdditionalDeductionsStep } from "./components/additional-deductions-step"
import { GenerateReportStep } from "./components/generate-report-step"
import { Button } from "@/components/ui/button"

interface StartClientProps {
  propertyData: PropertyData
  accountNumber: string
}

export function StartClient({
  propertyData,
  accountNumber,
}: StartClientProps) {
  const [step, setStep] = useState(1)
  const router = useRouter();

  const [finalOverrides, setFinalOverrides] = useState<OverrideState | null>(null);
  const [additionalDeductions, setAdditionalDeductions] = useState<Deduction[]>([]);
  const [aiAnalysisData, setAiAnalysisData] = useState<AnalysisData | null>(null);

  const handleNext = () => {
    setStep(prevStep => prevStep + 1)
  }

  const handleBack = () => {
    setStep(prevStep => prevStep - 1)
  }

  const handleAiAnalyzerNext = (overrides: OverrideState, analysisData: AnalysisData | null) => {
    setFinalOverrides(overrides);
    setAiAnalysisData(analysisData);
    handleNext();
  };

  const handleAdditionalDeductionsNext = (deductions: Deduction[]) => {
    setAdditionalDeductions(deductions);
    handleNext();
  };

  const handleGenerateReport = () => {
    // No need to check for accountNumber or propertyData as they are guaranteed to be present

    // Prepare data for the text file
    let reportContent = `Property Tax Protest Report\n`;
    reportContent += `=================================\n\n`;
    reportContent += `Account Number: ${accountNumber}\n`;
    reportContent += `Property Address: ${propertyData.siteAddr1 || 'N/A'}\n`;
    reportContent += `Original Total Market Value: $${parseInt(propertyData.totMktVal || "0").toLocaleString()}\n`;
    reportContent += `\n--- Subject Property Details (Original) ---\n`;
    reportContent += `Year Built: ${propertyData.yrImpr || 'N/A'}\n`;
    reportContent += `Building Area (SqFt): ${propertyData.bldAr ? parseInt(propertyData.bldAr).toLocaleString() : 'N/A'}\n`;
    reportContent += `Land Area (Acres): ${propertyData.landAr}\n`;
    reportContent += `Neighborhood Code: ${propertyData.neighborhoodCode}\n`;
    reportContent += `\n`;

    if (finalOverrides) {
      reportContent += `--- Overridden Property Details ---\n`;
      if (finalOverrides.yearBuilt.value && finalOverrides.yearBuilt.value !== (propertyData.yrImpr || '')) {
        reportContent += `Overridden Year Built: ${finalOverrides.yearBuilt.value}`; 
        if (finalOverrides.yearBuilt.fileName) reportContent += ` (Evidence: ${finalOverrides.yearBuilt.fileName})`;
        reportContent += `\n`;
      }
      if (finalOverrides.buildingSqFt.value && finalOverrides.buildingSqFt.value !== (propertyData.bldAr || '')) {
        reportContent += `Overridden Building SqFt: ${finalOverrides.buildingSqFt.value}`;
        if (finalOverrides.buildingSqFt.fileName) reportContent += ` (Evidence: ${finalOverrides.buildingSqFt.fileName})`;
        reportContent += `\n`;
      }
      reportContent += `\n`;
    }

    if (aiAnalysisData) {
      reportContent += `--- AI Comparables Analysis ---\n`;
      if (aiAnalysisData.top_comps && aiAnalysisData.top_comps.length > 0) {
        reportContent += `Top Comparable Properties:\n`;
        aiAnalysisData.top_comps.forEach((comp: Comparable, index: number) => {
          const adjustedValue = comp.adjusted_value !== undefined && comp.adjusted_value !== null ? parseInt(comp.adjusted_value as unknown as string).toLocaleString() : 'N/A';
          const adjustedPsf = comp.adjusted_psf !== undefined && comp.adjusted_psf !== null ? parseFloat(comp.adjusted_psf as unknown as string).toFixed(2) : 'N/A';
          reportContent += `  ${index + 1}. Account: ${comp.acct}\n`;
          reportContent += `     Address: ${comp.address}\n`;
          reportContent += `     Adjusted Value: $${adjustedValue}\n`;
          reportContent += `     Adjusted PSF: $${adjustedPsf}\n`;
          reportContent += `     Rank: ${comp.rank || 'N/A'}\n`;
          reportContent += `     Rationale: ${comp.rationale || 'N/A'}\n\n`;
        });
      }
      if (aiAnalysisData.excluded && aiAnalysisData.excluded.length > 0) {
        reportContent += `Excluded Properties:\n`;
        aiAnalysisData.excluded.forEach((ex: ExcludedProperty) => {
          reportContent += `  Account: ${ex.acct} - Note: ${ex.note}\n`;
        });
        reportContent += `\n`;
      }
    }
    
    if (additionalDeductions.length > 0) {
      reportContent += `--- Additional Deductions ---\n`;
      let totalDeductionAmount = 0;
      additionalDeductions.forEach((deduction, index) => {
        const deductionTypeLabel = allDeductionTypes.find(dt => dt.value === deduction.type)?.label || deduction.type;
        reportContent += `\nDeduction ${index + 1}: ${deductionTypeLabel}\n`;
        reportContent += `  Description: ${deduction.description}\n`;
        reportContent += `  Estimated Cost: $${deduction.amount.toLocaleString()}\n`;
        totalDeductionAmount += deduction.amount;

        if (deduction.evidence.length > 0) {
          reportContent += `  Attached Evidence:\n`;
          deduction.evidence.forEach((ev: DeductionEvidenceFile) => {
            reportContent += `    - ${ev.name} (${ev.type})\n`;
          });
        } else {
          reportContent += `  Attached Evidence: None\n`;
        }

        if (deduction.quotes.length > 0) {
          reportContent += `  Attached Quotes:\n`;
          deduction.quotes.forEach((quote: DeductionQuoteFile) => {
            reportContent += `    - ${quote.company}: $${quote.amount.toLocaleString()} (File: ${quote.name})\n`;
          });
        } else {
          reportContent += `  Attached Quotes: None\n`;
        }
      });
      reportContent += `\nTotal Estimated Deduction Value: $${totalDeductionAmount.toLocaleString()}\n`;
    } else {
      reportContent += `--- Additional Deductions ---\n`;
      reportContent += `No additional deductions specified.\n`;
    }
    reportContent += `\n\n--- End of Report ---\n`;

    // Create a blob and trigger download
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `property-report-${accountNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("Report data compiled and download initiated as TXT file.");
    // Keep the console logs for debugging if needed, or remove the alert.
    // alert("Report downloaded as a TXT file."); 
  };

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Link
          href={`/search`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </Link>
      </div>

      <div className="mb-8 bg-linear-to-r from-slate-50 to-slate-100 p-8 rounded-xl border shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-700">
          Property Tax Analysis
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Review and verify your property information and upload supporting evidence to help reduce your property tax
          assessment.
        </p>

        <div className="mt-6 flex items-center gap-2 text-sm font-medium">
          <div className="px-3 py-1 rounded-full bg-slate-200 text-slate-700">Account: {propertyData.acct}</div>
          <div className="px-3 py-1 rounded-full bg-slate-200 text-slate-700">{propertyData.siteAddr1}</div>
        </div>
      </div>

      <div className="mb-8 p-4 rounded-xl border shadow-sm bg-white">
        <StepIndicator currentStep={step} totalSteps={4} />
      </div>

      {step === 1 && (
        <PropertyValuesStep 
          propertyData={propertyData} 
          onNext={handleNext} 
          onBack={() => router.push(`/?accountNumber=${accountNumber}`)}
        />
      )}

      {step === 2 && 
        <AiAnalyzerStep 
          onBack={handleBack} 
          onNext={handleAiAnalyzerNext}
          subjectProperty={propertyData} 
        />
      }

      {step === 3 &&
        <AdditionalDeductionsStep
          onBack={handleBack}
          onNext={handleAdditionalDeductionsNext}
          initialDeductions={additionalDeductions}
        />
      }

      {step === 4 &&
        <GenerateReportStep
          onBack={handleBack}
          onGenerateReport={handleGenerateReport}
          accountNumber={accountNumber}
          propertyData={propertyData}
          overrides={finalOverrides}
          aiAnalysisData={aiAnalysisData}
          additionalDeductions={additionalDeductions}
        />
      }

      {/* Shared Help Footer */}
      <div className="mt-8 bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h3 className="font-medium text-sm flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-primary" />
          Need Help?
        </h3>
        <p className="text-sm text-slate-600 mb-3">
          Not sure what these values mean or how they affect your property tax protest?
        </p>
        <Button variant="outline" size="sm" className="w-full text-sm">
          View Property Value Guide
        </Button>
      </div>
    </div>
  )
} 