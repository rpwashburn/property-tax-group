import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { formatCurrency, formatPercent } from "@/lib/utils"

// Define the shape of a comparable property expected by this component
interface ComparableProperty {
  adjusted_value: string // Expecting format like "$1,234,567"
}

interface IndicatedValueAnalysisCardProps {
  comparables: ComparableProperty[]
  subjectPropertyValue: number
}

// Helper function to parse currency string to number
const parseCurrency = (value: string): number => {
  return Number(value.replace(/[^0-9.-]+/g, ""))
}

// Helper function to calculate the median
const calculateMedian = (numbers: number[]): number => {
  if (numbers.length === 0) return 0
  const sorted = [...numbers].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  } else {
    return sorted[mid]
  }
}

export function IndicatedValueAnalysisCard({ comparables, subjectPropertyValue }: IndicatedValueAnalysisCardProps) {
  if (!comparables || comparables.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Indicated Value Analysis</CardTitle>
          <CardDescription>Not enough comparable data to perform analysis.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const adjustedValues = comparables.map((comp) => parseCurrency(comp.adjusted_value)).filter((v) => !isNaN(v))
  const medianCompValue = calculateMedian(adjustedValues)
  const difference = medianCompValue - subjectPropertyValue
  const percentageDifference = subjectPropertyValue !== 0 ? difference / subjectPropertyValue : 0

  const getDifferenceColor = () => {
    if (difference > 0) return "text-green-600"
    if (difference < 0) return "text-red-600"
    return "text-muted-foreground"
  }

  const getDifferenceIcon = () => {
    if (difference > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (difference < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Indicated Value Analysis</CardTitle>
        <CardDescription>
          Median adjusted value of the top {comparables.length} AI-selected comparables vs. your property.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
          <span className="text-sm text-muted-foreground">Median Adjusted Comp Value:</span>
          <span className="text-lg font-semibold">{formatCurrency(medianCompValue)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
          <span className="text-sm text-muted-foreground">Your Property Market Value:</span>
          <span className="text-lg font-semibold">{formatCurrency(subjectPropertyValue)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-slate-100 rounded-md border border-slate-200">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            {getDifferenceIcon()}
            Difference:
          </span>
          <span className={`text-lg font-semibold ${getDifferenceColor()}`}>
            {formatCurrency(difference)} ({formatPercent(percentageDifference, { signDisplay: "exceptZero" })})
          </span>
        </div>
        <p className="text-xs text-muted-foreground text-center pt-2">
          This indicates the potential market value based on adjusted comparables.
        </p>
      </CardContent>
    </Card>
  )
}

// Helper function (ensure this exists or is imported from your utils)
// Assuming you have a utils file with formatCurrency and formatPercent
/*
Example in lib/utils.ts:

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

export const formatPercent = (value: number, options?: Intl.NumberFormatOptions): string => {
  return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1, ...options }).format(value);
};
*/ 