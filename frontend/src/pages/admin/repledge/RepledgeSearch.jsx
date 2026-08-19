import { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Search, Search as SearchIcon, FileText, Download, RefreshCw, Eye, Edit, Printer } from 'lucide-react';
import { exportTableToPDF, exportToExcel, handlePrint } from '../../../utils/exportUtils';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import { TD, TR } from '../../../components/ui/Table';

const RepledgeSearch = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  
  const [filters, setFilters] = useState({
    loanNumber: '',
    borrowerName: '',
    mobileNumber: '',
    branch: '',
    repledgeStatus: '',
    fromDate: '',
    toDate: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Build query string from filters
      const params = new URLSearchParams();
      if (filters.loanNumber) params.append('loanNumber', filters.loanNumber);
      if (filters.borrowerName) params.append('borrowerName', filters.borrowerName);
      if (filters.mobileNumber) params.append('mobileNumber', filters.mobileNumber);
      if (filters.branch) params.append('branch', filters.branch);
      if (filters.repledgeStatus) params.append('status', filters.repledgeStatus);
      if (filters.fromDate) params.append('startDate', filters.fromDate);
      if (filters.toDate) params.append('endDate', filters.toDate);

      const res = await api.get(`/repledges?${params.toString()}`);
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch repledge records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleReset = () => {
    setFilters({
      loanNumber: '',
      borrowerName: '',
      mobileNumber: '',
      branch: '',
      repledgeStatus: '',
      fromDate: '',
      toDate: ''
    });
    fetchData();
  };

  const handleAction = (action, item) => {
    console.log(`${action} triggered for:`, item);
    // In a real app, this would route to a different page or open a modal
    if(action === 'print') alert(`Printing record for ${item.repledgeId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="Repledge Search" 
        subtitle="Search and Manage Repledge Records" 
        icon={SearchIcon} 
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Printer} onClick={handlePrint}>Print</Button>
            <Button variant="secondary" icon={Download} onClick={() => {
              const headers = [
                { label: 'Repledge ID', key: 'repledgeId' },
                { label: 'Loan Number', key: 'loanNumber' },
                { label: 'Borrower', key: 'borrowerName' },
                { label: 'Date', key: 'repledgeDate' },
                { label: 'Loan Amt', key: 'loanAmount' },
                { label: 'Outstanding', key: 'outstanding' },
                { label: 'Status', key: 'status' }
              ];
              exportToExcel(data, headers, null, 'Repledge_Search');
            }}>Export Excel</Button>
            <Button variant="primary" icon={Download} onClick={() => {
              const headers = [
                { label: 'Repledge ID', key: 'repledgeId' },
                { label: 'Loan Number', key: 'loanNumber' },
                { label: 'Borrower', key: 'borrowerName' },
                { label: 'Date', key: 'repledgeDate' },
                { label: 'Loan Amt', key: 'loanAmount' },
                { label: 'Outstanding', key: 'outstanding' },
                { label: 'Status', key: 'status' }
              ];
              exportTableToPDF('Repledge Search', headers, data, 'Repledge_Search');
            }}>Export PDF</Button>
          </div>
        }
      />
      
      <div className="mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end form-spiritual-bg">
          <Input 
            label="Loan Number" 
            name="loanNumber" 
            value={filters.loanNumber} 
            onChange={handleInputChange} 
          />
          <Input 
            label="Borrower Name" 
            name="borrowerName" 
            value={filters.borrowerName} 
            onChange={handleInputChange} 
          />
          <Input 
            label="Mobile Number" 
            name="mobileNumber" 
            value={filters.mobileNumber} 
            onChange={handleInputChange} 
          />
          <Select 
            label="Branch" 
            name="branch" 
            value={filters.branch} 
            onChange={handleInputChange}
          >
            <option value="">All Branches</option>
            <option value="Head Office">Head Office</option>
            <option value="Branch 1">Branch 1</option>
          </Select>
          <Select 
            label="Repledge Status" 
            name="repledgeStatus" 
            value={filters.repledgeStatus} 
            onChange={handleInputChange}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Closed">Closed</option>
          </Select>
          <Input 
            label="From Date" 
            name="fromDate" 
            type="date"
            value={filters.fromDate} 
            onChange={handleInputChange} 
          />
          <Input 
            label="To Date" 
            name="toDate" 
            type="date"
            value={filters.toDate} 
            onChange={handleInputChange} 
          />
          
          <div className="flex justify-end gap-3 lg:col-span-1">
             <Button type="button" variant="secondary" icon={RefreshCw} onClick={handleReset}>Reset</Button>
             <Button type="submit" variant="primary" icon={Search}>Search</Button>
          </div>
        </form>
      </div>

      <div className="shadow-sm border border-gray-100 overflow-hidden">
        <DataTable
          headers={['Repledge ID', 'Loan Number', 'Borrower', 'Date', 'Loan Amt', 'Outstanding', 'Status', 'Actions']}
          data={data}
          loading={loading}
          renderRow={(item) => (
            <TR key={item._id}>
              <TD className="font-medium text-blue-600">{item.repledgeId}</TD>
              <TD className="font-bold text-gray-800">{item.loanNumber}</TD>
              <TD>{item.borrowerName}</TD>
              <TD>{item.repledgeDate}</TD>
              <TD>₹{item.loanAmount}</TD>
              <TD className="font-semibold text-red-600">₹{item.outstanding}</TD>
              <TD>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  item.status === 'Active' ? 'bg-green-100 text-green-700' : 
                  item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {item.status}
                </span>
              </TD>
              <TD>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleAction('view', item)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-none transition-colors" title="View">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => handleAction('edit', item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-none transition-colors" title="Edit">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleAction('print', item)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-none transition-colors" title="Print">
                    <Printer size={16} />
                  </button>
                </div>
              </TD>
            </TR>
          )}
        />
      </div>
    </div>
  );
};
export default RepledgeSearch;
