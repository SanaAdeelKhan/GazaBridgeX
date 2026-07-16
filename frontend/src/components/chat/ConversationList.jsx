// frontend/src/components/chat/ConversationList.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import colors from '../../theme/colors';
import { chatAPI } from '../../api/chat';

export default function ConversationList({ conversations, groups, activeChat, activeTab, onSelectConversation, onSelectGroup }) {
  const [notifyStatus, setNotifyStatus] = useState({}); // { [convId]: 'sending' | 'sent' | 'cooldown' | 'error' }

  const handleNotify = async (e, convId) => {
    e.stopPropagation();
    if (notifyStatus[convId] === 'sending') return;

    setNotifyStatus(prev => ({ ...prev, [convId]: 'sending' }));
    try {
      await chatAPI.notifyConversation(convId);
      setNotifyStatus(prev => ({ ...prev, [convId]: 'sent' }));
    } catch (err) {
      if (err.response?.status === 429) {
        setNotifyStatus(prev => ({ ...prev, [convId]: 'cooldown' }));
      } else {
        setNotifyStatus(prev => ({ ...prev, [convId]: 'error' }));
        setTimeout(() => {
          setNotifyStatus(prev => (prev[convId] === 'error' ? { ...prev, [convId]: undefined } : prev));
        }, 3000);
      }
    }
  };

  return (
    <div className="divide-y divide-gray-100">
      {/* Direct Messages */}
      {(activeTab === 'all' || activeTab === 'dms') && conversations.map(conv => (
        <motion.div
          key={`dm-${conv.id}`}
          role="button"
          tabIndex={0}
          whileHover={{ backgroundColor: '#f9fafb' }}
          onClick={() => onSelectConversation(conv)}
          className="w-full p-4 text-left transition-colors border-l-4 cursor-pointer"
          style={
            activeChat?.type === 'dm' && activeChat?.id === conv.id
              ? { backgroundColor: colors.goldLight, borderColor: colors.gold }
              : { borderColor: 'transparent' }
          }
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ backgroundColor: colors.primary }}>
              {conv.other_user?.first_name?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold truncate" style={{ color: colors.headingDark }}>
                  {conv.other_user?.first_name} {conv.other_user?.last_name}
                </span>
                {conv.unread_count > 0 && (
                  <span className="text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2" style={{ backgroundColor: colors.error }}>
                    {conv.unread_count}
                  </span>
                )}
              </div>
              <p className="text-sm truncate" style={{ color: colors.muted }}>
                {conv.last_message?.content || 'Start a conversation'}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => handleNotify(e, conv.id)}
              disabled={notifyStatus[conv.id] === 'sending' || notifyStatus[conv.id] === 'cooldown'}
              title={
                notifyStatus[conv.id] === 'sent' ? 'Email sent!' :
                notifyStatus[conv.id] === 'cooldown' ? 'Already notified recently' :
                notifyStatus[conv.id] === 'error' ? 'Failed to send' :
                'Notify by email'
              }
              className="flex-shrink-0 p-2 rounded-lg transition-colors disabled:opacity-50"
              style={{
                color:
                  notifyStatus[conv.id] === 'sent' ? colors.olive :
                  notifyStatus[conv.id] === 'error' ? colors.error :
                  notifyStatus[conv.id] === 'cooldown' ? colors.gold :
                  colors.muted,
              }}
            >
              {notifyStatus[conv.id] === 'sending' ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : notifyStatus[conv.id] === 'sent' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </motion.div>
      ))}

      {/* Groups */}
      {(activeTab === 'all' || activeTab === 'groups') && groups.map(group => (
        <motion.button
          key={`group-${group.id}`}
          whileHover={{ backgroundColor: '#f9fafb' }}
          onClick={() => onSelectGroup(group)}
          className="w-full p-4 text-left transition-colors border-l-4"
          style={
            activeChat?.type === 'group' && activeChat?.id === group.id
              ? { backgroundColor: colors.primaryLight, borderColor: colors.primary }
              : { borderColor: 'transparent' }
          }
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ backgroundColor: colors.primary }}>
              {group.name[0]?.toUpperCase() || 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold truncate" style={{ color: colors.headingDark }}>{group.name}</span>
                <span className="text-xs ml-2" style={{ color: colors.muted }}>{group.member_count} members</span>
              </div>
              <p className="text-sm truncate" style={{ color: colors.muted }}>{group.description || 'Group chat'}</p>
            </div>
          </div>
        </motion.button>
      ))}

      {conversations.length === 0 && groups.length === 0 && (
        <div className="text-center py-12" style={{ color: colors.muted }}>
          <p>No conversations yet</p>
        </div>
      )}
    </div>
  );
}
