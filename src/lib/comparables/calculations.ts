import type { ComparableProperty, SubjectProperty, AdjustedComparable } from "@/lib/property-analysis/types";

// --- Interfaces ---

// Interface for individual adjustment results
export interface AdjustmentCalculations {
    sizeAdjustment: number;
    ageAdjustment: number;
    featuresAdjustment: number;
    adjustedImprovementValue: number;
    totalAdjustedValue: number;
    compImprPSF: number;
    landAdjustmentAmount: number;
    comparableScore: number;
    // Intermediate values for display/tooltips
    subjBldAr: number;
    compBldAr: number;
    subjYrImpr: number;
    compYrImpr: number;
    compBldVal: number;
    subjLandVal: number;
    compLandVal: number;
    subjXFeaturesVal: number;
    compXFeaturesVal: number;
}

// Interface for median calculation results
export interface MedianCalculationResult {
    medianAdjustedValue: number | null;
    valueDifference: number | null;
    subjectMarketValue: number | null;
    selectedCount: number;
}

// Interface for the grouped comparables result
export interface GroupedComparables {
    closestByAge: AdjustedComparable[];
    closestBySqFt: AdjustedComparable[];
    lowestByValue: AdjustedComparable[];
}

// Interface for the group membership IDs result
export interface GroupMembershipIds {
    closestByAgeIds: Set<string>;
    closestBySqFtIds: Set<string>;
    lowestByValueIds: Set<string>;
}

// --- Helper Functions ---

