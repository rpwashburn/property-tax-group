"use client"

import {
  ArrowLeft,
  ArrowRight,
  Building,
  TrendingDown,
  TrendingUp,
  Minus,
  Info,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Home,
  Building2,
  Ruler,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { PropertyData } from "@/lib/property-analysis/types"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface PropertyValuesStepProps {
  propertyData: PropertyData
  onNext: () => void
  onBack: () => void
}

export function PropertyValuesStep({ propertyData, onNext, onBack }: PropertyValuesStepProps) {
  const currentTotal = Number(propertyData.totApprVal)
  const priorTotal = Number(propertyData.priorTotApprVal)
  const difference = currentTotal - priorTotal
  const percentChange = priorTotal > 0 ? (difference / priorTotal) * 100 : 0
  const isIncrease = difference > 0

  return (
    <div className="">
      <Card className="mb-8 shadow-md border-slate-200 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Building className="h-5 w-5" />
            <Badge variant="outline" className="text-xs font-normal">
              Step 1 of 2
            </Badge>
          </div>
          <CardTitle className="text-2xl">Review Your Property Details</CardTitle>
          <CardDescription>
            Confirm the details of your property. In the next step, you can correct any inaccuracies.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-8">
            {/* Appeal potential indicator */}
            {isIncrease && percentChange > 5 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800">Potential Appeal Opportunity</h3>
                  <p className="text-sm text-amber-700">
                    Your property value increased by {percentChange.toFixed(1)}%, which is{" "}
                    {percentChange > 10 ? "significantly" : ""} higher than typical. This could be a good reason to
                    protest your assessment.
                  </p>
                </div>
              </div>
            )}

            <ValueComparison propertyData={propertyData} />

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                What This Means For Your Protest
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Understanding these values is crucial for your protest strategy</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>The appraised value is what the county believes your property is worth</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Your property taxes are calculated based on this appraised value</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>If you can prove the appraised value is too high, you may reduce your tax burden</span>
                </li>
                {isIncrease && (
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Your {percentChange.toFixed(1)}% increase may be challenged if it exceeds market trends or
                      contains errors
                    </span>
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
              <h3 className="font-semibold text-xl mb-3 text-primary flex items-center justify-center gap-2">
                Next: Correct Characteristics
              </h3>
              <p className="text-slate-700 text-sm mb-4 max-w-lg mx-auto">
                After reviewing your property's current values and characteristics, proceed to the next step if you need to make corrections to details like year built or square footage. You can upload supporting documents for any changes.
              </p>
              <Button onClick={onNext} className="gap-2 px-8 py-3 text-base">
                Proceed to Corrections <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>

            <div>
              <h3 className="font-semibold text-xl mb-4">Detailed Breakdown:</h3>

              {/* Property Value Comparison - now directly visible */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <CurrentYearValues propertyData={propertyData} />
                <PriorYearValues propertyData={propertyData} />
              </div>

              {/* Accordion for Property Characteristics & Details */}
              <Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem value="property-characteristics-full">
                  <AccordionTrigger className="p-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-lg font-medium">
                    View Property Characteristics & Details
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-6">
                    <PropertyInformation propertyData={propertyData} />
                    <PropertyCharacteristics propertyData={propertyData} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between p-6 bg-slate-50 border-t">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={onNext} className="gap-2 px-6">
            Correct Characteristics <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function CurrentYearValues({ propertyData }: { propertyData: PropertyData }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Building className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Current Year Values</h3>
          <p className="text-sm text-muted-foreground">
            These are the values assigned to your property for the current tax year.
          </p>
        </div>
      </div>

      <div className="space-y-3 mt-4">
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
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-slate-200 p-2 rounded-lg">
          <Building className="h-6 w-6 text-slate-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Prior Year Values</h3>
          <p className="text-sm text-muted-foreground">These were your property's values for the previous tax year.</p>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        <ValueCard label="Prior Land Value" value={Number(propertyData.priorLandVal)} formatAsCurrency={true} />
        <ValueCard label="Prior Building Value" value={Number(propertyData.priorBldVal)} formatAsCurrency={true} />
        <ValueCard
          label="Prior Extra Features Value"
          value={Number(propertyData.priorXFeaturesVal)}
          formatAsCurrency={true}
        />
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
    <Card
      className={`border-slate-200 shadow-sm overflow-hidden ${isIncrease ? "border-red-300 bg-red-50/50" : isDecrease ? "border-green-300 bg-green-50/50" : ""}`}
    >
      <CardHeader className="bg-white border-b py-4">
        <CardTitle className="text-lg">Year-over-Year Change</CardTitle>
        <CardDescription>This is how your property's appraised value has changed since last year.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
          <div className="flex flex-col items-center text-center p-4 rounded-lg border border-slate-200 w-full bg-white">
            <p className="text-sm text-muted-foreground mb-1">Last Year</p>
            <p className="text-2xl font-bold">${priorTotal.toLocaleString()}</p>
          </div>

          <div className="flex items-center justify-center flex-shrink-0">
            <div
              className={`rounded-full p-3 ${isIncrease ? "bg-red-100 text-red-600" : isDecrease ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-600"}`}
            >
              {isIncrease && <TrendingUp className="h-8 w-8" />}
              {isDecrease && <TrendingDown className="h-8 w-8" />}
              {isNoChange && <Minus className="h-8 w-8" />}
            </div>
          </div>

          <div className="flex flex-col items-center text-center p-4 rounded-lg border border-slate-200 w-full bg-white">
            <p className="text-sm text-muted-foreground mb-1">This Year</p>
            <p className="text-2xl font-bold">${currentTotal.toLocaleString()}</p>
          </div>
        </div>

        <div
          className={`p-4 rounded-lg border text-center ${isIncrease ? "border-red-300 bg-red-100/70" : isDecrease ? "border-green-300 bg-green-100/70" : "border-slate-200 bg-slate-50"}`}
        >
          <p className="text-sm text-muted-foreground mb-1">Your Appraised Value Has:</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <p
              className={`text-2xl font-bold ${
                isIncrease ? "text-red-700" : isDecrease ? "text-green-700" : "text-slate-700"
              }`}
            >
              {isIncrease ? "Increased" : isDecrease ? "Decreased" : "Not Changed"} by $
              {Math.abs(difference).toLocaleString()}
            </p>
            {!isNoChange && (
              <p
                className={`text-lg font-semibold ${
                  isIncrease ? "text-red-700" : isDecrease ? "text-green-700" : "text-slate-700"
                }`}
              >
                ({isIncrease ? "+" : ""}
                {percentChange.toFixed(1)}%)
              </p>
            )}
          </div>

          <p className="mt-4 text-sm max-w-md mx-auto">
            {isIncrease
              ? "An increase in appraised value typically means higher property taxes. This is often a strong basis for filing a protest."
              : isDecrease
                ? "A decrease in appraised value may result in lower taxes. You may still want to review for accuracy."
                : "Your appraised value remained the same. Review the details to ensure all information is accurate."}
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
      className={`p-3 rounded-lg border ${
        highlight ? "border-primary/20 bg-primary/5" : "border-slate-100 bg-white"
      } hover:border-slate-300 transition-colors`}
    >
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-lg font-bold ${highlight ? "text-primary" : ""}`}>{formattedValue}</p>
      </div>
    </div>
  )
}

function PropertyInformation({ propertyData }: { propertyData: PropertyData }) {
  return (
    <div className="p-6 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Home className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Property Information</h3>
          <p className="text-sm text-muted-foreground">Basic details about your property</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Address</p>
            <p className="font-medium text-lg">{propertyData.siteAddr1}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Account Number</p>
            <p className="font-medium">{propertyData.acct}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Neighborhood</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                {propertyData.neighborhoodCode}
              </Badge>
              <p className="font-medium">{propertyData.neighborhoodDescription}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Market Area</p>
            <p className="font-medium">{propertyData.marketArea1Dscr}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PropertyCharacteristics({ propertyData }: { propertyData: PropertyData }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Property Characteristics</CardTitle>
            <CardDescription>Physical attributes of your property</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Building Area (sq ft)</Label>
              <div className="relative">
                <Input
                  value={propertyData.bldAr ? Number(propertyData.bldAr as string).toLocaleString() : "0"}
                  readOnly
                  className="pl-10 font-medium text-lg h-12"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Ruler className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Land Area (sq ft)</Label>
              <div className="relative">
                <Input
                  value={propertyData.landAr ? Number(propertyData.landAr as string).toLocaleString() : "0"}
                  readOnly
                  className="pl-10 font-medium text-lg h-12"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Layers className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Building Class</Label>
              <Input value={propertyData.econBldClass ?? ""} readOnly className="font-medium h-12" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Economic Area</Label>
              <Input value={propertyData.econArea ?? ""} readOnly className="font-medium h-12" />
            </div>
          </div>
        </div>

        {propertyData.structuralElements && propertyData.structuralElements.length > 0 && (
          <>
            <Separator className="my-6" />
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="structural-elements" className="border-slate-200">
                <AccordionTrigger className="py-4 text-primary font-medium hover:text-primary/80">
                  View Structural Elements
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Structural Elements</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {propertyData.structuralElements.map((element, index) => (
                        <Card key={index} className="overflow-hidden border-slate-200">
                          <CardHeader className="bg-slate-50 py-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Badge variant="outline" className="font-mono">
                                Building {element.bldNum}
                              </Badge>
                              {element.categoryDscr}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-muted-foreground text-xs">Type</Label>
                                <p className="text-sm font-medium">{element.typeDscr}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground text-xs">Code</Label>
                                <p className="text-sm font-medium">{element.code}</p>
                              </div>
                              {element.adj && (
                                <div>
                                  <Label className="text-muted-foreground text-xs">Adjustment</Label>
                                  <p className="text-sm font-medium">{element.adj}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </CardContent>
    </Card>
  )
}
