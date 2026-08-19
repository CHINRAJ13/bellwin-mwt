import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Printer, FileText } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import { TD, TR } from '../../../components/ui/Table';
import { exportTableToPDF, exportToExcel, handlePrint } from '../../../utils/exportUtils';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const GoldLoanAuctionReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch overdue loans
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/loans'); 
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdueLoans = res.data.filter(loan => {
        if (loan.status === 'Closed' || loan.status === 'Auctioned') return false;
        
        if (loan.closeDate) {
          const closeDate = new Date(loan.closeDate);
          return closeDate < today; // 1 year is over (close date crossed)
        }
        
        // Fallback: if no closeDate, check if 1 year has passed since loanStartDate
        if (loan.loanStartDate) {
           const startDate = new Date(loan.loanStartDate);
           startDate.setFullYear(startDate.getFullYear() + 1);
           return startDate < today;
        }
        
        return false;
      });

      setData(overdueLoans);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load auction data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const headers = [
    { label: 'AUCTION ELIGIBLE ACCOUNTS (LOAN ID)', key: 'loanId' },
    { label: 'CUSTOMER DETAILS', key: 'customer' },
    { label: 'AUCTION DATE (DUE DATE)', key: 'auctionDate' },
    { label: 'OUTSTANDING AMOUNT', key: 'outstandingAmount' },
    { label: 'GOLD WEIGHT', key: 'goldWeight' },
    { label: 'AUCTION STATUS', key: 'auctionStatus' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in relative">
      <PageHeader 
        title="Gold Loan Auction Report" 
        subtitle="Automatically lists all loans that have crossed their maturity period." 
        icon={FileText} 
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print</Button>
            <Button variant="secondary" icon={Download} onClick={() => {
              const mapper = (item) => {
                const closeDate = item.closeDate ? new Date(item.closeDate) : (() => { const d = new Date(item.loanStartDate); d.setFullYear(d.getFullYear() + 1); return d; })();
                return [
                  item.loanId,
                  item.name,
                  closeDate.toLocaleDateString(),
                  `₹${item.remainingLoanAmount || 0}`,
                  `${item.totalWt || 0} g`,
                  'Auction Ready'
                ];
              };
              exportToExcel(data, headers, mapper, 'Gold_Loan_Auction_Report');
            }}>Export Excel</Button>
            <Button variant="primary" icon={Download} onClick={() => window.print()}>Export PDF</Button>
          </div>
        }
      />
      
      <div className="shadow-sm border border-gray-100 rounded-none">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search within report..." 
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-none text-sm focus:outline-none focus:border-erp-green focus:ring-1 focus:ring-erp-green transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button className="px-4 py-2 border border-gray-300 rounded-none text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Advanced Filter
          </button>
        </div>

        {/* Table */}
        <DataTable
          className="border-0 border-none shadow-none rounded-none"
          headers={headers}
          data={data.filter(item => 
             item.loanId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             item.name?.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          loading={loading}
          renderRow={(item) => {
             const closeDate = item.closeDate ? new Date(item.closeDate) : (() => { const d = new Date(item.loanStartDate); d.setFullYear(d.getFullYear() + 1); return d; })();
             return (
               <TR key={item._id}>
                 <TD className="font-medium text-gray-900">{item.loanId}</TD>
                 <TD>
                    <div className="text-sm font-semibold">{item.name}</div>
                    <div className="text-xs text-red-500 font-medium">1 Year Over - Needs Return/Auction</div>
                 </TD>
                 <TD className="text-red-600 font-semibold">{closeDate.toLocaleDateString()}</TD>
                 <TD className="font-semibold text-gray-800">₹{item.remainingLoanAmount?.toLocaleString('en-IN')}</TD>
                 <TD>{item.totalWt} g</TD>
                 <TD>
                   <span className="px-2 py-1 text-xs font-bold rounded-none bg-red-100 text-red-800 uppercase">
                     Auction Ready
                   </span>
                 </TD>
               </TR>
             );
          }}
          emptyMessage="No accounts are currently eligible for auction (no loans have crossed 1 year)."
        />
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="text-xs text-gray-500">
            Showing {data.length} eligible accounts
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-white border border-gray-300 text-xs text-gray-600 hover:bg-gray-50 rounded-none">Previous</button>
            <button className="px-3 py-1 bg-white border border-gray-300 text-xs text-gray-600 hover:bg-gray-50 rounded-none">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldLoanAuctionReport;
