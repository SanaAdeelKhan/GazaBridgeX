// frontend/src/pages/admin/AdminCourses.jsx
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { coursesAPI } from '../../api/courses';
import { useAuth } from '../../context/AuthContext';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'delete' }) => {
  if (!isOpen) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full bg-[#FDF8F5] rounded-2xl shadow-2xl overflow-hidden border border-[#e8b4b0]">
        <div className={`h-1 ${type === 'delete' ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-[#C26100] to-[#E07A1B]'}`} />
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className={`w-16 h-16 rounded-full flex items-center justify-center ${type === 'delete' ? 'bg-red-100' : 'bg-[#F2DDD8]'}`}>
              {type === 'delete' ? (
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-[#C26100]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
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
              className={`flex-1 px-4 py-2.5 text-white font-medium rounded-xl transition-colors ${type === 'delete' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-[#C26100] to-[#E07A1B]'}`}>
              Confirm
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'teaching_language', label: 'Teaching / Language' },
  { value: 'tech_coding_ai', label: 'Tech / Coding / AI' },
  { value: 'career_mentorship', label: 'Career / Mentorship' },
  { value: 'mental_health', label: 'Mental Health' },
  { value: 'creative_design', label: 'Creative / Design' },
  { value: 'academic', label: 'Academic' },
  { value: 'others', label: 'Others' },
];

const SKILL_LEVELS = [
  { value: '', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'closed', label: 'Closed' },
];

const statusStyle = (status) => {
  if (status === 'active') return 'bg-[#C26100] text-white';
  if (status === 'inactive') return 'bg-[#d8e4f0] text-[#3d4a00]';
  return 'bg-red-100 text-red-700';
};

export default function AdminCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, courseId: null });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ category: '', skill_level: '', status: '', search: '' });

  const fetchCourses = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, page_size: 20 };
      if (filters.category) params.category = filters.category;
      if (filters.skill_level) params.skill_level = filters.skill_level;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      const response = await coursesAPI.getCourses(params);
      const data = response.data;
      setCourses(data.results || data);
      setPagination({ page: data.page || page, totalPages: data.total_pages || 1 });
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchCourses(1); }, [fetchCourses]);

  const handleDelete = async () => {
    const id = deleteModal.courseId;
    try {
      await coursesAPI.deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      setDeleteModal({ isOpen: false, courseId: null });
    } catch (err) { alert(err.response?.data?.detail || 'Failed to delete course'); }
  };

  const handleStatusChange = async (course, newStatus) => {
    try {
      const response = await coursesAPI.updateCourse(course.id, { status: newStatus });
      setCourses(prev => prev.map(c => c.id === course.id ? response.data : c));
    } catch (err) { alert(err.response?.data?.detail || 'Failed to update status'); }
  };

  const handleUpdate = async (updatedData) => {
    try {
      const response = await coursesAPI.updateCourse(editingCourse.id, updatedData);
      setCourses(prev => prev.map(c => c.id === editingCourse.id ? response.data : c));
      setEditingCourse(null);
    } catch (err) { alert(err.response?.data?.detail || 'Failed to update course'); }
  };

  const isAdmin = user?.is_staff || user?.is_superuser;

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
            <h1 className="text-3xl font-bold text-[#3d4a00]">Manage Courses</h1>
            <p className="text-[#5a6600] mt-1">View and manage all courses</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {[
            { value: filters.category, key: 'category', options: CATEGORIES },
            { value: filters.skill_level, key: 'skill_level', options: SKILL_LEVELS },
            { value: filters.status, key: 'status', options: STATUS_OPTIONS },
          ].map(({ value, key, options }) => (
            <select key={key} value={value}
              onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
              className="px-4 py-2 rounded-xl border border-[#a8c4dc] bg-[#d8e4f0] text-[#3d4a00] text-sm focus:ring-2 focus:ring-[#C26100] outline-none">
              {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
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
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1e3a5f]">Level</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1e3a5f]">Language</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1e3a5f]">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1e3a5f]">Date</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-[#1e3a5f]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-[#a8c4dc]">
                    {[48, 24, 32, 20, 16, 16, 20, 16].map((w, j) => (
                      <td key={j} className="px-6 py-4"><div className={`h-4 bg-[#a8c4dc] rounded w-${w} animate-pulse ${j === 7 ? 'ml-auto' : ''}`} /></td>
                    ))}
                  </tr>
                ))
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-[#5a6600]">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-10 h-10 text-[#a8c4dc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="font-medium">No courses found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                courses.map(course => (
                  <motion.tr key={course.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="border-b border-[#a8c4dc] hover:bg-[#c4d8ec] transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/courses/${course.id}`} className="font-medium text-[#1e3a5f] hover:text-[#C26100] transition-colors">
                        {course.title}
                      </Link>
                      <div className="text-xs text-[#5a6600] mt-0.5">
                        {course.sessions_per_week}x/week · {course.session_duration}min · {course.course_duration_days}d
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-[#F2DDD8] text-[#C26100] border border-[#e8b4b0] rounded-full text-xs font-semibold">
                        {course.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5a6600]">{course.user_full_name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-[#d8e4f0] text-[#1e3a5f] border border-[#a8c4dc] rounded-full text-xs font-semibold capitalize">
                        {course.skill_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5a6600] uppercase">{course.language}</td>
                    <td className="px-6 py-4">
                      <select value={course.status} onChange={(e) => handleStatusChange(course, e.target.value)}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold border-0 outline-none cursor-pointer ${statusStyle(course.status)}`}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5a6600]">{new Date(course.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/courses/${course.id}`} className="p-2 text-[#1e3a5f] hover:bg-[#F2DDD8] rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        {isAdmin && (
                          <motion.button whileHover={{ scale: 1.1 }} onClick={() => setEditingCourse(course)}
                            className="p-2 text-[#C26100] hover:bg-[#F2DDD8] rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </motion.button>
                        )}
                        <motion.button whileHover={{ scale: 1.1 }}
                          onClick={() => setDeleteModal({ isOpen: true, courseId: course.id })}
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
              <button onClick={() => fetchCourses(pagination.page - 1)} disabled={pagination.page === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[#F2DDD8] text-[#3d4a00] disabled:opacity-40 hover:bg-[#e8c8c0] transition-colors">
                Previous
              </button>
              <button onClick={() => fetchCourses(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-[#C26100] to-[#E07A1B] text-white disabled:opacity-40 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editingCourse && (
          <EditCourseAdminModal course={editingCourse} onClose={() => setEditingCourse(null)} onSubmit={handleUpdate} />
        )}
      </AnimatePresence>

      <ConfirmationModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, courseId: null })}
        onConfirm={handleDelete} title={t("courses.deleteCourse")}
        message={t("courses.deleteMsg")}
        type="delete" />
    </div>
  );
}

