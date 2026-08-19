import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FileDown, Banknote, Coins } from 'lucide-react';
import { exportToExcel, exportTableToPDF } from '../../../utils/exportUtils';
import api from '../../../services/api';

const RemittanceHistory = () => {
  const [remittances, setRemittances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cash'); // 'cash' or 'gold'

  useEffect(() => {
    fetchRemittances();
  }, []);

  const fetchRemittances = async () => {
    try {
      const response = await api.get('/remittances');
      if (response.data.success) {
        setRemittances(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch remittance history');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const cashRemittances = remittances.filter(r => r.remittanceType === 'Cash Remittance' || !r.remittanceType || r.remittanceType === 'Branch To Head Office' || r.remittanceType === 'Head Office To Branch');
  const goldRemittances = remittances.filter(r => r.remittanceType === 'Gold Remittance');

  const handleExportExcel = () => {
    const isCash = activeTab === 'cash';
    const dataToExport = isCash ? cashRemittances : goldRemittances;
    
    let headers, mapper;
    
    if (isCash) {
       headers = ['Date', 'Remittance No', 'Type', 'From', 'To', 'Requested By', 'Amount', 'Mode', 'Ref No', 'Status'];
       mapper = r => [
         formatDate(r.date),
         r.remittanceNo || '',
         r.remittanceType || 'Cash Remittance',
         r.fromBranch || r.fromPerson || '',
         r.toBranch || r.toPerson || '',
         r.requestedBy || r.enteredBy || '',
         r.amount || 0,
         r.paymentMode || '',
         r.referenceNo || '',
         r.status || ''
       ];
    } else {
       headers = ['Date', 'Remittance No', 'From', 'To', 'Sent By', 'Ornament', 'Purity', 'Net Wt(g)', 'Value(₹)', 'Checked By', 'Status'];
       mapper = r => [
         formatDate(r.date),
         r.remittanceNo || '',
         r.fromBranch || '',
         r.toBranch || '',
         r.requestedBy || '',
         r.ornamentName || '',
         r.purity || '',
         r.netWeight || 0,
         r.goldValue || 0,
         r.goldCheckedBy || '',
         r.status || ''
       ];
    }
    
    exportToExcel(dataToExport, headers, mapper, `${isCash ? 'Cash' : 'Gold'}_Remittance_History_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportPDF = () => {
    const isCash = activeTab === 'cash';
    const dataToExport = isCash ? cashRemittances : goldRemittances;
    
    let headers, mapper;
    
    if (isCash) {
       headers = ['Date', 'Remittance No', 'From', 'To', 'Amount', 'Mode', 'Status'];
       mapper = r => [
         formatDate(r.date),
         r.remittanceNo || '',
         r.fromBranch || r.fromPerson || '',
         r.toBranch || r.toPerson || '',
         r.amount || 0,
         r.paymentMode || '',
         r.status || ''
       ];
    } else {
       headers = ['Date', 'Remittance No', 'From', 'To', 'Ornament', 'Net Wt', 'Value', 'Status'];
       mapper = r => [
         formatDate(r.date),
         r.remittanceNo || '',
         r.fromBranch || '',
         r.toBranch || '',
         r.ornamentName || '',
         r.netWeight || 0,
         r.goldValue || 0,
         r.status || ''
       ];
    }
    
    exportTableToPDF(`${isCash ? 'Cash' : 'Gold'} Remittance History`, headers, dataToExport, mapper, `${isCash ? 'Cash' : 'Gold'}_Remittance_History_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="p-6 h-full flex flex-col bg-gray-50/30">
      <div className="flex justify-between items-center mb-6 shrink-0 border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Remittance History</h2>
        
        <div className="flex gap-4 items-center">
          <div className="flex bg-white shadow-sm border border-gray-200 p-1">
            <button onClick={() => setActiveTab('cash')} className={`px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'cash' ? 'bg-erp-green text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Banknote size={16} /> Cash Remittances
            </button>
            <button onClick={() => setActiveTab('gold')} className={`px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'gold' ? 'bg-yellow-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Coins size={16} /> Gold Remittances
            </button>
          </div>
          
          <div className="flex gap-2 ml-4">
            <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-slate-700 font-semibold hover:bg-gray-50 transition-colors text-sm">
              <FileDown size={16} /> Excel
            </button>
            <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 font-semibold hover:bg-red-100 transition-colors text-sm">
              <FileDown size={16} /> PDF
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="p-3 text-gray-700 font-bold text-sm">Date</th>
              <th className="p-3 text-gray-700 font-bold text-sm">Remittance No</th>
              <th className="p-3 text-gray-700 font-bold text-sm">From</th>
              <th className="p-3 text-gray-700 font-bold text-sm">To</th>
              
              {activeTab === 'cash' ? (
                <>
                  <th className="p-3 text-gray-700 font-bold text-sm">Requested By</th>
                  <th className="p-3 text-gray-700 font-bold text-sm">Amount</th>
                  <th className="p-3 text-gray-700 font-bold text-sm">Mode</th>
                  <th className="p-3 text-gray-700 font-bold text-sm">Ref No</th>
                </>
              ) : (
                <>
                  <th className="p-3 text-gray-700 font-bold text-sm">Sent By</th>
                  <th className="p-3 text-gray-700 font-bold text-sm">Ornament</th>
                  <th className="p-3 text-gray-700 font-bold text-sm">Net Wt</th>
                  <th className="p-3 text-gray-700 font-bold text-sm">Value</th>
                  <th className="p-3 text-gray-700 font-bold text-sm">Checked By</th>
                </>
              )}
              <th className="p-3 text-gray-700 font-bold text-sm">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="12" className="text-center p-6 text-gray-500">Loading data...</td>
              </tr>
            ) : (activeTab === 'cash' ? cashRemittances : goldRemittances).length === 0 ? (
              <tr>
                <td colSpan="12" className="text-center p-6 text-gray-500 border-t border-gray-100">No records found for {activeTab === 'cash' ? 'Cash' : 'Gold'} Remittance.</td>
              </tr>
            ) : (
              (activeTab === 'cash' ? cashRemittances : goldRemittances).map((rem) => (
                <tr key={rem._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-gray-800 text-sm">{formatDate(rem.date)}</td>
                  <td className="p-3 font-semibold text-gray-800 text-sm">{rem.remittanceNo}</td>
                  <td className="p-3 text-gray-800 text-sm">{rem.fromBranch || rem.fromPerson || '-'}</td>
                  <td className="p-3 text-gray-800 text-sm">{rem.toBranch || rem.toPerson || '-'}</td>
                  
                  {activeTab === 'cash' ? (
                    <>
                      <td className="p-3 text-gray-800 text-sm">{rem.requestedBy || rem.enteredBy || '-'}</td>
                      <td className="p-3 font-bold text-green-600 text-sm">₹{(rem.amount || 0).toLocaleString()}</td>
                      <td className="p-3 text-gray-800 text-sm">{rem.paymentMode || '-'}</td>
                      <td className="p-3 text-gray-800 text-sm">{rem.referenceNo || '-'}</td>
                    </>
                  ) : (
                    <>
                      <td className="p-3 text-gray-800 text-sm">{rem.requestedBy || '-'}</td>
                      <td className="p-3 text-gray-800 text-sm">
                         <div>{rem.ornamentName || '-'}</div>
                         <div className="text-xs text-gray-500">{rem.purity || '-'} • Qty: {rem.quantity || 0}</div>
                      </td>
                      <td className="p-3 font-bold text-gray-800 text-sm">{(rem.netWeight || 0).toFixed(2)} g</td>
                      <td className="p-3 font-bold text-yellow-600 text-sm">₹{(rem.goldValue || 0).toLocaleString()}</td>
                      <td className="p-3 text-gray-800 text-sm">{rem.goldCheckedBy || '-'}</td>
                    </>
                  )}
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full border ${
                        rem.status === 'Completed' || rem.status === 'Received' ? 'bg-green-50 text-green-700 border-green-200' :
                        rem.status === 'Sent' || rem.status === 'Approved' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                        {rem.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RemittanceHistory;
