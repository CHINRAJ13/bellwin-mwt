import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Search, Users, ArrowLeft } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import DataTable from '../../../components/ui/DataTable';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { TD, TR } from '../../../components/ui/Table';

const STORAGE_KEY = 'bellwin_accounts_group';

const AccountsGroupMaster = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    groupCode: '',
    groupName: '',
    parentGroup: '',
    nature: 'Asset',
    description: '',
    status: 'Active'
  });

  const [deleteId, setDeleteId] = useState(null);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounts/group');
      setGroups(res.data.groups || res.data || []);
    } catch (err) {
      console.error('Failed to fetch groups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleOpenAdd = () => {
    setEditingGroup(null);
    setFormData({
      groupCode: `AG${String(groups.length + 1).padStart(4, '0')}`,
      groupName: '',
      parentGroup: '',
      nature: 'Asset',
      description: '',
      status: 'Active'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      groupCode: group.groupCode || '',
      groupName: group.groupName || '',
      parentGroup: group.parentGroup || '',
      nature: group.nature || 'Asset',
      description: group.description || '',
      status: group.status || 'Active'
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.groupName) return alert('Group Name is required');

    setLoading(true);
    try {
      if (editingGroup) {
        await api.put(`/accounts/group/${editingGroup._id}`, formData);
      } else {
        await api.post('/accounts/group', formData);
      }
      setIsFormOpen(false);
      fetchGroups();
      toast.success(editingGroup ? 'Group updated successfully' : 'Group saved successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save Group');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await api.delete(`/accounts/group/${deleteId}`);
      setDeleteId(null);
      fetchGroups();
      toast.success('Group deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete Group');
    } finally {
      setLoading(false);
    }
  };

  const filtered = groups.filter(v =>
    String(v.groupName || '').toLowerCase().includes(search.toLowerCase()) ||
    String(v.groupCode || '').toLowerCase().includes(search.toLowerCase())
  );

  if (isFormOpen) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setIsFormOpen(false)} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-none transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div><h1 className="text-2xl font-bold text-gray-900">{editingGroup ? 'Edit Group Master' : 'Add New Group'}</h1></div>
        </div>

        <div className="">
          <form onSubmit={handleSave} className="space-y-4 form-spiritual-bg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Group Code" required disabled value={formData.groupCode} onChange={(e) => setFormData({ ...formData, groupCode: e.target.value.toUpperCase() })} />
              <Input label="Group Name" required value={formData.groupName} onChange={(e) => setFormData({ ...formData, groupName: e.target.value })} placeholder="e.g. Current Liabilities" />
              <Select label="Parent Group" value={formData.parentGroup} onChange={(e) => setFormData({ ...formData, parentGroup: e.target.value })}>
                <option value="">Primary</option>
                <option value="Current Assets">Current Assets</option>
                <option value="Current Liabilities">Current Liabilities</option>
                <option value="Direct Incomes">Direct Incomes</option>
                <option value="Direct Expenses">Direct Expenses</option>
              </Select>
              <Select label="Nature" value={formData.nature} onChange={(e) => setFormData({ ...formData, nature: e.target.value })}>
                <option value="Asset">Asset</option>
                <option value="Liability">Liability</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </Select>
              <Select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border border-gray-300 rounded-none p-2 focus:ring-green-500 focus:border-green-500" rows="3" />
            </div>
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 mt-6">
              <Button type="button" onClick={() => setIsFormOpen(false)} variant="secondary" className="px-6 py-2.5">Cancel</Button>
              <Button type="submit" variant="primary" loading={loading} className="px-8 py-2.5 shadow-md">Save Group</Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader title="Accounts Group Master" subtitle="Create and manage ledger groups for reporting." icon={Users} actions={<Button onClick={handleOpenAdd} icon={Plus} variant="primary">Add Group</Button>} />
      <div className="p-4 mb-6 shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Search size={16} /></span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID, Name or Phone Number..." className="w-full pl-9 pr-4 py-2 border rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-green-500" />
        </div>
      </div>
      <DataTable
        headers={['Code', 'Name', 'Parent Group', 'Nature', 'Status', 'Actions']}
        data={filtered}
        loading={loading}
        renderRow={(item) => (
          <TR key={item._id}>
            <TD className="font-bold text-gray-800">{item.groupCode}</TD>
            <TD className="font-semibold">{item.groupName}</TD>
            <TD>{item.parentGroup || 'Primary'}</TD>
            <TD>{item.nature}</TD>
            <TD><Badge variant={item.status === 'Active' ? 'success' : 'danger'}>{item.status}</Badge></TD>
            <TD>
              <div className="flex items-center gap-2">
                <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-gray-500 hover:text-green-600 bg-gray-50 rounded-none"><Edit3 size={15} /></button>
                <button onClick={() => setDeleteId(item._id)} className="p-1.5 text-gray-500 hover:text-red-600 bg-gray-50 rounded-none"><Trash2 size={15} /></button>
              </div>
            </TD>
          </TR>
        )}
      />
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Group" description="Are you sure?" confirmText="Delete" variant="danger" />
    </div>
  );
};
export default AccountsGroupMaster;
