// frontend/src/pages/FeedbackDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { feedbackAPI } from '../api/feedback';
import RatingSummaryCard from '../components/RatingSummaryCard';
import FeedbackList from '../components/FeedbackList';
import FeedbackModal from '../components/FeedbackModal';
import RatingStars from '../components/RatingStars';
import colors from '../theme/colors';

// Reusable Feedback Detail Page for Courses and Live Sections
export default function FeedbackDetailPage({
    feedbackType, // 'course' or 'live_section'
    getItemAPI, // API function to fetch the item
    getBackPath, // Function to get back navigation path
    getBackLabel, // Function to get back button label
    getItemIcon, // Function to get item icon
    typeLabel, // Display label like 'Course' or 'Live Section'
}) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        fetchItem();
    }, [id]);

    const fetchItem = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getItemAPI(id);
            setItem(response.data);
        } catch (err) {
            setError(`Failed to load ${typeLabel.toLowerCase()}`);
            console.error(`Error fetching ${typeLabel.toLowerCase()}:`, err);
        } finally {
            setLoading(false);
        }
    };

    const handleFeedbackSubmitted = () => {
        setRefreshKey(prev => prev + 1);
    };

    // Loading state
    if (loading) {
        return (
            <div className="pt-24 min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="w-16 h-16 border-4 border-t-transparent rounded-full mx-auto mb-4"
                        style={{ borderColor: colors.gold, borderTopColor: 'transparent' }}
                    />
                    <p className="text-sm" style={{ color: colors.muted }}>
                        Loading feedback...
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !item) {
        return (
            <div className="pt-24 min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="text-6xl mb-4"
                    >
                        😕
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: colors.headingDark }}>
                        {error || `${typeLabel} not found`}
                    </h2>
                    <Link
                        to={getBackPath ? getBackPath() : '/'}
                        className="inline-flex items-center gap-2 font-semibold mt-4"
                        style={{ color: colors.gold }}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {getBackLabel ? getBackLabel() : 'Go Back'}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 min-h-screen" style={{ backgroundColor: colors.primaryLight }}>
            {/* Hero section with item info */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative py-12 overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${colors.bannerStart}, ${colors.bannerEnd})`
                }}
            >
                {/* Decorative background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: colors.goldGlow }} />
                    <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: colors.oliveGlow }} />
                </div>

                <div className="relative max-w-7xl mx-auto px-6">
                    {/* Back button */}
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        onClick={() => navigate(getBackPath ? getBackPath() : '/')}
                        className="inline-flex items-center gap-2 mb-6 text-sm font-semibold transition-all hover:opacity-80"
                        style={{ color: colors.navText }}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {getBackLabel ? getBackLabel() : 'Back to List'}
                    </motion.button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        {/* Item info */}
                        <div className="flex-1">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center gap-3 mb-4"
                            >
                                <span className="text-4xl">{getItemIcon ? getItemIcon(item) : '📚'}</span>
                                <div>
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-semibold"
                                        style={{
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                            color: colors.navText,
                                            border: '1px solid rgba(255,255,255,0.2)'
                                        }}
                                    >
                                        {typeLabel} Feedback
                                    </span>
                                </div>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-4xl md:text-5xl font-bold mb-3 text-white"
                                style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                            >
                                {item.title}
                            </motion.h1>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center gap-4 flex-wrap"
                            >
                                {/* Creator info */}
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                        style={{ backgroundColor: colors.gold }}
                                    >
                                        {item.user_full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                                    </div>
                                    <span className="text-sm" style={{ color: colors.navText }}>
                                        {item.user_full_name}
                                    </span>
                                </div>

                                {/* Category */}
                                {item.category && (
                                    <span
                                        className="px-3 py-1 rounded-full text-xs"
                                        style={{
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                            color: colors.navText
                                        }}
                                    >
                                        {item.category.replace(/_/g, ' ')}
                                    </span>
                                )}
                            </motion.div>
                        </div>

                        {/* CTA button */}
                        {isAuthenticated && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowFeedbackModal(true)}
                                className="px-8 py-3.5 text-white font-bold rounded-full shadow-lg flex items-center gap-2 flex-shrink-0"
                                style={{ backgroundColor: colors.gold }}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Rate This {typeLabel}
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-[350px_1fr] gap-8">
                    {/* Left sidebar - rating summary */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <div className="lg:sticky lg:top-24 space-y-6">
                            {/* Rating summary */}
                            <RatingSummaryCard
                                key={refreshKey}
                                feedbackType={feedbackType}
                                objectId={id}
                                onRate={() => setShowFeedbackModal(true)}
                            />

                            {/* Quick stats */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="rounded-2xl p-6 shadow-sm"
                                style={{ backgroundColor: colors.card }}
                            >
                                <h3 className="font-bold mb-4" style={{ color: colors.headingDark }}>
                                    {typeLabel} Information
                                </h3>
                                <div className="space-y-3">
                                    {item.skill_level && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs" style={{ color: colors.muted }}>Skill Level</span>
                                            <span className="text-xs font-semibold capitalize" style={{ color: colors.body }}>
                                                {item.skill_level}
                                            </span>
                                        </div>
                                    )}
                                    {item.language && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs" style={{ color: colors.muted }}>Language</span>
                                            <span className="text-xs font-semibold" style={{ color: colors.body }}>
                                                {item.language?.toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    {item.sessions_per_week && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs" style={{ color: colors.muted }}>Sessions/Week</span>
                                            <span className="text-xs font-semibold" style={{ color: colors.body }}>
                                                {item.sessions_per_week}
                                            </span>
                                        </div>
                                    )}
                                    {item.session_duration && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs" style={{ color: colors.muted }}>Duration</span>
                                            <span className="text-xs font-semibold" style={{ color: colors.body }}>
                                                {item.session_duration} min
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Right - feedback list with filters */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        {/* Header */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.headingDark }}>
                                Student Feedback
                            </h2>
                            <p className="text-sm" style={{ color: colors.muted }}>
                                Share your experience to help others
                            </p>
                        </div>

                        {/* Feedback list with consistent filters */}
                        <FeedbackList
                            key={refreshKey}
                            feedbackType={feedbackType}
                            objectId={id}
                            page_size={10}
                            showFilters={true}
                            itemOwnerId={item?.user}
                        />
                    </motion.div>
                </div>
            </div>

            {/* Feedback modal */}
            <FeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                feedbackType={feedbackType}
                objectId={parseInt(id)}
                targetName={item.title}
                onSubmitted={handleFeedbackSubmitted}
            />
        </div>
    );
}