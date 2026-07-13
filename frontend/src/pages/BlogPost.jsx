// frontend/src/pages/BlogPost.jsx
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogPosts } from '../data/blog';
import colors from '../theme/colors';

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: colors.headingDark }}>Post Not Found</h1>
          <Link to="/blog" className="font-semibold" style={{ color: colors.gold }}>
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24">
      <article className="relative py-20">
        <div className="absolute inset-0" style={{ backgroundColor: colors.primaryLight }} />
        <div className="relative max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 font-semibold mb-8 transition-colors"
              style={{ color: colors.gold }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>

            <div className="text-6xl mb-6">{post.image}</div>

            <div className="flex items-center gap-4 text-sm mb-6" style={{ color: colors.muted }}>
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readTime}</span>
              <span>•</span>
              <span>By {post.author}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-8" style={{ color: colors.headingDark }}>
              {post.title}
            </h1>

            <div className="prose prose-lg max-w-none">
              {post.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="leading-relaxed mb-6 text-lg" style={{ color: colors.body }}>
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-16 p-8 rounded-2xl border text-center" style={{ backgroundColor: colors.goldLight, borderColor: colors.gold }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: colors.headingDark }}>Want to get involved?</h3>
              <p className="mb-6" style={{ color: colors.body }}>Join our community of volunteers and learners making a difference.</p>
              <Link
                to="/#"
                className="inline-block px-8 py-4 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
                style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldHover})` }}
              >
                Get Started Free
              </Link>
            </div>
          </motion.div>
        </div>
      </article>
    </div>
  );
}
