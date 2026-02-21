-- Create ProjectRole enum if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProjectRole') THEN
        CREATE TYPE "ProjectRole" AS ENUM ('ADMIN', 'MEMBER');
    END IF;
END $$;

-- Drop the default constraint first
ALTER TABLE "project_members" ALTER COLUMN "role" DROP DEFAULT;

-- Alter project_members table to use the enum
ALTER TABLE "project_members" 
    ALTER COLUMN "role" TYPE "ProjectRole" 
    USING "role"::"ProjectRole";

-- Set default value
ALTER TABLE "project_members" 
    ALTER COLUMN "role" SET DEFAULT 'MEMBER'::"ProjectRole";
