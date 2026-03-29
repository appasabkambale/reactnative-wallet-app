import express from "express";
import { 
    createTransaction, 
    deleteTransaction, 
    getSummaryByUserId, 
    getTransactionsByUserId,
    getAnalytics,
    searchTransactions,
    exportTransactions
} from "../controllers/transactionsController.js";
import { verifyAuth } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createTransactionSchema } from "../middleware/schemas.js";

const router = express.Router();

router.use(verifyAuth);

router.get("/analytics", getAnalytics);
router.get("/search", searchTransactions);
router.get("/export", exportTransactions);
router.get("/summary", getSummaryByUserId);
router.get("/", getTransactionsByUserId);
router.post("/", validateRequest(createTransactionSchema), createTransaction);
router.delete("/:id", deleteTransaction);

export default router;
