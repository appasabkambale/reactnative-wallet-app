import cron from "cron";
import http from "http";
import https from "https";

const PORT = process.env.PORT || 5001;
const PING_URL = process.env.API_URL || `http://localhost:${PORT}/api/health`;

const job = new cron.CronJob("*/14 * * * *", function () {
  try {
    const client = PING_URL.startsWith("https") ? https : http;

    client
      .get(PING_URL, (res) => {
        if (res.statusCode === 200) {
          console.log("Cron ping: OK");
        } else {
          console.log("Cron ping: unexpected status", res.statusCode);
        }
      })
      .on("error", (err) => {
        console.error("Cron ping failed:", err.message);
      });
  } catch (err) {
    console.error("Cron job error:", err.message);
  }
});

// Run every hour at minute 0
import { processRecurringTransactions } from "../controllers/recurringController.js";
const recurringJob = new cron.CronJob("0 * * * *", function () {
  console.log("Triggering hourly recurring transaction processing...");
  processRecurringTransactions();
});

// Export both (or simply start the second one here if the default export is only the first)
export { recurringJob };
export default job;