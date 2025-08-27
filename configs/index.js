import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Initialize Neon SQL client using the correct environment variable
const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL_CONFIG);

// Initialize Drizzle ORM with the schema
export const db = drizzle(sql, { schema });
