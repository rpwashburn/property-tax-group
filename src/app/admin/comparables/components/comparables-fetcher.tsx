import { getComparablesWithParams } from '@/lib/comparables/server';
import { ComparablesView } from './comparables-view';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ComparablesFetcherProps {
  subjectAccountId: string;
  stateClass: string;
  neighborhoodCode: string;
  buildingQualityCode: string;
  gradeAdjustment: string;
}

export async function ComparablesFetcher({
  subjectAccountId,
  stateClass,
  neighborhoodCode,
  buildingQualityCode,
  gradeAdjustment,
}: ComparablesFetcherProps) {
  try {
    const comparablesData = await getComparablesWithParams(
      subjectAccountId,
      stateClass,
      neighborhoodCode,
      buildingQualityCode,
      gradeAdjustment
    );

    if (!comparablesData || comparablesData.comparables.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No comparable properties found for the specified criteria.
          </AlertDescription>
        </Alert>
      );
    }

    return <ComparablesView comparablesData={comparablesData} />;
  } catch (error) {
    console.error('Error fetching comparables:', error);
    
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to fetch comparables data: {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }
} 