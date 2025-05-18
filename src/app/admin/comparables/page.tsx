import { Suspense } from 'react';
import { Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ComparablesDataFetcher } from './ComparablesDataFetcher';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

function LoadingSkeleton() {
    return (
        <div className="container max-w-7xl py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Comparable Properties Analysis</h1>
                <p className="text-muted-foreground mt-2">
                    Finding comparable properties...
                </p>
            </div>
            <div className="flex items-center mb-8">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground"><Check className="h-5 w-5" /></div>
                <Separator className="flex-1 mx-4" />
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground"><Check className="h-5 w-5" /></div>
                <Separator className="flex-1 mx-4" />
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-dashed text-muted-foreground">3</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 space-y-4">
                   <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
                   <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
                </div>
                 <div className="lg:col-span-8 space-y-4">
                    <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
                 </div>
            </div>
        </div>
    );
}

export default async function ComparablesPage({ searchParams }: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Read subjectAcct directly from server component props
  const resolvedSearchParams = await searchParams;
  const subjectAcct = resolvedSearchParams?.subjectAcct as string | undefined;

  return (
    <div className="container max-w-7xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Comparable Properties Analysis (Admin)</h1>
      </div>

      {/* Input Form (uses GET method to update searchParams) */}
      <form method="GET" action="/admin/comparables" className="mb-8 flex items-end gap-4 p-4 border rounded-lg bg-slate-50">
        <div className="grow space-y-1">
          <Label htmlFor="subjectAcctInput">Subject Property Account Number</Label>
          <Input
            id="subjectAcctInput"
            name="subjectAcct" // Name matches the search param key
            placeholder="Enter 13-digit account number"
            defaultValue={subjectAcct || ''} // Pre-fill if exists
            maxLength={13}
            pattern="[0-9]{11,13}"
            required
          />
        </div>
        <Button type="submit">Load/Update Comparables</Button>
      </form>

      {/* Conditionally render ComparablesDataFetcher based on searchParam */}
      {subjectAcct ? (
          <Suspense fallback={<LoadingSkeleton />}>
              {/* ComparablesDataFetcher reads from its own searchParams prop */}
              <ComparablesDataFetcher searchParams={resolvedSearchParams} />
          </Suspense>
      ) : (
         <div className="text-center text-muted-foreground py-10 border rounded-lg bg-white">
             Enter a Subject Property Account Number above to load comparables.
         </div>
      )}
    </div>
  );
}

