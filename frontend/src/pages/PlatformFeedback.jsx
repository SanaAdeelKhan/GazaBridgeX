// frontend/src/pages/PlatformFeedback.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RatingSummaryCard from '../components/RatingSummaryCard';
import FeedbackList from '../components/FeedbackList';
import colors from '../theme/colors';

export default function PlatformFeedback() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [refreshKey, setRefreshKey] = useState(0);

    // Redirect authenticated users to dashboard feedback
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard/feedback', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleRateClick = () => {
        navigate('/login', { state: { from: '/feedback' } });
    };

    return (
        <div className="pt-24 min-h-screen" style={{ backgroundColor: colors.primaryLight }}>
            {/* Hero section */}
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative py-20 overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${colors.bannerStart}, ${colors.bannerEnd})`
                }}
            >
                {/* Decorative elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: colors.goldGlow }} />
                    <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: colors.oliveGlow }} />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                        <span className="text-2xl">🌟</span>
                        <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: colors.navText }}>
                            Community Feedback
                        </span>
                    </motion.div>

                    <h1
                        className="text-5xl md:text-6xl font-bold mb-4 text-white"
                        style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                    >
                        Platform <em style={{ color: colors.gold }}>Feedback</em>
                    </h1>

                    <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: colors.navText }}>
                        See what our community is saying about GazaBridge. Your feedback helps us
                        improve and grow together.
                    </p>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRateClick}
                        className="px-8 py-3.5 text-white font-bold rounded-full shadow-lg flex items-center gap-2 mx-auto"
                        style={{ backgroundColor: colors.gold }}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Login to Rate
                    </motion.button>
                </div>
            </motion.div>

            {/* Content section - read only */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-[350px_1fr] gap-8">
                    {/* Left sidebar - rating summary */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="space-y-6"
                    >
                        <div className="lg:sticky lg:top-24">
                            <RatingSummaryCard
                                key={refreshKey}
                                feedbackType="platform"
                            />

                            {/* Stats cards */}
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <motion.div
                                    whileHover={{ y: -4 }}
                                    className="rounded-2xl p-4 text-center shadow-sm"
                                    style={{ backgroundColor: colors.card }}
                                >
                                    <div className="text-3xl mb-2">💡</div>
                                    <div className="text-2xl font-bold" style={{ color: colors.headingDark }}>
                                        500+
                                    </div>
                                    <div className="text-xs" style={{ color: colors.muted }}>
                                        Suggestions Received
                                    </div>
                                </motion.div>
                                <motion.div
                                    whileHover={{ y: -4 }}
                                    className="rounded-2xl p-4 text-center shadow-sm"
                                    style={{ backgroundColor: colors.card }}
                                >
                                    <div className="text-3xl mb-2">🚀</div>
                                    <div className="text-2xl font-bold" style={{ color: colors.headingDark }}>
                                        85%
                                    </div>
                                    <div className="text-xs" style={{ color: colors.muted }}>
                                        Implemented
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right - feedback list */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.headingDark }}>
                                Community Feedback
                            </h2>
                            <p className="text-sm" style={{ color: colors.muted }}>
                                See what others are saying about GazaBridge
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
        </div>
    );
}