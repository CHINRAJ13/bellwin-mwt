import React, { useState } from 'react';
import { Save, Search, RefreshCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

const LoanRequestForm = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customerData, setCustomerData] = useState(null);
  
  const [formData, setFormData] = useState({
    loanType: 'Gold Loan',
    requestedAmount: '',
    reason: '',
    remarks: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/customers/search?search=${searchQuery}`);
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        const customer = response.data.data[0];
        
        if (customer.status !== 'Approved' && customer.approvalStatus !== 'Approved') {
          toast.error("Customer is not approved by admin");
          setCustomerData(null);
          return;
        }

        const fullAddress = [
          customer.doorStreet,
          customer.area,
          customer.city,
          customer.district,
          customer.state,
          customer.postalCode
        ].filter(Boolean).join(', ');

        setCustomerData({
          _id: customer._id,
          customerId: customer.customerId || '',
          customerName: customer.customerName || '',
          mobileNumber: customer.mobileNumber || '',
          address: fullAddress || '',
          photoUrl: customer.customerPhotoUrl || ''
        });
        toast.success("Customer details loaded!");
      } else {
        toast.error("Customer not found");
        setCustomerData(null);
      }
    } catch (error) {
      console.error("Error searching customer:", error);
      toast.error("Error searching customer");
      setCustomerData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setCustomerData(null);
    setFormData({
      loanType: 'Gold Loan',
      requestedAmount: '',
      reason: '',
      remarks: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerData) {
      toast.error("Please search and select a customer first.");
      return;
    }
    if (!formData.requestedAmount || parseFloat(formData.requestedAmount) <= 0) {
      toast.error("Please enter a valid requested amount.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        customerId: customerData.customerId,
        customerName: customerData.customerName,
        mobileNo: customerData.mobileNumber,
        loanType: formData.loanType,
        requestedAmount: parseFloat(formData.requestedAmount),
        reason: formData.reason,
        remarks: formData.remarks
      };

      await api.post('/loan-requests', payload);
      toast.success("Loan Request submitted successfully!");
      handleReset();
    } catch (error) {
      console.error("Error submitting loan request:", error);
      toast.error(error.response?.data?.message || "Failed to submit loan request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <PageHeader 
        title="Loan Request Form" 
        subtitle="Submit a loan request before creating the actual loan entry."
      />

      <div className="grid grid-cols-1 gap-6 mt-6">
        {/* Customer Search Section */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm rounded-none">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4">Select Customer</h3>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search Customer by ID, Name or Mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none rounded-none"
              />
            </div>
            <Button variant="primary" onClick={handleSearch} disabled={loading} icon={Search}>Search</Button>
            <Button variant="secondary" onClick={handleReset} icon={RefreshCcw}>Reset</Button>
          </div>

          {customerData && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-4 border border-gray-150">
              <div className="flex items-center gap-4 md:col-span-2">
                {customerData.photoUrl ? (
                  <img src={customerData.photoUrl} alt="Customer" className="w-16 h-16 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No Pic</span>
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-gray-800 text-base">{customerData.customerName}</h4>
                  <p className="text-sm text-gray-500">{customerData.customerId}</p>
                  <p className="text-sm text-gray-500">Mobile: {customerData.mobileNumber}</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-bold block text-gray-700">Address:</span>
                {customerData.address || 'N/A'}
              </div>
            </div>
          )}
        </div>

        {/* Loan Request Form */}
        {customerData && (
          <form onSubmit={handleSubmit} className="bg-white p-6 border border-gray-200 shadow-sm rounded-none space-y-6">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4 text-green-700">Request Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select 
                label="Loan Type" 
                required
                value={formData.loanType} 
                onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
              >
                <option value="Gold Loan">Gold Loan</option>
                <option value="Personal Loan">Personal Loan</option>
                <option value="Chit Fund">Chit Fund</option>
                <option value="Micro Finance">Micro Finance</option>
                <option value="Vehicle Loan">Vehicle Loan</option>
              </Select>

              <Input 
                label="Requested Amount (₹)" 
                type="number" 
                required 
                placeholder="e.g. 50000"
                value={formData.requestedAmount}
                onChange={(e) => setFormData({ ...formData, requestedAmount: e.target.value })}
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for Loan</label>
                <textarea
                  className="w-full border border-gray-300 p-2 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none rounded-none"
                  rows="3"
                  placeholder="Describe the reason for requesting this loan..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Remarks</label>
                <textarea
                  className="w-full border border-gray-300 p-2 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none rounded-none"
                  rows="2"
                  placeholder="Any additional remarks..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <Button type="submit" variant="primary" disabled={loading} icon={Save}>
                Submit Request
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoanRequestForm;
