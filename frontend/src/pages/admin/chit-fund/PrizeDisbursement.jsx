import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import { Banknote, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';

const PrizeDisbursement = () => {
    const [disbursements, setDisbursements] = useState([]);
    const [events, setEvents] = useState([]); // events without disbursement
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        eventId: '', paymentMode: 'Bank Transfer', otherCharges: 0
    });

    useEffect(() => {
        fetchDisbursements();
    }, []);

    const fetchDisbursements = async () => {
        setLoading(true);
        try {
            const res = await api.get('/chit-fund/disbursements');
            if (res.data.success) setDisbursements(res.data.data);
            
            // For real system, fetch finalized events that don't have disbursement requested yet
            // Dummy implementation for demo: we can just fetch all groups/events
        } catch (error) { 
            toast.error('Failed to fetch disbursements'); 
        } finally {
            setLoading(false);
        }
    };

    const handleRequestDisbursement = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/chit-fund/disbursements/request', formData);
            if (res.data.success) {
                toast.success('Disbursement Requested! Sent to Approval.');
                fetchDisbursements();
                setShowForm(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to request');
        }
    };

    const handlePay = async (id, paymentMode) => {
        try {
            const paymentReference = prompt(`Enter Transaction Reference for ${paymentMode}:`);
            if (!paymentReference) return toast.error('Reference required to process payout');

            const res = await api.post(`/chit-fund/disbursements/${id}/pay`, { paymentReference });
            if (res.data.success) {
                toast.success('Disbursement Paid & Ledger Updated!');
                fetchDisbursements();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process payment');
        }
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Prize Disbursement</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage payouts, commissions, and document fees</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#193F4A] text-white rounded-lg hover:bg-[#193F4A]/90 transition-colors"
                >
                    <Banknote size={20} />
                    <span>{showForm ? 'View Disbursements' : 'Request New Disbursement'}</span>
                </button>
            </div>

            {showForm && (
                <div className="w-full mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                        Request Prize Disbursement
                    </h2>
                    <div>
                        <form onSubmit={handleRequestDisbursement} className="space-y-4 max-w-xl">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Select Finalized Chit Event (Winner)</label>
                                <input type="text" placeholder="Enter Event ID (e.g. CHE00001)" name="eventId" value={formData.eventId} onChange={(e) => setFormData({...formData, eventId: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none" required />
                                <p className="text-xs text-gray-500">Note: In a full UI, this would be a dropdown of finalized events that haven't been disbursed yet.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Payment Mode</label>
                                <select name="paymentMode" value={formData.paymentMode} onChange={(e) => setFormData({...formData, paymentMode: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none" required>
                                    <option value="Cash">Cash</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cheque">Cheque</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Other Deductions / Charges (₹)</label>
                                <input type="number" name="otherCharges" value={formData.otherCharges} onChange={(e) => setFormData({...formData, otherCharges: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none" />
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="px-6 py-2 bg-[#193F4A] text-white rounded-lg hover:bg-[#193F4A]/90 transition-colors shadow-sm">
                                    Calculate & Request Approval
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid gap-6 grid-cols-1">
                {disbursements.length > 0 ? disbursements.map(d => (
                    <Card key={d._id} className="shadow-sm border-l-4 border-l-green-600 overflow-hidden">
                        <div className="bg-gray-50/80 border-b p-4 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                    {d.customer?.customerName} <span className="text-sm font-normal text-gray-500">(Payout ID: {d.payoutId})</span>
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">Group: {d.chitGroup?.groupName} | Event Month: {d.chitEvent?.chitMonth}</p>
                            </div>
                            <div>
                                {d.status === 'Pending' && <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-full text-sm font-semibold flex items-center gap-1"><Clock size={16}/> Pending Approval</span>}
                                {d.status === 'Approved' && <span className="px-3 py-1.5 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-sm font-semibold flex items-center gap-1"><CheckCircle size={16}/> Approved (Ready to Pay)</span>}
                                {d.status === 'Paid' && <span className="px-3 py-1.5 bg-green-100 text-green-800 border border-green-200 rounded-full text-sm font-semibold flex items-center gap-1"><CheckCircle size={16}/> Paid</span>}
                            </div>
                        </div>
                        <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Calculation Pipeline</p>
                                <div className="text-sm text-gray-700">Chit Value: ₹{d.chitValue?.toLocaleString()}</div>
                                <div className="text-sm text-red-500">- Auction Discount: ₹{d.auctionDiscount?.toLocaleString()}</div>
                                <div className="text-sm font-bold text-gray-800 border-t pt-1 mt-1">= Gross Prize: ₹{d.grossPrizeAmount?.toLocaleString()}</div>
                            </div>
                            
                            <div className="space-y-1 border-l pl-4">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Deductions (Income)</p>
                                <div className="text-sm text-red-500">- Commission: ₹{d.applicableCommission?.toLocaleString()}</div>
                                <div className="text-sm text-red-500">- Document Fee: ₹{d.applicableDocumentFee?.toLocaleString()}</div>
                                {d.otherCharges > 0 && <div className="text-sm text-red-500">- Other Charges: ₹{d.otherCharges?.toLocaleString()}</div>}
                            </div>

                            <div className="border-l pl-4">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Net Payout to Member</p>
                                <div className="text-3xl font-black text-green-600 mt-1">₹{d.netPayout?.toLocaleString()}</div>
                                <div className="text-xs text-gray-500 mt-1">Mode: {d.paymentMode}</div>
                            </div>

                            <div className="flex justify-end pr-4">
                                {d.status === 'Approved' && (
                                    <button 
                                        onClick={() => handlePay(d._id, d.paymentMode)}
                                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md font-bold flex items-center gap-2"
                                    >
                                        <Banknote size={20} /> Issue Payout
                                    </button>
                                )}
                                {d.status === 'Paid' && (
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-gray-800">Ref: {d.paymentReference}</div>
                                        <div className="text-xs text-gray-500">Paid on {new Date(d.disbursementDate).toLocaleDateString()}</div>
                                    </div>
                                )}
                                {d.status === 'Pending' && (
                                    <button 
                                        onClick={async () => {
                                            // Mock approval for demo purposes since we don't have the full approval system mocked up here
                                            await api.post(`/chit-fund/disbursements/${d._id}/approve`);
                                            toast.success('Mock Approved!');
                                            fetchDisbursements();
                                        }}
                                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-semibold"
                                    >
                                        Simulate Approval
                                    </button>
                                )}
                            </div>
                        </div>
                    </Card>
                )) : (
                    <div className="p-10 bg-white rounded-xl border text-center text-gray-500">
                        No disbursements found. Request one to get started.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrizeDisbursement;
