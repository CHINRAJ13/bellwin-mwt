import { useState, useEffect } from 'react';
import { Search, FileText, Download, Printer, RefreshCw, Activity, ArrowDownLeft, ArrowUpRight, DollarSign, CheckCircle } from 'lucide-react';
import { exportTableToPDF, exportToExcel, handlePrint } from '../../../utils/exportUtils';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import { TD, TR } from '../../../components/ui/Table';

const DayBook = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    date: '',
    branch: '',
    transactionType: ''
  });

  const [summary, setSummary] = useState({
    totalTransactions: '0',
    totalReceipts: '0',
    totalPayments: '0',
    netCash: '0'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounts/day-book');
      if (res.data) {
        setData(res.data.data || []);
        if (res.data.summary) setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch day book', err);
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
      date: '',
      branch: '',
      transactionType: ''
    });
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="Day Book" 
        subtitle="View Day Book Report" 
        icon={FileText} 
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Printer} onClick={handlePrint}>Print</Button>
            <Button variant="secondary" icon={Download} onClick={() => {
              const headers = [
                { label: 'Time', key: 'time' },
                { label: 'Voucher No', key: 'voucherNo' },
                { label: 'Transaction Type', key: 'transactionType' },
                { label: 'Customer/Vendor', key: 'customer' },
                { label: 'Amount', key: 'amount' },
                { label: 'Payment Mode', key: 'paymentMode' },
                { label: 'User', key: 'user' }
              ];
              exportToExcel(data, headers, null, 'Day_Book');
            }}>Export Excel</Button>
            <Button variant="primary" icon={Download} onClick={() => {
              const headers = [
                { label: 'Time', key: 'time' },
                { label: 'Voucher No', key: 'voucherNo' },
                { label: 'Transaction Type', key: 'transactionType' },
                { label: 'Customer/Vendor', key: 'customer' },
                { label: 'Amount', key: 'amount' },
                { label: 'Payment Mode', key: 'paymentMode' },
                { label: 'User', key: 'user' }
              ];
              exportTableToPDF('Day Book', headers, data, 'Day_Book');
            }}>Export PDF</Button>
          </div>
        }
      />
      
      <div className="mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end form-spiritual-bg">
          <Input label="Date" type="date" value={filters.date} onChange={e => setFilters({...filters, date: e.target.value})} />
          <Select label="Branch" value={filters.branch} onChange={e => setFilters({...filters, branch: e.target.value})}>
            <option value="">All Branches</option>
            <option value="Head Office">Head Office</option>
            <option value="Branch 1">Branch 1</option>
          </Select>
          <Select label="Transaction Type" value={filters.transactionType} onChange={e => setFilters({...filters, transactionType: e.target.value})}>
            <option value="">All Types</option>
            <option value="Receipt">Receipt</option>
            <option value="Payment">Payment</option>
            <option value="Journal">Journal</option>
            <option value="Contra">Contra</option>
          </Select>
          
          <div className="lg:col-span-3 flex justify-end gap-3 mt-2">
             <Button type="button" variant="secondary" icon={RefreshCw} onClick={handleReset}>Reset</Button>
             <Button type="submit" variant="primary" icon={Search}>Search</Button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 flex items-center border border-blue-100 bg-blue-50/50">
          <div className="p-3 rounded-none bg-blue-100 text-blue-600 mr-4">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Transactions</p>
            <p className="text-xl font-bold text-gray-800">{summary.totalTransactions}</p>
          </div>
        </div>
        <div className="p-4 flex items-center border border-green-100 bg-green-50/50">
          <div className="p-3 rounded-none bg-green-100 text-green-600 mr-4">
            <ArrowDownLeft size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Receipts</p>
            <p className="text-xl font-bold text-gray-800">₹{summary.totalReceipts}</p>
          </div>
        </div>
        <div className="p-4 flex items-center border border-red-100 bg-red-50/50">
          <div className="p-3 rounded-none bg-red-100 text-red-600 mr-4">
            <ArrowUpRight size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Payments</p>
            <p className="text-xl font-bold text-gray-800">₹{summary.totalPayments}</p>
          </div>
        </div>
        <div className="p-4 flex items-center border border-purple-100 bg-purple-50/50">
          <div className="p-3 rounded-none bg-purple-100 text-purple-600 mr-4">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Net Cash</p>
            <p className="text-xl font-bold text-gray-800">₹{summary.netCash}</p>
          </div>
        </div>
      </div>

      <DataTable
        headers={['Time', 'Voucher No', 'Transaction Type', 'Customer/Vendor', 'Amount', 'Payment Mode', 'User']}
        data={data}
        loading={loading}
        renderRow={(item) => (
          <TR key={item._id}>
            <TD>{item.time}</TD>
            <TD className="font-bold text-gray-800">{item.voucherNo}</TD>
            <TD>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                item.transactionType === 'Receipt' ? 'bg-green-100 text-green-700' :
                item.transactionType === 'Payment' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {item.transactionType}
              </span>
            </TD>
            <TD className="font-medium text-gray-700">{item.customer}</TD>
            <TD className="font-bold">₹{item.amount}</TD>
            <TD>{item.paymentMode}</TD>
            <TD>{item.user}</TD>
          </TR>
        )}
      />
    </div>
  );
};
export default DayBook;
