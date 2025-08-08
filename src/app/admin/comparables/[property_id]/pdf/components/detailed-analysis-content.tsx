import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { formatCurrency, formatPercentage, pdfUtils } from '@/lib/utils';

const styles = StyleSheet.create({
  contentContainer: {
    padding: 12,
    flex: 1,
  },
  
  // Financial Summary Card
  financialSummaryCard: {
    backgroundColor: '#F8FAFC',
    border: '1pt solid #E2E8F0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  financialSummaryLeft: {
    flex: 2,
  },
  
  financialSummaryRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  
  financialMainValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 3,
  },
  
  financialSubValue: {
    fontSize: 10,
    color: '#64748B',
  },
  
  financialAdjustment: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  
  financialPerSqft: {
    fontSize: 12,
    color: '#64748B',
  },
  
  // Layout helpers
  horizontalLayout: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  
  halfWidth: {
    flex: 1,
  },
  
  // Section styles
  sectionCompact: {
    backgroundColor: '#FFFFFF',
    border: '1pt solid #E2E8F0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  
  sectionNumber: {
    width: 24,
    height: 24,
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    borderRadius: 12,
    lineHeight: 24,
    marginRight: 8,
  },
  
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  
  // Property characteristics grid
  propertyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  propertyField: {
    width: '48%',
    marginBottom: 8,
  },
  
  fieldLabel: {
    fontSize: 9,
    color: '#64748B',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  
  fieldValue: {
    fontSize: 10,
    color: '#374151',
  },
  
  // Key adjustments
  keyAdjustmentsContainer: {
    gap: 6,
  },
  
  keyAdjustmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  
  keyAdjustmentItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 6,
    borderRadius: 3,
    border: '1pt solid #E2E8F0',
  },
  
  keyAdjustmentLabel: {
    fontSize: 9,
    color: '#64748B',
    marginBottom: 2,
  },
  
  keyAdjustmentValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  totalAdjustmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  
  totalAdjustmentLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
  },
  
  totalAdjustmentValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Analysis text
  analysisContainer: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 4,
    border: '1pt solid #E2E8F0',
  },
  
  analysisText: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
  },
});

interface DetailedAnalysisContentProps {
  comparable: {
    financial_data?: {
      adjusted_value?: number;
      original_market_value?: number;
      adjusted_price_per_sqft?: number;
    };
    basic_info?: {
      square_footage?: number;
      year_built?: number;
      building_quality?: string;
      building_condition?: string;
      state_class?: string;
      neighborhood_code?: string;
    };
    adjustments?: {
      total_adjustment_pct?: number;
      size_adjustment_pct?: number;
      age_adjustment_pct?: number;
      features_adjustment_pct?: number;
      land_adjustment_pct?: number;
    };
    analysis?: {
      protest_justification?: {
        market_argument?: string;
        summary?: string;
        market_context?: string;
        confidence_level?: string;
      };
    };
  };
  index: number;
}

