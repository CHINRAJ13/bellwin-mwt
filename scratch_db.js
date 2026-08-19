const mongoose = require('mongoose');
const Expense = require('./backend/models/Expense');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/belwin_erp');
  console.log('Connected');
  const expenses = await Expense.find();
  console.log('Expenses:', JSON.stringify(expenses, null, 2));
  await mongoose.disconnect();
}

test().catch(console.error);
