import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PropertyData } from "@/lib/property-analysis/types"
import { Comparable } from "@/lib/comparables/types"
import { CheckCircle2 } from "lucide-react"

interface AiAnalysisSummaryProps {
    comparables: Comparable[]
    subjectProperty: PropertyData
  }

  export function AiAnalysisSummary({ comparables, subjectProperty }: AiAnalysisSummaryProps) {
    const parseMarketValue = (value: string | null | undefined): number => {
        if (!value) return 0
        // Ensure all non-numeric characters (except decimal point if needed) are removed.
        return parseInt(value.replace(/[^0-9]/g, ""), 10) || 0
      }
      
    const derivedData = useMemo(() => {
      const subjectMarketVal = parseMarketValue(subjectProperty.totMktVal);
      const displaySubjectMarketVal = "$" + subjectMarketVal.toLocaleString();

      let medianRecommendedValue: number | null = null;
      let displayRecommendedValue: string | null = null;
      let summaryText: string;
      let minValue: number | null = null;
      let maxValue: number | null = null;
      let displayMinValue: string | null = null;
      let displayMaxValue: string | null = null;
      let percentageDifference: number | null = null;

      if (comparables && comparables.length > 0) {
        const adjustedValues = comparables
          .map(comp => parseMarketValue(comp.adjusted_value))
          .filter(val => val > 0) // Filter out invalid or zero values
          .sort((a, b) => a - b);

        if (adjustedValues.length > 0) {
          minValue = adjustedValues[0];
          maxValue = adjustedValues[adjustedValues.length - 1];
          displayMinValue = "$" + minValue.toLocaleString();
          displayMaxValue = "$" + maxValue.toLocaleString();

          const mid = Math.floor(adjustedValues.length / 2);
          if (adjustedValues.length % 2 === 0) {
            medianRecommendedValue = (adjustedValues[mid - 1] + adjustedValues[mid]) / 2;
          } else {
            medianRecommendedValue = adjustedValues[mid];
          }
          displayRecommendedValue = "$" + medianRecommendedValue.toLocaleString();

          if (medianRecommendedValue !== null && subjectMarketVal > 0) {
            percentageDifference = ((subjectMarketVal - medianRecommendedValue) / medianRecommendedValue) * 100;
          }
        }
      }

      if (medianRecommendedValue !== null && displayRecommendedValue && minValue !== null && maxValue !== null && displayMinValue && displayMaxValue) {
        if (medianRecommendedValue < subjectMarketVal && percentageDifference !== null) {
          summaryText = `Based on the analysis of comparable properties in your neighborhood, your property appears to be overvalued. The ${comparables.length} comparable properties have adjusted values ranging from ${displayMinValue} to ${displayMaxValue}, with a median of ${displayRecommendedValue}. Your current appraised value of ${displaySubjectMarketVal} is approximately ${percentageDifference.toFixed(1)}% higher than this median. This indicates a potential for a valuation reduction through a property tax protest.`;
        } else if (medianRecommendedValue >= subjectMarketVal) {
          summaryText = `Based on the analysis of comparable properties in your neighborhood, the ${comparables.length} comparable properties have adjusted values ranging from ${displayMinValue} to ${displayMaxValue}, with a median of ${displayRecommendedValue}. Your property's current total market value is ${displaySubjectMarketVal}. This is near or above the median of comparables; review comparables carefully.`;
        } else {
           // Fallback for cases where percentageDifference might be null but other values are present
           summaryText = `Based on the median adjusted value of ${displayRecommendedValue} from ${comparables.length} comparable properties, the AI suggests a recommended market value of ${displayRecommendedValue}. Your property's current total market value is ${displaySubjectMarketVal}. Review comparables carefully.`;
        }
      } else {
        summaryText = `The AI analysis could not determine a specific recommended value from the median of comparables (insufficient data or zero values). Your property's current total market value is ${displaySubjectMarketVal}. Please review any available comparables manually.`;
      }

      return {
        summary: summaryText,
        display_recommended_value: displayRecommendedValue, // For direct display
        median_recommended_numeric: medianRecommendedValue, // For calculation
        display_subject_market_value: displaySubjectMarketVal, // For direct display
      };
    }, [comparables, subjectProperty]);

    if (!subjectProperty) {
        return null; 
    }

    let displayPotentialSavings = "N/A";
    if (derivedData.median_recommended_numeric !== null) {
      const subjectCurrentValueNum = parseMarketValue(subjectProperty.totMktVal);
      if (derivedData.median_recommended_numeric < subjectCurrentValueNum) {
        const savings = subjectCurrentValueNum - derivedData.median_recommended_numeric;
        displayPotentialSavings = "$" + savings.toLocaleString();
      }
    }

    return (
        <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{derivedData.summary}</p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-md border border-green-200">
              <div className="text-xs text-muted-foreground mb-1">Your Current Value</div>
              <div className="text-lg font-semibold text-red-600">
                {derivedData.display_subject_market_value}
              </div>
            </div>

            <div className="bg-white p-3 rounded-md border border-green-200">
              <div className="text-xs text-muted-foreground mb-1">Recommended Value (Median Comp)</div>
              <div className="text-lg font-semibold text-green-600">
                {derivedData.display_recommended_value || "N/A"}
              </div>
            </div>

            <div className="bg-white p-3 rounded-md border border-green-200">
              <div className="text-xs text-muted-foreground mb-1">Potential Savings</div>
              <div className="text-lg font-semibold text-green-600">
                {displayPotentialSavings}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }