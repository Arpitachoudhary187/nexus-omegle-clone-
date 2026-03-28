import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import ChatPage from './pages/ChatPage';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="flex flex-col h-full bg-surface-900">
      <Header darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)} />
      <AppProvider>
        <div className="flex-1 overflow-hidden px-4 pb-4 pt-4 min-h-0">
          <ChatPage />
        </div>
      </AppProvider>
    </div>
  );
}
