import { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Save, Printer, Calculator, RefreshCw, FileText, IndianRupee } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import { TD, TR } from '../../../components/ui/Table';

const RepledgeRepaymentMaster = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  
  const [formData, setFormData] = useState({
    repaymentId: 'RR-1001', // Auto-generated
    loanNumber: '',
    borrowerName: '',
    repaymentDate: new Date().toISOString().split('T')[0],
    principalAmount: '',
    interestAmount: '',
    penaltyAmount: '',
    totalAmount: '',
    paymentMode: 'Cash',
    remarks: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/repledges/repayments');
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch repayments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCalculate = () => {
    const p = parseFloat(formData.principalAmount) || 0;
    const i = parseFloat(formData.interestAmount) || 0;
    const pen = parseFloat(formData.penaltyAmount) || 0;
    const total = p + i + pen;
    setFormData(prev => ({ ...prev, totalAmount: total.toFixed(2) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = { ...formData };
      // Let backend auto-generate repaymentId
      delete dataToSave.repaymentId; 
      if (!dataToSave.penaltyAmount) dataToSave.penaltyAmount = 0;
      if (!dataToSave.totalAmount) dataToSave.totalAmount = 0;

      await api.post('/repledges/repayments', dataToSave);
      toast.success('Repayment saved successfully');
      fetchData();
      handleReset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save repayment');
    }
  };

  const handlePrint = () => {
    console.log('Printing receipt for:', formData);
    alert('Printing Receipt...');
  };

  const handleReset = () => {
    setFormData({
      repaymentId: 'RR-1001',
      loanNumber: '',
      borrowerName: '',
      repaymentDate: new Date().toISOString().split('T')[0],
      principalAmount: '',
      interestAmount: '',
      penaltyAmount: '',
      totalAmount: '',
      paymentMode: 'Cash',
      remarks: ''
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="Repledge Repayment Master" 
        subtitle="Manage Repayments for Repledged Loans" 
        icon={IndianRupee} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-5">
          <div className="">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Repayment Details</h3>
            <form onSubmit={handleSave} className="space-y-4 form-spiritual-bg">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Repayment ID" 
                  name="repaymentId" 
                  value={formData.repaymentId} 
                  disabled 
                />
                <Input 
                  label="Repayment Date" 
                  name="repaymentDate" 
                  type="date"
                  value={formData.repaymentDate} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Loan Number" 
                  name="loanNumber" 
                  value={formData.loanNumber} 
                  onChange={handleInputChange} 
                  required 
                />
                <Input 
                  label="Borrower Name" 
                  name="borrowerName" 
                  value={formData.borrowerName} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-none border border-gray-200 space-y-4 my-2">
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Principal Amount" 
                    name="principalAmount" 
                    type="number"
                    step="0.01"
                    value={formData.principalAmount} 
                    onChange={handleInputChange} 
                    required 
                  />
                  <Input 
                    label="Interest Amount" 
                    name="interestAmount" 
                    type="number"
                    step="0.01"
                    value={formData.interestAmount} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Penalty Amount" 
                    name="penaltyAmount" 
                    type="number"
                    step="0.01"
                    value={formData.penaltyAmount} 
                    onChange={handleInputChange} 
                  />
                  <Input 
                    label="Total Amount" 
                    name="totalAmount" 
                    type="number"
                    step="0.01"
                    value={formData.totalAmount} 
                    onChange={handleInputChange} 
                    readOnly
                    className="font-bold text-gray-900 bg-white"
                  />
                </div>
              </div>

              <Select 
                label="Payment Mode" 
                name="paymentMode" 
                value={formData.paymentMode} 
                onChange={handleInputChange}
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="UPI">UPI</option>
              </Select>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea 
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  rows="2"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="secondary" icon={Calculator} className="w-full justify-center" onClick={handleCalculate}>Calculate</Button>
                <Button type="submit" variant="primary" icon={Save} className="w-full justify-center">Save</Button>
                <Button type="button" variant="secondary" icon={Printer} className="w-full justify-center" onClick={handlePrint}>Print</Button>
                <Button type="button" variant="secondary" icon={RefreshCw} className="col-span-3 justify-center" onClick={handleReset}>Reset Form</Button>
              </div>
            </form>
          </div>
        </div>

        {/* Table Section */}
        <div className="lg:col-span-7">
          <div className="overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Recent Repayments</h3>
            </div>
            <DataTable
              headers={['Repayment ID', 'Date', 'Loan No', 'Borrower', 'Amount', 'Mode']}
              data={data}
              loading={loading}
              renderRow={(item) => (
                <TR key={item._id}>
                  <TD className="font-medium">{item.repaymentId}</TD>
                  <TD>{item.repaymentDate}</TD>
                  <TD className="font-bold text-gray-800">{item.loanNumber}</TD>
                  <TD>{item.borrowerName}</TD>
                  <TD className="font-bold text-green-600">₹{item.totalAmount}</TD>
                  <TD>{item.paymentMode}</TD>
                </TR>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default RepledgeRepaymentMaster;
