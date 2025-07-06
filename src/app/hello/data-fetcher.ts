"use server";

interface PropertyDataItem {
  account: string;
  address: string;
  neighborhood: string;
  appraised_value: number;
  market_value: number;
}

export async function fetchHelloMessage() {
    try {
      // In production, use your full domain URL
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000';
      
      // Headers for bypassing Vercel deployment protection
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add protection bypass header if available (for internal API calls in production)
      if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
        headers['x-vercel-protection-bypass'] = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
      }
      
      const response = await fetch(`${baseUrl}/api/v1/hello`, {
        // Use ISR with 60 second revalidation instead of no-store
        next: { revalidate: 60 },
        headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const currentTime = new Date().toISOString();
      return `${data.message} at ${currentTime}`;
    } catch (error) {
      console.error('Failed to fetch hello message:', error);
      return 'Failed to connect to backend';
    }
  }

export async function fetchPropertyData() {
  try {
    // In production, use your full domain URL
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    // Headers for bypassing Vercel deployment protection
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Add protection bypass header if available (for internal API calls in production)
    if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
      headers['x-vercel-protection-bypass'] = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    }
    
    const response = await fetch(`${baseUrl}/api/v1/properties/sample`, {
      // Use ISR with 60 second revalidation instead of no-store
      next: { revalidate: 60 },
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform FastAPI response format to match component expectations
    return {
      status: data.status,
      total_properties: data.sample_data?.length || 0,
      sample_properties: data.sample_data?.map((item: PropertyDataItem) => ({
        account: item.account,
        address: item.address,
        neighborhood: item.neighborhood || "N/A", // Use the neighborhood from database
        appraised_value: item.appraised_value?.toString() || "0",
        market_value: item.market_value?.toString() || "0"
      })) || [],
      message: data.message
    };
  } catch (error) {
    console.error('Failed to fetch property data:', error);
    return {
      status: 'error',
      total_properties: 0,
      sample_properties: [],
      error: 'Failed to connect to database'
    };
  }
}