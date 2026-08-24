// frontend/src/pages/VerifyEmail.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usersAPI } from '../api/users';
import colors from '../theme/colors';
import { useAppTranslation } from '../hooks/useAppTranslation';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const { t } = useAppTranslation();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await usersAPI.verifyEmail(token);
        setStatus('success');
        setMessage(response.data.detail || t('shared.emailVerified'));
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.detail || t('shared.verificationFailed'));
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center pt-32 pb-12 px-4" style={{ backgroundColor: colors.primaryLight }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center"
      >
        {status === 'verifying' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})` }}
            >
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.headingDark }}>{t('shared.verifyingEmail')}</h2>
            <p style={{ color: colors.body }}>{t('shared.pleaseWait')}</p>
          </>
        )}

        {status === 'success' && (
          <>
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
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.headingDark }}>{t('shared.emailVerified')}</h2>
            <p className="mb-8" style={{ color: colors.body }}>{message}</p>
            <Link
              to="/login"
              className="inline-block px-8 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})` }}
            >
              {t('shared.signInNow')}
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.errorBg }}>
              <svg className="w-10 h-10" style={{ color: colors.error }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.headingDark }}>{t('shared.verificationFailed')}</h2>
            <p className="mb-8" style={{ color: colors.body }}>{message}</p>
            <Link
              to="/login"
              className="inline-block px-8 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})` }}
            >
              {t('shared.goToLogin')}
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
