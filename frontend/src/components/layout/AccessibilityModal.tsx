import React from 'react';
import { Modal } from '../common/Modal';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { Eye, Type, Volume2, Sparkles, Layers, RotateCcw } from 'lucide-react';

export const AccessibilityModal: React.FC = () => {
  const { preferences, updatePreferences, resetPreferences, isModalOpen, closeModal } = useAccessibility();

  return (
    <Modal isOpen={isModalOpen} onClose={closeModal} title="Accessibility & Display Controls" maxWidth="md">
      <div className="space-y-4 text-sm">
        <p className="text-slate-600 text-xs leading-relaxed">
          Customize display readability, font size, voice output, and interaction density. Preferences are saved locally on this terminal.
        </p>

        <div className="space-y-3 pt-2">
          {/* Large Text */}
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
                <Type className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 block">Large Text Mode</span>
                <span className="text-xs text-slate-500">Increases base font size and touch targets for easy reading</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.largeText}
              onChange={(e) => updatePreferences({ largeText: e.target.checked })}
              className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
            />
          </label>

          {/* High Contrast */}
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-800 rounded-lg">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 block">High Contrast</span>
                <span className="text-xs text-slate-500">Sharp dark text against pure backgrounds with distinct borders</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.highContrast}
              onChange={(e) => updatePreferences({ highContrast: e.target.checked })}
              className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
            />
          </label>

          {/* Voice Guidance */}
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 block">Voice Guidance</span>
                <span className="text-xs text-slate-500">Reads clinical questions aloud in selected language automatically</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.voiceGuidance}
              onChange={(e) => updatePreferences({ voiceGuidance: e.target.checked })}
              className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
            />
          </label>

          {/* Reduced Motion */}
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 block">Reduced Motion</span>
                <span className="text-xs text-slate-500">Disables non-essential transitions and animations</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.reducedMotion}
              onChange={(e) => updatePreferences({ reducedMotion: e.target.checked })}
              className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
            />
          </label>

          {/* Simplified Mode */}
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 block">Simplified Kiosk Mode</span>
                <span className="text-xs text-slate-500">Reduces visual complexity; shows one primary action per screen</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.simplifiedMode}
              onChange={(e) => updatePreferences({ simplifiedMode: e.target.checked })}
              className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
            />
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={resetPreferences}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium py-1.5 px-2 rounded cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={closeModal}
            className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            Save & Apply
          </button>
        </div>
      </div>
    </Modal>
  );
};
