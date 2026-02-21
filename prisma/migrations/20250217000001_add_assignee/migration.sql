-- Add assigneeId column to stories table
ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "assigneeId" TEXT;

-- Add foreign key constraint
ALTER TABLE "stories" ADD CONSTRAINT "stories_assigneeId_fkey" 
    FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
