// frontend/src/components/LinkCourseModal.jsx - UPDATED
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { coursesAPI } from '../api/courses';
import { postsAPI } from '../api/posts';
import { useAuth } from '../context/AuthContext';
import colors, { tw } from '../theme/colors';

// Beautiful Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'delete' }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
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

export default function LinkCourseModal({ offerId, onClose, onLinked }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [linkedCourseIds, setLinkedCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [unlinkModal, setUnlinkModal] = useState({ isOpen: false, courseId: null, courseTitle: '' });

  const isAdmin = user?.is_staff || user?.is_superuser;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = { page_size: 100 };

        if (!isAdmin) {
          params.user_id = user.id;
        }

        const coursesResponse = await coursesAPI.getCourses(params);
        setCourses(coursesResponse.data.results || coursesResponse.data);

        const linkedResponse = await postsAPI.getOfferLinkedCourses(offerId);
        setLinkedCourseIds(linkedResponse.data.map(c => c.id));
      } catch (err) {
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [offerId, user, isAdmin]);

  const handleLink = async (courseId) => {
    setLinking(true);
    setError('');

    try {
      await coursesAPI.linkCourseToOffer(courseId, offerId);
      setLinkedCourseIds(prev => [...prev, courseId]);
      onLinked();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to link course');
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async () => {
    const courseId = unlinkModal.courseId;
    setLinking(true);
    setError('');

    try {
      await coursesAPI.unlinkCourseFromOffer(courseId, offerId);
      setLinkedCourseIds(prev => prev.filter(id => id !== courseId));
      onLinked();
      setUnlinkModal({ isOpen: false, courseId: null, courseTitle: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to unlink course');
    } finally {
      setLinking(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    !searchInput ||
    course.title.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: colors.headingDark }}>Link Courses to Offer</h2>
                <p className="text-sm mt-1" style={{ color: colors.muted }}>
                  {isAdmin
                    ? 'Showing all courses (Admin access)'
                    : 'Showing your courses only. Create more courses to link them.'}
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <svg className="w-5 h-5" style={{ color: colors.muted }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: colors.muted }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={isAdmin ? "Search all courses..." : "Search your courses..."}
                className={`pl-12 ${tw.goldInput}`}
              />
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-4 rounded-xl border" style={{ backgroundColor: colors.errorBg, borderColor: colors.error }}>
              <p className="text-sm" style={{ color: colors.error }}>{error}</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📚</div>
                <p style={{ color: colors.muted }}>
                  {searchInput ? 'No courses match your search.' : 'No courses available to link.'}
                </p>
                {!isAdmin && (
                  <p className="text-sm mt-2" style={{ color: colors.muted }}>
                    You can only link your own courses. Create courses first, then link them to your offers.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCourses.map(course => {
                  const isLinked = linkedCourseIds.includes(course.id);
                  const isOwner = course.user === user?.id;
                  const canLink = isAdmin || isOwner;

                  return (
                    <div
                      key={course.id}
                      className={`p-4 rounded-xl border-2 transition-all ${!canLink ? 'opacity-60' : ''}`}
                      style={isLinked
                        ? { borderColor: colors.olive, backgroundColor: colors.oliveLight }
                        : { borderColor: '#E5E7EB', backgroundColor: 'white' }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold" style={{ color: colors.headingDark }}>{course.title}</h3>
                            {!isOwner && isAdmin && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: colors.primaryLight, color: colors.primary }}>
                                by {course.user_full_name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs capitalize" style={{ color: colors.muted }}>{course.skill_level}</span>
                            <span className="text-xs" style={{ color: colors.muted }}>•</span>
                            <span className="text-xs uppercase" style={{ color: colors.muted }}>{course.language}</span>
                            <span className="text-xs" style={{ color: colors.muted }}>•</span>
                            <span className="text-xs" style={{ color: colors.muted }}>{course.sessions_per_week}x/week</span>
                          </div>
                          <p className="text-sm mt-2 line-clamp-2" style={{ color: colors.body }}>{course.description}</p>
                        </div>

                        {canLink && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => isLinked
                              ? setUnlinkModal({ isOpen: true, courseId: course.id, courseTitle: course.title })
                              : handleLink(course.id)
                            }
                            disabled={linking}
                            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0 disabled:opacity-50"
                            style={isLinked
                              ? { backgroundColor: colors.errorBg, color: colors.error }
                              : { background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})`, color: 'white' }}
                          >
                            {isLinked ? 'Unlink' : 'Link Course'}
                          </motion.button>
                        )}
                      </div>

                      {isLinked && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: colors.olive }}>
                          <svg className="w-4 h-4" style={{ color: colors.olive }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-xs font-medium" style={{ color: colors.headingDark }}>Linked to this offer</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Unlink Confirmation Modal */}
      <ConfirmationModal
        isOpen={unlinkModal.isOpen}
        onClose={() => setUnlinkModal({ isOpen: false, courseId: null, courseTitle: '' })}
        onConfirm={handleUnlink}
        title="Unlink Course"
        message={`Are you sure you want to unlink "${unlinkModal.courseTitle}" from this offer? This action can be undone by linking again.`}
        type="delete"
      />
    </>
  );
}
