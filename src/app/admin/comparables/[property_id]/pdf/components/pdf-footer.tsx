import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F8FAFC',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1pt solid #E2E8F0',
  },
  
  footerText: {
    fontSize: 9,
    color: '#64748B',
  },
  
  pageNumber: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: 'bold',
  },
});

interface PDFFooterProps {
  text?: string;
}

export function PDFFooter({ text = "FightYourTax.AI - Confidential Property Analysis Report" }: PDFFooterProps) {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>{text}</Text>
      <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
    </View>
  );
}