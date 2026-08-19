import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Save, X, ArrowLeft, RefreshCw, Search } from 'lucide-react';

import PageHeader from '../../../components/ui/PageHeader';
import Button from '../../../components/ui/Button';

const SchemeAllocationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    allocationNo: 'Auto Generated',
    customerName: '',
    customerId: '',
    schemeName: '',
    joinDate: '',
    installmentStartMonth: '',
    nomineeName: '',
    mobileNumber: '',
    status: 'Running'
  });

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
      fetchAllocation();
    }
  }, [id]);

  useEffect(() => {
    // Click outside to close dropdown
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAllocation = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/scheme-allocation/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data.data;
      setFormData({
        ...data,
        joinDate: data.joinDate ? data.joinDate.split('T')[0] : '',
      });
    } catch (err) {
      toast.error('Failed to fetch allocation details');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const payload = { ...formData };
      if (payload.allocationNo === 'Auto Generated') {
        delete payload.allocationNo;
      }

      if (isEdit) {
        await api.put(`/scheme-allocation/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Allocation updated successfully');
      } else {
        await api.post('/scheme-allocation', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Scheme allocated successfully');
        navigate('/admin-dashboard'); 
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to allocate scheme');
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
          title={isEdit ? 'Update Scheme Allocation' : 'Scheme Allocation Form'} 
          subtitle="Allocate scheme to a customer"
        />
      </div>

      <div className="bg-white rounded-none border border-gray-200 shadow-sm p-6">
        {/* Customer Search Section */}
        {!isEdit && (
          <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded" ref={searchRef}>
            <label className="block text-sm font-semibold text-green-800 mb-2">Search Customer (By Name or ID)</label>
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
              Select a customer from the search results to auto-fill their details below.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 form-spiritual-bg">
          
          {formData.customerId && (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded mb-6">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 border-b pb-2">Selected Customer Details</h4>
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Allocation No</label>
              <input 
                type="text" 
                name="allocationNo" 
                value={formData.allocationNo} 
                disabled
                className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-none text-sm outline-none cursor-not-allowed"
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Join Date *</label>
              <input 
                type="date" 
                name="joinDate" 
                value={formData.joinDate} 
                onChange={handleChange} 
                required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-none text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Installment Start Month *</label>
              <input 
                type="month" 
                name="installmentStartMonth" 
                value={formData.installmentStartMonth} 
                onChange={handleChange} 
                required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-none text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nominee Name</label>
              <input 
                type="text" 
                name="nomineeName" 
                value={formData.nomineeName} 
                onChange={handleChange} 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-none text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
              <input 
                type="text" 
                name="mobileNumber" 
                value={formData.mobileNumber} 
                onChange={handleChange} 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-none text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-none text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              >
                <option value="Running">Running</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)} icon={X}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting} icon={isEdit ? RefreshCw : Save}>
              {isSubmitting ? 'Processing...' : isEdit ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchemeAllocationForm;
