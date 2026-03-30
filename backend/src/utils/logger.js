import winston from "winston";
import dotenv from "dotenv";

dotenv.config();

const logFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    process.env.NODE_ENV === "production" ? winston.format.json() : winston.format.combine(winston.format.colorize(), logFormat)
  ),
  defaultMeta: { service: "cashence-api" },
  transports: [
    new winston.transports.Console()
  ],
});

export default logger;
