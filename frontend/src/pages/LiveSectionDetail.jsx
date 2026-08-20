// frontend/src/pages/LiveSectionDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { liveSectionsAPI } from '../api/liveSections';
import { feedbackAPI } from '../api/feedback';
import EditLiveSectionModal from '../components/EditLiveSectionModal';
import AddLiveSectionContentModal from '../components/AddLiveSectionContentModal';
import colors from '../theme/colors';

// Beautiful Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'delete' }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="h-1" style={{ backgroundColor: type === 'delete' ? colors.error : colors.gold }} />

        <div className="p-6">
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: type === 'delete' ? colors.errorBg : colors.goldLight }}
            >
              {type === 'delete' ? (
                <svg className="w-8 h-8" style={{ color: colors.error }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              ) : (
                <svg className="w-8 h-8" style={{ color: colors.gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </motion.div>
          </div>

          <h3 className="text-xl font-bold text-center mb-2" style={{ color: colors.headingDark }}>{title}</h3>
          <p className="text-center mb-6" style={{ color: colors.body }}>{message}</p>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl transition-colors"
              style={{ color: colors.body }}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 text-white font-medium rounded-xl transition-colors"
              style={{ background: type === 'delete' ? colors.error : `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})` }}
            >
              Confirm
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CATEGORY_ICONS = { teaching_language: '🗣️', tech_coding_ai: '🤖', career_mentorship: '💼', mental_health: '🧠', creative_design: '🎨', academic: '📖', others: '📌' };
const LANGUAGE_LABELS = { en: 'English', ur: 'Urdu', ar: 'Arabic', fr: 'French', es: 'Spanish', de: 'German', zh: 'Chinese', hi: 'Hindi', pt: 'Portuguese', ru: 'Russian', ja: 'Japanese', tr: 'Turkish' };

export default function LiveSectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [liveSection, setLiveSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [deleteLiveSectionModal, setDeleteLiveSectionModal] = useState({ isOpen: false });
  const [deleteContentModal, setDeleteContentModal] = useState({ isOpen: false, contentId: null, contentTitle: '' });
  const [ratingSummary, setRatingSummary] = useState(null);

  const fetchLiveSection = async () => {
    try {
      const response = await liveSectionsAPI.getLiveSection(id);
      setLiveSection(response.data);
      fetchRatingSummary();
    } catch (err) { setError('Failed to load live section'); }
    finally { setLoading(false); }
  };

  const fetchRatingSummary = async () => {
    try {
      const params = { feedback_type: 'live_section', object_id: id };
      const response = await feedbackAPI.getRatingSummary(params);
      setRatingSummary(response.data.rating_summary);
    } catch (err) {
      console.error('Error fetching rating summary:', err);
    }
  };

  useEffect(() => { fetchLiveSection(); }, [id]);

  const handleDeleteLiveSection = async () => {
    try {
      await liveSectionsAPI.deleteLiveSection(id);
      navigate('/live-sections');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete');
    }
  };

  const handleDeleteContent = async () => {
    const contentId = deleteContentModal.contentId;
    try {
      await liveSectionsAPI.deleteContent(contentId);
      fetchLiveSection();
      setDeleteContentModal({ isOpen: false, contentId: null, contentTitle: '' });
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete');
    }
  };

  const canEdit = liveSection && (liveSection.user === user?.id || user?.is_staff || user?.is_superuser);
  const canDelete = liveSection && (liveSection.user === user?.id || user?.is_staff || user?.is_superuser || user?.roles?.some(r => r.name === 'manager'));
  const canAddContent = liveSection && (liveSection.user === user?.id || user?.is_staff || user?.is_superuser);

  const effectiveStatus = liveSection?.effective_status || liveSection?.status;
  const isEnded = effectiveStatus === 'closed' && liveSection?.status === 'active';

  // Find content title for the delete modal message
  const getContentTitle = () => {
    const content = liveSection?.contents?.find(c => c.id === deleteContentModal.contentId);
    return content?.content_title || 'this content';
  };

  if (loading) return <div className="pt-24 min-h-screen flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-t-transparent rounded-full" style={{ borderColor: colors.gold, borderTopColor: 'transparent' }} /></div>;
  if (error || !liveSection) return <div className="pt-24 min-h-screen flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold mb-4" style={{ color: colors.headingDark }}>Not found</h2><Link to="/live-sections" className="font-semibold" style={{ color: colors.gold }}>← Back</Link></div></div>;

  return (
    <div className="pt-24 min-h-screen" style={{ backgroundColor: colors.primaryLight }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/live-sections" className="inline-flex items-center gap-2 font-semibold mb-6" style={{ color: colors.gold }}>← Back</Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold border"
                    style={effectiveStatus === 'active'
                      ? { backgroundColor: colors.oliveLight, color: colors.headingDark, borderColor: colors.olive }
                      : { backgroundColor: colors.errorBg, color: colors.error, borderColor: colors.error }}
                  >
                    {isEnded ? 'Ended' : effectiveStatus}
                  </span>
                  {isEnded && <span className="text-xs" style={{ color: colors.error }}>(Auto-closed, ending date passed)</span>}
                </div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: colors.headingDark }}>{liveSection.title}</h1>
                <div className="flex items-center gap-2" style={{ color: colors.muted }}><span className="text-2xl">{CATEGORY_ICONS[liveSection.category]}</span><span>{liveSection.category}</span></div>
              </div>
              <div className="flex gap-2">
                {canEdit && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-4 py-2 rounded-xl font-semibold text-sm border"
                    style={{ backgroundColor: colors.goldLight, color: colors.headingDark, borderColor: colors.gold }}
                  >
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => setDeleteLiveSectionModal({ isOpen: true })}
                    className="px-4 py-2 rounded-xl font-semibold text-sm border"
                    style={{ backgroundColor: colors.errorBg, color: colors.error, borderColor: colors.error }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
            <p className="mb-6" style={{ color: colors.body }}>{liveSection.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl"><div className="text-sm" style={{ color: colors.muted }}>Skill Level</div><div className="font-semibold capitalize" style={{ color: colors.headingDark }}>{liveSection.skill_level}</div></div>
              <div className="p-4 bg-gray-50 rounded-xl"><div className="text-sm" style={{ color: colors.muted }}>Language</div><div className="font-semibold" style={{ color: colors.headingDark }}>{LANGUAGE_LABELS[liveSection.language] || liveSection.language}</div></div>
              <div className="p-4 bg-gray-50 rounded-xl"><div className="text-sm" style={{ color: colors.muted }}>Sessions/Week</div><div className="font-semibold" style={{ color: colors.headingDark }}>{liveSection.sessions_per_week}</div></div>
              <div className="p-4 bg-gray-50 rounded-xl"><div className="text-sm" style={{ color: colors.muted }}>Duration</div><div className="font-semibold" style={{ color: colors.headingDark }}>{liveSection.session_duration} min</div></div>
              <div className="p-4 bg-gray-50 rounded-xl"><div className="text-sm" style={{ color: colors.muted }}>Total Days</div><div className="font-semibold" style={{ color: colors.headingDark }}>{liveSection.duration_days} days</div></div>
              <div className="p-4 bg-gray-50 rounded-xl col-span-2"><div className="text-sm" style={{ color: colors.muted }}>Ending Date</div><div className="font-semibold" style={{ color: colors.headingDark }}>{new Date(liveSection.ending_date).toLocaleString()}</div></div>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: colors.primary }}>{liveSection.user_full_name?.split(' ').map(n => n[0]).join('')}</div>
              <div><div className="font-medium" style={{ color: colors.headingDark }}>{liveSection.user_full_name}</div></div>
            </div>
          </div>

          {/* Professional Feedback Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              {/* Left side - Rating summary */}
              <div className="flex items-center gap-6">
                {/* Average rating */}
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2" style={{ color: colors.headingDark }}>
                    {ratingSummary?.average_rating ? ratingSummary.average_rating.toFixed(1) : 'N/A'}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.span
                        key={star}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + star * 0.1 }}
                        className="text-xl"
                        style={{
                          color: star <= Math.round(ratingSummary?.average_rating || 0) ? colors.gold : colors.badgeNeutral
                        }}
                      >
                        ★
                      </motion.span>
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: colors.muted }}>
                    {ratingSummary?.total_feedbacks || 0} {ratingSummary?.total_feedbacks === 1 ? 'review' : 'reviews'}
                  </p>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-16" style={{ backgroundColor: colors.divider }} />

                {/* Rating distribution */}
                <div className="hidden md:block flex-1 min-w-[200px]">
                  <div className="space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = ratingSummary?.distribution?.[star] || 0;
                      const total = ratingSummary?.total_feedbacks || 0;
                      const percentage = total > 0 ? (count / total) * 100 : 0;

                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs w-8" style={{ color: colors.muted }}>{star}★</span>
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ delay: 0.4 + (5 - star) * 0.1, duration: 0.8, ease: 'easeOut' }}
                              className="h-full rounded-full"
                              style={{ background: `linear-gradient(90deg, ${colors.gold}, ${colors.goldHover})` }}
                            />
                          </div>
                          <span className="text-xs w-6 text-right" style={{ color: colors.muted }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right side - CTA Button */}
              <Link to={`/live-sections/${liveSection.id}/feedback`} className="flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="group relative px-8 py-4 rounded-2xl font-bold text-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})`,
                  }}
                >
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                    }}
                  />

                  <span className="relative z-10 flex items-center gap-3">
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                      className="text-2xl"
                    >
                      ⭐
                    </motion.span>
                    <span>
                      <span className="block text-sm">View Live Section Feedback</span>
                      <span className="block text-xs opacity-80 mt-0.5">
                        See what students are saying
                      </span>
                    </span>
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-xl"
                    >
                      →
                    </motion.span>
                  </span>
                </motion.button>
              </Link>
            </div>
          </motion.div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: colors.headingDark }}>Contents ({liveSection.contents?.length || 0})</h2>
              {canAddContent && (
                <button
                  onClick={() => setShowAddContentModal(true)}
                  className="px-4 py-2 text-white rounded-xl font-semibold text-sm"
                  style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})` }}
                >
                  Add Content
                </button>
              )}
            </div>
            {liveSection.contents?.length === 0 ? <p className="text-center py-8" style={{ color: colors.muted }}>No content yet.</p> : (
              <div className="space-y-4">
                {liveSection.contents?.map((c, i) => (
                  <div key={c.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{ backgroundColor: colors.goldLight, color: colors.headingDark }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: colors.headingDark }}>{c.content_title}</h3>
                      {c.description && <p className="text-sm mt-1" style={{ color: colors.body }}>{c.description}</p>}
                      <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-sm mt-2 inline-block" style={{ color: colors.gold }}>Open →</a>
                    </div>
                    {(c.user === user?.id || user?.is_staff || user?.is_superuser) && (
                      <button onClick={() => setDeleteContentModal({ isOpen: true, contentId: c.id, contentTitle: c.content_title })} style={{ color: colors.error }}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <AnimatePresence>
        {showEditModal && <EditLiveSectionModal liveSection={liveSection} onClose={() => setShowEditModal(false)} onUpdated={fetchLiveSection} />}
        {showAddContentModal && <AddLiveSectionContentModal lsId={id} onClose={() => setShowAddContentModal(false)} onAdded={fetchLiveSection} />}
      </AnimatePresence>

      {/* Delete Live Section Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteLiveSectionModal.isOpen}
        onClose={() => setDeleteLiveSectionModal({ isOpen: false })}
        onConfirm={handleDeleteLiveSection}
        title="Delete Live Section"
        message={`Are you sure you want to delete "${liveSection?.title}"? This action cannot be undone.`}
        type="delete"
      />

      {/* Delete Content Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteContentModal.isOpen}
        onClose={() => setDeleteContentModal({ isOpen: false, contentId: null, contentTitle: '' })}
        onConfirm={handleDeleteContent}
        title="Delete Content"
        message={`Are you sure you want to delete "${getContentTitle()}"? This action cannot be undone.`}
        type="delete"
      />
    </div>
  );
}