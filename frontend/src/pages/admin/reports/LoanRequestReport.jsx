import React, { useState, useEffect } from 'react';
import { FileText, Filter, Download, Eye, X, CheckCircle, XCircle, Printer } from 'lucide-react';
import { exportTableToPDF, exportToExcel, handlePrint } from '../../../utils/exportUtils';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import { TD, TR } from '../../../components/ui/Table';

const LoanRequestReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    customerId: '',
    customerName: '',
    status: ''
  });
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/gold-requests', { params: filters });
      if (response.data && response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching agent loan requests:", error);
      toast.error("Failed to fetch loan requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.customerId, filters.customerName, filters.status]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const remarks = prompt(`Enter optional remarks for ${status.toLowerCase()}:`);
      if (remarks === null) return; // User cancelled

      const response = await api.put(`/gold-requests/status/${id}`, { status, remarks });
      if (response.data && response.data.success) {
        toast.success(`Request ${status.toLowerCase()} successfully!`);
        setIsSidePanelOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error(`Error updating request status to ${status}:`, error);
      toast.error(`Failed to update status to ${status}.`);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="Loan Request Report" 
        subtitle="Report of all loan requests submitted via agent app." 
        icon={FileText} 
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Printer} onClick={handlePrint}>Print</Button>
            <Button variant="secondary" icon={Download} onClick={() => {
              const headers = [
                { label: 'Request No', key: 'requestNo' },
                { label: 'Customer ID', key: 'customerId' },
                { label: 'Customer Name', key: 'customerName' },
                { label: 'Item Name', key: 'itemName' },
                { label: 'Gold Type', key: 'goldType' },
                { label: 'Weight (g)', key: 'weight' },
                { label: 'Purity', key: 'purity' },
                { label: 'Quantity', key: 'quantity' },
                { label: 'Status', key: 'status' }
              ];
              exportToExcel(data, headers, null, 'Agent_Loan_Requests');
            }}>Export Excel</Button>
            <Button variant="primary" icon={Download} onClick={() => {
              const headers = [
                { label: 'Request No', key: 'requestNo' },
                { label: 'Customer ID', key: 'customerId' },
                { label: 'Customer Name', key: 'customerName' },
                { label: 'Item Name', key: 'itemName' },
                { label: 'Gold Type', key: 'goldType' },
                { label: 'Weight (g)', key: 'weight' },
                { label: 'Purity', key: 'purity' },
                { label: 'Quantity', key: 'quantity' },
                { label: 'Status', key: 'status' }
              ];
              exportTableToPDF('Agent Loan Requests Report', headers, data, 'Agent_Loan_Requests');
            }}>Export PDF</Button>
          </div>
        }
      />
      
      <div className="mb-6">
        <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end form-spiritual-bg">
          <Input label="Customer ID" value={filters.customerId} onChange={e => setFilters({...filters, customerId: e.target.value})} placeholder="Search by Customer ID..." />
          <Input label="Customer Name" value={filters.customerName} onChange={e => setFilters({...filters, customerName: e.target.value})} placeholder="Search by Customer Name..." />
          <Select label="Status" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </Select>
        </form>
      </div>

      <DataTable
        headers={['Request No', 'Date', 'Customer ID', 'Customer Name', 'Item Name', 'Weight', 'Purity', 'Qty', 'Status', 'Action']}
        data={data}
        loading={loading}
        renderRow={(item) => (
          <TR key={item._id}>
            <TD className="font-bold text-gray-850">{item.requestNo || 'N/A'}</TD>
            <TD>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</TD>
            <TD className="font-semibold text-gray-600">{item.customerId || 'N/A'}</TD>
            <TD className="font-semibold text-gray-800">{item.customerName || 'N/A'}</TD>
            <TD className="text-gray-650">{item.itemName || 'N/A'}</TD>
            <TD className="font-semibold text-gray-700">{item.weight ? `${item.weight}g` : 'N/A'}</TD>
            <TD className="text-gray-650">{item.purity || 'N/A'}</TD>
            <TD className="text-gray-650">{item.quantity || 'N/A'}</TD>
            <TD>
              <span className={`px-2 py-0.5 rounded-none text-xs font-semibold ${
                item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                item.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {item.status}
              </span>
            </TD>
            <TD>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setSelectedRequest(item); setIsSidePanelOpen(true); }}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {item.status === 'Pending' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(item._id, 'Approved')}
                      className="p-1.5 bg-green-150 hover:bg-green-200 text-green-800 rounded-md transition-colors"
                      title="Approve"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(item._id, 'Rejected')}
                      className="p-1.5 bg-red-150 hover:bg-red-200 text-red-800 rounded-md transition-colors"
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </TD>
          </TR>
        )}
      />

      {/* Side panel for details */}
      {isSidePanelOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="w-full max-w-lg bg-white h-full flex flex-col p-6 shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Request Details</h3>
                <p className="text-sm text-gray-500 font-mono mt-0.5">{selectedRequest.requestNo}</p>
              </div>
              <button 
                onClick={() => setIsSidePanelOpen(false)} 
                className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6">
              <div className="bg-slate-50 p-4 border border-slate-200">
                <h4 className="font-bold text-gray-700 text-sm mb-3">Applicant Info</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">Name:</span>
                    <span className="font-bold text-gray-850">{selectedRequest.customerName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Customer ID:</span>
                    <span className="font-bold text-gray-850">{selectedRequest.customerId || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 border border-slate-200">
                <h4 className="font-bold text-gray-700 text-sm mb-3">Gold Item Info</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">Item Name:</span>
                    <span className="font-bold text-gray-850">{selectedRequest.itemName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Gold Type:</span>
                    <span className="font-bold text-gray-850">{selectedRequest.goldType || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Weight (g):</span>
                    <span className="font-bold text-gray-850">{selectedRequest.weight || 'N/A'}g</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Purity:</span>
                    <span className="font-bold text-gray-850">{selectedRequest.purity || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Quantity:</span>
                    <span className="font-bold text-gray-850">{selectedRequest.quantity || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Requested To:</span>
                    <span className="font-bold text-gray-850">{selectedRequest.requestedTo || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 border border-slate-200">
                <h4 className="font-bold text-gray-700 text-sm mb-3">Submission Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">Requested Date:</span>
                    <span className="font-bold text-gray-850">{new Date(selectedRequest.date).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Requested By / Agent:</span>
                    <span className="font-bold text-gray-850">{selectedRequest.requestedBy || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {selectedRequest.reason && (
                <div className="bg-slate-50 p-4 border border-slate-200">
                  <h4 className="font-bold text-gray-700 text-sm mb-2">Reason / Description</h4>
                  <p className="text-sm text-gray-650 italic leading-relaxed">"{selectedRequest.reason}"</p>
                </div>
              )}

              <div className="bg-slate-50 p-4 border border-slate-200">
                <h4 className="font-bold text-gray-700 text-sm mb-2">Status / Remarks</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Current Status:</span>
                    <span className={`px-2 py-0.5 text-xs font-semibold ${
                      selectedRequest.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedRequest.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>{selectedRequest.status}</span>
                  </div>
                  {selectedRequest.remarks && (
                    <div className="text-sm pt-2 border-t border-slate-200">
                      <span className="text-gray-500 block mb-1">Remarks:</span>
                      <span className="font-medium text-gray-800">{selectedRequest.remarks}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedRequest.status === 'Pending' && (
              <div className="border-t pt-4 mt-6 grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleUpdateStatus(selectedRequest._id, 'Approved')}
                  className="py-2.5 bg-green-700 text-white font-semibold text-sm rounded-none hover:bg-green-800 transition-colors shadow-sm"
                >
                  Approve Request
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedRequest._id, 'Rejected')}
                  className="py-2.5 bg-red-700 text-white font-semibold text-sm rounded-none hover:bg-red-800 transition-colors shadow-sm"
                >
                  Reject Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanRequestReport;
