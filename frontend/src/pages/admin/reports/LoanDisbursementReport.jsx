import { useState, useEffect } from 'react';
import BranchSelect from '../../../components/ui/BranchSelect';
import { FileText, Filter, Download, DollarSign, Calendar, IndianRupee, Printer, XCircle, Eye } from 'lucide-react';
import logo from '../../../assets/Logo 1.png';
import { exportTableToPDF, exportToExcel, handlePrint } from '../../../utils/exportUtils';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/ui/PageHeader';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import { TD, TR } from '../../../components/ui/Table';

const LoanDisbursementReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDisbursement, setSelectedDisbursement] = useState(null);
  
  const [filters, setFilters] = useState({
    branch: '',
    dateRange: 'Today'
  });

  const toLocalYYYYMMDD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDateRangeParams = () => {
    const today = new Date();
    let fromDate = null;
    let toDate = null;

    if (filters.dateRange === 'Today') {
      fromDate = toLocalYYYYMMDD(today);
      toDate = fromDate;
    } else if (filters.dateRange === 'This Week') {
      const firstDay = new Date(today);
      firstDay.setDate(today.getDate() - today.getDay());
      fromDate = toLocalYYYYMMDD(firstDay);
      toDate = toLocalYYYYMMDD(new Date());
    } else if (filters.dateRange === 'This Month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      fromDate = toLocalYYYYMMDD(firstDay);
      toDate = toLocalYYYYMMDD(new Date());
    } else if (filters.dateRange === 'This Year') {
      const firstDay = new Date(today.getFullYear(), 0, 1);
      fromDate = toLocalYYYYMMDD(firstDay);
      toDate = toLocalYYYYMMDD(new Date());
    }

    let queryStr = '';
    if (fromDate && toDate) {
      queryStr += `?fromDate=${fromDate}&toDate=${toDate}`;
    }
    if (filters.branch) {
      queryStr += (queryStr ? '&' : '?') + `branch=${filters.branch}`;
    }
    return queryStr;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryStr = getDateRangeParams();
      // Fetch loans from the backend.
      const res = await api.get(`/reports/loan-report${queryStr}`);
      let allLoans = res.data || [];

      
      // Filter disbursed loans (Active, Closed, Repledged, etc.) 
      // i.e., anything that is not merely 'Pending' or 'Approved' (though Approved might mean ready to disburse, usually Active means disbursed)
      const disbursedLoans = allLoans.filter(loan => 
        loan.status !== 'Pending'
      );

      // Map to table data format
      const tableData = disbursedLoans.map(l => ({
        _id: l.loanId || l._id,
        loanNo: l.loanId,
        borrower: l.customerName || 'Unknown',
        amount: l.loanAmount || 0,
        disbursementDate: l.loanDate ? new Date(l.loanDate).toLocaleDateString() : (l.updatedAt ? new Date(l.updatedAt).toLocaleDateString() : 'N/A'),
        paymentMode: l.disbursementMode || 'Cash', // Default to Cash if not tracked yet
        transactionNo: l.transactionRef || '-', // Transaction ref if available
        status: l.status,
        schemeName: l.schemeName || 'Gold Loan',
        documentCharges: l.documentCharges || 0,
        insuranceCharges: l.insuranceCharges || 0,
        netDisbursement: l.loanAmount - (l.documentCharges || 0) - (l.insuranceCharges || 0),
        employeeName: l.employeeName || 'Admin',
        remarks: l.remarks || 'Gold loan disbursement'
      }));

      // De-duplicate tableData by loanNo
      const uniqueTableData = [];
      const seenLoans = new Set();
      tableData.forEach(item => {
        if (item.loanNo && !seenLoans.has(item.loanNo)) {
          seenLoans.add(item.loanNo);
          uniqueTableData.push(item);
        }
      });

      setData(uniqueTableData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load disbursed loans data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchData();
  };

  // Calculate summary metrics
  const totalDisbursedCount = data.length;
  const totalDisbursedAmount = data.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="Loan Disbursement Report" 
        subtitle="Report of loans released to customers for finance audit." 
        icon={FileText} 
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Printer} onClick={handlePrint}>Print</Button>
            <Button variant="secondary" icon={Download} onClick={() => {
              const headers = [
                { label: 'Loan No', key: 'loanNo' },
                { label: 'Customer Name', key: 'borrower' },
                { label: 'Loan Amount', key: 'amount' },
                { label: 'Disbursement Date', key: 'disbursementDate' },
                { label: 'Payment Mode', key: 'paymentMode' },
                { label: 'Status', key: 'status' }
              ];
              exportToExcel(data, headers, null, 'Loan_Disbursements');
            }}>Export Excel</Button>
            <Button variant="primary" icon={Download} onClick={() => {
              const headers = [
                { label: 'Loan No', key: 'loanNo' },
                { label: 'Customer Name', key: 'borrower' },
                { label: 'Loan Amount', key: 'amount' },
                { label: 'Disbursement Date', key: 'disbursementDate' },
                { label: 'Payment Mode', key: 'paymentMode' },
                { label: 'Status', key: 'status' }
              ];
              exportTableToPDF('Loan Disbursement Report', headers, data, 'Loan_Disbursements');
            }}>Export PDF</Button>
          </div>
        }
      />
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-6 bg-green-600 rounded-sm shadow-md">
          <h3 className="text-sm font-bold text-green-100 mb-1 drop-shadow-sm">Total Disbursed Loans</h3>
          <p className="text-3xl font-extrabold text-white drop-shadow-md">{totalDisbursedCount}</p>
        </div>
        <div className="p-6 bg-blue-600 rounded-sm shadow-md">
          <h3 className="text-sm font-bold text-blue-100 mb-1 drop-shadow-sm">Total Released Amount</h3>
          <p className="text-3xl font-extrabold text-white drop-shadow-md">₹{totalDisbursedAmount.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-6 bg-purple-600 rounded-sm shadow-md">
          <h3 className="text-sm font-bold text-purple-100 mb-1 drop-shadow-sm">Filter Active</h3>
          <p className="text-lg font-extrabold text-white drop-shadow-md">{filters.branch || 'All Branches'} • {filters.dateRange}</p>
        </div>
      </div>

      <div className="mb-6">
        <form onSubmit={handleFilter} className="flex flex-col md:flex-row gap-4 items-end form-spiritual-bg">
          
          <div className="w-full md:w-1/3">
            <BranchSelect                label="Branch Name"                value={filters.branch}                onChange={e => setFilters({...filters, branch: e.target.value})}              showAllOption />
          </div>

          <div className="w-full md:w-1/3">
            <Select 
              label="Date Range" 
              value={filters.dateRange} 
              onChange={e => setFilters({...filters, dateRange: e.target.value})}
            >
              <option value="All Time">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
            </Select>
          </div>

          <div className="w-full md:w-1/3 flex justify-end">
             <Button type="submit" variant="primary" icon={Filter}>Apply Filters</Button>
          </div>
        </form>
      </div>

      <div className="shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-800">Disbursed Loans List</h3>
        </div>
        <DataTable
          headers={['Loan No', 'Customer Name', 'Loan Amount', 'Disbursement Date', 'Payment Mode', 'Status', 'Action']}
          data={data}
          loading={loading}
          renderRow={(item) => (
            <TR key={item._id}>
              <TD className="font-bold text-gray-800">{item.loanNo}</TD>
              <TD className="font-semibold text-gray-700">{item.borrower}</TD>
              <TD className="font-bold text-green-600">₹{item.amount.toLocaleString('en-IN')}</TD>
              <TD>{item.disbursementDate}</TD>
              <TD>
                <span className={`px-2 py-1 rounded border text-xs font-medium bg-gray-50 border-gray-200 text-gray-700`}>
                  {item.paymentMode}
                </span>
              </TD>
              <TD>
                <span className={`px-2 py-1 rounded-none text-xs font-medium ${item.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                  {item.status}
                </span>
              </TD>
              <TD>
                <button
                  onClick={() => setSelectedDisbursement(item)}
                  className="flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
                >
                  <Eye size={12} />
                  <span>View</span>
                </button>
              </TD>
            </TR>
          )}
        />
      </div>

      {selectedDisbursement && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto py-8 animate-fade-in">
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-receipt-card, #printable-receipt-card * {
                visibility: visible;
              }
              #printable-receipt-card {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white !important;
                color: black !important;
                border: none !important;
                box-shadow: none !important;
                padding: 10px !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>
          
          <div 
            id="printable-receipt-card"
            className="bg-white text-gray-900 w-full max-w-xl border border-gray-200 shadow-2xl overflow-hidden relative flex flex-col my-auto"
          >
            {/* Modal Close (no-print) */}
            <button 
              onClick={() => setSelectedDisbursement(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors p-1 no-print cursor-pointer"
            >
              <XCircle size={24} />
            </button>

            {/* Header: Company Name & Logo */}
            <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
              <img src={logo || '/logo.png'} alt="Bellwin Logo" className="w-16 h-16 object-contain" />
              <div>
                <h2 className="text-2xl font-black tracking-tight text-gray-900">BELLWIN GROUP OF COMPANIES</h2>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Loan Disbursement Slip</p>
              </div>
            </div>

            {/* Report Content */}
            <div className="p-6 space-y-6">
              {/* Slip Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 border border-gray-100">
                <div>
                  <span className="text-gray-500 block font-medium">Disbursement Date</span>
                  <span className="font-bold text-gray-800 text-sm">{selectedDisbursement.disbursementDate}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 block font-medium">Reference No</span>
                  <span className="font-mono font-bold text-gray-800 text-sm">{selectedDisbursement.transactionNo}</span>
                </div>
              </div>

              {/* Fields Table */}
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
                    <th className="pb-2 font-bold w-1/2">Field Name</th>
                    <th className="pb-2 font-bold w-1/2 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-2.5 text-gray-600 font-medium">Loan No</td>
                    <td className="py-2.5 text-right font-bold text-gray-900">{selectedDisbursement.loanNo}</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-2.5 text-gray-600 font-medium">Customer</td>
                    <td className="py-2.5 text-right font-bold text-gray-900">{selectedDisbursement.borrower}</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-2.5 text-gray-600 font-medium">Scheme</td>
                    <td className="py-2.5 text-right font-semibold text-gray-900">{selectedDisbursement.schemeName}</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-2.5 text-gray-600 font-medium">Approved Amount</td>
                    <td className="py-2.5 text-right font-bold text-gray-900">₹{selectedDisbursement.amount.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-2.5 text-gray-600 font-medium">Processing Fee</td>
                    <td className="py-2.5 text-right font-bold text-gray-900">₹{selectedDisbursement.documentCharges.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-2.5 text-gray-600 font-medium">Insurance/Other Charges</td>
                    <td className="py-2.5 text-right font-bold text-gray-900">₹{selectedDisbursement.insuranceCharges.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-emerald-50/50 hover:bg-emerald-50 font-bold border-t border-b border-emerald-100">
                    <td className="py-3 px-2 text-emerald-800">Net Disbursement</td>
                    <td className="py-3 px-2 text-right text-emerald-800 text-base">₹{selectedDisbursement.netDisbursement.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-2.5 text-gray-600 font-medium">Payment Mode</td>
                    <td className="py-2.5 text-right font-semibold text-gray-900">{selectedDisbursement.paymentMode}</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-2.5 text-gray-600 font-medium">Disbursed By</td>
                    <td className="py-2.5 text-right font-semibold text-gray-900">{selectedDisbursement.employeeName}</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="py-2.5 text-gray-600 font-medium">Remarks</td>
                    <td className="py-2.5 text-right text-gray-700 italic">{selectedDisbursement.remarks}</td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures Footer */}
              <div className="grid grid-cols-2 gap-4 pt-10 border-t border-dashed border-gray-200">
                <div className="text-center pt-8 border-t border-gray-300">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Customer Signature</span>
                </div>
                <div className="text-center pt-8 border-t border-gray-300">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Authorized Signatory</span>
                </div>
              </div>
            </div>

            {/* Modal Footer (no-print) */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 no-print">
              <button 
                onClick={() => setSelectedDisbursement(null)}
                className="px-4 py-2 text-sm font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanDisbursementReport;
