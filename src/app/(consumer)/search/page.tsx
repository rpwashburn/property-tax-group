import type React from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, FileSearch, HelpCircle, Info, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function StartPage() {
  return (
    <div className="py-12">
      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Start Your Property Tax Protest</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Enter your property tax account number to begin the protest process.
            </p>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>What happens next?</AlertTitle>
            <AlertDescription>
              After entering your account number, our AI will analyze your property assessment and find comparable
              properties to build your case. You'll then be guided through a step-by-step process to complete your
              protest.
            </AlertDescription>
          </Alert>

          <form method="GET" action="/report" className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="account-number" className="text-sm font-medium leading-none">
                Property Tax Account Number
              </label>
              <Input
                id="account-number"
                name="accountNumber"
                placeholder="Enter your account number (e.g., 123456789)"
                required
                defaultValue="0520860000040"
              />
              <p className="text-sm text-muted-foreground">
                This is typically a 9-13 digit number found on your property tax statement.
              </p>
            </div>

            <Button type="submit" size="lg" className="gap-2 rounded-full px-8">
              Start Property Analysis <ArrowRight className="h-4 w-4" />
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
                  <TabsTrigger value="appraisal">Appraisal</TabsTrigger>
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
                    <h3 className="font-medium">County Tax Website</h3>
                    <p className="text-sm text-muted-foreground">
                      Visit your county tax assessor's website and search for your property by address. The account
                      number will be displayed in the property details.
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Search className="h-4 w-4" />
                      Find Your County Tax Website
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="appraisal" className="space-y-4 pt-4">
                  <div className="rounded-lg border p-3">
                    <h3 className="font-medium">Appraisal Notice</h3>
                    <p className="text-sm text-muted-foreground">
                      Check your most recent property appraisal notice. The account number is usually prominently
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
                <FileSearch className="h-4 w-4 text-primary" />
                <span className="font-medium">Still can't find it?</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Contact your local tax assessor's office or check your property deed records.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="mt-12 rounded-xl bg-muted p-6">
        <h2 className="text-xl font-bold">What to Expect in the Protest Process</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-card p-4 shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">1</div>
            <h3 className="mt-2 font-medium">Property Analysis</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Our AI analyzes your property details and current assessment to identify potential overvaluation.
            </p>
          </div>
          <div className="rounded-lg bg-card p-4 shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">2</div>
            <h3 className="mt-2 font-medium">Comparable Properties</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We find similar properties with lower assessments to build evidence for your case.
            </p>
          </div>
          <div className="rounded-lg bg-card p-4 shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">3</div>
            <h3 className="mt-2 font-medium">Document Preparation</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We prepare all necessary documentation and guide you through the submission process.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
