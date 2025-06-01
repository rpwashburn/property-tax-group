export interface ExtraFeature {
  type: string | null;
  description: string | null;
  grade: string | null;
  condition: string | null;
  buildingNumber: number | null;
  length: string | null;
  width: string | null;
  units: string | null;
  unitPrice: string | null;
  adjustedUnitPrice: string | null;
  percentComplete: string | null;
  actualYear: number | null;
  effectiveYear: number | null;
  rollYear: number | null;
  date: string | null;
  percentCondition: string | null;
  depreciatedValue: string | null;
  note: string | null;
  assessedValue: string | null;
}

export interface ExtraFeatureDispute {
  type: string;
  description: string;
  originalValue: string;
  disputedValue: string;
  disputed: boolean;
  reason: string;
  evidenceFiles: File[];
}

export interface ExtraFeaturesDisputeSummary {
  disputes: ExtraFeatureDispute[];
  totalOriginalValue: number;
  totalDisputedValue: number;
  totalValueReduction: number;
  adjustedExtraFeaturesValue: number;
} 