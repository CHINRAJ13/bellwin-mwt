import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout components
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ComingSoon from './components/ComingSoon';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeeList from './pages/admin/employees/EmployeeList';
import EmployeeForm from './pages/admin/employees/EmployeeForm';
import EmployeeView from './pages/admin/employees/EmployeeView';
import ResetPassword from './pages/admin/employees/ResetPassword';
import Attendance from './pages/admin/employees/Attendance';
import SalaryManagement from './pages/admin/employees/SalaryManagement';
import PromotionDemotion from './pages/admin/employees/PromotionDemotion';
import LiveTracking from './pages/admin/employees/LiveTracking';
import RolesPermissions from './pages/admin/RolesPermissions';
import AdminCustomerApprovalPending from './pages/admin/CustomerApprovalPending';
import LoanCalculator from './pages/admin/loan-config/LoanCalculator';
import LoanScheme from './pages/admin/loan-config/LoanScheme';
import VehicleMaster from './pages/admin/loan-config/VehicleMaster';
import DealerMaster from './pages/admin/loan-config/DealerMaster';
import ItemGroupMaster from './pages/admin/loan-config/ItemGroupMaster';
import PurityMaster from './pages/admin/loan-config/PurityMaster';
import GoldRateMaster from './pages/admin/loan-config/GoldRateMaster';
import LockerMaster from './pages/admin/loan-config/LockerMaster';
import ValuerMaster from './pages/admin/loan-config/ValuerMaster';

// Loan Scheme Managers & Wrapper
import LoanSchemeStandalone from './pages/admin/loan-config/LoanSchemeStandalone';
import ChitFundManager from './pages/admin/loan-config/Loanscheme/ChitFundManager';
import GoldLoanManager from './pages/admin/loan-config/Loanscheme/GoldLoanManager';
import MicroFinanceManager from './pages/admin/loan-config/Loanscheme/MicroFinanceManager';
import PersonalLoanManager from './pages/admin/loan-config/Loanscheme/PersonalLoanManager';
import TwoWheelerLoanManager from './pages/admin/loan-config/Loanscheme/TwoWheelerLoanManager';
import { Landmark, Coins, Wallet, Briefcase, Car } from 'lucide-react';

import ChittySchemeList from './pages/admin/chitty-scheme/ChittySchemeList';
import DailySummaryReportView from './pages/admin/reports/DailySummaryReportView';
import ChittySchemeForm from './pages/admin/chitty-scheme/ChittySchemeForm';
import SchemeAllocationForm from './pages/admin/chitty-scheme/SchemeAllocationForm';
import ChittyGroupForm from './pages/admin/chitty-scheme/ChittyGroupForm';
// Micro Finance
import MicroFinanceScheme from './pages/admin/micro-finance/MicroFinanceScheme';
import MicroFinanceGroupMaster from './pages/admin/micro-finance/MicroFinanceGroupMaster';
import MfiLoanApply from './pages/admin/micro-finance/MfiLoanApply';
// Master Module
import MasterConfig from './pages/admin/master/MasterConfig';
import BranchMaster from './pages/admin/master/BranchMaster';
import EmployeeMaster from './pages/admin/master/EmployeeMaster';
import RoleMaster from './pages/admin/master/RoleMaster';
import RankingMaster from './pages/admin/master/RankingMaster';
import CodeSequence from './pages/admin/master/CodeSequence';
import NewBorrower from './pages/admin/borrower/NewBorrower';
import BorrowerList from './pages/admin/borrower/BorrowerList';
import CustomerEdit from './pages/admin/borrower/CustomerEdit';
import KYCUpload from './pages/admin/borrower/KYCUpload';
import KYCApproval from './pages/admin/borrower/KYCApproval';
import CIBILCheck from './pages/admin/borrower/CIBILCheck';
import BorrowerSynopsis from './pages/admin/borrower/BorrowerSynopsis';
import RepledgeEntry from './pages/admin/repledge/RepledgeEntry';
import RepledgeBankMaster from './pages/admin/repledge/RepledgeBankMaster';
import RepledgeSchemeMaster from './pages/admin/repledge/RepledgeSchemeMaster';
import RepledgeRepaymentMaster from './pages/admin/repledge/RepledgeRepaymentMaster';
import RepledgeSearch from './pages/admin/repledge/RepledgeSearch';
import BorrowerDetailsReport from './pages/admin/borrower/BorrowerDetailsReport';
import BorrowerBlock from './pages/admin/borrower/BorrowerBlock';
import CustomerLedger from './pages/admin/borrower/CustomerLedger';

