import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Building2, Menu, X, Gem } from 'lucide-react';
import UserProfile from './UserProfile';
import { ADMIN_NAV } from './navData';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/Logo 1.png';

const BRANCHES = ['Head Office', 'Trichy', 'Pudukkottai', 'Thanjavur'];

const Header = ({ isMobile, onToggleMobileMenu, isAdmin: isAdminProp }) => {
  const [branch, setBranch] = useState('Head Office');
  const [branchOpen, setBranchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  
  const branchRef = useRef(null);
  const navRef = useRef(null);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const isAdminCalculated = user.role === 'admin' || user.role === 'super admin' || user.role === 'Super Admin';
  const isAdmin = typeof isAdminProp !== 'undefined' ? isAdminProp : isAdminCalculated;

  const navigate = useNavigate();
  const location = useLocation();

  const employeePermissions = (user.employee && Array.isArray(user.employee.permissions)) 
    ? user.employee.permissions 
    : (Array.isArray(user.permissions) ? user.permissions : []);

  let NAV = [];
  if (!isAdmin) {
    NAV = ADMIN_NAV.map(parent => {
      if (parent.id === 'dashboard') {
        return parent;
      }
      if (parent.id === 'access_control') return null;
      
      const hasPermission = (item) => {
        return employeePermissions.some(p => 
          p === item.path || p === item.id || p === item.label
        );
      };

      if (!parent.children) {
        return hasPermission(parent) ? parent : null;
      }
      
      const filteredChildren = parent.children.filter(hasPermission);
      
      if (filteredChildren.length > 0) {
        return { ...parent, children: filteredChildren };
      }
      return null;
    }).filter(Boolean);
  }

  useEffect(() => {
    const handler = (e) => {
      if (branchRef.current && !branchRef.current.contains(e.target)) setBranchOpen(false);
      if (navRef.current && !navRef.current.contains(e.target)) setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&display=swap');
        .topbar-header * { font-family: 'Jost', sans-serif; }
      `}</style>

      <header className="topbar-header sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100 print:hidden">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-[68px]">
            
            {/* Mobile Hamburger (Only visible on mobile, left side) */}
            {isMobile && (
              <button
                onClick={onToggleMobileMenu}
                className="p-1.5 mr-3 text-green-600 rounded-none hover:bg-green-50 transition-colors cursor-pointer"
              >
                <Menu size={22} />
              </button>
            )}

            {/* Logo - Show on mobile OR if the user is an employee (since they don't have a sidebar on desktop) */}
            {(isMobile || !isAdmin) && (
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <img src={logo} alt="Belwin Jewels Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col leading-tight overflow-hidden">
                  <span className="text-lg font-bold text-[#14532d] truncate">Belwin Jewels</span>
                  <span className="text-base font-semibold tracking-wide text-green-600 uppercase truncate">Enterprise</span>
                </div>
              </div>
            )}

            {/* Employee Horizontal Navigation (In top bar) */}
            {!isAdmin && NAV.length > 0 && !isMobile && (
              <nav ref={navRef} className="flex-1 flex items-center gap-1 ml-8">
                {NAV.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || item.children?.some(c => c.path === location.pathname);
                  const isOpen = openDropdown === item.id;
                  
                  return (
                    <div key={item.id} className="relative flex-shrink-0">
                      <button
                        onClick={() => {
                          if (item.children) {
                            setOpenDropdown(isOpen ? null : item.id);
                          } else {
                            setOpenDropdown(null);
                            navigate(item.path);
                          }
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md whitespace-nowrap text-sm font-medium transition-colors ${
                          isActive ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                        }`}
                      >
                        {Icon && <Icon size={16} />}
                        {item.label}
                        {item.children && <ChevronDown size={14} className={`ml-1 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
                      </button>
                      
                      {item.children && isOpen && (
                        <div className="absolute left-0 top-[110%] w-56 bg-white border border-gray-100 shadow-lg rounded-md overflow-hidden z-50">
                          <div className="py-1">
                            {item.children.map(child => {
                              const CIcon = child.icon;
                              return (
                                <button
                                  key={child.path}
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    navigate(child.path);
                                  }}
                                  className={`w-full flex items-center gap-2 text-left px-4 py-2 text-sm ${
                                    location.pathname === child.path 
                                      ? 'bg-green-50 text-green-700 font-medium' 
                                      : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'
                                  }`}
                                >
                                  {CIcon && <CIcon size={14} />}
                                  {child.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            )}

            {/* Desktop Search (Left aligned) */}
            {!isMobile && isAdmin && (
              <div className="flex-1 ml-4">
                <div className="relative group w-64 md:w-80 lg:w-[400px]">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search Employee, Customer, Accounts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Right side actions */}
            <div className="flex items-center gap-2 md:gap-4 ml-auto">
              

              {/* Mobile search icon */}
              {isMobile && isAdmin && (
                <button
                  onClick={() => setSearchOpen(o => !o)}
                  className="p-1.5 border border-gray-200 text-gray-500 rounded-none bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Search size={16} />
                </button>
              )}

              {/* Branch Selector — desktop only (Static display for employees) */}
              {!isMobile && !isAdmin && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 border border-green-200 bg-green-50 rounded-none text-xs font-semibold text-green-700">
                  <Building2 size={14} className="text-green-600" />
                  <span>{user.employee?.branch || 'Head Office'}</span>
                </div>
              )}

              {/* Profile */}
              <UserProfile isMobile={isMobile} />
            </div>
          </div>
        </div>

        {/* Mobile full-width search dropdown */}
        {isMobile && isAdmin && searchOpen && (
          <div className="bg-white border-b border-gray-200 p-3 shadow-md">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search Employee, Customer, Accounts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input w-full pl-9 pr-10 py-2 border border-gray-300 rounded-none text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:bg-gray-100 rounded-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
