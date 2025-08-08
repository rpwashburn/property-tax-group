"use client"

import type React from "react"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, FileText, HelpCircle, Info, Plus, Trash2, Upload, ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface Deduction {
  id: string
  type: string
  description: string
  amount: string
  files: File[]
}

function FullReportDemoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get account number and jurisdiction from URL params if available
  const accountNumber = searchParams.get('account') || ''
  const jurisdiction = searchParams.get('jurisdiction') || 'HCAD'

  const [propertyDetails, setPropertyDetails] = useState({
    squareFootage: "",
    yearBuilt: "",
    bedrooms: "",
    bathrooms: "",
    lotSize: "",
  })

  const [deductions, setDeductions] = useState<Deduction[]>([
    { id: "1", type: "", description: "", amount: "", files: [] },
  ])

  const [propertyFiles, setPropertyFiles] = useState<File[]>([])

  const handlePropertyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPropertyDetails({
      ...propertyDetails,
      [e.target.name]: e.target.value,
    })
  }

  const handleDeductionChange = (id: string, field: string, value: string) => {
    setDeductions(deductions.map((deduction) => (deduction.id === id ? { ...deduction, [field]: value } : deduction)))
  }

  const handlePropertyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPropertyFiles([...propertyFiles, ...Array.from(e.target.files)])
    }
  }

  const handleDeductionFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDeductions(
        deductions.map((deduction) =>
          deduction.id === id
            ? { ...deduction, files: [...deduction.files, ...Array.from(e.target.files || [])] }
            : deduction,
        ),
      )
    }
  }

  const addDeduction = () => {
    setDeductions([...deductions, { id: `${Date.now()}`, type: "", description: "", amount: "", files: [] }])
  }

  const removeDeduction = (id: string) => {
    setDeductions(deductions.filter((deduction) => deduction.id !== id))
  }

  const removePropertyFile = (index: number) => {
    setPropertyFiles(propertyFiles.filter((_, i) => i !== index))
  }

  const removeDeductionFile = (deductionId: string, fileIndex: number) => {
    setDeductions(
      deductions.map((deduction) =>
        deduction.id === deductionId
          ? {
              ...deduction,
              files: deduction.files.filter((_, i) => i !== fileIndex),
            }
          : deduction,
      ),
    )
  }

  const calculateProgress = () => {
    let total = 0
    let completed = 0

    // Property details (5 fields)
    total += 5
    completed += Object.values(propertyDetails).filter((val) => val !== "").length

    // Property files
    total += 1
    completed += propertyFiles.length > 0 ? 1 : 0

    // Deductions (3 fields per deduction + files)
    deductions.forEach((deduction) => {
      total += 4
      if (deduction.type) completed += 1
      if (deduction.description) completed += 1
      if (deduction.amount) completed += 1
      if (deduction.files.length > 0) completed += 1
    })

    return (completed / total) * 100
  }

  const handleContinue = () => {
    // Store form data in sessionStorage for demo purposes
    const formData = {
      propertyDetails,
      deductions,
      propertyFiles: propertyFiles.map(f => ({ name: f.name, size: f.size })), // Can't store actual files
      progress: calculateProgress()
    }
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('fullReportDemoData', JSON.stringify(formData))
    }

    // Route to purchase page with pre-filled data and full_report selected
    const params = new URLSearchParams()
    if (accountNumber) params.set('account', accountNumber)
    if (jurisdiction) params.set('jurisdiction', jurisdiction)
    params.set('product', 'full_report') // Pre-select full report
    params.set('demo', 'true') // Flag this as coming from demo
    
    router.push(`/purchase?${params.toString()}`)
  }

  const handleSaveDraft = () => {
    // For demo purposes, just show a success message
    alert('Draft saved! You can continue your protest report later.')
  }

  return (
    <div className="py-6 px-4 sm:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/search"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </Link>
          
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Complete Your Property Tax Protest
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Provide detailed information about your property to build a comprehensive protest report. 
              The more accurate information you provide, the stronger your case will be.
            </p>
            
            {accountNumber && (
              <div className="flex items-center gap-2 text-sm">
                <div className="px-3 py-1 rounded-full bg-slate-200 text-slate-700">
                  Account: {accountNumber}
                </div>
                <div className="px-3 py-1 rounded-full bg-slate-200 text-slate-700">
                  {jurisdiction}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress and Form */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Form Progress</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                      <HelpCircle className="h-4 w-4" />
                      <span className="sr-only">Help</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Complete all fields to improve your protest chances</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-sm font-medium">{Math.round(calculateProgress())}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Property Details
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-2 h-5 w-5">
                        <Info className="h-4 w-4" />
                        <span className="sr-only">Info</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Update your property details if they differ from the tax assessment</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription>Correct any inaccuracies in your property's assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="squareFootage">Square Footage</Label>
                  <Input
                    id="squareFootage"
                    name="squareFootage"
                    placeholder="e.g. 2,000"
                    value={propertyDetails.squareFootage}
                    onChange={handlePropertyChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearBuilt">Year Built</Label>
                  <Input
                    id="yearBuilt"
                    name="yearBuilt"
                    placeholder="e.g. 1985"
                    value={propertyDetails.yearBuilt}
                    onChange={handlePropertyChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    placeholder="e.g. 3"
                    value={propertyDetails.bedrooms}
                    onChange={handlePropertyChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    placeholder="e.g. 2.5"
                    value={propertyDetails.bathrooms}
                    onChange={handlePropertyChange}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="lotSize">Lot Size (sq ft)</Label>
                  <Input
                    id="lotSize"
                    name="lotSize"
                    placeholder="e.g. 7,500"
                    value={propertyDetails.lotSize}
                    onChange={handlePropertyChange}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Supporting Documentation</Label>
                  <span className="text-sm text-muted-foreground">Upload floor plans, surveys, or appraisals</span>
                </div>

                <div className="grid gap-4">
                  <div className="border border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <Input
                      type="file"
                      id="property-files"
                      className="hidden"
                      multiple
                      onChange={handlePropertyFileChange}
                    />
                    <Label htmlFor="property-files" className="cursor-pointer flex flex-col items-center">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium">Click to upload files</span>
                      <span className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB each</span>
                    </Label>
                  </div>

                  {propertyFiles.length > 0 && (
                    <div className="space-y-2">
                      {propertyFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removePropertyFile(index)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove file</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Deductions & Issues
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-2 h-5 w-5">
                        <Info className="h-4 w-4" />
                        <span className="sr-only">Info</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add property issues that may reduce its value</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription>Add property defects, needed repairs, or other value-reducing factors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Include repair quotes and estimates to strengthen your case</AlertDescription>
              </Alert>

              {deductions.map((deduction, index) => (
                <div key={deduction.id} className="space-y-4">
                  {index > 0 && <Separator />}
                  <div className="pt-4 flex items-center justify-between">
                    <h3 className="text-sm font-medium">Deduction {index + 1}</h3>
                    {deductions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDeduction(deduction.id)}
                        className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor={`deduction-type-${deduction.id}`}>Issue Type</Label>
                      <Select
                        value={deduction.type}
                        onValueChange={(value) => handleDeductionChange(deduction.id, "type", value)}
                      >
                        <SelectTrigger id={`deduction-type-${deduction.id}`}>
                          <SelectValue placeholder="Select issue type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="foundation">Foundation Issues</SelectItem>
                          <SelectItem value="roof">Roof Damage</SelectItem>
                          <SelectItem value="plumbing">Plumbing Problems</SelectItem>
                          <SelectItem value="electrical">Electrical Issues</SelectItem>
                          <SelectItem value="structural">Structural Damage</SelectItem>
                          <SelectItem value="flooding">Flooding/Water Damage</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`deduction-amount-${deduction.id}`}>Estimated Repair Cost ($)</Label>
                      <Input
                        id={`deduction-amount-${deduction.id}`}
                        placeholder="e.g. 5,000"
                        value={deduction.amount}
                        onChange={(e) => handleDeductionChange(deduction.id, "amount", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={`deduction-description-${deduction.id}`}>Description</Label>
                      <Textarea
                        id={`deduction-description-${deduction.id}`}
                        placeholder="Describe the issue and how it affects your property value"
                        value={deduction.description}
                        onChange={(e) => handleDeductionChange(deduction.id, "description", e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Supporting Documentation</Label>
                      <span className="text-sm text-muted-foreground">Upload repair quotes, photos, or estimates</span>
                    </div>

                    <div className="grid gap-4">
                      <div className="border border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                        <Input
                          type="file"
                          id={`deduction-files-${deduction.id}`}
                          className="hidden"
                          multiple
                          onChange={(e) => handleDeductionFileChange(deduction.id, e)}
                        />
                        <Label
                          htmlFor={`deduction-files-${deduction.id}`}
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm font-medium">Click to upload files</span>
                          <span className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB each</span>
                        </Label>
                      </div>

                      {deduction.files.length > 0 && (
                        <div className="space-y-2">
                          {deduction.files.map((file, fileIndex) => (
                            <div key={fileIndex} className="flex items-center justify-between p-3 bg-muted rounded-md">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeDeductionFile(deduction.id, fileIndex)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove file</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full bg-transparent" onClick={addDeduction}>
                <Plus className="h-4 w-4 mr-2" />
                Add Another Deduction
              </Button>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleSaveDraft}>Save Draft</Button>
              <Button onClick={handleContinue} size="lg">
                Continue to Order Report
              </Button>
            </CardFooter>
          </Card>

          {/* Info Card */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    After completing this form, you'll proceed to order your comprehensive tax protest report which includes:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Professional analysis of your property details and deductions</li>
                    <li>• Comparable property research and market analysis</li>
                    <li>• Ready-to-file protest documents with your custom information</li>
                    <li>• Step-by-step filing instructions specific to your jurisdiction</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function FullReportDemoLoading() {
  return (
    <div className="py-6 px-4 sm:py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse bg-gray-200 h-8 w-64 rounded" />
        <div className="animate-pulse bg-gray-200 h-4 w-1/2 rounded" />
        <div className="animate-pulse bg-gray-200 h-64 rounded" />
      </div>
    </div>
  )
}

export default function FullReportDemoPage() {
  return (
    <Suspense fallback={<FullReportDemoLoading />}> 
      <FullReportDemoContent />
    </Suspense>
  )
}