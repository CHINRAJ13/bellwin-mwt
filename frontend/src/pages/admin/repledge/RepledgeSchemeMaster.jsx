import { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Save, Edit2, Trash2, RefreshCw, FileText, Edit } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import { TD, TR } from '../../../components/ui/Table';

const RepledgeSchemeMaster = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  
  const [formData, setFormData] = useState({
    schemeName: '',
    schemeCode: '',
    interestRate: '',
    maxLoanPercentage: '',
    loanTenure: '',
    processingFee: '',
    penaltyPercentage: '',
    description: '',
    status: 'Active'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/repledges/schemes');
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch schemes');
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
      if (!dataToSave.processingFee) dataToSave.processingFee = 0;
      if (!dataToSave.penaltyPercentage) dataToSave.penaltyPercentage = 0;

      await api.post('/repledges/schemes', dataToSave);
      toast.success('Scheme added successfully');
      fetchData();
      handleReset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add scheme');
    }
  };

  const handleUpdate = async () => {
    try {
      const dataToSave = { ...formData };
      if (!dataToSave.processingFee) dataToSave.processingFee = 0;
      if (!dataToSave.penaltyPercentage) dataToSave.penaltyPercentage = 0;

      await api.put(`/repledges/schemes/${selectedId}`, dataToSave);
      toast.success('Scheme updated successfully');
      fetchData();
      handleReset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update scheme');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this scheme?")) return;
    try {
      await api.delete(`/repledges/schemes/${selectedId}`);
      toast.success('Scheme deleted successfully');
      fetchData();
      handleReset();
    } catch (err) {
      toast.error('Failed to delete scheme');
    }
  };

  const handleReset = () => {
    setSelectedId(null);
    setFormData({
      schemeName: '',
      schemeCode: '',
      interestRate: '',
      maxLoanPercentage: '',
      loanTenure: '',
      processingFee: '',
      penaltyPercentage: '',
      description: '',
      status: 'Active'
    });
  };

  const handleEdit = (item) => {
    setSelectedId(item._id);
    setFormData({
      schemeName: item.schemeName,
      schemeCode: item.schemeCode,
      interestRate: item.interestRate,
      maxLoanPercentage: item.maxLoanPercentage,
      loanTenure: item.loanTenure,
      processingFee: item.processingFee,
      penaltyPercentage: item.penaltyPercentage,
      description: item.description,
      status: item.status
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="Repledge Scheme Master" 
        subtitle="Manage Repledge Schemes and Configurations" 
        icon={FileText} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Scheme Details</h3>
            <form onSubmit={handleSave} className="space-y-4 form-spiritual-bg">
              <Input 
                label="Scheme Name" 
                name="schemeName" 
                value={formData.schemeName} 
                onChange={handleInputChange} 
                required 
              />
              <Input 
                label="Scheme Code" 
                name="schemeCode" 
                value={formData.schemeCode} 
                onChange={handleInputChange} 
                required 
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Interest Rate (%)" 
                  name="interestRate" 
                  type="number"
                  step="0.01"
                  value={formData.interestRate} 
                  onChange={handleInputChange} 
                  required 
                />
                <Input 
                  label="Max Loan (%)" 
                  name="maxLoanPercentage" 
                  type="number"
                  step="0.01"
                  value={formData.maxLoanPercentage} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Loan Tenure (Months)" 
                  name="loanTenure" 
                  type="number"
                  value={formData.loanTenure} 
                  onChange={handleInputChange} 
                  required 
                />
                <Input 
                  label="Processing Fee" 
                  name="processingFee" 
                  type="number"
                  step="0.01"
                  value={formData.processingFee} 
                  onChange={handleInputChange} 
                />
              </div>
              <Input 
                label="Penalty Percentage (%)" 
                name="penaltyPercentage" 
                type="number"
                step="0.01"
                value={formData.penaltyPercentage} 
                onChange={handleInputChange} 
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
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
              <h3 className="font-semibold text-gray-800">Existing Schemes</h3>
            </div>
            <DataTable
              headers={['Code', 'Scheme Name', 'Int (%)', 'Max LTV (%)', 'Tenure', 'Status', 'Actions']}
              data={data}
              loading={loading}
              renderRow={(item) => (
                <TR key={item._id}>
                  <TD className="font-medium">{item.schemeCode}</TD>
                  <TD className="font-bold text-gray-800">{item.schemeName}</TD>
                  <TD>{item.interestRate}%</TD>
                  <TD>{item.maxLoanPercentage}%</TD>
                  <TD>{item.loanTenure} M</TD>
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
export default RepledgeSchemeMaster;
