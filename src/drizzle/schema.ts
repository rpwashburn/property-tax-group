import {
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
  timestamp,
  serial,
  numeric,
  index,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Auth tables
export { users, sessions, accounts, verifications } from './auth-schema';

export const propertyData = pgTable('property_data', {
  id: uuid('id').defaultRandom().primaryKey(),
  acct: varchar('acct', { length: 13 }).notNull(),
  strNum: varchar('str_num', { length: 10 }),
  str: varchar('str', { length: 50 }),
  strSfx: varchar('str_sfx', { length: 10 }),
  strSfxDir: varchar('str_sfx_dir', { length: 10 }),
  siteAddr1: varchar('site_addr_1', { length: 100 }),
  siteAddr2: varchar('site_addr_2', { length: 100 }),
  siteAddr3: varchar('site_addr_3', { length: 100 }),
  stateClass: varchar('state_class', { length: 10 }),
  schoolDist: varchar('school_dist', { length: 10 }),
  neighborhoodCode: varchar('neighborhood_code', { length: 10 }),
  neighborhoodGrp: varchar('neighborhood_grp', { length: 100 }),
  marketArea1: varchar('market_area_1', { length: 10 }),
  marketArea1Dscr: varchar('market_area_1_dscr', { length: 100 }),
  marketArea2: varchar('market_area_2', { length: 10 }),
  marketArea2Dscr: varchar('market_area_2_dscr', { length: 100 }),
  econArea: varchar('econ_area', { length: 10 }),
  econBldClass: varchar('econ_bld_class', { length: 10 }),
  yrImpr: varchar('yr_impr', { length: 10 }),
  yrAnnexed: varchar('yr_annexed', { length: 10 }),
  bldAr: varchar('bld_ar', { length: 10 }),
  landAr: varchar('land_ar', { length: 10 }),
  acreage: varchar('acreage', { length: 10 }),
  landVal: varchar('land_val', { length: 20 }),
  bldVal: varchar('bld_val', { length: 20 }),
  xFeaturesVal: varchar('x_features_val', { length: 20 }),
  agVal: varchar('ag_val', { length: 20 }),
  assessedVal: varchar('assessed_val', { length: 20 }),
  totApprVal: varchar('tot_appr_val', { length: 20 }),
  totMktVal: varchar('tot_mkt_val', { length: 20 }),
  priorLandVal: varchar('prior_land_val', { length: 20 }),
  priorBldVal: varchar('prior_bld_val', { length: 20 }),
  priorXFeaturesVal: varchar('prior_x_features_val', { length: 20 }),
  priorAgVal: varchar('prior_ag_val', { length: 20 }),
  priorTotApprVal: varchar('prior_tot_appr_val', { length: 20 }),
  priorTotMktVal: varchar('prior_tot_mkt_val', { length: 20 }),
  newConstructionVal: varchar('new_construction_val', { length: 20 }),
  totRcnVal: varchar('tot_rcn_val', { length: 20 }),
  valueStatus: varchar('value_status', { length: 50 }),
  noticed: varchar('noticed', { length: 1 }),
  noticeDt: varchar('notice_dt', { length: 10 }),
  protested: varchar('protested', { length: 1 }),
  certifiedDate: varchar('certified_date', { length: 10 }),
  revDt: varchar('rev_dt', { length: 10 }),
  revBy: varchar('rev_by', { length: 10 }),
  newOwnDt: varchar('new_own_dt', { length: 10 }),
  lgl1: varchar('lgl_1', { length: 100 }),
  jurs: varchar('jurs', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('acct_idx').on(table.acct),
]);

export const propertyDataRelations = relations(propertyData, ({ many }) => ({
  structuralElements: many(structuralElements, {
    relationName: 'PropertyStructuralElements',
  }),
}));

export const neighborhoodCodes = pgTable('neighborhood_codes', {
  id: serial('id').primaryKey(),
  code: text('code').notNull(),
  groupCode: text('group_code').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const structuralElements = pgTable('structural_elements', {
  id: uuid('id').defaultRandom().primaryKey(),
  acct: varchar('acct', { length: 13 }).notNull(),
  bldNum: varchar('bld_num', { length: 10 }).notNull(),
  code: varchar('code', { length: 10 }).notNull(),
  adj: varchar('adj', { length: 20 }),
  type: varchar('type', { length: 10 }).notNull(),
  typeDscr: varchar('type_dscr', { length: 100 }).notNull(),
  categoryDscr: varchar('category_dscr', { length: 100 }).notNull(),
  dorCd: varchar('dor_cd', { length: 10 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('se_acct_bld_type_idx').on(table.acct, table.bldNum, table.type),
]);

export const structuralElementsRelations = relations(structuralElements, ({ one }) => ({
	property: one(propertyData, {
		fields: [structuralElements.acct],
		references: [propertyData.acct],
    relationName: 'PropertyStructuralElements',
	}),
}));

export const fixtures = pgTable('fixtures', {
  id: uuid('id').defaultRandom().primaryKey(),
  acct: text('acct').notNull(),
  bldNum: text('bld_num').notNull(),
  type: text('type').notNull(),
  typeDscr: text('type_dscr').notNull(),
  units: numeric('units').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('fixtures_acct_bld_type_idx').on(table.acct, table.bldNum, table.type),
]);

export const fixturesRelations = relations(fixtures, ({ one }) => ({
  property: one(propertyData, {
    fields: [fixtures.acct],
    references: [propertyData.acct],
  }),
}));

export const extraFeaturesDetail = pgTable(
  "extra_features_detail",
  {
    id: serial("id").primaryKey(),
    acct: text("acct").notNull(),
    cd: text("cd"),
    dscr: text("dscr"),
    grade: text("grade"),
    condCd: text("cond_cd"),
    bldNum: integer("bld_num"),
    length: text("length"),
    width: text("width"),
    units: text("units"),
    unitPrice: text("unit_price"),
    adjUnitPrice: text("adj_unit_price"),
    pctComp: text("pct_comp"),
    actYr: integer("act_yr"),
    effYr: integer("eff_yr"),
    rollYr: integer("roll_yr"),
    dt: text("dt"),
    pctCond: text("pct_cond"),
    dprVal: text("dpr_val"),
    note: text("note"),
    asdVal: text("asd_val"),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ([
    index("efd_acct_idx").on(table.acct),
  ])
);

export const extraFeaturesDetailRelations = relations(extraFeaturesDetail, ({ one }) => ({
  property: one(propertyData, {
    fields: [extraFeaturesDetail.acct],
    references: [propertyData.acct],
  }),
}));