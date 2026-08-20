// frontend/src/api/feedback.js
import api from './axios';

export const feedbackAPI = {
    // Feedback CRUD
    getFeedbacks: (params = {}) => api.get('/feedback/', { params }),
    getFeedback: (feedbackId) => api.get(`/feedback/${feedbackId}/`),
    createFeedback: (data) => api.post('/feedback/', data),
    updateFeedback: (feedbackId, data) => api.patch(`/feedback/${feedbackId}/`, data),
    deleteFeedback: (feedbackId) => api.delete(`/feedback/${feedbackId}/`),

    // Reply CRUD
    getReplies: (feedbackId) => api.get(`/feedback/${feedbackId}/replies/`),
    createReply: (feedbackId, data) => api.post(`/feedback/${feedbackId}/replies/`, data),
    updateReply: (feedbackId, replyId, data) => api.patch(`/feedback/${feedbackId}/replies/${replyId}/`, data),
    deleteReply: (feedbackId, replyId) => api.delete(`/feedback/${feedbackId}/replies/${replyId}/`),

    // Rating summaries
    getRatingSummary: (params = {}) => api.get('/feedback/ratings/', { params }),
};