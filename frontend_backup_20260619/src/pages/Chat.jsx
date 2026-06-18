// frontend/src/pages/Chat.jsx
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../api/chat';
import ChatWindow from '../components/chat/ChatWindow';
import ConversationList from '../components/chat/ConversationList';
import CreateGroupModal from '../components/chat/CreateGroupModal';
import StartConversationModal from '../components/chat/StartConversationModal';

export default function Chat() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [groups, setGroups]               = useState([]);
  const [activeChat, setActiveChat]       = useState(null);
  const [activeTab, setActiveTab]         = useState('all');
  const [loadingList, setLoadingList]     = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showStartConv, setShowStartConv]    = useState(false);
  const [searchQuery, setSearchQuery]        = useState('');

  // On mobile: 'list' shows conversation list, 'chat' shows chat window
  const [mobileView, setMobileView] = useState('list');

  const loadChats = useCallback(async () => {
    setLoadingList(true);
    try {
      const [convRes, groupRes] = await Promise.all([chatAPI.getConversations(), chatAPI.getGroups()]);
      setConversations(Array.isArray(convRes.data) ? convRes.data : (convRes.data.results ?? []));
      setGroups(Array.isArray(groupRes.data) ? groupRes.data : (groupRes.data.results ?? []));
    } catch (err) { console.error('[Chat] Failed to load chat list:', err); }
    finally { setLoadingList(false); }
  }, []);

  useEffect(() => { loadChats(); }, [loadChats]);

  // Auto-open DM passed from UserPublicProfile
  useEffect(() => {
    if (location.state?.openDM) {
      setActiveChat(location.state.openDM);
      setMobileView('chat');
    }
  }, [location.state]);

  const selectConversation = (conv) => {
    setActiveChat({ type: 'dm', id: conv.id, otherUser: conv.other_user });
    setMobileView('chat');
    setTimeout(loadChats, 1500);
  };

  const selectGroup = (group) => {
    setActiveChat({ type: 'group', id: group.id, group: { id: group.id, name: group.name, description: group.description, member_count: group.member_count } });
    setMobileView('chat');
  };

  const handleNewConversation = (chatObj) => {
    setActiveChat(chatObj);
    setMobileView('chat');
    setTimeout(loadChats, 1500);
  };

  const handleGroupCreated = (newGroup) => {
    setShowCreateGroup(false);
    const chatObj = { type: 'group', id: newGroup.id, group: { id: newGroup.id, name: newGroup.name, description: newGroup.description, member_count: newGroup.member_count } };
    setGroups((prev) => [newGroup, ...prev]);
    setActiveChat(chatObj);
    setMobileView('chat');
  };

  const handleBackToList = () => {
    setMobileView('list');
    setActiveChat(null);
  };

  const q = searchQuery.toLowerCase();
  const filteredConvs = conversations.filter((c) => {
    const name = `${c.other_user?.first_name ?? ''} ${c.other_user?.last_name ?? ''} ${c.other_user?.email ?? ''}`.toLowerCase();
    return name.includes(q);
  });
  const filteredGroups = groups.filter((g) => g.name?.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q));

  const chatName = activeChat?.type === 'dm'
    ? `${activeChat.otherUser?.first_name ?? ''} ${activeChat.otherUser?.last_name ?? ''}`.trim() || activeChat.otherUser?.email
    : (activeChat?.group?.name ?? 'Group');

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-[#F2DDD8]" id="chat-page">

      {/* ── SIDEBAR / CONVERSATION LIST ── */}
      {/* Desktop: always visible. Mobile: full-screen when mobileView === 'list' */}
      <aside className={`
        flex flex-col bg-[#4B5563] border-r border-[#374151] shadow-sm
        w-full md:w-80 md:min-w-[20rem] md:flex
        ${mobileView === 'list' ? 'flex' : 'hidden md:flex'}
      `}>

        <div className="px-4 pt-5 pb-3 border-b border-[#374151]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">{t('chat.title')}</h1>
            <div className="flex gap-1 items-center">
              <button id="new-dm-btn" onClick={() => setShowStartConv(true)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-[#D1D5DB]" title="New conversation">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </button>
              <button id="create-group-btn" onClick={() => setShowCreateGroup(true)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-[#D1D5DB]" title="Create group">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D1D5DB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input id="chat-search" type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('chat.searchConversations')}
              className="w-full pl-9 pr-4 py-2 bg-white/10 rounded-xl text-sm text-white placeholder-[#D1D5DB] outline-none focus:bg-white/20 focus:ring-2 focus:ring-[#C26100] transition-all" />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-3 p-1 bg-black/20 rounded-xl">
            {[{ id: 'all', label: 'All' }, { id: 'dms', label: 'DMs' }, { id: 'groups', label: 'Groups' }].map((tab) => (
              <button key={tab.id} id={`tab-${tab.id}`} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#ffffff20] to-[#ec489930] text-white shadow-sm'
                    : 'text-[#D1D5DB] hover:text-white'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-6 h-6 border-4 border-[#C26100] border-t-transparent rounded-full" />
            </div>
          ) : (
            <ConversationList
              conversations={activeTab !== 'groups' ? filteredConvs : []}
              groups={activeTab !== 'dms' ? filteredGroups : []}
              activeChat={activeChat} activeTab={activeTab}
              onSelectConversation={selectConversation} onSelectGroup={selectGroup} />
          )}
        </div>
      </aside>

      {/* ── MAIN PANEL / CHAT WINDOW ── */}
      {/* Desktop: always visible. Mobile: full-screen when mobileView === 'chat' */}
      <main className={`
        flex-1 flex flex-col min-w-0 relative
        ${mobileView === 'chat' ? 'flex' : 'hidden md:flex'}
      `}>

        {/* Mobile top bar: back arrow + chat name */}
        {activeChat && (
          <div className="md:hidden flex items-center gap-3 px-3 py-3 border-b bg-[#d8e4f0] border-[#a8c4dc]">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-1.5 text-[#1e3a5f] hover:opacity-70 transition-opacity"
              title="Back to conversations"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Chats</span>
            </button>
            <span className="flex-1 text-sm font-semibold text-[#1e3a5f] truncate">{chatName}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeChat ? (
            <motion.div key={`${activeChat.type}-${activeChat.id}-${activeChat.otherUser?.id}`}
              className="flex-1 flex flex-col min-h-0"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <ChatWindow chat={activeChat} onNewConversation={handleNewConversation}
                onUpdate={() => { loadChats(); setActiveChat(null); setMobileView('list'); }} />
            </motion.div>
          ) : (
            <motion.div key="empty" className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-inner"
                style={{ background: 'linear-gradient(135deg, #C26100, #E07A1B)' }}>
                💬
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2 text-[#3d4a00]">{t('chat.yourMessages')}</h2>
                <p className="text-sm max-w-xs leading-relaxed text-[#5a6600]">
                  Select a conversation on the left, or start a new one to connect with the community.
                </p>
              </div>
              <div className="flex gap-3">
                <button id="empty-new-dm-btn" onClick={() => setShowStartConv(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#C26100] to-[#E07A1B] text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
                  New Message
                </button>
                <button id="empty-create-group-btn" onClick={() => setShowCreateGroup(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
                  Create Group
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showCreateGroup && <CreateGroupModal key="create-group" onClose={() => setShowCreateGroup(false)} onCreated={handleGroupCreated} />}
        {showStartConv && <StartConversationModal key="start-conv" onClose={() => setShowStartConv(false)}
          onStarted={(chatObj) => { setShowStartConv(false); handleNewConversation(chatObj); }} />}
      </AnimatePresence>
    </div>
  );
}
