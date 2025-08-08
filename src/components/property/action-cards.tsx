"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, ArrowRight, CheckCircle, Info, FileText } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ActionCardsProps {
  accountId: string
  hasSignificantIncrease: boolean
  appraisedPercentChange: number
}

export function ActionCards({ accountId, hasSignificantIncrease, appraisedPercentChange }: ActionCardsProps) {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <motion.div variants={fadeIn}>
      <Card className="border-2 border-primary/40 bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/80 shadow-lg">
        <CardHeader className="text-center pb-6 bg-gradient-to-r from-white/80 to-blue-50/60">
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800">
            {hasSignificantIncrease ? "Take Action on Your Assessment" : "Analyze Your Property Assessment"}
          </CardTitle>
          <CardDescription className="text-base text-slate-600 font-medium">
            Get professional insights to understand your property's assessment and explore your options.
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white/70">
          <div className="grid gap-6 md:grid-cols-2">
            <ActionCard
              title="View Comparables"
              description="Explore similar properties in your area to understand your assessment"
              icon={<BarChart3 className="h-6 w-6" />}
              features={[
                "Similar properties nearby",
                "Assessment comparisons",
                "Market trends analysis",
                "Neighborhood insights"
              ]}
              button={{
                text: "View Comparables",
                href: `/comparables/hcad/${accountId}`,
                variant: "outline"
              }}
              borderColor="border-blue-300"
              bgColor="bg-gradient-to-br from-slate-600 via-blue-600 to-slate-700"
              isHighlighted={false}
            />

            <ActionCard
              title="Get Protest Report"
              description="Professional analysis and documentation to support your property tax protest"
              icon={<FileText className="h-6 w-6" />}
              features={[
                "Market value analysis",
                "Comparable properties research", 
                "Professional documentation",
                "Ready-to-file protest materials"
              ]}
              button={{
                text: "Start Full Report Demo",
                href: `/full-report-demo?account=${accountId}&jurisdiction=HCAD`,
                variant: "secondary"
              }}
              borderColor="border-emerald-400"
              bgColor="bg-gradient-to-br from-slate-600 via-emerald-700 to-slate-700"
              isHighlighted={hasSignificantIncrease}
            />
          </div>

          {hasSignificantIncrease && <TimelineAlert appraisedPercentChange={appraisedPercentChange} />}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function ActionCard({
  title,
  description,
  icon,
  features,
  button,
  borderColor,
  bgColor,
  isHighlighted,
}: {
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
  button: { text: string; href?: string; variant: string }
  borderColor: string
  bgColor: string
  isHighlighted: boolean
}) {
  return (
    <Card className={cn("h-full border-2 shadow-lg transform hover:scale-105 transition-all duration-200", 
      borderColor, 
      bgColor,
      isHighlighted && "border-4 border-primary/70 shadow-xl"
    )}>
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">{title}</h3>
          </div>
        </div>
        <p className="text-white/90 mb-4 flex-1 font-medium">{description}</p>
        <div className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-white/90 flex-shrink-0" />
              <span className="text-white/80">{feature}</span>
            </div>
          ))}
        </div>
        {button.href ? (
          <Link href={button.href}>
            <Button 
              className={cn(
                "w-full gap-2 font-semibold",
                isHighlighted 
                  ? "bg-white text-primary hover:bg-white/90 border-2 border-white shadow-lg" 
                  : "bg-white/20 text-white hover:bg-white/30 border border-white/50"
              )} 
              variant="ghost"
            >
              {button.text} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Button 
            className={cn(
              "w-full gap-2 font-semibold",
              isHighlighted 
                ? "bg-white text-primary hover:bg-white/90 border-2 border-white shadow-lg" 
                : "bg-white/20 text-white hover:bg-white/30 border border-white/50"
            )} 
            variant="ghost"
          >
            {button.text} <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function TimelineAlert({ appraisedPercentChange }: { appraisedPercentChange: number }) {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const isPastMay = currentMonth > 4

  return (
    <div
      className={cn(
        "mt-6 p-4 border rounded-lg",
        isPastMay ? "bg-blue-50 border-blue-200" : "bg-yellow-50 border-yellow-200",
      )}
    >
      <div className="flex items-start gap-3">
        <Info className={cn("h-5 w-5 mt-0.5", isPastMay ? "text-blue-600" : "text-yellow-600")} />
        <div>
          <p className={cn("font-semibold", isPastMay ? "text-blue-800" : "text-yellow-800")}>
            {isPastMay ? "Assessment Analysis Available" : "Time-Sensitive Opportunity"}
          </p>
          <p className={cn("text-sm", isPastMay ? "text-blue-700" : "text-yellow-700")}>
            {isPastMay ? (
              <>
                With an increase of {appraisedPercentChange.toFixed(1)}%, get professional documentation for
                refinancing, insurance claims, or future planning.
              </>
            ) : (
              <>
                With an increase of {appraisedPercentChange.toFixed(1)}%, you may have grounds for analysis. Property
                tax protest deadlines are typically in late May.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
