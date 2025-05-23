"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation';
import { ArrowLeft, Info } from "lucide-react"
import type { PropertyData } from "@/lib/property-analysis/types"
import type { OverrideState } from "@/lib/property-analysis/types/override-types"
import type { AnalysisData } from "@/lib/property-analysis/types/analysis-types"
import type { Deduction } from "@/lib/property-analysis/types/deduction-types"
import { StepIndicator } from "./components/step-indicator"
import { PropertyValuesStep } from "./components/property-values-step"
import { AiAnalyzerStep } from "./components/ai-analyzer-step"
import { AdditionalDeductionsStep } from "./components/additional-deductions-step"
import { GenerateReportStep } from "./components/generate-report-step"
import { Button } from "@/components/ui/button"
import { generateAndDownloadReport } from "@/lib/property-analysis/services/report-service"

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
    generateAndDownloadReport({
      accountNumber,
      propertyData,
      overrides: finalOverrides,
      aiAnalysisData,
      additionalDeductions,
    });
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