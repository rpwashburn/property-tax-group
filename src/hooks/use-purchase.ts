"use client";

import { useState, useCallback } from 'react';
import { stripePromise } from '@/lib/stripe-client';
import type { CheckoutRequest, CheckoutResponse } from '@/lib/stripe-client';

interface PurchaseError {
  message: string;
  code?: string;
}

interface UsePurchaseReturn {
  isLoading: boolean;
  error: PurchaseError | null;
  initiatePurchase: (request: CheckoutRequest) => Promise<void>;
  clearError: () => void;
}

export function usePurchase(): UsePurchaseReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PurchaseError | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const initiatePurchase = useCallback(async (request: CheckoutRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate required fields
      if (!request.productType || !request.jurisdiction || !request.accountNumber || !request.customerEmail || !request.customerName) {
        throw new Error('All fields are required: product type, jurisdiction, account number, name, and email');
      }

      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create checkout session: ${response.status}`);
      }

      const { url }: CheckoutResponse = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error('Purchase initiation failed:', err);
      setError({
        message: err instanceof Error ? err.message : 'Failed to initiate purchase',
        code: 'PURCHASE_FAILED',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    initiatePurchase,
    clearError,
  };
} 