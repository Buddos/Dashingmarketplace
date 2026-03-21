import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // We throw here but the handler will catch it and provide a 500 with a clear message
  throw new Error("DATABASE_URL environment variable is not set. Please set it in your deployment dashboard.");
}

// Supabase works best with the 'postgres' package for direct tagged template queries
export const sql = postgres(databaseUrl);
