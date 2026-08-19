import { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import {
  CalendarCheck, Search, Filter, RefreshCw,
  CheckCircle2, XCircle, Clock, Umbrella, Star,
  ChevronLeft, ChevronRight, Edit3, Save, X, Users
} from 'lucide-react';

const API = '';
const getToken = () => localStorage.getItem('token');

const STATUS_CONFIG = {
  Present:  { color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Present',  icon: CheckCircle2 },
  Absent:   { color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: 'Absent',   icon: XCircle },
  'Half Day': { color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Half Day', icon: Clock },
  Leave:    { color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Leave',    icon: Umbrella },
  Holiday:  { color: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-200', label: 'Holiday',  icon: Star }
};

const STATUSES = Object.keys(STATUS_CONFIG);

function Badge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Absent'];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

function StatCard({ label, value, colorClass, bgClass, icon: Icon }) {
  return (
    <div className={`bg-white rounded-none p-4 shadow-sm border border-gray-100 flex items-center gap-3.5 min-w-0`}>
      <div className={`w-11 h-11 rounded-none flex items-center justify-center shrink-0 ${bgClass}`}>
        <Icon size={20} className={colorClass} />
      </div>
      <div>
        <div className="text-2xl font-black text-gray-900 leading-none tracking-tight">{value}</div>
        <div className="text-[11px] text-gray-500 mt-1 font-bold uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

export default function Attendance() {
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [employees, setEmployees] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const headers = { 'x-auth-token': getToken() };

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      const res = await api.get(`${API}/employees`, { headers });
      setEmployees(res.data.employees || []);
    } catch (e) {
      showToast('Failed to load employees', 'error');
    }
  }, []);

  // Fetch attendance for selected date
  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`${API}/attendance?date=${selectedDate}`, { headers });
      const map = {};
      (res.data.records || []).forEach(r => {
        map[r.employeeId._id || r.employeeId] = r;
      });
      setAttendanceMap(map);
    } catch (e) {
      showToast('Failed to load attendance', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  // Statistics
  const stats = STATUSES.map(s => ({
    ...STATUS_CONFIG[s],
    count: Object.values(attendanceMap).filter(r => r.status === s).length
  }));
  const totalMarked = Object.keys(attendanceMap).length;

  // Filtered employees
  const filtered = employees.filter(emp => {
    const name = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const id = emp.employeeId?.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || id?.includes(search.toLowerCase());
    const record = attendanceMap[emp._id];
    const matchStatus = filterStatus === 'All' || (record?.status === filterStatus) || (!record && filterStatus === 'Absent');
    return matchSearch && matchStatus;
  });

  // Save attendance for a single employee
  const saveAttendance = async (empId, data) => {
    setSaving(true);
    try {
      await api.post(`${API}/attendance/mark`, {
        employeeId: empId,
        date: selectedDate,
        ...data
      }, { headers });
      await fetchAttendance();
      showToast('Attendance saved');
      setEditingId(null);
    } catch (e) {
      showToast(e.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Bulk mark all visible employees with a status
  const bulkMark = async (status) => {
    if (!window.confirm(`Mark all ${filtered.length} employees as ${status}?`)) return;
    setSaving(true);
    try {
      const records = filtered.map(emp => ({
        employeeId: emp._id,
        date: selectedDate,
        status,
        checkIn: status === 'Present' ? '09:00' : null,
        checkOut: status === 'Present' ? '18:00' : null
      }));
      await api.post(`${API}/attendance/bulk`, { records }, { headers });
      await fetchAttendance();
      showToast(`Bulk marked as ${status}`);
    } catch (e) {
      showToast('Bulk mark failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Navigate date
  const changeDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[1440px] mx-auto pb-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-6 z-50 px-4 py-3 rounded-none shadow-lg flex items-center gap-2 text-white text-sm font-bold animate-[slideUp_0.2s_ease] ${
          toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
        }`}>
          <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 px-6 pt-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-none bg-green-600 flex items-center justify-center shadow-sm">
              <CalendarCheck size={18} className="text-white" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 m-0">Attendance Management</h1>
          </div>
          <p className="text-xs text-gray-500 m-0 ml-12">Track and manage daily employee attendance</p>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-none shadow-sm border border-gray-200">
          <button onClick={() => changeDate(-1)} className="w-8 h-8 rounded-none border-none bg-gray-50 hover:bg-gray-100 cursor-pointer flex items-center justify-center text-gray-700 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="border-none outline-none text-sm font-bold text-gray-900 cursor-pointer bg-transparent px-2"
          />
          <button onClick={() => changeDate(1)} className="w-8 h-8 rounded-none border-none bg-gray-50 hover:bg-gray-100 cursor-pointer flex items-center justify-center text-gray-700 transition-colors">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => setSelectedDate(today)} className="px-3 py-1.5 rounded-none border-none bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold cursor-pointer transition-colors shadow-sm">Today</button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6 px-6">
        <StatCard label="Total Staff" value={employees.length} colorClass="text-blue-500" bgClass="bg-blue-50" icon={Users} />
        {stats.map(s => (
          <StatCard key={s.label} label={s.label} value={s.count} colorClass={s.color} bgClass={s.bg} icon={s.icon} />
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 mb-5 px-6 items-center">
        {/* Search */}
        <div className="flex-1 w-full flex items-center gap-2 bg-white border border-gray-200 rounded-none px-3 h-10 shadow-sm focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 transition-all">
          <Search size={15} className="text-gray-400" />
          <input placeholder="employe id and name phone number" value={search} onChange={e => setSearch(e.target.value)}
            className="border-none outline-none text-sm flex-1 bg-transparent text-gray-900 placeholder-gray-500 w-full" />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
          {/* Filter */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-none px-3 h-10 shadow-sm shrink-0">
            <Filter size={14} className="text-gray-400" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="border-none outline-none text-sm text-gray-900 bg-transparent cursor-pointer font-medium">
              <option value="All">All Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Bulk actions */}
          {['Present', 'Absent', 'Holiday'].map(s => {
            const cfg = STATUS_CONFIG[s];
            return (
              <button key={s} onClick={() => bulkMark(s)} disabled={saving}
                className={`flex items-center gap-1.5 px-3 h-10 rounded-none border border-transparent ${cfg.bg} ${cfg.color} text-[11px] font-bold cursor-pointer hover:opacity-80 transition-opacity shrink-0`}>
                Mark {s}
              </button>
            );
          })}

          <button onClick={fetchAttendance} disabled={loading}
            className="flex items-center gap-1.5 px-3 h-10 rounded-none border border-gray-200 bg-white text-gray-700 text-[11px] font-bold cursor-pointer hover:bg-gray-50 transition-colors shadow-sm shrink-0">
            <RefreshCw size={14} className={loading ? 'animate-spin text-green-600' : ''} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-none shadow-sm border border-gray-200 overflow-hidden mx-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Employee', 'Date', 'Check In', 'Check Out', 'Working Hours', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center p-10 text-gray-500 text-sm">Loading attendance data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center p-10 text-gray-500 text-sm">No employees found</td></tr>
              ) : filtered.map((emp, idx) => {
                const record = attendanceMap[emp._id];
                const isEditing = editingId === emp._id;

                return (
                  <tr key={emp._id} className={`transition-colors hover:bg-green-50/50 ${isEditing ? 'bg-indigo-50/50' : ''}`}>
                    {/* Employee */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-gray-200 ${emp.photo ? 'bg-transparent' : 'bg-green-50'}`}>
                          {emp.photo
                            ? <img src={emp.photo} alt="" className="w-full h-full rounded-full object-cover" />
                            : <span className="text-green-600 text-xs font-bold">{emp.firstName?.[0]}{emp.lastName?.[0]}</span>
                          }
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{emp.firstName} {emp.lastName}</div>
                          <div className="text-[11px] text-gray-500 font-medium">{emp.employeeId} · {emp.designation}</div>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-xs text-gray-900 font-medium whitespace-nowrap">{selectedDate}</td>

                    {/* Check In */}
                    <td className="px-4 py-3">
                      {isEditing
                        ? <input type="time" value={editData.checkIn || ''} onChange={e => setEditData(d => ({ ...d, checkIn: e.target.value }))}
                            className="px-2 py-1.5 rounded-none border border-gray-300 text-xs outline-none w-[90px] focus:border-green-500 focus:ring-1 focus:ring-green-500" />
                        : <span className={`text-xs font-semibold ${record?.checkIn ? 'text-gray-900' : 'text-gray-400'}`}>{record?.checkIn || '—'}</span>
                      }
                    </td>

                    {/* Check Out */}
                    <td className="px-4 py-3">
                      {isEditing
                        ? <input type="time" value={editData.checkOut || ''} onChange={e => setEditData(d => ({ ...d, checkOut: e.target.value }))}
                            className="px-2 py-1.5 rounded-none border border-gray-300 text-xs outline-none w-[90px] focus:border-green-500 focus:ring-1 focus:ring-green-500" />
                        : <span className={`text-xs font-semibold ${record?.checkOut ? 'text-gray-900' : 'text-gray-400'}`}>{record?.checkOut || '—'}</span>
                      }
                    </td>

                    {/* Working Hours */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-gray-900">
                        {record?.workingHours ? `${record.workingHours}h` : '—'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {isEditing
                        ? <select value={editData.status || 'Absent'} onChange={e => setEditData(d => ({ ...d, status: e.target.value }))}
                            className="px-2 py-1.5 rounded-none border border-gray-300 text-xs outline-none bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        : <Badge status={record?.status || 'Absent'} />
                      }
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex gap-1.5">
                          <button onClick={() => saveAttendance(emp._id, editData)} disabled={saving}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-none border-none bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold cursor-pointer transition-colors shadow-sm">
                            <Save size={12} /> Save
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-none border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 text-[10px] cursor-pointer transition-colors">
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingId(emp._id); setEditData({ status: record?.status || 'Absent', checkIn: record?.checkIn || '', checkOut: record?.checkOut || '' }); }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-none border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-[11px] font-bold cursor-pointer transition-colors shadow-sm">
                          <Edit3 size={12} /> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <span className="text-xs text-gray-500 font-medium">Showing {filtered.length} of {employees.length} employees</span>
          <span className="text-xs text-gray-500 font-medium">{totalMarked} attendance records for {selectedDate}</span>
        </div>
      </div>
    </div>
  );
}
