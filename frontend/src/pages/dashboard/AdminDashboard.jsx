// frontend/src/pages/dashboard/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';
import { useAppTranslation } from '../../hooks/useAppTranslation';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useAppTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getUserStats();
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Each stat gets a meaningful token instead of a random gradient.
  // Volunteers=gold / Seekers=sky-blue mirrors the Offer/Request (gold/navy) logic used elsewhere.
  const statCards = [
    { key: 'totalUsers', value: stats?.total_users || 0, icon: '👥', bg: colors.primaryLight, iconColor: colors.primary, path: '/admin/users/volunteers' },
    { key: 'volunteers', value: stats?.volunteers || 0, icon: '🙌', bg: colors.goldLight, iconColor: colors.gold, path: '/admin/users/volunteers' },
    { key: 'seekers', value: stats?.seekers || 0, icon: '🌟', bg: colors.cardAlt, iconColor: colors.secondary, path: '/admin/users/seekers' },
    { key: 'bothRoles', value: stats?.both || 0, icon: '🔄', bg: colors.oliveLight, iconColor: colors.olive, path: '/admin/users/both' },
    { key: 'managers', value: stats?.managers || 0, icon: '👔', bg: colors.warningBg, iconColor: colors.warning, path: '/admin/users/managers' },
    { key: 'admins', value: stats?.admins || 0, icon: '🛡️', bg: colors.primaryLight, iconColor: colors.header, path: '/admin/users/admins' },
    { key: 'inactive', value: stats?.inactive || 0, icon: '⏸️', bg: colors.badgeNeutral, iconColor: colors.muted, path: '/admin/users/inactive' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Welcome */}
        <div
          className="rounded-3xl shadow-lg p-8 mb-8 border"
          style={{ backgroundColor: colors.white, borderColor: colors.divider }}
        >
            <h1 className="text-3xl font-bold" style={{ color: colors.title }}>{t('dashboard.adminDashboard')}</h1>
          <p className="mt-2" style={{ color: colors.muted }}>
            {t('dashboard.adminOverview', { name: user?.first_name || t('shared.admin') })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map(stat => (
            <Link key={stat.key} to={stat.path}>
              <motion.div
                whileHover={{ y: -5 }}
                className="rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-all"
                style={{ backgroundColor: colors.white, borderColor: colors.divider }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ backgroundColor: stat.bg }}
                >
                  {stat.icon}
                </div>
                {loading ? (
                  <div className="h-8 rounded w-16 animate-pulse mb-1" style={{ backgroundColor: colors.divider }} />
                ) : (
                  <div className="text-3xl font-bold" style={{ color: colors.title }}>{stat.value}</div>
                )}
                <div className="text-sm mt-1" style={{ color: colors.muted }}>{t(`dashboard.${stat.key}`)}</div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/notifications">
            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-all"
              style={{ backgroundColor: colors.white, borderColor: colors.divider }}
            >
              <div className="text-3xl mb-3">📢</div>
              <h3 className="font-bold mb-2" style={{ color: colors.title }}>{t('dashboard.sendNotifications')}</h3>
              <p className="text-sm" style={{ color: colors.muted }}>{t('dashboard.sendBulkNotifications')}</p>
            </motion.div>
          </Link>
          <Link to="/admin/resources">
            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-all"
              style={{ backgroundColor: colors.white, borderColor: colors.divider }}
            >
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-bold mb-2" style={{ color: colors.title }}>{t('dashboard.manageResources')}</h3>
              <p className="text-sm" style={{ color: colors.muted }}>{t('dashboard.manageResourcesDescription')}</p>
            </motion.div>
          </Link>
          <Link to="/admin/posts">
            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-all"
              style={{ backgroundColor: colors.white, borderColor: colors.divider }}
            >
              <div className="text-3xl mb-3">📝</div>
              <h3 className="font-bold mb-2" style={{ color: colors.title }}>{t('dashboard.managePosts')}</h3>
              <p className="text-sm" style={{ color: colors.muted }}>{t('dashboard.managePostsDescription')}</p>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
