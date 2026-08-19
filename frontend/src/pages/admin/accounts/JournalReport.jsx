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

const JournalReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    branch: '',
    voucherNo: '',
    ledger: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounts/journal-report');
      setData(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch journal report', err);
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
        title="Journal Report" 
        subtitle="View all journal entries across the organization." 
        icon={FileText} 
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Printer} onClick={handlePrint}>Print</Button>
            <Button variant="secondary" icon={Download} onClick={() => {
              const headers = [
                { label: 'Journal No', key: 'journalNo' },
                { label: 'Date', key: 'date' },
                { label: 'Debit Ledger', key: 'debit' },
                { label: 'Credit Ledger', key: 'credit' },
                { label: 'Amount', key: 'amount' },
                { label: 'Narration', key: 'narration' }
              ];
              exportToExcel(data, headers, null, 'Journal_Report');
            }}>Export Excel</Button>
            <Button variant="primary" icon={Download} onClick={() => {
              const headers = [
                { label: 'Journal No', key: 'journalNo' },
                { label: 'Date', key: 'date' },
                { label: 'Debit Ledger', key: 'debit' },
                { label: 'Credit Ledger', key: 'credit' },
                { label: 'Amount', key: 'amount' },
                { label: 'Narration', key: 'narration' }
              ];
              exportTableToPDF('Journal Report', headers, data, 'Journal_Report');
            }}>Export PDF</Button>
          </div>
        }
      />
      
      <div className="mb-6">
        <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end form-spiritual-bg">
          <Input label="From Date" type="date" value={filters.fromDate} onChange={e => setFilters({...filters, fromDate: e.target.value})} />
          <Input label="To Date" type="date" value={filters.toDate} onChange={e => setFilters({...filters, toDate: e.target.value})} />
          <Select label="Branch" value={filters.branch} onChange={e => setFilters({...filters, branch: e.target.value})}>
            <option value="">All Branches</option>
            <option value="Head Office">Head Office</option>
          </Select>
          <Input label="Voucher No" value={filters.voucherNo} onChange={e => setFilters({...filters, voucherNo: e.target.value})} placeholder="Search by ID, Name or Phone Number..." />
          <Input label="Ledger" value={filters.ledger} onChange={e => setFilters({...filters, ledger: e.target.value})} placeholder="Search by ID, Name or Phone Number..." />
          <div className="lg:col-span-5 flex justify-end">
             <Button type="submit" variant="primary" icon={Filter}>Apply Filters</Button>
          </div>
        </form>
      </div>

      <DataTable
        headers={['Journal No', 'Date', 'Debit Ledger', 'Credit Ledger', 'Amount', 'Narration']}
        data={data}
        loading={loading}
        renderRow={(item) => (
          <TR key={item._id}>
            <TD className="font-bold text-gray-800">{item.journalNo}</TD>
            <TD>{item.date}</TD>
            <TD className="text-blue-600 font-medium">{item.debit}</TD>
            <TD className="text-orange-600 font-medium">{item.credit}</TD>
            <TD className="font-bold">₹{item.amount}</TD>
            <TD className="text-sm text-gray-600 truncate max-w-[200px]">{item.narration}</TD>
          </TR>
        )}
      />
    </div>
  );
};
export default JournalReport;
