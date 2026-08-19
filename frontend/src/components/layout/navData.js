import {
  LayoutDashboard, Users, UserPlus,
  Settings, Database, Sliders, User, Building2, Lock, IdCard, Award,
  Calculator, FileText, Car, Store, Boxes, Diamond, TrendingUp, TrendingDown, Key, UserCheck,
  Upload, CheckCircle, ShieldCheck, FileSearch, ShieldBan, Plus,
  Briefcase, BookOpen, CreditCard, Download, FileEdit, ArrowRightLeft, Landmark, Banknote, ClipboardList,
  Wallet, LayoutGrid, Coins, Box, PhoneCall, PhoneForwarded, Send, History, X,
  CalendarDays, UserCog, ClipboardCheck, MapPin, Shield
} from 'lucide-react';

export const ADMIN_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin-dashboard' },
  {
    id: 'master', label: 'Master', icon: Database,
    children: [
      { label: 'Branch Master', icon: Building2, path: '/admin/master/branch' },
      // { label: 'Employee Master', icon: Users, path: '/admin/master/employee' },
      { label: 'User Role Master', icon: UserCog, path: '/admin/master/user-role' },
      { label: 'Access Type Master', icon: Users, path: '/admin/roles' },
      { label: 'Ranking Master', icon: Award, path: '/admin/master/ranking' },
      { label: 'Code Sequence', icon: Database, path: '/admin/master/code-sequence' },
    ]
  },
  {
    id: 'loan_config', label: 'Loan Configuration', icon: Sliders,
    children: [
      { label: 'Loan Calculator', icon: Calculator, path: '/admin/loan-config/calculator' },
      { label: 'Loan Scheme', icon: FileText, path: '/admin/loan-config/scheme' },
      { label: 'Vehicle Master', icon: Car, path: '/admin/loan-config/vehicle' },
      { label: 'Dealer Master', icon: Store, path: '/admin/loan-config/dealer' },
      { label: 'Locker Master', icon: Key, path: '/admin/loan-config/locker' },
    ]
  },
  {
    id: 'employee', label: 'Employee', icon: Users,
    children: [
      { label: 'Employees List', icon: Users, path: '/admin/employees' },
      { label: 'New Employee', icon: UserPlus, path: '/admin/employees/create' },
      { label: 'Promotion / Demotion', icon: TrendingUp, path: '/admin/employees/promotion' },
      { label: 'Attendance Management', icon: UserCheck, path: '/admin/attendance' },
      { label: 'Salary Management', icon: Calculator, path: '/admin/salary' },
      { label: 'Live Tracking', icon: MapPin, path: '/admin/employees/live-tracking' },
    ]
  },
  {
    id: 'borrower', label: 'Customer', icon: User,
    children: [
      { label: 'New Customer', icon: UserPlus, path: '/admin/borrower/new' },
      { label: 'Customer List', icon: User, path: '/admin/borrower/list' },
      { label: 'CIBIL Check', icon: ShieldCheck, path: '/admin/borrower/cibil-check' },
      { label: 'Customer Block/Unblock', icon: ShieldBan, path: '/admin/borrower/block' },
    ]
  },
  {
    id: 'provide_loan', label: 'Loan', icon: Coins,
    children: [
      { label: 'Provide Loan', icon: Plus, path: '/admin/provide-loan' },
      { label: 'Edit Loan', icon: FileEdit, path: '/admin/provide-loan/edit' },
      { label: 'Top-Up Loan', icon: TrendingUp, path: '/admin/provide-loan/top-up' },
      { label: 'Loan Closure NOC', icon: CheckCircle, path: '/admin/provide-loan/closure' },
    ]
  },
  {
    id: 'chitty', label: 'Chit Fund', icon: Users,
    children: [
      { label: 'Group Master', icon: Building2, path: '/admin/chit-fund/group' },
      { label: 'Member Manager', icon: UserPlus, path: '/admin/chit-fund/members' },
      { label: 'Contributions', icon: Coins, path: '/admin/chit-fund/contributions' },
      { label: 'Chit Event (Draw/Auction)', icon: Award, path: '/admin/chit-fund/event' },
      { label: 'Prize Disbursement', icon: Banknote, path: '/admin/chit-fund/disbursement' },
      { 
        label: 'Reports', icon: FileText,
        children: [
          { label: 'Group Report', icon: FileText, path: '/admin/reports/chit-group' },
          { label: 'Contribution Report', icon: FileText, path: '/admin/reports/chit-contribution' },
          { label: 'Collection Report', icon: FileText, path: '/admin/reports/chit-collection' },
          { label: 'Due Report', icon: FileText, path: '/admin/reports/chit-due' },
          { label: 'Auction/Draw Report', icon: FileText, path: '/admin/reports/chit-auction' },
          { label: 'Prize Disbursement', icon: FileText, path: '/admin/reports/chit-disbursement' },
          { label: 'Discount/Dividend', icon: FileText, path: '/admin/reports/chit-discount' },
          { label: 'Member Statement', icon: FileText, path: '/admin/reports/chit-member' }
        ]
      }
    ]
  },
  {
    id: 'micro_finance', label: 'Micro Finance', icon: Users,
    children: [
      { label: 'Micro Finance Scheme', icon: Users, path: '/admin/micro-finance/scheme' },
      { label: 'Micro Finance Group Master', icon: TrendingUp, path: '/admin/micro-finance/group-master' },
      { label: 'MFI Loan Apply', icon: Plus, path: '/admin/micro-finance/apply' },
      {
        label: 'MFI Loan Reports', icon: FileText,
        children: [
          { label: 'MFI Approved Report', icon: FileText, path: '/admin/reports/mfi-approve-report' },
          { label: 'MFI Due', icon: FileText, path: '/admin/reports/mfi-due-report' },
          { label: 'MFI Overdue', icon: FileText, path: '/admin/reports/mfi-over-due-report' },
          { label: 'MFI Outstanding', icon: FileText, path: '/admin/reports/mfi-outstanding-report' },
          { label: 'MFI EMI Collection', icon: FileText, path: '/admin/reports/mfi-emi-collection-report' },
          { label: 'MFI Loan Statement', icon: FileText, path: '/admin/reports/mfi-ledger-statement' }
        ]
      },
      {
        label: 'MFI Account Ledger', icon: BookOpen,
        children: [
          { label: 'Financial Debit/Credit transactions', icon: FileText, path: '/admin/reports/mfi-account-ledger' }
        ]
      }
    ]
  },
  {
    id: 'reports', label: 'Reports', icon: ClipboardList,
    children: [
      { label: 'Daily Summary Report', icon: FileText, path: '/admin/reports/daily-summary' }
    ]
  },
  {
    id: 'gold_loan_reports', label: 'Gold Loan', icon: Coins,
    children: [
      { label: 'Loan Account Ledger', icon: FileText, path: '/admin/reports/loan-account-ledger' },
      { label: 'Loan Account Ledger Non EMI', icon: FileText, path: '/admin/reports/loan-account-ledger-non-emi' },
      { label: 'Loan Approve Report', icon: FileText, path: '/admin/reports/loan-approve-report' },
      { label: 'Loan Disbursement Report', icon: FileText, path: '/admin/reports/loan-disbursement-report' },
      { label: 'Loan Due Report', icon: FileText, path: '/admin/reports/loan-due-report' },
      { label: 'Loan Over Due Report', icon: FileText, path: '/admin/reports/loan-over-due-report' },
      { label: 'Loan Outstanding Report', icon: FileText, path: '/admin/reports/loan-outstanding-report' },
      { label: 'Ledger Statement', icon: FileText, path: '/admin/reports/ledger-statement' },
      { label: 'Cash Book Statement', icon: FileText, path: '/admin/reports/cash-book-statement' },
      { label: 'Gold Loan Auction Report', icon: FileText, path: '/admin/reports/gold-loan-auction' },
    ]
  },
  {
    id: 'accounts', label: 'Accounts', icon: Briefcase,
    children: [
      { label: 'Ledger Master', icon: BookOpen, path: '/admin/accounts/ledger-master' },
      { label: 'Accounts Group Master', icon: Users, path: '/admin/accounts/group-master' },
      { label: 'Payment Voucher Entry', icon: CreditCard, path: '/admin/accounts/payment-voucher' },
      { label: 'Receive Voucher Entry', icon: Download, path: '/admin/accounts/receive-voucher' },
      { label: 'Journal Voucher Entry', icon: FileEdit, path: '/admin/accounts/journal-voucher' },
      { label: 'Contra Voucher Entry', icon: ArrowRightLeft, path: '/admin/accounts/contra-voucher' },
      { label: 'Bank Deposit Entry', icon: Landmark, path: '/admin/accounts/bank-deposit' },
      { label: 'Bank Withdrawl Entry', icon: Banknote, path: '/admin/accounts/bank-withdrawl' },
      { label: 'Journal Report', icon: FileText, path: '/admin/accounts/journal-report' },
      { label: 'Ledger Report', icon: FileText, path: '/admin/accounts/ledger-report' },
      { label: 'Profit & Loss', icon: TrendingUp, path: '/admin/accounts/profit-loss' },
      { label: 'Trial Balance', icon: FileText, path: '/admin/accounts/trial-balance' },
      { label: 'Balance Sheet', icon: Landmark, path: '/admin/accounts/balance-sheet' },
    ]
  },
  {
    id: 'repledge', label: 'Repledge Section', icon: LayoutGrid,
    children: [
      { label: 'Repledge Entry', icon: FileText, path: '/admin/repledge/entry' },
      { label: 'Repledge Bank Master', icon: Landmark, path: '/admin/repledge/bank-master' },
      { label: 'Repledge Scheme Master', icon: FileText, path: '/admin/repledge/scheme-master' },
      { label: 'Repledge Repayment Master', icon: CreditCard, path: '/admin/repledge/repayment-master' },
      { label: 'Repledge Search', icon: FileSearch, path: '/admin/repledge/search' },
    ]
  },
  {
    id: 'approval', label: 'Approval', icon: Wallet,
    children: [
      { label: 'Pending Approvals', icon: FileText, path: '/admin/approval/pending' },
      { label: 'Loan Application Report', icon: FileText, path: '/admin/reports/loan-requisition-report' },
      { label: 'Loan Request Report', icon: FileText, path: '/admin/approval/loan-request-report' },
    ]
  },
  {
    id: 'customer_call', label: 'Customer Call', icon: PhoneCall,
    children: [
      { label: 'Add Followup', icon: PhoneForwarded, path: '/admin/customer-call/add' },
      { label: 'Call Report', icon: FileText, path: '/admin/customer-call/report' },
    ]
  },
  {
    id: 'remittance', label: 'Remittance', icon: ArrowRightLeft,
    children: [
      { label: 'Add Remittance', icon: Plus, path: '/admin/remittance/add' },
      { label: 'Remittance History', icon: History, path: '/admin/remittance/history' },
    ]
  },
  {
    id: 'gold_stock', label: 'Gold Stock', icon: Diamond,
    children: [
      { label: 'Send Request', icon: Send, path: '/admin/gold-stock/send-request' },
      { label: 'Gold Stock Report', icon: FileText, path: '/admin/gold-stock/report' },
    ]
  },
  {
    id: 'loan_schemes_access', label: 'Loan Schemes Access', icon: FileText,
    children: [
      { label: 'Chit Fund Loan', icon: FileText, path: '/admin/loan-schemes/chit-fund' },
      { label: 'Gold Loan', icon: Coins, path: '/admin/loan-schemes/gold' },
      { label: 'Personal Loan', icon: Wallet, path: '/admin/loan-schemes/personal' },
      { label: 'MFI Loan', icon: Briefcase, path: '/admin/loan-schemes/mfi' },
      { label: 'Two Wheeler Loan', icon: Car, path: '/admin/loan-schemes/two-wheeler' },
    ]
  },
  {
    id: 'expense', label: 'Expenses', icon: TrendingDown, path: '/admin/expense/report'
  },
  {
    id: 'denomination', label: 'Denomination', icon: Banknote, path: '/admin/denomination'
  },
  {
    id: 'asset', label: 'Asset Management', icon: Box, path: '/admin/assets'
  }
];
