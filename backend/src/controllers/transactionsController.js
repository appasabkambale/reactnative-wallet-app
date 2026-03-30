import * as transactionService from "../services/transactionService.js";
import logger from "../utils/logger.js";

export async function getTransactionsByUserId(req, res) {
      try {
        const transactions = await transactionService.getTransactionsByUserIdService(req.user.id);
        res.status(200).json(transactions);
      } catch (error) {
        logger.error("Error getting transaction:", error);
        res.status(500).json({message: "Internal server error"});
      }
}

export async function createTransaction(req, res) {
    try {
        const { title, amount, category } = req.body;
    
        const transaction = await transactionService.createTransactionService(req.user.id, { title, amount, category });
    
        res.status(201).json(transaction);
        } catch (error){
        logger.error("Error creating transaction:", error);
        if (error.code === 'VALIDATION') {
          return res.status(400).json({ message: error.message });
        }
        res.status(500).json({message: "Internal server error"});
      }
}

export async function deleteTransaction(req, res) {
      try {
        const parsedId = parseInt(req.params.id);
    
        if(isNaN(parsedId)){
          return res.status(400).json({ message: "Invalid transaction ID" });
        }
    
        await transactionService.deleteTransactionService(req.user.id, parsedId);
    
        res.status(200).json({ message: "Transaction deleted successfully" });
      } catch (error) {
        logger.error("Error deleting transaction:", error);
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({message: "Transaction not found"});
        }
        res.status(500).json({ message: "Internal server error" });
      }
    
}

export async function getSummaryByUserId(req, res) {
      try {
        const summaryPayload = await transactionService.getSummaryByUserIdService(req.user.id);
        res.status(200).json(summaryPayload);
      } catch (error) {
        logger.error("Error getting the summary:", error);
        res.status(500).json({ message: "Internal server error" });
      }
}

export async function getAnalytics(req, res) {
  try {
    const { month, year } = req.query;
    const analytics = await transactionService.getAnalyticsService(req.user.id, month, year);
    res.status(200).json(analytics);
  } catch (error) {
    logger.error("Error getting analytics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function searchTransactions(req, res) {
  try {
    const result = await transactionService.searchTransactionsService(req.user.id, req.query);
    res.status(200).json(result);
  } catch (error) {
    logger.error("Error searching transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function exportTransactions(req, res) {
  try {
    const { dateFrom, dateTo, format = 'csv' } = req.query;
    const transactions = await transactionService.exportTransactionsService(req.user.id, { dateFrom, dateTo });

    if (format === 'csv') {
      const header = 'Date,Title,Category,Amount\n';
      const rows = transactions.map((t) => {
        const date = new Date(t.created_at).toISOString().split('T')[0];
        const title = `"${(t.title || '').replace(/"/g, '""')}"`;
        const category = `"${(t.category || '').replace(/"/g, '""')}"`;
        const amount = Number(t.amount);
        return `${date},${title},${category},${amount}`;
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
      return res.send(header + rows);
    }
    
    if (format === 'pdf') {
      const PDFDocument = (await import('pdfkit')).default;
      const doc = new PDFDocument({ margin: 50 });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="transactions.pdf"');
      doc.pipe(res);
      
      // Header
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#111827').text('Cashence - Transactions', { align: 'center' });
      const drText = (dateFrom && dateTo) ? `${dateFrom} to ${dateTo}` : 'All Time';
      doc.fontSize(10).font('Helvetica').fillColor('#6B7280').text(drText, { align: 'center' });
      doc.moveDown(2);
      
      // Table configuration
      const tableTop = doc.y;
      const itemX = 50;
      const categoryX = 180;
      const amountX = 400;
      const rowHeight = 30;
      
      // Table Header Row
      doc.rect(50, tableTop - 5, 500, rowHeight).fill('#F3F4F6');
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#374151');
      doc.text('DATE & TITLE', itemX + 10, tableTop + 5);
      doc.text('CATEGORY', categoryX, tableTop + 5);
      doc.text('AMOUNT', amountX, tableTop + 5, { width: 90, align: 'right' });
      
      let currentY = tableTop + rowHeight;
      let totalAmount = 0;
      
      // Table Rows
      transactions.forEach((t, i) => {
        // Add a new page if we run out of space
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }

        const amount = Number(t.amount);
        totalAmount += amount;
        
        // Alternating row background
        if (i % 2 === 0) {
          doc.rect(50, currentY - 5, 500, rowHeight).fill('#F9FAFB');
        }

        const date = new Date(t.created_at).toISOString().split('T')[0];
        const titleText = t.title ? (t.title.length > 20 ? t.title.substring(0, 20) + '...' : t.title) : 'Untitled';
        
        doc.font('Helvetica').fontSize(10).fillColor('#111827');
        doc.text(`${date}  ${titleText}`, itemX + 10, currentY + 5);
        
        doc.fillColor('#6B7280').text(t.category, categoryX, currentY + 5);
        
        // Color amount based on positive/negative
        const amtColor = amount >= 0 ? '#10B981' : '#EF4444';
        const formattedAmt = `${amount >= 0 ? '+' : ''}${amount.toLocaleString('en-IN')}`;
        doc.font('Helvetica-Bold').fillColor(amtColor).text(formattedAmt, amountX, currentY + 5, { width: 90, align: 'right' });
        
        // Draw bottom border
        doc.moveTo(50, currentY + rowHeight - 5).lineTo(550, currentY + rowHeight - 5).lineWidth(0.5).strokeColor('#E5E7EB').stroke();
        
        currentY += rowHeight;
      });
      
      // Summary Footer
      currentY += 10;
      doc.rect(350, currentY, 200, 40).fill('#111827');
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#FFFFFF');
      doc.text('Net Total:', 365, currentY + 14);
      
      const totalColor = totalAmount >= 0 ? '#34D399' : '#F87171';
      doc.fillColor(totalColor).text(`${totalAmount >= 0 ? '+' : ''}${totalAmount.toLocaleString('en-IN')}`, 430, currentY + 14, { width: 105, align: 'right' });
      
      doc.end();
      return;
    }

    res.status(200).json(transactions);
  } catch (error) {
    logger.error("Error exporting transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
