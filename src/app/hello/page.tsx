import { fetchHelloMessage, fetchPropertyData } from "./data-fetcher";

// Define types for the property data
interface Property {
  account: string;
  address: string;
  neighborhood: string;
  appraised_value: string;
  market_value: string;
}

interface PropertyDataResponse {
  status: string;
  total_properties: number;
  sample_properties: Property[];
  error?: string;
  timestamp?: string;
}

export default async function HelloPage() {
  // Server-side data fetching
  const message = await fetchHelloMessage();
  const propertyData = await fetchPropertyData() as PropertyDataResponse;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          Next.js + FastAPI + PostgreSQL
        </h1>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="text-sm font-medium text-blue-800 mb-1">
            Message from FastAPI Backend:
          </div>
          <div className="text-lg text-blue-900 font-semibold">
            {message}
          </div>
        </div>

        {/* Database Data Section */}
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="text-lg font-medium text-green-800 mb-3">
            PostgreSQL Database Data:
          </div>
          {propertyData.status === 'success' ? (
            <div>
              <p className="text-sm text-green-700 mb-3">
                Total Properties in Database: <span className="font-bold">{propertyData.total_properties}</span>
              </p>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-green-800">Sample Properties:</p>
                {propertyData.sample_properties.map((property: Property, index: number) => (
                  <div key={index} className="bg-white p-3 rounded border border-green-200">
                    <div className="text-sm text-gray-700">
                      <p><span className="font-semibold">Account:</span> {property.account}</p>
                      <p><span className="font-semibold">Address:</span> {property.address}</p>
                      <p><span className="font-semibold">Neighborhood:</span> {property.neighborhood}</p>
                      <p><span className="font-semibold">Appraised Value:</span> ${property.appraised_value}</p>
                      <p><span className="font-semibold">Market Value:</span> ${property.market_value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-red-700">
              {propertyData.error || 'Failed to load property data'}
            </div>
          )}
        </div>

        <div className="text-gray-600 space-y-2 text-center">
          <p>✅ Next.js frontend is running</p>
          <p>✅ FastAPI backend is connected</p>
          <p>✅ PostgreSQL database is connected</p>
          <p>✅ Data fetched server-side with dependency injection</p>
          <p>✅ Ready for migration to FastAPI</p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Technology Stack
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• <strong>Frontend:</strong> Next.js 15 (App Router)</p>
              <p>• <strong>Backend:</strong> FastAPI + SQLAlchemy</p>
              <p>• <strong>Database:</strong> PostgreSQL</p>
              <p>• <strong>ORM:</strong> SQLAlchemy (Async)</p>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              New API Endpoints
            </h2>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• <strong>/api/v1/properties/sample</strong> - Get sample properties</p>
              <p>• <strong>/api/v1/hello</strong> - Hello World message</p>
              <p>• <strong>/health</strong> - Health check endpoint</p>
              <p>• <strong>/docs</strong> - FastAPI documentation</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
          <h2 className="text-lg font-semibold text-indigo-800 mb-2">
            Next Steps for Migration
          </h2>
          <div className="text-sm text-indigo-700 space-y-1">
            <p>1. Migrate authentication endpoints to FastAPI</p>
            <p>2. Move property analysis logic to FastAPI services</p>
            <p>3. Convert admin endpoints to FastAPI routes</p>
            <p>4. Implement proper error handling and validation</p>
            <p>5. Add comprehensive API documentation</p>
          </div>
        </div>
      </div>
    </div>
  );
} 