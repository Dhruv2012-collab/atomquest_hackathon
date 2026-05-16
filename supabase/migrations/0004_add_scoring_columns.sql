-- Add scoring tracking columns to goals table
ALTER TABLE goals 
ADD COLUMN actual_value NUMERIC DEFAULT 0,
ADD COLUMN calculated_score NUMERIC DEFAULT 0;
