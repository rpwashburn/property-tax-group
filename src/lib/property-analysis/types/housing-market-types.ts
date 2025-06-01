export interface HousingMarketAdjustment {
  percentage: number; // Percentage reduction (e.g., 5 for 5%)
  evidenceFile?: {
    name: string;
    type: string;
    size: number;
    url: string;
  };
  description?: string;
}

export interface HousingMarketAdjustmentState {
  adjustment: HousingMarketAdjustment | null;
} 