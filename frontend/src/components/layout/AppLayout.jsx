import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import logo from '../../assets/Logo 1.png';

const AppLayout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const role = user.role || 'employee';
  const isAdmin = role === 'admin' || role === 'super admin' || role === 'Super Admin';

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-800 font-sans relative">
      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      {isAdmin && (
        <div className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-40 transform transition-transform duration-300' : 'relative z-10'}
          ${isMobile && !mobileOpen ? '-translate-x-full' : 'translate-x-0'}
        `}>
          <Sidebar 
            collapsed={collapsed} 
            setCollapsed={setCollapsed} 
            isMobile={isMobile} 
            onClose={() => setMobileOpen(false)}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          isMobile={isMobile} 
          onToggleMobileMenu={() => setMobileOpen(true)} 
          isAdmin={isAdmin}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex flex-col justify-between">
          {/* Print Only Header */}
          <div className="print-header">
            <img src={logo} alt="Belwin Jewels" className="w-16 h-16 object-contain" />
            <div className="flex flex-col text-center md:text-left">
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">BELLWIN GROUP OF COMPANIES</h1>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Official System Report</p>
            </div>
          </div>

          <div className="w-full flex-1 max-w-screen-2xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
