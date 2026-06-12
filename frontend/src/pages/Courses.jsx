// frontend/src/pages/Courses.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { coursesAPI } from '../api/courses';
import CourseCard from '../components/CourseCard';
import CreateCourseModal from '../components/CreateCourseModal';
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
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
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
          <h3 className="text-xl font-bold text-center text-[${colors.bannerStart}] mb-2">{title}</h3>
          <p className="text-[${colors.body}] text-center mb-6">{message}</p>
          <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
              className={`flex-1 px-4 py-2.5 font-medium rounded-xl transition-colors ${tw.cancelBtn} hover:bg-[#e8c5bf]`}>
              Cancel
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 text-white font-medium rounded-xl transition-colors ${
                type === 'delete' ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                  : tw.accentBtn}`}>
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
  { value: '', label: 'All Levels' }, { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' },
];
const LANGUAGES = [
  { value: '', label: 'All Languages' }, { value: 'en', label: 'English' },
  { value: 'ur', label: 'Urdu' }, { value: 'ar', label: 'Arabic' },
  { value: 'fr', label: 'French' }, { value: 'es', label: 'Spanish' },
  { value: 'de', label: 'German' }, { value: 'zh', label: 'Chinese' },
  { value: 'hi', label: 'Hindi' }, { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' }, { value: 'ja', label: 'Japanese' },
  { value: 'tr', label: 'Turkish' },
];
const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' }, { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }, { value: 'closed', label: 'Closed' },
];

export default function Courses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, courseId: null });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [filters, setFilters] = useState({ category: '', skill_level: '', language: '', status: '', search: '', ordering: '-created_at' });
  const [searchInput, setSearchInput] = useState('');

  const fetchCourses = useCallback(async (page = 1, append = false) => {
    setLoading(true); setError(null);
    try {
      const params = { page, page_size: 12, ordering: filters.ordering };
      if (filters.category) params.category = filters.category;
      if (filters.skill_level) params.skill_level = filters.skill_level;
      if (filters.language) params.language = filters.language;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      const response = await coursesAPI.getCourses(params);
      const data = response.data;
      if (append) setCourses(prev => [...prev, ...(data.results || data)]);
      else setCourses(data.results || data);
      setPagination({ page: data.page || page, totalPages: data.total_pages || 1, totalCount: data.count || (data.results || data).length });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load courses');
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchCourses(1, false); }, [fetchCourses]);

  const handleSearch = (e) => { e.preventDefault(); setFilters(prev => ({ ...prev, search: searchInput })); };

  const handleDelete = async () => {
    const id = deleteModal.courseId;
    try {
      await coursesAPI.deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      setPagination(prev => ({ ...prev, totalCount: prev.totalCount - 1 }));
      setDeleteModal({ isOpen: false, courseId: null });
    } catch (err) { alert(err.response?.data?.detail || 'Failed to delete course'); }
  };

  const handleLoadMore = () => {
    if (!loading && pagination.page < pagination.totalPages) fetchCourses(pagination.page + 1, true);
  };

  const canDeleteCourse = (course) => {
    if (!user) return false;
    return course.user === user.id || user.is_staff || user.is_superuser || user.roles?.some(r => r.name === 'manager');
  };

  const selectClass = 'px-4 py-2 rounded-xl border border-[#a8bc6a] text-sm font-medium text-[${colors.bannerStart}] bg-white focus:ring-2 focus:ring-[${colors.accentStart}] outline-none';

  return (
    <div className={`pt-24 min-h-screen ${tw.pageBg}`}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${tw.titleText}`}>Courses</h1>
              <p className={tw.bodyText}>Discover and enroll in courses created by the community</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className={`px-6 py-3 ${tw.accentBtn} font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Course
            </motion.button>
          </div>

          {/* Search & Filters */}
          <div className={tw.filterCard}>
            <form onSubmit={handleSearch} className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[${colors.body}]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search courses..."
                  className="w-full pl-12 pr-4 py-3 border border-[#a8bc6a] bg-white rounded-xl focus:ring-2 focus:ring-[${colors.accentStart}] focus:border-[${colors.accentStart}] transition-all outline-none text-[${colors.bannerStart}]" />
              </div>
              <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 ${tw.accentBtn} font-semibold rounded-xl shadow-md hover:shadow-lg transition-all`}>
                Search
              </motion.button>
              {filters.search && (
                <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { setSearchInput(''); setFilters(prev => ({ ...prev, search: '' })); }}
                  className="px-4 py-3 text-[${colors.bannerStart}] hover:text-[${colors.body}] font-medium rounded-xl border border-[#a8bc6a] transition-all">
                  Clear
                </motion.button>
              )}
            </form>
            <div className="flex flex-wrap gap-2">
              {[
                { val: 'category', opts: CATEGORIES },
                { val: 'skill_level', opts: SKILL_LEVELS },
                { val: 'language', opts: LANGUAGES },
                { val: 'status', opts: STATUS_OPTIONS },
              ].map(({ val, opts }) => (
                <select key={val} value={filters[val]}
                  onChange={(e) => setFilters(prev => ({ ...prev, [val]: e.target.value }))}
                  className={selectClass}>
                  {opts.map(o => <option key={o.value} value={o.value}>{o.icon ? `${o.icon} ` : ''}{o.label}</option>)}
                </select>
              ))}
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        {loading && courses.length === 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`${tw.card} rounded-2xl p-6 animate-pulse`}>
                <div className="h-4 bg-[#a8bc6a]/40 rounded w-3/4 mb-4" />
                <div className="h-4 bg-[#a8bc6a]/40 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="text-6xl mb-6">📚</div>
            <h3 className={`text-2xl font-bold mb-2 ${tw.titleText}`}>No courses found</h3>
            <p className={`mb-6 ${tw.bodyText}`}>
              {filters.search || filters.category || filters.status ? 'Try adjusting your search or filters.' : 'Be the first to create a course!'}
            </p>
            {!filters.search && !filters.category && !filters.status && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className={`px-6 py-3 ${tw.accentBtn} font-semibold rounded-xl shadow-lg`}>
                Create Your First Course
              </motion.button>
            )}
          </motion.div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {courses.map((course, index) => (
                  <CourseCard key={course.id} course={course} index={index}
                    canDelete={canDeleteCourse(course)}
                    onDelete={() => setDeleteModal({ isOpen: true, courseId: course.id })} />
                ))}
              </AnimatePresence>
            </div>
            {pagination.page < pagination.totalPages && (
              <div className="text-center mt-12">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleLoadMore} disabled={loading}
                  className={`px-8 py-3 ${tw.cancelBtn} border border-[#a8bc6a] font-medium rounded-xl hover:border-[${colors.accentStart}] hover:text-[${colors.accentStart}] transition-all shadow-sm disabled:opacity-50`}>
                  {loading ? 'Loading...' : 'Load More'}
                </motion.button>
              </div>
            )}
            <div className={`text-center mt-4 text-sm ${tw.bodyText}`}>
              Showing {courses.length} of {pagination.totalCount} courses
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {showCreateModal && <CreateCourseModal onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); fetchCourses(1, false); }} />}
      </AnimatePresence>
      <ConfirmationModal isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, courseId: null })}
        onConfirm={handleDelete} title="Delete Course"
        message="Are you sure you want to delete this course? This will also delete all contents and unlink from offers. This action cannot be undone."
        type="delete" />
    </div>
  );
}