// Accounts Module
import Denomination from './pages/admin/Denomination';
import LedgerMaster from './pages/admin/accounts/LedgerMaster';
import AccountsGroupMaster from './pages/admin/accounts/AccountsGroupMaster';
import LedgerDetails from './pages/admin/accounts/LedgerDetails';
import PaymentVoucher from './pages/admin/accounts/PaymentVoucher';
import ReceiveVoucher from './pages/admin/accounts/ReceiveVoucher';
import JournalVoucher from './pages/admin/accounts/JournalVoucher';
import ContraVoucher from './pages/admin/accounts/ContraVoucher';
import BankDeposit from './pages/admin/accounts/BankDeposit';
import BankWithdrawal from './pages/admin/accounts/BankWithdrawal';
import JournalReport from './pages/admin/accounts/JournalReport';
import LedgerReport from './pages/admin/accounts/LedgerReport';
import ProfitLoss from './pages/admin/accounts/ProfitLoss';
import TrialBalance from './pages/admin/accounts/TrialBalance';
import BalanceSheet from './pages/admin/accounts/BalanceSheet';
// Reports Module
import LoanAccountLedger from './pages/admin/reports/LoanAccountLedger';
import LoanAccountLedgerNonEMI from './pages/admin/reports/LoanAccountLedgerNonEMI';
import LedgerStatementReport from './pages/admin/reports/LedgerReport';
import CashBookReport from './pages/admin/reports/CashBookReport';
import LoanRequisitionReport from './pages/admin/reports/LoanRequisitionReport';
import LoanRequestReport from './pages/admin/reports/LoanRequestReport';
import LoanApproveReport from './pages/admin/reports/LoanApproveReport';
import LoanDisbursementReport from './pages/admin/reports/LoanDisbursementReport';
import LoanDueReport from './pages/admin/reports/LoanDueReport';
import LoanOverDueReport from './pages/admin/reports/LoanOverDueReport';
import LoanOutstandingReport from './pages/admin/reports/LoanOutstandingReport';
import LoanEmiCollectionReport from './pages/admin/reports/LoanEmiCollectionReport';
import GoldLoanAuctionReport from './pages/admin/reports/GoldLoanAuctionReport';
import MfiApproveReport from './pages/admin/reports/MfiApproveReport';
import MfiDueReport from './pages/admin/reports/MfiDueReport';
import MfiOverDueReport from './pages/admin/reports/MfiOverDueReport';
import MfiOutstandingReport from './pages/admin/reports/MfiOutstandingReport';
import MfiEmiCollectionReport from './pages/admin/reports/MfiEmiCollectionReport';
import MfiLedgerStatement from './pages/admin/reports/MfiLedgerStatement';
import MfiAccountLedger from './pages/admin/reports/MfiAccountLedger';
// Expense Pages
import AddExpense from './pages/admin/Expensive/AddExpense';
import ExpenseReport from './pages/admin/Expensive/ExpenseReport';
import AssetMaster from './pages/admin/AssetMaster';

// Employee Pages
import LoginForm from './components/LoginForm';

// Provide Loan Module
import ProvideLoan from './pages/Provide Loan/ProvideLoan';
import EditLoan from './pages/Provide Loan/EditLoan';
import TopUpLoan from './pages/Provide Loan/TopUpLoan';
import LoanClosure from './pages/Provide Loan/LoanClosure';
import TopUpApproval from './pages/admin/TopUpApproval';

// Remittance
import AddRemittance from './pages/admin/Remmitence/AddRemittance';
import RemittanceHistory from './pages/admin/Remmitence/RemittanceHistory';

// Customer Call
import AddFollowup from './pages/admin/Customer call/AddFollowup';
import CallReport from './pages/admin/Customer call/CallReport';

