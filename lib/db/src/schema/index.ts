import { pgTable, text, serial, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { createInsertSchema } from "drizzle-zod";

export const contactSubmissionsTable = pgTable("contact_submissions", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	phone: text("phone").notNull(),
	subject: text("subject").notNull(),
	message: text("message").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactSubmissionsInsertSchema = createInsertSchema(contactSubmissionsTable).omit({ id: true, createdAt: true });
export type ContactSubmissionInsert = z.infer<typeof contactSubmissionsInsertSchema>;
export type ContactSubmission = z.infer<typeof contactSubmissionsTable>;

export const admissionEnquiriesTable = pgTable("admission_enquiries", {
	id: serial("id").primaryKey(),
	studentName: text("student_name").notNull(),
	dob: text("dob").notNull(),
	gender: text("gender").notNull(),
	classApplying: text("class_applying").notNull(),
	stream: text("stream"),
	parentName: text("parent_name").notNull(),
	relation: text("relation"),
	phone: text("phone").notNull(),
	email: text("email"),
	address: text("address").notNull(),
	previousSchool: text("previous_school"),
	message: text("message"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const admissionEnquiriesInsertSchema = createInsertSchema(admissionEnquiriesTable).omit({ id: true, createdAt: true });
export type AdmissionEnquiriesInsert = z.infer<typeof admissionEnquiriesInsertSchema>;
export type AdmissionEnquiries = z.infer<typeof admissionEnquiriesTable>;

export const feedbackSubmissionsTable = pgTable("feedback_submissions", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	role: text("role").notNull().default(""),
	category: text("category").notNull().default(""),
	message: text("message").notNull(),
	rating: integer("rating").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feedbackSubmissionsInsertSchema = createInsertSchema(feedbackSubmissionsTable).omit({ id: true, createdAt: true });
export type FeedbackSubmissionsInsert = z.infer<typeof feedbackSubmissionsInsertSchema>;
export type FeedbackSubmission = z.infer<typeof feedbackSubmissionsTable>;