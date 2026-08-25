// frontend/src/pages/ResetPassword.jsx
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { forgetPasswordAPI } from '../api/forgetPassword';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import colors, { tw } from '../theme/colors';
import { useAppTranslation } from '../hooks/useAppTranslation';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { t } = useAppTranslation();

  const [passwords, setPasswords] = useState({
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setPasswords(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (passwords.new_password.length < 8) {
      setError(t('shared.passwordMinLength'));
      return;
    }

    if (passwords.new_password !== passwords.confirm_password) {
      setError(t('reset.mismatch'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await forgetPasswordAPI.confirmReset(token, passwords);
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const message = err.response?.data?.detail ||
        err.response?.data?.new_password?.[0] ||
        err.response?.data?.confirm_password?.[0] ||
        t('reset.failed');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background */}
      <div className="absolute inset-0" style={{ backgroundColor: colors.primaryLight }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-md w-full"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-6">
            <div className="rounded-2xl border-4 p-1 bg-white" style={{ borderColor: colors.gold }}>
              <img src="/logo-full.png" alt="GazaBridge" className="h-20 w-[126px] object-contain" />
            </div>
          </Link>
          <h2 className="text-3xl font-bold" style={{ color: colors.headingDark }}>{t('reset.title')}</h2>
          <p className="mt-2" style={{ color: colors.body }}>
            {t('reset.description')}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})` }}
              >
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: colors.headingDark }}>{t('reset.successTitle')}</h3>
              <p className="mb-4" style={{ color: colors.body }}>
                {t('reset.successDescription')}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6 overflow-hidden">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 3, ease: 'linear' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: colors.gold }}
                />
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})` }}
              >
                {t('reset.goLoginNow')}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </motion.div>
          )}

          {!success && (
            <>
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl border"
                  style={{ backgroundColor: colors.errorBg, borderColor: colors.error }}
                >
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.error }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm" style={{ color: colors.error }}>{error}</p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="new_password" className="block text-sm font-medium mb-2" style={{ color: colors.body }}>
                    {t('reset.newPassword')}
                  </label>
                  <input
                    id="new_password"
                    name="new_password"
                    type="password"
                    required
                    minLength={8}
                    value={passwords.new_password}
                    onChange={handleChange}
                    autoFocus
                    className={`${tw.goldInput} placeholder-gray-400`}
                    style={{ color: colors.headingDark }}
                    placeholder={t('shared.passwordMinLength')}
                  />
                  {passwords.new_password && (
                    <PasswordStrengthIndicator password={passwords.new_password} />
                  )}
                </div>

                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium mb-2" style={{ color: colors.body }}>
                    {t('reset.confirmNewPassword')}
                  </label>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    required
                    value={passwords.confirm_password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all outline-none placeholder-gray-400 ${
                      passwords.confirm_password && passwords.new_password !== passwords.confirm_password
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                    style={{ color: colors.headingDark }}
                    placeholder={t('reset.repeatPassword')}
                  />
                  {passwords.confirm_password && passwords.new_password !== passwords.confirm_password && (
                    <p className="mt-2 text-sm" style={{ color: colors.error }}>{t('reset.mismatch')}</p>
                  )}
                  {passwords.confirm_password && passwords.new_password === passwords.confirm_password && (
                    <p className="mt-2 text-sm" style={{ color: colors.olive }}>✓ Passwords match</p>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="text-sm font-medium mb-3" style={{ color: colors.body }}>Password requirements:</h4>
                  <ul className="space-y-2">
                    {[
                      { label: 'At least 8 characters', met: passwords.new_password.length >= 8 },
                      { label: 'Contains uppercase letter', met: /[A-Z]/.test(passwords.new_password) },
                      { label: 'Contains lowercase letter', met: /[a-z]/.test(passwords.new_password) },
                      { label: 'Contains a number', met: /[0-9]/.test(passwords.new_password) },
                      { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(passwords.new_password) },
                    ].map((req, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: passwords.new_password && req.met ? colors.olive : '#D1D5DB' }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={req.met && passwords.new_password ? 'M5 13l4 4L19 7' : 'M12 8v4m0 4h.01'}
                          />
                        </svg>
                        <span style={{ color: passwords.new_password && req.met ? colors.headingDark : colors.muted }}>
                          {req.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || passwords.new_password !== passwords.confirm_password}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full py-3.5 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})` }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Resetting password...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </motion.button>
              </form>
            </>
          )}
        </div>

        {!success && (
          <p className="text-center mt-6" style={{ color: colors.body }}>
            Remember your password?{' '}
            <Link to="/login" className="font-semibold" style={{ color: colors.gold }}>
              Sign in
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
