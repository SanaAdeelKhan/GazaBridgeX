// frontend/src/pages/UserPublicProfile.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usersAPI } from '../api/users';
import { postsAPI } from '../api/posts';
import { tw, colors } from '../theme/colors';

const CATEGORY_ICONS = {
  learn_language: '🗣️', learn_tech_ai: '🤖', career_cv_help: '💼',
  mental_health_support: '🧠', academic_tuition: '📖', creative_skill: '🎨', others: '📌',
};
const CATEGORY_LABELS = {
  learn_language: 'Learn a Language', learn_tech_ai: 'Learn Tech / AI',
  career_cv_help: 'Career / CV Help', mental_health_support: 'Mental Health Support',
  academic_tuition: 'Academic Tuition', creative_skill: 'Creative Skill', others: 'Others',
};
const AVAILABILITY_LABELS = {
  '1_2_hours': '1-2 hrs/wk', '3_5_hours': '3-5 hrs/wk', '6_8_hours': '6-8 hrs/wk',
  '8_10_hours': '8-10 hrs/wk', '10_plus_hours': '10+ hrs/wk',
};
const STATUS_COLORS = {
  active: 'bg-[${colors.accentEnd}] text-white',
  inactive: 'bg-gray-200 text-gray-600',
  closed: 'bg-red-100 text-red-700',
};

function PostMiniCard({ post, type }) {
  const [expanded, setExpanded] = useState(false);
  const name = type === 'offer' ? post.offer_name : post.request_name;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl mb-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: colors.card, border: `1px solid ${colors.cardBorder}` }}
      style={{ backgroundColor: colors.card }}
    >
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#ccd8e8] transition-colors"
        onClick={() => setExpanded(e => !e)}>
        <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }} className="text-gray-400 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
        <span className="text-lg flex-shrink-0">{CATEGORY_ICONS[post.category] || '📌'}</span>
        <span className="flex-1 font-semibold text-sm truncate" style={{ color: colors.title }}>{name}</span>
        <span className="hidden md:block text-xs px-2 py-1 rounded-lg bg-white/60 font-medium" style={{ color: colors.body }}>
          {CATEGORY_LABELS[post.category] || post.category}
        </span>
        {type === 'offer' && post.availability && (
          <span className="hidden lg:block text-xs" style={{ color: colors.body }}>
            ⏱ {AVAILABILITY_LABELS[post.availability]}
          </span>
        )}
        <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[post.status] || STATUS_COLORS.inactive}`}>
          {post.status}
        </span>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-5 py-3 border-t bg-white/40" style={{ borderColor: colors.cardBorder }}>
              <p className="text-sm leading-relaxed" style={{ color: colors.body }}>
                {post.description || 'No description provided.'}
              </p>
              <div className="flex flex-wrap gap-2 mt-2 text-xs">
                <span className="px-2 py-1 rounded-lg bg-white/70 font-medium" style={{ color: colors.body }}>
                  {CATEGORY_ICONS[post.category]} {CATEGORY_LABELS[post.category] || post.category}
                </span>
                {type === 'offer' && post.availability && (
                  <span className="px-2 py-1 rounded-lg bg-white/70 font-medium" style={{ color: colors.body }}>
                    ⏱ {AVAILABILITY_LABELS[post.availability]}
                  </span>
                )}
                <span className="px-2 py-1 rounded-lg bg-white/70 font-medium" style={{ color: colors.body }}>
                  📅 {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function UserPublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [offers, setOffers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('offers');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [userRes, offersRes, requestsRes] = await Promise.all([
          usersAPI.getUserById(id),
          postsAPI.getOffers({ user_id: id, page_size: 100 }),
          postsAPI.getRequests({ user_id: id, page_size: 100 }),
        ]);
        setProfile(userRes.data);
        setOffers(offersRes.data.results || offersRes.data);
        setRequests(requestsRes.data.results || requestsRes.data);
      } catch (err) {
        setError('Could not load this user\'s profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const initials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}` || 'U';

  if (loading) return (
    <div className={`pt-24 min-h-screen ${tw.pageBg} flex items-center justify-center`}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[${colors.accentStart}] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p style={{ color: colors.body }}>Loading profile...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className={`pt-24 min-h-screen ${tw.pageBg} flex items-center justify-center`}>
      <div className="text-center">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-lg font-semibold mb-4" style={{ color: colors.title }}>{error}</p>
        <button onClick={() => navigate(-1)} className={`px-5 py-2.5 rounded-xl font-medium ${tw.accentBtn}`}>Go Back</button>
      </div>
    </div>
  );

  return (
    <div className={`pt-24 min-h-screen ${tw.pageBg}`}>
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-sm font-medium hover:opacity-70 transition-opacity"
          style={{ color: colors.bannerStart }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden shadow-lg mb-8" style={{ border: `1px solid ${colors.cardBorder}` }}>
          {/* Banner */}
          <div className="h-32 w-full" style={{ background: `linear-gradient(to right, ${colors.bannerStart}, ${colors.bannerEnd})` }} />
          {/* Info */}
          <div className="px-6 pb-6 relative" style={{ backgroundColor: colors.white }}>
            <div className="flex items-end gap-4 -mt-10 mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0"
                style={{ background: `linear-gradient(to bottom right, ${colors.accentStart}, ${colors.accentEnd})` }}>
                {initials}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-bold" style={{ color: colors.title }}>{`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Unknown User'}</h1>
                <p className="text-sm" style={{ color: colors.body }}>{profile?.email || ''}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile?.roles?.map(r => (
                <span key={r.name} className="px-3 py-1 rounded-full text-xs font-semibold bg-[${colors.accentEnd}] text-white capitalize">{r.name}</span>
              ))}
              {profile?.bio && <p className="w-full text-sm mt-2" style={{ color: colors.body }}>{profile.bio}</p>}
            </div>
            {/* Stats */}
            <div className="flex gap-6 mt-4 pt-4 border-t" style={{ borderColor: colors.cardBorder }}>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: colors.accentStart }}>{offers.length}</p>
                <p className="text-xs" style={{ color: colors.body }}>Offers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: colors.bannerStart }}>{requests.length}</p>
                <p className="text-xs" style={{ color: colors.body }}>Requests</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { value: 'offers', label: `🙌 Offers (${offers.length})` },
            { value: 'requests', label: `🌟 Requests (${requests.length})` },
          ].map(tab => (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === tab.value ? tw.tabActive + ' shadow-md' : tw.tabInactive}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Posts list */}
        {activeTab === 'offers' && (
          offers.length === 0
            ? <div className="text-center py-12 text-4xl">🙌<p className="text-sm mt-2" style={{ color: colors.body }}>No offers yet</p></div>
            : offers.map(post => <PostMiniCard key={post.id} post={post} type="offer" />)
        )}
        {activeTab === 'requests' && (
          requests.length === 0
            ? <div className="text-center py-12 text-4xl">🌟<p className="text-sm mt-2" style={{ color: colors.body }}>No requests yet</p></div>
            : requests.map(post => <PostMiniCard key={post.id} post={post} type="request" />)
        )}

      </div>
    </div>
  );
}
