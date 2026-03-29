import express from "express";
import {
  getRecurringTransactions,
  createRecurringTransaction,
  toggleRecurringTransaction,
  deleteRecurringTransaction,
} from "../controllers/recurringController.js";
import { verifyAuth } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createRecurringSchema } from "../middleware/schemas.js";

const router = express.Router();

router.use(verifyAuth);

router.get("/", getRecurringTransactions);
router.post("/", validateRequest(createRecurringSchema), createRecurringTransaction);
router.put("/:id/toggle", toggleRecurringTransaction);
router.delete("/:id", deleteRecurringTransaction);

export default router;
