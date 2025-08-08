"use client"

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatCurrency } from '@/lib/utils';
import type { ApiPropertyResponse, DetailedComparablesResponse } from '@/lib/properties/types/types';
import { 
  PDFHeader, 
  PDFFooter, 
  AnalysisSummary, 
  ComparableSummaryTable, 
  DetailedAnalysisContent 
} from './components';

const styles = StyleSheet.create({
  // Base page styles
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  
  // Content Container
  contentContainer: {
    padding: 16,
    flex: 1,
  },
  
  // Subject Property Details (keeping this as it's not in components yet)
  section: {
    backgroundColor: '#FFFFFF',
    border: '1pt solid #E2E8F0',
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
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
});

interface ComparablesPDFDocumentProps {
  property: ApiPropertyResponse;
  comparablesData: DetailedComparablesResponse;
}

export function ComparablesPDFDocument({ property, comparablesData }: ComparablesPDFDocumentProps) {
  const comparables = comparablesData.comparables || [];
  const sortedComparables = [...comparables].sort(
    (a, b) => (b.financial_data?.adjusted_value || 0) - (a.financial_data?.adjusted_value || 0),
  );

  const comparableChunks = [];
  for (let i = 0; i < sortedComparables.length; i += 4) {
    comparableChunks.push(sortedComparables.slice(i, i + 4));
  }

  return (
    <Document>
      {/* Analysis Summary Page */}
      <Page size="A4" orientation="landscape" style={styles.page}>
        <PDFHeader 
          title="Property Comparables Analysis"
          subtitle="Comprehensive Market Valuation Report"
          metadata={[
            `Account: ${property.accountId}`,
            `Generated: ${new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
            })}`
          ]}
        />

        <View style={styles.contentContainer}>
          <AnalysisSummary property={property} comparablesData={comparablesData} />

          {/* Subject Property Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>1</Text>
              <Text style={styles.sectionTitle}>Subject Property Details</Text>
            </View>
            <View style={styles.propertyGrid}>
              <View style={styles.propertyField}>
                <Text style={styles.fieldLabel}>Property Address</Text>
                <Text style={styles.fieldValue}>{property.address?.formattedAddress || "N/A"}</Text>
              </View>
              <View style={styles.propertyField}>
                <Text style={styles.fieldLabel}>Market Value</Text>
                <Text style={styles.fieldValue}>{formatCurrency(property.currentValues?.totalMarketValue)}</Text>
              </View>
              <View style={styles.propertyField}>
                <Text style={styles.fieldLabel}>Building Area</Text>
                <Text style={styles.fieldValue}>
                  {property.characteristics?.buildingArea ? 
                    `${Number(property.characteristics.buildingArea).toLocaleString()} sq ft` : 
                    "N/A"
                  }
                </Text>
              </View>
              <View style={styles.propertyField}>
                <Text style={styles.fieldLabel}>Year Built</Text>
                <Text style={styles.fieldValue}>{property.buildings[0]?.yearBuilt || "N/A"}</Text>
              </View>
              <View style={styles.propertyField}>
                <Text style={styles.fieldLabel}>Building Quality</Text>
                <Text style={styles.fieldValue}>{property.buildings[0]?.buildingQuality || "N/A"}</Text>
              </View>
              <View style={styles.propertyField}>
                <Text style={styles.fieldLabel}>Neighborhood</Text>
                <Text style={styles.fieldValue}>{property.classification?.neighborhoodCode || "N/A"}</Text>
              </View>
            </View>
          </View>
        </View>

        <PDFFooter />
      </Page>

      {/* Comparables Summary Table Pages */}
      {comparableChunks.map((chunk, chunkIndex) => (
        <Page key={chunkIndex} size="A4" orientation="landscape" style={styles.page}>
          <PDFHeader 
            title="Comparables Summary"
            subtitle={`Properties ${chunkIndex * 4 + 1} - ${Math.min((chunkIndex + 1) * 4, sortedComparables.length)} of ${sortedComparables.length}`}
          />

          <View style={styles.contentContainer}>
            <ComparableSummaryTable comparables={chunk} chunkIndex={chunkIndex} />
          </View>

          <PDFFooter />
        </Page>
      ))}

      {/* Detailed Analysis Pages */}
      {sortedComparables.map((comp, index) => (
        <Page key={comp.account_id || index} size="A4" orientation="landscape" style={styles.page}>
          <PDFHeader 
            title={comp.address || `Account ${comp.account_id}`}
            subtitle={`Account: ${comp.account_id} | Comparable #${index + 1}`}
          />

          <DetailedAnalysisContent comparable={comp} index={index} />

          <PDFFooter />
        </Page>
      ))}
    </Document>
  );
}