import React, { useState, useEffect } from 'react';
import BranchSelect from '../../../components/ui/BranchSelect';
import { toast } from 'react-hot-toast';
import { Send, Banknote, Coins } from 'lucide-react';
import api from '../../../services/api';

const AddRemittance = () => {
  const [activeTab, setActiveTab] = useState('cash');

  // --- Cash Remittance State ---
  const [cashForm, setCashForm] = useState({
    remittanceNo: 'Loading...',
    date: new Date().toISOString().split('T')[0],
    fromBranch: 'Head Office',
    toBranch: 'Main Branch',
    requestedBy: '',
    receivedBy: '',
    amount: '',
    paymentMode: 'Cash',
    referenceNo: '',
    transferReason: '',
    remarks: '',
    status: 'Pending'
  });

  // --- Gold Remittance State ---
  const [goldForm, setGoldForm] = useState({
    remittanceNo: 'Loading...',
    date: new Date().toISOString().split('T')[0],
    fromBranch: 'Head Office',
    toBranch: 'Main Branch',
    requestedBy: '', // mapping to "Sent By"
    receivedBy: '',
    transferReason: '',
    ornamentType: '',
    ornamentName: '',
    purity: '22K',
    quantity: '',
    grossWeight: '',
    stoneWeight: '',
    netWeight: '',
    goldRate: '',
    goldValue: '',
    goldCheckedBy: '',
    remarks: '',
    status: 'Pending'
  });

  const fetchNextId = async (type) => {
    try {
      const response = await api.get(`/remittances/next-id?type=${type}`);
      if (response.data?.success) {
        if (type === 'cash') setCashForm(prev => ({ ...prev, remittanceNo: response.data.nextId }));
        else setGoldForm(prev => ({ ...prev, remittanceNo: response.data.nextId }));
      }
    } catch (error) {
      console.error('Error fetching next ID:', error);
    }
  };

  useEffect(() => {
    fetchNextId(activeTab);
  }, [activeTab]);

  const handleCashChange = (e) => setCashForm({ ...cashForm, [e.target.name]: e.target.value });
  
  const handleGoldChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...goldForm, [name]: value };
    
    if (name === 'grossWeight' || name === 'stoneWeight') {
      const gross = parseFloat(updatedForm.grossWeight) || 0;
      const stone = parseFloat(updatedForm.stoneWeight) || 0;
      updatedForm.netWeight = Math.max(0, gross - stone).toFixed(2);
    }
    
    if (name === 'goldRate' || name === 'grossWeight' || name === 'stoneWeight') {
       const net = parseFloat(updatedForm.netWeight) || 0;
       const rate = parseFloat(updatedForm.goldRate) || 0;
       updatedForm.goldValue = (net * rate).toFixed(2);
    }
    
    setGoldForm(updatedForm);
  };

  const handleCashSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...cashForm, remittanceType: 'Cash Remittance' };
      const response = await api.post('/remittances', payload);
      if (response.data.success) {
        toast.success('Cash Remittance added successfully!');
        clearCashForm();
        fetchNextId('cash');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving cash remittance');
    }
  };

  const handleGoldSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...goldForm, remittanceType: 'Gold Remittance' };
      const response = await api.post('/remittances', payload);
      if (response.data.success) {
        toast.success('Gold Remittance added successfully!');
        clearGoldForm();
        fetchNextId('gold');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving gold remittance');
    }
  };

  const clearCashForm = () => {
    setCashForm(prev => ({
      ...prev,
      date: new Date().toISOString().split('T')[0],
      fromBranch: 'Head Office',
      toBranch: 'Main Branch',
      requestedBy: '',
      receivedBy: '',
      amount: '',
      paymentMode: 'Cash',
      referenceNo: '',
      transferReason: '',
      remarks: '',
      status: 'Pending'
    }));
  };

  const clearGoldForm = () => {
    setGoldForm(prev => ({
      ...prev,
      date: new Date().toISOString().split('T')[0],
      fromBranch: 'Head Office',
      toBranch: 'Main Branch',
      requestedBy: '',
      receivedBy: '',
      transferReason: '',
      ornamentType: '',
      ornamentName: '',
      purity: '22K',
      quantity: '',
      grossWeight: '',
      stoneWeight: '',
      netWeight: '',
      goldRate: '',
      goldValue: '',
      goldCheckedBy: '',
      remarks: '',
      status: 'Pending'
    }));
  };

  const inp = "w-full px-3 py-1.5 text-base bg-white border border-gray-300 shadow-sm rounded-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors";
  const lbl = "block text-sm font-semibold text-gray-700 mb-0.5";

  return (
    <div className="flex flex-col h-full bg-gray-50/30 p-6">
      <div className="mb-6 shrink-0 flex items-center justify-between border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          New Remittance
        </h2>
        <div className="flex bg-white rounded-none p-1 shadow-sm border border-gray-200">
          <button onClick={() => setActiveTab('cash')} className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-none transition-colors ${activeTab === 'cash' ? 'bg-erp-green text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Banknote size={16} /> Cash Remittance
          </button>
          <button onClick={() => setActiveTab('gold')} className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-none transition-colors ${activeTab === 'gold' ? 'bg-yellow-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Coins size={16} /> Gold Remittance
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        
        {/* --- CASH REMITTANCE FORM --- */}
        {activeTab === 'cash' && (
          <form id="cash-remittance-form" onSubmit={handleCashSubmit} className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Basic Details</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className={lbl}>Remittance ID <span className="text-red-500">*</span></label>
                  <input type="text" name="remittanceNo" value={cashForm.remittanceNo} readOnly className={`${inp} bg-gray-100 cursor-not-allowed font-bold text-gray-600`} />
                </div>
                <div>
                  <label className={lbl}>Date <span className="text-red-500">*</span></label>
                  <input type="date" name="date" value={cashForm.date} onChange={handleCashChange} required className={inp} />
                </div>
                <div>
                  <label className={lbl}>From Branch <span className="text-red-500">*</span></label>
                  <BranchSelect name="fromBranch" value={cashForm.fromBranch} onChange={handleCashChange} className={inp} />
                </div>
                <div>
                  <label className={lbl}>To Branch <span className="text-red-500">*</span></label>
                  <BranchSelect name="toBranch" value={cashForm.toBranch} onChange={handleCashChange} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Requested / Sent By <span className="text-red-500">*</span></label>
                  <input type="text" name="requestedBy" value={cashForm.requestedBy} onChange={handleCashChange} required className={inp} placeholder="Enter name" />
                </div>
                <div>
                  <label className={lbl}>Received By</label>
                  <input type="text" name="receivedBy" value={cashForm.receivedBy} onChange={handleCashChange} className={inp} placeholder="Enter name (if received)" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Cash Details</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className={lbl}>Transfer Amount (₹) <span className="text-red-500">*</span></label>
                  <input type="number" name="amount" value={cashForm.amount} onChange={handleCashChange} required className={inp} placeholder="0.00" />
                </div>
                <div>
                  <label className={lbl}>Payment Mode <span className="text-red-500">*</span></label>
                  <select name="paymentMode" value={cashForm.paymentMode} onChange={handleCashChange} className={inp}>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Reference Number</label>
                  <input type="text" name="referenceNo" value={cashForm.referenceNo} onChange={handleCashChange} className={inp} placeholder="Transaction ID / Cheque No" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Additional Details</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className={lbl}>Transfer Reason <span className="text-red-500">*</span></label>
                      <textarea name="transferReason" value={cashForm.transferReason} onChange={handleCashChange} required rows="2" className={`${inp} resize-none`} placeholder="Reason for transfer..."></textarea>
                    </div>
                    <div>
                      <label className={lbl}>Remarks</label>
                      <textarea name="remarks" value={cashForm.remarks} onChange={handleCashChange} rows="2" className={`${inp} resize-none`} placeholder="Additional remarks..."></textarea>
                    </div>
                  </div>
                </div>
                <div>
                  <label className={lbl}>Status <span className="text-red-500">*</span></label>
                  <select name="status" value={cashForm.status} onChange={handleCashChange} className={inp}>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Sent">Sent</option>
                    <option value="Received">Received</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 pt-6 mt-6">
              <button type="button" onClick={clearCashForm} className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  Clear
              </button>
              <button type="submit" form="cash-remittance-form" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2">
                <Send size={16} /> Save Data
              </button>
            </div>
          </form>
        )}

        {/* --- GOLD REMITTANCE FORM --- */}
        {activeTab === 'gold' && (
          <form id="gold-remittance-form" onSubmit={handleGoldSubmit} className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Transfer Details</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className={lbl}>Remittance ID <span className="text-red-500">*</span></label>
                  <input type="text" name="remittanceNo" value={goldForm.remittanceNo} readOnly className={`${inp} bg-gray-100 cursor-not-allowed font-bold text-gray-600`} />
                </div>
                <div>
                  <label className={lbl}>Date <span className="text-red-500">*</span></label>
                  <input type="date" name="date" value={goldForm.date} onChange={handleGoldChange} required className={inp} />
                </div>
                <div>
                  <label className={lbl}>From Branch <span className="text-red-500">*</span></label>
                  <BranchSelect name="fromBranch" value={goldForm.fromBranch} onChange={handleGoldChange} className={inp} />
                </div>
                <div>
                  <label className={lbl}>To Branch <span className="text-red-500">*</span></label>
                  <BranchSelect name="toBranch" value={goldForm.toBranch} onChange={handleGoldChange} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Sent By <span className="text-red-500">*</span></label>
                  <input type="text" name="requestedBy" value={goldForm.requestedBy} onChange={handleGoldChange} required className={inp} placeholder="Enter name" />
                </div>
                <div>
                  <label className={lbl}>Received By</label>
                  <input type="text" name="receivedBy" value={goldForm.receivedBy} onChange={handleGoldChange} className={inp} placeholder="Enter name (if received)" />
                </div>
                <div className="col-span-3">
                  <label className={lbl}>Transfer Reason <span className="text-red-500">*</span></label>
                  <input type="text" name="transferReason" value={goldForm.transferReason} onChange={handleGoldChange} required className={inp} placeholder="Enter reason for transfer..." />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Gold Details</h3>
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <label className={lbl}>Ornament Type <span className="text-red-500">*</span></label>
                  <input type="text" name="ornamentType" value={goldForm.ornamentType} onChange={handleGoldChange} required className={inp} placeholder="e.g. Ring, Chain" />
                </div>
                <div>
                  <label className={lbl}>Ornament Name <span className="text-red-500">*</span></label>
                  <input type="text" name="ornamentName" value={goldForm.ornamentName} onChange={handleGoldChange} required className={inp} placeholder="e.g. Gold Ring" />
                </div>
                <div>
                  <label className={lbl}>Purity <span className="text-red-500">*</span></label>
                  <input type="text" name="purity" value={goldForm.purity} onChange={handleGoldChange} required className={inp} placeholder="e.g. 22K" />
                </div>
                <div>
                  <label className={lbl}>Quantity <span className="text-red-500">*</span></label>
                  <input type="number" name="quantity" value={goldForm.quantity} onChange={handleGoldChange} required className={inp} placeholder="0" />
                </div>
                <div>
                  <label className={lbl}>Gross Weight (g) <span className="text-red-500">*</span></label>
                  <input type="number" name="grossWeight" value={goldForm.grossWeight} onChange={handleGoldChange} required className={inp} placeholder="0.00" />
                </div>
                <div>
                  <label className={lbl}>Stone/Dust Weight (g)</label>
                  <input type="number" name="stoneWeight" value={goldForm.stoneWeight} onChange={handleGoldChange} className={inp} placeholder="0.00" />
                </div>
                <div>
                  <label className={lbl}>Net Weight (g) <span className="text-red-500">*</span></label>
                  <input type="number" name="netWeight" value={goldForm.netWeight} readOnly className={`${inp} bg-gray-50`} />
                </div>
                <div>
                  <label className={lbl}>Gold Rate (₹/g) <span className="text-red-500">*</span></label>
                  <input type="number" name="goldRate" value={goldForm.goldRate} onChange={handleGoldChange} required className={inp} placeholder="0.00" />
                </div>
                <div>
                  <label className={lbl}>Gold Value (₹) <span className="text-red-500">*</span></label>
                  <input type="number" name="goldValue" value={goldForm.goldValue} readOnly className={`${inp} bg-gray-50 font-bold`} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Verification</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className={lbl}>Gold Checked By <span className="text-red-500">*</span></label>
                  <input type="text" name="goldCheckedBy" value={goldForm.goldCheckedBy} onChange={handleGoldChange} required className={inp} placeholder="Enter name" />
                </div>
                <div>
                  <label className={lbl}>Remarks</label>
                  <input type="text" name="remarks" value={goldForm.remarks} onChange={handleGoldChange} className={inp} placeholder="Additional remarks..." />
                </div>
                <div>
                  <label className={lbl}>Status <span className="text-red-500">*</span></label>
                  <select name="status" value={goldForm.status} onChange={handleGoldChange} className={inp}>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Sent">Sent</option>
                    <option value="Received">Received</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 pt-6 mt-6">
              <button type="button" onClick={clearGoldForm} className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  Clear
              </button>
              <button type="submit" form="gold-remittance-form" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2">
                <Send size={16} /> Save Data
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddRemittance;
