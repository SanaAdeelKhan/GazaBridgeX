// frontend/src/pages/Mission.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import colors from '../theme/colors';
import SEO from '../components/SEO';
import { useAppTranslation } from '../hooks/useAppTranslation';

const missionPoints = [
  {
    title: 'Free Education for All',
    description: 'We believe that financial barriers should never prevent anyone from accessing quality education and building a better future.',
    icon: 'ðŸŽ“',
  },
  {
    title: 'Bridge the Digital Divide',
    description: 'By connecting skilled volunteers with learners in Gaza, we create pathways to the global digital economy.',
    icon: 'ðŸŒ‰',
  },
  {
    title: 'Empower Through Skills',
    description: 'Digital skills open doors to remote work, freelancing, and entrepreneurship â€” creating sustainable livelihoods.',
    icon: 'ðŸ’ª',
  },
  {
    title: 'Build Global Community',
    description: 'We foster cross-cultural connections and understanding through shared learning and mutual support.',
    icon: 'ðŸŒ',
  },
  {
    title: 'Create Lasting Impact',
    description: 'When one person learns, they teach others. We create ripple effects that strengthen entire communities.',
    icon: 'ðŸŽ¯',
  },
  {
    title: 'Maintain Transparency',
    description: 'We operate with complete transparency â€” no hidden costs, no premium features, just genuine help.',
    icon: 'âœ¨',
  },
];

