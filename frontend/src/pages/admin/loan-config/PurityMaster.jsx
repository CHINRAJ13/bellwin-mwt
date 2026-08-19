import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Search, Diamond, ArrowLeft } from 'lucide-react';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import DataTable from '../../../components/ui/DataTable';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { TD, TR } from '../../../components/ui/Table';

const STORAGE_KEY = 'bellwin_purity';

const PurityMaster = () => {
  const [purities, setPurities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPurity, setEditingPurity] = useState(null);
  const [formData, setFormData] = useState({
    purityCode: '',
    purityName: '',
    maxLoanPerGram: '',
    status: 'Active'
  });

  // Delete dialog state
  const [deleteId, setDeleteId] = useState(null);

  // Fetch purities
  const fetchPurities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/loan-config/purity');
      setPurities(res.data.purities || res.data || []);
    } catch (err) {
      console.error('Failed to fetch purities', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurities();
  }, []);

  const handleOpenAdd = () => {
    setEditingPurity(null);
    setFormData({
      purityCode: `PUR${String(purities.length + 1).padStart(4, '0')}`,
      purityName: '',
      maxLoanPerGram: '',
      status: 'Active'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (purity) => {
    setEditingPurity(purity);
    setFormData({
      purityCode: purity.purityCode || '',
      purityName: purity.purityName || '',
      maxLoanPerGram: purity.maxLoanPerGram || '',
      status: purity.status || 'Active'
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.purityName || !formData.purityCode || !formData.maxLoanPerGram) return alert('Code, Name and Max Loan are required');

    setLoading(true);
    try {
      if (editingPurity) {
        await api.put(`/loan-config/purity/${editingPurity._id}`, formData);
      } else {
        await api.post('/loan-config/purity', formData);
      }
      setIsFormOpen(false);
      fetchPurities();
    } catch (err) {
      console.error(err);
      alert('Failed to save purity');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await api.delete(`/loan-config/purity/${deleteId}`);
      setDeleteId(null);
      fetchPurities();
    } catch (err) {
      console.error(err);
      alert('Failed to delete purity');
    } finally {
      setLoading(false);
    }
  };

  const filteredPurities = purities.filter(p =>
    p.purityName?.toLowerCase().includes(search.toLowerCase()) ||
    p.purityCode?.toLowerCase().includes(search.toLowerCase())
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
              {editingPurity ? 'Edit Purity Master' : 'Add New Purity'}
            </h1>
          </div>
        </div>

        <div className="">
          <form onSubmit={handleSave} className="space-y-4 form-spiritual-bg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Purity Code"
              required
              disabled
              value={formData.purityCode}
              onChange={(e) => setFormData({ ...formData, purityCode: e.target.value.toUpperCase() })}
            />
            <Input
              label="Purity Name"
              required
              value={formData.purityName}
              onChange={(e) => setFormData({ ...formData, purityName: e.target.value.toUpperCase() })}
              placeholder="e.g. 22K GOLD"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Max Loan (%)/gm"
              required
              type="number"
              step="0.1"
              value={formData.maxLoanPerGram}
              onChange={(e) => setFormData({ ...formData, maxLoanPerGram: parseFloat(e.target.value) || '' })}
              placeholder="e.g. 75"
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </div>
          
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100 mt-6">
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
                Save Purity
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
        title="Purity Master"
        subtitle="Configure gold and silver karat classes, standard metal purity ratios, and hallmark configurations."
        icon={Diamond}
        actions={
          <Button onClick={handleOpenAdd} icon={Plus} variant="primary">
            Add Purity
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
          'Purity Code',
          'Purity Name',
          'Max Loan (%)/gm',
          'Status',
          'Actions'
        ]}
        data={filteredPurities}
        loading={loading}
        renderRow={(purity) => (
          <TR key={purity._id}>
            <TD className="font-bold text-gray-800">{purity.purityCode}</TD>
            <TD className="font-semibold">{purity.purityName}</TD>
            <TD className="text-green-700 font-semibold">{purity.maxLoanPerGram}</TD>
            <TD>
              <Badge variant={purity.status === 'Active' ? 'success' : 'danger'}>
                {purity.status}
              </Badge>
            </TD>
            <TD>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(purity)}
                  className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-none cursor-pointer transition-colors"
                  title="Edit Purity"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={() => setDeleteId(purity._id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-none cursor-pointer transition-colors"
                  title="Delete Purity"
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
        title="Delete Purity Record"
        description="Are you sure you want to delete this purity record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default PurityMaster;
