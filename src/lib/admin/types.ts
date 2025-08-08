// Auth types - these remain in the local database
export { users, sessions, accounts, verifications } from '@/drizzle/auth-schema';

// Legacy property types - property data is now handled by backend API
// Keeping these type definitions for backward compatibility

export type NeighborhoodCode = {
  id: number;
  code: string;
  groupCode: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewNeighborhoodCode = {
  code: string;
  groupCode: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type PropertyData = {
  id: string;
  acct: string;
  strNum: string | null;
  str: string | null;
  strSfx: string | null;
  strSfxDir: string | null;
  siteAddr1: string | null;
  siteAddr2: string | null;
  siteAddr3: string | null;
  stateClass: string | null;
  schoolDist: string | null;
  neighborhoodCode: string | null;
  neighborhoodGrp: string | null;
  marketArea1: string | null;
  marketArea1Dscr: string | null;
  marketArea2: string | null;
  marketArea2Dscr: string | null;
  econArea: string | null;
  econBldClass: string | null;
  yrImpr: string | null;
  yrAnnexed: string | null;
  bldAr: string | null;
  landAr: string | null;
  acreage: string | null;
  landVal: string | null;
  bldVal: string | null;
  xFeaturesVal: string | null;
  agVal: string | null;
  assessedVal: string | null;
  totApprVal: string | null;
  totMktVal: string | null;
  priorLandVal: string | null;
  priorBldVal: string | null;
  priorXFeaturesVal: string | null;
  priorAgVal: string | null;
  priorTotApprVal: string | null;
  priorTotMktVal: string | null;
  newConstructionVal: string | null;
  totRcnVal: string | null;
  valueStatus: string | null;
  noticed: string | null;
  noticeDt: string | null;
  protested: string | null;
  certifiedDate: string | null;
  revDt: string | null;
  revBy: string | null;
  newOwnDt: string | null;
  lgl1: string | null;
  jurs: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NewPropertyData = Omit<PropertyData, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Date;
  updatedAt?: Date;
};

export type StructuralElement = {
  id: string;
  acct: string;
  bldNum: string;
  code: string;
  adj: string | null;
  type: string;
  typeDscr: string;
  categoryDscr: string;
  dorCd: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewStructuralElement = Omit<StructuralElement, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Date;
  updatedAt?: Date;
};

export type Fixture = {
  id: string;
  acct: string;
  bldNum: string;
  type: string;
  typeDscr: string;
  units: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewFixture = Omit<Fixture, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Date;
  updatedAt?: Date;
};

// Order types for admin management
export type Order = {
  id: string;
  stripe_session_id: string;
  product_type: string;
  amount: number;
  customer_email: string;
  customer_name: string;
  jurisdiction: string;
  account_number: string;
  status: 'payment_completed' | 'payment_pending' | 'payment_failed' | 'cancelled';
  report_generated: boolean;
  report_url: string | null;
  created_at: string;
};

export type OrdersResponse = {
  orders: Order[];
  total_count: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  status_summary: Array<{
    status: string;
    count: number;
  }>;
};

// You can add more specific types for forms or display if needed 