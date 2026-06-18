// frontend/src/pages/admin/AdminPosts.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { postsAPI } from '../../api/posts';
import { useAuth } from '../../context/AuthContext';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full bg-[#FDF8F5] rounded-2xl shadow-2xl overflow-hidden border border-[#e8b4b0]">
        <div className="h-1 bg-gradient-to-r from-red-400 to-red-600" />
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </motion.div>
          </div>
          <h3 className="text-xl font-bold text-center text-[#3d4a00] mb-2">{title}</h3>
          <p className="text-[#5a6600] text-center mb-6">{message}</p>
          <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-[#d8e4f0] hover:bg-[#c4d8ec] text-[#3d4a00] font-medium rounded-xl transition-colors">
              Cancel
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onConfirm}
              className="flex-1 px-4 py-2.5 text-white font-medium rounded-xl bg-gradient-to-r from-red-500 to-red-600 transition-colors">
              Delete
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'learn_language', label: 'Learn a Language' },
  { value: 'learn_tech_ai', label: 'Learn Tech / AI' },
  { value: 'career_cv_help', label: 'Career / CV Help' },
  { value: 'mental_health_support', label: 'Mental Health Support' },
  { value: 'academic_tuition', label: 'Academic Tuition' },
  { value: 'creative_skill', label: 'Creative Skill' },
  { value: 'others', label: 'Others' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'closed', label: 'Closed' },
];

const AVAILABILITY = [
  { value: '', label: 'All Availability' },
  { value: '1_2_hours', label: '1-2 hours/week' },
  { value: '3_5_hours', label: '3-5 hours/week' },
  { value: '6_8_hours', label: '6-8 hours/week' },
  { value: '8_10_hours', label: '8-10 hours/week' },
  { value: '10_plus_hours', label: '10+ hours/week' },
];

const statusStyle = (status) => {
  if (status === 'active') return 'bg-[#C26100] text-white';
  if (status === 'inactive') return 'bg-[#d8e4f0] text-[#3d4a00]';
  return 'bg-red-100 text-red-700';
};

