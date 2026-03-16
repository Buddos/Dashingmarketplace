<<<<<<< HEAD
import postgres from "postgres";
=======
import { neon } from "@neondatabase/serverless";
>>>>>>> 86e8e5fbc48f94410d2cd32d6e1c1a4c96626341

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

<<<<<<< HEAD
// Supabase works best with the 'postgres' package for direct tagged template queries
export const sql = postgres(process.env.DATABASE_URL);
=======
export const sql = neon(process.env.DATABASE_URL);
>>>>>>> 86e8e5fbc48f94410d2cd32d6e1c1a4c96626341
