import { useState, useEffect } from 'react';
import BranchSelect from '../../../components/ui/BranchSelect';
import { FileText, Filter, Download, DollarSign, Calendar, IndianRupee, Printer } from 'lucide-react';
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
  
  const [filters, setFilters] = useState({
    branch: '',
    dateRange: 'Today'
  });

  const getDateRangeParams = () => {
    const today = new Date();
    let fromDate = null;
    let toDate = null;

    if (filters.dateRange === 'Today') {
      fromDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      toDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();
    } else if (filters.dateRange === 'This Week') {
      const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
      fromDate = new Date(firstDay.setHours(0, 0, 0, 0)).toISOString();
      toDate = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
    } else if (filters.dateRange === 'This Month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      fromDate = new Date(firstDay.setHours(0, 0, 0, 0)).toISOString();
      toDate = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
    } else if (filters.dateRange === 'This Year') {
      const firstDay = new Date(today.getFullYear(), 0, 1);
      fromDate = new Date(firstDay.setHours(0, 0, 0, 0)).toISOString();
      toDate = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
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
        status: l.status
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
          headers={['Loan No', 'Customer Name', 'Loan Amount', 'Disbursement Date', 'Payment Mode', 'Status']}
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
            </TR>
          )}
        />
      </div>
    </div>
  );
};

export default LoanDisbursementReport;
