import { useState, useEffect } from 'react';
import { Search, FileText, Download, Printer, RefreshCw } from 'lucide-react';
import { exportTableToPDF, exportToExcel, handlePrint } from '../../../utils/exportUtils';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import { TD, TR } from '../../../components/ui/Table';

const TrailBalance = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    branch: '',
    ledgerGroup: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounts/trial-balance');
      setData(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch trial balance', err);
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
      branch: '',
      ledgerGroup: ''
    });
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="Trial Balance" 
        subtitle="View Trial Balance Report" 
        icon={FileText} 
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Printer} onClick={handlePrint}>Print</Button>
            <Button variant="secondary" icon={Download} onClick={() => {
              const headers = [
                { label: 'Code', key: 'code' },
                { label: 'Ledger Name', key: 'ledgerName' },
                { label: 'Group', key: 'group' },
                { label: 'Debit', key: 'debit' },
                { label: 'Credit', key: 'credit' }
              ];
              exportToExcel(data, headers, null, 'Trail_Balance');
            }}>Export Excel</Button>
            <Button variant="primary" icon={Download} onClick={() => {
              const headers = [
                { label: 'Code', key: 'code' },
                { label: 'Ledger Name', key: 'ledgerName' },
                { label: 'Group', key: 'group' },
                { label: 'Debit', key: 'debit' },
                { label: 'Credit', key: 'credit' }
              ];
              exportTableToPDF('Trail Balance', headers, data, 'Trail_Balance');
            }}>Export PDF</Button>
          </div>
        }
      />
      
      <div className="mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end form-spiritual-bg">
          <Input label="From Date" type="date" value={filters.fromDate} onChange={e => setFilters({...filters, fromDate: e.target.value})} />
          <Input label="To Date" type="date" value={filters.toDate} onChange={e => setFilters({...filters, toDate: e.target.value})} />
          <Select label="Branch" value={filters.branch} onChange={e => setFilters({...filters, branch: e.target.value})}>
            <option value="">All Branches</option>
            <option value="Head Office">Head Office</option>
            <option value="Branch 1">Branch 1</option>
          </Select>
          <Select label="Ledger Group (Optional)" value={filters.ledgerGroup} onChange={e => setFilters({...filters, ledgerGroup: e.target.value})}>
            <option value="">All Groups</option>
            <option value="Assets">Assets</option>
            <option value="Liabilities">Liabilities</option>
            <option value="Income">Income</option>
            <option value="Expenses">Expenses</option>
          </Select>
          
          <div className="lg:col-span-4 flex justify-end gap-3 mt-2">
             <Button type="button" variant="secondary" icon={RefreshCw} onClick={handleReset}>Reset</Button>
             <Button type="submit" variant="primary" icon={Search}>Search</Button>
          </div>
        </form>
      </div>

      <DataTable
        headers={['Ledger Name', 'Opening Balance', 'Debit', 'Credit', 'Closing Balance']}
        data={data}
        loading={loading}
        renderRow={(item) => (
          <TR key={item._id}>
            <TD className="font-medium text-gray-800">{item.ledgerName}</TD>
            <TD>₹{item.openingBalance}</TD>
            <TD className="text-red-600 font-medium">₹{item.debit}</TD>
            <TD className="text-green-600 font-medium">₹{item.credit}</TD>
            <TD className="font-bold">₹{item.closingBalance}</TD>
          </TR>
        )}
      />
    </div>
  );
};
export default TrailBalance;
