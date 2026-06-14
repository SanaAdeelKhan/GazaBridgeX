// frontend/src/pages/CourseDetail.jsx
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { coursesAPI } from '../api/courses';
import EditCourseModal from '../components/EditCourseModal';
import AddContentModal from '../components/AddContentModal';
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

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, contentId: null });

  const fetchCourse = async () => {
    try {
      const response = await coursesAPI.getCourse(id);
      setCourse(response.data);
    } catch (err) { setError('Failed to load course'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCourse(); }, [id]);

  const handleDeleteContent = async () => {
    const contentId = deleteModal.contentId;
    try {
      await coursesAPI.deleteContent(contentId);
      fetchCourse();
      setDeleteModal({ isOpen: false, contentId: null });
    } catch (err) { alert(err.response?.data?.detail || 'Failed to delete content'); }
  };

  const canEdit = course && (course.user === user?.id || user?.is_staff || user?.is_superuser);
  const canAddContent = course && (course.user === user?.id || user?.is_staff || user?.is_superuser);
  const canManageContent = (content) => {
    if (!user) return false;
    return content.user === user.id || user.is_staff || user.is_superuser;
  };

  const getContentTitle = () => course.contents?.find(c => c.id === deleteModal.contentId)?.content_title || 'this content';

  if (loading) return (
    <div className={`pt-24 min-h-screen flex items-center justify-center ${tw.pageBg}`}>
      <div className="animate-spin w-12 h-12 border-4 border-[${colors.accentStart}] border-t-transparent rounded-full" />
    </div>
  );

  if (error || !course) return (
    <div className={`pt-24 min-h-screen flex items-center justify-center ${tw.pageBg}`}>
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-4 ${tw.titleText}`}>Course not found</h2>
        <Link to="/courses" className="text-[${colors.accentStart}] font-semibold">← Back to Courses</Link>
      </div>
    </div>
  );

  return (
    <div className={`pt-24 min-h-screen ${tw.pageBg}`}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/courses" className="inline-flex items-center gap-2 text-[${colors.accentStart}] font-semibold mb-6">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Courses
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Course Info Card */}
          <div className={`${tw.card} rounded-3xl shadow-xl p-8 mb-8`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  course.status === 'active' ? 'bg-[${colors.accentEnd}] text-white' :
                  course.status === 'closed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                  {course.status}
                </span>
                <h1 className={`text-3xl font-bold mt-4 ${tw.titleText}`}>{course.title}</h1>
              </div>
              {canEdit && (
                <button onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl font-semibold text-sm hover:bg-yellow-200 transition-colors">
                  Edit Course
                </button>
              )}
            </div>

            <p className={`mb-6 ${tw.bodyText}`}>{course.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Skill Level', value: course.skill_level },
                { label: 'Language', value: course.language },
                { label: 'Sessions/Week', value: course.sessions_per_week },
                { label: 'Session Duration', value: `${course.session_duration} min` },
                { label: 'Course Duration', value: `${course.course_duration_days} days` },
                { label: 'Category', value: course.category },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 bg-white/60 rounded-xl">
                  <div className="text-sm text-[${colors.body}]/70">{label}</div>
                  <div className={`font-semibold capitalize ${tw.titleText}`}>{value}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-[#a8bc6a]">
              <div className={`w-10 h-10 ${tw.accentBtn} rounded-full flex items-center justify-center font-bold`}>
                {course.user_full_name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className={`font-medium ${tw.titleText}`}>{course.user_full_name}</div>
                <div className="text-sm text-[${colors.body}]/70">{course.user_email}</div>
              </div>
            </div>
          </div>

          {/* Contents Section */}
          <div className={`${tw.card} rounded-3xl shadow-xl p-8`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${tw.titleText}`}>Course Contents ({course.contents?.length || 0})</h2>
              {canAddContent && (
                <button onClick={() => setShowAddContentModal(true)}
                  className={`px-4 py-2 ${tw.accentBtn} rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all`}>
                  Add Content
                </button>
              )}
            </div>

            {course.contents?.length === 0 ? (
              <p className={`text-center py-8 ${tw.bodyText}`}>No content added yet.</p>
            ) : (
              <div className="space-y-4">
                {course.contents?.map((content, index) => (
                  <div key={content.id} className="flex items-start gap-4 p-4 bg-white/60 rounded-xl">
                    <div className={`w-8 h-8 ${tw.accentBtn} rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${tw.titleText}`}>{content.content_title}</h3>
                      {content.description && <p className={`text-sm mt-1 ${tw.bodyText}`}>{content.description}</p>}
                      <a href={content.link} target="_blank" rel="noopener noreferrer"
                        className="text-[${colors.accentStart}] text-sm mt-2 inline-block hover:text-[${colors.accentEnd}]">
                        Open Resource →
                      </a>
                    </div>
                    {canManageContent(content) && (
                      <button onClick={() => setDeleteModal({ isOpen: true, contentId: content.id })}
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
        {showEditModal && <EditCourseModal course={course} onClose={() => setShowEditModal(false)} onUpdated={fetchCourse} />}
        {showAddContentModal && <AddContentModal courseId={course.id} onClose={() => setShowAddContentModal(false)} onAdded={fetchCourse} />}
      </AnimatePresence>
      <ConfirmationModal isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, contentId: null })}
        onConfirm={handleDeleteContent} title={t("common.delete")}
        message={`Are you sure you want to delete "${getContentTitle()}"? This action cannot be undone.`}
        type="delete" />
    </div>
  );
}
