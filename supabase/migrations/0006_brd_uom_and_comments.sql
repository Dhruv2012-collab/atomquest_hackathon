-- Migration 0006: Add BRD Min/Max UoM Types and Manager Comments

-- Postgres does not allow simply updating enum values inline or removing them easily.
-- Since this is an extension of existing types, we can safely add them.
ALTER TYPE uom_type ADD VALUE IF NOT EXISTS 'Numeric (Min)';
ALTER TYPE uom_type ADD VALUE IF NOT EXISTS 'Numeric (Max)';
ALTER TYPE uom_type ADD VALUE IF NOT EXISTS '% (Min)';
ALTER TYPE uom_type ADD VALUE IF NOT EXISTS '% (Max)';

-- Add the manager check-in structured comment
ALTER TABLE goals ADD COLUMN manager_comment TEXT;
