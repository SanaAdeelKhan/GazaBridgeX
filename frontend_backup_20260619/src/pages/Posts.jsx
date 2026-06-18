// frontend/src/pages/Posts.jsx - Compact list layout, expandable rows, clickable user profiles
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../api/posts';
import CreatePostModal from '../components/CreatePostModal';
import EditPostModal from '../components/EditPostModal';
import { tw, colors } from '../theme/colors';

// ── Confirmation Modal ─────────────────────────────────────────────────────────
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'delete' }) => {
  if (!isOpen) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }} onClick={e => e.stopPropagation()}
        className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className={`h-1 ${type === 'delete' ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-[${colors.accentStart}] to-[${colors.accentEnd}]'}`} />
        <div className="p-6">
          <h3 className="text-xl font-bold text-center mb-2" style={{ color: colors.bannerStart }}>{title}</h3>
          <p className="text-gray-600 text-center mb-6">{message}</p>
          <div className="flex gap-3">
            <button onClick={onClose} className={`flex-1 px-4 py-2.5 font-medium rounded-xl transition-colors ${tw.cancelBtn}`}>{t('common.cancel')}</button>
            <button onClick={onConfirm} className={`flex-1 px-4 py-2.5 text-white font-medium rounded-xl transition-colors ${type === 'delete' ? 'bg-gradient-to-r from-red-500 to-red-600' : tw.accentBtn}`}>{t('common.confirm')}</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Constants ──────────────────────────────────────────────────────────────────
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
const CATEGORIES = [
  { value: '', label: 'All Categories', icon: '📚' },
  { value: 'learn_language', label: 'Learn a Language', icon: '🗣️' },
  { value: 'learn_tech_ai', label: 'Learn Tech / AI', icon: '🤖' },
  { value: 'career_cv_help', label: 'Career / CV Help', icon: '💼' },
  { value: 'mental_health_support', label: 'Mental Health Support', icon: '🧠' },
  { value: 'academic_tuition', label: 'Academic Tuition', icon: '📖' },
  { value: 'creative_skill', label: 'Creative Skill', icon: '🎨' },
  { value: 'others', label: 'Others', icon: '📌' },
];
const AVAILABILITY = [
  { value: '1_2_hours', label: '1-2 hours/week' }, { value: '3_5_hours', label: '3-5 hours/week' },
  { value: '6_8_hours', label: '6-8 hours/week' }, { value: '8_10_hours', label: '8-10 hours/week' },
  { value: '10_plus_hours', label: '10+ hours/week' },
];
const STATUS = [
  { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'closed', label: 'Closed' },
];

