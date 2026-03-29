import * as recurringService from "../services/recurringService.js";

export async function getRecurringTransactions(req, res) {
  try {
    const items = await recurringService.getRecurringTransactionsService(req.user.id);
    res.status(200).json(items);
  } catch (error) {
    console.log("Error getting recurring transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createRecurringTransaction(req, res) {
  try {
    const { title, amount, category, frequency } = req.body;

    const item = await recurringService.createRecurringTransactionService(req.user.id, { title, amount, category, frequency });
    res.status(201).json(item);
  } catch (error) {
    console.log("Error creating recurring transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function toggleRecurringTransaction(req, res) {
  try {
    const parsedId = parseInt(req.params.id);
    if(isNaN(parsedId)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const updated = await recurringService.toggleRecurringTransactionService(req.user.id, parsedId);
    res.status(200).json(updated);
  } catch (error) {
    console.log("Error toggling recurring transaction:", error);
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteRecurringTransaction(req, res) {
  try {
    const parsedId = parseInt(req.params.id);
    if(isNaN(parsedId)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    await recurringService.deleteRecurringTransactionService(req.user.id, parsedId);
    res.status(200).json({ message: "Recurring transaction deleted" });
  } catch (error) {
    console.log("Error deleting recurring transaction:", error);
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Called by the cron job to process due recurring transactions.
 * Creates actual Transaction entries and advances next_run.
 */
export async function processRecurringTransactions() {
  try {
    await recurringService.processRecurringTransactionsService();
  } catch (error) {
    console.error("Error processing recurring transactions:", error);
  }
}
