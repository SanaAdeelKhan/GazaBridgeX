// frontend/src/components/FeedbackButton.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { feedbackAPI } from '../api/feedback';
import colors from '../theme/colors';

export default function FeedbackButton({
    feedbackType,
    objectId,
    feedbackPath, // Route path for feedback detail page
    compact = false
}) {
    const [ratingSummary, setRatingSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRatingSummary();
    }, [feedbackType, objectId]);

    const fetchRatingSummary = async () => {
        try {
            const params = { feedback_type: feedbackType };
            if (objectId) {
                params.object_id = objectId;
            }
            const response = await feedbackAPI.getRatingSummary(params);
            setRatingSummary(response.data.rating_summary);
        } catch (err) {
            console.error('Error fetching rating summary:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-10 rounded-xl" style={{ backgroundColor: colors.badgeNeutral }} />
            </div>
        );
    }

    const averageRating = ratingSummary?.average_rating || 0;
    const totalFeedbacks = ratingSummary?.total_feedbacks || 0;

    return (
        <Link to={feedbackPath}>
            <motion.button
                whileHover={{ scale: compact ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 rounded-xl font-semibold transition-all ${compact ? 'px-3 py-2 text-xs' : 'px-5 py-2.5 text-sm'
                    }`}
                style={{
                    backgroundColor: colors.goldLight,
                    color: colors.headingDark,
                    border: `1px solid ${colors.gold}`,
                }}
            >
                {/* Star icon */}
                <motion.span
                    animate={{ rotate: averageRating > 0 ? [0, 10, -10, 0] : 0 }}
                    transition={{ duration: 0.5, repeat: averageRating > 0 ? Infinity : 0, repeatDelay: 3 }}
                    className="text-lg"
                >
                    ⭐
                </motion.span>

                {/* Rating info */}
                <span className="flex items-center gap-1">
                    <span className="font-bold">{averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}</span>
                    <span className="opacity-70">
                        ({totalFeedbacks} {totalFeedbacks === 1 ? 'review' : 'reviews'})
                    </span>
                </span>

                {/* Arrow */}
                <motion.span
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-xs"
                >
                    →
                </motion.span>
            </motion.button>
        </Link>
    );
}