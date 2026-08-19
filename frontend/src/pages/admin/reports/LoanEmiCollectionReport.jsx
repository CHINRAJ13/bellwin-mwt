import { useState, useEffect } from 'react';
import BranchSelect from '../../../components/ui/BranchSelect';
import { FileText, Filter, Download, Wallet, ArrowUpRight, CheckCircle, Printer } from 'lucide-react';
import { exportTableToPDF, exportToExcel, handlePrint } from '../../../utils/exportUtils';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/ui/PageHeader';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import { TD, TR } from '../../../components/ui/Table';

const LoanEmiCollectionReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ totalAmount: 0, employeeStats: {} });
  
  const [filters, setFilters] = useState({
    branch: '',
    dateRange: 'Today',
    employee: ''
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

    let queryStr = `?limit=5000`;
    if (fromDate && toDate) {
      queryStr += `&fromDate=${fromDate}&toDate=${toDate}`;
    }
    if (filters.branch) {
      queryStr += `&branch=${filters.branch}`;
    }
    return queryStr;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryStr = getDateRangeParams();
      
      const response = await api.get(`/reports/today-collection${queryStr}`);
      // Based on typical pagination facet structure
      let rawData = response.data?.data || response.data || [];

      
      let filteredData = rawData.map(item => ({
        _id: item.paymentId || item._id || Math.random().toString(),
        receiptNo: item.paymentId || item.transactionRef || 'N/A',
        loanNo: item.loanId,
        borrower: item.customerName || item.customerId || 'Unknown',
        amount: item.totalAmount || item.amount || item.paymentAmount || 0,
        collectionDate: item.paymentDate ? new Date(item.paymentDate).toLocaleDateString() : 'N/A',
        paymentMode: item.paymentMode || 'Cash',
        collectedBy: item.collectedBy || item.employeeName || 'Admin'
      }));

      // Apply employee filter locally
      if (filters.employee) {
        filteredData = filteredData.filter(d => d.collectedBy.toLowerCase().includes(filters.employee.toLowerCase()));
      }

      // De-duplicate filteredData by receiptNo
      const uniqueFilteredData = [];
      const seenReceipts = new Set();
      filteredData.forEach(item => {
        if (item.receiptNo && !seenReceipts.has(item.receiptNo)) {
          seenReceipts.add(item.receiptNo);
          uniqueFilteredData.push(item);
        }
      });

      // Calculate Employee-wise breakdown
      const empStats = {};
      let total = 0;
      uniqueFilteredData.forEach(d => {
        total += d.amount;
        if (!empStats[d.collectedBy]) empStats[d.collectedBy] = 0;
        empStats[d.collectedBy] += d.amount;
      });

      setData(uniqueFilteredData);
      setSummary({ totalAmount: total, employeeStats: empStats });
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch EMI collection report');
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

  const showReport = !filters.branch || data.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="Loan EMI Collection Report" 
        subtitle="Track branch-wise and employee-wise daily/monthly collections." 
        icon={FileText} 
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Printer} onClick={handlePrint} disabled={!showReport}>Print</Button>
            <Button variant="secondary" icon={Download} disabled={!showReport} onClick={() => {
              const headers = [
                { label: 'Receipt No', key: 'receiptNo' },
                { label: 'Loan No', key: 'loanNo' },
                { label: 'Borrower', key: 'borrower' },
                { label: 'Collected Amount', key: 'amount' },
                { label: 'Date', key: 'collectionDate' },
                { label: 'Payment Mode', key: 'paymentMode' },
                { label: 'Collected By', key: 'collectedBy' }
              ];
              exportToExcel(data, headers, null, 'Loan_EMI_Collections');
            }}>Export Excel</Button>
            <Button variant="primary" icon={Download} disabled={!showReport} onClick={() => {
              const headers = [
                { label: 'Receipt No', key: 'receiptNo' },
                { label: 'Loan No', key: 'loanNo' },
                { label: 'Borrower', key: 'borrower' },
                { label: 'Collected Amount', key: 'amount' },
                { label: 'Date', key: 'collectionDate' },
                { label: 'Payment Mode', key: 'paymentMode' },
                { label: 'Collected By', key: 'collectedBy' }
              ];
              exportTableToPDF('Loan EMI Collection Report', headers, data, 'Loan_EMI_Collections');
            }}>Export PDF</Button>
          </div>
        }
      />
      
      {/* Top Metrics Cards */}
      {showReport && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-6 bg-green-600 rounded-sm shadow-md col-span-1 md:col-span-2 flex flex-col justify-center">
            <h3 className="text-sm font-bold text-green-100 mb-1 drop-shadow-sm">Total Collection ({filters.dateRange})</h3>
            <p className="text-4xl font-extrabold text-white drop-shadow-md tracking-tight">₹{summary.totalAmount.toLocaleString('en-IN')}</p>
          </div>
          
          <div className="p-4 rounded-sm shadow-md bg-blue-600 flex flex-col max-h-32 overflow-y-auto">
            <h3 className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-2 border-b border-blue-400 pb-1">Employee-wise Collection</h3>
            {Object.entries(summary.employeeStats).length > 0 ? (
              Object.entries(summary.employeeStats).map(([emp, amount]) => (
                <div key={emp} className="flex justify-between items-center py-1">
                  <span className="text-sm font-medium text-white">{emp}</span>
                  <span className="text-sm font-bold text-white">₹{amount.toLocaleString('en-IN')}</span>
                </div>
              ))
            ) : (
              <span className="text-sm text-blue-200 italic">No collections found.</span>
            )}
          </div>
        </div>
      )}

      <div className="mb-6">
        <form onSubmit={handleFilter} className="flex flex-col md:flex-row gap-4 items-end form-spiritual-bg">
          
          <div className="w-full md:w-1/4">
            <BranchSelect                label="Branch Name"                value={filters.branch}                onChange={e => setFilters({...filters, branch: e.target.value})}              showAllOption />
          </div>

          <div className="w-full md:w-1/4">
            <Select 
              label="Date Range" 
              value={filters.dateRange} 
              onChange={e => setFilters({...filters, dateRange: e.target.value})}
            >
              <option value="Today">Daily (Today)</option>
              <option value="This Week">This Week</option>
              <option value="This Month">Monthly (This Month)</option>
              <option value="This Year">This Year</option>
              <option value="All Time">All Time</option>
            </Select>
          </div>

          <div className="w-full md:w-1/4">
            <Select 
              label="Employee" 
              value={filters.employee} 
              onChange={e => setFilters({...filters, employee: e.target.value})}
            >
              <option value="">All Employees</option>
              {Object.keys(summary.employeeStats).map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </Select>
          </div>

          <div className="w-full md:w-1/4 flex justify-end">
             <Button type="submit" variant="primary" icon={Filter}>Apply Filters</Button>
          </div>
        </form>
      </div>

      {showReport ? (
        <div className="shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Collection Details</h3>
          </div>
          <DataTable
            headers={['Receipt No', 'Loan No', 'Borrower', 'Collected Amount', 'Date', 'Payment Mode', 'Collected By']}
            data={data}
            loading={loading}
            renderRow={(item) => (
              <TR key={item._id}>
                <TD className="font-bold text-gray-800">{item.receiptNo}</TD>
                <TD className="font-semibold text-gray-600">{item.loanNo}</TD>
                <TD className="font-semibold text-gray-700">{item.borrower}</TD>
                <TD className="font-bold text-green-600 text-base">₹{item.amount.toLocaleString('en-IN')}</TD>
                <TD>{item.collectionDate}</TD>
                <TD>
                  <span className="px-2 py-1 rounded border text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
                    {item.paymentMode}
                  </span>
                </TD>
                <TD className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                      {item.collectedBy.charAt(0).toUpperCase()}
                    </div>
                    {item.collectedBy}
                  </div>
                </TD>
              </TR>
            )}
          />
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-gray-300 text-gray-500 bg-white">
          No data available for the selected branch.
        </div>
      )}
    </div>
  );
};

export default LoanEmiCollectionReport;
