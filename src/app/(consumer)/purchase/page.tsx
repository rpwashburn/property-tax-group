import type React from "react"
import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, FileText, Shield, Download, CreditCard, Building2, MapPin } from "lucide-react"
import { getPropertyDataByAccountNumber } from "@/lib/property-api-client"
import { formatCurrency } from "@/lib/utils"
import { CTACard } from "@/components/shared/CTACard"

interface PurchasePageProps {
  searchParams: Promise<{
    jurisdiction?: string
    account?: string
  }>
}

function PurchasePageContent({ searchParams }: { searchParams: { jurisdiction?: string; account?: string } }) {
  const jurisdiction = searchParams.jurisdiction || ''
  const accountId = searchParams.account || ''

  return (
    <div className="py-6 px-4 sm:py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Choose Your Report</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get professional property tax analysis and documentation to challenge your assessment
          </p>
        </div>

        {/* Property Details */}
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              Property Details
            </CardTitle>
            <CardDescription>
              {(jurisdiction && accountId) ? 'Confirm your property information' : 'Enter your property information to continue'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                {jurisdiction ? (
                  <div className="flex items-center gap-2 p-2 bg-white rounded border">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{jurisdiction}</span>
                  </div>
                ) : (
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HCAD">HCAD - Harris County</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="account">Account Number</Label>
                {accountId ? (
                  <div className="p-2 bg-white rounded border">
                    <div className="font-mono font-medium">{accountId}</div>
                  </div>
                ) : (
                  <Input 
                    id="account"
                    placeholder="Enter your account number"
                    className="font-mono"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Options */}
        <div className="grid gap-6 lg:grid-cols-2 lg:max-w-6xl lg:mx-auto">
          <CTACard
            title="Comparables Report"
            description="Professional analysis of comparable properties in your neighborhood"
            icon={<FileText className="h-5 w-5 text-green-600" />}
            badge={{
              text: "Popular",
              variant: "secondary"
            }}
            price={{
              amount: "$49",
              subtitle: "One-time payment"
            }}
            features={[
              "Analysis of all comparable properties in your area",
              "Evidence for properties with lower assessments",
              "Detailed valuation insights and methodology",
              "Professional PDF report for your records"
            ]}
            button={{
              text: "Purchase Comparables Report",
              variant: "green",
              icon: <CreditCard className="h-4 w-4 mr-2" />
            }}
            secondaryButton={{
              text: "Download Example Report",
              icon: <Download className="h-4 w-4 mr-2" />
            }}
            borderColor="border-green-300 hover:border-green-400"
            className="transition-colors"
          />

          <CTACard
            title="Full Tax Protest Report"
            description="Complete protest documentation with comparables analysis included"
            icon={<Shield className="h-5 w-5 text-blue-600" />}
            badge={{
              text: "Complete Solution",
              variant: "blue"
            }}
            price={{
              amount: "$99",
              subtitle: "One-time payment"
            }}
            features={[
              "<strong>Everything in Comparables Report</strong>",
              "Ready-to-file protest documents",
              "Step-by-step filing instructions",
              "Evidence package with supporting documentation"
            ]}
            button={{
              text: "Purchase Full Protest Report",
              variant: "blue",
              icon: <Shield className="h-4 w-4 mr-2" />
            }}
            secondaryButton={{
              text: "Download Example Report",
              icon: <Download className="h-4 w-4 mr-2" />
            }}
            borderColor="border-blue-300 hover:border-blue-400"
            className="bg-blue-50/50 transition-colors"
          />
        </div>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Why Choose Our Reports?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3 text-sm">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="font-semibold">Professional Analysis</div>
                <div className="text-muted-foreground">
                  AI-powered analysis of property data and comparable sales
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div className="font-semibold">Ready to File</div>
                <div className="text-muted-foreground">
                  Documents formatted for official submission to your ARB
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="font-semibold">Money-Back Guarantee</div>
                <div className="text-muted-foreground">
                  30-day guarantee - if you're not satisfied, get a full refund
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Trust */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              <span>Instant Download</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Professional Quality</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            All payments are securely processed. Reports are generated instantly upon payment confirmation.
          </p>
        </div>
      </div>
    </div>
  )
}

export default async function PurchasePage({ searchParams }: PurchasePageProps) {
  const resolvedSearchParams = await searchParams
  
  return (
    <Suspense fallback={<div className="py-12 text-center">Loading...</div>}>
      <PurchasePageContent searchParams={resolvedSearchParams} />
    </Suspense>
  )
} 