"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, DollarSign, Target, Calendar, BarChart3, TrendingUp, X, ChevronRight, Sparkles } from "lucide-react"
import { formatCurrency, safeParseFloat } from "@/lib/utils"
import type { PropertiesSearchSummary } from "@/lib/comparables/server"

interface InteractiveSummaryProps {
  summary: PropertiesSearchSummary
}

export function InteractiveSummary({ summary }: InteractiveSummaryProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const summaryCards = [
    {
      id: "properties",
      icon: Building2,
      title: "Properties Found",
      value: summary.totalProperties.toLocaleString(),
      subtitle: "In neighborhood",
      color: "blue",
      details: {
        title: "Property Database",
        description: "Complete analysis of all properties in your neighborhood",
        stats: [
          { label: "Total Properties", value: summary.totalProperties.toLocaleString() },
          { label: "Quality Grade A", value: (summary.qualityDistribution?.A || 0).toString() },
          { label: "Quality Grade B", value: (summary.qualityDistribution?.B || 0).toString() },
          { label: "Quality Grade C", value: (summary.qualityDistribution?.C || 0).toString() },
          { label: "Good Condition", value: (summary.conditionDistribution?.Good || 0).toString() },
          { label: "Average Condition", value: (summary.conditionDistribution?.Average || 0).toString() },
        ],
      },
    },
    (() => {
      const avgValue = safeParseFloat(summary.avgAssessedValue)
      const medianValue = safeParseFloat(summary.medianAssessedValue)
      const isAvgLower = avgValue <= medianValue
      
      return {
        id: "values",
        icon: DollarSign,
        title: isAvgLower ? "Average Assessment" : "Median Assessment",
        value: formatCurrency(isAvgLower ? avgValue : medianValue),
        subtitle: isAvgLower 
          ? `Median: ${formatCurrency(medianValue)}`
          : `Average: ${formatCurrency(avgValue)}`,
        color: "green",
        details: {
          title: "Property Values Analysis",
          description: "Comprehensive breakdown of neighborhood property assessments",
          stats: [
            { label: "Average Assessment", value: formatCurrency(avgValue) },
            { label: "Median Assessment", value: formatCurrency(medianValue) },
            { label: "Lower Value", value: formatCurrency(Math.min(avgValue, medianValue)) },
            { label: "Lowest Assessment", value: formatCurrency(safeParseFloat(summary.minAssessedValue)) },
            { label: "Highest Assessment", value: formatCurrency(safeParseFloat(summary.maxAssessedValue)) },
            { label: "Average Land Value", value: formatCurrency(safeParseFloat(summary.avgLandValue)) },
            { label: "Median Land Value", value: formatCurrency(safeParseFloat(summary.medianLandValue)) },
          ],
        },
      }
    })(),
    {
      id: "pricing",
      icon: Target,
      title: "Price Per Sq Ft",
      value: `$${summary.avgValuePerSqFt}`,
      subtitle: `Median: $${summary.medianValuePerSqFt}`,
      color: "purple",
      details: {
        title: "Market Pricing Analysis",
        description: "Per square foot pricing trends and property size comparisons",
        stats: [
          { label: "Average $/Sq Ft", value: `$${summary.avgValuePerSqFt}` },
          { label: "Median $/Sq Ft", value: `$${summary.medianValuePerSqFt}` },
          {
            label: "Average Size",
            value: `${Math.round(safeParseFloat(summary.avgSquareFeet)).toLocaleString()} sq ft`,
          },
          {
            label: "Median Size",
            value: `${Math.round(safeParseFloat(summary.medianSquareFeet)).toLocaleString()} sq ft`,
          },
          { label: "Average Land Area", value: `${summary.avgLandArea} acres` },
          { label: "Price Range", value: `${formatCurrency(safeParseFloat(summary.minAssessedValue))} - ${formatCurrency(safeParseFloat(summary.maxAssessedValue))}` },
        ],
      },
    },
    {
      id: "age",
      icon: Calendar,
      title: "Average Year Built",
      value: summary.avgYearBuilt.toString(),
      subtitle: `Median: ${summary.medianYearBuilt}`,
      color: "orange",
      details: {
        title: "Property Age Distribution",
        description: "Age analysis and construction timeline of neighborhood properties",
        stats: [
          { label: "Average Year Built", value: summary.avgYearBuilt.toString() },
          { label: "Median Year Built", value: summary.medianYearBuilt.toString() },
          { label: "Average Age", value: `${new Date().getFullYear() - summary.avgYearBuilt} years` },
          { label: "Median Age", value: `${new Date().getFullYear() - summary.medianYearBuilt} years` },
          { label: "Newest Era", value: summary.avgYearBuilt > 2000 ? "2000s+" : "1990s" },
          { label: "Construction Period", value: `${Math.min(summary.avgYearBuilt, summary.medianYearBuilt)}s era` },
        ],
      },
    },
  ]

  const colorClasses = {
    blue: {
      card: "from-blue-50 to-cyan-50 border-blue-200",
      icon: "text-blue-600 bg-blue-100",
      text: "text-blue-900",
      subtitle: "text-blue-600",
      expanded: "from-blue-500 to-cyan-500",
    },
    green: {
      card: "from-green-50 to-emerald-50 border-green-200",
      icon: "text-green-600 bg-green-100",
      text: "text-green-900",
      subtitle: "text-green-600",
      expanded: "from-green-500 to-emerald-500",
    },
    purple: {
      card: "from-purple-50 to-pink-50 border-purple-200",
      icon: "text-purple-600 bg-purple-100",
      text: "text-purple-900",
      subtitle: "text-purple-600",
      expanded: "from-purple-500 to-pink-500",
    },
    orange: {
      card: "from-orange-50 to-red-50 border-orange-200",
      icon: "text-orange-600 bg-orange-100",
      text: "text-orange-900",
      subtitle: "text-orange-600",
      expanded: "from-orange-500 to-red-500",
    },
  }

  // Calculate condition percentages for the summary
  const totalConditionProperties = Object.values(summary.conditionDistribution || {}).reduce((a, b) => a + b, 0)
  const goodConditionCount = (summary.conditionDistribution?.Good || 0) + (summary.conditionDistribution?.['Very Good'] || 0) + (summary.conditionDistribution?.Excellent || 0)
  const goodConditionPercentage = totalConditionProperties > 0 ? Math.round((goodConditionCount / totalConditionProperties) * 100) : 0

  return (
    <div className="relative">
      {/* Backdrop blur when expanded */}
      {expandedCard && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setExpandedCard(null)}
        />
      )}

      {/* Floating hint */}
      <div className="text-center mb-6">
        <Badge variant="outline" className="gap-2 bg-white/80 backdrop-blur-sm">
          <Sparkles className="h-3 w-3" />
          Click any card to explore detailed analysis
        </Badge>
      </div>

      {/* Interactive Cards Grid */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4 relative">
        {summaryCards.map((card) => {
          const Icon = card.icon
          const colors = colorClasses[card.color as keyof typeof colorClasses]
          const isExpanded = expandedCard === card.id
          const isHovered = hoveredCard === card.id

          return (
            <div key={card.id} className="relative">
              <Card
                className={`
                  cursor-pointer transition-all duration-300 transform
                  ${isExpanded ? "fixed inset-2 md:inset-4 z-50 scale-100 max-h-screen" : "relative z-10"}
                  ${isHovered && !isExpanded ? "scale-105 shadow-lg" : ""}
                  ${isExpanded ? "shadow-2xl" : "shadow-md hover:shadow-lg"}
                  bg-gradient-to-br ${colors.card}
                  ${isExpanded ? "overflow-auto" : "overflow-hidden"}
                `}
                onMouseEnter={() => !isExpanded && setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => setExpandedCard(isExpanded ? null : card.id)}
              >
                {/* Compact View */}
                {!isExpanded && (
                  <CardContent className="p-3 md:p-6 text-center relative">
                    <div
                      className={`h-8 w-8 md:h-12 md:w-12 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 ${colors.icon}`}
                    >
                      <Icon className="h-4 w-4 md:h-6 md:w-6" />
                    </div>
                    <div className={`text-lg md:text-2xl font-bold ${colors.text} mb-1`}>{card.value}</div>
                    <div className={`text-xs md:text-sm ${colors.text} mb-1 md:mb-2`}>{card.title}</div>
                    <div className={`text-xs ${colors.subtitle}`}>{card.subtitle}</div>

                    {/* Hover indicator */}
                    <div
                      className={`
                      absolute bottom-2 right-2 transition-all duration-200
                      ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"}
                    `}
                    >
                      <ChevronRight className={`h-4 w-4 ${colors.subtitle}`} />
                    </div>
                  </CardContent>
                )}

                {/* Expanded View */}
                {isExpanded && (
                  <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className={`bg-gradient-to-r ${colors.expanded} text-white p-4 md:p-6`}>
                      <div className="flex items-start md:items-center justify-between gap-3">
                        <div className="flex items-start md:items-center gap-3 min-w-0 flex-1">
                          <div className="h-10 w-10 md:h-12 md:w-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 md:h-6 md:w-6" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-lg md:text-xl font-bold">{card.details.title}</h3>
                            <p className="text-white/80 text-xs md:text-sm leading-snug">{card.details.description}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedCard(null)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 md:p-6 bg-white">
                      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2">
                        {card.details.stats.map((stat, index) => (
                          <div
                            key={index}
                            className="p-3 md:p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                          >
                            <div className="text-xs md:text-sm text-slate-600 mb-1">{stat.label}</div>
                            <div className="text-base md:text-lg font-semibold text-slate-900 break-all">{stat.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Additional insights */}
                      <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2 md:gap-3">
                          <div className="h-7 w-7 md:h-8 md:w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <BarChart3 className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-blue-900 mb-1 text-sm md:text-base">Professional Analysis Available</h4>
                            <p className="text-xs md:text-sm text-blue-800 leading-relaxed">
                              This data represents the raw neighborhood information. Professional analysis will
                              determine which properties are truly comparable to yours for appeal purposes.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )
        })}
      </div>

      {/* Summary insight when no card is expanded */}
      {!expandedCard && (
        <div className="mt-6">
          <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  <TrendingUp className="h-4 w-4" />
                  Market Overview Available
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {summary.totalProperties} Properties • ${summary.avgValuePerSqFt}/sq ft Average • {goodConditionPercentage}% Good+ Condition
                </h3>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  Professional analysis will determine which properties are truly comparable and identify potential
                  assessment discrepancies for your appeal.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 