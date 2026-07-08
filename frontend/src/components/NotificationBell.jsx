// frontend/src/components/NotificationBell.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import colors from '../theme/colors';

export default function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate when count changes
  useState(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [unreadCount]);

  return (
    <Link to="/notifications" className="relative">
      <motion.div
        animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
        className="relative p-2 rounded-lg transition-colors"
        style={{ color: colors.navText }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.10)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: colors.error, color: colors.white }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}
