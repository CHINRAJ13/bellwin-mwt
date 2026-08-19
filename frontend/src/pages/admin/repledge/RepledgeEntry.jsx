import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { 
  Search, Calculator, Save, Send, CheckCircle, 
  XCircle, Printer, RotateCcw, FileText, Upload
} from 'lucide-react';

export default function RepledgeEntry() {
  const [formData, setFormData] = useState({
    // Loan Details
    repledgeId: 'REP-0001',
    oldLoanNumber: '',
    newLoanNumber: 'LN-0002',
    borrowerName: '',
    memberId: '',
    branch: '',
    repledgeDate: new Date().toISOString().split('T')[0],
    
    // Existing Loan Details
    existingLoanAmount: '',
    outstandingAmount: '',
    interestDue: '',
    penaltyAmount: '',
    totalAmountPayable: '',
    previousLoanDate: '',
    loanStatus: 'Active',
    
    // Gold Details
    itemName: '',
    itemCount: '',
    grossWeight: '',
    netWeight: '',
    purity: '22K',
    currentGoldRate: '',
    goldValue: '',
    
    // New Loan Details
    newLoanScheme: '',
    eligibleLoanAmount: '',
    approvedLoanAmount: '',
    interestRate: '',
    loanPeriod: '',
    maturityDate: '',
    
    // Approval Details
    valuerName: '',
    verifiedBy: '',
    approvedBy: '',
    approvalDate: '',
    approvalStatus: 'Pending',
    remarks: '',
    
    // Payment Details
    outstandingAdjusted: '',
    cashPaidToCustomer: '',
    balanceAmount: '',
    paymentMode: 'Cash',
    transactionNumber: '',
    
    // Status
    status: 'Pending'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Completed', label: 'Completed' }
  ];

  const handleSave = async () => {
    if (!formData.oldLoanNumber) {
      toast.error('Old Loan Number is required to process repledge');
      return;
    }

    try {
      const payload = {
        loanId: formData.oldLoanNumber,
        newStatus: 'Active',
        additionalLoanAmount: formData.approvedLoanAmount || 0,
        newInterestRate: formData.interestRate || null,
        newDueDate: formData.maturityDate || null,
        repledgeDate: formData.repledgeDate,
        changedBy: formData.verifiedBy || 'Admin',
        approvalStatus: formData.approvalStatus || 'Pending',
        approvedBy: formData.approvedBy || '',
        approvalDate: formData.approvalDate || null,
        reasonForChange: 'Repledge Processed via Form',
        remarks: formData.remarks || ''
      };
      
      await api.post('/repledges', payload);
      toast.success('Repledge record saved successfully!');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to save repledge');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <PageHeader
        title="Repledge Entry"
        subtitle="Process loan renewals, repledging of items, and settlement adjustments"
        icon={<FileText size={24} className="text-white" />}
        color="bg-purple-600"
      />

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Loan Details */}
        <div title="Loan Details" icon={FileText} color="text-blue-600">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 p-2">
            <Input label="Repledge ID" name="repledgeId" value={formData.repledgeId} readOnly disabled className="bg-gray-50" />
            
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input label="Old Loan Number" name="oldLoanNumber" value={formData.oldLoanNumber} onChange={handleChange} placeholder="Search by ID, Name or Phone Number..." />
              </div>
              <button className="h-11 w-11 rounded-none bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer mb-[1px]">
                <Search size={18} />
              </button>
            </div>
            
            <Input label="New Loan Number" name="newLoanNumber" value={formData.newLoanNumber} readOnly disabled className="bg-gray-50" />
            <Input label="Borrower Name" name="borrowerName" value={formData.borrowerName} onChange={handleChange} />
            <Input label="Member ID" name="memberId" value={formData.memberId} onChange={handleChange} />
            <Input label="Branch" name="branch" value={formData.branch} onChange={handleChange} />
            <Input type="date" label="Repledge Date" name="repledgeDate" value={formData.repledgeDate} onChange={handleChange} />
          </div>
        </div>

        {/* Existing Loan Details & Gold Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div title="Existing Loan Details" color="text-orange-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
              <Input type="number" label="Existing Loan Amount" name="existingLoanAmount" value={formData.existingLoanAmount} onChange={handleChange} />
              <Input type="number" label="Outstanding Amount" name="outstandingAmount" value={formData.outstandingAmount} onChange={handleChange} />
              <Input type="number" label="Interest Due" name="interestDue" value={formData.interestDue} onChange={handleChange} />
              <Input type="number" label="Penalty Amount" name="penaltyAmount" value={formData.penaltyAmount} onChange={handleChange} />
              <Input type="number" label="Total Amount Payable" name="totalAmountPayable" value={formData.totalAmountPayable} onChange={handleChange} className="bg-orange-50 font-bold text-orange-900 border-orange-200" />
              <Input type="date" label="Previous Loan Date" name="previousLoanDate" value={formData.previousLoanDate} onChange={handleChange} />
              <Select label="Loan Status" name="loanStatus" value={formData.loanStatus} onChange={handleChange} options={[
                { value: 'Active', label: 'Active' },
                { value: 'Overdue', label: 'Overdue' }
              ]} />
            </div>
          </div>

          <div title="Gold Details" color="text-yellow-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
              <Input label="Item Name" name="itemName" value={formData.itemName} onChange={handleChange} />
              <Input type="number" label="Item Count" name="itemCount" value={formData.itemCount} onChange={handleChange} />
              <Input type="number" label="Gross Weight (gm)" name="grossWeight" value={formData.grossWeight} onChange={handleChange} />
              <Input type="number" label="Net Weight (gm)" name="netWeight" value={formData.netWeight} onChange={handleChange} />
              <Select label="Purity" name="purity" value={formData.purity} onChange={handleChange} options={[
                { value: '24K', label: '24K (99.9%)' },
                { value: '22K', label: '22K (91.6%)' },
                { value: '18K', label: '18K (75.0%)' }
              ]} />
              <Input type="number" label="Current Gold Rate" name="currentGoldRate" value={formData.currentGoldRate} onChange={handleChange} />
              <Input type="number" label="Gold Value" name="goldValue" value={formData.goldValue} onChange={handleChange} className="bg-yellow-50 font-bold text-yellow-900 border-yellow-200" />
            </div>
          </div>
        </div>

        {/* New Loan Details */}
        <div title="New Loan Details" color="text-green-600">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 p-2">
            <Select label="New Loan Scheme" name="newLoanScheme" value={formData.newLoanScheme} onChange={handleChange} options={[
              { value: '', label: 'Select Scheme' },
              { value: 'GL-Standard', label: 'Standard Gold Loan' },
              { value: 'GL-Premium', label: 'Premium Gold Loan' }
            ]} />
            <Input type="number" label="Eligible Loan Amount" name="eligibleLoanAmount" value={formData.eligibleLoanAmount} onChange={handleChange} />
            <Input type="number" label="Approved Loan Amount" name="approvedLoanAmount" value={formData.approvedLoanAmount} onChange={handleChange} className="bg-green-50 border-green-200 font-bold text-green-900" />
            <Input type="number" label="Interest Rate (%)" name="interestRate" value={formData.interestRate} onChange={handleChange} />
            <Input type="number" label="Loan Period (Months)" name="loanPeriod" value={formData.loanPeriod} onChange={handleChange} />
            <Input type="date" label="Maturity Date" name="maturityDate" value={formData.maturityDate} onChange={handleChange} />
          </div>
        </div>

        {/* Payment Details */}
        <div title="Payment Details" color="text-indigo-600">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 p-2">
            <Input type="number" label="Outstanding Adjusted" name="outstandingAdjusted" value={formData.outstandingAdjusted} onChange={handleChange} />
            <Input type="number" label="Cash Paid to Customer" name="cashPaidToCustomer" value={formData.cashPaidToCustomer} onChange={handleChange} />
            <Input type="number" label="Balance Amount" name="balanceAmount" value={formData.balanceAmount} onChange={handleChange} />
            <Select label="Payment Mode" name="paymentMode" value={formData.paymentMode} onChange={handleChange} options={[
              { value: 'Cash', label: 'Cash' },
              { value: 'Bank Transfer', label: 'Bank Transfer' },
              { value: 'UPI', label: 'UPI' }
            ]} />
            <Input label="Transaction Number" name="transactionNumber" value={formData.transactionNumber} onChange={handleChange} />
          </div>
        </div>

        {/* Approval & Status Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div title="Approval Details" color="text-purple-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
              <Input label="Valuer Name" name="valuerName" value={formData.valuerName} onChange={handleChange} />
              <Input label="Verified By" name="verifiedBy" value={formData.verifiedBy} onChange={handleChange} />
              <Input label="Approved By" name="approvedBy" value={formData.approvedBy} onChange={handleChange} />
              <Input type="date" label="Approval Date" name="approvalDate" value={formData.approvalDate} onChange={handleChange} />
              <div className="md:col-span-2">
                <Input label="Remarks" name="remarks" value={formData.remarks} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div title="Documents" color="text-gray-700">
              <div className="grid grid-cols-2 gap-4 p-2">
                {[
                  { label: 'Previous Loan Document', key: 'doc1' },
                  { label: 'Repledge Agreement', key: 'doc2' },
                  { label: 'Customer Signature', key: 'doc3' },
                  { label: 'Employee Signature', key: 'doc4' }
                ].map((doc) => (
                  <div key={doc.key} className="border border-dashed border-gray-300 rounded-none p-4 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 transition-colors cursor-pointer group">
                    <Upload size={20} className="text-gray-400 group-hover:text-indigo-500 mb-2" />
                    <span className="text-xs font-semibold text-gray-600 group-hover:text-indigo-700">{doc.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div title="Final Status">
              <div className="p-2">
                <Select label="Status" name="status" value={formData.status} onChange={handleChange} options={statusOptions} className="bg-indigo-50 font-bold border-indigo-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-8 mb-8">
          <Button variant="secondary" icon={RotateCcw}>Reset</Button>
          <Button variant="outline" icon={Search}>Search Old Loan</Button>
          <Button variant="outline" icon={Calculator}>Calculate</Button>
          <div className="w-px h-8 bg-gray-200 mx-1"></div>
          <Button variant="danger" icon={XCircle}>Reject</Button>
          <Button variant="success" icon={CheckCircle}>Approve</Button>
          <Button variant="outline" icon={Send}>Submit for Approval</Button>
          <Button variant="primary" icon={Printer}>Print Receipt</Button>
          <Button variant="primary" icon={Save} onClick={handleSave}>Save Repledge</Button>
        </div>

      </div>
    </div>
  );
}
