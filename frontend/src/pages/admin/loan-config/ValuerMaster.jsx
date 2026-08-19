import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Search, UserCheck, ArrowLeft } from 'lucide-react';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import DataTable from '../../../components/ui/DataTable';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { TD, TR } from '../../../components/ui/Table';

const STORAGE_KEY = 'bellwin_valuers';

const ValuerMaster = () => {
  const [valuers, setValuers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingValuer, setEditingValuer] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    isValuer: false,
    isAppraiser: false,
    isAuthoriser: false,
    isAuditor: false,
    status: 'Active'
  });

  // Delete dialog state
  const [deleteId, setDeleteId] = useState(null);

  // Fetch valuers
  const fetchValuers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/loan-config/valuer');
      if (res.data && res.data.valuers) {
        setValuers(res.data.valuers);
      } else if (Array.isArray(res.data)) {
        setValuers(res.data);
      } else {
        throw new Error('API response empty');
      }
    } catch (err) {
      console.error('Failed to fetch valuers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValuers();
  }, []);

  const handleOpenAdd = () => {
    setEditingValuer(null);
    setFormData({
      code: `VAL${String(valuers.length + 1).padStart(4, '0')}`,
      name: '',
      isValuer: false,
      isAppraiser: false,
      isAuthoriser: false,
      isAuditor: false,
      status: 'Active'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (valuer) => {
    setEditingValuer(valuer);
    setFormData({
      code: valuer.code || '',
      name: valuer.name || '',
      isValuer: valuer.isValuer || false,
      isAppraiser: valuer.isAppraiser || false,
      isAuthoriser: valuer.isAuthoriser || false,
      isAuditor: valuer.isAuditor || false,
      status: valuer.status || 'Active'
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return alert('Name and Code are required');

    setLoading(true);
    try {
      if (editingValuer) {
        await api.put(`/loan-config/valuer/${editingValuer._id}`, formData);
      } else {
        await api.post('/loan-config/valuer', formData);
      }
      setIsFormOpen(false);
      await fetchValuers();
    } catch (err) {
      console.error(err);
      alert('Failed to save valuer');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await api.delete(`/loan-config/valuer/${deleteId}`);
      setDeleteId(null);
      await fetchValuers();
    } catch (err) {
      console.error(err);
      alert('Failed to delete valuer');
    } finally {
      setLoading(false);
    }
  };

  const filteredValuers = valuers.filter(v =>
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.code?.toLowerCase().includes(search.toLowerCase())
  );

  if (isFormOpen) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setIsFormOpen(false)}
            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-none transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {editingValuer ? 'Edit Valuer Details' : 'Add Licensed Valuer'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {editingValuer ? 'Update the details of the licensed gold valuer.' : 'Register a new licensed gold valuer into the system.'}
            </p>
          </div>
        </div>

        <div className="">
          <form onSubmit={handleSave} className="space-y-6 form-spiritual-bg">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Valuer Code"
                required
                disabled
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. VAL-001"
                className="bg-gray-50"
              />
              <Input
                label="Valuer Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                placeholder="e.g. A. R. SHANMUGAM"
                className="bg-gray-50"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isValuer} onChange={(e) => setFormData({ ...formData, isValuer: e.target.checked })} className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                <span className="text-sm font-medium text-gray-700">Is Valuer</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isAppraiser} onChange={(e) => setFormData({ ...formData, isAppraiser: e.target.checked })} className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                <span className="text-sm font-medium text-gray-700">Is Appraiser</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isAuthoriser} onChange={(e) => setFormData({ ...formData, isAuthoriser: e.target.checked })} className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                <span className="text-sm font-medium text-gray-700">Is Authoriser</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isAuditor} onChange={(e) => setFormData({ ...formData, isAuditor: e.target.checked })} className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                <span className="text-sm font-medium text-gray-700">Is Auditor</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                containerClassName="bg-gray-50"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
              <Button 
                type="button" 
                onClick={() => setIsFormOpen(false)} 
                variant="secondary"
                className="px-6 py-2.5"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                loading={loading}
                className="px-8 py-2.5 shadow-md hover:shadow-lg transition-all"
              >
                Save Valuer
              </Button>
            </div>
            
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader
        title="Valuer Master"
        subtitle="Manage licensed gold assayers, qualifications, experience, and branch allocations."
        icon={UserCheck}
        actions={
          <Button onClick={handleOpenAdd} icon={Plus} variant="primary">
            Add Valuer
          </Button>
        }
      />

      <div className="p-4 mb-6 shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, Name or Phone Number..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-none text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-gray-50"
          />
        </div>
      </div>

      <DataTable
        headers={[
          'Code',
          'Name',
          'Roles',
          'Status',
          'Actions'
        ]}
        data={filteredValuers}
        loading={loading}
        renderRow={(valuer) => (
          <TR key={valuer._id}>
            <TD className="font-bold text-gray-800">{valuer.code}</TD>
            <TD className="font-semibold">{valuer.name}</TD>
            <TD>
              <div className="flex flex-wrap gap-1">
                {valuer.isValuer && <Badge variant="primary">Valuer</Badge>}
                {valuer.isAppraiser && <Badge variant="secondary">Appraiser</Badge>}
                {valuer.isAuthoriser && <Badge variant="warning">Authoriser</Badge>}
                {valuer.isAuditor && <Badge variant="danger">Auditor</Badge>}
                {!valuer.isValuer && !valuer.isAppraiser && !valuer.isAuthoriser && !valuer.isAuditor && <span className="text-xs text-gray-400">No roles</span>}
              </div>
            </TD>
            <TD>
              <Badge variant={valuer.status === 'Active' ? 'success' : 'danger'}>
                {valuer.status}
              </Badge>
            </TD>
            <TD>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(valuer)}
                  className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-none cursor-pointer transition-colors"
                  title="Edit Valuer"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={() => setDeleteId(valuer._id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-none cursor-pointer transition-colors"
                  title="Delete Valuer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </TD>
          </TR>
        )}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Valuer Record"
        description="Are you sure you want to delete this valuer record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default ValuerMaster;
