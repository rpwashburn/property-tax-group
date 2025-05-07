"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Download, FileText, Lock, MapPin, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState("summary")
  const [isPurchased, setIsPurchased] = useState(false)

  const mockComparables = [
    {
      id: "comp1",
      address: "123 Nearby St",
      distance: "0.3 miles",
      sqft: 2380,
      beds: 4,
      baths: 3,
      yearBuilt: 1999,
      lotSize: 8200,
      value: 485000,
      valuePerSqft: 204,
      image: "/placeholder.svg?height=150&width=250",
    },
    {
      id: "comp2",
      address: "456 Similar Ave",
      distance: "0.5 miles",
      sqft: 2510,
      beds: 4,
      baths: 3,
      yearBuilt: 2000,
      lotSize: 8800,
      value: 510000,
      valuePerSqft: 203,
      image: "/placeholder.svg?height=150&width=250",
    },
    {
      id: "comp3",
      address: "789 Comparable Ln",
      distance: "0.7 miles",
      sqft: 2400,
      beds: 4,
      baths: 2.5,
      yearBuilt: 1997,
      lotSize: 8000,
      value: 475000,
      valuePerSqft: 198,
      image: "/placeholder.svg?height=150&width=250",
    },
  ]

  const [evidence, setEvidence] = useState({
    propertyMeasurement: { name: "Property_Measurement.pdf" },
    conditionPhotos: { name: "Property_Condition_Photos.zip" },
    repairQuotes: { name: "Foundation_Repair_Quote.pdf" },
    inspectionReports: { name: "Roof_Inspection_Report.pdf" },
  })

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
        <h1 className="text-3xl font-bold tracking-tight">Property Tax Appeal Report</h1>
        <p className="text-muted-foreground mt-2">
          Your comprehensive report to support your case for a lower property tax assessment.
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
          <Check className="h-5 w-5" />
        </div>
      </div>

      {!isPurchased && (
        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Unlock Your Full Property Tax Appeal Report
            </CardTitle>
            <CardDescription>
              Get your complete analysis and recommended value to maximize your tax savings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="font-medium">Recommended Assessment Value</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="font-medium">Detailed Comparable Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="font-medium">Evidence Organization</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="font-medium">Downloadable PDF Report</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="font-medium">Unlimited Updates for 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="font-medium">Step-by-Step Guidance</span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-background rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">One-time payment for 2025</p>
                <p className="text-3xl font-bold mb-4">$99</p>
                <Button className="w-full" onClick={() => setIsPurchased(true)}>
                  Purchase Full Report
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Unlimited updates throughout the 2025 tax year
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isPurchased && (
        <div className="flex justify-end gap-2 mb-6">
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      )}

      <Card className="mb-8">
        <CardHeader className="pb-4">
          <CardTitle>Property Tax Appeal Report</CardTitle>
          <CardDescription>123 Main St, Houston, TX 77002</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="comparables">Comparables</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="pt-6">
              <div className="space-y-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Recommended Assessment Value</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Assessment</p>
                      <p className="font-bold text-xl">$500,000</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Recommended Assessment</p>
                      {isPurchased ? (
                        <p className="font-bold text-xl text-green-600">$475,000</p>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-24 bg-muted-foreground/20 animate-pulse rounded"></div>
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Potential Tax Savings</p>
                      {isPurchased ? (
                        <p className="font-bold text-xl text-green-600">$625/year</p>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-24 bg-muted-foreground/20 animate-pulse rounded"></div>
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Executive Summary</h3>
                  {isPurchased ? (
                    <>
                      <p className="text-sm mb-4">
                        Based on our analysis of comparable properties in your area, we believe your property is
                        overvalued by approximately $25,000 (5%). This report provides evidence to support a reduced
                        assessment value of $475,000.
                      </p>
                      <p className="text-sm mb-4">
                        The comparable properties selected for this analysis share similar characteristics with your
                        property, including square footage, number of bedrooms and bathrooms, year built, and location.
                        The average assessed value per square foot of these comparable properties is $201, compared to
                        your current assessment of $204 per square foot.
                      </p>
                      <p className="text-sm">
                        Additionally, we've identified discrepancies in the appraisal district's records regarding your
                        property's characteristics that further support a reduction in assessed value.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm mb-4">
                        Our analysis of comparable properties in your area suggests your property may be overvalued.
                        Purchase the full report to see our recommended assessment value and detailed analysis.
                      </p>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-muted-foreground/20 rounded"></div>
                        <div className="h-4 w-full bg-muted-foreground/20 rounded"></div>
                        <div className="h-4 w-3/4 bg-muted-foreground/20 rounded"></div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="h-4 w-full bg-muted-foreground/20 rounded"></div>
                        <div className="h-4 w-full bg-muted-foreground/20 rounded"></div>
                        <div className="h-4 w-2/3 bg-muted-foreground/20 rounded"></div>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <h3 className="font-medium mb-3">Key Arguments</h3>
                  {isPurchased ? (
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                        <span>
                          Comparable properties in your neighborhood have lower assessed values per square foot than
                          your property.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                        <span>
                          The appraisal district's records incorrectly list your property as having 2,500 square feet,
                          when it actually has 2,450 square feet.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                        <span>
                          Your property requires significant repairs to the foundation and roof, which negatively impact
                          its market value.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                        <span>
                          Recent sales in your neighborhood support a lower valuation than what the appraisal district
                          has assigned.
                        </span>
                      </li>
                    </ul>
                  ) : (
                    <div className="flex flex-col gap-3 mt-4">
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                        <div className="h-4 w-full bg-muted-foreground/20 rounded"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                        <div className="h-4 w-full bg-muted-foreground/20 rounded"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-600 shrink-0" />
                        <div className="h-4 w-full bg-muted-foreground/20 rounded"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="h-4 w-full bg-muted-foreground/20 rounded"></div>
                      </div>
                    </div>
                  )}
                </div>

                {isPurchased && (
                  <div>
                    <h3 className="font-medium mb-3">Next Steps</h3>
                    <ol className="space-y-2 text-sm list-decimal pl-5">
                      <li>
                        Schedule an informal hearing with the appraisal district (use the contact information provided
                        at the end of this report).
                      </li>
                      <li>
                        Bring this complete report, including all comparable property information and supporting
                        evidence.
                      </li>
                      <li>
                        Present your case calmly and factually, focusing on the comparable properties and any errors in
                        the appraisal district's records.
                      </li>
                      <li>
                        If the informal hearing doesn't result in a satisfactory reduction, file a formal protest before
                        the deadline.
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="comparables" className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Comparable Properties Analysis</h3>
                  <p className="text-sm mb-4">
                    The following properties are similar to yours in terms of location, size, age, and features, but
                    have lower assessed values. These comparables provide strong evidence for a reduction in your
                    property's assessed value.
                  </p>
                </div>

                <div className="space-y-4">
                  {mockComparables.slice(0, isPurchased ? 3 : 1).map((comp) => (
                    <div key={comp.id} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="md:w-1/4">
                          <img
                            src={comp.image || "/placeholder.svg"}
                            alt={comp.address}
                            className="w-full h-auto rounded-md object-cover"
                          />
                        </div>
                        <div className="md:w-3/4">
                          <div>
                            <h3 className="font-medium">{comp.address}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {comp.distance} away
                            </p>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Square Feet</p>
                              <p className="font-medium">{comp.sqft.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Bed/Bath</p>
                              <p className="font-medium">
                                {comp.beds}/{comp.baths}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Year Built</p>
                              <p className="font-medium">{comp.yearBuilt}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Lot Size</p>
                              <p className="font-medium">{comp.lotSize.toLocaleString()} sqft</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex justify-between">
                              <div>
                                <p className="text-xs text-muted-foreground">Assessed Value</p>
                                <p className="font-medium">${comp.value.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Value per Sq Ft</p>
                                <p className="font-medium">${comp.valuePerSqft}/sqft</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Difference from Yours</p>
                                {isPurchased ? (
                                  <p className="font-medium text-green-600">-$15,000 (-3%)</p>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <div className="h-4 w-16 bg-muted-foreground/20 rounded"></div>
                                    <Lock className="h-3 w-3 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {!isPurchased && (
                    <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
                      <Lock className="h-8 w-8 text-muted-foreground mb-2" />
                      <h3 className="font-medium mb-1">2 More Comparable Properties Available</h3>
                      <p className="text-sm text-muted-foreground mb-4 max-w-md">
                        Purchase the full report to see all comparable properties and their detailed analysis
                      </p>
                      <Button onClick={() => setIsPurchased(true)}>Unlock Full Report</Button>
                    </div>
                  )}
                </div>

                {isPurchased && (
                  <div>
                    <h3 className="font-medium mb-3">Comparative Analysis</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3">Property</th>
                            <th className="text-left py-2 px-3">Sq Ft</th>
                            <th className="text-left py-2 px-3">Bed/Bath</th>
                            <th className="text-left py-2 px-3">Year Built</th>
                            <th className="text-left py-2 px-3">Assessed Value</th>
                            <th className="text-left py-2 px-3">Value/Sq Ft</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b bg-muted">
                            <td className="py-2 px-3 font-medium">Your Property</td>
                            <td className="py-2 px-3">2,450</td>
                            <td className="py-2 px-3">4/3</td>
                            <td className="py-2 px-3">1998</td>
                            <td className="py-2 px-3">$500,000</td>
                            <td className="py-2 px-3">$204</td>
                          </tr>
                          {mockComparables.map((comp) => (
                            <tr key={comp.id} className="border-b">
                              <td className="py-2 px-3">{comp.address}</td>
                              <td className="py-2 px-3">{comp.sqft}</td>
                              <td className="py-2 px-3">
                                {comp.beds}/{comp.baths}
                              </td>
                              <td className="py-2 px-3">{comp.yearBuilt}</td>
                              <td className="py-2 px-3">${comp.value.toLocaleString()}</td>
                              <td className="py-2 px-3">${comp.valuePerSqft}</td>
                            </tr>
                          ))}
                          <tr className="border-b bg-muted/50">
                            <td className="py-2 px-3 font-medium">Average of Comps</td>
                            <td className="py-2 px-3">2,430</td>
                            <td className="py-2 px-3">4/2.8</td>
                            <td className="py-2 px-3">1999</td>
                            <td className="py-2 px-3">$490,000</td>
                            <td className="py-2 px-3">$201</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="evidence" className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Supporting Evidence</h3>
                  <p className="text-sm mb-4">
                    The following evidence supports your case for a lower property tax assessment. Be sure to bring
                    these documents to your hearing with the appraisal district.
                  </p>
                </div>

                {isPurchased ? (
                  <div className="space-y-4">
                    {evidence.propertyMeasurement && (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-muted p-2 rounded-md">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">Property Measurement Report</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Professional measurement showing actual square footage of your property
                            </p>
                            <Button variant="outline" size="sm">
                              View Document
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {evidence.repairQuotes && (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-muted p-2 rounded-md">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">Repair Quotes</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Estimates for necessary repairs that impact your property's value
                            </p>
                            <Button variant="outline" size="sm">
                              View Document
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {evidence.inspectionReports && (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-muted p-2 rounded-md">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">Inspection Reports</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Professional inspections detailing your property's condition
                            </p>
                            <Button variant="outline" size="sm">
                              View Document
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {evidence.conditionPhotos && (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-muted p-2 rounded-md">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">Property Condition Photos</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Photos documenting the current condition of your property, highlighting areas needing
                              repair
                            </p>
                            <Button variant="outline" size="sm">
                              View Photos
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 opacity-50">
                      <div className="flex items-start gap-3">
                        <div className="bg-muted p-2 rounded-md">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">Your Uploaded Evidence</h4>
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="h-4 w-3/4 bg-muted-foreground/20 rounded mt-2"></div>
                          <div className="h-8 w-24 bg-muted-foreground/20 rounded mt-4"></div>
                        </div>
                      </div>
                    </div>

                    <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
                      <Lock className="h-8 w-8 text-muted-foreground mb-2" />
                      <h3 className="font-medium mb-1">Evidence Organization Available</h3>
                      <p className="text-sm text-muted-foreground mb-4 max-w-md">
                        Purchase the full report to access your organized evidence and presentation materials
                      </p>
                      <Button onClick={() => setIsPurchased(true)}>Unlock Full Report</Button>
                    </div>
                  </div>
                )}

                {isPurchased && (
                  <div>
                    <h3 className="font-medium mb-3">Evidence Checklist</h3>
                    <div className="space-y-2">
                      {evidence.propertyMeasurement && (
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">Property measurement documentation</span>
                        </div>
                      )}
                      {(evidence.repairQuotes || evidence.inspectionReports) && (
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">Repair estimates and inspection reports</span>
                        </div>
                      )}
                      {evidence.conditionPhotos && (
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">Property condition photos</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/comparables">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
          {isPurchased ? (
            <Button>
              <Download className="mr-2 h-4 w-4" /> Download Complete Report
            </Button>
          ) : (
            <Button onClick={() => setIsPurchased(true)}>Purchase Full Report</Button>
          )}
        </CardFooter>
      </Card>

      {isPurchased && (
        <Card>
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
            <CardDescription>Steps to complete your property tax appeal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">1. Schedule an Informal Hearing</h3>
                  <span className="text-sm text-muted-foreground">Deadline: May 15, 2025</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Contact your county appraisal district to schedule an informal hearing with an appraiser.
                </p>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <p className="font-medium">Harris Central Appraisal District (HCAD)</p>
                  <p>Phone: (713) 957-7800</p>
                  <p>Email: help@hcad.org</p>
                  <p>Website: www.hcad.org</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">2. Prepare for Your Hearing</h3>
                <p className="text-sm text-muted-foreground">
                  Review this report thoroughly and organize all your evidence. Practice presenting your case clearly
                  and concisely.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={25} className="h-2" />
                  <span className="text-xs text-muted-foreground">25% Complete</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">3. Attend Your Hearing</h3>
                <p className="text-sm text-muted-foreground">
                  Bring this report and all supporting evidence to your hearing. Present your case calmly and factually.
                </p>
                <ul className="text-sm space-y-1 mt-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-muted-foreground" />
                    <span>Arrive 15 minutes early</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-muted-foreground" />
                    <span>Bring multiple copies of your report</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-muted-foreground" />
                    <span>Be polite and professional</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-muted-foreground" />
                    <span>Take notes during the hearing</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">4. If Necessary, File a Formal Protest</h3>
                <p className="text-sm text-muted-foreground">
                  If you're not satisfied with the result of your informal hearing, file a formal protest before the
                  deadline.
                </p>
                <div className="bg-muted p-3 rounded-md text-sm mt-2">
                  <p className="font-medium">Formal Protest Deadline: May 15, 2025</p>
                  <p>
                    Forms available at: <span className="text-primary">www.hcad.org/protest-forms</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Schedule Your Hearing Now</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

