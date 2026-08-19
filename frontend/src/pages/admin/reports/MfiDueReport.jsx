import { useState, useEffect } from 'react';
import BranchSelect from '../../../components/ui/BranchSelect';
import { FileText, Filter, Download, Calendar, AlertCircle, PhoneCall, Printer } from 'lucide-react';
import { exportTableToPDF, exportToExcel, handlePrint } from '../../../utils/exportUtils';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/ui/PageHeader';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import { TD, TR } from '../../../components/ui/Table';

const MfiDueReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    branch: '',
    dateRange: 'Next 7 Days'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/mfi-loans');
      let allLoans = res.data?.data || [];

      // Filter only Active MFI loans
      const activeLoans = allLoans.filter(loan => 
        loan.status === 'Active'
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Determine the target date range for dues
      let rangeEnd = new Date(today);
      if (filters.dateRange === 'Today') {
        rangeEnd.setDate(today.getDate());
      } else if (filters.dateRange === 'Next 3 Days') {
        rangeEnd.setDate(today.getDate() + 3);
      } else if (filters.dateRange === 'Next 7 Days') {
        rangeEnd.setDate(today.getDate() + 7);
      } else if (filters.dateRange === 'This Month') {
        rangeEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      } else if (filters.dateRange === 'All Time') {
        rangeEnd = new Date(today.getFullYear() + 10, 0, 1);
      }

      const dueList = [];

      activeLoans.forEach(loan => {
        const startDate = new Date(loan.loanDate || loan.createdAt);
        let nextDueDate = new Date(startDate);
        
        while (nextDueDate < today) {
           nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        }

        if (nextDueDate >= today && nextDueDate <= rangeEnd) {
          const diffTime = Math.abs(nextDueDate - today);
          const daysDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const dueAmount = loan.emiAmount || loan.remainingInterestAmount || (loan.loanAmount * 0.02) || 0;
          const loanBranch = loan.branch || 'Head Office';

          if (filters.branch && loanBranch !== filters.branch) {
            return;
          }

          dueList.push({
            _id: loan.applicationNo || loan._id,
            loanNo: loan.applicationNo,
            borrower: loan.loanType === 'single' ? (loan.customerName || 'Unknown') : (loan.groupId || 'Group Loan'),
            dueDate: nextDueDate.toLocaleDateString(),
            dueDateRaw: nextDueDate,
            dueAmount: Math.round(dueAmount),
            daysDue: daysDue,
            branch: loanBranch
          });
        }
      });

      // De-duplicate dueList by loanNo
      const uniqueDueList = [];
      const seenLoans = new Set();
      dueList.forEach(item => {
        if (item.loanNo && !seenLoans.has(item.loanNo)) {
          seenLoans.add(item.loanNo);
          uniqueDueList.push(item);
        }
      });

      uniqueDueList.sort((a, b) => a.dueDateRaw - b.dueDateRaw);

      setData(uniqueDueList);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load MFI loan due data');
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
  const totalDueAmount = data.reduce((acc, curr) => acc + curr.dueAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="MFI Loan Due Report" 
        subtitle="Track upcoming MFI dues and EMI payment reminders for customers." 
        icon={FileText} 
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Printer} onClick={handlePrint} disabled={!showReport}>Print</Button>
            <Button variant="secondary" icon={Download} disabled={!showReport} onClick={() => {
              const headers = [
                { label: 'Loan No', key: 'loanNo' },
                { label: 'Customer', key: 'borrower' },
                { label: 'Due Date', key: 'dueDate' },
                { label: 'Due Amount', key: 'dueAmount' },
                { label: 'Days Until Due', key: 'daysDue' }
              ];
              exportToExcel(data, headers, null, 'MFI_Loan_Due');
            }}>Export Excel</Button>
            <Button variant="primary" icon={Download} disabled={!showReport} onClick={() => {
              const headers = [
                { label: 'Loan No', key: 'loanNo' },
                { label: 'Customer', key: 'borrower' },
                { label: 'Due Date', key: 'dueDate' },
                { label: 'Due Amount', key: 'dueAmount' },
                { label: 'Days Until Due', key: 'daysDue' }
              ];
              exportTableToPDF('MFI Loan Due Report', headers, data, 'MFI_Loan_Due');
            }}>Export PDF</Button>
          </div>
        }
      />
      
      {/* Metrics Cards */}
      {showReport && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-6 bg-orange-600 rounded-sm shadow-md">
            <h3 className="text-sm font-bold text-orange-100 mb-1 drop-shadow-sm">Upcoming MFI Dues ({filters.dateRange})</h3>
            <p className="text-3xl font-extrabold text-white drop-shadow-md">{data.length}</p>
          </div>
          <div className="p-6 bg-red-600 rounded-sm shadow-md">
            <h3 className="text-sm font-bold text-red-100 mb-1 drop-shadow-sm">Total Expected EMI Amount</h3>
            <p className="text-3xl font-extrabold text-white drop-shadow-md">₹{totalDueAmount.toLocaleString('en-IN')}</p>
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
              <option value="Today">Today (Due Today)</option>
              <option value="Next 3 Days">Next 3 Days</option>
              <option value="Next 7 Days">Next 7 Days</option>
              <option value="This Month">This Month</option>
              <option value="All Time">All Time</option>
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
            <h3 className="text-lg font-semibold text-gray-800">Customers to Follow-Up</h3>
          </div>
          <DataTable
            headers={['Loan No', 'Customer', 'Due Date', 'Due Amount', 'Days Until Due', 'Action']}
            data={data}
            loading={loading}
            renderRow={(item) => (
              <TR key={item._id}>
                <TD className="font-bold text-gray-800">{item.loanNo}</TD>
                <TD className="font-semibold text-gray-700">{item.borrower}</TD>
                <TD className="font-bold text-red-600">{item.dueDate}</TD>
                <TD className="font-bold text-gray-800">₹{item.dueAmount.toLocaleString('en-IN')}</TD>
                <TD>
                  <span className={`px-2 py-1 rounded border text-xs font-medium ${item.daysDue === 0 ? 'bg-red-100 border-red-200 text-red-700' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
                    {item.daysDue === 0 ? 'Due Today' : `${item.daysDue} Days`}
                  </span>
                </TD>
                <TD>
                  <Button variant="secondary" size="sm" onClick={() => toast.success(`Calling ${item.borrower}...`)}>
                    Call Reminder
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

export default MfiDueReport;
