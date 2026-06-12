// frontend/src/pages/dashboard/UserDashboard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { postsAPI } from '../../api/posts';
import { coursesAPI } from '../../api/courses';

export default function UserDashboard() {
  const { user } = useAuth();
  const { profile } = useUser();
  const [stats, setStats] = useState({ offers: 0, requests: 0, courses: 0, liveSections: 0 });
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
        setStats({ offers: offers.length, requests: requests.length, courses: courses.length, liveSections: 0 });
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
    if (user?.id) fetchDashboardData();
  }, [user?.id]);

  const getInitials = () => {
    const first = profile?.first_name?.[0] || user?.first_name?.[0] || '';
    const last = profile?.last_name?.[0] || user?.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  const statCards = [
    { label: 'Offers', value: stats.offers, icon: '🙌', path: '/posts' },
    { label: 'Requests', value: stats.requests, icon: '🌟', path: '/posts' },
    { label: 'Courses', value: stats.courses, icon: '📚', path: '/courses' },
    { label: 'Live Sections', value: stats.liveSections, icon: '📡', path: '/live-sections' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        {/* Welcome */}
        <div className="bg-[#d8e4f0] border border-[#a8c4dc] rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1e3a5f, #2d5a8e)' }}>
              {getInitials()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1e3a5f]">
                Welcome back, {profile?.first_name || user?.first_name || 'User'}!
              </h1>
              <p className="text-[#5a6600] mt-1">{user?.email}</p>
              <div className="flex gap-2 mt-3">
                {user?.roles?.map(role => (
                  <span key={role.id || role}
                    className="px-3 py-1 bg-gradient-to-r from-[#C26100] to-[#E07A1B] text-white rounded-full text-xs font-semibold capitalize">
                    {typeof role === 'string' ? role : role.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, i) => (
            <Link key={stat.label} to={stat.path}>
              <motion.div whileHover={{ y: -5 }}
                className="bg-[#d8e4f0] border border-[#a8c4dc] rounded-2xl shadow-md p-6 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] rounded-xl flex items-center justify-center text-2xl mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-[#1e3a5f]">{stat.value}</div>
                <div className="text-[#5a6600] text-sm mt-1">{stat.label}</div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Recent Posts */}
        <div className="bg-[#d8e4f0] border border-[#a8c4dc] rounded-3xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1e3a5f]">Recent Posts</h2>
            <Link to="/posts" className="text-[#C26100] hover:text-[#E07A1B] font-semibold text-sm transition-colors">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 bg-[#c4d8ec] rounded-xl animate-pulse">
                  <div className="h-4 bg-[#a8c4dc] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#a8c4dc] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : recentPosts.length === 0 ? (
            <div className="text-center py-8 text-[#5a6600]">
              <div className="text-4xl mb-4">📝</div>
              <p>No posts yet. Create your first offer or request!</p>
              <Link to="/posts" className="text-[#C26100] font-semibold mt-2 inline-block">Create Post →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPosts.map(post => (
                <Link key={post.id} to={post.postType === 'offer' ? `/offers/${post.id}` : `/posts`}
                  className="flex items-start gap-4 p-4 bg-[#c4d8ec] rounded-xl hover:bg-[#b8cee0] transition-colors">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold mt-1 flex-shrink-0 ${
                    post.postType === 'offer'
                      ? 'bg-[#F2DDD8] text-[#C26100] border border-[#e8b4b0]'
                      : 'bg-[#1e3a5f] text-white'
                  }`}>
                    {post.postType === 'offer' ? 'Offer' : 'Request'}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1e3a5f]">
                      {post.postType === 'offer' ? post.offer_name : post.request_name}
                    </h3>
                    <p className="text-sm text-[#5a6600] mt-1 line-clamp-2">{post.description}</p>
                    <p className="text-xs text-[#5a6600]/70 mt-2">
                      {new Date(post.created_at).toLocaleDateString()} · {post.status}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
