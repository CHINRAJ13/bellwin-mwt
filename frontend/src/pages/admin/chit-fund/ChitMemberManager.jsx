import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import { Search, UserPlus, Shield, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';

const ChitMemberManager = () => {
    const [groups, setGroups] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [members, setMembers] = useState([]);
    
    const [selectedGroup, setSelectedGroup] = useState('');
    const [showForm, setShowForm] = useState(false);
    
    const [formData, setFormData] = useState({
        chitGroup: '', customer: '', 
        nomineeName: '', nomineeRelation: '', nomineeIdProof: '',
        guarantorName: '', guarantorRelation: '', guarantorMobile: '', guarantorIdProof: '',
        chequeNumber: '', bankName: '', accountHolder: '', chequeAmount: ''
    });

    useEffect(() => {
        fetchGroups();
        fetchCustomers();
    }, []);

    useEffect(() => {
        if (selectedGroup) fetchMembers(selectedGroup);
    }, [selectedGroup]);

    const fetchGroups = async () => {
        try {
            const res = await api.get('/chit-fund/groups');
            if (res.data.success) setGroups(res.data.data);
        } catch (error) { toast.error('Failed to fetch groups'); }
    };

    const fetchCustomers = async () => {
        try {
            const res = await api.get('/customers');
            if (res.data.success) setCustomers(res.data.data);
        } catch (error) { toast.error('Failed to fetch customers'); }
    };

    const fetchMembers = async (groupId) => {
        try {
            const res = await api.get(`/chit-fund/groups/${groupId}/members`);
            if (res.data.success) setMembers(res.data.data);
        } catch (error) { toast.error('Failed to fetch members'); }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, [fieldName]: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Transform flat form data to nested schema format
            const payload = {
                chitGroup: formData.chitGroup,
                customer: formData.customer,
                nominee: {
                    name: formData.nomineeName,
                    relation: formData.nomineeRelation,
                    idProof: formData.nomineeIdProof
                },
                guarantors: formData.guarantorName ? [{
                    name: formData.guarantorName,
                    relation: formData.guarantorRelation,
                    mobile: formData.guarantorMobile,
                    idProof: formData.guarantorIdProof
                }] : [],
                securityCheques: formData.chequeNumber ? [{
                    chequeNumber: formData.chequeNumber,
                    bankName: formData.bankName,
                    accountHolder: formData.accountHolder,
                    amount: formData.chequeAmount
                }] : []
            };

            const res = await api.post(`/chit-fund/groups/${formData.chitGroup}/members`, payload);
            if (res.data.success) {
                toast.success('Member Added Successfully');
                setShowForm(false);
                if (selectedGroup === formData.chitGroup) fetchMembers(selectedGroup);
                
                // reset form
                setFormData({
                    chitGroup: formData.chitGroup, customer: '', 
                    nomineeName: '', nomineeRelation: '', nomineeIdProof: '',
                    guarantorName: '', guarantorRelation: '', guarantorMobile: '', guarantorIdProof: '',
                    chequeNumber: '', bankName: '', accountHolder: '', chequeAmount: ''
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add member');
        }
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Chit Member Manager</h1>
                    <p className="text-sm text-gray-500 mt-1">Enroll customers and manage group members</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#193F4A] text-white rounded-lg hover:bg-[#193F4A]/90 transition-colors"
                >
                    {showForm ? <Search size={20} /> : <UserPlus size={20} />}
                    <span>{showForm ? 'View Members' : 'Enroll Member'}</span>
                </button>
            </div>

            {showForm ? (
                <div className="w-full">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        Add New Member to Group
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Details */}
                        <div className="space-y-4">
                            <h3 className="text-md font-semibold text-gray-700 border-b border-gray-300 pb-2">Assignment Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Select Chit Group</label>
                                        <select name="chitGroup" value={formData.chitGroup} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all" required>
                                            <option value="">Select Group</option>
                                            {groups.filter(g => g.status !== 'Completed').map(g => <option key={g._id} value={g._id}>{g.groupName} ({g.groupId}) - Value: ₹{g.chitValue}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Select Customer</label>
                                        <select name="customer" value={formData.customer} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all" required>
                                            <option value="">Select Customer</option>
                                            {customers.map(c => <option key={c._id} value={c._id}>{c.customerName} ({c.customerId})</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Nominee Details */}
                            <div className="space-y-4">
                                <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2 border-b pb-2">Nominee Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Nominee Name</label>
                                        <input type="text" name="nomineeName" value={formData.nomineeName} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Relation</label>
                                        <input type="text" name="nomineeRelation" value={formData.nomineeRelation} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">ID Proof Upload</label>
                                        <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'nomineeIdProof')} className="w-full p-2 border focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                                        {formData.nomineeIdProof && <p className="text-xs text-green-600 mt-1 flex items-center gap-1">✓ File ready</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Guarantor Details */}
                            <div className="space-y-4">
                                <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2 border-b pb-2">Guarantor Information (If applicable)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Guarantor Name</label>
                                        <input type="text" name="guarantorName" value={formData.guarantorName} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Relation</label>
                                        <input type="text" name="guarantorRelation" value={formData.guarantorRelation} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Mobile</label>
                                        <input type="text" name="guarantorMobile" value={formData.guarantorMobile} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">ID Proof Upload</label>
                                        <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'guarantorIdProof')} className="w-full p-2 border focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                                        {formData.guarantorIdProof && <p className="text-xs text-green-600 mt-1 flex items-center gap-1">✓ File ready</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Security Cheques */}
                            <div className="space-y-4">
                                <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2 border-b pb-2">Security Cheque (If applicable)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Bank Name</label>
                                        <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Account Holder</label>
                                        <input type="text" name="accountHolder" value={formData.accountHolder} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Cheque Number</label>
                                        <input type="text" name="chequeNumber" value={formData.chequeNumber} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Amount (₹)</label>
                                        <input type="number" name="chequeAmount" value={formData.chequeAmount} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-6 mt-6">
                                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                    Clear
                                </button>
                                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2">
                                    <UserPlus size={16} /> Save Data
                                </button>
                            </div>
                        </form>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <label className="font-semibold text-gray-700 whitespace-nowrap">View Members for Group:</label>
                        <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className="w-full max-w-md p-2 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none">
                            <option value="">-- Select a Chit Group --</option>
                            {groups.map(g => <option key={g._id} value={g._id}>{g.groupName} ({g.groupId})</option>)}
                        </select>
                    </div>

                    {selectedGroup && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Member No</th>
                                            <th className="px-6 py-4 font-semibold">ID</th>
                                            <th className="px-6 py-4 font-semibold">Customer Name</th>
                                            <th className="px-6 py-4 font-semibold">Joined On</th>
                                            <th className="px-6 py-4 font-semibold">Nominee</th>
                                            <th className="px-6 py-4 font-semibold">Winner Status</th>
                                            <th className="px-6 py-4 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.length > 0 ? members.map((m) => (
                                            <tr key={m._id} className="border-b hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium">#{m.memberNumber}</td>
                                                <td className="px-6 py-4 font-medium text-[#193F4A]">{m.memberId}</td>
                                                <td className="px-6 py-4 font-semibold">{m.customer?.customerName}</td>
                                                <td className="px-6 py-4">{new Date(m.joiningDate).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">{m.nominee?.name}</td>
                                                <td className="px-6 py-4">
                                                    {m.winnerStatus === 'Won' ? 
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">Won</span> : 
                                                        <span className="text-gray-400">-</span>
                                                    }
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {m.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                                    No members enrolled in this group yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChitMemberManager;
