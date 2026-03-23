import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set. Please set it in your deployment dashboard.");
}

// Auto-strip square brackets from password if the user copied from a template like [password]
let cleanUrl = databaseUrl;
if (cleanUrl.includes(":[") && cleanUrl.includes("]@")) {
  cleanUrl = cleanUrl.replace(":[", ":").replace("]@", "@");
  console.log("Automatically cleaned square brackets from DATABASE_URL password.");
}

// Supabase works best with the 'postgres' package for direct tagged template queries
export const sql = postgres(cleanUrl, {
  ssl: 'require',
  connect_timeout: 10,
  max: 1, // Minimize connections in serverless environment
});
