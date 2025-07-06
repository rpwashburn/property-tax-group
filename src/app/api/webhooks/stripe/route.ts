import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Get the API base URL from environment or default
 */
function getApiBaseUrl(): string {
  return process.env.PROPERTY_API_BASE_URL || 'http://localhost:9000';
}

/**
 * Update order status in the backend API
 */
async function updateOrderInBackend(sessionId: string, status: string, paymentIntentId?: string) {
  try {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/v1/orders/stripe-session/${sessionId}`;
    
    console.log(`[OrderAPI] Updating order status: ${url}`);
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        status,
        stripe_payment_intent_id: paymentIntentId,
      }),
    });

    if (!response.ok) {
      console.error(`[OrderAPI] Failed to update order: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to update order in backend: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[OrderAPI] Order updated successfully:`, data);
    return data;
  } catch (error) {
    console.error('[OrderAPI] Error updating order:', error);
    throw error;
  }
}



export async function POST(request: NextRequest) {
  try {
    if (!endpointSecret) {
      console.error('[Webhook] Missing STRIPE_WEBHOOK_SECRET environment variable');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('[Webhook] Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error('[Webhook] Signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`[Webhook] Processing event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log(`[Webhook] Payment completed for session: ${session.id}`);
        console.log(`[Webhook] Session metadata:`, session.metadata);
        
        try {
          // Update order status to paid - manual report generation will follow
          await updateOrderInBackend(
            session.id,
            'paid',
            session.payment_intent as string
          );
          
          console.log(`[Webhook] Order marked as paid - ready for manual report creation`);
        } catch (error) {
          console.error(`[Webhook] Error processing completed payment for session ${session.id}:`, error);
          // Don't return error here - Stripe has already processed the payment
          // Just log the error for manual intervention
        }
        
        break;
      }
      
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log(`[Webhook] Session expired: ${session.id}`);
        
        try {
          await updateOrderInBackend(session.id, 'cancelled');
        } catch (error) {
          console.error(`[Webhook] Error updating expired session ${session.id}:`, error);
        }
        
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        console.log(`[Webhook] Payment failed for intent: ${paymentIntent.id}`);
        
        // Note: We'd need to look up the session by payment_intent_id if needed
        // For now, just log the failure
        
        break;
      }
      
      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
} 