import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';
import { exportToExcel, exportTableToPDF } from '../../../utils/exportUtils';
import { FileDown } from 'lucide-react';

const CallReport = () => {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowups();
  }, []);

  const fetchFollowups = async () => {
    try {
      const response = await api.get('/followups');
      if (response.data.success) {
        setFollowups(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch call report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const handleExportExcel = () => {
    const headers = ['Call Date', 'Customer Name', 'Mobile Number', 'Loan Number', 'Followup Type', 'Staff Name', 'Status', 'Remarks', 'Next Followup Date'];
    const mapper = r => [
      r.callDate ? new Date(r.callDate).toLocaleDateString() : '',
      r.customerName || '',
      r.mobileNumber || '',
      r.loanNumber || '',
      r.followupType || '',
      r.staffName || '',
      r.callStatus || '',
      r.remarks || '',
      r.nextCallDate ? new Date(r.nextCallDate).toLocaleDateString() : ''
    ];
    exportToExcel(followups, headers, mapper, `Call_Report_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportPDF = () => {
    const headers = ['Call Date', 'Customer Name', 'Mobile Number', 'Loan Number', 'Followup Type', 'Staff Name', 'Status', 'Remarks', 'Next Followup'];
    const mapper = r => [
      r.callDate ? new Date(r.callDate).toLocaleDateString() : '',
      r.customerName || '',
      r.mobileNumber || '',
      r.loanNumber || '',
      r.followupType || '',
      r.staffName || '',
      r.callStatus || '',
      r.remarks || '',
      r.nextCallDate ? new Date(r.nextCallDate).toLocaleDateString() : ''
    ];
    exportTableToPDF('Customer Call Report', headers, followups, mapper, `Call_Report_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="p-6">
      <div className="flex flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-black">Call Report</h2>
        <div className="flex gap-3">
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-slate-700 font-semibold rounded-none hover:bg-gray-50 transition-colors text-sm">
            <FileDown size={16} /> Export Excel
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 font-semibold rounded-none hover:bg-red-100 transition-colors text-sm">
            <FileDown size={16} /> Export PDF
          </button>
        </div>
      </div>

      <div className="bg-erp-card rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-erp-dark border-b border-erp-green-dark">
              <th className="p-4 text-text-secondary font-medium">Call Date</th>
              <th className="p-4 text-text-secondary font-medium">Customer Name</th>
              <th className="p-4 text-text-secondary font-medium">Mobile Number</th>
              <th className="p-4 text-text-secondary font-medium">Loan Number</th>
              <th className="p-4 text-text-secondary font-medium">Followup Type</th>
              <th className="p-4 text-text-secondary font-medium">Staff Name</th>
              <th className="p-4 text-text-secondary font-medium">Status</th>
              <th className="p-4 text-text-secondary font-medium">Remarks</th>
              <th className="p-4 text-text-secondary font-medium">Next Followup Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center p-4 text-text-secondary">Loading...</td>
              </tr>
            ) : followups.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center p-4 text-text-secondary">No followups found.</td>
              </tr>
            ) : (
              followups.map((followup) => (
                <tr key={followup._id} className="border-b border-erp-green-dark hover:bg-erp-dark/50 transition-colors">
                  <td className="p-4 text-text-primary">{formatDate(followup.callDate)}</td>
                  <td className="p-4 text-text-primary">{followup.customerName}</td>
                  <td className="p-4 text-text-primary">{followup.mobileNumber}</td>
                  <td className="p-4 text-text-primary">{followup.loanNumber}</td>
                  <td className="p-4 text-text-primary">
                    <span className="px-2 py-1 bg-black border border-black text-white text-xs rounded-full">
                      {followup.followupType}
                    </span>
                  </td>
                  <td className="p-4 text-text-primary">{followup.staffName}</td>
                  <td className="p-4 text-text-primary">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                        followup.callStatus === 'Connected' ? 'bg-green-900/30 text-green-400 border border-green-700' :
                        followup.callStatus === 'Not Reachable' ? 'bg-red-900/30 text-red-400 border border-red-700' :
                        followup.callStatus === 'Will Pay' ? 'bg-blue-900/30 text-blue-400 border border-blue-700' :
                        'bg-yellow-900/30 text-yellow-400 border border-yellow-700'
                    }`}>
                        {followup.callStatus}
                    </span>
                  </td>
                  <td className="p-4 text-text-primary max-w-[200px] truncate" title={followup.remarks}>
                    {followup.remarks || '-'}
                  </td>
                  <td className="p-4 text-text-primary">{formatDate(followup.nextCallDate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CallReport;
