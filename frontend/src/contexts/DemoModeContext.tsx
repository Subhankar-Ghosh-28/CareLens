import React, { createContext, useContext, useState } from 'react';
import { resetDemoStores } from '../services';

interface DemoModeContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  resetDemo: () => void;
  showDemoNotice: boolean;
  dismissDemoNotice: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export const DemoModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('carelens_demo_mode');
    return saved !== null ? saved === 'true' : true;
  });

  const [showDemoNotice, setShowDemoNotice] = useState(true);

  const toggleDemoMode = () => {
    const next = !isDemoMode;
    setIsDemoMode(next);
    localStorage.setItem('carelens_demo_mode', String(next));
  };

  const resetDemo = () => {
    resetDemoStores();
    // Dispatch custom event to notify active contexts
    window.dispatchEvent(new CustomEvent('carelens_demo_reset'));
  };

  return (
    <DemoModeContext.Provider
      value={{
        isDemoMode,
        toggleDemoMode,
        resetDemo,
        showDemoNotice,
        dismissDemoNotice: () => setShowDemoNotice(false)
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
};

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  if (!context) throw new Error('useDemoMode must be used within DemoModeProvider');
  return context;
};
