import type { ComparableProperty } from "./types";
import type { SubjectProperty } from "./server";
import type { PropertyWithAdjustments } from "@/app/(consumer)/comparables/ComparablesDataFetcher";

// --- Interfaces ---

// Interface for individual adjustment results
export interface AdjustmentCalculations {
    sizeAdjustment: number;
    ageAdjustment: number;
    adjustedImprovementValue: number;
    totalAdjustedValue: number;
    compImprPSF: number;
    landAdjustmentAmount: number; // Add this
    // Intermediate values for display/tooltips
    subjBldAr: number;
    compBldAr: number;
    subjYrImpr: number;
    compYrImpr: number;
    compBldVal: number;
    subjLandVal: number;
    compLandVal: number; // Add this
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
    closestByAge: PropertyWithAdjustments[];
    closestBySqFt: PropertyWithAdjustments[];
    lowestByValue: PropertyWithAdjustments[];
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
    const compLandVal = safeParseInt(comp.landVal); // Parse comp land value

    const compImprPSF = compBldAr > 0 ? compBldVal / compBldAr : 0;
    const sizeAdjustment = compImprPSF * (subjBldAr - compBldAr) / 2;
    const ageAdjustment = 0.005 * (subjYrImpr - compYrImpr) * compBldVal; // 0.5% = 0.005
    const adjustedImprovementValue = compBldVal + sizeAdjustment + ageAdjustment;
    const totalAdjustedValue = adjustedImprovementValue + subjLandVal;
    const landAdjustmentAmount = subjLandVal - compLandVal;

    return {
        compImprPSF, sizeAdjustment, ageAdjustment, adjustedImprovementValue,
        totalAdjustedValue, landAdjustmentAmount, // Include land adjustment amount
        // Include intermediate values
        subjBldAr,
        compBldAr,
        subjYrImpr,
        compYrImpr,
        compBldVal,
        subjLandVal,
        compLandVal // Include comp land val
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
    propertiesWithAdjustments: PropertyWithAdjustments[]
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
    propertiesWithAdjustments: PropertyWithAdjustments[]
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