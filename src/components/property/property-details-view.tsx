"use client"

import { motion } from "framer-motion"
import { PropertyHeader } from "./property-header"
import { PropertyOverview } from "./property-overview"
import { AssessmentAlert } from "./assessment-alert"
import { ActionCards } from "./action-cards"
import { CurrentAssessmentValues } from "./current-assessment-values"
import { YearOverYearComparison } from "./year-over-year-comparison"
import { PropertyDetailsGrid } from "./property-details-grid"
import { MarketInformation } from "./market-information"
import { formatCurrency, safeParseFloat } from "@/lib/utils"
import type { ApiPropertyResponse } from "@/lib/properties/types/types"

interface PropertyDetailsViewProps {
  accountId: string
  propertyData: ApiPropertyResponse
}

export function PropertyDetailsView({ accountId, propertyData }: PropertyDetailsViewProps) {
  // Calculate year-over-year changes
  const currentMarket = safeParseFloat(propertyData.currentValues.totalMarketValue)
  const priorMarket = safeParseFloat(propertyData.priorValues.totalMarketValue)
  const marketChange = currentMarket - priorMarket
  const marketPercentChange = priorMarket > 0 ? (marketChange / priorMarket) * 100 : 0

  const currentAppraised = safeParseFloat(propertyData.currentValues.totalAppraisedValue)
  const priorAppraised = safeParseFloat(propertyData.priorValues.totalAppraisedValue)
  const appraisedChange = currentAppraised - priorAppraised
  const appraisedPercentChange = priorAppraised > 0 ? (appraisedChange / priorAppraised) * 100 : 0

  const currentLand = safeParseFloat(propertyData.currentValues.landValue)
  const priorLand = safeParseFloat(propertyData.priorValues.landValue)
  const landChange = currentLand - priorLand

  const currentBuilding = safeParseFloat(propertyData.currentValues.buildingValue)
  const priorBuilding = safeParseFloat(propertyData.priorValues.buildingValue)
  const buildingChange = currentBuilding - priorBuilding

  const currentExtraFeatures = safeParseFloat(propertyData.currentValues.extraFeaturesValue)
  const priorExtraFeatures = safeParseFloat(propertyData.priorValues.extraFeaturesValue)
  const extraFeaturesChange = currentExtraFeatures - priorExtraFeatures

  const hasSignificantIncrease = appraisedChange > 0 && appraisedPercentChange > 5

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const calculatedValues = {
    currentMarket,
    priorMarket,
    marketChange,
    marketPercentChange,
    currentAppraised,
    priorAppraised,
    appraisedChange,
    appraisedPercentChange,
    currentLand,
    priorLand,
    landChange,
    currentBuilding,
    priorBuilding,
    buildingChange,
    currentExtraFeatures,
    priorExtraFeatures,
    extraFeaturesChange,
    hasSignificantIncrease,
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={staggerChildren} className="space-y-8">
            <PropertyHeader accountId={accountId} propertyData={propertyData} />

            <PropertyOverview propertyData={propertyData} />

            {hasSignificantIncrease && (
              <AssessmentAlert
                appraisedChange={appraisedChange}
                appraisedPercentChange={appraisedPercentChange}
                formatCurrency={formatCurrency}
              />
            )}

            <ActionCards
              accountId={accountId}
              hasSignificantIncrease={hasSignificantIncrease}
              appraisedPercentChange={appraisedPercentChange}
            />

            <CurrentAssessmentValues propertyData={propertyData} />

            <YearOverYearComparison propertyData={propertyData} comparisonData={calculatedValues} />

            <PropertyDetailsGrid propertyData={propertyData} />

            {propertyData.marketInfo?.marketArea1Description && <MarketInformation propertyData={propertyData} />}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
