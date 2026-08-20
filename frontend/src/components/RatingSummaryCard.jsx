// frontend/src/components/RatingSummaryCard.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { feedbackAPI } from '../api/feedback';
import colors from '../theme/colors';

export default function RatingSummaryCard({
    feedbackType = 'platform',
    objectId = null,
    onRate = null
}) {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummary();
    }, [feedbackType, objectId]);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const params = { feedback_type: feedbackType };
            if (feedbackType !== 'platform' && objectId) {
                params.object_id = objectId;
            }

            const response = await feedbackAPI.getRatingSummary(params);
            setSummary(response.data.rating_summary);
        } catch (err) {
            console.error('Error fetching rating summary:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="rounded-2xl p-6 animate-pulse" style={{ backgroundColor: colors.card }}>
                <div className="h-8 rounded w-1/3 mb-4" style={{ backgroundColor: colors.badgeNeutral }} />
                <div className="h-3 rounded mb-2" style={{ backgroundColor: colors.badgeNeutral }} />
                <div className="h-3 rounded w-2/3" style={{ backgroundColor: colors.badgeNeutral }} />
            </div>
        );
    }

    if (!summary) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-6 text-center"
                style={{ backgroundColor: colors.card }}
            >
                <div className="text-4xl mb-3">⭐</div>
                <h3 className="font-bold mb-2" style={{ color: colors.headingDark }}>
                    No Ratings Yet
                </h3>
                <p className="text-sm mb-4" style={{ color: colors.muted }}>
                    Be the first to rate and help others!
                </p>
                {onRate && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onRate}
                        className="px-6 py-2 text-sm font-semibold text-white rounded-xl"
                        style={{ backgroundColor: colors.gold }}
                    >
                        Rate Now
                    </motion.button>
                )}
            </motion.div>
        );
    }

    const distribution = summary.distribution || {};
    const total = summary.total_feedbacks || 0;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl p-6 shadow-sm"
            style={{ backgroundColor: colors.card }}
        >
            {/* Average rating */}
            <div className="text-center mb-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className="text-5xl font-bold mb-2"
                    style={{ color: colors.headingDark }}
                >
                    {summary.average_rating}
                </motion.div>
                <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <motion.span
                            key={star}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + star * 0.1 }}
                            className="text-2xl"
                            style={{
                                color: star <= Math.round(summary.average_rating) ? colors.gold : colors.badgeNeutral
                            }}
                        >
                            ★
                        </motion.span>
                    ))}
                </div>
                <p className="text-sm" style={{ color: colors.muted }}>
                    Based on {total} {total === 1 ? 'review' : 'reviews'}
                </p>
            </div>

            {/* Distribution bars */}
            <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                    const count = distribution[star] || 0;
                    const percentage = total > 0 ? (count / total) * 100 : 0;

                    return (
                        <div key={star} className="flex items-center gap-3">
                            <span className="text-xs font-medium w-8" style={{ color: colors.muted }}>
                                {star}★
                            </span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ delay: 0.4 + (5 - star) * 0.1, duration: 0.8, ease: 'easeOut' }}
                                    className="h-full rounded-full"
                                    style={{
                                        background: `linear-gradient(90deg, ${colors.gold}, ${colors.goldHover})`
                                    }}
                                />
                            </div>
                            <span className="text-xs w-8 text-right" style={{ color: colors.muted }}>
                                {count}
                            </span>
                        </div>
                    );
                })}
            </div>

            {onRate && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onRate}
                    className="w-full mt-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all"
                    style={{ backgroundColor: colors.gold }}
                >
                    Rate Your Experience
                </motion.button>
            )}
        </motion.div>
    );
}