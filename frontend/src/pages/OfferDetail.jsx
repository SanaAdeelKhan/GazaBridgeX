// frontend/src/pages/OfferDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../api/posts';
import LinkCourseModal from '../components/LinkCourseModal';
import LinkLiveSectionModal from '../components/LinkLiveSectionModal';
import EditPostModal from '../components/EditPostModal';
import colors from '../theme/colors';

const CATEGORY_ICONS = {
  learn_language: '🗣️',
  learn_tech_ai: '🤖',
  career_cv_help: '💼',
  mental_health_support: '🧠',
  academic_tuition: '📖',
  creative_skill: '🎨',
  others: '📌',
};

const CATEGORY_LABELS = {
  learn_language: 'Learn a Language',
  learn_tech_ai: 'Learn Tech / AI',
  career_cv_help: 'Career / CV Help',
  mental_health_support: 'Mental Health Support',
  academic_tuition: 'Academic Tuition',
  creative_skill: 'Creative Skill',
  others: 'Others',
};

const AVAILABILITY_LABELS = {
  '1_2_hours': '1-2 hours/week',
  '3_5_hours': '3-5 hours/week',
  '6_8_hours': '6-8 hours/week',
  '8_10_hours': '8-10 hours/week',
  '10_plus_hours': '10+ hours/week',
};

