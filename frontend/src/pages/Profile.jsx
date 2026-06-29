// frontend/src/pages/Profile.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const { profile, loading, updateProfile, changePassword } = useUser();
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
            className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-[#e18f23] to-[#e18f23] rounded-full"
          />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-[#fdf3e3] via-white to-[#fdf3e3]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#e18f23] to-[#e18f23] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {profile?.first_name?.[0] || user?.email?.[0] || 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {profile?.first_name} {profile?.last_name}
              </h1>
              <p className="text-gray-600">{profile?.email}</p>
              <div className="flex gap-2 mt-2">
                {profile?.roles?.map(role => (
                  <span key={role.id} className="px-3 py-1 bg-[#fdf3e3] text-[#1a2e1a] rounded-full text-xs font-semibold">
                    {role.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {['profile', 'password'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 font-medium text-sm transition-all ${
                activeTab === tab
                  ? 'text-[#C97B1A] border-b-2 border-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'profile' ? 'Profile Information' : 'Change Password'}
            </button>
          ))}
        </div>

        {/* Messages */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-[#fdf3e3] border border-emerald-200 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-[#1a2e1a]">{message}</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100"
          >
            {editMode ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-[#C97B1A] transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-[#C97B1A] transition-all outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-[#C97B1A] transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-[#C97B1A] transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                  <input
                    type="tel"
                    name="whatsapp_number"
                    value={formData.whatsapp_number}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-[#C97B1A] transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">💬 Preferred language for receiving messages</label>
                  <select name="preferred_language" value={formData.preferred_language} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-[#C97B1A] transition-all outline-none">
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
                <div className="flex gap-4">
                  <motion.button
                    type="submit"
                    disabled={saving}
                    whileHover={{ scale: saving ? 1 : 1.02 }}
                    whileTap={{ scale: saving ? 1 : 0.98 }}
                    className="px-8 py-3 bg-[#e18f23] hover:bg-[#c97a18] text-white font-semibold rounded-xl shadow-lg disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="text-sm text-gray-500">First Name</label>
                    <p className="text-gray-900 font-medium">{profile?.first_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Last Name</label>
                    <p className="text-gray-900 font-medium">{profile?.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Country</label>
                    <p className="text-gray-900 font-medium">{profile?.country}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Gender</label>
                    <p className="text-gray-900 font-medium capitalize">{profile?.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">LinkedIn</label>
                    <a href={profile?.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#C97B1A] hover:text-[#1a2e1a] font-medium">
                      View Profile →
                    </a>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">WhatsApp</label>
                    <p className="text-gray-900 font-medium">{profile?.whatsapp_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">💬 Preferred message language</label>
                    <p className="text-gray-900 font-medium">{{"en":"English","ur":"Urdu","ar":"Arabic","fr":"French","de":"German","es":"Spanish","tr":"Turkish","hi":"Hindi","zh":"Chinese","ru":"Russian","pt":"Portuguese","ja":"Japanese"}[profile?.preferred_language] || "English"}</p>
                  </div>
                </div>
                <button
                  onClick={handleEdit}
                  className="px-6 py-2.5 bg-[#e18f23] hover:bg-[#c97a18] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
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
            className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100"
          >
            <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-[#C97B1A] transition-all outline-none"
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-[#C97B1A] transition-all outline-none"
                  placeholder="Repeat your new password"
                />
              </div>
              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ scale: saving ? 1 : 1.02 }}
                whileTap={{ scale: saving ? 1 : 0.98 }}
                className="px-8 py-3 bg-[#e18f23] hover:bg-[#c97a18] text-white font-semibold rounded-xl shadow-lg disabled:opacity-50"
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