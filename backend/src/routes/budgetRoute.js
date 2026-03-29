import express from "express";
import {
  getBudgets,
  setBudget,
  deleteBudget,
} from "../controllers/budgetController.js";
import { verifyAuth } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { setBudgetSchema } from "../middleware/schemas.js";

const router = express.Router();

router.use(verifyAuth);

router.get("/", getBudgets);
router.post("/", validateRequest(setBudgetSchema), setBudget);
router.delete("/:id", deleteBudget);

export default router;
