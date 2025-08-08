"use client";

import { Suspense, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PropertySummaryFetcher } from './components/property-summary-fetcher';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

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

function AdminComparablesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accountId, setAccountId] = useState(searchParams.get('accountId') || '');
  const currentAccountId = searchParams.get('accountId');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountId.trim()) {
      router.push(`/admin/comparables/${accountId.trim()}`);
    }
  };

  return (
    <div className="container max-w-7xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Comparables Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Search for a property to view detailed comparable properties analysis
        </p>
      </div>

      {/* Property Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Property Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex items-end gap-4">
            <div className="grow space-y-1">
              <Label htmlFor="accountIdInput">Property Account ID</Label>
              <Input
                id="accountIdInput"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="Enter account ID (e.g., 1234567890123)"
                maxLength={13}
                pattern="[0-9]{11,13}"
                required
              />
            </div>
            <Button type="submit" className="gap-2">
              <Search className="h-4 w-4" />
              Analyze Property
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Show legacy summary if accessed via old URL with accountId parameter */}
      {currentAccountId ? (
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Legacy View</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-4">
              This is the legacy property summary view. For the full detailed analysis, click the button below.
            </p>
            <Button 
              onClick={() => router.push(`/admin/comparables/${currentAccountId}`)}
              variant="default"
            >
              View Detailed Analysis
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-10">
            <p className="text-muted-foreground">
              Enter a Property Account ID above to start the detailed comparables analysis.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Legacy Property Summary Component - only show if accessed via old URL */}
      {currentAccountId && (
        <Suspense fallback={<LoadingSkeleton />}>
          <PropertySummaryFetcher accountId={currentAccountId} />
        </Suspense>
      )}
    </div>
  );
}

export default function AdminComparablesPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AdminComparablesContent />
    </Suspense>
  );
}

