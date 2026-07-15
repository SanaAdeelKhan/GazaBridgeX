// frontend/src/components/PostCard.jsx
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import colors from '../theme/colors';

const CATEGORY_ICONS = {
  learn_language: '🗣️',
  learn_tech_ai: '🤖',
  career_cv_help: '💼',
  mental_health_support: '🧠',
  academic_tuition: '📖',
  creative_skill: '🎨',
  others: '📌',
};

const CATEGORY_LABELS = {
  learn_language: 'Learn a Language',
  learn_tech_ai: 'Learn Tech / AI',
  career_cv_help: 'Career / CV Help',
  mental_health_support: 'Mental Health Support',
  academic_tuition: 'Academic Tuition',
  creative_skill: 'Creative Skill',
  others: 'Others',
};

// Some descriptions have literal "\n" (backslash-n) characters instead of real line breaks
const cleanText = (text) => (text ? text.replace(/\\n/g, '\n') : text);

export default function PostCard({ post, type, index, canEdit, canDelete, isOwnPost, onEdit, onDelete }) {
  const navigate = useNavigate();
  const name = type === 'offer' ? post.offer_name : post.request_name;

  const handleMessage = () => {
    const [first_name, ...rest] = (post.user_full_name || '').split(' ');
    navigate('/chat', {
      state: {
        startChatWith: {
          id: post.user,
          email: post.user_email,
          first_name: first_name || '',
          last_name: rest.join(' ') || '',
        },
      },
    });
  };
  const cleanDescription = cleanText(post.description);

  const statusStyle = {
    active:   { backgroundColor: colors.successBg,  color: colors.success },
    inactive: { backgroundColor: colors.pageBg,      color: colors.muted },
    closed:   { backgroundColor: colors.errorBg,     color: colors.error },
  }[post.status] || { backgroundColor: colors.successBg, color: colors.success };

  const typeBadgeStyle = type === 'offer'
    ? { backgroundColor: colors.goldLight,    color: colors.goldHover }
    : { backgroundColor: colors.primaryLight, color: colors.primary };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="flex items-center gap-4 py-4 px-2 transition-colors"
      style={{ borderBottom: `1px solid ${colors.divider}` }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.pageBg}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: type === 'offer' ? colors.goldLight : colors.primaryLight }}
      >
        {CATEGORY_ICONS[post.category] || '📌'}
      </div>

      {/* Title + category */}
      <div className="min-w-0" style={{ flex: '2 1 0%' }}>
        <div className="flex items-center gap-2 flex-wrap">
          {type === 'offer' ? (
            <Link to={`/offers/${post.id}`}>
              <span
                className="font-semibold transition-colors"
                style={{ color: colors.title }}
                onMouseEnter={e => e.currentTarget.style.color = colors.gold}
                onMouseLeave={e => e.currentTarget.style.color = colors.title}
              >
                {name}
              </span>
            </Link>
          ) : (
            <span className="font-semibold" style={{ color: colors.title }}>{name}</span>
          )}
          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={typeBadgeStyle}>
            {type === 'offer' ? 'Offer' : 'Request'}
          </span>
        </div>
        <p className="text-sm truncate" style={{ color: colors.muted }}>
          {CATEGORY_LABELS[post.category] || post.category}
        </p>
      </div>

      {/* Description (hidden on small screens) */}
      <p
        className="hidden md:block text-sm truncate cursor-help"
        style={{ flex: '3 1 0%', color: colors.body }}
        title={cleanDescription}
      >
        {cleanDescription}
      </p>

      {/* Author + date */}
      <div className="hidden sm:flex items-center gap-2 flex-shrink-0" style={{ width: 160 }}>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: colors.primary }}
        >
          {post.user_full_name?.split(' ').map(n => n[0]).join('') || 'U'}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium truncate" style={{ color: colors.title }}>{post.user_full_name}</p>
          <p className="text-xs" style={{ color: colors.muted }}>
            {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Status */}
      <span className="px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0" style={statusStyle}>
        {post.status}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {type === 'offer' && (
          <Link
            to={`/offers/${post.id}`}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ backgroundColor: colors.goldLight, color: colors.goldHover }}
          >
            View
          </Link>
        )}
        {!isOwnPost && (
          <button
            onClick={handleMessage}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ backgroundColor: colors.primaryLight, color: colors.primary }}
          >
            Message
          </button>
        )}
        {canEdit && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(post)}
            className="p-2 rounded-lg transition-all"
            style={{ color: colors.muted }}
            onMouseEnter={e => { e.currentTarget.style.color = colors.primary; e.currentTarget.style.backgroundColor = colors.primaryLight; }}
            onMouseLeave={e => { e.currentTarget.style.color = colors.muted; e.currentTarget.style.backgroundColor = 'transparent'; }}
            title="Edit post"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </motion.button>
        )}
        {canDelete && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(post.id)}
            className="p-2 rounded-lg transition-all"
            style={{ color: colors.muted }}
            onMouseEnter={e => { e.currentTarget.style.color = colors.error; e.currentTarget.style.backgroundColor = colors.errorBg; }}
            onMouseLeave={e => { e.currentTarget.style.color = colors.muted; e.currentTarget.style.backgroundColor = 'transparent'; }}
            title="Delete post"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
