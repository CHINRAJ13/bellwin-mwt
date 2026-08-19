import { useState, useEffect } from 'react';
import { Save, RefreshCcw, XCircle, ChevronDown, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import GoldLoanForm from './forms/GoldLoanForm';
import PersonalLoanForm from './forms/PersonalLoanForm';
import ChitFundForm from './forms/ChitFundForm';
import MicroFinanceForm from './forms/MicroFinanceForm';
import VehicleLoanForm from './forms/VehicleLoanForm';

const ProvideLoan = () => {
  const [loanType, setLoanType] = useState('gold_loan');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [customerData, setCustomerData] = useState({
    name: '',
    mobile: '',
    fatherName: '',
    address: ''
  });

  const handleSearch = async () => {
    if (searchQuery.trim() === '') return;
    
    try {
      const response = await api.get(`/customers/search?search=${searchQuery}`);
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        const customer = response.data.data[0]; // Get the first matching customer
        
        if (customer.status !== 'Approved' && customer.approvalStatus !== 'Approved') {
          toast.error("Admin not approved");
          setCustomerData({
            name: '',
            mobile: '',
            fatherName: '',
            address: '',
            customerId: '',
            status: '',
            approvalStatus: ''
          });
          return;
        }
        
        // Construct the full address
        const fullAddress = [
          customer.doorStreet,
          customer.area,
          customer.city,
          customer.district,
          customer.state,
          customer.postalCode
        ].filter(Boolean).join(', ');

        setCustomerData({
          ...customerData,
          name: customer.customerName || '',
          mobile: customer.mobileNumber || '',
          fatherName: customer.guardianName || '',
          address: fullAddress || '',
          customerId: customer.customerId || customer._id || '',
          status: customer.status || '',
          approvalStatus: customer.approvalStatus || '',
          photoUrl: customer.customerPhotoUrl || ''
        });
        toast.success("Customer details fetched!");
      } else {
        toast.error("Customer not found.");
        setCustomerData({
          ...customerData,
          name: '',
          mobile: searchQuery,
          fatherName: '',
          address: '',
          customerId: '',
          photoUrl: ''
        });
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
      toast.error("Error fetching customer details.");
    }
  };

  const handleCustomerChange = (field, value) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const [schemeSearchQuery, setSchemeSearchQuery] = useState('');
  const [schemesList, setSchemesList] = useState([]);
  const [schemeData, setSchemeData] = useState({
    schemeId: '',
    schemeName: '',
    interestPercent: '',
    amountRs: '',
    gramRate: '',
    minimumGram: '',
    maturePeriodMonths: '',
    interestRepaymentMonths: '',
    documentCharges: '',
    penaltyPercent: ''
  });

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const response = await api.get('/schemes');
        if (response.data && response.data.length > 0) {
          setSchemesList(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch schemes list", err);
      }
    };
    fetchSchemes();
  }, []);

  const handleSchemeSelect = (e) => {
    const selectedSchemeId = e.target.value;
    setSchemeSearchQuery(selectedSchemeId);
    
    if (!selectedSchemeId) {
      setSchemeData({
        schemeId: '',
        schemeName: '',
        interestPercent: '',
        amountRs: '',
        gramRate: '',
        minimumGram: '',
        maturePeriodMonths: '',
        interestRepaymentMonths: '',
        documentCharges: '',
        penaltyPercent: ''
      });
      return;
    }

    const scheme = schemesList.find(s => s._id === selectedSchemeId || s.schemeId === selectedSchemeId);
    if (scheme) {
      setSchemeData({
        schemeId: scheme.schemeId || '',
        schemeName: scheme.schemeName || '',
        interestPercent: scheme.interestRate ? `${scheme.interestRate}%` : '',
        amountRs: scheme.amountLimit || '',
        gramRate: scheme.gramRate || '',
        minimumGram: scheme.minimumGram || '',
        maturePeriodMonths: scheme.maturePeriodMonths || '',
        interestRepaymentMonths: scheme.interestRepaymentMonths || '',
        documentCharges: scheme.documentCharges || '',
        penaltyPercent: scheme.penalty ? `${scheme.penalty}%` : ''
      });
      toast.success("Scheme details loaded!");
    }
  };

  const inp = "w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-1 focus:ring-erp-green bg-white";
  const lbl = "block text-sm font-medium text-gray-700 mb-1";

  // Map to dynamically render the correct form
  const renderLoanForm = () => {
    switch (loanType) {
      case 'gold_loan':
        return (
          <GoldLoanForm 
            customerData={customerData} 
            schemeData={schemeData} 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            schemesList={schemesList}
            schemeSearchQuery={schemeSearchQuery}
            handleSchemeSelect={handleSchemeSelect}
          />
        );
      case 'personal_loan':
        return (
          <PersonalLoanForm 
            customerData={customerData} 
            schemeData={schemeData} 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            schemesList={schemesList}
            schemeSearchQuery={schemeSearchQuery}
            handleSchemeSelect={handleSchemeSelect}
          />
        );
      case 'chit_fund':
        return <ChitFundForm customerData={customerData} schemeData={schemeData} />;
      case 'micro_finance':
        return (
          <MicroFinanceForm 
            customerData={customerData} 
            schemeData={schemeData} 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            schemesList={schemesList}
            schemeSearchQuery={schemeSearchQuery}
            handleSchemeSelect={handleSchemeSelect}
          />
        );
      case 'vehicle_loan':
        return (
          <VehicleLoanForm 
            customerData={customerData} 
            schemeData={schemeData} 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            schemesList={schemesList}
            schemeSearchQuery={schemeSearchQuery}
            handleSchemeSelect={handleSchemeSelect}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full flex flex-col p-8">
      {/* Title & Loan Type Selector */}
      <div className="mb-6 shrink-0 flex flex-row items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-black">Loan</h2>
          <p className="text-sm text-text-secondary mt-1">Select a loan type and provide details.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-gray-700">Select Loan Type:</label>
          <div className="relative">
            <select 
              value={loanType}
              onChange={(e) => setLoanType(e.target.value)}
              className="appearance-none bg-white border-2 border-gray-200 text-gray-800 text-sm font-bold rounded-none px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-erp-green focus:border-transparent cursor-pointer shadow-sm"
            >
              <option value="gold_loan">Gold Loan</option>
              <option value="personal_loan">Personal Loan</option>
              <option value="vehicle_loan">Vehicle Loan</option>
              <option value="micro_finance">Micro Finance</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Customer ID Search & Scheme Selection Section */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
        {/* Customer Search */}
        <div className="bg-white p-4 border border-gray-100 rounded-sm shadow-sm flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">Customer ID Search :</label>
            <div className="flex items-center">
              <input 
                type="text" 
                placeholder="e.g. CUST000001" 
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-erp-green"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                onClick={handleSearch}
                className="bg-black text-white px-4 py-2 rounded-r-md hover:bg-gray-800 flex items-center gap-2 font-bold"
              >
                <Search size={16}/> Search
              </button>
            </div>
          </div>
        </div>

        {/* Scheme Selection was moved into the individual loan forms */}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Dynamic Specific Loan Form */}
        {renderLoanForm()}
      </div>
    </div>
  );
};

export default ProvideLoan;
