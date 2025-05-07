"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, FileText, BarChart3, Building, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PropertyAnalysisPage() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedInput = searchInput.trim();
    const accountNumberToUse = trimmedInput ? trimmedInput : "0520860000040";
    router.push(`/start?accountNumber=${accountNumberToUse}`)
  }

  return (
    <div className="container max-w-7xl mx-auto px-4">
      <div className="min-h-[60vh] grid grid-cols-1 lg:grid-cols-2 items-start lg:items-center py-16">
        {/* Left side - Hero content */}
        <div className="space-y-6 pr-8">
          <div className="inline-flex rounded-full bg-black px-4 py-1.5">
            <span className="text-sm font-medium text-white">
              Property Tax Analysis Tool
            </span>
          </div>
          <div>
            <h1 className="text-[64px] font-bold leading-tight">
              Lower Your<br />Property Taxes
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              Our property tax analysis tool helps you identify if your property is overvalued and builds a strong case for your tax appeal.
            </p>
          </div>
        </div>

        {/* Right side - Search form */}
        <div className="mt-12 lg:mt-0">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Find Your Property</h2>
                <p className="text-gray-600 mt-2">
                  Enter your property account number to get started
                </p>
              </div>
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Enter account number"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pl-10 h-12 bg-white border-gray-200"
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    You can find your account number on your property tax statement
                  </p>
                </div>
                <Button type="submit" className="w-full bg-black text-white hover:bg-black/90">
                  Search Property
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 md:py-16 border-t" id="how-it-works">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
          <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl/relaxed">
            See if you&apos;re paying too much in property taxes and build your appeal case in 5 simple steps
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="sr-only">Step 1</span>
              </div>
              <CardTitle className="text-xl">Check Your Value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                See how much your property value has increased and estimate your new tax burden
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="sr-only">Step 2</span>
              </div>
              <CardTitle className="text-xl">Review Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Verify your property&apos;s information and identify any discrepancies</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-2">
                <Building className="h-5 w-5 text-primary" />
                <span className="sr-only">Step 3</span>
              </div>
              <CardTitle className="text-xl">Find Comparables</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Compare your assessment to similar properties in your area
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="sr-only">Step 4</span>
              </div>
              <CardTitle className="text-xl">Add Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Upload supporting documents to strengthen your appeal case</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="sr-only">Step 5</span>
              </div>
              <CardTitle className="text-xl">Submit Appeal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Generate and submit your appeal package with all supporting evidence
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="py-12 md:py-16 border-t">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Why Use Our Tool?</h2>
            <p className="text-muted-foreground">
              Our property tax analysis tool provides everything you need to successfully appeal your property taxes and
              potentially save thousands of dollars.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <span>Identify if your property is overvalued compared to similar properties</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <span>Collect and organize supporting evidence for your appeal</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <span>Find comparable properties to strengthen your case</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <span>Generate a professional appeal package ready for submission</span>
              </li>
            </ul>
            <div className="pt-4">
              <Button asChild>
                <Link href="/start">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-col space-y-1.5">
                <h3 className="font-semibold leading-none tracking-tight">Success Story</h3>
              </div>
              <div className="mt-4 space-y-2">
                <blockquote className="border-l-4 border-primary/50 pl-4 italic">
                  &quot;Using this tool, I was able to identify that my property was overvalued by nearly $50,000. The
                  comparable properties feature was especially helpful in building my case. After submitting my appeal,
                  my property taxes were reduced by over $1,200 per year!&quot;
                </blockquote>
                <p className="text-sm text-muted-foreground">&quot;— Michael R., Houston Homeowner&quot;</p>
              </div>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-col space-y-1.5">
                <h3 className="font-semibold leading-none tracking-tight">Did You Know?</h3>
              </div>
              <div className="mt-4">
                <p className="text-muted-foreground">
                  According to industry statistics, <span className="font-semibold">7 out of 10</span> property tax
                  appeals result in a reduction, with an average savings of{" "}
                  <span className="font-semibold">$1,100</span> per year.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 md:py-16 border-t">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-white p-6 md:p-8 border-b">
            <div className="grid gap-4 md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-2xl font-bold">Ready to Lower Your Property Taxes?</h3>
                <p className="mt-2 text-muted-foreground">
                  Get started today and see if you can reduce your property tax burden.
                </p>
              </div>
              <div className="flex items-center justify-start md:justify-end">
                <Button size="lg" onClick={() => router.push('/start')}>
                  Analyze Your Property <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="p-6 md:p-8 bg-slate-50">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="text-3xl font-bold">$1,100+</div>
                <p className="text-sm text-muted-foreground">Average Annual Savings</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="text-3xl font-bold">70%</div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="text-3xl font-bold">15 min</div>
                <p className="text-sm text-muted-foreground">Average Time to Complete</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

