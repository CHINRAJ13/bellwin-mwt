import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../../../services/api';

const TwoWheelerLoanManager = ({ showAddForm, setShowAddForm }) => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    schemeName: '',
    interestRate: '',
    amountLimit: '',
    maturePeriodMonths: '',
    documentCharges: '',
    penalty: '',
    schemeType: 'Two Wheeler Loan',
    status: 'Active'
  });

  const fetchSchemes = async () => {
    try {
      const response = await api.get('/schemes?type=Two Wheeler Loan');
      if (response.status === 200) {
        setSchemes(response.data);
      }
    } catch (error) {
      console.error('Error fetching schemes:', error);
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
      const response = await api.post('/schemes', formData);
      if (response.status === 201 || response.status === 200) {
        toast.success(`Two Wheeler Scheme added successfully!`);
        setFormData({
          schemeName: '', interestRate: '', amountLimit: '',
          maturePeriodMonths: '', documentCharges: '', penalty: '', 
          schemeType: 'Two Wheeler Loan', status: 'Active'
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
      const response = await api.delete(`/schemes/${id}`);
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
    if (!schemes || schemes.length === 0) return 'TW-001';
    let maxNum = 0;
    schemes.forEach(s => {
      if (s.schemeId && s.schemeId.startsWith('TW-')) {
        const num = parseInt(s.schemeId.split('-')[1]);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      } else if (s.schemeId && s.schemeId.startsWith('GL-')) {
        const num = parseInt(s.schemeId.split('-')[1]);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return `TW-${String(maxNum + 1).padStart(3, '0')}`;
  };

  const nextSchemeId = generateNextSchemeId();

  return (
    <>
      {showAddForm && (
        <div className="mb-6 animate-fade-in">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">New Two Wheeler Scheme</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-5 form-spiritual-bg">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheme ID</label>
              <input readOnly type="text" value={nextSchemeId} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed font-semibold focus:outline-none" />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheme Name *</label>
              <input required type="text" name="schemeName" value={formData.schemeName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" placeholder="e.g. Low EMI Scheme" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interest % *</label>
              <input required type="number" step="any" name="interestRate" value={formData.interestRate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Limit (Rs) *</label>
              <input required type="number" step="any" name="amountLimit" value={formData.amountLimit} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mature Period (Months) *</label>
              <input required type="number" name="maturePeriodMonths" value={formData.maturePeriodMonths} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Charges *</label>
              <input required type="number" step="any" name="documentCharges" value={formData.documentCharges} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Penalty % *</label>
              <input required type="number" step="any" name="penalty" value={formData.penalty} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green transition-colors" />
            </div>
            <div className="col-span-1 flex justify-end items-end pb-1">
              <button disabled={loading} type="submit" className="px-6 py-1.5 text-[15px] bg-erp-green text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm inline-flex items-center justify-center gap-1.5 disabled:opacity-50 w-auto tracking-wide">
                {loading ? 'Saving...' : 'Submit / Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto h-full p-4">
          <h3 className="font-bold text-gray-700 mb-4">Existing Two Wheeler Schemes</h3>
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-gray-50 border-y border-gray-200 text-gray-600">
              <tr>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Scheme ID</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Scheme Name</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Interest %</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Amount Rs</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Mature Period</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Doc Charges</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Penalty %</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schemes.map((s) => (
                <tr key={s._id} className="bg-white hover:bg-gray-50 transition-colors text-gray-800">
                  <td className="p-3 text-sm font-semibold">{s.schemeId}</td>
                  <td className="p-3 text-sm font-medium">{s.schemeName}</td>
                  <td className="p-3 text-sm">{s.interestRate}%</td>
                  <td className="p-3 text-sm font-medium">₹{s.amountLimit != null ? Number(s.amountLimit).toFixed(2) : ''}</td>
                  <td className="p-3 text-sm">{s.maturePeriodMonths} mo</td>
                  <td className="p-3 text-sm">₹{s.documentCharges}</td>
                  <td className="p-3 text-sm text-red-600">{s.penalty}%</td>
                  <td className="p-3 text-sm text-right">
                    <button onClick={() => handleDelete(s._id)} className="text-red-500 hover:text-red-700 font-bold px-3 py-1 bg-red-50 rounded-md">Delete</button>
                  </td>
                </tr>
              ))}
              {schemes.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">No Two Wheeler Schemes found. Use the form above to add one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default TwoWheelerLoanManager;
