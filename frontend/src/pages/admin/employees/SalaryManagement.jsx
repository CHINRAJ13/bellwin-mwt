import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../../services/api';
import {
  Wallet, Search, Plus, Eye, Download, CheckCircle2, XCircle,
  Clock, TrendingUp, Users, Filter, RefreshCw, X, Save,
  FileText, ChevronDown, IndianRupee, Printer
} from 'lucide-react';

const API = '';
const getToken = () => localStorage.getItem('token');

const STATUS_CONFIG = {
  Draft:     { color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' },
  Generated: { color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
  Paid:      { color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' }
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Draft'];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      {status}
    </span>
  );
}

function StatCard({ label, value, colorClass, bgClass, icon: Icon, prefix }) {
  return (
    <div className={`bg-white rounded-none p-4 shadow-sm border border-gray-100 flex items-center gap-3.5 min-w-0`}>
      <div className={`w-11 h-11 rounded-none flex items-center justify-center shrink-0 ${bgClass}`}>
        <Icon size={20} className={colorClass} />
      </div>
      <div>
        <div className="text-2xl font-black text-gray-900 leading-none tracking-tight">{prefix || ''}{value}</div>
        <div className="text-[11px] text-gray-500 mt-1 font-bold uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

/* ====== PAYSLIP MODAL ====== */
function PayslipModal({ salary, onClose }) {
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Payslip</title>
      <style>
        body { font-family: Inter, sans-serif; padding: 32px; color: #111; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        td, th { border: 1px solid #e5e7eb; padding: 8px 12px; font-size: 13px; }
        th { background: #f3f4f6; font-weight: 600; text-align: left; }
        .header { text-align: center; margin-bottom: 24px; }
        .header h1 { font-size: 1.5rem; color: #991b1b; }
        .header h2 { font-size: 1rem; color: #374151; margin-top: 4px; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .label { font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 600; }
        .value { font-size: 14px; font-weight: 700; color: #111; }
        .net { background: #f0fdf4; font-size: 1.1rem; font-weight: 800; color: #16a34a; }
      </style></head>
      <body>${printContent}</body></html>
    `);
    win.document.close();
    win.print();
  };

  if (!salary) return null;
  const emp = salary.employeeId;
  const a = salary.allowances;
  const d = salary.deductions;

  return (
    <div className="fixed inset-0 bg-gray-900/80 z-[1000] flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="bg-white rounded-none w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0 sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-blue-50 flex items-center justify-center">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="font-bold text-gray-900 leading-tight">Payslip</div>
              <div className="text-xs text-gray-500 font-medium">{salary.month}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 rounded-none bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-colors">
              <Printer size={14} /> Print / Download
            </button>
            <button onClick={onClose} className="w-9 h-9 rounded-none border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Payslip Content */}
        <div ref={printRef} className="p-8">
          {/* Company Header */}
          <div className="text-center mb-6 pb-4 border-b-2 border-red-800">
            <div className="text-2xl font-black text-red-800 tracking-tight">Belwin Jewels</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">Payslip for {salary.month}</div>
          </div>

          {/* Employee Info */}
          <div className="grid grid-cols-2 gap-5 mb-6 p-5 bg-gray-50 rounded-none border border-gray-100">
            {[
              ['Employee Name', `${emp?.firstName} ${emp?.lastName}`],
              ['Employee ID', emp?.employeeId],
              ['Designation', emp?.designation],
              ['Department', emp?.departmentId],
              ['Month', salary.month],
              ['Status', salary.status],
              ['Working Days', salary.workingDays],
              ['Present Days', salary.presentDays]
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">{label}</div>
                <div className="text-sm font-bold text-gray-900">{value || '—'}</div>
              </div>
            ))}
          </div>

          {/* Salary Table */}
          <div className="overflow-x-auto mb-5 border border-gray-200 rounded-none">
          <table className="w-full border-collapse min-w-[550px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">Earnings</th>
                <th className="p-3 text-right text-xs font-bold text-gray-900 border-b border-gray-200">Amount (₹)</th>
                <th className="p-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">Deductions</th>
                <th className="p-3 text-right text-xs font-bold text-gray-900 border-b border-gray-200">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                [['Basic Salary', salary.basicSalary], ['Provident Fund', d?.pf]],
                [['HRA', a?.hra], ['ESI', d?.esi]],
                [['Transport', a?.transport], ['Income Tax', d?.tax]],
                [['Medical', a?.medical], ['Other Deductions', d?.other]],
                [['Other Allowance', a?.other], [null, null]],
              ].map((row, i) => (
                <tr key={i}>
                  {row.map(([label, val], j) => label ? (
                    <>
                      <td key={`l-${j}`} className="p-3 text-xs text-gray-700 font-medium">{label}</td>
                      <td key={`v-${j}`} className="p-3 text-xs text-gray-900 text-right font-bold">₹{Number(val || 0).toLocaleString('en-IN')}</td>
                    </>
                  ) : (
                    <><td key={`e1-${j}`} className="p-3" /><td key={`e2-${j}`} className="p-3" /></>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td className="p-3 text-xs font-bold text-gray-900">Total Earnings</td>
                <td className="p-3 text-right font-black text-emerald-600 text-sm">₹{Number(salary.basicSalary + salary.totalAllowances).toLocaleString('en-IN')}</td>
                <td className="p-3 text-xs font-bold text-gray-900">Total Deductions</td>
                <td className="p-3 text-right font-black text-red-600 text-sm">₹{Number(salary.totalDeductions).toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>
          </div>

          {/* Net Salary */}
          <div className="p-5 bg-emerald-50 rounded-none flex justify-between items-center border border-emerald-100">
            <span className="font-bold text-gray-900">Net Salary</span>
            <span className="font-black text-2xl text-emerald-600 tracking-tight">₹{Number(salary.netSalary).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====== GENERATE MODAL ====== */
function GenerateModal({ employees, onClose, onGenerated }) {
  const [form, setForm] = useState({
    employeeId: '',
    month: new Date().toISOString().slice(0, 7),
    basicSalary: '',
    allowances: { hra: '', transport: '', medical: '', other: '' },
    deductions: { pf: '', esi: '', tax: '', other: '' },
    workingDays: 26,
    remarks: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const totalAllowances = Object.values(form.allowances).reduce((a, b) => a + (Number(b) || 0), 0);
  const totalDeductions = Object.values(form.deductions).reduce((a, b) => a + (Number(b) || 0), 0);
  const netSalary = (Number(form.basicSalary) || 0) + totalAllowances - totalDeductions;

  const handleSubmit = async () => {
    if (!form.employeeId || !form.month || !form.basicSalary) {
      setError('Employee, month and basic salary are required');
      return;
    }
    setSaving(true);
    try {
      await api.post(`${API}/salary/generate`, form, { headers: { 'x-auth-token': getToken() } });
      onGenerated();
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Generation failed');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-none border border-gray-300 bg-white text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all";
  const labelClass = "block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 bg-gray-900/80 z-[1000] flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="bg-white rounded-none w-full max-w-3xl max-h-[92vh] overflow-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0 sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-indigo-50 flex items-center justify-center">
              <Wallet size={20} className="text-indigo-600" />
            </div>
            <div className="font-bold text-gray-900 leading-tight">Generate Salary</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-none border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {error && <div className="p-3 mb-5 rounded-none bg-red-50 border border-red-200 text-red-600 text-sm font-medium">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="sm:col-span-2">
              <label className={labelClass}>Employee *</label>
              <select value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} className={inputClass}>
                <option value="">Select employee...</option>
                {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Month *</label>
              <input type="month" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Basic Salary (₹) *</label>
              <input type="number" placeholder="0.00" value={form.basicSalary} onChange={e => setForm(f => ({ ...f, basicSalary: e.target.value }))} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Allowances */}
            <div className="bg-emerald-50/50 p-4 rounded-none border border-emerald-100">
              <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold uppercase tracking-wider mb-4">
                <TrendingUp size={14} /> Allowances
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(form.allowances).map(key => (
                  <div key={key}>
                    <label className={labelClass}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                    <input type="number" placeholder="0" value={form.allowances[key]}
                      onChange={e => setForm(f => ({ ...f, allowances: { ...f.allowances, [key]: e.target.value } }))}
                      className={inputClass} />
                  </div>
                ))}
              </div>
            </div>

            {/* Deductions */}
            <div className="bg-red-50/50 p-4 rounded-none border border-red-100">
              <div className="flex items-center gap-1.5 text-red-600 text-[11px] font-bold uppercase tracking-wider mb-4">
                <IndianRupee size={14} /> Deductions
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(form.deductions).map(key => (
                  <div key={key}>
                    <label className={labelClass}>{key.toUpperCase()}</label>
                    <input type="number" placeholder="0" value={form.deductions[key]}
                      onChange={e => setForm(f => ({ ...f, deductions: { ...f.deductions, [key]: e.target.value } }))}
                      className={inputClass} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
             <div>
              <label className={labelClass}>Working Days</label>
              <input type="number" value={form.workingDays} onChange={e => setForm(f => ({ ...f, workingDays: e.target.value }))} className={inputClass} />
            </div>
            {/* Remarks */}
            <div>
              <label className={labelClass}>Remarks</label>
              <input placeholder="Optional note..." value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} className={inputClass} />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-none p-5 mb-6 grid grid-cols-3 gap-4 border border-gray-200">
            <div className="text-center">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Earnings</div>
              <div className="text-lg font-black text-emerald-600 mt-1">₹{((Number(form.basicSalary) || 0) + totalAllowances).toLocaleString('en-IN')}</div>
            </div>
            <div className="text-center border-l border-gray-200">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Deductions</div>
              <div className="text-lg font-black text-red-600 mt-1">₹{totalDeductions.toLocaleString('en-IN')}</div>
            </div>
            <div className="text-center bg-emerald-100/50 rounded-none py-2 px-3 border border-emerald-200">
              <div className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider">Net Salary</div>
              <div className="text-xl font-black text-emerald-700 mt-1">₹{netSalary.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <button onClick={onClose} className="px-5 py-2.5 rounded-none border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-none border-none bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors shadow-sm disabled:opacity-70">
              <Save size={16} /> {saving ? 'Generating...' : 'Generate Salary'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====== MAIN PAGE ====== */
export default function SalaryManagement() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showGenerate, setShowGenerate] = useState(false);
  const [viewPayslip, setViewPayslip] = useState(null);
  const [toast, setToast] = useState(null);

  const headers = { 'x-auth-token': getToken() };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchEmployees = useCallback(async () => {
    const res = await api.get(`${API}/employees`, { headers });
    setEmployees(res.data.employees || []);
  }, []);

  const fetchSalaries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`${API}/salary?month=${selectedMonth}`, { headers });
      setSalaries(res.data.salaries || []);
    } catch (e) {
      showToast('Failed to load salaries', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => { fetchSalaries(); }, [fetchSalaries]);

  const markPaid = async (id) => {
    try {
      await api.patch(`${API}/salary/${id}/pay`, {}, { headers });
      fetchSalaries();
      showToast('Marked as Paid');
    } catch (e) {
      showToast('Failed', 'error');
    }
  };

  const viewFull = async (id) => {
    try {
      const res = await api.get(`${API}/salary/${id}`, { headers });
      setViewPayslip(res.data.salary);
    } catch (e) {
      showToast('Failed to load payslip', 'error');
    }
  };

  // Stats
  const totalPaid = salaries.filter(s => s.status === 'Paid').length;
  const totalGenerated = salaries.filter(s => s.status === 'Generated').length;
  const totalNetSalary = salaries.reduce((sum, s) => sum + (s.netSalary || 0), 0);

  const filtered = salaries.filter(s => {
    const emp = s.employeeId;
    const name = `${emp?.firstName} ${emp?.lastName}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || emp?.employeeId?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

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

      {showGenerate && <GenerateModal employees={employees} onClose={() => setShowGenerate(false)} onGenerated={fetchSalaries} />}
      {viewPayslip && <PayslipModal salary={viewPayslip} onClose={() => setViewPayslip(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 px-6 pt-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-none bg-green-600 flex items-center justify-center shadow-sm">
              <Wallet size={18} className="text-white" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 m-0">Salary Management</h1>
          </div>
          <p className="text-xs text-gray-500 m-0 ml-12">Generate, manage & download employee payslips</p>
        </div>

        <div className="flex items-center gap-3">
          <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-2 rounded-none border border-gray-200 text-sm font-medium bg-white text-gray-900 outline-none shadow-sm cursor-pointer" />
          <button onClick={() => setShowGenerate(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-none border-none bg-green-600 hover:bg-green-700 text-white text-sm font-bold cursor-pointer transition-colors shadow-sm">
            <Plus size={16} /> Generate Salary
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 px-6">
        <StatCard label="Total Records" value={salaries.length} colorClass="text-indigo-500" bgClass="bg-indigo-50" icon={Users} />
        <StatCard label="Generated" value={totalGenerated} colorClass="text-amber-500" bgClass="bg-amber-50" icon={Clock} />
        <StatCard label="Paid" value={totalPaid} colorClass="text-emerald-500" bgClass="bg-emerald-50" icon={CheckCircle2} />
        <StatCard label="Total Payout" value={totalNetSalary.toLocaleString('en-IN')} prefix="₹" colorClass="text-purple-500" bgClass="bg-purple-50" icon={TrendingUp} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 mb-5 px-6 items-center">
        <div className="flex-1 w-full flex items-center gap-2 bg-white border border-gray-200 rounded-none px-3 h-10 shadow-sm focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 transition-all">
          <Search size={15} className="text-gray-400" />
          <input placeholder="employe id and name phone number" value={search} onChange={e => setSearch(e.target.value)}
            className="border-none outline-none text-sm flex-1 bg-transparent text-gray-900 placeholder-gray-500 w-full" />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-none px-3 h-10 shadow-sm shrink-0 w-full md:w-auto">
          <Filter size={14} className="text-gray-400" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border-none outline-none text-sm text-gray-900 bg-transparent cursor-pointer font-medium w-full">
            <option value="All">All Status</option>
            {['Draft', 'Generated', 'Paid'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={fetchSalaries} className="flex items-center justify-center gap-1.5 px-4 h-10 rounded-none border border-gray-200 bg-white text-gray-700 text-sm font-bold cursor-pointer hover:bg-gray-50 transition-colors shadow-sm shrink-0 w-full md:w-auto">
          <RefreshCw size={14} className={loading ? 'animate-spin text-green-600' : ''} /> <span className="md:hidden">Refresh</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-none shadow-sm border border-gray-200 overflow-hidden mx-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[950px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Employee', 'Month', 'Basic Salary', 'Allowances', 'Deductions', 'Net Salary', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center p-10 text-gray-500 text-sm">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center p-10 text-gray-500 text-sm">No salary records found. Click "Generate Salary" to add.</td></tr>
              ) : filtered.map((s, i) => {
                const emp = s.employeeId;
                return (
                  <tr key={s._id} className="transition-colors hover:bg-green-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-gray-200 ${emp?.photo ? 'bg-transparent' : 'bg-green-50'}`}>
                          {emp?.photo
                            ? <img src={emp.photo} alt="" className="w-full h-full rounded-full object-cover" />
                            : <span className="text-green-600 text-xs font-bold">{emp?.firstName?.[0]}{emp?.lastName?.[0]}</span>
                          }
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{emp?.firstName} {emp?.lastName}</div>
                          <div className="text-[11px] text-gray-500 font-medium">{emp?.employeeId} · {emp?.designation}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-900 whitespace-nowrap">{s.month}</td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-900">₹{Number(s.basicSalary).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs font-bold text-emerald-600">+₹{Number(s.totalAllowances).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs font-bold text-red-600">-₹{Number(s.totalDeductions).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-black text-gray-900">₹{Number(s.netSalary).toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => viewFull(s._id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-none border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-[11px] font-bold cursor-pointer transition-colors shadow-sm">
                          <Eye size={12} /> View
                        </button>
                        {s.status !== 'Paid' && (
                          <button onClick={() => markPaid(s._id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-none border-none bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold cursor-pointer transition-colors shadow-sm">
                            <CheckCircle2 size={12} /> Pay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <span className="text-xs text-gray-500 font-medium">Showing {filtered.length} records</span>
          <span className="text-xs text-gray-500 font-medium">Month: {selectedMonth}</span>
        </div>
      </div>
    </div>
  );
}
