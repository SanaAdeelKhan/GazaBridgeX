// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usersAPI } from '../api/users';
import GoogleLoginButton from '../components/GoogleLoginButton';

const COUNTRIES = [
  'Palestine','Egypt','Jordan','Lebanon','Syria','Saudi Arabia','UAE','Qatar','Kuwait','Oman','Bahrain','Yemen','Iraq',
  'Libya','Tunisia','Algeria','Morocco','Sudan','Somalia','Mauritania','Djibouti','Comoros',
  'Turkey','Pakistan','Afghanistan','Bangladesh','India','Indonesia','Malaysia','Iran','Azerbaijan',
  'Kazakhstan','Uzbekistan','Kyrgyzstan','Tajikistan','Turkmenistan','China','Japan','South Korea',
  'Philippines','Thailand','Vietnam','United Kingdom','Germany','France','Spain','Italy','Netherlands',
  'Sweden','Norway','Denmark','Finland','Belgium','Switzerland','Austria','Poland','Portugal','Greece','Ireland',
  'United States','Canada','Brazil','Argentina','Mexico','Colombia','Chile','Venezuela',
  'Nigeria','Ethiopia','Kenya','Ghana','Senegal','Mali','Niger','Chad','Cameroon','Tanzania','Uganda','South Africa',
  'Australia','New Zealand','Other'
];

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const LANGUAGES = [
  { code: 'ar', label: 'Arabic' }, { code: 'zh', label: 'Chinese' }, { code: 'en', label: 'English' },
  { code: 'fr', label: 'French' }, { code: 'de', label: 'German' }, { code: 'hi', label: 'Hindi' },
  { code: 'ja', label: 'Japanese' }, { code: 'pt', label: 'Portuguese' }, { code: 'ru', label: 'Russian' },
  { code: 'es', label: 'Spanish' }, { code: 'tr', label: 'Turkish' }, { code: 'ur', label: 'Urdu' },
];

const ROLES = [
  { value: 'volunteer', label: '🧑‍🏫 I want to volunteer and teach', description: 'Share your skills with eager learners' },
  { value: 'seeker', label: '🎓 I want to learn new skills', description: 'Get help from experienced volunteers' },
];

const STEPS = ['Account', 'Profile', 'Verification'];

