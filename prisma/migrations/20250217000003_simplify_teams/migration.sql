-- Drop foreign key constraints first
ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "team_members_teamId_fkey";
ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "team_members_userId_fkey";
ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_teamId_fkey";

-- Drop team_members table
DROP TABLE IF EXISTS "team_members";

-- Drop teams table
DROP TABLE IF EXISTS "teams";

-- Drop teamId from projects
ALTER TABLE "projects" DROP COLUMN IF EXISTS "teamId";

-- Add color column to projects
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "color" TEXT;

-- Create project_members table
CREATE TABLE "project_members" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- Create unique index
CREATE UNIQUE INDEX "project_members_projectId_userId_key" ON "project_members"("projectId", "userId");

-- Add foreign keys
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_projectId_fkey" 
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add owner as project member for existing projects
INSERT INTO "project_members" ("id", "role", "projectId", "userId")
SELECT 
    gen_random_uuid()::text,
    'ADMIN',
    "id",
    "ownerId"
FROM "projects"
WHERE NOT EXISTS (
    SELECT 1 FROM "project_members" WHERE "project_members"."projectId" = "projects"."id"
);
