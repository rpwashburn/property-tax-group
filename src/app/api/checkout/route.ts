import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRODUCT_CONFIGS, type ProductType } from '@/lib/stripe';
import type { CheckoutRequest, CheckoutResponse } from '@/lib/stripe-client';
import { emailUtils } from '@/lib/utils';

/**
 * Get the API base URL from environment or default
 */
function getApiBaseUrl(): string {
  return process.env.PROPERTY_API_BASE_URL || 'http://localhost:9000';
}

/**
 * Create an order in the backend API
 */
async function createOrderInBackend(orderData: {
  stripeSessionId: string;
  productType: ProductType;
  amount: number;
  customerEmail: string;
  customerName: string;
  jurisdiction: string;
  accountNumber: string;
}) {
  try {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/v1/orders`;
    
    console.log(`[OrderAPI] Creating order in backend: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        stripe_session_id: orderData.stripeSessionId,
        product_type: orderData.productType,
        amount: orderData.amount,
        customer_email: orderData.customerEmail,
        customer_name: orderData.customerName,
        jurisdiction: orderData.jurisdiction,
        account_number: orderData.accountNumber,
        status: 'pending'
      }),
    });

    if (!response.ok) {
      console.error(`[OrderAPI] Failed to create order: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to create order in backend: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[OrderAPI] Order created successfully:`, data);
    return data;
  } catch (error) {
    console.error('[OrderAPI] Error creating order:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const { 
      productType, 
      jurisdiction, 
      accountNumber, 
      customerEmail, 
      customerName,
      successUrl, 
      cancelUrl 
    } = body;
    
    // Validate required fields
    if (!productType || !jurisdiction || !accountNumber || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields: productType, jurisdiction, accountNumber, customerEmail, customerName' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailValidation = emailUtils.validateEmail(customerEmail);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error || 'Invalid email address format' },
        { status: 400 }
      );
    }
    
    // Validate product type
    if (!PRODUCT_CONFIGS[productType as ProductType]) {
      return NextResponse.json(
        { error: 'Invalid product type' },
        { status: 400 }
      );
    }
    
    const product = PRODUCT_CONFIGS[productType as ProductType];
    
    // Normalize email address
    const normalizedEmail = emailUtils.normalizeEmail(customerEmail);
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
              metadata: {
                jurisdiction,
                accountNumber,
                productType,
              },
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      customer_email: normalizedEmail,
      metadata: {
        productType,
        jurisdiction,
        accountNumber,
        customerName,
      },
      success_url: successUrl || `${request.nextUrl.origin}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${request.nextUrl.origin}/purchase?jurisdiction=${jurisdiction}&account=${accountNumber}`,
    });
    
    if (!session.id || !session.url) {
      throw new Error('Failed to create Stripe checkout session');
    }
    
    // Create order in backend API
    try {
      await createOrderInBackend({
        stripeSessionId: session.id,
        productType: productType as ProductType,
        amount: product.price,
        customerEmail: normalizedEmail,
        customerName,
        jurisdiction,
        accountNumber,
      });
    } catch (backendError) {
      // If backend order creation fails, cancel the Stripe session
      console.error('[Checkout] Backend order creation failed, canceling Stripe session');
      try {
        await stripe.checkout.sessions.expire(session.id);
      } catch (expireError) {
        console.error('[Checkout] Failed to expire Stripe session:', expireError);
      }
      throw backendError;
    }
    
    const response: CheckoutResponse = {
      sessionId: session.id,
      url: session.url,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('[Checkout] Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 