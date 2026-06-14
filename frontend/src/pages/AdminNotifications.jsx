// frontend/src/pages/AdminNotifications.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { notificationsAPI } from '../api/notifications';

const TARGET_GROUPS = [
  { value: 'volunteers', label: '🧑‍🏫 Volunteers' },
  { value: 'seekers', label: '🎓 Seekers' },
  { value: 'managers', label: '👔 Managers' },
  { value: 'admins', label: '🛡️ Admins' },
  { value: 'all_users', label: '👥 All Users' },
];

const NOTIFICATION_TYPES = [
  { value: 'normal', label: '💬 Normal' },
  { value: 'alert', label: '⚠️ Alert' },
  { value: 'urgent', label: '🚨 Urgent' },
  { value: 'announcement', label: '📢 Announcement' },
];

export default function AdminNotifications() {
  const [formData, setFormData] = useState({
    content: '',
    type: 'normal',
    target_groups: [],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
          ? [...prev[name], value]
          : prev[name].filter(item => item !== value),
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.target_groups.length === 0) {
      setError('Please select at least one target group.');
      return;
    }
    if (!formData.content.trim()) {
      setError('Please enter notification content.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await notificationsAPI.sendAdminNotification(formData);
      setMessage(response.data.detail);
      setFormData({ content: '', type: 'normal', target_groups: [] });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen" style={{ backgroundColor: '#F2DDD8' }}>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#3d4a00' }}>Send Notification</h1>
          <p className="mb-8" style={{ color: '#5a6600' }}>Send bulk notifications to user groups</p>

          <div className="rounded-3xl shadow-xl p-8 border" style={{ backgroundColor: '#d8e4f0', borderColor: '#a8c4dc' }}>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl border"
                style={{ backgroundColor: '#d1fae5', borderColor: '#6ee7b7' }}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" style={{ color: '#065f46' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm font-medium" style={{ color: '#065f46' }}>{message}</p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl border"
                style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5' }}
              >
                <p className="text-sm" style={{ color: '#991b1b' }}>{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Target Groups */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#1e3a5f' }}>
                  Target Groups <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {TARGET_GROUPS.map(group => (
                    <label
                      key={group.value}
                      className="flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all"
                      style={
                        formData.target_groups.includes(group.value)
                          ? { borderColor: '#C26100', backgroundColor: '#fde8d0' }
                          : { borderColor: '#a8c4dc', backgroundColor: '#eaf1f8' }
                      }
                    >
                      <input
                        type="checkbox"
                        name="target_groups"
                        value={group.value}
                        checked={formData.target_groups.includes(group.value)}
                        onChange={handleChange}
                        className="h-4 w-4 rounded"
                        style={{ accentColor: '#C26100' }}
                      />
                      <span className="ml-3 text-sm font-medium" style={{ color: '#1e3a5f' }}>{group.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notification Type */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#1e3a5f' }}>
                  Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {NOTIFICATION_TYPES.map(type => (
                    <label
                      key={type.value}
                      className="flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all"
                      style={
                        formData.type === type.value
                          ? { borderColor: '#C26100', backgroundColor: '#fde8d0' }
                          : { borderColor: '#a8c4dc', backgroundColor: '#eaf1f8' }
                      }
                    >
                      <input
                        type="radio"
                        name="type"
                        value={type.value}
                        checked={formData.type === type.value}
                        onChange={handleChange}
                        className="h-4 w-4"
                        style={{ accentColor: '#C26100' }}
                      />
                      <span className="ml-3 text-sm font-medium" style={{ color: '#1e3a5f' }}>{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1e3a5f' }}>
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  rows={4}
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Enter notification message..."
                  className="w-full px-4 py-3 rounded-xl outline-none resize-none border-2 transition-all"
                  style={{ backgroundColor: '#eaf1f8', borderColor: '#a8c4dc', color: '#1e3a5f' }}
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-3.5 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(to right, #C26100, #E07A1B)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Notifications'
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
