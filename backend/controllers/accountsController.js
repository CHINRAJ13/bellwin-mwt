const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Payment = require('../models/Payment');

const AccountsGroup = require('../models/accounts/AccountsGroup');
const Ledger = require('../models/accounts/Ledger');
const PaymentVoucher = require('../models/accounts/PaymentVoucher');
const ReceiveVoucher = require('../models/accounts/ReceiveVoucher');
const JournalVoucher = require('../models/accounts/JournalVoucher');
const ContraVoucher = require('../models/accounts/ContraVoucher');
const BankDeposit = require('../models/accounts/BankDeposit');
const BankWithdrawal = require('../models/accounts/BankWithdrawal');

// Helper to fetch and normalize all transactions
const getUnifiedTransactions = async (filters = {}) => {
  const { fromDate, toDate } = filters;
  
  const dateFilter = {};
  if (fromDate || toDate) {
    if (fromDate) dateFilter.$gte = new Date(fromDate);
    if (toDate) dateFilter.$lte = new Date(toDate);
  }

  const queryPayment = Object.keys(dateFilter).length > 0 ? { voucherDate: dateFilter } : {};
  const queryReceipt = Object.keys(dateFilter).length > 0 ? { receiptDate: dateFilter } : {};
  const queryJournal = Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {};
  const queryDeposit = Object.keys(dateFilter).length > 0 ? { depositDate: dateFilter } : {};
  const queryWithdrawal = Object.keys(dateFilter).length > 0 ? { withdrawalDate: dateFilter } : {}; // Assuming withdrawalDate

  // Fetch all vouchers
  const [payments, receipts, journals, deposits, withdrawals] = await Promise.all([
    PaymentVoucher.find(queryPayment).lean(),
    ReceiveVoucher.find(queryReceipt).lean(),
    JournalVoucher.find(queryJournal).lean(),
    BankDeposit.find(queryDeposit).lean(),
    BankWithdrawal.find(queryWithdrawal).lean()
  ]);

  let transactions = [];

  payments.forEach(p => {
    transactions.push({
      _id: p._id,
      date: p.voucherDate,
      voucherNo: p.voucherNo,
      type: 'Payment',
      debitLedger: p.ledger,
      creditLedger: p.paymentMode === 'Bank' ? 'Bank Account' : 'Cash Account',
      amount: p.amount,
      narration: p.remarks || `Paid to ${p.paidTo}`,
      mode: p.paymentMode
    });
  });

  receipts.forEach(r => {
    transactions.push({
      _id: r._id,
      date: r.receiptDate,
      voucherNo: r.voucherNo,
      type: 'Receipt',
      debitLedger: r.paymentMode === 'Bank' ? 'Bank Account' : 'Cash Account',
      creditLedger: r.ledger,
      amount: r.amount,
      narration: r.remarks || `Received from ${r.receivedFrom}`,
      mode: r.paymentMode
    });
  });

  journals.forEach(j => {
    transactions.push({
      _id: j._id,
      date: j.date,
      voucherNo: j.journalNo,
      type: 'Journal',
      debitLedger: j.debitLedger,
      creditLedger: j.creditLedger,
      amount: j.amount,
      narration: j.narration,
      mode: 'Journal'
    });
  });

  deposits.forEach(d => {
    transactions.push({
      _id: d._id,
      date: d.depositDate,
      voucherNo: d.depositNo,
      type: 'Bank Deposit',
      debitLedger: d.bankName || 'Bank Account',
      creditLedger: 'Cash Account',
      amount: d.depositAmount,
      narration: d.remarks || `Deposit to ${d.accountNumber}`,
      mode: 'Bank'
    });
  });

  withdrawals.forEach(w => {
    transactions.push({
      _id: w._id,
      date: w.withdrawalDate,
      voucherNo: w.withdrawalNo || w._id, // fallback
      type: 'Bank Withdrawal',
      debitLedger: 'Cash Account',
      creditLedger: w.bankName || 'Bank Account',
      amount: w.withdrawalAmount,
      narration: w.remarks || `Withdrawal from ${w.accountNumber}`,
      mode: 'Bank'
    });
  });

  // Sort by date asc
  transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
  return transactions;
};

