// frontend/src/pages/Mission.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import colors from '../theme/colors';

const missionPoints = [
  {
    title: 'Free Education for All',
    description: 'We believe that financial barriers should never prevent anyone from accessing quality education and building a better future.',
    icon: '🎓',
  },
  {
    title: 'Bridge the Digital Divide',
    description: 'By connecting skilled volunteers with learners in Gaza, we create pathways to the global digital economy.',
    icon: '🌉',
  },
  {
    title: 'Empower Through Skills',
    description: 'Digital skills open doors to remote work, freelancing, and entrepreneurship — creating sustainable livelihoods.',
    icon: '💪',
  },
  {
    title: 'Build Global Community',
    description: 'We foster cross-cultural connections and understanding through shared learning and mutual support.',
    icon: '🌍',
  },
  {
    title: 'Create Lasting Impact',
    description: 'When one person learns, they teach others. We create ripple effects that strengthen entire communities.',
    icon: '🎯',
  },
  {
    title: 'Maintain Transparency',
    description: 'We operate with complete transparency — no hidden costs, no premium features, just genuine help.',
    icon: '✨',
  },
];

export default function Mission() {
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
              Our Purpose
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ color: colors.headingDark }}>
              Our <span style={{ color: colors.gold }}>Mission</span>
            </h1>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: colors.body }}>
              We're on a mission to democratize digital education and create opportunities for people in Gaza.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-12 shadow-lg border border-gray-100"
            >
              <h2 className="text-3xl font-bold mb-6" style={{ color: colors.headingDark }}>What We're Trying to Do</h2>
              <div className="space-y-4 text-lg leading-relaxed" style={{ color: colors.body }}>
                <p>
                  GazaBridge exists to solve a critical problem: talented individuals in Gaza have the drive and
                  potential to build digital careers, but lack access to structured training, mentorship, and
                  professional networks.
                </p>
                <p>
                  At the same time, thousands of skilled professionals worldwide want to make a meaningful
                  difference but don't know how to connect with those who need their expertise most.
                </p>
                <p>
                  We bridge this gap by creating a platform where:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Volunteers can easily share their skills with eager learners</li>
                  <li>People in Gaza can access free, quality digital education</li>
                  <li>Learning happens through real human connections, not just content</li>
                  <li>Career opportunities are created through mentorship and guidance</li>
                  <li>Communities grow stronger through knowledge sharing</li>
                </ul>
                <p>
                  Our vision is a world where every person in Gaza has the digital skills they need to build a
                  sustainable, prosperous future — regardless of their economic circumstances.
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
                <h3 className="text-xl font-bold mb-3" style={{ color: colors.headingDark }}>{point.title}</h3>
                <p style={{ color: colors.body }}>{point.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-20"
          >
            <h2 className="text-3xl font-bold mb-6" style={{ color: colors.headingDark }}>Join Our Mission</h2>
            <p className="text-xl mb-8" style={{ color: colors.body }}>Together, we can make digital education accessible to all.</p>
            <Link to="/#">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 text-white font-semibold rounded-full shadow-lg"
                style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})` }}
              >
                Get Involved
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
