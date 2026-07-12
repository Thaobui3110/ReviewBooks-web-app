import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type MessageType = 'success' | 'error';

interface Message {
  type: MessageType;
  text: string;
}

interface AppMessageContextValue {
  message: Message | null;
  showMessage: (type: MessageType, text: string) => void;
  clearMessage: () => void;
}

const AppMessageContext = createContext<AppMessageContextValue | undefined>(undefined);

export function AppMessageProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<Message | null>(null);

  const showMessage = useCallback((type: MessageType, text: string) => {
    setMessage({ type, text });
  }, []);

  const clearMessage = useCallback(() => setMessage(null), []);

  return (
    <AppMessageContext.Provider value={{ message, showMessage, clearMessage }}>
      {children}
    </AppMessageContext.Provider>
  );
}

export function useAppMessage(): AppMessageContextValue {
  const ctx = useContext(AppMessageContext);
  if (!ctx) throw new Error('useAppMessage phải dùng bên trong AppMessageProvider');
  return ctx;
}
