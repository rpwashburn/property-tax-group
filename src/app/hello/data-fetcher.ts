"use server";

export async function fetchHelloMessage() {
    try {
      // In production, use your full domain URL
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/api/hello`, {
        // Important: disable caching for dynamic content
        cache: 'no-store'
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