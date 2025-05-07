"use client"

import { ArrowLeft, ArrowRight, Building, TrendingDown, TrendingUp, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { PropertyData } from "@/lib/property-analysis/types"
import { Badge } from "@/components/ui/badge"

interface PropertyValuesStepProps {
  propertyData: PropertyData
  onNext: () => void
  onBack: () => void
}

export function PropertyValuesStep({ propertyData, onNext, onBack }: PropertyValuesStepProps) {
  return (
    <Card className="mb-8 shadow-md border-slate-200 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
        <div className="flex items-center gap-2 text-primary mb-1">
          <Building className="h-5 w-5" />
          <Badge variant="outline" className="text-xs font-normal">
            Step 2 of 3
          </Badge>
        </div>
        <CardTitle className="text-2xl">Property Values</CardTitle>
        <CardDescription>Review the current and prior year property values</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-8">
          <ValueComparison propertyData={propertyData} />
          <CurrentYearValues propertyData={propertyData} />
          <PriorYearValues propertyData={propertyData} />
          
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-6 bg-slate-50 border-t">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={onNext} className="gap-2 px-6">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

function CurrentYearValues({ propertyData }: { propertyData: PropertyData }) {
  return (
    <div>
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Building className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Current Year Values</h3>
          <p className="text-sm text-muted-foreground">The most recent property valuation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <ValueCard label="Land Value" value={Number(propertyData.landVal)} formatAsCurrency={true} />
        <ValueCard label="Building Value" value={Number(propertyData.bldVal)} formatAsCurrency={true} />
        <ValueCard label="Extra Features Value" value={Number(propertyData.xFeaturesVal)} formatAsCurrency={true} />
        <ValueCard
          label="Total Appraised Value"
          value={Number(propertyData.totApprVal)}
          formatAsCurrency={true}
          highlight={true}
        />
      </div>
    </div>
  )
}

function PriorYearValues({ propertyData }: { propertyData: PropertyData }) {
  return (
    <div>
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-slate-200 p-2 rounded-lg">
          <Building className="h-6 w-6 text-slate-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Prior Year Values</h3>
          <p className="text-sm text-muted-foreground">Last year&apos;s property valuation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <ValueCard label="Prior Land Value" value={Number(propertyData.priorLandVal)} formatAsCurrency={true} />
        <ValueCard label="Prior Building Value" value={Number(propertyData.priorBldVal)} formatAsCurrency={true} />
        <ValueCard
          label="Prior Total Appraised Value"
          value={Number(propertyData.priorTotApprVal)}
          formatAsCurrency={true}
          highlight={true}
        />
      </div>
    </div>
  )
}

function ValueComparison({ propertyData }: { propertyData: PropertyData }) {
  const currentTotal = Number(propertyData.totApprVal)
  const priorTotal = Number(propertyData.priorTotApprVal)
  const difference = currentTotal - priorTotal
  const percentChange = priorTotal > 0 ? (difference / priorTotal) * 100 : 0

  const isIncrease = difference > 0
  const isDecrease = difference < 0
  const isNoChange = difference === 0

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50 border-b py-4">
        <CardTitle className="text-lg">Year-over-Year Comparison</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center text-center p-4 rounded-lg border border-slate-200 w-full">
            <p className="text-sm text-muted-foreground mb-1">Prior Year Total</p>
            <p className="text-2xl font-bold">${priorTotal.toLocaleString()}</p>
          </div>

          <div className="flex items-center justify-center">
            <div
              className={`rounded-full p-3 ${isIncrease ? "bg-red-100" : isDecrease ? "bg-green-100" : "bg-slate-100"}`}
            >
              {isIncrease && <TrendingUp className="h-6 w-6 text-red-600" />}
              {isDecrease && <TrendingDown className="h-6 w-6 text-green-600" />}
              {isNoChange && <Minus className="h-6 w-6 text-slate-600" />}
            </div>
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-lg border border-slate-200 w-full">
            <p className="text-sm text-muted-foreground mb-1">Current Year Total</p>
            <p className="text-2xl font-bold">${currentTotal.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-lg border border-slate-200 bg-slate-50 text-center">
          <p className="text-sm text-muted-foreground mb-1">Value Change</p>
          <div className="flex items-center justify-center gap-3">
            <p
              className={`text-xl font-bold ${
                isIncrease ? "text-red-600" : isDecrease ? "text-green-600" : "text-slate-600"
              }`}
            >
              {isIncrease && "+"}${Math.abs(difference).toLocaleString()}
            </p>
            <p
              className={`text-lg font-semibold ${
                isIncrease ? "text-red-600" : isDecrease ? "text-green-600" : "text-slate-600"
              }`}
            >
              ({isIncrease ? "+" : isDecrease ? "-" : ""}
              {Math.abs(percentChange).toFixed(1)}%)
            </p>
          </div>

          <p className="mt-2 text-sm">
            {isIncrease
              ? "Your property value has increased since last year, which may result in higher taxes."
              : isDecrease
                ? "Your property value has decreased since last year, which may result in lower taxes."
                : "Your property value has not changed since last year."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

interface ValueCardProps {
  label: string
  value: number
  formatAsCurrency?: boolean
  highlight?: boolean
}

function ValueCard({ label, value, formatAsCurrency = false, highlight = false }: ValueCardProps) {
  const formattedValue = formatAsCurrency ? `$${value.toLocaleString()}` : value.toLocaleString()

  return (
    <div
      className={`p-4 rounded-lg border ${
        highlight ? "border-primary/20 bg-primary/5" : "border-slate-200 bg-slate-50"
      }`}
    >
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className={`text-xl font-bold ${highlight ? "text-primary" : ""}`}>{formattedValue}</p>
    </div>
  )
}

