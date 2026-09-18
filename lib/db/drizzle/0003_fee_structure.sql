CREATE TABLE "fee_structure" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"subtitle" text,
	"admission" integer DEFAULT 0 NOT NULL,
	"monthly" integer DEFAULT 0 NOT NULL,
	"annual_fund" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
