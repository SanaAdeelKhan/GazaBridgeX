// frontend/src/pages/admin/AdminResources.jsx
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { resourcesAPI } from '../../api/resources';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
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
  { value: 'job', label: '💼 Job Resources' },
  { value: 'internship', label: '🎯 Internship Resources' },
  { value: 'scholarship', label: '🎓 Scholarship Resources' },
  { value: 'grant', label: '💰 Grant Resources' },
  { value: 'fellowship', label: '🌟 Fellowship Resources' },
  { value: 'funding', label: '💸 Funding Resources' },
  { value: 'volunteer', label: '🤝 Volunteer Resources' },
  { value: 'other', label: '📌 Other Resources' },
];

export default function AdminResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, resourceId: null });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ category: '', search: '', ordering: '-created_at' });

  const fetchResources = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, page_size: 20, ordering: filters.ordering };
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      const response = await resourcesAPI.getResources(params);
      const data = response.data;
      setResources(data.results || data);
      setPagination({ page: data.page || page, totalPages: data.total_pages || 1 });
    } catch (err) {
      console.error('Failed to load resources', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchResources(1); }, [fetchResources]);

  const handleDelete = async () => {
    const id = deleteModal.resourceId;
    try {
      await resourcesAPI.deleteResource(id);
      setResources(prev => prev.filter(r => r.id !== id));
      setDeleteModal({ isOpen: false, resourceId: null });
    } catch (err) { alert(err.response?.data?.detail || 'Failed to delete resource'); }
  };

  const handleUpdate = async (updatedData) => {
    try {
      const response = await resourcesAPI.updateResource(editingResource.id, updatedData);
      setResources(prev => prev.map(r => r.id === editingResource.id ? response.data : r));
      setEditingResource(null);
    } catch (err) { alert(err.response?.data?.detail || 'Failed to update resource'); }
  };

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
            <h1 className="text-3xl font-bold text-[#3d4a00]">Manage Resources</h1>
            <p className="text-[#5a6600] mt-1">Create, edit, and delete resources</p>
          </div>
        </div>

        {/* Filters + Add button */}
        <div className="flex flex-wrap items-center gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#C26100] to-[#E07A1B] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Resource
          </motion.button>
          <select value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-4 py-2.5 rounded-xl border border-[#a8c4dc] bg-[#d8e4f0] text-[#3d4a00] text-sm focus:ring-2 focus:ring-[#C26100] outline-none">
            {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
          </select>
        </div>
      </motion.div>

      {/* Table */}
      <div className="bg-[#d8e4f0] border border-[#a8c4dc] rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#a8c4dc] bg-[#c4d8ec]">
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1e3a5f]">Title</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1e3a5f]">Category</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1e3a5f]">Author</th>
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
                    <td className="px-6 py-4"><div className="h-4 bg-[#a8c4dc] rounded w-20 animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-[#a8c4dc] rounded w-16 animate-pulse ml-auto" /></td>
                  </tr>
                ))
              ) : resources.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-[#5a6600]">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-10 h-10 text-[#a8c4dc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <span className="font-medium">No resources found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                resources.map(resource => (
                  <motion.tr key={resource.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="border-b border-[#a8c4dc] hover:bg-[#c4d8ec] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#1e3a5f]">{resource.title}</div>
                      <div className="text-xs text-[#5a6600] truncate max-w-xs mt-0.5">{resource.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-[#F2DDD8] text-[#C26100] border border-[#e8b4b0] rounded-full text-xs font-semibold">
                        {resource.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5a6600]">{resource.user_full_name}</td>
                    <td className="px-6 py-4 text-sm text-[#5a6600]">{new Date(resource.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <motion.a href={resource.link} target="_blank" rel="noopener noreferrer"
                          whileHover={{ scale: 1.1 }}
                          className="p-2 text-[#1e3a5f] hover:bg-[#F2DDD8] rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </motion.a>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => setEditingResource(resource)}
                          className="p-2 text-[#C26100] hover:bg-[#F2DDD8] rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }}
                          onClick={() => setDeleteModal({ isOpen: true, resourceId: resource.id })}
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
              <button onClick={() => fetchResources(pagination.page - 1)} disabled={pagination.page === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[#F2DDD8] text-[#3d4a00] disabled:opacity-40 hover:bg-[#e8c8c0] transition-colors">
                Previous
              </button>
              <button onClick={() => fetchResources(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-[#C26100] to-[#E07A1B] text-white disabled:opacity-40 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <ResourceFormModal mode="create" onClose={() => setShowCreateModal(false)}
            onSubmit={async (data) => { await resourcesAPI.createResource(data); setShowCreateModal(false); fetchResources(1); }} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editingResource && (
          <ResourceFormModal mode="edit" initialData={editingResource} onClose={() => setEditingResource(null)} onSubmit={handleUpdate} />
        )}
      </AnimatePresence>
      <ConfirmationModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, resourceId: null })}
        onConfirm={handleDelete} title={t("common.delete")} message={t("resources.deleteMsg")} />
    </div>
  );
}

function ResourceFormModal({ mode, initialData, onClose, onSubmit }) {
  const [formData, setFormData] = useState(initialData || { title: '', category: 'job', description: '', link: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => { setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.description?.trim() || !formData.link?.trim()) { setError('All fields are required.'); return; }
    setLoading(true); setError('');
    try { await onSubmit(formData); }
    catch (err) { setError(err.response?.data?.detail || 'Operation failed'); }
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
          <h2 className="text-2xl font-bold text-[#3d4a00] mb-6">{mode === 'create' ? 'Add Resource' : 'Edit Resource'}</h2>
          {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"><p className="text-sm text-red-700">{error}</p></div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label className={labelClass}>Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                {CATEGORIES.filter(c => c.value).map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
              </select></div>
            <div><label className={labelClass}>Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} /></div>
            <div><label className={labelClass}>Link *</label>
              <input type="url" name="link" value={formData.link} onChange={handleChange} className={inputClass} /></div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 border-2 border-[#a8c4dc] text-[#3d4a00] font-semibold rounded-xl hover:bg-[#d8e4f0] transition-colors">
                Cancel
              </button>
              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                className="flex-1 py-3 bg-gradient-to-r from-[#C26100] to-[#E07A1B] text-white font-semibold rounded-xl shadow-lg disabled:opacity-50">
                {loading ? 'Saving...' : mode === 'create' ? 'Create Resource' : 'Update Resource'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
