// frontend/src/pages/VerifyEmail.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usersAPI } from '../api/users';
import colors from '../theme/colors';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await usersAPI.verifyEmail(token);
        setStatus('success');
        setMessage(response.data.detail || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.detail || 'Verification failed. The link may be invalid or expired.');
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
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.headingDark }}>Verifying your email</h2>
            <p style={{ color: colors.body }}>Please wait a moment...</p>
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
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.headingDark }}>Email Verified!</h2>
            <p className="mb-8" style={{ color: colors.body }}>{message}</p>
            <Link
              to="/login"
              className="inline-block px-8 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})` }}
            >
              Sign In Now
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
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.headingDark }}>Verification Failed</h2>
            <p className="mb-8" style={{ color: colors.body }}>{message}</p>
            <Link
              to="/login"
              className="inline-block px-8 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})` }}
            >
              Go to Login
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
