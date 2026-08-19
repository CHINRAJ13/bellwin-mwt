import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { Loader2, Plus, Search, Filter } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

const LedgerMaster = () => {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    ledgerName: '',
    accountGroup: 'Assets',
    openingBalance: '',
    balanceType: 'Debit',
    branch: 'All',
    description: ''
  });

  const accountGroups = [
    'Assets', 'Liabilities', 'Capital', 'Income', 'Expense'
  ];

  const navigate = useNavigate();

  useEffect(() => {
    fetchLedgers();
  }, []);

  const fetchLedgers = async () => {
    try {
      const { data } = await api.get('/ledgers');
      if (data.success) {
        setLedgers(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch ledgers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await api.post('/ledgers', formData);
      if (data.success) {
        toast.success('Ledger created successfully!');
        setShowCreateForm(false);
        setFormData({
          ledgerName: '',
          accountGroup: 'Assets',
          openingBalance: '',
          balanceType: 'Debit',
          branch: 'All',
          description: ''
        });
        fetchLedgers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating ledger');
      setLoading(false);
    }
  };

  const filteredLedgers = ledgers.filter(l => 
    l.ledgerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.ledgerCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 h-[calc(100vh-64px)] overflow-y-auto">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ledger Master</h1>
          <p className="text-gray-500 text-sm mt-1">Enterprise Chart of Accounts</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg shadow hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          <span>New Ledger</span>
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h2 className="text-lg font-semibold text-gray-800">Create New Ledger</h2>
            <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600">×</button>
          </div>
          
          <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 form-spiritual-bg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ledger Name *</label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                value={formData.ledgerName}
                onChange={(e) => setFormData({...formData, ledgerName: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Group *</label>
              <select 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.accountGroup}
                onChange={(e) => setFormData({...formData, accountGroup: e.target.value})}
              >
                {accountGroups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opening Balance</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                  value={formData.openingBalance}
                  onChange={(e) => setFormData({...formData, openingBalance: e.target.value})}
                />
                <select 
                  className="px-3 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
                  value={formData.balanceType}
                  onChange={(e) => setFormData({...formData, balanceType: e.target.value})}
                >
                  <option value="Debit">Dr</option>
                  <option value="Credit">Cr</option>
                </select>
              </div>
            </div>

            <div className="lg:col-span-3 flex justify-end gap-3 mt-4">
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin inline" size={20} /> : 'Save Ledger'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID, Name or Phone Number..." 
              className="search-input pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100">
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 border-b font-medium">Code</th>
                <th className="p-4 border-b font-medium">Ledger Name</th>
                <th className="p-4 border-b font-medium">Group</th>
                <th className="p-4 border-b font-medium text-right">Opening Bal</th>
                <th className="p-4 border-b font-medium text-right">Debit</th>
                <th className="p-4 border-b font-medium text-right">Credit</th>
                <th className="p-4 border-b font-medium text-right">Closing Bal</th>
                <th className="p-4 border-b font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && ledgers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto mb-2" />
                    Loading ledgers...
                  </td>
                </tr>
              ) : filteredLedgers.length > 0 ? (
                filteredLedgers.map((l) => (
                  <tr 
                    key={l._id} 
                    className="border-b hover:bg-indigo-50/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/accounts/ledger-master/${l._id}`)}
                  >
                    <td className="p-4 text-sm font-medium text-blue-600">{l.ledgerCode}</td>
                    <td className="p-4 text-sm font-semibold text-gray-800">{l.ledgerName}</td>
                    <td className="p-4 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-xs">{l.accountGroup}</span>
                    </td>
                    <td className="p-4 text-sm text-right text-gray-600">₹{l.openingBalance?.toLocaleString('en-IN') || 0} {l.balanceType === 'Debit' ? 'Dr' : 'Cr'}</td>
                    <td className="p-4 text-sm text-right text-red-600">₹{l.totalDebit?.toLocaleString('en-IN') || 0}</td>
                    <td className="p-4 text-sm text-right text-green-600">₹{l.totalCredit?.toLocaleString('en-IN') || 0}</td>
                    <td className="p-4 text-sm text-right font-bold text-gray-800">
                      ₹{l.currentBalance?.toLocaleString('en-IN') || 0} {l.balanceType === 'Debit' ? 'Dr' : 'Cr'}
                    </td>
                    <td className="p-4 text-sm text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${l.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">No ledgers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LedgerMaster;
