import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import { FileText, Printer, Download } from 'lucide-react';
import api from '../../../services/api';

const ChitReports = () => {
    const location = useLocation();
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Determine report type from URL
    const pathSegments = location.pathname.split('/');
    const reportRoute = pathSegments[pathSegments.length - 1]; // e.g., 'chit-group'
    
    const reportTitles = {
        'chit-group': 'Chit Group Report',
        'chit-contribution': 'Contribution Report',
        'chit-collection': 'Collection Report',
        'chit-due': 'Due / Defaulter Report',
        'chit-auction': 'Auction & Draw Report',
        'chit-disbursement': 'Prize Disbursement Report',
        'chit-discount': 'Discount & Dividend Report',
        'chit-member': 'Member Statement'
    };

    const title = reportTitles[reportRoute] || 'Chit Fund Report';

    useEffect(() => {
        fetchReportData();
    }, [reportRoute]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            // In a complete implementation, this would call specific endpoints like:
            // await api.get(`/reports/${reportRoute}`)
            // For now, we simulate fetching data based on the route to display the table structure
            
            let data = [];
            
            // Mock data structure based on report type
            if (reportRoute === 'chit-group') {
                const res = await api.get('/chit-fund/groups');
                if(res.data.success) data = res.data.data;
            } else if (reportRoute === 'chit-contribution') {
                const res = await api.get('/chit-fund/contributions');
                if(res.data.success) data = res.data.data;
            } else if (reportRoute === 'chit-disbursement') {
                const res = await api.get('/chit-fund/disbursements');
                if(res.data.success) data = res.data.data;
            } else {
                // Generic fallback for unimplemented specific reports
                data = [{ id: 'No data', message: 'Report endpoint pending implementation' }];
            }
            
            setReportData(data);
        } catch (error) {
            console.error('Failed to fetch report', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        if (!reportData || reportData.length === 0) return;

        // Collect headers based on table logic
        let headers = [];
        if (reportRoute === 'chit-group') {
            headers = ['Group ID', 'Name', 'Value', 'Duration', 'Members', 'Status'];
        } else if (reportRoute === 'chit-contribution') {
            headers = ['Contribution ID', 'Month', 'Expected Amount', 'Paid Amount', 'Balance', 'Status'];
        } else if (reportRoute === 'chit-disbursement') {
            headers = ['Payout ID', 'Customer Name', 'Gross Prize', 'Commission', 'Net Payout', 'Status'];
        } else {
            headers = Object.keys(reportData[0]);
        }

        // Map data
        const rows = reportData.map(row => {
            if (reportRoute === 'chit-group') {
                return [row.groupId, row.groupName, row.chitValue, row.duration, row.totalMembers, row.status];
            } else if (reportRoute === 'chit-contribution') {
                return [row.contributionId, row.chitMonth, row.expectedAmount, row.paidAmount, row.balanceAmount, row.status];
            } else if (reportRoute === 'chit-disbursement') {
                return [row.payoutId, row.customer?.customerName || '', row.grossPrizeAmount, row.applicableCommission, row.netPayout, row.status];
            } else {
                return Object.values(row);
            }
        });

        // Convert to CSV
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${title.replace(/\s+/g, '_')}_Export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderTableHeaders = () => {
        if (!reportData || reportData.length === 0) return null;
        
        if (reportRoute === 'chit-group') {
            return (
                <tr>
                    <th className="px-6 py-4 font-semibold">Group ID</th>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Value (₹)</th>
                    <th className="px-6 py-4 font-semibold">Duration</th>
                    <th className="px-6 py-4 font-semibold">Members</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
            );
        } else if (reportRoute === 'chit-contribution') {
            return (
                <tr>
                    <th className="px-6 py-4 font-semibold">Contribution ID</th>
                    <th className="px-6 py-4 font-semibold">Month</th>
                    <th className="px-6 py-4 font-semibold">Expected (₹)</th>
                    <th className="px-6 py-4 font-semibold">Paid (₹)</th>
                    <th className="px-6 py-4 font-semibold">Balance (₹)</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
            );
        } else if (reportRoute === 'chit-disbursement') {
            return (
                <tr>
                    <th className="px-6 py-4 font-semibold">Payout ID</th>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Gross Prize (₹)</th>
                    <th className="px-6 py-4 font-semibold">Commission (₹)</th>
                    <th className="px-6 py-4 font-semibold">Net Payout (₹)</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
            );
        } else {
            return (
                <tr>
                    {Object.keys(reportData[0] || {}).map((key, i) => (
                        <th key={i} className="px-6 py-4 font-semibold uppercase">{key}</th>
                    ))}
                </tr>
            );
        }
    };

    const renderTableBody = () => {
        if (!reportData || reportData.length === 0) {
            return (
                <tr>
                    <td colSpan="10" className="px-6 py-10 text-center text-gray-500">
                        {loading ? 'Loading Report Data...' : 'No data available for this report.'}
                    </td>
                </tr>
            );
        }
        
        return reportData.map((row, index) => {
            if (reportRoute === 'chit-group') {
                return (
                    <tr key={index} className="border-b hover:bg-gray-50/50">
                        <td className="px-6 py-4">{row.groupId}</td>
                        <td className="px-6 py-4 font-medium">{row.groupName}</td>
                        <td className="px-6 py-4 text-green-600">₹{row.chitValue?.toLocaleString()}</td>
                        <td className="px-6 py-4">{row.duration} Months</td>
                        <td className="px-6 py-4">{row.totalMembers}</td>
                        <td className="px-6 py-4">{row.status}</td>
                    </tr>
                );
            } else if (reportRoute === 'chit-contribution') {
                return (
                    <tr key={index} className="border-b hover:bg-gray-50/50">
                        <td className="px-6 py-4">{row.contributionId}</td>
                        <td className="px-6 py-4 text-center">{row.chitMonth}</td>
                        <td className="px-6 py-4 text-right">₹{row.expectedAmount?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-green-600">₹{row.paidAmount?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-red-500">₹{row.balanceAmount?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">{row.status}</td>
                    </tr>
                );
            } else if (reportRoute === 'chit-disbursement') {
                return (
                    <tr key={index} className="border-b hover:bg-gray-50/50">
                        <td className="px-6 py-4">{row.payoutId}</td>
                        <td className="px-6 py-4 font-medium">{row.customer?.customerName || 'Unknown'}</td>
                        <td className="px-6 py-4 text-right">₹{row.grossPrizeAmount?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-red-500">₹{row.applicableCommission?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-green-600 font-bold">₹{row.netPayout?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">{row.status}</td>
                    </tr>
                );
            } else {
                return (
                    <tr key={index} className="border-b hover:bg-gray-50/50">
                        {Object.values(row).map((val, i) => (
                            <td key={i} className="px-6 py-4">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</td>
                        ))}
                    </tr>
                );
            }
        });
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                    <p className="text-sm text-gray-500 mt-1">View, filter, and export {title.toLowerCase()} data</p>
                </div>
                <div className="flex gap-2 print:hidden">
                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
                        <Printer size={18} /> Print
                    </button>
                    <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-[#193F4A] text-white rounded-lg hover:bg-[#193F4A]/90 transition-colors">
                        <Download size={18} /> Export CSV / Excel
                    </button>
                </div>
            </div>

            <Card className="shadow-sm border-t-4 border-t-[#193F4A]">
                <div className="bg-gray-50/50 border-b pb-4 px-6 pt-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FileText size={20} className="text-[#193F4A]" /> Report Data
                    </h3>
                </div>
                <div className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b">
                                {renderTableHeaders()}
                            </thead>
                            <tbody>
                                {renderTableBody()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ChitReports;
