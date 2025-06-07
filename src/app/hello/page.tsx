import { fetchHelloMessage } from "./data-fetcher";

export default async function HelloPage() {
  // Server-side data fetching
  const message = await fetchHelloMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Next.js + FastAPI on Vercel (Server-Side)
        </h1>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="text-sm font-medium text-blue-800 mb-1">
            Message from FastAPI Backend (Server-Side Rendered):
          </div>
          <div className="text-lg text-blue-900 font-semibold">
            {message}
          </div>
        </div>

        <div className="text-gray-600 space-y-2">
          <p>✅ Next.js frontend is running</p>
          <p>✅ FastAPI backend is connected</p>
          <p>✅ Data fetched server-side (better SEO & performance)</p>
          <p>✅ Deployment protection bypass configured</p>
          <p>✅ Ready for Vercel deployment</p>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Server-Side Rendering Benefits
          </h2>
          <div className="text-sm text-gray-600 text-left space-y-1">
            <p>• Faster initial page load</p>
            <p>• Better SEO (search engines can read content)</p>
            <p>• No loading states needed</p>
            <p>• Content available immediately</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h2 className="text-lg font-semibold text-green-800 mb-2">
            API Endpoints Available
          </h2>
          <div className="text-sm text-green-700 text-left space-y-1">
            <p>• <strong>/api/hello</strong> - Hello World message</p>
            <p>• <strong>/api/health</strong> - Health check endpoint</p>
            <p>• <strong>/docs</strong> - FastAPI documentation</p>
            <p>• <strong>/openapi.json</strong> - OpenAPI schema</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            Security Features
          </h2>
          <div className="text-sm text-yellow-700 text-left space-y-1">
            <p>• Vercel Deployment Protection enabled</p>
            <p>• Internal API calls use protection bypass</p>
            <p>• Server-side rendering protects API secrets</p>
            <p>• External requests are protected by default</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
          <h2 className="text-lg font-semibold text-indigo-800 mb-2">
            Deployment Instructions
          </h2>
          <div className="text-sm text-indigo-700 text-left">
            <p>1. Push your code to GitHub</p>
            <p>2. Connect your repo to Vercel</p>
            <p>3. Enable Protection Bypass for Automation in Vercel settings</p>
            <p>4. Deploy! Vercel will automatically handle both frontend and backend</p>
          </div>
        </div>
      </div>
    </div>
  );
} 