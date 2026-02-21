-- Create StoryType enum
CREATE TYPE "StoryType" AS ENUM ('FEATURE', 'FIX');

-- Add type column to stories table with default value
ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "type" "StoryType" NOT NULL DEFAULT 'FEATURE';
