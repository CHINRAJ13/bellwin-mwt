import React, { useState } from 'react';
import './LoanAccountLedger.css';
import { 
  Printer, FileText, FileSpreadsheet, RefreshCcw, Search, RotateCcw, 
  IndianRupee, Scale, History, FileCheck, Landmark, CheckCircle, 
  Eye, Download, BadgeCheck, Loader
} from 'lucide-react';
import api from '../../../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import logo from '../../../assets/Logo 1.png';

const LoanAccountLedger = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [loanData, setLoanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchQuery) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/search/loan/${searchQuery}`);
      if (response.data.success && response.data.results.length > 0) {
        setLoanData(response.data.results[0]);
      } else {
        setLoanData(null);
        setError('No loan found');
      }
    } catch (err) {
      console.error(err);
      setError('Error searching loan');
      setLoanData(null);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setSearchQuery('');
    setLoanData(null);
    setError('');
    setActiveTab('overview');
  };

  const handleViewDocument = (docName, url) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <div style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2>${docName}</h2>
          <p>No document uploaded yet.</p>
          <div style="margin-top: 20px; padding: 100px; background: #f3f4f6; border-radius: 8px; border: 2px dashed #cbd5e1;">
            Document Preview Unavailable
          </div>
        </div>
      `);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const drawPDFHeader = async (doc, title) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const companyName = "BELLWIN GROUP OF COMPANIES";
    const textWidth = doc.getTextWidth(companyName);
    
    try {
      const img = new Image();
      const loadPromise = new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      img.src = logo;
      await loadPromise;
      const logoSize = 12;
      const logoX = (pageWidth / 2) - (textWidth / 2) - logoSize - 3;
      const logoY = 6;
      doc.addImage(img, 'PNG', logoX, logoY, logoSize, logoSize);
    } catch (e) {
      console.warn('Could not load logo for PDF');
    }
    
    doc.text(companyName, pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(title, pageWidth / 2, 22, { align: 'center' });
    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  };

  const handleExportPDF = async (action = 'download') => {
    if (!displayData) return;
    const doc = new jsPDF();
    
    await drawPDFHeader(doc, `Loan Account Ledger: ${displayData.loanNumber}`);
    
    const details = Object.entries(displayData)
      .filter(([k]) => k !== 'loanType' && k !== 'goldValue' && k !== 'outstandingPrincipal' && k !== 'outstandingInterest' && k !== 'outstandingBalance' && k !== 'totalCollection' && k !== 'principalPaid' && k !== 'interestPaid' && k !== 'penaltyCollected')
      .map(([key, value]) => [key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), String(value)]);
      
    autoTable(doc, {
      startY: 35,
      head: [['Field', 'Value']],
      body: details,
    });
    
    if (loan.payments && loan.payments.length > 0) {
      doc.addPage();
      await drawPDFHeader(doc, `Transaction History: ${displayData.loanNumber}`);
      const txRows = generateTransactionHistory().map(tx => [tx.date, tx.type, tx.debit, tx.credit, tx.balance, tx.mode, tx.receiptNo, tx.employee]);
      autoTable(doc, {
        startY: 35,
        head: [['Date', 'Type', 'Debit', 'Credit', 'Balance', 'Mode', 'Receipt No', 'Collected By']],
        body: txRows
      });
    }

    if (isGoldLoan && loan.articles && loan.articles.length > 0) {
      doc.addPage();
      await drawPDFHeader(doc, `Gold Articles Pledged: ${displayData.loanNumber}`);
      const goldRows = loan.articles.map(art => [
        art.category || '-',
        art.details || art.jewelDetails || '-',
        art.qty || art.quantity || 0,
        art.purity || '-',
        art.totWt || art.totWeight || 0,
        art.stoneWt || 0,
        art.nettWt || 0,
        `₹${(art.gramRate || 0).toLocaleString()}`,
        `₹${(art.total || 0).toLocaleString()}`
      ]);
      autoTable(doc, {
        startY: 35,
        head: [['Type', 'Name', 'Qty', 'Purity', 'Gross Wt', 'Stone Wt', 'Net Wt', 'Rate', 'Value']],
        body: goldRows
      });
    }
    
    if (action === 'view') {
      window.open(doc.output('bloburl'), '_blank');
    } else {
      doc.save(`Ledger_${displayData.loanNumber}.pdf`);
    }
  };

  const handleExportExcel = async () => {
    if (!displayData) return;
    const workbook = new ExcelJS.Workbook();
    
    // Overview Sheet
    const overviewSheet = workbook.addWorksheet('Overview');
    overviewSheet.columns = [
      { header: 'Field', key: 'field', width: 30 },
      { header: 'Value', key: 'value', width: 40 }
    ];
    Object.entries(displayData).forEach(([key, value]) => {
      overviewSheet.addRow({
         field: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
         value: String(value)
      });
    });
    
    // Gold Details Sheet
    if (isGoldLoan && loan.articles && loan.articles.length > 0) {
      const goldSheet = workbook.addWorksheet('Gold Details');
      goldSheet.columns = [
        { header: 'Ornament Type', key: 'category', width: 20 },
        { header: 'Ornament Name', key: 'details', width: 25 },
        { header: 'Pieces', key: 'qty', width: 10 },
        { header: 'Purity', key: 'purity', width: 10 },
        { header: 'Gross Wt (g)', key: 'totWt', width: 15 },
        { header: 'Stone Wt (g)', key: 'stoneWt', width: 15 },
        { header: 'Net Wt (g)', key: 'nettWt', width: 15 },
        { header: 'Gold Rate (₹)', key: 'gramRate', width: 15 },
        { header: 'Gold Value (₹)', key: 'total', width: 15 },
        { header: 'Locker No', key: 'lockerNo', width: 15 },
        { header: 'Valuer', key: 'valuer', width: 20 }
      ];
      loan.articles.forEach(art => {
        goldSheet.addRow({
          category: art.category || '-',
          details: art.details || art.jewelDetails || '-',
          qty: art.qty || art.quantity || 0,
          purity: art.purity || '-',
          totWt: art.totWt || art.totWeight || 0,
          stoneWt: art.stoneWt || 0,
          nettWt: art.nettWt || 0,
          gramRate: art.gramRate || 0,
          total: art.total || 0,
          lockerNo: loan.lockerNo || '-',
          valuer: loan.valuerName || '-'
        });
      });
    }
    
    // EMI Schedule Sheet
    if (!isGoldLoan && loan.maturePeriod) {
      const emiSheet = workbook.addWorksheet('EMI Schedule');
      emiSheet.columns = [
        { header: 'EMI No', key: 'emiNo', width: 10 },
        { header: 'Due Date', key: 'dueDate', width: 15 },
        { header: 'Paid Date', key: 'paidDate', width: 15 },
        { header: 'Principal Paid (₹)', key: 'principal', width: 20 },
        { header: 'Interest Paid (₹)', key: 'interest', width: 20 },
        { header: 'Penalty Paid (₹)', key: 'penalty', width: 20 },
        { header: 'EMI Amount (₹)', key: 'emiAmount', width: 20 },
        { header: 'Remaining Balance (₹)', key: 'balance', width: 25 },
        { header: 'Status', key: 'status', width: 15 }
      ];
      generateEmiSchedule().forEach(item => {
        emiSheet.addRow(item);
      });
    }
    
    // Transactions Sheet
    const txSheet = workbook.addWorksheet('Transactions');
    txSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Debit (₹)', key: 'debit', width: 15 },
      { header: 'Credit (₹)', key: 'credit', width: 15 },
      { header: 'Balance (₹)', key: 'balance', width: 20 },
      { header: 'Mode', key: 'mode', width: 15 },
      { header: 'Receipt No', key: 'receiptNo', width: 15 },
      { header: 'Collected By', key: 'employee', width: 20 }
    ];
    generateTransactionHistory().forEach(tx => {
      txSheet.addRow(tx);
    });
    
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Ledger_${displayData.loanNumber}.xlsx`);
  };

  const loan = loanData?.loan || {};
  const customer = loanData?.customer || {};
  const branchName = loanData?.branch?.branchName || 'Main Branch';
  const schemeName = loanData?.scheme?.schemeName || loan.schemeName || 'Gold Loan';
  const isGoldLoan = schemeName.toLowerCase().includes('gold');

  const displayData = loanData ? {
    loanNumber: loan.loanId || '-',
    loanAccountNo: loan.loanId || '-',
    borrowerId: customer.customerId || '-',
    borrowerName: customer.customerName || loan.name || '-',
    mobileNumber: customer.mobileNumber || loan.mobileNo || '-',
    branch: branchName,
    loanScheme: schemeName,
    loanType: schemeName,
    loanStatus: loan.status || 'Active',
    applicationDate: loan.loanDate ? new Date(loan.loanDate).toLocaleDateString() : '-',
    approvalDate: loan.loanStartDate ? new Date(loan.loanStartDate).toLocaleDateString() : '-',
    disbursementDate: loan.loanStartDate ? new Date(loan.loanStartDate).toLocaleDateString() : '-',
    requestedAmount: loan.loanAmount || 0,
    approvedAmount: loan.loanAmount || 0,
    disbursedAmount: loan.loanAmount || 0,
    interestRate: loan.interestPercent || loan.interestRate || 0,
    loanTenure: loan.maturePeriod || 0,
    maturityDate: loan.loanEndDate ? new Date(loan.loanEndDate).toLocaleDateString() : '-',
    
    // Summary
    totalCollection: loan.payments?.reduce((acc, p) => acc + (p.amount || 0), 0) || 0,
    principalPaid: loan.payments?.reduce((acc, p) => acc + (p.principalAmount || 0), 0) || 0,
    interestPaid: loan.payments?.reduce((acc, p) => acc + (p.interestAmount || 0), 0) || 0,
    penaltyCollected: loan.payments?.reduce((acc, p) => acc + (p.penalty || 0), 0) || 0,
    outstandingPrincipal: loan.remainingLoanAmount || loan.loanAmount || 0,
    outstandingInterest: loan.remainingInterestAmount || 0,
    outstandingBalance: (loan.remainingLoanAmount || 0) + (loan.remainingInterestAmount || 0),
    
    goldValue: loan.articles?.reduce((acc, item) => acc + (item.total || 0), 0) || 0
  } : null;

  const generateEmiSchedule = () => {
    if (!loan || !loan.maturePeriod) return [];
    
    const schedule = [];
    const tenure = loan.maturePeriod;
    const emiAmt = loan.emiAmount || Math.round((loan.loanAmount || 0) / tenure);
    const startDate = loan.loanStartDate ? new Date(loan.loanStartDate) : new Date();
    
    const paymentsList = [...(loan.payments || [])].sort((a, b) => new Date(a.paidDate) - new Date(b.paidDate));
    let remainingBalance = loan.loanAmount || 0;
    
    for (let i = 1; i <= tenure; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + i);
      
      const payment = paymentsList[i - 1];
      const paidDate = payment ? new Date(payment.paidDate).toLocaleDateString() : '-';
      const principalPaid = payment ? payment.principalAmount : 0;
      const interestPaid = payment ? payment.interestAmount : 0;
      const penaltyPaid = payment ? payment.penalty : 0;
      const status = payment ? 'Paid' : (dueDate < new Date() ? 'Overdue' : 'Pending');
      
      remainingBalance = Math.max(0, remainingBalance - (payment ? payment.principalAmount || payment.amount : 0));
      
      schedule.push({
        emiNo: i,
        dueDate: dueDate.toLocaleDateString(),
        paidDate,
        principal: principalPaid ? `₹${principalPaid.toLocaleString()}` : '-',
        interest: interestPaid ? `₹${interestPaid.toLocaleString()}` : '-',
        penalty: penaltyPaid ? `₹${penaltyPaid.toLocaleString()}` : '-',
        emiAmount: `₹${emiAmt.toLocaleString()}`,
        balance: `₹${remainingBalance.toLocaleString()}`,
        status
      });
    }
    return schedule;
  };

  const generateTransactionHistory = () => {
    const transactions = [];
    if (!loan) return transactions;
    
    let balance = loan.loanAmount || 0;
    transactions.push({
      date: loan.loanStartDate ? new Date(loan.loanStartDate).toLocaleDateString() : '-',
      type: 'Disbursement',
      debit: `₹${(loan.loanAmount || 0).toLocaleString()}`,
      credit: '-',
      balance: `₹${balance.toLocaleString()}`,
      mode: 'Bank Transfer',
      receiptNo: loan.loanId || '-',
      employee: loan.employeeName || 'Admin'
    });
    
    const paymentsList = [...(loan.payments || [])].sort((a, b) => new Date(a.paidDate) - new Date(b.paidDate));
    paymentsList.forEach(p => {
      balance = Math.max(0, balance - (p.principalAmount || p.amount || 0));
      transactions.push({
        date: p.paidDate ? new Date(p.paidDate).toLocaleDateString() : '-',
        type: 'Repayment',
        debit: '-',
        credit: `₹${(p.amount || 0).toLocaleString()}`,
        balance: `₹${balance.toLocaleString()}`,
        mode: 'Cash',
        receiptNo: p.receiptNo || '-',
        employee: 'Cashier'
      });
    });
    return transactions;
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    ...(isGoldLoan ? [{ id: 'gold_details', label: 'Gold Details' }] : []),
    ...(!isGoldLoan ? [{ id: 'emi_details', label: 'EMI Details' }] : []),
    { id: 'transaction_history', label: 'Transaction History' },
    { id: 'collection_summary', label: 'Collection Summary' },
    { id: 'documents', label: 'Documents' },
    { id: 'approval_history', label: 'Approval History' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'loan_closing', label: 'Loan Closing' }
  ];

  return (
    <div className="ledger-container">
      {/* PAGE HEADER */}
      <div className="ledger-header">
        <div className="header-title-section">
          <h1>Loan Account Ledger</h1>
          {displayData && (
            <div className="header-subtitle">
              <span>{displayData.loanNumber}</span>
              <span>•</span>
              <span>{displayData.borrowerName}</span>
              <span>•</span>
              <span>{displayData.loanType}</span>
              <span>•</span>
              <span>{displayData.branch}</span>
              <span className="status-badge">{displayData.loanStatus}</span>
            </div>
          )}
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleReset} disabled={loading}><RefreshCcw size={16} className={loading ? 'animate-spin' : ''} /> Refresh</button>
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <div className="card">
        <div className="filter-grid">
          <div className="filter-group">
            <label>Search Loan</label>
            <input 
              type="text" 
              placeholder="Enter Loan No or Name" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        {error && <div style={{ color: 'red', fontSize: '14px', marginTop: '8px' }}>{error}</div>}
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
            {loading ? <Loader size={16} className="animate-spin" /> : <Search size={16} />} Search
          </button>
          <button className="btn" onClick={handleReset}><RotateCcw size={16} /> Reset</button>
        </div>
      </div>

      {displayData ? (
        <>
      {/* SUMMARY CARDS */}
      <div className="summary-grid">
        <div className="card summary-card">
          <div className="summary-icon"><IndianRupee size={24} /></div>
          <div className="summary-content">
            <h3>Loan Amount</h3>
            <p>₹{displayData.approvedAmount.toLocaleString()}</p>
          </div>
        </div>
        <div className="card summary-card">
          <div className="summary-icon" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}><Scale size={24} /></div>
          <div className="summary-content">
            <h3>Outstanding Amount</h3>
            <p>₹{displayData.outstandingBalance.toLocaleString()}</p>
          </div>
        </div>
        <div className="card summary-card">
          <div className="summary-icon" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}><Landmark size={24} /></div>
          <div className="summary-content">
            <h3>Principal Paid</h3>
            <p>₹{displayData.principalPaid.toLocaleString()}</p>
          </div>
        </div>
        <div className="card summary-card">
          <div className="summary-icon" style={{ backgroundColor: '#fefce8', color: '#ca8a04' }}><FileCheck size={24} /></div>
          <div className="summary-content">
            <h3>Interest Paid</h3>
            <p>₹{displayData.interestPaid.toLocaleString()}</p>
          </div>
        </div>
        <div className="card summary-card">
          <div className="summary-icon" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}><History size={24} /></div>
          <div className="summary-content">
            <h3>Total Collection</h3>
            <p>₹{displayData.totalCollection.toLocaleString()}</p>
          </div>
        </div>
        <div className="card summary-card">
          <div className="summary-icon" style={{ backgroundColor: '#f0fdfa', color: '#0d9488' }}><CheckCircle size={24} /></div>
          <div className="summary-content">
            <h3>Loan Status</h3>
            <p style={{ fontSize: '18px' }}>{displayData.loanStatus}</p>
          </div>
        </div>
        {isGoldLoan && (
          <div className="card summary-card">
            <div className="summary-icon" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}><BadgeCheck size={24} /></div>
            <div className="summary-content">
              <h3>Gold Value</h3>
              <p>₹{displayData.goldValue.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* TAB LAYOUT */}
      <div className="tabs-container">
        {tabs.map(tab => (
          <button 
            key={tab.id} 
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="card">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="detail-grid">
            {Object.entries(displayData).filter(([k]) => k !== 'loanType' && k !== 'goldValue' && k !== 'outstandingPrincipal' && k !== 'outstandingInterest' && k !== 'outstandingBalance' && k !== 'totalCollection' && k !== 'principalPaid' && k !== 'interestPaid' && k !== 'penaltyCollected').map(([key, value]) => (
              <div className="detail-item" key={key}>
                <div className="detail-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
                <div className="detail-value">{String(value)}</div>
              </div>
            ))}
          </div>
        )}

        {/* GOLD DETAILS TAB */}
        {activeTab === 'gold_details' && isGoldLoan && (
          <div className="table-wrapper">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Ornament Type</th>
                  <th>Ornament Name</th>
                  <th>Pieces</th>
                  <th>Purity</th>
                  <th>Gross Wt (g)</th>
                  <th>Stone Wt (g)</th>
                  <th>Net Wt (g)</th>
                  <th>Gold Rate</th>
                  <th>Gold Value</th>
                  <th>Locker No</th>
                  <th>Valuer</th>
                </tr>
              </thead>
              <tbody>
                {loan.articles && loan.articles.length > 0 ? (
                  loan.articles.map((art, idx) => (
                    <tr key={idx}>
                      <td>{art.category || '-'}</td>
                      <td>{art.details || art.jewelDetails || '-'}</td>
                      <td>{art.qty || art.quantity || 0}</td>
                      <td>{art.purity || '-'}</td>
                      <td>{art.totWt || art.totWeight || 0}</td>
                      <td>{art.stoneWt || 0}</td>
                      <td>{art.nettWt || 0}</td>
                      <td>₹{(art.gramRate || 0).toLocaleString()}</td>
                      <td>₹{(art.total || 0).toLocaleString()}</td>
                      <td>{loan.lockerNo || '-'}</td>
                      <td>{loan.valuerName || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>No gold details available for this loan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* EMI DETAILS TAB */}
        {activeTab === 'emi_details' && !isGoldLoan && (
          <div className="table-wrapper">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>EMI No</th>
                  <th>Due Date</th>
                  <th>Paid Date</th>
                  <th>Principal</th>
                  <th>Interest</th>
                  <th>Penalty</th>
                  <th>EMI Amount</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {generateEmiSchedule().map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.emiNo}</td>
                    <td>{item.dueDate}</td>
                    <td>{item.paidDate}</td>
                    <td>{item.principal}</td>
                    <td>{item.interest}</td>
                    <td>{item.penalty}</td>
                    <td>{item.emiAmount}</td>
                    <td>{item.balance}</td>
                    <td>
                      <span className={`status-badge ${
                        item.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        item.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TRANSACTION HISTORY TAB */}
        {activeTab === 'transaction_history' && (
           <div className="table-wrapper">
             <table className="erp-table">
               <thead>
                 <tr>
                   <th>Date</th>
                   <th>Type</th>
                   <th>Debit</th>
                   <th>Credit</th>
                   <th>Balance</th>
                   <th>Mode</th>
                   <th>Receipt No</th>
                   <th>Employee</th>
                 </tr>
               </thead>
               <tbody>
                 {generateTransactionHistory().map((tx, idx) => (
                   <tr key={idx}>
                     <td>{tx.date}</td>
                     <td>{tx.type}</td>
                     <td>{tx.debit}</td>
                     <td>{tx.credit}</td>
                     <td>{tx.balance}</td>
                     <td>{tx.mode}</td>
                     <td>{tx.receiptNo}</td>
                     <td>{tx.employee}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}

        {/* COLLECTION SUMMARY TAB */}
        {activeTab === 'collection_summary' && (
           <div className="detail-grid">
             <div className="detail-item"><div className="detail-label">Total Principal Paid</div><div className="detail-value">₹{displayData.principalPaid.toLocaleString()}</div></div>
             <div className="detail-item"><div className="detail-label">Total Interest Paid</div><div className="detail-value">₹{displayData.interestPaid.toLocaleString()}</div></div>
             <div className="detail-item"><div className="detail-label">Penalty Collected</div><div className="detail-value">₹{displayData.penaltyCollected.toLocaleString()}</div></div>
             <div className="detail-item"><div className="detail-label">Total Collection</div><div className="detail-value">₹{displayData.totalCollection.toLocaleString()}</div></div>
             <div className="detail-item"><div className="detail-label">Outstanding Principal</div><div className="detail-value">₹{displayData.outstandingPrincipal.toLocaleString()}</div></div>
             <div className="detail-item"><div className="detail-label">Outstanding Interest</div><div className="detail-value">₹{displayData.outstandingInterest.toLocaleString()}</div></div>
             <div className="detail-item"><div className="detail-label">Outstanding Balance</div><div className="detail-value">₹{displayData.outstandingBalance.toLocaleString()}</div></div>
           </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="document-grid">
            {[
              { name: 'Aadhaar', url: customer.aadhaarDocumentUrl },
              { name: 'PAN', url: customer.panDocumentUrl },
              { name: 'Customer Photo', url: customer.customerPhotoUrl }
            ].map(doc => (
              <div className="doc-card" key={doc.name}>
                <div className="doc-icon"><FileText size={32} /></div>
                <div className="doc-title">{doc.name}</div>
                <div className="doc-status">{doc.url ? 'Uploaded' : 'Pending'}</div>
                <div className="doc-actions">
                  <button className="btn" onClick={() => handleViewDocument(doc.name, doc.url)}><Eye size={14} /> View</button>
                  <button className="btn" onClick={() => handleViewDocument(doc.name, doc.url)}><Download size={14} /> DL</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* APPROVAL HISTORY TAB */}
        {activeTab === 'approval_history' && (
          <div className="table-wrapper">
             <table className="erp-table">
               <thead>
                 <tr>
                   <th>Stage</th>
                   <th>Employee</th>
                   <th>Role</th>
                   <th>Date & Time</th>
                   <th>Status</th>
                   <th>Remarks</th>
                 </tr>
               </thead>
               <tbody>
                 <tr>
                   <td>Employee Submitted</td>
                   <td>{loan.employeeName || 'System'}</td>
                   <td>Clerk</td>
                   <td>{loan.loanDate ? new Date(loan.loanDate).toLocaleString() : (loan.createdAt ? new Date(loan.createdAt).toLocaleString() : '-')}</td>
                   <td><span className="status-badge">Completed</span></td>
                   <td>Loan application initialized</td>
                 </tr>
                 <tr>
                   <td>Admin Approved</td>
                   <td>Admin</td>
                   <td>Approver</td>
                   <td>{loan.loanStartDate ? new Date(loan.loanStartDate).toLocaleString() : (loan.updatedAt ? new Date(loan.updatedAt).toLocaleString() : '-')}</td>
                   <td>
                     <span className={`status-badge ${['Approved', 'Active', 'Closed', 'Repledged'].includes(loan.status) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                       {['Approved', 'Active', 'Closed', 'Repledged'].includes(loan.status) ? 'Approved' : 'Pending'}
                     </span>
                   </td>
                   <td>{['Approved', 'Active', 'Closed', 'Repledged'].includes(loan.status) ? 'Approved and ready for disbursement' : 'Pending verification'}</td>
                 </tr>
               </tbody>
             </table>
           </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-icon"></div>
              <div className="timeline-content">
                <h4>Loan Created</h4>
                <p>{loan.loanDate ? new Date(loan.loanDate).toLocaleDateString() : (loan.createdAt ? new Date(loan.createdAt).toLocaleDateString() : '-')} - By {loan.employeeName || 'System'}</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon"></div>
              <div className="timeline-content">
                <h4>KYC Verified</h4>
                <p>{loan.loanDate ? new Date(loan.loanDate).toLocaleDateString() : (loan.createdAt ? new Date(loan.createdAt).toLocaleDateString() : '-')} - By KYC Team</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon"></div>
              <div className="timeline-content">
                <h4>Loan Approved</h4>
                <p>{loan.loanStartDate ? new Date(loan.loanStartDate).toLocaleDateString() : '-'} - By Admin</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon" style={!loan.payments || loan.payments.length === 0 ? {backgroundColor: '#e5e7eb', borderColor: '#e5e7eb'} : {}}></div>
              <div className="timeline-content">
                <h4 style={!loan.payments || loan.payments.length === 0 ? {color: '#9ca3af'} : {}}>Loan Disbursed</h4>
                <p>{loan.loanStartDate ? new Date(loan.loanStartDate).toLocaleDateString() : 'Pending'}</p>
              </div>
            </div>
          </div>
        )}

        {/* LOAN CLOSING TAB */}
        {activeTab === 'loan_closing' && (
          <div className="detail-grid">
             <div className="detail-item"><div className="detail-label">Closure Date</div><div className="detail-value">{loan.status === 'Closed' ? (loan.updatedAt ? new Date(loan.updatedAt).toLocaleDateString() : '-') : '-'}</div></div>
             <div className="detail-item"><div className="detail-label">Closure Type</div><div className="detail-value">{loan.status === 'Closed' ? 'Full Settlement' : '-'}</div></div>
             <div className="detail-item"><div className="detail-label">Settlement Amount</div><div className="detail-value">{loan.status === 'Closed' ? `₹${(loan.fullSettlementAmount || 0).toLocaleString()}` : '-'}</div></div>
             <div className="detail-item"><div className="detail-label">Gold Released</div><div className="detail-value">{loan.status === 'Closed' ? 'Yes' : 'No'}</div></div>
             <div className="detail-item"><div className="detail-label">NOC Number</div><div className="detail-value">{loan.status === 'Closed' ? `NOC-${loan.loanId}` : '-'}</div></div>
             <div className="detail-item"><div className="detail-label">Closed By</div><div className="detail-value">{loan.status === 'Closed' ? 'Admin' : '-'}</div></div>
           </div>
        )}

      </div>
      
      {/* BOTTOM ACTIONS */}
      <div className="card" style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginBottom: '0' }}>
        <button className="btn" onClick={() => handleExportPDF('view')}><Eye size={16} /> View</button>
        <button className="btn" onClick={handlePrint}><Printer size={16} /> Print</button>
        <button className="btn" onClick={() => handleExportPDF('download')}><FileText size={16} /> Export PDF</button>
        <button className="btn" onClick={handleExportExcel}><FileSpreadsheet size={16} /> Export Excel</button>
        <button className="btn btn-primary" onClick={() => handleExportPDF('download')}><Download size={16} /> Download Ledger</button>
      </div>
      </>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Please search for a loan number or borrower name to view ledger details.
        </div>
      )}

    </div>
  );
};

export default LoanAccountLedger;
