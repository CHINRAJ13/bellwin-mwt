import { useState, useEffect, useMemo } from 'react';
import { Award, Search } from 'lucide-react';
import api from '../../../services/api';
import PageHeader from '../../../components/ui/PageHeader';
import DataTable from '../../../components/ui/DataTable';
import { TD, TR } from '../../../components/ui/Table';
import toast from 'react-hot-toast';

const RankingMaster = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/master/branch');
      // Set branches based on the returned response structure
      setBranches(res.data.branches || res.data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // Compute rankings
  // Currently we use a placeholder dailyCollection of 0 for all branches.
  // In the future, this value will be pulled from actual collection data.
  const rankedBranches = useMemo(() => {
    // 1. Map branches with their collection data
    const withCollections = branches.map(branch => ({
      ...branch,
      dailyCollection: 0 // Placeholder
    }));

    // 2. Sort by daily collection descending
    withCollections.sort((a, b) => b.dailyCollection - a.dailyCollection);

    // 3. Assign rank
    return withCollections.map((branch, index) => ({
      ...branch,
      rank: index + 1
    }));
  }, [branches]);

  const filtered = rankedBranches.filter(b =>
    String(b.branchName || '').toLowerCase().includes(search.toLowerCase()) ||
    String(b.branchCode || '').toLowerCase().includes(search.toLowerCase()) ||
    String(b.city || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader 
        title="Ranking Master" 
        subtitle="Rank branches by daily amount collection." 
        icon={Award} 
      />
      
      <div className="p-4 mb-6 shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={16} />
          </span>
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search by ID, Name or Phone Number..." 
            className="w-full pl-9 pr-4 py-2 border rounded-none text-sm focus:outline-none" 
          />
        </div>
      </div>
      
      <DataTable
        headers={['Rank', 'Branch Code', 'Branch Name', 'City', 'Daily Collection']}
        data={filtered}
        loading={loading}
        renderRow={(item) => (
          <TR key={item._id}>
            <TD>
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${item.rank <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                {item.rank}
              </span>
            </TD>
            <TD className="font-bold text-gray-800">{item.branchCode}</TD>
            <TD className="font-semibold text-gray-700">{item.branchName}</TD>
            <TD>{item.city}</TD>
            <TD className="font-semibold text-green-700">₹{item.dailyCollection.toLocaleString('en-IN')}</TD>
          </TR>
        )}
      />
    </div>
  );
};

export default RankingMaster;
