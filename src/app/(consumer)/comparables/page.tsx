"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Building2, HelpCircle, Info, MapPin, BarChart3, TrendingUp, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ComparablesPage() {
  const router = useRouter()
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [accountNumber, setAccountNumber] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCity || !accountNumber) {
      return
    }

    // For now, only Houston/HCAD is supported
    if (selectedCity === "houston") {
      router.push(`/comparables/hcad/${accountNumber}`)
    }
  }

  return (
    <div className="py-6 px-4 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Find Comparables</h1>
              <p className="mt-2 text-base sm:text-lg text-muted-foreground">
                Get professional comparable property analysis to understand your property's market value and assessment.
              </p>
            </div>

            {/* Value Proposition */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Market Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    Compare your property to similar homes in your neighborhood with detailed market analysis.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Assessment Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    Identify properties with lower assessments to support your case if needed.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20 sm:col-span-2 lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-5 w-5 text-primary" />
                    Professional Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    Get expert analysis and documentation ready for property tax appeals.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>How It Works</AlertTitle>
              <AlertDescription>
                Select your city and enter your property tax account number. We'll analyze comparable properties 
                in your area and provide detailed insights about your property's assessment relative to the market.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="city-select" className="text-sm font-medium leading-none">
                  Select Your City
                </label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your city..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="houston">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Houston (HCAD)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Currently, only Houston (Harris County Appraisal District) is supported.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="account-number" className="text-sm font-medium leading-none">
                  Property Tax Account Number
                </label>
                <Input
                  id="account-number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter your account number (e.g., 123456789)"
                  required
                  disabled={!selectedCity}
                />
                <p className="text-sm text-muted-foreground">
                  This is typically a 9-13 digit number found on your property tax statement.
                </p>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="gap-2 rounded-full px-8 font-bold"
                disabled={!selectedCity || !accountNumber}
              >
                Get Comparables Report <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  How to Find Your Account Number
                </CardTitle>
                <CardDescription>Your property tax account number can be found in several places:</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="statement">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="statement">Statement</TabsTrigger>
                    <TabsTrigger value="online">Online</TabsTrigger>
                    <TabsTrigger value="appraisal">Notice</TabsTrigger>
                  </TabsList>
                  <TabsContent value="statement" className="space-y-4 pt-4">
                    <div className="rounded-lg border p-3">
                      <h3 className="font-medium">On Your Tax Statement</h3>
                      <p className="text-sm text-muted-foreground">
                        Look at the top right corner of your property tax statement. The account number is typically
                        labeled as "Account Number" or "Property ID".
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <div className="flex items-center justify-center p-4">
                        <div className="w-full max-w-xs rounded-lg border bg-card p-4 shadow-sm">
                          <div className="flex justify-between">
                            <div className="text-xs text-muted-foreground">Tax Year 2023</div>
                            <div className="text-xs font-bold">
                              Account #: <span className="text-primary">123456789</span>
                            </div>
                          </div>
                          <div className="mt-2 text-sm font-medium">Property Tax Statement</div>
                          <div className="mt-4 h-20 w-full rounded-md bg-muted"></div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="online" className="space-y-4 pt-4">
                    <div className="rounded-lg border p-3">
                      <h3 className="font-medium">HCAD Website</h3>
                      <p className="text-sm text-muted-foreground">
                        Visit the Harris County Appraisal District website (hcad.org) and search for your property by address. 
                        The account number will be displayed in the property details.
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <Button variant="outline" size="sm" className="gap-2" asChild>
                        <a href="https://hcad.org/property-search/property-search" target="_blank" rel="noopener noreferrer">
                          <Building2 className="h-4 w-4" />
                          Visit HCAD Website
                        </a>
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="appraisal" className="space-y-4 pt-4">
                    <div className="rounded-lg border p-3">
                      <h3 className="font-medium">Appraisal Notice</h3>
                      <p className="text-sm text-muted-foreground">
                        Check your most recent property appraisal notice from HCAD. The account number is usually prominently
                        displayed near the top of the document.
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <div className="flex items-center justify-center p-4">
                        <div className="w-full max-w-xs rounded-lg border bg-card p-4 shadow-sm">
                          <div className="text-center text-sm font-medium">Notice of Appraised Value</div>
                          <div className="mt-2 text-center text-xs">Account Number:</div>
                          <div className="text-center text-sm font-bold text-primary">123456789</div>
                          <div className="mt-4 h-20 w-full rounded-md bg-muted"></div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex flex-col items-start">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="font-medium">Still can't find it?</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Contact Harris County Appraisal District at (713) 957-7800 or visit hcad.org for assistance.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 