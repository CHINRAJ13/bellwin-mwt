import { useState, useEffect } from 'react';
import BranchSelect from '../../../components/ui/BranchSelect';
import { FileText, Filter, Download, CheckCircle, Clock, Search, Printer } from 'lucide-react';
import { exportTableToPDF, exportToExcel, handlePrint } from '../../../utils/exportUtils';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/ui/PageHeader';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import { TD, TR } from '../../../components/ui/Table';

const LoanApproveReport = () => {
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
      // The backend gets loans based on loanDate (which is typically creation/approval date)
      const res = await api.get(`/reports/loan-report${queryStr}`);
      
      let allLoans = res.data || [];

      
      // Filter only loans that are Approved or Active (since Active means it was approved and disbursed)
      const approvedLoans = allLoans.filter(loan => 
        loan.status === 'Approved' || loan.status === 'Active'
      );

      // Map to table data format
      const tableData = approvedLoans.map(l => ({
        _id: l.loanId || l._id,
        loanNo: l.loanId,
        borrower: l.customerName || 'Unknown',
        approvedAmount: l.loanAmount || 0,
        // Fallback to loanDate or updatedAt for approval date
        approvalDate: l.updatedAt ? new Date(l.updatedAt).toLocaleDateString() : (l.loanDate ? new Date(l.loanDate).toLocaleDateString() : 'N/A'),
        // employeeName represents the creator/approver
        employeeName: l.employeeName || 'Admin',
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
      toast.error('Failed to load approved loans data');
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
  // Calculate summary metrics
  const totalLoansCount = data.length;
  const totalApprovedAmount = data.reduce((acc, curr) => acc + (curr.approvedAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="Loan Approve Report" 
        subtitle="Track daily approved loans, branch-wise metrics, and employee approvals." 
        icon={FileText} 
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Printer} onClick={handlePrint} disabled={!showReport}>Print</Button>
            <Button variant="secondary" icon={Download} disabled={!showReport} onClick={() => {
              const headers = [
                { label: 'Loan No', key: 'loanNo' },
                { label: 'Borrower', key: 'borrower' },
                { label: 'Approved Amount', key: 'approvedAmount' },
                { label: 'Approval Date', key: 'approvalDate' },
                { label: 'Created & Approved', key: 'employeeName' },
                { label: 'Status', key: 'status' }
              ];
              exportToExcel(data, headers, null, 'Approved_Loans');
            }}>Export Excel</Button>
            <Button variant="primary" icon={Download} disabled={!showReport} onClick={() => {
              const headers = [
                { label: 'Loan No', key: 'loanNo' },
                { label: 'Borrower', key: 'borrower' },
                { label: 'Approved Amount', key: 'approvedAmount' },
                { label: 'Approval Date', key: 'approvalDate' },
                { label: 'Created & Approved', key: 'employeeName' },
                { label: 'Status', key: 'status' }
              ];
              exportTableToPDF('Loan Approve Report', headers, data, 'Approved_Loans');
            }}>Export PDF</Button>
          </div>
        }
      />
      
      {/* Metrics Cards */}
      {showReport && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-6 bg-green-600 rounded-sm shadow-md">
            <h3 className="text-sm font-bold text-green-100 mb-1 drop-shadow-sm">Total Approved Loans ({filters.dateRange})</h3>
            <p className="text-3xl font-extrabold text-white drop-shadow-md">{totalLoansCount}</p>
          </div>
          <div className="p-6 bg-blue-600 rounded-sm shadow-md">
            <h3 className="text-sm font-bold text-blue-100 mb-1 drop-shadow-sm">Total Approved Amount</h3>
            <p className="text-3xl font-extrabold text-white drop-shadow-md">₹{totalApprovedAmount.toLocaleString('en-IN')}</p>
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

      {showReport ? (
        <div className="shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-800">Approved Loans List</h3>
          </div>
          <DataTable
            headers={['Loan No', 'Borrower', 'Approved Amount', 'Approval Date', 'Created & Approved', 'Status']}
            data={data}
            loading={loading}
            renderRow={(item) => (
              <TR key={item._id}>
                <TD className="font-bold text-gray-800">{item.loanNo}</TD>
                <TD className="font-semibold text-gray-700">{item.borrower}</TD>
                <TD className="font-bold text-green-600">₹{item.approvedAmount.toLocaleString('en-IN')}</TD>
                <TD>{item.approvalDate}</TD>
                <TD>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500 w-16">Created:</span>
                      <span className="text-gray-800 font-medium">{item.employeeName || 'Admin'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500 w-16">Approved:</span>
                      <span className="text-green-700 font-medium">Admin</span>
                    </div>
                  </div>
                </TD>
                <TD>
                  <span className={`px-2 py-1 rounded-none text-xs font-medium ${item.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
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

export default LoanApproveReport;
