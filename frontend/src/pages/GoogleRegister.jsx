// frontend/src/pages/GoogleRegister.jsx
import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import colors, { tw } from '../theme/colors';

const COUNTRIES = [
  'Palestine', 'Egypt', 'Jordan', 'Lebanon', 'Syria', 'Saudi Arabia',
  'UAE', 'Qatar', 'Kuwait', 'Oman', 'Bahrain', 'Yemen', 'Iraq',
  'Libya', 'Tunisia', 'Algeria', 'Morocco', 'Sudan', 'Somalia',
  'Mauritania', 'Djibouti', 'Comoros',
  'Turkey', 'Pakistan', 'Afghanistan', 'Bangladesh', 'India', 'Indonesia',
  'Malaysia', 'Iran', 'Azerbaijan', 'Kazakhstan', 'Uzbekistan',
  'Kyrgyzstan', 'Tajikistan', 'Turkmenistan', 'China', 'Japan',
  'South Korea', 'Philippines', 'Thailand', 'Vietnam',
  'United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands',
  'Sweden', 'Norway', 'Denmark', 'Finland', 'Belgium', 'Switzerland',
  'Austria', 'Poland', 'Portugal', 'Greece', 'Ireland',
  'United States', 'Canada', 'Brazil', 'Argentina', 'Mexico',
  'Colombia', 'Chile', 'Venezuela',
  'Nigeria', 'Ethiopia', 'Kenya', 'Ghana', 'Senegal', 'Mali',
  'Niger', 'Chad', 'Cameroon', 'Tanzania', 'Uganda', 'South Africa',
  'Australia', 'New Zealand', 'Other'
];

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const LANGUAGES = [
  { code: 'ar', label: 'Arabic' },
  { code: 'zh', label: 'Chinese' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ja', label: 'Japanese' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' },
  { code: 'es', label: 'Spanish' },
  { code: 'tr', label: 'Turkish' },
  { code: 'ur', label: 'Urdu' },
];

const ROLES = [
  { value: 'volunteer', label: '🧑‍🏫 Volunteer - I want to teach', description: 'Share your skills with learners' },
  { value: 'seeker', label: '🎓 Seeker - I want to learn', description: 'Learn new digital skills' },
];

export default function GoogleRegister() {
  const location = useLocation();
  const navigate = useNavigate();
  const { googleRegister } = useAuth();

  const { registrationToken, user: googleUser } = location.state || {};

  const [formData, setFormData] = useState({
    country: '',
    gender: '',
    linkedin: '',
    roles: [],
    languages: [],
    whatsapp_number: '',
    preferred_language: 'en',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!registrationToken) {
    navigate('/login', { replace: true });
    return null;
  }

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.roles.length === 0) {
      setError('Please select at least one role.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await googleRegister({
      registration_token: registrationToken,
      ...formData,
    });
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0" style={{ backgroundColor: colors.primaryLight }} />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative max-w-2xl w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-6">
            <div className="rounded-2xl border-4 p-1 bg-white" style={{ borderColor: colors.gold }}>
              <img src="/logo-full.png" alt="GazaBridge" className="h-20 w-[126px] object-contain" />
            </div>
          </Link>
          <h2 className="text-3xl font-bold" style={{ color: colors.headingDark }}>Complete Your Profile</h2>
          <p className="mt-2" style={{ color: colors.body }}>Welcome{googleUser?.first_name ? `, ${googleUser.first_name}` : ''}! Let's set up your account.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: colors.errorBg, borderColor: colors.error }}>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" style={{ color: colors.error }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm" style={{ color: colors.error }}>{error}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Roles */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: colors.body }}>I want to... <span style={{ color: colors.error }}>*</span></label>
              <div className="space-y-3">
                {ROLES.map((role) => (
                  <label
                    key={role.value}
                    className="flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all"
                    style={formData.roles.includes(role.value)
                      ? { borderColor: colors.gold, backgroundColor: colors.goldLight }
                      : { borderColor: '#E5E7EB' }}
                  >
                    <input type="checkbox" name="roles" value={role.value} checked={formData.roles.includes(role.value)} onChange={handleChange}
                      className={tw.goldCheckbox} />
                    <div className="ml-3">
                      <div className="text-sm font-medium" style={{ color: colors.headingDark }}>{role.label}</div>
                      <div className="text-sm" style={{ color: colors.muted }}>{role.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* LinguaDuo Preferred Language */}
            <div className="p-4 rounded-xl border-2" style={{ borderColor: colors.secondary, backgroundColor: '#EBF5FB' }}>
              <label htmlFor="preferred_language" className="block text-sm font-medium mb-1" style={{ color: colors.body }}>
                💬 Preferred language for receiving messages <span style={{ color: colors.error }}>*</span>
              </label>
              <p className="text-xs mb-3" style={{ color: colors.muted }}>
                GazaBridge is connected to LinguaDuo — a translation chat app. Messages from other users will be delivered to you in this language. You can change this later in your profile.
              </p>
              <select id="preferred_language" name="preferred_language" value={formData.preferred_language} onChange={handleChange}
                className={`${tw.goldInput} bg-white`}>
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium mb-2" style={{ color: colors.body }}>Country <span style={{ color: colors.error }}>*</span></label>
              <select id="country" name="country" required value={formData.country} onChange={handleChange}
                className={tw.goldInput}>
                <option value="">Select your country</option>
                {COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium mb-2" style={{ color: colors.body }}>Gender <span style={{ color: colors.error }}>*</span></label>
              <select id="gender" name="gender" required value={formData.gender} onChange={handleChange}
                className={tw.goldInput}>
                <option value="">Select gender</option>
                {GENDERS.map(gender => <option key={gender.value} value={gender.value}>{gender.label}</option>)}
              </select>
            </div>

            {/* LinkedIn */}
            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium mb-2" style={{ color: colors.body }}>LinkedIn Profile <span style={{ color: colors.error }}>*</span></label>
              <input id="linkedin" name="linkedin" type="url" required value={formData.linkedin} onChange={handleChange}
                placeholder="https://linkedin.com/in/yourprofile"
                className={tw.goldInput} />
            </div>

            {/* Languages spoken */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: colors.body }}>Languages you speak</label>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map(language => (
                  <label
                    key={language.code}
                    className="flex items-center p-2 rounded-lg border cursor-pointer transition-all"
                    style={formData.languages.includes(language.code)
                      ? { borderColor: colors.gold, backgroundColor: colors.goldLight }
                      : { borderColor: '#E5E7EB' }}
                  >
                    <input type="checkbox" name="languages" value={language.code} checked={formData.languages.includes(language.code)} onChange={handleChange}
                      className={tw.goldCheckbox} />
                    <span className="ml-2 text-sm" style={{ color: colors.body }}>{language.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label htmlFor="whatsapp_number" className="block text-sm font-medium mb-2" style={{ color: colors.body }}>
                WhatsApp Number <span style={{ color: colors.muted }}>(optional)</span>
              </label>
              <input id="whatsapp_number" name="whatsapp_number" type="tel" value={formData.whatsapp_number} onChange={handleChange}
                placeholder="+1234567890"
                className={tw.goldInput} />
            </div>

            <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3.5 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})` }}>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </div>
              ) : 'Complete Registration'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
