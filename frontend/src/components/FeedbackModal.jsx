// frontend/src/components/FeedbackModal.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { feedbackAPI } from '../api/feedback';
import { useAuth } from '../context/AuthContext';
import RatingStars from './RatingStars';
import colors from '../theme/colors';

export default function FeedbackModal({
    isOpen,
    onClose,
    feedbackType = 'platform',
    objectId = null,
    targetName = '',
    onSubmitted = null
}) {
    const { user, isAuthenticated } = useAuth();
    const [rating, setRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [existingFeedback, setExistingFeedback] = useState(null);
    const [ratingError, setRatingError] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setRating(0);
            setFeedbackText('');
            setIsPublic(true);
            setError(null);
            setSuccess(false);
            setExistingFeedback(null);
            setRatingError(false);

            // Check for existing feedback only if user is authenticated
            if (isAuthenticated && user) {
                fetchExistingFeedback();
            }
        }
    }, [isOpen, isAuthenticated, user]);

    const fetchExistingFeedback = async () => {
        try {
            const params = { feedback_type: feedbackType };
            if (feedbackType !== 'platform' && objectId) {
                params.object_id = objectId;
            }

            const response = await feedbackAPI.getFeedbacks(params);
            const userFeedback = response.data.feedbacks?.find(f => f.user === user?.id);

            if (userFeedback) {
                setExistingFeedback(userFeedback);
                setRating(userFeedback.rating);
                setFeedbackText(userFeedback.feedback_text);
                setIsPublic(userFeedback.is_public);
            }
        } catch (err) {
            console.error('Error fetching existing feedback:', err);
        }
    };

    const handleRatingChange = (value) => {
        setRating(value);
        setRatingError(false);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Frontend validation only for UX
        if (rating === 0) {
            setRatingError(true);
            setError('Please select a star rating before submitting your feedback.');
            return;
        }

        if (feedbackText.length < 10) {
            setError('Feedback must be at least 10 characters');
            return;
        }

        setLoading(true);
        setError(null);
        setRatingError(false);

        try {
            const data = {
                feedback_type: feedbackType,
                rating,
                feedback_text: feedbackText,
                is_public: isPublic,
            };

            if (feedbackType !== 'platform' && objectId) {
                data.object_id = objectId;
            }

            if (existingFeedback) {
                await feedbackAPI.updateFeedback(existingFeedback.id, data);
            } else {
                await feedbackAPI.createFeedback(data);
            }

            setSuccess(true);

            setTimeout(() => {
                onClose();
                if (onSubmitted) onSubmitted();
            }, 1500);

        } catch (err) {
            // Let backend handle authentication errors and show them
            const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Failed to submit feedback';

            // Handle different error cases from backend
            if (err.response?.status === 401) {
                setError('Authentication required. Please login to submit feedback.');
            } else if (err.response?.status === 403) {
                setError('You do not have permission to perform this action.');
            } else if (err.response?.data?.rating) {
                setError(`Rating error: ${err.response.data.rating.join(', ')}`);
            } else if (err.response?.data?.feedback_text) {
                setError(`Feedback error: ${err.response.data.feedback_text.join(', ')}`);
            } else if (err.response?.data?.feedback_type) {
                setError(`Type error: ${err.response.data.feedback_type.join(', ')}`);
            } else if (err.response?.data?.object_id) {
                setError(`Object error: ${err.response.data.object_id.join(', ')}`);
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        if (existingFeedback) return 'Update Your Feedback';
        if (feedbackType === 'platform') return 'Rate Your Experience';
        if (feedbackType === 'course') return `Rate Course: ${targetName}`;
        if (feedbackType === 'live_section') return `Rate Live Section: ${targetName}`;
        return 'Submit Feedback';
    };

    const getSubtitle = () => {
        if (feedbackType === 'platform') {
            return 'Help us improve GazaBridge for everyone';
        }
        return 'Share your experience with this content';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                        style={{ maxHeight: '90vh' }}
                    >
                        {/* Gold top accent - fixed at top */}
                        <div className="h-1.5 flex-shrink-0" style={{ background: `linear-gradient(90deg, ${colors.gold}, ${colors.goldHover})` }} />

                        {/* Scrollable content area */}
                        <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: 'calc(90vh - 6px)' }}>
                            {/* Success state */}
                            <AnimatePresence mode="wait">
                                {success ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="p-8 text-center"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                                            style={{ backgroundColor: colors.oliveLight }}
                                        >
                                            <svg className="w-10 h-10" style={{ color: colors.olive }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </motion.div>
                                        <h3 className="text-2xl font-bold mb-2" style={{ color: colors.headingDark }}>
                                            Thank You!
                                        </h3>
                                        <p className="text-sm" style={{ color: colors.muted }}>
                                            Your feedback has been submitted successfully.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="p-8"
                                    >
                                        {/* Close button */}
                                        <button
                                            onClick={onClose}
                                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10 bg-white shadow-md"
                                            style={{ color: colors.muted }}
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>

                                        <div className="text-center mb-8">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                                style={{ backgroundColor: colors.goldLight }}
                                            >
                                                {feedbackType === 'platform' ? (
                                                    <span className="text-3xl">🌟</span>
                                                ) : feedbackType === 'course' ? (
                                                    <span className="text-3xl">📚</span>
                                                ) : (
                                                    <span className="text-3xl">📡</span>
                                                )}
                                            </motion.div>
                                            <h2 className="text-2xl font-bold mb-1" style={{ color: colors.headingDark }}>
                                                {getTitle()}
                                            </h2>
                                            <p className="text-sm" style={{ color: colors.muted }}>
                                                {getSubtitle()}
                                            </p>
                                        </div>

                                        <form onSubmit={handleSubmit}>
                                            {/* Rating stars with error highlighting */}
                                            <div className="text-center mb-8">
                                                <div className={`flex justify-center mb-3 p-3 rounded-xl transition-all ${ratingError ? 'bg-red-50 border-2 border-red-200' : ''}`}>
                                                    <RatingStars
                                                        value={rating}
                                                        onChange={handleRatingChange}
                                                        size="xl"
                                                        showValue
                                                    />
                                                </div>
                                                {ratingError ? (
                                                    <motion.span
                                                        initial={{ opacity: 0, y: -5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-xs font-medium"
                                                        style={{ color: colors.error }}
                                                    >
                                                        Please select a rating
                                                    </motion.span>
                                                ) : (
                                                    <span className="text-xs" style={{ color: colors.muted }}>
                                                        {rating === 0 ? 'Tap to rate' : `${rating} out of 5 stars`}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Feedback text */}
                                            <div className="mb-6">
                                                <label className="block text-sm font-semibold mb-2" style={{ color: colors.label }}>
                                                    Your Feedback
                                                </label>
                                                <textarea
                                                    value={feedbackText}
                                                    onChange={(e) => setFeedbackText(e.target.value)}
                                                    rows={4}
                                                    placeholder="Share your experience, suggestions, or what you loved..."
                                                    className="w-full px-4 py-3 border rounded-xl outline-none transition-all resize-none"
                                                    style={{
                                                        borderColor: colors.inputBorder,
                                                        color: colors.body,
                                                        backgroundColor: colors.inputBg,
                                                    }}
                                                    onFocus={(e) => (e.target.style.borderColor = colors.inputBorderFocus)}
                                                    onBlur={(e) => (e.target.style.borderColor = colors.inputBorder)}
                                                    maxLength={1000}
                                                />
                                                <div className="text-right text-xs mt-1" style={{ color: colors.muted }}>
                                                    {feedbackText.length}/1000
                                                </div>
                                            </div>

                                            {/* Public toggle */}
                                            <div className="flex items-center gap-3 mb-6">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsPublic(!isPublic)}
                                                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${isPublic ? 'bg-green-500' : 'bg-gray-300'}`}
                                                >
                                                    <motion.div
                                                        animate={{ x: isPublic ? 24 : 0 }}
                                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"
                                                    />
                                                </button>
                                                <div>
                                                    <div className="text-sm font-medium" style={{ color: colors.body }}>
                                                        {isPublic ? 'Public Feedback' : 'Private Feedback'}
                                                    </div>
                                                    <div className="text-xs" style={{ color: colors.muted }}>
                                                        {isPublic ? 'Visible to everyone' : 'Only visible to you and admins'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Error message - shows backend errors */}
                                            {error && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mb-4 p-3 rounded-xl text-sm"
                                                    style={{ backgroundColor: colors.errorBg, color: colors.error }}
                                                >
                                                    {error}
                                                </motion.div>
                                            )}

                                            {/* Submit button */}
                                            <motion.button
                                                type="submit"
                                                disabled={loading}
                                                whileHover={{ scale: loading ? 1 : 1.02 }}
                                                whileTap={{ scale: loading ? 1 : 0.98 }}
                                                className="w-full py-3.5 text-white font-bold rounded-xl transition-all relative overflow-hidden"
                                                style={{
                                                    background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})`,
                                                    opacity: loading ? 0.7 : 1,
                                                }}
                                            >
                                                {loading ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <motion.span
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                                        />
                                                        Submitting...
                                                    </span>
                                                ) : existingFeedback ? (
                                                    'Update Feedback'
                                                ) : (
                                                    'Submit Feedback'
                                                )}
                                            </motion.button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}