export default function AdminPosts() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'offers');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, postId: null });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ category: '', status: '', availability: '', search: '' });

  const fetchPosts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, page_size: 20 };
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (activeTab === 'offers' && filters.availability) params.availability = filters.availability;
      const response = activeTab === 'offers' ? await postsAPI.getOffers(params) : await postsAPI.getRequests(params);
      const data = response.data;
      setPosts(data.results || data);
      setPagination({ page: data.page || page, totalPages: data.total_pages || 1 });
    } catch (err) {
      console.error(`Error fetching ${activeTab}:`, err);
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab]);

  useEffect(() => { fetchPosts(1); }, [fetchPosts]);

  const handleDelete = async () => {
    const id = deleteModal.postId;
    try {
      activeTab === 'offers' ? await postsAPI.deleteOffer(id) : await postsAPI.deleteRequest(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      setDeleteModal({ isOpen: false, postId: null });
    } catch (err) { alert(err.response?.data?.detail || 'Failed to delete post'); }
  };

  const handleStatusChange = async (post, newStatus) => {
    try {
      const response = activeTab === 'offers'
        ? await postsAPI.updateOffer(post.id, { status: newStatus })
        : await postsAPI.updateRequest(post.id, { status: newStatus });
      setPosts(prev => prev.map(p => p.id === post.id ? response.data : p));
    } catch (err) { alert(err.response?.data?.detail || 'Failed to update status'); }
  };

  const handleUpdate = async (updatedData) => {
    try {
      const response = activeTab === 'offers'
        ? await postsAPI.updateOffer(editingPost.id, updatedData)
        : await postsAPI.updateRequest(editingPost.id, updatedData);
      setPosts(prev => prev.map(p => p.id === editingPost.id ? response.data : p));
      setEditingPost(null);
    } catch (err) { alert(err.response?.data?.detail || 'Failed to update post'); }
  };

  const isAdmin = user?.is_staff || user?.is_superuser;
  const colSpan = activeTab === 'offers' ? 7 : 6;

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin" className="p-2 hover:bg-[#d8e4f0] rounded-xl transition-colors">
            <svg className="w-6 h-6 text-[#3d4a00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#3d4a00]">Manage Posts</h1>
            <p className="text-[#5a6600] mt-1">Manage all community offers and requests</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('offers')}
            className={`px-6 py-2.5 rounded-xl font-semibold transition-all text-sm ${
              activeTab === 'offers'
                ? 'bg-[#1e3a5f] text-white shadow-md'
                : 'bg-[#d8e4f0] text-[#3d4a00] hover:bg-[#c4d8ec]'
            }`}>
            🙌 Offers
          </button>
          <button onClick={() => setActiveTab('requests')}
            className={`px-6 py-2.5 rounded-xl font-semibold transition-all text-sm ${
              activeTab === 'requests'
                ? 'bg-[#1e3a5f] text-white shadow-md'
                : 'bg-[#d8e4f0] text-[#3d4a00] hover:bg-[#c4d8ec]'
            }`}>
            🌟 Requests
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {[
            { value: filters.category, key: 'category', options: CATEGORIES },
            { value: filters.status, key: 'status', options: STATUS_OPTIONS },
          ].map(({ value, key, options }) => (
            <select key={key} value={value}
              onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
              className="px-4 py-2 rounded-xl border border-[#a8c4dc] bg-[#d8e4f0] text-[#3d4a00] text-sm focus:ring-2 focus:ring-[#C26100] outline-none">
              {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
          {activeTab === 'offers' && (
            <select value={filters.availability}
              onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
              className="px-4 py-2 rounded-xl border border-[#a8c4dc] bg-[#d8e4f0] text-[#3d4a00] text-sm focus:ring-2 focus:ring-[#C26100] outline-none">
              {AVAILABILITY.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          )}
        </div>
      </motion.div>

      {/* Table */}
      <div className="bg-[#d8e4f0] border border-[#a8c4dc] rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#a8c4dc] bg-[#c4d8ec]">
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1e3a5f]">Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1e3a5f]">Category</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1e3a5f]">Author</th>
                {activeTab === 'offers' && <th className="text-left px-6 py-4 text-sm font-semibold text-[#1e3a5f]">Availability</th>}
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1e3a5f]">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1e3a5f]">Date</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-[#1e3a5f]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-[#a8c4dc]">
                    <td className="px-6 py-4"><div className="h-4 bg-[#a8c4dc] rounded w-48 animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-[#a8c4dc] rounded w-24 animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-[#a8c4dc] rounded w-32 animate-pulse" /></td>
                    {activeTab === 'offers' && <td className="px-6 py-4"><div className="h-4 bg-[#a8c4dc] rounded w-24 animate-pulse" /></td>}
                    <td className="px-6 py-4"><div className="h-4 bg-[#a8c4dc] rounded w-16 animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-[#a8c4dc] rounded w-20 animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-[#a8c4dc] rounded w-16 animate-pulse ml-auto" /></td>
                  </tr>
                ))
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-6 py-16 text-center text-[#5a6600]">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-10 h-10 text-[#a8c4dc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      <span className="font-medium">No {activeTab} found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                posts.map(post => (
                  <motion.tr key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="border-b border-[#a8c4dc] hover:bg-[#c4d8ec] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#1e3a5f]">
                        {activeTab === 'offers' ? post.offer_name : post.request_name}
                      </div>
                      <div className="text-xs text-[#5a6600] truncate max-w-xs mt-0.5">{post.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-[#F2DDD8] text-[#C26100] border border-[#e8b4b0] rounded-full text-xs font-semibold">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5a6600]">{post.user_full_name}</td>
                    {activeTab === 'offers' && <td className="px-6 py-4 text-sm text-[#5a6600]">{post.availability}</td>}
                    <td className="px-6 py-4">
                      <select value={post.status} onChange={(e) => handleStatusChange(post, e.target.value)}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold border-0 outline-none cursor-pointer ${statusStyle(post.status)}`}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5a6600]">{new Date(post.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {isAdmin && (
                          <motion.button whileHover={{ scale: 1.1 }} onClick={() => setEditingPost(post)}
                            className="p-2 text-[#C26100] hover:bg-[#F2DDD8] rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </motion.button>
                        )}
                        <motion.button whileHover={{ scale: 1.1 }}
                          onClick={() => setDeleteModal({ isOpen: true, postId: post.id })}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#a8c4dc]">
            <span className="text-sm text-[#5a6600]">Page {pagination.page} of {pagination.totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => fetchPosts(pagination.page - 1)} disabled={pagination.page === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[#F2DDD8] text-[#3d4a00] disabled:opacity-40 hover:bg-[#e8c8c0] transition-colors">
                Previous
              </button>
              <button onClick={() => fetchPosts(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-[#C26100] to-[#E07A1B] text-white disabled:opacity-40 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editingPost && (
          <PostEditModal post={editingPost} type={activeTab} onClose={() => setEditingPost(null)} onSubmit={handleUpdate} />
        )}
      </AnimatePresence>

      <ConfirmationModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, postId: null })}
        onConfirm={handleDelete}
        title={`Delete ${activeTab === 'offers' ? 'Offer' : 'Request'}`}
        message={`Are you sure you want to delete this ${activeTab === 'offers' ? 'offer' : 'request'}? This action cannot be undone.`} />
    </div>
  );
}

function PostEditModal({ post, type, onClose, onSubmit }) {
  const nameKey = type === 'offers' ? 'offer_name' : 'request_name';
  const [formData, setFormData] = useState({
    [nameKey]: post[nameKey] || '',
    category: post.category || '',
    description: post.description || '',
    availability: post.availability || '3_5_hours',
    status: post.status || 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => { setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try { await onSubmit(formData); }
    catch (err) { setError(err.response?.data?.detail || 'Update failed'); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-3 border border-[#a8c4dc] bg-white rounded-xl focus:ring-2 focus:ring-[#C26100] focus:border-[#C26100] transition-all outline-none text-[#3d4a00]";
  const labelClass = "block text-sm font-medium text-[#3d4a00] mb-2";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-[#FDF8F5] rounded-3xl shadow-2xl max-w-lg w-full border border-[#e8b4b0]"
        onClick={(e) => e.stopPropagation()}>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-[#3d4a00] mb-6">Edit {type === 'offers' ? 'Offer' : 'Request'}</h2>
          {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"><p className="text-sm text-red-700">{error}</p></div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label className={labelClass}>Name</label>
              <input type="text" name={nameKey} value={formData[nameKey]} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                {CATEGORIES.filter(c => c.value).map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
              </select></div>
            <div><label className={labelClass}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} /></div>
            {type === 'offers' && (
              <div><label className={labelClass}>Availability</label>
                <select name="availability" value={formData.availability} onChange={handleChange} className={inputClass}>
                  {AVAILABILITY.filter(a => a.value).map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select></div>
            )}
            <div><label className={labelClass}>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="closed">Closed</option>
              </select></div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 border-2 border-[#a8c4dc] text-[#3d4a00] font-semibold rounded-xl hover:bg-[#d8e4f0] transition-colors">
                Cancel
              </button>
              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                className="flex-1 py-3 bg-gradient-to-r from-[#C26100] to-[#E07A1B] text-white font-semibold rounded-xl shadow-lg disabled:opacity-50">
                {loading ? 'Saving...' : 'Update'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
