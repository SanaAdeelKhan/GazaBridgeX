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
      style={{ backgroundColor: colors.primaryLight }}
    >
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-8 rounded-2xl flex items-center justify-center border-2 bg-white p-3"
          style={{ borderColor: colors.gold, width: '220px', height: '140px' }}
        >
          <img src="/logo-full.png" alt="GazaBridge" className="w-full h-full object-contain" />
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
          style={{ color: colors.body }}
        >
          Building bridges through education...
        </motion.p>
      </div>
    </motion.div>
  );
}
