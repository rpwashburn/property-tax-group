import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft, Home, Info, Building } from "lucide-react"
import { OpenAIAnalysis } from "@/app/(consumer)/report/[accountNumber]/OpenAIAnalysis"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getPropertyByAcct } from '@/lib/comparables/server'
import type { SubjectProperty } from '@/lib/property-analysis/types'
import { notFound } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

function LoadingSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <Skeleton className="h-6 w-1/3 mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-8 w-full" />
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper to safely parse market value
const parseMarketValue = (value: string | null | undefined): number => {
  if (!value) return 0
  return parseInt(value.replace(/[^0-9]/g, ''), 10) || 0
}

export default async function ReportAnalysisPage({
  params,
  searchParams
}: {
  params: Promise<{ accountNumber: string }>;
  searchParams?: Promise<{ overrideYrImpr?: string; overrideBldAr?: string; }>;
}) {
  const { accountNumber } = await params;
  // Access specific search params directly
  const resolvedSearchParams = await searchParams;
  const overrideYrImpr = resolvedSearchParams?.overrideYrImpr;
  const overrideBldAr = resolvedSearchParams?.overrideBldAr;

  let subjectProperty: SubjectProperty | null = null

  try {
    subjectProperty = await getPropertyByAcct(accountNumber)
  } catch (error) {
    console.error(`Error fetching property data for ${accountNumber}:`, error)
    // Optionally render an error state here instead of 404
    // return <div>Error loading property data.</div>;
  }

  if (!subjectProperty) {
    notFound() // Render 404 if property not found or error occurred
  }

  const backHref = `/start?accountNumber=${accountNumber}`;

  // Simple subject property display card (can be extracted to a component later)
  const SubjectPropertyCard = () => (
    <Card className="mb-6 border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building className="h-5 w-5 text-primary" />
          Subject Property Details
        </CardTitle>
        <CardDescription>Account: {subjectProperty?.acct}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">Address</div>
          <div className="font-medium">{subjectProperty?.siteAddr1 || 'N/A'}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Year Built</div>
          <div className="font-medium">
            {overrideYrImpr ? (
              <>
                <span className="text-orange-600">{overrideYrImpr}</span> <span className="text-xs text-orange-500">(Overridden)</span>
              </>
            ) : (
              subjectProperty?.yrImpr || 'N/A'
            )}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Building SF</div>
          <div className="font-medium">
            {overrideBldAr ? (
              <>
                <span className="text-orange-600">{parseInt(overrideBldAr, 10).toLocaleString()}</span> <span className="text-xs text-orange-500">(Overridden)</span>
              </>
            ) : (
              subjectProperty?.bldAr ? parseInt(subjectProperty.bldAr, 10).toLocaleString() : 'N/A'
            )}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Grade</div>
          <div className="font-medium">{subjectProperty?.grade || 'N/A'}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Condition</div>
          <div className="font-medium">{subjectProperty?.condition || 'N/A'}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Market Value</div>
          <div className="font-medium">{formatCurrency(parseMarketValue(subjectProperty?.totMktVal))}</div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container max-w-6xl py-8 px-4 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="hover:bg-slate-100 transition-colors">
          <Link href={backHref} className="flex items-center gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Property Details
          </Link>
        </Button>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                <Info className="h-4 w-4" />
                <span className="sr-only">About this report</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>This analysis ranks comparable properties based on adjusted values and other factors.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center gap-2 mb-2">
          <Home className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Comparable Properties Ranking</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          AI-powered analysis of the most relevant comparable properties for your property assessment.
        </p>
        <div className="mt-2 inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-100 text-sm text-slate-700">
          Subject Property: {accountNumber}
        </div>
      </div>

      <SubjectPropertyCard />

      <Suspense fallback={<LoadingSkeleton />}>
        <OpenAIAnalysis accountNumber={accountNumber} subjectProperty={subjectProperty} />
      </Suspense>
    </div>
  )
}
