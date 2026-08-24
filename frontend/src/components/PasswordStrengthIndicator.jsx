// frontend/src/components/PasswordStrengthIndicator.jsx
import { motion } from 'framer-motion';
import colors from '../theme/colors';
import { useAppTranslation } from '../hooks/useAppTranslation';

export default function PasswordStrengthIndicator({ password }) {
  const { t } = useAppTranslation();
  const calculateStrength = (pwd) => {
    let score = 0;

    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++;

    return Math.min(score, 5);
  };

  const strength = calculateStrength(password);

  const getStrengthInfo = (strength) => {
    switch (strength) {
      case 0:
      case 1:
        return { label: t('shared.veryWeak'), color: colors.error, width: '20%' };
      case 2:
        return { label: t('shared.weak'), color: '#F97316', width: '40%' };
      case 3:
        return { label: t('shared.fair'), color: colors.gold, width: '60%' };
      case 4:
        return { label: t('shared.strong'), color: colors.goldHover, width: '80%' };
      case 5:
        return { label: t('shared.veryStrong'), color: colors.olive, width: '100%' };
      default:
        return { label: '', color: '#E5E7EB', width: '0%' };
    }
  };

  const info = getStrengthInfo(strength);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-3"
    >
      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: info.width }}
          transition={{ duration: 0.3 }}
          className="h-full rounded-full"
          style={{ backgroundColor: info.color }}
        />
      </div>
      {password && (
        <p className="text-xs mt-1" style={{ color: info.color }}>
          {t('shared.passwordStrength', { label: info.label })}
        </p>
      )}
    </motion.div>
  );
}
