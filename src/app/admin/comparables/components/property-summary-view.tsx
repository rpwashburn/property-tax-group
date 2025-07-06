"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building, MapPin, DollarSign, Calendar, Search } from 'lucide-react';
import type { PropertySummaryResponse, ComparablesResponse } from '@/lib/properties/types/types';

interface PropertySummaryViewProps {
  propertySummary: PropertySummaryResponse;
}

interface ComparablesTableProps {
  comparables: ComparablesResponse;
}

function ComparablesTable({ comparables }: ComparablesTableProps) {
  const formatCurrency = (value: string | null | undefined) => {
    if (!value || value === '0' || value === 'null' || value === 'undefined') return 'N/A';
    const cleanValue = String(value).replace(/[^0-9.-]+/g, '');
    const num = parseFloat(cleanValue);
    if (isNaN(num)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Comparable Properties ({comparables.total || comparables.comparables?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Account ID</th>
                <th className="text-left p-3 font-medium">Address</th>
                <th className="text-left p-3 font-medium">Sq Ft</th>
                <th className="text-left p-3 font-medium">Year Built</th>
                <th className="text-left p-3 font-medium">Original Value</th>
                <th className="text-left p-3 font-medium">Adjusted Value</th>
                <th className="text-left p-3 font-medium">Adjusted PSF</th>
                <th className="text-left p-3 font-medium">Total Adj %</th>
                <th className="text-left p-3 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {comparables.comparables.map((comp, index) => {
                // Handle both old and new response formats
                const accountId = comp.accountId;
                const address = comp.address?.formattedAddress || comp.address?.siteAddress1 || 'N/A';
                
                // Use available data from the current response format
                const originalValue = comp.currentValues?.totalMarketValue;
                
                return (
                  <tr key={accountId} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="p-3 font-mono text-sm">{accountId}</td>
                    <td className="p-3">{address}</td>
                    <td className="p-3">N/A</td>
                    <td className="p-3">N/A</td>
                    <td className="p-3 font-medium">
                      {formatCurrency(originalValue)}
                    </td>
                    <td className="p-3 font-medium text-green-600">N/A</td>
                    <td className="p-3">N/A</td>
                    <td className="p-3">N/A</td>
                    <td className="p-3">N/A</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {comparables.searchCriteria && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Search Criteria Used:</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm text-blue-800">
              <div><strong>Subject:</strong> {comparables.searchCriteria.subject_account_id}</div>
              <div><strong>State Class:</strong> {comparables.searchCriteria.state_class}</div>
              <div><strong>Neighborhood:</strong> {comparables.searchCriteria.neighborhood_code}</div>
              <div><strong>Quality:</strong> {comparables.searchCriteria.building_quality_code}</div>
              <div><strong>Grade:</strong> {comparables.searchCriteria.grade_adjustment}</div>
            </div>
          </div>
        )}
        
        {/* Detailed Adjustments for New API Response */}
        {comparables.comparables && comparables.comparables.length > 0 && comparables.comparables[0].adjustments && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-4">Detailed Adjustments</h4>
            <div className="space-y-4">
              {comparables.comparables.map((comp, index) => (
                <div key={comp.accountId} className="border rounded-lg p-4 bg-gray-50">
                  <h5 className="font-semibold mb-3">
                    {comp.address?.formattedAddress || comp.address?.siteAddress1 || 'N/A'} 
                    ({comp.accountId})
                  </h5>
                  
                  {comp.adjustments && (
                    <div className="text-sm text-gray-600">
                      <p>Adjustments available but detailed breakdown not implemented yet.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PropertySummaryView({ propertySummary }: PropertySummaryViewProps) {
  const [comparables, setComparables] = useState<ComparablesResponse | null>(null);
  const [isLoadingComparables, setIsLoadingComparables] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (value: string | null | undefined) => {
    if (!value || value === '0' || value === 'null' || value === 'undefined') return 'N/A';
    const cleanValue = String(value).replace(/[^0-9.-]+/g, '');
    const num = parseFloat(cleanValue);
    if (isNaN(num)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleGetComparablesWithOverrides = async (
    stateClass: string,
    neighborhoodCode: string,
    buildingQualityCode: string,
    gradeAdjustment: string
  ) => {
    setIsLoadingComparables(true);
    setError(null);

    try {
      // Get API base URL from environment or default
      const apiBaseUrl = process.env.NEXT_PUBLIC_PROPERTY_API_BASE_URL || 'http://localhost:9000';
      
      // Build the URL with query parameters using provided values (original or overridden)
      const url = new URL(`${apiBaseUrl}/api/v1/comparables`);
      url.searchParams.set('subject_account_id', propertySummary.accountId);
      url.searchParams.set('state_class', stateClass);
      url.searchParams.set('neighborhood_code', neighborhoodCode);
      url.searchParams.set('building_quality_code', buildingQualityCode);
      url.searchParams.set('grade_adjustment', gradeAdjustment);

      console.log(`[ComparablesAPI] Fetching comparables from: ${url.toString()}`);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const comparablesData: ComparablesResponse = await response.json();
      
      if (comparablesData) {
        setComparables(comparablesData);
        console.log(`[ComparablesAPI] Successfully fetched ${comparablesData.comparables?.length || 0} comparables`);
      } else {
        setError('No comparables data returned from API');
      }
    } catch (err) {
      console.error('Error fetching comparables:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch comparables');
    } finally {
      setIsLoadingComparables(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Property Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Property Summary - {propertySummary.accountId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Address Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </h3>
              <div className="space-y-1 text-sm">
                <p className="font-medium">
                  {propertySummary.address?.formattedAddress || propertySummary.address?.siteAddress1 || 'N/A'}
                </p>
                {propertySummary.address?.siteAddress2 && (
                  <p className="text-gray-600">{propertySummary.address.siteAddress2}</p>
                )}
                {propertySummary.address?.siteAddress3 && (
                  <p className="text-gray-600">{propertySummary.address.siteAddress3}</p>
                )}
              </div>
            </div>

            {/* Classification Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Classification</h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {propertySummary.classification?.stateClass || 'N/A'}
                  </Badge>
                  <Badge variant="secondary">
                    {propertySummary.classification?.neighborhoodCode || 'N/A'}
                  </Badge>
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>School District:</strong> {propertySummary.classification?.schoolDistrict || 'N/A'}</p>
                  <p><strong>Neighborhood:</strong> {propertySummary.classification?.neighborhoodDescription || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Building Quality Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Building Quality</h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">
                    Quality: {propertySummary.buildingQualityCode || 'N/A'}
                  </Badge>
                  <Badge variant="secondary">
                    Grade: {propertySummary.gradeAdjustment || 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Current Values Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Current Values
              </h3>
              <div className="space-y-1 text-sm">
                <p><strong>Market Value:</strong> {formatCurrency(propertySummary.currentValues?.totalMarketValue)}</p>
                <p><strong>Appraised Value:</strong> {formatCurrency(propertySummary.currentValues?.totalAppraisedValue)}</p>
                <p><strong>Building Value:</strong> {formatCurrency(propertySummary.currentValues?.buildingValue)}</p>
                <p><strong>Land Value:</strong> {formatCurrency(propertySummary.currentValues?.landValue)}</p>
              </div>
            </div>

            {/* Prior Values Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Prior Values
              </h3>
              <div className="space-y-1 text-sm">
                <p><strong>Market Value:</strong> {formatCurrency(propertySummary.priorValues?.totalMarketValue)}</p>
                <p><strong>Appraised Value:</strong> {formatCurrency(propertySummary.priorValues?.totalAppraisedValue)}</p>
                <p><strong>Building Value:</strong> {formatCurrency(propertySummary.priorValues?.buildingValue)}</p>
                <p><strong>Land Value:</strong> {formatCurrency(propertySummary.priorValues?.landValue)}</p>
              </div>
            </div>

            {/* Get Comparables Section */}
            <div className="space-y-3 md:col-span-2 lg:col-span-3">
              <h3 className="font-semibold text-lg">Get Comparables</h3>
              <div className="p-4 border rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600 mb-4">
                  These values will be used to search for comparable properties. You can override any value before searching.
                </p>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const stateClass = formData.get('stateClass') as string;
                  const neighborhoodCode = formData.get('neighborhoodCode') as string;
                  const buildingQualityCode = formData.get('buildingQualityCode') as string;
                  const gradeAdjustment = formData.get('gradeAdjustment') as string;
                  
                  if (stateClass && neighborhoodCode && buildingQualityCode && gradeAdjustment) {
                    handleGetComparablesWithOverrides(stateClass, neighborhoodCode, buildingQualityCode, gradeAdjustment);
                  }
                }} className="space-y-4">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="stateClass" className="block text-sm font-medium text-gray-700 mb-1">
                        State Class
                      </label>
                      <input
                        type="text"
                        id="stateClass"
                        name="stateClass"
                        defaultValue={propertySummary.classification?.stateClass || 'A1'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="neighborhoodCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Neighborhood Code
                      </label>
                      <input
                        type="text"
                        id="neighborhoodCode"
                        name="neighborhoodCode"
                        defaultValue={propertySummary.classification?.neighborhoodCode || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="buildingQualityCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Building Quality Code
                      </label>
                      <input
                        type="text"
                        id="buildingQualityCode"
                        name="buildingQualityCode"
                        defaultValue={propertySummary.buildingQualityCode || 'A'}
                        maxLength={1}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="gradeAdjustment" className="block text-sm font-medium text-gray-700 mb-1">
                        Grade Adjustment
                      </label>
                      <input
                        type="text"
                        id="gradeAdjustment"
                        name="gradeAdjustment"
                        defaultValue={propertySummary.gradeAdjustment || 'A'}
                        maxLength={1}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit"
                    disabled={isLoadingComparables}
                    className="w-full"
                  >
                    {isLoadingComparables ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading Comparables...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Get Comparables
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Comparables Table */}
      {comparables && <ComparablesTable comparables={comparables} />}
    </div>
  );
} 