// frontend/src/pages/CookiePolicy.jsx
import { motion } from 'framer-motion';
import colors from '../theme/colors';

export default function CookiePolicy() {
  return (
    <div className="pt-24">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundColor: colors.primaryLight }} />
        <div className="relative max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ color: colors.headingDark }}>
              Cookie <span style={{ color: colors.gold }}>Policy</span>
            </h1>
            <p className="mb-12" style={{ color: colors.muted }}>Last updated: July 2026</p>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: colors.headingDark }}>What Are Cookies?</h2>
                <p className="leading-relaxed" style={{ color: colors.body }}>
                  Cookies are small text files stored on your device when you visit websites. They help websites
                  remember your preferences and improve your browsing experience.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: colors.headingDark }}>How We Use Cookies</h2>
                <p className="leading-relaxed mb-4" style={{ color: colors.body }}>
                  GazaBridge uses only essential cookies to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4" style={{ color: colors.body }}>
                  <li>Maintain your login session</li>
                  <li>Remember your preferences</li>
                  <li>Ensure platform security</li>
                  <li>Improve platform functionality</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: colors.headingDark }}>Types of Cookies We Use</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold" style={{ color: colors.headingDark }}>Session Cookies</h3>
                    <p style={{ color: colors.body }}>Temporary cookies that expire when you close your browser. These are essential for platform functionality.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: colors.headingDark }}>Authentication Cookies</h3>
                    <p style={{ color: colors.body }}>Used to keep you logged in and secure your account during your session.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: colors.headingDark }}>Third-Party Cookies</h2>
                <p className="leading-relaxed" style={{ color: colors.body }}>
                  We do not use third-party tracking cookies or analytics cookies. We respect your privacy and
                  minimize data collection.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: colors.headingDark }}>Managing Cookies</h2>
                <p className="leading-relaxed" style={{ color: colors.body }}>
                  You can control and delete cookies through your browser settings. However, disabling essential
                  cookies may affect platform functionality. Most browsers allow you to refuse cookies or alert
                  you when cookies are being sent.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: colors.headingDark }}>Contact</h2>
                <p className="leading-relaxed" style={{ color: colors.body }}>
                  For questions about our Cookie Policy, contact us at{' '}
                  <a href="mailto:gazabridgex@gmail.com" style={{ color: colors.gold }}>
                    gazabridgex@gmail.com
                  </a>
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
