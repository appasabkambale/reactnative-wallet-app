import {neon} from "@neondatabase/serverless";

import "dotenv/config";

// Create a SQL client using the Neon serverless database
export const sql = neon(process.env.DATABASE_URL)