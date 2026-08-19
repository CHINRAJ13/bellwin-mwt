import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../../../services/api';

const ChitFundManager = ({ showAddForm, setShowAddForm }) => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    schemeCode: '',
    schemeName: '',
    collectionAmount: '',
    noOfMembers: '',
    term: '',
    mode: 'MLY',
    gst: '',
    adminCharges: '',
    bidderCommission: ''
  });

  const fetchSchemes = async () => {
    try {
      const response = await api.get('/chitty-schemes');
      if (response.status === 200) {
        setSchemes(response.data.schemes || response.data.data || response.data); 
      }
    } catch (error) {
      console.error('Error fetching chitty schemes:', error);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/chitty-schemes', formData);
      if (response.status === 201 || response.status === 200) {
        toast.success(`Chit Fund Scheme added successfully!`);
        setFormData({
          schemeCode: '', schemeName: '', collectionAmount: '', noOfMembers: '',
          term: '', mode: 'MLY', gst: '', adminCharges: '', bidderCommission: ''
        });
        setShowAddForm(false);
        fetchSchemes();
      } else {
        toast.error('Failed to add scheme');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheme?')) return;
    try {
      const response = await api.delete(`/chitty-schemes/${id}`);
      if (response.status === 200) {
        toast.success('Scheme deleted');
        fetchSchemes();
      } else {
        toast.error('Failed to delete');
      }
    } catch (error) {
      toast.error('Error deleting scheme');
    }
  };

  const generateNextSchemeId = () => {
    if (!schemes || schemes.length === 0) return 'CF-001';
    let maxNum = 0;
    // ensure schemes is array
    if (Array.isArray(schemes)) {
      schemes.forEach(s => {
        if (s.schemeCode && s.schemeCode.startsWith('CF-')) {
          const num = parseInt(s.schemeCode.split('-')[1]);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      });
    }
    return `CF-${String(maxNum + 1).padStart(3, '0')}`;
  };

  const nextSchemeId = generateNextSchemeId();

  // Set the next scheme ID when opening form if it's empty
  useEffect(() => {
    if (showAddForm && !formData.schemeCode) {
      setFormData(prev => ({ ...prev, schemeCode: generateNextSchemeId() }));
    }
  }, [showAddForm, schemes]);

  return (
    <>
      {showAddForm && (
        <div className="mb-6 animate-fade-in">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">New Chit Fund Scheme Configuration</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-5 form-spiritual-bg">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheme Code</label>
              <input readOnly type="text" name="schemeCode" value={formData.schemeCode || nextSchemeId} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed font-semibold focus:outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheme Name *</label>
              <input required type="text" name="schemeName" value={formData.schemeName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" placeholder="e.g. Navaratna Chitty" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Collection Mode *</label>
              <select required name="mode" value={formData.mode} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors">
                <option value="MLY">Monthly (MLY)</option>
                <option value="WLY">Weekly (WLY)</option>
                <option value="DLY">Daily (DLY)</option>
                <option value="YLY">Yearly (YLY)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Collection Amount (Rs) *</label>
              <input required type="number" step="any" name="collectionAmount" value={formData.collectionAmount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Members *</label>
              <input required type="number" name="noOfMembers" value={formData.noOfMembers} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Term (Months) *</label>
              <input required type="number" name="term" value={formData.term} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST %</label>
              <input type="number" step="any" name="gst" value={formData.gst} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Charges (Rs)</label>
              <input type="number" step="any" name="adminCharges" value={formData.adminCharges} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bidder Commission %</label>
              <input type="number" step="any" name="bidderCommission" value={formData.bidderCommission} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" />
            </div>
            <div className="col-span-2 flex justify-end items-end pb-1">
              <button disabled={loading} type="submit" className="px-6 py-1.5 text-[15px] bg-erp-green text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm inline-flex items-center justify-center gap-1.5 disabled:opacity-50 w-auto tracking-wide">
                {loading ? 'Saving...' : 'Submit / Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto h-full p-4">
          <h3 className="font-bold text-gray-700 mb-4">Existing Chit Fund Schemes</h3>
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-gray-50 border-y border-gray-200 text-gray-600">
              <tr>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Scheme Code</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Scheme Name</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Mode</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Collection Rs</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Members</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Term</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.isArray(schemes) && schemes.map((s) => (
                <tr key={s._id} className="bg-white hover:bg-gray-50 transition-colors text-gray-800">
                  <td className="p-3 text-sm font-semibold">{s.schemeCode}</td>
                  <td className="p-3 text-sm font-medium">{s.schemeName}</td>
                  <td className="p-3 text-sm">{s.mode}</td>
                  <td className="p-3 text-sm font-medium">₹{s.collectionAmount != null ? Number(s.collectionAmount).toFixed(2) : ''}</td>
                  <td className="p-3 text-sm">{s.noOfMembers}</td>
                  <td className="p-3 text-sm">{s.term} mo</td>
                  <td className="p-3 text-sm text-right">
                    <button onClick={() => handleDelete(s._id)} className="text-red-500 hover:text-red-700 font-bold px-3 py-1 bg-red-50 rounded-md">Delete</button>
                  </td>
                </tr>
              ))}
              {(!schemes || schemes.length === 0) && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">No Chit Fund Schemes found. Use the form above to add one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ChitFundManager;
