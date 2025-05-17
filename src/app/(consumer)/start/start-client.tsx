"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, SearchX, Info } from "lucide-react"
import type { PropertyData } from "@/lib/property-analysis/types"
import type { OverrideState } from "@/lib/property-analysis/types/override-types"
import type { AnalysisData } from "@/lib/property-analysis/types/analysis-types"
import { StepIndicator } from "./components/step-indicator"
import { PropertyValuesStep } from "./components/property-values-step"
import { AiAnalyzerStep } from "./components/ai-analyzer-step"
import { SupportingEvidenceStep } from "./components/supporting-evidence-step"
import { GenerateReportStep } from "./components/generate-report-step"
import { Button } from "@/components/ui/button"

interface StartClientProps {
  propertyData: PropertyData | null
  accountNumber: string | null
}

export function StartClient({
  propertyData: initialPropertyData,
  accountNumber,
}: StartClientProps) {
  const [step, setStep] = useState(1)
  const router = useRouter();

  const [finalOverrides, setFinalOverrides] = useState<OverrideState | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [testimonialEvidence, setTestimonialEvidence] = useState<string>("");
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

  const handleSupportingEvidenceNext = (files: File[], testimonial: string) => {
    setUploadedFiles(files);
    setTestimonialEvidence(testimonial);
    handleNext();
  };

  const handleGenerateReport = () => {
    if (!accountNumber || !initialPropertyData) {
      console.error("Account number or initial property data is missing, cannot generate report.");
      alert("Error: Account number or initial property data is missing.");
      return;
    }

    // Prepare data for the text file
    let reportContent = `Property Tax Protest Report\n`;
    reportContent += `=================================\n\n`;
    reportContent += `Account Number: ${accountNumber}\n`;
    reportContent += `Property Address: ${initialPropertyData.siteAddr1 || 'N/A'}\n`;
    reportContent += `Original Total Market Value: $${parseInt(initialPropertyData.totMktVal || "0").toLocaleString()}\n`;
    reportContent += `\n--- Subject Property Details (Original) ---\n`;
    reportContent += `Year Built: ${initialPropertyData.yrImpr || 'N/A'}\n`;
    reportContent += `Building Area (SqFt): ${initialPropertyData.bldAr ? parseInt(initialPropertyData.bldAr).toLocaleString() : 'N/A'}\n`;
    reportContent += `Land Area (Acres): ${initialPropertyData.landAr}\n`;
    reportContent += `Neighborhood Code: ${initialPropertyData.neighborhoodCode}\n`;
    reportContent += `\n`;

    if (finalOverrides) {
      reportContent += `--- Overridden Property Details ---\n`;
      if (finalOverrides.yearBuilt.value && finalOverrides.yearBuilt.value !== (initialPropertyData.yrImpr || '')) {
        reportContent += `Overridden Year Built: ${finalOverrides.yearBuilt.value}`; 
        if (finalOverrides.yearBuilt.fileName) reportContent += ` (Evidence: ${finalOverrides.yearBuilt.fileName})`;
        reportContent += `\n`;
      }
      if (finalOverrides.buildingSqFt.value && finalOverrides.buildingSqFt.value !== (initialPropertyData.bldAr || '')) {
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
        aiAnalysisData.top_comps.forEach((comp: any, index: number) => {
          reportContent += `  ${index + 1}. Account: ${comp.acct}\n`;
          reportContent += `     Address: ${comp.address}\n`;
          reportContent += `     Adjusted Value: ${comp.adjusted_value}\n`;
          reportContent += `     Adjusted PSF: ${comp.adjusted_psf}\n`;
          reportContent += `     Rank: ${comp.rank}\n`;
          reportContent += `     Rationale: ${comp.rationale}\n\n`;
        });
      }
      if (aiAnalysisData.excluded && aiAnalysisData.excluded.length > 0) {
        reportContent += `Excluded Properties:\n`;
        aiAnalysisData.excluded.forEach((ex: any) => {
          reportContent += `  Account: ${ex.acct} - Note: ${ex.note}\n`;
        });
        reportContent += `\n`;
      }
    }
    
    reportContent += `--- Supporting Evidence ---\n`;
    if (uploadedFiles.length > 0) {
      reportContent += `Uploaded Documents:\n`;
      uploadedFiles.forEach(file => {
        reportContent += `  - ${file.name} (${(file.size / 1024).toFixed(1)} KB)\n`;
      });
    } else {
      reportContent += `No documents uploaded.\n`;
    }
    reportContent += `\nTestimonial/Additional Notes:\n`;
    reportContent += `${testimonialEvidence || 'No testimonial provided.'}\n`;
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

  if (!accountNumber) {
    return (
      <div className="container max-w-5xl py-10">
        <div className="mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Property Analysis</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            No account number provided. Please start from the property search page.
          </p>
        </div>
      </div>
    )
  }

  if (!initialPropertyData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.20))]">
        <div className="text-center space-y-6 max-w-lg">
          <SearchX className="h-24 w-24 mx-auto text-red-400" />
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Property Not Found</h1>
          <p className="text-lg text-slate-600">
            We couldn&apos;t find any property data matching the account number you provided.
          </p>
          <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 inline-block">
            <p className="text-sm font-medium text-slate-500 mb-1">Account Number Searched</p>
            <p className="text-xl font-mono font-semibold text-slate-800">
              {accountNumber}
            </p>
          </div>
          <div className="space-y-4 pt-4">
            <p className="text-slate-600">Please verify the account number is correct or try searching again.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="default" size="lg">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Return to Search
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Link
          href={`/?accountNumber=${accountNumber}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </Link>
      </div>

      <div className="mb-8 bg-gradient-to-r from-slate-50 to-slate-100 p-8 rounded-xl border shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
          Property Tax Analysis
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Review and verify your property information and upload supporting evidence to help reduce your property tax
          assessment.
        </p>

        <div className="mt-6 flex items-center gap-2 text-sm font-medium">
          <div className="px-3 py-1 rounded-full bg-slate-200 text-slate-700">Account: {initialPropertyData.acct}</div>
          <div className="px-3 py-1 rounded-full bg-slate-200 text-slate-700">{initialPropertyData.siteAddr1}</div>
        </div>
      </div>

      <div className="mb-8 p-4 rounded-xl border shadow-sm bg-white">
        <StepIndicator currentStep={step} totalSteps={4} />
      </div>

      {step === 1 && (
        <PropertyValuesStep 
          propertyData={initialPropertyData} 
          onNext={handleNext} 
          onBack={() => router.push(`/?accountNumber=${accountNumber}`)}
        />
      )}

      {step === 2 && 
        <AiAnalyzerStep 
          onBack={handleBack} 
          onNext={handleAiAnalyzerNext}
          subjectProperty={initialPropertyData} 
        />
      }

      {step === 3 &&
        <SupportingEvidenceStep
          onBack={handleBack}
          onNext={handleSupportingEvidenceNext}
          initialFiles={uploadedFiles}
          initialTestimonial={testimonialEvidence}
        />
      }

      {step === 4 &&
        <GenerateReportStep
          onBack={handleBack}
          onGenerateReport={handleGenerateReport}
          accountNumber={accountNumber}
          propertyData={initialPropertyData}
          overrides={finalOverrides}
          aiAnalysisData={aiAnalysisData}
          evidenceFiles={uploadedFiles}
          testimonial={testimonialEvidence}
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