export default function Mission() {
  const { t, language } = useAppTranslation();
  const pointTranslations = language === 'ar'
    ? [
      ['ØªØ¹Ù„ÙŠÙ… Ù…Ø¬Ø§Ù†ÙŠ Ù„Ù„Ø¬Ù…ÙŠØ¹', 'Ù†Ø¤Ù…Ù† Ø¨Ø£Ù† Ø§Ù„Ø¹ÙˆØ§Ø¦Ù‚ Ø§Ù„Ù…Ø§Ù„ÙŠØ© ÙŠØ¬Ø¨ Ø£Ù„Ø§ ØªÙ…Ù†Ø¹ Ø£ÙŠ Ø´Ø®Øµ Ù…Ù† Ø§Ù„ÙˆØµÙˆÙ„ Ø¥Ù„Ù‰ Ø§Ù„ØªØ¹Ù„ÙŠÙ… Ø§Ù„Ø¬ÙŠØ¯ ÙˆØ¨Ù†Ø§Ø¡ Ù…Ø³ØªÙ‚Ø¨Ù„ Ø£ÙØ¶Ù„.'],
      ['Ø³Ø¯ Ø§Ù„ÙØ¬ÙˆØ© Ø§Ù„Ø±Ù‚Ù…ÙŠØ©', 'Ù…Ù† Ø®Ù„Ø§Ù„ Ø±Ø¨Ø· Ø§Ù„Ù…ØªØ·ÙˆØ¹ÙŠÙ† Ø§Ù„Ù…Ù‡Ø±Ø© Ø¨Ø§Ù„Ù…ØªØ¹Ù„Ù…ÙŠÙ† ÙÙŠ ØºØ²Ø©ØŒ Ù†ÙØªØ­ Ø·Ø±Ù‚Ø§Ù‹ Ø¥Ù„Ù‰ Ø§Ù„Ø§Ù‚ØªØµØ§Ø¯ Ø§Ù„Ø±Ù‚Ù…ÙŠ Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ.'],
      ['Ø§Ù„ØªÙ…ÙƒÙŠÙ† Ù…Ù† Ø®Ù„Ø§Ù„ Ø§Ù„Ù…Ù‡Ø§Ø±Ø§Øª', 'ØªÙØªØ­ Ø§Ù„Ù…Ù‡Ø§Ø±Ø§Øª Ø§Ù„Ø±Ù‚Ù…ÙŠØ© Ø£Ø¨ÙˆØ§Ø¨ Ø§Ù„Ø¹Ù…Ù„ Ø¹Ù† Ø¨ÙØ¹Ø¯ ÙˆØ§Ù„Ø¹Ù…Ù„ Ø§Ù„Ø­Ø± ÙˆØ±ÙŠØ§Ø¯Ø© Ø§Ù„Ø£Ø¹Ù…Ø§Ù„ØŒ Ù…Ù…Ø§ ÙŠØ®Ù„Ù‚ Ø³Ø¨Ù„ Ø¹ÙŠØ´ Ù…Ø³ØªØ¯Ø§Ù…Ø©.'],
      ['Ø¨Ù†Ø§Ø¡ Ù…Ø¬ØªÙ…Ø¹ Ø¹Ø§Ù„Ù…ÙŠ', 'Ù†Ø¹Ø²Ø² Ø§Ù„ØªÙˆØ§ØµÙ„ ÙˆØ§Ù„ØªÙØ§Ù‡Ù… Ø¨ÙŠÙ† Ø§Ù„Ø«Ù‚Ø§ÙØ§Øª Ù…Ù† Ø®Ù„Ø§Ù„ Ø§Ù„ØªØ¹Ù„Ù… Ø§Ù„Ù…Ø´ØªØ±Ùƒ ÙˆØ§Ù„Ø¯Ø¹Ù… Ø§Ù„Ù…ØªØ¨Ø§Ø¯Ù„.'],
      ['Ø¥Ø­Ø¯Ø§Ø« Ø£Ø«Ø± Ù…Ø³ØªØ¯Ø§Ù…', 'Ø¹Ù†Ø¯Ù…Ø§ ÙŠØªØ¹Ù„Ù… Ø´Ø®Øµ ÙˆØ§Ø­Ø¯ØŒ ÙØ¥Ù†Ù‡ ÙŠØ¹Ù„Ù‘Ù… Ø§Ù„Ø¢Ø®Ø±ÙŠÙ†. Ù†Ø®Ù„Ù‚ Ø¢Ø«Ø§Ø±Ø§Ù‹ Ù…Ù…ØªØ¯Ø© ØªÙ‚ÙˆÙŠ Ø§Ù„Ù…Ø¬ØªÙ…Ø¹Ø§Øª Ø¨Ø£ÙƒÙ…Ù„Ù‡Ø§.'],
      ['Ø§Ù„Ø´ÙØ§ÙÙŠØ©', 'Ù†Ø¹Ù…Ù„ Ø¨Ø´ÙØ§ÙÙŠØ© ÙƒØ§Ù…Ù„Ø©ØŒ Ø¨Ù„Ø§ ØªÙƒØ§Ù„ÙŠÙ Ø®ÙÙŠØ© Ø£Ùˆ Ù…ÙŠØ²Ø§Øª Ù…Ø¯ÙÙˆØ¹Ø©ØŒ Ø¨Ù„ Ù†Ù‚Ø¯Ù… Ù…Ø³Ø§Ø¹Ø¯Ø© Ø­Ù‚ÙŠÙ‚ÙŠØ©.'],
    ]
    : missionPoints.map(point => [point.title, point.description]);
  return (
    <div className="pt-24">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundColor: colors.primaryLight }} />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 border"
              style={{ backgroundColor: colors.goldLight, color: colors.headingDark, borderColor: colors.gold }}
            >
              {t('landing.ourPurpose')}
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ color: colors.headingDark }}>
              {t('landing.ourMission')}
            </h1>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: colors.body }}>
              {t('landing.missionIntro')}
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-12 shadow-lg border border-gray-100"
            >
              <h2 className="text-3xl font-bold mb-6" style={{ color: colors.headingDark }}>{t('landing.whatTryingToDo')}</h2>
              <div className="space-y-4 text-lg leading-relaxed" style={{ color: colors.body }}>
                <p>
                  {t('landing.missionParagraph1')}
                </p>
                <p>
                  {t('landing.missionParagraph2')}
                </p>
                <p>
                  {t('landing.bridgeGap')}
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>{t('landing.volunteersShare')}</li>
                  <li>{t('landing.freeEducation')}</li>
                  <li>{t('landing.humanConnections')}</li>
                  <li>{t('landing.careerOpportunities')}</li>
                  <li>{t('landing.strongerCommunities')}</li>
                </ul>
                <p>
                  {t('landing.missionVision')}
                </p>
              </div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {missionPoints.map((point, index) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-500 text-center"
              >
                <div className="text-4xl mb-4">{point.icon}</div>
                <h3 className="text-xl font-bold mb-3" style={{ color: colors.headingDark }}>{pointTranslations[index][0]}</h3>
                <p style={{ color: colors.body }}>{pointTranslations[index][1]}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-20"
          >
            <h2 className="text-3xl font-bold mb-6" style={{ color: colors.headingDark }}>{t('landing.joinMission')}</h2>
            <p className="text-xl mb-8" style={{ color: colors.body }}>{t('landing.together')}</p>
            <Link to="/#">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 text-white font-semibold rounded-full shadow-lg"
                style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})` }}
              >
                {t('landing.getInvolved')}
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
