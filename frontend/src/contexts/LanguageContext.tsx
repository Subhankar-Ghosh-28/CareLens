import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  audioPreviewText: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', audioPreviewText: 'Hello, welcome to CareLens pre-consultation intake.' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', audioPreviewText: 'नमस्ते, केयरलेंस प्री-कंसल्टेशन इंटेक में आपका स्वागत है।' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', audioPreviewText: 'নমস্কার, কেয়ারলেন্স প্রি-কনসাল্টেশন ইনটেকে আপনাকে স্বাগতম।' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', script: 'Bengali-Assamese', audioPreviewText: 'নমস্কাৰ, কেয়াৰলেন্স প্রি-পৰামৰ্শ ইনটেকলৈ আপোনাক স্বাগতম।' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', audioPreviewText: 'வணக்கம், கேர்லென்ஸ் மருத்துவ வரலாற்று பதிவுக்கு வரவேற்கிறோம்.' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', audioPreviewText: 'నమస్కారం, కేర్‌లెన్స్ వైద్య సలహా పూర్వ వివరాల నమోదుకు స్వాగతం.' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', audioPreviewText: 'नमस्कार, केअरलेन्स पूर्व-तपासणी नोंदणीत आपले स्वागत आहे.' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia', audioPreviewText: 'ନମସ୍କାର, କେୟାରଲେନ୍ସ ପରାମର୍ଶ ପୂର୍ବ ତଥ୍ୟ ସଂଗ୍ରହକୁ ସ୍ୱାଗତ।' }
];

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (code: string) => void;
  availableLanguages: LanguageOption[];
  getLanguageObj: () => LanguageOption;
  t: (key: string, fallback?: string) => string;
}

const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  welcome: {
    en: "Let's prepare your visit.",
    hi: 'आइए आपकी डॉक्टर विजिट की तैयारी करें।',
    bn: 'আসুন আপনার ডাক্তার ভিজিটের প্রস্তুতি নিই।',
    as: 'আহক আপোনাৰ ডাক্তৰ ভিজিটৰ প্রস্তুতি লওঁ।'
  },
  subtitle: {
    en: 'CareLens helps your doctor understand your health history before your consultation.',
    hi: 'केयरलेंस आपके डॉक्टर को परामर्श से पहले आपका स्वास्थ्य इतिहास समझने में मदद करता है।',
    bn: 'কেয়ারলেন্স আপনার ডাক্তারকে পরামর্শের আগেই আপনার স্বাস্থ্য ইতিহাস বুঝতে সাহায্য করে।',
    as: 'কেয়াৰলেন্সে আপোনাৰ ডাক্তৰক পৰামৰ্শৰ আগতেই স্বাস্থ্যৰ ইতিহাস বুজাত সহায় কৰে।'
  },
  start: {
    en: 'Start Patient Journey',
    hi: 'शुरू करें',
    bn: 'শুরু করুন',
    as: 'আৰম্ভ কৰক'
  },
  howItWorks: {
    en: 'How it Works',
    hi: 'यह कैसे काम करता है',
    bn: 'এটি কীভাবে কাজ করে',
    as: 'ই কেনেদৰে কাম কৰে'
  },
  accessibility: {
    en: 'Accessibility',
    hi: 'सुगमता / सहायता',
    bn: 'সহায়তা ও পাঠযোগ্যতা',
    as: 'সহায়তা'
  },
  continue: {
    en: 'Continue',
    hi: 'आगे बढ़ें',
    bn: 'এগিয়ে যান',
    as: 'আগলৈ যাওক'
  },
  back: {
    en: 'Back',
    hi: 'पीछे जाएं',
    bn: 'পিছনে যান',
    as: 'পিছলৈ যাওক'
  },
  skip: {
    en: 'Skip for now',
    hi: 'अभी छोड़ें',
    bn: 'এখন বাদ দিন',
    as: 'এতিয়া এৰক'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    return localStorage.getItem('carelens_language') || 'en';
  });

  const setLanguage = (code: string) => {
    setCurrentLanguage(code);
    localStorage.setItem('carelens_language', code);
  };

  const getLanguageObj = () => {
    return SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  };

  const t = (key: string, fallback?: string): string => {
    const dict = UI_TRANSLATIONS[key];
    if (dict && dict[currentLanguage]) {
      return dict[currentLanguage];
    }
    if (dict && dict['en']) {
      return dict['en'];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, availableLanguages: SUPPORTED_LANGUAGES, getLanguageObj, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
