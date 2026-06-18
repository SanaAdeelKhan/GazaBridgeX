// frontend/src/pages/UserPublicProfile.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usersAPI } from '../api/users';
import { postsAPI } from '../api/posts';

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

const STATUS_STYLES = {
  active:   { backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' },
  inactive: { backgroundColor: '#f3f4f6', color: '#6b7280', border: '1px solid #d1d5db' },
  closed:   { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' },
};

function PostMiniCard({ post, type }) {
  const [expanded, setExpanded] = useState(false);
  const name = type === 'offer' ? post.offer_name : post.request_name;
  const statusStyle = STATUS_STYLES[post.status] || STATUS_STYLES.inactive;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl mb-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      style={{ backgroundColor: '#d8e4f0', border: '1px solid #a8c4dc' }}>
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#ccd8e8] transition-colors"
        onClick={() => setExpanded(e => !e)}>
        <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0" style={{ color: '#5a6600' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
        <span className="text-lg flex-shrink-0">{CATEGORY_ICONS[post.category] || '📌'}</span>
        <span className="flex-1 font-semibold text-sm truncate" style={{ color: '#1e3a5f' }}>{name}</span>
        <span className="hidden md:block text-xs px-2 py-1 rounded-lg font-medium" style={{ backgroundColor: '#eaf1f8', color: '#5a6600' }}>
          {CATEGORY_LABELS[post.category] || post.category}
        </span>
        {type === 'offer' && post.availability && (
          <span className="hidden lg:block text-xs" style={{ color: '#5a6600' }}>
            ⏱ {AVAILABILITY_LABELS[post.availability]}
          </span>
        )}
        <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold" style={statusStyle}>
          {post.status}
        </span>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-5 py-3 border-t" style={{ borderColor: '#a8c4dc', backgroundColor: '#eaf1f8' }}>
              <p className="text-sm leading-relaxed" style={{ color: '#5a6600' }}>
                {post.description || 'No description provided.'}
              </p>
              <div className="flex flex-wrap gap-2 mt-2 text-xs">
                <span className="px-2 py-1 rounded-lg font-medium" style={{ backgroundColor: '#d8e4f0', color: '#5a6600' }}>
                  {CATEGORY_ICONS[post.category]} {CATEGORY_LABELS[post.category] || post.category}
                </span>
                {type === 'offer' && post.availability && (
                  <span className="px-2 py-1 rounded-lg font-medium" style={{ backgroundColor: '#d8e4f0', color: '#5a6600' }}>
                    ⏱ {AVAILABILITY_LABELS[post.availability]}
                  </span>
                )}
                <span className="px-2 py-1 rounded-lg font-medium" style={{ backgroundColor: '#d8e4f0', color: '#5a6600' }}>
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
      setLoading(true); setError(null);
      try {
        const [userRes, offersRes, requestsRes] = await Promise.all([
          usersAPI.getUserById(id),
          postsAPI.getOffers({ user_id: id, page_size: 100 }),
          postsAPI.getRequests({ user_id: id, page_size: 100 }),
        ]);
        setProfile(userRes.data);
        setOffers(offersRes.data.results || offersRes.data);
        setRequests(requestsRes.data.results || requestsRes.data);
      } catch {
        setError("Could not load this user's profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleMessage = () => {
    navigate('/chat', {
      state: {
        openDM: {
          type: 'dm',
          id: null,
          otherUser: {
            id: profile?.id,
            first_name: profile?.first_name,
            last_name: profile?.last_name,
            email: profile?.email,
          }
        }
      }
    });
  };

  const initials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}` || 'U';

  if (loading) return (
    <div className="pt-24 min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F2DDD8' }}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3"
          style={{ borderColor: '#C26100', borderTopColor: 'transparent' }} />
        <p style={{ color: '#5a6600' }}>Loading profile...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="pt-24 min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F2DDD8' }}>
      <div className="text-center">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-lg font-semibold mb-4" style={{ color: '#3d4a00' }}>{error}</p>
        <button onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-xl font-medium text-white"
          style={{ background: 'linear-gradient(to right, #C26100, #E07A1B)' }}>Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="pt-24 min-h-screen" style={{ backgroundColor: '#F2DDD8' }}>
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-sm font-medium hover:opacity-70 transition-opacity"
          style={{ color: '#1e3a5f' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden shadow-lg mb-8"
          style={{ border: '1px solid #a8c4dc' }}>

          {/* Banner */}
          <div className="h-32 w-full" style={{ background: 'linear-gradient(to right, #1e3a5f, #2d5a8e)' }} />

          {/* Info */}
          <div className="px-6 pb-6 relative" style={{ backgroundColor: '#d8e4f0' }}>
            <div className="flex items-end gap-4 -mt-10 mb-4">
              <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #C26100, #E07A1B)', borderColor: '#d8e4f0' }}>
                {initials}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-bold" style={{ color: '#1e3a5f' }}>
                  {`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Unknown User'}
                </h1>
                <p className="text-sm" style={{ color: '#5a6600' }}>{profile?.email || ''}</p>
              </div>
            </div>

            {/* Roles */}
            <div className="flex flex-wrap gap-2 mb-4">
              {profile?.roles?.map(r => (
                <span key={r.name} className="px-3 py-1 rounded-full text-xs font-semibold text-white capitalize"
                  style={{ background: 'linear-gradient(to right, #C26100, #E07A1B)' }}>{r.name}</span>
              ))}
              {profile?.bio && <p className="w-full text-sm mt-2" style={{ color: '#5a6600' }}>{profile.bio}</p>}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-4">
              {/* Message */}
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleMessage}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md transition-all"
                style={{ background: 'linear-gradient(to right, #C26100, #E07A1B)' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Message
              </motion.button>

              {/* LinkedIn */}
              {profile?.linkedin && (
                <motion.a whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  href={profile.linkedin} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md transition-all"
                  style={{ backgroundColor: '#0077b5' }}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </motion.a>
              )}

              {/* WhatsApp */}
              {profile?.whatsapp_number && (
                <motion.a whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  href={`https://wa.me/${profile.whatsapp_number.replace(/[^0-9]/g, '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md transition-all"
                  style={{ backgroundColor: '#25d366' }}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </motion.a>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6 pt-4 border-t" style={{ borderColor: '#a8c4dc' }}>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: '#C26100' }}>{offers.length}</p>
                <p className="text-xs" style={{ color: '#5a6600' }}>Offers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: '#1e3a5f' }}>{requests.length}</p>
                <p className="text-xs" style={{ color: '#5a6600' }}>Requests</p>
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
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all"
              style={activeTab === tab.value
                ? { background: 'linear-gradient(to right, #1e3a5f, #2d5a8e)', color: '#ffffff' }
                : { backgroundColor: '#d8e4f0', color: '#5a6600', border: '1px solid #a8c4dc' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {activeTab === 'offers' && (
          offers.length === 0
            ? <div className="text-center py-12"><div className="text-4xl mb-2">🙌</div><p className="text-sm" style={{ color: '#5a6600' }}>No offers yet</p></div>
            : offers.map(post => <PostMiniCard key={post.id} post={post} type="offer" />)
        )}
        {activeTab === 'requests' && (
          requests.length === 0
            ? <div className="text-center py-12"><div className="text-4xl mb-2">🌟</div><p className="text-sm" style={{ color: '#5a6600' }}>No requests yet</p></div>
            : requests.map(post => <PostMiniCard key={post.id} post={post} type="request" />)
        )}
      </div>
    </div>
  );
}
