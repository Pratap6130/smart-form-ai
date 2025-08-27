import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config(); // This loads environment variables from .env.local

export default defineConfig({
  schema: "./configs/schema.js",
  dialect: "postgresql",
  dbCredentials: {
    url: 'postgresql://neondb_owner:ayjb2VL6DnXA@ep-divine-grass-a5rlysvq.us-east-2.aws.neon.tech/AI-Form-Builder?sslmode=require', // Ensure the correct variable is used here
  },
});
