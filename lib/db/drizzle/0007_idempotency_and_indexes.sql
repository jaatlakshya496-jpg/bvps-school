ALTER TABLE "contact_submissions" ADD COLUMN IF NOT EXISTS "submission_key" text;
--> statement-breakpoint
ALTER TABLE "admission_enquiries" ADD COLUMN IF NOT EXISTS "submission_key" text;
--> statement-breakpoint
ALTER TABLE "feedback_submissions" ADD COLUMN IF NOT EXISTS "submission_key" text;
--> statement-breakpoint
ALTER TABLE "principal_messages" ADD COLUMN IF NOT EXISTS "submission_key" text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "contact_submissions_submission_key_idx" ON "contact_submissions" ("submission_key");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "admission_enquiries_submission_key_idx" ON "admission_enquiries" ("submission_key");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "feedback_submissions_submission_key_idx" ON "feedback_submissions" ("submission_key");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "principal_messages_submission_key_idx" ON "principal_messages" ("submission_key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contact_submissions_created_at_idx" ON "contact_submissions" ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admission_enquiries_created_at_idx" ON "admission_enquiries" ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feedback_submissions_created_at_idx" ON "feedback_submissions" ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "principal_messages_created_at_idx" ON "principal_messages" ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blog_posts_status_published_at_idx" ON "blog_posts" ("status", "published_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fee_structure_kind_sort_order_idx" ON "fee_structure" ("kind", "sort_order");
