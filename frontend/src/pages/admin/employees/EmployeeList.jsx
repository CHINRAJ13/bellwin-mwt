import { useState, useEffect } from 'react';
import BranchSelect from '../../../components/ui/BranchSelect';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { 
  Plus, MoreVertical, Edit, Key, ShieldOff, Trash2, Shield, Eye, Download, Printer,
  Users, Search, CheckCircle, XCircle, ChevronLeft, ChevronRight, ChevronDown,
  UserCheck, UserPlus, Building2, RefreshCw
} from 'lucide-react';
import { exportTableToPDF, exportToExcel, handlePrint } from '../../../utils/exportUtils';
// Unified UI Components
import PageHeader from '../../../components/ui/PageHeader';
import StatCard from '../../../components/ui/StatCard';
import SearchBox from '../../../components/ui/SearchBox';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Pagination from '../../../components/ui/Pagination';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', branch: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [employeeStats, setEmployeeStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    newThisMonth: 0,
    totalRoles: 0
  });
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchEmployeeStats();
  }, []);

  const fetchEmployeeStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/employees/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployeeStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const stats = [
    { label: 'Total Employees', value: employeeStats.totalEmployees || 0, icon: Users, color: 'text-blue-600', bg: 'bg-white/60', bgGradient: 'bg-gradient-to-br from-blue-100 to-sky-200' },
    { label: 'Active Employees', value: employeeStats.activeEmployees || 0, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-white/60', bgGradient: 'bg-gradient-to-br from-emerald-100 to-teal-200' },
    { label: 'New This Month', value: employeeStats.newThisMonth || 0, icon: UserPlus, color: 'text-indigo-600', bg: 'bg-white/60', bgGradient: 'bg-gradient-to-br from-indigo-100 to-purple-200' },
    { label: 'Departments', value: employeeStats.totalRoles || 0, icon: Building2, color: 'text-fuchsia-600', bg: 'bg-white/60', bgGradient: 'bg-gradient-to-br from-fuchsia-100 to-pink-200' },
  ];

  useEffect(() => {
    fetchEmployees();
  }, [pagination.page, search, filters]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/employees', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search,
          status: filters.status,
          branch: filters.branch,
          page: pagination.page,
          limit: pagination.limit,
        },
      });
      // Handle both paginated response and direct array response
      setEmployees(Array.isArray(response.data) ? response.data : response.data.employees || []);
      setPagination((prev) => ({ ...prev, totalPages: response.data.totalPages || 1 }));
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await api.patch(`/employees/toggle-status/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEmployees();
    } catch {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee? This action is a soft delete.')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEmployees();
    } catch {
      alert('Failed to delete employee');
    }
  };

  const handleExportExcel = () => {
    const headers = [
      { label: 'Employee ID', key: 'employeeId' },
      { label: 'First Name', key: 'firstName' },
      { label: 'Last Name', key: 'lastName' },
      { label: 'Mobile', key: 'mobile' },
      { label: 'Age', key: 'age' },
      { label: 'Role', key: 'role' },
      { label: 'Status', key: 'status' }
    ];
    exportToExcel(employees, headers, null, 'employees');
  };

  const handleExportPDF = () => {
    const headers = [
      { label: 'Employee ID', key: 'employeeId' },
      { label: 'Name', key: 'name' }, // Will format it manually in a moment
      { label: 'Mobile', key: 'mobile' },
      { label: 'Role', key: 'role' },
      { label: 'Status', key: 'status' }
    ];
    const dataToExport = employees.map(e => ({
      ...e,
      name: `${e.firstName} ${e.lastName}`
    }));
    exportTableToPDF('Employee List', headers, dataToExport, 'employees');
  };
  // Mobile card renderer
  const renderEmployeeCards = () => {
    if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
    if (employees.length === 0) return <div className="p-10 text-center text-gray-500">No employees found.</div>;
    return (
      <div className="flex flex-col gap-3 p-3">
        {employees.map((emp) => {
          const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase();
          return (
            <div
              key={emp._id}
              onClick={() => navigate(`/admin/employees/view/${emp._id}`)}
              className={`rounded-none p-4 cursor-pointer transition-all duration-200 border ${
                'bg-white border-gray-200 hover:border-green-500 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-11 h-11 rounded-full shrink-0 flex items-center justify-center font-bold text-sm text-green-600 border-2 border-gray-200 overflow-hidden ${emp.photo ? 'bg-transparent' : 'bg-green-50'}`}>
                  {emp.photo ? <img src={emp.photo} alt="" className="w-full h-full object-cover" /> : initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-gray-900 truncate">
                    {emp.firstName} {emp.lastName}
                  </div>
                  <div className="flex gap-2 items-center mt-0.5 flex-wrap">
                    <span className="text-[11px] text-green-600 font-mono font-bold">{emp.employeeId}</span>
                    <span className="text-[11px] text-gray-500">{emp.role}</span>
                  </div>
                </div>
                <Badge variant={emp.status === 'Active' ? 'success' : 'danger'}>
                  {emp.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-3">
                <div><span className="font-semibold">Branch: </span><span className="text-gray-900">{emp.branch || '—'}</span></div>
                <div><span className="font-semibold">Phone: </span><span className="text-gray-900">{emp.mobile || '—'}</span></div>
                <div><span className="font-semibold">Age: </span><span className="text-gray-900">{emp.age || '—'}</span></div>
              </div>
              <div className="flex justify-end relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdownId(openDropdownId === emp._id ? null : emp._id);
                  }}
                  className="p-1.5 rounded-none border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors shadow-sm"
                >
                  <MoreVertical size={16} />
                </button>
                {openDropdownId === emp._id && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-none shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-100">
                    {[
                      { title: 'View Profile', icon: Eye, color: 'text-indigo-600', hoverBg: 'hover:bg-indigo-50', onClick: () => navigate(`/admin/employees/view/${emp._id}`, { state: { employee: emp } }) },
                      { title: 'Edit Employee', icon: Edit, color: 'text-blue-600', hoverBg: 'hover:bg-blue-50', onClick: () => navigate(`/admin/employees/edit/${emp._id}`, { state: { employee: emp } }) },
                      { title: emp.status === 'Active' ? 'Mark Inactive' : 'Mark Active', icon: emp.status === 'Active' ? XCircle : CheckCircle, color: emp.status === 'Active' ? 'text-orange-600' : 'text-green-600', hoverBg: emp.status === 'Active' ? 'hover:bg-orange-50' : 'hover:bg-green-50', onClick: () => handleToggleStatus(emp._id) },
                      { title: 'Reset Password', icon: Key, color: 'text-gray-700', hoverBg: 'hover:bg-gray-100', onClick: () => navigate(`/admin/employees/reset-password/${emp._id}`) },
                      { title: 'Delete Employee', icon: Trash2, color: 'text-red-600', hoverBg: 'hover:bg-red-50', onClick: () => handleDelete(emp._id) },
                    ].map(({ title, icon: Icon, color, hoverBg, onClick }) => (
                      <button
                        key={title}
                        onClick={(e) => { e.stopPropagation(); onClick(); setOpenDropdownId(null); }}
                        className={`w-full text-left px-4 py-2 text-sm font-semibold flex items-center gap-2 ${color} ${hoverBg} transition-colors`}
                      >
                        <Icon size={14} /> {title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
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
      <Button variant="primary" onClick={() => navigate('/admin/employees/create')} icon={Plus}>
        <span>Add Employee</span>
      </Button>
    </div>
  );

  return (
    <div className="flex gap-5 max-w-7xl mx-auto items-start pb-8">
      <div className="transition-all duration-300 ease-in-out min-w-0 w-full flex-1 space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Employee Management"
          subtitle="Manage your workforce across all branches"
          actions={headerActions}
        />

        {/* ROW 1 — 4 Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {stats.map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              icon={s.icon}
              iconBg={s.bg}
              iconColor={s.color}
              bgGradient={s.bgGradient}
            />
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-4 bg-white p-3.5 rounded-none border border-gray-200 items-center shadow-sm">
          <div className="w-full md:flex-1">
            <SearchBox
              placeholder="Employee ID, Name, Phone Number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-none"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              containerClassName="min-w-[130px] flex-1"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>

            <BranchSelect
              value={filters.branch}
              onChange={(e) => setFilters((f) => ({ ...f, branch: e.target.value }))}
              containerClassName="min-w-[130px] flex-1"
              showAllOption
              label=""
            />

            <button
              onClick={() => { setSearch(''); setFilters({ status: '', branch: '' }); }}
              className="p-2.5 bg-gray-50 border border-gray-200 rounded-none text-gray-500 hover:text-green-600 hover:bg-green-50 hover:border-green-200 transition-all cursor-pointer shrink-0 h-[42px] flex items-center justify-center"
              title="Reset Filters"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Data Table / Card View */}
        <div className="bg-white rounded-none border border-gray-200 shadow-sm">
          {isMobile ? renderEmployeeCards() : (
          <div className="overflow-x-auto pb-32">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Photo</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Employee ID</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Name & Role</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Branch</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Phone</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Age</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="8" className="p-16 text-center text-gray-500 text-sm">Loading workforce data...</td></tr>
                ) : employees.length === 0 ? (
                  <tr><td colSpan="8" className="p-16 text-center text-gray-500 text-sm">No employees found matching criteria.</td></tr>
                ) : (
                  employees.map((emp) => {
                    const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase();
                    return (
                      <tr
                        key={emp._id}
                        className={`transition-colors cursor-pointer hover:bg-green-50/50 ${''}`}
                        // onClick={() => navigate(`/admin/employees/view/${emp._id}`)}
                      >
                        <td className="px-4 py-3">
                          <div className={`w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-green-600 border border-gray-200 ${emp.photo ? 'bg-transparent' : 'bg-gray-100'}`}>
                            {emp.photo
                              ? <img src={emp.photo} alt="" className="w-full h-full object-cover" />
                              : initials}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-bold text-green-600 font-mono text-xs">
                          {emp.employeeId || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-900 text-sm">{emp.firstName} {emp.lastName}</div>
                          <div className="text-[11px] text-gray-500">{emp.role}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{emp.branch || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{emp.mobile}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold text-gray-900">{emp.age || '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={emp.status === 'Active' ? 'success' : 'danger'}>
                            {emp.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(openDropdownId === emp._id ? null : emp._id);
                              }}
                              className="p-1.5 rounded-none border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors shadow-sm"
                            >
                              <MoreVertical size={16} />
                            </button>
                            {openDropdownId === emp._id && (
                              <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-none shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 py-1.5 z-50">
                                {[
                                  { title: 'View Profile', icon: Eye, color: 'text-gray-700', iconColor: 'text-indigo-500', hoverBg: 'hover:bg-gray-50', onClick: () => navigate(`/admin/employees/view/${emp._id}`, { state: { employee: emp } }) },
                                  { title: 'Edit Employee', icon: Edit, color: 'text-gray-700', iconColor: 'text-blue-500', hoverBg: 'hover:bg-gray-50', onClick: () => navigate(`/admin/employees/edit/${emp._id}`, { state: { employee: emp } }) },
                                  { title: emp.status === 'Active' ? 'Mark Inactive' : 'Mark Active', icon: emp.status === 'Active' ? XCircle : CheckCircle, color: 'text-gray-700', iconColor: emp.status === 'Active' ? 'text-orange-500' : 'text-green-500', hoverBg: 'hover:bg-gray-50', onClick: () => handleToggleStatus(emp._id) },
                                  { title: 'Reset Password', icon: Key, color: 'text-gray-700', iconColor: 'text-gray-500', hoverBg: 'hover:bg-gray-50', onClick: () => navigate(`/admin/employees/reset-password/${emp._id}`) },
                                  { title: 'Delete Employee', icon: Trash2, color: 'text-red-600', iconColor: 'text-red-500', hoverBg: 'hover:bg-red-50', onClick: () => handleDelete(emp._id) },
                                ].map(({ title, icon: Icon, color, iconColor, hoverBg, onClick }) => (
                                  <button
                                    key={title}
                                    onClick={(e) => { e.stopPropagation(); onClick(); setOpenDropdownId(null); }}
                                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center gap-2.5 ${color} ${hoverBg} transition-colors border-none bg-transparent cursor-pointer`}
                                  >
                                    <Icon size={14} className={iconColor} /> {title}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          )}

          {/* Footer / Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          />
        </div>
      </div>

      </div>
  );
};

export default EmployeeList;

