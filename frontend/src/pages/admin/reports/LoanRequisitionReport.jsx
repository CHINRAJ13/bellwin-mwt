import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Filter, Download, Eye, X, CheckCircle, Printer } from 'lucide-react';
import { exportTableToPDF, exportToExcel, handlePrint } from '../../../utils/exportUtils';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import { TD, TR } from '../../../components/ui/Table';

const LoanRequisitionReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    customerId: location.state?.customerId || '',
    borrowerName: '',
    phoneNumber: '',
    status: ''
  });
  
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/loan-requisition', { params: filters });
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching loan requisition report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.customerId, filters.borrowerName, filters.phoneNumber, filters.status]);

  useEffect(() => {
    if (data.length > 0 && location.state?.autoOpenLoanId) {
      const loan = data.find(item => item.loanId === location.state.autoOpenLoanId || item._id === location.state.autoOpenLoanId);
      if (loan && (!selectedLoan || selectedLoan._id !== loan._id)) {
        setSelectedLoan(loan);
        setIsSidePanelOpen(true);
      }
    }
  }, [data, location.state?.autoOpenLoanId, selectedLoan]);

  const handleApprove = async () => {
    if (!selectedLoan) return;
    try {
      await api.put(`/loans/status/${selectedLoan._id}`, { status: 'Approved' });
      setIsSidePanelOpen(false);
      fetchData();
      toast.success("Loan approved successfully!");
    } catch (error) {
      console.error("Error approving loan:", error);
      toast.error("Failed to approve loan.");
    }
  };

  const handleQuickApprove = async (loanId) => {
    try {
      await api.put(`/loans/status/${loanId}`, { status: 'Approved' });
      fetchData();
      toast.success("Loan approved successfully!");
    } catch (error) {
      console.error("Error approving loan:", error);
      toast.error("Failed to approve loan.");
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="Loan Application" 
        subtitle="Report of all loan applications." 
        icon={FileText} 
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Printer} onClick={handlePrint}>Print</Button>
            <Button variant="secondary" icon={Download} onClick={() => {
              const headers = [
                { label: 'Application No', key: 'loanId' },
                { label: 'Borrower', key: 'name' },
                { label: 'Phone Number', key: 'mobileNo' },
                { label: 'Loan Type', key: 'schemeName' },
                { label: 'Requested Amount', key: 'loanAmount' },
                { label: 'Status', key: 'status' }
              ];
              exportToExcel(data, headers, null, 'Loan_Applications');
            }}>Export Excel</Button>
            <Button variant="primary" icon={Download} onClick={() => {
              const headers = [
                { label: 'Application No', key: 'loanId' },
                { label: 'Borrower', key: 'name' },
                { label: 'Phone Number', key: 'mobileNo' },
                { label: 'Loan Type', key: 'schemeName' },
                { label: 'Requested Amount', key: 'loanAmount' },
                { label: 'Status', key: 'status' }
              ];
              exportTableToPDF('Loan Application', headers, data, 'Loan_Applications');
            }}>Export PDF</Button>
          </div>
        }
      />
      
      <div className="mb-6">
        <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end form-spiritual-bg">
          <Input label="Customer ID" value={filters.customerId} onChange={e => setFilters({...filters, customerId: e.target.value})} placeholder="Search by ID, Name or Phone Number..." />
          <Input label="Borrower Name" value={filters.borrowerName} onChange={e => setFilters({...filters, borrowerName: e.target.value})} placeholder="Search by ID, Name or Phone Number..." />
          <Input label="Phone Number" value={filters.phoneNumber} onChange={e => setFilters({...filters, phoneNumber: e.target.value})} placeholder="Search by ID, Name or Phone Number..." />
          <Select label="Status" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </Select>
        </form>
      </div>

      <DataTable
        headers={['Application No', 'Borrower', 'Phone Number', 'Loan Type', 'Requested Amount', 'Applied Date', 'Status', 'Action']}
        data={data}
        loading={loading}
        renderRow={(item) => (
          <TR key={item._id}>
            <TD className="font-bold text-gray-800">{item.loanId || 'N/A'}</TD>
            <TD className="font-semibold text-gray-700">{item.name}</TD>
            <TD className="text-gray-600">{item.mobileNo}</TD>
            <TD className="text-gray-600">{item.schemeName || 'N/A'}</TD>
            <TD className="font-bold text-blue-600">₹{item.loanAmount || 0}</TD>
            <TD>{item.loanDate ? new Date(item.loanDate).toLocaleDateString() : 'N/A'}</TD>
            <TD><span className={`px-2 py-1 rounded-none text-xs font-medium ${item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{item.status}</span></TD>
            <TD>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setSelectedLoan(item); setIsSidePanelOpen(true); }}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => navigate('/admin/provide-loan/edit', { state: { loanId: item.loanId || item._id } })}
                  className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                  title="Edit Loan"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </TD>
          </TR>
        )}
      />

      {/* Full Screen View for Loan Details & Approval */}
      {isSidePanelOpen && selectedLoan && (
        <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col animate-fade-in">
          {/* Header */}
          <div className="p-6 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Loan Application Details</h2>
              <p className="text-gray-500 mt-1">Review applicant and loan scheme details</p>
            </div>
            <button onClick={() => setIsSidePanelOpen(false)} className="p-2 text-gray-500 hover:text-red-500 bg-gray-100 rounded-full hover:bg-red-50 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-8 flex-1 overflow-y-auto max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Applicant Info */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-1">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4">Customer Details</h3>
                
                <div className="flex items-center gap-4 mb-6">
                  {selectedLoan.customerObjectId?.customerPhotoUrl ? (
                    <img src={selectedLoan.customerObjectId.customerPhotoUrl} alt="Customer" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center shadow-sm">
                      <span className="text-gray-400 text-xs text-center px-1">No Photo</span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800 text-xl">{selectedLoan.name}</p>
                    <p className="text-sm text-gray-500 font-medium">{selectedLoan.customerId || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex flex-col space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Father/Husband Name</p>
                    <p className="font-medium text-gray-800 text-lg">{selectedLoan.fatherHusbandName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                    <p className="font-medium text-gray-800 text-lg">{selectedLoan.mobileNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Address</p>
                    <p className="font-medium text-gray-800 text-lg">{selectedLoan.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Scheme Info */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-1">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4">Scheme Details</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Scheme Name</p>
                    <p className="font-medium text-gray-800 text-lg">{selectedLoan.schemeName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Interest Rate</p>
                    <p className="font-medium text-gray-800 text-lg">{selectedLoan.interestPercent || 0}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Mature Period</p>
                    <p className="font-medium text-gray-800 text-lg">{selectedLoan.maturePeriod || 0} Months</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Gram Rate</p>
                    <p className="font-medium text-gray-800 text-lg">₹{selectedLoan.gramRate || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Min Gram</p>
                    <p className="font-medium text-gray-800 text-lg">{selectedLoan.minimumGram || 0}g</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Doc Charges</p>
                    <p className="font-medium text-gray-800 text-lg">₹{selectedLoan.documentCharges || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Penalty</p>
                    <p className="font-medium text-gray-800 text-lg">{selectedLoan.penaltyPercent || 0}%</p>
                  </div>
                </div>
              </div>

              {/* Loan Info */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-1">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4">Loan Details</h3>
                <div className="flex flex-col space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Application No / Loan ID</p>
                    <p className="font-medium text-gray-800 text-lg">{selectedLoan.loanId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Applied Date</p>
                    <p className="font-medium text-gray-800 text-lg">{selectedLoan.loanDate ? new Date(selectedLoan.loanDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Loan Start Date</p>
                    <p className="font-medium text-gray-800 text-lg">{selectedLoan.loanStartDate ? new Date(selectedLoan.loanStartDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Current Status</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-md text-sm font-bold ${selectedLoan.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {selectedLoan.status}
                    </span>
                  </div>
                  <div className="pt-2 border-t mt-2">
                    <p className="text-sm text-gray-500 mb-1">Requested Amount</p>
                    <p className="font-bold text-blue-600 text-3xl">₹{selectedLoan.loanAmount || 0}</p>
                  </div>
                </div>
              </div>

              {/* Articles (If Any) */}
              {selectedLoan.articles && selectedLoan.articles.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-3 mt-4">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4">Articles Provided</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 bg-gray-50 uppercase">
                        <tr>
                          <th className="px-4 py-2">Category</th>
                          <th className="px-4 py-2">Details</th>
                          <th className="px-4 py-2">Qty</th>
                          <th className="px-4 py-2">Gross Wt</th>
                          <th className="px-4 py-2">Stone Wt</th>
                          <th className="px-4 py-2">Net Wt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedLoan.articles.map((art, idx) => (
                          <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-4 py-2">{art.category}</td>
                            <td className="px-4 py-2">{art.details}</td>
                            <td className="px-4 py-2">{art.qty}</td>
                            <td className="px-4 py-2">{art.totWt}g</td>
                            <td className="px-4 py-2">{art.stoneWt}g</td>
                            <td className="px-4 py-2 font-bold">{art.nettWt}g</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
            </div>
          </div>
          
          {/* Footer Actions */}
          <div className="p-6 bg-white border-t border-gray-200 flex justify-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="max-w-md w-full">
              {selectedLoan.status === 'Pending' ? (
                <button 
                  onClick={handleApprove}
                  className="w-full py-4 bg-black text-white font-bold text-lg rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <CheckCircle className="w-6 h-6" /> Approve Loan Application
                </button>
              ) : (
                <div className="w-full py-4 bg-gray-100 text-gray-500 font-bold text-lg rounded-md text-center border border-gray-200">
                  Application Already {selectedLoan.status}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default LoanRequisitionReport;
