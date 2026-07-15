// frontend/src/pages/LiveSections.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { liveSectionsAPI } from '../api/liveSections';
import LiveSectionCard from '../components/LiveSectionCard';
import CreateLiveSectionModal from '../components/CreateLiveSectionModal';
import Pagination from '../components/Pagination';
import colors from '../theme/colors';

// Beautiful Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'delete' }) => {
  if (!isOpen) return null;

  const isDelete = type === 'delete';

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
        className="relative max-w-md w-full rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: colors.card }}
      >
        <div className="h-1" style={{ backgroundColor: isDelete ? colors.error : colors.gold }} />

        <div className="p-6">
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: isDelete ? colors.errorBg : colors.goldLight }}
            >
              {isDelete ? (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke={colors.error}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke={colors.goldHover}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </motion.div>
          </div>

          <h3 className="text-xl font-bold text-center mb-2" style={{ color: colors.headingDark }}>{title}</h3>
          <p className="text-center mb-6" style={{ color: colors.muted }}>{message}</p>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 px-4 py-2.5 font-medium rounded-xl transition-colors"
              style={{ backgroundColor: colors.badgeNeutral, color: colors.body }}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 text-white font-medium rounded-xl hover:brightness-95 transition-all"
              style={{ backgroundColor: isDelete ? colors.error : colors.gold }}
            >
              Confirm
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CATEGORIES = [
  { value: '', label: 'All Categories', icon: '📚' },
  { value: 'teaching_language', label: 'Teaching / Language', icon: '🗣️' },
  { value: 'tech_coding_ai', label: 'Tech / Coding / AI', icon: '🤖' },
  { value: 'career_mentorship', label: 'Career / Mentorship', icon: '💼' },
  { value: 'mental_health', label: 'Mental Health', icon: '🧠' },
  { value: 'creative_design', label: 'Creative / Design', icon: '🎨' },
  { value: 'academic', label: 'Academic', icon: '📖' },
  { value: 'others', label: 'Others', icon: '📌' },
];

const SKILL_LEVELS = [
  { value: '', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const LANGUAGES = [
  { value: '', label: 'All Languages' },
  { value: 'en', label: 'English' }, { value: 'ur', label: 'Urdu' },
  { value: 'ar', label: 'Arabic' }, { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' }, { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' }, { value: 'hi', label: 'Hindi' },
  { value: 'pt', label: 'Portuguese' }, { value: 'ru', label: 'Russian' },
  { value: 'ja', label: 'Japanese' }, { value: 'tr', label: 'Turkish' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'closed', label: 'Closed' },
];

export default function LiveSections() {
  const { user } = useAuth();
  const [liveSections, setLiveSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, liveSectionId: null, liveSectionTitle: '' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [filters, setFilters] = useState({
    category: '', skill_level: '', language: '', status: '',
    search: '', ordering: '-created_at',
  });
  const [searchInput, setSearchInput] = useState('');

  const fetchLiveSections = useCallback(async (page = 1, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, page_size: 12, ordering: filters.ordering };
      if (filters.category) params.category = filters.category;
      if (filters.skill_level) params.skill_level = filters.skill_level;
      if (filters.language) params.language = filters.language;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;

      const response = await liveSectionsAPI.getLiveSections(params);
      const data = response.data;
      if (append) {
        setLiveSections(prev => [...prev, ...(data.results || data)]);
      } else {
        setLiveSections(data.results || data);
      }
      setPagination({
        page: data.pagination?.page || page,
        totalPages: data.pagination?.total_pages || 1,
        totalCount: data.pagination?.count || (data.results || data).length,
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load live sections');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchLiveSections(1, false); }, [fetchLiveSections]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput }));
  };

  const handleDelete = async () => {
    const id = deleteModal.liveSectionId;
    try {
      const response = await liveSectionsAPI.deleteLiveSection(id);
      // Only close modal and re-fetch if delete actually succeeded (204)
      if (response.status === 204 || response.status === 200) {
        setDeleteModal({ isOpen: false, liveSectionId: null, liveSectionTitle: '' });
        await fetchLiveSections(1, false);
      } else {
        alert('Delete failed: unexpected response from server');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to delete';
      alert(`Delete failed: ${msg} (status: ${err.response?.status})`);
    }
  };

  const handlePageChange = (newPage) => {
    if (!loading && newPage >= 1 && newPage <= pagination.totalPages) {
      fetchLiveSections(newPage, false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const canDelete = (ls) => {
    if (!user) return false;
    if (ls.user === user.id) return true;
    if (user.is_staff || user.is_superuser) return true;
    if (user.roles?.some(r => r.name === 'manager')) return true;
    return false;
  };

  // Find live section title for the delete modal message
  const getLiveSectionTitle = () => {
    const liveSection = liveSections.find(ls => ls.id === deleteModal.liveSectionId);
    return liveSection?.title || 'this live section';
  };

  const selectStyle = { borderColor: colors.inputBorder, color: colors.body, backgroundColor: colors.inputBg };

  return (
    <div className="pt-24 min-h-screen" style={{ backgroundColor: colors.pageBg }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: colors.headingDark }}>Live Sections</h1>
              <p className="text-lg" style={{ color: colors.muted }}>Time-bound live learning sessions from the community</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:brightness-95 transition-all flex items-center gap-2"
              style={{ backgroundColor: colors.gold }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Live Section
            </motion.button>
          </div>

          <div className="rounded-2xl shadow-lg p-6 border" style={{ backgroundColor: colors.card, borderColor: colors.cardBorder }}>
            <form onSubmit={handleSearch} className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={colors.muted}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search live sections..."
                  className="w-full pl-12 pr-4 py-3 border rounded-xl outline-none transition-all"
                  style={selectStyle}
                  onFocus={(e) => (e.target.style.borderColor = colors.inputBorderFocus)}
                  onBlur={(e) => (e.target.style.borderColor = colors.inputBorder)}
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:brightness-95 transition-all"
                style={{ backgroundColor: colors.gold }}
              >
                Search
              </motion.button>
            </form>
            <div className="flex flex-wrap gap-2">
              <select value={filters.category} onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-4 py-2 rounded-xl border text-sm font-medium outline-none" style={selectStyle}>
                {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>)}
              </select>
              <select value={filters.skill_level} onChange={(e) => setFilters(prev => ({ ...prev, skill_level: e.target.value }))}
                className="px-4 py-2 rounded-xl border text-sm font-medium outline-none" style={selectStyle}>
                {SKILL_LEVELS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <select value={filters.language} onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
                className="px-4 py-2 rounded-xl border text-sm font-medium outline-none" style={selectStyle}>
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-4 py-2 rounded-xl border text-sm font-medium outline-none" style={selectStyle}>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: colors.errorBg, borderColor: colors.error }}>
            <p className="text-sm" style={{ color: colors.error }}>{error}</p>
          </motion.div>
        )}

        {loading && liveSections.length === 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl p-6 shadow-lg animate-pulse" style={{ backgroundColor: colors.card }}>
                <div className="h-4 rounded w-3/4 mb-4" style={{ backgroundColor: colors.badgeNeutral }} />
                <div className="h-4 rounded w-1/2" style={{ backgroundColor: colors.badgeNeutral }} />
              </div>
            ))}
          </div>
        ) : liveSections.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="text-6xl mb-6">📡</div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: colors.headingDark }}>No live sections found</h3>
            <p style={{ color: colors.muted }}>Be the first to create a live section!</p>
          </motion.div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {liveSections.map((ls, index) => (
                  <LiveSectionCard
                    key={ls.id}
                    liveSection={ls}
                    index={index}
                    canDelete={canDelete(ls)}
                    onDelete={() => setDeleteModal({ isOpen: true, liveSectionId: ls.id, liveSectionTitle: ls.title })}
                  />
                ))}
              </AnimatePresence>
            </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              disabled={loading}
            />
            <div className="text-center mt-4 text-sm" style={{ color: colors.muted }}>Showing {liveSections.length} of {pagination.totalCount} live sections</div>
          </>
        )}
      </div>
      <AnimatePresence>
        {showCreateModal && <CreateLiveSectionModal onClose={() => setShowCreateModal(false)} onCreated={() => { setShowCreateModal(false); fetchLiveSections(1, false); }} />}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, liveSectionId: null, liveSectionTitle: '' })}
        onConfirm={handleDelete}
        title="Delete Live Section"
        message={`Are you sure you want to delete "${getLiveSectionTitle()}"? This will also delete all contents and unlink from offers. This action cannot be undone.`}
        type="delete"
      />
    </div>
  );
}