// Helper function to safely parse numbers
export const safeParseInt = (value: string | null | undefined, defaultValue = 0): number => {
    if (value === null || value === undefined) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

// Helper function to calculate comparable score
/**
 * Score a comparable for property-tax protest.
 * Higher scores = better comps (bigger discount *and* reasonably similar).
 */
function calculateComparableScore(
    subjectMarketValue: number,
    adjustedValue: number,
    subjectSqFt: number,
    compSqFt: number,
    subjectAge: number,
    compAge: number,
    compOriginalMarketValue: number
  ): number {
    /* ------------------------------------------------------------------ */
    /* 1. VALUE-DISCOUNT SCORE  (80 % weight)                              */
    /* ------------------------------------------------------------------ */
    // Percent the comp is BELOW the subject. Above-subject → 0.
    const rawDiscountPct =
      adjustedValue < subjectMarketValue
        ? (subjectMarketValue - adjustedValue) / subjectMarketValue
        : 0;
  
    // Optional cap so one crazy low sale doesn’t swamp the list.
    const MAX_DISCOUNT = 0.60;          // 60 % below subject ⇒ max credit
    const cappedDiscountPct = Math.min(rawDiscountPct, MAX_DISCOUNT);
  
    // Convert to 0-100. 60 % discount ⇒ 100 pts, 30 % discount ⇒ 50 pts, etc.
    const valueScore = (cappedDiscountPct / MAX_DISCOUNT) * 100;
  
    /* ------------------------------------------------------------------ */
    /* 2. SQFT SIMILARITY  (10 % weight, unchanged logic)                 */
    /* ------------------------------------------------------------------ */
    const sqFtDiff = Math.abs(subjectSqFt - compSqFt);
    const maxSqFtDiff = Math.max(subjectSqFt * 0.5, 500);
    const sqFtScore = Math.max(0, 100 - (sqFtDiff / maxSqFtDiff) * 100);
  
    /* ------------------------------------------------------------------ */
    /* 3. AGE SIMILARITY  (5 % weight, threshold tightened to 15 yrs)     */
    /* ------------------------------------------------------------------ */
    const ageDiff = Math.abs(subjectAge - compAge);
    const maxAgeDiff = 15; // stricter because we down-weighted age
    const ageScore = Math.max(0, 100 - (ageDiff / maxAgeDiff) * 100);
  
    /* ------------------------------------------------------------------ */
    /* 4. ADJUSTMENT RELIABILITY  (5 % weight, unchanged logic)           */
    /* ------------------------------------------------------------------ */
    const adjustmentDelta = Math.abs(adjustedValue - compOriginalMarketValue);
    const adjustmentPct =
      compOriginalMarketValue > 0 ? adjustmentDelta / compOriginalMarketValue : 1;
    const maxAdjustmentPct = 0.30;
    const adjustmentScore = Math.max(
      0,
      100 - (adjustmentPct / maxAdjustmentPct) * 100
    );
  
    /* ------------------------------------------------------------------ */
    /* 5. COMBINE WEIGHTED SCORES                                         */
    /* ------------------------------------------------------------------ */
    const finalScore =
      valueScore * 0.7 +
      sqFtScore * 0.2 +
      ageScore * 0.05 +
      adjustmentScore * 0.05;
  
    return Math.round(finalScore * 100) / 100; // two decimals
  }

// --- Core Calculation Functions ---

// Function to calculate adjustments for one comparable vs subject
export function calculateAdjustments(
    subject: SubjectProperty | null,
    comp: ComparableProperty
): AdjustmentCalculations | null {
    if (!subject) return null;

    const subjBldAr = safeParseInt(subject.bldAr);
    const compBldAr = safeParseInt(comp.bldAr);
    const subjYrImpr = safeParseInt(subject.yrImpr);
    const compYrImpr = safeParseInt(comp.yrImpr);
    const compBldVal = safeParseInt(comp.bldVal);
    const subjLandVal = safeParseInt(subject.landVal);
    const compLandVal = safeParseInt(comp.landVal); 
    const subjXFeaturesVal = safeParseInt(subject.xFeaturesVal);
    const compXFeaturesVal = safeParseInt(comp.xFeaturesVal);
    const subjMarketValue = safeParseInt(subject.totMktVal);
    const compOriginalMarketValue = safeParseInt(comp.totMktVal);

    const compImprPSF = compBldAr > 0 ? compBldVal / compBldAr : 0;
    const sizeAdjustment = compImprPSF * (subjBldAr - compBldAr) / 2;
    const ageAdjustment = 0.005 * (subjYrImpr - compYrImpr) * compBldVal; // 0.5% = 0.005
    const featuresAdjustment = subjXFeaturesVal - compXFeaturesVal;
    const adjustedImprovementValue = compBldVal + sizeAdjustment + ageAdjustment + featuresAdjustment;
    const totalAdjustedValue = adjustedImprovementValue + subjLandVal;
    const landAdjustmentAmount = subjLandVal - compLandVal;

    // Calculate comparable score
    const comparableScore = calculateComparableScore(
        subjMarketValue,
        totalAdjustedValue,
        subjBldAr,
        compBldAr,
        subjYrImpr,
        compYrImpr,
        compOriginalMarketValue
    );

    return {
        compImprPSF, 
        sizeAdjustment, 
        ageAdjustment, 
        featuresAdjustment,
        adjustedImprovementValue,
        totalAdjustedValue, 
        landAdjustmentAmount,
        comparableScore,
        // Include intermediate values
        subjBldAr,
        compBldAr,
        subjYrImpr,
        compYrImpr,
        compBldVal,
        subjLandVal,
        compLandVal,
        subjXFeaturesVal,
        compXFeaturesVal
    };
}

// Function to calculate median adjusted value from selected comps
export function calculateMedianAdjustedValue(
    subjectProperty: SubjectProperty | null,
    selectedComparables: ComparableProperty[]
): MedianCalculationResult {
    const result: MedianCalculationResult = {
        medianAdjustedValue: null,
        valueDifference: null,
        subjectMarketValue: subjectProperty ? safeParseInt(subjectProperty.totMktVal) : null,
        selectedCount: selectedComparables.length,
    };

    if (!subjectProperty || selectedComparables.length === 0) {
        return result;
    }

    const selectedAdjustedValues: number[] = selectedComparables
        .map(comp => calculateAdjustments(subjectProperty, comp)?.totalAdjustedValue)
        .filter((value): value is number => value !== undefined && value !== null);

    if (selectedAdjustedValues.length > 0) {
        selectedAdjustedValues.sort((a, b) => a - b);
        const midIndex = Math.floor(selectedAdjustedValues.length / 2);

        result.medianAdjustedValue = selectedAdjustedValues.length % 2 === 0
            ? (selectedAdjustedValues[midIndex - 1] + selectedAdjustedValues[midIndex]) / 2
            : selectedAdjustedValues[midIndex];

        if (result.subjectMarketValue !== null && result.medianAdjustedValue !== null) {
            result.valueDifference = result.medianAdjustedValue - result.subjectMarketValue;
        }
    }

    return result;
}

// Function to get the top 5 comparables for each group
export function getGroupedComparables(
    subjectProperty: SubjectProperty | null,
    propertiesWithAdjustments: AdjustedComparable[]
): GroupedComparables {
    const groups: GroupedComparables = {
        closestByAge: [],
        closestBySqFt: [],
        lowestByValue: [],
    };

    if (propertiesWithAdjustments.length === 0) {
        return groups; // Return empty groups if no comps
    }

    // 1. Lowest Adjusted Value
    // Sort by totalAdjustedValue (handle nulls by treating them as highest value)
    const sortedByValue = [...propertiesWithAdjustments].sort((a, b) => {
        const valA = a.adjustments?.totalAdjustedValue ?? Infinity;
        const valB = b.adjustments?.totalAdjustedValue ?? Infinity;
        return valA - valB;
    });
    groups.lowestByValue = sortedByValue.slice(0, 5);

    // Need subject property for age and sqft comparisons
    if (!subjectProperty) {
        return groups; // Cannot calculate age/sqft groups without subject
    }

    const subjYrImpr = safeParseInt(subjectProperty.yrImpr);
    const subjBldAr = safeParseInt(subjectProperty.bldAr);

    // 2. Closest by Age
    const sortedByAge = [...propertiesWithAdjustments].sort((a, b) => {
        const ageDiffA = Math.abs(safeParseInt(a.yrImpr) - subjYrImpr);
        const ageDiffB = Math.abs(safeParseInt(b.yrImpr) - subjYrImpr);
        return ageDiffA - ageDiffB;
    });
    groups.closestByAge = sortedByAge.slice(0, 5);

    // 3. Closest by SqFt
    const sortedBySqFt = [...propertiesWithAdjustments].sort((a, b) => {
        const sqFtDiffA = Math.abs(safeParseInt(a.bldAr) - subjBldAr);
        const sqFtDiffB = Math.abs(safeParseInt(b.bldAr) - subjBldAr);
        return sqFtDiffA - sqFtDiffB;
    });
    groups.closestBySqFt = sortedBySqFt.slice(0, 5);

    return groups;
}

// Function to get Sets of IDs for each group
export function getGroupMembershipIds(
    subjectProperty: SubjectProperty | null,
    propertiesWithAdjustments: AdjustedComparable[]
): GroupMembershipIds {
    const ids: GroupMembershipIds = {
        closestByAgeIds: new Set(),
        closestBySqFtIds: new Set(),
        lowestByValueIds: new Set(),
    };

    if (propertiesWithAdjustments.length === 0) {
        return ids;
    }

    // 1. Lowest Adjusted Value IDs
    const sortedByValue = [...propertiesWithAdjustments].sort((a, b) => {
        const valA = a.adjustments?.totalAdjustedValue ?? Infinity;
        const valB = b.adjustments?.totalAdjustedValue ?? Infinity;
        return valA - valB;
    });
    sortedByValue.slice(0, 5).forEach(prop => ids.lowestByValueIds.add(prop.id));

    if (!subjectProperty) {
        return ids; // Cannot calculate age/sqft groups without subject
    }

    const subjYrImpr = safeParseInt(subjectProperty.yrImpr);
    const subjBldAr = safeParseInt(subjectProperty.bldAr);

    // 2. Closest by Age IDs
    const sortedByAge = [...propertiesWithAdjustments].sort((a, b) => {
        const ageDiffA = Math.abs(safeParseInt(a.yrImpr) - subjYrImpr);
        const ageDiffB = Math.abs(safeParseInt(b.yrImpr) - subjYrImpr);
        return ageDiffA - ageDiffB;
    });
    sortedByAge.slice(0, 5).forEach(prop => ids.closestByAgeIds.add(prop.id));

    // 3. Closest by SqFt IDs
    const sortedBySqFt = [...propertiesWithAdjustments].sort((a, b) => {
        const sqFtDiffA = Math.abs(safeParseInt(a.bldAr) - subjBldAr);
        const sqFtDiffB = Math.abs(safeParseInt(b.bldAr) - subjBldAr);
        return sqFtDiffA - sqFtDiffB;
    });
    sortedBySqFt.slice(0, 5).forEach(prop => ids.closestBySqFtIds.add(prop.id));

    return ids;
} 