import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Search, Boxes, ArrowLeft } from 'lucide-react';
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

const STORAGE_KEY = 'bellwin_item_groups';

const ItemGroupMaster = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    itemCode: '',
    itemName: '',
    itemType: 'Gold',
    itemGroup: 'Ornament',
    status: 'Active'
  });

  // Delete dialog state
  const [deleteId, setDeleteId] = useState(null);

  // Fetch groups
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/loan-config/item-group');
      setGroups(res.data.groups || res.data || []);
    } catch (err) {
      console.error('Failed to fetch item groups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleOpenAdd = () => {
    setEditingGroup(null);
    let nextId = 'IG0001';
    if (groups.length > 0) {
      const maxNum = Math.max(...groups.map(g => {
        const match = g.itemCode?.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      }));
      nextId = `IG${String(maxNum + 1).padStart(4, '0')}`;
    }

    setFormData({
      itemCode: nextId,
      itemName: '',
      itemType: 'Gold',
      itemGroup: 'Ornament',
      status: 'Active'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      itemCode: group.itemCode || '',
      itemName: group.itemName || '',
      itemType: group.itemType || 'Gold',
      itemGroup: group.itemGroup || 'Ornament',
      status: group.status || 'Active'
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.itemName || !formData.itemCode) return alert('Name and Code are required');

    setLoading(true);
    try {
      if (editingGroup) {
        await api.put(`/loan-config/item-group/${editingGroup._id}`, formData);
      } else {
        await api.post('/loan-config/item-group', formData);
      }
      setIsFormOpen(false);
      fetchGroups();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save item group');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await api.delete(`/loan-config/item-group/${deleteId}`);
      setDeleteId(null);
      fetchGroups();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete item group');
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter(g =>
    g.itemName?.toLowerCase().includes(search.toLowerCase()) ||
    g.itemCode?.toLowerCase().includes(search.toLowerCase()) ||
    g.itemType?.toLowerCase().includes(search.toLowerCase())
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
              {editingGroup ? 'Edit Item Group Master' : 'Add New Item Group'}
            </h1>
          </div>
        </div>

        <div className="">
          <form onSubmit={handleSave} className="space-y-4 form-spiritual-bg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Item Code"
              required
              disabled
              value={formData.itemCode}
              onChange={(e) => setFormData({ ...formData, itemCode: e.target.value.toUpperCase() })}
            />
            <Input
              label="Item Name"
              required
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value.toUpperCase() })}
              placeholder="e.g. GOLD CHAIN 22K"
            />
          </div>

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
              <option value="Other">Other</option>
            </Select>
            <Select
              label="Item Group"
              value={formData.itemGroup}
              onChange={(e) => setFormData({ ...formData, itemGroup: e.target.value })}
            >
              <option value="Ornament">Ornament</option>
              <option value="Coin">Coin</option>
              <option value="Bar">Bar</option>
              <option value="Scrap">Scrap</option>
              <option value="Other">Other</option>
            </Select>
          </div>

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
          
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
                Save Group
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
        title="Item Group Master"
        subtitle="Configure primary asset groups, jewelry categories, and raw material classifications."
        icon={Boxes}
        actions={
          <Button onClick={handleOpenAdd} icon={Plus} variant="primary">
            Add Group
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
          'Item Code',
          'Item Name',
          'Item Type',
          'Item Group',
          'Status',
          'Actions'
        ]}
        data={filteredGroups}
        loading={loading}
        renderRow={(group) => (
          <TR key={group._id}>
            <TD className="font-bold text-gray-800">{group.itemCode}</TD>
            <TD className="font-semibold">{group.itemName}</TD>
            <TD>{group.itemType}</TD>
            <TD>{group.itemGroup}</TD>
            <TD>
              <Badge variant={group.status === 'Active' ? 'success' : 'danger'}>
                {group.status}
              </Badge>
            </TD>
            <TD>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(group)}
                  className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-none cursor-pointer transition-colors"
                  title="Edit Group"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={() => setDeleteId(group._id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-none cursor-pointer transition-colors"
                  title="Delete Group"
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
        title="Delete Item Group"
        description="Are you sure you want to delete this item group record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default ItemGroupMaster;
