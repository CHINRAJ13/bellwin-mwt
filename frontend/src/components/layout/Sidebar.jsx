import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, ChevronDown, ChevronRight, UserPlus,
  Settings, X, Gem, Database, Sliders, User, Network, Lock, IdCard, Award,
  Calculator, FileText, Car, Store, Boxes, Diamond, TrendingUp, TrendingDown, Key, UserCheck,
  Upload, CheckCircle, ShieldCheck, FileSearch, ShieldBan, Plus,
  Briefcase, BookOpen, CreditCard, Download, FileEdit, ArrowRightLeft, Landmark, Banknote, ClipboardList,
  Wallet, LayoutGrid, Coins, Box, PhoneCall, PhoneForwarded, Send, History,
  CalendarDays, UserCog, ClipboardCheck
} from 'lucide-react';

import { ADMIN_NAV } from './navData';

import logo from '../../assets/Logo 1.png';

const Sidebar = ({ collapsed, setCollapsed, isMobile, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState(() => {
    const activeParent = ADMIN_NAV.find(item => item.children?.some(c => location.pathname === c.path || c.children?.some(sc => location.pathname === sc.path)));
    return activeParent ? { [activeParent.id]: true } : {};
  });
  const [openSubMenus, setOpenSubMenus] = useState(() => {
    const activeParent = ADMIN_NAV.find(item => item.children?.some(c => c.children?.some(sc => location.pathname === sc.path)));
    if (activeParent) {
      const activeChild = activeParent.children.find(c => c.children?.some(sc => location.pathname === sc.path));
      return activeChild ? { [activeChild.label]: true } : {};
    }
    return {};
  });

  useEffect(() => {
    const activeParent = ADMIN_NAV.find(item => item.children?.some(c => location.pathname === c.path));
    if (activeParent) {
      setOpenMenus({ [activeParent.id]: true });
    }
  }, [location.pathname]);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const role = user.role || 'employee';
  const isAdmin = role === 'admin' || role === 'super admin' || role === 'Super Admin';
  const employeePermissions = (user.employee && Array.isArray(user.employee.permissions)) 
    ? user.employee.permissions 
    : (Array.isArray(user.permissions) ? user.permissions : []);

  // Filter navigation based on role and permissions
  let NAV = [];
  if (isAdmin) {
    NAV = ADMIN_NAV.filter(item => item.id !== 'loan_schemes_access');
  } else {
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

  const isActive = (path) => location.pathname === path;
  const isParentActive = (item) =>
    item.children?.some((c) => location.pathname === c.path || c.children?.some(sc => location.pathname === sc.path));

  const isExpanded = !collapsed;

  const toggleMenu = (id) => setOpenMenus((p) => (p[id] ? {} : { [id]: true }));

  const navTo = (path) => {
    navigate(path);
    if (isMobile && onClose) onClose();
  };

  return (
    <aside 
      className={`flex flex-col bg-white border-r border-gray-200 h-full relative transition-all duration-300 ease-in-out flex-shrink-0 z-40 ${isExpanded ? 'w-64 shadow-xl' : 'w-[72px]'}`}
    >
      
      {/* Collapse Toggle Button */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-green-600 hover:bg-green-50 hover:border-green-200 transition-colors z-50 shadow-sm cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <X size={14} />}
        </button>
      )}

      {/* Brand */}
      <div className={`flex items-center gap-3 h-[72px] border-b border-gray-100 overflow-hidden ${!isExpanded ? 'justify-center px-2' : 'px-6'}`}>
        <div className={`flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isExpanded ? 'w-14 h-14' : 'w-10 h-10'}`}>
          <img src={logo} alt="Belwin Jewels Logo" className="w-full h-full object-contain" />
        </div>
        {isExpanded && (
          <div className="flex flex-col leading-tight overflow-hidden">
            <span className="text-lg font-bold text-[#14532d] truncate">Belwin Jewels</span>
            <span className="text-base font-semibold tracking-wide text-green-600 uppercase truncate">Enterprise</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-none px-3 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.path ? isActive(item.path) : isParentActive(item);
          const isOpen = openMenus[item.id];

          if (item.children) {
            return (
              <div 
                key={item.id} 
                className="space-y-1"
              >
                <button
                  onClick={() => {
                    if (!isExpanded) {
                      setCollapsed(false);
                      setOpenMenus({ [item.id]: true });
                    } else {
                      toggleMenu(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-none transition-all duration-200 group cursor-pointer text-left ${
                    active
                      ? 'bg-green-600 text-white font-semibold shadow-md'
                      : 'text-gray-600 hover:bg-green-200 hover:text-green-600 font-medium'
                  }`}
                >
                  <Icon size={20} className={active ? 'text-white' : 'text-gray-500 group-hover:text-green-600'} strokeWidth={active ? 2.5 : 2} />
                  {isExpanded && (
                    <>
                      <span className="text-sm flex-1">
                        {item.label}
                      </span>
                      <ChevronDown 
                        size={16} 
                        className={`${active ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                      />
                    </>
                  )}
                </button>

                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    isExpanded && isOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 mt-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pl-4 pr-2 space-y-1">
                      {item.children.map((child) => {
                        const CIcon = child.icon;
                        if (child.children) {
                          const isSubOpen = openSubMenus[child.label];
                          const hasActiveChild = child.children.some(sc => isActive(sc.path));
                          return (
                            <div key={child.label} className="mb-1">
                              <button
                                onClick={() => setOpenSubMenus(p => ({...p, [child.label]: !p[child.label]}))}
                                className={`w-full flex justify-between items-center px-3 py-2 rounded-none transition-all duration-150 cursor-pointer text-left ${
                                  hasActiveChild ? 'text-green-600 font-bold' : 'text-gray-600 hover:bg-gray-100 hover:text-green-600 font-medium'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <CIcon size={16} className={hasActiveChild ? 'text-green-600' : 'text-gray-400'} />
                                  <span className="text-xs">{child.label}</span>
                                </div>
                                <ChevronDown size={14} className={`transition-transform duration-200 ${isSubOpen ? 'rotate-180' : ''}`} />
                              </button>
                              <div className={`grid transition-all duration-300 ease-in-out ${isSubOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden">
                                  <div className="pl-6 pr-2 py-1 space-y-1">
                                    {child.children.map(subChild => {
                                      const subActive = isActive(subChild.path);
                                      return (
                                        <button
                                          key={subChild.path}
                                          onClick={() => navTo(subChild.path)}
                                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-none text-left transition-all ${
                                            subActive ? 'text-green-600 bg-green-50 font-bold' : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                                          }`}
                                        >
                                          <span className="text-[11px] truncate">{subChild.label}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        
                        const childActive = isActive(child.path);
                        return (
                          <button
                            key={child.path || child.label}
                            onClick={() => navTo(child.path)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-none transition-all duration-150 cursor-pointer text-left group ${
                              childActive
                                ? 'bg-green-600 text-white font-semibold shadow-sm'
                                : 'text-gray-500 hover:bg-green-200 hover:text-green-600 font-medium'
                            }`}
                          >
                            <CIcon size={16} className={childActive ? 'text-white' : 'text-gray-400 group-hover:text-green-600'} strokeWidth={childActive ? 2.5 : 2} />
                            <span className="text-xs">{child.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => {
                setOpenMenus({});
                navTo(item.path);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-none transition-all duration-200 group cursor-pointer text-left ${
                active
                  ? 'bg-green-600 text-white font-semibold shadow-md'
                  : 'text-gray-600 hover:bg-green-200 hover:text-green-600 font-medium'
              }`}
            >
              {Icon && <Icon size={20} className={active ? 'text-white' : 'text-gray-500 group-hover:text-green-600'} strokeWidth={active ? 2.5 : 2} />}
              {isExpanded && (
                <span className="text-sm">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`p-4 border-t border-gray-100 text-[10px] text-gray-400 tracking-wide ${!isExpanded ? 'text-center' : 'text-left'}`}>
        {!isExpanded ? 'v2.0' : 'Belwin ERP v2.0 · © 2026'}
      </div>
    </aside>
  );
};

export default Sidebar;
