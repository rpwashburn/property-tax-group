"use client"
import { Suspense } from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CheckCircle,
  FileText,
  Shield,
  Download,
  CreditCard,
  MapPin,
  Loader2,
  AlertCircle,
  User,
  Mail,
  Clock,
  Users,
  Star,
  Zap,
} from "lucide-react"
import { CTACard } from "@/components/shared/CTACard"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { usePurchase } from "@/hooks/use-purchase"

const jurisdictions = ["Harris County (HCAD)"]

const jurisdictionMapping: Record<string, string> = {
  HCAD: "Harris County (HCAD)",
}

// Client component that handles search params
function PurchaseContent() {
  const searchParams = useSearchParams()
  const { initiatePurchase, isLoading, error, clearError } = usePurchase()

  // Form state
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [jurisdiction, setJurisdiction] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [productType, setProductType] = useState<"comparables" | "full_report" | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)

  // Initialize from URL params
  useEffect(() => {
    const jurisdictionParam = searchParams.get("jurisdiction")
    const accountParam = searchParams.get("account")

    if (jurisdictionParam) {
      const mappedJurisdiction = jurisdictionMapping[jurisdictionParam] || jurisdictionParam
      setJurisdiction(mappedJurisdiction)
    }
    if (accountParam) setAccountNumber(accountParam)
  }, [searchParams])

  // Clear error when form data changes
  useEffect(() => {
    if (error) {
      clearError()
    }
  }, [customerName, customerEmail, jurisdiction, accountNumber, productType, clearError, error])

  const handleProductSelect = (product: "comparables" | "full_report") => {
    setProductType(product)
    setShowCheckout(true)
    // Smooth scroll to checkout form
    setTimeout(() => {
      document.getElementById("checkout-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }, 100)
  }

  const handlePurchase = async () => {
    if (!productType || !customerName.trim() || !customerEmail.trim() || !jurisdiction || !accountNumber.trim()) {
      return
    }

    await initiatePurchase({
      productType,
      jurisdiction,
      accountNumber: accountNumber.trim(),
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
    })
  }

  const isFormValid = customerName.trim() && customerEmail.trim() && jurisdiction && accountNumber.trim()

  const getProductInfo = (type: "comparables" | "full_report") => {
    return type === "comparables"
      ? { name: "Comparables Report", price: "$49", color: "green", savings: "Save $50" }
      : { name: "Full Tax Protest Report", price: "$99", color: "blue", savings: "Save $200+" }
  }

  return (
    <div className="py-6 px-4 sm:py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Social Proof */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
            <Users className="h-4 w-4" />
            <span>Join 2,847+ homeowners who've saved on their property taxes</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Choose Your Tax Savings Report</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Professional property tax analysis delivered in 3-5 business days. Most clients save $500-2000+ annually.
          </p>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>4.9/5 rating</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>30-day guarantee</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>3-5 day delivery</span>
            </div>
          </div>
        </div>

        {/* Urgency Banner */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-orange-800">
            <Zap className="h-4 w-4" />
            <span className="font-medium">Filing deadline approaching!</span>
          </div>
          <p className="text-sm text-orange-700 mt-1">
            Property tax protests must be filed by May 15th. Get your report now to meet the deadline.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {/* Product Selection */}
        <div className="grid gap-6 lg:grid-cols-2">
          <CTACard
            title="Comparables Report"
            description="Professional analysis of comparable properties - most popular for first-time filers"
            icon={<FileText className="h-5 w-5 text-green-600" />}
            badge={{
              text: "Most Popular",
              variant: "secondary",
            }}
            price={{
              amount: "$49",
              subtitle: "One-time payment",
            }}
            features={[
              "Analysis of all comparable properties in your area",
              "Evidence for properties with lower assessments",
              "Detailed valuation insights and methodology",
              "Professional PDF report for your records",
            ]}
            button={{
              text: productType === "comparables" ? "✓ Selected" : "Get Comparables Report",
              variant: productType === "comparables" ? "default" : "green",
              icon:
                productType === "comparables" ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                ),
              onClick: () => handleProductSelect("comparables"),
            }}
            secondaryButton={{
              text: "View Sample Report",
              icon: <Download className="h-4 w-4 mr-2" />,
            }}
            borderColor="border-green-300 hover:border-green-400"
            className={`transition-all duration-300 ${
              productType === "comparables" ? "ring-2 ring-green-200 border-green-400 bg-green-50/50" : ""
            }`}
          />

          <CTACard
            title="Full Tax Protest Report"
            description="Complete protest package with everything you need to file - highest success rate"
            icon={<Shield className="h-5 w-5 text-blue-600" />}
            badge={{
              text: "Best Value",
              variant: "blue",
            }}
            price={{
              amount: "$99",
              subtitle: "One-time payment",
            }}
            features={[
              "<strong>Everything in Comparables Report</strong>",
              "Ready-to-file protest documents",
              "Step-by-step filing instructions",
              "Evidence package with supporting documentation",
            ]}
            button={{
              text: productType === "full_report" ? "✓ Selected" : "Get Full Protest Report",
              variant: productType === "full_report" ? "default" : "blue",
              icon:
                productType === "full_report" ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                ),
              onClick: () => handleProductSelect("full_report"),
            }}
            secondaryButton={{
              text: "View Sample Report",
              icon: <Download className="h-4 w-4 mr-2" />,
            }}
            borderColor="border-blue-300 hover:border-blue-400"
            className={`bg-blue-50/30 transition-all duration-300 ${
              productType === "full_report" ? "ring-2 ring-blue-200 border-blue-400 bg-blue-50/70" : ""
            }`}
          />
        </div>

        {/* Checkout Form - Appears smoothly when product selected */}
        {showCheckout && productType && (
          <div id="checkout-form" className="space-y-6 animate-in slide-in-from-top-4 duration-500">
            {/* Progress Indicator */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <CheckCircle className="h-4 w-4" />
                Step 2 of 2: Complete Your Order
              </div>
            </div>

            {/* Selected Product Summary */}
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      {productType === "comparables" ? (
                        <FileText className="h-5 w-5 text-green-600" />
                      ) : (
                        <Shield className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{getProductInfo(productType).name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        Professional analysis • 3-5 day delivery
                        <Badge variant="secondary" className="text-xs">
                          {getProductInfo(productType).savings}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{getProductInfo(productType).price}</div>
                    <div className="text-sm text-muted-foreground">One-time payment</div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Quick Details Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Complete Your Order
                </CardTitle>
                <CardDescription>Just a few details to prepare your personalized report</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName" className="text-sm font-medium">
                        Full Name *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="customerName"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Enter your full name"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail" className="text-sm font-medium">
                        Email Address *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="customerEmail"
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="Enter your email address"
                          className="pl-10"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Your report will be emailed to this address</p>
                    </div>
                  </div>

                  {/* Property Information */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="jurisdiction" className="text-sm font-medium">
                        Jurisdiction *
                      </Label>
                      <Select value={jurisdiction} onValueChange={setJurisdiction} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your jurisdiction" />
                        </SelectTrigger>
                        <SelectContent>
                          {jurisdictions.map((j) => (
                            <SelectItem key={j} value={j}>
                              {j}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber" className="text-sm font-medium">
                        Property Account Number *
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="accountNumber"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="Enter account number"
                          className="pl-10 font-mono"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Found on your property tax statement</p>
                    </div>
                  </div>
                </div>

                {/* Purchase Button */}
                <div className="mt-6 space-y-4">
                  <Button
                    size="lg"
                    onClick={handlePurchase}
                    disabled={!isFormValid || isLoading}
                    className={`w-full gap-2 text-lg py-6 ${
                      productType === "comparables"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
                    {isLoading ? "Processing..." : `Proceed to Payment (${getProductInfo(productType).price})`}
                  </Button>

                  {/* Trust Signals */}
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>30-day guarantee</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Delivered in 3-5 days</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Social Proof & Benefits - Always visible */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-center">Why 2,847+ Homeowners Trust Our Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3 text-sm">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="font-semibold">Expert Analysis</div>
                <div className="text-muted-foreground">Professional property data analysis by certified appraisers</div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div className="font-semibold">Ready to File</div>
                <div className="text-muted-foreground">Documents formatted for official submission to your ARB</div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div className="font-semibold">Proven Results</div>
                <div className="text-muted-foreground">Average savings of $500-2000+ per year on property taxes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final Trust Signals */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">🔒 Secure payment • ⚡ Instant confirmation • 📧 Email delivery</p>
          <p className="text-xs text-muted-foreground">
            Reports are professionally prepared by our experts and emailed within 3-5 business days.
          </p>
        </div>
      </div>
    </div>
  )
}

// Loading component for Suspense fallback
function PurchasePageLoading() {
  return (
    <div className="py-6 px-4 sm:py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="animate-pulse bg-gray-200 h-8 w-96 mx-auto rounded"></div>
          <div className="animate-pulse bg-gray-200 h-4 w-2/3 mx-auto rounded"></div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
          <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}

export default function PurchasePage() {
  return (
    <Suspense fallback={<PurchasePageLoading />}>
      <PurchaseContent />
    </Suspense>
  )
}