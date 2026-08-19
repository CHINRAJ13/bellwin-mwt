import { useState, useEffect } from 'react';
import { Search, FileText, Download, Printer, RefreshCw, ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { exportTableToPDF, exportToExcel, handlePrint } from '../../../utils/exportUtils';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const ProfitLoss = () => {
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    financialYear: '2023-2024',
    fromDate: '',
    toDate: '',
    branch: ''
  });

  const [summary, setSummary] = useState({
    totalIncome: '0',
    totalExpenses: '0',
    grossProfit: '0',
    netProfit: '0'
  });

  const [statementData, setStatementData] = useState({
    income: [],
    expenses: []
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
      if (filters.toDate) queryParams.append('toDate', filters.toDate);
      if (filters.branch) queryParams.append('branch', filters.branch);

      const res = await api.get(`/reports/profit-loss-statement?${queryParams.toString()}`);
      if (res.data) {
        if (res.data.statementData) setStatementData(res.data.statementData);
        if (res.data.summary) setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch profit and loss', err);
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
      financialYear: '2023-2024',
      fromDate: '',
      toDate: '',
      branch: ''
    });
    fetchData();
  };

  const totalIncomeCalc = statementData.income.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpensesCalc = statementData.expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfitCalc = totalIncomeCalc - totalExpensesCalc;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="Profit & Loss" 
        subtitle="View Profit & Loss Statement" 
        icon={FileText} 
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Printer} onClick={handlePrint}>Print</Button>
            <Button variant="secondary" icon={Download} onClick={() => {
              const exportData = [
                ...statementData.expenses.map(item => ({ category: 'Expense', accountGroup: item.accountGroup, ledgerName: item.ledgerName, amount: item.amount })),
                ...statementData.income.map(item => ({ category: 'Income', accountGroup: item.accountGroup, ledgerName: item.ledgerName, amount: item.amount }))
              ];
              const headers = [
                { label: 'Category', key: 'category' },
                { label: 'Account Group', key: 'accountGroup' },
                { label: 'Ledger Name', key: 'ledgerName' },
                { label: 'Amount', key: 'amount' }
              ];
              exportToExcel(exportData, headers, null, 'Profit_Loss');
            }}>Export Excel</Button>
            <Button variant="secondary" icon={Download} onClick={() => {
              const exportData = [
                ...statementData.expenses.map(item => ({ category: 'Expense', accountGroup: item.accountGroup, ledgerName: item.ledgerName, amount: item.amount })),
                ...statementData.income.map(item => ({ category: 'Income', accountGroup: item.accountGroup, ledgerName: item.ledgerName, amount: item.amount }))
              ];
              const headers = [
                { label: 'Category', key: 'category' },
                { label: 'Account Group', key: 'accountGroup' },
                { label: 'Ledger Name', key: 'ledgerName' },
                { label: 'Amount', key: 'amount' }
              ];
              exportTableToPDF('Profit and Loss Statement', headers, exportData, 'Profit_Loss');
            }}>Export PDF</Button>
          </div>
        }
      />
      
      <div className="mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end form-spiritual-bg">
          <Select label="Financial Year" value={filters.financialYear} onChange={e => setFilters({...filters, financialYear: e.target.value})}>
            <option value="2023-2024">2023-2024</option>
            <option value="2022-2023">2022-2023</option>
          </Select>
          <Input label="From Date" type="date" value={filters.fromDate} onChange={e => setFilters({...filters, fromDate: e.target.value})} />
          <Input label="To Date" type="date" value={filters.toDate} onChange={e => setFilters({...filters, toDate: e.target.value})} />
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
        <div className="p-4 flex items-center border border-green-100 bg-[#f0fdf4]">
          <div className="p-3 rounded-none bg-green-100 text-green-600 mr-4">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Income</p>
            <p className="text-xl font-bold text-gray-800">₹{summary.totalIncome}</p>
          </div>
        </div>
        <div className="p-4 flex items-center border border-red-100 bg-[#fef2f2]">
          <div className="p-3 rounded-none bg-red-100 text-red-600 mr-4">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Expenses</p>
            <p className="text-xl font-bold text-gray-800">₹{summary.totalExpenses}</p>
          </div>
        </div>
        <div className="p-4 flex items-center border border-blue-100 bg-[#eff6ff]">
          <div className="p-3 rounded-none bg-blue-100 text-blue-600 mr-4">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Gross Profit</p>
            <p className="text-xl font-bold text-gray-800">₹{summary.grossProfit}</p>
          </div>
        </div>
        <div className="p-4 flex items-center border border-purple-100 bg-[#faf5ff]">
          <div className="p-3 rounded-none bg-purple-100 text-purple-600 mr-4">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Net Profit</p>
            <p className="text-xl font-bold text-gray-800">₹{summary.netProfit}</p>
          </div>
        </div>
      </div>

      <div className="shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading statement...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {/* Expenses Side */}
            <div className="p-0">
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 text-lg">Expenses</h3>
              </div>
              <div className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 font-medium">Particulars</th>
                      <th className="px-6 py-3 font-medium text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {statementData.expenses.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3 font-medium text-gray-700">{item.name}</td>
                        <td className="px-6 py-3 text-right text-gray-900">₹{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    {netProfitCalc > 0 && (
                      <tr className="hover:bg-gray-50/50 transition-colors bg-green-50/30">
                        <td className="px-6 py-3 font-bold text-green-700">Net Profit</td>
                        <td className="px-6 py-3 text-right font-bold text-green-700">₹{netProfitCalc.toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td className="px-6 py-4 font-bold text-gray-900 text-base">Total</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 text-base">
                        ₹{(totalExpensesCalc + (netProfitCalc > 0 ? netProfitCalc : 0)).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Income Side */}
            <div className="p-0">
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 text-lg">Income</h3>
              </div>
              <div className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 font-medium">Particulars</th>
                      <th className="px-6 py-3 font-medium text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {statementData.income.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3 font-medium text-gray-700">{item.name}</td>
                        <td className="px-6 py-3 text-right text-gray-900">₹{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    {netProfitCalc < 0 && (
                      <tr className="hover:bg-gray-50/50 transition-colors bg-red-50/30">
                        <td className="px-6 py-3 font-bold text-red-700">Net Loss</td>
                        <td className="px-6 py-3 text-right font-bold text-red-700">₹{Math.abs(netProfitCalc).toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td className="px-6 py-4 font-bold text-gray-900 text-base">Total</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 text-base">
                        ₹{(totalIncomeCalc + (netProfitCalc < 0 ? Math.abs(netProfitCalc) : 0)).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};
export default ProfitLoss;
