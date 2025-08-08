import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#1E293B',
    padding: 24,
    marginBottom: 0,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  headerLeft: {
    flex: 2,
  },
  
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 4,
  },
  
  headerMeta: {
    fontSize: 11,
    color: '#94A3B8',
  },
  
  logoPlaceholder: {
    width: 120,
    height: 40,
    backgroundColor: '#1E90FF',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  logoText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

interface PDFHeaderProps {
  title: string;
  subtitle: string;
  metadata?: string[];
}

export function PDFHeader({ title, subtitle, metadata = [] }: PDFHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Text style={styles.mainTitle}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {metadata.map((meta, index) => (
            <Text key={index} style={styles.headerMeta}>{meta}</Text>
          ))}
        </View>
        <View style={styles.headerRight}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>FightYourTax.AI</Text>
          </View>
        </View>
      </View>
    </View>
  );
}