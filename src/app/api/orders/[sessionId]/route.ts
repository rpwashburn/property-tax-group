import { NextRequest, NextResponse } from 'next/server';

/**
 * Get the API base URL from environment or default
 */
function getApiBaseUrl(): string {
  return process.env.PROPERTY_API_BASE_URL || 'http://localhost:9000';
}

/**
 * Get order status from the backend API
 */
async function getOrderFromBackend(sessionId: string) {
  try {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/v1/orders/stripe-session/${sessionId}`;
    
    console.log(`[OrderAPI] Fetching order status: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      console.error(`[OrderAPI] Failed to fetch order: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch order from backend: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[OrderAPI] Order fetched successfully:`, data);
    return data;
  } catch (error) {
    console.error('[OrderAPI] Error fetching order:', error);
    throw error;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Get order from backend API
    const order = await getOrderFromBackend(sessionId);
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('[OrderAPI] Error in order status endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order status' },
      { status: 500 }
    );
  }
} 