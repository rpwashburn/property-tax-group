import { loadStripe } from '@stripe/stripe-js';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
}

export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export interface CheckoutRequest {
  productType: 'comparables' | 'full_report';
  jurisdiction: string;
  accountNumber: string;
  customerEmail: string;
  customerName: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutResponse {
  sessionId: string;
  url: string;
}

export interface OrderStatus {
  id: string;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  productType: string;
  jurisdiction: string;
  accountNumber: string;
  customerEmail: string;
  customerName: string;
  reportGenerated: boolean;
  reportUrl?: string;
  createdAt: string;
} 