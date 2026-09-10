import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientKioskShell } from '../../components/layout/PatientKioskShell';
import { useLanguage } from '../../contexts/LanguageContext';
import { SupportedLanguage } from '../../types';
import { voiceService } from '../../services';
import { Volume2, ArrowRight, Check } from 'lucide-react';

export const KioskLanguagePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();
  const [playingCode, setPlayingCode] = useState<string | null>(null);

  const handleSelectLanguage = (code: SupportedLanguage) => {
    setLanguage(code);
  };

  const handlePlayPreview = async (e: React.MouseEvent, code: SupportedLanguage, nativeName: string) => {
    e.stopPropagation();
    setPlayingCode(code);

    const greetingSamples: Record<SupportedLanguage, string> = {
      en: 'Welcome to CareLens. Please select your language to continue.',
      hi: 'केयरलेंस में आपका स्वागत है। कृपया अपनी भाषा चुनें।',
      bn: 'কেয়ারলেন্সে আপনাকে স্বাগতম। অনুগ্রহ করে আপনার ভাষা নির্বাচন করুন।',
      as: 'কেয়াৰলেন্সলৈ আপোনাক স্বাগতম। অনুগ্ৰহ কৰি আপোনাৰ ভাষা বাছনি কৰক।',
      ta: 'கேர்லென்ஸுக்கு உங்களை வரவேற்கிறோம். தொடர உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்.',
      te: 'కేర్‌లెన్స్‌కు స్వాగతం. కొనసాగించడానికి మీ భాషను ఎంచుకోండి.',
      mr: 'केअरलेन्स मध्ये आपले स्वागत आहे. कृपया पुढे जाण्यासाठी आपली भाषा निवडा.',
      or: 'କେୟାରଲେନ୍ସକୁ ସ୍ୱାଗତ। ଆଗକୁ ବଢ଼ିବା ପାଇଁ ଆପଣଙ୍କ ଭାଷା ବାଛନ୍ତୁ।'
    };

    const textToSpeak = greetingSamples[code] || `Welcome in ${nativeName}`;
    await voiceService.speak(textToSpeak, code);
    setPlayingCode(null);
  };

  const handleContinue = () => {
    navigate('/kiosk/consent');
  };

  return (
    <PatientKioskShell
      currentStepIndex={1}
      title="Choose Your Language"
      subtitle="Select the regional language you feel most comfortable speaking and reading today."
    >
      <div className="max-w-3xl mx-auto w-full space-y-8">
        {/* Language Grid: 8 Languages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(availableLanguages || []).map((lang) => {
            const isSelected = currentLanguage === lang.code;
            const isPlaying = playingCode === lang.code;

            return (
              <div
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`relative p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[140px] ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50/80 shadow-md ring-2 ring-teal-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-xs'
                }`}
              >
                {/* Top Status & Preview Audio */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {lang.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handlePlayPreview(e, lang.code, lang.nativeName)}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      isPlaying
                        ? 'bg-teal-600 text-white animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                    title={`Listen preview in ${lang.nativeName}`}
                    aria-label={`Listen preview in ${lang.nativeName}`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Native Name Display (Large font) */}
                <div className="my-2">
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {lang.nativeName}
                  </div>
                </div>

                {/* Selected Indicator */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100/60 text-xs">
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 font-bold text-teal-800">
                      <Check className="w-3.5 h-3.5 text-teal-600" />
                      Selected
                    </span>
                  ) : (
                    <span className="text-slate-400">Tap to select</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full sm:w-auto min-w-[240px] mx-auto py-4 px-8 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-base rounded-2xl shadow-lg shadow-teal-700/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>Confirm Language & Continue</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </PatientKioskShell>
  );
};
