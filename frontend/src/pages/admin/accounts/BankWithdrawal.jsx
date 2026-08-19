import { useState, useEffect } from 'react';
import { Plus, Search, Banknote, ArrowLeft, Trash2, Edit3 } from 'lucide-react';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { TD, TR } from '../../../components/ui/Table';

const STORAGE_KEY = 'bellwin_bank_withdrawals';

const BankWithdrawal = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWithdrawal, setEditingWithdrawal] = useState(null);
  const [formData, setFormData] = useState({
    withdrawalNo: '',
    withdrawalDate: new Date().toISOString().split('T')[0],
    bankName: '',
    accountNumber: '',
    amount: '',
    chequeNumber: '',
    remarks: ''
  });

  const [deleteId, setDeleteId] = useState(null);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounts/bank-withdrawal');
      setWithdrawals(res.data.withdrawals || res.data || []);
    } catch (err) {
      console.error('Failed to fetch withdrawals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleOpenAdd = () => {
    setEditingWithdrawal(null);
    setFormData({
      withdrawalNo: `WDL-${String(withdrawals.length + 1).padStart(4, '0')}`,
      withdrawalDate: new Date().toISOString().split('T')[0],
      bankName: '',
      accountNumber: '',
      amount: '',
      chequeNumber: '',
      remarks: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (w) => {
    setEditingWithdrawal(w);
    setFormData({
      withdrawalNo: w.withdrawalNo || '',
      withdrawalDate: w.withdrawalDate ? w.withdrawalDate.split('T')[0] : '',
      bankName: w.bankName || '',
      accountNumber: w.accountNumber || '',
      amount: w.amount || '',
      chequeNumber: w.chequeNumber || '',
      remarks: w.remarks || ''
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.bankName || !formData.accountNumber || !formData.amount) return alert('Fill required fields');

    setLoading(true);
    try {
      if (editingWithdrawal) {
        await api.put(`/accounts/bank-withdrawal/${editingWithdrawal._id}`, formData);
      } else {
        await api.post('/accounts/bank-withdrawal', formData);
      }
      setIsFormOpen(false);
      fetchWithdrawals();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await api.delete(`/accounts/bank-withdrawal/${deleteId}`);
      setDeleteId(null);
      fetchWithdrawals();
    } finally {
      setLoading(false);
    }
  };

  const filtered = withdrawals.filter(v =>
    String(v.withdrawalNo || '').toLowerCase().includes(search.toLowerCase()) ||
    String(v.bankName || '').toLowerCase().includes(search.toLowerCase()) ||
    String(v.accountNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  if (isFormOpen) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setIsFormOpen(false)} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-none transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div><h1 className="text-2xl font-bold text-gray-900">{editingWithdrawal ? 'Edit Bank Withdrawal' : 'New Bank Withdrawal'}</h1></div>
        </div>

        <div className="">
          <form onSubmit={handleSave} className="space-y-4 form-spiritual-bg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Withdrawal No" required disabled value={formData.withdrawalNo} onChange={(e) => setFormData({ ...formData, withdrawalNo: e.target.value })} />
              <Input label="Withdrawal Date" type="date" required value={formData.withdrawalDate} onChange={(e) => setFormData({ ...formData, withdrawalDate: e.target.value })} />
              <Input label="Bank Name" required value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} placeholder="e.g. HDFC Bank" />
              <Input label="Account Number" required value={formData.accountNumber} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} />
              <Input label="Withdrawal Amount (₹)" type="number" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
              <Input label="Cheque Number" value={formData.chequeNumber} onChange={(e) => setFormData({ ...formData, chequeNumber: e.target.value })} />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} className="w-full border border-gray-300 rounded-none p-2 focus:ring-green-500" rows="3" />
            </div>
            <div className="flex justify-end gap-4 pt-6 border-t mt-6">
              <Button type="button" onClick={() => setIsFormOpen(false)} variant="secondary" className="px-6 py-2.5">Cancel</Button>
              <Button type="submit" variant="primary" loading={loading} className="px-8 py-2.5 shadow-md">Save Withdrawal</Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader title="Bank Withdrawal Entry" subtitle="Record cash withdrawn from bank accounts." icon={Banknote} actions={<Button onClick={handleOpenAdd} icon={Plus} variant="primary">Add Withdrawal</Button>} />
      <div className="p-4 mb-6 shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Search size={16} /></span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID, Name or Phone Number..." className="w-full pl-9 pr-4 py-2 border rounded-none text-sm focus:outline-none" />
        </div>
      </div>
      <DataTable
        headers={['Withdrawal No', 'Date', 'Bank Name', 'Account No', 'Amount', 'Actions']}
        data={filtered}
        loading={loading}
        renderRow={(item) => (
          <TR key={item._id}>
            <TD className="font-bold text-gray-800">{item.withdrawalNo}</TD>
            <TD>{item.withdrawalDate}</TD>
            <TD className="font-semibold">{item.bankName}</TD>
            <TD className="text-gray-600">{item.accountNumber}</TD>
            <TD className="font-bold text-red-600">₹{item.amount}</TD>
            <TD>
              <div className="flex items-center gap-2">
                <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-gray-500 hover:text-green-600 bg-gray-50 rounded-none"><Edit3 size={15} /></button>
                <button onClick={() => setDeleteId(item._id)} className="p-1.5 text-gray-500 hover:text-red-600 bg-gray-50 rounded-none"><Trash2 size={15} /></button>
              </div>
            </TD>
          </TR>
        )}
      />
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Withdrawal" description="Are you sure?" confirmText="Delete" variant="danger" />
    </div>
  );
};
export default BankWithdrawal;
