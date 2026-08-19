import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Search, TrendingUp, ArrowLeft } from 'lucide-react';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import DataTable from '../../../components/ui/DataTable';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { TD, TR } from '../../../components/ui/Table';

const STORAGE_KEY = 'bellwin_gold_rates';

const GoldRateMaster = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const currentUsername = user.username || 'Admin';

  const [formData, setFormData] = useState({
    itemType: 'Gold',
    purity: '22K',
    rate: '',
    status: 'Active'
  });

  // Delete dialog state
  const [deleteId, setDeleteId] = useState(null);

  // Fetch rates
  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/loan-config/gold-rate');
      setRates(res.data.rates || res.data || []);
    } catch (err) {
      console.error('Failed to fetch rates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleOpenAdd = () => {
    setEditingRate(null);
    setFormData({
      itemType: 'Gold',
      purity: '22K',
      rate: '',
      status: 'Active'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (rateObj) => {
    setEditingRate(rateObj);
    setFormData({
      itemType: rateObj.itemType || 'Gold',
      purity: rateObj.purity || '22K',
      rate: rateObj.rate || '',
      status: rateObj.status || 'Active'
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.rate) return alert('Rate is required');

    setLoading(true);
    try {
      if (editingRate) {
        await api.put(`/loan-config/gold-rate/${editingRate._id}`, formData);
      } else {
        await api.post('/loan-config/gold-rate', formData);
      }
      setIsFormOpen(false);
      fetchRates();
    } catch (err) {
      console.error(err);
      alert('Failed to save rate');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await api.delete(`/loan-config/gold-rate/${deleteId}`);
      setDeleteId(null);
      fetchRates();
    } catch (err) {
      console.error(err);
      alert('Failed to delete rate');
    } finally {
      setLoading(false);
    }
  };

  const filteredRates = rates.filter(r =>
    r.itemType?.toLowerCase().includes(search.toLowerCase()) ||
    r.purity?.toLowerCase().includes(search.toLowerCase())
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
              {editingRate ? 'Edit Gold Rate Master' : 'Add New Daily Gold Rate'}
            </h1>
          </div>
        </div>

        <div className="">
          <form onSubmit={handleSave} className="space-y-4 form-spiritual-bg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Item Type"
              value={formData.itemType}
              onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
            >
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Diamond">Diamond</option>
              <option value="Platinum">Platinum</option>
            </Select>
            <Select
              label="Purity"
              value={formData.purity}
              onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
            >
              <option value="24K">24K</option>
              <option value="22K">22K</option>
              <option value="18K">18K</option>
              <option value="14K">14K</option>
              <option value="9K">9K</option>
              <option value="Silver 925">Silver 925</option>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Rate (₹)"
              type="number"
              required
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: parseInt(e.target.value) || '' })}
              placeholder="e.g. 6450"
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
                Save Rate
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
        title="Gold Rate Master"
        subtitle="Manage daily board rates per gram for active gold types used to compute maximum loan values."
        icon={TrendingUp}
        actions={
          <Button onClick={handleOpenAdd} icon={Plus} variant="primary">
            Update Gold Rate
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
          'Item Type',
          'Purity',
          'Rate (₹)',
          'Status',
          'Actions'
        ]}
        data={filteredRates}
        loading={loading}
        renderRow={(rateObj) => (
          <TR key={rateObj._id}>
            <TD className="font-semibold text-gray-800">{rateObj.itemType}</TD>
            <TD className="font-bold">{rateObj.purity}</TD>
            <TD className="font-bold text-green-700">₹{rateObj.rate?.toLocaleString('en-IN')}</TD>
            <TD>
              <Badge variant={rateObj.status === 'Active' ? 'success' : 'danger'}>
                {rateObj.status}
              </Badge>
            </TD>
            <TD>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(rate)}
                  className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-none cursor-pointer transition-colors"
                  title="Edit Rate"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={() => setDeleteId(rate._id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-none cursor-pointer transition-colors"
                  title="Delete Rate"
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
        title="Delete Gold Rate"
        description="Are you sure you want to delete this gold rate record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default GoldRateMaster;
