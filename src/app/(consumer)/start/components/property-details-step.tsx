"use client"

import type React from "react"

import { ArrowRight, MapPin, Info, Home, Building2, Ruler, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { PropertyData } from "@/lib/property-analysis/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

interface PropertyDetailsStepProps {
  propertyData: PropertyData
  onNext: () => void
  onCancel: () => void
}

export function PropertyDetailsStep({ propertyData, onNext, onCancel }: PropertyDetailsStepProps) {
  return (
    <Card className="mb-8 shadow-md border-slate-200 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
        <div className="flex items-center gap-2 text-primary mb-1">
          <MapPin className="h-5 w-5" />
          <Badge variant="outline" className="text-xs font-normal">
            Step 1 of 3
          </Badge>
        </div>
        <CardTitle className="text-2xl">Property Details</CardTitle>
        <CardDescription>Review the property information from the appraisal district</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-8">
          <PropertyInformation propertyData={propertyData} />
          <PropertyCharacteristics propertyData={propertyData} />
          <BuildingElements propertyData={propertyData} />
          <RoomDetails propertyData={propertyData} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-6 bg-slate-50 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onNext} className="gap-2 px-6">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
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

function BuildingElements({ propertyData }: { propertyData: PropertyData }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Building Elements</CardTitle>
            <CardDescription>Detailed building characteristics from HCAD records</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {propertyData.structuralElements && propertyData.structuralElements.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="building-elements" className="border-slate-200">
              <AccordionTrigger className="py-4 text-primary font-medium hover:text-primary/80">
                View Building Elements
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {propertyData.structuralElements.map((element, index) => (
                      <div key={index} className="space-y-2 p-4 rounded-lg border border-slate-200 bg-slate-50">
                        <Label className="text-primary font-medium">{element.typeDscr}</Label>
                        <div className="flex items-center justify-between">
                          <p className="text-sm">{element.categoryDscr}</p>
                          {element.adj && element.adj !== "0.000000" && (
                            <div className="flex items-center gap-1">
                              <span
                                className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                                  Number.parseFloat(element.adj) > 1
                                    ? "bg-green-100 text-green-700"
                                    : Number.parseFloat(element.adj) < 1
                                      ? "bg-red-100 text-red-700"
                                      : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {Number.parseFloat(element.adj) > 1 ? "+" : ""}
                                {Number.parseFloat(element.adj) > 10
                                  ? `${Number.parseFloat(element.adj).toFixed(0)}x`
                                  : `${((Number.parseFloat(element.adj) - 1) * 100).toFixed(0)}%`}
                              </span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent className="p-3 max-w-xs">
                                    <p className="font-medium mb-1">Adjustment Factor</p>
                                    <p className="text-sm">This adjustment affects the property&apos;s value</p>
                                    {Number.parseFloat(element.adj) > 1 && (
                                      <p className="text-sm text-green-600 mt-1">
                                        Higher than standard ({Number.parseFloat(element.adj).toFixed(1)}x)
                                      </p>
                                    )}
                                    {Number.parseFloat(element.adj) < 1 && (
                                      <p className="text-sm text-red-600 mt-1">
                                        Lower than standard ({Number.parseFloat(element.adj).toFixed(1)}x)
                                      </p>
                                    )}
                                    {Number.parseFloat(element.adj) === 1 && (
                                      <p className="text-sm text-slate-600 mt-1">At standard value</p>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="font-medium mb-2">Understanding Adjustments</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Values above 1.0 increase the value (shown as +% or x)</li>
                      <li>Values below 1.0 decrease the value (shown as -%)</li>
                      <li>No adjustment shown means standard value (1.0)</li>
                      <li>Large multipliers (10x+) are shown as multiples instead of percentages</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
            <p className="text-sm text-muted-foreground">No building elements found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RoomDetails({ propertyData }: { propertyData: PropertyData }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Home className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Room Details</CardTitle>
            <CardDescription>Interior room information</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <RoomDetailCard
            label="Total Rooms"
            value={String(propertyData.fixtures?.find((f) => f.type.trim() === "RMT")?.units || "0")}
            icon={<Home className="h-5 w-5" />}
          />
          <RoomDetailCard
            label="Bedrooms"
            value={String(propertyData.fixtures?.find((f) => f.type.trim() === "RMB")?.units || "0")}
            icon={<Home className="h-5 w-5" />}
          />
          <RoomDetailCard
            label="Full Bathrooms"
            value={String(propertyData.fixtures?.find((f) => f.type.trim() === "RMF")?.units || "0")}
            icon={<Home className="h-5 w-5" />}
          />
          <RoomDetailCard
            label="Fireplaces"
            value={String(propertyData.fixtures?.find((f) => f.type.trim() === "FPW")?.units || "0")}
            icon={<Home className="h-5 w-5" />}
          />
        </div>
      </CardContent>
    </Card>
  )
}

interface RoomDetailCardProps {
  label: string
  value: string
  icon: React.ReactNode
}

function RoomDetailCard({ label, value, icon }: RoomDetailCardProps) {
  return (
    <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center">
      <div className="bg-primary/10 p-2 rounded-full mb-2">{icon}</div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  )
}

