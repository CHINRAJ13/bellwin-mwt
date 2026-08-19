import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Search, UserCheck, Briefcase, IndianRupee, Save, XCircle } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import Button from '../../../components/ui/Button';

const PromotionDemotion = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Form State
  const [newRole, setNewRole] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wrapperRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim().length < 3) {
        setSuggestions([]);
        return;
      }
      setLoadingSearch(true);
      try {
        const token = localStorage.getItem('token');
        const res = await api.get(`/employees?search=${searchTerm}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const emps = Array.isArray(res.data) ? res.data : (res.data.employees || []);
        setSuggestions(emps);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoadingSearch(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSelect = (emp) => {
    setSelectedEmployee(emp);
    setSearchTerm('');
    setShowSuggestions(false);
    setNewRole(emp.role || 'Employee');
    setNewSalary(emp.salary || '');
    setReason('');
  };

  const handleClearSelection = () => {
    setSelectedEmployee(null);
    setNewRole('');
    setNewSalary('');
    setReason('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      await api.patch(`/employees/${selectedEmployee._id}/promote`, {
        role: newRole,
        salary: newSalary,
        reason: reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Successfully updated ${selectedEmployee.firstName}'s profile`);
      handleClearSelection();
    } catch (err) {
      toast.error('Failed to update employee profile');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Promote / Demote Employee"
        subtitle="Search for an employee to update their designation and salary"
      />

      {/* Autocomplete Search Section */}
      <div className="bg-white p-6 rounded-none border border-gray-200 shadow-sm relative" ref={wrapperRef}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="search-input w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            placeholder="Search by ID, Name or Phone Number..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!showSuggestions) setShowSuggestions(true);
            }}
            onClick={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
          />
          {loadingSearch && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Dropdown Suggestions */}
        {showSuggestions && suggestions.length > 0 && searchTerm.length >= 3 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-none shadow-xl border border-gray-100 max-h-80 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2">
            {suggestions.map(emp => {
              const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase();
              return (
                <div
                  key={emp._id}
                  className="flex items-center gap-4 p-3 hover:bg-green-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                  onClick={() => handleSelect(emp)}
                >
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-sm text-green-600 border border-green-200 ${emp.photo ? 'bg-transparent' : 'bg-green-50'}`}>
                    {emp.photo ? <img src={emp.photo} alt="Avatar" className="w-full h-full object-cover" /> : initials}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900">{emp.firstName} {emp.lastName}</h4>
                    <div className="flex gap-2 items-center mt-1">
                      <span className="text-[11px] font-mono font-semibold text-green-600 bg-green-50 px-2 rounded-none py-0.5">{emp.employeeId}</span>
                      <span className="text-xs text-gray-500">{emp.role} • {emp.branch || 'No Branch'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {showSuggestions && suggestions.length === 0 && searchTerm.length >= 3 && !loadingSearch && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-none shadow-lg border border-gray-100 p-4 text-center text-sm text-gray-500 z-50">
            No employees found matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Selected Employee Profile & Form */}
      {selectedEmployee && (
        <div className="bg-white rounded-none border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex justify-between items-start">
            <div className="flex items-center gap-5">
              <div className={`w-16 h-16 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-xl text-green-600 border-[3px] border-white shadow-md ${selectedEmployee.photo ? 'bg-white' : 'bg-green-100'}`}>
                {selectedEmployee.photo 
                  ? <img src={selectedEmployee.photo} alt="Avatar" className="w-full h-full object-cover" /> 
                  : `${selectedEmployee.firstName?.[0] || ''}${selectedEmployee.lastName?.[0] || ''}`.toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="font-mono text-green-600 font-semibold">{selectedEmployee.employeeId}</span>
                  <span>•</span>
                  <span>{selectedEmployee.branch || 'No Branch'}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleClearSelection}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              title="Clear Selection"
            >
              <XCircle size={20} />
            </button>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Current Stats */}
              <div className="bg-gray-50 rounded-none p-4 flex items-center gap-4 border border-gray-100">
                <div className="w-10 h-10 rounded-none bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Current Role</p>
                  <p className="font-bold text-gray-900">{selectedEmployee.role || 'Employee'}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-none p-4 flex items-center gap-4 border border-gray-100">
                <div className="w-10 h-10 rounded-none bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                  <IndianRupee size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Current Salary</p>
                  <p className="font-bold text-gray-900">₹{selectedEmployee.salary?.toLocaleString('en-IN') || '0'}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 form-spiritual-bg">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Role / Designation</label>
                  <select
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select Role</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="HR">HR</option>
                    <option value="Employee">Employee</option>
                    <option value="Appraiser">Appraiser</option>
                    <option value="Cashier">Cashier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Salary (₹)</label>
                  <input
                    type="number"
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    placeholder="Enter new salary amount"
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Remarks / Reason</label>
                <textarea
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none h-24"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Annual Performance Review, Department Transfer..."
                ></textarea>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  icon={Save}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Update Profile'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionDemotion;
