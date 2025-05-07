"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, Info, Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Adjustment = {
  name: string;
  amount: number;
  description: string;
}

type CompId = 'comp1' | 'comp2' | 'comp3';

type Adjustments = {
  [K in CompId]: Adjustment[];
}

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<Adjustments>({
    comp1: [
      { name: "Land Size", amount: -5000, description: "1000 sqft larger lot than subject" },
      { name: "Condition", amount: 0, description: "Similar condition to subject" },
    ],
    comp2: [
      { name: "Quality", amount: -8000, description: "Better quality than subject" },
      { name: "Square Footage", amount: -12000, description: "60 sqft larger than subject" },
    ],
    comp3: [
      { name: "Bathrooms", amount: +7500, description: "0.5 fewer bathrooms than subject" },
      { name: "Year Built", amount: +3000, description: "1 year older than subject" },
    ],
  })

  const [originalValues] = useState<Record<CompId, number>>({
    comp1: 485000,
    comp2: 510000,
    comp3: 475000,
  })

  const [newAdjustment, setNewAdjustment] = useState<Adjustment>({
    name: "",
    amount: 0,
    description: "",
  })

  const [selectedComp, setSelectedComp] = useState<CompId>("comp1")

  const addAdjustment = () => {
    if (newAdjustment.name && newAdjustment.description) {
      setAdjustments({
        ...adjustments,
        [selectedComp]: [...adjustments[selectedComp], { ...newAdjustment }],
      })
      setNewAdjustment({
        name: "",
        amount: 0,
        description: "",
      })
    }
  }

  const removeAdjustment = (compId: CompId, index: number) => {
    const newAdjustments = { ...adjustments }
    newAdjustments[compId] = newAdjustments[compId].filter((_, i) => i !== index)
    setAdjustments(newAdjustments)
  }

  const calculateAdjustedValue = (compId: CompId) => {
    const originalValue = originalValues[compId]
    const totalAdjustment = adjustments[compId].reduce((sum, adj) => sum + adj.amount, 0)
    return originalValue + totalAdjustment
  }

  const calculateTotalAdjustments = (compId: CompId): number => {
    return adjustments[compId].reduce((sum, adj) => sum + adj.amount, 0)
  }

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).replace('$-', '-$')
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value)
    setNewAdjustment({ ...newAdjustment, amount: value })
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAdjustment({ ...newAdjustment, name: e.target.value })
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAdjustment({ ...newAdjustment, description: e.target.value })
  }

  return (
    <div className="container max-w-5xl py-10">
      <div className="mb-8">
        <Link
          href="/comparables"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Comparables
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Comparable Property Adjustments</h1>
        <p className="text-muted-foreground mt-2">
          Make adjustments to comparable properties to account for differences from your property.
        </p>
      </div>

      <div className="flex items-center mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
          <Check className="h-5 w-5" />
        </div>
        <Separator className="flex-1 mx-4" />
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
          <Check className="h-5 w-5" />
        </div>
        <Separator className="flex-1 mx-4" />
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
          3
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-sm text-amber-800 mb-6">
        <p className="font-medium flex items-center gap-1 mb-1">
          <Info className="h-4 w-4" /> Why Adjustments Matter
        </p>
        <p className="mb-2">
          Adjustments account for differences between comparable properties and your property. This creates a more
          accurate and fair comparison by answering the question: &quot;What would this comparable property be worth if it
          had the same features as my property?&quot;
        </p>
        <p>
          <strong>Example:</strong> If a comparable property has a larger lot size than yours, its value should be
          adjusted downward to reflect what it would be worth with your lot size.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Adjustment Calculator</CardTitle>
          <CardDescription>Add or modify adjustments for each comparable property</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-4">
              <Label>Select Comparable Property</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedComp === "comp1" ? "default" : "outline"}
                  onClick={() => setSelectedComp("comp1")}
                >
                  123 Nearby St
                </Button>
                <Button
                  variant={selectedComp === "comp2" ? "default" : "outline"}
                  onClick={() => setSelectedComp("comp2")}
                >
                  456 Similar Ave
                </Button>
                <Button
                  variant={selectedComp === "comp3" ? "default" : "outline"}
                  onClick={() => setSelectedComp("comp3")}
                >
                  789 Comparable Ln
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-3">Current Adjustments</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Adjustment Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustments[selectedComp].map((adjustment, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{adjustment.name}</TableCell>
                      <TableCell>{adjustment.description}</TableCell>
                      <TableCell className="text-right">
                        <span className={adjustment.amount < 0 ? "text-red-600" : "text-green-600"}>
                          {adjustment.amount > 0 ? "+" : ""}${adjustment.amount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeAdjustment(selectedComp, index)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {adjustments[selectedComp].length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No adjustments added yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-3">Add New Adjustment</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adjustment-type">Adjustment Type</Label>
                    <Input
                      id="adjustment-type"
                      placeholder="e.g., Square Footage, Lot Size"
                      value={newAdjustment.name}
                      onChange={handleNameChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adjustment-amount">Amount ($)</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="relative">
                            <Input
                              id="adjustment-amount"
                              type="number"
                              placeholder="e.g., -5000 or 3000"
                              value={newAdjustment.amount}
                              onChange={handleAmountChange}
                            />
                            <Info className="h-4 w-4 absolute right-3 top-3 text-muted-foreground" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Use negative values for features that make the comparable property better than yours. Use
                            positive values for features that make your property better than the comparable.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adjustment-description">Description</Label>
                  <Input
                    id="adjustment-description"
                    placeholder="e.g., 200 sqft smaller than subject property"
                    value={newAdjustment.description}
                    onChange={handleDescriptionChange}
                  />
                </div>
                <Button onClick={addAdjustment} className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Add Adjustment
                </Button>
              </div>
            </div>

            <Separator />

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-3">Adjustment Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Original Value</p>
                  <p className="font-bold text-xl">{formatCurrency(originalValues[selectedComp])}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Adjustments</p>
                  <p className="font-bold text-xl">
                    <span className={calculateTotalAdjustments(selectedComp) < 0 ? "text-red-600" : "text-green-600"}>
                      {formatCurrency(calculateTotalAdjustments(selectedComp))}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adjusted Value</p>
                  <p className="font-bold text-xl">{formatCurrency(calculateAdjustedValue(selectedComp))}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/comparables">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Comparables
            </Link>
          </Button>
          <Link href="/report">
            <Button>
              Continue to Report <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Adjustment Guidelines</CardTitle>
          <CardDescription>HCAD-approved standards for making property adjustments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Square Footage</h3>
              <p className="text-sm mb-2">
                Typically adjusted at $40-60 per square foot in Harris County, depending on neighborhood quality.
              </p>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>Entry-level neighborhoods: $40-45/sqft</li>
                <li>Mid-range neighborhoods: $45-55/sqft</li>
                <li>Luxury neighborhoods: $55-80+/sqft</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Lot Size</h3>
              <p className="text-sm mb-2">
                Typically adjusted at $3-10 per square foot in Harris County, depending on location.
              </p>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>Urban areas: $8-10/sqft</li>
                <li>Suburban areas: $5-8/sqft</li>
                <li>Rural areas: $3-5/sqft</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Quality & Condition</h3>
              <p className="text-sm mb-2">
                Each step in quality or condition typically represents 5-10% of property value.
              </p>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>One step better in quality: -5% to -10% adjustment</li>
                <li>One step worse in quality: +5% to +10% adjustment</li>
                <li>One step better in condition: -3% to -7% adjustment</li>
                <li>One step worse in condition: +3% to +7% adjustment</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Other Common Adjustments</h3>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>Bathroom (full): $5,000-10,000</li>
                <li>Bathroom (half): $2,500-5,000</li>
                <li>Bedroom: $5,000-15,000</li>
                <li>Garage (per car space): $5,000-10,000</li>
                <li>Pool: $15,000-30,000</li>
                <li>Year built (per year): $500-1,000</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

