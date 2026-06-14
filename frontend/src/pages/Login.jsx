// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/GoogleLoginButton';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(formData.email, formData.password);
    if (result.success) {
      const userData = result.user;
      const adminRoles = ['manager', 'admin', 'superuser'];
      const isAdmin = userData?.roles?.some(r => adminRoles.includes(r)) || userData?.is_staff || userData?.is_superuser;
      navigate(isAdmin ? '/admin' : '/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

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
          <h2 className="text-3xl font-bold" style={{ color: '#3d4a00', fontFamily: "'Instrument Serif', Georgia, serif" }}>Welcome back</h2>
          <p className="mt-2" style={{ color: '#5a6600' }}>Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl shadow-xl p-8 border" style={{ backgroundColor: '#d8e4f0', borderColor: '#a8c4dc' }}>
          <GoogleLoginButton />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: '#a8c4dc' }} />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4" style={{ backgroundColor: '#d8e4f0', color: '#5a6600' }}>or continue with email</span>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5' }}>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#991b1b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm" style={{ color: '#991b1b' }}>{error}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#1e3a5f' }}>
                Email address
              </label>
              <input id="email" name="email" type="email" autoComplete="email" required
                value={formData.email} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                style={{ backgroundColor: '#eaf1f8', border: '1.5px solid #a8c4dc', color: '#1e3a5f' }}
                placeholder="you@example.com" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: '#1e3a5f' }}>
                Password
              </label>
              <div className="relative">
                <input id="password" name="password" type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password" required
                  value={formData.password} onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 rounded-xl outline-none transition-all"
                  style={{ backgroundColor: '#eaf1f8', border: '1.5px solid #a8c4dc', color: '#1e3a5f' }}
                  placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors"
                  style={{ color: '#5a6600' }}>
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="text-right mt-1">
                <Link to="/forgot-password" className="text-sm font-medium transition-colors" style={{ color: '#C26100' }}>
                  Forgot your password?
                </Link>
              </div>
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3.5 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(to right, #C26100, #E07A1B)' }}>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </div>
              ) : 'Sign in'}
            </motion.button>
          </form>
        </div>

        <p className="text-center mt-6" style={{ color: '#5a6600' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold" style={{ color: '#C26100' }}>Create one free</Link>
        </p>
      </motion.div>
    </div>
  );
}
