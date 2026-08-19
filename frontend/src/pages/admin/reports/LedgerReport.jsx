import { useState, useEffect } from 'react';
import { Search, FileText, Download, Printer, Filter, X, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import api from '../../../services/api';

const LedgerReport = () => {
  const [ledgers, setLedgers] = useState([]);
  const [selectedLedger, setSelectedLedger] = useState('');
  
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    voucherType: '',
    referenceModule: ''
  });
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  useEffect(() => {
    fetchLedgers();
  }, []);

  const fetchLedgers = async () => {
    try {
      const response = await api.get('/ledgers');
      setLedgers(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load ledgers');
    }
  };

  const fetchReport = async () => {
    if (!selectedLedger) {
      toast.error('Please select a ledger');
      return;
    }

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        ledgerId: selectedLedger,
        ...(filters.fromDate && { fromDate: filters.fromDate }),
        ...(filters.toDate && { toDate: filters.toDate }),
        ...(filters.voucherType && { voucherType: filters.voucherType }),
        ...(filters.referenceModule && { referenceModule: filters.referenceModule })
      });

      const response = await api.get(`/reports/ledger-statement?${queryParams}`);
      if (response.data.success) {
        setReportData(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };
  
  const exportToExcel = () => {
    if (!reportData) return;
    
    const exportData = [];
    exportData.push(['Ledger Statement Report']);
    exportData.push(['Ledger:', reportData.header?.ledgerName || '', 'Code:', reportData.header?.ledgerCode || '']);
    exportData.push(['Opening Balance:', formatCurrency(reportData.summary.openingBalance)]);
    exportData.push([]);
    exportData.push(['Date', 'Voucher No', 'Type', 'Module', 'Ref. ID', 'Description', 'Bal. Before', 'Debit', 'Credit', 'Bal. After', 'Created By']);
    
    reportData.transactions.forEach(tx => {
      exportData.push([
        formatDate(tx.transactionDate),
        tx.voucherNumber,
        tx.voucherType,
        tx.referenceModule,
        tx.referenceId || '',
        tx.remarks || '',
        tx.balanceBefore || 0,
        tx.debit || 0,
        tx.credit || 0,
        tx.balanceAfter || 0,
        tx.createdBy?.name || ''
      ]);
    });
    
    exportData.push([]);
    exportData.push(['', '', '', '', '', 'Total', '', reportData.summary.totalDebit, reportData.summary.totalCredit, 'Closing Balance:', reportData.summary.currentBalance]);
    
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ledger");
    XLSX.writeFile(wb, `Ledger_Statement_${reportData.header?.ledgerCode || 'Export'}.xlsx`);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ledger Statement Report</h1>
          <p className="text-sm text-gray-500">View complete transaction history and running balances</p>
        </div>
        <div className="flex gap-2">
          <button 
            disabled={!reportData}
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-none hover:bg-gray-50 disabled:opacity-50"
          >
            <Printer size={18} /> Print
          </button>
          <button 
            disabled={!reportData}
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-none hover:bg-gray-50 disabled:opacity-50"
          >
            <Download size={18} /> Export Excel
          </button>
          <button 
            disabled={!reportData}
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-none hover:bg-green-700 disabled:opacity-80 disabled:cursor-not-allowed"
          >
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Ledger *</label>
            <select
              value={selectedLedger}
              onChange={(e) => setSelectedLedger(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">-- Select Ledger --</option>
              {ledgers.map(l => (
                <option key={l._id} value={l._id}>{l.ledgerName} ({l.ledgerCode})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Search size={18} /> Generate</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {reportData && (
        <div className="space-y-6">
          
          {/* Header & Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{reportData.header.ledgerName}</h2>
                <div className="flex gap-4 mt-1 text-sm text-gray-500">
                  <span>Code: <span className="font-medium text-gray-700">{reportData.header.ledgerCode}</span></span>
                  <span>Group: <span className="font-medium text-gray-700">{reportData.header.accountGroup}</span></span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <div className="p-5">
                <p className="text-sm text-gray-500 mb-1">Opening Balance</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(reportData.summary.openingBalance)}</p>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-500 mb-1">Total Debit</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(reportData.summary.totalDebit)}</p>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-500 mb-1">Total Credit</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(reportData.summary.totalCredit)}</p>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
                <p className="text-xl font-bold text-gray-900">{reportData.summary.totalTransactions}</p>
              </div>
              <div className="p-5 bg-green-50/50">
                <p className="text-sm text-gray-500 mb-1">Closing Balance</p>
                <p className="text-2xl font-black text-green-700">{formatCurrency(reportData.summary.currentBalance)}</p>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap">Date</th>
                    <th className="px-4 py-3 whitespace-nowrap">Voucher No</th>
                    <th className="px-4 py-3 whitespace-nowrap">Type / Module</th>
                    <th className="px-4 py-3 whitespace-nowrap">Ref. ID</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">Bal. Before</th>
                    <th className="px-4 py-3 text-right text-red-600">Debit</th>
                    <th className="px-4 py-3 text-right text-green-600">Credit</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">Bal. After</th>
                    <th className="px-4 py-3 whitespace-nowrap">Created By</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  
                  {/* Dedicated Opening Balance Row */}
                  <tr className="bg-gray-50/50 font-medium text-gray-900">
                    <td className="px-4 py-3" colSpan="8">Opening Balance (Brought Forward)</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(reportData.summary.openingBalance)}</td>
                    <td colSpan="2"></td>
                  </tr>

                  {reportData.transactions.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                        No transactions found for the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    reportData.transactions.map((tx, idx) => (
                      <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-gray-600">{formatDate(tx.transactionDate)}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{tx.voucherNumber}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {tx.voucherType}
                          </span>
                          <span className="block text-xs text-gray-500 mt-0.5">{tx.referenceModule}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{tx.referenceId}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate" title={tx.remarks}>
                          {tx.remarks}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">{formatCurrency(tx.balanceBefore)}</td>
                        <td className="px-4 py-3 text-right font-medium text-red-600">
                          {tx.debit > 0 ? formatCurrency(tx.debit) : '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-green-600">
                          {tx.credit > 0 ? formatCurrency(tx.credit) : '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(tx.balanceAfter)}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {tx.createdBy ? (tx.createdBy.name || tx.createdBy.username) : 'System'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button 
                            onClick={() => setSelectedTransaction(tx)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Audit Details"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText size={20} className="text-green-600" />
                Transaction Audit Details
              </h3>
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                <p className="font-medium text-gray-900">{selectedTransaction.transactionId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Voucher Number</p>
                <p className="font-medium text-gray-900">{selectedTransaction.voucherNumber}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                <p className="font-medium text-gray-900">{formatDateTime(selectedTransaction.transactionDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Created By</p>
                <p className="font-medium text-gray-900">
                  {selectedTransaction.createdBy ? `${selectedTransaction.createdBy.name || selectedTransaction.createdBy.username}` : 'System / Auto'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Reference Module</p>
                <p className="font-medium text-gray-900">{selectedTransaction.referenceModule}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Reference ID</p>
                <p className="font-medium text-gray-900">{selectedTransaction.referenceId}</p>
              </div>

              <div className="col-span-2">
                <p className="text-sm text-gray-500 mb-1">Description / Remarks</p>
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-800 border border-gray-100">
                  {selectedTransaction.remarks || 'No remarks provided.'}
                </div>
              </div>

              <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Balance Before</p>
                    <p className="font-semibold text-gray-700">{formatCurrency(selectedTransaction.balanceBefore)}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${selectedTransaction.debit > 0 ? 'bg-red-50 text-red-700' : selectedTransaction.credit > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-50'}`}>
                    <p className="text-xs opacity-70 mb-1">Amount</p>
                    <p className="font-bold">
                      {selectedTransaction.debit > 0 
                        ? `- ${formatCurrency(selectedTransaction.debit)} (Dr)`
                        : selectedTransaction.credit > 0 
                          ? `+ ${formatCurrency(selectedTransaction.credit)} (Cr)`
                          : '-'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Balance After</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(selectedTransaction.balanceAfter)}</p>
                  </div>
                </div>
              </div>
              
              <div className="col-span-2 flex justify-between text-xs text-gray-400 border-t border-gray-100 pt-4">
                <span>IP: {selectedTransaction.ipAddress || 'N/A'}</span>
                <span>Browser: {selectedTransaction.browser || 'N/A'}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LedgerReport;
