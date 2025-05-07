"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, CreditCard, FileText, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"

export default function SubscriptionPage() {
  const [paymentMethod, setPaymentMethod] = useState("credit")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setIsComplete(true)
    }, 2000)
  }

  return (
    <div className="container max-w-5xl py-10">
      <div className="mb-8">
        <Link
          href="/report"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Report Preview
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Unlock Your Full Property Tax Report</h1>
        <p className="text-muted-foreground mt-2">
          Get access to your complete analysis and recommended value to maximize your tax savings
        </p>
      </div>

      {!isComplete ? (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>One-time payment for unlimited access throughout the 2025 tax year</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <RadioGroup defaultValue="credit" value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="credit" id="payment-credit" />
                        <Label htmlFor="payment-credit" className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" /> Credit or Debit Card
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="paypal" id="payment-paypal" />
                        <Label htmlFor="payment-paypal">PayPal</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {paymentMethod === "credit" && (
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="card-name">Name on Card</Label>
                        <Input id="card-name" placeholder="John Smith" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input id="card-number" placeholder="1234 5678 9012 3456" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="expiry">Expiration Date</Label>
                          <Input id="expiry" placeholder="MM/YY" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input id="cvc" placeholder="123" required />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "paypal" && (
                    <div className="border rounded-lg p-6 flex flex-col items-center justify-center text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        You'll be redirected to PayPal to complete your purchase securely.
                      </p>
                      <img src="/placeholder.svg?height=40&width=150" alt="PayPal" className="h-10 mb-4" />
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email for Receipt</Label>
                    <Input id="email" type="email" placeholder="john@example.com" required />
                    <p className="text-xs text-muted-foreground">
                      We'll send your receipt and access information to this email
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full" disabled={isProcessing}>
                      {isProcessing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Pay $99 and Unlock Full Report</>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Property Tax Appeal Report</span>
                  <span>$99.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>$99.00</span>
                </div>

                <div className="bg-muted p-3 rounded-md text-sm mt-4">
                  <p className="font-medium flex items-center gap-1 mb-1">
                    <RefreshCw className="h-4 w-4" /> Unlimited Updates
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your purchase includes unlimited updates and report regeneration throughout the 2025 tax year
                  </p>
                </div>

                <div className="space-y-2 pt-4">
                  <h3 className="text-sm font-medium">What's Included:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2 items-start">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span>Recommended assessment value based on comparable analysis</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span>Detailed comparable property analysis with adjustments</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span>Evidence organization and presentation materials</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span>Downloadable PDF report for your hearing</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span>Step-by-step guidance for your appeal process</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Payment Successful!</CardTitle>
            <CardDescription>Your full property tax appeal report is now available</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Thank you for your purchase. You now have unlimited access to your property tax appeal report for the 2025
              tax year.
            </p>

            <div className="bg-white p-4 rounded-md border border-green-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Property Tax Appeal Report</h3>
                  <p className="text-sm text-muted-foreground">123 Main St, Houston, TX 77002</p>
                </div>
              </div>
            </div>

            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="font-medium flex items-center gap-1 mb-1">
                <RefreshCw className="h-4 w-4" /> Unlimited Updates
              </p>
              <p className="text-xs text-muted-foreground">
                You can update your property details and regenerate your report as many times as needed throughout the
                2025 tax year
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/report" className="w-full">
              <Button className="w-full">
                View Your Complete Report <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

