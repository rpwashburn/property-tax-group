// Define types for our deductions
export type EvidenceFile = {
  id: string;
  name: string;
  type: "photo" | "document";
  url: string; // This will be a Blob URL for client-side preview
  file?: File; // Store the actual file for later processing/upload if needed
};

export type QuoteFile = {
  id: string;
  name: string;
  amount: number;
  company: string;
  url: string; // This will be a Blob URL for client-side preview
  file?: File; // Store the actual file for later processing/upload if needed
};

export type Deduction = {
  id: string;
  type: string; // Corresponds to 'value' in deductionTypes
  description: string;
  amount: number;
  evidence: EvidenceFile[];
  quotes: QuoteFile[];
};

// Sample deduction types
export const deductionTypes = [
  { value: "foundation", label: "Foundation Issues" },
  { value: "roof", label: "Roof Damage" },
  { value: "plumbing", label: "Plumbing Problems" },
  { value: "electrical", label: "Electrical Issues" },
  { value: "windows", label: "Window Damage/Leaks" },
  { value: "hvac", label: "HVAC System Problems" },
  { value: "exterior", label: "Exterior Damage" },
  { value: "interior", label: "Interior Damage" },
  { value: "drainage", label: "Drainage Issues" },
  { value: "other", label: "Other Issues" },
]; 