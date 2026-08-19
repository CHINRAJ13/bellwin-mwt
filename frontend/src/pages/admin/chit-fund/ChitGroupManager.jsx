import React, { useState, useEffect } from 'react';
import BranchSelect from '../../../components/ui/BranchSelect';
import Card from '../../../components/ui/Card';
import { Plus, Search, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';

const ChitGroupManager = () => {
    const [groups, setGroups] = useState([]);
    const [branches, setBranches] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        groupName: '', chitValue: '', duration: 10, totalMembers: '', monthlyContribution: '',
        startDate: '', endDate: '', branch: '', employee: '', commissionPercentage: 4,
        joiningFee: 100, documentMaintenanceFeePerLakh: 500, chitMethod: 'Draw'
    });

    useEffect(() => {
        fetchGroups();
        fetchEmployees();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await api.get('/chit-fund/groups');
            if (res.data.success) setGroups(res.data.data);
        } catch (error) { toast.error('Failed to fetch groups'); }
    };


    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employees');
            if (res.data.success) setEmployees(res.data.data);
        } catch (error) { console.error('Failed to fetch employees', error); }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Auto-calculate monthly contribution based on value and duration
        if (name === 'chitValue' || name === 'duration') {
            const val = name === 'chitValue' ? value : formData.chitValue;
            const dur = name === 'duration' ? value : formData.duration;
            if (val && dur) {
                setFormData(prev => ({ ...prev, monthlyContribution: (Number(val) / Number(dur)).toFixed(2) }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = { ...formData };
            if (!dataToSubmit.employee) delete dataToSubmit.employee;

            const res = await api.post('/chit-fund/groups', dataToSubmit);
            if (res.data.success) {
                toast.success('Chit Group Created Successfully');
                setShowForm(false);
                fetchGroups();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create group');
        }
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Chit Group Master</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage chit fund groups and configurations</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#193F4A] text-white rounded-lg hover:bg-[#193F4A]/90 transition-colors"
                >
                    {showForm ? <Search size={20} /> : <Plus size={20} />}
                    <span>{showForm ? 'View Groups' : 'Create Group'}</span>
                </button>
            </div>

            {showForm ? (
                <div className="w-full">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Create New Chit Group</h2>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-md font-semibold text-gray-700 border-b border-gray-300 pb-2">Group Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Group Name</label>
                                    <input type="text" name="groupName" value={formData.groupName} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Branch</label>
                                    <BranchSelect name="branch" value={formData.branch} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Collection Agent / Employee</label>
                                    <select name="employee" value={formData.employee} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all">
                                        <option value="">Select Employee (Optional)</option>
                                        {employees.map(e => <option key={e._id} value={e._id}>{e.name} ({e.employeeId})</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Chit Value (₹)</label>
                                    <input type="number" name="chitValue" value={formData.chitValue} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Duration (Months)</label>
                                    <select name="duration" value={formData.duration} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all" required>
                                        <option value="10">10 Months</option>
                                        <option value="15">15 Months</option>
                                        <option value="20">20 Months</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Total Members</label>
                                    <input type="number" name="totalMembers" value={formData.totalMembers} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all" required />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Monthly Contribution (₹)</label>
                                    <input type="number" name="monthlyContribution" value={formData.monthlyContribution} readOnly className="w-full p-2.5 border bg-gray-50 rounded-lg text-gray-500" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Start Date</label>
                                    <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">End Date</label>
                                    <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all" required />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Commission %</label>
                                    <input type="number" name="commissionPercentage" value={formData.commissionPercentage} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Joining Fee (₹)</label>
                                    <input type="number" name="joiningFee" value={formData.joiningFee} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Chit Method</label>
                                    <select name="chitMethod" value={formData.chitMethod} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#193F4A]/20 outline-none transition-all" required>
                                        <option value="Draw">Draw (Lottery)</option>
                                        <option value="Auction">Auction (Bidding)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                            
                        <div className="flex justify-end gap-4 pt-6">
                                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                    Clear
                                </button>
                                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2">
                                    <FileText size={16} /> Save Data
                                </button>
                            </div>
                        </form>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Group ID</th>
                                    <th className="px-6 py-4 font-semibold">Name</th>
                                    <th className="px-6 py-4 font-semibold">Value</th>
                                    <th className="px-6 py-4 font-semibold">Duration</th>
                                    <th className="px-6 py-4 font-semibold">Members</th>
                                    <th className="px-6 py-4 font-semibold">Method</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groups.length > 0 ? groups.map((g) => (
                                    <tr key={g._id} className="border-b hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-[#193F4A]">{g.groupId}</td>
                                        <td className="px-6 py-4">{g.groupName}</td>
                                        <td className="px-6 py-4 font-medium">₹{g.chitValue?.toLocaleString()}</td>
                                        <td className="px-6 py-4">{g.duration} Months</td>
                                        <td className="px-6 py-4">{g.totalMembers}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${g.chitMethod === 'Draw' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                {g.chitMethod}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${g.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {g.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                            No chit groups found. Create one to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChitGroupManager;
