import { useState, useEffect } from 'react';
import { CheckCircle, Search, Eye, ThumbsUp, ThumbsDown, ShieldCheck, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import DataTable from '../../../components/ui/DataTable';
import { TD, TR } from '../../../components/ui/Table';

const STORAGE_KEY = 'belwin_customers';

const KYCApproval = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const currentUsername = user.username || 'Admin';

  const [verifyData, setVerifyData] = useState({
    status: 'Approved',
    remarks: ''
  });

  // Fetch borrowers
  const fetchBorrowers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers');
      let data = res.data.customers || res.data || [];
      if (typeof data === 'string' || !Array.isArray(data)) data = [];
      setBorrowers(data);
    } catch {
      console.warn('API customer load failed, loading from LocalStorage fallback');
      const local = localStorage.getItem(STORAGE_KEY);
      setBorrowers(local ? JSON.parse(local) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const handleOpenDetail = (borrower) => {
    setSelectedBorrower(borrower);
    setVerifyData({
      status: borrower.status === 'Approved' || borrower.approvalStatus === 'Approved' ? 'Approved' : 'Approved',
      remarks: borrower.adminRemarks || ''
    });
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = async (statusVal) => {
    if (!selectedBorrower) return;
    setLoading(true);

    const docId = selectedBorrower._id || selectedBorrower.id;
    const updatePayload = {
      status: statusVal === 'Approved' ? 'Approved' : 'Rejected',
      approvalStatus: statusVal,
      remarks: verifyData.remarks,
      verifiedBy: currentUsername,
      verifiedDate: new Date().toISOString().split('T')[0]
    };

    try {
      // Attempt backend call
      if (statusVal === 'Approved') {
        await api.put(`/customers/approve/${docId}`, { remarks: verifyData.remarks });
      } else {
        await api.put(`/customers/reject/${docId}`, { remarks: verifyData.remarks });
      }
      toast.success(`Borrower status updated to ${statusVal}!`);
      setIsDetailOpen(false);
      fetchBorrowers();
    } catch {
      console.warn('API update failed, updating LocalStorage fallback');
      // LocalStorage fallback
      const local = localStorage.getItem(STORAGE_KEY);
      const list = local ? JSON.parse(local) : [];
      const updated = list.map(b => {
        const idMatch = selectedBorrower.id ? b.id === selectedBorrower.id : b._id === selectedBorrower._id;
        if (idMatch) {
          return {
            ...b,
            status: updatePayload.status,
            approvalStatus: updatePayload.approvalStatus,
            adminRemarks: updatePayload.remarks,
            approvedBy: updatePayload.verifiedBy,
            approvedDate: updatePayload.verifiedDate
          };
        }
        return b;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      toast.success(`Borrower status updated to ${statusVal} (Local Storage)!`);
      setIsDetailOpen(false);
      fetchBorrowers();
    } finally {
      setLoading(false);
    }
  };

  // Filter list
  const filteredBorrowers = borrowers.filter(b => {
    const matchesSearch =
      String(b.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      String(b.customerId || b.id || '').toLowerCase().includes(search.toLowerCase()) ||
      String(b.mobileNumber || '').includes(search);

    const mappedStatus = b.status === 'Approved' ? 'Approved' : b.status === 'Rejected' ? 'Rejected' : 'Pending';
    const matchesStatus = statusFilter === 'All' || mappedStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    if (status === 'Approved' || status === 'KYC Verified') return <Badge variant="success">Approved</Badge>;
    if (status === 'Rejected') return <Badge variant="danger">Rejected</Badge>;
    return <Badge variant="warning">Pending</Badge>;
  };

  if (isDetailOpen && selectedBorrower) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setIsDetailOpen(false)}
            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-none transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              KYC Audit: {selectedBorrower.customerName}
            </h1>
          </div>
        </div>

        <div className="p-8 shadow-lg border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Borrower metadata */}
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Borrower Profile</h4>
              <div className="p-5 rounded-none bg-gray-50 border border-gray-100 space-y-3 text-sm">
                <p><span className="text-gray-400 font-medium w-32 inline-block">Borrower ID:</span> <strong className="text-gray-800">{selectedBorrower.customerId || selectedBorrower.id}</strong></p>
                <p><span className="text-gray-400 font-medium w-32 inline-block">Full Name:</span> <strong className="text-gray-800">{selectedBorrower.customerName}</strong></p>
                <p><span className="text-gray-400 font-medium w-32 inline-block">Mobile Number:</span> <strong className="text-gray-800">{selectedBorrower.mobileNumber}</strong></p>
                <p><span className="text-gray-400 font-medium w-32 inline-block">Guardian Name:</span> <strong className="text-gray-800">{selectedBorrower.guardianName || selectedBorrower.guardian || 'N/A'}</strong></p>
                <p><span className="text-gray-400 font-medium w-32 inline-block">Aadhaar Number:</span> <strong className="text-gray-800">{selectedBorrower.aadhaarNumber || selectedBorrower.aadhaarNo || 'N/A'}</strong></p>
                <p><span className="text-gray-400 font-medium w-32 inline-block">PAN Number:</span> <strong className="text-gray-800">{selectedBorrower.panNumber || selectedBorrower.panNo || 'N/A'}</strong></p>
                <p><span className="text-gray-400 font-medium w-32 inline-block">Branch:</span> <strong className="text-gray-800">{selectedBorrower.branchName || selectedBorrower.branch || 'Head Office'}</strong></p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Verified By"
                  disabled
                  value={currentUsername}
                  icon={ShieldCheck}
                  className="bg-gray-50 font-semibold"
                />
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Review Remarks / Reason</label>
                  <textarea
                    value={verifyData.remarks}
                    onChange={(e) => setVerifyData({ ...verifyData, remarks: e.target.value })}
                    placeholder="Enter approval details or rejection reasons..."
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-none text-sm outline-none text-gray-900 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all placeholder:text-gray-400 h-28"
                  />
                </div>
              </div>
            </div>

            {/* Document Review List */}
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Uploaded Documents Preview</h4>
              <div className="space-y-4">
                
                {/* Photo preview */}
                <div className="p-4 rounded-none bg-gray-50 border border-gray-100 flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-700">Photo Attachment</span>
                  {selectedBorrower.customerPhotoUrl || selectedBorrower.photo ? (
                    <a
                      href={selectedBorrower.customerPhotoUrl || selectedBorrower.photo}
                      target="_blank"
                      rel="noreferrer"
                      className="text-green-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <Eye size={14} /> View File
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs font-medium">Not Uploaded</span>
                  )}
                </div>

                {/* Aadhaar preview */}
                <div className="p-4 rounded-none bg-gray-50 border border-gray-100 flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-700">Aadhaar Document</span>
                  {selectedBorrower.aadhaarDocumentUrl || selectedBorrower.aadhar ? (
                    <a
                      href={selectedBorrower.aadhaarDocumentUrl || selectedBorrower.aadhar}
                      target="_blank"
                      rel="noreferrer"
                      className="text-green-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <Eye size={14} /> View File
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs font-medium">Not Uploaded</span>
                  )}
                </div>

                {/* PAN preview */}
                <div className="p-4 rounded-none bg-gray-50 border border-gray-100 flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-700">PAN Document</span>
                  {selectedBorrower.panDocumentUrl || selectedBorrower.pan ? (
                    <a
                      href={selectedBorrower.panDocumentUrl || selectedBorrower.pan}
                      target="_blank"
                      rel="noreferrer"
                      className="text-green-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <Eye size={14} /> View File
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs font-medium">Not Uploaded</span>
                  )}
                </div>

                {/* Signature preview */}
                <div className="p-4 rounded-none bg-gray-50 border border-gray-100 flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-700">Signature Image</span>
                  {selectedBorrower.signatureDocumentUrl || selectedBorrower.signature ? (
                    <a
                      href={selectedBorrower.signatureDocumentUrl || selectedBorrower.signature}
                      target="_blank"
                      rel="noreferrer"
                      className="text-green-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <Eye size={14} /> View File
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs font-medium">Not Uploaded</span>
                  )}
                </div>

                {/* Address proof preview */}
                <div className="p-4 rounded-none bg-gray-50 border border-gray-100 flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-700">Address Proof Document</span>
                  {selectedBorrower.proof2DocumentUrl || selectedBorrower.addressProof ? (
                    <a
                      href={selectedBorrower.proof2DocumentUrl || selectedBorrower.addressProof}
                      target="_blank"
                      rel="noreferrer"
                      className="text-green-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <Eye size={14} /> View File
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs font-medium">Not Uploaded</span>
                  )}
                </div>

              </div>
            </div>
          </div>
          
          <div className="flex gap-4 justify-end w-full mt-8 pt-6 border-t border-gray-100">
            <Button
              onClick={() => handleUpdateStatus('Rejected')}
              variant="danger"
              icon={ThumbsDown}
              loading={loading}
              className="px-6 py-2.5"
            >
              Reject KYC
            </Button>
            <Button
              onClick={() => handleUpdateStatus('Approved')}
              variant="success"
              icon={ThumbsUp}
              loading={loading}
              className="px-8 py-2.5"
            >
              Approve KYC
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader
        title="KYC & Borrower Approval"
        subtitle="Review borrower identity documents and approve account status."
        icon={CheckCircle}
      />

      {/* Search and Filters */}
      <div className="p-4 mb-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, Name or Phone Number..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-none text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-gray-50"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            containerClassName="w-full md:max-w-xs"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Verification</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </Select>
        </div>
      </div>

      {/* Grid List Table */}
      <DataTable
        headers={[
          'Borrower ID',
          'Name',
          'Mobile',
          'Branch',
          'Aadhaar Number',
          'KYC Status',
          'Actions'
        ]}
        data={filteredBorrowers}
        loading={loading}
        renderRow={(borrower) => (
          <TR key={borrower._id || borrower.id}>
            <TD className="font-bold text-gray-800">{borrower.customerId || borrower.id}</TD>
            <TD className="font-semibold">{borrower.customerName}</TD>
            <TD>{borrower.mobileNumber}</TD>
            <TD>{borrower.branchName || borrower.branch || 'Head Office'}</TD>
            <TD className="font-mono text-xs">{borrower.aadhaarNumber || borrower.aadhaarNo || 'N/A'}</TD>
            <TD>{getStatusBadge(borrower.status)}</TD>
            <TD>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpenDetail(borrower)}
                icon={Eye}
              >
                Review
              </Button>
            </TD>
          </TR>
        )}
      />
    </div>
  );
};

export default KYCApproval;
