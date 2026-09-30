CREATE TABLE "principal_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_name" text NOT NULL,
	"sender_role" text DEFAULT 'Parent' NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"category" text DEFAULT 'General Query' NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
