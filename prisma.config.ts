import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js loads .env.local automatically at runtime, but Prisma CLI does not.
// Load it explicitly so migrate/generate commands can read DATABASE credentials.
config({ path: ".env.local" });

// DIRECT_URL is only required for migration commands, not for prisma generate.
// Using process.env directly (instead of env()) avoids throwing when the variable
// is absent during CI or local runs that only need client generation.
export default defineConfig({
  schema: "prisma/schema.prisma",
  ...(process.env.DIRECT_URL
    ? { datasource: { url: process.env.DIRECT_URL } }
    : {}),
});
