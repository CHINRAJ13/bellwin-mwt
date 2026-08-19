import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';
import { Save, RefreshCcw, PhoneCall, Eye, X } from 'lucide-react';

const AddFollowup = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [viewDetails, setViewDetails] = useState(null);

  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    loanNumber: '',
    dueAmount: '',
    dueDate: '',
    followupType: 'Due Reminder',
    nextCallDate: '',
    staffName: '',
    remarks: '',
    callStatus: 'Connected',
  });

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      // Fetch all loans and filter for overdue (End Date passed or Overdue status)
      const response = await api.get('/loans');
      
      const allLoans = response.data;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdueLoans = allLoans.filter(l => {
        if (l.status === 'Closed' || l.status === 'Auctioned') return false;
        if (l.status === 'Overdue') return true;
        
        // If Active, check if loanEndDate has passed
        if (l.status === 'Active' && l.loanEndDate) {
          const endDate = new Date(l.loanEndDate);
          return endDate < today;
        }
        return false;
      });

      if (overdueLoans.length === 0) {
        // Add sample data for preview if database is empty
        overdueLoans.push({
          _id: 'sample1',
          name: 'Rajesh Kumar',
          mobileNo: '9876543210',
          loanId: 'GL2023001',
          schemeName: 'Gold Express',
          status: 'Overdue',
          loanAmount: 50000,
          remainingLoanAmount: 52500,
          loanDate: '2023-01-15T00:00:00.000Z',
          loanEndDate: '2023-07-15T00:00:00.000Z',
          articles: [
            { category: 'Bangle', qty: 2, nettWt: 15.5 },
            { category: 'Chain', qty: 1, nettWt: 10.0 }
          ]
        },
        {
          _id: 'sample2',
          name: 'Meena Iyer',
          mobileNo: '9123456780',
          loanId: 'GL2023089',
          schemeName: 'Super Saver Gold',
          status: 'Active',
          loanAmount: 120000,
          remainingLoanAmount: 125000,
          loanDate: '2023-05-10T00:00:00.000Z',
          loanEndDate: '2023-11-10T00:00:00.000Z',
          articles: [
            { category: 'Necklace', qty: 1, nettWt: 30.2 }
          ]
        });
      }

      setLoans(overdueLoans);
    } catch (error) {
      toast.error('Failed to fetch overdue loans');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (loan) => {
    setSelectedLoan(loan);
    setFormData({
      customerName: loan.name || '',
      mobileNumber: loan.mobileNo || '',
      loanNumber: loan.loanId || '',
      dueAmount: loan.remainingLoanAmount || loan.loanAmount || '',
      dueDate: loan.loanEndDate ? new Date(loan.loanEndDate).toISOString().split('T')[0] : '',
      followupType: 'Due Reminder',
      nextCallDate: '',
      staffName: '',
      remarks: '',
      callStatus: 'Connected',
    });
    setShowForm(true);
  };

  const handleView = (loan) => {
    setViewDetails(loan);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/followups', formData);
      if (response.data.success) {
        toast.success('Followup logged successfully!');
        setShowForm(false);
        // Refresh loans to ensure latest status if needed
        fetchLoans();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving followup');
    }
  };

  const handleClear = () => {
    setFormData({
      ...formData,
      followupType: 'Due Reminder',
      nextCallDate: '',
      staffName: '',
      remarks: '',
      callStatus: 'Connected',
    });
  };

  const inp = "w-full px-3 py-1.5 text-base bg-white border border-gray-300 shadow-sm rounded-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors";
  const lbl = "block text-sm font-semibold text-gray-700 mb-0.5";

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex flex-col">
      <div className="mb-3 shrink-0 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-primary">Overdue Loans Followup</h2>
        {showForm && (
          <button 
            onClick={() => setShowForm(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-none hover:bg-gray-300 font-semibold text-sm"
          >
            Back to List
          </button>
        )}
      </div>
      
      {!showForm ? (
        // --- OVERDUE LOANS LIST ---
        <div className="flex-1">
          <div className="bg-erp-card rounded-none shadow-sm overflow-x-auto border border-gray-200">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-800 text-white border-b border-gray-300">
                  <th className="p-3 font-medium">Customer Name</th>
                  <th className="p-3 font-medium">Mobile Number</th>
                  <th className="p-3 font-medium">Loan No</th>
                  <th className="p-3 font-medium">Scheme</th>
                  <th className="p-3 font-medium">Due Amount</th>
                  <th className="p-3 font-medium">Due Date</th>
                  <th className="p-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center p-4">Loading...</td>
                  </tr>
                ) : loans.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center p-4">No overdue loans found.</td>
                  </tr>
                ) : (
                  loans.map((loan) => (
                    <tr key={loan._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-gray-800">{loan.name}</td>
                      <td className="p-3 text-gray-800">{loan.mobileNo}</td>
                      <td className="p-3 text-gray-800 font-semibold">{loan.loanId}</td>
                      <td className="p-3 text-gray-800">{loan.schemeName}</td>
                      <td className="p-3 text-red-600 font-semibold">₹ {loan.remainingLoanAmount || loan.loanAmount}</td>
                      <td className="p-3 text-gray-800">{formatDate(loan.loanEndDate)}</td>
                      <td className="p-3 text-center flex justify-center gap-2">
                        <button 
                          onClick={() => handleView(loan)}
                          className="p-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleCall(loan)}
                          className="p-1.5 bg-green-50 text-green-600 border border-green-200 rounded hover:bg-green-100 flex items-center gap-1 text-sm font-semibold pr-2"
                        >
                          <PhoneCall size={16} /> Call
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // --- ADD FOLLOWUP FORM ---
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <form id="add-followup-form" onSubmit={handleSubmit} className="space-y-8 form-spiritual-bg bg-white p-6 border border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Call Verification Details</h3>
                <div className="grid grid-cols-3 gap-6">
                  {/* Customer Name */}
                  <div>
                    <label className={lbl}>Customer Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      required
                      readOnly
                      className={`${inp} bg-gray-50`}
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className={lbl}>Mobile Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      required
                      className={inp}
                    />
                  </div>

                  {/* Loan Number */}
                  <div>
                    <label className={lbl}>Loan Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="loanNumber"
                      value={formData.loanNumber}
                      onChange={handleChange}
                      required
                      readOnly
                      className={`${inp} bg-gray-50`}
                    />
                  </div>

                  {/* Due Amount */}
                  <div>
                    <label className={lbl}>Due Amount <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      name="dueAmount"
                      value={formData.dueAmount}
                      onChange={handleChange}
                      required
                      className={inp}
                    />
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className={lbl}>Due Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      required
                      className={inp}
                    />
                  </div>

                  {/* Followup Type */}
                  <div>
                    <label className={lbl}>Followup Type <span className="text-red-500">*</span></label>
                    <select
                      name="followupType"
                      value={formData.followupType}
                      onChange={handleChange}
                      className={inp}
                    >
                      <option value="Due Reminder">Due Reminder</option>
                      <option value="Interest Reminder">Interest Reminder</option>
                      <option value="Overdue Reminder">Overdue Reminder</option>
                      <option value="Auction Warning">Auction Warning</option>
                      <option value="Repledge Reminder">Repledge Reminder</option>
                    </select>
                  </div>

                  {/* Next Call Date */}
                  <div>
                    <label className={lbl}>Next Call Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      name="nextCallDate"
                      value={formData.nextCallDate}
                      onChange={handleChange}
                      required
                      className={inp}
                    />
                  </div>

                  {/* Staff Name */}
                  <div>
                    <label className={lbl}>Staff Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="staffName"
                      value={formData.staffName}
                      onChange={handleChange}
                      required
                      className={inp}
                      placeholder="Enter staff name"
                    />
                  </div>

                  {/* Call Status */}
                  <div>
                    <label className={lbl}>Call Status <span className="text-red-500">*</span></label>
                    <select
                      name="callStatus"
                      value={formData.callStatus}
                      onChange={handleChange}
                      className={inp}
                    >
                      <option value="Connected">Connected</option>
                      <option value="Not Reachable">Not Reachable</option>
                      <option value="Will Pay">Will Pay</option>
                      <option value="Call Back Later">Call Back Later</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Remarks / Customer Response */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Additional Info</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className={lbl}>Customer Response / Remarks</label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                      rows="3"
                      className={`${inp} resize-none`}
                      placeholder="Enter customer verification remarks..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="p-4 shrink-0 flex justify-end gap-3 bg-white border-t border-gray-200 mt-4">
            <button
              type="button"
              onClick={handleClear}
              className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-none hover:bg-gray-50 transition-colors flex items-center justify-center shadow-sm"
            >
              <RefreshCcw className="w-4 h-4 mr-1.5" />
              Clear
            </button>
            <button
              form="add-followup-form"
              type="submit"
              className="px-6 py-1.5 text-[15px] bg-erp-green text-white font-medium rounded-none hover:bg-green-700 transition-colors shadow-sm inline-flex items-center justify-center gap-1.5 w-auto"
            >
              <Save className="w-4 h-4 mr-1.5" />
              Save Followup
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 bg-gray-800 text-white flex justify-between items-center border-b border-gray-700 shrink-0">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Eye size={20} /> Loan Details - {viewDetails.loanId}
              </h3>
              <button onClick={() => setViewDetails(null)} className="text-gray-300 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Customer Name</p>
                  <p className="font-semibold text-gray-900">{viewDetails.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Mobile Number</p>
                  <p className="font-semibold text-gray-900">{viewDetails.mobileNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Scheme Name</p>
                  <p className="font-semibold text-gray-900">{viewDetails.schemeName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <p className={`font-semibold ${viewDetails.status === 'Overdue' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {viewDetails.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Loan Amount</p>
                  <p className="font-semibold text-gray-900">₹ {viewDetails.loanAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Due Amount (Remaining)</p>
                  <p className="font-semibold text-red-600">₹ {viewDetails.remainingLoanAmount || viewDetails.loanAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Loan Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(viewDetails.loanDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Due Date (End Date)</p>
                  <p className="font-semibold text-gray-900">{formatDate(viewDetails.loanEndDate)}</p>
                </div>
                <div className="col-span-2 mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2 font-semibold">Articles Pledged:</p>
                  {viewDetails.articles && viewDetails.articles.length > 0 ? (
                    <table className="w-full text-sm text-left border border-gray-200">
                      <thead className="bg-gray-50 text-gray-700">
                        <tr>
                          <th className="px-3 py-2 border-b">Category</th>
                          <th className="px-3 py-2 border-b">Quantity</th>
                          <th className="px-3 py-2 border-b">Net Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewDetails.articles.map((art, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="px-3 py-2">{art.category}</td>
                            <td className="px-3 py-2">{art.qty}</td>
                            <td className="px-3 py-2">{art.nettWt} g</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500 italic">No articles found.</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end shrink-0">
              <button
                onClick={() => {
                  const loanToCall = viewDetails;
                  setViewDetails(null);
                  handleCall(loanToCall);
                }}
                className="px-6 py-2 bg-erp-green text-white font-medium rounded hover:bg-green-700 flex items-center gap-2"
              >
                <PhoneCall size={18} /> Call this Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFollowup;
