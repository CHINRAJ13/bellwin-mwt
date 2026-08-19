import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import { Coins, Search, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';

const ChitContribution = () => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [contributions, setContributions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            fetchContributions(selectedGroup);
        }
    }, [selectedGroup]);

    const fetchGroups = async () => {
        try {
            const res = await api.get('/chit-fund/groups');
            if (res.data.success) setGroups(res.data.data.filter(g => g.status !== 'Completed'));
        } catch (error) { toast.error('Failed to fetch groups'); }
    };

    const fetchContributions = async (groupId) => {
        setLoading(true);
        try {
            const res = await api.get(`/chit-fund/contributions?groupId=${groupId}`);
            if (res.data.success) {
                setContributions(res.data.data);
            }
        } catch (error) { 
            toast.error('Failed to fetch contributions'); 
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async (id, expectedAmount) => {
        try {
            const paymentMode = prompt('Enter Payment Mode (Cash, Bank Transfer, UPI):', 'Cash');
            if (!paymentMode) return;
            const transactionReference = prompt('Enter Transaction Reference (Optional):', '');
            
            const payload = {
                amount: expectedAmount,
                paymentMode,
                transactionReference
            };

            const res = await api.post(`/chit-fund/contributions/${id}/pay`, payload);
            if (res.data.success) {
                toast.success('Payment Collected & Ledger Updated!');
                fetchContributions(selectedGroup);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process payment');
        }
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Chit Contributions</h1>
                    <p className="text-sm text-gray-500 mt-1">Collect monthly dues and track payments</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <label className="font-semibold text-gray-700 whitespace-nowrap">View Dues for Group:</label>
                    <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className="w-full max-w-md p-2 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none">
                        <option value="">-- Select a Chit Group --</option>
                        {groups.map(g => <option key={g._id} value={g._id}>{g.groupName} ({g.groupId})</option>)}
                    </select>
                </div>

                {selectedGroup && (
                    <div className="w-full mt-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2 flex items-center gap-2">
                            Monthly Contributions List
                        </h2>
                        <div>
                            {loading ? (
                                <div className="p-10 text-center text-gray-500">Loading Contributions...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold">C-ID</th>
                                                <th className="px-6 py-4 font-semibold">Member</th>
                                                <th className="px-6 py-4 font-semibold">Month</th>
                                                <th className="px-6 py-4 font-semibold">Due Date</th>
                                                <th className="px-6 py-4 font-semibold text-right">Expected (₹)</th>
                                                <th className="px-6 py-4 font-semibold text-right">Paid (₹)</th>
                                                <th className="px-6 py-4 font-semibold text-right">Balance (₹)</th>
                                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {contributions.length > 0 ? contributions.map((c) => (
                                                <tr key={c._id} className="border-b hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-[#193F4A]">{c.contributionId}</td>
                                                    <td className="px-6 py-4 font-semibold">{c.customer?.customerName} (Mem #{c.member?.memberNumber})</td>
                                                    <td className="px-6 py-4 font-bold text-center">Month {c.chitMonth}</td>
                                                    <td className="px-6 py-4">{new Date(c.dueDate).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-right">₹{c.expectedAmount?.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-right text-green-600 font-medium">₹{c.paidAmount?.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-right text-red-500 font-bold">₹{c.balanceAmount?.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        {c.status === 'Paid' && <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Paid</span>}
                                                        {c.status === 'Pending' && <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>}
                                                        {c.status === 'Partial' && <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Partial</span>}
                                                        {c.status === 'Overdue' && <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Overdue</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {c.status !== 'Paid' ? (
                                                            <button 
                                                                onClick={() => handlePay(c._id, c.balanceAmount)}
                                                                className="px-4 py-1.5 bg-[#193F4A] text-white rounded hover:bg-[#193F4A]/90 transition-colors shadow-sm text-xs font-semibold"
                                                            >
                                                                Collect Payment
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center justify-end gap-1 text-green-600 text-xs font-bold">
                                                                <CheckCircle size={14} /> Collected
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="9" className="px-6 py-10 text-center text-gray-500">
                                                        No contributions generated for this group yet.
                                                        <br/><span className="text-xs text-gray-400">(In full system, dues are auto-generated on group start date)</span>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChitContribution;
