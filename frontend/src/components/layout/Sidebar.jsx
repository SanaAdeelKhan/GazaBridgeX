import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const useNavItems = () => {
  const { t } = useTranslation();
  return [
  { label: t('nav.dashboard'),     path: '/dashboard',     icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { label: t('nav.posts'),         path: '/posts',         icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg> },
  { label: t('nav.courses'),       path: '/courses',       icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
  { label: t('nav.liveSections'), path: '/live-sections', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> },
  { label: t('nav.resources'),     path: '/resources',     icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg> },
  { label: t('nav.chat'),          path: '/chat',          icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
  { label: t('nav.notifications'), path: '/notifications', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
  { label: t('nav.profile'),       path: '/profile',       icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
  ];
};

export default function Sidebar({ onClose }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navItems = useNavItems();

  return (
    <div className="py-6 flex flex-col h-full">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="flex flex-col items-center w-full gap-2">
          <div className="w-36 h-36 rounded-full bg-[#F2DDD8] flex items-center justify-center shadow-md flex-shrink-0">
            <img src="/gb-logo.png" alt="GazaBridge" className="w-32 h-32 object-contain rounded-full" />
          </div>
          <span className="font-bold text-lg text-white">GazaBridge</span>
        </div>
      </div>

      <div className="px-6 mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#CBD5E1]">{t('nav.dashboard') && 'Main Menu'}</h2>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => { if (onClose && window.innerWidth < 1024) onClose(); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group"
              style={isActive
                ? { background: 'linear-gradient(135deg, #ffffff20, #ec489930)', color: '#ffffff' }
                : { color: '#D1D5DB' }
              }
            >
              {isActive && (
                <motion.div
                  layoutId="activeSidebar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                  style={{ background: 'linear-gradient(to bottom, #FFD166, #C26100)' }}
                />
              )}
              <span className="flex-shrink-0" style={isActive ? { color: '#E07A1B' } : {}}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {!isActive && (
                <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-white/10" />
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
