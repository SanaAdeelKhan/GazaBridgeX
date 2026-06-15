import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import LanguageToggle from '../LanguageToggle';
import { useNotifications } from '../../context/NotificationContext';

export default function HeaderBar({ onToggleSidebar, sidebarOpen, isChatPage }) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => { await logout(); navigate('/'); };

  const getInitials = () => {
    const first = user?.first_name?.[0] || '';
    const last = user?.last_name?.[0] || '';
    return (first + last).toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getDisplayName = () => `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || 'User';

  const adminRoles = ['manager', 'admin', 'superuser'];
  const isAdmin = user?.roles?.some(r => adminRoles.includes(r)) || user?.is_staff || user?.is_superuser;

  return (
    <header className="bg-[#4B5563] border-b border-[#374151] sticky top-0 z-20"
      style={{ boxShadow: '0 1px 8px rgba(30,58,95,0.07)' }}>
      <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3">

        <div className="flex items-center gap-2 sm:gap-4">
          {onToggleSidebar && (
            isChatPage ? (
              /* Back arrow + logo on chat page */
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleSidebar}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                  aria-label="Go back"
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {/* Logo badge */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#F2DDD8' }}>
                  <img src="/gb-logo.png" alt="GazaBridgeX" className="w-5 h-5 object-contain" />
                </div>
                <span className="text-white font-semibold text-sm hidden sm:block">GazaBridgeX</span>
              </div>
            ) : (
              /* Hamburger / X on all other pages */
              <button
                onClick={onToggleSidebar}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                aria-label="Toggle sidebar"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {sidebarOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  }
                </svg>
              </button>
            )
          )}
          <Link to={isAdmin ? '/admin' : '/dashboard'} />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageToggle />

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/notifications')}
            className="relative p-2 hover:bg-white/10 rounded-xl transition-colors">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center bg-[#EC4899]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </motion.button>

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/chat')}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </motion.button>

          <div className="relative" ref={profileRef}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 hover:bg-white/10 rounded-xl transition-colors">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #C26100, #E07A1B)' }}>
                {getInitials()}
              </div>
              <span className="text-sm font-medium hidden md:block text-white">{getDisplayName()}</span>
              <svg className="w-4 h-4 text-gray-300 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-52 sm:w-56 bg-[#fdf8f5] rounded-2xl shadow-xl border border-[#e8b4b0] py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-sm text-[#1e3a5f] truncate">{getDisplayName()}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    {user?.roles?.map((role, i) => (
                      <span key={i} className="inline-block px-2 py-0.5 rounded-full text-xs mt-1 mr-1 capitalize text-white bg-[#EC4899]">
                        {role}
                      </span>
                    ))}
                  </div>
                  <Link to="/profile" onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <button onClick={() => { setShowProfileMenu(false); handleLogout(); }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
