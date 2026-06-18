// frontend/src/components/chat/ConversationList.jsx
import { motion } from 'framer-motion';

export default function ConversationList({ conversations, groups, activeChat, activeTab, onSelectConversation, onSelectGroup }) {
  return (
    <div className="divide-y divide-[#374151]">
      {/* Direct Messages */}
      {(activeTab === 'all' || activeTab === 'dms') && conversations.map(conv => (
        <motion.button
          key={`dm-${conv.id}`}
          onClick={() => onSelectConversation(conv)}
          className={`w-full p-4 text-left transition-colors border-l-4 ${
            activeChat?.type === 'dm' && activeChat?.id === conv.id
              ? 'border-[#C26100] bg-white/10'
              : 'border-transparent hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #C26100, #E07A1B)' }}>
              {conv.other_user?.first_name?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white truncate">
                  {conv.other_user?.first_name} {conv.other_user?.last_name}
                </span>
                {conv.unread_count > 0 && (
                  <span className="text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2" style={{ backgroundColor: '#EC4899' }}>
                    {conv.unread_count}
                  </span>
                )}
              </div>
              <p className="text-sm text-[#D1D5DB] truncate">
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
          onClick={() => onSelectGroup(group)}
          className={`w-full p-4 text-left transition-colors border-l-4 ${
            activeChat?.type === 'group' && activeChat?.id === group.id
              ? 'border-[#C26100] bg-white/10'
              : 'border-transparent hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {group.name[0]?.toUpperCase() || 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white truncate">{group.name}</span>
                <span className="text-xs text-[#D1D5DB] ml-2">{group.member_count} members</span>
              </div>
              <p className="text-sm text-[#D1D5DB] truncate">{group.description || 'Group chat'}</p>
            </div>
          </div>
        </motion.button>
      ))}

      {conversations.length === 0 && groups.length === 0 && (
        <div className="text-center py-12 text-[#D1D5DB]">
          <p>No conversations yet</p>
        </div>
      )}
    </div>
  );
}
