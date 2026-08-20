// frontend/src/pages/LiveSectionFeedbackDetail.jsx
import { liveSectionsAPI } from '../api/liveSections';
import FeedbackDetailPage from './FeedbackDetailPage';

export default function LiveSectionFeedbackDetail() {
    return (
        <FeedbackDetailPage
            feedbackType="live_section"
            getItemAPI={(id) => liveSectionsAPI.getLiveSection(id)}
            getBackPath={() => '/live-sections'}
            getBackLabel={() => 'Back to Live Sections'}
            getItemIcon={(item) => {
                const icons = {
                    teaching_language: '🗣️',
                    tech_coding_ai: '🤖',
                    career_mentorship: '💼',
                    mental_health: '🧠',
                    creative_design: '🎨',
                    academic: '📖',
                    others: '📌',
                };
                return icons[item.category] || '📡';
            }}
            typeLabel="Live Section"
        />
    );
}