import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { formatCurrency } from '@/lib/utils';
import type { ApiPropertyResponse, DetailedComparablesResponse } from '@/lib/properties/types/types';

const styles = StyleSheet.create({
  executiveSummary: {
    backgroundColor: '#F8FAFC',
    border: '1pt solid #E2E8F0',
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
  },
  
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  
  summaryCard: {
    backgroundColor: '#FFFFFF',
    border: '1pt solid #E2E8F0',
    borderRadius: 6,
    padding: 12,
    flex: 1,
    alignItems: 'center',
  },
  
  summaryLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 6,
    textAlign: 'center',
  },
  
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
  },
  
  summaryValueLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    textAlign: 'center',
  },
});

interface AnalysisSummaryProps {
  property: ApiPropertyResponse;
  comparablesData: DetailedComparablesResponse;
}

export function AnalysisSummary({ property, comparablesData }: AnalysisSummaryProps) {
  return (
    <View style={styles.executiveSummary}>
      <Text style={styles.summaryTitle}>Analysis Summary</Text>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Subject Property Value</Text>
          <Text style={styles.summaryValueLarge}>
            {formatCurrency(property.currentValues?.totalMarketValue)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Comparables Analyzed</Text>
          <Text style={styles.summaryValue}>{comparablesData.original_total_count || 'N/A'}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Comparables Chosen</Text>
          <Text style={styles.summaryValue}>{comparablesData.total_count}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Median Comparable</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(comparablesData.median_comparable_value)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Market Variance</Text>
          <Text
            style={[
              styles.summaryValue,
              comparablesData.median_comparable_value && property.currentValues?.totalMarketValue
                ? Number(property.currentValues.totalMarketValue) >
                  Number(comparablesData.median_comparable_value)
                  ? { color: '#DC2626' }
                  : { color: '#059669' }
                : {},
            ]}
          >
            {comparablesData.median_comparable_value && property.currentValues?.totalMarketValue
              ? `${(
                  ((Number(property.currentValues.totalMarketValue) -
                    Number(comparablesData.median_comparable_value)) /
                    Number(comparablesData.median_comparable_value)) *
                  100
                ).toFixed(1)}%`
              : 'N/A'}
          </Text>
        </View>
      </View>
    </View>
  );
}