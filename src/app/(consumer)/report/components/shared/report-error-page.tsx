"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchX, ArrowLeft } from "lucide-react";

interface ReportErrorPageProps {
  accountNumber?: string | null;
  errorType: "noAccountNumber" | "propertyNotFound";
}

export function ReportErrorPage({ accountNumber, errorType }: ReportErrorPageProps) {
  if (errorType === "noAccountNumber") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--spacing-20))]">
        <div className="text-center space-y-6 max-w-lg">
          <SearchX className="h-24 w-24 mx-auto text-red-400" />
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">No Account Number Provided</h1>
          <p className="text-lg text-slate-600">
            We couldn&apos;t find any property data matching the account number you provided.
          </p>
          {accountNumber && (
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 inline-block">
              <p className="text-sm font-medium text-slate-500 mb-1">Account Number Searched</p>
              <p className="text-xl font-mono font-semibold text-slate-800">
                {accountNumber}
              </p>
            </div>
          )}
          <div className="space-y-4 pt-4">
            <p className="text-slate-600">Please verify the account number is correct or try searching again.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="default" size="lg">
                <Link href="/search">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Return to Search
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorType === "propertyNotFound") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--spacing-20))]">
        <div className="text-center space-y-6 max-w-lg">
          <SearchX className="h-24 w-24 mx-auto text-red-400" />
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Property Not Found</h1>
          <p className="text-lg text-slate-600">
            We couldn&apos;t find any property data matching the account number you provided.
          </p>
          {accountNumber && (
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 inline-block">
              <p className="text-sm font-medium text-slate-500 mb-1">Account Number Searched</p>
              <p className="text-xl font-mono font-semibold text-slate-800">
                {accountNumber}
              </p>
            </div>
          )}
          <div className="space-y-4 pt-4">
            <p className="text-slate-600">Please verify the account number is correct or try searching again.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="default" size="lg">
                <Link href="/search">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Return to Search
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null; // Should not happen
} 