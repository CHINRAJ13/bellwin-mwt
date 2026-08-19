import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';


import api from '../../../services/api';

const COMMON_CATEGORIES = [
  'Office Rent', 'EB / Current Bill', 'Staff Salary', 'Internet / Phone Bill', 'Water Bill', 'Security Charges', 'Office Cleaning / Hygiene', 'Software Subscription / IT Support', 'Printing & Xerox', 'Audit / Legal Fees', 'Postage / Courier', 'Insurance Premium', 'Gold Purchase Expense', 'Silver Purchase Expense', 'Interest Expense', 'Tax / License Fees', 'Staff Welfare', 'Customer Gifts / Festive Promo', 'Generator / Fuel Expenses', 'Machinery / Tools Purchase', 'Donation / Charity',
  'Stationery', 'Travel Expense', 'Gold Testing / Hallmark Expense',
  'Repair / Maintenance', 'Marketing / Advertisement', 'Bank Charges',
  'Tea / Food / Office Expense', 'Miscellaneous Expense'
];

const AddExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [formData, setFormData] = useState({
    expenseId: '',
    expenseDate: '',

    expenseCategory: '',
    expenseSubCategory: '',
    expenseAmount: '',
    paymentMode: '',
    paidToVendorName: '',
    description: '',
    billInvoiceNo: '',
    billReceiptUpload: '',
    approvedBy: '',
    enteredBy: '',
    gstIncluded: false,
    taxAmount: '',
    paymentReferenceNo: ''
  });

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (isEdit) {
      fetchExpenseData();
    } else {
      fetchNextId();
    }
  }, [isEdit, id]);

  const fetchNextId = async () => {
    try {
      const res = await api.get('/expenses/next-id');
      if (res.data && res.data.nextId) {
        setFormData(prev => ({ ...prev, expenseId: res.data.nextId }));
      }
    } catch (err) {
      console.error('Error fetching next ID:', err);
    }
  };

  const fetchExpenseData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/expenses/${id}`);
      const exp = res.data;
      if (exp) {
        setFormData({
          expenseId: exp.expenseId || '',
          expenseDate: exp.expenseDate ? new Date(exp.expenseDate).toISOString().split('T')[0] : '',
          expenseCategory: exp.expenseCategory || '',
          expenseSubCategory: exp.expenseSubCategory || '',
          expenseAmount: exp.expenseAmount || '',
          paymentMode: exp.paymentMode || '',
          paidToVendorName: exp.paidToVendorName || '',
          description: exp.description || '',
          billInvoiceNo: exp.billInvoiceNo || '',
          billReceiptUpload: exp.billReceiptUpload || '',
          approvedBy: exp.approvedBy || '',
          enteredBy: exp.enteredBy || '',
          gstIncluded: exp.gstIncluded || false,
          taxAmount: exp.taxAmount || '',
          paymentReferenceNo: exp.paymentReferenceNo || ''
        });
      }
    } catch (err) {
      console.error('Error fetching expense details:', err);
      toast.error('Failed to load expense details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      if (file) {
        submitData.append('expenseImage', file);
      }

      let response;
      if (isEdit) {
        response = await api.put(`/expenses/${id}`, submitData);
      } else {
        response = await api.post('/expenses', submitData);
      }

      if (response.status === 201 || response.status === 200) {
        toast.success(isEdit ? 'Expense updated successfully!' : 'Expense added successfully!');
        if (isEdit) {
          navigate('/admin/expense/report');
        } else {
        // Reset form
        setFormData({
          expenseId: '', expenseDate: '', expenseCategory: '',
          expenseSubCategory: '', expenseAmount: '', paymentMode: '', paidToVendorName: '',
          description: '', billInvoiceNo: '', billReceiptUpload: '', approvedBy: '',
          enteredBy: '', gstIncluded: false, taxAmount: '', paymentReferenceNo: ''
        });
        setFile(null);
        if (document.getElementById('billReceiptUpload')) {
          document.getElementById('billReceiptUpload').value = '';
        }
        fetchNextId();
      }
      } else {
        toast.error(response.data.message || (isEdit ? 'Failed to update expense' : 'Failed to add expense'));
      }
    } catch (error) {
      console.error(isEdit ? 'Error updating expense:' : 'Error adding expense:', error);
      toast.error(error.response?.data?.message || (isEdit ? 'An error occurred while updating the expense.' : 'An error occurred while adding the expense.'));
    } finally {
      setLoading(false);
    }
  };





























  const inp = "w-full px-3 py-1.5 text-base bg-white border border-gray-300 shadow-sm rounded-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors";
  const lbl = "block text-sm font-semibold text-gray-700 mb-0.5";

  return (
    <div className="flex flex-col h-full bg-gray-50/30 p-6">
      <div className="mb-6 shrink-0 flex items-center justify-between border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          {isEdit ? 'Edit Expense' : 'Add New Expense'}
        </h2>
{/* Removed export buttons */}







      </div>

      <div className="flex-1 overflow-y-auto">
        <form id="add-expense-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Details Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Basic Details</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className={lbl}>Expense ID / Voucher No <span className="text-red-500">*</span></label>
                <input required disabled={isEdit} type="text" name="expenseId" value={formData.expenseId} onChange={handleChange} className={`${inp} ${isEdit ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} placeholder="EXP-001" />
              </div>
              <div>
                <label className={lbl}>Expense Date <span className="text-red-500">*</span></label>
                <input required type="date" name="expenseDate" value={formData.expenseDate} onChange={handleChange} className={inp} />
              </div>
              <div>
                <label className={lbl}>Expense Category <span className="text-red-500">*</span></label>
                <select required name="expenseCategory" value={formData.expenseCategory} onChange={handleChange} className={inp}>
                  <option value="">Select Category</option>
                  {COMMON_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Expense Sub Category</label>
                <input type="text" name="expenseSubCategory" value={formData.expenseSubCategory} onChange={handleChange} className={inp} placeholder="Optional" />
              </div>
              <div>
                <label className={lbl}>Expense Amount <span className="text-red-500">*</span></label>
                <input required type="number" name="expenseAmount" value={formData.expenseAmount} onChange={handleChange} className={inp} placeholder="0.00" />
              </div>
              <div>
                <label className={lbl}>Payment Mode <span className="text-red-500">*</span></label>
                <select required name="paymentMode" value={formData.paymentMode} onChange={handleChange} className={inp}>
                  <option value="">Select Mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Paid To / Vendor Name <span className="text-red-500">*</span></label>
                <input required type="text" name="paidToVendorName" value={formData.paidToVendorName} onChange={handleChange} className={inp} placeholder="Vendor Name" />
              </div>
              <div className="col-span-3">
                <label className={lbl}>Description / Remarks</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className={`${inp} resize-none`} placeholder="Additional remarks..."></textarea>
              </div>
            </div>
          </div>

          {/* Extra Details Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Extra Details</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className={lbl}>Bill No / Invoice No</label>
                <input type="text" name="billInvoiceNo" value={formData.billInvoiceNo} onChange={handleChange} className={inp} placeholder="Invoice Number" />
              </div>
              <div>
                <label className={lbl}>Bill / Item Image Upload</label>
                <input type="file" id="billReceiptUpload" name="billReceiptUpload" accept="image/*,.pdf" onChange={handleFileChange} className={`${inp} file:mr-4 file:py-0.5 file:px-3 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100`} />
              </div>
              <div>
                <label className={lbl}>Payment Reference No</label>
                <input type="text" name="paymentReferenceNo" value={formData.paymentReferenceNo} onChange={handleChange} className={inp} placeholder="Transaction ID" />
              </div>
              <div>
                <label className={lbl}>Approved By</label>
                <input type="text" name="approvedBy" value={formData.approvedBy} onChange={handleChange} className={inp} placeholder="Manager Name" />
              </div>
              <div>
                <label className={lbl}>Entered By</label>
                <input type="text" name="enteredBy" value={formData.enteredBy} onChange={handleChange} className={inp} placeholder="Staff Name" />
              </div>
              
              <div className="flex gap-4 flex-row col-span-3 items-center mt-2">
                <div className="flex items-center">
                  <input type="checkbox" id="gstIncluded" name="gstIncluded" checked={formData.gstIncluded} onChange={handleChange} className="w-4 h-4 text-erp-green border-gray-300 rounded-none focus:ring-erp-green" />
                  <label htmlFor="gstIncluded" className="ml-2 block text-sm font-semibold text-gray-700">GST Included (Yes/No)</label>
                </div>
                {formData.gstIncluded && (
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-semibold text-gray-700">Tax Amount</label>
                    <input type="number" name="taxAmount" value={formData.taxAmount} onChange={handleChange} className="w-32 px-3 py-1 border border-gray-300 rounded-none focus:outline-none focus:ring-1 focus:ring-erp-green" placeholder="0.00" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200">
            <button type="button" onClick={() => window.history.back()} className="px-6 py-2 border border-gray-300 rounded-none hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-semibold">
              Cancel
            </button>
            <button type="submit" form="add-expense-form" disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-none hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2 text-sm font-semibold disabled:opacity-50">
              {loading ? 'Saving Expense...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
