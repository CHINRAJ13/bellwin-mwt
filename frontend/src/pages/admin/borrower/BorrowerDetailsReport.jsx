import { useState, useEffect } from 'react';
import { Search, FileText, Download, Printer, Filter, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import DataTable from '../../../components/ui/DataTable';
import { TD, TR } from '../../../components/ui/Table';

const STORAGE_KEY = 'belwin_customers';
const LOAN_STORAGE_KEY = 'belwin_loans';

const BorrowerDetailsReport = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Load borrowers and calculate aggregate loan stats
  const fetchBorrowers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (branchFilter !== 'All') queryParams.append('branch', branchFilter);
      if (fromDate) queryParams.append('startDate', fromDate);
      if (toDate) queryParams.append('endDate', toDate);
      if (search) queryParams.append('search', search);

      const res = await api.get(`/reports/borrower-details?${queryParams.toString()}`);
      setBorrowers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load borrower report data from database', err);
      toast.error('Failed to load report data from the database');
      setBorrowers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowers();
  }, []);

  // Filter list (Local search only if needed, but we pass to backend)
  const filtered = borrowers;

  // Export to CSV / Excel
  const handleExportCSV = () => {
    if (filtered.length === 0) return toast.error('No records to export');
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Borrower ID,Name,Mobile,Branch,Loan Count,Total Loan,Outstanding Balance,KYC Status,Status\n';

    filtered.forEach(b => {
      const row = [
        b.customerId || b.id,
        b.customerName,
        b.mobileNumber,
        b.branchName || b.branch || 'Head Office',
        b.loanCount,
        b.totalLoan,
        b.outstanding,
        b.status === 'Approved' ? 'Verified' : 'Pending',
        b.status === 'Approved' ? 'Active' : 'Inactive'
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Borrowers_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Excel CSV report downloaded!');
  };

  // Export to PDF
  const handleExportPDF = () => {
    if (filtered.length === 0) return toast.error('No records to export');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Center: Belwin Group of Company
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Belwin Group of Company", pageWidth / 2, 15, { align: 'center' });
    
    // Center: Report Title
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Borrower Details Report", pageWidth / 2, 22, { align: 'center' });

    // Left: Date
    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableHeaders = [['Customer ID', 'Borrower Name', 'Mobile', 'Branch', 'Loans', 'Total Amt', 'Outstanding', 'KYC', 'Status']];
    const tableData = filtered.map(b => [
      b.customerId || b.id,
      b.customerName,
      b.mobileNumber,
      b.branchName || b.branch || 'Head Office',
      b.loanCount,
      `INR ${b.totalLoan.toLocaleString('en-IN')}`,
      `INR ${b.outstanding.toLocaleString('en-IN')}`,
      b.status === 'Approved' ? 'Verified' : 'Pending',
      b.status === 'Approved' ? 'Active' : 'Inactive'
    ]);

    autoTable(doc, {
      head: tableHeaders,
      body: tableData,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 163, 74] } // Green accent
    });

    const pdfBlob = doc.output('blob');
    const secureBlob = new Blob([pdfBlob], { type: 'application/pdf' });
    saveAs(secureBlob, `Borrowers_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast.success('PDF report downloaded!');
  };

  // Print Page
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 print:p-0">
      
      {/* Hide on print */}
      <div className="print:hidden">
        <PageHeader
          title="Borrower Details Report"
          subtitle="Generate, search, filter, and export borrower accounting records."
          icon={FileText}
          actions={
            <div className="flex items-center gap-2">
              <Button onClick={handlePrint} icon={Printer} variant="secondary">
                Print
              </Button>
              <Button onClick={handleExportCSV} icon={Download} variant="secondary">
                Export Excel
              </Button>
              <Button onClick={handleExportPDF} icon={Download} variant="primary">
                Export PDF
              </Button>
            </div>
          }
        />
      </div>

      {/* Print header only shown during printing */}
      <div className="hidden print:block mb-8 text-center border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-green-800">Belwin Groups Jewellery ERP</h2>
        <h3 className="text-lg font-bold text-gray-700">Borrower Accounts Ledger Report</h3>
        <p className="text-xs text-gray-500 mt-1">Generated date: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Filters (hidden on print) */}
      <div className="p-4 mb-6 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          
          <div className="relative md:col-span-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, Name or Phone Number..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-none text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-gray-50"
            />
          </div>

          <Select
            label="Branch"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="All">All Branches</option>
            <option value="Head Office">Head Office</option>
            <option value="Branch 01">Branch 01</option>
            <option value="Branch 02">Branch 02</option>
          </Select>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-none text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-none text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-white"
            />
          </div>

          <Button 
            onClick={fetchBorrowers} 
            variant="primary" 
            className="w-full justify-center py-2"
          >
            Fetch Report
          </Button>

        </div>
      </div>

      {/* Report Data Table */}
      <div className="print:shadow-none print:border-none">
        <DataTable
          headers={[
            'Borrower ID',
            'Name',
            'Mobile',
            'Branch',
            'Loan Count',
            'Total Loan',
            'Outstanding',
            'KYC Status',
            'Status'
          ]}
          data={filtered}
          loading={loading}
          renderRow={(b) => (
            <TR key={b._id || b.id}>
              <TD className="font-bold text-gray-800 text-xs">{b.customerId || b.id}</TD>
              <TD className="font-semibold text-xs">{b.customerName}</TD>
              <TD className="text-xs">{b.mobileNumber}</TD>
              <TD className="text-xs">{b.branchName || b.branch || 'Head Office'}</TD>
              <TD className="text-xs font-semibold text-center">{b.loanCount}</TD>
              <TD className="font-semibold text-xs">₹{b.totalLoan.toLocaleString('en-IN')}</TD>
              <TD className="font-semibold text-red-600 text-xs">₹{b.outstanding.toLocaleString('en-IN')}</TD>
              <TD className="text-xs">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.status === 'Approved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                  {b.status === 'Approved' ? 'Verified' : 'Pending'}
                </span>
              </TD>
              <TD className="text-xs">
                <Badge variant={b.status === 'Approved' ? 'success' : 'danger'}>
                  {b.status === 'Approved' ? 'Active' : 'Inactive'}
                </Badge>
              </TD>
            </TR>
          )}
        />
      </div>

    </div>
  );
};

export default BorrowerDetailsReport;
