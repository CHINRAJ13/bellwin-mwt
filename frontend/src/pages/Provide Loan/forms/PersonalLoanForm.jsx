import React, { useState, useEffect } from 'react';
import { Save, RefreshCcw, Search } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PersonalLoanForm = ({ 
  customerData, 
  schemeData,
  searchQuery,
  setSearchQuery,
  handleSearch,
  selectedLoan,
  schemesList = [],
  schemeSearchQuery,
  handleSchemeSelect
}) => {
  const [formData, setFormData] = useState({
    // Additional Customer Details
    aadhaarNumber: '',
    panNumber: '',
    dateOfBirth: '',

    // Employment Details
    employmentType: 'Salaried',
    companyName: '',
    occupation: '',
    monthlyIncome: '',

    // Loan Details
    applicationNo: 'PL-' + Math.floor(100000 + Math.random() * 900000),
    applicationDate: new Date().toISOString().split('T')[0],
    loanAmountRequested: '',
    approvedLoanAmount: '',
    interestRate: '',
    loanTenure: '',
    emiAmount: 0,
    processingFee: '',
    netDisbursementAmount: 0,
    loanPurpose: '',

    // Bank Details
    bankName: '',
    accountNumber: '',
    ifscCode: '',

    // Guarantor Details
    guarantorName: '',
    guarantorMobile: '',
    guarantorRelationship: ''
  });

  const [documents, setDocuments] = useState({
    customerPhoto: null,
    aadhaar: null,
    panCard: null,
    salarySlip: null,
    bankStatement: null
  });

  // Hydrate State on Edit
  useEffect(() => {
    if (selectedLoan) {
      setFormData(prev => ({
        ...prev,
        ...selectedLoan
      }));
    }
  }, [selectedLoan]);

  // Auto calculate EMI and Net Disbursement
  useEffect(() => {
    const approvedAmt = parseFloat(formData.approvedLoanAmount) || 0;
    const rate = parseFloat(formData.interestRate) || 0;
    const tenure = parseInt(formData.loanTenure) || 0;
    const fee = parseFloat(formData.processingFee) || 0;

    // Simple EMI calc (P * r * (1+r)^n / ((1+r)^n - 1)) - or just simple interest for now
    let calculatedEmi = 0;
    if (approvedAmt > 0 && tenure > 0) {
      const monthlyRate = rate / 12 / 100;
      if (monthlyRate > 0) {
        calculatedEmi = (approvedAmt * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
      } else {
        calculatedEmi = approvedAmt / tenure;
      }
    }

    const netAmount = Math.max(0, approvedAmt - fee);

    setFormData(prev => ({
      ...prev,
      emiAmount: Math.round(calculatedEmi),
      netDisbursementAmount: netAmount
    }));
  }, [formData.approvedLoanAmount, formData.interestRate, formData.loanTenure, formData.processingFee]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, file) => {
    setDocuments(prev => ({ ...prev, [field]: file }));
  };

  const inp = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green bg-white";
  const lbl = "block text-sm font-medium text-gray-700 mb-1";

  const handleSubmit = async () => {
    if (!customerData || !customerData.customerId) {
      toast.error("Please search and select a customer first.");
      return;
    }

    if (customerData.status !== 'Approved' && customerData.approvalStatus !== 'Approved') {
      toast.error("Customer KYC is not approved yet. Cannot provide loan.");
      return;
    }

    toast.success("Personal Loan Form Submitted (Demo)");
    setTimeout(() => window.location.reload(), 1500);
  };

  const handleClear = () => {
    setFormData({
      ...formData,
      applicationNo: 'PL-' + Math.floor(100000 + Math.random() * 900000),
      aadhaarNumber: '', panNumber: '', dateOfBirth: '',
      companyName: '', occupation: '', monthlyIncome: '',
      loanAmountRequested: '', approvedLoanAmount: '', interestRate: '', loanTenure: '',
      processingFee: '', loanPurpose: '', bankName: '', accountNumber: '', ifscCode: '',
      guarantorName: '', guarantorMobile: '', guarantorRelationship: ''
    });
    toast.success("Form cleared!");
  };

  return (
    <div className="flex flex-col bg-gray-50/30 p-2 space-y-6 max-w-7xl mx-auto w-full pb-20">
      
      {/* Info & Loan Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
        {/* Left Column - Customer Details & Scheme Selector */}
        <div className="space-y-1 relative">
          {/* Customer Photo */}
          {customerData.photoUrl && (
            <div className="absolute right-0 top-0 w-24 h-24 border border-gray-300 rounded shadow-sm overflow-hidden">
              <img src={customerData.photoUrl} alt="Customer" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="grid grid-cols-[160px_10px_1fr] items-start mb-1 pr-28">
            <span className="text-sm text-black">Customer ID</span>
            <span className="text-sm text-black">:</span>
            <span className="text-sm text-black font-semibold">{customerData.customerId || ''}</span>
          </div>
          <div className="grid grid-cols-[160px_10px_1fr] items-start mb-1 pr-28">
            <span className="text-sm text-black">Name</span>
            <span className="text-sm text-black">:</span>
            <span className="text-sm text-black flex items-center gap-2">
              {customerData.name || ''}
              {customerData.name && (
                <span className="bg-[#5c2a3d] text-white text-[10px] px-2 py-0.5 rounded shadow-sm cursor-pointer hover:bg-[#4a1f2f]">History</span>
              )}
            </span>
          </div>
          <div className="grid grid-cols-[160px_10px_1fr] items-start mb-1 pr-28">
            <span className="text-sm text-black">Mobile No</span>
            <span className="text-sm text-black">:</span>
            <span className="text-sm text-black">{customerData.mobile || ''}</span>
          </div>
          <div className="grid grid-cols-[160px_10px_1fr] items-start mb-1 pr-28">
            <span className="text-sm text-black flex flex-wrap leading-tight">Father/Husband Name</span>
            <span className="text-sm text-black">:</span>
            <span className="text-sm text-black">{customerData.fatherName || ''}</span>
          </div>
          <div className="grid grid-cols-[160px_10px_1fr] items-start mb-6 pr-28">
            <span className="text-sm text-black mt-1">Address</span>
            <span className="text-sm text-black mt-1">:</span>
            <span className="text-sm text-black mt-1 uppercase leading-tight pr-4">{customerData.address || ''}</span>
          </div>

          <div className="grid grid-cols-[160px_10px_1fr] items-center mb-2 pt-4">
            <span className="text-sm text-black font-semibold">Select Scheme</span>
            <span className="text-sm text-black font-semibold">:</span>
            <div className="flex items-center gap-2">
              <select
                value={schemeSearchQuery || ''}
                onChange={handleSchemeSelect}
                disabled={!!selectedLoan}
                className="w-48 px-2 py-1 text-sm border border-gray-400 bg-white focus:outline-none"
              >
                <option value="">-- Select --</option>
                {schemesList.map(scheme => (
                  <option key={scheme._id} value={scheme._id}>
                    {scheme.schemeName}
                  </option>
                ))}
              </select>
              <a href="#" className="text-blue-600 text-xs font-bold underline">Scheme List</a>
            </div>
          </div>

          {/* Scheme Detail Display Block */}
          {schemeData && schemeData.schemeId && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 pl-4">
              <div className="grid grid-cols-[120px_10px_1fr] items-center">
                <span className="text-sm font-bold text-black">Interest %</span>
                <span className="text-sm font-bold text-black">:</span>
                <span className="text-sm font-bold text-black">{schemeData.interestPercent || 0}</span>
              </div>
              <div className="grid grid-cols-[120px_10px_1fr] items-center">
                <span className="text-sm font-bold text-black text-red-600">Doc Charges</span>
                <span className="text-sm font-bold text-black text-red-600">:</span>
                <span className="text-sm font-bold text-black text-red-600">₹{schemeData.documentCharges || 0}</span>
              </div>
              <div className="grid grid-cols-[120px_10px_1fr] items-center">
                <span className="text-sm font-bold text-black">Mature Months</span>
                <span className="text-sm font-bold text-black">:</span>
                <span className="text-sm font-bold text-black">{schemeData.maturePeriodMonths || 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Loan Meta & App Data */}
        <div className="space-y-2">
          <div className="flex justify-end mb-4">
            <div className="flex items-center border border-gray-400">
              <div className="px-3 py-1 border-r border-gray-400 bg-gray-100 flex items-center justify-center">
                <Search className="w-4 h-4 text-gray-500" />
              </div>
              <input 
                type="text" 
                placeholder="Search Application..." 
                className="px-2 py-1 text-sm outline-none w-48"
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center justify-end w-full max-w-sm">
              <span className="text-sm text-black font-semibold w-24">Employee</span>
              <span className="text-sm text-black mx-2">:</span>
              <select className="w-48 px-2 py-1 text-sm border border-gray-400 bg-[#e8e4f5] font-semibold focus:outline-none">
                <option>Admin</option>
              </select>
            </div>
            <div className="flex items-center justify-end w-full max-w-sm">
              <span className="text-sm text-black font-semibold w-24">App No.</span>
              <span className="text-sm text-black mx-2">:</span>
              <input 
                type="text" 
                className="w-48 px-2 py-1 text-sm border border-gray-400 bg-[#e8e4f5] font-semibold focus:outline-none text-red-600" 
                value={selectedLoan ? (selectedLoan.loanId || selectedLoan.loanNo) : formData.applicationNo} 
                readOnly 
              />
            </div>
            <div className="flex items-center justify-end w-full max-w-sm">
              <span className="text-sm text-black font-semibold w-24">Date</span>
              <span className="text-sm text-black mx-2">:</span>
              <input 
                type="date" 
                className="w-48 px-2 py-1 text-sm border border-gray-400 focus:outline-none" 
                value={selectedLoan ? new Date(selectedLoan.loanDate).toISOString().split('T')[0] : formData.applicationDate} 
                onChange={(e) => handleChange('applicationDate', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <hr className="border-t border-gray-300 my-4" />

      {/* Customer Additional Details */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Additional Customer Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={lbl}>Aadhaar Number</label>
            <input type="text" className={inp} value={formData.aadhaarNumber} onChange={(e) => handleChange('aadhaarNumber', e.target.value)} placeholder="12-digit Aadhaar" />
          </div>
          <div>
            <label className={lbl}>PAN Number</label>
            <input type="text" className={inp} value={formData.panNumber} onChange={(e) => handleChange('panNumber', e.target.value)} placeholder="ABCDE1234F" />
          </div>
          <div>
            <label className={lbl}>Date of Birth</label>
            <input type="date" className={inp} value={formData.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Employment Details */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Employment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className={lbl}>Employment Type</label>
            <select className={inp} value={formData.employmentType} onChange={(e) => handleChange('employmentType', e.target.value)}>
              <option value="Salaried">Salaried</option>
              <option value="Self Employed">Self Employed</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Company / Business Name</label>
            <input type="text" className={inp} value={formData.companyName} onChange={(e) => handleChange('companyName', e.target.value)} placeholder="Company Name" />
          </div>
          <div>
            <label className={lbl}>Occupation</label>
            <input type="text" className={inp} value={formData.occupation} onChange={(e) => handleChange('occupation', e.target.value)} placeholder="Occupation" />
          </div>
          <div>
            <label className={lbl}>Monthly Income (Rs)</label>
            <input type="number" className={inp} value={formData.monthlyIncome} onChange={(e) => handleChange('monthlyIncome', e.target.value)} placeholder="0" />
          </div>
        </div>
      </div>

      {/* Loan Details */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Loan Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className={lbl}>Application No (Auto)</label>
            <input type="text" className={`${inp} bg-gray-50`} value={formData.applicationNo} readOnly />
          </div>
          <div>
            <label className={lbl}>Application Date</label>
            <input type="date" className={inp} value={formData.applicationDate} onChange={(e) => handleChange('applicationDate', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Amount Requested</label>
            <input type="number" className={inp} value={formData.loanAmountRequested} onChange={(e) => handleChange('loanAmountRequested', e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className={lbl}>Approved Loan Amount</label>
            <input type="number" className={inp} value={formData.approvedLoanAmount} onChange={(e) => handleChange('approvedLoanAmount', e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className={lbl}>Interest Rate (%)</label>
            <input type="number" step="0.01" className={inp} value={formData.interestRate} onChange={(e) => handleChange('interestRate', e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <label className={lbl}>Loan Tenure (Months)</label>
            <input type="number" className={inp} value={formData.loanTenure} onChange={(e) => handleChange('loanTenure', e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className={lbl}>Processing Fee</label>
            <input type="number" className={inp} value={formData.processingFee} onChange={(e) => handleChange('processingFee', e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className={lbl}>Loan Purpose</label>
            <input type="text" className={inp} value={formData.loanPurpose} onChange={(e) => handleChange('loanPurpose', e.target.value)} placeholder="Purpose" />
          </div>
          <div className="md:col-span-2">
            <label className={lbl}>EMI Amount (Auto)</label>
            <input type="number" className={`${inp} bg-gray-50 font-bold text-erp-green-dark`} value={formData.emiAmount} readOnly />
          </div>
          <div className="md:col-span-2">
            <label className={lbl}>Net Disbursement Amount</label>
            <input type="number" className={`${inp} bg-gray-50 font-bold text-erp-green-dark`} value={formData.netDisbursementAmount} readOnly />
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Bank Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={lbl}>Bank Name</label>
            <input type="text" className={inp} value={formData.bankName} onChange={(e) => handleChange('bankName', e.target.value)} placeholder="Bank Name" />
          </div>
          <div>
            <label className={lbl}>Account Number</label>
            <input type="text" className={inp} value={formData.accountNumber} onChange={(e) => handleChange('accountNumber', e.target.value)} placeholder="Account No" />
          </div>
          <div>
            <label className={lbl}>IFSC Code</label>
            <input type="text" className={inp} value={formData.ifscCode} onChange={(e) => handleChange('ifscCode', e.target.value)} placeholder="IFSC Code" />
          </div>
        </div>
      </div>

      {/* Guarantor Details */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Guarantor Details (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={lbl}>Guarantor Name</label>
            <input type="text" className={inp} value={formData.guarantorName} onChange={(e) => handleChange('guarantorName', e.target.value)} placeholder="Name" />
          </div>
          <div>
            <label className={lbl}>Mobile Number</label>
            <input type="tel" className={inp} value={formData.guarantorMobile} onChange={(e) => handleChange('guarantorMobile', e.target.value)} placeholder="Mobile" />
          </div>
          <div>
            <label className={lbl}>Relationship</label>
            <input type="text" className={inp} value={formData.guarantorRelationship} onChange={(e) => handleChange('guarantorRelationship', e.target.value)} placeholder="Relationship" />
          </div>
        </div>
      </div>

      {/* Document Upload */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Document Upload</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['bankStatement'].map(doc => (
            <div key={doc} className="border p-4 rounded-md flex flex-col items-center justify-center space-y-2 bg-gray-50">
              <label className="text-sm font-medium text-gray-700 capitalize text-center h-10">
                {doc.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input type="file" className="text-xs w-full" onChange={(e) => handleFileChange(doc, e.target.files[0])} />
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button onClick={handleClear} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
          <RefreshCcw size={16} className="mr-2" /> Clear Form
        </button>
        <button onClick={handleSubmit} className="flex items-center px-6 py-2 bg-black text-white font-bold rounded-md hover:bg-gray-800">
          <Save size={16} className="mr-2" /> Submit Loan
        </button>
      </div>
    </div>
  );
};

export default PersonalLoanForm;
