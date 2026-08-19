import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Search, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../../../services/api';

const ExpenseApproval = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const role = user.role || 'employee';
  const isAdmin = role === 'admin' || role === 'super admin' || role === 'Super Admin';

  useEffect(() => {
    fetchPendingExpenses();
  }, []);

  const fetchPendingExpenses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/expenses/report');
      const data = response.data;
      if (data.success) {
        // Only keep the pending ones
        const pending = data.data.filter(exp => !exp.status || exp.status === 'Pending');
        setExpenses(pending);
      }
    } catch (error) {
      console.error('Error fetching pending expenses:', error);
      toast.error('Failed to load pending expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (expenseId, status) => {
    const actionText = status === 'Approved' ? 'approve' : 'reject';
    if (window.confirm(`Are you sure you want to ${actionText} expense request ${expenseId}?`)) {
      try {
        const response = await api.put(`/expenses/status/${expenseId}`, { status });
        if (response.data.success) {
          toast.success(`Expense ${status.toLowerCase()} successfully!`);
          fetchPendingExpenses();
        }
      } catch (error) {
        console.error(`Error updating expense status to ${status}:`, error);
        toast.error(error.response?.data?.message || `Failed to update status to ${status}`);
      }
    }
  };

  const filteredExpenses = expenses.filter(exp => {
    const term = searchTerm.toLowerCase();
    return (
      (exp.expenseId || '').toLowerCase().includes(term) ||
      (exp.expenseCategory || '').toLowerCase().includes(term) ||
      (exp.paidToVendorName || '').toLowerCase().includes(term) ||
      (exp.enteredBy || '').toLowerCase().includes(term)
    );
  });

  if (loading) return <div className="p-6 text-center text-gray-600">Loading pending expense approvals...</div>;

  return (
    <div className="flex flex-col space-y-4 h-full">
      {/* Header */}
      <div className="flex flex-row justify-between items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pending Expense Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Review and approve pending expenses before they are posted to the accounts ledger.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-4 flex items-center justify-between">
        <div className="relative w-80">
          <input
            type="text"
            placeholder="Search by ID, Category, Vendor, Staff..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-sm pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
        <span className="text-gray-600 font-medium text-sm">Showing {filteredExpenses.length} pending records</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Expense ID</th>
                <th className="px-4 py-3">Category / Sub</th>
                <th className="px-4 py-3">Vendor Name</th>
                <th className="px-4 py-3">Payment Mode</th>
                <th className="px-4 py-3">Entered By</th>
                <th className="px-4 py-3 text-right">Amount (₹)</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
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
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${exp.paymentMode === 'Cash' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                        {exp.paymentMode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{exp.enteredBy || '-'}</td>
                    <td className="px-4 py-3 font-bold text-gray-900 text-right">
                      {exp.expenseAmount ? exp.expenseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-yellow-100 text-yellow-800">
                        {exp.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        {isAdmin ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(exp.expenseId, 'Approved')}
                              className="text-green-600 hover:text-green-800 flex items-center justify-center gap-1 text-xs font-semibold cursor-pointer border border-green-200 rounded px-2 py-1 hover:bg-green-50"
                              title="Approve"
                            >
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(exp.expenseId, 'Rejected')}
                              className="text-red-600 hover:text-red-800 flex items-center justify-center gap-1 text-xs font-semibold cursor-pointer border border-red-200 rounded px-2 py-1 hover:bg-red-50"
                              title="Reject"
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">Needs Admin Approval</span>
                        )}
                        {(exp.expenseImage || exp.billReceiptUpload) && (
                          <a
                            href={exp.expenseImage || `http://localhost:5000/${exp.billReceiptUpload}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 text-xs font-medium border border-blue-200 rounded px-2 py-1 hover:bg-blue-50"
                            title="View Bill"
                          >
                            <FileText size={12} /> Bill
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                    <AlertCircle className="mx-auto text-gray-300 mb-2" size={32} />
                    No pending expense requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseApproval;
