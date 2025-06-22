import express from "express";
import dotenv from "dotenv";
import { sql } from "./config/db.js";

dotenv.config();

const app = express();

// middleware
app.use(express.json());

// our custom simple middleware
// app.use((req, res, next) => {
//   console.log("Hey we hit a req, the method is", req.method);
//   next();
// });

const PORT = process.env.PORT || 5001;

async function initDB(){
    try {
      await sql`CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY, 
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE
      )`;  

      console.log("Database initialized successfully");
    } catch (error) {
      console.log("Error initializing database:", error);
      process.exit(1); // Status code 1 means failure, 0 means success
    } 
}

app.get("/api/transactions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const transactions = await sql`
    SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC
    `;

    res.status(200).json(transactions);
  } catch (error) {
    console.log("Error getting transaction:", error);
    res.status(500).json({message: "Internal server error"});
  }
});

app.post("/api/transactions", async (req, res) => {
  
  try {
    const {title,amount,category,user_id}= req.body;

    if(!title || !category || !user_id || amount === undefined){
      return res.status(400).json({message: "Please fill all the fields"});
    }

      
    const transaction = await sql`
    INSERT INTO transactions (user_id, title, amount, category) 
    VALUES (${user_id}, ${title}, ${amount}, ${category})
    RETURNING *
    `;

    console.log(transaction);
    res.status(201).json(transaction[0]);
  } catch (error){
    console.log("Error creating transaction:", error);
    res.status(500).json({message: "Internal server error"});
  }
});

app.get("/", (req, res) => {
    res.send("Welcome to the Expense Tracker API");
});

initDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server is running on port:", PORT);
    });
});





// nodemon server.js