-- Create InvitationStatus enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InvitationStatus') THEN
        CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');
    END IF;
END $$;

-- Drop default if exists
ALTER TABLE "invitations" ALTER COLUMN "status" DROP DEFAULT;

-- Alter status column to use enum
ALTER TABLE "invitations" 
    ALTER COLUMN "status" TYPE "InvitationStatus" 
    USING "status"::"InvitationStatus";

-- Set default value
ALTER TABLE "invitations" 
    ALTER COLUMN "status" SET DEFAULT 'PENDING'::"InvitationStatus";
