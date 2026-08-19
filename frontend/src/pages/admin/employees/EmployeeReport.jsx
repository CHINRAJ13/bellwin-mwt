import { useState, useEffect } from 'react';
import BranchSelect from '../../../components/ui/BranchSelect';
import api from '../../../services/api';
import { 
  Download, Printer, Search, Calendar, Users, RefreshCw, 
  FileText, Loader2, ArrowLeft, Briefcase, CalendarDays, 
  BadgeIndianRupee, Building, MessageSquare, ClipboardCheck,
  LogIn, LogOut, ChevronDown, ChevronUp
} from 'lucide-react';
import { exportTableToPDF, exportToExcel, handlePrint } from '../../../utils/exportUtils';
import PageHeader from '../../../components/ui/PageHeader';
import SearchBox from '../../../components/ui/SearchBox';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import toast from 'react-hot-toast';

const EmployeeReport = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [leaveDatesRecords, setLeaveDatesRecords] = useState({});
  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [expandedEmp, setExpandedEmp] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchData();
  }, [selectedDate, branchFilter, search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const selectedMonth = selectedDate.substring(0, 7); // YYYY-MM
      
      // Parallel fetch for all employees, attendance list, customers, and loans to maximize loading speed
      const [empRes, attRes, custRes, loanRes] = await Promise.all([
        api.get('/employees', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            limit: 1000, // Fetch all at once without pagination page limits
            search: search || undefined,
            branch: branchFilter || undefined
          }
        }).catch(err => {
          console.error("Failed to fetch employees", err);
          return { data: { employees: [] } };
        }),
        api.get('/attendance', {
          headers: { Authorization: `Bearer ${token}` },
          params: { month: selectedMonth }
        }).catch(err => {
          console.error("Failed to fetch attendance", err);
          return { data: { records: [] } };
        }),
        api.get('/customers', {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 100000 }
        }).catch(err => {
          console.error("Failed to fetch customers", err);
          return { data: { data: [] } };
        }),
        api.get('/loans', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => {
          console.error("Failed to fetch loans", err);
          return { data: [] };
        })
      ]);

      const empList = Array.isArray(empRes.data) ? empRes.data : empRes.data.employees || [];
      const attList = attRes.data.records || [];
      const custList = custRes.data?.data || [];
      const loanList = Array.isArray(loanRes.data) ? loanRes.data : [];
      
      // Group attendance by employeeId and Date
      const attMap = {};
      const leaveMap = {};

      attList.forEach(rec => {
        const empId = rec.employeeId?._id || rec.employeeId;
        if (empId) {
          if (!attMap[empId]) {
            attMap[empId] = {};
          }
          attMap[empId][rec.date] = rec;

          // Track Leave dates
          if (rec.status === 'Leave') {
            if (!leaveMap[empId]) {
              leaveMap[empId] = [];
            }
            leaveMap[empId].push(rec.date);
          }
        }
      });

      setEmployees(empList);
      setAttendanceRecords(attMap);
      setLeaveDatesRecords(leaveMap);
      setCustomers(custList);
      setLoans(loanList);

    } catch (err) {
      console.error('Error fetching employee report:', err);
      toast.error('Failed to load employee report data');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (empId) => {
    setExpandedEmp(prev => ({
      ...prev,
      [empId]: !prev[empId]
    }));
  };

  // Helper to get status styling
  const getAttendanceBadgeVariant = (status) => {
    switch (status) {
      case 'Present': return 'success';
      case 'Absent': return 'danger';
      case 'Half Day': return 'warning';
      case 'Leave': return 'inactive';
      case 'Holiday': return 'info';
      default: return 'inactive';
    }
  };

  // Export functions using the loaded dataset
  const handleExportExcel = () => {
    const headers = [
      { label: 'Employee ID', key: 'employeeId' },
      { label: 'Name', key: 'name' },
      { label: 'Join Date', key: 'joinDate' },
      { label: 'Position', key: 'position' },
      { label: 'Salary (₹)', key: 'salary' },
      { label: 'Attendance', key: 'attendance' },
      { label: 'Check-In', key: 'checkIn' },
      { label: 'Check-Out', key: 'checkOut' },
      { label: 'Leave Dates (Month)', key: 'monthlyLeaves' },
      { label: 'Remark', key: 'remark' },
      { label: 'Assigned Customers & Loans', key: 'customersAndLoans' }
    ];

    const dataToExport = employees.map(emp => {
      const empAttMap = attendanceRecords[emp._id] || {};
      const att = empAttMap[selectedDate] || {};
      const leaves = leaveDatesRecords[emp._id] || [];
      const formattedLeaves = leaves
        .map(d => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }))
        .join(', ');

      const empCustomers = customers.filter(c => {
        const byUsername = c.createdBy?.username && emp.username && c.createdBy.username.toLowerCase() === emp.username.toLowerCase();
        const byEmployeeId = c.employeeId && emp._id && (c.employeeId === emp._id || c.employeeId.toString() === emp._id.toString());
        const byCreatedBy = c.createdBy && emp._id && (c.createdBy === emp._id || c.createdBy.toString() === emp._id.toString());
        return byUsername || byEmployeeId || byCreatedBy;
      });
      const custAndLoansText = empCustomers.map(c => {
        const custLoans = loans.filter(l => 
          l.customerId === c.customerId || 
          l.customerObjectId === c._id || 
          l.customerObjectId?._id === c._id
        );
        const loansStr = custLoans.map(l => `${l.loanId} (${l.loanType || 'Gold Loan'} - ₹${l.loanAmount} - ${l.status})`).join('; ') || 'No Loans';
        return `${c.customerName} (${c.customerId}): [${loansStr}]`;
      }).join(' | ') || 'None';

      return {
        employeeId: emp.employeeId,
        name: `${emp.firstName} ${emp.lastName}`,
        joinDate: emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'N/A',
        position: emp.role || 'N/A',
        salary: emp.salary || 0,
        attendance: att.status || 'Not Marked',
        checkIn: att.checkIn || '—',
        checkOut: att.checkOut || '—',
        monthlyLeaves: formattedLeaves || 'None',
        remark: att.note || emp.remark || '',
        customersAndLoans: custAndLoansText
      };
    });

    exportToExcel(dataToExport, headers, null, `employee_report_${selectedDate}`);
  };

  const handleExportPDF = () => {
    const headers = [
      { label: 'Employee ID', key: 'employeeId' },
      { label: 'Name', key: 'name' },
      { label: 'Salary', key: 'salary' },
      { label: 'Attendance', key: 'attendance' },
      { label: 'Check-In', key: 'checkIn' },
      { label: 'Check-Out', key: 'checkOut' },
      { label: 'Leave Dates', key: 'monthlyLeaves' },
      { label: 'Customers & Loans', key: 'customersAndLoans' }
    ];

    const dataToExport = employees.map(emp => {
      const empAttMap = attendanceRecords[emp._id] || {};
      const att = empAttMap[selectedDate] || {};
      const leaves = leaveDatesRecords[emp._id] || [];
      const formattedLeaves = leaves
        .map(d => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }))
        .join(', ');

      const empCustomers = customers.filter(c => {
        const byUsername = c.createdBy?.username && emp.username && c.createdBy.username.toLowerCase() === emp.username.toLowerCase();
        const byEmployeeId = c.employeeId && emp._id && (c.employeeId === emp._id || c.employeeId.toString() === emp._id.toString());
        const byCreatedBy = c.createdBy && emp._id && (c.createdBy === emp._id || c.createdBy.toString() === emp._id.toString());
        return byUsername || byEmployeeId || byCreatedBy;
      });
      const custAndLoansText = empCustomers.map(c => {
        const custLoans = loans.filter(l => 
          l.customerId === c.customerId || 
          l.customerObjectId === c._id || 
          l.customerObjectId?._id === c._id
        );
        const loansStr = custLoans.map(l => `${l.loanId} (₹${l.loanAmount})`).join('; ') || 'No Loans';
        return `${c.customerName}: [${loansStr}]`;
      }).join(' | ') || 'None';

      return {
        employeeId: emp.employeeId,
        name: `${emp.firstName} ${emp.lastName}`,
        salary: emp.salary || 0,
        attendance: att.status || 'Not Marked',
        checkIn: att.checkIn || '—',
        checkOut: att.checkOut || '—',
        monthlyLeaves: formattedLeaves || 'None',
        customersAndLoans: custAndLoansText
      };
    });

    exportTableToPDF(`Employee Report - ${selectedDate}`, headers, dataToExport, `employee_report_${selectedDate}`);
  };

  const headerActions = (
    <div className="flex gap-2">
      <Button variant="secondary" onClick={handlePrint} icon={Printer}>
        <span className="hidden sm:inline">Print</span>
      </Button>
      <Button variant="secondary" onClick={handleExportExcel} icon={Download}>
        <span className="hidden sm:inline">Export Excel</span>
      </Button>
      <Button variant="secondary" onClick={handleExportPDF} icon={Download}>
        <span className="hidden sm:inline">Export PDF</span>
      </Button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Employee Report"
        subtitle="Workforce overview with salary details, join dates, role placements, and attendance logs."
        actions={headerActions}
      />

      {/* Filter Options */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 border border-gray-200 shadow-sm items-center">
        <div className="md:col-span-2">
          <SearchBox
            placeholder="Search by Employee ID or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-none"
          />
        </div>

        <div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Calendar size={16} />
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm h-[42px]"
            />
          </div>
        </div>

        <div>
          <BranchSelect
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            showAllOption
            label=""
            containerClassName="w-full"
          />
        </div>
      </div>

      {/* Grid of Box Cards */}
      {loading ? (
        <div className="flex items-center justify-center p-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-green-600" size={32} />
            <span className="text-gray-500 text-sm font-semibold">Loading employee cards...</span>
          </div>
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white border border-gray-200 p-16 text-center text-gray-500 text-sm shadow-sm">
          No employee records found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((emp) => {
            const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase();
            const empAttMap = attendanceRecords[emp._id] || {};
            const att = empAttMap[selectedDate] || {};
            const attendanceStatus = att.status || 'Not Marked';
            const remarkText = att.note || emp.remark || '';
            
            // Get monthly leave dates
            const leaveDates = leaveDatesRecords[emp._id] || [];
            const formattedSelectedDate = new Date(selectedDate).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });

            const empCustomers = customers.filter(c => {
              const byUsername = c.createdBy?.username && emp.username && c.createdBy.username.toLowerCase() === emp.username.toLowerCase();
              const byEmployeeId = c.employeeId && emp._id && (c.employeeId === emp._id || c.employeeId.toString() === emp._id.toString());
              const byCreatedBy = c.createdBy && emp._id && (c.createdBy === emp._id || c.createdBy.toString() === emp._id.toString());
              return byUsername || byEmployeeId || byCreatedBy;
            });
            const isExpanded = !!expandedEmp[emp._id];

            // Calculate total loans count for this employee
            const empLoansCount = empCustomers.reduce((acc, c) => {
              const custLoans = loans.filter(l => 
                l.customerId === c.customerId || 
                l.customerObjectId === c._id || 
                l.customerObjectId?._id === c._id
              );
              return acc + custLoans.length;
            }, 0);

            return (
              <div 
                key={emp._id}
                className="bg-white border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-green-500 transition-all duration-300 relative overflow-hidden"
              >
                {/* Header Band */}
                <div className="p-5 border-b border-gray-100 flex items-start gap-4">
                  {/* Photo / Avatar */}
                  <div className={`w-14 h-14 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-lg text-green-600 border-2 border-gray-200 ${emp.photo ? 'bg-transparent' : 'bg-green-50'}`}>
                    {emp.photo ? (
                      <img src={emp.photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  
                  {/* Basic Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base truncate">{emp.firstName} {emp.lastName}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{emp.employeeId || 'N/A'}</p>
                    <div className="mt-2">
                      <Badge variant={emp.status === 'Active' ? 'success' : 'danger'} className="text-[10px] px-2 py-0.5 font-bold">
                        {emp.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-5 space-y-3.5 flex-1 bg-gray-50/50">
                  {/* Branch info */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                      <Building size={14} className="text-gray-400" /> Branch
                    </span>
                    <span className="font-bold text-gray-900">{emp.branch || '—'}</span>
                  </div>

                  {/* Position */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                      <Briefcase size={14} className="text-gray-400" /> Position
                    </span>
                    <span className="font-bold text-gray-900">{emp.role || '—'}</span>
                  </div>

                  {/* Joining date */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                      <CalendarDays size={14} className="text-gray-400" /> Joining Date
                    </span>
                    <span className="font-bold text-gray-900">
                      {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }) : '—'}
                    </span>
                  </div>

                  {/* Salary */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                      <BadgeIndianRupee size={14} className="text-gray-400" /> Salary
                    </span>
                    <span className="font-extrabold text-gray-900 text-sm">
                      {emp.salary ? `₹${Number(emp.salary).toLocaleString('en-IN')}` : '—'}
                    </span>
                  </div>

                  {/* Customer & Loan Summary */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                    <span className="text-green-700 flex items-center gap-1.5 font-bold">
                      <Users size={14} className="text-green-600" /> Customers & Loans
                    </span>
                    <span className="font-extrabold text-gray-900">
                      {empCustomers.length} Cust / {empLoansCount} {empLoansCount === 1 ? 'Loan' : 'Loans'}
                    </span>
                  </div>

                  {/* Attendance status */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                    <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                      <ClipboardCheck size={14} className="text-gray-400" /> Attendance ({formattedSelectedDate})
                    </span>
                    <Badge variant={getAttendanceBadgeVariant(attendanceStatus)} className="font-bold">
                      {attendanceStatus}
                    </Badge>
                  </div>

                  {/* Check-In / Check-Out Log (If present / marked) */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs">
                      <LogIn size={13} className="text-emerald-500" />
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 font-medium uppercase">Check-In</span>
                        <span className="font-bold text-gray-900">{att.checkIn || '—'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <LogOut size={13} className="text-orange-500" />
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 font-medium uppercase">Check-Out</span>
                        <span className="font-bold text-gray-900">{att.checkOut || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Leave Day details (If status is Leave, or listing month leaves) */}
                  <div className="pt-2 border-t border-gray-100 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-500 font-medium">Monthly Leaves</span>
                      <span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-none text-[10px]">
                        {leaveDates.length} Days
                      </span>
                    </div>
                    {leaveDates.length > 0 && (
                      <div className="text-[11px] text-gray-600 mt-1 bg-gray-50 p-2 font-mono break-all border border-gray-100">
                        {leaveDates
                          .map(d => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }))
                          .join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Collapsible Customers & Loans Section */}
                <div className="border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => toggleExpand(emp._id)}
                    className="w-full px-5 py-3 flex items-center justify-between text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Users size={14} className="text-gray-400" />
                      Assigned Customers ({empCustomers.length})
                    </span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-5 pb-5 max-h-60 overflow-y-auto space-y-3 bg-gray-50/70 border-t border-gray-100/50 pt-3">
                      {empCustomers.length === 0 ? (
                        <div className="text-center py-2 text-xs text-gray-400 italic">
                          No customers assigned.
                        </div>
                      ) : (
                        empCustomers.map(cust => {
                          const custLoans = loans.filter(l => 
                            l.customerId === cust.customerId || 
                            l.customerObjectId === cust._id || 
                            l.customerObjectId?._id === cust._id
                          );
                          
                          return (
                            <div key={cust._id} className="bg-white border border-gray-200 p-3 shadow-2xs rounded-none space-y-2">
                              <div className="flex justify-between items-start text-[11px]">
                                <div>
                                  <div className="font-bold text-gray-800">{cust.customerName}</div>
                                  <div className="text-gray-500 font-mono text-[10px]">{cust.customerId}</div>
                                </div>
                                <span className={`px-1.5 py-0.5 text-[9px] font-bold ${cust.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                                  {cust.status}
                                </span>
                              </div>
                              
                              {/* Loans nested */}
                              <div className="pl-2 border-l-2 border-green-500/30 space-y-1">
                                {custLoans.length === 0 ? (
                                  <div className="text-[10px] text-gray-400 italic">No loans issued</div>
                                ) : (
                                  custLoans.map(l => (
                                    <div key={l._id} className="flex justify-between items-center text-[10px] text-gray-700 bg-gray-50/50 px-2 py-1 border border-gray-100">
                                      <div>
                                        <span className="font-semibold text-gray-800">{l.loanId}</span>
                                        <span className="text-gray-400 mx-1">|</span>
                                        <span className="text-gray-500 text-[9px]">{l.loanType || 'Gold Loan'}</span>
                                      </div>
                                      <div className="text-right">
                                        <span className="font-bold text-gray-900">₹{Number(l.loanAmount || 0).toLocaleString('en-IN')}</span>
                                        <span className={`ml-1.5 px-1 text-[8px] font-bold rounded-xs ${
                                          l.status === 'Closed' ? 'bg-gray-100 text-gray-600' :
                                          l.status === 'Approved' || l.status === 'Active' ? 'bg-green-100 text-green-700' :
                                          'bg-yellow-100 text-yellow-700'
                                        }`}>
                                          {l.status}
                                        </span>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Remark Footer */}
                {remarkText && (
                  <div className="p-4 bg-green-50/50 border-t border-gray-100 flex items-start gap-2 text-xs text-gray-700">
                    <MessageSquare size={14} className="text-green-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="font-semibold text-green-800">Remark: </span>
                      <span className="italic">{remarkText}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmployeeReport;
