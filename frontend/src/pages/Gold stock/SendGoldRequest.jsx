import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Send, Search } from 'lucide-react';
import api from '../../services/api';

const SendGoldRequest = () => {
  const [searchId, setSearchId] = useState('');
  const [formData, setFormData] = useState({
    requestNo: 'Loading...',
    date: new Date().toISOString().split('T')[0],
    customerId: '',
    customerName: '',
    itemName: '',
    goldType: '',
    weight: '',
    purity: '',
    quantity: '',
    reason: '',
    requestedTo: 'Head Office',
    status: 'Pending',
    remarks: '',
    requestedBy: '',
  });

  const fetchNextId = async () => {
    try {
      const response = await api.get('/gold-requests/next-id');
      if (response.data?.success) {
        setFormData(prev => ({ ...prev, requestNo: response.data.nextId }));
      }
    } catch (error) {
      console.error('Error fetching next ID:', error);
    }
  };

  useEffect(() => {
    fetchNextId();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchCustomer = async () => {
    if (!searchId.trim()) return;
    try {
      const response = await api.get(`/customers/search?search=${searchId}`);
      if (response.data?.data?.length > 0) {
        const customer = response.data.data[0];
        setFormData(prev => ({
          ...prev,
          customerId: customer.customerId || customer._id,
          customerName: customer.customerName || '',
          requestedBy: customer.customerName || '',
        }));
        toast.success("Customer found!");
      } else {
        toast.error("Customer not found.");
      }
    } catch (error) {
      toast.error("Error fetching customer details.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/gold-requests', formData);
      if (response.data.success) {
        toast.success('Gold Request sent successfully!');
        setFormData(prev => ({
          ...prev,
          date: new Date().toISOString().split('T')[0],
          customerId: '',
          customerName: '',
          itemName: '',
          goldType: '',
          weight: '',
          purity: '',
          quantity: '',
          reason: '',
          requestedTo: 'Head Office',
          status: 'Pending',
          remarks: '',
          requestedBy: '',
        }));
        setSearchId('');
        fetchNextId();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving gold request');
    }
  };

  const inp = "w-full px-3 py-1.5 text-base bg-white border border-gray-300 shadow-sm rounded-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors";
  const lbl = "block text-sm font-semibold text-gray-700 mb-0.5";

  return (
    <div className="flex flex-col h-full">
      <div className="mb-3 shrink-0">
        <h2 className="text-2xl font-bold text-text-primary">Send Gold Request</h2>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-4 bg-white border border-gray-200 mb-4 flex gap-4 items-end shrink-0 shadow-sm">
          <div className="flex-1 max-w-md">
            <label className={lbl}>Search Customer</label>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={searchId} 
                onChange={e => setSearchId(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && fetchCustomer()} 
                placeholder="Enter Customer ID..." 
                className={inp} 
              />
              <button 
                type="button" 
                onClick={fetchCustomer} 
                className="px-4 py-1.5 bg-black text-white font-medium hover:bg-gray-800 flex items-center gap-2 transition-colors"
              >
                <Search size={16} /> Search
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form id="send-gold-form" onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Request Details</h3>
              <div className="grid grid-cols-3 gap-6">
                {/* Request No */}
                <div>
                  <label className={lbl}>Request No <span className="text-red-500">*</span></label>
                  <input type="text" name="requestNo" value={formData.requestNo} readOnly className={`${inp} bg-gray-100 cursor-not-allowed text-gray-500 font-bold`} />
                </div>

                {/* Date */}
                <div>
                  <label className={lbl}>Date <span className="text-red-500">*</span></label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} required className={inp} />
                </div>

                {/* Customer ID */}
                <div>
                  <label className={lbl}>Customer ID</label>
                  <input type="text" name="customerId" value={formData.customerId} onChange={handleChange} className={`${inp} bg-gray-50`} placeholder="CUST..." />
                </div>

                {/* Customer Name */}
                <div>
                  <label className={lbl}>Customer Name</label>
                  <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className={`${inp} bg-gray-50`} placeholder="Customer Name" />
                </div>

                {/* Item Name */}
                <div>
                  <label className={lbl}>Item Name <span className="text-red-500">*</span></label>
                  <input type="text" name="itemName" value={formData.itemName} onChange={handleChange} required className={inp} placeholder="e.g. Necklace, Bangle" />
                </div>

                {/* Gold Type */}
                <div>
                  <label className={lbl}>Gold Type <span className="text-red-500">*</span></label>
                  <input type="text" name="goldType" value={formData.goldType} onChange={handleChange} required className={inp} placeholder="e.g. 22K, 24K" />
                </div>

                {/* Weight */}
                <div>
                  <label className={lbl}>Weight (grams) <span className="text-red-500">*</span></label>
                  <input type="number" name="weight" value={formData.weight} onChange={handleChange} required className={inp} placeholder="Enter weight" />
                </div>

                {/* Purity */}
                <div>
                  <label className={lbl}>Purity <span className="text-red-500">*</span></label>
                  <input type="text" name="purity" value={formData.purity} onChange={handleChange} required className={inp} placeholder="e.g. 91.6%" />
                </div>

                {/* Quantity */}
                <div>
                  <label className={lbl}>Quantity <span className="text-red-500">*</span></label>
                  <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required className={inp} placeholder="Enter quantity" />
                </div>

                {/* Requested To */}
                <div>
                  <label className={lbl}>Requested To <span className="text-red-500">*</span></label>
                  <select name="requestedTo" value={formData.requestedTo} onChange={handleChange} className={inp}>
                    <option value="Head Office">Head Office</option>
                    <option value="Main Branch">Main Branch</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className={lbl}>Status <span className="text-red-500">*</span></label>
                  <select name="status" value={formData.status} onChange={handleChange} className={inp}>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Sent / Received">Sent / Received</option>
                  </select>
                </div>

                {/* Requested By */}
                <div>
                  <label className={lbl}>Requested By <span className="text-red-500">*</span></label>
                  <input type="text" name="requestedBy" value={formData.requestedBy} onChange={handleChange} required className={inp} placeholder="Enter staff name" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Additional Info</h3>
              <div className="grid grid-cols-2 gap-6">
                {/* Reason */}
                <div>
                  <label className={lbl}>Reason for Request <span className="text-red-500">*</span></label>
                  <textarea name="reason" value={formData.reason} onChange={handleChange} required rows="3" className={`${inp} resize-none`} placeholder="Enter reason..."></textarea>
                </div>
                {/* Remarks */}
                <div>
                  <label className={lbl}>Remarks</label>
                  <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows="3" className={`${inp} resize-none`} placeholder="Enter remarks..."></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 mt-6">
              <button type="button" onClick={() => setFormData({
                  requestNo: 'Loading...', date: new Date().toISOString().split('T')[0], customerId: '',
                  customerName: '', itemName: '', goldType: '', weight: '', purity: '', quantity: '',
                  requestedTo: 'Head Office', status: 'Pending', requestedBy: '', reason: '', remarks: ''
                })} className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  Clear
              </button>
              <button type="submit" form="send-gold-form" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2">
                <Send className="w-4 h-4" /> Send Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendGoldRequest;
