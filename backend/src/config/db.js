import pkg from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";

const { PrismaClient } = pkg;
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// Handle idle connection errors instead of crashing the app
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err.message);
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

export async function initDB() {
    try {
        // Just attempts a connection to verify DB is reachable
        await prisma.$connect();
        console.log("Database connected successfully via Prisma");
    } catch (error) {
        console.log("Error connecting to database:", error);
        process.exit(1); // Status code 1 means failure, 0 means success
    } 
}