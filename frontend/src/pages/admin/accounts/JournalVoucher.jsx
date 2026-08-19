import { useState, useEffect } from 'react';
import { Plus, Search, FileEdit, ArrowLeft, Trash2, Edit3 } from 'lucide-react';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { TD, TR } from '../../../components/ui/Table';

const STORAGE_KEY = 'bellwin_journal_vouchers';

const JournalVoucher = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [formData, setFormData] = useState({
    journalNo: '',
    date: new Date().toISOString().split('T')[0],
    debitLedger: '',
    creditLedger: '',
    amount: '',
    narration: '',
    enteredBy: ''
  });

  const [deleteId, setDeleteId] = useState(null);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounts/journal-voucher');
      setVouchers(res.data.vouchers || res.data || []);
    } catch (err) {
      console.error('Failed to fetch vouchers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleOpenAdd = () => {
    setEditingVoucher(null);
    setFormData({
      journalNo: `JV${String(vouchers.length + 1).padStart(6, '0')}`,
      date: new Date().toISOString().split('T')[0],
      debitLedger: '',
      creditLedger: '',
      amount: '',
      narration: '',
      enteredBy: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVoucher(v);
    setFormData({
      journalNo: v.journalNo || '',
      date: v.date ? v.date.split('T')[0] : '',
      debitLedger: v.debitLedger || '',
      creditLedger: v.creditLedger || '',
      amount: v.amount || '',
      narration: v.narration || '',
      enteredBy: v.enteredBy || ''
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.debitLedger || !formData.creditLedger || !formData.amount) return alert('Fill required fields');

    setLoading(true);
    try {
      if (editingVoucher) {
        await api.put(`/accounts/journal-voucher/${editingVoucher._id}`, formData);
      } else {
        await api.post('/accounts/journal-voucher', formData);
      }
      setIsFormOpen(false);
      fetchVouchers();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await api.delete(`/accounts/journal-voucher/${deleteId}`);
      setDeleteId(null);
      fetchVouchers();
    } finally {
      setLoading(false);
    }
  };

  const filtered = vouchers.filter(v =>
    String(v.journalNo || '').toLowerCase().includes(search.toLowerCase()) ||
    String(v.debitLedger || '').toLowerCase().includes(search.toLowerCase()) ||
    String(v.creditLedger || '').toLowerCase().includes(search.toLowerCase())
  );

  if (isFormOpen) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setIsFormOpen(false)} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-none transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div><h1 className="text-2xl font-bold text-gray-900">{editingVoucher ? 'Edit Journal Voucher' : 'New Journal Voucher'}</h1></div>
        </div>

        <div className="">
          <form onSubmit={handleSave} className="space-y-4 form-spiritual-bg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Journal No" required disabled value={formData.journalNo} onChange={(e) => setFormData({ ...formData, journalNo: e.target.value })} />
              <Input label="Date" type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              <Select label="Debit Ledger (Dr)" required value={formData.debitLedger} onChange={(e) => setFormData({ ...formData, debitLedger: e.target.value })}>
                <option value="">Select Ledger</option>
                <option value="Salary A/C">Salary A/C</option>
                <option value="Cash A/C">Cash A/C</option>
              </Select>
              <Select label="Credit Ledger (Cr)" required value={formData.creditLedger} onChange={(e) => setFormData({ ...formData, creditLedger: e.target.value })}>
                <option value="">Select Ledger</option>
                <option value="Salary A/C">Salary A/C</option>
                <option value="Cash A/C">Cash A/C</option>
              </Select>
              <Input label="Amount (₹)" type="number" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
              <Input label="Entered By" value={formData.enteredBy} onChange={(e) => setFormData({ ...formData, enteredBy: e.target.value })} />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Narration</label>
              <textarea value={formData.narration} onChange={(e) => setFormData({ ...formData, narration: e.target.value })} className="w-full border border-gray-300 rounded-none p-2 focus:ring-green-500" rows="3" />
            </div>
            <div className="flex justify-end gap-4 pt-6 border-t mt-6">
              <Button type="button" onClick={() => setIsFormOpen(false)} variant="secondary" className="px-6 py-2.5">Cancel</Button>
              <Button type="submit" variant="primary" loading={loading} className="px-8 py-2.5 shadow-md">Save Journal</Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader title="Journal Voucher Entry" subtitle="Record internal accounting adjustments." icon={FileEdit} actions={<Button onClick={handleOpenAdd} icon={Plus} variant="primary">Add Journal</Button>} />
      <div className="p-4 mb-6 shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Search size={16} /></span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID, Name or Phone Number..." className="w-full pl-9 pr-4 py-2 border rounded-none text-sm focus:outline-none" />
        </div>
      </div>
      <DataTable
        headers={['Journal No', 'Date', 'Debit Ledger', 'Credit Ledger', 'Amount', 'Actions']}
        data={filtered}
        loading={loading}
        renderRow={(item) => (
          <TR key={item._id}>
            <TD className="font-bold text-gray-800">{item.journalNo}</TD>
            <TD>{item.date}</TD>
            <TD className="font-semibold text-blue-600">{item.debitLedger}</TD>
            <TD className="font-semibold text-orange-600">{item.creditLedger}</TD>
            <TD className="font-bold">₹{item.amount}</TD>
            <TD>
              <div className="flex items-center gap-2">
                <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-gray-500 hover:text-green-600 bg-gray-50 rounded-none"><Edit3 size={15} /></button>
                <button onClick={() => setDeleteId(item._id)} className="p-1.5 text-gray-500 hover:text-red-600 bg-gray-50 rounded-none"><Trash2 size={15} /></button>
              </div>
            </TD>
          </TR>
        )}
      />
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Voucher" description="Are you sure?" confirmText="Delete" variant="danger" />
    </div>
  );
};
export default JournalVoucher;
