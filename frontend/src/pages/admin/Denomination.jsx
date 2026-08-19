import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const Denomination = () => {
  const [denominationId, setDenominationId] = useState('');
  const [actionType, setActionType] = useState('save');
  
  const [formData, setFormData] = useState({
    entryDate: new Date().toISOString().split('T')[0],
    systemCash: 0,
    count500: '',
    count200: '',
    count100: '',
    count50: '',
    count20: '',
    count10: '',
    count5: '',
    count2: '',
    count1: '',
    coinsTotal: '',
    enteredBy: '',
    verifiedBy: '',
    verifiedTime: '',
    remarks: ''
  });

  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    fetchNextId();
  }, []);

  const fetchNextId = async () => {
    try {
      const res = await api.get('/denominations/next-id');
      setDenominationId(res.data.nextId);
    } catch (err) {
      console.error('Failed to fetch next ID', err);
    }
  };

  useEffect(() => {
    const calcTotal = 
      (Number(formData.count500) || 0) * 500 +
      (Number(formData.count200) || 0) * 200 +
      (Number(formData.count100) || 0) * 100 +
      (Number(formData.count50) || 0) * 50 +
      (Number(formData.count20) || 0) * 20 +
      (Number(formData.count10) || 0) * 10 +
      (Number(formData.count5) || 0) * 5 +
      (Number(formData.count2) || 0) * 2 +
      (Number(formData.count1) || 0) * 1 +
      (Number(formData.coinsTotal) || 0);
    
    setGrandTotal(calcTotal);
  }, [formData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (grandTotal <= 0) {
      toast.error('Please enter at least one denomination amount.');
      return;
    }

    try {
      const payload = {
        denominationId,
        entryDate: formData.entryDate,
        cashInHandTotal: Number(formData.systemCash) || 0,
        notes500: Number(formData.count500) || 0,
        notes200: Number(formData.count200) || 0,
        notes100: Number(formData.count100) || 0,
        notes50: Number(formData.count50) || 0,
        notes20: Number(formData.count20) || 0,
        notes10: Number(formData.count10) || 0,
        notes5: Number(formData.count5) || 0,
        notes2: Number(formData.count2) || 0,
        notes1: Number(formData.count1) || 0,
        coinsTotal: Number(formData.coinsTotal) || 0,
        enteredBy: formData.enteredBy,
        verifiedBy: formData.verifiedBy,
        verifiedTime: formData.verifiedTime,
        remarks: formData.remarks
      };

      await api.post('/denominations', payload);
      toast.success('Denomination details saved successfully!');
      
      if (actionType === 'saveAndClose') {
        window.history.back();
      } else {
        // Fetch new ID and reset form
        fetchNextId();
        setFormData(prev => ({
          ...prev,
          systemCash: 0,
          count500: '',
          count200: '',
          count100: '',
          count50: '',
          count20: '',
          count10: '',
          count5: '',
          count2: '',
          count1: '',
          coinsTotal: '',
          enteredBy: '',
          verifiedBy: '',
          verifiedTime: '',
          remarks: ''
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save denomination details.');
      console.error(err);
    }
  };

  const inp = "w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors text-sm";
  const lbl = "block text-xs font-semibold text-gray-700 mb-1";
  const card = "bg-white border border-gray-200 rounded-none shadow-sm mb-6";
  const cardHeader = "px-5 py-3 border-b border-gray-200 bg-white font-bold text-gray-800";

  return (
    <div className="p-8 w-full max-w-6xl mx-auto flex flex-col min-h-screen">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add Denomination (Cash Closing)</h2>
          <p className="text-sm text-gray-500 mt-1">For daily cash closing, counter verification, and audit matching.</p>
        </div>
        <div className="bg-gray-100 px-4 py-1.5 border border-gray-200">
          <span className="text-xs font-bold text-gray-500 uppercase">ID: </span>
          <span className="text-sm font-black text-gray-800">{denominationId || 'Loading...'}</span>
        </div>
      </div>

      <form className="form-spiritual-bg" onSubmit={handleSave}>
        {/* Core Details */}
        <div className={card}>
          <div className={cardHeader}>Core Details</div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={lbl}>Entry Date <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                name="entryDate" 
                className={inp} 
                value={formData.entryDate} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div>
              <label className={lbl}>Cash In Hand Total (System) <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                name="systemCash" 
                className={`${inp} bg-blue-50/50 text-blue-700 font-semibold`} 
                value={formData.systemCash} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
        </div>

        {/* Denomination Counts */}
        <div className={card}>
          <div className={cardHeader}>Denomination Counts</div>
          <div className="p-5 flex flex-col gap-4 max-w-xs mx-auto md:mx-0">
            
            {[{label: '₹500 x', name: 'count500'}, 
              {label: '₹200 x', name: 'count200'}, 
              {label: '₹100 x', name: 'count100'}, 
              {label: '₹50 x', name: 'count50'}, 
              {label: '₹20 x', name: 'count20'}, 
              {label: '₹10 x', name: 'count10'},
              {label: '₹5 x', name: 'count5'},
              {label: '₹2 x', name: 'count2'},
              {label: '₹1 x', name: 'count1'}].map(item => (
              <div key={item.name} className="flex items-center gap-3">
                <label className="text-sm font-bold text-gray-700 w-24 text-right whitespace-nowrap">{item.label}</label>
                <input 
                  type="number" 
                  name={item.name}
                  min="0"
                  className={inp} 
                  placeholder="Count" 
                  value={formData[item.name]} 
                  onChange={handleChange} 
                />
              </div>
            ))}

            <div className="flex items-center gap-3 mt-2">
              <label className="text-sm font-bold text-gray-700 w-24 text-right whitespace-nowrap">Coins Total ₹</label>
              <input 
                type="number" 
                name="coinsTotal"
                min="0"
                className={inp} 
                placeholder="Total Coin Amount" 
                value={formData.coinsTotal} 
                onChange={handleChange} 
              />
            </div>

          </div>
        </div>

        {/* Grand Total */}
        <div className="bg-gray-50 border border-gray-200 rounded-none shadow-sm mb-6 p-8 flex flex-col items-center justify-center">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Calculated Grand Total</h3>
          <div className="text-4xl font-black text-gray-900">₹{grandTotal.toLocaleString('en-IN')}</div>
        </div>

        {/* Verification Details */}
        <div className={card}>
          <div className={cardHeader}>Verification Details</div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={lbl}>Entered By</label>
              <input 
                type="text" 
                name="enteredBy" 
                className={inp} 
                placeholder="Staff Name" 
                value={formData.enteredBy} 
                onChange={handleChange} 
              />
            </div>
            <div>
              <label className={lbl}>Verified By</label>
              <input 
                type="text" 
                name="verifiedBy" 
                className={inp} 
                placeholder="Manager Name" 
                value={formData.verifiedBy} 
                onChange={handleChange} 
              />
            </div>
            <div>
              <label className={lbl}>Verified Time</label>
              <input 
                type="datetime-local" 
                name="verifiedTime" 
                className={inp} 
                value={formData.verifiedTime} 
                onChange={handleChange} 
              />
            </div>
            <div className="md:col-span-3">
              <label className={lbl}>Remarks</label>
              <textarea 
                name="remarks" 
                className={`${inp} resize-none`} 
                rows="2" 
                placeholder="Note any discrepancies or auditing remarks..." 
                value={formData.remarks} 
                onChange={handleChange} 
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button 
            type="button" 
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-none hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            onClick={() => setActionType('save')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-none shadow-sm transition-colors"
          >
            Save
          </button>
          <button 
            type="submit" 
            onClick={() => setActionType('saveAndClose')}
            className="px-6 py-2 bg-erp-green hover:bg-green-700 text-white text-sm font-bold rounded-none shadow-sm transition-colors"
          >
            Save & Close
          </button>
        </div>

      </form>
    </div>
  );
};

export default Denomination;
