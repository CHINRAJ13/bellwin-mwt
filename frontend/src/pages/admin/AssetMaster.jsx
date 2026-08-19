import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Search, Box, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import PageHeader from '../../components/ui/PageHeader';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { TD, TR } from '../../components/ui/Table';
import BranchSelect from '../../components/ui/BranchSelect';

const AssetMaster = () => {
  const [assets, setAssets] = useState([]);
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [formData, setFormData] = useState({
    assetId: '',
    assetName: '',
    assetCategory: 'Furniture',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseCost: '',
    branch: '',
    department: 'Admin',
    assignedEmployee: '',
    supplier: '',
    warranty: '',
    serialNumber: '',
    status: 'Active',
    remarks: ''
  });

  // Delete dialog state
  const [deleteId, setDeleteId] = useState(null);

  // Fetch all assets
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/assets');
      setAssets(res.data || []);
    } catch (err) {
      console.error('Failed to fetch assets', err);
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  // Fetch next Asset ID
  const fetchNextId = async () => {
    try {
      const res = await api.get('/assets/next-id');
      if (res.data && res.data.nextId) {
        setFormData(prev => ({ ...prev, assetId: res.data.nextId }));
      }
    } catch (err) {
      console.error('Failed to fetch next asset ID', err);
    }
  };

  // Fetch branches
  const fetchBranches = async () => {
    try {
      const res = await api.get('/master/branch');
      setBranches(res.data.branches || res.data || []);
    } catch (err) {
      console.error('Failed to fetch branches', err);
      setBranches([
        { _id: '1', branchName: 'TRICHY' },
        { _id: '2', branchName: 'PUDUKKOTTAI' },
        { _id: '3', branchName: 'THANJAVUR' }
      ]);
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(Array.isArray(res.data) ? res.data : res.data.employees || []);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchBranches();
    fetchEmployees();
  }, []);

  const handleOpenAdd = async () => {
    setEditingAsset(null);
    setFormData({
      assetId: 'Loading...',
      assetName: '',
      assetCategory: 'Furniture',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseCost: '',
      branch: '',
      department: 'Admin',
      assignedEmployee: '',
      supplier: '',
      warranty: '',
      serialNumber: '',
      status: 'Active',
      remarks: ''
    });
    setIsFormOpen(true);
    await fetchNextId();
  };

  const handleOpenEdit = (asset) => {
    setEditingAsset(asset);
    setFormData({
      assetId: asset.assetId || '',
      assetName: asset.assetName || '',
      assetCategory: asset.assetCategory || 'Furniture',
      purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
      purchaseCost: asset.purchaseCost || '',
      branch: asset.branch || '',
      department: asset.department || 'Admin',
      assignedEmployee: asset.assignedEmployee || '',
      supplier: asset.supplier || '',
      warranty: asset.warranty || '',
      serialNumber: asset.serialNumber || '',
      status: asset.status || 'Active',
      remarks: asset.remarks || ''
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.assetName || !formData.assetCategory || !formData.purchaseDate || !formData.purchaseCost || !formData.branch) {
      return toast.error('Please fill in all required fields');
    }

    setLoading(true);
    try {
      if (editingAsset) {
        await api.put(`/assets/${editingAsset._id}`, formData);
        toast.success('Asset updated successfully');
      } else {
        await api.post('/assets', formData);
        toast.success('Asset added successfully');
      }
      setIsFormOpen(false);
      fetchAssets();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save asset');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await api.delete(`/assets/${deleteId}`);
      setDeleteId(null);
      fetchAssets();
      toast.success('Asset deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete asset');
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter(a =>
    a.assetId?.toLowerCase().includes(search.toLowerCase()) ||
    a.assetName?.toLowerCase().includes(search.toLowerCase()) ||
    a.serialNumber?.toLowerCase().includes(search.toLowerCase()) ||
    a.branch?.toLowerCase().includes(search.toLowerCase())
  );

  if (isFormOpen) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setIsFormOpen(false)}
            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-none transition-colors border-none bg-transparent cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {editingAsset ? 'Edit Asset Details' : 'Add New Asset'}
            </h1>
          </div>
        </div>

        <div>
          <form onSubmit={handleSave} className="space-y-4 form-spiritual-bg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Asset ID (Auto)"
                required
                disabled
                value={formData.assetId}
                onChange={() => {}}
              />
              <Input
                label="Asset Name"
                required
                value={formData.assetName}
                onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                placeholder="e.g. Dell Latitude Laptop"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Asset Category"
                required
                value={formData.assetCategory}
                onChange={(e) => setFormData({ ...formData, assetCategory: e.target.value })}
              >
                <option value="Furniture">Furniture</option>
                <option value="Electronics">Electronics</option>
                <option value="Vehicles">Vehicles</option>
                <option value="Office Equipment">Office Equipment</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Other">Other</option>
              </Select>
              <Input
                label="Purchase Date"
                type="date"
                required
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              />
              <Input
                label="Purchase Cost"
                type="number"
                required
                value={formData.purchaseCost}
                onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })}
                placeholder="e.g. 45000"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BranchSelect
                label="Branch"
                required
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              />
              <Select
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="Admin">Admin</option>
                <option value="Gold Loan">Gold Loan</option>
                <option value="Chit Fund">Chit Fund</option>
                <option value="Accounts">Accounts</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
                <option value="Other">Other</option>
              </Select>
              <Select
                label="Assigned Employee"
                value={formData.assignedEmployee}
                onChange={(e) => setFormData({ ...formData, assignedEmployee: e.target.value })}
              >
                <option value="">Select Employee (Optional)</option>
                {employees.map(e => (
                  <option key={e._id} value={`${e.firstName} ${e.lastName} (${e.employeeId})`}>
                    {e.firstName} {e.lastName} ({e.employeeId})
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="e.g. Sony Tech Solutions"
              />
              <Input
                label="Warranty"
                value={formData.warranty}
                onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                placeholder="e.g. 1 Year / 24 Months"
              />
              <Input
                label="Serial Number"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="e.g. SN-9823412A"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Select
                label="Current Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Disposed">Disposed</option>
              </Select>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full border border-gray-300 p-2 focus:ring-green-500 focus:border-green-500 text-sm outline-none"
                  rows="3"
                  placeholder="Any additional details..."
                />
              </div>
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
                Save Asset
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
        title="Asset Management"
        subtitle="Manage and track company assets, purchase details, warranties, and employee assignments."
        icon={Box}
        actions={
          <Button onClick={handleOpenAdd} icon={Plus} variant="primary">
            Add Asset
          </Button>
        }
      />

      <div className="p-4 mb-6 shadow-sm border border-gray-100 bg-white">
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, Name, Serial Number or Branch..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-none text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-gray-50"
          />
        </div>
      </div>

      <DataTable
        headers={[
          'Asset ID',
          'Asset Name',
          'Category',
          'Purchase Date',
          'Cost',
          'Branch',
          'Assigned Employee',
          'Status',
          'Actions'
        ]}
        data={filteredAssets}
        loading={loading}
        renderRow={(asset) => (
          <TR key={asset._id}>
            <TD 
              className="font-bold text-green-600 hover:text-green-800 cursor-pointer hover:underline"
              onClick={() => handleOpenEdit(asset)}
              title="Click to edit asset"
            >
              {asset.assetId}
            </TD>
            <TD className="font-semibold text-gray-800">{asset.assetName}</TD>
            <TD>{asset.assetCategory}</TD>
            <TD>{asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '—'}</TD>
            <TD className="font-semibold text-gray-900">₹{parseFloat(asset.purchaseCost).toLocaleString('en-IN')}</TD>
            <TD>{asset.branch}</TD>
            <TD>{asset.assignedEmployee || '—'}</TD>
            <TD>
              <Badge variant={
                asset.status === 'Active' ? 'success' : 
                asset.status === 'Maintenance' ? 'warning' : 'danger'
              }>
                {asset.status}
              </Badge>
            </TD>
            <TD>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(asset)}
                  className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-none cursor-pointer transition-colors border-none bg-transparent"
                  title="Edit Asset"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={() => setDeleteId(asset._id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-none cursor-pointer transition-colors border-none bg-transparent"
                  title="Delete Asset"
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
        title="Delete Asset Record"
        description="Are you sure you want to delete this asset record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default AssetMaster;