export function DetailedAnalysisContent({ comparable: comp }: DetailedAnalysisContentProps) {
  return (
    <View style={styles.contentContainer}>
      {/* Financial Summary Card */}
      <View style={styles.financialSummaryCard}>
        <View style={styles.financialSummaryLeft}>
          <Text style={styles.financialMainValue}>
            {formatCurrency(comp.financial_data?.adjusted_value)}
          </Text>
          <Text style={styles.financialSubValue}>
            Original Value: {formatCurrency(comp.financial_data?.original_market_value)}
          </Text>
        </View>
        <View style={styles.financialSummaryRight}>
          <Text
            style={[
              styles.financialAdjustment,
              pdfUtils.getAdjustmentStyle(comp.adjustments?.total_adjustment_pct),
            ]}
          >
            {formatPercentage(comp.adjustments?.total_adjustment_pct)} Total Adj.
          </Text>
          <Text style={styles.financialPerSqft}>
            {formatCurrency(comp.financial_data?.adjusted_price_per_sqft)}/sq ft
          </Text>
        </View>
      </View>

      {/* Property Characteristics and Key Adjustments Side by Side */}
      <View style={styles.horizontalLayout}>
        {/* Property Characteristics */}
        <View style={styles.halfWidth}>
          <View style={styles.sectionCompact}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>1</Text>
              <Text style={styles.sectionTitle}>Property Characteristics</Text>
            </View>
            <View style={styles.propertyGrid}>
              <View style={styles.propertyField}>
                <Text style={styles.fieldLabel}>Square Footage</Text>
                <Text style={styles.fieldValue}>
                  {comp.basic_info?.square_footage?.toLocaleString() || "N/A"} sq ft
                </Text>
              </View>
              <View style={styles.propertyField}>
                <Text style={styles.fieldLabel}>Year Built</Text>
                <Text style={styles.fieldValue}>{comp.basic_info?.year_built || "N/A"}</Text>
              </View>
              <View style={styles.propertyField}>
                <Text style={styles.fieldLabel}>Building Quality</Text>
                <Text style={styles.fieldValue}>{comp.basic_info?.building_quality || "N/A"}</Text>
              </View>
              <View style={styles.propertyField}>
                <Text style={styles.fieldLabel}>Condition</Text>
                <Text style={styles.fieldValue}>{comp.basic_info?.building_condition || "N/A"}</Text>
              </View>
              <View style={styles.propertyField}>
                <Text style={styles.fieldLabel}>State Class</Text>
                <Text style={styles.fieldValue}>{comp.basic_info?.state_class || "N/A"}</Text>
              </View>
              <View style={styles.propertyField}>
                <Text style={styles.fieldLabel}>Neighborhood</Text>
                <Text style={styles.fieldValue}>{comp.basic_info?.neighborhood_code || "N/A"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Key Adjustments */}
        <View style={styles.halfWidth}>
          <View style={styles.sectionCompact}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>2</Text>
              <Text style={styles.sectionTitle}>Key Valuation Adjustments</Text>
            </View>
            <View style={styles.keyAdjustmentsContainer}>
              <View style={styles.keyAdjustmentsGrid}>
                {/* Only show significant adjustments (> 1%) */}
                {Math.abs(comp.adjustments?.size_adjustment_pct || 0) > 1 && (
                  <View style={styles.keyAdjustmentItem}>
                    <Text style={styles.keyAdjustmentLabel}>Size Adjustment</Text>
                    <Text
                      style={[
                        styles.keyAdjustmentValue,
                        pdfUtils.getAdjustmentStyle(comp.adjustments?.size_adjustment_pct),
                      ]}
                    >
                      {formatPercentage(comp.adjustments?.size_adjustment_pct)}
                    </Text>
                  </View>
                )}
                
                {Math.abs(comp.adjustments?.age_adjustment_pct || 0) > 1 && (
                  <View style={styles.keyAdjustmentItem}>
                    <Text style={styles.keyAdjustmentLabel}>Age Adjustment</Text>
                    <Text
                      style={[
                        styles.keyAdjustmentValue,
                        pdfUtils.getAdjustmentStyle(comp.adjustments?.age_adjustment_pct),
                      ]}
                    >
                      {formatPercentage(comp.adjustments?.age_adjustment_pct)}
                    </Text>
                  </View>
                )}
                
                {Math.abs(comp.adjustments?.features_adjustment_pct || 0) > 1 && (
                  <View style={styles.keyAdjustmentItem}>
                    <Text style={styles.keyAdjustmentLabel}>Features</Text>
                    <Text
                      style={[
                        styles.keyAdjustmentValue,
                        pdfUtils.getAdjustmentStyle(comp.adjustments?.features_adjustment_pct),
                      ]}
                    >
                      {formatPercentage(comp.adjustments?.features_adjustment_pct)}
                    </Text>
                  </View>
                )}
                
                {Math.abs(comp.adjustments?.land_adjustment_pct || 0) > 1 && (
                  <View style={styles.keyAdjustmentItem}>
                    <Text style={styles.keyAdjustmentLabel}>Land</Text>
                    <Text
                      style={[
                        styles.keyAdjustmentValue,
                        pdfUtils.getAdjustmentStyle(comp.adjustments?.land_adjustment_pct),
                      ]}
                    >
                      {formatPercentage(comp.adjustments?.land_adjustment_pct)}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.totalAdjustmentRow}>
                <Text style={styles.totalAdjustmentLabel}>Net Adjustment Impact</Text>
                <Text
                  style={[
                    styles.totalAdjustmentValue,
                    pdfUtils.getAdjustmentStyle(comp.adjustments?.total_adjustment_pct),
                  ]}
                >
                  {formatPercentage(comp.adjustments?.total_adjustment_pct)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Market Analysis (if available) */}
      {(comp.analysis?.protest_justification?.market_argument || 
        comp.analysis?.protest_justification?.summary || 
        comp.analysis?.protest_justification?.market_context) && (
        <View style={styles.sectionCompact}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>3</Text>
            <Text style={styles.sectionTitle}>Market Analysis</Text>
          </View>
          
          <View style={styles.analysisContainer}>
            <Text style={styles.analysisText}>
              {comp.analysis.protest_justification.market_argument || 
               comp.analysis.protest_justification.summary || 
               comp.analysis.protest_justification.market_context ||
               "Analysis not available"}
            </Text>
            
            {/* Confidence Level inline */}
            {comp.analysis.protest_justification.confidence_level && (
              <Text style={[styles.analysisText, { fontWeight: 'bold', marginTop: 4, fontSize: 9 }]}>
                Confidence: {comp.analysis.protest_justification.confidence_level}
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}