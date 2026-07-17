// frontend/src/components/chat/ChatWindow.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { chatAPI } from '../../api/chat';
import { useWebSocket } from '../../hooks/useWebSocket';
import GroupInfoModal from './GroupInfoModal';
import StartConversationModal from './StartConversationModal';
import colors from '../../theme/colors';

/**
 * ChatWindow
 * ----------
 * Handles both DM and group chats.
 *
 * chat prop shape:
 *   DM    → { type: 'dm',    id: <convId>, otherUser: { id, email, first_name, last_name } }
 *   Group → { type: 'group', id: <groupId>, group: { id, name, description, member_count } }
 *
 * WebSocket protocol (matches consumers.py):
 *   SEND:    { "content": "hello" }
 *   RECEIVE: { "id": 1, "sender_id": 5, "sender_email": "a@b.com", "content": "hello", "created_at": "..." }
 *         OR { "type": "error", "message": "..." }
 */
export default function ChatWindow({ chat, onNewConversation, onUpdate, onConversationCreated, onMessagesRead }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [wsStatus, setWsStatus] = useState('connecting');
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showStartConv, setShowStartConv] = useState(false);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  const wsPath = chat?.type === 'dm'
    ? `/ws/chat/${chat.otherUser?.id}/`
    : `/ws/chat/group/${chat?.id}/`;

  const markUnread = useCallback((msgs, isGroup) => {
    const toMark = msgs.filter((msg) => {
      const senderId = msg.sender_id ?? msg.sender;
      return !msg.is_read && senderId !== user?.id;
    });
    if (toMark.length === 0) return;
    Promise.all(
      toMark.map((msg) =>
        (isGroup ? chatAPI.markGroupMessageRead(msg.id) : chatAPI.markMessageRead(msg.id)).catch(() => {})
      )
    ).then(() => {
      onMessagesRead?.();
    });
  }, [user?.id, onMessagesRead]);

  const handleWsMessage = useCallback((data) => {
    if (data.type === 'error') {
      console.error('[Chat] WS error from server:', data.message);
      return;
    }
    setMessages((prev) => {
      if (data.id && prev.some((m) => m.id === data.id)) return prev;
      return [...prev, data];
    });
    if (data.id && chat?.type === 'dm' && !chat?.id) {
      onConversationCreated?.();
    }
    const senderId = data.sender_id ?? data.sender;
    if (data.id && senderId !== user?.id) {
      const isGroup = chat?.type === 'group';
      if (isGroup) {
        chatAPI.markGroupMessageRead(data.id).catch(() => {});
      } else {
        chatAPI.markMessageRead(data.id).catch(() => {});
      }
    }
  }, [user?.id, chat?.type, chat?.id, onConversationCreated]);

  const { sendMessage } = useWebSocket(wsPath, {
    enabled: !!chat,
    onMessage: handleWsMessage,
    onOpen: () => setWsStatus('open'),
    onClose: () => setWsStatus('closed'),
    onError: () => setWsStatus('closed'),
  });

  useEffect(() => {
    if (!chat) return;
    let cancelled = false;
    setMessages([]);
    setLoading(true);

    const fetchMessages = async () => {
      try {
        let res;
        if (chat.type === 'dm' && chat.id) {
          res = await chatAPI.getConversationMessages(chat.id, { page_size: 50 });
        } else if (chat.type === 'group') {
          res = await chatAPI.getGroupMessages(chat.id, { page_size: 50 });
        } else {
          if (!cancelled) setLoading(false);
          return;
        }
        if (!cancelled) {
          const data = res.data;
          const msgs = Array.isArray(data) ? data : (data.results || []);
          setMessages(msgs);
          markUnread(msgs, chat.type === 'group');
        }
      } catch (err) {
        console.error('[Chat] Failed to fetch message history:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMessages();
    return () => { cancelled = true; };
  }, [chat?.id, chat?.type, markUnread]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [chat?.id, chat?.type]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    sendMessage({ content: text });
    setInput('');
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isSameDay = (a, b) =>
    new Date(a).toDateString() === new Date(b).toDateString();

  const chatName = chat?.type === 'dm'
    ? `${chat.otherUser?.first_name ?? ''} ${chat.otherUser?.last_name ?? ''}`.trim() || chat.otherUser?.email
    : (chat?.group?.name ?? 'Group');

  const avatarLetter = chat?.type === 'dm'
    ? (chat.otherUser?.first_name?.[0] || '?').toUpperCase()
    : (chat?.group?.name?.[0] || 'G').toUpperCase();

  // WS status dot color
  const wsStatusColor = wsStatus === 'open'
    ? colors.gold
    : wsStatus === 'connecting'
      ? colors.warning
      : colors.error;

  return (
    <div className="flex-1 flex flex-col h-full" style={{ backgroundColor: colors.white }} id="chat-window">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 py-4 shadow-sm"
        style={{ borderBottom: `1px solid ${colors.divider}`, backgroundColor: colors.white }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
            style={{
              backgroundColor: chat?.type === 'dm' ? colors.gold : colors.primary
            }}
          >
            {avatarLetter}
          </div>
          <div>
            <h2 className="font-semibold leading-tight" style={{ color: colors.title }}>{chatName}</h2>
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{
                  backgroundColor: wsStatusColor,
                  animation: wsStatus === 'connecting' ? 'pulse 1.5s infinite' : 'none'
                }}
              />
              <span className="text-xs" style={{ color: colors.muted }}>
                {wsStatus === 'open' ? 'Connected' : wsStatus === 'connecting' ? 'Connecting…' : 'Disconnected'}
              </span>
              {chat?.type === 'group' && (
                <span className="text-xs ml-2" style={{ color: colors.muted }}>
                  · {chat?.group?.member_count ?? 0} members
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {chat?.type === 'dm' && (
            <button
              onClick={() => setShowStartConv(true)}
              className="p-2 rounded-xl transition-colors"
              style={{ color: colors.muted }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.primaryLight}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              title="New conversation"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
          {chat?.type === 'group' && (
            <button
              onClick={() => setShowGroupInfo(true)}
              className="p-2 rounded-xl transition-colors"
              style={{ color: colors.muted }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.primaryLight}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Group info"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Messages Area ──────────────────────────────────────────────── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        style={{ backgroundColor: colors.pageBg }}
        id="messages-area"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div
              className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full"
              style={{ borderColor: colors.primary, borderTopColor: 'transparent' }}
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: colors.muted }}>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{ backgroundColor: colors.primaryLight }}
            >
              {chat?.type === 'dm' ? '💬' : '👥'}
            </div>
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_id === user?.id || msg.sender === user?.id;
            const showDate =
              index === 0 ||
              !isSameDay(msg.created_at, messages[index - 1]?.created_at);

            return (
              <div key={msg.id ?? `msg-${index}`}>
                {showDate && (
                  <div className="flex items-center justify-center my-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs"
                      style={{ backgroundColor: colors.cardAlt, color: colors.muted }}
                    >
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}
                >
                  <div className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isMe && chat?.type === 'group' && (
                      <p className="text-xs mb-1 ml-1" style={{ color: colors.muted }}>{msg.sender_email}</p>
                    )}

                    <div
                      className="px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words leading-relaxed shadow-sm"
                      style={isMe
                        ? {
                            backgroundColor: colors.primary,
                            color: colors.white,
                            borderBottomRightRadius: '4px'
                          }
                        : {
                            backgroundColor: colors.white,
                            color: colors.body,
                            border: `1px solid ${colors.divider}`,
                            borderBottomLeftRadius: '4px'
                          }
                      }
                    >
                      {msg.content}
                    </div>

                    <p
                      className={`text-xs mt-1 ${isMe ? 'text-right mr-1' : 'text-left ml-1'}`}
                      style={{ color: colors.muted }}
                    >
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </motion.div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Input Area ─────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSend}
        className="px-4 py-3"
        style={{ borderTop: `1px solid ${colors.divider}`, backgroundColor: colors.white }}
        id="chat-input-form"
      >
        <div className="flex gap-2 items-end">
          <input
            id="chat-input"
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder={wsStatus === 'open' ? 'Type a message…' : 'Connecting…'}
            disabled={wsStatus !== 'open'}
            className="flex-1 px-4 py-3 rounded-2xl text-sm transition-all outline-none disabled:opacity-60"
            style={{
              border: `1px solid ${colors.inputBorder}`,
              backgroundColor: colors.pageBg,
              color: colors.body,
              '--placeholder-color': colors.muted,
            }}
            onFocus={e => e.currentTarget.style.borderColor = colors.inputBorderFocus}
            onBlur={e => e.currentTarget.style.borderColor = colors.inputBorder}
          />
          <motion.button
            id="chat-send-btn"
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!input.trim() || wsStatus !== 'open'}
            className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: colors.primary, color: colors.white }}
            onMouseEnter={e => { if (input.trim() && wsStatus === 'open') e.currentTarget.style.backgroundColor = colors.primaryHover; }}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = colors.primary}
          >
            <svg className="w-5 h-5 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
        </div>
      </form>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showGroupInfo && (
          <GroupInfoModal
            key="group-info"
            groupId={chat?.id}
            onClose={() => setShowGroupInfo(false)}
            onUpdate={() => { onUpdate?.(); setShowGroupInfo(false); }}
          />
        )}
        {showStartConv && (
          <StartConversationModal
            key="start-conv"
            onClose={() => setShowStartConv(false)}
            onStarted={(conv) => {
              setShowStartConv(false);
              onNewConversation?.(conv);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
