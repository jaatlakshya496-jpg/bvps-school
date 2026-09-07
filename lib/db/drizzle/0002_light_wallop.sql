ALTER TABLE "feedback_submissions" ADD COLUMN "role" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback_submissions" ADD COLUMN "category" text DEFAULT '' NOT NULL;