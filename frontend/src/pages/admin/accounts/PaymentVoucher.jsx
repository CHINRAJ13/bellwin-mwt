import { useState, useEffect } from 'react';
import { Plus, Search, CreditCard, ArrowLeft, Trash2, Edit3 } from 'lucide-react';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { TD, TR } from '../../../components/ui/Table';

const STORAGE_KEY = 'bellwin_payment_vouchers';

const PaymentVoucher = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [formData, setFormData] = useState({
    voucherNo: '',
    voucherDate: new Date().toISOString().split('T')[0],
    paidTo: '',
    ledger: '',
    paymentMode: 'Cash',
    amount: '',
    referenceNo: '',
    remarks: '',
    approvedBy: ''
  });

  const [deleteId, setDeleteId] = useState(null);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounts/payment-voucher');
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
      voucherNo: `PV${String(vouchers.length + 1).padStart(6, '0')}`,
      voucherDate: new Date().toISOString().split('T')[0],
      paidTo: '',
      ledger: '',
      paymentMode: 'Cash',
      amount: '',
      referenceNo: '',
      remarks: '',
      approvedBy: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVoucher(v);
    setFormData({
      voucherNo: v.voucherNo || '',
      voucherDate: v.voucherDate ? v.voucherDate.split('T')[0] : '',
      paidTo: v.paidTo || '',
      ledger: v.ledger || '',
      paymentMode: v.paymentMode || 'Cash',
      amount: v.amount || '',
      referenceNo: v.referenceNo || '',
      remarks: v.remarks || '',
      approvedBy: v.approvedBy || ''
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.paidTo || !formData.amount || !formData.ledger) return alert('Fill required fields');

    setLoading(true);
    try {
      if (editingVoucher) {
        await api.put(`/accounts/payment-voucher/${editingVoucher._id}`, formData);
      } else {
        await api.post('/accounts/payment-voucher', formData);
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
      await api.delete(`/accounts/payment-voucher/${deleteId}`);
      setDeleteId(null);
      fetchVouchers();
    } finally {
      setLoading(false);
    }
  };

  const filtered = vouchers.filter(v =>
    String(v.voucherNo || '').toLowerCase().includes(search.toLowerCase()) ||
    String(v.paidTo || '').toLowerCase().includes(search.toLowerCase()) ||
    String(v.ledger || '').toLowerCase().includes(search.toLowerCase())
  );

  if (isFormOpen) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setIsFormOpen(false)} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-none transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div><h1 className="text-2xl font-bold text-gray-900">{editingVoucher ? 'Edit Payment Voucher' : 'New Payment Voucher'}</h1></div>
        </div>

        <div className="">
          <form onSubmit={handleSave} className="space-y-4 form-spiritual-bg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Voucher No" required disabled value={formData.voucherNo} onChange={(e) => setFormData({ ...formData, voucherNo: e.target.value })} />
              <Input label="Voucher Date" type="date" required value={formData.voucherDate} onChange={(e) => setFormData({ ...formData, voucherDate: e.target.value })} />
              <Input label="Paid To" required value={formData.paidTo} onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })} />
              <Select label="Ledger Account" required value={formData.ledger} onChange={(e) => setFormData({ ...formData, ledger: e.target.value })}>
                <option value="">Select Ledger</option>
                <option value="Salary A/C">Salary A/C</option>
                <option value="Electricity A/C">Electricity A/C</option>
                <option value="Rent A/C">Rent A/C</option>
              </Select>
              <Select label="Payment Mode" required value={formData.paymentMode} onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Cheque">Cheque</option>
              </Select>
              <Input label="Amount (₹)" type="number" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
              <Input label="Reference No (Cheque/UTR)" value={formData.referenceNo} onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })} />
              <Input label="Approved By" value={formData.approvedBy} onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })} />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} className="w-full border border-gray-300 rounded-none p-2 focus:ring-green-500" rows="3" />
            </div>
            <div className="flex justify-end gap-4 pt-6 border-t mt-6">
              <Button type="button" onClick={() => setIsFormOpen(false)} variant="secondary" className="px-6 py-2.5">Cancel</Button>
              <Button type="submit" variant="primary" loading={loading} className="px-8 py-2.5 shadow-md">Save Voucher</Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader title="Payment Voucher Entry" subtitle="Record payments made to vendors, employees or others." icon={CreditCard} actions={<Button onClick={handleOpenAdd} icon={Plus} variant="primary">Add Payment</Button>} />
      <div className="p-4 mb-6 shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Search size={16} /></span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID, Name or Phone Number..." className="w-full pl-9 pr-4 py-2 border rounded-none text-sm focus:outline-none" />
        </div>
      </div>
      <DataTable
        headers={['Voucher No', 'Date', 'Paid To', 'Ledger', 'Mode', 'Amount', 'Actions']}
        data={filtered}
        loading={loading}
        renderRow={(item) => (
          <TR key={item._id}>
            <TD className="font-bold text-gray-800">{item.voucherNo}</TD>
            <TD>{item.voucherDate}</TD>
            <TD className="font-semibold">{item.paidTo}</TD>
            <TD>{item.ledger}</TD>
            <TD>{item.paymentMode}</TD>
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
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Voucher" description="Are you sure?" confirmText="Delete" variant="danger" />
    </div>
  );
};
export default PaymentVoucher;
