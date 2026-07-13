// frontend/src/components/EditLiveSectionModal.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { liveSectionsAPI } from '../api/liveSections';
import colors, { tw } from '../theme/colors';

export default function EditLiveSectionModal({ liveSection, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    title: liveSection.title || '', category: liveSection.category || 'tech_coding_ai',
    description: liveSection.description || '', skill_level: liveSection.skill_level || 'beginner',
    language: liveSection.language || 'en', sessions_per_week: liveSection.sessions_per_week || 2,
    session_duration: liveSection.session_duration || 60, duration_days: liveSection.duration_days || 30,
    ending_date: liveSection.ending_date ? new Date(liveSection.ending_date).toISOString().slice(0, 16) : '',
    status: liveSection.status || 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || '' : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim()) { setError('Title is required.'); return; }
    setLoading(true); setError('');
    try {
      const response = await liveSectionsAPI.updateLiveSection(liveSection.id, {
        ...formData, ending_date: formData.ending_date ? new Date(formData.ending_date).toISOString() : undefined
      });
      onUpdated(response.data);
    } catch (err) { setError(err.response?.data?.detail || 'Failed to update'); }
    finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: colors.headingDark }}>Edit Live Section</h2>
          {error && <div className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: colors.errorBg, borderColor: colors.error }}><p className="text-sm" style={{ color: colors.error }}>{error}</p></div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label className="block text-sm font-medium mb-2" style={{ color: colors.body }}>Title</label><input type="text" name="title" value={formData.title} onChange={handleChange} className={tw.goldInput} /></div>
            <div><label className="block text-sm font-medium mb-2" style={{ color: colors.body }}>Description</label><textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={`${tw.goldInput} resize-none`} /></div>
            <div><label className="block text-sm font-medium mb-2" style={{ color: colors.body }}>Ending Date</label><input type="datetime-local" name="ending_date" value={formData.ending_date} onChange={handleChange} className={tw.goldInput} /></div>
            <div><label className="block text-sm font-medium mb-2" style={{ color: colors.body }}>Status</label><select name="status" value={formData.status} onChange={handleChange} className={tw.goldInput}><option value="active">Active</option><option value="inactive">Inactive</option><option value="closed">Closed</option></select></div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 py-3 border-2 font-semibold rounded-xl hover:bg-gray-50" style={{ borderColor: '#D1D5DB', color: colors.body }}>Cancel</button>
              <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }} className="flex-1 py-3 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50" style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})` }}>{loading ? 'Saving...' : 'Update'}</motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