const inputStyle = { backgroundColor: '#eaf1f8', border: '1.5px solid #a8c4dc', color: '#1e3a5f' };
const labelStyle = { color: '#1e3a5f' };

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', first_name: '', last_name: '',
    country: '', gender: '', linkedin: '', roles: [], languages: [], whatsapp_number: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked ? [...prev[name], value] : prev[name].filter(i => i !== value),
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const validateStep = (s) => {
    if (s === 1) {
      if (!formData.email || !formData.password) { setError('Please fill in all required fields.'); return false; }
      if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); return false; }
      if (formData.password.length < 8) { setError('Password must be at least 8 characters.'); return false; }
    }
    if (s === 2) {
      if (!formData.first_name || !formData.last_name || !formData.country || !formData.gender || !formData.linkedin || formData.roles.length === 0) {
        setError('Please fill in all required fields.'); return false;
      }
    }
    return true;
  };

  const handleNext = () => { if (validateStep(step)) { setStep(p => p + 1); setError(''); } };
  const handleBack = () => { setStep(p => p - 1); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(2)) return;
    setLoading(true); setError('');
    try {
      const response = await usersAPI.register({
        email: formData.email, password: formData.password,
        first_name: formData.first_name, last_name: formData.last_name,
        country: formData.country, gender: formData.gender, linkedin: formData.linkedin,
        roles: formData.roles, languages: formData.languages, whatsapp_number: formData.whatsapp_number,
      });
      setSuccessMessage(response.data.message);
      setStep(3);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData) {
        const messages = [];
        Object.entries(errorData).forEach(([, value]) => {
          if (Array.isArray(value)) messages.push(...value);
          else if (typeof value === 'string') messages.push(value);
        });
        setError(messages.join('\n') || 'Registration failed. Please try again.');
      } else {
        setError('Registration failed. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const EyeOpen = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
  const EyeOff = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold mb-2" style={labelStyle}>Email address <span className="text-red-500">*</span></label>
        <input name="email" type="email" required value={formData.email} onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl outline-none transition-all" style={inputStyle} placeholder="you@example.com" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2" style={labelStyle}>Password <span className="text-red-500">*</span></label>
        <div className="relative">
          <input name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange}
            className="w-full px-4 py-3 pr-12 rounded-xl outline-none transition-all" style={inputStyle} placeholder="At least 8 characters" />
          <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: '#5a6600' }}>
            {showPassword ? <EyeOff /> : <EyeOpen />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2" style={labelStyle}>Confirm Password <span className="text-red-500">*</span></label>
        <div className="relative">
          <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleChange}
            className="w-full px-4 py-3 pr-12 rounded-xl outline-none transition-all" style={inputStyle} placeholder="Repeat your password" />
          <button type="button" onClick={() => setShowConfirmPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: '#5a6600' }}>
            {showConfirmPassword ? <EyeOff /> : <EyeOpen />}
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2" style={labelStyle}>First Name <span className="text-red-500">*</span></label>
          <input name="first_name" type="text" required value={formData.first_name} onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl outline-none transition-all" style={inputStyle} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2" style={labelStyle}>Last Name <span className="text-red-500">*</span></label>
          <input name="last_name" type="text" required value={formData.last_name} onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl outline-none transition-all" style={inputStyle} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-3" style={labelStyle}>I want to... <span className="text-red-500">*</span></label>
        <div className="space-y-3">
          {ROLES.map(role => (
            <label key={role.value} className="flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all"
              style={formData.roles.includes(role.value)
                ? { borderColor: '#C26100', backgroundColor: '#fde8d0' }
                : { borderColor: '#a8c4dc', backgroundColor: '#eaf1f8' }}>
              <input type="checkbox" name="roles" value={role.value} checked={formData.roles.includes(role.value)} onChange={handleChange}
                className="mt-0.5 h-4 w-4 rounded" style={{ accentColor: '#C26100' }} />
              <div className="ml-3">
                <div className="text-sm font-medium" style={{ color: '#1e3a5f' }}>{role.label}</div>
                <div className="text-sm" style={{ color: '#5a6600' }}>{role.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2" style={labelStyle}>Country <span className="text-red-500">*</span></label>
        <select name="country" required value={formData.country} onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl outline-none transition-all" style={inputStyle}>
          <option value="">Select your country</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2" style={labelStyle}>Gender <span className="text-red-500">*</span></label>
        <select name="gender" required value={formData.gender} onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl outline-none transition-all" style={inputStyle}>
          <option value="">Select gender</option>
          {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2" style={labelStyle}>LinkedIn Profile <span className="text-red-500">*</span></label>
        <input name="linkedin" type="url" required value={formData.linkedin} onChange={handleChange}
          placeholder="https://linkedin.com/in/yourprofile"
          className="w-full px-4 py-3 rounded-xl outline-none transition-all" style={inputStyle} />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-3" style={labelStyle}>Languages you speak</label>
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGES.map(lang => (
            <label key={lang.code} className="flex items-center p-2 rounded-lg border cursor-pointer transition-all"
              style={formData.languages.includes(lang.code)
                ? { borderColor: '#C26100', backgroundColor: '#fde8d0' }
                : { borderColor: '#a8c4dc', backgroundColor: '#eaf1f8' }}>
              <input type="checkbox" name="languages" value={lang.code} checked={formData.languages.includes(lang.code)} onChange={handleChange}
                className="h-4 w-4 rounded" style={{ accentColor: '#C26100' }} />
              <span className="ml-2 text-sm" style={{ color: '#1e3a5f' }}>{lang.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2" style={labelStyle}>
          WhatsApp Number <span style={{ color: '#5a6600' }}>(optional)</span>
        </label>
        <input name="whatsapp_number" type="tel" value={formData.whatsapp_number} onChange={handleChange}
          placeholder="+1234567890" className="w-full px-4 py-3 rounded-xl outline-none transition-all" style={inputStyle} />
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}
        className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #C26100, #E07A1B)' }}>
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>
      <h3 className="text-2xl font-bold mb-4" style={{ color: '#3d4a00', fontFamily: "'Instrument Serif', Georgia, serif" }}>Check Your Email</h3>
      <p className="mb-6" style={{ color: '#5a6600' }}>
        {successMessage || "We've sent a verification link to your email. Please verify to activate your account."}
      </p>
      <p className="text-sm mb-8" style={{ color: '#5a6600' }}>
        Didn't receive it? Check your spam or{' '}
        <button onClick={() => usersAPI.resendVerification(formData.email)} className="font-semibold" style={{ color: '#C26100' }}>
          click here to resend
        </button>
      </p>
      <Link to="/login" className="inline-block px-8 py-3 text-white font-semibold rounded-xl shadow-lg transition-all"
        style={{ background: 'linear-gradient(to right, #C26100, #E07A1B)' }}>
        Go to Login
      </Link>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0" style={{ backgroundColor: '#F2DDD8' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative max-w-2xl w-full">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center justify-center mb-1 mx-auto">
            <div className="w-36 h-36 relative flex-shrink-0 mb-1 mx-auto">
              <img src="/assets/public/gazabrige.jpg" alt="GazaBridge Logo"
                className="w-full h-full object-contain rounded-2xl"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div className="absolute inset-0 w-full h-full rounded-2xl items-center justify-center"
                style={{ display: 'none', background: 'linear-gradient(135deg, #C26100, #E07A1B)' }}>
                <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </Link>
          <h2 className="text-3xl font-bold" style={{ color: '#3d4a00', fontFamily: "'Instrument Serif', Georgia, serif" }}>Create your account</h2>
          <p className="mt-2" style={{ color: '#5a6600' }}>Join our community of learners and volunteers</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl shadow-xl p-8 border" style={{ backgroundColor: '#d8e4f0', borderColor: '#a8c4dc' }}>

          {/* Steps */}
          {step < 3 && (
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {STEPS.map((stepName, index) => (
                  <div key={stepName} className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold"
                      style={index + 1 <= step
                        ? { background: 'linear-gradient(to right, #C26100, #E07A1B)', color: '#fff' }
                        : { backgroundColor: '#eaf1f8', color: '#5a6600' }}>
                      {index + 1 < step ? '✓' : index + 1}
                    </div>
                    <span className="ml-2 text-sm font-medium hidden sm:block"
                      style={{ color: index + 1 <= step ? '#C26100' : '#5a6600' }}>{stepName}</span>
                    {index < STEPS.length - 1 && (
                      <div className="w-12 sm:w-20 h-0.5 mx-2"
                        style={{ backgroundColor: index + 1 < step ? '#C26100' : '#a8c4dc' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Google — step 1 only */}
          {step === 1 && (
            <>
              <GoogleLoginButton className="mb-6" />
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: '#a8c4dc' }} />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4" style={{ backgroundColor: '#d8e4f0', color: '#5a6600' }}>or continue with email</span>
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5' }}>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#991b1b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm whitespace-pre-line" style={{ color: '#991b1b' }}>{error}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {step < 3 && (
              <div className="flex gap-4 mt-8">
                {step > 1 && (
                  <motion.button type="button" onClick={handleBack} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 font-semibold rounded-xl border-2 transition-colors"
                    style={{ borderColor: '#a8c4dc', color: '#1e3a5f', backgroundColor: '#eaf1f8' }}>
                    Back
                  </motion.button>
                )}
                {step < 2 ? (
                  <motion.button type="button" onClick={handleNext} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 text-white font-semibold rounded-xl shadow-lg transition-all"
                    style={{ background: 'linear-gradient(to right, #C26100, #E07A1B)' }}>
                    Continue
                  </motion.button>
                ) : (
                  <motion.button type="submit" disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="flex-1 py-3 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(to right, #C26100, #E07A1B)' }}>
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating account...
                      </div>
                    ) : 'Create Account'}
                  </motion.button>
                )}
              </div>
            )}
          </form>
        </div>

        {step < 3 && (
          <p className="text-center mt-6" style={{ color: '#5a6600' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#C26100' }}>Sign in</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
