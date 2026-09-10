import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccessibilityPreferences } from '../types';

interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  updatePreferences: (partial: Partial<AccessibilityPreferences>) => void;
  resetPreferences: () => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  largeText: false,
  highContrast: false,
  voiceGuidance: false,
  reducedMotion: false,
  simplifiedMode: false
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    try {
      const saved = localStorage.getItem('carelens_accessibility');
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('carelens_accessibility', JSON.stringify(preferences));
    } catch {
      // ignore
    }

    // Apply document-level classes
    const root = document.documentElement;
    if (preferences.largeText) {
      root.classList.add('text-scale-large');
    } else {
      root.classList.remove('text-scale-large');
    }

    if (preferences.highContrast) {
      root.classList.add('high-contrast-mode');
    } else {
      root.classList.remove('high-contrast-mode');
    }

    if (preferences.simplifiedMode) {
      root.classList.add('simplified-mode');
    } else {
      root.classList.remove('simplified-mode');
    }
  }, [preferences]);

  const updatePreferences = (partial: Partial<AccessibilityPreferences>) => {
    setPreferences(prev => ({ ...prev, ...partial }));
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        preferences,
        updatePreferences,
        resetPreferences,
        isModalOpen,
        openModal: () => setIsModalOpen(true),
        closeModal: () => setIsModalOpen(false)
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return context;
};
