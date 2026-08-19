import { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Save, Edit2, Trash2, RefreshCw, Building, Edit } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import { TD, TR } from '../../../components/ui/Table';

const RepledgeBankMaster = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  
  const [formData, setFormData] = useState({
    bankName: '',
    contactNumber: '',
    address: '',
    openingBalance: '',
    openingDate: '',
    status: 'Active'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/repledges/banks');
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch banks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = { ...formData };
      if (!dataToSave.openingDate) delete dataToSave.openingDate;
      if (!dataToSave.openingBalance) dataToSave.openingBalance = 0;

      await api.post('/repledges/banks', dataToSave);
      toast.success('Bank added successfully');
      fetchData();
      handleReset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add bank');
    }
  };

  const handleUpdate = async () => {
    try {
      const dataToSave = { ...formData };
      if (!dataToSave.openingDate) delete dataToSave.openingDate;
      if (!dataToSave.openingBalance) dataToSave.openingBalance = 0;

      await api.put(`/repledges/banks/${selectedId}`, dataToSave);
      toast.success('Bank updated successfully');
      fetchData();
      handleReset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update bank');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this bank?")) return;
    try {
      await api.delete(`/repledges/banks/${selectedId}`);
      toast.success('Bank deleted successfully');
      fetchData();
      handleReset();
    } catch (err) {
      toast.error('Failed to delete bank');
    }
  };

  const handleReset = () => {
    setSelectedId(null);
    setFormData({
      bankName: '',
      contactNumber: '',
      address: '',
      openingBalance: '',
      openingDate: '',
      status: 'Active'
    });
  };

  const handleEdit = (item) => {
    setSelectedId(item._id);
    setFormData({
      bankName: item.bankName || '',
      contactNumber: item.contactNumber || '',
      address: item.address || '',
      openingBalance: item.openingBalance || '',
      openingDate: item.openingDate ? item.openingDate.split('T')[0] : '',
      status: item.status || 'Active'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="Repledge Bank Master" 
        subtitle="Manage Bank Information for Repledging" 
        icon={Building} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Bank Information</h3>
            <form onSubmit={handleSave} className="space-y-4 form-spiritual-bg">
              <Input 
                label="Bank Name" 
                name="bankName" 
                value={formData.bankName} 
                onChange={handleInputChange} 
                required 
              />
              <Input 
                label="Phone No" 
                name="contactNumber" 
                value={formData.contactNumber} 
                onChange={handleInputChange} 
              />
              <Input 
                label="Opening Balance" 
                type="number"
                name="openingBalance" 
                value={formData.openingBalance} 
                onChange={handleInputChange} 
              />
              <Input 
                label="Opening Date" 
                type="date"
                name="openingDate" 
                value={formData.openingDate} 
                onChange={handleInputChange} 
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  rows="3"
                ></textarea>
              </div>
              <Select 
                label="Status" 
                name="status" 
                value={formData.status} 
                onChange={handleInputChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
              
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                {!selectedId ? (
                  <Button type="submit" variant="primary" icon={Save} className="w-full justify-center">Save</Button>
                ) : (
                  <Button type="button" variant="primary" icon={Edit2} className="w-full justify-center" onClick={handleUpdate}>Update</Button>
                )}
                <Button type="button" variant="secondary" icon={RefreshCw} className="w-full justify-center" onClick={handleReset}>Reset</Button>
                {selectedId && (
                  <Button type="button" variant="danger" icon={Trash2} className="col-span-2 justify-center" onClick={handleDelete}>Delete</Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Table Section */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Existing Banks</h3>
            </div>
            <DataTable
              headers={['Bank ID', 'Bank Name', 'Phone No', 'Opening Bal', 'Date', 'Address', 'Status', 'Actions']}
              data={data}
              loading={loading}
              renderRow={(item) => (
                <TR key={item._id}>
                  <TD className="font-medium">{item.bankId}</TD>
                  <TD className="font-bold text-gray-800">{item.bankName}</TD>
                  <TD>{item.contactNumber}</TD>
                  <TD>₹{item.openingBalance || 0}</TD>
                  <TD>{item.openingDate ? new Date(item.openingDate).toLocaleDateString() : ''}</TD>
                  <TD>{item.address}</TD>
                  <TD>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.status}
                    </span>
                  </TD>
                  <TD>
                     <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-none transition-colors">
                        <Edit size={16} />
                     </button>
                  </TD>
                </TR>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default RepledgeBankMaster;