// HELPER: Compute Ledger Balances
const computeLedgerBalances = async (transactions) => {
  const ledgers = await Ledger.find().lean();
  
  const balances = {};
  ledgers.forEach(l => {
    balances[l.ledgerName] = {
      opening: l.openingBalance || 0,
      balanceType: l.balanceType || 'Debit',
      debit: 0,
      credit: 0,
      group: l.accountGroup
    };
  });

  transactions.forEach(t => {
    if (balances[t.debitLedger]) balances[t.debitLedger].debit += t.amount;
    if (balances[t.creditLedger]) balances[t.creditLedger].credit += t.amount;
    
    // Implicit ledgers (Cash/Bank) if they don't exist in Ledger master
    if (!balances[t.debitLedger]) balances[t.debitLedger] = { opening: 0, balanceType: 'Debit', debit: t.amount, credit: 0, group: 'Assets' };
    if (!balances[t.creditLedger]) balances[t.creditLedger] = { opening: 0, balanceType: 'Debit', debit: 0, credit: t.amount, group: 'Assets' };
  });

  // Calculate closing
  Object.keys(balances).forEach(key => {
    const b = balances[key];
    let net = b.debit - b.credit;
    if (b.balanceType === 'Credit') {
      net = b.opening + b.credit - b.debit;
      b.closing = net >= 0 ? net : Math.abs(net);
      b.closingType = net >= 0 ? 'Cr' : 'Dr';
    } else {
      net = b.opening + b.debit - b.credit;
      b.closing = net >= 0 ? net : Math.abs(net);
      b.closingType = net >= 0 ? 'Dr' : 'Cr';
    }
  });

  return balances;
};

exports.getTrialBalance = async (req, res, next) => {
  try {
    const transactions = await getUnifiedTransactions(req.query);
    const balances = await computeLedgerBalances(transactions);
    
    const data = Object.keys(balances).map((key, index) => ({
      _id: String(index),
      ledgerName: key,
      openingBalance: balances[key].opening,
      debit: balances[key].debit,
      credit: balances[key].credit,
      closingBalance: `${balances[key].closing} ${balances[key].closingType}`
    })).filter(b => b.openingBalance > 0 || b.debit > 0 || b.credit > 0);

    res.json({ data });
  } catch (error) { next(error); }
};

exports.getCashBook = async (req, res, next) => {
  try {
    const transactions = await getUnifiedTransactions(req.query);
    // Filter transactions involving Cash Account
    const cashTx = transactions.filter(t => t.debitLedger === 'Cash Account' || t.creditLedger === 'Cash Account');
    
    let runningBalance = 0; // Ideally fetch opening balance of Cash Account
    let totalIn = 0;
    let totalOut = 0;

    const data = cashTx.map(t => {
      const isReceipt = t.debitLedger === 'Cash Account';
      const cashIn = isReceipt ? t.amount : 0;
      const cashOut = !isReceipt ? t.amount : 0;
      runningBalance += (cashIn - cashOut);
      totalIn += cashIn;
      totalOut += cashOut;

      return {
        _id: t._id,
        date: t.date ? new Date(t.date).toISOString().split('T')[0] : '',
        voucherNo: t.voucherNo,
        particulars: isReceipt ? t.creditLedger : t.debitLedger,
        cashIn,
        cashOut,
        balance: `${Math.abs(runningBalance)} ${runningBalance >= 0 ? 'Dr' : 'Cr'}`
      };
    });

    res.json({
      data,
      summary: { openingCash: 0, cashIn: totalIn, cashOut: totalOut, closingCash: Math.abs(runningBalance) }
    });
  } catch (error) { next(error); }
};

