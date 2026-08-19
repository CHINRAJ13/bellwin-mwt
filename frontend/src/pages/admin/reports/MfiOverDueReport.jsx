import { useState, useEffect } from 'react';
import BranchSelect from '../../../components/ui/BranchSelect';
import { FileText, Filter, Download, PhoneCall, AlertCircle, Printer } from 'lucide-react';
import { exportTableToPDF, exportToExcel, handlePrint } from '../../../utils/exportUtils';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/ui/PageHeader';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import { TD, TR } from '../../../components/ui/Table';

const MfiOverDueReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    branch: '',
    overdueRange: 'All Time'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/mfi-loans');
      let allLoans = res.data?.data || [];

      // Filter Active and Overdue MFI loans
      const activeLoans = allLoans.filter(loan => 
        (loan.status === 'Active' || loan.status === 'Overdue')
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdueList = [];

      activeLoans.forEach(loan => {
        const startDate = new Date(loan.loanDate || loan.createdAt);
        let nextDueDate = new Date(startDate);
        
        while (new Date(nextDueDate).setMonth(nextDueDate.getMonth() + 1) < today) {
           nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        }

        if (nextDueDate < today) {
          const diffTime = Math.abs(today - nextDueDate);
          const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (filters.overdueRange === '1-30 Days' && (overdueDays < 1 || overdueDays > 30)) return;
          if (filters.overdueRange === '31-60 Days' && (overdueDays < 31 || overdueDays > 60)) return;
          if (filters.overdueRange === '61-90 Days' && (overdueDays < 61 || overdueDays > 90)) return;
          if (filters.overdueRange === '90+ Days' && overdueDays <= 90) return;

          const dueAmount = loan.emiAmount || loan.remainingInterestAmount || (loan.loanAmount * 0.02) || 0;
          const penalty = Math.round(dueAmount * 0.1); 
          const loanBranch = loan.branch || 'Head Office';

          if (filters.branch && loanBranch !== filters.branch) {
            return; 
          }

          overdueList.push({
            _id: loan.applicationNo || loan._id,
            loanNo: loan.applicationNo,
            borrower: loan.loanType === 'single' ? (loan.customerName || 'Unknown') : (loan.groupId || 'Group Loan'),
            dueDate: nextDueDate.toLocaleDateString(),
            dueDateRaw: nextDueDate,
            outstanding: loan.approvedLoanAmount || loan.loanAmountRequested || 0,
            overdueDays: overdueDays,
            penalty: penalty,
            branch: loanBranch,
            status: 'Overdue'
          });
        }
      });

      // De-duplicate overdueList by loanNo
      const uniqueOverdueList = [];
      const seenLoans = new Set();
      overdueList.forEach(item => {
        if (item.loanNo && !seenLoans.has(item.loanNo)) {
          seenLoans.add(item.loanNo);
          uniqueOverdueList.push(item);
        }
      });

      uniqueOverdueList.sort((a, b) => b.overdueDays - a.overdueDays);

      setData(uniqueOverdueList);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load MFI overdue loan data');
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
  const totalOverdueCount = data.length;
  const totalOutstanding = data.reduce((acc, curr) => acc + curr.outstanding, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="MFI Loan Overdue Report" 
        subtitle="Track MFI customers who have crossed their EMI due dates for recovery follow-up." 
        icon={FileText} 
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Printer} onClick={handlePrint} disabled={!showReport}>Print</Button>
            <Button variant="secondary" icon={Download} disabled={!showReport} onClick={() => {
              const headers = [
                { label: 'Loan No', key: 'loanNo' },
                { label: 'Customer', key: 'borrower' },
                { label: 'Due Date', key: 'dueDate' },
                { label: 'Outstanding', key: 'outstanding' },
                { label: 'Overdue Days', key: 'overdueDays' },
                { label: 'Penalty', key: 'penalty' },
                { label: 'Status', key: 'status' }
              ];
              exportToExcel(data, headers, null, 'MFI_Loan_Overdue');
            }}>Export Excel</Button>
            <Button variant="primary" icon={Download} disabled={!showReport} onClick={() => {
              const headers = [
                { label: 'Loan No', key: 'loanNo' },
                { label: 'Customer', key: 'borrower' },
                { label: 'Due Date', key: 'dueDate' },
                { label: 'Outstanding', key: 'outstanding' },
                { label: 'Overdue Days', key: 'overdueDays' },
                { label: 'Penalty', key: 'penalty' },
                { label: 'Status', key: 'status' }
              ];
              exportTableToPDF('MFI Loan Overdue Report', headers, data, 'MFI_Loan_Overdue');
            }}>Export PDF</Button>
          </div>
        }
      />
      
      {/* Metrics Cards */}
      {showReport && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-6 bg-red-600 rounded-sm shadow-md">
            <h3 className="text-sm font-bold text-red-100 mb-1 drop-shadow-sm">Total Overdue MFI Customers</h3>
            <p className="text-3xl font-extrabold text-white drop-shadow-md">{totalOverdueCount}</p>
          </div>
          <div className="p-6 bg-orange-600 rounded-sm shadow-md">
            <h3 className="text-sm font-bold text-orange-100 mb-1 drop-shadow-sm">Total Outstanding at Risk</h3>
            <p className="text-3xl font-extrabold text-white drop-shadow-md">₹{totalOutstanding.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-6 bg-purple-600 rounded-sm shadow-md">
            <h3 className="text-sm font-bold text-purple-100 mb-1 drop-shadow-sm">Filter Active</h3>
            <p className="text-lg font-extrabold text-white drop-shadow-md">{filters.branch || 'All Branches'} • {filters.overdueRange}</p>
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
              label="Overdue Range" 
              value={filters.overdueRange} 
              onChange={e => setFilters({...filters, overdueRange: e.target.value})}
            >
              <option value="All Time">All Time</option>
              <option value="1-30 Days">1 to 30 Days</option>
              <option value="31-60 Days">31 to 60 Days</option>
              <option value="61-90 Days">61 to 90 Days</option>
              <option value="90+ Days">90+ Days</option>
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
            <h3 className="text-lg font-semibold text-gray-800">Recovery Follow-Up List</h3>
          </div>
          <DataTable
            headers={['Loan No', 'Customer', 'Due Date', 'Outstanding', 'Overdue Days', 'Penalty', 'Status', 'Action']}
            data={data}
            loading={loading}
            renderRow={(item) => (
              <TR key={item._id}>
                <TD className="font-bold text-gray-800">{item.loanNo}</TD>
                <TD className="font-semibold text-gray-700">{item.borrower}</TD>
                <TD className="font-bold text-gray-600">{item.dueDate}</TD>
                <TD className="font-bold text-orange-600">₹{item.outstanding.toLocaleString('en-IN')}</TD>
                <TD>
                  <span className={`px-2 py-1 rounded border text-xs font-bold ${item.overdueDays > 90 ? 'bg-red-100 border-red-300 text-red-700' : 'bg-orange-100 border-orange-300 text-orange-700'}`}>
                    {item.overdueDays} Days
                  </span>
                </TD>
                <TD className="text-red-500 font-medium">₹{item.penalty}</TD>
                <TD>
                  <span className="px-2 py-1 rounded-none text-xs font-medium bg-red-100 text-red-700">
                    {item.status}
                  </span>
                </TD>
                <TD>
                  <Button variant="danger" size="sm" onClick={() => toast.success(`Initiating recovery for ${item.borrower}...`)}>
                    Follow-up
                  </Button>
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

export default MfiOverDueReport;
