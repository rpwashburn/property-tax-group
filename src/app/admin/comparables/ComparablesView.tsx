"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronDown, Info, Plus, Home, Copy, Download, Sparkles } from "lucide-react"; // Removed MapPin, Added Sparkles

// UI Imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Type Imports
import type { PropertySearchCriteria } from "@/lib/comparables/types";
import type { SubjectProperty, ComparableProperty, AdjustedComparable } from "@/lib/property-analysis/types";
// Import calculation functions and types
import { 
    safeParseInt, // <<< Import safeParseInt
    type MedianCalculationResult,
    type GroupMembershipIds, // <<< Import GroupMembershipIds type
} from "@/lib/comparables/calculations"; // Removed calculateAdjustments, calculateMedianAdjustedValue, AdjustmentCalculations

// Props interface
interface ComparablesViewProps {
  initialProperties: AdjustedComparable[]; // Expect adjustments pre-calculated
  initialCriteria: PropertySearchCriteria;
  subjectProperty: SubjectProperty | null; 
  medianResult: MedianCalculationResult; // <<< Ensure this prop is defined
  groupMembershipIds: GroupMembershipIds; // <<< Add groupMembershipIds prop
}

// The Client Component
export function ComparablesView({ 
    initialProperties, 
    initialCriteria, 
    subjectProperty, 
    medianResult, 
    groupMembershipIds // <<< Destructure new prop
}: ComparablesViewProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [selectedComps, setSelectedComps] = useState<string[]>([]);
  const [isSubjectCopied, setIsSubjectCopied] = useState(false); // <<< State for copy feedback
  const [isAiInputCopied, setIsAiInputCopied] = useState(false); // <<< Renamed state for AI prompt copy feedback

  const toggleCompSelection = (id: string) => {
    setSelectedComps((prev) =>
      prev.includes(id) ? prev.filter((compId) => compId !== id) : [...prev, id]
    );
  };

  // Calculate value per square foot safely
  const calculateValuePerSqFt = (prop: ComparableProperty): string => {
      const marketValue = parseInt(prop.totMktVal || '0', 10);
      const buildingArea = parseInt(prop.bldAr || '0', 10);
      if (isNaN(marketValue) || isNaN(buildingArea) || buildingArea <= 0) {
          return 'N/A';
      }
      return (marketValue / buildingArea).toFixed(2);
  };

  // Define potential options for Grade/Condition (adjust as needed based on actual data)
  const gradeOptions = ["Excellent", "Good", "Average", "Fair", "Poor", "Low"]; // Example
  const conditionOptions = ["Excellent", "Good", "Average", "Fair", "Poor"]; // Example

  // Function to format currency
  const formatCurrency = (value: number | null | undefined) => { // Allow null/undefined
      if (value === null || value === undefined) return 'N/A';
      return value.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  }
  
  // Function to format numbers with sign
  const formatSignedCurrency = (value: number | null | undefined) => { // Allow null/undefined
      if (value === null || value === undefined) return 'N/A';
      // const sign = value >= 0 ? '+' : ''; // Removed unused variable 'sign'
      // Use formatCurrency which already handles locale and options
      // const formatted = (value === 0 ? 0 : value).toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }); // Removed unused variable 'formatted'
      // Remove currency symbol if present before adding sign, then re-add if needed (or adjust formatCurrency)
      // Simpler: rely on browser default for sign placement with currency format
      return value.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0, signDisplay: 'exceptZero' });
  }

  // UPDATED: Main CSV Export function
  const handleExportCsv = () => {
    if (initialProperties.length === 0) return;
    // Define headers, including the new Group Membership column
    const headers = [
      'id', 'acct', 'siteAddr1', 'siteAddr3', 'stateClass', 'neighborhoodCode',
      'yrImpr', 'bldAr', 'landAr', 'landVal', 'bldVal', 'acreage', 'totMktVal', 'xFeaturesVal',
      'grade', 'condition', 
      'Comp Impr PSF', 'Size Adjustment', 'Age Adjustment', 'Land Adjustment Amount',
      'Adjusted Improvement Value', 'Total Adjusted Value', 
      'Group Membership' // <<< New Header
    ];
    const escapeCsvField = (field: unknown): string => { /* Reuse existing helper */ 
        const stringField = field === null || field === undefined ? '' : String(field);
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
    };

    const csvRows = [
      headers.join(','), // Header row
      ...initialProperties.map(prop => {
        const { adjustments: propAdjustments, ...restOfProp } = prop;
        
        // Determine group membership for this property
        const groups: string[] = [];
        if (groupMembershipIds.closestByAgeIds.has(prop.id)) groups.push('Age');
        if (groupMembershipIds.closestBySqFtIds.has(prop.id)) groups.push('SqFt');
        if (groupMembershipIds.lowestByValueIds.has(prop.id)) groups.push('Value');
        const groupString = groups.join(', '); // Combine group names

        const rowData = {
            ...restOfProp,
            'Comp Impr PSF': propAdjustments?.compImprPSF ?? '',
            'Size Adjustment': propAdjustments?.sizeAdjustment ?? '',
            'Age Adjustment': propAdjustments?.ageAdjustment ?? '',
            'Land Adjustment Amount': propAdjustments?.landAdjustmentAmount ?? '',
            'Adjusted Improvement Value': propAdjustments?.adjustedImprovementValue ?? '',
            'Total Adjusted Value': propAdjustments?.totalAdjustedValue ?? '',
            'Group Membership': groupString // <<< Add group data
        };
        
        return headers.map(header => 
            escapeCsvField(rowData[header as keyof typeof rowData])
        ).join(',');
      })
    ];
    const csvString = csvRows.join('\n');
    
    // Create Blob and trigger download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'comparables_export_with_groups.csv'); // Updated filename
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // RE-ADDED: Filtered Grouped CSV Export
  const handleExportGroupedCsv = () => {
    // 1. Combine all unique IDs from the top groups
    const topGroupIds = new Set([
        ...groupMembershipIds.closestByAgeIds,
        ...groupMembershipIds.closestBySqFtIds,
        ...groupMembershipIds.lowestByValueIds
    ]);

    // 2. Filter initialProperties to only include those in the top groups
    const filteredProperties = initialProperties.filter(prop => topGroupIds.has(prop.id));

    if (filteredProperties.length === 0) return; // Exit if no properties are in groups

    // 3. Define Headers and Formatting (same as handleExportCsv)
    const headers = [
      'id', 'acct', 'siteAddr1', 'siteAddr3', 'stateClass', 'neighborhoodCode',
      'yrImpr', 'bldAr', 'landAr', 'landVal', 'bldVal', 'acreage', 'totMktVal', 'xFeaturesVal',
      'grade', 'condition', 
      'Comp Impr PSF', 'Size Adjustment', 'Age Adjustment', 'Land Adjustment Amount',
      'Adjusted Improvement Value', 'Total Adjusted Value', 
      'Group Membership' 
    ];
    const escapeCsvField = (field: unknown): string => { /* Reuse existing helper */ 
        const stringField = field === null || field === undefined ? '' : String(field);
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
    };

    // 4. Map filtered properties to CSV rows
    const csvRows = [
      headers.join(','), // Header row
      ...filteredProperties.map(prop => {
        const { adjustments: propAdjustments, ...restOfProp } = prop; 
        const groups: string[] = [];
        if (groupMembershipIds.closestByAgeIds.has(prop.id)) groups.push('Age');
        if (groupMembershipIds.closestBySqFtIds.has(prop.id)) groups.push('SqFt');
        if (groupMembershipIds.lowestByValueIds.has(prop.id)) groups.push('Value');
        const groupString = groups.join(', '); 

        const rowData = {
            ...restOfProp,
            'Comp Impr PSF': propAdjustments?.compImprPSF ?? '',
            'Size Adjustment': propAdjustments?.sizeAdjustment ?? '',
            'Age Adjustment': propAdjustments?.ageAdjustment ?? '',
            'Land Adjustment Amount': propAdjustments?.landAdjustmentAmount ?? '',
            'Adjusted Improvement Value': propAdjustments?.adjustedImprovementValue ?? '',
            'Total Adjusted Value': propAdjustments?.totalAdjustedValue ?? '',
            'Group Membership': groupString 
        };
        
        return headers.map(header => 
            escapeCsvField(rowData[header as keyof typeof rowData])
        ).join(',');
      })
    ];
    const csvString = csvRows.join('\n');
    
    // 5. Create Blob and trigger download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'top_grouped_comparables.csv'); // New filename
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Function to handle SUBJECT property copy to clipboard
  const handleCopySubjectDetails = () => {
    if (!subjectProperty) return;

    // Format the details as requested
    const detailsString = `####SUBJECT PROPERTY####
Address: ${subjectProperty.siteAddr1 || 'N/A'}
Location: ${subjectProperty.siteAddr3 || 'N/A'}
Neighborhood: ${subjectProperty.neighborhoodCode || 'N/A'}
Grade: ${subjectProperty.grade || 'N/A'}
Condition: ${subjectProperty.condition || 'N/A'}
Year Built: ${subjectProperty.yrImpr || 'N/A'}
Building SqFt: ${safeParseInt(subjectProperty.bldAr).toLocaleString()}
Land SqFt: ${safeParseInt(subjectProperty.landAr).toLocaleString()}
Land Value: ${formatCurrency(safeParseInt(subjectProperty.landVal))}
Improvement Value: ${formatCurrency(safeParseInt(subjectProperty.bldVal))}
Extra Features Value: ${formatCurrency(safeParseInt(subjectProperty.xFeaturesVal))}
Market Value: ${formatCurrency(safeParseInt(subjectProperty.totMktVal))}`; 

    // Use Clipboard API
    navigator.clipboard.writeText(detailsString)
      .then(() => {
        setIsSubjectCopied(true); // Set state for feedback
        // Optional: Reset state after a delay
        setTimeout(() => setIsSubjectCopied(false), 2000); 
      })
      .catch(err => {
        console.error('Failed to copy subject details: ', err);
        // Optional: Show error feedback to user
      });
  };

  // Renamed function to copy AI prompt + Subject 
  const handleCopyAiAnalysisInput = () => {
    if (!subjectProperty) return;

    // 1. Format Subject Details (same as before)
    const subjectDetailsBlock = `  1. A Subject Property block:
     Address: ${subjectProperty.siteAddr1 || 'N/A'}
     Year Built: ${subjectProperty.yrImpr || 'N/A'}
     Building SF: ${safeParseInt(subjectProperty.bldAr).toLocaleString()}
     Land SF: ${safeParseInt(subjectProperty.landAr).toLocaleString()}
     Grade: ${subjectProperty.grade || 'N/A'}
     Condition: ${subjectProperty.condition || 'N/A'}
     Neighborhood Code: ${subjectProperty.neighborhoodCode || 'N/A'}`; 

    // 2. Define the AI rules template, updating CSV description
    const aiFullPrompt = `You are a valuation analyst choosing the best adjusted comparable sales for a single commercial subject property in Harris County, TX.
Inputs you will receive:
${subjectDetailsBlock}
  2. A separate CSV file containing pre-filtered comparables (top 5 by closest age, closest sqft, and lowest adjusted value). Key columns include:
     • acct (HCAD account ID)
     • bldAr (building area SF)
     • yrImpr (effective/actual year built)
     • neighborhoodCode
     • Total Adjusted Value
     • Adjusted Improvement Value, Size Adjustment, Age Adjustment, Land Adjustment Amount, xFeaturesVal (or similar)
     • Group Membership (Indicates which group(s) the comp belongs to: Age, SqFt, Value)

Deliverable: A ranked list of the five comps (show acct, address, adjusted value, adjusted $/SF, and a one‑sentence rationale each) plus a short note on comps #6 and #7 explaining why they were not chosen.

Selection algorithm: Optimize for the best tax appeal for the subject property while still being realistic and arguable.

### Top 5 Low‑Value Comps
1. acct – address – $AdjValue (Adj $/SF)
   • succinct reason
...
### Why #6 and #7 were excluded
• acct – one‑line explanation

Use bullet points or a table—whichever is clearer.`;

    // Use Clipboard API (remains the same)
    navigator.clipboard.writeText(aiFullPrompt)
      .then(() => {
        setIsAiInputCopied(true); 
        setTimeout(() => setIsAiInputCopied(false), 2000); 
      })
      .catch(err => {
        console.error('Failed to copy AI analysis input: ', err);
      });
  };

  return (
    // Main container for the page content within this view
    <div className="comparables-view-container"> 
      
      {/* --- Median Value Card (Moved to Top) --- */}
      {medianResult.medianAdjustedValue !== null && medianResult.subjectMarketValue !== null && (
         <Card className="mb-6 border-primary shadow-lg">
             <CardHeader>
                 <CardTitle className="text-lg text-primary">Indicated Value Analysis</CardTitle>
                 <CardDescription>Median adjusted value of all {initialProperties.length} found comparables vs. your property.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-3">
                   <div className="flex justify-between items-center">
                       <span className="text-muted-foreground">Median Adjusted Comp Value:</span>
                       <span className="font-semibold text-lg">{formatCurrency(medianResult.medianAdjustedValue)}</span>
                   </div>
                   <div className="flex justify-between items-center">
                       <span className="text-muted-foreground">Your Property Market Value:</span>
                       <span className="font-semibold text-lg">{formatCurrency(medianResult.subjectMarketValue)}</span>
                   </div>
                   <Separator />
                   <div className="flex justify-between items-center font-bold text-lg">
                       <span>Difference:</span>
                       <span className={medianResult.valueDifference !== null && medianResult.valueDifference <= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatSignedCurrency(medianResult.valueDifference)}
                          {medianResult.valueDifference !== null && medianResult.subjectMarketValue !== 0 && medianResult.subjectMarketValue !== null 
                            ? ` (${((medianResult.valueDifference / medianResult.subjectMarketValue) * 100).toFixed(1)}%)` 
                            : ''}
                       </span>
                   </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                 This indicates the potential market value based on adjusted comparables.
              </CardFooter>
         </Card>
      )}
      {/* --- End Median Value Card --- */}

      {/* Form containing Filters and Results Grid */}
      <form method="GET" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hidden input to persist subjectAcct */}
        {subjectProperty?.acct && (
           <input type="hidden" name="subjectAcct" value={subjectProperty.acct} />
        )}

        {/* Filters Column */}
        <div className="lg:col-span-4">
          {/* Display Subject Property Details */}
          {subjectProperty && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardHeader className="pb-3 flex flex-row items-center justify-between"> 
                <div> 
                  <CardTitle className="text-lg">Subject Property</CardTitle>
                  <CardDescription>{subjectProperty.acct}</CardDescription>
                </div>
                <div className="flex gap-2"> {/* Wrapper for buttons */} 
                  {/* Copy Details Button */}
                  <Button 
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={handleCopySubjectDetails} 
                      disabled={!subjectProperty || isSubjectCopied} 
                      className="w-[110px]" 
                  >
                     {isSubjectCopied ? (
                       <><Check className="h-4 w-4 mr-1" /> Copied!</>
                     ) : (
                       <>Copy Details</>
                     )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                 <p><strong>Address:</strong> {subjectProperty.siteAddr1}</p>
                 <p><strong>Location:</strong> {subjectProperty.siteAddr3}</p>
                 <p><strong>Neighborhood:</strong> {subjectProperty.neighborhoodCode}</p>
                 <p><strong>Grade:</strong> {subjectProperty.grade || 'N/A'}</p>
                 <p><strong>Condition:</strong> {subjectProperty.condition || 'N/A'}</p>
                 <p><strong>Year Built:</strong> {subjectProperty.yrImpr}</p>
                 <p><strong>Building SqFt:</strong> {parseInt(subjectProperty.bldAr || '0').toLocaleString()}</p>
                 <p><strong>Land SqFt:</strong> {parseInt(subjectProperty.landAr || '0').toLocaleString()}</p>
                 <p><strong>Land Value:</strong> ${parseInt(subjectProperty.landVal || '0').toLocaleString()}</p>
                 <p><strong>Improvement Value:</strong> ${parseInt(subjectProperty.bldVal || '0').toLocaleString()}</p>
                 <p><strong>Extra Features Value:</strong> ${parseInt(subjectProperty.xFeaturesVal || '0').toLocaleString()}</p>
                 <p><strong>Market Value:</strong> ${parseInt(subjectProperty.totMktVal || '0').toLocaleString()}</p>
              </CardContent>
            </Card>
          )}

          <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Comparable Filters</CardTitle>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ChevronDown className={`h-4 w-4 ${isFilterOpen ? "rotate-180" : ""} transition-transform`} />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CardDescription>Define what makes a valid comparison</CardDescription>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  {/* Address Search */}
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address Search</Label>
                    <input
                      type="text"
                      id="address"
                      name="address" // Used for form submission -> searchParams
                      defaultValue={initialCriteria.address || ''}
                      placeholder="Search by address..."
                      className="p-2 border rounded"
                    />
                  </div>

                  {/* Informational Box */}
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
                    <p className="font-medium flex items-center gap-1 mb-1">
                      <Info className="h-4 w-4" /> Finding the Right Balance
                    </p>
                    <p>
                      Wider filter ranges may find properties with lower values, but can weaken your argument. Narrower
                      ranges create stronger comparisons but may result in higher values.
                    </p>
                  </div>

                  {/* Location Filters */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Location</h3>
                    {/* TODO: Add Distance Filter (requires location data or calculation) */}
                    {/* <div className="grid gap-2">... Distance Select ...</div> */}
                    <div className="grid gap-2">
                      <Label htmlFor="neighborhood">Same Neighborhood</Label>
                      <div className="flex items-center gap-2">
                        {/* TODO: Link Switch to form submission (name attribute, potentially hidden input) */}
                        <Switch id="neighborhood" name="sameNeighborhood" defaultChecked={initialCriteria.neighborhoodCode !== undefined} />
                        <Label htmlFor="neighborhood">Same Neighborhood Only</Label>
                      </div>
                    </div>
                  </div>
                  <Separator />

                  {/* TODO: Add Quality & Condition Filters (need mapping from schema data) */}
                  {/* <div className="space-y-4"> ... Quality/Condition Selects ... </div> */}
                  {/* <Separator /> */}

                  {/* Grade & Condition Filters */}
                  <div className="space-y-4">
                     <h3 className="font-medium">Grade & Condition</h3>
                     <div className="grid gap-2">
                        <Label htmlFor="grade">Grade</Label>
                        <Select name="grade" {...(initialCriteria.grade ? { defaultValue: initialCriteria.grade as string } : {})}>
                          <SelectTrigger id="grade">
                            <SelectValue placeholder="Any Grade" />
                          </SelectTrigger>
                          <SelectContent>
                             {gradeOptions.map(option => (
                               <SelectItem key={option} value={option}>{option}</SelectItem>
                             ))}
                          </SelectContent>
                        </Select>
                     </div>
                      <div className="grid gap-2">
                        <Label htmlFor="condition">Condition</Label>
                        <Select name="condition" {...(initialCriteria.condition ? { defaultValue: initialCriteria.condition as string } : {})}>
                          <SelectTrigger id="condition">
                            <SelectValue placeholder="Any Condition" />
                          </SelectTrigger>
                          <SelectContent>
                              {conditionOptions.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                     </div>
                  </div>
                  <Separator />

                  {/* Property Characteristics Filters */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Property Characteristics</h3>
                     {/* TODO: Add SqFt Range Slider (requires calculation based on a subject property) */}
                     {/* <div className="grid gap-2">... SqFt Slider ...</div> */}
                    <div className="grid gap-2">
                        <Label htmlFor="minYearBuilt">Min Year Built</Label>
                        <input type="number" id="minYearBuilt" name="minYearBuilt" defaultValue={initialCriteria.minYearBuilt || ''} className="p-2 border rounded" placeholder="e.g., 1990" />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="maxYearBuilt">Max Year Built</Label>
                        <input type="number" id="maxYearBuilt" name="maxYearBuilt" defaultValue={initialCriteria.maxYearBuilt || ''} className="p-2 border rounded" placeholder="e.g., 2005" />
                    </div>
                  </div>
                  <Separator />

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button type="submit" className="w-full">Apply Filters</Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8">
            {/* Top Card for Title/Description */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex justify-between items-center">
                       <CardTitle>Comparable Properties</CardTitle>
                       <div className="flex gap-2 flex-wrap"> {/* Wrapper for export/copy buttons - Added flex-wrap */} 
                         {/* Updated Export CSV Button */}
                         <Button variant="outline" size="sm" type="button" onClick={handleExportCsv} disabled={initialProperties.length === 0} title="Export all comparables with group membership">
                            <Download className="h-4 w-4 mr-1" /> Export All CSV
                         </Button>
                         {/* Add Grouped Export CSV Button Back */}
                         <Button variant="outline" size="sm" type="button" onClick={handleExportGroupedCsv} disabled={initialProperties.length === 0} title="Export only top 5 comparables from each group (Age, SqFt, Value)">
                            <Download className="h-4 w-4 mr-1" /> Export Grouped CSV
                         </Button>
                         {/* Copy AI Prompt Button */}
                         <Button variant="outline" size="sm" type="button" onClick={handleCopyAiAnalysisInput} disabled={!subjectProperty || isAiInputCopied} className="w-[140px]" title="Copy AI prompt rules with subject data">
                           {isAiInputCopied ? <><Check className="h-4 w-4 mr-1" /> Copied!</> : <><Copy className="h-4 w-4 mr-1" /> Copy AI Prompt</>}
                         </Button>
                         {/* REVERTED: Generate AI Analysis Button Link */}
                         {subjectProperty && (
                             <Link href={`/report/${subjectProperty.acct}`} passHref>
                                 <Button 
                                    variant="default" 
                                    size="sm" 
                                    className="bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                                 >
                                    <Sparkles className="mr-2 h-4 w-4" /> Generate AI Analysis
                                </Button>
                             </Link>
                         )}
                       </div>
                    </div>
                    <CardDescription className="pt-2">
                        {/* Display the count of properties found */}
                        Found {initialProperties.length} comparable properties based on current filters.
                        Select properties that are most similar to yours but have lower assessments.
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Tabs for Views */}
            <Tabs defaultValue="list" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="map">Map View</TabsTrigger>
                </TabsList>

                {/* List View */}
                <TabsContent value="list" className="pt-0">
                    {initialProperties.length === 0 ? (
                        <Card><CardContent className="pt-6"><p>No properties found matching your criteria.</p></CardContent></Card>
                    ) : (
                        <div className="space-y-4">
                            {initialProperties.map((comp) => {
                                // Access pre-calculated adjustments from comp prop
                                const adjustments = comp.adjustments;
                                return (
                                  <Card
                                      key={comp.id}
                                      className={`overflow-hidden ${selectedComps.includes(comp.id) ? "border-primary" : ""}`}
                                  >
                                      <CardContent className="p-4">
                                          <div className="flex flex-col md:flex-row gap-4">
                                              {/* <div className="md:w-1/4">
                                                  <img src={"/placeholder.svg"} alt={`Property at ${comp.siteAddr1}`} className="w-full h-auto rounded-md object-cover" />
                                              </div> */}
                                              <div className="flex-1">
                                                  <div className="flex justify-between items-start mb-2">
                                                      <div>
                                                          <h3 className="font-medium">{comp.siteAddr1}</h3>
                                                          <p className="text-sm text-muted-foreground">{comp.siteAddr3}</p>
                                                          {/* Removed Distance - <MapPin className="h-3 w-3" /> {comp.distance} away */}
                                                      </div>
                                                      <Button
                                                          variant={selectedComps.includes(comp.id) ? "default" : "outline"}
                                                          size="sm"
                                                          onClick={() => toggleCompSelection(comp.id)}
                                                      >
                                                          {selectedComps.includes(comp.id) ? (
                                                              <><Check className="h-4 w-4 mr-1" /> Selected</>
                                                          ) : (
                                                              <><Plus className="h-4 w-4 mr-1" /> Select</>
                                                          )}
                                                      </Button>
                                                  </div>
                                                  {/* Updated Grid to include Grade, Condition, and Account */}
                                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                                      {/* Display Account Number */}
                                                      <div>
                                                          <p className="text-xs text-muted-foreground">Account</p>
                                                          <p className="font-medium">{comp.acct}</p>
                                                      </div>
                                                      <div>
                                                          <p className="text-xs text-muted-foreground">Building SqFt</p>
                                                          <p className="font-medium">{parseInt(comp.bldAr || '0').toLocaleString()}</p>
                                                      </div>
                                                       {/* Add Land SqFt Display */}
                                                       <div>
                                                          <p className="text-xs text-muted-foreground">Land SqFt</p>
                                                          <p className="font-medium">{parseInt(comp.landAr || '0').toLocaleString()}</p>
                                                      </div>
                                                      {/* Add Land Value Display */}
                                                      <div>
                                                          <p className="text-xs text-muted-foreground">Land Value</p>
                                                          <p className="font-medium">${parseInt(comp.landVal || '0').toLocaleString()}</p>
                                                      </div>
                                                      {/* Add Improvement Value Display */}
                                                      <div>
                                                          <p className="text-xs text-muted-foreground">Improvement Value</p>
                                                          <p className="font-medium">${parseInt(comp.bldVal || '0').toLocaleString()}</p>
                                                      </div>
                                                      <div>
                                                          <p className="text-xs text-muted-foreground">Year Built</p>
                                                          <p className="font-medium">{comp.yrImpr}</p>
                                                      </div>
                                                      <div>
                                                          <p className="text-xs text-muted-foreground">Market Value</p>
                                                          <p className="font-medium">${parseInt(comp.totMktVal || '0').toLocaleString()}</p>
                                                      </div>
                                                      {/* Add Extra Features Value Display */}
                                                      <div>
                                                          <p className="text-xs text-muted-foreground">Extra Features Val</p>
                                                          <p className="font-medium">${parseInt(comp.xFeaturesVal || '0').toLocaleString()}</p>
                                                      </div>
                                                      <div>
                                                          <p className="text-xs text-muted-foreground">$/SqFt</p>
                                                          <p className="font-medium">${calculateValuePerSqFt(comp)}</p>
                                                      </div>
                                                       <div>
                                                          <p className="text-xs text-muted-foreground">Neighborhood</p>
                                                          <p className="font-medium">{comp.neighborhoodCode}</p>
                                                      </div>
                                                      {/* Display Grade and Condition */}
                                                      <div>
                                                          <p className="text-xs text-muted-foreground">Grade</p>
                                                          <p className="font-medium">{comp.grade || 'N/A'}</p>
                                                      </div>
                                                      <div>
                                                          <p className="text-xs text-muted-foreground">Condition</p>
                                                          <p className="font-medium">{comp.condition || 'N/A'}</p>
                                                      </div>
                                                  </div>
                                                  
                                                  {/* Display Adjustment Section with Tooltips */}
                                                  {adjustments && (
                                                    <div className="mt-3 pt-3 border-t">
                                                      <h4 className="text-sm font-medium mb-2">Adjustments vs Subject</h4>
                                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                         {/* Size Adjustment with Tooltip */}
                                                         <TooltipProvider>
                                                            <Tooltip>
                                                              <TooltipTrigger asChild>
                                                                <div className="space-y-0.5 cursor-help">
                                                                   <p className="text-xs text-muted-foreground">Size Adj.</p>
                                                                   <p className={`font-medium ${adjustments.sizeAdjustment >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                                     {formatSignedCurrency(adjustments.sizeAdjustment)}
                                                                   </p>
                                                                </div>
                                                               </TooltipTrigger>
                                                               <TooltipContent className="text-xs">
                                                                  <p>Comp Impr PSF: {formatCurrency(adjustments?.compImprPSF)}</p>
                                                                  <p>Subj Area: {adjustments?.subjBldAr?.toLocaleString()} sqft</p>
                                                                  <p>Comp Area: {adjustments?.compBldAr?.toLocaleString()} sqft</p>
                                                                  <p className="mt-1">Formula: PSF × (Subj Area - Comp Area) / 2</p>
                                                               </TooltipContent>
                                                            </Tooltip>
                                                         </TooltipProvider>
                                                         
                                                         {/* Age Adjustment with Tooltip */}
                                                          <TooltipProvider>
                                                            <Tooltip>
                                                               <TooltipTrigger asChild>
                                                                 <div className="space-y-0.5 cursor-help">
                                                                    <p className="text-xs text-muted-foreground">Age Adj.</p>
                                                                    <p className={`font-medium ${adjustments?.ageAdjustment >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                                     {formatSignedCurrency(adjustments?.ageAdjustment)}
                                                                    </p>
                                                                 </div>
                                                               </TooltipTrigger>
                                                               <TooltipContent className="text-xs">
                                                                   <p>Subj Year: {adjustments?.subjYrImpr}</p>
                                                                   <p>Comp Year: {adjustments?.compYrImpr}</p>
                                                                   <p>Comp Impr Val: {formatCurrency(adjustments?.compBldVal)}</p>
                                                                   <p className="mt-1">Formula: 0.5% × (Subj Yr - Comp Yr) × Comp Impr Val</p>
                                                               </TooltipContent>
                                                            </Tooltip>
                                                          </TooltipProvider>
                                                         
                                                         {/* Land Adjustment with Tooltip */}
                                                         <TooltipProvider>
                                                            <Tooltip>
                                                               <TooltipTrigger asChild>
                                                                 <div className="space-y-0.5 cursor-help">
                                                                    <p className="text-xs text-muted-foreground">Land Adj.</p>
                                                                    <p className={`font-medium ${adjustments?.landAdjustmentAmount >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                                      {formatSignedCurrency(adjustments?.landAdjustmentAmount)}
                                                                    </p>
                                                                 </div>
                                                               </TooltipTrigger>
                                                               <TooltipContent className="text-xs">
                                                                   <p>Subj Land Val: {formatCurrency(adjustments?.subjLandVal)}</p>
                                                                   <p>Comp Land Val: {formatCurrency(adjustments?.compLandVal)}</p>
                                                                   <p className="mt-1">Formula: Subj Land Val - Comp Land Val</p>
                                                               </TooltipContent>
                                                            </Tooltip>
                                                         </TooltipProvider>
                                                         
                                                         {/* Total Adjusted Value with Tooltip */}
                                                          <TooltipProvider>
                                                             <Tooltip>
                                                                 <TooltipTrigger asChild>
                                                                    <div className="font-semibold md:col-span-1 space-y-0.5 cursor-help">
                                                                       <p className="text-xs text-muted-foreground">Total Adjusted Value</p>
                                                                       <p className="text-base">{formatCurrency(adjustments?.totalAdjustedValue)}</p>
                                                                    </div>
                                                                 </TooltipTrigger>
                                                                 <TooltipContent className="text-xs">
                                                                   <p>Adj Impr Val: {formatCurrency(adjustments?.adjustedImprovementValue)}</p>
                                                                   <p>Subj Land Val: {formatCurrency(adjustments?.subjLandVal)}</p>
                                                                   <p className="mt-1">Formula: Adj Impr Val + Subj Land Val</p>
                                                                   {/* Alternative Formula Display: 
                                                                   <p>Comp Total Mkt Val: {formatCurrency(adjustments?.compBldVal ? adjustments?.compLandVal ? adjustments.compBldVal + adjustments.compLandVal : null : null)}</p>
                                                                   <p>Size Adj: {formatSignedCurrency(adjustments?.sizeAdjustment)}</p>
                                                                   <p>Age Adj: {formatSignedCurrency(adjustments?.ageAdjustment)}</p>
                                                                   <p>Land Adj Amt: {formatSignedCurrency(adjustments?.landAdjustmentAmount)}</p>
                                                                   <p className="mt-1">Formula: Comp Total Mkt Val + Size Adj + Age Adj + Land Adj Amt</p>
                                                                   */}
                                                                 </TooltipContent>
                                                             </Tooltip>
                                                          </TooltipProvider>
                                                      </div>
                                                    </div>
                                                  )}
                                              </div>
                                          </div>
                                      </CardContent>
                                  </Card>
                                )
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Map View */}
                <TabsContent value="map" className="h-[500px]">
                    <Card className="h-full">
                        <CardContent className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <Home className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">Map view requires integration.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

           {/* Footer Buttons */}
           <div className="flex justify-between mt-6">
              <Button variant="outline" asChild>
                <Link href="/start">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Link>
              </Button>
              <Link href="/report">
                <Button disabled={selectedComps.length === 0}>
                  Generate Report 
                </Button>
              </Link>
           </div>
        </div> 
      </form> {/* Close Form */} 
    </div> // Close wrapper div
  );
} 