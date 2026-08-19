import { useState, useEffect } from 'react';
import { Search, Landmark, Download, Printer, RefreshCw, Layers, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { exportTableToPDF, exportToExcel, handlePrint } from '../../../utils/exportUtils';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const BalanceSheet = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    assets: { currentAssets: [], fixedAssets: [], totalCurrentAssets: 0, totalFixedAssets: 0 },
    liabilities: { currentLiabilities: [], longTermLiabilities: [], totalCurrentLiabilities: 0, totalLongTermLiabilities: 0 },
    capital: { items: [], totalCapital: 0 }
  });
  
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    branch: '',
    search: ''
  });

  const [summary, setSummary] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    totalCapital: 0,
    netProfit: 0,
    totalLiabilitiesAndCapital: 0,
    difference: 0,
    status: 'Books Balanced'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
      if (filters.toDate) queryParams.append('toDate', filters.toDate);
      if (filters.branch) queryParams.append('branch', filters.branch);
      if (filters.search) queryParams.append('search', filters.search);

      const res = await api.get(`/reports/balance-sheet?${queryParams.toString()}`);
      if (res.data) {
        setData(res.data.data);
        if (res.data.summary) setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch balance sheet', err);
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
      search: ''
    });
    fetchData();
  };

  const handlePrint = () => {
    window.print();
  };

  const isBalanced = summary.difference < 0.01;

  const renderLedgerRow = (ledger) => {
    // Only render if matches search (since we do local filtering for search to avoid backend pagination on BS)
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (!ledger.ledgerName.toLowerCase().includes(s) && !ledger.ledgerCode.toLowerCase().includes(s)) {
        return null;
      }
    }
    return (
      <div key={ledger.id} className="flex justify-between items-center py-2 border-b border-gray-50/50 hover:bg-gray-50/50 transition-colors">
        <div>
          <span className="text-gray-800 text-sm">{ledger.ledgerName}</span>
          <p className="text-[10px] text-gray-400">{ledger.accountGroup}</p>
        </div>
        <div className="text-sm font-medium text-gray-900">
          {ledger.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="Balance Sheet" 
        subtitle="View Balance Sheet Statement" 
        icon={Landmark} 
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Printer} onClick={handlePrint}>Print</Button>
            <Button variant="secondary" icon={Download} onClick={() => {
              const exportData = [
                ...data.assets.currentAssets.map(item => ({ category: 'Current Asset', group: item.accountGroup, name: item.ledgerName, amount: item.amount })),
                ...data.assets.fixedAssets.map(item => ({ category: 'Fixed Asset', group: item.accountGroup, name: item.ledgerName, amount: item.amount })),
                ...data.liabilities.currentLiabilities.map(item => ({ category: 'Current Liability', group: item.accountGroup, name: item.ledgerName, amount: item.amount })),
                ...data.liabilities.longTermLiabilities.map(item => ({ category: 'Long Term Liability', group: item.accountGroup, name: item.ledgerName, amount: item.amount })),
                ...data.capital.items.map(item => ({ category: 'Capital', group: item.accountGroup, name: item.ledgerName, amount: item.amount })),
              ];
              const headers = [
                { label: 'Category', key: 'category' },
                { label: 'Group', key: 'group' },
                { label: 'Ledger Name', key: 'name' },
                { label: 'Amount', key: 'amount' }
              ];
              exportToExcel(exportData, headers, null, 'Balance_Sheet');
            }}>Export Excel</Button>
            <Button variant="secondary" icon={Download} onClick={() => {
              const exportData = [
                ...data.assets.currentAssets.map(item => ({ category: 'Current Asset', group: item.accountGroup, name: item.ledgerName, amount: item.amount })),
                ...data.assets.fixedAssets.map(item => ({ category: 'Fixed Asset', group: item.accountGroup, name: item.ledgerName, amount: item.amount })),
                ...data.liabilities.currentLiabilities.map(item => ({ category: 'Current Liability', group: item.accountGroup, name: item.ledgerName, amount: item.amount })),
                ...data.liabilities.longTermLiabilities.map(item => ({ category: 'Long Term Liability', group: item.accountGroup, name: item.ledgerName, amount: item.amount })),
                ...data.capital.items.map(item => ({ category: 'Capital', group: item.accountGroup, name: item.ledgerName, amount: item.amount })),
              ];
              const headers = [
                { label: 'Category', key: 'category' },
                { label: 'Group', key: 'group' },
                { label: 'Ledger Name', key: 'name' },
                { label: 'Amount', key: 'amount' }
              ];
              exportTableToPDF('Balance Sheet', headers, exportData, 'Balance_Sheet');
            }}>Export PDF</Button>
          </div>
        }
      />
      
      <div className="mb-6 print:hidden">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end form-spiritual-bg">
          <Input label="From Date" type="date" value={filters.fromDate} onChange={e => setFilters({...filters, fromDate: e.target.value})} />
          <Input label="To Date (As Of)" type="date" value={filters.toDate} onChange={e => setFilters({...filters, toDate: e.target.value})} />
          <Select label="Branch" value={filters.branch} onChange={e => setFilters({...filters, branch: e.target.value})}>
            <option value="">All Branches</option>
            <option value="Head Office">Head Office</option>
            <option value="Branch 1">Branch 1</option>
          </Select>
          <Input label="Search Ledger" placeholder="Name or Code..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
          
          <div className="flex justify-end gap-2 mt-2">
             <Button type="button" variant="secondary" onClick={handleReset}><RefreshCw size={16}/></Button>
             <Button type="submit" variant="primary">Generate</Button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Side: ASSETS */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide border-b-2 border-green-600 pb-2 inline-block">Assets</h2>
          
          <div className="shadow-sm border border-gray-100">
            {/* Current Assets */}
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 uppercase">Current Assets</h3>
            </div>
            <div className="p-4">
              {data.assets.currentAssets.map(renderLedgerRow)}
              <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-200">
                <span className="font-bold text-gray-800 text-sm">Total Current Assets</span>
                <span className="font-bold text-gray-900 text-sm">{data.assets.totalCurrentAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Fixed Assets */}
            <div className="p-4 bg-gray-50 border-y border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 uppercase">Fixed Assets</h3>
            </div>
            <div className="p-4">
              {data.assets.fixedAssets.map(renderLedgerRow)}
              <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-200">
                <span className="font-bold text-gray-800 text-sm">Total Fixed Assets</span>
                <span className="font-bold text-gray-900 text-sm">{data.assets.totalFixedAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Total Assets Summary */}
            <div className="p-4 bg-green-50 border-t border-green-100">
              <div className="flex justify-between items-center">
                <span className="font-bold text-green-900 text-base">TOTAL ASSETS</span>
                <span className="font-bold text-green-900 text-lg">₹{summary.totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: LIABILITIES & CAPITAL */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide border-b-2 border-blue-600 pb-2 inline-block">Liabilities & Capital</h2>
          
          <div className="shadow-sm border border-gray-100">
            {/* Capital & Reserves */}
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 uppercase">Capital Account</h3>
            </div>
            <div className="p-4">
              {data.capital.items.map(renderLedgerRow)}
              
              {/* Dynamic Net Profit */}
              <div className="flex justify-between items-center py-2 border-b border-gray-50/50">
                <div>
                  <span className={`text-sm font-semibold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>Current Year Profit / Loss</span>
                  <p className="text-[10px] text-gray-400">From P&L Statement</p>
                </div>
                <div className={`text-sm font-bold ${summary.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {summary.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-200">
                <span className="font-bold text-gray-800 text-sm">Total Capital</span>
                <span className="font-bold text-gray-900 text-sm">{(data.capital.totalCapital + summary.netProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Current Liabilities */}
            <div className="p-4 bg-gray-50 border-y border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 uppercase">Current Liabilities</h3>
            </div>
            <div className="p-4">
              {data.liabilities.currentLiabilities.map(renderLedgerRow)}
              <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-200">
                <span className="font-bold text-gray-800 text-sm">Total Current Liab.</span>
                <span className="font-bold text-gray-900 text-sm">{data.liabilities.totalCurrentLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Long Term Liabilities */}
            <div className="p-4 bg-gray-50 border-y border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 uppercase">Long Term Liabilities</h3>
            </div>
            <div className="p-4">
              {data.liabilities.longTermLiabilities.map(renderLedgerRow)}
              <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-200">
                <span className="font-bold text-gray-800 text-sm">Total Long Term Liab.</span>
                <span className="font-bold text-gray-900 text-sm">{data.liabilities.totalLongTermLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Total Liabilities & Capital Summary */}
            <div className="p-4 bg-blue-50 border-t border-blue-100">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-900 text-base">TOTAL LIAB. & CAPITAL</span>
                <span className="font-bold text-blue-900 text-lg">₹{summary.totalLiabilitiesAndCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Summary Card */}
      <div className={`p-6 flex flex-col md:flex-row items-center justify-between border-2 ${isBalanced ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className={`p-4 rounded-full ${isBalanced ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {isBalanced ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isBalanced ? 'text-green-800' : 'text-red-800'}`}>{summary.status}</h3>
            {!isBalanced && (
              <p className="text-red-600 font-medium mt-1">Difference: ₹{summary.difference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 text-center md:text-right">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Assets</p>
            <p className="text-xl font-bold text-gray-900">₹{summary.totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="hidden md:block w-px bg-gray-300"></div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Liabilities & Capital</p>
            <p className="text-xl font-bold text-gray-900">₹{summary.totalLiabilitiesAndCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
