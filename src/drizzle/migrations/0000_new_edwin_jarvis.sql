CREATE TABLE "fixtures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"acct" text NOT NULL,
	"bld_num" text NOT NULL,
	"type" text NOT NULL,
	"type_dscr" text NOT NULL,
	"units" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "neighborhood_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"group_code" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"acct" varchar(13) NOT NULL,
	"str_num" varchar(10),
	"str" varchar(50),
	"str_sfx" varchar(10),
	"str_sfx_dir" varchar(10),
	"site_addr_1" varchar(100),
	"site_addr_2" varchar(100),
	"site_addr_3" varchar(100),
	"state_class" varchar(10),
	"school_dist" varchar(10),
	"neighborhood_code" varchar(10),
	"neighborhood_grp" varchar(100),
	"market_area_1" varchar(10),
	"market_area_1_dscr" varchar(100),
	"market_area_2" varchar(10),
	"market_area_2_dscr" varchar(100),
	"econ_area" varchar(10),
	"econ_bld_class" varchar(10),
	"yr_impr" varchar(10),
	"yr_annexed" varchar(10),
	"bld_ar" varchar(10),
	"land_ar" varchar(10),
	"acreage" varchar(10),
	"land_val" varchar(20),
	"bld_val" varchar(20),
	"x_features_val" varchar(20),
	"ag_val" varchar(20),
	"assessed_val" varchar(20),
	"tot_appr_val" varchar(20),
	"tot_mkt_val" varchar(20),
	"prior_land_val" varchar(20),
	"prior_bld_val" varchar(20),
	"prior_x_features_val" varchar(20),
	"prior_ag_val" varchar(20),
	"prior_tot_appr_val" varchar(20),
	"prior_tot_mkt_val" varchar(20),
	"new_construction_val" varchar(20),
	"tot_rcn_val" varchar(20),
	"value_status" varchar(50),
	"noticed" varchar(1),
	"notice_dt" varchar(10),
	"protested" varchar(1),
	"certified_date" varchar(10),
	"rev_dt" varchar(10),
	"rev_by" varchar(10),
	"new_own_dt" varchar(10),
	"lgl_1" varchar(100),
	"jurs" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "structural_elements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"acct" varchar(13) NOT NULL,
	"bld_num" varchar(10) NOT NULL,
	"code" varchar(10) NOT NULL,
	"adj" varchar(20),
	"type" varchar(10) NOT NULL,
	"type_dscr" varchar(100) NOT NULL,
	"category_dscr" varchar(100) NOT NULL,
	"dor_cd" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "fixtures_acct_bld_type_idx" ON "fixtures" USING btree ("acct","bld_num","type");--> statement-breakpoint
CREATE UNIQUE INDEX "acct_idx" ON "property_data" USING btree ("acct");--> statement-breakpoint
CREATE INDEX "se_acct_bld_type_idx" ON "structural_elements" USING btree ("acct","bld_num","type");