export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offer, setOffer] = useState(null);
  const [linkedCourses, setLinkedCourses] = useState([]);
  const [linkedLiveSections, setLinkedLiveSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showLinkLiveSectionModal, setShowLinkLiveSectionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchOffer = async () => {
    try {
      const response = await postsAPI.getOffer(id);
      setOffer(response.data);

      // Fetch linked courses and live sections
      const [coursesRes, liveSectionsRes] = await Promise.all([
        postsAPI.getOfferLinkedCourses(id).catch(() => ({ data: [] })),
        postsAPI.getOfferLinkedLiveSections(id).catch(() => ({ data: [] })),
      ]);

      setLinkedCourses(coursesRes.data || []);
      setLinkedLiveSections(liveSectionsRes.data || []);
    } catch (err) {
      setError('Failed to load offer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffer();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;

    try {
      await postsAPI.deleteOffer(id);
      navigate('/posts');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete offer');
    }
  };

  const canEdit = offer && (offer.user === user?.id || user?.is_staff || user?.is_superuser);
  const canDelete = offer && (offer.user === user?.id || user?.is_staff || user?.is_superuser || user?.roles?.some(r => r.name === 'manager'));
  const canLink = offer && (offer.user === user?.id || user?.is_staff || user?.is_superuser);

  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-t-transparent rounded-full" style={{ borderColor: colors.gold, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: colors.headingDark }}>Offer not found</h2>
          <Link to="/posts" className="font-semibold" style={{ color: colors.gold }}>← Back to Posts</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen" style={{ backgroundColor: colors.primaryLight }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/posts" className="inline-flex items-center gap-2 font-semibold mb-6" style={{ color: colors.gold }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Posts
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Offer Details */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold border"
                    style={{ backgroundColor: colors.goldLight, color: colors.headingDark, borderColor: colors.gold }}
                  >
                    🙌 Offer
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold border"
                    style={
                      offer.status === 'active'
                        ? { backgroundColor: colors.oliveLight, color: colors.headingDark, borderColor: colors.olive }
                        : offer.status === 'inactive'
                        ? { backgroundColor: '#F3F4F6', color: colors.muted, borderColor: '#D1D5DB' }
                        : { backgroundColor: colors.errorBg, color: colors.error, borderColor: colors.error }
                    }
                  >
                    {offer.status}
                  </span>
                </div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: colors.headingDark }}>{offer.offer_name}</h1>
                <div className="flex items-center gap-2 mb-4" style={{ color: colors.muted }}>
                  <span className="text-2xl">{CATEGORY_ICONS[offer.category]}</span>
                  <span>{CATEGORY_LABELS[offer.category] || offer.category}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {canEdit && (
                  <button onClick={() => setShowEditModal(true)}
                    className="px-4 py-2 rounded-xl font-semibold text-sm border transition-colors"
                    style={{ backgroundColor: colors.goldLight, color: colors.headingDark, borderColor: colors.gold }}>
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button onClick={handleDelete}
                    className="px-4 py-2 rounded-xl font-semibold text-sm border transition-colors"
                    style={{ backgroundColor: colors.errorBg, color: colors.error, borderColor: colors.error }}>
                    Delete
                  </button>
                )}
              </div>
            </div>

            <p className="mb-6 leading-relaxed" style={{ color: colors.body }}>{offer.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm" style={{ color: colors.muted }}>Availability</div>
                <div className="font-semibold" style={{ color: colors.headingDark }}>{AVAILABILITY_LABELS[offer.availability] || offer.availability}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm" style={{ color: colors.muted }}>Posted</div>
                <div className="font-semibold" style={{ color: colors.headingDark }}>{new Date(offer.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: colors.primary }}>
                {offer.user_full_name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="font-medium" style={{ color: colors.headingDark }}>{offer.user_full_name}</div>
                <div className="text-sm" style={{ color: colors.muted }}>{offer.user_email}</div>
              </div>
              {offer.user !== user?.id && (
                <button
                  onClick={() => {
                    const [first_name, ...rest] = (offer.user_full_name || '').split(' ');
                    navigate('/chat', {
                      state: {
                        startChatWith: {
                          id: offer.user,
                          email: offer.user_email,
                          first_name: first_name || '',
                          last_name: rest.join(' ') || '',
                        },
                      },
                    });
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{ backgroundColor: colors.primaryLight, color: colors.primary }}
                >
                  Message
                </button>
              )}
            </div>
          </div>

          {/* Linked Courses Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: colors.headingDark }}>
                Linked Courses ({linkedCourses.length})
              </h2>
              {canLink && (
                <button onClick={() => setShowLinkModal(true)}
                  className="px-4 py-2 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                  style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})` }}>
                  Manage Links
                </button>
              )}
            </div>

            {linkedCourses.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📚</div>
                <p style={{ color: colors.muted }}>No courses linked to this offer yet.</p>
                {canLink && (
                  <button onClick={() => setShowLinkModal(true)}
                    className="mt-4 font-semibold text-sm"
                    style={{ color: colors.gold }}>
                    Link a course →
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {linkedCourses.map(course => (
                  <Link
                    key={course.id}
                    to={`/courses/${course.id}`}
                    className="block p-4 bg-gray-50 rounded-xl transition-colors group"
                    style={{ '--tw-hover-bg': colors.goldLight }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.goldLight}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold transition-colors" style={{ color: colors.headingDark }}>
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={course.status === 'active'
                              ? { backgroundColor: colors.oliveLight, color: colors.headingDark }
                              : { backgroundColor: '#F3F4F6', color: colors.muted }}
                          >
                            {course.status}
                          </span>
                          <span className="text-xs" style={{ color: colors.muted }}>by {course.user_email}</span>
                        </div>
                      </div>
                      <svg className="w-5 h-5 transition-colors" style={{ color: colors.muted }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Linked Live Sections Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: colors.headingDark }}>
                Linked Live Sections ({linkedLiveSections.length})
              </h2>
              {canLink && (
                <button onClick={() => setShowLinkLiveSectionModal(true)}
                  className="px-4 py-2 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                  style={{ backgroundColor: colors.secondary }}>
                  Manage Live Section Links
                </button>
              )}
            </div>

            {linkedLiveSections.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📡</div>
                <p style={{ color: colors.muted }}>No live sections linked to this offer yet.</p>
                {canLink && (
                  <button onClick={() => setShowLinkLiveSectionModal(true)}
                    className="mt-4 font-semibold text-sm"
                    style={{ color: colors.secondary }}>
                    Link a live section →
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {linkedLiveSections.map(ls => (
                  <Link
                    key={ls.id}
                    to={`/live-sections/${ls.id}`}
                    className="block p-4 bg-gray-50 rounded-xl transition-colors group"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primaryLight}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold transition-colors" style={{ color: colors.headingDark }}>
                          {ls.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={ls.effective_status === 'active'
                              ? { backgroundColor: colors.oliveLight, color: colors.headingDark }
                              : { backgroundColor: '#F3F4F6', color: colors.muted }}
                          >
                            {ls.effective_status}
                          </span>
                          <span className="text-xs" style={{ color: colors.muted }}>by {ls.user_email}</span>
                          <span className="text-xs" style={{ color: colors.muted }}>•</span>
                          <span className="text-xs" style={{ color: colors.muted }}>Ends: {new Date(ls.ending_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <svg className="w-5 h-5 transition-colors" style={{ color: colors.muted }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showLinkModal && (
          <LinkCourseModal
            offerId={id}
            onClose={() => setShowLinkModal(false)}
            onLinked={fetchOffer}
          />
        )}
        {showLinkLiveSectionModal && (
          <LinkLiveSectionModal
            offerId={id}
            onClose={() => setShowLinkLiveSectionModal(false)}
            onLinked={fetchOffer}
          />
        )}
        {showEditModal && (
          <EditPostModal
            post={offer}
            type="offer"
            onClose={() => setShowEditModal(false)}
            onUpdated={(updatedOffer) => {
              setOffer(updatedOffer);
              setShowEditModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
