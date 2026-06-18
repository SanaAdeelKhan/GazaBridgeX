// frontend/src/pages/ResetPassword.jsx
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { forgetPasswordAPI } from '../api/forgetPassword';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ new_password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new_password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (passwords.new_password !== passwords.confirm_password) { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');
    try {
      await forgetPasswordAPI.confirmReset(token, passwords);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.new_password?.[0] || 'Password reset failed. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const requirements = [
    { label: 'At least 8 characters', met: passwords.new_password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(passwords.new_password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(passwords.new_password) },
    { label: 'Contains a number', met: /[0-9]/.test(passwords.new_password) },
    { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(passwords.new_password) },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0" style={{ backgroundColor: '#F2DDD8' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative max-w-md w-full">

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
          <h2 className="text-3xl font-bold" style={{ color: '#3d4a00', fontFamily: "'Instrument Serif', Georgia, serif" }}>Set new password</h2>
          <p className="mt-2" style={{ color: '#5a6600' }}>Must be different from previously used passwords.</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl shadow-xl p-8 border" style={{ backgroundColor: '#d8e4f0', borderColor: '#a8c4dc' }}>
          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #C26100, #E07A1B)' }}>
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#3d4a00', fontFamily: "'Instrument Serif', Georgia, serif" }}>Password reset successful!</h3>
              <p className="mb-4" style={{ color: '#5a6600' }}>Redirecting you to login shortly...</p>
              <div className="w-full rounded-full h-1.5 mb-6 overflow-hidden" style={{ backgroundColor: '#a8c4dc' }}>
                <motion.div initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: 3, ease: 'linear' }}
                  className="h-full rounded-full" style={{ background: 'linear-gradient(to right, #C26100, #E07A1B)' }} />
              </div>
              <Link to="/login"
                className="inline-flex items-center gap-2 px-8 py-3 text-white font-semibold rounded-xl shadow-lg transition-all"
                style={{ background: 'linear-gradient(to right, #C26100, #E07A1B)' }}>
                Go to Login Now
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </motion.div>
          ) : (
            <>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5' }}>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#991b1b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm" style={{ color: '#991b1b' }}>{error}</p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="new_password" className="block text-sm font-semibold mb-2" style={{ color: '#1e3a5f' }}>
                    New Password
                  </label>
                  <input id="new_password" name="new_password" type="password" required minLength={8}
                    value={passwords.new_password} onChange={handleChange} autoFocus
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                    style={{ backgroundColor: '#eaf1f8', border: '1.5px solid #a8c4dc', color: '#1e3a5f' }}
                    placeholder="At least 8 characters" />
                  {passwords.new_password && <PasswordStrengthIndicator password={passwords.new_password} />}
                </div>

                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-semibold mb-2" style={{ color: '#1e3a5f' }}>
                    Confirm New Password
                  </label>
                  <input id="confirm_password" name="confirm_password" type="password" required
                    value={passwords.confirm_password} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                    style={{
                      backgroundColor: '#eaf1f8',
                      border: `1.5px solid ${passwords.confirm_password && passwords.new_password !== passwords.confirm_password ? '#fca5a5' : '#a8c4dc'}`,
                      color: '#1e3a5f'
                    }}
                    placeholder="Repeat your new password" />
                  {passwords.confirm_password && passwords.new_password !== passwords.confirm_password && (
                    <p className="mt-2 text-sm" style={{ color: '#991b1b' }}>Passwords do not match</p>
                  )}
                  {passwords.confirm_password && passwords.new_password === passwords.confirm_password && (
                    <p className="mt-2 text-sm" style={{ color: '#C26100' }}>✓ Passwords match</p>
                  )}
                </div>

                {/* Requirements */}
                <div className="p-4 rounded-xl" style={{ backgroundColor: '#eaf1f8' }}>
                  <h4 className="text-sm font-semibold mb-3" style={{ color: '#1e3a5f' }}>Password requirements:</h4>
                  <ul className="space-y-2">
                    {requirements.map((req, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          style={{ color: passwords.new_password ? (req.met ? '#C26100' : '#a8c4dc') : '#a8c4dc' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d={req.met && passwords.new_password ? 'M5 13l4 4L19 7' : 'M12 8v4m0 4h.01'} />
                        </svg>
                        <span style={{ color: passwords.new_password ? (req.met ? '#C26100' : '#5a6600') : '#5a6600' }}>
                          {req.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <motion.button type="submit"
                  disabled={loading || passwords.new_password !== passwords.confirm_password}
                  whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full py-3.5 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(to right, #C26100, #E07A1B)' }}>
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Resetting password...
                    </div>
                  ) : 'Reset Password'}
                </motion.button>
              </form>
            </>
          )}
        </div>

        {!success && (
          <p className="text-center mt-6" style={{ color: '#5a6600' }}>
            Remember your password?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#C26100' }}>Sign in</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
