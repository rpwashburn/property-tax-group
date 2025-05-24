import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AdminComparablesAnalyzer } from './components/admin-comparables-analyzer';

function LoadingSkeleton() {
  return (
    <div className="container max-w-7xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Comparables Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Loading property analysis...
        </p>
      </div>
      <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
    </div>
  );
}

export default async function AdminComparablesPage({ searchParams }: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const subjectAcctNumber = resolvedSearchParams?.subjectAcct as string | undefined;

  return (
    <div className="container max-w-7xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Comparables Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Detailed view into property analysis and AI comparable selection
        </p>
      </div>

      {/* Input Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Property Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form method="GET" action="/admin/comparables" className="flex items-end gap-4">
            <div className="grow space-y-1">
              <Label htmlFor="subjectAcctInput">Subject Property Account Number</Label>
              <Input
                id="subjectAcctInput"
                name="subjectAcct"
                placeholder="Enter 13-digit account number"
                defaultValue={subjectAcctNumber || ''}
                maxLength={13}
                pattern="[0-9]{11,13}"
                required
              />
            </div>
            <Button type="submit">Analyze Property</Button>
          </form>
        </CardContent>
      </Card>

      {/* Main Analysis Component */}
      {subjectAcctNumber ? (
        <Suspense fallback={<LoadingSkeleton />}>
          <AdminComparablesAnalyzer subjectAcctNumber={subjectAcctNumber} />
        </Suspense>
      ) : (
        <Card>
          <CardContent className="text-center py-10">
            <p className="text-muted-foreground">
              Enter a Subject Property Account Number above to begin analysis.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