// Gold Stock
import SendGoldRequest from './pages/Gold stock/SendGoldRequest';
import GoldStockReport from './pages/Gold stock/GoldStockReport';
import ChitGroupManager from './pages/admin/chit-fund/ChitGroupManager';
import ChitMemberManager from './pages/admin/chit-fund/ChitMemberManager';
import ChitContribution from './pages/admin/chit-fund/ChitContribution';
import ChitEvent from './pages/admin/chit-fund/ChitEvent';
import PrizeDisbursement from './pages/admin/chit-fund/PrizeDisbursement';
import ChitReports from './pages/admin/chit-fund/ChitReports';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Base redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />

        {/* Unified Login (no layout) */}
        <Route path="/login" element={<LoginForm title="Access Your Account" />} />

        {/* Admin Layout Routes */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/employees" element={<EmployeeList />} />
          <Route path="/admin/employees/create" element={<EmployeeForm />} />
          <Route path="/admin/employees/edit/:id" element={<EmployeeForm />} />
          <Route path="/admin/employees/view/:id" element={<EmployeeView />} />
          <Route path="/admin/employees/reset-password/:id" element={<ResetPassword />} />
          <Route path="/admin/attendance" element={<Attendance />} />
          <Route path="/admin/salary" element={<SalaryManagement />} />
          <Route path="/admin/roles" element={<RolesPermissions />} />

          {/* Master Module */}
          <Route path="/admin/master/config" element={<MasterConfig />} />
          <Route path="/admin/master/branch" element={<BranchMaster />} />
          <Route path="/admin/master/employee" element={<EmployeeMaster />} />
          <Route path="/admin/master/user-role" element={<RoleMaster />} />
          <Route path="/admin/master/ranking" element={<RankingMaster />} />
          <Route path="/admin/master/code-sequence" element={<CodeSequence />} />
          <Route path="/admin/master/*" element={<ComingSoon />} />

          {/* Provide Loan Routes */}
          <Route path="/admin/provide-loan" element={<ProvideLoan />} />
          <Route path="/admin/provide-loan/edit" element={<EditLoan />} />
          <Route path="/admin/provide-loan/top-up" element={<TopUpLoan />} />
          <Route path="/admin/provide-loan/top-up/approval" element={<TopUpApproval />} />
          <Route path="/admin/provide-loan/closure" element={<LoanClosure />} />

          {/* Borrower Management Routes */}
          <Route path="/admin/borrower/new" element={<NewBorrower />} />

          <Route path="/admin/loan-config/calculator" element={<LoanCalculator />} />
          <Route path="/admin/loan-config/scheme" element={<LoanScheme />} />

          {/* Standalone Loan Schemes Routes */}
          <Route path="/admin/loan-schemes/chit-fund" element={<LoanSchemeStandalone title="Chit Fund Loan" icon={Landmark} ActiveComponent={ChitFundManager} />} />
          <Route path="/admin/loan-schemes/gold" element={<LoanSchemeStandalone title="Gold Loan" icon={Coins} ActiveComponent={GoldLoanManager} />} />
          <Route path="/admin/loan-schemes/personal" element={<LoanSchemeStandalone title="Personal Loan" icon={Wallet} ActiveComponent={PersonalLoanManager} />} />
          <Route path="/admin/loan-schemes/mfi" element={<LoanSchemeStandalone title="Micro Finance Loan" icon={Briefcase} ActiveComponent={MicroFinanceManager} />} />
          <Route path="/admin/loan-schemes/two-wheeler" element={<LoanSchemeStandalone title="Two Wheeler Loan" icon={Car} ActiveComponent={TwoWheelerLoanManager} />} />

          <Route path="/admin/loan-config/vehicle" element={<VehicleMaster />} />
          <Route path="/admin/loan-config/dealer" element={<DealerMaster />} />
          <Route path="/admin/loan-config/item-group" element={<ItemGroupMaster />} />
          <Route path="/admin/loan-config/purity" element={<PurityMaster />} />
          <Route path="/admin/loan-config/gold-rate" element={<GoldRateMaster />} />
          <Route path="/admin/loan-config/locker" element={<LockerMaster />} />
          <Route path="/admin/loan-config/valuer" element={<ValuerMaster />} />

          <Route path="/admin/borrower/new" element={<NewBorrower />} />
          <Route path="/admin/borrower/list" element={<BorrowerList />} />
          <Route path="/admin/borrower/edit" element={<CustomerEdit />} />
          <Route path="/admin/borrower/kyc-upload" element={<KYCUpload />} />
          <Route path="/admin/borrower/kyc-approval" element={<KYCApproval />} />
          <Route path="/admin/borrower/cibil-check" element={<CIBILCheck />} />
          <Route path="/admin/borrower/synopsis" element={<BorrowerSynopsis />} />

          {/* Repledge */}
          <Route path="/admin/repledge/entry" element={<RepledgeEntry />} />
          <Route path="/admin/repledge/bank-master" element={<RepledgeBankMaster />} />
          <Route path="/admin/repledge/scheme-master" element={<RepledgeSchemeMaster />} />
          <Route path="/admin/repledge/repayment-master" element={<RepledgeRepaymentMaster />} />
          <Route path="/admin/repledge/search" element={<RepledgeSearch />} />
          <Route path="/admin/borrower/details-report" element={<BorrowerDetailsReport />} />
          <Route path="/admin/borrower/block" element={<BorrowerBlock />} />
          <Route path="/admin/borrower/ledger" element={<CustomerLedger />} />
          <Route path="/admin/borrower/customer-approval" element={<AdminCustomerApprovalPending />} />

          {/* Accounts Module */}
          <Route path="/admin/denomination" element={<Denomination />} />
          <Route path="/admin/accounts/ledger-master" element={<LedgerMaster />} />
          <Route path="/admin/accounts/ledger-master/:id" element={<LedgerDetails />} />
          <Route path="/admin/accounts/group-master" element={<AccountsGroupMaster />} />
          <Route path="/admin/accounts/payment-voucher" element={<PaymentVoucher />} />
          <Route path="/admin/accounts/receive-voucher" element={<ReceiveVoucher />} />
          <Route path="/admin/accounts/journal-voucher" element={<JournalVoucher />} />
          <Route path="/admin/accounts/contra-voucher" element={<ContraVoucher />} />
          <Route path="/admin/accounts/bank-deposit" element={<BankDeposit />} />
          <Route path="/admin/accounts/bank-withdrawl" element={<BankWithdrawal />} />
          <Route path="/admin/accounts/journal-report" element={<JournalReport />} />
          <Route path="/admin/accounts/ledger-report" element={<LedgerReport />} />
          <Route path="/admin/accounts/profit-loss" element={<ProfitLoss />} />
          <Route path="/admin/accounts/trial-balance" element={<TrialBalance />} />
          <Route path="/admin/accounts/balance-sheet" element={<BalanceSheet />} />

          {/* Reports Module */}
          <Route path="/admin/reports/loan-account-ledger" element={<LoanAccountLedger />} />
          <Route path="/admin/reports/loan-account-ledger-non-emi" element={<LoanAccountLedgerNonEMI />} />
          <Route path="/admin/reports/ledger-statement" element={<LedgerStatementReport />} />
          <Route path="/admin/reports/cash-book-statement" element={<CashBookReport />} />
          <Route path="/admin/reports/loan-requisition-report" element={<LoanRequisitionReport />} />
          <Route path="/admin/reports/loan-approve-report" element={<LoanApproveReport />} />
          <Route path="/admin/reports/loan-disbursement-report" element={<LoanDisbursementReport />} />
          <Route path="/admin/reports/loan-due-report" element={<LoanDueReport />} />
          <Route path="/admin/reports/loan-over-due-report" element={<LoanOverDueReport />} />
          <Route path="/admin/reports/loan-outstanding-report" element={<LoanOutstandingReport />} />
          <Route path="/admin/reports/loan-emi-collection-report" element={<LoanEmiCollectionReport />} />
          <Route path="/admin/reports/gold-loan-auction" element={<GoldLoanAuctionReport />} />
          <Route path="/admin/reports/mfi-approve-report" element={<MfiApproveReport />} />
          <Route path="/admin/reports/mfi-due-report" element={<MfiDueReport />} />
          <Route path="/admin/reports/mfi-over-due-report" element={<MfiOverDueReport />} />
          <Route path="/admin/reports/mfi-outstanding-report" element={<MfiOutstandingReport />} />
          <Route path="/admin/reports/mfi-emi-collection-report" element={<MfiEmiCollectionReport />} />
          <Route path="/admin/reports/mfi-ledger-statement" element={<MfiLedgerStatement />} />
          <Route path="/admin/reports/mfi-account-ledger" element={<MfiAccountLedger />} />
           <Route path="/admin/approval/pending" element={<AdminCustomerApprovalPending />} />
          <Route path="/admin/approval/loan-request-report" element={<LoanRequestReport />} />
          <Route path="/admin/repledge/*" element={<ComingSoon />} />

          <Route path="/admin/employees/downline" element={<ComingSoon />} />
          <Route path="/admin/employees/block" element={<ComingSoon />} />
          <Route path="/admin/employees/icard" element={<ComingSoon />} />
          <Route path="/admin/employees/promotion" element={<PromotionDemotion />} />
          <Route path="/admin/employees/live-tracking" element={<LiveTracking />} />

          {/* Profile & Settings (Placeholders for dropdown links) */}
          <Route path="/admin/profile" element={<ComingSoon />} />
          <Route path="/change-password" element={<ComingSoon />} />

          {/* Chitty Routes */}
          <Route path="/admin/chitty/scheme" element={<ChittySchemeList />} />
          <Route path="/admin/chitty/scheme/create" element={<ChittySchemeForm />} />
          <Route path="/admin/chitty/scheme/edit/:id" element={<ChittySchemeForm />} />
          <Route path="/admin/chitty/scheme-allocation" element={<SchemeAllocationForm />} />
          <Route path="/admin/chitty/scheme-allocation/edit/:id" element={<SchemeAllocationForm />} />
          <Route path="/admin/chitty/group-master" element={<ChittyGroupForm />} />
          <Route path="/admin/chitty/group-master/edit/:id" element={<ChittyGroupForm />} />

          {/* Chit Fund Modules */}
          <Route path="/admin/chit-fund/group" element={<ChitGroupManager />} />
          <Route path="/admin/chit-fund/members" element={<ChitMemberManager />} />
          <Route path="/admin/chit-fund/contributions" element={<ChitContribution />} />
          <Route path="/admin/chit-fund/event" element={<ChitEvent />} />
          <Route path="/admin/chit-fund/disbursement" element={<PrizeDisbursement />} />
          <Route path="/admin/reports/chit-group" element={<ChitReports />} />
          <Route path="/admin/reports/chit-contribution" element={<ChitReports />} />
          <Route path="/admin/reports/chit-collection" element={<ChitReports />} />
          <Route path="/admin/reports/chit-due" element={<ChitReports />} />
          <Route path="/admin/reports/chit-auction" element={<ChitReports />} />
          <Route path="/admin/reports/chit-disbursement" element={<ChitReports />} />
          <Route path="/admin/reports/chit-discount" element={<ChitReports />} />
          <Route path="/admin/reports/chit-member" element={<ChitReports />} />

          <Route path="/admin/reports/daily-summary" element={<DailySummaryReportView />} />
          <Route path="/admin/expense/add" element={<AddExpense />} />
          <Route path="/admin/expense/edit/:id" element={<AddExpense />} />
          <Route path="/admin/expense/report" element={<ExpenseReport />} />
          <Route path="/admin/assets" element={<AssetMaster />} />

          {/* Micro Finance Routes */}
          <Route path="/admin/micro-finance/scheme" element={<MicroFinanceScheme />} />
          <Route path="/admin/micro-finance/group-master" element={<MicroFinanceGroupMaster />} />
          <Route path="/admin/micro-finance/apply" element={<MfiLoanApply />} />
          
          {/* Remittance */}
          <Route path="/admin/remittance/add" element={<AddRemittance />} />
          <Route path="/admin/remittance/history" element={<RemittanceHistory />} />

          {/* Customer Call */}
          <Route path="/admin/customer-call/add" element={<AddFollowup />} />
          <Route path="/admin/customer-call/report" element={<CallReport />} />

          {/* Gold Stock */}
          <Route path="/admin/gold-stock/send-request" element={<SendGoldRequest />} />
          <Route path="/admin/gold-stock/report" element={<GoldStockReport />} />
        </Route>

      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;

