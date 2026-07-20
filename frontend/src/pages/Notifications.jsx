// frontend/src/pages/Notifications.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

const NotificationIcon = ({ type }) => {
  const icons = {
    normal: '💬',
    alert: '⚠️',
    urgent: '🚨',
    announcement: '📢',
  };
  return <span className="text-xl">{icons[type] || '💬'}</span>;
};

const TimeAgo = ({ date }) => {
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return <span className="text-xs" style={{ color: colors.muted }}>{getTimeAgo(date)}</span>;
};

// Beautiful Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'delete' }) => {
  if (!isOpen) return null;

  const isDelete = type === 'delete';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: colors.card }}
      >
        {/* Decorative bar */}
        <div className="h-1" style={{ backgroundColor: isDelete ? colors.error : colors.gold }} />

        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: isDelete ? colors.errorBg : colors.goldLight }}
            >
              {isDelete ? (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke={colors.error}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke={colors.goldHover}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </motion.div>
          </div>

          {/* Title and Message */}
          <h3 className="text-xl font-bold text-center mb-2" style={{ color: colors.headingDark }}>{title}</h3>
          <p className="text-center mb-6" style={{ color: colors.muted }}>{message}</p>

          {/* Buttons */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 px-4 py-2.5 font-medium rounded-xl transition-colors"
              style={{ backgroundColor: colors.badgeNeutral, color: colors.body }}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 text-white font-medium rounded-xl hover:brightness-95 transition-all"
              style={{ backgroundColor: isDelete ? colors.error : colors.gold }}
            >
              Confirm
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// notification type badge colors
const TYPE_STYLE = {
  urgent:       { backgroundColor: colors.errorBg,     color: colors.error },
  alert:        { backgroundColor: colors.warningBg,   color: colors.warning },
  announcement: { backgroundColor: colors.primaryLight, color: colors.primary },
};

function NotificationCard({ notification, onMarkRead, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkRead(notification.id);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(notification.id);
    setIsDeleting(false);
    setShowDeleteModal(false);
  };

  const typeStyle = TYPE_STYLE[notification.type] || { backgroundColor: colors.badgeNeutral, color: colors.badgeNeutralText };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        layout
        onClick={handleClick}
        className="relative p-6 rounded-2xl border cursor-pointer transition-all duration-300 group"
        style={notification.is_read
          ? { backgroundColor: colors.card, borderColor: colors.cardBorder }
          : { backgroundColor: colors.goldLight, borderColor: colors.gold, boxShadow: '0 4px 10px rgba(212,160,23,0.15)' }
        }
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: colors.card }}>
            <NotificationIcon type={notification.type} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                {notification.type && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={typeStyle}>
                    {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                  </span>
                )}
                {!notification.is_read && (
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.gold }} />
                )}
              </div>
              <TimeAgo date={notification.created_at} />
            </div>

            <p
              className="text-sm leading-relaxed"
              style={notification.is_read ? { color: colors.muted } : { color: colors.body, fontWeight: 500 }}
            >
              {notification.content}
            </p>

            {notification.sender_name && (
              <p className="text-xs mt-2" style={{ color: colors.muted }}>
                From: {notification.sender_name}
                {notification.sender_role && ` (${notification.sender_role})`}
              </p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteModal(true);
            }}
            disabled={isDeleting}
            className="flex-shrink-0 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            style={{ color: colors.muted }}
            onMouseEnter={(e) => { e.currentTarget.style.color = colors.error; e.currentTarget.style.backgroundColor = colors.errorBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = colors.muted; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </motion.button>
        </div>
      </motion.div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        type="delete"
      />
    </>
  );
}

export default function Notifications() {
  const { user } = useAuth();
  const {
    notifications,
    loading,
    error,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // all, unread, urgent
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // Auto-clear the unread badge as soon as the notifications page is viewed
  useEffect(() => {
    markAllAsRead();
  }, []);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'urgent') return n.type === 'urgent';
    return true;
  });

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    await markAllAsRead();
    setActionLoading(false);
  };

  const handleDeleteAll = async () => {
    setActionLoading(true);
    await deleteAllNotifications();
    setActionLoading(false);
    setShowDeleteAllModal(false);
  };

  return (
    <div className="pt-24 min-h-screen" style={{ backgroundColor: colors.pageBg }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold" style={{ color: colors.headingDark }}>
                Notifications
              </h1>
              <p className="mt-1" style={{ color: colors.muted }}>
                Stay updated with your activity
              </p>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMarkAllRead}
                disabled={actionLoading || notifications.every(n => n.is_read)}
                className="px-4 py-2 text-sm font-medium rounded-xl border transition-colors disabled:opacity-50"
                style={{ backgroundColor: colors.goldLight, color: colors.goldHover, borderColor: colors.gold }}
              >
                Mark All Read
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteAllModal(true)}
                disabled={actionLoading || notifications.length === 0}
                className="px-4 py-2 text-sm font-medium rounded-xl border transition-colors disabled:opacity-50"
                style={{ backgroundColor: colors.errorBg, color: colors.error, borderColor: colors.error }}
              >
                Delete All
              </motion.button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'unread', label: 'Unread' },
              { value: 'urgent', label: 'Urgent' },
            ].map(f => {
              const isActive = filter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all border"
                  style={isActive
                    ? { backgroundColor: colors.gold, color: colors.white, borderColor: colors.gold, boxShadow: '0 4px 10px rgba(212,160,23,0.35)' }
                    : { backgroundColor: colors.card, color: colors.body, borderColor: colors.cardBorder }
                  }
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Notifications List */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl border"
            style={{ backgroundColor: colors.errorBg, borderColor: colors.error }}
          >
            <p className="text-sm" style={{ color: colors.error }}>{error}</p>
          </motion.div>
        )}

        <div className="space-y-4">
          <AnimatePresence>
            {filteredNotifications.map(notification => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {!loading && filteredNotifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-6">🔔</div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: colors.headingDark }}>No notifications</h3>
            <p style={{ color: colors.muted }}>
              {filter !== 'all'
                ? 'No notifications match your filter.'
                : 'You\'re all caught up!'}
            </p>
          </motion.div>
        )}

        {/* Load More */}
        {hasMore && filteredNotifications.length > 0 && (
          <div className="text-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadMore}
              disabled={loading}
              className="px-8 py-3 font-medium rounded-xl border shadow-sm disabled:opacity-50 transition-all"
              style={{ backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.body }}
              onMouseEnter={(e) => { e.currentTarget.style.color = colors.primary; e.currentTarget.style.borderColor = colors.primary; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = colors.body; e.currentTarget.style.borderColor = colors.cardBorder; }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading...
                </span>
              ) : (
                'Load More'
              )}
            </motion.button>
          </div>
        )}
      </div>

      {/* Delete All Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteAllModal}
        onClose={() => setShowDeleteAllModal(false)}
        onConfirm={handleDeleteAll}
        title="Delete All Notifications"
        message="Are you sure you want to delete all notifications? This action cannot be undone."
        type="delete"
      />
    </div>
  );
}
