import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  ShieldCheck, Search, Save, Check, X, Mail, Phone, BadgeInfo
} from 'lucide-react';
import { ADMIN_NAV } from '../../components/layout/navData';

const API = '';
const getToken = () => localStorage.getItem('token');

// Dynamically generate modules from ADMIN_NAV, excluding dashboard
const PERMISSION_MODULES = ADMIN_NAV.filter(nav => nav.id !== 'dashboard').map(nav => ({
  key: nav.id,
  label: nav.label
}));

export default function RolesPermissions() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  
  const [permissions, setPermissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [loanSchemes, setLoanSchemes] = useState([]);

  const headers = { 'x-auth-token': getToken() };





  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch employees from backend based on search query
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!debouncedSearch.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await api.get(`/employees?search=${encodeURIComponent(debouncedSearch)}`, { headers });
        setSearchResults(res.data.employees || res.data.data || res.data || []);
      } catch (e) {
        console.error('API search failed', e);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    fetchEmployees();
  }, [debouncedSearch]);

  const togglePermission = (key) => {
    setPermissions(prev => 
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    );
  };

  const handleSelectEmployee = (emp) => {
    setSelectedEmp(emp);
    setPermissions(emp.permissions || []);
    setSearch(''); // clear search after selection
    setSearchResults([]);
  };

  const handleSave = async () => {
    if (!selectedEmp || !selectedEmp._id) return;
    setSaving(true);
    try {
      await api.put(`/roles/assign/${selectedEmp._id}`, 
        { role: 'employee', permissions }, 
        { headers }
      );
      
      showToast('Permissions updated successfully!');
      
      // Update local storage if this employee is the logged-in user
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.employee && user.employee._id === selectedEmp._id) {
        user.employee.permissions = permissions;
        user.role = 'employee';
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (e) {
      showToast('Failed to assign permissions', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[1440px] mx-auto pb-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-6 z-50 px-4 py-3 rounded-none shadow-lg flex items-center gap-2 text-white text-sm font-bold animate-[slideUp_0.2s_ease] ${
          toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
        }`}>
          <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
          {toast.type === 'success' ? <Check size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="px-6 pt-6 mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 m-0">Employee Permissions</h1>
        </div>
        <p className="text-xs text-gray-500 m-0">Manage module access for employees</p>
      </div>

      {/* Search Bar */}
      <div className="px-6 mb-8 relative">
        <div className="max-w-2xl bg-white p-2 rounded-none shadow-sm border border-gray-200 flex items-center gap-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <div className="w-10 h-10 rounded-none bg-indigo-50 flex items-center justify-center shrink-0">
            {isSearching ? (
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search size={18} className="text-indigo-600" />
            )}
          </div>
          <input 
            type="text" 
            placeholder="Search by ID, Name or Phone Number..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal"
          />
          {search && (
            <button onClick={() => { setSearch(''); setSearchResults([]); }} className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer mr-1 border-none bg-transparent">
              <X size={18} />
            </button>
          )}
        </div>
        
        {/* Search Results Dropdown */}
        {searchResults.length > 0 && search.trim() && (
          <div className="absolute top-full left-6 mt-1 w-full max-w-2xl bg-white border border-gray-200 shadow-lg z-10 max-h-60 overflow-y-auto">
            {searchResults.map(emp => (
              <div 
                key={emp._id} 
                onClick={() => handleSelectEmployee(emp)}
                className="p-3 border-b border-gray-100 hover:bg-indigo-50 cursor-pointer flex justify-between items-center transition-colors"
              >
                <div>
                  <div className="font-bold text-gray-900">{emp.firstName} {emp.lastName}</div>
                  <div className="text-xs text-gray-500">{emp.employeeId} • {emp.designation}</div>
                </div>
                <div className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">Select</div>
              </div>
            ))}
          </div>
        )}
        
        {!selectedEmp && search.trim().length > 0 && searchResults.length === 0 && !isSearching && (
          <div className="mt-3 ml-2 text-sm text-red-500 font-medium flex items-center gap-1.5">
            <BadgeInfo size={16} /> No employee found matching "{search}".
          </div>
        )}
      </div>

      {/* Content Area */}
      {selectedEmp && (
        <div className="px-6 grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 animate-[slideUp_0.3s_ease]">
          
          {/* Left Card: Employee Details */}
          <div className="bg-white rounded-none border border-gray-200 shadow-sm p-6 h-fit sticky top-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 overflow-hidden border-4 border-indigo-50 shadow-md">
                {selectedEmp.photo ? (
                  <img src={selectedEmp.photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-3xl font-bold">
                    {selectedEmp.firstName ? selectedEmp.firstName.charAt(0).toUpperCase() : '?'}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 m-0">{selectedEmp.firstName} {selectedEmp.lastName}</h2>
              <p className="text-indigo-600 font-bold text-sm m-0 mt-1">{selectedEmp.employeeId}</p>
              <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold mt-3">
                {selectedEmp.designation || 'Employee'}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <Mail size={14} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Email Address</div>
                  <div className="text-sm font-medium text-gray-900 truncate">{selectedEmp.email || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <Phone size={14} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Phone Number</div>
                  <div className="text-sm font-medium text-gray-900 truncate">{selectedEmp.mobile || selectedEmp.mobileNumber || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Permissions Toggles */}
          <div className="bg-white rounded-none border border-gray-200 shadow-sm flex flex-col h-fit">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={20} className="text-green-600" />
                <h3 className="text-lg font-bold text-gray-900 m-0">Module Permissions</h3>
              </div>
              <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">
                {permissions.length} modules granted
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 gap-6">
              {ADMIN_NAV.filter(nav => nav.id !== 'dashboard' && nav.id !== 'access_control').map((parent) => {
                const children = parent.children || [{ label: parent.label, path: parent.path || parent.id }];
                const Icon = parent.icon;
                
                const allChildKeys = children.map(child => child.path || child.label);
                const allSelected = allChildKeys.every(key => permissions.includes(key));
                
                const toggleParent = () => {
                  if (allSelected) {
                    setPermissions(prev => prev.filter(p => !allChildKeys.includes(p)));
                  } else {
                    setPermissions(prev => {
                      const newPerms = new Set([...prev, ...allChildKeys]);
                      return Array.from(newPerms);
                    });
                  }
                };

                return (
                  <div key={parent.id} className="border border-gray-100 rounded-none overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 font-bold text-gray-800 text-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {Icon && <Icon size={16} className="text-gray-500" />}
                        {parent.label}
                      </div>
                      <div 
                        onClick={toggleParent}
                        className={`flex items-center gap-2 px-2 py-1 cursor-pointer rounded border transition-all ${
                          allSelected ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
                        }`}
                      >
                        <span className="text-xs font-semibold">Select All</span>
                        <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${allSelected ? 'border-white bg-transparent' : 'border-gray-300 bg-white'}`}>
                          {allSelected && <Check size={12} className="text-white" />}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-3">
                      {children.map((child) => {
                        const permKey = child.path || child.label;
                        const isGranted = permissions.includes(permKey);
                        return (
                          <div 
                            key={permKey}
                            onClick={() => togglePermission(permKey)}
                            className={`flex items-center gap-3 p-2 rounded-none border transition-all cursor-pointer ${
                              isGranted ? 'border-green-500 bg-green-50/30' : 'border-gray-100 bg-white hover:border-gray-200'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${isGranted ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}>
                              {isGranted && <Check size={14} className="text-white" />}
                            </div>
                            <span className={`text-sm font-medium ${isGranted ? 'text-green-800' : 'text-gray-600'}`}>
                              {child.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 rounded-none border-none bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Save size={18} /> {saving ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
