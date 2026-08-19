import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Search, RefreshCcw, Camera, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

const GoldLoanForm = ({ 
  customerData, 
  schemeData, 
  selectedLoan,
  schemesList = [],
  schemeSearchQuery,
  handleSchemeSelect
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // --- Web Camera State ---
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleCaptureImage = async (e) => {
    e.preventDefault();
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (err) {
      console.error("Camera access denied:", err);
      toast.error("Unable to access camera. Please check permissions.");
      setIsCameraOpen(false);
    }
  };

  const takeSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      closeCamera();
      toast.success("Image captured successfully!");
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // --- Form State ---
  const [nextLoanIdPreview, setNextLoanIdPreview] = useState('');

  useEffect(() => {
    if (!selectedLoan) {
      api.get('/loans/next-id').then(res => {
        setNextLoanIdPreview(res.data.nextId);
      }).catch(err => console.error(err));
    }
  }, [selectedLoan]);
  const [loanDetails, setLoanDetails] = useState({
    loanStartDate: new Date().toISOString().split('T')[0],
    loanEndDate: new Date().toISOString().split('T')[0],
    eligibleLoanAmount: 0,
    loanAmount: '',
    remainingLoanAmount: '',
    status: 'Pending'
  });

  const [calculations, setCalculations] = useState({
    totalNoOfDays: 0,
    interestRate: '',
    additionalInterestRate: '',
    totalPaidInterestAmount: '',
    totalInterestPaidDays: '',
    remainingDays: 0,
    remainingInterestAmount: 0,
    documentCharge: '',
    fullSettlementAmount: 0
  });

  const [receiptEntry, setReceiptEntry] = useState({
    enterDays: '',
    receiptDate: new Date().toISOString().split('T')[0],
    receiptAmount: '',
    penalty: false
  });

  // Example empty row for Articles
  const emptyArticle = {
    category: '', jewelDetails: '', quantity: '', totWeight: '', 
    stoneWt: '', nettWt: '', purity: '', gramRate: '', total: ''
  };
  const [articles, setArticles] = useState([ { ...emptyArticle } ]);
  
  // Payments state
  const [payments, setPayments] = useState([]);

  // --- Hydrate State on Edit ---
  useEffect(() => {
    if (selectedLoan) {
      setLoanDetails({
        loanStartDate: selectedLoan.loanStartDate ? new Date(selectedLoan.loanStartDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        loanEndDate: selectedLoan.loanEndDate ? new Date(selectedLoan.loanEndDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        eligibleLoanAmount: selectedLoan.eligibleLoanAmount || 0,
        loanAmount: selectedLoan.loanAmount || '',
        remainingLoanAmount: selectedLoan.remainingLoanAmount || '',
        status: selectedLoan.status || 'Pending'
      });
      setCalculations({
        totalNoOfDays: selectedLoan.totalNoOfDays || 0,
        interestRate: selectedLoan.interestRate || '',
        additionalInterestRate: selectedLoan.additionalInterestRate || '',
        totalPaidInterestAmount: selectedLoan.totalPaidInterestAmount || '',
        totalInterestPaidDays: selectedLoan.totalInterestPaidDays || '',
        remainingDays: selectedLoan.remainingDays || 0,
        remainingInterestAmount: selectedLoan.remainingInterestAmount || 0,
        documentCharge: selectedLoan.documentCharge || '',
        fullSettlementAmount: selectedLoan.fullSettlementAmount || 0
      });
      
      if (selectedLoan.articles && selectedLoan.articles.length > 0) {
        setArticles(selectedLoan.articles.map(a => ({
          category: a.category || '',
          jewelDetails: a.details || '',
          quantity: a.qty || '',
          totWeight: a.totWt || '',
          stoneWt: a.stoneWt || '',
          nettWt: a.nettWt || '',
          purity: a.purity || '',
          gramRate: a.gramRate || '',
          total: a.total || ''
        })));
      } else {
        setArticles([ { ...emptyArticle } ]);
      }
      
      if (selectedLoan.payments) {
        setPayments(selectedLoan.payments);
      }
      
      if (selectedLoan.jewelImage) {
        setCapturedImage(selectedLoan.jewelImage);
      } else {
        setCapturedImage(null);
      }
    } else {
      setCapturedImage(null);
      setArticles([ { ...emptyArticle } ]);
    }
  }, [selectedLoan]);

  // --- Auto-fill from Scheme ---
  useEffect(() => {
    if (schemeData && schemeData.schemeId) {
      setCalculations(prev => ({
        ...prev,
        interestRate: schemeData.interestPercent ? parseFloat(schemeData.interestPercent) : prev.interestRate,
        documentCharge: schemeData.documentCharges || prev.documentCharge
      }));
      
      // Auto-fill gramRate for new articles only (not when editing an existing loan)
      if (!selectedLoan && articles.length === 1 && !articles[0].category) {
         setArticles([{ ...articles[0], gramRate: schemeData.gramRate || '' }]);
      }
    }
  }, [schemeData, selectedLoan]);

  // --- Auto-calculate Matured Date on Start Date or Scheme change ---
  useEffect(() => {
    if (!selectedLoan && loanDetails.loanStartDate && schemeData && schemeData.maturePeriodMonths) {
      const days = parseInt(schemeData.maturePeriodMonths, 10);
      if (!isNaN(days)) {
        const start = new Date(loanDetails.loanStartDate);
        start.setDate(start.getDate() + days);
        setLoanDetails(prev => ({
          ...prev,
          loanEndDate: start.toISOString().split('T')[0]
        }));
      }
    }
  }, [loanDetails.loanStartDate, schemeData, selectedLoan]);

  // Input Class Names
  const inp = "w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-erp-green bg-white text-sm";
  const lbl = "text-sm font-medium text-gray-700 whitespace-nowrap min-w-[180px]";

  // --- Handlers ---
  const handleLoanChange = (field, val) => setLoanDetails(prev => ({ ...prev, [field]: val }));
  const handleCalcChange = (field, val) => setCalculations(prev => ({ ...prev, [field]: val }));
  const handleReceiptChange = (field, val) => setReceiptEntry(prev => ({ ...prev, [field]: val }));
  
  const handleArticleChange = (index, field, value) => {
    const updated = [...articles];
    let row = { ...updated[index], [field]: value };
    
    // Auto-calculate Net Weight and Total
    const totWt = parseFloat(row.totWeight) || 0;
    const stoneWt = parseFloat(row.stoneWt) || 0;
    const net = Math.max(0, totWt - stoneWt);
    row.nettWt = net > 0 ? net.toFixed(2) : '';

    const nettWt = parseFloat(row.nettWt) || 0;
    const gramRate = parseFloat(row.gramRate) || 0;
    const tot = nettWt * gramRate;
    row.total = tot > 0 ? tot.toFixed(2) : '';

    updated[index] = row;
    setArticles(updated);
  };

  const aggregateTotalWt = articles.reduce((sum, a) => sum + (parseFloat(a.totWeight) || 0), 0);


  const addArticleRow = () => setArticles([...articles, { ...emptyArticle }]);

  const handleAddReceipt = () => {
    if (!receiptEntry.receiptAmount) {
      toast.error("Please enter a receipt amount.");
      return;
    }
    
    const newPayment = {
      receiptNo: 'REC-' + (payments.length + 1).toString().padStart(4, '0'),
      paidDate: receiptEntry.receiptDate,
      amount: receiptEntry.receiptAmount,
      interestAmount: 0, // Placeholder
      principalAmount: receiptEntry.receiptAmount,
      penalty: receiptEntry.penalty ? 1 : 0,
      penaltyPending: 0
    };
    
    setPayments([...payments, newPayment]);
    
    // Clear receipt entry
    setReceiptEntry({
      ...receiptEntry,
      receiptAmount: '',
      enterDays: '',
      penalty: false
    });
    toast.success("Receipt added to Payment Details table!");
  };

  const handleSave = async (close = false, repledge = false) => {
    try {
      if (!customerData || !customerData.customerId) {
        toast.error("Please select a customer first.");
        return;
      }

      const payload = {
        customerId: customerData.customerId,
        name: customerData.name,
        mobileNo: customerData.mobile,
        fatherHusbandName: customerData.fatherName,
        address: customerData.address,
        loanStartDate: loanDetails.loanStartDate,
        loanEndDate: loanDetails.loanEndDate,
        loanAmount: Number(loanDetails.loanAmount) || 0,
        remainingLoanAmount: Number(loanDetails.remainingLoanAmount) || 0,
        status: loanDetails.status,
        
        totalNoOfDays: Number(calculations.totalNoOfDays) || 0,
        interestRate: Number(calculations.interestRate) || 0,
        additionalInterestRate: Number(calculations.additionalInterestRate) || 0,
        totalPaidInterestAmount: Number(calculations.totalPaidInterestAmount) || 0,
        totalInterestPaidDays: Number(calculations.totalInterestPaidDays) || 0,
        remainingDays: Number(calculations.remainingDays) || 0,
        remainingInterestAmount: Number(calculations.remainingInterestAmount) || 0,
        documentCharge: Number(calculations.documentCharge) || 0,
        fullSettlementAmount: Number(calculations.fullSettlementAmount) || 0,
        
        receiptEntry: {
          ...receiptEntry,
          enterDays: Number(receiptEntry.enterDays) || 0,
          receiptAmount: Number(receiptEntry.receiptAmount) || 0
        },
        
        articles: articles.filter(a => a.category || a.jewelDetails || a.totWeight).map(a => ({
          category: a.category,
          details: a.jewelDetails,
          qty: Number(a.quantity) || 0,
          totWt: Number(a.totWeight) || 0,
          stoneWt: Number(a.stoneWt) || 0,
          nettWt: Number(a.nettWt) || 0,
          purity: a.purity,
          gramRate: Number(a.gramRate) || 0,
          total: Number(a.total) || 0
        })),
        payments,
        loanType: 'Gold Loan',
        loanDate: selectedLoan ? selectedLoan.loanDate : new Date(),
        jewelImage: capturedImage, // Send captured image base64
        
        // Scheme Details
        schemeId: schemeData?.schemeId || '',
        schemeName: schemeData?.schemeName || '',
        interestPercent: schemeData?.interestPercent ? parseFloat(schemeData.interestPercent) : 0,
        gramRate: schemeData?.gramRate ? parseFloat(schemeData.gramRate) : 0,
        minimumGram: schemeData?.minimumGram ? parseFloat(schemeData.minimumGram) : 0,
        maturePeriod: schemeData?.maturePeriodMonths ? parseFloat(schemeData.maturePeriodMonths) : 0,
        interestRepaymentMonths: schemeData?.interestRepaymentMonths ? parseFloat(schemeData.interestRepaymentMonths) : 0,
        documentCharges: schemeData?.documentCharges ? parseFloat(schemeData.documentCharges) : 0,
        penaltyPercent: schemeData?.penaltyPercent ? parseFloat(schemeData.penaltyPercent) : 0
      };

      setLoading(true);
      if (selectedLoan) {
        await api.put(`/loans/${selectedLoan._id}`, payload);
        toast.success("Gold Loan details updated successfully!");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const res = await api.post('/loans', payload);
        toast.success("Gold Loan details saved successfully!");
        setTimeout(() => window.location.reload(), 1500);
      }
      
      if (close) {
         // Reset or redirect
         toast.success("Closing form...");
      }
      if (repledge) {
         navigate('/admin/repledge/entry');
      }

    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save loan.");
    } finally {
      setLoading(false);
    }
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
            <span className="text-sm text-black">{customerData.customerId || ''}</span>
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
            <span className="text-sm text-black">Select Scheme</span>
            <span className="text-sm text-black">:</span>
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
          
          <div className="grid grid-cols-[160px_10px_1fr] items-start">
            <span className="text-sm text-black">Select Jewel Image</span>
            <span className="text-sm text-black">:</span>
            <div className="flex flex-col gap-2">
              <a href="#" onClick={handleCaptureImage} className="text-blue-600 text-xs font-bold underline flex items-center gap-1">
                <Camera className="w-4 h-4" /> Capture Image
              </a>
              {capturedImage && (
                <div className="relative w-32 h-32 border border-gray-300 rounded shadow-sm overflow-hidden">
                  <img src={capturedImage} alt="Jewel" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setCapturedImage(null)} 
                    className="absolute top-1 right-1 bg-white rounded-full p-0.5 text-red-500 shadow hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Loan Details & Scheme Info */}
        <div className="space-y-4">
          <div className="space-y-2 mb-8">
            <div className="flex items-center justify-end gap-2">
              <label className="text-sm font-bold text-black w-28 text-right">Loan ID :</label>
              <input type="text" className="w-48 px-2 py-1 text-sm border border-gray-400 bg-[#e8e4f5] font-semibold focus:outline-none" value={selectedLoan ? (selectedLoan.loanId || selectedLoan.loanNo) : nextLoanIdPreview} readOnly />
            </div>
            <div className="flex items-center justify-end gap-2">
              <label className="text-sm font-bold text-black w-28 text-right">Date :</label>
              <input type="date" className="w-48 px-2 py-1 text-sm border border-gray-400 bg-white focus:outline-none" value={loanDetails.loanStartDate} onChange={(e) => setLoanDetails({...loanDetails, loanStartDate: e.target.value})} disabled={!!selectedLoan} />
            </div>
            <div className="flex items-center justify-end gap-2">
              <label className="text-sm font-bold text-black w-28 text-right">Matured Date :</label>
              <input type="date" className="w-48 px-2 py-1 text-sm border border-gray-400 bg-white focus:outline-none" value={loanDetails.loanEndDate} onChange={(e) => setLoanDetails({...loanDetails, loanEndDate: e.target.value})} disabled={!!selectedLoan} />
            </div>
            <div className="flex items-center justify-end gap-2">
              <label className="text-sm font-bold text-black w-28 text-right">Employee :</label>
              <select className="w-48 px-2 py-1 text-sm border border-gray-400 bg-[#e8e4f5] font-semibold focus:outline-none">
                <option>Admin</option>
              </select>
            </div>
          </div>

          {/* Scheme Detail Display Block */}
          {schemeData && schemeData.schemeId && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-12 pl-4">
              <div className="grid grid-cols-[120px_10px_1fr] items-center">
                <span className="text-sm font-bold text-black">Interest %</span>
                <span className="text-sm font-bold text-black">:</span>
                <span className="text-sm font-bold text-black">{schemeData.interestPercent || 0}</span>
              </div>
              <div className="grid grid-cols-[140px_10px_1fr] items-center">
                <span className="text-sm font-bold text-black">Interest Repayment</span>
                <span className="text-sm font-bold text-black">:</span>
                <span className="text-sm font-bold text-black">{schemeData.interestRepaymentMonths ? `${schemeData.interestRepaymentMonths} Days` : '0 Days'}</span>
              </div>
              <div className="grid grid-cols-[120px_10px_1fr] items-center">
                <span className="text-sm font-bold text-black">Amount Rs</span>
                <span className="text-sm font-bold text-black">:</span>
                <span className="text-sm font-bold text-black">{schemeData.amountRs || '0.000'}</span>
              </div>
              <div className="col-span-1"></div> {/* Spacer */}
              <div className="grid grid-cols-[120px_10px_1fr] items-center">
                <span className="text-sm font-bold text-black">Gram Rate</span>
                <span className="text-sm font-bold text-black">:</span>
                <span className="text-sm font-bold text-black">{schemeData.gramRate || 0}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <hr className="border-gray-200 mt-8 mb-4" />

      {/* Tables Area */}
      <div className="space-y-4">
        
        {/* Article Details Table */}
        <div>
          <div className="overflow-x-auto border border-gray-200 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-black text-white text-xs">
                <tr>
                  <th className="px-3 py-2 border-r border-gray-700 text-center">Category</th>
                  <th className="px-3 py-2 border-r border-gray-700 text-center">Jewel Details</th>
                  <th className="px-3 py-2 border-r border-gray-700 text-center">Quantity</th>
                  <th className="px-3 py-2 border-r border-gray-700 text-center">Tot.Weight</th>
                  <th className="px-3 py-2 border-r border-gray-700 text-center">Stone Wt</th>
                  <th className="px-3 py-2 border-r border-gray-700 text-center">Nett.Wt</th>
                  <th className="px-3 py-2 border-r border-gray-700 text-center">Purity</th>
                  <th className="px-3 py-2 border-r border-gray-700 text-center">Gram Rate</th>
                  <th className="px-3 py-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((art, idx) => (
                  <tr key={idx} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-0 border-r border-gray-200"><input className="w-full h-full px-2 py-1.5 focus:outline-none" value={art.category} onChange={e => handleArticleChange(idx, 'category', e.target.value)} list="jewellery-categories" /></td>
                    <td className="p-0 border-r border-gray-200"><input className="w-full h-full px-2 py-1.5 focus:outline-none" value={art.jewelDetails} onChange={e => handleArticleChange(idx, 'jewelDetails', e.target.value)} /></td>
                    <td className="p-0 border-r border-gray-200"><input type="number" className="w-full h-full px-2 py-1.5 focus:outline-none text-center" value={art.quantity} onChange={e => handleArticleChange(idx, 'quantity', e.target.value)} /></td>
                    <td className="p-0 border-r border-gray-200"><input type="number" className="w-full h-full px-2 py-1.5 focus:outline-none text-center" value={art.totWeight} onChange={e => handleArticleChange(idx, 'totWeight', e.target.value)} /></td>
                    <td className="p-0 border-r border-gray-200"><input type="number" className="w-full h-full px-2 py-1.5 focus:outline-none text-center" value={art.stoneWt} onChange={e => handleArticleChange(idx, 'stoneWt', e.target.value)} /></td>
                    <td className="p-0 border-r border-gray-200"><input type="number" className="w-full h-full px-2 py-1.5 focus:outline-none text-center" value={art.nettWt} onChange={e => handleArticleChange(idx, 'nettWt', e.target.value)} /></td>
                    <td className="p-0 border-r border-gray-200"><input className="w-full h-full px-2 py-1.5 focus:outline-none text-center" value={art.purity} onChange={e => handleArticleChange(idx, 'purity', e.target.value)} /></td>
                    <td className="p-0 border-r border-gray-200"><input type="number" className="w-full h-full px-2 py-1.5 focus:outline-none text-center" value={art.gramRate} onChange={e => handleArticleChange(idx, 'gramRate', e.target.value)} /></td>
                    <td className="p-0"><input type="number" className="w-full h-full px-2 py-1.5 focus:outline-none text-center" value={art.total} onChange={e => handleArticleChange(idx, 'total', e.target.value)} onBlur={(e) => { if (e.target.value && idx === articles.length - 1) addArticleRow(); }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Totals */}
        <div className="flex flex-col items-center mt-6 gap-2">
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm font-bold text-blue-900 w-48 text-right uppercase">Total Weight in gms</span>
            <span className="text-sm font-bold text-black">:</span>
            <div className="w-48 text-center text-sm font-bold text-black">
               {aggregateTotalWt > 0 ? aggregateTotalWt.toFixed(2) : '0.00'}
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm font-bold text-blue-900 w-48 text-right uppercase">Total Loan Amount</span>
            <span className="text-sm font-bold text-black">:</span>
            <div className="w-48 text-center text-sm font-bold text-black">
               <input type="number" className="w-full bg-white border border-gray-300 text-center focus:outline-none" value={loanDetails.loanAmount} onChange={(e) => handleLoanChange('loanAmount', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-2 mt-8">
            <button disabled={loading} onClick={() => handleSave(false, false)} className="bg-[#8b0000] text-white px-6 py-2 text-sm font-bold rounded-sm disabled:opacity-50">Save</button>
            <button disabled={loading} className="bg-[#8b0000] text-white px-6 py-2 text-sm font-bold rounded-sm disabled:opacity-50">Cancel</button>
            <button disabled={loading} onClick={() => handleSave(true, false)} className="bg-[#8b0000] text-white px-6 py-2 text-sm font-bold rounded-sm disabled:opacity-50">Save & Close</button>
            <button disabled={loading} onClick={() => handleSave(true, true)} className="bg-[#8b0000] text-white px-6 py-2 text-sm font-bold rounded-sm disabled:opacity-50">Close & Repledge</button>
        </div>
      </div>
      {/* Web Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg overflow-hidden w-full max-w-2xl shadow-2xl animate-fade-in">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Camera className="w-5 h-5 text-black" /> Capture Jewel Image
              </h3>
              <button onClick={closeCamera} className="text-gray-500 hover:text-red-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 flex flex-col items-center bg-black">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full max-h-[60vh] object-contain rounded border border-gray-700 bg-black"
              />
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t">
              <button 
                onClick={closeCamera} 
                className="px-6 py-2 border border-gray-400 rounded text-gray-700 hover:bg-gray-100 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={takeSnapshot} 
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium flex items-center gap-2"
              >
                <Camera className="w-5 h-5" /> Snap Picture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Datalist for Jewellery Categories autocomplete */}
      <datalist id="jewellery-categories">
        <option value="Necklace" />
        <option value="Chain" />
        <option value="Bangle" />
        <option value="Bracelet" />
        <option value="Ring" />
        <option value="Earring" />
        <option value="Pendant" />
        <option value="Nose Ring / Nose Pin" />
        <option value="Anklet" />
        <option value="Toe Ring" />
        <option value="Mangalsutra / Thali" />
        <option value="Jewellery Set" />
        <option value="Brooch" />
        <option value="Hair Jewellery" />
        <option value="Kids Jewellery" />
        <option value="Gold Coin" />
        <option value="Gold Bar" />
        <option value="Silver Jewellery" />
        <option value="Diamond Jewellery" />
        <option value="Platinum Jewellery" />
      </datalist>

    </div>
  );
};

export default GoldLoanForm;
