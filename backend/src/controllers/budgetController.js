import * as budgetService from "../services/budgetService.js";
import logger from "../utils/logger.js";

export async function getBudgets(req, res) {
  try {
    const result = await budgetService.getBudgetsService(req.user.id, req.query.month, req.query.year);
    res.status(200).json(result);
  } catch (error) {
    logger.error("Error getting budgets:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function setBudget(req, res) {
  try {
    const { category, amount, month, year } = req.body;

    const budget = await budgetService.setBudgetService(req.user.id, { category, amount, month, year });
    res.status(201).json(budget);
  } catch (error) {
    logger.error("Error setting budget:", error);
    if (error.code === 'VALIDATION') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteBudget(req, res) {
  try {
    const parsedId = parseInt(req.params.id);
    if(isNaN(parsedId)) {
      return res.status(400).json({ message: "Invalid budget ID" });
    }

    await budgetService.deleteBudgetService(req.user.id, parsedId);
    res.status(200).json({ message: "Budget deleted" });
  } catch (error) {
    logger.error("Error deleting budget:", error);
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
}
