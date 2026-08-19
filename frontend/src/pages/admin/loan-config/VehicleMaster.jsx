import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Search, Car, ArrowLeft } from 'lucide-react';
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

const STORAGE_KEY = 'bellwin_vehicles';

const VehicleMaster = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicleId: '',
    category: 'Two-Wheeler',
    company: '',
    vehicleName: '',
    model: '',
    fuelType: 'Petrol',
    color: '',
    status: 'Active'
  });

  // Delete dialog state
  const [deleteId, setDeleteId] = useState(null);

  // Fetch vehicles
  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/loan-config/vehicle');
      setVehicles(res.data.vehicles || res.data || []);
    } catch (err) {
      console.error('Failed to fetch vehicles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    let nextId = 'VEH0001';
    if (vehicles.length > 0) {
      const maxNum = Math.max(...vehicles.map(v => {
        const match = v.vehicleId?.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      }));
      nextId = `VEH${String(maxNum + 1).padStart(4, '0')}`;
    }

    setFormData({
      vehicleId: nextId,
      category: 'Two-Wheeler',
      company: '',
      vehicleName: '',
      model: '',
      fuelType: 'Petrol',
      color: '',
      status: 'Active'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleId: vehicle.vehicleId || '',
      category: vehicle.category || 'Two-Wheeler',
      company: vehicle.company || '',
      vehicleName: vehicle.vehicleName || '',
      model: vehicle.model || '',
      fuelType: vehicle.fuelType || 'Petrol',
      color: vehicle.color || '',
      status: vehicle.status || 'Active'
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.company || !formData.vehicleName || !formData.model || !formData.color) {
      return toast.error('Company, Vehicle Name, Model, and Color are all required fields!');
    }

    setLoading(true);
    try {
      if (editingVehicle) {
        await api.put(`/loan-config/vehicle/${editingVehicle._id}`, formData);
      } else {
        await api.post('/loan-config/vehicle', formData);
      }
      setIsFormOpen(false);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await api.delete(`/loan-config/vehicle/${deleteId}`);
      setDeleteId(null);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete vehicle');
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(v =>
    v.vehicleName?.toLowerCase().includes(search.toLowerCase()) ||
    v.company?.toLowerCase().includes(search.toLowerCase()) ||
    v.vehicleId?.toLowerCase().includes(search.toLowerCase())
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
              {editingVehicle ? 'Edit Vehicle Master' : 'Add New Vehicle'}
            </h1>
          </div>
        </div>

        <div className="">
          <form onSubmit={handleSave} className="space-y-4 form-spiritual-bg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Vehicle ID"
                required
                disabled
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value.toUpperCase() })}
              />
              <Select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Two-Wheeler">Two-Wheeler</option>
                <option value="Three-Wheeler">Three-Wheeler</option>
                <option value="Four-Wheeler">Four-Wheeler</option>
                <option value="Commercial">Commercial</option>
                <option value="Other">Other</option>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              >
                <option value="">Select Company...</option>
                <option value="Honda">Honda</option>
                <option value="Bajaj">Bajaj</option>
                <option value="TVS">TVS</option>
                <option value="Yamaha">Yamaha</option>
                <option value="Hero">Hero</option>
                <option value="Suzuki">Suzuki</option>
                <option value="Maruti Suzuki">Maruti Suzuki</option>
                <option value="Hyundai">Hyundai</option>
                <option value="Tata">Tata</option>
                <option value="Mahindra">Mahindra</option>
                <option value="Toyota">Toyota</option>
                <option value="Other">Other</option>
              </Select>
              <Input
                label="Vehicle Name"
                required
                value={formData.vehicleName}
                onChange={(e) => setFormData({ ...formData, vehicleName: e.target.value.toUpperCase() })}
                placeholder="e.g. ACTIVA 6G"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Model (Year)"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value.toUpperCase() })}
                placeholder="e.g. 2023"
              />
              <Select
                label="Fuel Type"
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="EV">EV</option>
                <option value="CNG">CNG</option>
                <option value="Hybrid">Hybrid</option>
              </Select>
              <Input
                label="Colour"
                required
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="e.g. Pearl White"
              />
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
                Save Vehicle
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
        title="Vehicle Master"
        subtitle="Manage details of company-owned two-wheelers and four-wheelers used for field operations."
        icon={Car}
        actions={
          <Button onClick={handleOpenAdd} icon={Plus} variant="primary">
            Add Vehicle
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
          'ID',
          'Category',
          'Company',
          'Name',
          'Model',
          'Fuel Type',
          'Colour',
          'Status',
          'Actions'
        ]}
        data={filteredVehicles}
        loading={loading}
        renderRow={(vehicle) => (
          <TR key={vehicle._id}>
            <TD className="font-bold text-gray-800">{vehicle.vehicleId}</TD>
            <TD>{vehicle.category}</TD>
            <TD>{vehicle.company}</TD>
            <TD className="font-semibold">{vehicle.vehicleName}</TD>
            <TD>{vehicle.model}</TD>
            <TD>{vehicle.fuelType}</TD>
            <TD>{vehicle.color}</TD>
            <TD>
              <Badge variant={vehicle.status === 'Active' ? 'success' : 'danger'}>
                {vehicle.status}
              </Badge>
            </TD>
            <TD>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(vehicle)}
                  className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-none cursor-pointer transition-colors"
                  title="Edit Vehicle"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={() => setDeleteId(vehicle._id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-none cursor-pointer transition-colors"
                  title="Delete Vehicle"
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
        title="Delete Vehicle"
        description="Are you sure you want to delete this vehicle record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default VehicleMaster;
