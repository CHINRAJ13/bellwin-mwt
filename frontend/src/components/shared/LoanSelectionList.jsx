import React from 'react';
import { User, Calendar, MapPin, Tag, IndianRupee, ArrowRight, ShieldAlert } from 'lucide-react';

const LoanSelectionList = ({ results, onSelectLoan, emptyState = "No matching loans found." }) => {
    if (!results || results.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-200 rounded-none bg-gray-50 text-gray-400 mt-6">
                <ShieldAlert className="w-12 h-12 mb-3 text-gray-300" />
                <p className="text-lg font-semibold">{emptyState}</p>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                Multiple Loans Found ({results.length})
            </h3>
            <p className="text-sm text-gray-500 mb-4">Please select a loan below to continue.</p>

            <div className="overflow-x-auto bg-white border border-gray-200 rounded-none shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Loan ID & Date</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Branch & Scheme</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {results.map((item, idx) => {
                            const { loan, customer, branch, scheme } = item;
                            const loanDate = loan.loanDate || loan.createdAt;
                            const formattedDate = loanDate ? new Date(loanDate).toLocaleDateString() : 'N/A';
                            
                            return (
                                <tr key={loan.loanId || idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800">{loan.loanId}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                            <Calendar className="w-3 h-3" /> {formattedDate}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-semibold text-gray-700">{customer?.customerName || 'N/A'}</div>
                                        <div className="text-xs text-gray-500 mt-1">{customer?.mobileNumber || 'N/A'}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-gray-700 flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-gray-400" /> {branch?.name || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                            <Tag className="w-3.5 h-3.5 text-gray-400" /> {scheme?.name || loan.schemeName || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                                            <IndianRupee className="w-3 h-3 text-gray-400" />
                                            {loan.loanAmount?.toLocaleString('en-IN') || 0}
                                        </div>
                                        <div className="text-xs text-orange-600 font-medium mt-1">
                                            Bal: ₹{loan.remainingLoanAmount?.toLocaleString('en-IN') || 0}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                                            loan.status === 'Closed' ? 'bg-gray-100 text-gray-600' :
                                            loan.status === 'Overdue' ? 'bg-red-100 text-red-600' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {loan.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => onSelectLoan(loan.loanId)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white rounded-none text-sm font-semibold transition-colors"
                                        >
                                            View <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LoanSelectionList;
