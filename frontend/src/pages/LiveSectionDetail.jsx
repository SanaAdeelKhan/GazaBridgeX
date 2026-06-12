// frontend/src/pages/LiveSectionDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { liveSectionsAPI } from '../api/liveSections';
import EditLiveSectionModal from '../components/EditLiveSectionModal';
import AddLiveSectionContentModal from '../components/AddLiveSectionContentModal';
import { tw } from '../theme/colors';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'delete' }) => {
  if (!isOpen) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }} onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className={`h-1 ${type === 'delete' ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-[${colors.accentStart}] to-[${colors.accentEnd}]'}`} />
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className={`w-16 h-16 rounded-full flex items-center justify-center ${type === 'delete' ? 'bg-red-100' : 'bg-[#d4e0a0]'}`}>
              {type === 'delete' ? (
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-[${colors.accentStart}]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </motion.div>
          </div>
          <h3 className={`text-xl font-bold text-center mb-2 ${tw.titleText}`}>{title}</h3>
          <p className={`text-center mb-6 ${tw.bodyText}`}>{message}</p>
          <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
              className={`flex-1 px-4 py-2.5 font-medium rounded-xl transition-colors ${tw.cancelBtn} hover:bg-[#e8c5bf]`}>
              Cancel
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 text-white font-medium rounded-xl transition-colors ${
                type === 'delete' ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' : tw.accentBtn}`}>
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

  const fetchLiveSection = async () => {
    try {
      const response = await liveSectionsAPI.getLiveSection(id);
      setLiveSection(response.data);
    } catch (err) { setError('Failed to load live section'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLiveSection(); }, [id]);

  const handleDeleteLiveSection = async () => {
    try {
      await liveSectionsAPI.deleteLiveSection(id);
      navigate('/live-sections');
    } catch (err) { alert(err.response?.data?.detail || 'Failed to delete'); }
  };

  const handleDeleteContent = async () => {
    const contentId = deleteContentModal.contentId;
    try {
      await liveSectionsAPI.deleteContent(contentId);
      fetchLiveSection();
      setDeleteContentModal({ isOpen: false, contentId: null, contentTitle: '' });
    } catch (err) { alert(err.response?.data?.detail || 'Failed to delete'); }
  };

  const canEdit = liveSection && (liveSection.user === user?.id || user?.is_staff || user?.is_superuser);
  const canDelete = liveSection && (liveSection.user === user?.id || user?.is_staff || user?.is_superuser || user?.roles?.some(r => r.name === 'manager'));
  const canAddContent = liveSection && (liveSection.user === user?.id || user?.is_staff || user?.is_superuser);
  const effectiveStatus = liveSection?.effective_status || liveSection?.status;
  const isEnded = effectiveStatus === 'closed' && liveSection?.status === 'active';
  const getContentTitle = () => liveSection?.contents?.find(c => c.id === deleteContentModal.contentId)?.content_title || 'this content';

  if (loading) return (
    <div className={`pt-24 min-h-screen flex items-center justify-center ${tw.pageBg}`}>
      <div className="animate-spin w-12 h-12 border-4 border-[${colors.accentStart}] border-t-transparent rounded-full" />
    </div>
  );

  if (error || !liveSection) return (
    <div className={`pt-24 min-h-screen flex items-center justify-center ${tw.pageBg}`}>
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-4 ${tw.titleText}`}>Not found</h2>
        <Link to="/live-sections" className="text-[${colors.accentStart}] font-semibold">← Back</Link>
      </div>
    </div>
  );

  return (
    <div className={`pt-24 min-h-screen ${tw.pageBg}`}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/live-sections" className="inline-flex items-center gap-2 text-[${colors.accentStart}] font-semibold mb-6">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Live Sections
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Main Info Card */}
          <div className={`${tw.card} rounded-3xl shadow-xl p-8 mb-8`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    effectiveStatus === 'active' ? 'bg-[${colors.accentEnd}] text-white border-[${colors.accentStart}]' : 'bg-red-100 text-red-700 border-red-200'}`}>
                    {isEnded ? 'Ended' : effectiveStatus}
                  </span>
                  {isEnded && <span className="text-xs text-red-500">(Auto-closed, ending date passed)</span>}
                </div>
                <h1 className={`text-3xl font-bold mb-2 ${tw.titleText}`}>{liveSection.title}</h1>
                <div className="flex items-center gap-2 text-[${colors.body}]">
                  <span className="text-2xl">{CATEGORY_ICONS[liveSection.category]}</span>
                  <span>{liveSection.category}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {canEdit && <button onClick={() => setShowEditModal(true)} className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl font-semibold text-sm hover:bg-yellow-200 transition-colors">Edit</button>}
                {canDelete && <button onClick={() => setDeleteLiveSectionModal({ isOpen: true })} className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-semibold text-sm hover:bg-red-200 transition-colors">Delete</button>}
              </div>
            </div>

            <p className={`mb-6 ${tw.bodyText}`}>{liveSection.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Skill Level', value: liveSection.skill_level },
                { label: 'Language', value: LANGUAGE_LABELS[liveSection.language] || liveSection.language },
                { label: 'Sessions/Week', value: liveSection.sessions_per_week },
                { label: 'Duration', value: `${liveSection.session_duration} min` },
                { label: 'Total Days', value: `${liveSection.duration_days} days` },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 bg-white/60 rounded-xl">
                  <div className="text-sm text-[${colors.body}]/70">{label}</div>
                  <div className={`font-semibold capitalize ${tw.titleText}`}>{value}</div>
                </div>
              ))}
              <div className="p-4 bg-white/60 rounded-xl col-span-2">
                <div className="text-sm text-[${colors.body}]/70">Ending Date</div>
                <div className={`font-semibold ${tw.titleText}`}>{new Date(liveSection.ending_date).toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-[#a8bc6a]">
              <div className={`w-10 h-10 ${tw.accentBtn} rounded-full flex items-center justify-center font-bold`}>
                {liveSection.user_full_name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className={`font-medium ${tw.titleText}`}>{liveSection.user_full_name}</div>
                <div className="text-sm text-[${colors.body}]/70">{liveSection.user_email}</div>
              </div>
            </div>
          </div>

          {/* Contents Section */}
          <div className={`${tw.card} rounded-3xl shadow-xl p-8`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${tw.titleText}`}>Contents ({liveSection.contents?.length || 0})</h2>
              {canAddContent && (
                <button onClick={() => setShowAddContentModal(true)}
                  className={`px-4 py-2 ${tw.accentBtn} rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all`}>
                  Add Content
                </button>
              )}
            </div>
            {liveSection.contents?.length === 0 ? (
              <p className={`text-center py-8 ${tw.bodyText}`}>No content yet.</p>
            ) : (
              <div className="space-y-4">
                {liveSection.contents?.map((c, i) => (
                  <div key={c.id} className="flex items-start gap-4 p-4 bg-white/60 rounded-xl">
                    <div className={`w-8 h-8 ${tw.accentBtn} rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0`}>{i + 1}</div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${tw.titleText}`}>{c.content_title}</h3>
                      {c.description && <p className={`text-sm mt-1 ${tw.bodyText}`}>{c.description}</p>}
                      <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-[${colors.accentStart}] text-sm mt-2 inline-block hover:text-[${colors.accentEnd}]">Open →</a>
                    </div>
                    {(c.user === user?.id || user?.is_staff || user?.is_superuser) && (
                      <button onClick={() => setDeleteContentModal({ isOpen: true, contentId: c.id, contentTitle: c.content_title })}
                        className="text-red-400 hover:text-red-600 transition-colors">
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
      <ConfirmationModal isOpen={deleteLiveSectionModal.isOpen} onClose={() => setDeleteLiveSectionModal({ isOpen: false })}
        onConfirm={handleDeleteLiveSection} title="Delete Live Section"
        message={`Are you sure you want to delete "${liveSection?.title}"? This action cannot be undone.`} type="delete" />
      <ConfirmationModal isOpen={deleteContentModal.isOpen}
        onClose={() => setDeleteContentModal({ isOpen: false, contentId: null, contentTitle: '' })}
        onConfirm={handleDeleteContent} title="Delete Content"
        message={`Are you sure you want to delete "${getContentTitle()}"? This action cannot be undone.`} type="delete" />
    </div>
  );
}
