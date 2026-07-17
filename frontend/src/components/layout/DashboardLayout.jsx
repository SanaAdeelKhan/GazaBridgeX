// frontend/src/components/layout/DashboardLayout.jsx
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import AdminSidebar from './AdminSidebar';
import HeaderBar from './HeaderBar';
import ProfileFieldsPrompt from '../ProfileFieldsPrompt';
import colors from '../../theme/colors';

export default function DashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const adminRoles = ['manager', 'admin', 'superuser'];
  const isAdmin = user?.roles?.some(r => adminRoles.includes(r)) ||
                  user?.is_staff ||
                  user?.is_superuser;

  const isChatPage = location.pathname === '/chat';

  if (isChatPage) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.pageBg }}>
        <HeaderBar />
        <Outlet />
        <ProfileFieldsPrompt />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: colors.pageBg }}>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-64 lg:w-72 flex-shrink-0 h-screen sticky top-0 overflow-y-auto z-30"
            style={{ backgroundColor: colors.sidebar, borderRight: `1px solid ${colors.sidebarBorder}` }}
          >
            {isAdmin ? <AdminSidebar /> : <Sidebar />}
          </motion.aside>
        )}
      </AnimatePresence>
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <ProfileFieldsPrompt />
    </div>
  );
}
