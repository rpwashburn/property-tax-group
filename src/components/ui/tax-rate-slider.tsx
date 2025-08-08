"use client"

// import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { taxUtils } from "@/lib/utils"

interface TaxRateSliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

export function TaxRateSlider({
  value,
  onChange,
  min = 0.005, // 0.5%
  max = 0.035, // 3.5%
  step = 0.0001, // 0.01%
  className = ""
}: TaxRateSliderProps) {
  const handleValueChange = (newValue: number[]) => {
    onChange(newValue[0])
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Label htmlFor="tax-rate-slider" className="text-sm font-medium">
          Tax Rate
        </Label>
        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
          {taxUtils.formatTaxRate(value)}
        </span>
      </div>
      <Slider
        id="tax-rate-slider"
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={handleValueChange}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{taxUtils.formatTaxRate(min)}</span>
        <span className="text-center">Default: {taxUtils.formatTaxRate(taxUtils.DEFAULT_HOUSTON_TAX_RATE)}</span>
        <span>{taxUtils.formatTaxRate(max)}</span>
      </div>
    </div>
  )
}