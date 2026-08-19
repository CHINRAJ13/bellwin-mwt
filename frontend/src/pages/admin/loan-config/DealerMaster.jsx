import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Search, Store, ArrowLeft } from 'lucide-react';
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

const STORAGE_KEY = 'bellwin_dealers';

const DealerMaster = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState(null);
  const [formData, setFormData] = useState({
    dealerCode: '',
    dealerName: '',
    phone: '',
    showroom: '',
    state: '',
    pincode: '',
    address: '',
    status: 'Active'
  });

  // Delete dialog state
  const [deleteId, setDeleteId] = useState(null);

  // Fetch dealers
  const fetchDealers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/loan-config/dealer');
      setDealers(res.data.dealers || res.data || []);
    } catch (err) {
      console.error('Failed to fetch dealers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  const handleOpenAdd = () => {
    setEditingDealer(null);
    let nextId = 'DLR0001';
    if (dealers.length > 0) {
      const maxNum = Math.max(...dealers.map(d => {
        const match = d.dealerCode?.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      }));
      nextId = `DLR${String(maxNum + 1).padStart(4, '0')}`;
    }

    setFormData({
      dealerCode: nextId,
      dealerName: '',
      phone: '',
      showroom: '',
      state: '',
      pincode: '',
      address: '',
      status: 'Active'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (dealer) => {
    setEditingDealer(dealer);
    setFormData({
      dealerCode: dealer.dealerCode || '',
      dealerName: dealer.dealerName || '',
      phone: dealer.phone || '',
      showroom: dealer.showroom || '',
      state: dealer.state || '',
      pincode: dealer.pincode || '',
      address: dealer.address || '',
      status: dealer.status || 'Active'
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.dealerName || !formData.dealerCode) return alert('Name and Code are required');
    if (formData.phone && formData.phone.length !== 10) return alert('Phone must be 10 digits');
    if (formData.pincode && formData.pincode.length !== 6) return alert('Pincode must be 6 digits');

    setLoading(true);
    try {
      if (editingDealer) {
        await api.put(`/loan-config/dealer/${editingDealer._id}`, formData);
      } else {
        await api.post('/loan-config/dealer', formData);
      }
      setIsFormOpen(false);
      fetchDealers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save dealer');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await api.delete(`/loan-config/dealer/${deleteId}`);
      setDeleteId(null);
      fetchDealers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete dealer');
    } finally {
      setLoading(false);
    }
  };

  const filteredDealers = dealers.filter(d =>
    d.dealerName?.toLowerCase().includes(search.toLowerCase()) ||
    d.dealerCode?.toLowerCase().includes(search.toLowerCase()) ||
    d.showroom?.toLowerCase().includes(search.toLowerCase())
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
              {editingDealer ? 'Edit Dealer Master' : 'Add New Dealer'}
            </h1>
          </div>
        </div>

        <div className="">
          <form onSubmit={handleSave} className="space-y-4 form-spiritual-bg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Dealer Code"
              required
              disabled
              value={formData.dealerCode}
              onChange={(e) => setFormData({ ...formData, dealerCode: e.target.value.toUpperCase() })}
            />
            <Input
              label="Dealer Name"
              required
              value={formData.dealerName}
              onChange={(e) => setFormData({ ...formData, dealerName: e.target.value.toUpperCase() })}
              placeholder="e.g. KALYAN JEWELLERS"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              required
              maxLength={10}
              value={formData.phone}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^[0-9]+$/.test(val)) {
                  if (val.length > 10) return;
                  setFormData({ ...formData, phone: val });
                }
              }}
              placeholder="e.g. 9840123456"
            />
            <Input
              label="Showroom"
              required
              value={formData.showroom}
              onChange={(e) => setFormData({ ...formData, showroom: e.target.value.toUpperCase() })}
              placeholder="e.g. T. NAGAR BRANCH"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="State"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
              placeholder="e.g. TAMIL NADU"
            />
            <Input
              label="Pincode"
              required
              maxLength={6}
              value={formData.pincode}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^[0-9]+$/.test(val)) {
                  if (val.length > 6) return;
                  setFormData({ ...formData, pincode: val });
                }
              }}
              placeholder="e.g. 600017"
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

          <Input
            label="Address"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value.toUpperCase() })}
            placeholder="e.g. 100, MAIN ROAD"
          />
          
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
                Save Dealer
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
        title="Dealer Master"
        subtitle="Manage details of corporate gold bullion dealers, scrap merchants, and business partners."
        icon={Store}
        actions={
          <Button onClick={handleOpenAdd} icon={Plus} variant="primary">
            Add Dealer
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
          'Dealer Code',
          'Dealer Name',
          'Showroom',
          'Phone',
          'State',
          'Pincode',
          'Status',
          'Actions'
        ]}
        data={filteredDealers}
        loading={loading}
        renderRow={(dealer) => (
          <TR key={dealer._id}>
            <TD className="font-bold text-gray-800">{dealer.dealerCode}</TD>
            <TD className="font-semibold">{dealer.dealerName}</TD>
            <TD>{dealer.showroom}</TD>
            <TD>{dealer.phone}</TD>
            <TD>{dealer.state}</TD>
            <TD>{dealer.pincode}</TD>
            <TD>
              <Badge variant={dealer.status === 'Active' ? 'success' : 'danger'}>
                {dealer.status}
              </Badge>
            </TD>
            <TD>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(dealer)}
                  className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-none cursor-pointer transition-colors"
                  title="Edit Dealer"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={() => setDeleteId(dealer._id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-none cursor-pointer transition-colors"
                  title="Delete Dealer"
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
        title="Delete Dealer"
        description="Are you sure you want to delete this dealer record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default DealerMaster;
