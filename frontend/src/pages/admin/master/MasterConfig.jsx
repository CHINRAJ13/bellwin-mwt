import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Edit, X } from 'lucide-react';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'bellwin_master_config';

const MasterConfig = () => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: '',
    companyCode: '',
    gstNumber: '',
    panNumber: '',
    address: '',
    mobileNumber: '',
    email: '',
    financialYear: '2023-2024',
    currency: 'INR',
    defaultInterestRate: '',
    defaultGoldRate: '',
    loanSettings: 'Standard',
    notificationSettings: 'Email & SMS',
    securitySettings: 'High',
    status: 'Active'
  });

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await api.get('/master/config');
      if (res.data) setFormData(res.data);
    } catch (error) {
      console.error('Error fetching config:', error);
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.companyName) return alert('Company Name is required');

    setLoading(true);
    try {
      await api.post('/master/config', formData);
      toast.success('Configuration Saved Successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    fetchConfig();
    toast.success('Reset to saved values');
  };

  const handleCancel = () => {
    fetchConfig(); // reset any unsaved changes
    setIsEditing(false);
  };

  const renderViewMode = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-800">Company Profile Details</h3>
        <Button variant="primary" icon={Edit} onClick={() => setIsEditing(true)}>
          Edit Profile
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700 bg-gray-50 p-2 rounded">Basic Information</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <span className="text-gray-500">Company Name:</span>
            <span className="font-medium">{formData.companyName || '-'}</span>
            
            <span className="text-gray-500">Company Code:</span>
            <span className="font-medium">{formData.companyCode || '-'}</span>
            
            <span className="text-gray-500">GST Number:</span>
            <span className="font-medium">{formData.gstNumber || '-'}</span>
            
            <span className="text-gray-500">PAN Number:</span>
            <span className="font-medium">{formData.panNumber || '-'}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-700 bg-gray-50 p-2 rounded">Contact Information</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <span className="text-gray-500">Mobile Number:</span>
            <span className="font-medium">{formData.mobileNumber || '-'}</span>
            
            <span className="text-gray-500">Email:</span>
            <span className="font-medium">{formData.email || '-'}</span>
            
            <span className="text-gray-500">Address:</span>
            <span className="font-medium">{formData.address || '-'}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-700 bg-gray-50 p-2 rounded">Financial Settings</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <span className="text-gray-500">Financial Year:</span>
            <span className="font-medium">{formData.financialYear || '-'}</span>
            
            <span className="text-gray-500">Currency:</span>
            <span className="font-medium">{formData.currency || '-'}</span>
            
            <span className="text-gray-500">Default Interest Rate:</span>
            <span className="font-medium">{formData.defaultInterestRate ? `${formData.defaultInterestRate}%` : '-'}</span>
            
            <span className="text-gray-500">Default Gold Rate:</span>
            <span className="font-medium">{formData.defaultGoldRate ? `₹${formData.defaultGoldRate}` : '-'}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-700 bg-gray-50 p-2 rounded">System Settings</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <span className="text-gray-500">Loan Settings:</span>
            <span className="font-medium">{formData.loanSettings || '-'}</span>
            
            <span className="text-gray-500">Notification Settings:</span>
            <span className="font-medium">{formData.notificationSettings || '-'}</span>
            
            <span className="text-gray-500">Security Settings:</span>
            <span className="font-medium">{formData.securitySettings || '-'}</span>
            
            <span className="text-gray-500">Status:</span>
            <span className="font-medium">
              <span className={`px-2 py-1 text-xs rounded-full ${formData.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {formData.status || '-'}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full px-4 py-6 animate-fade-in">
      <PageHeader 
        title="Master Configuration" 
        subtitle="Manage general ERP settings." 
        icon={Settings} 
      />

      <div className="p-8 shadow-lg border border-gray-100">
        {!isEditing ? (
          renderViewMode()
        ) : (
          <form onSubmit={handleSave} className="space-y-6 animate-fade-in form-spiritual-bg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Company Name" required value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
              <Input label="Company Code" value={formData.companyCode} onChange={(e) => setFormData({ ...formData, companyCode: e.target.value })} />
              
              <Input label="GST Number" value={formData.gstNumber} onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })} />
              <Input label="PAN Number" value={formData.panNumber} onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })} />
              
              <Input label="Mobile Number" value={formData.mobileNumber} onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })} />
              <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full border border-gray-300 rounded-none p-2 focus:ring-green-500" rows="3" />
              </div>

              <Select label="Financial Year" value={formData.financialYear} onChange={(e) => setFormData({ ...formData, financialYear: e.target.value })}>
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
              </Select>
              <Select label="Currency" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </Select>

              <Input label="Default Interest Rate (%)" type="number" step="0.01" value={formData.defaultInterestRate} onChange={(e) => setFormData({ ...formData, defaultInterestRate: e.target.value })} />
              <Input label="Default Gold Rate (per gram)" type="number" value={formData.defaultGoldRate} onChange={(e) => setFormData({ ...formData, defaultGoldRate: e.target.value })} />

              <Select label="Loan Settings" value={formData.loanSettings} onChange={(e) => setFormData({ ...formData, loanSettings: e.target.value })}>
                <option value="Standard">Standard</option>
                <option value="Strict">Strict</option>
              </Select>
              <Select label="Notification Settings" value={formData.notificationSettings} onChange={(e) => setFormData({ ...formData, notificationSettings: e.target.value })}>
                <option value="Email & SMS">Email & SMS</option>
                <option value="Email Only">Email Only</option>
                <option value="SMS Only">SMS Only</option>
              </Select>

              <Select label="Security Settings" value={formData.securitySettings} onChange={(e) => setFormData({ ...formData, securitySettings: e.target.value })}>
                <option value="Standard">Standard</option>
                <option value="High">High</option>
              </Select>
              <Select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>

            </div>
            
            <div className="flex justify-end gap-4 pt-6 border-t mt-6">
              <Button type="button" onClick={handleCancel} variant="secondary" icon={X} className="px-6 py-2.5">Cancel</Button>
              <Button type="button" onClick={handleReset} variant="secondary" icon={RefreshCw} className="px-6 py-2.5">Reset</Button>
              <Button type="submit" variant="primary" icon={Save} loading={loading} className="px-8 py-2.5 shadow-md">Save Settings</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default MasterConfig;
