import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../../../services/api';

const MicroFinanceManager = ({ showAddForm, setShowAddForm }) => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    schemeName: '',
    interestRate: '',
    schemeType: 'Micro Finance',
    status: 'Active',
    
    // New MFI Fields
    mfiType: 'Individual Loan',
    minLoanAmount: '',
    maxLoanAmount: '',
    loanAmountBasis: 'Per Member',
    interestCalculationMethod: 'Flat',
    penaltyType: 'Fixed Amount',
    penaltyValue: '',
    penaltyCalculation: 'Per Overdue Installment',
    gracePeriodDays: '',
    tenureUnit: 'Months',
    minTenure: '',
    maxTenure: '',
    repaymentFrequency: 'Weekly',
    processingFeeType: 'Fixed Amount',
    processingFeeValue: '',
    insuranceFee: '',
    documentationFee: '',
    minGroupMembers: '',
    maxGroupMembers: ''
  });

  const fetchSchemes = async () => {
    try {
      const response = await api.get('/schemes?type=Micro Finance');
      if (response.status === 200) {
        setSchemes(response.data);
      }
    } catch (error) {
      console.error('Error fetching schemes:', error);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Frontend Validations
    if (Number(formData.minLoanAmount) > Number(formData.maxLoanAmount)) {
      toast.error("Minimum Loan Amount cannot be greater than Maximum Loan Amount");
      return;
    }
    if (Number(formData.minTenure) > Number(formData.maxTenure)) {
      toast.error("Minimum Tenure cannot be greater than Maximum Tenure");
      return;
    }
    if (formData.mfiType === 'Group Loan') {
      if (Number(formData.minGroupMembers) > Number(formData.maxGroupMembers)) {
        toast.error("Minimum Group Members cannot be greater than Maximum Group Members");
        return;
      }
    }

    setLoading(true);
    try {
      const response = await api.post('/schemes', formData);
      if (response.status === 201 || response.status === 200) {
        toast.success(`Micro Finance Scheme added successfully!`);
        setFormData({
          schemeName: '',
          interestRate: '',
          schemeType: 'Micro Finance',
          status: 'Active',
          mfiType: 'Individual Loan',
          minLoanAmount: '',
          maxLoanAmount: '',
          loanAmountBasis: 'Per Member',
          interestCalculationMethod: 'Flat',
          penaltyType: 'Fixed Amount',
          penaltyValue: '',
          penaltyCalculation: 'Per Overdue Installment',
          gracePeriodDays: '',
          tenureUnit: 'Months',
          minTenure: '',
          maxTenure: '',
          repaymentFrequency: 'Weekly',
          processingFeeType: 'Fixed Amount',
          processingFeeValue: '',
          insuranceFee: '',
          documentationFee: '',
          minGroupMembers: '',
          maxGroupMembers: ''
        });
        setShowAddForm(false);
        fetchSchemes();
      } else {
        toast.error('Failed to add scheme');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheme?')) return;
    try {
      const response = await api.delete(`/schemes/${id}`);
      if (response.status === 200) {
        toast.success('Scheme deleted');
        fetchSchemes();
      } else {
        toast.error('Failed to delete');
      }
    } catch (error) {
      toast.error('Error deleting scheme');
    }
  };

  const generateNextSchemeId = () => {
    if (!schemes || schemes.length === 0) return 'MF-001';
    let maxNum = 0;
    schemes.forEach(s => {
      if (s.schemeId && s.schemeId.startsWith('MF-')) {
        const num = parseInt(s.schemeId.split('-')[1]);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return `MF-${String(maxNum + 1).padStart(3, '0')}`;
  };

  const nextSchemeId = generateNextSchemeId();

  return (
    <>
      {showAddForm && (
        <div className="mb-6 bg-white p-6 border border-gray-200 rounded-xl shadow-sm animate-fade-in">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">New Micro Finance Scheme</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Basic Scheme Setup */}
            <div>
              <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-3 border-l-4 border-green-500 pl-2">1. Scheme Master</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Scheme ID</label>
                  <input readOnly type="text" value={nextSchemeId} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed font-semibold focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Scheme Name *</label>
                  <input required type="text" name="schemeName" value={formData.schemeName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green focus:border-erp-green" placeholder="e.g. Weekly Group Loan" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Scheme Type *</label>
                  <select name="mfiType" value={formData.mfiType} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-erp-green focus:border-erp-green">
                    <option value="Individual Loan">Individual Loan</option>
                    <option value="Group Loan">Group Loan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Loan Amount Setup */}
            <div>
              <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-3 border-l-4 border-green-500 pl-2">2. Loan Amount Setup</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Minimum Loan Amount * (₹)</label>
                  <input required type="number" min="0" name="minLoanAmount" value={formData.minLoanAmount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" placeholder="e.g. 10000" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Maximum Loan Amount * (₹)</label>
                  <input required type="number" min="0" name="maxLoanAmount" value={formData.maxLoanAmount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" placeholder="e.g. 50000" />
                </div>
                {formData.mfiType === 'Group Loan' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Loan Amount Basis *</label>
                    <select name="loanAmountBasis" value={formData.loanAmountBasis} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-erp-green">
                      <option value="Per Member">Per Member</option>
                      <option value="Per Group">Per Group</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Interest & Penalty Setup */}
            <div>
              <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-3 border-l-4 border-green-500 pl-2">3. Interest & Penalty Setup</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Interest Rate * (%)</label>
                  <input required type="number" step="any" min="0" name="interestRate" value={formData.interestRate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" placeholder="e.g. 24" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Calculation Method *</label>
                  <select name="interestCalculationMethod" value={formData.interestCalculationMethod} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-erp-green">
                    <option value="Flat">Flat</option>
                    <option value="Reducing Balance">Reducing Balance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Penalty Type *</label>
                  <select name="penaltyType" value={formData.penaltyType} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-erp-green">
                    <option value="Fixed Amount">Fixed Amount</option>
                    <option value="Percentage">Percentage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Penalty Value * ({formData.penaltyType === 'Fixed Amount' ? '₹' : '%'})
                  </label>
                  <input required type="number" step="any" min="0" name="penaltyValue" value={formData.penaltyValue} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" placeholder={formData.penaltyType === 'Fixed Amount' ? "50" : "2"} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Penalty Calculation *</label>
                  <select name="penaltyCalculation" value={formData.penaltyCalculation} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-erp-green">
                    <option value="Per Overdue Installment">Per Overdue Installment</option>
                    <option value="Per Overdue Day">Per Overdue Day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Grace Period (Days)</label>
                  <input type="number" min="0" name="gracePeriodDays" value={formData.gracePeriodDays} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" placeholder="e.g. 1" />
                </div>
              </div>
            </div>

            {/* Section 4: Tenure Setup */}
            <div>
              <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-3 border-l-4 border-green-500 pl-2">4. Loan Tenure Setup</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Tenure Unit *</label>
                  <select name="tenureUnit" value={formData.tenureUnit} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-erp-green">
                    <option value="Days">Days</option>
                    <option value="Months">Months</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Minimum Tenure * ({formData.tenureUnit})</label>
                  <input required type="number" min="1" name="minTenure" value={formData.minTenure} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Maximum Tenure * ({formData.tenureUnit})</label>
                  <input required type="number" min="1" name="maxTenure" value={formData.maxTenure} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Repayment Frequency *</label>
                  <select name="repaymentFrequency" value={formData.repaymentFrequency} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-erp-green">
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-Weekly">Bi-Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 5: Processing Fee & Charges */}
            <div>
              <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-3 border-l-4 border-green-500 pl-2">5. Processing Fee & Charges</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Processing Fee Type *</label>
                  <select name="processingFeeType" value={formData.processingFeeType} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-erp-green">
                    <option value="Fixed Amount">Fixed Amount</option>
                    <option value="Percentage">Percentage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Processing Fee * ({formData.processingFeeType === 'Fixed Amount' ? '₹' : '%'})
                  </label>
                  <input required type="number" step="any" min="0" name="processingFeeValue" value={formData.processingFeeValue} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" placeholder="e.g. 500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Insurance Fee (₹)</label>
                  <input type="number" min="0" name="insuranceFee" value={formData.insuranceFee} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" placeholder="e.g. 200" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Documentation Fee (₹)</label>
                  <input type="number" min="0" name="documentationFee" value={formData.documentationFee} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" placeholder="e.g. 100" />
                </div>
              </div>
            </div>

            {/* Section 6: Conditional Group Member Setup */}
            {formData.mfiType === 'Group Loan' && (
              <div>
                <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-3 border-l-4 border-green-500 pl-2">6. Group Member Setup</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Minimum Group Members *</label>
                    <input required type="number" min="1" name="minGroupMembers" value={formData.minGroupMembers} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" placeholder="e.g. 5" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Maximum Group Members *</label>
                    <input required type="number" min="1" name="maxGroupMembers" value={formData.maxGroupMembers} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-erp-green" placeholder="e.g. 20" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4 border-t pt-4">
              <button disabled={loading} type="submit" className="px-6 py-2 bg-erp-green text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 tracking-wide">
                {loading ? 'Saving...' : 'Save Scheme Configuration'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto h-full p-4">
          <h3 className="font-bold text-gray-700 mb-4">Existing Micro Finance Schemes</h3>
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-gray-50 border-y border-gray-200 text-gray-600">
              <tr>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Scheme ID</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Scheme Name</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">MFI Type</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Amount Range</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Interest Rate</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Tenure / Frequency</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Fees (Proc/Ins/Doc)</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Penalty Setup</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schemes.map((s) => {
                const limitAmountMin = s.minLoanAmount != null ? s.minLoanAmount : 0;
                const limitAmountMax = s.maxLoanAmount != null ? s.maxLoanAmount : (s.amountLimit || 0);
                const tenureMinVal = s.minTenure != null ? s.minTenure : 1;
                const tenureMaxVal = s.maxTenure != null ? s.maxTenure : (s.maturePeriodMonths || 0);
                const tUnit = s.tenureUnit || 'Months';
                
                const procVal = s.processingFeeValue != null ? s.processingFeeValue : 0;
                const procType = s.processingFeeType || 'Fixed Amount';
                const insuranceFeeVal = s.insuranceFee != null ? s.insuranceFee : 0;
                const docFeeVal = s.documentationFee != null ? s.documentationFee : (s.documentCharges || 0);

                const penType = s.penaltyType || 'Percentage';
                const penVal = s.penaltyValue != null ? s.penaltyValue : (s.penalty || 0);
                const penCalc = s.penaltyCalculation || 'Per Overdue Installment';
                const graceDays = s.gracePeriodDays != null ? s.gracePeriodDays : 0;

                return (
                  <tr key={s._id} className="bg-white hover:bg-gray-50 transition-colors text-gray-800">
                    <td className="p-3 text-sm font-semibold">{s.schemeId}</td>
                    <td className="p-3 text-sm font-medium">{s.schemeName}</td>
                    <td className="p-3 text-sm">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${s.mfiType === 'Group Loan' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                        {s.mfiType || 'Individual Loan'}
                      </span>
                      {s.mfiType === 'Group Loan' && (
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          Basis: {s.loanAmountBasis || 'Per Member'} | Min: {s.minGroupMembers || 0} - Max: {s.maxGroupMembers || 0}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-sm font-semibold text-gray-900">
                      ₹{limitAmountMin.toLocaleString('en-IN')} - ₹{limitAmountMax.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-sm">
                      <div className="font-semibold text-gray-800">{s.interestRate}%</div>
                      <div className="text-[10px] text-gray-400">{s.interestCalculationMethod || 'Flat'}</div>
                    </td>
                    <td className="p-3 text-sm">
                      <div className="font-medium">{tenureMinVal} - {tenureMaxVal} {tUnit}</div>
                      <div className="text-[11px] text-green-600 font-bold">{s.repaymentFrequency || 'Weekly'}</div>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      <div className="text-[11px]">Proc: <span className="font-semibold">{procType === 'Percentage' ? `${procVal}%` : `₹${procVal}`}</span></div>
                      <div className="text-[11px]">Ins: <span className="font-semibold">₹{insuranceFeeVal}</span></div>
                      <div className="text-[11px]">Doc: <span className="font-semibold">₹{docFeeVal}</span></div>
                    </td>
                    <td className="p-3 text-sm text-red-600">
                      <div className="font-bold">{penType === 'Percentage' ? `${penVal}%` : `₹${penVal}`}</div>
                      <div className="text-[10px] text-gray-400">{penCalc}</div>
                      {graceDays > 0 && <div className="text-[9px] text-gray-500 font-mono">Grace: {graceDays} Day(s)</div>}
                    </td>
                    <td className="p-3 text-sm text-right">
                      <button onClick={() => handleDelete(s._id)} className="text-red-500 hover:text-red-700 font-bold px-3 py-1 bg-red-50 rounded-md">Delete</button>
                    </td>
                  </tr>
                );
              })}
              {schemes.length === 0 && (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-500">No Micro Finance Schemes found. Use the form above to add one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default MicroFinanceManager;
