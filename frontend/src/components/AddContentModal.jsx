// frontend/src/components/AddContentModal.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { coursesAPI } from '../api/courses';
import colors, { tw } from '../theme/colors';

export default function AddContentModal({ courseId, onClose, onAdded }) {
  const [formData, setFormData] = useState({
    content_title: '',
    link: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.content_title.trim() || !formData.link.trim()) {
      setError('Title and link are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Add content to backend
      await coursesAPI.createContent(courseId, formData);

      // Refresh parent page data
      if (onAdded) {
        onAdded();
      }

      // Close modal after success
      if (onClose) {
        onClose();
      }

      // Optional: reset form
      setFormData({
        content_title: '',
        link: '',
        description: '',
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add content');
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
        transition={{ type: 'spring', duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: colors.headingDark }}>
              Add Content
            </h2>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <svg
                className="w-5 h-5"
                style={{ color: colors.muted }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: colors.errorBg, borderColor: colors.error }}>
              <p className="text-sm" style={{ color: colors.error }}>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.body }}>
                Content Title <span style={{ color: colors.error }}>*</span>
              </label>

              <input
                type="text"
                name="content_title"
                value={formData.content_title}
                onChange={handleChange}
                required
                placeholder="e.g., Introduction Video, Lesson 1 Slides"
                className={tw.goldInput}
              />
            </div>

            {/* Link */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.body }}>
                Link <span style={{ color: colors.error }}>*</span>
              </label>

              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                required
                placeholder="https://example.com/resource"
                className={tw.goldInput}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.body }}>
                Description{' '}
                <span style={{ color: colors.muted }}>(optional)</span>
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description of this content..."
                className={`${tw.goldInput} resize-none`}
              />
            </div>

            {/* Buttons */}
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
                style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})` }}
              >
                {loading ? 'Adding...' : 'Add Content'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
