import { config } from "dotenv";
import { defineConfig } from "prisma/config";
import { resolve } from "path";

// Load .env.local explicitly
config({ path: resolve(process.cwd(), ".env.local") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use DIRECT_URL for Prisma CLI (migrations, introspection)
    // This is the direct connection to the database (port 5432)
    url: process.env["DIRECT_URL"]!,
  },
});
