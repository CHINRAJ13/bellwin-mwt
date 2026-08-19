import { useState, useEffect } from 'react';
import { Search, FileText, Filter, Download, Printer } from 'lucide-react';
import { exportTableToPDF, exportToExcel, handlePrint } from '../../../utils/exportUtils';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import { TD, TR } from '../../../components/ui/Table';

const LedgerReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    ledgerName: '',
    branch: '',
    fromDate: '',
    toDate: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounts/ledger-report');
      setData(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch ledger report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="Ledger Report" 
        subtitle="Complete transaction history for a specific ledger." 
        icon={FileText} 
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Printer} onClick={handlePrint}>Print</Button>
            <Button variant="secondary" icon={Download} onClick={() => {
              const headers = [
                { label: 'Date', key: 'date' },
                { label: 'Voucher No', key: 'voucherNo' },
                { label: 'Particulars', key: 'particulars' },
                { label: 'Debit (Dr)', key: 'debit' },
                { label: 'Credit (Cr)', key: 'credit' },
                { label: 'Balance', key: 'balance' }
              ];
              exportToExcel(data, headers, null, 'Ledger_Report');
            }}>Export Excel</Button>
            <Button variant="primary" icon={Download} onClick={() => {
              const headers = [
                { label: 'Date', key: 'date' },
                { label: 'Voucher No', key: 'voucherNo' },
                { label: 'Particulars', key: 'particulars' },
                { label: 'Debit (Dr)', key: 'debit' },
                { label: 'Credit (Cr)', key: 'credit' },
                { label: 'Balance', key: 'balance' }
              ];
              exportTableToPDF('Ledger Report', headers, data, 'Ledger_Report');
            }}>Export PDF</Button>
          </div>
        }
      />
      
      <div className="mb-6">
        <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end form-spiritual-bg">
          <Input label="Ledger Name" value={filters.ledgerName} onChange={e => setFilters({...filters, ledgerName: e.target.value})} placeholder="Search by ID, Name or Phone Number..." />
          <Select label="Branch" value={filters.branch} onChange={e => setFilters({...filters, branch: e.target.value})}>
            <option value="">All Branches</option>
            <option value="Head Office">Head Office</option>
          </Select>
          <Input label="From Date" type="date" value={filters.fromDate} onChange={e => setFilters({...filters, fromDate: e.target.value})} />
          <Input label="To Date" type="date" value={filters.toDate} onChange={e => setFilters({...filters, toDate: e.target.value})} />
          
          <div className="lg:col-span-4 flex justify-end">
             <Button type="submit" variant="primary" icon={Filter}>Apply Filters</Button>
          </div>
        </form>
      </div>

      <DataTable
        headers={['Date', 'Voucher No', 'Particulars', 'Debit (Dr)', 'Credit (Cr)', 'Balance']}
        data={data}
        loading={loading}
        renderRow={(item) => (
          <TR key={item._id}>
            <TD>{item.date}</TD>
            <TD className="font-bold text-gray-800">{item.voucherNo}</TD>
            <TD className="font-medium text-gray-700">{item.particulars}</TD>
            <TD className="text-red-600 font-medium">{item.debit > 0 ? `₹${item.debit}` : '-'}</TD>
            <TD className="text-green-600 font-medium">{item.credit > 0 ? `₹${item.credit}` : '-'}</TD>
            <TD className="font-bold">₹{item.balance}</TD>
          </TR>
        )}
      />
    </div>
  );
};
export default LedgerReport;
