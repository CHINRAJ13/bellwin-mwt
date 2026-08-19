import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Filter, Calendar as CalendarIcon, Printer, Search, Download, IndianRupee, Eye, Trash2, Edit, FileText, Plus } from 'lucide-react';
import { exportToExcel, exportTableToPDF } from '../../../utils/exportUtils';
import api from '../../../services/api';

const ExpenseReport = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [datePreset, setDatePreset] = useState('All Time');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');

  // Dropdown options derived from data

  const [categories, setCategories] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/expenses/report');
      const data = response.data;
      if (data.success) {
        setExpenses(data.data);

        // Extract unique values for dropdowns

        setCategories([...new Set(data.data.map(e => e.expenseCategory).filter(Boolean))]);
        setPaymentModes([...new Set(data.data.map(e => e.paymentMode).filter(Boolean))]);
        setEmployees([...new Set(data.data.map(e => e.enteredBy).filter(Boolean))]);
        setVendors([...new Set(data.data.map(e => e.paidToVendorName).filter(Boolean))]);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm(`Are you sure you want to delete expense ${expenseId}?`)) {
      try {
        await api.delete(`/expenses/${expenseId}`);
        toast.success('Expense deleted successfully!');
        fetchExpenses();
      } catch (err) {
        console.error('Error deleting expense:', err);
        toast.error(err.response?.data?.message || 'Failed to delete expense');
      }
    }
  };

  // Helper for date presets
  const applyDatePreset = (preset) => {
    setDatePreset(preset);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let start = '';
    let end = '';

    if (preset === 'Today') {
      start = today.toISOString().split('T')[0];
      end = start;
    } else if (preset === 'Yesterday') {
      const yest = new Date(today);
      yest.setDate(yest.getDate() - 1);
      start = yest.toISOString().split('T')[0];
      end = start;
    } else if (preset === 'This Week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      start = startOfWeek.toISOString().split('T')[0];
      end = new Date().toISOString().split('T')[0];
    } else if (preset === 'This Month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      start = startOfMonth.toISOString().split('T')[0];
      end = new Date().toISOString().split('T')[0];
    }

    setStartDate(start);
    setEndDate(end);
  };

  // Filter Logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.expenseDate).setHours(0, 0, 0, 0);

      let passDate = true;
      if (startDate && endDate) {
        const start = new Date(startDate).setHours(0, 0, 0, 0);
        const end = new Date(endDate).setHours(23, 59, 59, 999);
        passDate = expDate >= start && expDate <= end;
      } else if (startDate) {
        passDate = expDate >= new Date(startDate).setHours(0, 0, 0, 0);
      } else if (endDate) {
        passDate = expDate <= new Date(endDate).setHours(23, 59, 59, 999);
      }


      const passCategory = categoryFilter ? exp.expenseCategory === categoryFilter : true;
      const passPaymentMode = paymentModeFilter ? exp.paymentMode === paymentModeFilter : true;
      const passEmployee = employeeFilter ? exp.enteredBy === employeeFilter : true;

      // Basic text match for vendor (can be dropdown or text input, using simple text match here)
      const passVendor = vendorFilter ? (exp.paidToVendorName || '').toLowerCase().includes(vendorFilter.toLowerCase()) : true;

      return passDate && passCategory && passPaymentMode && passEmployee && passVendor;
    });
  }, [expenses, startDate, endDate, categoryFilter, paymentModeFilter, employeeFilter, vendorFilter]);

  // Summary Calculations
  const summary = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    let total = 0;
    let todayTotal = 0;
    let monthTotal = 0;
    let cashTotal = 0;
    let bankUpiTotal = 0;

    // Calculate Branch & Category totals based on filtered view

    const categoryTotals = {};

    filteredExpenses.forEach(exp => {
      const amount = exp.expenseAmount || 0;
      total += amount;

      const expDateObj = new Date(exp.expenseDate);
      const expDate = expDateObj.setHours(0, 0, 0, 0);

      if (expDate === today) todayTotal += amount;
      if (expDateObj.getMonth() === thisMonth && expDateObj.getFullYear() === thisYear) {
        monthTotal += amount;
      }

      if (exp.paymentMode === 'Cash') cashTotal += amount;
      if (['Bank Transfer', 'UPI', 'Card', 'Cheque'].includes(exp.paymentMode)) bankUpiTotal += amount;


      if (exp.expenseCategory) {
        categoryTotals[exp.expenseCategory] = (categoryTotals[exp.expenseCategory] || 0) + amount;
      }
    });


    const topCategory = Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a])[0];

    return { total, todayTotal, monthTotal, cashTotal, bankUpiTotal, topCategory, categoryTotals };
  }, [filteredExpenses]);

  const handleExportExcel = () => {
    const headers = ['Date', 'Expense ID', 'Category', 'Sub Category', 'Vendor', 'Amount', 'Mode', 'Entered By', 'Approved By', 'Status'];
    const mapper = exp => [
      exp.expenseDate ? new Date(exp.expenseDate).toLocaleDateString() : '',
      exp.expenseId || '',
      exp.expenseCategory || '',
      exp.expenseSubCategory || '',
      exp.paidToVendorName || '',
      exp.expenseAmount || 0,
      exp.paymentMode || '',
      exp.enteredBy || '',
      exp.approvedBy || '',
      'Paid'
    ];
    exportToExcel(filteredExpenses, headers, mapper, `Expense_Report_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportPDF = () => {
    const headers = ['Date', 'Expense ID', 'Category', 'Sub Category', 'Vendor', 'Amount', 'Mode', 'Entered By', 'Status'];
    const mapper = exp => [
      exp.expenseDate ? new Date(exp.expenseDate).toLocaleDateString() : '',
      exp.expenseId || '',
      exp.expenseCategory || '',
      exp.expenseSubCategory || '',
      exp.paidToVendorName || '',
      exp.expenseAmount || 0,
      exp.paymentMode || '',
      exp.enteredBy || '',
      'Paid'
    ];
    exportTableToPDF(filteredExpenses, headers, mapper, 'Expense Report', `Expense_Report_${new Date().toISOString().split('T')[0]}`);
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  const clearFilters = () => {
    setDatePreset('All Time');
    setStartDate('');
    setEndDate('');

    setCategoryFilter('');
    setPaymentModeFilter('');
    setEmployeeFilter('');
    setVendorFilter('');
  };

  if (loading) return <div className="p-6 text-center text-gray-600">Loading comprehensive expense report...</div>;

  return (
    <div className="flex flex-col space-y-4" style={{ height: 'calc(100vh - 100px)' }}>
      {/* Header Actions */}
      <div className="flex flex-row justify-between items-center gap-4 shrink-0 print:hidden">
        <h1 className="text-2xl font-bold text-text-primary">Expense Report Overview</h1>
        <div className="flex gap-3">
          <NavLink to="/admin/expense/add" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-bold hover:bg-green-700 shadow-sm transition-all">
            <Plus className="w-4 h-4" /> Add Expense
          </NavLink>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition">
            <Printer size={18} /> Print
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-bold text-red-700 hover:bg-red-100 shadow-sm transition-all">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 print:grid-cols-4">
        <div className="bg-[#1e3a8a] rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-white/90 uppercase tracking-wide">Today's Expense</div>
            <div className="text-2xl font-bold text-white mt-1">₹{summary.todayTotal.toLocaleString('en-IN')}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="bg-[#581c87] rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-white/90 uppercase tracking-wide">This Month's Expense</div>
            <div className="text-2xl font-bold text-white mt-1">₹{summary.monthTotal.toLocaleString('en-IN')}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="bg-[#064e3b] rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-white/90 uppercase tracking-wide">Cash Expenses (Filtered)</div>
            <div className="text-2xl font-bold text-white mt-1">₹{summary.cashTotal.toLocaleString('en-IN')}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="bg-[#713f12] rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-white/90 uppercase tracking-wide">Bank/UPI Expenses (Filtered)</div>
            <div className="text-2xl font-bold text-white mt-1">₹{summary.bankUpiTotal.toLocaleString('en-IN')}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-white/90 uppercase tracking-wide">Top Spending Category</div>
            <div className="text-xl font-bold text-white mt-1 truncate">
              {summary.topCategory ? `${summary.topCategory} (₹${summary.categoryTotals[summary.topCategory].toLocaleString('en-IN')})` : 'N/A'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 print:hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2"><Filter size={20} className="text-gray-500" /> Advanced Filters</h3>
          <button onClick={clearFilters} className="text-sm text-red-500 hover:underline">Clear All Filters</button>
        </div>

        {/* Date Presets */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['All Time', 'Today', 'Yesterday', 'This Week', 'This Month'].map(preset => (
            <button
              key={preset}
              onClick={() => applyDatePreset(preset)}
              className={`px-3 py-1 text-sm rounded-full border transition ${datePreset === preset ? 'bg-erp-green text-white border-erp-green' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
            >
              {preset}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">

          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full text-sm px-3 py-2 border rounded-md bg-white">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Payment Mode</label>
            <select value={paymentModeFilter} onChange={e => setPaymentModeFilter(e.target.value)} className="w-full text-sm px-3 py-2 border rounded-md bg-white">
              <option value="">All Modes</option>
              {paymentModes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Entered By</label>
            <select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} className="w-full text-sm px-3 py-2 border rounded-md bg-white">
              <option value="">All Staff</option>
              {employees.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden print:border-none print:shadow-none">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center print:bg-white print:border-b-2 print:border-black print:px-0">
          <h2 className="text-lg font-bold text-gray-800">Filtered Expenses</h2>
          <span className="text-gray-600 font-medium text-sm">Showing {filteredExpenses.length} records</span>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse text-sm print:text-xs">
            <thead>
              <tr className="bg-white border-b-2 border-gray-200 text-gray-700 print:border-black">
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Expense ID</th>

                <th className="px-4 py-3 font-semibold">Category / Sub</th>
                <th className="px-4 py-3 font-semibold">Vendor Name</th>
                <th className="px-4 py-3 font-semibold">Mode</th>
                <th className="px-4 py-3 font-semibold">By</th>
                <th className="px-4 py-3 font-semibold text-right">Amount (₹)</th>
                <th className="px-4 py-3 font-semibold text-center print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {exp.expenseDate ? new Date(exp.expenseDate).toLocaleDateString('en-IN') : '-'}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{exp.expenseId}</td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{exp.expenseCategory}</span>
                        {exp.expenseSubCategory && <span className="text-xs text-gray-500">{exp.expenseSubCategory}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{exp.paidToVendorName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${exp.paymentMode === 'Cash' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                        {exp.paymentMode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-gray-800">{exp.enteredBy || '-'}</span>
                        {exp.approvedBy && <span className="text-xs text-gray-500">Appr: {exp.approvedBy}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900 text-right">
                      {exp.expenseAmount ? exp.expenseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                    </td>
                    <td className="px-4 py-3 text-center print:hidden">
                      <div className="flex items-center justify-center gap-3">
                        <NavLink to={`/admin/expense/edit/${exp.expenseId}`} className="text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 text-xs font-medium" title="Edit Expense">
                          <Edit size={14} /> Edit
                        </NavLink>
                        <button type="button" onClick={() => handleDelete(exp.expenseId)} className="text-red-600 hover:text-red-800 flex items-center justify-center gap-1 text-xs font-medium cursor-pointer" title="Delete Expense">
                          <Trash2 size={14} /> Delete
                        </button>
                        {(exp.expenseImage || exp.billReceiptUpload) && (
                          <a href={exp.expenseImage || `http://localhost:5000/${exp.billReceiptUpload}`} target="_blank" rel="noreferrer" className="text-green-600 hover:text-green-800 flex items-center justify-center gap-1 text-xs font-medium" title="View Bill/Item Image">
                            <FileText size={14} /> Bill
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                    <Search className="mx-auto text-gray-300 mb-2" size={32} />
                    No expenses match your current filters.
                  </td>
                </tr>
              )}
            </tbody>
            {filteredExpenses.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-200 print:border-black">
                <tr>
                  <td colSpan="7" className="px-4 py-4 text-right font-bold text-gray-800 uppercase tracking-wider">Filtered Total:</td>
                  <td className="px-4 py-4 text-right font-bold text-erp-green text-lg print:text-black">
                    ₹{summary.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="print:hidden"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

    </div>
  );
};

export default ExpenseReport;