exports.getBankBook = async (req, res, next) => {
  try {
    const transactions = await getUnifiedTransactions(req.query);
    // Filter transactions involving Bank Account or specific banks
    const bankTx = transactions.filter(t => t.mode === 'Bank' || t.debitLedger.toLowerCase().includes('bank') || t.creditLedger.toLowerCase().includes('bank'));
    
    let runningBalance = 0; 
    let totalIn = 0;
    let totalOut = 0;

    const data = bankTx.map(t => {
      const isReceipt = t.debitLedger.toLowerCase().includes('bank');
      const deposit = isReceipt ? t.amount : 0;
      const withdrawal = !isReceipt ? t.amount : 0;
      runningBalance += (deposit - withdrawal);
      totalIn += deposit;
      totalOut += withdrawal;

      return {
        _id: t._id,
        date: t.date ? new Date(t.date).toISOString().split('T')[0] : '',
        voucherNo: t.voucherNo,
        description: isReceipt ? t.creditLedger : t.debitLedger,
        deposit,
        withdrawal,
        balance: `${Math.abs(runningBalance)} ${runningBalance >= 0 ? 'Dr' : 'Cr'}`
      };
    });

    res.json({
      data,
      summary: { openingBalance: 0, totalDeposit: totalIn, totalWithdrawal: totalOut, closingBalance: Math.abs(runningBalance) }
    });
  } catch (error) { next(error); }
};

exports.getDayBook = async (req, res, next) => {
  try {
    const transactions = await getUnifiedTransactions(req.query);
    let totalReceipts = 0;
    let totalPayments = 0;

    const data = transactions.map(t => {
      if (t.type === 'Receipt' || t.type === 'Bank Deposit') totalReceipts += t.amount;
      if (t.type === 'Payment' || t.type === 'Bank Withdrawal') totalPayments += t.amount;

      return {
        _id: t._id,
        time: t.date ? new Date(t.date).toLocaleTimeString() : '',
        date: t.date ? new Date(t.date).toISOString().split('T')[0] : '',
        voucherNo: t.voucherNo,
        transactionType: t.type,
        customer: t.debitLedger, 
        amount: t.amount,
        paymentMode: t.mode,
        user: t.enteredBy || 'Admin'
      };
    });

    res.json({
      data,
      summary: { 
        totalTransactions: transactions.length, 
        totalReceipts, 
        totalPayments, 
        netCash: totalReceipts - totalPayments 
      }
    });
  } catch (error) { next(error); }
};

exports.getProfitLoss = async (req, res, next) => {
  try {
    const transactions = await getUnifiedTransactions(req.query);
    const balances = await computeLedgerBalances(transactions);
    
    const income = [];
    const expenses = [];
    let totalIncome = 0;
    let totalExpenses = 0;

    Object.keys(balances).forEach((key, i) => {
      const b = balances[key];
      // Basic heuristic if group isn't set perfectly
      if (b.group && b.group.toLowerCase().includes('income')) {
        income.push({ id: i, name: key, amount: b.closing });
        totalIncome += b.closing;
      } else if (b.group && b.group.toLowerCase().includes('expense')) {
        expenses.push({ id: i, name: key, amount: b.closing });
        totalExpenses += b.closing;
      }
    });

    res.json({
      statementData: { income, expenses },
      summary: { 
        totalIncome, 
        totalExpenses, 
        grossProfit: totalIncome - totalExpenses, 
        netProfit: totalIncome - totalExpenses 
      }
    });
  } catch (error) { next(error); }
};

