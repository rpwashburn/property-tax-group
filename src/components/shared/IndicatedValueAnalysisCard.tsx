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

  const getDifferenceAttributes = () => {
    if (difference < 0) { // Median Comp is LOWER than Subject's value (GOOD for protest)
      return {
        color: "text-green-600",
        icon: <TrendingDown className="h-4 w-4 text-green-600" />, // Shows subject value is trending down compared to comps
        text: "This suggests your property may be valued higher than similar properties, supporting your protest.",
      };
    }
    if (difference > 0) { // Median Comp is HIGHER than Subject's value (BAD for protest)
      return {
        color: "text-red-600",
        icon: <TrendingUp className="h-4 w-4 text-red-600" />, // Shows subject value is trending up compared to comps
        text: "This suggests your property's assessed value is lower than similar properties, which may not support a protest based on this metric.",
      };
    }
    return {
      color: "text-muted-foreground",
      icon: <Minus className="h-4 w-4 text-muted-foreground" />,
      text: "The median adjusted comparable value is similar to your property's market value.",
    };
  };

  const diffAttrs = getDifferenceAttributes();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Indicated Value Analysis</CardTitle>
        <CardDescription>
          Median adjusted value of the top {comparables.length > 0 ? comparables.length : 'selected'} AI-selected comparables vs. your property.
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
        <div className="flex flex-col p-3 bg-slate-100 rounded-md border border-slate-200 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              {diffAttrs.icon}
              Potential Difference:
            </span>
            <span className={`text-lg font-semibold ${diffAttrs.color}`}>
              {formatCurrency(difference)} ({formatPercent(percentageDifference, { signDisplay: "exceptZero" })})
            </span>
          </div>
          <p className={`text-xs ${diffAttrs.color === "text-muted-foreground" ? "text-muted-foreground" : diffAttrs.color} text-center`}>
            {diffAttrs.text}
          </p>
        </div>
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