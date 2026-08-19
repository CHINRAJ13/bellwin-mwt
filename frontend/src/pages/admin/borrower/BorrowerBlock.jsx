import { useState, useEffect } from 'react';
import { ShieldAlert, Search, ShieldCheck, UserCheck, Calendar, Lock, Unlock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Badge from '../../../components/ui/Badge';
import DataTable from '../../../components/ui/DataTable';
import { TD, TR } from '../../../components/ui/Table';

const STORAGE_KEY = 'belwin_customers';
const BLOCK_LOG_KEY = 'belwin_block_logs';

const BorrowerBlock = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedBorrower, setSelectedBorrower] = useState(null);

  const [loading, setLoading] = useState(false);
  const [blockLogs, setBlockLogs] = useState([]);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const currentUsername = user.username || 'Admin';

  const [formData, setFormData] = useState({
    action: 'Block', // 'Block' or 'Unblock'
    reason: '',
    date: new Date().toISOString().split('T')[0],
    approvedBy: currentUsername,
    remarks: ''
  });

  // Fetch borrowers
  const fetchBorrowers = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (branchFilter !== 'All') queryParams.append('branch', branchFilter);
      if (fromDate) queryParams.append('startDate', fromDate);
      if (toDate) queryParams.append('endDate', toDate);
      if (searchQuery) queryParams.append('search', searchQuery);

      const res = await api.get(`/customers?${queryParams.toString()}`);
      let fetchedData = res.data.data || res.data.customers || res.data || [];
      setBorrowers(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (err) {
      console.warn('API customer load failed, loading from LocalStorage fallback');
      const local = localStorage.getItem(STORAGE_KEY);
      let localData = local ? JSON.parse(local) : [];
      setBorrowers(Array.isArray(localData) ? localData : []);
    }
  };

  const loadLogs = async () => {
    try {
      const res = await api.get('/customers/audit/blocks');
      if (res.data && res.data.data) {
        setBlockLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load block logs:', err);
    }
  };

  useEffect(() => {
    fetchBorrowers();
    loadLogs();
  }, []);

  const handleSelectBorrower = (borrower) => {
    setSelectedBorrower(borrower);
    setSearchQuery('');
    setFormData({
      action: borrower.isBlocked ? 'Unblock' : 'Block',
      reason: '',
      date: new Date().toISOString().split('T')[0],
      approvedBy: currentUsername,
      remarks: ''
    });
  };

  const handleToggleBlock = async (e) => {
    e.preventDefault();
    if (!selectedBorrower) return;
    if (!formData.reason && formData.action === 'Block') {
      toast.error('Please enter block reason');
      return;
    }

    setLoading(true);
    try {
      const isBlocking = formData.action === 'Block';
      await api.put(`/customers/${selectedBorrower._id || selectedBorrower.id}/block`, { 
        isBlocked: isBlocking,
        reason: formData.reason,
        date: formData.date,
        remarks: formData.remarks
      });
      toast.success(`Borrower account successfully ${isBlocking ? 'Blocked' : 'Unblocked'}!`);
      setSelectedBorrower(null);
      await fetchBorrowers();
      await loadLogs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update borrower status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBorrowers = borrowers;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <PageHeader
        title="Customer Account Blocking"
        subtitle="Manage customer suspension, blacklist registries, and restorations."
        icon={ShieldAlert}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Borrower search sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-5">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Find Borrower</h4>
            
            <div className="space-y-3">
              <Select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
              >
                <option value="All">All Branches</option>
                <option value="Head Office">Head Office</option>
                <option value="Branch 01">Branch 01</option>
                <option value="Branch 02">Branch 02</option>
              </Select>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-none text-xs focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-none text-xs focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-white"
                  />
                </div>
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name, ID or mobile..."
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-none text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-gray-50"
                />
              </div>

              <Button onClick={fetchBorrowers} variant="primary" className="w-full justify-center py-2 text-xs">
                Fetch Borrowers
              </Button>
            </div>

            {filteredBorrowers.length > 0 && (
              <div className="mt-2 border border-gray-100 bg-white rounded-none shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-50">
                {filteredBorrowers.map(b => (
                  <button
                    key={b._id || b.id}
                    onClick={() => handleSelectBorrower(b)}
                    className="w-full text-left px-4 py-2.5 hover:bg-green-50 transition-colors flex flex-col gap-0.5 cursor-pointer"
                  >
                    <span className="font-bold text-sm text-gray-900">{b.customerName}</span>
                    <span className="text-xs text-gray-500 font-medium">ID: {b.customerId || b.id} · Mob: {b.mobileNumber}</span>
                  </button>
                ))}
              </div>
            )}

            {selectedBorrower ? (
              <div className="mt-4 p-4 rounded-none bg-green-50/50 border border-green-100 flex flex-col gap-2.5 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                    {selectedBorrower.customerName.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm">{selectedBorrower.customerName}</h5>
                    <p className="text-xs text-gray-500">ID: {selectedBorrower.customerId || selectedBorrower.id}</p>
                  </div>
                </div>
                <div className="text-xs space-y-1 text-gray-600 border-t border-green-100/50 pt-2 font-medium">
                  <p>Current Status:
                    <span className={`ml-2 px-2 py-0.5 rounded-full font-bold ${selectedBorrower.isBlocked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {selectedBorrower.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </p>
                  <p>Mobile: {selectedBorrower.mobileNumber}</p>
                  <p>Branch: {selectedBorrower.branchName || selectedBorrower.branch || 'Head Office'}</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-6 rounded-none bg-gray-50 border border-dashed border-gray-200 text-center text-xs text-gray-400 font-medium">
                Select a borrower to adjust block status.
              </div>
            )}
          </div>
        </div>

        {/* Blocking form */}
        <div className="lg:col-span-2">
          <div className="p-6">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">Block / Unblock Action Form</h4>
            
            {selectedBorrower ? (
              <form onSubmit={handleToggleBlock} className="space-y-4 form-spiritual-bg">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Action"
                    disabled
                    value={formData.action}
                    className="font-bold text-red-600 bg-gray-50"
                  />
                  <Input
                    label="Date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                {formData.action === 'Block' ? (
                  <Select
                    label="Block Reason"
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  >
                    <option value="">Select Reason...</option>
                    <option value="Non-Payment Default">Non-Payment / Default Payment</option>
                    <option value="KYC Fraud Identification">KYC Verification Fraud</option>
                    <option value="Blacklisted Client Check">Security / Risk Review Blacklist</option>
                    <option value="Customer Requested Suspense">Requested Suspend</option>
                  </Select>
                ) : (
                  <Input
                    label="Restoration Reason"
                    disabled
                    value="Account Restored"
                    className="bg-gray-50"
                  />
                )}

                <Input
                  label="Approved By"
                  disabled
                  value={formData.approvedBy}
                  className="bg-gray-50 font-semibold"
                />

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Administrative Remarks</label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Enter block log comments..."
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-none text-sm outline-none text-gray-900 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all placeholder:text-gray-400 h-20"
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 mt-6">
                  <Button
                    type="submit"
                    variant={formData.action === 'Block' ? 'danger' : 'success'}
                    loading={loading}
                    icon={formData.action === 'Block' ? Lock : Unlock}
                  >
                    Confirm {formData.action} Action
                  </Button>
                </div>

              </form>
            ) : (
              <div className="py-12 text-center text-xs text-gray-400 font-medium">
                No borrower selected. Select a borrower on the left panel to configure block list settings.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Block Audit Logs */}
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Blocking Audit Logs</h3>
      <DataTable
        headers={[
          'Date',
          'Borrower ID',
          'Name',
          'Action',
          'Reason / Note',
          'Approved By',
          'Remarks'
        ]}
        data={blockLogs}
        renderRow={(log) => (
          <TR key={log._id}>
            <TD className="text-gray-500 text-xs font-semibold">{log.date}</TD>
            <TD className="font-bold text-gray-800 text-xs">{log.customerId}</TD>
            <TD className="font-semibold text-xs">{log.customerName}</TD>
            <TD>
              <Badge variant={log.action === 'Block' ? 'danger' : 'success'}>
                {log.action}ed
              </Badge>
            </TD>
            <TD className="text-xs font-medium text-gray-700">{log.reason}</TD>
            <TD className="text-xs text-gray-600 font-semibold">{log.approvedBy}</TD>
            <TD className="text-xs text-gray-500">{log.remarks || 'N/A'}</TD>
          </TR>
        )}
      />

    </div>
  );
};

export default BorrowerBlock;
