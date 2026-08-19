import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ArrowDownRight, ArrowUpRight, Loader2, Calendar } from 'lucide-react';

const LedgerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ledger, setLedger] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const { data } = await axios.get(`/api/ledgers/${id}`);
      if (data.success) {
        setLedger(data.data.ledger);
        setTransactions(data.data.transactions);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  if (!ledger) return <div className="p-8 text-center text-red-500 font-medium">Ledger not found.</div>;

  return (
    <div className="p-6 h-[calc(100vh-64px)] overflow-y-auto bg-gray-50">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{ledger.ledgerName} ({ledger.ledgerCode})</h1>
          <p className="text-gray-500 text-sm">{ledger.accountGroup} Account</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-gray-400">
          <p className="text-sm text-gray-500 font-medium">Opening Balance</p>
          <h3 className="text-xl font-bold mt-1">₹{ledger.openingBalance.toLocaleString('en-IN')} {ledger.balanceType}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Debit</p>
              <h3 className="text-xl font-bold text-red-600 mt-1">₹{ledger.totalDebit.toLocaleString('en-IN')}</h3>
            </div>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><ArrowDownRight size={20}/></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Credit</p>
              <h3 className="text-xl font-bold text-green-600 mt-1">₹{ledger.totalCredit.toLocaleString('en-IN')}</h3>
            </div>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><ArrowUpRight size={20}/></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-xl shadow text-white">
          <p className="text-sm font-medium opacity-90">Current Balance</p>
          <h3 className="text-2xl font-bold mt-1">₹{ledger.currentBalance.toLocaleString('en-IN')} {ledger.balanceType}</h3>
        </div>
      </div>

      {/* Transaction Timeline */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
          <Calendar size={18} className="text-gray-500" />
          <h3 className="font-semibold text-gray-700">Transaction History</h3>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-gray-500 border-b">
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Voucher No</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Ref Module / ID</th>
                <th className="pb-3 pr-4">Remarks</th>
                <th className="pb-3 pr-4 text-right">Debit (Dr)</th>
                <th className="pb-3 pr-4 text-right">Credit (Cr)</th>
                <th className="pb-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {transactions.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-8 text-gray-500">No transactions recorded yet.</td></tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">{new Date(tx.transactionDate).toLocaleString()}</td>
                    <td className="py-3 pr-4 font-medium text-indigo-600">{tx.voucherNumber}</td>
                    <td className="py-3 pr-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">{tx.voucherType}</span></td>
                    <td className="py-3 pr-4 text-gray-600">{tx.referenceModule} ({tx.referenceId})</td>
                    <td className="py-3 pr-4 text-gray-500 max-w-xs truncate" title={tx.remarks}>{tx.remarks}</td>
                    <td className="py-3 pr-4 text-right font-medium text-red-500">{tx.debit > 0 ? `₹${tx.debit.toLocaleString('en-IN')}` : '-'}</td>
                    <td className="py-3 pr-4 text-right font-medium text-green-500">{tx.credit > 0 ? `₹${tx.credit.toLocaleString('en-IN')}` : '-'}</td>
                    <td className="py-3 text-right font-bold text-gray-800">₹{tx.balanceAfter.toLocaleString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default LedgerDetails;
