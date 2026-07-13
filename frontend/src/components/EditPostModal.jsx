// frontend/src/components/EditPostModal.jsx - New component for editing posts
import { useState } from 'react';
import { motion } from 'framer-motion';
import { postsAPI } from '../api/posts';
import colors, { tw } from '../theme/colors';

const CATEGORIES = [
  { value: 'learn_language', label: '🗣️ Learn a Language' },
  { value: 'learn_tech_ai', label: '🤖 Learn Tech / AI' },
  { value: 'career_cv_help', label: '💼 Career / CV Help' },
  { value: 'mental_health_support', label: '🧠 Mental Health Support' },
  { value: 'academic_tuition', label: '📖 Academic Tuition' },
  { value: 'creative_skill', label: '🎨 Creative Skill' },
  { value: 'others', label: '📌 Others' },
];

const AVAILABILITY = [
  { value: '1_2_hours', label: '1-2 hours/week' },
  { value: '3_5_hours', label: '3-5 hours/week' },
  { value: '6_8_hours', label: '6-8 hours/week' },
  { value: '8_10_hours', label: '8-10 hours/week' },
  { value: '10_plus_hours', label: '10+ hours/week' },
];

export default function EditPostModal({ post, type, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    [type === 'offer' ? 'offer_name' : 'request_name']: type === 'offer' ? post.offer_name : post.request_name,
    category: post.category,
    description: post.description,
    availability: post.availability || '3_5_hours',
    status: post.status,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      if (type === 'offer') {
        const response = await postsAPI.updateOffer(post.id, formData);
        onUpdated(response.data);
      } else {
        const response = await postsAPI.updateRequest(post.id, formData);
        onUpdated(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: colors.headingDark }}>
              Edit {type === 'offer' ? 'Offer' : 'Request'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <svg className="w-5 h-5" style={{ color: colors.muted }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: colors.errorBg, borderColor: colors.error }}>
              <p className="text-sm" style={{ color: colors.error }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.body }}>
                {type === 'offer' ? 'Offer Name' : 'Request Name'}
              </label>
              <input
                type="text"
                name={type === 'offer' ? 'offer_name' : 'request_name'}
                value={formData[type === 'offer' ? 'offer_name' : 'request_name']}
                onChange={handleChange}
                className={tw.goldInput}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.body }}>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={tw.goldInput}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.body }}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`${tw.goldInput} resize-none`}
              />
            </div>

            {type === 'offer' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.body }}>Weekly Availability</label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className={tw.goldInput}
                >
                  {AVAILABILITY.map(a => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.body }}>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={tw.goldInput}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border-2 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#D1D5DB', color: colors.body }}
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="flex-1 py-3 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50"
                style={{ background: type === 'offer'
                  ? `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})`
                  : `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})` }}
              >
                {loading ? 'Saving...' : 'Update'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
