// Force Node.js to use Google's DNS to resolve MongoDB Atlas SRV records
// (Local/ISP DNS may block SRV lookups causing ECONNREFUSED errors)
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const customerRoutes = require('./routes/customerRoutes');
const customerHistoryRoutes = require('./routes/customerHistoryRoutes');
const customerApprovalRoutes = require('./routes/customerApprovalRoutes');
const loanRoutes = require('./routes/loanRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const repledgeRoutes = require('./routes/repledgeRoutes');
const topupRoutes = require('./routes/topupRoutes');
const reportRoutes = require('./routes/reportRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const assetRoutes = require('./routes/assetRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const denominationRoutes = require('./routes/denominationRoutes');
const followupRoutes = require('./routes/followupRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const remittanceRoutes = require('./routes/remittanceRoutes');
const goldStockRoutes = require('./routes/goldStockRoutes');
const goldRequestRoutes = require('./routes/goldRequestRoutes');
const callLogRoutes = require('./routes/callLogRoutes');
const goldSchemeRoutes = require('./routes/goldSchemeRoutes');
const provideLoanRoutes = require('./routes/provideLoanRoutes');
const customerLedgerRoutes = require('./routes/customerLedgerRoutes');
const loanClosureRoutes = require('./routes/loanClosureRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const rolesRoutes = require('./routes/rolesRoutes');
const hrRoutes = require('./routes/hrRoutes');
const searchRoutes = require('./routes/searchRoutes');
const masterRoutes = require('./routes/masterRoutes');
const accountsRoutes = require('./routes/accountsRoutes');
const loanConfigRoutes = require('./routes/loanConfigRoutes');
const ledgerRoutes = require('./routes/accounts/ledgerRoutes');
const mfiLoanRoutes = require('./routes/mfiLoanRoutes');
const chitFundRoutes = require('./routes/chitFundRoutes');
const chittySchemeRoutes = require('./routes/chittySchemeRoutes');
const chittyGroupRoutes = require('./routes/chittyGroupRoutes');
const schemeAllocationRoutes = require('./routes/schemeAllocationRoutes');
const loanRequestRoutes = require('./routes/loanRequestRoutes');


app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/ledgers', ledgerRoutes);
app.use('/api/customer-history', customerHistoryRoutes);
app.use('/api/customer-approval', customerApprovalRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/repledges', repledgeRoutes);
app.use('/api/topups', topupRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/denominations', denominationRoutes);
app.use('/api/followups', followupRoutes);
app.use('/api/remittances', remittanceRoutes);
// trigger nodemon restart now
app.use('/api/gold-stocks', goldStockRoutes);
app.use('/api/gold-requests', goldRequestRoutes);
app.use('/api/calls', callLogRoutes);
app.use('/api/gold-schemes', goldSchemeRoutes);
app.use('/api/provide-loan', provideLoanRoutes);
app.use('/api/customer-ledger', customerLedgerRoutes);
app.use('/api/loan-closure', loanClosureRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/loan-config', loanConfigRoutes);
app.use('/api/schemes', require('./routes/schemeRoutes'));
app.use('/api/mfi-loans', mfiLoanRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/chit-fund', chitFundRoutes);
app.use('/api/chitty-schemes', chittySchemeRoutes);
app.use('/api/chitty-group', chittyGroupRoutes);
app.use('/api/scheme-allocation', schemeAllocationRoutes);
app.use('/api/loan-requests', loanRequestRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Global Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/belwin_erp';

const { initializeEmployeeIds } = require('./controllers/employeeController');

// Start listening immediately so Render detects the open port
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

mongoose.connect(MONGO_URI)
    .then(async () => {
        // console.log('Connected to MongoDB');
        const ItemGroup = require('./models/ItemGroup');
        await ItemGroup.syncIndexes();
        await initializeEmployeeIds();
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

// Export the app for Vercel serverless functions
module.exports = app;
