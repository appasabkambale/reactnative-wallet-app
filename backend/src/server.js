import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import rateLimiter from "./middleware/rateLimiter.js";
import transactionsRoute from "./routes/transactionsRoute.js";
import budgetRoute from "./routes/budgetRoute.js";
import recurringRoute from "./routes/recurringRoute.js";
import { initDB } from "./config/db.js";
import job, { recurringJob } from "./config/cron.js";

dotenv.config();

const app = express();

if(process.env.NODE_ENV === "production") {
    job.start();
    recurringJob.start();
}

// middleware
app.use(cors());
app.use(morgan("dev")); // Logs HTTP method, URL, status code, and response time
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

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/api/transactions", transactionsRoute);
app.use("/api/budgets", budgetRoute);
app.use("/api/recurring", recurringRoute);

initDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server is running on port:", PORT);
    });
});


// nodemon server.js