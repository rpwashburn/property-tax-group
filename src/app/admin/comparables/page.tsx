import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PropertySummaryFetcher } from './components/property-summary-fetcher';

function LoadingSkeleton() {
  return (
    <div className="container max-w-7xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Comparables Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Loading property summary...
        </p>
      </div>
      <div className="space-y-4">
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

export default async function AdminComparablesPage({ searchParams }: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const accountId = resolvedSearchParams?.accountId as string | undefined;

  return (
    <div className="container max-w-7xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Comparables Analysis</h1>
        <p className="text-muted-foreground mt-2">
          View property summary and find comparable properties using our backend API
        </p>
      </div>

      {/* Property Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Property Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form method="GET" action="/admin/comparables" className="flex items-end gap-4">
            <div className="grow space-y-1">
              <Label htmlFor="accountIdInput">Property Account ID</Label>
              <Input
                id="accountIdInput"
                name="accountId"
                placeholder="Enter account ID (e.g., 1234567890123)"
                defaultValue={accountId || ''}
                maxLength={13}
                pattern="[0-9]{11,13}"
                required
              />
            </div>
            <Button type="submit">Load Property</Button>
          </form>
        </CardContent>
      </Card>



      {/* Property Summary Component */}
      {accountId ? (
        <Suspense fallback={<LoadingSkeleton />}>
          <PropertySummaryFetcher accountId={accountId} />
        </Suspense>
      ) : (
        <Card>
          <CardContent className="text-center py-10">
            <p className="text-muted-foreground">
              Enter a Property Account ID above to load the subject property and get comparables.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

