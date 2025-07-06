import { getPropertySummary } from '@/lib/properties/server';
import { PropertySummaryView } from './property-summary-view';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface PropertySummaryFetcherProps {
  accountId: string;
}

export async function PropertySummaryFetcher({ accountId }: PropertySummaryFetcherProps) {
  try {
    const propertySummary = await getPropertySummary(accountId, {
      cache: true,
      revalidate: 300 // 5 minutes
    });

    if (!propertySummary) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Property not found for account ID: {accountId}
          </AlertDescription>
        </Alert>
      );
    }

    return <PropertySummaryView propertySummary={propertySummary} />;
  } catch (error) {
    console.error('Error fetching property summary:', error);
    
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to fetch property data: {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }
} 