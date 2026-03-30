import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimiter from "./middleware/rateLimiter.js";
import transactionsRoute from "./routes/transactionsRoute.js";
import budgetRoute from "./routes/budgetRoute.js";
import recurringRoute from "./routes/recurringRoute.js";
import { initDB } from "./config/db.js";
import job, { recurringJob } from "./config/cron.js";
import logger from "./utils/logger.js";


dotenv.config();

const app = express();

if(process.env.NODE_ENV === "production") {
    job.start();
    recurringJob.start();
}

// middleware
app.use(helmet());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev")); // Logs HTTP method, URL, status code, and response time
app.use(rateLimiter);
app.use(express.json());

// Global Cache-Control for all APIs to prevent aggressive client-side caching (e.g. React Native fetch)
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

const PORT = process.env.PORT || 5001;

// Global health check for load balancers
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.get("/api/v1/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/api/v1/transactions", transactionsRoute);
app.use("/api/v1/budgets", budgetRoute);
app.use("/api/v1/recurring", recurringRoute);

initDB().then(() => {
    app.listen(PORT, () => {
        logger.info(`Server is running on port: ${PORT}`);
    });
});


// nodemon server.js