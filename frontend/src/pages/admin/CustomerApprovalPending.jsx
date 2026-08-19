import React, { useState, useEffect } from 'react';
import { getAdminPendingApprovals, processAdminApprovalAction } from '../../services/customerService';
import { Search, Filter, Eye, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import CustomerApprovalDrawer from './CustomerApprovalDrawer';

const CustomerApprovalPending = () => {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Drawer & Action State
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Duplicate Warning State
    const [duplicateWarning, setDuplicateWarning] = useState(null);
    const [pendingAction, setPendingAction] = useState(null);

    useEffect(() => {
        fetchPendingApprovals();
    }, []);

    const fetchPendingApprovals = async () => {
        try {
            setLoading(true);
            const res = await getAdminPendingApprovals();
            if (res.success) {
                setCustomers(res.data);
                setFilteredCustomers(res.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch pending customers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!searchQuery) {
            setFilteredCustomers(customers);
            return;
        }
        const lower = searchQuery.toLowerCase();
        const filtered = customers.filter(c => 
            c.customerId?.toLowerCase().includes(lower) || 
            c.customerName?.toLowerCase().includes(lower) || 
            c.mobileNumber?.toLowerCase().includes(lower)
        );
        setFilteredCustomers(filtered);
    }, [searchQuery, customers]);

    const handleAction = async (action, remarks, overrideDuplicate = false) => {
        try {
            const res = await processAdminApprovalAction(selectedCustomer._id, action, remarks, overrideDuplicate);
            if (res.success) {
                toast.success(res.message);
                setIsDrawerOpen(false);
                setDuplicateWarning(null);
                setPendingAction(null);
                fetchPendingApprovals();
            }
        } catch (error) {
            if (error.response?.status === 409) {
                // Duplicate detected
                setDuplicateWarning(error.response.data);
                setPendingAction({ action, remarks });
            } else {
                toast.error(error.response?.data?.message || `Failed to ${action.toLowerCase()} customer`);
            }
        }
    };

    const handleOverrideApprove = () => {
        if (pendingAction) {
            handleAction(pendingAction.action, pendingAction.remarks, true);
        }
    };

    const handleCancelOverride = () => {
        setDuplicateWarning(null);
        setPendingAction(null);
    };

    return (
        <div className="p-6 bg-slate-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="bg-white rounded-none p-6 shadow-sm border border-slate-200/60">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Approval</h1>
                            <p className="text-slate-500 text-sm mt-1">Review and approve pending customer registrations</p>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by ID, Name or Phone Number..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <button className="p-2 border border-slate-200 text-slate-600 rounded-none hover:bg-slate-50 hover:text-slate-900 transition-colors bg-white">
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-none shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Customer</th>
                                    <th className="px-6 py-4 font-semibold">Contact</th>
                                    <th className="px-6 py-4 font-semibold">Created By</th>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                            <div className="animate-pulse flex flex-col items-center gap-3">
                                                <div className="h-4 bg-slate-200 rounded w-48"></div>
                                                <div className="h-4 bg-slate-200 rounded w-32"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            No pending approvals found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCustomers.map(customer => (
                                        <tr key={customer._id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{customer.customerName}</div>
                                                <div className="text-slate-500 text-xs mt-0.5">{customer.customerId}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-slate-900">{customer.mobileNumber}</div>
                                                <div className="text-slate-500 text-xs mt-0.5">{customer.branchName || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-slate-900">{customer.createdBy?.name || customer.createdBy?.username || 'System'}</div>
                                                <div className="text-slate-500 text-xs mt-0.5">{customer.createdBy?.employeeId || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {format(new Date(customer.createdAt), 'dd MMM yyyy')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/50">
                                                    Pending
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => { setSelectedCustomer(customer); setIsDrawerOpen(true); }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium transition-colors border border-indigo-100"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <CustomerApprovalDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                customer={selectedCustomer}
                onApprove={(remarks) => handleAction('Approve', remarks)}
                onReject={(remarks) => handleAction('Reject', remarks)}
                onSendBack={(remarks) => handleAction('Send Back', remarks)}
            />

            {/* Duplicate Warning Modal */}
            {duplicateWarning && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-none shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className={`p-6 border-b ${duplicateWarning.duplicateType === 'Hard' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${duplicateWarning.duplicateType === 'Hard' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className={`text-lg font-bold ${duplicateWarning.duplicateType === 'Hard' ? 'text-red-900' : 'text-amber-900'}`}>
                                        {duplicateWarning.duplicateType} Duplicate Detected
                                    </h3>
                                    <p className={`text-sm ${duplicateWarning.duplicateType === 'Hard' ? 'text-red-700' : 'text-amber-700'}`}>
                                        {duplicateWarning.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 max-h-60 overflow-y-auto">
                            <p className="text-sm text-slate-600 mb-4 font-medium">The following matching records were found:</p>
                            <div className="space-y-3">
                                {duplicateWarning.duplicates?.map((dup, i) => (
                                    <div key={i} className="p-4 bg-white rounded-none border border-slate-200 shadow-sm flex flex-col gap-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-slate-900">{dup.customerName}</span>
                                            <span className="text-slate-500 font-mono text-xs">{dup.customerId}</span>
                                        </div>
                                        <div className="text-slate-600">Mobile: <span className="font-medium text-slate-900">{dup.mobileNumber}</span></div>
                                        {(dup.aadhaarNumber || dup.panNumber) && (
                                            <div className="text-slate-600">
                                                Aadhaar: <span className="font-medium text-slate-900">{dup.aadhaarNumber || 'N/A'}</span> | 
                                                PAN: <span className="font-medium text-slate-900">{dup.panNumber || 'N/A'}</span>
                                            </div>
                                        )}
                                        <div className="mt-2 text-xs">
                                            Status: <span className="font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-700">{dup.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-white border-t flex justify-end gap-3">
                            <button
                                onClick={handleCancelOverride}
                                className="px-5 py-2.5 rounded-none border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors"
                            >
                                Cancel Approval
                            </button>
                            <button
                                onClick={handleOverrideApprove}
                                className="px-5 py-2.5 rounded-none bg-slate-900 text-white hover:bg-slate-800 font-medium text-sm shadow-sm transition-colors"
                            >
                                Approve Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerApprovalPending;
