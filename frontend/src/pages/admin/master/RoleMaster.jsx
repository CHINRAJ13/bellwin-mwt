import { useState, useEffect } from 'react';
import { Plus, Search, UserCog, ArrowLeft, Trash2, Edit3 } from 'lucide-react';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { TD, TR } from '../../../components/ui/Table';
import toast from 'react-hot-toast';

const RoleMaster = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: 'true'
  });

  const [deleteId, setDeleteId] = useState(null);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/roles');
      setRoles(res.data.roles || res.data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenAdd = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      isActive: 'true'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name || '',
      description: role.description || '',
      isActive: role.isActive ? 'true' : 'false'
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Role Name is required');

    setLoading(true);
    try {
      const payload = {
        ...formData,
        isActive: formData.isActive === 'true'
      };

      if (editingRole) {
        await api.put(`/roles/${editingRole._id}`, payload);
        toast.success('Role updated successfully');
      } else {
        await api.post('/roles', payload);
        toast.success('Role created successfully');
      }
      setIsFormOpen(false);
      fetchRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error(error.response?.data?.message || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await api.delete(`/roles/${deleteId}`);
      toast.success('Role deleted successfully');
      setDeleteId(null);
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error(error.response?.data?.message || 'Failed to delete role');
    } finally {
      setLoading(false);
    }
  };

  const filtered = roles.filter(role =>
    String(role.name || '').toLowerCase().includes(search.toLowerCase()) ||
    String(role.description || '').toLowerCase().includes(search.toLowerCase())
  );

  if (isFormOpen) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setIsFormOpen(false)} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-none transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{editingRole ? 'Edit User Role' : 'New User Role'}</h1>
            {editingRole?.isSystem && <p className="text-sm text-red-500 font-medium">Editing a system role</p>}
          </div>
        </div>

        <div className="">
          <form onSubmit={handleSave} className="space-y-4 form-spiritual-bg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Role Name" 
                required 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                disabled={editingRole?.isSystem}
              />
              <Select label="Status" value={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.value })}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  className="w-full border border-gray-300 rounded-none p-2 focus:ring-green-500" 
                  rows="3" 
                  placeholder="Briefly describe the purpose of this role..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-4 pt-6 border-t mt-6">
              <Button type="button" onClick={() => setIsFormOpen(false)} variant="secondary" className="px-6 py-2.5">Cancel</Button>
              <Button type="submit" variant="primary" loading={loading} className="px-8 py-2.5 shadow-md">Save Role</Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="User Role Master" 
        subtitle="Manage user roles and permissions." 
        icon={UserCog} 
        actions={<Button onClick={handleOpenAdd} icon={Plus} variant="primary">Add Role</Button>} 
      />
      
      <div className="p-4 mb-6 shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Search size={16} /></span>
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search by ID, Name or Phone Number..." 
            className="w-full pl-9 pr-4 py-2 border rounded-none text-sm focus:outline-none" 
          />
        </div>
      </div>
      
      <DataTable
        headers={['Role Name', 'Description', 'System Role', 'Status', 'Actions']}
        data={filtered}
        loading={loading}
        renderRow={(item) => (
          <TR key={item._id}>
            <TD className="font-bold text-gray-800">{item.name}</TD>
            <TD className="text-gray-600 max-w-xs truncate">{item.description || '-'}</TD>
            <TD>
              <span className={`px-2 py-1 rounded-none text-xs font-medium ${item.isSystem ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                {item.isSystem ? 'Yes' : 'No'}
              </span>
            </TD>
            <TD>
              <span className={`px-2 py-1 rounded-none text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {item.isActive ? 'Active' : 'Inactive'}
              </span>
            </TD>
            <TD>
              <div className="flex items-center gap-2">
                <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-gray-500 hover:text-green-600 bg-gray-50 rounded-none"><Edit3 size={15} /></button>
                {!item.isSystem && (
                  <button onClick={() => setDeleteId(item._id)} className="p-1.5 text-gray-500 hover:text-red-600 bg-gray-50 rounded-none"><Trash2 size={15} /></button>
                )}
              </div>
            </TD>
          </TR>
        )}
      />
      
      <ConfirmDialog 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        title="Delete Role" 
        description="Are you sure you want to delete this role? Users assigned to this role might be affected." 
        confirmText="Delete" 
        variant="danger" 
      />
    </div>
  );
};

export default RoleMaster;
