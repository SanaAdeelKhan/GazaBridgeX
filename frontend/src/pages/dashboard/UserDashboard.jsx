// frontend/src/pages/dashboard/UserDashboard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { postsAPI } from '../../api/posts';
import { coursesAPI } from '../../api/courses';
import colors from '../../theme/colors';
import { useAppTranslation } from '../../hooks/useAppTranslation';

export default function UserDashboard() {
  const { user } = useAuth();
  const { profile } = useUser();
  const { t } = useAppTranslation();
  const [stats, setStats] = useState({
    offers: 0,
    requests: 0,
    courses: 0,
    liveSections: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [offersRes, requestsRes, coursesRes] = await Promise.all([
          postsAPI.getOffers({ user_id: user?.id, page_size: 100 }),
          postsAPI.getRequests({ user_id: user?.id, page_size: 100 }),
          coursesAPI.getCourses({ user_id: user?.id, page_size: 100 }),
        ]);

        const offers = offersRes.data.results || offersRes.data || [];
        const requests = requestsRes.data.results || requestsRes.data || [];
        const courses = coursesRes.data.results || coursesRes.data || [];

        setStats({
          offers: offers.length,
          requests: requests.length,
          courses: courses.length,
          liveSections: 0,
        });

        // Combine and sort recent posts
        const allPosts = [
          ...offers.map(o => ({ ...o, postType: 'offer' })),
          ...requests.map(r => ({ ...r, postType: 'request' })),
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

        setRecentPosts(allPosts);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const getInitials = () => {
    const first = profile?.first_name?.[0] || user?.first_name?.[0] || '';
    const last = profile?.last_name?.[0] || user?.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  // Stat card config — each stat gets its own token-driven color instead of random gradients
  const statCards = [
    { key: 'offers', value: stats.offers, icon: '🙌', bg: colors.goldLight, iconColor: colors.gold, path: '/posts' },
    { key: 'requests', value: stats.requests, icon: '🌟', bg: colors.primaryLight, iconColor: colors.primary, path: '/posts' },
    { key: 'courses', value: stats.courses, icon: '📚', bg: colors.oliveLight, iconColor: colors.olive, path: '/courses' },
    { key: 'liveSections', value: stats.liveSections, icon: '📡', bg: colors.cardAlt, iconColor: colors.secondary, path: '/live-sections' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Welcome Section */}
        <div
          className="rounded-3xl shadow-lg p-8 mb-8 border"
          style={{ backgroundColor: colors.white, borderColor: colors.divider }}
        >
          <div className="flex items-center gap-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg"
              style={{ backgroundColor: colors.primary }}
            >
              {getInitials()}
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: colors.title }}>
                {t('dashboard.welcomeBack', { name: profile?.first_name || user?.first_name || t('shared.user') })}
              </h1>
              <p className="mt-1" style={{ color: colors.muted }}>{user?.email}</p>
              <div className="flex gap-2 mt-3">
                {user?.roles?.map(role => (
                  <span
                    key={role.id || role}
                    className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
                    style={{ backgroundColor: colors.goldLight, color: colors.goldHover }}
                  >
                    {typeof role === 'string' ? role : role.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <div className="text-3xl font-bold" style={{ color: colors.title }}>{stat.value}</div>
                <div className="text-sm mt-1" style={{ color: colors.muted }}>{t(`dashboard.${stat.key}`)}</div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Recent Posts */}
        <div
          className="rounded-3xl shadow-lg p-8 border"
          style={{ backgroundColor: colors.white, borderColor: colors.divider }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ color: colors.title }}>{t('dashboard.recentPosts')}</h2>
            <Link
              to="/posts"
              className="font-semibold text-sm transition-colors"
              style={{ color: colors.gold }}
              onMouseEnter={e => e.currentTarget.style.color = colors.goldHover}
              onMouseLeave={e => e.currentTarget.style.color = colors.gold}
            >
              {t('dashboard.viewAll')}
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl animate-pulse"
                  style={{ backgroundColor: colors.pageBg }}
                >
                  <div className="h-4 rounded w-3/4 mb-2" style={{ backgroundColor: colors.divider }} />
                  <div className="h-3 rounded w-1/2" style={{ backgroundColor: colors.divider }} />
                </div>
              ))}
            </div>
          ) : recentPosts.length === 0 ? (
            <div className="text-center py-8" style={{ color: colors.muted }}>
              <div className="text-4xl mb-4">📝</div>
              <p>{t('dashboard.noPosts')}</p>
              <Link to="/posts" className="font-semibold mt-2 inline-block" style={{ color: colors.gold }}>
                {t('dashboard.createPost')}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPosts.map(post => {
                const isOffer = post.postType === 'offer';
                return (
                  <Link
                    key={post.id}
                    to={isOffer ? `/offers/${post.id}` : `/posts`}
                    className="flex items-start gap-4 p-4 rounded-xl transition-colors"
                    style={{ backgroundColor: colors.pageBg }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.goldLight}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = colors.pageBg}
                  >
                    <span
                      className="px-2 py-1 rounded-full text-xs font-semibold mt-1"
                      style={
                        isOffer
                          ? { backgroundColor: colors.goldLight, color: colors.goldHover }
                          : { backgroundColor: colors.primaryLight, color: colors.primary }
                      }
                    >
                      {isOffer ? t('dashboard.offer') : t('dashboard.request')}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: colors.body }}>
                        {isOffer ? post.offer_name : post.request_name}
                      </h3>
                      <p className="text-sm mt-1 line-clamp-2" style={{ color: colors.muted }}>
                        {post.description}
                      </p>
                      <p className="text-xs mt-2" style={{ color: colors.muted }}>
                        {new Date(post.created_at).toLocaleDateString()} • {post.status}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
