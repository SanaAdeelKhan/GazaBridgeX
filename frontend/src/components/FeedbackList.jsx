// frontend/src/components/FeedbackList.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { feedbackAPI } from '../api/feedback';
import { useAuth } from '../context/AuthContext';
import RatingStars from './RatingStars';
import colors from '../theme/colors';

export default function FeedbackList({
    feedbackType = 'platform',
    objectId = null,
    rating = null,
    limit = null,
    showPagination = true,
    compact = false,
    showFilters = false
}) {
    const { user } = useAuth();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });
    const [sort, setSort] = useState('newest');
    const [activeRating, setActiveRating] = useState(rating || 'all');
    const [replyText, setReplyText] = useState({});
    const [showReplyInput, setShowReplyInput] = useState({});
    const [replyLoading, setReplyLoading] = useState(false);

    const fetchFeedbacks = async (page = 1) => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                feedback_type: feedbackType,
                sort,
                page,
                page_size: limit || 10,
            };

            if (feedbackType !== 'platform' && objectId) {
                params.object_id = objectId;
            }

            if (activeRating !== 'all') {
                params.rating = parseInt(activeRating);
            }

            const response = await feedbackAPI.getFeedbacks(params);
            const data = response.data;

            setFeedbacks(data.feedbacks || []);
            setPagination({
                page: data.pagination?.page || page,
                totalPages: data.pagination?.total_pages || 1,
                totalCount: data.pagination?.total_count || 0,
            });
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load feedback');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks(1);
    }, [feedbackType, objectId, sort, activeRating]);

    const handleReply = async (feedbackId) => {
        const text = replyText[feedbackId]?.trim();
        if (!text) return;

        setReplyLoading(true);

        try {
            await feedbackAPI.createReply(feedbackId, { reply_text: text });
            setReplyText({ ...replyText, [feedbackId]: '' });
            setShowReplyInput({ ...showReplyInput, [feedbackId]: false });
            fetchFeedbacks(pagination.page);
        } catch (err) {
            console.error('Error creating reply:', err);
            alert(err.response?.data?.detail || 'Failed to send reply');
        } finally {
            setReplyLoading(false);
        }
    };

    // Check if user can reply to feedback
    const canReply = (feedback) => {
        if (!user) return false;

        // For platform feedback, only superuser can reply
        if (feedback.feedback_type === 'platform') {
            return user.is_superuser ||
                user.roles?.includes('superuser') ||
                user.roles?.some(r => r === 'superuser' || r?.name === 'superuser');
        }

        // For course/live_section, check if user is owner
        return true; // Backend will enforce ownership
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchFeedbacks(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-2xl p-6 animate-pulse" style={{ backgroundColor: colors.card }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full" style={{ backgroundColor: colors.badgeNeutral }} />
                            <div className="flex-1">
                                <div className="h-4 rounded w-1/3 mb-2" style={{ backgroundColor: colors.badgeNeutral }} />
                                <div className="h-3 rounded w-1/4" style={{ backgroundColor: colors.badgeNeutral }} />
                            </div>
                        </div>
                        <div className="h-3 rounded mb-2" style={{ backgroundColor: colors.badgeNeutral }} />
                        <div className="h-3 rounded w-2/3" style={{ backgroundColor: colors.badgeNeutral }} />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-4xl mb-3">😕</div>
                <p className="text-sm" style={{ color: colors.muted }}>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters - same style as platform feedback */}
            {showFilters && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-4 border shadow-sm"
                    style={{ backgroundColor: colors.card, borderColor: colors.cardBorder }}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Sort controls */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.muted }}>
                                Sort:
                            </span>
                            <div className="flex gap-1.5">
                                <button
                                    onClick={() => setSort('newest')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${sort === 'newest' ? 'text-white shadow-md' : ''
                                        }`}
                                    style={sort === 'newest' ? { backgroundColor: colors.gold } : {
                                        backgroundColor: colors.pageBg,
                                        color: colors.muted,
                                    }}
                                >
                                    Newest
                                </button>
                                <button
                                    onClick={() => setSort('rating')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${sort === 'rating' ? 'text-white shadow-md' : ''
                                        }`}
                                    style={sort === 'rating' ? { backgroundColor: colors.gold } : {
                                        backgroundColor: colors.pageBg,
                                        color: colors.muted,
                                    }}
                                >
                                    Highest Rated
                                </button>
                            </div>
                        </div>

                        {/* Rating filter */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.muted }}>
                                Filter:
                            </span>
                            <div className="flex gap-1.5">
                                {[
                                    { value: 'all', label: 'All' },
                                    { value: '5', label: '5★' },
                                    { value: '4', label: '4★' },
                                    { value: '3', label: '3★' },
                                    { value: '2', label: '2★' },
                                    { value: '1', label: '1★' },
                                ].map((option) => (
                                    <motion.button
                                        key={option.value}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setActiveRating(option.value)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeRating === option.value ? 'text-white shadow-md' : ''
                                            }`}
                                        style={activeRating === option.value ? {
                                            backgroundColor: colors.gold,
                                        } : {
                                            backgroundColor: colors.pageBg,
                                            color: colors.muted,
                                        }}
                                    >
                                        {option.label}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Feedback count */}
            <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: colors.muted }}>
                    {pagination.totalCount} feedback{pagination.totalCount !== 1 ? 's' : ''} found
                    {activeRating !== 'all' && ` • Filtered by ${activeRating}★`}
                    {sort === 'rating' && ' • Sorted by rating'}
                </span>
            </div>

            {/* Feedback cards */}
            {feedbacks.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        className="text-6xl mb-4"
                    >
                        💬
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: colors.headingDark }}>
                        No Feedback Found
                    </h3>
                    <p className="text-sm" style={{ color: colors.muted }}>
                        {activeRating !== 'all'
                            ? `No ${activeRating}★ feedback available. Try a different filter.`
                            : 'Be the first to share your experience!'}
                    </p>
                </motion.div>
            ) : (
                <AnimatePresence mode="popLayout">
                    {feedbacks.map((feedback, index) => (
                        <motion.div
                            key={feedback.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05, duration: 0.4 }}
                            className={`rounded-2xl border shadow-sm hover:shadow-md transition-shadow ${compact ? 'p-5' : 'p-6'
                                }`}
                            style={{ backgroundColor: colors.card, borderColor: colors.cardBorder }}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                        style={{ backgroundColor: colors.primary }}
                                    >
                                        {feedback.user_name?.split(' ').map(n => n[0]).join('') || 'A'}
                                    </motion.div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm" style={{ color: colors.headingDark }}>
                                                {feedback.user_name}
                                            </span>
                                            {feedback.user_role && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{
                                                    backgroundColor: colors.goldLight,
                                                    color: colors.gold
                                                }}>
                                                    {feedback.user_role}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs mt-0.5" style={{ color: colors.muted }}>
                                            {new Date(feedback.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <RatingStars value={feedback.rating} size="sm" readOnly />
                                    <span className="text-sm font-bold" style={{ color: colors.gold }}>
                                        {feedback.rating}.0
                                    </span>
                                </div>
                            </div>

                            {/* Feedback text */}
                            <p className="text-sm leading-relaxed mb-4" style={{ color: colors.body }}>
                                {feedback.feedback_text}
                            </p>

                            {/* Replies */}
                            {feedback.replies?.length > 0 && (
                                <div className="space-y-3 mb-4">
                                    {feedback.replies.map((reply) => (
                                        <motion.div
                                            key={reply.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="ml-8 p-4 rounded-xl"
                                            style={{ backgroundColor: colors.pageBg }}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: colors.olive }}>
                                                    {reply.replied_by_name?.split(' ').map(n => n[0]).join('') || 'R'}
                                                </div>
                                                <span className="text-xs font-semibold" style={{ color: colors.headingDark }}>
                                                    {reply.replied_by_name}
                                                </span>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{
                                                    backgroundColor: colors.oliveLight,
                                                    color: colors.olive
                                                }}>
                                                    Reply
                                                </span>
                                            </div>
                                            <p className="text-xs" style={{ color: colors.body }}>
                                                {reply.reply_text}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Reply button */}
                            {canReply(feedback) && (
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setShowReplyInput({ ...showReplyInput, [feedback.id]: !showReplyInput[feedback.id] })}
                                        className="text-xs font-medium flex items-center gap-1.5 hover:underline transition-all"
                                        style={{ color: colors.gold }}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                        </svg>
                                        {showReplyInput[feedback.id] ? 'Cancel Reply' : 'Reply'}
                                    </button>
                                </div>
                            )}

                            {/* Reply input */}
                            <AnimatePresence>
                                {showReplyInput[feedback.id] && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-4 ml-8">
                                            <textarea
                                                value={replyText[feedback.id] || ''}
                                                onChange={(e) => setReplyText({ ...replyText, [feedback.id]: e.target.value })}
                                                rows={3}
                                                placeholder="Write your reply..."
                                                className="w-full px-3 py-2 border rounded-xl text-sm outline-none transition-all resize-none"
                                                style={{
                                                    borderColor: colors.inputBorder,
                                                    color: colors.body,
                                                }}
                                                onFocus={(e) => (e.target.style.borderColor = colors.inputBorderFocus)}
                                                onBlur={(e) => (e.target.style.borderColor = colors.inputBorder)}
                                            />
                                            <div className="flex justify-end mt-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleReply(feedback.id)}
                                                    disabled={replyLoading}
                                                    className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg"
                                                    style={{ backgroundColor: colors.gold }}
                                                >
                                                    {replyLoading ? 'Sending...' : 'Send Reply'}
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>
            )}

            {/* Pagination */}
            {showPagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                        style={{ backgroundColor: colors.pageBg, color: colors.body }}
                    >
                        Previous
                    </button>
                    <span className="text-sm" style={{ color: colors.muted }}>
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                        style={{ backgroundColor: colors.pageBg, color: colors.body }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}