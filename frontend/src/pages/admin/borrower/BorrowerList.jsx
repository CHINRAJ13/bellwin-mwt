import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Phone, MapPin, Eye, Building2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import BranchSelect from '../../../components/ui/BranchSelect';

const BorrowerList = () => {
  const navigate = useNavigate();
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  const fetchBorrowers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers', {
        params: {
          limit: 10000,
          branch: selectedBranch
        }
      });
      setBorrowers(res.data.data || res.data.customers || res.data || []);
    } catch (err) {
      console.error('API error fetching borrowers from DB', err);
      toast.error('Failed to load borrowers from database');
      setBorrowers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowers();
  }, [selectedBranch]);

  const filteredBorrowers = borrowers.filter(b => {
    const q = searchQuery.toLowerCase();
    const id = String(b.customerId || b.id || '').toLowerCase();
    const phone = String(b.mobileNumber || '').toLowerCase();
    const name = String(b.customerName || '').toLowerCase();
    return id.includes(q) || phone.includes(q) || name.includes(q);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <PageHeader
        title="Customer List"
        subtitle="Search and view all registered customers"
        icon={User}
      />

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="search-input block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-none leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition duration-150 ease-in-out"
              placeholder="Search by ID, Name or Phone Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <BranchSelect
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            showAllOption
            containerClassName="w-full md:w-64"
            label=""
          />
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading customers...</p>
          </div>
        ) : filteredBorrowers.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No customers found matching "{searchQuery}"
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBorrowers.map((borrower) => (
                  <tr key={borrower._id || borrower.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {borrower.customerPhotoUrl ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={borrower.customerPhotoUrl} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {borrower.customerName?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{borrower.customerName}</div>
                          <div className="text-sm text-gray-500">{borrower.customerId || borrower.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Phone size={14} className="text-gray-400" />
                        {borrower.mobileNumber}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={14} className="text-gray-400" />
                        {borrower.city || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Building2 size={14} className="text-gray-400" />
                        {borrower.branchName || 'Head Office'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          borrower.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          borrower.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          borrower.status === 'Correction Required' ? 'bg-red-500 text-white animate-pulse' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {borrower.status || 'Pending'}
                        </span>
                        {borrower.status === 'Correction Required' && borrower.adminRemarks && (
                          <span className="text-[10px] text-red-600 font-medium max-w-[150px] truncate" title={borrower.adminRemarks}>
                            ⚠️ {borrower.adminRemarks}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => navigate('/admin/borrower/edit', { state: { customerId: borrower.customerId || borrower.id } })}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors flex items-center gap-1"
                      >
                        <Edit size={16} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowerList;
