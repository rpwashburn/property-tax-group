import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
  typescript: true,
});

export const PRODUCT_CONFIGS = {
  comparables: {
    name: 'Comparables Report',
    price: 4900, // $49.00 in cents
    description: 'Professional analysis of comparable properties in your neighborhood',
  },
  full_report: {
    name: 'Full Tax Protest Report',
    price: 9900, // $99.00 in cents
    description: 'Complete protest documentation with comparables analysis included',
  },
} as const;

export type ProductType = keyof typeof PRODUCT_CONFIGS; 