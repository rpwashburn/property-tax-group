import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { formatCurrency, formatPercentage, pdfUtils } from '@/lib/utils';
// Note: Types are inferred from usage; explicit import not needed here

const styles = StyleSheet.create({
  tableContainer: {
    marginBottom: 20,
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    padding: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  
  tableHeaderCellLeft: {
    flex: 2,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    paddingRight: 8,
  },
  
  tableHeaderCell: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  
  tableCellLeft: {
    flex: 2,
    fontSize: 9,
    color: '#374151',
    paddingRight: 8,
    fontWeight: 'bold',
  },
  
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: '#374151',
    textAlign: 'center',
  },
});

interface ComparableSummaryTableProps {
  comparables: Array<{
    account_id?: string;
    address?: string;
    basic_info?: {
      square_footage?: number;
      year_built?: number;
      building_quality_code?: string;
    };
    financial_data?: {
      original_market_value?: number;
      adjusted_value?: number;
    };
    adjustments?: {
      total_adjustment_pct?: number;
    };
  }>;
  chunkIndex: number;
}

export function ComparableSummaryTable({ comparables, chunkIndex }: ComparableSummaryTableProps) {
  return (
    <View style={styles.tableContainer}>
      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderCellLeft}>Property Details</Text>
        {comparables.map((comp, index) => (
          <Text key={index} style={styles.tableHeaderCell}>
            Property #{chunkIndex * 4 + index + 1}
          </Text>
        ))}
      </View>

      {/* Account Row */}
      <View style={chunkIndex % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
        <Text style={styles.tableCellLeft}>Account Number</Text>
        {comparables.map((comp, index) => (
          <Text key={index} style={styles.tableCell}>
            {comp.account_id || "N/A"}
          </Text>
        ))}
      </View>

      {/* Address Row */}
      <View style={chunkIndex % 2 === 1 ? styles.tableRow : styles.tableRowAlt}>
        <Text style={styles.tableCellLeft}>Address</Text>
        {comparables.map((comp, index) => (
          <Text key={index} style={[styles.tableCell, { fontSize: 8 }]}>
            {comp.address || "N/A"}
          </Text>
        ))}
      </View>

      {/* Square Footage Row */}
      <View style={chunkIndex % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
        <Text style={styles.tableCellLeft}>Square Footage</Text>
        {comparables.map((comp, index) => (
          <Text key={index} style={styles.tableCell}>
            {comp.basic_info?.square_footage?.toLocaleString() || "N/A"} sq ft
          </Text>
        ))}
      </View>

      {/* Year Built Row */}
      <View style={chunkIndex % 2 === 1 ? styles.tableRow : styles.tableRowAlt}>
        <Text style={styles.tableCellLeft}>Year Built</Text>
        {comparables.map((comp, index) => (
          <Text key={index} style={styles.tableCell}>
            {comp.basic_info?.year_built || "N/A"}
          </Text>
        ))}
      </View>

      {/* Building Quality Row */}
      <View style={chunkIndex % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
        <Text style={styles.tableCellLeft}>Building Quality</Text>
        {comparables.map((comp, index) => (
          <Text key={index} style={styles.tableCell}>
            {comp.basic_info?.building_quality_code || "N/A"}
          </Text>
        ))}
      </View>

      {/* Original Value Row */}
      <View style={chunkIndex % 2 === 1 ? styles.tableRow : styles.tableRowAlt}>
        <Text style={styles.tableCellLeft}>Original Value</Text>
        {comparables.map((comp, index) => (
          <Text key={index} style={styles.tableCell}>
            {formatCurrency(comp.financial_data?.original_market_value)}
          </Text>
        ))}
      </View>

      {/* Adjusted Value Row */}
      <View style={chunkIndex % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
        <Text style={styles.tableCellLeft}>Adjusted Value</Text>
        {comparables.map((comp, index) => (
          <Text key={index} style={[styles.tableCell, { fontWeight: "bold", color: "#059669" }]}>
            {formatCurrency(comp.financial_data?.adjusted_value)}
          </Text>
        ))}
      </View>

      {/* Total Adjustment Row */}
      <View style={chunkIndex % 2 === 1 ? styles.tableRow : styles.tableRowAlt}>
        <Text style={styles.tableCellLeft}>Total Adjustment</Text>
        {comparables.map((comp, index) => (
          <Text
            key={index}
            style={[
              styles.tableCell,
              { fontWeight: "bold" },
              pdfUtils.getAdjustmentStyle(comp.adjustments?.total_adjustment_pct),
            ]}
          >
            {formatPercentage(comp.adjustments?.total_adjustment_pct)}
          </Text>
        ))}
      </View>
    </View>
  );
}