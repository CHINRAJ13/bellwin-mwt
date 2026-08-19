import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import { Award, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';

const ChitEvent = () => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [eligibleMembers, setEligibleMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        chitMonth: '', eventDate: '', poolAmount: '', method: 'Draw', winnerId: '', winningDiscount: 0
    });

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            fetchEligibleWinners(selectedGroup);
        }
    }, [selectedGroup]);

    const fetchGroups = async () => {
        try {
            const res = await api.get('/chit-fund/groups');
            if (res.data.success) setGroups(res.data.data.filter(g => g.status !== 'Completed'));
        } catch (error) { toast.error('Failed to fetch groups'); }
    };

    const fetchEligibleWinners = async (groupId) => {
        setLoading(true);
        try {
            const res = await api.get(`/chit-fund/groups/${groupId}/eligible-winners`);
            if (res.data.success) {
                setEligibleMembers(res.data.data);
            }
        } catch (error) { 
            toast.error('Failed to fetch eligible winners'); 
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedGroup) return toast.error('Select a Group');
        try {
            const payload = { ...formData };
            // Ensure numbers
            payload.chitMonth = Number(payload.chitMonth);
            payload.poolAmount = Number(payload.poolAmount);
            payload.winningDiscount = Number(payload.winningDiscount);
            
            const res = await api.post(`/chit-fund/groups/${selectedGroup}/finalize-event`, payload);
            if (res.data.success) {
                toast.success('Event Finalized & Winner Declared!');
                fetchEligibleWinners(selectedGroup);
                setFormData({ chitMonth: '', eventDate: '', poolAmount: '', method: 'Draw', winnerId: '', winningDiscount: 0 });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to finalize event');
        }
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Chit Event (Draw / Auction)</h1>
                    <p className="text-sm text-gray-500 mt-1">Run monthly draw or auction and declare winner</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="w-full">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2 flex items-center gap-2">
                            Finalize Winner
                        </h2>
                        <div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Select Group</label>
                                    <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none" required>
                                        <option value="">Select Group</option>
                                        {groups.map(g => <option key={g._id} value={g._id}>{g.groupName}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Chit Month (e.g. 1, 2, 3)</label>
                                    <input type="number" name="chitMonth" value={formData.chitMonth} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Event Date</label>
                                    <input type="date" name="eventDate" value={formData.eventDate} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Total Pool Amount Collected (₹)</label>
                                    <input type="number" name="poolAmount" value={formData.poolAmount} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Method</label>
                                    <select name="method" value={formData.method} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none" required>
                                        <option value="Draw">Draw</option>
                                        <option value="Auction">Auction</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Select Winner</label>
                                    <select name="winnerId" value={formData.winnerId} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none" required>
                                        <option value="">Select from Eligible Members</option>
                                        {eligibleMembers.map(el => (
                                            <option key={el.member._id} value={el.member._id}>
                                                Member #{el.member.memberNumber} - {el.member.customer?.customerName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {formData.method === 'Auction' && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Winning Discount / Bid Amount (₹)</label>
                                        <input type="number" name="winningDiscount" value={formData.winningDiscount} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none" required />
                                    </div>
                                )}
                                <div className="pt-4">
                                    <button type="submit" className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors shadow-sm flex items-center justify-center gap-2">
                                        <Award size={20} /> Finalize & Declare Winner
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Eligibility Table Section */}
                <div className="lg:col-span-2">
                    <div className="w-full">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2 flex items-center gap-2">
                            Eligible Candidates
                        </h2>
                        <div>
                            {selectedGroup ? (
                                loading ? (
                                    <div className="p-10 text-center text-gray-500">Checking Rule Engine for Eligibility...</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b">
                                                <tr>
                                                    <th className="px-6 py-4 font-semibold">Mem #</th>
                                                    <th className="px-6 py-4 font-semibold">Customer</th>
                                                    <th className="px-6 py-4 font-semibold text-center">Installments Paid</th>
                                                    <th className="px-6 py-4 font-semibold text-right">Total Paid (₹)</th>
                                                    <th className="px-6 py-4 font-semibold text-center">80% Rule Met</th>
                                                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {eligibleMembers.length > 0 ? eligibleMembers.map((el) => (
                                                    <tr key={el.member._id} className="border-b hover:bg-green-50/30 transition-colors">
                                                        <td className="px-6 py-4 font-medium">#{el.member.memberNumber}</td>
                                                        <td className="px-6 py-4 font-semibold text-[#193F4A]">{el.member.customer?.customerName}</td>
                                                        <td className="px-6 py-4 text-center">{el.paidCount}</td>
                                                        <td className="px-6 py-4 text-right font-medium text-green-600">₹{el.totalPaid?.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            {el.is80PercentCompleted ? 
                                                                <span className="text-green-600 font-bold">Yes</span> : 
                                                                <span className="text-gray-400">No</span>
                                                            }
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                                Eligible
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="6" className="px-6 py-10 text-center text-red-500 font-medium">
                                                            No members meet the eligibility criteria for this group yet. (Check minimum installments or security requirements).
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            ) : (
                                <div className="p-10 text-center text-gray-500">
                                    Select a group to view eligible candidates.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChitEvent;
