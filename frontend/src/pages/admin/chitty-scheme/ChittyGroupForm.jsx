import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Save, Trash2, ArrowLeft, RefreshCw, XCircle, Search } from 'lucide-react';

import PageHeader from '../../../components/ui/PageHeader';
import Button from '../../../components/ui/Button';

const ChittyGroupForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const initialFormState = {
    groupName: '',
    groupCode: '',
    schemeName: '',
    totalMembers: '',
    startDate: '',
    auctionDay: '',
    groupStatus: 'Open',
    remarks: '',
    customerId: '',
    customerName: '',
    mobileNumber: '',
    nomineeName: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);

  // Customer Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (isEdit) {
      fetchGroup();
    }
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/chitty-group/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data.data;
      setFormData({
        ...data,
        startDate: data.startDate ? data.startDate.split('T')[0] : '',
      });
    } catch (err) {
      toast.error('Failed to fetch group details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/customers?search=${value}&limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(res.data.data || []);
      setShowDropdown(true);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectCustomer = (customer) => {
    setFormData(prev => ({
      ...prev,
      customerName: customer.customerName || '',
      customerId: customer.customerId || '',
      mobileNumber: customer.mobileNumber || '',
      nomineeName: customer.nominee?.nomineeName || ''
    }));
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData(initialFormState);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/chitty-group/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Group deleted successfully');
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete group');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const payload = { 
        ...formData,
        totalMembers: Number(formData.totalMembers),
        auctionDay: formData.auctionDay ? Number(formData.auctionDay) : null
      };

      if (isEdit) {
        await api.put(`/chitty-group/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Group updated successfully');
      } else {
        await api.post('/chitty-group', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Group created successfully');
        navigate('/admin-dashboard'); 
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save group');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-gray-200 rounded-none hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <PageHeader 
          title={isEdit ? 'Update Chit Fund Group Master' : 'Chit Fund Group Master Form'} 
          subtitle=""
        />
      </div>

      <div className="bg-white rounded-none border border-gray-200 shadow-sm p-6">
        {/* Customer Search Section */}
        {!isEdit && (
          <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded" ref={searchRef}>
            <label className="block text-sm font-semibold text-green-800 mb-2">Assign Customer (Search by Name or ID)</label>
            <div className="relative">
              <div className="flex items-center border border-gray-300 bg-white rounded-none focus-within:ring-2 focus-within:ring-green-500 overflow-hidden">
                <Search size={18} className="text-gray-400 ml-3" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Enter Customer Name, ID or Mobile..."
                  className="w-full p-2.5 outline-none text-sm"
                />
              </div>
              
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 shadow-lg rounded-none max-h-60 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-3 text-sm text-gray-500 text-center">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map(cust => (
                      <div 
                        key={cust._id} 
                        onClick={() => selectCustomer(cust)}
                        className="p-3 border-b border-gray-100 hover:bg-green-50 cursor-pointer transition-colors"
                      >
                        <div className="font-semibold text-gray-800">{cust.customerName}</div>
                        <div className="text-xs text-gray-500 flex justify-between mt-1">
                          <span>ID: {cust.customerId}</span>
                          <span>Mob: {cust.mobileNumber}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-gray-500 text-center">No customers found</div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-green-600 mt-2">
              Select a customer to assign them to this group. Their details will be auto-filled.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 form-spiritual-bg">
          
          {formData.customerId && (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded mb-6">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 border-b pb-2">Assigned Customer Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Customer Name</p>
                  <p className="text-sm font-semibold text-gray-800">{formData.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Customer ID</p>
                  <p className="text-sm font-semibold text-gray-800">{formData.customerId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Mobile Number</p>
                  <p className="text-sm font-semibold text-gray-800">{formData.mobileNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Nominee Name</p>
                  <p className="text-sm font-semibold text-gray-800">{formData.nomineeName || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Group Name *</label>
              <input 
                type="text" 
                name="groupName" 
                value={formData.groupName} 
                onChange={handleChange} 
                required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-none text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Group Code *</label>
              <input 
                type="text" 
                name="groupCode" 
                value={formData.groupCode} 
                onChange={handleChange} 
                required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-none text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Scheme Name *</label>
              <input 
                type="text" 
                name="schemeName" 
                value={formData.schemeName} 
                onChange={handleChange} 
                required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-none text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Total Members *</label>
              <input 
                type="number" 
                name="totalMembers" 
                value={formData.totalMembers} 
                onChange={handleChange} 
                required
                min="1"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-none text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Date *</label>
              <input 
                type="date" 
                name="startDate" 
                value={formData.startDate} 
                onChange={handleChange} 
                required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-none text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Auction Day (1-31)</label>
              <input 
                type="number" 
                name="auctionDay" 
                value={formData.auctionDay} 
                onChange={handleChange} 
                min="1"
                max="31"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-none text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Group Status</label>
              <select 
                name="groupStatus" 
                value={formData.groupStatus} 
                onChange={handleChange} 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-none text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Remarks</label>
              <textarea 
                name="remarks" 
                value={formData.remarks} 
                onChange={handleChange} 
                rows="3"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-none text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={handleClear} icon={XCircle}>
              Clear add
            </Button>
            {isEdit && (
              <Button type="button" variant="danger" onClick={handleDelete} icon={Trash2} className="bg-red-500 text-white hover:bg-red-600">
                Delete
              </Button>
            )}
            <Button type="submit" variant="primary" disabled={isSubmitting} icon={isEdit ? RefreshCw : Save}>
              {isSubmitting ? 'Processing...' : isEdit ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChittyGroupForm;
