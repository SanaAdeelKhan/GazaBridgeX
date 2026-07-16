// frontend/src/pages/Matches.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchesAPI } from '../api/matches';
import Pagination from '../components/Pagination';
import colors from '../theme/colors';

const CATEGORY_LABELS = {
  learn_language: 'Learn a Language',
  learn_tech_ai: 'Learn Tech / AI',
  career_cv_help: 'Career / CV Help',
  mental_health_support: 'Mental Health Support',
  academic_tuition: 'Academic Tuition',
  creative_skill: 'Creative Skill',
  others: 'Others',
};

function scoreBadgeStyle(score) {
  if (score >= 80) return { backgroundColor: colors.goldLight, color: colors.goldHover };
  if (score >= 65) return { backgroundColor: colors.primaryLight, color: colors.primary };
  return { backgroundColor: colors.oliveLight, color: colors.oliveHover };
}

export default function Matches() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState('offerer'); // 'offerer' | 'seeker'
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rechecking, setRechecking] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });

  const fetchMatches = useCallback(async (page = 1, role = activeRole) => {
    setLoading(true);
    setError(null);
    try {
      const response = await matchesAPI.getMatches({ page, page_size: 12, role });
      const data = response.data;
      setMatches(data.results || data);
      setPagination({
        page: data.pagination?.page || page,
        totalPages: data.pagination?.total_pages || 1,
        totalCount: data.pagination?.count || (data.results || data).length,
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  }, [activeRole]);

  useEffect(() => {
    fetchMatches(1, activeRole);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRole]);

  const handleTabChange = (role) => {
    if (role !== activeRole) {
      setActiveRole(role);
    }
  };

  const handlePageChange = (newPage) => {
    if (!loading && newPage >= 1 && newPage <= pagination.totalPages) {
      fetchMatches(newPage, activeRole);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFindMatches = async () => {
    setRechecking(true);
    setError(null);
    try {
      await matchesAPI.recheckMatches();
      await fetchMatches(1, activeRole);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to check for matches');
    } finally {
      setRechecking(false);
    }
  };

  const handleMessage = (otherUser) => {
    const [first_name, ...rest] = (otherUser.name || '').split(' ');
    navigate('/chat', {
      state: {
        startChatWith: {
          id: otherUser.id,
          email: otherUser.email,
          first_name: first_name || '',
          last_name: rest.join(' ') || '',
        },
      },
    });
  };

  const youAreOfferer = activeRole === 'offerer';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: colors.headingDark }}>
            Your Matches
          </h1>
          <p className="mt-1" style={{ color: colors.muted }}>
            Volunteers and seekers paired by category and shared keywords
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleFindMatches}
          disabled={rechecking}
          className="px-5 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50"
          style={{ backgroundColor: colors.gold, color: colors.white }}
        >
          {rechecking ? 'Checking...' : 'Find Matches'}
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'offerer', label: '🙌 As Volunteer', description: 'Matches for your Offers' },
          { value: 'seeker', label: '🌟 As Seeker', description: 'Matches for your Requests' },
        ].map(tab => (
          <motion.button
            key={tab.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleTabChange(tab.value)}
            className="flex-1 p-4 rounded-2xl text-left transition-all"
            style={{
              backgroundColor: colors.white,
              border: `2px solid ${activeRole === tab.value
                ? (tab.value === 'offerer' ? colors.gold : colors.primary)
                : 'transparent'}`,
              boxShadow: activeRole === tab.value ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <div className="text-lg font-semibold" style={{ color: colors.title }}>{tab.label}</div>
            <div className="text-sm" style={{ color: colors.muted }}>{tab.description}</div>
          </motion.button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div
          className="mb-6 p-4 rounded-xl"
          style={{ backgroundColor: colors.errorBg, color: colors.error }}
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl animate-pulse"
              style={{ backgroundColor: colors.cardBorder }}
            />
          ))}
        </div>
      ) : matches.length === 0 ? (
        /* Empty state */
        <div
          className="text-center py-16 rounded-2xl"
          style={{ backgroundColor: colors.card, border: `1px solid ${colors.cardBorder}` }}
        >
          <p className="text-lg font-medium mb-2" style={{ color: colors.headingDark }}>
            No matches yet
          </p>
          <p style={{ color: colors.muted }}>
            {youAreOfferer
              ? 'Create an Offer, then click "Find Matches" to check for seekers.'
              : 'Create a Request, then click "Find Matches" to check for volunteers.'}
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {matches.map((m, index) => {
                const yours = youAreOfferer ? m.offer : m.request;
                const theirs = youAreOfferer ? m.request : m.offer;
                const theirName = youAreOfferer ? m.request.user_full_name : m.offer.user_full_name;
                const theirEmail = youAreOfferer ? m.request.user_email : m.offer.user_email;
                const theirUserId = youAreOfferer ? m.request.user : m.offer.user;
                const yourLabel = youAreOfferer ? 'Your Offer' : 'Your Request';
                const theirLabel = youAreOfferer ? 'Their Request' : 'Their Offer';

                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.3 }}
                    className="p-5 rounded-2xl flex items-center gap-4 flex-wrap"
                    style={{ backgroundColor: colors.card, border: `1px solid ${colors.cardBorder}` }}
                  >
                    <div className="flex-1 min-w-[200px]">
                      <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: colors.muted }}>
                        {yourLabel}
                      </div>
                      <div className="font-semibold" style={{ color: colors.title }}>
                        {youAreOfferer ? yours.offer_name : yours.request_name}
                      </div>
                      <div className="text-sm" style={{ color: colors.muted }}>
                        {CATEGORY_LABELS[yours.category] || yours.category}
                      </div>
                    </div>

                    <div
                      className="px-3 py-1 rounded-full text-sm font-bold flex-shrink-0"
                      style={scoreBadgeStyle(m.score)}
                    >
                      {m.score}% match
                    </div>

                    <div className="flex-1 min-w-[200px]">
                      <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: colors.muted }}>
                        {theirLabel} — {theirName}
                      </div>
                      <div className="font-semibold" style={{ color: colors.title }}>
                        {youAreOfferer ? theirs.request_name : theirs.offer_name}
                      </div>
                      <div className="text-sm" style={{ color: colors.muted }}>
                        {CATEGORY_LABELS[theirs.category] || theirs.category}
                      </div>
                    </div>

                    <button
                      onClick={() => handleMessage({ id: theirUserId, email: theirEmail, name: theirName })}
                      className="px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-shrink-0"
                      style={{ backgroundColor: colors.primaryLight, color: colors.primary }}
                    >
                      Message
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            disabled={loading}
          />

          <div className="text-center mt-4 text-sm" style={{ color: colors.muted }}>
            Showing {matches.length} of {pagination.totalCount} matches
          </div>
        </>
      )}
    </div>
  );
}
