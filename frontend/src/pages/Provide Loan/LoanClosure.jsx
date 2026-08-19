import React, { useState } from 'react';
import { Search, Printer, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import logo from '../../assets/Logo 1.png';

const LoanClosure = () => {
  const [searchId, setSearchId] = useState('');
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    try {
      const response = await api.get(`/loans/${searchId}`);
      if (response.data) {
        if (response.data.status !== 'Closed' && response.data.remainingLoanAmount > 0) {
          toast.error('This loan is not closed yet (Outstanding balance exists).');
          setLoan(null);
        } else {
          setLoan(response.data);
          toast.success('Loan found successfully');
        }
      }
    } catch (error) {
      console.error('Error fetching loan:', error);
      toast.error(error.response?.data?.message || 'Loan not found');
      setLoan(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6">
      {/* Non-printable search section */}
      <div className="mb-6 print:hidden">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Loan Closure NOC</h1>
        </div>

        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-4 items-end form-spiritual-bg">
            <div className="flex-1">
              <Input
                label="Enter Loan ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="e.g., LOAN00001"
              />
            </div>
            <Button type="submit" disabled={loading} className="flex items-center gap-2 h-10 px-6">
              <Search size={20} />
              {loading ? 'Searching...' : 'Search Loan'}
            </Button>
          </form>
        </div>
      </div>

      {loan && (
        <>
          <div className="print:hidden flex justify-end mb-4">
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <Printer size={20} />
              Print NOC Certificate
            </Button>
          </div>

          {/* Printable NOC Document Area */}
          <div className="bg-white p-10 border border-gray-300 shadow-lg mx-auto max-w-4xl min-h-[800px] print:border-none print:shadow-none print:p-0 print:m-0">
            {/* Document Header */}
            <div className="text-center border-b-2 border-gray-800 pb-6 mb-8 flex flex-col items-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <img src={logo} alt="Belwin Jewels Logo" className="w-16 h-16 object-contain" />
                <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Belwin Group of Company</h1>
              </div>
              <h3 className="text-lg font-bold text-gray-600">Loan Closure Confirmation</h3>
              <p className="text-sm text-gray-500 mt-2">Date: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="mb-8">
              <p className="text-lg leading-relaxed text-gray-800 text-justify">
                This is to certify that the loan account bearing <strong>Loan ID: {loan.loanId}</strong> assigned to <strong>Mr./Ms. {loan.name}</strong> has been successfully closed. All outstanding dues, including the principal amount and applicable interest, have been paid in full. There are no pending dues against this loan account.
              </p>
            </div>

            {/* Grid for Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Customer Details */}
              <div className="border border-gray-200 p-6 rounded bg-gray-50 print:bg-white print:border-gray-400">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                  <FileText size={18} /> Customer Details
                </h3>
                <div className="flex flex-col space-y-3 text-sm">
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Customer ID:</span>
                    <span className="font-semibold text-gray-900">{loan.customerId || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold text-gray-900">{loan.name}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-semibold text-gray-900">{loan.mobileNo}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-semibold text-gray-900">{loan.address || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Loan & Scheme Details */}
              <div className="border border-gray-200 p-6 rounded bg-gray-50 print:bg-white print:border-gray-400">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                  <CheckCircle size={18} /> Loan Details
                </h3>
                <div className="flex flex-col space-y-3 text-sm">
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Scheme Name:</span>
                    <span className="font-semibold text-gray-900">{loan.schemeName || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Loan Amount:</span>
                    <span className="font-semibold text-gray-900">₹{loan.loanAmount}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Loan Start Date:</span>
                    <span className="font-semibold text-gray-900">{loan.loanStartDate ? new Date(loan.loanStartDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Interest Paid:</span>
                    <span className="font-semibold text-gray-900">₹{loan.totalPaidInterestAmount || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Articles Details */}
            {loan.articles && loan.articles.length > 0 && (
              <div className="mb-12 border border-gray-200 rounded print:border-gray-400">
                <h3 className="text-lg font-bold text-gray-800 bg-gray-50 border-b p-4 print:bg-white print:border-b-gray-400">Pledged Articles Released</h3>
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 bg-gray-100 uppercase border-b print:bg-white print:border-b-gray-400">
                    <tr>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Details</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Gross Wt</th>
                      <th className="px-4 py-3 text-right">Net Wt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loan.articles.map((art, idx) => (
                      <tr key={idx} className="border-b last:border-0 print:border-gray-200">
                        <td className="px-4 py-3">{art.category}</td>
                        <td className="px-4 py-3">{art.details}</td>
                        <td className="px-4 py-3 text-center">{art.qty}</td>
                        <td className="px-4 py-3 text-right">{art.totWt}g</td>
                        <td className="px-4 py-3 text-right font-bold">{art.nettWt}g</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Payment Summary */}
            <div className="mb-16">
              <div className="bg-green-50 text-green-800 p-4 rounded border border-green-200 print:bg-white print:border-gray-400 print:text-gray-900">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle size={20} className="print:hidden" />
                  <h4 className="font-bold">Closure Summary</h4>
                </div>
                <p className="text-sm">The loan account was fully settled. The principal amount of ₹{loan.loanAmount} and all accrued interest have been cleared. All pledged articles (if any) have been authorized for release.</p>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 mt-24 pt-8">
              <div className="text-center">
                <div className="border-t border-gray-400 w-48 mx-auto pt-2">
                  <p className="font-bold text-gray-800">Customer Signature</p>
                  <p className="text-sm text-gray-500">{loan.name}</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 w-48 mx-auto pt-2">
                  <p className="font-bold text-gray-800">Authorized Signatory</p>
                  <p className="text-sm text-gray-500">For Bellwin ERP</p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center text-xs text-gray-400 border-t pt-4">
              <p>This is a system generated document and does not require a physical signature if issued digitally.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LoanClosure;
