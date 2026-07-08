// frontend/src/components/LoadingScreen.jsx
import { motion } from 'framer-motion';
import colors from '../theme/colors';

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: colors.pageBg }}
    >
      <div className="text-center">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center border-4 bg-white"
          style={{ borderColor: colors.gold }}
        >
          <img src="/images/logo-icon-only.png" alt="" className="w-14 h-14 object-contain" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold mb-2"
          style={{ color: colors.title }}
        >
          <span style={{ color: colors.primary }}>Gaza</span>
          <span style={{ color: colors.gold }}>Bridge</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ color: colors.muted }}
        >
          Building bridges through education...
        </motion.p>
      </div>
    </motion.div>
  );
}
