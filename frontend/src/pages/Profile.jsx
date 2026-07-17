// frontend/src/pages/Profile.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

const LANGUAGE_LABELS = {
  en: 'English', ur: 'Urdu', ar: 'Arabic', fr: 'French', de: 'German',
  es: 'Spanish', tr: 'Turkish', hi: 'Hindi', zh: 'Chinese', ru: 'Russian',
  pt: 'Portuguese', ja: 'Japanese',
};
const FORMAT_LABELS = { '1_on_1': '1-on-1', group: 'Group', either: 'Either' };
const PLATFORM_LABELS = {
  zoom: 'Zoom', google_meet: 'Google Meet', whatsapp_call: 'WhatsApp call',
  in_app_chat_only: 'In-app chat only', no_preference: 'No preference',
};
const COMMITMENT_LABELS = { one_time: 'One-time sessions', ongoing_weekly: 'Ongoing (weekly)', flexible: 'Flexible' };
const URGENCY_LABELS = { asap: 'ASAP', within_a_month: 'Within a month', flexible: 'Flexible' };

const inputStyle = {
  borderColor: colors.inputBorder,
  color: colors.inputText,
  backgroundColor: colors.inputBg,
};

export default function Profile() {
  const { user } = useAuth();
  const { profile, loading, updateProfile, changePassword } = useUser();
  const isVolunteer = profile?.roles?.some(r => r.name === 'volunteer');
  const isSeeker = profile?.roles?.some(r => r.name === 'seeker');
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: '',
  });
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
      preferred_language: profile?.preferred_language || 'en',
      volunteer_teaching_format: profile?.volunteer_teaching_format || 'either',
      volunteer_preferred_platform: profile?.volunteer_preferred_platform || 'no_preference',
      volunteer_commitment: profile?.volunteer_commitment || 'flexible',
      seeker_preferred_format: profile?.seeker_preferred_format || 'either',
      seeker_preferred_platform: profile?.seeker_preferred_platform || 'no_preference',
      seeker_urgency: profile?.seeker_urgency || 'flexible',
    });
    setEditMode(true);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const result = await updateProfile(formData);

    if (result.success) {
      setMessage('Profile updated successfully!');
      setEditMode(false);
    } else {
      setError(result.error);
    }

    setSaving(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    const result = await changePassword(passwordData);

    if (result.success) {
      setMessage('Password changed successfully!');
      setPasswordData({ new_password: '', confirm_password: '' });
    } else {
      setError(result.error);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 mx-auto mb-4 rounded-full"
            style={{ backgroundColor: colors.gold }}
          />
          <p style={{ color: colors.muted }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen" style={{ backgroundColor: colors.pageBg }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-6 mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg"
              style={{ backgroundColor: colors.primary }}
            >
              {profile?.first_name?.[0] || user?.email?.[0] || 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: colors.headingDark }}>
                {profile?.first_name} {profile?.last_name}
              </h1>
              <p style={{ color: colors.muted }}>{profile?.email}</p>
              <div className="flex gap-2 mt-2">
                {profile?.roles?.map(role => (
                  <span
                    key={role.id}
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: colors.primaryLight, color: colors.primary }}
                  >
                    {role.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b" style={{ borderColor: colors.divider }}>
          {['profile', 'password'].map(tab => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="pb-3 px-4 font-medium text-sm transition-all border-b-2"
                style={isActive
                  ? { color: colors.gold, borderColor: colors.gold }
                  : { color: colors.muted, borderColor: 'transparent' }
                }
              >
                {tab === 'profile' ? 'Profile Information' : 'Change Password'}
              </button>
            );
          })}
        </div>

        {/* Messages */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl border"
            style={{ backgroundColor: colors.oliveLight, borderColor: colors.olive }}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={colors.olive}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm" style={{ color: colors.olive }}>{message}</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl border"
            style={{ backgroundColor: colors.errorBg, borderColor: colors.error }}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={colors.error}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm" style={{ color: colors.error }}>{error}</p>
            </div>
          </motion.div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl shadow-lg p-8 border"
            style={{ backgroundColor: colors.card, borderColor: colors.cardBorder }}
          >
            {editMode ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.label }}>First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-xl outline-none transition-all"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = colors.inputBorderFocus)}
                      onBlur={(e) => (e.target.style.borderColor = colors.inputBorder)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.label }}>Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-xl outline-none transition-all"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = colors.inputBorderFocus)}
                      onBlur={(e) => (e.target.style.borderColor = colors.inputBorder)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.label }}>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-xl outline-none transition-all"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = colors.inputBorderFocus)}
                    onBlur={(e) => (e.target.style.borderColor = colors.inputBorder)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.label }}>LinkedIn</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-xl outline-none transition-all"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = colors.inputBorderFocus)}
                    onBlur={(e) => (e.target.style.borderColor = colors.inputBorder)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.label }}>WhatsApp</label>
                  <input
                    type="tel"
                    name="whatsapp_number"
                    value={formData.whatsapp_number}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-xl outline-none transition-all"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = colors.inputBorderFocus)}
                    onBlur={(e) => (e.target.style.borderColor = colors.inputBorder)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.label }}>💬 Preferred language for receiving messages</label>
                  <select
                    name="preferred_language"
                    value={formData.preferred_language}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-xl outline-none transition-all"
                    style={inputStyle}
                  >
                    <option value="en">English</option>
                    <option value="ur">Urdu</option>
                    <option value="ar">Arabic</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="es">Spanish</option>
                    <option value="tr">Turkish</option>
                    <option value="bn">Bengali</option>
                    <option value="hi">Hindi</option>
                    <option value="zh">Chinese</option>
                    <option value="ru">Russian</option>
                    <option value="pt">Portuguese</option>
                  </select>
                </div>
                {isVolunteer && (
                  <div className="space-y-6 pt-2 border-t" style={{ borderColor: colors.divider }}>
                    <p className="text-sm font-semibold" style={{ color: colors.headingDark }}>Volunteer preferences</p>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.label }}>Teaching format</label>
                      <select name="volunteer_teaching_format" value={formData.volunteer_teaching_format} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl outline-none transition-all" style={inputStyle}>
                        {Object.entries(FORMAT_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.label }}>Preferred platform</label>
                      <select name="volunteer_preferred_platform" value={formData.volunteer_preferred_platform} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl outline-none transition-all" style={inputStyle}>
                        {Object.entries(PLATFORM_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.label }}>Commitment</label>
                      <select name="volunteer_commitment" value={formData.volunteer_commitment} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl outline-none transition-all" style={inputStyle}>
                        {Object.entries(COMMITMENT_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                      </select>
                    </div>
                  </div>
                )}
                {isSeeker && (
                  <div className="space-y-6 pt-2 border-t" style={{ borderColor: colors.divider }}>
                    <p className="text-sm font-semibold" style={{ color: colors.headingDark }}>Seeker preferences</p>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.label }}>Preferred format</label>
                      <select name="seeker_preferred_format" value={formData.seeker_preferred_format} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl outline-none transition-all" style={inputStyle}>
                        {Object.entries(FORMAT_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.label }}>Preferred platform</label>
                      <select name="seeker_preferred_platform" value={formData.seeker_preferred_platform} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl outline-none transition-all" style={inputStyle}>
                        {Object.entries(PLATFORM_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.label }}>Urgency</label>
                      <select name="seeker_urgency" value={formData.seeker_urgency} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl outline-none transition-all" style={inputStyle}>
                        {Object.entries(URGENCY_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                      </select>
                    </div>
                  </div>
                )}
                <div className="flex gap-4">
                  <motion.button
                    type="submit"
                    disabled={saving}
                    whileHover={{ scale: saving ? 1 : 1.02 }}
                    whileTap={{ scale: saving ? 1 : 0.98 }}
                    className="px-8 py-3 text-white font-semibold rounded-xl shadow-lg hover:brightness-95 disabled:opacity-50 transition-all"
                    style={{ backgroundColor: colors.gold }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-8 py-3 border font-semibold rounded-xl transition-colors"
                    style={{ borderColor: colors.inputBorder, color: colors.body }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.badgeNeutral)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="text-sm" style={{ color: colors.muted }}>First Name</label>
                    <p className="font-medium" style={{ color: colors.body }}>{profile?.first_name}</p>
                  </div>
                  <div>
                    <label className="text-sm" style={{ color: colors.muted }}>Last Name</label>
                    <p className="font-medium" style={{ color: colors.body }}>{profile?.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm" style={{ color: colors.muted }}>Country</label>
                    <p className="font-medium" style={{ color: colors.body }}>{profile?.country}</p>
                  </div>
                  <div>
                    <label className="text-sm" style={{ color: colors.muted }}>Gender</label>
                    <p className="font-medium capitalize" style={{ color: colors.body }}>{profile?.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm" style={{ color: colors.muted }}>LinkedIn</label>
                    <a
                      href={profile?.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium block"
                      style={{ color: colors.gold }}
                    >
                      View Profile →
                    </a>
                  </div>
                  <div>
                    <label className="text-sm" style={{ color: colors.muted }}>WhatsApp</label>
                    <p className="font-medium" style={{ color: colors.body }}>{profile?.whatsapp_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm" style={{ color: colors.muted }}>💬 Preferred message language</label>
                    <p className="font-medium" style={{ color: colors.body }}>{LANGUAGE_LABELS[profile?.preferred_language] || 'English'}</p>
                  </div>
                  {isVolunteer && (
                    <>
                      <div>
                        <label className="text-sm" style={{ color: colors.muted }}>Teaching format</label>
                        <p className="font-medium" style={{ color: colors.body }}>{FORMAT_LABELS[profile?.volunteer_teaching_format] || 'Either'}</p>
                      </div>
                      <div>
                        <label className="text-sm" style={{ color: colors.muted }}>Preferred platform (volunteer)</label>
                        <p className="font-medium" style={{ color: colors.body }}>{PLATFORM_LABELS[profile?.volunteer_preferred_platform] || 'No preference'}</p>
                      </div>
                      <div>
                        <label className="text-sm" style={{ color: colors.muted }}>Commitment</label>
                        <p className="font-medium" style={{ color: colors.body }}>{COMMITMENT_LABELS[profile?.volunteer_commitment] || 'Flexible'}</p>
                      </div>
                    </>
                  )}
                  {isSeeker && (
                    <>
                      <div>
                        <label className="text-sm" style={{ color: colors.muted }}>Preferred format</label>
                        <p className="font-medium" style={{ color: colors.body }}>{FORMAT_LABELS[profile?.seeker_preferred_format] || 'Either'}</p>
                      </div>
                      <div>
                        <label className="text-sm" style={{ color: colors.muted }}>Preferred platform (seeker)</label>
                        <p className="font-medium" style={{ color: colors.body }}>{PLATFORM_LABELS[profile?.seeker_preferred_platform] || 'No preference'}</p>
                      </div>
                      <div>
                        <label className="text-sm" style={{ color: colors.muted }}>Urgency</label>
                        <p className="font-medium" style={{ color: colors.body }}>{URGENCY_LABELS[profile?.seeker_urgency] || 'Flexible'}</p>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={handleEdit}
                  className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:brightness-95 transition-all"
                  style={{ backgroundColor: colors.gold }}
                >
                  Edit Profile
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl shadow-lg p-8 border"
            style={{ backgroundColor: colors.card, borderColor: colors.cardBorder }}
          >
            <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.label }}>New Password</label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border rounded-xl outline-none transition-all"
                  style={inputStyle}
                  placeholder="At least 8 characters"
                  onFocus={(e) => (e.target.style.borderColor = colors.inputBorderFocus)}
                  onBlur={(e) => (e.target.style.borderColor = colors.inputBorder)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.label }}>Confirm Password</label>
                <input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border rounded-xl outline-none transition-all"
                  style={inputStyle}
                  placeholder="Repeat your new password"
                  onFocus={(e) => (e.target.style.borderColor = colors.inputBorderFocus)}
                  onBlur={(e) => (e.target.style.borderColor = colors.inputBorder)}
                />
              </div>
              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ scale: saving ? 1 : 1.02 }}
                whileTap={{ scale: saving ? 1 : 0.98 }}
                className="px-8 py-3 text-white font-semibold rounded-xl shadow-lg hover:brightness-95 disabled:opacity-50 transition-all"
                style={{ backgroundColor: colors.gold }}
              >
                {saving ? 'Changing...' : 'Change Password'}
              </motion.button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
