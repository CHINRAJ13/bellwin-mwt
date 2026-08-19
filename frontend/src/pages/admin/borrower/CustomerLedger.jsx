import React, { useState } from 'react';
import { Search, User, Phone, MapPin, Briefcase, IndianRupee, Calendar } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';

const CustomerLedger = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customer, setCustomer] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // Endpoint typically /customers/search with query params for ID or Phone
      // Adjusting to standard route: we can just fetch all customers matching query and take the first
      const res = await api.get(`/customers/search?search=${searchQuery.trim()}`);
      let foundCustomer = null;
      if (res.data && res.data.success && res.data.data && res.data.data.length > 0) {
        foundCustomer = res.data.data[0];
      }
      
      if (!foundCustomer) {
        toast.error('Customer not found with this ID or Phone Number');
        setCustomer(null);
        setLoans([]);
        return;
      }

      setCustomer(foundCustomer);

      // Now fetch all loans for this customer
      const loansRes = await api.get(`/loans/customer/${foundCustomer.customerId}`);
      setLoans(loansRes.data || []);
      
      // Fetch all Top Ups to show in the ledger
      try {
        const topupsRes = await api.get(`/topups/history`);
        const customerTopUps = topupsRes.data.filter(t => t.customerId === foundCustomer.customerId && t.status === 'Approved');
        setCustomer(prev => ({ ...prev, topups: customerTopUps }));
      } catch (err) {
        console.error('Failed to load topups', err);
      }
      
      toast.success('Customer ledger loaded');
    } catch (error) {
      console.error('Error fetching customer ledger:', error);
      toast.error('Error loading data');
      setCustomer(null);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Customer Ledger</h1>
      </div>

      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-4 items-end form-spiritual-bg">
          <div className="flex-1 max-w-md">
            <Input
              label="Customer ID or Phone Number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., CUST00001 or 9876543210"
            />
          </div>
          <Button type="submit" disabled={loading} className="flex items-center gap-2 h-10 px-6">
            <Search size={20} />
            {loading ? 'Searching...' : 'Search Ledger'}
          </Button>
        </form>
      </div>

      {customer && (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Panel: Customer Profile */}
          <div className="w-full lg:w-1/3 sticky top-6">
            <div className="overflow-hidden shadow-lg border border-gray-200">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32"></div>
              <div className="px-6 pb-6 relative">
                <div className="flex justify-center -mt-16 mb-4">
                  {customer.customerPhotoUrl ? (
                    <img src={customer.customerPhotoUrl} alt="Customer" className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md bg-white" />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-gray-100 flex items-center justify-center">
                      <User size={48} className="text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{customer.customerName}</h2>
                  <p className="text-blue-600 font-semibold">{customer.customerId}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="text-gray-400 mt-1" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium text-gray-800">{customer.mobileNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="text-gray-400 mt-1" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium text-gray-800">{customer.doorStreet}, {customer.area}<br/>{customer.city}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="text-gray-400 mt-1" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Father/Husband Name</p>
                      <p className="font-medium text-gray-800">{customer.guardianName || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Briefcase className="text-gray-400 mt-1" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Occupation</p>
                      <p className="font-medium text-gray-800">{customer.occupation || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Loan History */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Loan History</h2>
                  <p className="text-sm text-gray-500 mt-1">Total {loans.length} loan(s) found</p>
                </div>
              </div>
              
              <div className="p-6">
                {loans.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <IndianRupee size={48} className="mx-auto mb-4 opacity-20" />
                    <p>This customer has no loan history.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {loans.map(loan => (
                      <div key={loan._id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 pb-4 border-b border-gray-100 gap-2">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-lg text-blue-700">{loan.loanId}</span>
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                              loan.status === 'Active' ? 'bg-green-100 text-green-700' :
                              loan.status === 'Closed' ? 'bg-gray-100 text-gray-700' :
                              loan.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {loan.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm font-semibold bg-blue-50 text-blue-800 px-3 py-1 rounded">
                            <IndianRupee size={16} /> {loan.loanAmount?.toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Scheme</p>
                            <p className="text-sm font-semibold text-gray-800">{loan.schemeName || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Open Date</p>
                            <div className="flex items-center gap-1 text-sm font-medium text-gray-800">
                              <Calendar size={14} className="text-gray-400"/>
                              {loan.loanStartDate ? new Date(loan.loanStartDate).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Close Date</p>
                            <div className="flex items-center gap-1 text-sm font-medium text-gray-800">
                              <Calendar size={14} className="text-gray-400"/>
                              {loan.status === 'Closed' ? (loan.loanEndDate ? new Date(loan.loanEndDate).toLocaleDateString() : 'Closed') : '-'}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Remaining Bal</p>
                            <p className="text-sm font-semibold text-gray-800">₹{loan.remainingLoanAmount || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Interest %</p>
                            <p className="text-sm font-semibold text-gray-800">{loan.interestPercent || 0}%</p>
                          </div>
                        </div>
                        
                        {/* Summary of articles if it's a gold loan */}
                        {loan.articles && loan.articles.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-2">Pledged Items ({loan.articles.length})</p>
                            <div className="flex flex-wrap gap-2">
                              {loan.articles.map((art, idx) => (
                                <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                  {art.category} - {art.nettWt}g
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Top Up Timeline */}
                        {customer.topups && customer.topups.filter(t => t.loanId === loan.loanId).length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100 bg-green-50/50 p-4 rounded-lg">
                            <h4 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-green-200 text-green-700 flex items-center justify-center text-xs">↑</span>
                              Top Up History
                            </h4>
                            <div className="space-y-3">
                              {customer.topups.filter(t => t.loanId === loan.loanId).map((topup) => (
                                <div key={topup.topUpId} className="flex justify-between items-center text-sm p-3 bg-white border border-green-100 rounded shadow-sm">
                                  <div>
                                    <span className="font-bold text-gray-800 block">{topup.topUpId}</span>
                                    <span className="text-xs text-gray-500">{new Date(topup.approvedDate).toLocaleDateString()} • {topup.purpose}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-bold text-green-600 block">+ ₹{topup.topUpAmount.toLocaleString('en-IN')}</span>
                                    <span className="text-xs text-gray-500">Approved by {topup.approvedBy}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default CustomerLedger;
