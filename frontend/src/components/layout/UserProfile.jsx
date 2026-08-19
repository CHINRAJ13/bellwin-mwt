import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, User, Settings } from 'lucide-react';

const UserProfile = ({ isMobile }) => {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  
  const isRoutingAdmin = user.role === 'admin';
  const isHR = user.role === 'hr';
  
  // Logic for name, id, and branch
  let name = '';
  let empId = '';
  let branch = '';
  if (isRoutingAdmin) {
    name = 'Administrator';
    empId = 'ADMIN';
    branch = 'Head Office';
  } else if (user.employee) {
    name = `${user.employee.firstName || ''} ${user.employee.lastName || ''}`.trim();
    empId = user.employee.employeeId || 'N/A';
    branch = user.employee.branch || 'N/A';
  }
  if (!name) name = 'User';

  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  
  // Fallback to photo if it exists (using your provided structure example)
  const photo = user.employee?.photo || null; 

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div ref={profileRef} className="relative">
      <button
        onClick={() => setProfileOpen((o) => !o)}
        className={`flex items-center gap-2 p-1 md:pr-3 border rounded-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer ${
          profileOpen ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden">
          {photo ? (
            <img src={photo} alt={name} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        {!isMobile && (
          <>
            <div className="flex flex-col items-start text-left">
              {/* <span className="text-sm font-bold text-gray-800 leading-tight">{name}</span>
              <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wide">{userRole}</span> */}
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {profileOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-white rounded-none shadow-xl border border-gray-100 overflow-hidden z-50 transform origin-top-right transition-all">
          <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white border-4 border-green-300 overflow-hidden mb-3 shadow-md flex items-center justify-center text-2xl font-bold text-green-700">
              {photo ? (
                <img src={photo} alt={name} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <h3 className="text-white font-bold text-lg">{name}</h3>
            <div className="flex flex-col items-center mt-1 space-y-0.5">
              <p className="text-green-100 text-sm font-medium">ID: {empId}</p>
              <p className="text-green-200 text-xs">{branch}</p>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-none flex items-center justify-center gap-2 transition-colors border border-red-200 shadow-sm cursor-pointer"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
