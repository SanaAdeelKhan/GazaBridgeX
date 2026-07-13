// frontend/src/components/CreateResourceModal.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useResources } from '../context/ResourceContext';
import colors, { tw } from '../theme/colors';

const CATEGORIES = [
  { value: 'job', label: '💼 Job Resources' },
  { value: 'internship', label: '🎯 Internship Resources' },
  { value: 'scholarship', label: '🎓 Scholarship Resources' },
  { value: 'grant', label: '💰 Grant Resources' },
  { value: 'fellowship', label: '🌟 Fellowship Resources' },
  { value: 'funding', label: '💸 Funding Resources' },
  { value: 'volunteer', label: '🤝 Volunteer Resources' },
  { value: 'other', label: '📌 Other Resources' },
];

export default function CreateResourceModal({ onClose, onCreated }) {
  const { createResource } = useResources();
  const [formData, setFormData] = useState({
    title: '',
    category: 'job',
    description: '',
    link: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.link.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await createResource(formData);

    if (result.success) {
      onCreated();
    } else {
      setError(result.error);
    }

    setLoading(false);
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
            <h2 className="text-2xl font-bold" style={{ color: colors.headingDark }}>Add Resource</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
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
                Title <span style={{ color: colors.error }}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className={tw.goldInput}
                placeholder="Enter resource title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.body }}>
                Category <span style={{ color: colors.error }}>*</span>
              </label>
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
              <label className="block text-sm font-medium mb-2" style={{ color: colors.body }}>
                Description <span style={{ color: colors.error }}>*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className={`${tw.goldInput} resize-none`}
                placeholder="Describe the resource..."
              />
            </div>

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
                className={tw.goldInput}
                placeholder="https://example.com/resource"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 py-3 border-2 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#D1D5DB', color: colors.body }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="flex-1 py-3 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})` }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Add Resource'
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
