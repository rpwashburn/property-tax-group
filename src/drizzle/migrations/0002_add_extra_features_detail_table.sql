CREATE TABLE "extra_features_detail" (
	"id" serial PRIMARY KEY NOT NULL,
	"acct" text NOT NULL,
	"cd" text,
	"dscr" text,
	"grade" text,
	"cond_cd" text,
	"bld_num" integer,
	"length" numeric,
	"width" numeric,
	"units" numeric,
	"unit_price" numeric,
	"adj_unit_price" numeric,
	"pct_comp" numeric,
	"act_yr" integer,
	"eff_yr" integer,
	"roll_yr" integer,
	"dt" text,
	"pct_cond" numeric,
	"dpr_val" integer,
	"note" text,
	"asd_val" integer
);
--> statement-breakpoint
DROP INDEX "se_acct_bld_code_idx";--> statement-breakpoint
CREATE INDEX "efd_acct_idx" ON "extra_features_detail" USING btree ("acct");