// frontend/src/components/layout/DashboardLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import AdminSidebar from './AdminSidebar';
import HeaderBar from './HeaderBar';

export default function DashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();

  // On mobile: closed by default. On desktop: open by default.
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);

  const adminRoles = ['manager', 'admin', 'superuser'];
  const isAdmin = user?.roles?.some(r => adminRoles.includes(r)) || user?.is_staff || user?.is_superuser;

  const isChatPage = location.pathname === '/chat';

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [location.pathname]);

  // Handle resize: auto-open on desktop, auto-close on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isChatPage) {
    return (
      <div className="min-h-screen bg-[#F2DDD8]">
        <HeaderBar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(o => !o)} />
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2DDD8] flex">

      {/* Mobile backdrop — tap to close */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar — fixed overlay on mobile, sticky on desktop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="
              fixed top-0 left-0 h-full z-30
              w-64 lg:w-72
              bg-[#4B5563] border-r border-[#374151]
              overflow-y-auto
              lg:sticky lg:top-0 lg:h-screen lg:flex-shrink-0
            "
          >
            {isAdmin ? <AdminSidebar onClose={() => setSidebarOpen(false)} /> : <Sidebar onClose={() => setSidebarOpen(false)} />}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar onToggleSidebar={() => setSidebarOpen(o => !o)} sidebarOpen={sidebarOpen} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
