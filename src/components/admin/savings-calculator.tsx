"use client"

import { useState } from "react"
import { Calculator, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaxRateSlider } from "@/components/ui/tax-rate-slider"
import { formatCurrency, taxUtils } from "@/lib/utils"

interface SavingsCalculatorProps {
  currentAppraisedValue: number | string | null | undefined
  proposedMedianValue: number | string | null | undefined
  className?: string
}

export function SavingsCalculator({
  currentAppraisedValue,
  proposedMedianValue,
  className = ""
}: SavingsCalculatorProps) {
  const [taxRate, setTaxRate] = useState(taxUtils.DEFAULT_HOUSTON_TAX_RATE)

  const savings = taxUtils.calculateSavings(currentAppraisedValue, proposedMedianValue, taxRate)
  const isSavings = savings > 0
  const isLoss = savings < 0

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Tax Savings Calculator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Calculate potential annual property tax savings based on proposed median value
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tax Rate Slider */}
        <TaxRateSlider 
          value={taxRate} 
          onChange={setTaxRate}
        />

        {/* Calculation Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Current Appraised Value:</span>
            <span className="font-medium">{formatCurrency(currentAppraisedValue)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Proposed Median Value:</span>
            <span className="font-medium">{formatCurrency(proposedMedianValue)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Tax Rate:</span>
            <span className="font-medium">{taxUtils.formatTaxRate(taxRate)}</span>
          </div>
          <hr className="border-border" />
          <div className="flex justify-between items-center">
            <span className="font-medium">Annual Tax Impact:</span>
            <div className="flex items-center gap-2">
              {isSavings && <TrendingDown className="h-4 w-4 text-green-600" />}
              {isLoss && <TrendingUp className="h-4 w-4 text-red-600" />}
              <span className={`text-lg font-bold ${
                isSavings ? 'text-green-600' : isLoss ? 'text-red-600' : 'text-muted-foreground'
              }`}>
                {isSavings && '+'}
                {formatCurrency(Math.abs(savings))}
                {isSavings && ' Savings'}
                {isLoss && ' Increase'}
              </span>
            </div>
          </div>
        </div>

        {/* Savings Summary */}
        {savings !== 0 && (
          <div className={`p-3 rounded-lg ${
            isSavings ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm font-medium ${
              isSavings ? 'text-green-900' : 'text-red-900'
            }`}>
              {isSavings 
                ? `Potential annual savings of ${formatCurrency(savings)} if the median value is accepted.`
                : `Property taxes would increase by ${formatCurrency(Math.abs(savings))} annually with the median value.`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}