import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import MicroFinanceForm from '../../Provide Loan/forms/MicroFinanceForm';
import PageHeader from '../../../components/ui/PageHeader';

const MfiLoanApply = () => {
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
        const customer = response.data.data[0]; 
        
        if (customer.status !== 'Approved' && customer.approvalStatus !== 'Approved') {
          toast.error("Admin not approved");
          setCustomerData({
            name: '', mobile: '', fatherName: '', address: '', customerId: '', status: '', approvalStatus: ''
          });
          return;
        }
        
        const fullAddress = [
          customer.doorStreet, customer.area, customer.city,
          customer.district, customer.state, customer.postalCode
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
          name: '', mobile: searchQuery, fatherName: '', address: '', customerId: '', photoUrl: ''
        });
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
      toast.error("Error fetching customer details.");
    }
  };

  const [schemeSearchQuery, setSchemeSearchQuery] = useState('');
  const [schemesList, setSchemesList] = useState([]);
  const [schemeData, setSchemeData] = useState({
    schemeId: '', schemeName: '', interestPercent: '', amountRs: '', gramRate: '',
    minimumGram: '', maturePeriodMonths: '', interestRepaymentMonths: '',
    documentCharges: '', penaltyPercent: ''
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
        schemeId: '', schemeName: '', interestPercent: '', amountRs: '', gramRate: '',
        minimumGram: '', maturePeriodMonths: '', interestRepaymentMonths: '',
        documentCharges: '', penaltyPercent: ''
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="Micro Finance Loan Application" 
        subtitle="Apply for Single Person or Group (JLG) Micro Finance Loans." 
      />

      {/* Customer ID Search Section */}
      <div className="mb-6 max-w-4xl mt-6">
        <div className="bg-white p-4 border border-gray-100 rounded-sm shadow-sm flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">Customer ID Search (For Single Apply) :</label>
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
      </div>

      <div className="flex-1">
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
      </div>
    </div>
  );
};

export default MfiLoanApply;
