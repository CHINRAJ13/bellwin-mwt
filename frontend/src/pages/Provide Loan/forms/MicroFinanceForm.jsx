import React, { useState, useEffect } from 'react';
import { Save, RefreshCcw, Search, Users, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';

const MicroFinanceForm = ({ 
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
  const [activeTab, setActiveTab] = useState('single'); // 'single' or 'group'

  // Single Person Form Data
  const [singleFormData, setSingleFormData] = useState({
    applicationNo: 'MFI-S-' + Math.floor(100000 + Math.random() * 900000),
    applicationDate: new Date().toISOString().split('T')[0],
    loanAmountRequested: '',
    approvedLoanAmount: '',
    interestRate: '',
    loanTenure: '',
    emiAmount: 0,
    processingFee: '',
    netDisbursementAmount: 0,
    loanPurpose: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    guarantorName: '',
    guarantorMobile: '',
    guarantorRelationship: ''
  });

  // Group Form Data
  const [groupFormData, setGroupFormData] = useState({
    applicationNo: 'MFI-G-' + Math.floor(100000 + Math.random() * 900000),
    applicationDate: new Date().toISOString().split('T')[0],
    selectedGroup: '',
    loanAmountRequested: '',
    approvedLoanAmount: '',
    interestRate: '',
    loanTenure: '',
    emiAmount: 0,
    processingFee: '',
    netDisbursementAmount: 0,
    loanPurpose: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  });

  const [mockGroups] = useState([
    { id: 'MFG001', name: 'Rose Group' },
    { id: 'MFG002', name: 'Lotus Group' },
    { id: 'MFG003', name: 'Jasmine Group' },
  ]);

  // Auto calculate EMI and Net Disbursement for Single
  useEffect(() => {
    const approvedAmt = parseFloat(singleFormData.approvedLoanAmount) || 0;
    const rate = parseFloat(singleFormData.interestRate) || 0;
    const tenure = parseInt(singleFormData.loanTenure) || 0;
    const fee = parseFloat(singleFormData.processingFee) || 0;

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

    setSingleFormData(prev => ({
      ...prev,
      emiAmount: Math.round(calculatedEmi),
      netDisbursementAmount: netAmount
    }));
  }, [singleFormData.approvedLoanAmount, singleFormData.interestRate, singleFormData.loanTenure, singleFormData.processingFee]);

  // Auto calculate EMI and Net Disbursement for Group
  useEffect(() => {
    const approvedAmt = parseFloat(groupFormData.approvedLoanAmount) || 0;
    const rate = parseFloat(groupFormData.interestRate) || 0;
    const tenure = parseInt(groupFormData.loanTenure) || 0;
    const fee = parseFloat(groupFormData.processingFee) || 0;

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

    setGroupFormData(prev => ({
      ...prev,
      emiAmount: Math.round(calculatedEmi),
      netDisbursementAmount: netAmount
    }));
  }, [groupFormData.approvedLoanAmount, groupFormData.interestRate, groupFormData.loanTenure, groupFormData.processingFee]);

  const handleSingleChange = (field, value) => {
    setSingleFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGroupChange = (field, value) => {
    setGroupFormData(prev => ({ ...prev, [field]: value }));
  };

  const inp = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green bg-white";
  const lbl = "block text-sm font-medium text-gray-700 mb-1";

  const handleSingleSubmit = async () => {
    if (!customerData || !customerData.customerId) {
      toast.error("Please search and select a customer first.");
      return;
    }
    if (customerData.status !== 'Approved' && customerData.approvalStatus !== 'Approved') {
      toast.error("Customer KYC is not approved yet. Cannot provide loan.");
      return;
    }

    try {
      const payload = {
        loanType: 'single',
        customerId: customerData.customerId,
        customerName: customerData.name,
        customerMobile: customerData.mobile,
        customerAddress: customerData.address,
        schemeId: schemeData?.schemeId,
        ...singleFormData,
        employee: 'Admin'
      };

      const res = await api.post('/mfi-loans', payload);
      if (res.data.success) {
        toast.success(res.data.message || "Single Person MFI Loan Application Submitted");
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to submit loan application");
    }
  };

  const handleGroupSubmit = async () => {
    if (!groupFormData.selectedGroup) {
      toast.error("Please select a group first.");
      return;
    }
    
    try {
      const payload = {
        loanType: 'group',
        groupId: groupFormData.selectedGroup,
        schemeId: schemeData?.schemeId,
        ...groupFormData,
        employee: 'Admin'
      };

      const res = await api.post('/mfi-loans', payload);
      if (res.data.success) {
        toast.success(res.data.message || "Group MFI Loan Application Submitted");
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to submit loan application");
    }
  };

  const handleClear = () => {
    if (activeTab === 'single') {
      setSingleFormData({
        ...singleFormData,
        applicationNo: 'MFI-S-' + Math.floor(100000 + Math.random() * 900000),
        loanAmountRequested: '', approvedLoanAmount: '', interestRate: '', loanTenure: '',
        processingFee: '', loanPurpose: '', bankName: '', accountNumber: '', ifscCode: '',
        guarantorName: '', guarantorMobile: '', guarantorRelationship: ''
      });
    } else {
      setGroupFormData({
        ...groupFormData,
        applicationNo: 'MFI-G-' + Math.floor(100000 + Math.random() * 900000),
        selectedGroup: '', loanAmountRequested: '', approvedLoanAmount: '', interestRate: '', 
        loanTenure: '', processingFee: '', loanPurpose: '', bankName: '', accountNumber: '', ifscCode: ''
      });
    }
    toast.success("Form cleared!");
  };

  return (
    <div className="flex flex-col bg-gray-50/30 space-y-6 max-w-7xl mx-auto w-full pb-20">
      
      {/* Tabs */}
      <div className="flex border-b border-gray-300">
        <button
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors ${activeTab === 'single' ? 'bg-white border-t border-l border-r border-gray-300 text-erp-green rounded-t-md -mb-px' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          onClick={() => setActiveTab('single')}
        >
          <User size={18} />
          Single Person Apply
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors ${activeTab === 'group' ? 'bg-white border-t border-l border-r border-gray-300 text-erp-green rounded-t-md -mb-px' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          onClick={() => setActiveTab('group')}
        >
          <Users size={18} />
          Group Apply
        </button>
      </div>

      <div className="p-4 bg-white border border-t-0 border-gray-300 shadow-sm rounded-b-md">
        
        {/* ======================= SINGLE PERSON APPLY ======================= */}
        {activeTab === 'single' && (
          <div className="space-y-6 animate-fade-in">
            {/* Info & Loan Block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {/* Left Column - Customer Details & Scheme Selector */}
              <div className="space-y-1 relative">
                {/* Customer Photo */}
                {customerData?.photoUrl && (
                  <div className="absolute right-0 top-0 w-24 h-24 border border-gray-300 rounded shadow-sm overflow-hidden">
                    <img src={customerData.photoUrl} alt="Customer" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="grid grid-cols-[160px_10px_1fr] items-start mb-1 pr-28">
                  <span className="text-sm text-black">Customer ID</span>
                  <span className="text-sm text-black">:</span>
                  <span className="text-sm text-black font-semibold">{customerData?.customerId || ''}</span>
                </div>
                <div className="grid grid-cols-[160px_10px_1fr] items-start mb-1 pr-28">
                  <span className="text-sm text-black">Name</span>
                  <span className="text-sm text-black">:</span>
                  <span className="text-sm text-black flex items-center gap-2">
                    {customerData?.name || ''}
                  </span>
                </div>
                <div className="grid grid-cols-[160px_10px_1fr] items-start mb-1 pr-28">
                  <span className="text-sm text-black">Mobile No</span>
                  <span className="text-sm text-black">:</span>
                  <span className="text-sm text-black">{customerData?.mobile || ''}</span>
                </div>
                <div className="grid grid-cols-[160px_10px_1fr] items-start mb-1 pr-28">
                  <span className="text-sm text-black flex flex-wrap leading-tight">Father/Husband Name</span>
                  <span className="text-sm text-black">:</span>
                  <span className="text-sm text-black">{customerData?.fatherName || ''}</span>
                </div>
                <div className="grid grid-cols-[160px_10px_1fr] items-start mb-6 pr-28">
                  <span className="text-sm text-black mt-1">Address</span>
                  <span className="text-sm text-black mt-1">:</span>
                  <span className="text-sm text-black mt-1 uppercase leading-tight pr-4">{customerData?.address || ''}</span>
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
                      value={singleFormData.applicationNo} 
                      readOnly 
                    />
                  </div>
                  <div className="flex items-center justify-end w-full max-w-sm">
                    <span className="text-sm text-black font-semibold w-24">Date</span>
                    <span className="text-sm text-black mx-2">:</span>
                    <input 
                      type="date" 
                      className="w-48 px-2 py-1 text-sm border border-gray-400 focus:outline-none" 
                      value={singleFormData.applicationDate} 
                      onChange={(e) => handleSingleChange('applicationDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-t border-gray-300 my-4" />

            {/* Loan Details */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Loan Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className={lbl}>Amount Requested</label>
                  <input type="number" className={inp} value={singleFormData.loanAmountRequested} onChange={(e) => handleSingleChange('loanAmountRequested', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className={lbl}>Approved Loan Amount</label>
                  <input type="number" className={inp} value={singleFormData.approvedLoanAmount} onChange={(e) => handleSingleChange('approvedLoanAmount', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className={lbl}>Interest Rate (%)</label>
                  <input type="number" step="0.01" className={inp} value={singleFormData.interestRate} onChange={(e) => handleSingleChange('interestRate', e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <label className={lbl}>Loan Tenure (Months)</label>
                  <input type="number" className={inp} value={singleFormData.loanTenure} onChange={(e) => handleSingleChange('loanTenure', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className={lbl}>Processing Fee</label>
                  <input type="number" className={inp} value={singleFormData.processingFee} onChange={(e) => handleSingleChange('processingFee', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className={lbl}>Loan Purpose</label>
                  <input type="text" className={inp} value={singleFormData.loanPurpose} onChange={(e) => handleSingleChange('loanPurpose', e.target.value)} placeholder="Purpose" />
                </div>
                <div>
                  <label className={lbl}>EMI Amount (Auto)</label>
                  <input type="number" className={`${inp} bg-gray-50 font-bold text-erp-green-dark`} value={singleFormData.emiAmount} readOnly />
                </div>
                <div>
                  <label className={lbl}>Net Disbursement Amount</label>
                  <input type="number" className={`${inp} bg-gray-50 font-bold text-erp-green-dark`} value={singleFormData.netDisbursementAmount} readOnly />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={lbl}>Bank Name</label>
                  <input type="text" className={inp} value={singleFormData.bankName} onChange={(e) => handleSingleChange('bankName', e.target.value)} placeholder="Bank Name" />
                </div>
                <div>
                  <label className={lbl}>Account Number</label>
                  <input type="text" className={inp} value={singleFormData.accountNumber} onChange={(e) => handleSingleChange('accountNumber', e.target.value)} placeholder="Account No" />
                </div>
                <div>
                  <label className={lbl}>IFSC Code</label>
                  <input type="text" className={inp} value={singleFormData.ifscCode} onChange={(e) => handleSingleChange('ifscCode', e.target.value)} placeholder="IFSC Code" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button onClick={handleClear} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium">
                <RefreshCcw size={16} className="mr-2" /> Clear Form
              </button>
              <button onClick={handleSingleSubmit} className="flex items-center px-6 py-2 bg-erp-green text-white font-bold rounded-md hover:bg-erp-green-dark">
                <Save size={16} className="mr-2" /> Submit Loan
              </button>
            </div>
          </div>
        )}

        {/* ======================= GROUP APPLY ======================= */}
        {activeTab === 'group' && (
          <div className="space-y-6 animate-fade-in">
             {/* Info & Loan Block */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {/* Left Column - Group Details & Scheme Selector */}
              <div className="space-y-1 relative">

                <div className="grid grid-cols-[160px_10px_1fr] items-center mb-4 pr-28">
                  <span className="text-sm text-black font-semibold">Select Group</span>
                  <span className="text-sm text-black font-semibold">:</span>
                  <select
                      value={groupFormData.selectedGroup}
                      onChange={(e) => handleGroupChange('selectedGroup', e.target.value)}
                      className="w-48 px-2 py-1 text-sm border border-gray-400 bg-white focus:outline-none"
                    >
                      <option value="">-- Select Group --</option>
                      {mockGroups.map(group => (
                        <option key={group.id} value={group.id}>
                          {group.id} - {group.name}
                        </option>
                      ))}
                    </select>
                </div>
                
                {groupFormData.selectedGroup && (
                  <>
                    <div className="grid grid-cols-[160px_10px_1fr] items-start mb-1 pr-28">
                      <span className="text-sm text-black">Group Code</span>
                      <span className="text-sm text-black">:</span>
                      <span className="text-sm text-black font-semibold">{groupFormData.selectedGroup}</span>
                    </div>
                    <div className="grid grid-cols-[160px_10px_1fr] items-start mb-1 pr-28">
                      <span className="text-sm text-black">Group Members</span>
                      <span className="text-sm text-black">:</span>
                      <span className="text-sm text-black">5 Members</span>
                    </div>
                  </>
                )}
                
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
                <div className="flex flex-col items-end space-y-2 pt-14">
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
                      value={groupFormData.applicationNo} 
                      readOnly 
                    />
                  </div>
                  <div className="flex items-center justify-end w-full max-w-sm">
                    <span className="text-sm text-black font-semibold w-24">Date</span>
                    <span className="text-sm text-black mx-2">:</span>
                    <input 
                      type="date" 
                      className="w-48 px-2 py-1 text-sm border border-gray-400 focus:outline-none" 
                      value={groupFormData.applicationDate} 
                      onChange={(e) => handleGroupChange('applicationDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-t border-gray-300 my-4" />

            {/* Loan Details */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Group Loan Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className={lbl}>Amount Requested</label>
                  <input type="number" className={inp} value={groupFormData.loanAmountRequested} onChange={(e) => handleGroupChange('loanAmountRequested', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className={lbl}>Approved Loan Amount</label>
                  <input type="number" className={inp} value={groupFormData.approvedLoanAmount} onChange={(e) => handleGroupChange('approvedLoanAmount', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className={lbl}>Interest Rate (%)</label>
                  <input type="number" step="0.01" className={inp} value={groupFormData.interestRate} onChange={(e) => handleGroupChange('interestRate', e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <label className={lbl}>Loan Tenure (Months)</label>
                  <input type="number" className={inp} value={groupFormData.loanTenure} onChange={(e) => handleGroupChange('loanTenure', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className={lbl}>Processing Fee</label>
                  <input type="number" className={inp} value={groupFormData.processingFee} onChange={(e) => handleGroupChange('processingFee', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className={lbl}>Loan Purpose</label>
                  <input type="text" className={inp} value={groupFormData.loanPurpose} onChange={(e) => handleGroupChange('loanPurpose', e.target.value)} placeholder="Purpose" />
                </div>
                <div>
                  <label className={lbl}>EMI Amount (Auto)</label>
                  <input type="number" className={`${inp} bg-gray-50 font-bold text-erp-green-dark`} value={groupFormData.emiAmount} readOnly />
                </div>
                <div>
                  <label className={lbl}>Net Disbursement Amount</label>
                  <input type="number" className={`${inp} bg-gray-50 font-bold text-erp-green-dark`} value={groupFormData.netDisbursementAmount} readOnly />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button onClick={handleClear} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium">
                <RefreshCcw size={16} className="mr-2" /> Clear Form
              </button>
              <button onClick={handleGroupSubmit} className="flex items-center px-6 py-2 bg-erp-green text-white font-bold rounded-md hover:bg-erp-green-dark">
                <Save size={16} className="mr-2" /> Submit Group Loan
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default MicroFinanceForm;
