// frontend/src/pages/CourseFeedbackDetail.jsx
import { coursesAPI } from '../api/courses';
import FeedbackDetailPage from './FeedbackDetailPage';

export default function CourseFeedbackDetail() {
    return (
        <FeedbackDetailPage
            feedbackType="course"
            getItemAPI={(id) => coursesAPI.getCourse(id)}
            getBackPath={() => '/courses'}
            getBackLabel={() => 'Back to Courses'}
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
                return icons[item.category] || '📚';
            }}
            typeLabel="Course"
        />
    );
}