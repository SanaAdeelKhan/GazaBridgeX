// frontend/src/api/matches.js
import api from './axios';

export const matchesAPI = {
  getMatches: (params = {}) => api.get('/matches/', { params }),
  recheckMatches: () => api.post('/matches/recheck/'),
};
