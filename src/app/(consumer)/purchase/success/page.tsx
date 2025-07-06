import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, FileText, AlertCircle, Mail, Home, HeadphonesIcon, Sparkles, Clock, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface SuccessPageProps {
  searchParams: Promise<{
    session_id?: string
  }>
}

function SuccessContent({ sessionId }: { sessionId: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-200/30 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative container mx-auto py-8 px-4 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            {/* Animated Success Icon */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            {/* Sparkle Effects */}
            <div className="absolute -top-2 -right-2 animate-ping">
              <Sparkles className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="absolute -bottom-2 -left-2 animate-ping delay-500">
              <Sparkles className="h-4 w-4 text-blue-400" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Payment Successful! 🎉</h1>
          <p className="text-lg text-slate-600 mb-6">
            Thank you for your order. We'll get started on your report right away.
          </p>
          <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2">Order Confirmed</Badge>
        </div>

        {/* Order Summary */}
        <Card className="mb-8 p-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6 px-6">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Order
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <div>
                  <p className="font-semibold text-slate-900">Property Tax Comparables Report</p>
                  <p className="text-sm text-slate-600">Professional analysis and documentation</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">$49.00</p>
                  <p className="text-xs text-slate-500">One-time payment</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              What Happens Next
            </CardTitle>
            <CardDescription>Your report creation timeline</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Step 1 - Completed */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="w-0.5 h-12 bg-green-200 mt-2"></div>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-green-800">Payment Received</h3>
                    <Badge className="bg-green-100 text-green-800 text-xs">Completed</Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    Your payment has been processed successfully and your order is confirmed.
                  </p>
                </div>
              </div>

              {/* Step 2 - In Progress */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="w-0.5 h-12 bg-blue-200 mt-2"></div>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-blue-800">Expert Analysis</h3>
                    <Badge className="bg-blue-100 text-blue-800 text-xs animate-pulse">In Progress</Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    Our certified property tax experts are analyzing your property and identifying comparable
                    properties.
                  </p>
                </div>
              </div>

              {/* Step 3 - Pending */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-orange-800">Report Delivery</h3>
                    <Badge className="bg-orange-100 text-orange-800 text-xs">3-5 Business Days</Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    Your completed professional analysis will be emailed as a secure PDF document.
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Box */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900">Delivery Summary</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Our experts will analyze your property and email your professional report within{" "}
                    <strong>3-5 business days</strong>.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          <Button size="lg" variant="outline" asChild className="h-16 bg-transparent">
            <Link href="/">
              <Home className="h-5 w-5 mr-2" />
              <div className="text-left">
                <div className="font-semibold">Return Home</div>
                <div className="text-xs text-muted-foreground">Back to main site</div>
              </div>
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="h-16 bg-transparent">
            <Link href="mailto:ryan@fightyourtaxes.ai">
              <HeadphonesIcon className="h-5 w-5 mr-2" />
              <div className="text-left">
                <div className="font-semibold">Need Help?</div>
                <div className="text-xs text-muted-foreground">Contact support</div>
              </div>
            </Link>
          </Button>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-slate-500">
          <p>
            Questions? Email us at <strong>ryan@fightyourtaxes.ai</strong>
          </p>
          <p className="mt-1">Reference: {sessionId.slice(-8)}</p>
        </div>
      </div>
    </div>
  )
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams
  const sessionId = params.session_id

  if (!sessionId) {
    return (
      <div className="container mx-auto py-8 max-w-2xl px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No session ID provided. If you just completed a purchase, please check your email for order confirmation.
          </AlertDescription>
        </Alert>
        <div className="text-center mt-6">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 max-w-2xl text-center">
          <div className="animate-pulse">
            <div className="h-8 w-8 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessContent sessionId={sessionId} />
    </Suspense>
  )
}
