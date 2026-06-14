// frontend/src/pages/Profile.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';

const inputClass = "w-full px-4 py-3 border border-[#a8c4dc] bg-white rounded-xl focus:ring-2 focus:ring-[#C26100] focus:border-[#C26100] transition-all outline-none text-[#3d4a00]";
const labelClass = "block text-sm font-medium text-[#3d4a00] mb-2";

export default function Profile() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { profile, loading, updateProfile, changePassword } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({ new_password: '', confirm_password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleEdit = () => {
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      country: profile?.country || '',
      gender: profile?.gender || '',
      linkedin: profile?.linkedin || '',
      whatsapp_number: profile?.whatsapp_number || '',
      languages: profile?.languages || [],
    });
    setEditMode(true);
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setMessage('');
    const result = await updateProfile(formData);
    if (result.success) { setMessage(t('profile.profileUpdated')); setEditMode(false); }
    else setError(result.error);
    setSaving(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) { setError(t('auth.passwordMismatch')); return; }
    setSaving(true); setError(''); setMessage('');
    const result = await changePassword(passwordData);
    if (result.success) { setMessage(t('auth.passwordChanged')); setPasswordData({ new_password: '', confirm_password: '' }); }
    else setError(result.error);
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 mx-auto mb-4 rounded-full"
          style={{ background: 'linear-gradient(135deg, #C26100, #E07A1B)' }} />
        <p className="text-[#5a6600]">{t('common.loading')}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">

        {/* Header banner */}
        <div className="rounded-3xl p-8 mb-6 flex items-center gap-6"
          style={{ background: 'linear-gradient(to right, #1e3a5f, #2d5a8e)' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #C26100, #E07A1B)' }}>
            {profile?.first_name?.[0] || user?.email?.[0] || 'U'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{profile?.first_name} {profile?.last_name}</h1>
            <p className="text-white/80">{profile?.email}</p>
            <div className="flex gap-2 mt-2">
              {profile?.roles?.map(role => (
                <span key={role.id}
                  className="px-3 py-1 bg-gradient-to-r from-[#C26100] to-[#E07A1B] text-white rounded-full text-xs font-semibold">
                  {role.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['profile', 'password'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === tab
                  ? 'bg-[#1e3a5f] text-white shadow-md'
                  : 'bg-[#d8e4f0] text-[#3d4a00] hover:bg-[#c4d8ec]'
              }`}>
              {tab === 'profile' ? t('profile.title') : t('auth.resetPassword')}
            </button>
          ))}
        </div>

        {/* Messages */}
        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-[#d8e4f0] border border-[#a8c4dc] rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-[#C26100]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-[#3d4a00]">{message}</p>
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#d8e4f0] border border-[#a8c4dc] rounded-3xl shadow-lg p-8">
            {editMode ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div><label className={labelClass}>{t('profile.firstName')}</label>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} /></div>
                  <div><label className={labelClass}>{t('profile.lastName')}</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} /></div>
                </div>
                <div><label className={labelClass}>{t('profile.location')}</label>
                  <input type="text" name="country" value={formData.country} onChange={handleChange} className={inputClass} /></div>
                <div><label className={labelClass}>LinkedIn</label>
                  <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className={inputClass} /></div>
                <div><label className={labelClass}>WhatsApp</label>
                  <input type="tel" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} className={inputClass} /></div>
                <div className="flex gap-4">
                  <motion.button type="submit" disabled={saving}
                    whileHover={{ scale: saving ? 1 : 1.02 }} whileTap={{ scale: saving ? 1 : 0.98 }}
                    className="px-8 py-3 bg-gradient-to-r from-[#C26100] to-[#E07A1B] text-white font-semibold rounded-xl shadow-lg disabled:opacity-50">
                    {saving ? t('common.loading') : t('profile.saveChanges')}
                  </motion.button>
                  <button type="button" onClick={() => setEditMode(false)}
                    className="px-8 py-3 border-2 border-[#a8c4dc] text-[#3d4a00] font-semibold rounded-xl hover:bg-[#c4d8ec] transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {[
                    { label: t('profile.firstName'), value: profile?.first_name },
                    { label: t('profile.lastName'), value: profile?.last_name },
                    { label: t('profile.location'), value: profile?.country },
                    { label: t('profile.role'), value: profile?.gender },
                    { label: 'WhatsApp', value: profile?.whatsapp_number || t('common.noResults') },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <label className="text-xs font-medium text-[#5a6600] uppercase tracking-wide">{label}</label>
                      <p className="text-[#1e3a5f] font-medium mt-0.5 capitalize">{value}</p>
                    </div>
                  ))}
                  {profile?.linkedin && (
                    <div>
                      <label className="text-xs font-medium text-[#5a6600] uppercase tracking-wide">LinkedIn</label>
                      <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"
                        className="text-[#C26100] hover:text-[#E07A1B] font-medium mt-0.5 block transition-colors">
                        View Profile →
                      </a>
                    </div>
                  )}
                </div>
                <button onClick={handleEdit}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#C26100] to-[#E07A1B] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                  Edit Profile
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#d8e4f0] border border-[#a8c4dc] rounded-3xl shadow-lg p-8">
            <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
              <div><label className={labelClass}>{t('auth.newPassword')}</label>
                <input type="password" value={passwordData.new_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                  required minLength={8} className={inputClass} placeholder={t('auth.passwordHint')} /></div>
              <div><label className={labelClass}>{t('auth.confirmPassword')}</label>
                <input type="password" value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                  required className={inputClass} placeholder={t('auth.repeatPassword')} /></div>
              <motion.button type="submit" disabled={saving}
                whileHover={{ scale: saving ? 1 : 1.02 }} whileTap={{ scale: saving ? 1 : 0.98 }}
                className="px-8 py-3 bg-gradient-to-r from-[#C26100] to-[#E07A1B] text-white font-semibold rounded-xl shadow-lg disabled:opacity-50">
                {saving ? t('common.loading') : t('auth.resetPassword')}
              </motion.button>
            </form>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