function EditCourseAdminModal({ course, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: course.title || '',
    category: course.category || 'tech_coding_ai',
    description: course.description || '',
    skill_level: course.skill_level || 'beginner',
    language: course.language || 'en',
    sessions_per_week: course.sessions_per_week || 2,
    session_duration: course.session_duration || 60,
    course_duration_days: course.course_duration_days || 30,
    status: course.status || 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || '' : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try { await onSubmit(formData); }
    catch (err) { setError(err.response?.data?.detail || 'Update failed'); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-3 border border-[#a8c4dc] bg-white rounded-xl focus:ring-2 focus:ring-[#C26100] focus:border-[#C26100] transition-all outline-none text-[#3d4a00]";
  const labelClass = "block text-sm font-medium text-[#3d4a00] mb-2";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-[#FDF8F5] rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#e8b4b0]"
        onClick={(e) => e.stopPropagation()}>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-[#3d4a00] mb-6">Edit Course</h2>
          {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"><p className="text-sm text-red-700">{error}</p></div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label className={labelClass}>Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                {CATEGORIES.filter(c => c.value).map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
              </select></div>
            <div><label className={labelClass}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Skill Level</label>
                <select name="skill_level" value={formData.skill_level} onChange={handleChange} className={inputClass}>
                  {SKILL_LEVELS.filter(s => s.value).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select></div>
              <div><label className={labelClass}>Language</label>
                <input type="text" name="language" value={formData.language} onChange={handleChange} className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className={labelClass}>Sessions/Week</label>
                <input type="number" name="sessions_per_week" value={formData.sessions_per_week} onChange={handleChange} min="1" className={inputClass} /></div>
              <div><label className={labelClass}>Duration (min)</label>
                <input type="number" name="session_duration" value={formData.session_duration} onChange={handleChange} min="1" className={inputClass} /></div>
              <div><label className={labelClass}>Course Days</label>
                <input type="number" name="course_duration_days" value={formData.course_duration_days} onChange={handleChange} min="1" className={inputClass} /></div>
            </div>
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
                {loading ? 'Saving...' : 'Update Course'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
