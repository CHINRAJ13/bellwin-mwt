import { useState, useEffect } from 'react';
import { Search, FileText, Download, Printer, RefreshCw, Landmark, Activity, Layers, AlertCircle, CheckCircle } from 'lucide-react';
import { exportTableToPDF, exportToExcel, handlePrint } from '../../../utils/exportUtils';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const TrialBalance = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    branch: '',
    group: '',
    search: '',
    status: 'Active'
  });

  const [summary, setSummary] = useState({
    totalDebit: 0,
    totalCredit: 0,
    difference: 0,
    status: 'Books Balanced'
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1
  });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
      if (filters.toDate) queryParams.append('toDate', filters.toDate);
      if (filters.branch) queryParams.append('branch', filters.branch);
      if (filters.group) queryParams.append('group', filters.group);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status) queryParams.append('status', filters.status);
      queryParams.append('page', page);
      queryParams.append('limit', 0); // Get all for now, or implement client pagination

      const res = await api.get(`/reports/trial-balance?${queryParams.toString()}`);
      if (res.data) {
        setData(res.data.data || []);
        if (res.data.summary) setSummary(res.data.summary);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
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
    fetchData(1);
  };

  const handleReset = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      branch: '',
      group: '',
      search: '',
      status: 'Active'
    });
    fetchData(1);
  };

  const handlePrint = () => {
    window.print();
  };

  const isBalanced = summary.difference < 0.01;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="Trial Balance" 
        subtitle="View Trial Balance Statement" 
        icon={FileText} 
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Printer} onClick={handlePrint}>Print</Button>
            <Button variant="secondary" icon={Download} onClick={() => {
              const headers = [
                { label: 'Code', key: 'ledgerCode' },
                { label: 'Ledger Name', key: 'ledgerName' },
                { label: 'Group', key: 'accountGroup' },
                { label: 'Opening Bal.', key: 'openingBalance' },
                { label: 'Debit (₹)', key: 'debit' },
                { label: 'Credit (₹)', key: 'credit' },
                { label: 'Closing Bal.', key: 'absoluteClosingBalance' }
              ];
              exportToExcel(data, headers, null, 'Trial_Balance');
            }}>Export Excel</Button>
            <Button variant="primary" icon={Download} onClick={() => {
              const headers = [
                { label: 'Code', key: 'ledgerCode' },
                { label: 'Ledger Name', key: 'ledgerName' },
                { label: 'Group', key: 'accountGroup' },
                { label: 'Opening Bal.', key: 'openingBalance' },
                { label: 'Debit (₹)', key: 'debit' },
                { label: 'Credit (₹)', key: 'credit' },
                { label: 'Closing Bal.', key: 'absoluteClosingBalance' }
              ];
              exportTableToPDF('Trial Balance', headers, data, 'Trial_Balance');
            }}>Export PDF</Button>
          </div>
        }
      />
      
      <div className="mb-6 print:hidden">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end form-spiritual-bg">
          <Input label="From Date" type="date" value={filters.fromDate} onChange={e => setFilters({...filters, fromDate: e.target.value})} />
          <Input label="To Date" type="date" value={filters.toDate} onChange={e => setFilters({...filters, toDate: e.target.value})} />
          <Select label="Branch" value={filters.branch} onChange={e => setFilters({...filters, branch: e.target.value})}>
            <option value="">All Branches</option>
            <option value="Head Office">Head Office</option>
            <option value="Branch 1">Branch 1</option>
          </Select>
          <Select label="Status" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
            <option value="All">All Ledgers</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </Select>
          <Input label="Search Ledger" placeholder="Name or Code..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
          
          <div className="flex justify-end gap-2 mt-2">
             <Button type="button" variant="secondary" onClick={handleReset}><RefreshCw size={16}/></Button>
             <Button type="submit" variant="primary">Search</Button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 flex items-center border border-blue-100 bg-[#eff6ff]">
          <div className="p-3 rounded-none bg-blue-100 text-blue-600 mr-4">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Debit</p>
            <p className="text-xl font-bold text-gray-800">₹{summary.totalDebit.toLocaleString()}</p>
          </div>
        </div>
        <div className="p-4 flex items-center border border-blue-100 bg-[#eff6ff]">
          <div className="p-3 rounded-none bg-blue-100 text-blue-600 mr-4">
            <Layers size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Credit</p>
            <p className="text-xl font-bold text-gray-800">₹{summary.totalCredit.toLocaleString()}</p>
          </div>
        </div>
        <div className={`p-4 flex items-center border ${isBalanced ? 'border-gray-100 bg-[#f9fafb]' : 'border-orange-100 bg-[#fff7ed]'}`}>
          <div className={`p-3 rounded-none mr-4 ${isBalanced ? 'bg-gray-200 text-gray-600' : 'bg-orange-100 text-orange-600'}`}>
            <Landmark size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Difference</p>
            <p className={`text-xl font-bold ${isBalanced ? 'text-gray-800' : 'text-orange-600'}`}>₹{summary.difference.toLocaleString()}</p>
          </div>
        </div>
        <div className={`p-4 flex items-center border ${isBalanced ? 'border-green-100 bg-[#f0fdf4]' : 'border-red-100 bg-[#fef2f2]'}`}>
          <div className={`p-3 rounded-none mr-4 ${isBalanced ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {isBalanced ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p className={`text-lg font-bold ${isBalanced ? 'text-green-700' : 'text-red-700'}`}>{summary.status}</p>
          </div>
        </div>
      </div>

      <div className="shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading trial balance...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Ledger Name</th>
                  <th className="px-4 py-3 font-medium">Group</th>
                  <th className="px-4 py-3 font-medium text-right">Opening Bal.</th>
                  <th className="px-4 py-3 font-medium text-right">Debit (₹)</th>
                  <th className="px-4 py-3 font-medium text-right">Credit (₹)</th>
                  <th className="px-4 py-3 font-medium text-right">Closing Bal.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">{item.ledgerCode}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{item.ledgerName}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">{item.accountGroup}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {Math.abs(item.openingBalance).toLocaleString()} <span className="text-[10px] text-gray-400">{item.openingBalance >= 0 ? item.balanceType : (item.balanceType === 'Debit' ? 'Credit' : 'Debit')}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">{item.debit > 0 ? item.debit.toLocaleString() : '-'}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{item.credit > 0 ? item.credit.toLocaleString() : '-'}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {item.absoluteClosingBalance.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">{item.closingType}</span>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      No ledgers found matching the criteria.
                    </td>
                  </tr>
                )}
              </tbody>
              {data.length > 0 && (
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan="4" className="px-4 py-3 font-bold text-gray-900 text-right">Grand Total</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">{summary.totalDebit.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">{summary.totalCredit.toLocaleString()}</td>
                    <td className="px-4 py-3"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrialBalance;
