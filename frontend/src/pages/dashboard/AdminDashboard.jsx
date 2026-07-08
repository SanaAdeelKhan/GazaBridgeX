// frontend/src/pages/dashboard/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

export default function AdminDashboard() {
  const { user } = useAuth();
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
    { label: 'Total Users', value: stats?.total_users || 0, icon: '👥', bg: colors.primaryLight, iconColor: colors.primary, path: '/admin/users/volunteers' },
    { label: 'Volunteers', value: stats?.volunteers || 0, icon: '🙌', bg: colors.goldLight, iconColor: colors.gold, path: '/admin/users/volunteers' },
    { label: 'Seekers', value: stats?.seekers || 0, icon: '🌟', bg: colors.cardAlt, iconColor: colors.secondary, path: '/admin/users/seekers' },
    { label: 'Both Roles', value: stats?.both || 0, icon: '🔄', bg: colors.oliveLight, iconColor: colors.olive, path: '/admin/users/both' },
    { label: 'Managers', value: stats?.managers || 0, icon: '👔', bg: colors.warningBg, iconColor: colors.warning, path: '/admin/users/managers' },
    { label: 'Admins', value: stats?.admins || 0, icon: '🛡️', bg: colors.primaryLight, iconColor: colors.header, path: '/admin/users/admins' },
    { label: 'Inactive', value: stats?.inactive || 0, icon: '⏸️', bg: colors.badgeNeutral, iconColor: colors.muted, path: '/admin/users/inactive' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Welcome */}
        <div
          className="rounded-3xl shadow-lg p-8 mb-8 border"
          style={{ backgroundColor: colors.white, borderColor: colors.divider }}
        >
          <h1 className="text-3xl font-bold" style={{ color: colors.title }}>Admin Dashboard</h1>
          <p className="mt-2" style={{ color: colors.muted }}>
            Welcome back, {user?.first_name || 'Admin'}! Here's an overview of the platform.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map(stat => (
            <Link key={stat.label} to={stat.path}>
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
                <div className="text-sm mt-1" style={{ color: colors.muted }}>{stat.label}</div>
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
              <h3 className="font-bold mb-2" style={{ color: colors.title }}>Send Notifications</h3>
              <p className="text-sm" style={{ color: colors.muted }}>Send bulk notifications to user groups</p>
            </motion.div>
          </Link>
          <Link to="/admin/resources">
            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-all"
              style={{ backgroundColor: colors.white, borderColor: colors.divider }}
            >
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-bold mb-2" style={{ color: colors.title }}>Manage Resources</h3>
              <p className="text-sm" style={{ color: colors.muted }}>Create and manage learning resources</p>
            </motion.div>
          </Link>
          <Link to="/admin/posts">
            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-all"
              style={{ backgroundColor: colors.white, borderColor: colors.divider }}
            >
              <div className="text-3xl mb-3">📝</div>
              <h3 className="font-bold mb-2" style={{ color: colors.title }}>Manage Posts</h3>
              <p className="text-sm" style={{ color: colors.muted }}>Review and manage community posts</p>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
