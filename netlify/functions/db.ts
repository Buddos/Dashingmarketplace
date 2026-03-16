import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

// Supabase works best with the 'postgres' package for direct tagged template queries
export const sql = postgres(process.env.DATABASE_URL);
