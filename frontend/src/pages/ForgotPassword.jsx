// frontend/src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { forgetPasswordAPI } from '../api/forgetPassword';
import colors, { tw } from '../theme/colors';
import { useAppTranslation } from '../hooks/useAppTranslation';

export default function ForgotPassword() {
  const { t } = useAppTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError(t('auth.invalidEmail'));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await forgetPasswordAPI.requestReset(email);
      setSuccess(true);
    } catch (err) {
      const message = err.response?.data?.detail || t('auth.requestFailed');
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
          <h2 className="text-3xl font-bold" style={{ color: colors.headingDark }}>{t('auth.forgotTitle')}</h2>
          <p className="mt-2" style={{ color: colors.body }}>
            {t('auth.forgotDescription')}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: colors.headingDark }}>{t('auth.checkEmail')}</h3>
              <p className="mb-4" style={{ color: colors.body }}>
                {t('auth.resetSent', { email })}
              </p>
              <p className="text-sm mb-8" style={{ color: colors.muted }}>
                {t('auth.didNotReceive')}{' '}
                <button
                  onClick={() => {
                    setSuccess(false);
                    setError('');
                  }}
                  className="font-semibold"
                  style={{ color: colors.gold }}
                >
                  {t('auth.tryAgain')}
                </button>
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-semibold"
                style={{ color: colors.gold }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t('auth.backToLogin')}
              </Link>
            </motion.div>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: colors.body }}>
                  {t('auth.emailAddress')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  required
                  autoFocus
                  className={`${tw.goldInput} placeholder-gray-400`}
                  style={{ color: colors.headingDark }}
                  placeholder="you@example.com"
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
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
                    {t('auth.sendingReset')}
                  </div>
                ) : (
                  t('auth.resetPassword')
                )}
              </motion.button>

              <div className="text-center mt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm transition-colors"
                  style={{ color: colors.muted }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {t('auth.backToLogin')}
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
