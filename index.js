const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Transaction=require('./models/transaction.js');
const { default: mongoose } = require('mongoose');
const app=express();
const port=process.env.PORT || 4039;
app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
});

app.use(cors());
app.use(express.json());
app.get('/api/test', (req,res, next) => {
  res.json('test ok2'); // Send a JSON object
});

app.post('/api/transaction', async (req, res,next) => {
  const { name, price, description, datetime, category } = req.body;

  try {
    const newTransaction = new Transaction({ name, price, description, datetime, category }); // Include the category
    await newTransaction.save();
    res.json(newTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/transactions',async(req,res,next)=>{
  await mongoose.connect(process.env.MONGO_URL);
  const transactions = await Transaction.find();
  res.json(transactions);
});
