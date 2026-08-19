import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Save, RefreshCcw, XCircle, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import GoldLoanForm from './forms/GoldLoanForm';
import PersonalLoanForm from './forms/PersonalLoanForm';
import ChitFundForm from './forms/ChitFundForm';
import MicroFinanceForm from './forms/MicroFinanceForm';
import VehicleLoanForm from './forms/VehicleLoanForm';

const EditLoan = () => {
  const location = useLocation();
  const [hasSearched, setHasSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState(location.state?.loanId || '');
  const [loanType, setLoanType] = useState('gold_loan');
  const [customerLoans, setCustomerLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const [customerData, setCustomerData] = useState({
    name: '',
    mobile: '',
    fatherName: '',
    address: '',
    customerId: '',
    photoUrl: ''
  });

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

  const handleSearch = async () => {
    if (searchQuery.trim() === '') return;
    
    try {
      // 1. Try fetching by Loan ID first
      try {
        const loanRes = await api.get(`/loans/${searchQuery}`);
        if (loanRes.data && loanRes.data._id) {
          const loan = loanRes.data;
          const customer = loan.customerObjectId || {};
          
          const fullAddress = [
            customer.doorStreet, customer.area, customer.city, 
            customer.district, customer.state, customer.postalCode
          ].filter(Boolean).join(', ');

          setCustomerData({
            name: customer.customerName || loan.name || '',
            mobile: customer.mobileNumber || loan.mobileNo || '',
            fatherName: customer.guardianName || loan.fatherHusbandName || '',
            address: fullAddress || loan.address || '',
            customerId: customer.customerId || customer._id || loan.customerId || '',
            photoUrl: customer.customerPhotoUrl || ''
          });

          toast.success("Loan found!");
          setHasSearched(true);
          
          // Try to fetch all loans for this customer so the dropdown populates
          const custIdToUse = customer.customerId || customer._id || loan.customerId;
          if (custIdToUse) {
            const allLoansRes = await api.get(`/loans/customer/${custIdToUse}`);
            if (allLoansRes.data && allLoansRes.data.length > 0) {
              setCustomerLoans(allLoansRes.data);
            } else {
              setCustomerLoans([loan]);
            }
          } else {
            setCustomerLoans([loan]);
          }

          setSelectedLoan(loan);
          
          const sName = (loan.schemeName || '').toLowerCase();
          if (sName.includes('gold')) setLoanType('gold_loan');
          else if (sName.includes('vehicle')) setLoanType('vehicle_loan');
          else if (sName.includes('personal')) setLoanType('personal_loan');
          else if (sName.includes('chit')) setLoanType('chit_fund');
          else if (sName.includes('micro')) setLoanType('micro_finance');

          // Populate scheme data from the loan
          const matchedScheme = schemesList.find(s => s.schemeId === loan.schemeId || s._id === loan.schemeId || s.schemeName === loan.schemeName);
          const finalSchemeId = matchedScheme ? matchedScheme._id : (loan.schemeId || '');
          setSchemeSearchQuery(finalSchemeId);
          
          setSchemeData({
            schemeId: finalSchemeId,
            schemeName: loan.schemeName || matchedScheme?.schemeName || '',
            interestPercent: loan.interestPercent ? `${loan.interestPercent}%` : (matchedScheme?.interestRate ? `${matchedScheme.interestRate}%` : ''),
            amountRs: loan.loanAmount || matchedScheme?.amountLimit || '',
            gramRate: loan.gramRate || matchedScheme?.gramRate || '',
            minimumGram: loan.minimumGram || matchedScheme?.minimumGram || '',
            maturePeriodMonths: loan.maturePeriod || matchedScheme?.maturePeriodMonths || '',
            interestRepaymentMonths: loan.interestRepaymentMonths || matchedScheme?.interestRepaymentMonths || '',
            documentCharges: loan.documentCharges || matchedScheme?.documentCharges || '',
            penaltyPercent: loan.penaltyPercent ? `${loan.penaltyPercent}%` : (matchedScheme?.penalty ? `${matchedScheme.penalty}%` : '')
          });

          return;
        }
      } catch (err) {
        // Not a loan ID or not found, fallback to customer search
      }

      // 2. Fetch Customer
      const response = await api.get(`/customers/search?search=${searchQuery}`);
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        const customer = response.data.data[0];
        
        const fullAddress = [
          customer.doorStreet, customer.area, customer.city, 
          customer.district, customer.state, customer.postalCode
        ].filter(Boolean).join(', ');

        setCustomerData({
          name: customer.customerName || '',
          mobile: customer.mobileNumber || '',
          fatherName: customer.guardianName || '',
          address: fullAddress || '',
          customerId: customer.customerId || customer._id || '',
          photoUrl: customer.customerPhotoUrl || ''
        });

        toast.success("Customer found! Fetching their loans...");
        setHasSearched(true);

        // 3. Fetch Loans for this customer
        const custIdToUse = customer.customerId || customer._id;
        try {
          const loansRes = await api.get(`/loans/customer/${custIdToUse}`);
          if (loansRes.data && loansRes.data.length > 0) {
            setCustomerLoans(loansRes.data);
            setSelectedLoan(loansRes.data[0]); // Auto-select the first loan
            // We can optionally set the loanType based on the first loan, or let the user choose
            const firstLoan = loansRes.data[0];
            const sName = (firstLoan.schemeName || '').toLowerCase();
            if (sName.includes('gold')) setLoanType('gold_loan');
            else if (sName.includes('vehicle')) setLoanType('vehicle_loan');
            else if (sName.includes('personal')) setLoanType('personal_loan');
            else if (sName.includes('chit')) setLoanType('chit_fund');
            else if (sName.includes('micro')) setLoanType('micro_finance');

            // Populate scheme data from the first loan
            const matchedScheme = schemesList.find(s => s.schemeId === firstLoan.schemeId || s._id === firstLoan.schemeId || s.schemeName === firstLoan.schemeName);
            const finalSchemeId = matchedScheme ? matchedScheme._id : (firstLoan.schemeId || '');
            setSchemeSearchQuery(finalSchemeId);
            
            setSchemeData({
              schemeId: finalSchemeId,
              schemeName: firstLoan.schemeName || matchedScheme?.schemeName || '',
              interestPercent: firstLoan.interestPercent ? `${firstLoan.interestPercent}%` : (matchedScheme?.interestRate ? `${matchedScheme.interestRate}%` : ''),
              amountRs: firstLoan.loanAmount || matchedScheme?.amountLimit || '',
              gramRate: firstLoan.gramRate || matchedScheme?.gramRate || '',
              minimumGram: firstLoan.minimumGram || matchedScheme?.minimumGram || '',
              maturePeriodMonths: firstLoan.maturePeriod || matchedScheme?.maturePeriodMonths || '',
              interestRepaymentMonths: firstLoan.interestRepaymentMonths || matchedScheme?.interestRepaymentMonths || '',
              documentCharges: firstLoan.documentCharges || matchedScheme?.documentCharges || '',
              penaltyPercent: firstLoan.penaltyPercent ? `${firstLoan.penaltyPercent}%` : (matchedScheme?.penalty ? `${matchedScheme.penalty}%` : '')
            });
          } else {
            setCustomerLoans([]);
            setSelectedLoan(null);
            toast.error("This customer has no loans.");
          }
        } catch (loanErr) {
          console.error("Error fetching loans", loanErr);
          toast.error("Error fetching loans.");
        }

      } else {
        toast.error("Customer or Loan not found.");
        setHasSearched(false);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
      toast.error("Error fetching details.");
    }
  };

  useEffect(() => {
    if (location.state?.loanId && !hasSearched) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.loanId]);

  // Ensure scheme data is synced when schemesList finishes loading
  useEffect(() => {
    if (selectedLoan && schemesList.length > 0) {
      const matchedScheme = schemesList.find(s => 
        s.schemeId === selectedLoan.schemeId || 
        s._id === selectedLoan.schemeId || 
        s.schemeName === selectedLoan.schemeName
      );
      
      const finalSchemeId = matchedScheme ? matchedScheme._id : (selectedLoan.schemeId || '');
      
      // Only update if it's different to prevent infinite loops
      if (schemeSearchQuery !== finalSchemeId) {
        setSchemeSearchQuery(finalSchemeId);
        setSchemeData(prev => ({
          ...prev,
          schemeId: finalSchemeId,
          schemeName: selectedLoan.schemeName || matchedScheme?.schemeName || '',
          interestPercent: selectedLoan.interestPercent ? `${selectedLoan.interestPercent}%` : (matchedScheme?.interestRate ? `${matchedScheme.interestRate}%` : ''),
          amountRs: selectedLoan.loanAmount || matchedScheme?.amountLimit || '',
          gramRate: selectedLoan.gramRate || matchedScheme?.gramRate || '',
          minimumGram: selectedLoan.minimumGram || matchedScheme?.minimumGram || '',
          maturePeriodMonths: selectedLoan.maturePeriod || matchedScheme?.maturePeriodMonths || '',
          interestRepaymentMonths: selectedLoan.interestRepaymentMonths || matchedScheme?.interestRepaymentMonths || '',
          documentCharges: selectedLoan.documentCharges || matchedScheme?.documentCharges || '',
          penaltyPercent: selectedLoan.penaltyPercent ? `${selectedLoan.penaltyPercent}%` : (matchedScheme?.penalty ? `${matchedScheme.penalty}%` : '')
        }));
      }
    }
  }, [selectedLoan, schemesList]);

  const [articles, setArticles] = useState([
    { category: '', details: '', qty: '', totWt: '', stoneWt: '', nettWt: '', purity: '', gramRate: '', total: '' },
    { category: '', details: '', qty: '', totWt: '', stoneWt: '', nettWt: '', purity: '', gramRate: '', total: '' }
  ]);
  const [loanAmount, setLoanAmount] = useState('');
  const [totalWt, setTotalWt] = useState('');

  const handleArticleChange = (index, field, value) => {
    const newArticles = [...articles];
    const article = { ...newArticles[index], [field]: value };

    if (field === 'totWt' || field === 'stoneWt') {
      const tot = parseFloat(article.totWt) || 0;
      const stone = parseFloat(article.stoneWt) || 0;
      if (tot > 0) {
        article.nettWt = (tot - stone).toFixed(2);
      }
    }

    const nett = parseFloat(article.nettWt) || 0;
    const rate = parseFloat(article.gramRate) || 0;
    if (nett > 0 && rate > 0) {
      article.total = (nett * rate).toFixed(2);
    } else {
      article.total = '';
    }

    newArticles[index] = article;
    setArticles(newArticles);

    const sumTotal = newArticles.reduce((sum, art) => sum + (parseFloat(art.total) || 0), 0);
    const sumWt = newArticles.reduce((sum, art) => sum + (parseFloat(art.totWt) || 0), 0);
    
    setLoanAmount(sumTotal > 0 ? sumTotal.toFixed(2) : '');
    setTotalWt(sumWt > 0 ? sumWt.toFixed(2) : '');
  };

  const inp = "w-full px-3 py-1.5 bg-white border border-gray-400 rounded-md text-lg text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors";
  const lbl = "text-base font-medium text-black w-64 shrink-0 self-center whitespace-nowrap mb-0";
  const row = "flex flex-row items-center gap-4 mb-3";

  // Table header styles
  const thStyle = "px-4 py-2 text-base font-medium text-white bg-black border border-gray-600 tracking-wider text-center whitespace-nowrap";
  const tdStyle = "p-1 border border-gray-300";
  const tableInp = "w-full px-2 py-1 text-lg text-black bg-white border-none focus:outline-none focus:ring-1 focus:ring-black rounded text-center";
  
  // Empty array for mapping empty table rows
  const emptyArticleRows = Array(2).fill(null);
  const emptyPaymentRows = Array(2).fill(null);

  // Map to dynamically render the correct form
  const renderLoanForm = () => {
    switch (loanType) {
      case 'gold_loan':
        return (
          <GoldLoanForm 
            customerData={customerData} 
            schemeData={schemeData} 
            selectedLoan={selectedLoan}
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
            selectedLoan={selectedLoan}
            schemesList={schemesList}
            schemeSearchQuery={schemeSearchQuery}
            handleSchemeSelect={handleSchemeSelect}
          />
        );
      case 'chit_fund':
        return <ChitFundForm customerData={customerData} schemeData={schemeData} selectedLoan={selectedLoan} />;
      case 'micro_finance':
        return <MicroFinanceForm customerData={customerData} schemeData={schemeData} selectedLoan={selectedLoan} />;
      case 'vehicle_loan':
        return (
          <VehicleLoanForm 
            customerData={customerData} 
            schemeData={schemeData} 
            selectedLoan={selectedLoan}
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
      {/* Title & Tabs */}
      <div className="mb-4 shrink-0 flex flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-black">Edit Loan</h2>
          <p className="text-sm text-text-secondary mt-1">Manage Receipts and Repledging.</p>
        </div>
        


        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="flex items-center bg-white border border-gray-400 rounded-lg overflow-hidden shadow-sm">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter') handleSearch(); }}
              placeholder="Name, Phone Number, ID" 
              className="w-full px-4 py-2 text-base text-black focus:outline-none"
            />
            <button 
              onClick={handleSearch}
              className="px-6 py-2 bg-black text-white text-base hover:bg-gray-800 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Scheme Selection was moved into the individual loan forms */}

        {/* Select Loan Dropdown removed as per user request */}
        
      </div>

      <div className="flex-1 overflow-y-auto">
        {!hasSearched ? (
          <div className="h-full w-full flex items-center justify-center pb-32">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <h3 className="text-xl font-bold text-gray-600">Search for a Loan</h3>
              <p className="mt-2 text-sm font-semibold text-gray-400">Enter a Customer ID or Loan Number above to view and edit details.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Customer Details and Scheme Details removed as per request */}

            {/* Dynamic Specific Loan Form */}
            {renderLoanForm()}
          </>
        )}
      </div>
    </div>
  );
};

export default EditLoan;
