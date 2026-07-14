// frontend/src/components/chat/ConversationList.jsx
import { motion } from 'framer-motion';
import colors from '../../theme/colors';

export default function ConversationList({ conversations, groups, activeChat, activeTab, onSelectConversation, onSelectGroup }) {
  return (
    <div className="divide-y divide-gray-100">
      {/* Direct Messages */}
      {(activeTab === 'all' || activeTab === 'dms') && conversations.map(conv => (
        <motion.button
          key={`dm-${conv.id}`}
          whileHover={{ backgroundColor: '#f9fafb' }}
          onClick={() => onSelectConversation(conv)}
          className="w-full p-4 text-left transition-colors border-l-4"
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
          </div>
        </motion.button>
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
