import React, { useState } from 'react';
import '../reports/LoanAccountLedger.css';
import { 
  Printer, FileText, FileSpreadsheet, RefreshCcw, Search, RotateCcw, 
  IndianRupee, Scale, History, FileCheck, Landmark, CheckCircle, 
  Eye, Download, Loader
} from 'lucide-react';
import api from '../../../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

const MfiAccountLedger = () => {
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
      const response = await api.get(`/mfi-loans`);
      if (response.data.success && response.data.data) {
        const allLoans = response.data.data;
        const found = allLoans.find(l => 
          l.applicationNo === searchQuery || 
          (l.customerName && l.customerName.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        
        if (found) {
           setLoanData({ 
             loan: {
                loanId: found.applicationNo,
                loanAmount: found.approvedLoanAmount || found.loanAmountRequested || 0,
                interestRate: found.interestRate || 0,
                maturePeriod: found.loanTenure || 0,
                status: found.status,
                loanDate: found.applicationDate,
                remainingLoanAmount: found.approvedLoanAmount || found.loanAmountRequested || 0,
                remainingInterestAmount: 0,
                payments: []
             },
             customer: { customerId: found.customerId, customerName: found.customerName, mobileNumber: found.customerMobile }, 
             scheme: { schemeName: 'Micro Finance' }, 
             branch: { branchName: found.branch || 'Head Office' } 
           });
        } else {
           setLoanData(null);
           setError('No MFI loan found');
        }
      } else {
        setLoanData(null);
        setError('No MFI loan found');
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
      toast.error('Document unavailable');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = (action = 'download') => {
    if (!displayData) return;
    const doc = new jsPDF();
    doc.text(`MFI Account Ledger: ${displayData.loanNumber}`, 14, 15);
    
    const details = Object.entries(displayData).map(([key, value]) => [key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), String(value)]);
      
    autoTable(doc, {
      startY: 20,
      head: [['Field', 'Value']],
      body: details,
    });
    
    if (action === 'view') {
      window.open(doc.output('bloburl'), '_blank');
    } else {
      doc.save(`MFI_Ledger_${displayData.loanNumber}.pdf`);
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
    saveAs(new Blob([buffer]), `MFI_Ledger_${displayData.loanNumber}.xlsx`);
  };

  const loan = loanData?.loan || {};
  const customer = loanData?.customer || {};
  const branchName = loanData?.branch?.branchName || 'Main Branch';
  const schemeName = loanData?.scheme?.schemeName || loan.schemeName || 'Micro Finance';

  const displayData = loanData ? {
    loanNumber: loan.loanId || '-',
    borrowerId: customer.customerId || '-',
    borrowerName: customer.customerName || loan.name || '-',
    mobileNumber: customer.mobileNumber || loan.mobileNo || '-',
    branch: branchName,
    loanScheme: schemeName,
    loanStatus: loan.status || 'Active',
    applicationDate: loan.loanDate ? new Date(loan.loanDate).toLocaleDateString() : '-',
    approvalDate: loan.loanStartDate ? new Date(loan.loanStartDate).toLocaleDateString() : '-',
    requestedAmount: loan.loanAmount || 0,
    approvedAmount: loan.loanAmount || 0,
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
  } : null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'emi_details', label: 'EMI Details' },
    { id: 'transaction_history', label: 'Transaction History' },
    { id: 'collection_summary', label: 'Collection Summary' },
    { id: 'documents', label: 'Documents' }
  ];

  return (
    <div className="ledger-container animate-fade-in">
      {/* PAGE HEADER */}
      <div className="ledger-header">
        <div className="header-title-section">
          <h1>MFI Account Ledger</h1>
          {displayData && (
            <div className="header-subtitle">
              <span>{displayData.loanNumber}</span>
              <span>•</span>
              <span>{displayData.borrowerName}</span>
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
            <label>Search MFI Loan</label>
            <input 
              type="text" 
              placeholder="Enter Loan No or Customer Name..." 
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
            <h3>Total Collection</h3>
            <p>₹{displayData.totalCollection.toLocaleString()}</p>
          </div>
        </div>
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
            {Object.entries(displayData).map(([key, value]) => (
              <div className="detail-item" key={key}>
                <div className="detail-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
                <div className="detail-value">{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* EMI DETAILS TAB */}
        {activeTab === 'emi_details' && (
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
                  <td>05 Sep 2026</td>
                  <td>04 Sep 2026</td>
                  <td>₹3,000</td>
                  <td>₹500</td>
                  <td>₹0</td>
                  <td>₹3,500</td>
                  <td>₹37,000</td>
                  <td><span className="status-badge">Paid</span></td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>05 Oct 2026</td>
                  <td>-</td>
                  <td>₹3,000</td>
                  <td>₹500</td>
                  <td>₹0</td>
                  <td>₹3,500</td>
                  <td>₹34,000</td>
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
                   <td>01 Aug 2026</td>
                   <td>Disbursement</td>
                   <td>₹40,000</td>
                   <td>-</td>
                   <td>₹40,000</td>
                   <td>Bank Transfer</td>
                   <td>DIS-010</td>
                   <td>Admin</td>
                 </tr>
                 <tr>
                   <td>04 Sep 2026</td>
                   <td>EMI Collection</td>
                   <td>-</td>
                   <td>₹3,500</td>
                   <td>₹36,500</td>
                   <td>Cash</td>
                   <td>REC-101</td>
                   <td>Agent Sam</td>
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
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
      
      {/* BOTTOM ACTIONS */}
      <div className="card" style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginBottom: '0' }}>
        <button className="btn" onClick={() => handleExportPDF('view')}><Eye size={16} /> View</button>
        <button className="btn" onClick={handlePrint}><Printer size={16} /> Print</button>
        <button className="btn" onClick={() => handleExportPDF('download')}><FileText size={16} /> Export PDF</button>
        <button className="btn" onClick={handleExportExcel}><FileSpreadsheet size={16} /> Export Excel</button>
      </div>
      </>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Please search for an MFI loan number or customer name to view ledger details.
        </div>
      )}

    </div>
  );
};

export default MfiAccountLedger;
