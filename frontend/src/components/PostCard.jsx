// frontend/src/components/PostCard.jsx
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
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

const AVAILABILITY_LABELS = {
  '1_2_hours': '1-2 hours/week',
  '3_5_hours': '3-5 hours/week',
  '6_8_hours': '6-8 hours/week',
  '8_10_hours': '8-10 hours/week',
  '10_plus_hours': '10+ hours/week',
};

export default function PostCard({ post, type, index, canEdit, canDelete, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const truncatedDescription = post.description?.length > 150
    ? post.description.substring(0, 150) + '...'
    : post.description;

  const name = type === 'offer' ? post.offer_name : post.request_name;

  // Status badge colors
  const statusStyle = {
    active:   { backgroundColor: colors.successBg,  color: colors.success, border: `1px solid ${colors.olive}` },
    inactive: { backgroundColor: colors.pageBg,      color: colors.muted,   border: `1px solid ${colors.divider}` },
    closed:   { backgroundColor: colors.errorBg,     color: colors.error,   border: `1px solid ${colors.error}` },
  }[post.status] || { backgroundColor: colors.successBg, color: colors.success, border: `1px solid ${colors.olive}` };

  // Type badge colors — logo-matched: Offer = gold hand, Request = navy hand
  const typeBadgeStyle = type === 'offer'
    ? { backgroundColor: colors.goldLight,    color: colors.goldHover, border: `1px solid ${colors.gold}` }
    : { backgroundColor: colors.primaryLight, color: colors.primary,  border: `1px solid ${colors.primary}` };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(26,82,118,0.13)' }}
      className="group relative rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: colors.white,
        border: `1.5px solid ${colors.divider}`,
        boxShadow: '0 2px 12px rgba(26,82,118,0.07)',
      }}
    >
      {/* Top accent line — gold for offer (giving hand), navy for request (receiving hand) */}
      <div style={{
        height: 4,
        backgroundColor: type === 'offer' ? colors.gold : colors.primary,
      }} />

      {/* Status Badge */}
      <div
        className="absolute top-6 right-4 px-3 py-1 rounded-full text-xs font-semibold"
        style={statusStyle}
      >
        {post.status}
      </div>

      {/* Type Badge */}
      <div className="absolute top-6 left-4">
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={typeBadgeStyle}
        >
          {type === 'offer' ? '🙌 Offer' : '🌟 Request'}
        </span>
      </div>

      <div className="p-6 pt-14">
        {/* Category Icon */}
        <div className="text-4xl mb-4">
          {CATEGORY_ICONS[post.category] || '📌'}
        </div>

        {/* Name */}
        {type === 'offer' ? (
          <Link to={`/offers/${post.id}`}>
            <h3
              className="text-xl font-bold mb-2 transition-colors"
              style={{ color: colors.body }}
              onMouseEnter={e => e.currentTarget.style.color = colors.gold}
              onMouseLeave={e => e.currentTarget.style.color = colors.body}
            >
              {name}
            </h3>
          </Link>
        ) : (
          <h3 className="text-xl font-bold mb-2" style={{ color: colors.body }}>
            {name}
          </h3>
        )}

        {/* Category */}
        <div className="mb-3">
          <span className="text-sm" style={{ color: colors.muted }}>
            {CATEGORY_LABELS[post.category] || post.category}
          </span>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-sm leading-relaxed" style={{ color: colors.body }}>
            {isExpanded ? post.description : truncatedDescription}
          </p>
          {post.description?.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm font-medium mt-1 transition-colors"
              style={{ color: colors.secondary }}
              onMouseEnter={e => e.currentTarget.style.color = colors.primary}
              onMouseLeave={e => e.currentTarget.style.color = colors.secondary}
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Availability (offers only) */}
        {type === 'offer' && post.availability && (
          <div className="mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: colors.olive }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm" style={{ color: colors.muted }}>
              {AVAILABILITY_LABELS[post.availability] || post.availability}
            </span>
          </div>
        )}

        {/* View Details (offers only) */}
        {type === 'offer' && (
          <Link
            to={`/offers/${post.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium transition-colors mt-2 mb-3"
            style={{ color: colors.gold }}
            onMouseEnter={e => e.currentTarget.style.color = colors.goldHover}
            onMouseLeave={e => e.currentTarget.style.color = colors.gold}
          >
            View Details
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        {/* Author row */}
        <div
          className="flex items-center gap-3 pt-4"
          style={{ borderTop: `1px solid ${colors.divider}` }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: colors.primary }}
          >
            {post.user_full_name?.split(' ').map(n => n[0]).join('') || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: colors.title }}>
              {post.user_full_name}
            </p>
            <p className="text-xs" style={{ color: colors.muted }}>
              {new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })}
            </p>
          </div>

          {/* Edit / Delete actions */}
          <div className={`flex gap-1 transition-opacity ${canEdit || canDelete ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
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
        </div>
      </div>
    </motion.div>
  );
}
