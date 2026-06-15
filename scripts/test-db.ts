import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

async function main() {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    const result = await sql`SELECT 1 AS ok`;
    console.log("Database connection successful.", result);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

main();
