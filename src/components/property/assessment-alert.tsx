"use client"

import { motion } from "framer-motion"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

interface AssessmentAlertProps {
  appraisedChange: number
  appraisedPercentChange: number
  formatCurrency: (value: number | string) => string
}

export function AssessmentAlert({ appraisedChange, appraisedPercentChange, formatCurrency }: AssessmentAlertProps) {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <motion.div variants={fadeIn}>
      <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
            <Badge variant="outline" className="border-orange-300 text-orange-700">
              Significant Increase Detected
            </Badge>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-orange-900">
            Your Assessment Increased by {formatCurrency(appraisedChange)} ({appraisedPercentChange.toFixed(1)}%)
          </CardTitle>
          <CardDescription className="text-base text-orange-700">
            This significant increase may warrant further analysis to ensure your assessment is fair and accurate.
          </CardDescription>
        </CardHeader>
      </Card>
    </motion.div>
  )
}
