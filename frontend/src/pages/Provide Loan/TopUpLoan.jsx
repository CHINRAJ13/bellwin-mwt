import React, { useState } from 'react';
import { Search, Save, FileText, CheckCircle2, Clock, XCircle, RefreshCcw } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TopUpLoan = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('form'); // form | reports
  const [topUpHistory, setTopUpHistory] = useState([]);

  // Data State
  const [loanDetails, setLoanDetails] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [form, setForm] = useState({
    purpose: 'Business',
    remarks: '',
    topUpAmount: ''
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return toast.error("Please enter a Loan ID");

    setLoading(true);
    try {
      const res = await api.get(`/topups/eligible/${searchQuery.trim().toUpperCase()}`);
      setLoanDetails(res.data.loan);
      setEligibility({
        goldValue: res.data.goldValue,
        maximumEligibleLoan: res.data.maximumEligibleLoan,
        availableTopUp: res.data.availableTopUp,
        currentGoldRate: res.data.currentGoldRate
      });
      fetchHistory(res.data.loan.loanId);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to fetch loan details or loan not eligible.');
      setLoanDetails(null);
      setEligibility(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (loanId) => {
    try {
      const res = await api.get(`/topups/history?loanId=${loanId}`);
      setTopUpHistory(res.data);
    } catch (error) {
      console.error('Failed to fetch history', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!loanDetails) return;
    if (!form.topUpAmount || form.topUpAmount <= 0) return toast.error('Please enter a valid top-up amount');
    if (form.topUpAmount > eligibility.availableTopUp) return toast.error('Amount exceeds available eligibility!');

    try {
      const payload = {
        loanId: loanDetails.loanId,
        customerId: loanDetails.customerId,
        customerName: loanDetails.name,
        employeeId: loanDetails.employeeId,
        oldLoanAmount: loanDetails.loanAmount,
        eligibleLoanAmount: eligibility.maximumEligibleLoan,
        availableEligibility: eligibility.availableTopUp,
        topUpAmount: Number(form.topUpAmount),
        newLoanAmount: (loanDetails.loanAmount || 0) + Number(form.topUpAmount),
        goldRate: eligibility.currentGoldRate,
        purpose: form.purpose,
        remarks: form.remarks
      };

      await api.post('/topups/request', payload);
      toast.success('Top Up Request Submitted Successfully! Waiting for Admin Approval.');
      
      // Reset form
      setForm({ purpose: 'Business', remarks: '', topUpAmount: '' });
      fetchHistory(loanDetails.loanId);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to submit top up request');
    }
  };

  const inp  = "w-full px-3 py-1.5 text-sm bg-white border border-gray-300 shadow-sm rounded-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors";
  const lbl  = "block text-xs font-semibold text-gray-600 mb-0.5";
  const card = "bg-white border border-gray-100 rounded-none shadow-sm p-5";
  const sec  = "text-sm font-bold text-green-700 border-b border-gray-100 pb-1.5 mb-3 flex items-center gap-2";

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>
      {/* Title */}
      <div className="mb-4 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Top Up Loan</h2>
          <p className="text-xs text-gray-500 mt-0.5">Process additional loan amounts against existing pledged gold collateral.</p>
        </div>
        <div className="flex gap-2">
          {['form', 'reports'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-none transition-all ${activeTab === tab ? 'bg-green-600 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {tab === 'form' ? 'Top Up Form' : 'Reports'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'reports' ? (
        /* ── REPORTS TAB ── */
        <div className="grid grid-cols-2 gap-5 overflow-auto pb-4">
          <div className={`${card} col-span-2 overflow-x-auto`}>
            <h3 className={sec}><FileText className="w-4 h-4" /> Top Up History for Current Loan</h3>
            {topUpHistory.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No top-up history found.</p>
            ) : (
              <table className="w-full text-xs min-w-[600px]">
                <thead><tr className="bg-gray-50 text-gray-500">
                  <th className="p-2 text-left">Top Up ID</th>
                  <th className="p-2 text-right">Requested</th>
                  <th className="p-2 text-center">Status</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Approved By</th>
                </tr></thead>
                <tbody>{topUpHistory.map((t, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td className="p-2 font-medium">{t.topUpId}</td>
                    <td className="p-2 text-right font-bold text-gray-800">₹{(t.topUpAmount||0).toLocaleString('en-IN')}</td>
                    <td className="p-2 text-center">
                      <span className={`px-2 py-0.5 rounded-none text-[10px] font-bold ${t.status==='Approved'?'bg-green-100 text-green-700':t.status==='Rejected'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{t.status}</span>
                    </td>
                    <td className="p-2">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="p-2">{t.approvedBy||'—'}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        /* ── FORM TAB ── */
        <div className="flex flex-row gap-5 flex-1 overflow-hidden">
          {/* Left: Main form */}
          <div className="flex flex-col gap-4 w-[60%] overflow-auto pb-4">
            
            {/* Search */}
            <form onSubmit={handleSearch} className="relative flex gap-2 form-spiritual-bg">
              <div className="relative flex-1">
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Enter Exact Loan ID (e.g. LN000123)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-none shadow-sm text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors" />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
              <button type="submit" disabled={loading} className="bg-gray-800 text-white px-4 py-2 rounded-none text-sm font-semibold hover:bg-gray-700 transition">
                {loading ? 'Searching...' : 'Search Loan'}
              </button>
            </form>

            {!loanDetails ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-none bg-white/50 p-6 min-h-[200px]">
                <Search className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium text-center">Search for an active Loan ID to calculate eligibility.</p>
              </div>
            ) : (
              <form onSubmit={handleSave} className="flex flex-col gap-4 form-spiritual-bg">
                
                {/* Customer Details */}
                <div className={card}>
                  <h3 className={sec}><FileText className="w-4 h-4" /> Customer &amp; Loan Details</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      ['Customer Name', loanDetails.name],
                      ['Customer ID', loanDetails.customerId || '—'],
                      ['Mobile Number', loanDetails.mobileNo],
                      ['Loan Number', loanDetails.loanId],
                      ['Loan Date', new Date(loanDetails.loanStartDate).toLocaleDateString()],
                      ['Current Loan Amount', `₹${(loanDetails.loanAmount||0).toLocaleString('en-IN')}`],
                      ['Outstanding Balance', `₹${(loanDetails.remainingLoanAmount||0).toLocaleString('en-IN')}`],
                      ['Interest Rate', `${loanDetails.interestPercent || 0}%`],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <label className={lbl}>{label}</label>
                        <input className={`${inp} bg-gray-50`} value={val} readOnly />
                      </div>
                    ))}
                    <div>
                      <label className={lbl}>Loan Status</label>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-none text-xs font-bold border ${loanDetails.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {loanDetails.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gold Details & Eligibility */}
                <div className={card}>
                  <h3 className={sec}><RefreshCcw className="w-4 h-4" /> Eligibility Calculation (Backend)</h3>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className={lbl}>Gold Value</label>
                      <input className={`${inp} bg-gray-50 font-semibold`} value={`₹${(eligibility.goldValue||0).toLocaleString('en-IN')}`} readOnly />
                    </div>
                    <div>
                      <label className={lbl}>Maximum Eligible Loan</label>
                      <input className={`${inp} bg-gray-50 font-semibold`} value={`₹${(eligibility.maximumEligibleLoan||0).toLocaleString('en-IN')}`} readOnly />
                    </div>
                    <div>
                      <label className={lbl}>Current Outstanding</label>
                      <input className={`${inp} bg-orange-50 text-orange-700 font-semibold`} value={`₹${(loanDetails.remainingLoanAmount||0).toLocaleString('en-IN')}`} readOnly />
                    </div>
                    <div>
                      <label className={lbl}>Available Top Up</label>
                      <input className={`${inp} bg-green-50 text-green-700 font-bold`} value={`₹${(eligibility.availableTopUp||0).toLocaleString('en-IN')}`} readOnly />
                    </div>
                  </div>
                </div>

                {/* Top Up Form */}
                <div className={card}>
                  <h3 className={sec}><FileText className="w-4 h-4" /> Top Up Request Form</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Requested Top Up Amount <span className="text-red-500">*</span></label>
                      <input type="number" className={inp} max={eligibility.availableTopUp} value={form.topUpAmount} onChange={e => setForm(p=>({...p, topUpAmount: e.target.value}))} required placeholder="Enter amount..." />
                      <p className="text-[10px] text-gray-500 mt-1">Must be less than or equal to ₹{(eligibility.availableTopUp||0).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <label className={lbl}>Purpose <span className="text-red-500">*</span></label>
                      <select className={inp} value={form.purpose} onChange={e => setForm(p=>({...p, purpose: e.target.value}))}>
                        <option value="Business">Business</option>
                        <option value="Medical">Medical</option>
                        <option value="Education">Education</option>
                        <option value="Agriculture">Agriculture</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Personal">Personal</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className={lbl}>Employee Notes / Remarks</label>
                      <textarea className={`${inp} h-20 resize-none`} value={form.remarks} onChange={e => setForm(p=>({...p, remarks: e.target.value}))} placeholder="Any notes for Admin..." />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={eligibility.availableTopUp <= 0} className={`px-6 py-2.5 rounded-none text-sm font-bold shadow-sm transition-all flex items-center gap-2 ${eligibility.availableTopUp > 0 ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                    <Save className="w-4 h-4" /> {eligibility.availableTopUp > 0 ? 'Submit Top Up Request' : 'Not Eligible for Top Up'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right: Info / Summary */}
          <div className="w-[40%] flex flex-col gap-4 overflow-auto pb-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-none p-5 text-white shadow-md border border-gray-700 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">New Loan Estimate</h3>
                <div className="text-3xl font-black tracking-tight text-white mb-4">
                  ₹{loanDetails ? ((loanDetails.loanAmount || 0) + Number(form.topUpAmount || 0)).toLocaleString('en-IN') : '0'}
                </div>
                
                <div className="space-y-2 mt-4 pt-4 border-t border-gray-700 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Loan Amount</span>
                    <span className="font-medium text-gray-200">₹{loanDetails ? (loanDetails.loanAmount||0).toLocaleString('en-IN') : '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Requested Top Up</span>
                    <span className="font-bold text-green-400">+ ₹{Number(form.topUpAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={card}>
               <h3 className={sec}><FileText className="w-4 h-4" /> Top Up Workflow</h3>
               <ul className="text-sm text-gray-600 space-y-3 mt-3 relative">
                 <li className="flex items-start gap-3">
                   <div className="w-6 h-6 rounded-none bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0 mt-0.5">1</div>
                   <div><strong className="block text-gray-800">Search & Auto-Calculate</strong>System fetches active loan and calculates exact maximum eligible top-up from backend.</div>
                 </li>
                 <li className="flex items-start gap-3">
                   <div className="w-6 h-6 rounded-none bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0 mt-0.5">2</div>
                   <div><strong className="block text-gray-800">Submit Request</strong>Employee requests top-up amount and adds purpose/notes. Status goes to <span className="text-yellow-600 font-semibold">Pending Approval</span>.</div>
                 </li>
                 <li className="flex items-start gap-3">
                   <div className="w-6 h-6 rounded-none bg-green-100 text-green-700 flex items-center justify-center font-bold shrink-0 mt-0.5">3</div>
                   <div><strong className="block text-gray-800">Admin Approval</strong>Admin reviews and approves. Loan amount is permanently updated.</div>
                 </li>
               </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopUpLoan;
