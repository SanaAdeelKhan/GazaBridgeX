// frontend/src/pages/DashboardFeedback.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import RatingSummaryCard from '../components/RatingSummaryCard';
import FeedbackList from '../components/FeedbackList';
import FeedbackModal from '../components/FeedbackModal';
import colors from '../theme/colors';

export default function DashboardFeedback() {
    const { user, isAuthenticated } = useAuth();
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleFeedbackSubmitted = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: colors.primaryLight }}>
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: colors.headingDark }}>
                                Platform Feedback
                            </h1>
                            <p className="text-lg" style={{ color: colors.muted }}>
                                Share your experience and help us improve GazaBridge
                            </p>
                        </div>

                        {/* Share feedback button - only for authenticated users */}
                        {isAuthenticated && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowFeedbackModal(true)}
                                className="px-6 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:brightness-95 transition-all flex items-center gap-2"
                                style={{ backgroundColor: colors.gold }}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Share Your Feedback
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                {/* Content grid */}
                <div className="grid lg:grid-cols-[350px_1fr] gap-8">
                    {/* Left sidebar - rating summary */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <div className="lg:sticky lg:top-24 space-y-6">
                            <RatingSummaryCard
                                key={refreshKey}
                                feedbackType="platform"
                                onRate={() => setShowFeedbackModal(true)}
                            />

                            {/* Quick info card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="rounded-2xl p-6 shadow-sm"
                                style={{ backgroundColor: colors.card }}
                            >
                                <h3 className="font-bold mb-3" style={{ color: colors.headingDark }}>
                                    Why Your Feedback Matters
                                </h3>
                                <ul className="space-y-2">
                                    {[
                                        'Help us improve the platform',
                                        'Shape future features',
                                        'Support the Gaza community',
                                        'Make learning better for everyone',
                                    ].map((item, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + index * 0.1 }}
                                            className="flex items-center gap-2 text-sm"
                                            style={{ color: colors.body }}
                                        >
                                            <span className="text-xs" style={{ color: colors.gold }}>✦</span>
                                            {item}
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Right - feedback list with filters */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.headingDark }}>
                                All Feedback
                            </h2>
                            <p className="text-sm" style={{ color: colors.muted }}>
                                View and manage your feedback
                            </p>
                        </div>

                        <FeedbackList
                            key={refreshKey}
                            feedbackType="platform"
                            page_size={10}
                            showFilters={true}
                        />
                    </motion.div>
                </div>
            </div>

            {/* Feedback modal for posting */}
            <FeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                feedbackType="platform"
                onSubmitted={handleFeedbackSubmitted}
            />
        </div>
    );
}