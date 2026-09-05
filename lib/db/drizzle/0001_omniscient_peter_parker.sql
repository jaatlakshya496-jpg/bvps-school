ALTER TABLE "admission_enquiries" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "admission_enquiries" ADD COLUMN "dob" text NOT NULL;--> statement-breakpoint
ALTER TABLE "admission_enquiries" ADD COLUMN "gender" text NOT NULL;--> statement-breakpoint
ALTER TABLE "admission_enquiries" ADD COLUMN "stream" text;--> statement-breakpoint
ALTER TABLE "admission_enquiries" ADD COLUMN "relation" text;--> statement-breakpoint
ALTER TABLE "admission_enquiries" ADD COLUMN "previous_school" text;--> statement-breakpoint
ALTER TABLE "admission_enquiries" ADD COLUMN "message" text;