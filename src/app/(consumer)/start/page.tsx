"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, SearchX } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { getPropertyDataByAccountNumber } from "@/lib/property-analysis/server"
import type { PropertyData } from "@/lib/property-analysis/types"
import { StepIndicator } from "./components/step-indicator"
import { PropertyDetailsStep } from "./components/property-details-step"
import { PropertyValuesStep } from "./components/property-values-step"
import { SupportingEvidenceStep } from "./components/supporting-evidence-step"
import { Button } from "@/components/ui/button"

function PropertyAnalysisContent() {
  const searchParams = useSearchParams()
  const accountNumber = searchParams.get("accountNumber")
  const [step, setStep] = useState(1)
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!accountNumber) return

      try {
        const data = await getPropertyDataByAccountNumber(accountNumber)
        if (!data) {
          toast.error("Property not found")
          return
        }
        setPropertyData(data)
      } catch {
        toast.error("Failed to load property data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [accountNumber])

  const handleNext = () => {
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

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

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-10">
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-muted h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-semibold mt-4">Loading Property Data...</h1>
        </div>
      </div>
    )
  }

  if (!propertyData) {
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
    <div className="container max-w-5xl py-10">
      <div className="mb-8">
        <Link
          href={`/?accountNumber=${accountNumber}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </Link>
      </div>

      <div className="mb-10 bg-gradient-to-r from-slate-50 to-slate-100 p-8 rounded-xl border shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
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

      <StepIndicator currentStep={step} totalSteps={3} className="mb-10" />

      {step === 1 && (
        <PropertyValuesStep propertyData={propertyData} onNext={handleNext} onBack={() => window.history.back()} />
      )}

      {step === 2 && <PropertyDetailsStep propertyData={propertyData} onNext={handleNext} onCancel={handleBack} />}

      {step === 3 && <SupportingEvidenceStep onBack={handleBack} subjectProperty={propertyData} />}
    </div>
  )
}

export default function StartPage() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-5xl py-10">
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-muted h-12 w-12"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-semibold mt-4">Loading...</h1>
          </div>
        </div>
      }
    >
      <PropertyAnalysisContent />
    </Suspense>
  )
}
