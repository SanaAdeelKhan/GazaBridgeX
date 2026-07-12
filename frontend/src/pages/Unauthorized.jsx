// frontend/src/pages/Unauthorized.jsx
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.roles?.some(r =>
    ['manager', 'admin', 'superuser'].includes(r.name)
  ) || user?.is_staff || user?.is_superuser;

  return (
    <div className="min-h-screen flex items-center justify-center pt-32 pb-12 px-4" style={{ backgroundColor: colors.primaryLight }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.errorBg }}>
          <svg className="w-10 h-10" style={{ color: colors.error }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 1112 3a9 9 0 017.364 4.636M12 9v4" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.headingDark }}>Access Denied</h1>
        <p className="mb-6" style={{ color: colors.body }}>
          You don't have permission to access this page. This area is restricted to administrators only.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 border-2 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#D1D5DB', color: colors.body }}
          >
            Go Back
          </button>
          <Link
            to={isAdmin ? '/admin' : '/dashboard'}
            className="flex-1 py-3 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})` }}
          >
            Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
