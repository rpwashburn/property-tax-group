'use client';

import { useEffect, useState } from 'react';

export default function HelloPage() {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchHello = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/hello');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setMessage(data.message);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    };

    fetchHello();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg text-gray-600 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-600 font-semibold text-lg mb-2">Error</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Next.js + FastAPI on Vercel
        </h1>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="text-sm font-medium text-blue-800 mb-1">
            Message from FastAPI Backend:
          </div>
          <div className="text-lg text-blue-900 font-semibold">
            {message}
          </div>
        </div>

        <div className="text-gray-600 space-y-2">
          <p>✅ Next.js frontend is running</p>
          <p>✅ FastAPI backend is connected</p>
          <p>✅ Ready for Vercel deployment</p>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Deployment Instructions
          </h2>
          <div className="text-sm text-gray-600 text-left">
            <p>1. Push your code to GitHub</p>
            <p>2. Connect your repo to Vercel</p>
            <p>3. Deploy! Vercel will automatically handle both frontend and backend</p>
          </div>
        </div>
      </div>
    </div>
  );
} 