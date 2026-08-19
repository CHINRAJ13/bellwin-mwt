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

  const handleExportPDF = (action = 'download') => {
    if (!displayData) return;
    const doc = new jsPDF();
    doc.text(`Loan Account Ledger: ${displayData.loanNumber}`, 14, 15);
    
    const details = Object.entries(displayData)
      .filter(([k]) => k !== 'loanType' && k !== 'goldValue')
      .map(([key, value]) => [key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), String(value)]);
      
    autoTable(doc, {
      startY: 20,
      head: [['Field', 'Value']],
      body: details,
    });
    
    if (action === 'view') {
      window.open(doc.output('bloburl'), '_blank');
    } else {
      doc.save(`Ledger_${displayData.loanNumber}.pdf`);
    }
  };

  const handleExportExcel = async () => {
    if (!displayData) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ledger');
    
    worksheet.columns = [
      { header: 'Field', key: 'field', width: 30 },
      { header: 'Value', key: 'value', width: 40 }
    ];
    
    Object.entries(displayData).forEach(([key, value]) => {
       worksheet.addRow({
         field: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
         value: String(value)
       });
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

  const mockData = displayData || {
    loanNumber: 'LN-GL-2026-08991',
    loanAccountNo: 'ACC-8991-GL',
    borrowerId: 'BOR-0002',
    borrowerName: 'Abraham',
    memberId: 'MEM-445',
    mobileNumber: '+91 9876543210',
    branch: 'Main Branch',
    loanScheme: 'Gold Premium Scheme',
    loanType: 'Gold Loan',
    loanStatus: 'Active',
    applicationDate: '01 Aug 2026',
    approvalDate: '02 Aug 2026',
    disbursementDate: '03 Aug 2026',
    requestedAmount: 500000,
    approvedAmount: 480000,
    disbursedAmount: 475000,
    interestRate: 12.5,
    loanTenure: 12,
    maturityDate: '03 Aug 2027',
    
    // Summary
    totalCollection: 55000,
    principalPaid: 25000,
    interestPaid: 30000,
    penaltyCollected: 0,
    outstandingPrincipal: 455000,
    outstandingInterest: 5000,
    outstandingBalance: 460000,

    goldValue: 650000
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
            <p>₹{mockData.approvedAmount.toLocaleString()}</p>
          </div>
        </div>
        <div className="card summary-card">
          <div className="summary-icon" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}><Scale size={24} /></div>
          <div className="summary-content">
            <h3>Outstanding Amount</h3>
            <p>₹{mockData.outstandingBalance.toLocaleString()}</p>
          </div>
        </div>
        <div className="card summary-card">
          <div className="summary-icon" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}><Landmark size={24} /></div>
          <div className="summary-content">
            <h3>Principal Paid</h3>
            <p>₹{mockData.principalPaid.toLocaleString()}</p>
          </div>
        </div>
        <div className="card summary-card">
          <div className="summary-icon" style={{ backgroundColor: '#fefce8', color: '#ca8a04' }}><FileCheck size={24} /></div>
          <div className="summary-content">
            <h3>Interest Paid</h3>
            <p>₹{mockData.interestPaid.toLocaleString()}</p>
          </div>
        </div>
        <div className="card summary-card">
          <div className="summary-icon" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}><History size={24} /></div>
          <div className="summary-content">
            <h3>Total Collection</h3>
            <p>₹{mockData.totalCollection.toLocaleString()}</p>
          </div>
        </div>
        <div className="card summary-card">
          <div className="summary-icon" style={{ backgroundColor: '#f0fdfa', color: '#0d9488' }}><CheckCircle size={24} /></div>
          <div className="summary-content">
            <h3>Loan Status</h3>
            <p style={{ fontSize: '18px' }}>{mockData.loanStatus}</p>
          </div>
        </div>
        {isGoldLoan && (
          <div className="card summary-card">
            <div className="summary-icon" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}><BadgeCheck size={24} /></div>
            <div className="summary-content">
              <h3>Gold Value</h3>
              <p>₹{mockData.goldValue.toLocaleString()}</p>
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
            {Object.entries(displayData).filter(([k]) => k !== 'loanType' && k !== 'goldValue').map(([key, value]) => (
              <div className="detail-item" key={key}>
                <div className="detail-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
                <div className="detail-value">{value}</div>
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
                <tr>
                  <td>Bangle</td>
                  <td>Gold Bangle 22K</td>
                  <td>2</td>
                  <td>22K</td>
                  <td>45.50</td>
                  <td>2.00</td>
                  <td>43.50</td>
                  <td>₹6,500</td>
                  <td>₹282,750</td>
                  <td>L-45</td>
                  <td>Mr. Smith</td>
                </tr>
                <tr>
                  <td>Chain</td>
                  <td>Thali Chain</td>
                  <td>1</td>
                  <td>22K</td>
                  <td>30.00</td>
                  <td>0.00</td>
                  <td>30.00</td>
                  <td>₹6,500</td>
                  <td>₹195,000</td>
                  <td>L-45</td>
                  <td>Mr. Smith</td>
                </tr>
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
                <tr>
                  <td>1</td>
                  <td>03 Sep 2026</td>
                  <td>02 Sep 2026</td>
                  <td>₹10,000</td>
                  <td>₹2,500</td>
                  <td>₹0</td>
                  <td>₹12,500</td>
                  <td>₹465,000</td>
                  <td><span className="status-badge">Paid</span></td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>03 Oct 2026</td>
                  <td>-</td>
                  <td>₹10,000</td>
                  <td>₹2,400</td>
                  <td>₹0</td>
                  <td>₹12,400</td>
                  <td>₹455,000</td>
                  <td><span className="status-badge" style={{backgroundColor: '#fef3c7', color: '#b45309'}}>Pending</span></td>
                </tr>
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
                 <tr>
                   <td>03 Aug 2026</td>
                   <td>Disbursement</td>
                   <td>₹475,000</td>
                   <td>-</td>
                   <td>₹475,000</td>
                   <td>Bank Transfer</td>
                   <td>DIS-001</td>
                   <td>Admin</td>
                 </tr>
                 <tr>
                   <td>02 Sep 2026</td>
                   <td>Repayment</td>
                   <td>-</td>
                   <td>₹12,500</td>
                   <td>₹462,500</td>
                   <td>Cash</td>
                   <td>REC-909</td>
                   <td>Cashier 1</td>
                 </tr>
               </tbody>
             </table>
           </div>
        )}

        {/* COLLECTION SUMMARY TAB */}
        {activeTab === 'collection_summary' && (
           <div className="detail-grid">
             <div className="detail-item"><div className="detail-label">Total Principal Paid</div><div className="detail-value">₹{displayData.principalPaid}</div></div>
             <div className="detail-item"><div className="detail-label">Total Interest Paid</div><div className="detail-value">₹{displayData.interestPaid}</div></div>
             <div className="detail-item"><div className="detail-label">Penalty Collected</div><div className="detail-value">₹{displayData.penaltyCollected}</div></div>
             <div className="detail-item"><div className="detail-label">Total Collection</div><div className="detail-value">₹{displayData.totalCollection}</div></div>
             <div className="detail-item"><div className="detail-label">Outstanding Principal</div><div className="detail-value">₹{displayData.outstandingPrincipal}</div></div>
             <div className="detail-item"><div className="detail-label">Outstanding Interest</div><div className="detail-value">₹{displayData.outstandingInterest}</div></div>
             <div className="detail-item"><div className="detail-label">Outstanding Balance</div><div className="detail-value">₹{displayData.outstandingBalance}</div></div>
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
                   <td>John Doe</td>
                   <td>Clerk</td>
                   <td>01 Aug 2026, 10:00 AM</td>
                   <td><span className="status-badge">Completed</span></td>
                   <td>All documents attached</td>
                 </tr>
                 <tr>
                   <td>Admin Approved</td>
                   <td>Super Admin</td>
                   <td>Admin</td>
                   <td>02 Aug 2026, 11:30 AM</td>
                   <td><span className="status-badge">Approved</span></td>
                   <td>Looks good, proceed</td>
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
                <p>01 Aug 2026 - By John Doe</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon"></div>
              <div className="timeline-content">
                <h4>KYC Verified</h4>
                <p>01 Aug 2026 - By KYC Team</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon"></div>
              <div className="timeline-content">
                <h4>Loan Approved</h4>
                <p>02 Aug 2026 - By Super Admin</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon" style={{backgroundColor: '#e5e7eb', borderColor: '#e5e7eb'}}></div>
              <div className="timeline-content">
                <h4 style={{color: '#9ca3af'}}>Loan Disbursed</h4>
                <p>Pending</p>
              </div>
            </div>
          </div>
        )}

        {/* LOAN CLOSING TAB */}
        {activeTab === 'loan_closing' && (
          <div className="detail-grid">
             <div className="detail-item"><div className="detail-label">Closure Date</div><div className="detail-value">-</div></div>
             <div className="detail-item"><div className="detail-label">Closure Type</div><div className="detail-value">-</div></div>
             <div className="detail-item"><div className="detail-label">Settlement Amount</div><div className="detail-value">-</div></div>
             <div className="detail-item"><div className="detail-label">Gold Released</div><div className="detail-value">No</div></div>
             <div className="detail-item"><div className="detail-label">NOC Number</div><div className="detail-value">-</div></div>
             <div className="detail-item"><div className="detail-label">Closed By</div><div className="detail-value">-</div></div>
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
