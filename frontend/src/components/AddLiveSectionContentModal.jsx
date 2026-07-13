// frontend/src/components/AddLiveSectionContentModal.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { liveSectionsAPI } from '../api/liveSections';
import colors, { tw } from '../theme/colors';

export default function AddLiveSectionContentModal({
  lsId,
  onClose,
  onAdded,
}) {
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

    if (!formData.content_title?.trim() || !formData.link?.trim()) {
      setError('Title and link are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Save content
      await liveSectionsAPI.createContent(lsId, formData);

      // Refresh parent data
      if (onAdded) {
        await onAdded();
      }

      // Close modal
      if (onClose) {
        onClose();
      }

      // Reset form (optional)
      setFormData({
        content_title: '',
        link: '',
        description: '',
      });
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Failed to add content'
      );
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
              style={{ color: colors.muted }}
            >
              ✕
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
                Title *
              </label>
              <input
                type="text"
                name="content_title"
                value={formData.content_title}
                onChange={handleChange}
                className={tw.goldInput}
              />
            </div>

            {/* Link */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.body }}>
                Link *
              </label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                className={tw.goldInput}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.body }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`${tw.goldInput} resize-none`}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border-2 font-semibold rounded-xl hover:bg-gray-50"
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
                {loading ? 'Adding...' : 'Add'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
