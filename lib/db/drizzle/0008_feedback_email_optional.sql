-- Admissions page ka inline feedback form email nahi maangta. Feedback email
-- ko optional karo taaki wahan se submit hone wali feedback 400 se fail na ho.
ALTER TABLE "feedback_submissions" ALTER COLUMN "email" DROP NOT NULL;
