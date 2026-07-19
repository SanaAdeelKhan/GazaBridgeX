// frontend/src/context/ChatNavContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';

const ChatNavContext = createContext(null);

export function ChatNavProvider({ children }) {
  const [backHandler, setBackHandlerState] = useState(null);

  const setBackHandler = useCallback((fn) => {
    setBackHandlerState(() => fn);
  }, []);

  return (
    <ChatNavContext.Provider value={{ backHandler, setBackHandler }}>
      {children}
    </ChatNavContext.Provider>
  );
}

export function useChatNav() {
  return useContext(ChatNavContext);
}
