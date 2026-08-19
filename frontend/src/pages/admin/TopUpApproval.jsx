import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search, FileText } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';

const TopUpApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/topups/pending');
      setRequests(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch pending top-up requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleAction = async (actionType) => {
    if (!adminRemarks && actionType !== 'Approve') {
      return toast.error('Remarks are required to reject a request.');
    }
    
    // According to spec, admin remarks are mandatory for approval too
    if (!adminRemarks && actionType === 'Approve') {
        return toast.error('Admin remarks are mandatory for approval.');
    }

    try {
      if (actionType === 'Approve') {
        await api.put(`/topups/approve/${selectedRequest.topUpId}`, { adminRemarks });
        toast.success(`Top Up Approved successfully!`);
      } else {
        await api.put(`/topups/reject/${selectedRequest.topUpId}`, { adminRemarks });
        toast.success(`Top Up Rejected successfully!`);
      }
      setSelectedRequest(null);
      setAdminRemarks('');
      fetchPendingRequests();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || `Failed to ${actionType} request`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in flex flex-col h-[calc(100vh-100px)]">
      <PageHeader 
        title="Admin Top Up Approvals" 
        subtitle="Review and approve pending top-up loan requests submitted by employees." 
        icon={CheckCircle} 
      />

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left List */}
        <div className="w-1/3 flex flex-col min-h-0 bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-gray-800">Pending Requests</h3>
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">{requests.length} Pending</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            {loading ? (
              <div className="text-center py-10 text-gray-400 text-sm">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No pending requests found.</div>
            ) : (
              requests.map(req => (
                <div 
                  key={req.topUpId} 
                  onClick={() => { setSelectedRequest(req); setAdminRemarks(''); }}
                  className={`p-4 border-b last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${selectedRequest?.topUpId === req.topUpId ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-gray-800 text-sm">{req.loanId}</span>
                    <span className="text-xs font-semibold text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{req.customerName}</div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-green-700">₹{req.topUpAmount.toLocaleString('en-IN')}</span>
                    <span className="text-gray-400">By: {req.createdBy || 'Employee'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Detail Panel */}
        <div className="w-2/3 flex flex-col min-h-0">
          {!selectedRequest ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border border-gray-100 rounded-xl bg-white shadow-sm p-6">
              <FileText className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a request to review details</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto bg-white border border-gray-100 rounded-xl shadow-sm p-6">
              
              <div className="flex justify-between items-start mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-black text-gray-800 mb-1">Top Up Approval</h2>
                  <p className="text-sm font-semibold text-gray-500">ID: {selectedRequest.topUpId} • Loan: {selectedRequest.loanId}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-500">Requested Amount</div>
                  <div className="text-3xl font-black text-green-600">₹{selectedRequest.topUpAmount.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="p-4 shadow-sm border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Customer Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-semibold">{selectedRequest.customerName}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Loan ID</span><span className="font-semibold">{selectedRequest.loanId}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Purpose</span><span className="font-semibold">{selectedRequest.purpose}</span></div>
                  </div>
                </div>
                <div className="p-4 shadow-sm border-gray-100 bg-gray-50/50">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Eligibility Calculation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Current Outstanding</span><span className="font-semibold text-orange-600">₹{selectedRequest.oldLoanAmount.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Maximum Eligible Loan</span><span className="font-semibold">₹{selectedRequest.eligibleLoanAmount.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 mt-2"><span className="font-bold text-gray-700">New Loan Amount</span><span className="font-bold text-green-700">₹{selectedRequest.newLoanAmount.toLocaleString('en-IN')}</span></div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Employee Remarks</h4>
                <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100">
                  {selectedRequest.remarks || 'No remarks provided.'}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Admin Remarks (Mandatory)</h4>
                <textarea 
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none h-24"
                  placeholder="Enter remarks for approval or rejection..."
                  value={adminRemarks}
                  onChange={e => setAdminRemarks(e.target.value)}
                />
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
                <Button 
                  variant="primary" 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white" 
                  icon={CheckCircle}
                  onClick={() => handleAction('Approve')}
                >
                  Approve Top Up
                </Button>
                <Button 
                  variant="danger" 
                  className="flex-1" 
                  icon={XCircle}
                  onClick={() => handleAction('Reject')}
                >
                  Reject Request
                </Button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopUpApproval;
