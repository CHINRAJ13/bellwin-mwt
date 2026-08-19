import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, List } from 'lucide-react';

import PageHeader from '../../../components/ui/PageHeader';
import SearchBox from '../../../components/ui/SearchBox';
import Button from '../../../components/ui/Button';
import Pagination from '../../../components/ui/Pagination';

const ChittySchemeList = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchemes();
  }, [pagination.page, search]);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/chitty-schemes', {
        headers: { Authorization: `Bearer ${token}` },
        params: { search, page: pagination.page, limit: pagination.limit }
      });
      setSchemes(response.data.schemes || []);
      setPagination(prev => ({ ...prev, totalPages: response.data.totalPages || 1 }));
    } catch (error) {
      console.error('Error fetching chitty schemes:', error);
      toast.error('Failed to load chitty schemes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheme?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/chitty-schemes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Scheme deleted successfully');
      fetchSchemes();
    } catch (error) {
      toast.error('Failed to delete scheme');
    }
  };

  const headerActions = (
    <Button variant="primary" onClick={() => navigate('/admin/chitty/scheme/create')} icon={Plus}>
      <span>Add New Scheme</span>
    </Button>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-5">
      <PageHeader 
        title="Chit Fund Schemes" 
        subtitle=""
        actions={headerActions}
      />

      <div className="bg-white p-4 rounded-none border border-gray-200 shadow-sm flex items-center justify-between">
        <SearchBox 
          placeholder="Search by ID, Name or Phone Number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md w-full"
        />
      </div>

      <div className="bg-white rounded-none border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-100 border-b border-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Scheme Code</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Scheme Name</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Collection Amount</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">No of Member</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Term</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Mode</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">GST</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Admin Charges</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Bidder Commission</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="10" className="p-10 text-center text-gray-500">Loading schemes...</td>
                </tr>
              ) : schemes.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-10 text-center text-gray-500">No schemes found matching criteria.</td>
                </tr>
              ) : (
                schemes.map(scheme => (
                  <tr key={scheme._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{scheme.schemeCode}</td>
                    <td className="px-4 py-3 text-gray-700">{scheme.schemeName}</td>
                    <td className="px-4 py-3 text-gray-900 font-semibold">{Number(scheme.collectionAmount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-700">{scheme.noOfMembers}</td>
                    <td className="px-4 py-3 text-gray-700">{scheme.term}</td>
                    <td className="px-4 py-3 text-gray-700">{scheme.mode}</td>
                    <td className="px-4 py-3 text-gray-700">{Number(scheme.gst).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-700">{Number(scheme.adminCharges).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-700">{Number(scheme.bidderCommission).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <button 
                          onClick={() => navigate(`/admin/chitty/scheme/edit/${scheme._id}`)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(scheme._id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button 
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="List"
                        >
                          <List size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && schemes.length > 0 && (
          <Pagination 
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          />
        )}
      </div>
    </div>
  );
};

export default ChittySchemeList;
