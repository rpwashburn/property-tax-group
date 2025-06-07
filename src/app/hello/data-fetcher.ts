"use server";

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
      
      const response = await fetch(`${baseUrl}/api/hello`, {
        // Important: disable caching for dynamic content
        cache: 'no-store',
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