// frontend/src/pages/CourseDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { coursesAPI } from '../api/courses';
import EditCourseModal from '../components/EditCourseModal';
import AddContentModal from '../components/AddContentModal';
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

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, contentId: null });

  const fetchCourse = async () => {
    try {
      const response = await coursesAPI.getCourse(id);
      setCourse(response.data);
    } catch (err) {
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const handleDeleteContent = async () => {
    const contentId = deleteModal.contentId;
    try {
      await coursesAPI.deleteContent(contentId);
      fetchCourse();
      setDeleteModal({ isOpen: false, contentId: null });
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete content');
    }
  };

  const canEdit = course && (course.user === user?.id || user?.is_staff || user?.is_superuser);
  const canAddContent = course && (course.user === user?.id || user?.is_staff || user?.is_superuser);
  const canManageContent = (content) => {
    if (!user) return false;
    if (content.user === user.id) return true;
    if (user.is_staff || user.is_superuser) return true;
    return false;
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-t-transparent rounded-full" style={{ borderColor: colors.gold, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: colors.headingDark }}>Course not found</h2>
          <Link to="/courses" className="font-semibold" style={{ color: colors.gold }}>← Back to Courses</Link>
        </div>
      </div>
    );
  }

  // Find content title for the delete modal message
  const getContentTitle = () => {
    const content = course.contents?.find(c => c.id === deleteModal.contentId);
    return content?.content_title || 'this content';
  };

  return (
    <div className="pt-24 min-h-screen" style={{ backgroundColor: colors.primaryLight }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/courses" className="inline-flex items-center gap-2 font-semibold mb-6" style={{ color: colors.gold }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Courses
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold border"
                  style={course.status === 'active'
                    ? { backgroundColor: colors.oliveLight, color: colors.headingDark, borderColor: colors.olive }
                    : { backgroundColor: '#F3F4F6', color: colors.muted, borderColor: '#D1D5DB' }}
                >
                  {course.status}
                </span>
                <h1 className="text-3xl font-bold mt-4" style={{ color: colors.headingDark }}>{course.title}</h1>
              </div>
              {canEdit && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 rounded-xl font-semibold text-sm border"
                  style={{ backgroundColor: colors.goldLight, color: colors.headingDark, borderColor: colors.gold }}
                >
                  Edit Course
                </button>
              )}
            </div>

            <p className="mb-6" style={{ color: colors.body }}>{course.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm" style={{ color: colors.muted }}>Skill Level</div>
                <div className="font-semibold capitalize" style={{ color: colors.headingDark }}>{course.skill_level}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm" style={{ color: colors.muted }}>Language</div>
                <div className="font-semibold" style={{ color: colors.headingDark }}>{course.language}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm" style={{ color: colors.muted }}>Sessions/Week</div>
                <div className="font-semibold" style={{ color: colors.headingDark }}>{course.sessions_per_week}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm" style={{ color: colors.muted }}>Session Duration</div>
                <div className="font-semibold" style={{ color: colors.headingDark }}>{course.session_duration} min</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm" style={{ color: colors.muted }}>Course Duration</div>
                <div className="font-semibold" style={{ color: colors.headingDark }}>{course.course_duration_days} days</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm" style={{ color: colors.muted }}>Category</div>
                <div className="font-semibold" style={{ color: colors.headingDark }}>{course.category}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: colors.primary }}>
                {course.user_full_name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="font-medium" style={{ color: colors.headingDark }}>{course.user_full_name}</div>
                <div className="text-sm" style={{ color: colors.muted }}>{course.user_email}</div>
              </div>
            </div>
          </div>

          {/* Contents Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: colors.headingDark }}>
                Course Contents ({course.contents?.length || 0})
              </h2>
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

            {course.contents?.length === 0 ? (
              <p className="text-center py-8" style={{ color: colors.muted }}>No content added yet.</p>
            ) : (
              <div className="space-y-4">
                {course.contents?.map((content, index) => (
                  <div key={content.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{ backgroundColor: colors.goldLight, color: colors.headingDark }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: colors.headingDark }}>{content.content_title}</h3>
                      {content.description && <p className="text-sm mt-1" style={{ color: colors.body }}>{content.description}</p>}
                      <a href={content.link} target="_blank" rel="noopener noreferrer" className="text-sm mt-2 inline-block" style={{ color: colors.gold }}>
                        Open Resource →
                      </a>
                    </div>
                    {canManageContent(content) && (
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, contentId: content.id })}
                        style={{ color: colors.error }}
                      >
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
        {showEditModal && <EditCourseModal course={course} onClose={() => setShowEditModal(false)} onUpdated={fetchCourse} />}
        {showAddContentModal && <AddContentModal courseId={course.id} onClose={() => setShowAddContentModal(false)} onAdded={fetchCourse} />}
      </AnimatePresence>

      {/* Delete Content Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, contentId: null })}
        onConfirm={handleDeleteContent}
        title="Delete Content"
        message={`Are you sure you want to delete "${getContentTitle()}"? This action cannot be undone.`}
        type="delete"
      />
    </div>
  );
}
