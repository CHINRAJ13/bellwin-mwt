import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Save, X, ArrowLeft } from 'lucide-react';

import PageHeader from '../../../components/ui/PageHeader';
import Button from '../../../components/ui/Button';

const ChittySchemeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const generateSchemeCode = () => `CF-${Math.floor(100000 + Math.random() * 900000)}`;

  const [formData, setFormData] = useState({
    schemeCode: isEdit ? '' : generateSchemeCode(),
    schemeName: '',
    collectionAmount: '',
    noOfMembers: '',
    term: '',
    mode: 'MLY',
    gst: '',
    adminCharges: '',
    bidderCommission: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      fetchScheme();
    }
  }, [id]);

  const fetchScheme = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/chitty-schemes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        ...res.data,
        collectionAmount: res.data.collectionAmount || '',
        noOfMembers: res.data.noOfMembers || '',
        term: res.data.term || '',
        gst: res.data.gst || '',
        adminCharges: res.data.adminCharges || '',
        bidderCommission: res.data.bidderCommission || ''
      });
    } catch (err) {
      toast.error('Failed to fetch scheme details');
      navigate('/admin/chitty/scheme');
    } finally {
      setIsLoading(false);
    }
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
      const payload = {
        ...formData,
        collectionAmount: Number(formData.collectionAmount),
        noOfMembers: Number(formData.noOfMembers),
        term: Number(formData.term),
        gst: Number(formData.gst || 0),
        adminCharges: Number(formData.adminCharges || 0),
        bidderCommission: Number(formData.bidderCommission || 0)
      };

      if (isEdit) {
        await api.put(`/chitty-schemes/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Scheme updated successfully');
      } else {
        await api.post('/chitty-schemes', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Scheme created successfully');
      }
      navigate('/admin/chitty/scheme');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save scheme');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/chitty/scheme')}
          className="p-2 bg-white border border-gray-200 rounded-none hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <PageHeader 
          title={isEdit ? 'Edit Chit Fund Scheme' : 'Create Chit Fund Scheme'} 
          subtitle=""
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 form-spiritual-bg">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Scheme Code *</label>
            <input 
              type="text" 
              name="schemeCode" 
              value={formData.schemeCode} 
              onChange={handleChange} 
              required
              readOnly
              className="w-full p-2.5 bg-gray-200 border border-gray-200 rounded-none text-sm outline-none cursor-not-allowed font-bold"
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
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Collection Amount *</label>
            <input 
              type="number" 
              name="collectionAmount" 
              value={formData.collectionAmount} 
              onChange={handleChange} 
              required
              min="0"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-none text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">No of Member *</label>
            <input 
              type="number" 
              name="noOfMembers" 
              value={formData.noOfMembers} 
              onChange={handleChange} 
              required
              min="1"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-none text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Term *</label>
            <input 
              type="number" 
              name="term" 
              value={formData.term} 
              onChange={handleChange} 
              required
              min="1"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-none text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mode *</label>
            <select 
              name="mode" 
              value={formData.mode} 
              onChange={handleChange} 
              required
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-none text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
            >
              <option value="MLY">MLY (Monthly)</option>
              <option value="WLY">WLY (Weekly)</option>
              <option value="DLY">DLY (Daily)</option>
              <option value="YLY">YLY (Yearly)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">GST (%)</label>
            <input 
              type="number" 
              name="gst" 
              value={formData.gst} 
              onChange={handleChange} 
              min="0"
              step="0.01"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-none text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Charges</label>
            <input 
              type="number" 
              name="adminCharges" 
              value={formData.adminCharges} 
              onChange={handleChange} 
              min="0"
              step="0.01"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-none text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bidder Commission</label>
            <input 
              type="number" 
              name="bidderCommission" 
              value={formData.bidderCommission} 
              onChange={handleChange} 
              min="0"
              step="0.01"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-none text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/chitty/scheme')} icon={X}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting} icon={Save}>
            {isSubmitting ? 'Saving...' : 'Save Scheme'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChittySchemeForm;
