import React, { useState } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Clock, FileText, User, MapPin, Info, CreditCard, ShieldCheck, UserCheck } from 'lucide-react';
import { format } from 'date-fns';

const CustomerApprovalDrawer = ({ 
    isOpen, 
    onClose, 
    customer, 
    onApprove, 
    onReject, 
    onSendBack 
}) => {
    const [remarks, setRemarks] = useState('');

    // Admin Verification Checklist
    const [checklist, setChecklist] = useState({
        detailsVerified: false,
        addressVerified: false,
        documentsUploaded: false,
        kycCompleted: false,
        duplicateCheck: false
    });

    if (!isOpen || !customer) return null;

    // Timeline items from workflowHistory
    const timeline = (customer.workflowHistory || []).sort((a, b) => new Date(a.date) - new Date(b.date));

    const toggleChecklist = (field) => {
        setChecklist(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const isChecklistComplete = Object.values(checklist).every(Boolean);

    const handleSelectAll = () => {
        const newState = !isChecklistComplete;
        setChecklist({
            detailsVerified: newState,
            addressVerified: newState,
            documentsUploaded: newState,
            kycCompleted: newState,
            duplicateCheck: newState
        });
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
            
            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-full md:w-[800px] bg-white shadow-2xl z-50 overflow-y-auto flex flex-col transform transition-transform duration-300 ease-in-out">
                {/* Header */}
                <div className="flex items-center justify-between p-6 bg-slate-900 text-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-indigo-400" />
                            Customer Approval Review
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">{customer.customerId || 'N/A'} - {customer.customerName || 'N/A'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 bg-slate-50 space-y-6">
                    
                    {/* 1. Basic Information */}
                    <div className="bg-white p-5 rounded-none border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4 border-b pb-2">
                            <User className="w-4 h-4 text-slate-500" />
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Customer ID</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.customerId || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Customer Name</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.customerName || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Guardian Name</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.guardianName || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Gender</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.gender || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Date of Birth</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.dateOfBirth ? format(new Date(customer.dateOfBirth), 'dd MMM yyyy') : 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Age</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.age || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Mobile Number</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.mobileNumber || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Alternate Mobile</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.alternateNumber || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Email</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.email || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Occupation</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.occupation || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Identity Details */}
                    <div className="bg-white p-5 rounded-none border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4 border-b pb-2">
                            <ShieldCheck className="w-4 h-4 text-slate-500" />
                            Identity Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Aadhaar Number</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.aadhaarNumber || 'N/A'}</span>
                            </div>
                            {customer.panNumber && (
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-slate-500">PAN Number</span>
                                    <span className="col-span-2 font-medium text-slate-900">{customer.panNumber}</span>
                                </div>
                            )}
                            {customer.voterId && (
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-slate-500">Voter ID</span>
                                    <span className="col-span-2 font-medium text-slate-900">{customer.voterId}</span>
                                </div>
                            )}
                            {customer.proof2Name && (
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-slate-500">{customer.proof2Name} Number</span>
                                    <span className="col-span-2 font-medium text-slate-900">{customer.proof2Number || 'N/A'}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Address */}
                    <div className="bg-white p-5 rounded-none border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4 border-b pb-2">
                            <MapPin className="w-4 h-4 text-slate-500" />
                            Address
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Door/Street</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.doorStreet || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Area</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.area || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">City</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.city || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">District</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.district || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">State</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.state || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Postal Code</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.postalCode || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-1 gap-2 col-span-1 md:col-span-2 mt-2">
                                <span className="text-slate-500">Permanent Address</span>
                                <span className="font-medium text-slate-900 p-2 bg-slate-50 rounded-none border border-slate-100">{customer.permanentAddress || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-1 gap-2 col-span-1 md:col-span-2 mt-2">
                                <span className="text-slate-500">Temporary Address</span>
                                <span className="font-medium text-slate-900 p-2 bg-slate-50 rounded-none border border-slate-100">{customer.temporaryAddress || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* 4. Employee Information */}
                    <div className="bg-white p-5 rounded-none border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4 border-b pb-2">
                            <Info className="w-4 h-4 text-slate-500" />
                            Employee Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Created By</span>
                                <span className="col-span-2 font-medium text-slate-900">
                                    {customer.createdBy?.name || customer.createdBy?.username || 'System'}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Employee ID</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.createdBy?.employeeId || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Employee Name</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.createdBy?.name || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Branch</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.branchName || customer.createdBy?.branchName || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Created Date</span>
                                <span className="col-span-2 font-medium text-slate-900">
                                    {customer.createdAt ? format(new Date(customer.createdAt), 'dd MMM yyyy, hh:mm a') : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 5. Approval Information */}
                    <div className="bg-white p-5 rounded-none border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4 border-b pb-2">
                            <UserCheck className="w-4 h-4 text-slate-500" />
                            Approval Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Status</span>
                                <span className="col-span-2 font-medium text-slate-900">
                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 border text-xs">{customer.status || 'N/A'}</span>
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Approval Status</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.approvalStatus || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Approved By</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.approvedBy?.name || customer.approvedBy || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-500">Approved Date</span>
                                <span className="col-span-2 font-medium text-slate-900">
                                    {customer.approvedDate ? format(new Date(customer.approvedDate), 'dd MMM yyyy, hh:mm a') : 'N/A'}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 col-span-1 md:col-span-2">
                                <span className="text-slate-500">Admin Remarks</span>
                                <span className="col-span-2 font-medium text-slate-900">{customer.adminRemarks || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* 6. Documents */}
                    <div className="bg-white p-5 rounded-none border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4 border-b pb-2">
                            <FileText className="w-4 h-4 text-slate-500" />
                            Customer Documents
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Photo */}
                            <div className="border rounded-none p-3 flex flex-col items-center justify-center bg-slate-50/50">
                                <p className="text-xs font-semibold mb-3 text-slate-700 w-full text-center border-b pb-2">Customer Photo</p>
                                {customer.customerPhotoUrl ? (
                                    <a href={customer.customerPhotoUrl} target="_blank" rel="noreferrer" className="w-full">
                                        <img src={customer.customerPhotoUrl} alt="Customer" className="h-32 w-full object-contain rounded hover:opacity-90 transition-opacity" />
                                    </a>
                                ) : (
                                    <div className="h-32 flex items-center justify-center text-xs text-slate-400 italic">Document Not Uploaded</div>
                                )}
                            </div>

                            {/* Aadhaar */}
                            <div className="border rounded-none p-3 flex flex-col items-center justify-center bg-slate-50/50">
                                <p className="text-xs font-semibold mb-3 text-slate-700 w-full text-center border-b pb-2">Aadhaar Image</p>
                                {customer.aadhaarDocumentUrl ? (
                                    <a href={customer.aadhaarDocumentUrl} target="_blank" rel="noreferrer" className="w-full">
                                        <img src={customer.aadhaarDocumentUrl} alt="Aadhaar" className="h-32 w-full object-contain rounded hover:opacity-90 transition-opacity" />
                                    </a>
                                ) : (
                                    <div className="h-32 flex items-center justify-center text-xs text-slate-400 italic">Document Not Uploaded</div>
                                )}
                            </div>

                            {/* PAN Image */}
                            <div className="border rounded-none p-3 flex flex-col items-center justify-center bg-slate-50/50">
                                <p className="text-xs font-semibold mb-3 text-slate-700 w-full text-center border-b pb-2">PAN Image</p>
                                {customer.panDocumentUrl ? (
                                    <a href={customer.panDocumentUrl} target="_blank" rel="noreferrer" className="w-full">
                                        <img src={customer.panDocumentUrl} alt="PAN" className="h-32 w-full object-contain rounded hover:opacity-90 transition-opacity" />
                                    </a>
                                ) : (
                                    <div className="h-32 flex items-center justify-center text-xs text-slate-400 italic">Document Not Uploaded</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Loan Details (If Applicable) */}
                    {(customer.loanDetails?.applicationNumber || customer.loanDetails?.loanAmount > 0) && (
                        <div className="bg-white p-5 rounded-none border border-slate-200 shadow-sm">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4 border-b pb-2">
                                <CreditCard className="w-4 h-4 text-slate-500" />
                                Loan Requirements
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-2">
                                        <span className="text-slate-500">App Number</span>
                                        <span className="col-span-2 font-medium text-slate-900">{customer.loanDetails?.applicationNumber || 'N/A'}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <span className="text-slate-500">Loan Type</span>
                                        <span className="col-span-2 font-medium text-slate-900">{customer.loanDetails?.loanType || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-2">
                                        <span className="text-slate-500">Loan Amount</span>
                                        <span className="col-span-2 font-medium text-slate-900">₹ {customer.loanDetails?.loanAmount?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <span className="text-slate-500">Applied Date</span>
                                        <span className="col-span-2 font-medium text-slate-900">
                                            {customer.loanDetails?.appliedDate ? format(new Date(customer.loanDetails.appliedDate), 'dd MMM yyyy') : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 7. Workflow Timeline */}
                    <div className="bg-white p-5 rounded-none border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-6 border-b pb-2">
                            <Clock className="w-4 h-4 text-slate-500" />
                            Workflow History
                        </h3>
                        <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                            {timeline.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No timeline events found.</p>
                            ) : (
                                timeline.map((event, idx) => (
                                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-indigo-500 text-white group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                            <CheckCircle className="w-3 h-3" />
                                        </div>
                                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-slate-50 p-4 rounded-none border border-slate-200 shadow-sm">
                                            <div className="flex items-center justify-between space-x-2 mb-1">
                                                <div className="font-bold text-slate-900 text-sm">{event.action}</div>
                                                <time className="font-medium text-indigo-500 text-xs">
                                                    {event.date ? format(new Date(event.date), 'dd MMM, HH:mm') : 'N/A'}
                                                </time>
                                            </div>
                                            <div className="text-slate-500 text-xs mt-1">
                                                By: <span className="font-medium text-slate-700">{event.performedBy?.name || 'System'}</span>
                                            </div>
                                            {event.remarks && (
                                                <div className="text-slate-600 text-xs mt-2 italic border-l-2 border-slate-300 pl-2">
                                                    "{event.remarks}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Admin Verification Checklist */}
                    <div className="bg-white p-5 rounded-none border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-slate-500" />
                                Admin Verification Checklist
                            </h3>
                            <button
                                onClick={handleSelectAll}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider"
                            >
                                {isChecklistComplete ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">Please verify all the following items before approving this customer.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(checklist).map(([key, value]) => (
                                <label key={key} className={`flex items-center p-3 rounded-none border cursor-pointer transition-colors ${value ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                                    <input 
                                        type="checkbox" 
                                        checked={value} 
                                        onChange={() => toggleChecklist(key)}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" 
                                    />
                                    <span className={`ml-3 text-sm ${value ? 'text-indigo-900 font-medium' : 'text-slate-700'}`}>
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Remarks Textarea */}
                    <div className="bg-white p-5 rounded-none border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4 border-b pb-2">
                            <FileText className="w-4 h-4 text-slate-500" />
                            Admin Remarks
                        </h3>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Enter remarks, rejection reason, or correction instructions..."
                            className="w-full px-4 py-3 rounded-none border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm min-h-[100px] resize-y bg-slate-50"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap gap-3 sticky bottom-0 z-10 justify-end">
                    <button
                        onClick={() => onSendBack(remarks)}
                        className="px-6 py-2.5 rounded-none border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium text-sm transition-colors flex items-center gap-2"
                    >
                        <AlertCircle className="w-4 h-4" />
                        Send Back
                    </button>
                    <button
                        onClick={() => onReject(remarks)}
                        className="px-6 py-2.5 rounded-none border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-medium text-sm transition-colors flex items-center gap-2"
                    >
                        <XCircle className="w-4 h-4" />
                        Reject
                    </button>
                    <button
                        onClick={() => onApprove(remarks)}
                        disabled={!isChecklistComplete}
                        className={`px-6 py-2.5 rounded-none font-medium text-sm transition-all flex items-center gap-2 shadow-sm ${
                            isChecklistComplete 
                            ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        <CheckCircle className="w-4 h-4" />
                        Approve Admin
                    </button>
                </div>
            </div>
        </>
    );
};

export default CustomerApprovalDrawer;
