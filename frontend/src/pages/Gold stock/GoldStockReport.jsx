import React, { useState, useEffect } from 'react';
import BranchSelect from '../../components/ui/BranchSelect';
import { toast } from 'react-hot-toast';
import { Package, Tag, Scale, Gavel, Filter, Plus, FileText, FileDown, Search, X } from 'lucide-react';
import { exportToExcel, exportTableToPDF } from '../../utils/exportUtils';
import { getAllGoldStocks, saveGoldStock } from '../../utils/goldStockStore';

const GoldStockReport = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [filters, setFilters] = useState({
    stockId: '',
    loanId: '',
    customerId: '',
    status: 'All Statuses',
    branch: 'All Branches'
  });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    loanId: '',
    customerName: '',
    customerId: '',
    articleName: '',
    articleType: '',
    grossWeight: '',
    netWeight: '',
    purity: '22K',
    appraisedValue: '',
    status: 'In Stock',
  });

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = () => {
    const data = getAllGoldStocks();
    setStocks(data);
    setLoading(false);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      saveGoldStock(formData);
      toast.success('Stock entry added successfully!');
      setShowAddForm(false);
      fetchStocks();
      setFormData({
        date: new Date().toISOString().split('T')[0],
        loanId: '',
        customerName: '',
        customerId: '',
        articleName: '',
        articleType: '',
        grossWeight: '',
        netWeight: '',
        purity: '22K',
        appraisedValue: '',
        status: 'In Stock',
      });
    } catch (error) {
      toast.error('Error saving stock entry');
    }
  };

  const filteredStocks = stocks.filter(s => {
    let match = true;
    if (filters.stockId && !(s.stockId || '').toLowerCase().includes(filters.stockId.toLowerCase())) match = false;
    if (filters.loanId && !(s.loanId || '').toLowerCase().includes(filters.loanId.toLowerCase())) match = false;
    if (filters.customerId && !(s.customerId || '').toLowerCase().includes(filters.customerId.toLowerCase())) match = false;
    if (filters.status !== 'All Statuses' && s.status !== filters.status) match = false;
    if (filters.branch !== 'All Branches' && s.branch !== filters.branch) match = false;
    return match;
  });

  const totalArticles = filteredStocks.length;
  const grossWeight = filteredStocks.reduce((sum, s) => sum + (parseFloat(s.grossWeight) || 0), 0);
  const netWeight = filteredStocks.reduce((sum, s) => sum + (parseFloat(s.netWeight) || 0), 0);
  const auctionReady = filteredStocks.filter(s => s.status === 'Auction Ready').length;

  const handleExportExcel = () => {
    const headers = ['Date', 'Stock ID', 'Loan ID', 'Customer', 'Article', 'Gross (g)', 'Net (g)', 'Purity', 'Appraised', 'Status'];
    const mapper = s => [
      s.date ? new Date(s.date).toLocaleDateString() : '',
      s.stockId || '',
      s.loanId || '',
      s.customerName || '',
      s.articleName || '',
      s.grossWeight || 0,
      s.netWeight || 0,
      s.purity || '',
      s.appraisedValue || 0,
      s.status || ''
    ];
    exportToExcel(filteredStocks, headers, mapper, `Gold_Stock_Ledger_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportPDF = () => {
    const headers = ['Date', 'Stock ID', 'Loan ID', 'Customer', 'Article', 'Gross (g)', 'Net (g)', 'Purity', 'Appraised', 'Status'];
    const mapper = s => [
      s.date ? new Date(s.date).toLocaleDateString() : '',
      s.stockId || '',
      s.loanId || '',
      s.customerName || '',
      s.articleName || '',
      s.grossWeight || 0,
      s.netWeight || 0,
      s.purity || '',
      s.appraisedValue || 0,
      s.status || ''
    ];
    exportTableToPDF('Gold Stock Ledger', headers, filteredStocks, mapper, `Gold_Stock_Ledger_${new Date().toISOString().split('T')[0]}`);
  };

  const inp = "w-full px-3 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors";
  const lbl = "block text-xs font-semibold text-gray-500 mb-1";

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Auctioned': return <span className="px-3 py-1 rounded text-xs font-semibold text-red-600 border border-red-200 bg-white shadow-sm">Auctioned</span>;
      case 'Released': return <span className="px-3 py-1 rounded text-xs font-semibold text-green-600 border border-green-200 bg-white shadow-sm">Released</span>;
      case 'In Stock': return <span className="px-3 py-1 rounded text-xs font-semibold text-blue-600 border border-blue-200 bg-white shadow-sm">In Stock</span>;
      case 'Auction Ready': return <span className="px-3 py-1 rounded text-xs font-semibold text-orange-600 border border-orange-200 bg-white shadow-sm">Auction Ready</span>;
      default: return <span className="px-3 py-1 rounded text-xs font-semibold text-gray-600 border border-gray-200 bg-white shadow-sm">{status}</span>;
    }
  };

  return (
    <div className="p-6 h-full flex flex-col bg-gray-50/30">
      <div className="flex flex-row justify-between items-center gap-4 mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="w-6 h-6" /> Gold Stock Ledger
        </h2>
        <div className="flex gap-3">
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-none hover:bg-gray-50 shadow-sm transition-colors text-sm">
            <FileText size={16} /> Export PDF
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-none hover:bg-gray-50 shadow-sm transition-colors text-sm">
            <FileDown size={16} /> Export Excel
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-erp-green text-white font-bold rounded-none hover:bg-green-700 shadow-sm transition-colors text-sm"
          >
            <Plus className="w-4 h-4" /> {showAddForm ? 'Cancel Entry' : 'Add Stock Entry'}
          </button>
        </div>
      </div>

      {/* Top Stat Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1e3a8a] rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-white/90 tracking-wide">Total Articles</div>
            <div className="text-3xl font-bold text-white mt-1">{totalArticles}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Tag className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="bg-[#581c87] rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-white/90 tracking-wide">Gross Weight (g)</div>
            <div className="text-3xl font-bold text-white mt-1">{grossWeight.toFixed(2)}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Scale className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="bg-[#064e3b] rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-white/90 tracking-wide">Net Weight (g)</div>
            <div className="text-3xl font-bold text-white mt-1">{netWeight.toFixed(2)}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Scale className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="bg-[#713f12] rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-white/90 tracking-wide">Auction Ready</div>
            <div className="text-3xl font-bold text-white mt-1">{auctionReady}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Gavel className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-6 shrink-0 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Add Gold Stock Entry</h3>
            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
          </div>
          <div className="">
            <form id="add-gold-form" onSubmit={handleSubmit} className="space-y-6 form-spiritual-bg">
              <div className="grid grid-cols-4 gap-5">
                <div>
                  <label className={lbl}>Date <span className="text-red-500">*</span></label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} required className={inp} />
                </div>
                <div>
                  <label className={lbl}>Loan ID</label>
                  <input type="text" name="loanId" value={formData.loanId} onChange={handleChange} className={inp} placeholder="e.g., LOAN000001" />
                </div>
                <div>
                  <label className={lbl}>Customer Name <span className="text-red-500">*</span></label>
                  <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required className={inp} placeholder="e.g., John Doe" />
                </div>
                <div>
                  <label className={lbl}>Customer ID</label>
                  <input type="text" name="customerId" value={formData.customerId} onChange={handleChange} className={inp} placeholder="e.g., CUST000001" />
                </div>
                <div>
                  <label className={lbl}>Article Name <span className="text-red-500">*</span></label>
                  <input type="text" name="articleName" value={formData.articleName} onChange={handleChange} required className={inp} placeholder="e.g., Bangle" />
                </div>
                <div>
                  <label className={lbl}>Article Type</label>
                  <input type="text" name="articleType" value={formData.articleType} onChange={handleChange} className={inp} placeholder="e.g., Gold" />
                </div>
                <div>
                  <label className={lbl}>Gross Weight (g) <span className="text-red-500">*</span></label>
                  <input type="number" name="grossWeight" value={formData.grossWeight} onChange={handleChange} required className={inp} placeholder="0.00" />
                </div>
                <div>
                  <label className={lbl}>Net Weight (g) <span className="text-red-500">*</span></label>
                  <input type="number" name="netWeight" value={formData.netWeight} onChange={handleChange} required className={inp} placeholder="0.00" />
                </div>
                <div>
                  <label className={lbl}>Purity</label>
                  <input type="text" name="purity" value={formData.purity} onChange={handleChange} className={inp} placeholder="e.g., 22K" />
                </div>
                <div>
                  <label className={lbl}>Appraised Value (₹)</label>
                  <input type="number" name="appraisedValue" value={formData.appraisedValue} onChange={handleChange} className={inp} placeholder="0" />
                </div>
                <div>
                  <label className={lbl}>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className={inp}>
                    <option value="In Stock">In Stock</option>
                    <option value="Released">Released</option>
                    <option value="Auction Ready">Auction Ready</option>
                    <option value="Auctioned">Auctioned</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          <div className="p-4 shrink-0 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-5 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
            >
              Cancel
            </button>
            <button
              form="add-gold-form"
              type="submit"
              className="px-6 py-1.5 text-[15px] bg-erp-green text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm inline-flex items-center justify-center gap-1.5 disabled:opacity-50 w-auto tracking-wide"
            >
              Save Entry
            </button>
          </div>
        </div>
      )}

      {/* Filter Ledger */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-bold text-gray-700">Filter Ledger</span>
        </div>
        <div className="p-4 grid grid-cols-6 gap-4">
          <div>
            <label className={lbl}>Stock ID</label>
            <input type="text" name="stockId" value={filters.stockId} onChange={handleFilterChange} className={inp} placeholder="GSTK..." />
          </div>
          <div>
            <label className={lbl}>Loan ID</label>
            <input type="text" name="loanId" value={filters.loanId} onChange={handleFilterChange} className={inp} placeholder="LOAN..." />
          </div>
          <div>
            <label className={lbl}>Customer ID</label>
            <input type="text" name="customerId" value={filters.customerId} onChange={handleFilterChange} className={inp} placeholder="CUST..." />
          </div>
          <div>
            <label className={lbl}>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange} className={inp}>
              <option value="All Statuses">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Released">Released</option>
              <option value="Auction Ready">Auction Ready</option>
              <option value="Auctioned">Auctioned</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Branch</label>
            <BranchSelect name="branch" value={filters.branch} onChange={handleFilterChange} className={inp} />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-4 py-3 text-gray-600 font-bold text-xs tracking-wider">Date</th>
                <th className="px-4 py-3 text-gray-600 font-bold text-xs tracking-wider">Stock ID</th>
                <th className="px-4 py-3 text-gray-600 font-bold text-xs tracking-wider">Loan ID</th>
                <th className="px-4 py-3 text-gray-600 font-bold text-xs tracking-wider">Customer</th>
                <th className="px-4 py-3 text-gray-600 font-bold text-xs tracking-wider">Article</th>
                <th className="px-4 py-3 text-gray-600 font-bold text-xs tracking-wider">Gross (g)</th>
                <th className="px-4 py-3 text-gray-600 font-bold text-xs tracking-wider">Net (g)</th>
                <th className="px-4 py-3 text-gray-600 font-bold text-xs tracking-wider">Purity</th>
                <th className="px-4 py-3 text-gray-600 font-bold text-xs tracking-wider">Appraised (₹)</th>
                <th className="px-4 py-3 text-gray-600 font-bold text-xs tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center p-8 text-gray-500 text-sm italic">Loading...</td>
                </tr>
              ) : filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center p-8 text-gray-500 text-sm italic">No records found.</td>
                </tr>
              ) : (
                filteredStocks.map((stock) => (
                  <tr key={stock.stockId} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {stock.date ? new Date(stock.date).toLocaleDateString('en-GB') : ''}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-800">{stock.stockId}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-800">{stock.loanId}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-bold text-gray-800">{stock.customerName}</div>
                      <div className="text-xs text-gray-400">{stock.customerId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-bold text-gray-800">{stock.articleName}</div>
                      <div className="text-xs text-gray-400">{stock.articleType}</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">{stock.grossWeight}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">{stock.netWeight}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{stock.purity}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                      {stock.appraisedValue ? `₹${Number(stock.appraisedValue).toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(stock.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GoldStockReport;
