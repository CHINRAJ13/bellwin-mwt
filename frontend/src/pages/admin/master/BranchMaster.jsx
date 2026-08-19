import { useState, useEffect } from 'react';
import { Plus, Search, Building2, ArrowLeft, Trash2, Edit3 } from 'lucide-react';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { TD, TR } from '../../../components/ui/Table';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'bellwin_branch_master';

const BranchMaster = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    branchCode: '',
    branchName: '',
    branchManager: '',
    contactNumber: '',
    email: '@gmail.com',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    gstNumber: '',
    openingDate: new Date().toISOString().split('T')[0],
    status: 'Active'
  });

  const [deleteId, setDeleteId] = useState(null);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/master/branch');
      setBranches(res.data.branches || res.data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setFormData({
      branchCode: '',
      branchName: '',
      branchManager: '',
      contactNumber: '',
      email: '@gmail.com',
      address: '',
      city: '',
      state: '',
      pinCode: '',
      gstNumber: '',
      openingDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBranch(b);
    setFormData({
      ...b,
      email: b.email || '@gmail.com',
      openingDate: b.openingDate ? b.openingDate.split('T')[0] : ''
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.branchName || !formData.city) return alert('Fill required fields');
    if (formData.contactNumber && formData.contactNumber.length !== 10) return alert('Contact Number must be 10 digits');
    if (formData.pinCode && formData.pinCode.length !== 6) return alert('PIN Code must be 6 digits');
    if (formData.email && !formData.email.endsWith('@gmail.com')) return alert('Email must be a valid @gmail.com address');

    setLoading(true);
    try {
      if (editingBranch) {
        await api.put(`/master/branch/${editingBranch._id}`, formData);
        toast.success('Branch updated successfully');
      } else {
        await api.post('/master/branch', formData);
        toast.success('Branch created successfully');
      }
      setIsFormOpen(false);
      fetchBranches();
    } catch (error) {
      console.error('Error saving branch:', error);
      toast.error('Failed to save branch');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await api.delete(`/master/branch/${deleteId}`);
      toast.success('Branch deleted successfully');
      setDeleteId(null);
      fetchBranches();
    } catch (error) {
      console.error('Error deleting branch:', error);
      toast.error('Failed to delete branch');
    } finally {
      setLoading(false);
    }
  };

  const filtered = branches.filter(b =>
    String(b.branchName || '').toLowerCase().includes(search.toLowerCase()) ||
    String(b.branchCode || '').toLowerCase().includes(search.toLowerCase()) ||
    String(b.city || '').toLowerCase().includes(search.toLowerCase())
  );

  if (isFormOpen) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setIsFormOpen(false)} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-none transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div><h1 className="text-2xl font-bold text-gray-900">{editingBranch ? 'Edit Branch' : 'New Branch'}</h1></div>
        </div>

        <div className="">
          <form onSubmit={handleSave} className="space-y-4 form-spiritual-bg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Branch Code" disabled value={formData.branchCode || 'Auto-generated'} onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })} />
              <Input label="Branch Name" required value={formData.branchName} onChange={(e) => setFormData({ ...formData, branchName: e.target.value })} />
              <Input label="Branch Manager" value={formData.branchManager} onChange={(e) => setFormData({ ...formData, branchManager: e.target.value })} />
              <Input label="Contact Number" value={formData.contactNumber} onChange={(e) => {
                const val = e.target.value;
                if (val !== '' && !/^[0-9]+$/.test(val)) return;
                if (val.length > 10) return;
                setFormData({ ...formData, contactNumber: val });
              }} />
              <Input label="Email" type="email" value={formData.email} onChange={(e) => {
                const val = e.target.value;
                if (/[A-Z]/.test(val)) return;
                if (val === '') {
                  setFormData({ ...formData, email: '@gmail.com' });
                  return;
                }
                if (!val.endsWith('@gmail.com')) {
                  const atIndex = val.indexOf('@');
                  const prefix = atIndex !== -1 ? val.slice(0, atIndex) : val;
                  setFormData({ ...formData, email: `${prefix}@gmail.com` });
                  return;
                }
                setFormData({ ...formData, email: val });
              }} />
              <Input label="GST Number" value={formData.gstNumber} onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })} />
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full border border-gray-300 rounded-none p-2 focus:ring-green-500" rows="2" />
              </div>

              <Input label="City" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
              <Input label="State" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
              <Input label="PIN Code" value={formData.pinCode} onChange={(e) => {
                const val = e.target.value;
                if (val !== '' && !/^[0-9]+$/.test(val)) return;
                if (val.length > 6) return;
                setFormData({ ...formData, pinCode: val });
              }} />
              
              <Input label="Opening Date" type="date" value={formData.openingDate} onChange={(e) => setFormData({ ...formData, openingDate: e.target.value })} />
              
              <Select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </div>
            
            <div className="flex justify-end gap-4 pt-6 border-t mt-6">
              <Button type="button" onClick={() => setIsFormOpen(false)} variant="secondary" className="px-6 py-2.5">Cancel</Button>
              <Button type="submit" variant="primary" loading={loading} className="px-8 py-2.5 shadow-md">Save Branch</Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader title="Branch Master" subtitle="Manage organizational branches." icon={Building2} actions={<Button onClick={handleOpenAdd} icon={Plus} variant="primary">Add Branch</Button>} />
      <div className="p-4 mb-6 shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Search size={16} /></span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID, Name or Phone Number..." className="w-full pl-9 pr-4 py-2 border rounded-none text-sm focus:outline-none" />
        </div>
      </div>
      <DataTable
        headers={['Code', 'Branch Name', 'City', 'Manager', 'Status', 'Actions']}
        data={filtered}
        loading={loading}
        renderRow={(item) => (
          <TR key={item._id}>
            <TD className="font-bold text-gray-800">{item.branchCode}</TD>
            <TD className="font-semibold text-gray-700">{item.branchName}</TD>
            <TD>{item.city}</TD>
            <TD>{item.branchManager || '-'}</TD>
            <TD><span className={`px-2 py-1 rounded-none text-xs font-medium ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.status}</span></TD>
            <TD>
              <div className="flex items-center gap-2">
                <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-gray-500 hover:text-green-600 bg-gray-50 rounded-none"><Edit3 size={15} /></button>
                <button onClick={() => setDeleteId(item._id)} className="p-1.5 text-gray-500 hover:text-red-600 bg-gray-50 rounded-none"><Trash2 size={15} /></button>
              </div>
            </TD>
          </TR>
        )}
      />
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Branch" description="Are you sure?" confirmText="Delete" variant="danger" />
    </div>
  );
};
export default BranchMaster;
