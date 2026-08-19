import React, { useState, useEffect } from 'react';
import { Save, RefreshCcw, Search } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const VehicleLoanForm = ({ 
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
    vehicleType: 'Bike',
    vehicleBrand: '',
    modelName: '',
    variant: '',
    manufacturingYear: '',
    registrationNumber: '',
    chassisNumber: '',
    engineNumber: '',
    showroomPrice: '',
    onRoadPrice: '',
    dealerName: '',
    nomineeName: '',
    nomineeRelationship: '',
    nomineeDob: '',
    nomineeMobile: '',
    nomineeAadhaar: '',
    nomineeAddress: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Hydrate State on Edit
  useEffect(() => {
    if (selectedLoan) {
      setFormData(prev => ({
        ...prev,
        ...selectedLoan
      }));
    }
  }, [selectedLoan]);

  const inp = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-erp-green bg-white";
  const lbl = "block text-sm font-medium text-gray-700 mb-1";
  const sectionTitle = "text-lg font-bold text-gray-800 mb-4 pb-2 border-b";

  const handleSubmit = async () => {
    if (!customerData || !customerData.customerId) {
      toast.error("Please search and select a customer first.");
      return;
    }
    toast.success("Vehicle Loan Form Submitted (Demo)");
    setTimeout(() => window.location.reload(), 1500);
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
                value={selectedLoan ? (selectedLoan.loanId || selectedLoan.loanNo) : "VL-" + Math.floor(100000 + Math.random() * 900000)} 
                readOnly 
              />
            </div>
            <div className="flex items-center justify-end w-full max-w-sm">
              <span className="text-sm text-black font-semibold w-24">Date</span>
              <span className="text-sm text-black mx-2">:</span>
              <input 
                type="date" 
                className="w-48 px-2 py-1 text-sm border border-gray-400 focus:outline-none" 
                value={selectedLoan ? new Date(selectedLoan.loanDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} 
                onChange={(e) => {}}
              />
            </div>
          </div>
        </div>
      </div>

      <hr className="border-t border-gray-300 my-4" />

      {/* 3. Vehicle Details */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
        <h3 className={sectionTitle}>3. Vehicle Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className={lbl}>Vehicle Type <span className="text-red-500">*</span></label>
            <select name="vehicleType" className={inp} value={formData.vehicleType} onChange={handleChange}>
              <option value="Bike">Bike</option>
              <option value="Car">Car</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Vehicle Brand <span className="text-red-500">*</span></label>
            <input type="text" name="vehicleBrand" className={inp} value={formData.vehicleBrand} onChange={handleChange} placeholder="e.g., Honda" />
          </div>
          <div>
            <label className={lbl}>Model Name <span className="text-red-500">*</span></label>
            <input type="text" name="modelName" className={inp} value={formData.modelName} onChange={handleChange} placeholder="e.g., City" />
          </div>
          <div>
            <label className={lbl}>Variant <span className="text-red-500">*</span></label>
            <input type="text" name="variant" className={inp} value={formData.variant} onChange={handleChange} placeholder="e.g., VXi" />
          </div>
          <div>
            <label className={lbl}>Manufacturing Year <span className="text-red-500">*</span></label>
            <input type="number" name="manufacturingYear" className={inp} value={formData.manufacturingYear} onChange={handleChange} placeholder="e.g., 2023" />
          </div>
          <div>
            <label className={lbl}>Registration Number (Optional)</label>
            <input type="text" name="registrationNumber" className={inp} value={formData.registrationNumber} onChange={handleChange} placeholder="e.g., TN 01 AB 1234" />
          </div>
          <div>
            <label className={lbl}>Chassis Number <span className="text-red-500">*</span></label>
            <input type="text" name="chassisNumber" className={inp} value={formData.chassisNumber} onChange={handleChange} placeholder="Enter Chassis Number" />
          </div>
          <div>
            <label className={lbl}>Engine Number <span className="text-red-500">*</span></label>
            <input type="text" name="engineNumber" className={inp} value={formData.engineNumber} onChange={handleChange} placeholder="Enter Engine Number" />
          </div>
          <div>
            <label className={lbl}>Showroom Price <span className="text-red-500">*</span></label>
            <input type="number" name="showroomPrice" className={inp} value={formData.showroomPrice} onChange={handleChange} placeholder="₹ Amount" />
          </div>
          <div>
            <label className={lbl}>On Road Price <span className="text-red-500">*</span></label>
            <input type="number" name="onRoadPrice" className={inp} value={formData.onRoadPrice} onChange={handleChange} placeholder="₹ Amount" />
          </div>
          <div>
            <label className={lbl}>Dealer Name <span className="text-red-500">*</span></label>
            <input type="text" name="dealerName" className={inp} value={formData.dealerName} onChange={handleChange} placeholder="Enter Dealer Name" />
          </div>
        </div>
      </div>

      {/* 4. Nominee Details */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
        <h3 className={sectionTitle}>4. Nominee Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className={lbl}>Nominee Name <span className="text-red-500">*</span></label>
            <input type="text" name="nomineeName" className={inp} value={formData.nomineeName} onChange={handleChange} placeholder="Enter Nominee Name" />
          </div>
          <div>
            <label className={lbl}>Relationship <span className="text-red-500">*</span></label>
            <input type="text" name="nomineeRelationship" className={inp} value={formData.nomineeRelationship} onChange={handleChange} placeholder="e.g., Father, Wife" />
          </div>
          <div>
            <label className={lbl}>Date of Birth <span className="text-red-500">*</span></label>
            <input type="date" name="nomineeDob" className={inp} value={formData.nomineeDob} onChange={handleChange} />
          </div>
          <div>
            <label className={lbl}>Mobile Number <span className="text-red-500">*</span></label>
            <input type="text" name="nomineeMobile" className={inp} value={formData.nomineeMobile} onChange={handleChange} placeholder="Enter Mobile Number" />
          </div>
          <div>
            <label className={lbl}>Aadhaar Number <span className="text-red-500">*</span></label>
            <input type="text" name="nomineeAadhaar" className={inp} value={formData.nomineeAadhaar} onChange={handleChange} placeholder="Enter Aadhaar Number" />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className={lbl}>Address <span className="text-red-500">*</span></label>
            <textarea name="nomineeAddress" rows="2" className={inp} value={formData.nomineeAddress} onChange={handleChange} placeholder="Enter Nominee Address"></textarea>
          </div>
          <div className="flex flex-col">
            <label className={lbl}>Nominee Photo Upload <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-2">
              <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
            </div>
          </div>
          <div className="flex flex-col">
            <label className={lbl}>Nominee ID Proof Upload <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-2">
              <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Document Uploads */}
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
        <h3 className={sectionTitle}>Document Upload</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className={lbl}>Driving License <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-2">
              <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
            </div>
          </div>
          <div className="flex flex-col">
            <label className={lbl}>Salary Slip / Income Proof <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-2">
              <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
            </div>
          </div>
          <div className="flex flex-col">
            <label className={lbl}>Bank Statement <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-2">
              <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
            </div>
          </div>
          <div className="flex flex-col">
            <label className={lbl}>Vehicle Invoice / Quotation <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-2">
              <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <button className="px-6 py-2 bg-gray-200 text-gray-800 text-sm font-bold rounded-md hover:bg-gray-300 transition-colors">Cancel</button>
        <button onClick={handleSubmit} className="px-8 py-2 bg-black text-white text-sm font-bold rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Loan
        </button>
      </div>

    </div>
  );
};

export default VehicleLoanForm;
