import { useState, useEffect } from 'react';
import { Search, FileText, Download, Printer, RefreshCw, ArrowDownLeft, ArrowUpRight, Landmark, CheckCircle } from 'lucide-react';
import { exportTableToPDF, exportToExcel, handlePrint } from '../../../utils/exportUtils';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import { TD, TR } from '../../../components/ui/Table';

const BankBook = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    bankAccount: '',
    branch: ''
  });

  const [summary, setSummary] = useState({
    openingBalance: '0',
    totalDeposit: '0',
    totalWithdrawal: '0',
    closingBalance: '0'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounts/bank-book');
      if (res.data) {
        setData(res.data.data || []);
        if (res.data.summary) setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch bank book', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleReset = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      bankAccount: '',
      branch: ''
    });
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="Bank Book" 
        subtitle="View Bank Book Report" 
        icon={FileText} 
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Printer} onClick={handlePrint}>Print</Button>
            <Button variant="secondary" icon={Download} onClick={() => {
              const headers = [
                { label: 'Date', key: 'date' },
                { label: 'Voucher No', key: 'voucherNo' },
                { label: 'Description', key: 'description' },
                { label: 'Deposit', key: 'deposit' },
                { label: 'Withdrawal', key: 'withdrawal' },
                { label: 'Balance', key: 'balance' }
              ];
              exportToExcel(data, headers, null, 'Bank_Book');
            }}>Export Excel</Button>
            <Button variant="primary" icon={Download} onClick={() => {
              const headers = [
                { label: 'Date', key: 'date' },
                { label: 'Voucher No', key: 'voucherNo' },
                { label: 'Description', key: 'description' },
                { label: 'Deposit', key: 'deposit' },
                { label: 'Withdrawal', key: 'withdrawal' },
                { label: 'Balance', key: 'balance' }
              ];
              exportTableToPDF('Bank Book Statement', headers, data, 'Bank_Book');
            }}>Export PDF</Button>
          </div>
        }
      />
      
      <div className="mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end form-spiritual-bg">
          <Input label="From Date" type="date" value={filters.fromDate} onChange={e => setFilters({...filters, fromDate: e.target.value})} />
          <Input label="To Date" type="date" value={filters.toDate} onChange={e => setFilters({...filters, toDate: e.target.value})} />
          <Select label="Bank Account" value={filters.bankAccount} onChange={e => setFilters({...filters, bankAccount: e.target.value})}>
            <option value="">All Bank Accounts</option>
            <option value="HDFC Bank">HDFC Bank</option>
            <option value="SBI Bank">SBI Bank</option>
            <option value="ICICI Bank">ICICI Bank</option>
          </Select>
          <Select label="Branch" value={filters.branch} onChange={e => setFilters({...filters, branch: e.target.value})}>
            <option value="">All Branches</option>
            <option value="Head Office">Head Office</option>
            <option value="Branch 1">Branch 1</option>
          </Select>
          
          <div className="lg:col-span-4 flex justify-end gap-3 mt-2">
             <Button type="button" variant="secondary" icon={RefreshCw} onClick={handleReset}>Reset</Button>
             <Button type="submit" variant="primary" icon={Search}>Search</Button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 flex items-center border border-blue-100 bg-blue-50/50">
          <div className="p-3 rounded-none bg-blue-100 text-blue-600 mr-4">
            <Landmark size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Opening Balance</p>
            <p className="text-xl font-bold text-gray-800">₹{summary.openingBalance}</p>
          </div>
        </div>
        <div className="p-4 flex items-center border border-green-100 bg-green-50/50">
          <div className="p-3 rounded-none bg-green-100 text-green-600 mr-4">
            <ArrowDownLeft size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Deposit</p>
            <p className="text-xl font-bold text-gray-800">₹{summary.totalDeposit}</p>
          </div>
        </div>
        <div className="p-4 flex items-center border border-red-100 bg-red-50/50">
          <div className="p-3 rounded-none bg-red-100 text-red-600 mr-4">
            <ArrowUpRight size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Withdrawal</p>
            <p className="text-xl font-bold text-gray-800">₹{summary.totalWithdrawal}</p>
          </div>
        </div>
        <div className="p-4 flex items-center border border-purple-100 bg-purple-50/50">
          <div className="p-3 rounded-none bg-purple-100 text-purple-600 mr-4">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Closing Balance</p>
            <p className="text-xl font-bold text-gray-800">₹{summary.closingBalance}</p>
          </div>
        </div>
      </div>

      <DataTable
        headers={['Date', 'Voucher No', 'Description', 'Deposit', 'Withdrawal', 'Balance']}
        data={data}
        loading={loading}
        renderRow={(item) => (
          <TR key={item._id}>
            <TD>{item.date}</TD>
            <TD className="font-bold text-gray-800">{item.voucherNo}</TD>
            <TD className="font-medium text-gray-700">{item.description}</TD>
            <TD className="text-green-600 font-medium">{item.deposit > 0 ? `₹${item.deposit}` : '-'}</TD>
            <TD className="text-red-600 font-medium">{item.withdrawal > 0 ? `₹${item.withdrawal}` : '-'}</TD>
            <TD className="font-bold">₹{item.balance}</TD>
          </TR>
        )}
      />
    </div>
  );
};
export default BankBook;
