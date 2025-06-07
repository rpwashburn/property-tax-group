import Link from "next/link"
import { ArrowRight, BarChart3, Building, Calculator, CheckCircle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted pt-16 md:pt-24 lg:pt-32">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col items-center justify-center gap-4 text-center md:gap-10">
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                Stop Overpaying on Property Taxes
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="text-primary">Protest</span> Your Property Taxes
                <span className="block text-muted-foreground">Without The Headache</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
                Our AI-powered platform helps you fight unfair property tax assessments with data-driven comparables and
                expert guidance.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
              <Link href="/search">
                <Button size="lg" className="gap-1 rounded-full px-8">
                  Start Your Protest <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-1 rounded-full px-8">
                How It Works
              </Button>
              <Link href="/hello">
                <Button size="lg" variant="outline" className="gap-1 rounded-full px-8">
                  API Demo <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="stats-container flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>93% Success Rate</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>$3,200 Average Savings</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>No Win, No Fee</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="space-y-2 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">
                Our guided wizard makes protesting your property taxes simple and effective.
              </p>
            </div>
            <div className="w-full max-w-6xl mx-auto">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12 mt-8">
                <div className="process-card group relative flex flex-col items-center rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md mx-auto max-w-sm">
                  <div className="process-step absolute -top-5 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    1
                  </div>
                  <div className="mb-4 mt-4 rounded-full bg-primary/10 p-3">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Enter Property Details</h3>
                  <p className="text-center text-muted-foreground">
                    Provide basic information about your property and current assessment.
                  </p>
                </div>
                <div className="process-card group relative flex flex-col items-center rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md mx-auto max-w-sm">
                  <div className="process-step absolute -top-5 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    2
                  </div>
                  <div className="mb-4 mt-4 rounded-full bg-primary/10 p-3">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">AI Analysis</h3>
                  <p className="text-center text-muted-foreground">
                    Our AI finds comparable properties and builds your case automatically.
                  </p>
                </div>
                <div className="process-card group relative flex flex-col items-center rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md mx-auto max-w-sm">
                  <div className="process-step absolute -top-5 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    3
                  </div>
                  <div className="mb-4 mt-4 rounded-full bg-primary/10 p-3">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Submit & Win</h3>
                  <p className="text-center text-muted-foreground">
                    We prepare and submit your protest with all supporting evidence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Savings Calculator */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="space-y-2 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Calculate Your Savings</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">
                See how much you could save by protesting your property taxes.
              </p>
            </div>
            <div className="calculator-card mt-8 w-full max-w-4xl mx-auto rounded-xl border bg-card p-6 shadow-lg">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Current Property Value
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <input
                        type="text"
                        placeholder="350,000"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-8 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Tax Rate (%)
                    </label>
                    <input
                      type="text"
                      placeholder="2.5"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <Button className="w-full gap-2 rounded-full">
                    <Calculator className="h-4 w-4" /> Calculate Savings
                  </Button>
                </div>
                <div className="flex-1 rounded-xl bg-primary/5 p-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Potential Savings</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Tax Bill:</span>
                        <span className="font-medium">$8,750</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated Reduction:</span>
                        <span className="font-medium">15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">New Tax Bill:</span>
                        <span className="font-medium">$7,437</span>
                      </div>
                      <div className="mt-4 flex justify-between border-t pt-4">
                        <span className="text-lg font-bold">Annual Savings:</span>
                        <span className="text-lg font-bold text-primary">$1,313</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="space-y-2 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Success Stories</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">
                See what our customers are saying about their property tax savings.
              </p>
            </div>
            <div className="w-full max-w-6xl mx-auto">
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                {[
                  {
                    name: "Sarah Johnson",
                    location: "Austin, TX",
                    quote:
                      "I saved over $2,800 on my property taxes this year! The process was so simple and the AI found comparable properties I never would have discovered on my own.",
                    savings: "$2,800",
                  },
                  {
                    name: "Michael Rodriguez",
                    location: "Houston, TX",
                    quote:
                      "After trying to protest on my own for years with minimal success, I used this service and got a 22% reduction in my assessed value. Worth every penny!",
                    savings: "$3,450",
                  },
                  {
                    name: "Jennifer Williams",
                    location: "Dallas, TX",
                    quote:
                      "The step-by-step wizard made the process so easy. I was nervous about protesting my taxes, but the AI did all the hard work and I saved thousands.",
                    savings: "$4,120",
                  },
                ].map((testimonial, index) => (
                  <div
                    key={index}
                    className="testimonial-card flex flex-col rounded-xl border bg-card p-6 text-card-foreground shadow-sm mx-auto max-w-sm w-full"
                  >
                    <div className="mb-4 flex items-center gap-4">
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-primary/10">
                        <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary">
                          {testimonial.name.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold">{testimonial.name}</h3>
                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </div>
                    <p className="flex-1 text-muted-foreground">&quot;{testimonial.quote}&quot;</p>
                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                      <span className="text-sm font-medium">Annual Savings:</span>
                      <span className="font-bold text-primary">{testimonial.savings}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-primary py-16 md:py-24">
        <div className="container mx-auto relative z-10 px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="space-y-2 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter text-primary-foreground sm:text-4xl md:text-5xl">
                Ready to Lower Your Property Taxes?
              </h2>
              <p className="mx-auto max-w-[700px] text-primary-foreground/80">
                Join thousands of homeowners who have successfully reduced their property tax burden.
              </p>
            </div>
            <div className="mt-6">
              <Button size="lg" variant="secondary" className="gap-1 rounded-full px-8">
                Start Your Protest Now <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-4 text-sm text-primary-foreground/70">
              No win, no fee. You only pay if we save you money.
            </p>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </section>
    </div>
  )
}
