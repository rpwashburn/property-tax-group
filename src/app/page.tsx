"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, BarChart3, Building, Shield, CheckCircle2, ChevronRight, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { MainLayout } from "@/components/main-layout"

export default function HomePage() {
  const [currentPropertyValue, setCurrentPropertyValue] = useState("350000")
  const [potentialReduction, setPotentialReduction] = useState([15])
  const [savings, setSavings] = useState({
    currentTax: 8750,
    reduction: 15,
    newTax: 7437,
    annualSavings: 1313,
  })

  // Static tax rate for Texas (typical rate)
  const staticTaxRate = 2.5

  // Format number with commas
  const formatNumber = (num: string) => {
    return num.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  // Handle property value input
  const handlePropertyValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "")
    if (!isNaN(Number(value)) || value === "") {
      setCurrentPropertyValue(value)
    }
  }

  // Handle potential reduction slider change
  const handlePotentialReductionChange = (value: number[]) => {
    setPotentialReduction(value)
  }

  // Calculate savings
  const calculateSavings = useCallback(() => {
    const propertyValue = Number.parseFloat(currentPropertyValue.replace(/,/g, "")) || 0
    const reduction = potentialReduction[0] || 0

    const currentTax = Math.round((propertyValue * staticTaxRate) / 100)
    const newTax = Math.round(currentTax * (1 - reduction / 100))
    const annualSavings = currentTax - newTax

    setSavings({
      currentTax,
      reduction,
      newTax,
      annualSavings,
    })
  }, [currentPropertyValue, potentialReduction])

  // Calculate savings when inputs change
  useEffect(() => {
    calculateSavings()
  }, [calculateSavings])

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/50 pt-16 pb-24 md:pt-24 md:pb-32 lg:pt-32 lg:pb-40">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div className="flex flex-col gap-6" initial="hidden" animate="visible" variants={staggerChildren}>
              <motion.div variants={fadeIn}>
                <Badge className="mb-4 text-sm font-medium" variant="outline">
                  Stop Overpaying on Property Taxes
                </Badge>
              </motion.div>

              <motion.h1
                className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
                variants={fadeIn}
              >
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Protest
                </span>{" "}
                Your Property Taxes
                <span className="block text-muted-foreground mt-2">You are your best advocate</span>
              </motion.h1>

              <motion.p className="text-lg text-muted-foreground md:text-xl max-w-[600px]" variants={fadeIn}>
                Our AI-powered platform helps you fight unfair property tax assessments with data-driven comparables and
                expert guidance.
              </motion.p>

              <motion.div className="flex flex-wrap gap-3 mt-2" variants={fadeIn}>
                <Link href="/comparables">
                  <Button size="lg" className="gap-2 rounded-full px-8">
                    Start Your Protest <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/comparables">
                  <Button size="lg" variant="secondary" className="gap-2 rounded-full px-8">
                    Find Comparables <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="ghost" className="gap-2 rounded-full px-8">
                  How It Works <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>

              <motion.div className="flex items-center gap-4 mt-4" variants={fadeIn}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    <span className="font-medium">AI-Powered</span> property tax analysis
                  </span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative z-10 rounded-2xl border bg-card p-6 shadow-xl">
                <div className="absolute -right-2 -top-2">
                  <Badge className="bg-primary text-primary-foreground">Free Analysis</Badge>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Calculate Your Tax Savings</h3>
                    <p className="text-sm text-muted-foreground">
                      Discover how much you could save with FightYourTax.AI
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="property-value">Current Property Value</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="property-value"
                          value={formatNumber(currentPropertyValue)}
                          onChange={handlePropertyValueChange}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="potential-reduction">Potential Reduction</Label>
                        <span className="text-sm font-medium text-primary">{potentialReduction[0]}%</span>
                      </div>
                      <div className="px-2">
                        <Slider
                          id="potential-reduction"
                          value={potentialReduction}
                          onValueChange={handlePotentialReductionChange}
                          min={5}
                          max={50}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Conservative<br/>5-10%</span>
                        <span>Typical<br/>10-20%</span>
                        <span>Aggressive<br/>20-35%</span>
                        <span>Very Aggressive<br/>35-50%</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-muted p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax Rate (Texas Avg):</span>
                        <span className="font-medium">{staticTaxRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current Tax Bill:</span>
                        <span className="font-medium">${savings.currentTax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">With {savings.reduction}% Reduction:</span>
                        <span className="font-medium">${savings.newTax.toLocaleString()}</span>
                      </div>
                      <div className="mt-3 pt-3 border-t flex justify-between">
                        <span className="font-semibold text-green-700">Your Annual Savings:</span>
                        <span className="font-bold text-green-600 text-lg">${savings.annualSavings.toLocaleString()}</span>
                      </div>
                      {savings.annualSavings > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                          <p className="text-sm text-green-700 font-medium text-center">
                            💰 Over 10 years: ${(savings.annualSavings * 10).toLocaleString()} in savings!
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      *Based on successful protests in Texas. Individual results may vary.
                    </p>
                  </div>

                  <Link href="/comparables" className="block">
                    <Button className="w-full gap-2 rounded-full">
                      Start Your Protest <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="absolute -z-10 inset-0 blur-3xl opacity-20 bg-primary rounded-full" />
            </motion.div>
          </div>
        </div>

        {/* Background grid pattern */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </section>

      {/* Available in Texas Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col items-center justify-center gap-6">
            <p className="text-sm font-medium text-muted-foreground">SERVING HOMEOWNERS ACROSS TEXAS</p>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
              {["Houston"].map((city) => (
                <div key={city} className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{city}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <motion.div
            className="flex flex-col items-center justify-center gap-4 text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.div variants={fadeIn} className="space-y-2 max-w-3xl mx-auto">
              <Badge className="mb-4" variant="outline">
                Simple 3-Step Process
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="text-lg text-muted-foreground">
                Our guided wizard makes protesting your property taxes simple and effective.
              </p>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: 1,
                icon: Building,
                title: "Enter Property Details",
                description: "Provide basic information about your property and current assessment.",
                color: "bg-blue-500/10",
                textColor: "text-blue-500",
              },
              {
                step: 2,
                icon: BarChart3,
                title: "AI Analysis",
                description: "Our AI finds comparable properties and builds your case automatically.",
                color: "bg-primary/10",
                textColor: "text-primary",
              },
              {
                step: 3,
                icon: Shield,
                title: "Submit & Win",
                description: "We prepare and submit your protest with all supporting evidence.",
                color: "bg-green-500/10",
                textColor: "text-green-500",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
                  <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-2xl" />
                  <div className="absolute -left-12 -bottom-12 h-24 w-24 rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 blur-2xl" />

                  <CardContent className="p-6 md:p-8 flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className={cn("rounded-full p-3", item.color)}>
                        <item.icon className={cn("h-6 w-6", item.textColor)} />
                      </div>
                      <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {item.step}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/comparables">
              <Button size="lg" className="gap-2 rounded-full px-8">
                Start Your Protest <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <motion.div
            className="flex flex-col items-center justify-center gap-4 text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.div variants={fadeIn} className="space-y-2 max-w-3xl mx-auto">
              <Badge className="mb-4" variant="outline">
                Why Choose Us
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Built for Success</h2>
              <p className="text-lg text-muted-foreground">
                Our platform is designed to give you the best chance at reducing your property taxes.
              </p>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Powered Analysis",
                description:
                  "Our advanced AI analyzes thousands of comparable properties to build the strongest case for your tax reduction.",
                icon: BarChart3,
                color: "bg-blue-500/10",
                textColor: "text-blue-500",
              },
              {
                title: "Expert Guidance",
                description:
                  "Step-by-step guidance through the entire protest process, making it simple even for first-time filers.",
                icon: Shield,
                color: "bg-primary/10",
                textColor: "text-primary",
              },
              {
                title: "No Upfront Costs",
                description:
                  "Get started with our free analysis. Only pay when you're satisfied with the results we can deliver.",
                icon: DollarSign,
                color: "bg-green-500/10",
                textColor: "text-green-500",
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="h-full flex flex-col">
                  <CardContent className="flex flex-col flex-1 p-6 text-center">
                    <div className={cn("rounded-full p-3 w-fit mx-auto mb-4", benefit.color)}>
                      <benefit.icon className={cn("h-6 w-6", benefit.textColor)} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground flex-1">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-primary py-24 md:py-32">
        <div className="container mx-auto relative z-10 px-4 md:px-6 max-w-7xl">
          <motion.div
            className="flex flex-col items-center justify-center gap-8 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.div variants={fadeIn} className="space-y-4 max-w-3xl mx-auto">
              <Badge className="bg-primary-foreground text-primary mb-4">Start Saving Today</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl md:text-5xl">
                Ready to Lower Your Property Taxes?
              </h2>
              <p className="text-lg text-primary-foreground/80">
                Start your journey to lower property taxes with our AI-powered platform.
              </p>
            </motion.div>

            <motion.div variants={fadeIn} className="flex flex-wrap justify-center gap-4">
              <Link href="/comparables">
                <Button size="lg" variant="secondary" className="gap-2 rounded-full px-8">
                  Start Your Protest <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/full-report-demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 rounded-full px-8 bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Try Full Report Demo <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/purchase">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 rounded-full px-8 bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Purchase Reports <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeIn} className="flex items-center gap-2 text-primary-foreground/80">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">No payment required to start</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Background grid pattern */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </section>
    </div>
    </MainLayout>
  )
}