exports.getBalanceSheet = async (req, res, next) => {
  try {
    const transactions = await getUnifiedTransactions(req.query);
    const balances = await computeLedgerBalances(transactions);
    
    const assets = [];
    const liabilities = [];
    const capital = [];
    let totalAssets = 0;
    let totalLiabilities = 0;
    let ownerCapital = 0;

    Object.keys(balances).forEach((key, i) => {
      const b = balances[key];
      if (b.group && b.group.toLowerCase().includes('asset') || key.includes('Account')) {
        assets.push({ id: i, name: key, amount: b.closing });
        totalAssets += b.closing;
      } else if (b.group && b.group.toLowerCase().includes('liabilit')) {
        liabilities.push({ id: i, name: key, amount: b.closing });
        totalLiabilities += b.closing;
      } else if (b.group && b.group.toLowerCase().includes('capital')) {
        capital.push({ id: i, name: key, amount: b.closing });
        ownerCapital += b.closing;
      }
    });

    res.json({
      statementData: { assets, liabilities, capital },
      summary: { 
        totalAssets, 
        totalLiabilities, 
        ownerCapital, 
        netWorth: totalAssets - totalLiabilities 
      }
    });
  } catch (error) { next(error); }
};

exports.getJournalReport = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.fromDate || req.query.toDate) {
      query.date = {};
      if (req.query.fromDate) query.date.$gte = new Date(req.query.fromDate);
      if (req.query.toDate) query.date.$lte = new Date(req.query.toDate);
    }
    
    const journals = await JournalVoucher.find(query).sort({ date: -1 }).lean();
    
    const data = journals.map(j => ({
      _id: j._id,
      journalNo: j.journalNo,
      date: j.date ? new Date(j.date).toISOString().split('T')[0] : '',
      debit: j.debitLedger,
      credit: j.creditLedger,
      amount: j.amount,
      narration: j.narration
    }));

    res.json({ data });
  } catch (error) { next(error); }
};

exports.getLedgerReport = async (req, res, next) => {
  try {
    const { ledger, fromDate, toDate } = req.query;
    if (!ledger) return res.json({ data: [] });

    const transactions = await getUnifiedTransactions({ fromDate, toDate });
    const ledgerTx = transactions.filter(t => t.debitLedger === ledger || t.creditLedger === ledger);
    
    let runningBalance = 0; // Should fetch opening balance

    const data = ledgerTx.map(t => {
      const isDebit = t.debitLedger === ledger;
      const debitAmt = isDebit ? t.amount : 0;
      const creditAmt = !isDebit ? t.amount : 0;
      runningBalance += (debitAmt - creditAmt);

      return {
        _id: t._id,
        date: t.date ? new Date(t.date).toISOString().split('T')[0] : '',
        voucherNo: t.voucherNo,
        particulars: isDebit ? `To ${t.creditLedger}` : `By ${t.debitLedger}`,
        debit: debitAmt,
        credit: creditAmt,
        balance: `${Math.abs(runningBalance)} ${runningBalance >= 0 ? 'Dr' : 'Cr'}`
      };
    });

    res.json({ data });
  } catch (error) { next(error); }
};

// ---------------------------------------------------------
// CRUD Controllers for Accounts Masters & Vouchers
// ---------------------------------------------------------


const createCRUD = (Model) => ({
  getAll: async (req, res) => {
    try {
      const docs = await Model.find().sort({ createdAt: -1 });
      res.status(200).json(docs);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getById: async (req, res) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
      res.status(200).json({ success: true, data: doc });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  create: async (req, res) => {
    try {
      const newDoc = new Model(req.body);
      await newDoc.save();
      res.status(201).json({ success: true, data: newDoc });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
      if (!updatedDoc) return res.status(404).json({ success: false, message: 'Not found' });
      res.status(200).json({ success: true, data: updatedDoc });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
  delete: async (req, res) => {
    try {
      const deletedDoc = await Model.findByIdAndDelete(req.params.id);
      if (!deletedDoc) return res.status(404).json({ success: false, message: 'Not found' });
      res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
});

exports.accountsGroupController = createCRUD(AccountsGroup);
exports.ledgerController = createCRUD(Ledger);
exports.paymentVoucherController = createCRUD(PaymentVoucher);
exports.receiveVoucherController = createCRUD(ReceiveVoucher);
exports.journalVoucherController = createCRUD(JournalVoucher);
exports.contraVoucherController = createCRUD(ContraVoucher);
exports.bankDepositController = createCRUD(BankDeposit);
exports.bankWithdrawalController = createCRUD(BankWithdrawal);