// ── Post Row (compact + expandable) ───────────────────────────────────────────
function PostRow({ post, type, canEdit, canDelete, onEdit, onDelete }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const name = type === 'offer' ? post.offer_name : post.request_name;
  const initials = post.user_full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';
  const date = new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const statusStyle = {
    active: 'bg-[${colors.accentEnd}] text-white',
    inactive: 'bg-gray-200 text-gray-600',
    closed: 'bg-red-100 text-red-700',
  }[post.status] || 'bg-gray-200 text-gray-600';

  const typeStyle = type === 'offer'
    ? 'bg-blue-100 text-blue-700'
    : 'bg-purple-100 text-purple-700';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden border border-[${colors.cardBorder}] mb-2 shadow-sm hover:shadow-md transition-shadow"
      style={{ backgroundColor: colors.card }}
    >
      {/* ── Compact Row ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#ccd8e8] transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Expand chevron */}
        <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}
          className="text-gray-400 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>

        {/* Type badge */}
        <span className={`hidden sm:inline-flex flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${typeStyle}`}>
          {type === 'offer' ? '🙌 Offer' : '🌟 Request'}
        </span>

        {/* Category icon */}
        <span className="flex-shrink-0 text-lg">{CATEGORY_ICONS[post.category] || '📌'}</span>

        {/* Title */}
        <span className="flex-1 font-semibold truncate text-sm" style={{ color: colors.title }}>
          {name}
        </span>

        {/* Category label — hidden on small screens */}
        <span className="hidden md:block flex-shrink-0 text-xs font-medium px-2 py-1 rounded-lg bg-white/60" style={{ color: colors.body }}>
          {CATEGORY_LABELS[post.category] || post.category}
        </span>

        {/* Availability — offers only */}
        {type === 'offer' && post.availability && (
          <span className="hidden lg:block flex-shrink-0 text-xs" style={{ color: colors.body }}>
            ⏱ {AVAILABILITY_LABELS[post.availability]}
          </span>
        )}

        {/* Author — clickable */}
        <button
          onClick={e => { e.stopPropagation(); navigate(`/users/${post.user}`); }}
          className="hidden sm:flex flex-shrink-0 items-center gap-1.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
            style={{ background: `linear-gradient(to bottom right, ${colors.accentStart}, ${colors.accentEnd})` }}>
            {initials}
          </div>
          <span className="text-xs font-medium underline underline-offset-2" style={{ color: colors.bannerStart }}>
            {post.user_full_name}
          </span>
        </button>

        {/* Date */}
        <span className="hidden lg:block flex-shrink-0 text-xs" style={{ color: colors.body }}>{date}</span>

        {/* Status badge */}
        <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyle}`}>
          {post.status}
        </span>

        {/* Edit/Delete */}
        {(canEdit || canDelete) && (
          <div className="flex gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
            {canEdit && (
              <button onClick={() => onEdit(post)}
                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title={t("common.edit")}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {canDelete && (
              <button onClick={() => onDelete(post.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title={t("common.delete")}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Expanded Detail ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 border-t border-[${colors.cardBorder}] bg-white/40">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-2" style={{ color: colors.title }}>{name}</h3>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: colors.body }}>
                    {post.description || 'No description provided.'}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded-lg bg-white/70 font-medium" style={{ color: colors.body }}>
                      {CATEGORY_ICONS[post.category]} {CATEGORY_LABELS[post.category] || post.category}
                    </span>
                    {type === 'offer' && post.availability && (
                      <span className="px-2 py-1 rounded-lg bg-white/70 font-medium" style={{ color: colors.body }}>
                        ⏱ {AVAILABILITY_LABELS[post.availability]}
                      </span>
                    )}
                    <span className="px-2 py-1 rounded-lg bg-white/70 font-medium" style={{ color: colors.body }}>
                      📅 {date}
                    </span>
                  </div>
                </div>

                {/* Author card */}
                <div className="flex-shrink-0">
                  <button
                    onClick={() => navigate(`/users/${post.user}`)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[${colors.cardBorder}] bg-white/60 hover:bg-white transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: `linear-gradient(to bottom right, ${colors.accentStart}, ${colors.accentEnd})` }}>
                      {initials}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold" style={{ color: colors.bannerStart }}>{post.user_full_name}</p>
                      <p className="text-xs" style={{ color: colors.body }}>View profile →</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Posts Page ────────────────────────────────────────────────────────────
export default function Posts() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('offers');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, postId: null });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [filters, setFilters] = useState({ category: '', search: '', availability: '', status: '', ordering: '-created_at' });
  const [searchInput, setSearchInput] = useState('');

  const fetchPosts = useCallback(async (page = 1, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, page_size: 50, ordering: filters.ordering };
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (activeTab === 'offers' && filters.availability) params.availability = filters.availability;

      const response = activeTab === 'offers'
        ? await postsAPI.getOffers(params)
        : await postsAPI.getRequests(params);
      const data = response.data;

      if (append) setPosts(prev => [...prev, ...(data.results || data)]);
      else setPosts(data.results || data);

      setPagination({
        page: data.page || page,
        totalPages: data.total_pages || 1,
        totalCount: data.count || (data.results || data).length,
      });
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to load ${activeTab}`);
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab]);

  useEffect(() => { fetchPosts(1, false); }, [fetchPosts]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilters({ category: '', search: '', availability: '', status: '', ordering: '-created_at' });
    setSearchInput('');
    setPosts([]);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput }));
  };

  const handleDelete = async () => {
    const id = deleteModal.postId;
    try {
      if (activeTab === 'offers') await postsAPI.deleteOffer(id);
      else await postsAPI.deleteRequest(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      setPagination(prev => ({ ...prev, totalCount: prev.totalCount - 1 }));
      setDeleteModal({ isOpen: false, postId: null });
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete post');
    }
  };

  const handleUpdate = (updatedPost) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    setEditingPost(null);
  };

  const handleLoadMore = () => {
    if (!loading && pagination.page < pagination.totalPages) fetchPosts(pagination.page + 1, true);
  };

  const canEditPost = (post) => user && (post.user === user.id || user.is_staff || user.is_superuser);
  const canDeletePost = (post) => user && (post.user === user.id || user.is_staff || user.is_superuser || user.roles?.some(r => r.name === 'manager'));

  return (
    <div className={`pt-24 min-h-screen ${tw.pageBg}`}>
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-1" style={{ color: colors.title }}>{t('posts.title')}</h1>
              <p className="text-sm" style={{ color: colors.body }}>{t('posts.browseSubtitle')}</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className={`px-6 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 ${tw.accentBtn}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('posts.newPost')}
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {[
              { value: 'offers', label: '🙌 Offers', desc: 'What people are offering' },
              { value: 'requests', label: '🌟 Requests', desc: 'What people need' },
            ].map(tab => (
              <motion.button key={tab.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => handleTabChange(tab.value)}
                className={`flex-1 p-3 rounded-2xl text-left transition-all ${activeTab === tab.value ? tw.tabActive + ' shadow-lg' : tw.tabInactive + ' border-2 border-transparent hover:border-[${colors.bannerStart}]'}`}>
                <div className="text-base font-semibold">{tab.label}</div>
                <div className="text-xs opacity-70">{tab.desc}</div>
              </motion.button>
            ))}
          </div>

          {/* Filters */}
          <div className={tw.filterCard}>
            <form onSubmit={handleSearch} className="flex gap-3 mb-3">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
                  placeholder={`Search ${activeTab}...`}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-[${colors.cardBorder}] rounded-xl focus:ring-2 focus:ring-[${colors.bannerStart}] focus:border-[${colors.bannerStart}] outline-none text-sm"
                  style={{ color: colors.title }} />
              </div>
              <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className={`px-5 py-2.5 font-semibold rounded-xl shadow-md text-sm ${tw.accentBtn}`}>{t('common.search')}</motion.button>
              {filters.search && (
                <button type="button" onClick={() => { setSearchInput(''); setFilters(prev => ({ ...prev, search: '' })); }}
                  className="px-4 py-2.5 text-gray-600 font-medium rounded-xl border border-gray-300 text-sm">{t('posts.clearFilters')}</button>
              )}
            </form>
            <div className="flex flex-wrap gap-2">
              {[
                { value: filters.category, onChange: v => setFilters(p => ({ ...p, category: v })), options: CATEGORIES.map(c => ({ value: c.value, label: `${c.icon} ${c.label}` })) },
                { value: filters.status, onChange: v => setFilters(p => ({ ...p, status: v })), options: [{ value: '', label: 'All Statuses' }, ...STATUS.map(s => ({ value: s.value, label: s.label }))] },
                ...(activeTab === 'offers' ? [{ value: filters.availability, onChange: v => setFilters(p => ({ ...p, availability: v })), options: [{ value: '', label: 'All Availability' }, ...AVAILABILITY.map(a => ({ value: a.value, label: a.label }))] }] : []),
              ].map((sel, i) => (
                <select key={i} value={sel.value} onChange={e => sel.onChange(e.target.value)}
                  className="px-3 py-2 rounded-xl border-2 border-[${colors.cardBorder}] bg-white text-sm font-medium focus:ring-2 focus:ring-[${colors.bannerStart}] outline-none"
                  style={{ color: colors.title }}>
                  {sel.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
        )}

        {/* Column headers */}
        {posts.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: colors.body }}>
            <span className="w-4" />
            <span className="hidden sm:block w-16">Type</span>
            <span className="w-5" />
            <span className="flex-1">Title</span>
            <span className="hidden md:block w-36">Category</span>
            <span className="hidden lg:block w-20">Avail.</span>
            <span className="hidden sm:block w-28">Author</span>
            <span className="hidden lg:block w-20">Date</span>
            <span className="w-14">Status</span>
          </div>
        )}

        {/* Posts List */}
        {loading && posts.length === 0 ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-white/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="text-6xl mb-4">{activeTab === 'offers' ? '🙌' : '🌟'}</div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: colors.bannerStart }}>No {activeTab} found</h3>
            <p className="mb-6" style={{ color: colors.body }}>
              {filters.search || filters.category || filters.status ? 'Try adjusting your filters.' : `Be the first to create a ${activeTab === 'offers' ? 'offer' : 'request'}!`}
            </p>
            {(filters.search || filters.category || filters.status) && (
              <button onClick={() => { setSearchInput(''); setFilters({ category: '', search: '', availability: '', status: '', ordering: '-created_at' }); }}
                className="px-6 py-3 bg-white text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors border border-gray-200">
                Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          <>
            <div>
              {posts.map((post) => (
                <PostRow key={post.id} post={post}
                  type={activeTab === 'offers' ? 'offer' : 'request'}
                  canEdit={canEditPost(post)} canDelete={canDeletePost(post)}
                  onEdit={setEditingPost}
                  onDelete={(id) => setDeleteModal({ isOpen: true, postId: id })}
                />
              ))}
            </div>

            {/* Load more */}
            {pagination.page < pagination.totalPages && (
              <div className="text-center mt-6">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleLoadMore} disabled={loading}
                  className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:border-[${colors.accentStart}] hover:text-[${colors.accentStart}] transition-all shadow-sm disabled:opacity-50 text-sm">
                  {loading ? 'Loading...' : `Load More (${pagination.totalPages - pagination.page} more pages)`}
                </motion.button>
              </div>
            )}

            <div className="text-center mt-3 text-sm" style={{ color: colors.body }}>
              Showing {posts.length} of {pagination.totalCount} {activeTab}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {showCreateModal && <CreatePostModal onClose={() => setShowCreateModal(false)} onCreated={() => { setShowCreateModal(false); fetchPosts(1, false); }} />}
      </AnimatePresence>
      <AnimatePresence>
        {editingPost && <EditPostModal post={editingPost} type={activeTab === 'offers' ? 'offer' : 'request'} onClose={() => setEditingPost(null)} onUpdated={handleUpdate} />}
      </AnimatePresence>
      <ConfirmationModal t={t} isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, postId: null })}
        onConfirm={handleDelete} title={`Delete ${activeTab === 'offers' ? 'Offer' : 'Request'}`}
        message={`Are you sure you want to delete this ${activeTab === 'offers' ? 'offer' : 'request'}? This action cannot be undone.`}
        type="delete" />
    </div>
  );
}
