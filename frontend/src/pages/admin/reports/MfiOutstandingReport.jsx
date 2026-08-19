import { useState, useEffect } from 'react';
import BranchSelect from '../../../components/ui/BranchSelect';
import { FileText, Filter, Download, Printer } from 'lucide-react';
import { exportTableToPDF, exportToExcel, handlePrint } from '../../../utils/exportUtils';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/ui/PageHeader';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import { TD, TR } from '../../../components/ui/Table';

const MfiOutstandingReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    branch: '',
    dateRange: 'All Time'
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
    return queryStr;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryStr = getDateRangeParams();
      
      const response = await api.get(`/mfi-loans${queryStr}`);
      let allLoans = response.data?.data || [];

      // Filter by branch locally
      const filteredLoans = allLoans.filter(loan => {
        if (filters.branch && loan.branch !== filters.branch) {
          return false;
        }
        return true;
      });
      
      const formattedData = filteredLoans.map(item => ({
        _id: item.applicationNo || item._id,
        loanNo: item.applicationNo,
        borrower: item.loanType === 'single' ? (item.customerName || 'Unknown') : (item.groupId || 'Group Loan'),
        loanAmount: item.approvedLoanAmount || item.loanAmountRequested || 0,
        paidAmount: 0, // TODO: calculate from actual payments
        outstandingBalance: item.approvedLoanAmount || item.loanAmountRequested || 0,
        status: item.status
      }));

      // De-duplicate formattedData by loanNo
      const uniqueData = [];
      const seenLoans = new Set();
      formattedData.forEach(item => {
        if (item.loanNo && !seenLoans.has(item.loanNo)) {
          seenLoans.add(item.loanNo);
          uniqueData.push(item);
        }
      });

      setData(uniqueData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch MFI outstanding report');
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
  const totalLoansCount = data.length;
  const totalOutstanding = data.reduce((acc, curr) => acc + curr.outstandingBalance, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="MFI Loan Outstanding Report" 
        subtitle="Track total MFI loan amounts pending collection to assess company exposure." 
        icon={FileText} 
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Printer} onClick={handlePrint} disabled={!showReport}>Print</Button>
            <Button variant="secondary" icon={Download} disabled={!showReport} onClick={() => {
              const headers = [
                { label: 'Loan No', key: 'loanNo' },
                { label: 'Customer Name', key: 'borrower' },
                { label: 'Loan Amount', key: 'loanAmount' },
                { label: 'Paid Amount', key: 'paidAmount' },
                { label: 'Balance (Outstanding)', key: 'outstandingBalance' },
                { label: 'Status', key: 'status' }
              ];
              exportToExcel(data, headers, null, 'MFI_Loan_Outstanding');
            }}>Export Excel</Button>
            <Button variant="primary" icon={Download} disabled={!showReport} onClick={() => {
              const headers = [
                { label: 'Loan No', key: 'loanNo' },
                { label: 'Customer Name', key: 'borrower' },
                { label: 'Loan Amount', key: 'loanAmount' },
                { label: 'Paid Amount', key: 'paidAmount' },
                { label: 'Balance (Outstanding)', key: 'outstandingBalance' },
                { label: 'Status', key: 'status' }
              ];
              exportTableToPDF('MFI Loan Outstanding Report', headers, data, 'MFI_Loan_Outstanding');
            }}>Export PDF</Button>
          </div>
        }
      />
      
      {/* Metrics Cards */}
      {showReport && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-6 bg-blue-600 rounded-sm shadow-md">
            <h3 className="text-sm font-bold text-blue-100 mb-1 drop-shadow-sm">Total Outstanding Exposure</h3>
            <p className="text-4xl font-extrabold text-white drop-shadow-md tracking-tight">₹{totalOutstanding.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-6 bg-indigo-600 rounded-sm shadow-md">
            <h3 className="text-sm font-bold text-indigo-100 mb-1 drop-shadow-sm">Active MFI Accounts</h3>
            <p className="text-3xl font-extrabold text-white drop-shadow-md">{totalLoansCount}</p>
          </div>
          <div className="p-6 bg-purple-600 rounded-sm shadow-md">
            <h3 className="text-sm font-bold text-purple-100 mb-1 drop-shadow-sm">Filter Active</h3>
            <p className="text-lg font-extrabold text-white drop-shadow-md">{filters.branch || 'All Branches'} • {filters.dateRange}</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <form onSubmit={handleFilter} className="flex flex-col md:flex-row gap-4 items-end form-spiritual-bg">
          
          <div className="w-full md:w-1/3">
            <BranchSelect                label="Branch Name"                value={filters.branch}                onChange={e => setFilters({...filters, branch: e.target.value})}              showAllOption />
          </div>

          <div className="w-full md:w-1/3">
            <Select 
              label="Date Range (Issue Date)" 
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

      {showReport ? (
        <div className="shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Outstanding Balances</h3>
            <span className="text-sm font-bold text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm border">
              Total: ₹{totalOutstanding.toLocaleString('en-IN')}
            </span>
          </div>
          <DataTable
            headers={['Loan No', 'Customer Name', 'Loan Amount', 'Paid Amount', 'Balance (Outstanding)', 'Status']}
            data={data}
            loading={loading}
            renderRow={(item) => (
              <TR key={item._id}>
                <TD className="font-bold text-gray-800">{item.loanNo}</TD>
                <TD className="font-semibold text-gray-700">{item.borrower}</TD>
                <TD className="font-medium text-gray-600">₹{item.loanAmount.toLocaleString('en-IN')}</TD>
                <TD className="font-medium text-green-600">₹{item.paidAmount.toLocaleString('en-IN')}</TD>
                <TD className="font-bold text-orange-600 text-lg">₹{item.outstandingBalance.toLocaleString('en-IN')}</TD>
                <TD>
                  <span className={`px-2 py-1 rounded-none text-xs font-medium ${item.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {item.status}
                  </span>
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

export default MfiOutstandingReport;
