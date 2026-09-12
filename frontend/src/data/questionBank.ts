import { ClinicalQuestion } from '../types';

export const CLINICAL_QUESTIONS: ClinicalQuestion[] = [
  // 1. CHIEF COMPLAINT
  {
    id: 'q_chief_complaint',
    category: 'chief_complaint',
    question: {
      en: 'What primary health concern brings you to the hospital today?',
      hi: 'आज आप किस मुख्य स्वास्थ्य समस्या के कारण अस्पताल आए हैं?',
      bn: 'আজ কোন প্রধান স্বাস্থ্য সমস্যার জন্য আপনি হাসপাতালে এসেছেন?',
      as: 'আজি আপুনি কি মূল স্বাস্থ্য সমস্যাৰ বাবে চিকিৎসালয়লৈ আহিছে?'
    },
    inputType: 'single_choice',
    options: [
      {
        label: {
          en: 'Chest discomfort / heaviness / pain',
          hi: 'छाती में बेचैनी / भारीपन / दर्द',
          bn: 'বুকে অস্বস্তি / ভারী ভাব / ব্যথা',
          as: 'বুকুত অস্বস্তি / গধুৰ ভাব / বিষ'
        },
        value: 'chest_discomfort'
      },
      {
        label: {
          en: 'Fever / chills / body ache',
          hi: 'बुखार / कंपकंपी / बदन दर्द',
          bn: 'জ্বর / কাঁপুনি / গা ব্যথা',
          as: 'জ্বৰ / কঁপনি / গা বিষ'
        },
        value: 'fever'
      },
      {
        label: {
          en: 'Shortness of breath / breathing difficulty',
          hi: 'सांस लेने में तकलीफ / फूलना',
          bn: 'শ্বাসকষ্ট / শ্বাস নিতে সমস্যা',
          as: 'উশাহ-নিশাহ লোৱাত কষ্ট'
        },
        value: 'dyspnea'
      },
      {
        label: {
          en: 'Stomach pain / acidity / digestion issue',
          hi: 'पेट में दर्द / जलन / अपच',
          bn: 'পেটে ব্যথা / বুকজ্বালা / হজমে সমস্যা',
          as: 'পেটৰ বিষ / জ্বলা-পোৰা / অজীৰ্ণ'
        },
        value: 'abdominal_pain'
      },
      {
        label: {
          en: 'Joint pain / back pain / swelling',
          hi: 'जोड़ों में दर्द / पीठ दर्द / सूजन',
          bn: 'গাঁটে ব্যথা / পিঠের ব্যথা / ফোলা',
          as: 'গাঁঠিৰ বিষ / পিঠিৰ বিষ / ফুলা'
        },
        value: 'joint_pain'
      },
      {
        label: {
          en: 'Routine checkup / ongoing chronic care',
          hi: 'नियमित जांच / पुरानी बीमारी की समीक्षा',
          bn: 'নিয়মিত চেকআপ / পুরনো রোগের চিকিৎসা',
          as: 'নিয়মীয়া পৰীক্ষা / পুৰণি ৰোগৰ পৰ্যালোচনা'
        },
        value: 'routine_followup'
      }
    ],
    priority: 1
  },

  // 2. CHEST COMPLAINT SUB-QUESTIONS
  {
    id: 'q_chest_onset',
    category: 'onset',
    condition: (answers) => answers['q_chief_complaint'] === 'chest_discomfort',
    question: {
      en: 'When did this chest discomfort or heaviness begin?',
      hi: 'यह छाती की बेचैनी या भारीपन कब शुरू हुआ था?',
      bn: 'বুকের এই অস্বস্তি বা ভারী ভাব কখন শুরু হয়েছিল?',
      as: 'বুকুৰ এই অস্বস্তি বা গধুৰ ভাব কেতিয়া আৰম্ভ হৈছিল?'
    },
    inputType: 'single_choice',
    options: [
      { label: { en: 'Suddenly within the last 1–2 hours', hi: 'पिछले 1–2 घंटों में अचानक', bn: 'গত ১–২ ঘণ্টায় হঠাৎ', as: 'যোৱা ১-২ ঘণ্টাত হঠাতে' }, value: 'under_2_hours' },
      { label: { en: 'Yesterday / within 24 hours', hi: 'कल / पिछले 24 घंटों में', bn: 'গতকাল / ২৪ ঘণ্টার মধ্যে', as: 'কালি / ২৪ ঘণ্টাৰ ভিতৰত' }, value: 'yesterday' },
      { label: { en: 'Several days ago (gradually)', hi: 'कुछ दिन पहले (धीरे-धीरे)', bn: 'কয়েকদিন আগে (ধীরে ধীরে)', as: 'কেইবা দিনৰ আগতে (লাহে লাহে)' }, value: 'few_days' },
      { label: { en: 'Comes and goes for weeks/months', hi: 'हफ्तों या महीनों से कभी-कभी आता है', bn: 'সপ্তাহ বা মাস ধরে মাঝে মাঝে হয়', as: 'সপ্তাহ বা মাহ জুৰি মাজে মাজে হয়' }, value: 'chronic_intermittent' }
    ],
    priority: 2
  },
  {
    id: 'q_chest_radiation',
    category: 'radiation',
    condition: (answers) => answers['q_chief_complaint'] === 'chest_discomfort',
    question: {
      en: 'Does the discomfort spread to any other area?',
      hi: 'क्या यह दर्द या बेचैनी शरीर के किसी अन्य हिस्से में फैलती है?',
      bn: 'ব্যথা বা অস্বস্তি কি অন্য কোথাও ছড়িয়ে পড়ে?',
      as: 'বিষ বা অস্বস্তি অন্য কোনো অংশলৈ বিয়পি যায়নে?'
    },
    inputType: 'single_choice',
    options: [
      { label: { en: 'Left arm, shoulder, or jaw', hi: 'बाएं हाथ, कंधे या जबड़े में', bn: 'বাম হাত, কাঁধ বা চোয়ালে', as: 'বাওঁ হাত, কান্ধ বা হনুলৈ' }, value: 'left_arm_jaw', triggerRedFlag: true },
      { label: { en: 'To the back between shoulder blades', hi: 'पीठ के बीच में', bn: 'পিঠের পিছন দিকে', as: 'পিঠিৰ মাজলৈ' }, value: 'back' },
      { label: { en: 'Upper abdomen / stomach area', hi: 'पेट के ऊपरी हिस्से में', bn: 'পেটের ওপরের অংশে', as: 'পেটৰ ওপৰ অংশলৈ' }, value: 'epigastric' },
      { label: { en: 'No, stays in one spot', hi: 'नहीं, एक ही जगह रहता है', bn: 'না, একই জায়গায় থাকে', as: 'নাই, একে স্থানতে থাকে' }, value: 'localized' }
    ],
    priority: 3,
    redFlagRules: [
      {
        triggerAnswer: 'left_arm_jaw',
        priority: 'HIGH',
        message: 'Patient reports chest discomfort radiating to left arm/jaw. Flagged for immediate ECG and physician evaluation.'
      }
    ]
  },
  {
    id: 'q_chest_associated',
    category: 'associated',
    condition: (answers) => answers['q_chief_complaint'] === 'chest_discomfort',
    question: {
      en: 'Are you experiencing any of these associated symptoms?',
      hi: 'क्या आपको इनमें से कोई अन्य लक्षण भी महसूस हो रहे हैं?',
      bn: 'আপনার কি সাথে এই লক্ষণগুলোর কোনোটি হচ্ছে?',
      as: 'আপোনাৰ লগতে এই লক্ষণসমূহৰ কোনোবাটো হৈছেনে?'
    },
    inputType: 'single_choice',
    options: [
      { label: { en: 'Breathing difficulty and cold sweating', hi: 'सांस लेने में तकलीफ और ठंडा पसीना', bn: 'শ্বাসকষ্ট এবং ঠান্ডা ঘাম', as: 'উশাহ লোৱাত কষ্ট আৰু ঠাণ্ডা ঘাম' }, value: 'dyspnea_sweating', triggerRedFlag: true },
      { label: { en: 'Palpitations / fast pounding heartbeat (Ghabrahat / Buk dhorche)', hi: 'दिल की तेज धड़कन / घबराहट', bn: 'বুক ধড়ফড় / বুক ধরছে / অস্থিরতা', as: 'বুকুৰ ধপধপনি / ঘাবৰাহাট' }, value: 'palpitations' },
      { label: { en: 'Dizziness or lightheadedness (Matha ghurche)', hi: 'चक्कर आना / सिर घूमना', bn: 'মাথা ঘোরা / দুর্বল লাগা', as: 'মূৰ ঘূৰোৱা' }, value: 'dizziness' },
      { label: { en: 'None of these', hi: 'इनमें से कोई नहीं', bn: 'কোনোটিই নয়', as: 'ইয়াৰ কোনো এটাও নহয়' }, value: 'none' }
    ],
    priority: 4,
    redFlagRules: [
      {
        triggerAnswer: 'dyspnea_sweating',
        priority: 'HIGH',
        message: 'High-priority attention item: Chest discomfort with concurrent breathing difficulty and sweating. Prompt clinical triage advised.'
      }
    ]
  },

  // 3. FEVER SUB-QUESTIONS
  {
    id: 'q_fever_duration',
    category: 'onset',
    condition: (answers) => answers['q_chief_complaint'] === 'fever',
    question: {
      en: 'How many days have you had the fever?',
      hi: 'आपको कितने दिनों से बुखार है?',
      bn: 'কত দিন ধরে জ্বর চলছে?',
      as: 'আপোনাৰ কিমান দিনৰ পৰা জ্বৰ হৈছে?'
    },
    inputType: 'single_choice',
    options: [
      { label: { en: '1–2 days', hi: '1–2 दिन', bn: '১–২ দিন', as: '১-২ দিন' }, value: '1_2_days' },
      { label: { en: '3–5 days', hi: '3–5 दिन', bn: '৩–৫ দিন', as: '৩-৫ দিন' }, value: '3_5_days' },
      { label: { en: 'More than a week', hi: 'एक सप्ताह से अधिक', bn: 'এক সপ্তাহের বেশি', as: 'এক সপ্তাহৰ অধিক' }, value: 'over_week' }
    ],
    priority: 2
  },
  {
    id: 'q_fever_associated',
    category: 'associated',
    condition: (answers) => answers['q_chief_complaint'] === 'fever',
    question: {
      en: 'Are there any other symptoms accompanying the fever?',
      hi: 'क्या बुखार के साथ कोई अन्य लक्षण भी हैं?',
      bn: 'জ্বরের সাথে অন্য কোনো সমস্যা আছে কি?',
      as: 'জ্বৰৰ সৈতে আন কোনো সমস্যা হৈছেনে?'
    },
    inputType: 'single_choice',
    options: [
      { label: { en: 'Severe cough or shortness of breath', hi: 'तेज खांसी या सांस लेने में परेशानी', bn: 'তীব্র কাশি বা শ্বাসকষ্ট', as: 'তীব্ৰ কাঁহ বা উশাহৰ কষ্ট' }, value: 'severe_respiratory', triggerRedFlag: true },
      { label: { en: 'Shivering, chills or extreme body ache', hi: 'कंपकंपी या तेज बदन दर्द', bn: 'কাঁপুনি দিয়ে জ্বর বা তীব্র গা ব্যথা', as: 'কঁপনি বা তীব্ৰ গা বিষ' }, value: 'chills_myalgia' },
      { label: { en: 'Vomiting, loose stools or stomach cramps', hi: 'उल्टी, दस्त या पेट में मरोड़', bn: 'বমি, পাতলা পায়খানা বা পেট মোচড়', as: 'বমি বা পেটৰ বিষ' }, value: 'gi_symptoms' },
      { label: { en: 'Mild sore throat or runny nose only', hi: 'सिर्फ हल्का गला खराब या जुकाम', bn: 'শুধু সামান্য সর্দি বা গলা খুসখুস', as: 'কেৱল সামান্য চৰ্দী' }, value: 'mild_urti' }
    ],
    priority: 3
  },

  // 4. HEALTH MEMORY RECONSTRUCTION ENGINE
  {
    id: 'q_mem_hospital',
    category: 'past_medical',
    question: {
      en: 'Have you ever stayed in a hospital overnight as an admitted patient?',
      hi: 'क्या आप कभी किसी बीमारी के लिए रात भर अस्पताल में भर्ती रहे हैं?',
      bn: 'আপনি কি আগে কখনও রাতে হাসপাতালে ভর্তি থেকেছেন?',
      as: 'আপুনি কেতিয়াবা চিকিৎসালয়ত ভৰ্তি হৈ থাকিবলগীয়া হৈছিলনে?'
    },
    inputType: 'yes_no',
    priority: 10
  },
  {
    id: 'q_mem_surgery',
    category: 'past_surgical',
    question: {
      en: 'Have you ever had any surgery or operation in the past?',
      hi: 'क्या पहले आपकी कभी कोई सर्जरी या ऑपरेशन हुआ है?',
      bn: 'অতীতে আপনার কি কোনো অপারেশন বা সার্জারি হয়েছে?',
      as: 'অতীতত আপোনাৰ কোনো অপাৰেচন বা অস্ত্ৰোপচাৰ হৈছিলনে?'
    },
    inputType: 'single_choice',
    options: [
      { label: { en: 'Yes, appendectomy / abdominal surgery', hi: 'हां, अपेंडिक्स या पेट की सर्जरी', bn: 'হ্যাঁ, অ্যাপেন্ডিক্স বা পেটের অপারেশন', as: 'হয়, এপেণ্ডিক্স বা পেটৰ অস্ত্ৰোপচাৰ' }, value: 'appendectomy' },
      { label: { en: 'Yes, orthopedic / fracture / bone surgery', hi: 'हां, हड्डी / फ्रैक्चर की सर्जरी', bn: 'হ্যাঁ, হাড়ের অপারেশন', as: 'হয়, হাড়ৰ অস্ত্ৰোপচাৰ' }, value: 'orthopedic' },
      { label: { en: 'Yes, cardiac / stent or other major operation', hi: 'हां, हृदय या अन्य बड़ा ऑपरेशन', bn: 'হ্যাঁ, হার্ট বা অন্য বড় অপারেশন', as: 'হয়, হৃদৰোগৰ অস্ত্ৰোপচাৰ' }, value: 'cardiac_major' },
      { label: { en: 'Yes, other minor procedure', hi: 'हां, कोई छोटी प्रक्रिया', bn: 'হ্যাঁ, ছোট কোনো প্রসিডিউর', as: 'হয়, আন কোনো সাধাৰণ প্ৰক্ৰিয়া' }, value: 'other_minor' },
      { label: { en: 'No past surgeries', hi: 'नहीं, कोई ऑपरेशन नहीं हुआ', bn: 'না, কোনো অপারেশন হয়নি', as: 'নহয়, কোনো অস্ত্ৰোপচাৰ হোৱা নাই' }, value: 'none' }
    ],
    priority: 11
  },
  {
    id: 'q_mem_chronic',
    category: 'past_medical',
    question: {
      en: 'Have you been diagnosed with any long-term health condition?',
      hi: 'क्या आपको इनमें से कोई लंबे समय से चली आ रही बीमारी बताई गई है?',
      bn: 'আপনার কি এর মধ্যে কোনো দীর্ঘস্থায়ী রোগ আছে?',
      as: 'আপোনাৰ কোনো দীৰ্ঘদিনীয়া স্বাস্থ্য সমস্যা আছে নেকি?'
    },
    inputType: 'single_choice',
    options: [
      { label: { en: 'Type 2 Diabetes (high blood sugar)', hi: 'डायबिटीज (मधुमेह / शुगर)', bn: 'ডায়াবেটিস (সুগার)', as: 'ডায়াবেটিছ (মধুমেহ)' }, value: 'diabetes' },
      { label: { en: 'High Blood Pressure (Hypertension)', hi: 'हाई ब्लड प्रेशर (उच्च रक्तचाप)', bn: 'উচ্চ রক্তচাপ (হাই প্রেশার)', as: 'উচ্চ ৰক্তচাপ (প্ৰেচাৰ)' }, value: 'hypertension' },
      { label: { en: 'Both Diabetes and High Blood Pressure', hi: 'डायबिटीज और हाई बीपी दोनों', bn: 'ডায়াবেটিস এবং প্রেশার দুটোই', as: 'ডায়াবেটিছ আৰু প্ৰেচাৰ দুয়োটা' }, value: 'diabetes_and_htn' },
      { label: { en: 'Asthma / breathing problem', hi: 'अस्थमा / सांस की पुरानी बीमारी', bn: 'হাঁপানি / অ্যাজমা', as: 'এজমা / শ্বাসৰ সমস্যা' }, value: 'asthma' },
      { label: { en: 'None diagnosed', hi: 'कोई नहीं', bn: 'কোনোটিই জানা নেই', as: 'কোনো দীৰ্ঘদিনীয়া ৰোগ নাই' }, value: 'none' }
    ],
    priority: 12
  },
  {
    id: 'q_mem_medications',
    category: 'medications',
    question: {
      en: 'Are you currently taking any daily medicines regularly?',
      hi: 'क्या आप अभी रोजाना कोई दवाइयां नियमित रूप से ले रहे हैं?',
      bn: 'আপনি কি বর্তমানে কোনো ওষুধ নিয়মিত খাচ্ছেন?',
      as: 'আপুনি বৰ্তমান নিয়মীয়াকৈ কোনো ঔষধ খাই আছেনে?'
    },
    inputType: 'single_choice',
    options: [
      { label: { en: 'Yes, taking diabetes medicine (Metformin / Glimepiride)', hi: 'हां, शुगर की दवा ले रहे हैं (मेटफॉर्मिन आदि)', bn: 'হ্যাঁ, সুগারের ওষুধ খাচ্ছি (মেটফরমিন ইত্যাদি)', as: 'হয়, ডায়াবেটিছৰ ঔষধ খাই আছোঁ' }, value: 'diabetes_meds' },
      { label: { en: 'Yes, taking blood pressure medicine (Telmisartan / Amlodipine)', hi: 'हां, बीपी की दवा ले रहे हैं (टेल्मिसार्टन आदि)', bn: 'হ্যাঁ, প্রেশারের ওষুধ খাচ্ছি (টেলমিসার্টান ইত্যাদি)', as: 'হয়, প্ৰেচাৰৰ ঔষধ খাই আছোঁ' }, value: 'bp_meds' },
      { label: { en: 'Yes, both BP and Diabetes medicines daily', hi: 'हां, बीपी और शुगर दोनों की दवाइयां', bn: 'হ্যাঁ, প্রেশার ও সুগার দুটোরই ওষুধ খাচ্ছি', as: 'হয়, দুয়োটাৰে ঔষধ নিয়মীয়াকৈ খাই আছোঁ' }, value: 'both_bp_diabetes_meds' },
      { label: { en: 'Only over-the-counter painkillers or antacids', hi: 'सिर्फ कभी-कभार गैस या दर्द की गोली', bn: 'শুধু গ্যাস বা বেদনানাশক ট্যাবলেট মাঝে মাঝে', as: 'কেৱল গেছ বা বিষৰ টেবলেট' }, value: 'otc_only' },
      { label: { en: 'Not taking any medicines', hi: 'कोई दवा नहीं ले रहे', bn: 'কোনো ওষুধ খাচ্ছি না', as: 'কোনো ঔষধ লোৱা নাই' }, value: 'none' }
    ],
    priority: 13
  },
  {
    id: 'q_mem_allergies',
    category: 'allergies',
    question: {
      en: 'Have you ever had a serious allergic reaction to any medicine or injection?',
      hi: 'क्या आपको कभी किसी दवा या इंजेक्शन से कोई गंभीर एलर्जी या रिएक्शन हुआ है?',
      bn: 'আপনার কি কোনো ওষুধ বা ইনজেকশন থেকে এলার্জি বা তীব্র পার্শ্বপ্রতিক্রিয়া হয়েছে?',
      as: 'কোনো ঔষধ বা ইনজেকচনৰ পৰা আপোনাৰ এলাৰ্জি হৈছিলনে?'
    },
    inputType: 'single_choice',
    options: [
      { label: { en: 'Penicillin or antibiotic allergy', hi: 'पेनिसिलिन या एंटीबायोटिक से एलर्जी', bn: 'পেনিসিলিন বা অ্যান্টিবায়োটিক এলার্জি', as: 'পেনিচিলিন বা এণ্টিবায়োটিক এলাৰ্জি' }, value: 'penicillin_allergy', triggerRedFlag: true },
      { label: { en: 'Painkiller (NSAIDs / Aspirin) allergy', hi: 'दर्द निवारक दवा (एस्पिरिन आदि) से एलर्जी', bn: 'ব্যথানাশক ওষুধ থেকে এলার্জি', as: 'বিষৰ ঔষধৰ এলাৰ্জি' }, value: 'nsaid_allergy' },
      { label: { en: 'Sulfa drug allergy', hi: 'सल्फा दवा से एलर्जी', bn: 'সালফা ওষুধ এলার্জি', as: 'চালফা ঔষধ এলাৰ্জি' }, value: 'sulfa_allergy' },
      { label: { en: 'No known drug allergies (NKDA)', hi: 'कोई दवा एलर्जी नहीं है', bn: 'কোনো ওষুধে জানা এলার্জি নেই', as: 'কোনো ঔষধৰ এলাৰ্জি নাই' }, value: 'none' }
    ],
    priority: 14,
    redFlagRules: [
      {
        triggerAnswer: 'penicillin_allergy',
        priority: 'HIGH',
        message: 'Reported drug allergy: Penicillin. Flagged on chart to avoid beta-lactam class prescriptions.'
      }
    ]
  }
];

// 5. AYUSH / DASHAVIDHA PARIKSHA STRUCTURED QUESTIONS
export const AYUSH_QUESTIONS: ClinicalQuestion[] = [
  {
    id: 'q_ayush_prakriti',
    category: 'ayush',
    question: {
      en: 'AYUSH Assessment (Prakriti): What is your predominant physical and physiological constitution?',
      hi: 'आयुष मूल्यांकन (प्रकृति): आपकी मुख्य शारीरिक एवं मानसिक प्रकृति क्या है?',
      bn: 'আয়ুষ মূল্যায়ন (প্রকৃতি): আপনার শারীরিক ও মানসিক মূল প্রকৃতি কোনটি?',
      as: 'আয়ুষ মূল্যাংকন (প্ৰকৃতি): আপোনাৰ মূল শাৰীৰিক আৰু মানসিক প্ৰকৃতি কি?'
    },
    inputType: 'single_choice',
    options: [
      { label: { en: 'Vata Predominant (Lean build, dry skin, quick movement, irregular appetite)', hi: 'वात प्रधान (पतला शरीर, रूखी त्वचा, अनियमित भूख)', bn: 'বাত প্রধান (রোগা গঠন, শুষ্ক ত্বক, অনিয়মিত ক্ষুধা)', as: 'বাত প্ৰধান (ক্ষীণ দেহা, শুকান ছাল)' }, value: 'vata_predominant' },
      { label: { en: 'Pitta Predominant (Medium build, warm body, sharp appetite, heat intolerance)', hi: 'पित्त प्रधान (मध्यम शरीर, तीव्र भूख, गर्मी बर्दाश्त न होना)', bn: 'পিত্ত প্রধান (মাঝারি গঠন, তীব্র ক্ষুধা, গরমে অস্বস্তি)', as: 'পিত্ত প্ৰধান (মধ্যম দেহা, তীব্ৰ ক্ষুধা)' }, value: 'pitta_predominant' },
      { label: { en: 'Kapha Predominant (Broad/sturdy build, oily skin, steady calm, slow digestion)', hi: 'कफ प्रधान (मजबूत शरीर, शांत स्वभाव, धीमा पाचन)', bn: 'কফ প্রধান (দৃঢ় গঠন, শান্ত স্বভাব, ধীর হজম)', as: 'কফ প্ৰধান (মজবুত গঠন, ধীৰ হজম)' }, value: 'kapha_predominant' },
      { label: { en: 'Dwandwaja / Mixed (Vata-Pitta / Pitta-Kapha / Vata-Kapha combination)', hi: 'द्वंद्वज (मिश्रित प्रकृति - वात-पित्त / पित्त-कफ)', bn: 'দ্বন্দ্বজ (মিশ্র প্রকৃতি)', as: 'দ্বন্দজ (মিশ্ৰ প্ৰকৃতি)' }, value: 'mixed_constitution' }
    ],
    priority: 20
  },
  {
    id: 'q_ayush_vikriti',
    category: 'ayush',
    question: {
      en: 'AYUSH Assessment (Vikriti): Which morbid symptom or dosha imbalance is currently most noticeable?',
      hi: 'आयुष मूल्यांकन (विकृति): वर्तमान में किस दोष की वृद्धि या असंतुलन सबसे अधिक महसूस हो रहा है?',
      bn: 'আয়ুষ মূল্যায়ন (বিকৃতি): বর্তমানে কোন দোষের ভারসাম্যহীনতা সবচেয়ে বেশি অনুভূত হচ্ছে?',
      as: 'আয়ুষ মূল্যাংকন (বিকৃতি): বৰ্তমান কোনটো দোষৰ তাৰতম্য বেছি অনুভৱ হৈছে?'
    },
    inputType: 'single_choice',
    options: [
      { label: { en: 'Vataja (Body aches, joint stiffness, dry cough, gas/bloating, restlessness)', hi: 'वातज (शरीर में दर्द, जोड़ों की जकड़न, गैस, बेचैनी)', bn: 'বাতজ (শরীরে ব্যথা, গাঁটে জড়তা, গ্যাস, অস্থিরতা)', as: 'বাতজ (গাৰ বিষ, পেটৰ গেছ)' }, value: 'vata_vikriti' },
      { label: { en: 'Pittaja (Burning sensation, hyperacidity, feverishness, skin rashes, thirst)', hi: 'पित्तज (जलन, खट्टी डकारें, अत्यधिक प्यास, बुखार जैसा)', bn: 'পিত্তজ (বুকজ্বালা, অম্বল, অতিরিক্ত তৃষ্ণা)', as: 'পিত্তজ (জ্বলা-পোৰা, অম্বল)' }, value: 'pitta_vikriti' },
      { label: { en: 'Kaphaja (Heaviness in chest/head, excess mucus/congestion, lethargy, loss of taste)', hi: 'कफज (छाती या सिर में भारीपन, कफ, सुस्ती, अरुचि)', bn: 'কফজ (বুকে ভারী ভাব, সর্দি-কফ, ক্লান্তি)', as: 'কফজ (বুকুত গধুৰ ভাব, কফ)' }, value: 'kapha_vikriti' },
      { label: { en: 'Sannipataja (Multi-dosha combined disturbance)', hi: 'सन्निपातज (त्रिदोषज मिश्रित लक्षण)', bn: 'সন্নিপাতজ (মিশ্রিত সমস্যা)', as: 'সন্নিপাতজ (মিশ্ৰ লক্ষণ)' }, value: 'sannipata_vikriti' }
    ],
    priority: 21
  },
  {
    id: 'q_ayush_sara',
    category: 'ayush',
    question: {
      en: 'AYUSH Assessment (Sara): Tissue vitality status (Dhatu Sarata)?',
      hi: 'आयुष मूल्यांकन (सार): आपकी धातु सारता (ऊतक सामर्थ्य) कैसी है?',
      bn: 'আয়ুষ মূল্যায়ন (সার): আপনার ধাতু সারতা কেমন?',
      as: 'আয়ুষ মূল্যাংকন (সাৰ): আপোনাৰ ধাতু সাৰতা কেনে?'
    },
    inputType: 'single_choice',
    options: [
      { label: { en: 'Pravara Sara (Excellent vitality, lustrous skin/eyes, high endurance)', hi: 'प्रवर सार (उत्तम बल, चमकदार त्वचा/आंखें, मजबूत)', bn: 'প্রবর সার (উত্তম ধাতু বল, উজ্জ্বল ত্বক)', as: 'প্ৰবৰ সাৰ (উত্তম বল)' }, value: 'pravara_sara' },
      { label: { en: 'Madhyama Sara (Moderate vitality, average tissue strength)', hi: 'मध्यम सार (सामान्य ऊतक सामर्थ्य)', bn: 'মধ্যম সার (স্বাভাবিক স্বাস্থ্য)', as: 'মধ্যম সাৰ (সাধাৰণ শক্তি)' }, value: 'madhyama_sara' },
      { label: { en: 'Avara Sara (Low tissue vitality, easily fatigued, fragile build)', hi: 'अवर सार (कमजोरी, जल्दी थक जाना)', bn: 'অবর সার (দুর্বলতা, সহজে ক্লান্তি)', as: 'অবৰ সাৰ (দুৰ্বল দেহা)' }, value: 'avara_sara' }
    ],
    priority: 22
  },
  {
    id: 'q_ayush_samhanana',
    category: 'ayush',
    question: {
      en: 'AYUSH Assessment (Samhanana): Body compactness and bone-joint structure?',
      hi: 'आयुष मूल्यांकन (संहनन): आपका शारीरिक गठन और हड्डियों की मजबूती कैसी है?',
      bn: 'আয়ুষ মূল্যায়ন (সংহনন): আপনার শরীরের সুগঠিত ভাব কেমন?',
      as: 'আয়ুষ মূল্যাংকন (সংহনন): আপোনাৰ শাৰীৰিক গঠন কেনে?'
    },
    inputType: 'single_choice',
    options: [
      { label: { en: 'Su-samhanita (Compact, well-knit joints, sturdy bone frame)', hi: 'सुसंहनित (मजबूत जोड़, सुगठित शारीरिक ढांचा)', bn: 'সুসংহনন (সুদৃঢ় গাঁট, মজবুত শরীর)', as: 'সুসংহনন (মজবুত দেহা)' }, value: 'susamhanita' },
      { label: { en: 'Madhyama Samhanana (Moderate compact build)', hi: 'मध्यम संहनन (सामान्य शारीरिक गठन)', bn: 'মধ্যম সংহনন (স্বাভাবিক গঠন)', as: 'মধ্যম সংহনন' }, value: 'madhyama_samhanana' },
      { label: { en: 'Hina Samhanana (Loosely knit, fragile joints, frail build)', hi: 'हीन संहनन (ढीले जोड़, दुर्बल ढांचा)', bn: 'হীন সংহনন (ঢিলেঢালা দুর্বল গঠন)', as: 'হীন সংহনন (দুৰ্বল গাঁঠি)' }, value: 'hina_samhanana' }
    ],
    priority: 23
  },
  {
    id: 'q_ayush_pramana',
    category: 'ayush',
    question: {
      en: 'AYUSH Assessment (Pramana): Anthropometric and body proportions?',
      hi: 'आयुष मूल्यांकन (प्रमाण): शारीरिक अनुपात (लंबाई, चौड़ाई और वजन)?',
      bn: 'আয়ুষ মূল্যায়ন (প্রমাণ): শরীরের অনুপাত কেমন?',
      as: 'আয়ুষ মূল্যাংকন (প্ৰমাণ): শৰীৰৰ উচ্চতা আৰু ওজনৰ অনুপাত?'
    },
    inputType: 'single_choice',
    options: [
      { label: { en: 'Sama-pramana (Proportionate height, weight, and frame)', hi: 'सम-प्रमाण (संतुलित लंबाई और वजन)', bn: 'সম-প্রমাণ (সুষম উচ্চতা ও ওজন)', as: 'সম-প্ৰমাণ (সন্তুলিত অনুপাত)' }, value: 'sama_pramana' },
      { label: { en: 'Ati-krisha (Excessively underweight or lean)', hi: 'अतिकृश (अत्यधिक दुबलापन)', bn: 'অতিকৃশ (অতিরিক্ত কৃশকায়)', as: 'অতিকৃশ (অতি ক্ষীণ)' }, value: 'ati_krisha' },
      { label: { en: 'Ati-sthula (Overweight or tendency towards obesity)', hi: 'अतिस्थूल (मोटापा या अधिक वजन)', bn: 'অতিস্থূল (স্থূলতা বা অতিরিক্ত ওজন)', as: 'অতিস্থূল (মেদবহুল)' }, value: 'ati_sthula' }
    ],
    priority: 24
  },
  {
    id: 'q_ayush_satmya',
    category: 'ayush',
    question: {
      en: 'AYUSH Assessment (Satmya): Adaptability and dietary habituation?',
      hi: 'आयुष मूल्यांकन (सात्म्य): विभिन्न प्रकार के खान-पान और मौसम के प्रति अनुकूलता?',
      bn: 'আয়ুষ মূল্যায়ন (সাৎম্য): খাদ্যাভ্যাস ও ঋতু পরিবর্তনের সাথে সহনশীলতা কেমন?',
      as: 'আয়ুষ মূল্যাংকন (সাত্ম্য): বিভিন্ন খাদ্য আৰু বতৰৰ লগত খাপ খোৱাৰ ক্ষমতা?'
    },
    inputType: 'single_choice',
    options: [
      { label: { en: 'Sarvarasa Satmya (Tolerates all tastes, climates, and foods easily)', hi: 'सर्वरस सात्म्य (सभी रस और मौसम आसानी से अनुकूल)', bn: 'সর্ববস সাৎম্য (সব রকম খাবারে সহজে মানিয়ে নেয়)', as: 'সৰ্বৰস সাত্ম্য' }, value: 'sarvarasa_satmya' },
      { label: { en: 'Madhyama Satmya (Moderate adaptation, sensitive to drastic changes)', hi: 'मध्यम सात्म्य (सामान्य अनुकूलन क्षमता)', bn: 'মধ্যম সাৎম্য (মাঝারি সহনশীলতা)', as: 'মধ্যম সাত্ম্য' }, value: 'madhyama_satmya' },
      { label: { en: 'Ekarasa / Avara Satmya (Easily disturbed by changes in diet, spices, or weather)', hi: 'अवर सात्म्य (खान-पान बदलने पर जल्दी परेशानी)', bn: 'অবর সাৎম্য (সহজেই পেটের সমস্যা হয়)', as: 'অবৰ সাত্ম্য (খাদ্য সলালে অসুখ হয়)' }, value: 'avara_satmya' }
    ],
    priority: 25
  },
  {
    id: 'q_ayush_satva',
    category: 'ayush',
    question: {
      en: 'AYUSH Assessment (Satva): Mental temperament, stress tolerance, and emotional resilience?',
      hi: 'आयुष मूल्यांकन (सत्त्व): मानसिक शक्ति, तनाव सहने की क्षमता और धैर्य?',
      bn: 'আয়ুষ মূল্যায়ন (সত্ত্ব): মানসিক দৃঢ়তা, চাপ সামলানোর ক্ষমতা ও ধৈর্য্য?',
      as: 'আয়ুষ মূল্যাংকন (সত্ত্ব): মানসিক শক্তি, মানসিক চাপ সহনশীলতা আৰু ধৈৰ্য্য?'
    },
    inputType: 'single_choice',
    options: [
      { label: { en: 'Pravara Satva (High mental resilience, stays calm under pain or distress)', hi: 'प्रवर सत्त्व (उत्तम मानसिक बल, संकट में भी धैर्यवान)', bn: 'প্রবর সত্ত্ব (উচ্চ মানসিক শক্তি, ব্যথায় শান্ত থাকে)', as: 'প্ৰবৰ সত্ত্ব (ধৈৰ্য্যবান)' }, value: 'pravara_satva' },
      { label: { en: 'Madhyama Satva (Moderate mental strength, recovers with reassurance)', hi: 'मध्यम सत्त्व (मध्यम मानसिक क्षमता)', bn: 'মধ্যম সত্ত্ব (মাঝারি মনোবল)', as: 'মধ্যম সত্ত্ব (সাধাৰণ মনোবল)' }, value: 'madhyama_satva' },
      { label: { en: 'Avara Satva (Sensitive, anxious, easily overwhelmed by pain or illness)', hi: 'अवर सत्त्व (कमजोर मनोबल, जल्दी घबराहट या भय)', bn: 'অবর সত্ত্ব (উদ্বিগ্ন, সহজেই ভয় বা মানসিক চাপ)', as: 'অবৰ সত্ত্ব (সহজে ভয় খোৱা)' }, value: 'avara_satva' }
    ],
    priority: 26
  },
  {
    id: 'q_ayush_ahara',
    category: 'ayush',
    question: {
      en: 'AYUSH Assessment (Ahara Shakti & Agni): Appetite and digestive capacity?',
      hi: 'आयुष मूल्यांकन (आहार शक्ति एवं अग्नि): आपकी भूख और भोजन पचाने की शक्ति कैसी है?',
      bn: 'আয়ুষ মূল্যায়ন (আহার শক্তি ও অগ্নি): আপনার ক্ষুধা এবং হজম শক্তি কেমন?',
      as: 'আয়ুষ মূল্যাংকন (আহাৰ শক্তি আৰু অগ্নি): আপোনাৰ খোৱাৰ ৰুচি আৰু হজম ক্ষমতা কেনে?'
    },
    inputType: 'single_choice',
    options: [
      { label: { en: 'Samagni (Balanced, digests meals comfortably in regular time)', hi: 'समाग्नि (संतुलित भूख और समय पर आरामदायक पाचन)', bn: 'সমাগ্নি (সুষম ক্ষুধা ও স্বাভাবিক হজম)', as: 'সমাগ্নি (সন্তুলিত হজম)' }, value: 'samagni' },
      { label: { en: 'Tikshnagni (Intense hunger, burns food too quickly, hyperacidity prone)', hi: 'तीक्ष्णाग्नि (तीव्र भूख, तुरंत पचना, एसिडिटी की प्रवृत्ति)', bn: 'তীক্ষ্ণাগ্নি (তীব্র ক্ষুধা, অম্লপিত্তের ধাত)', as: 'তীক্ষ্ণাগ্নি (তীব্ৰ ক্ষুধা)' }, value: 'tikshnagni' },
      { label: { en: 'Mandagni (Sluggish appetite, heaviness for hours after meals, slow digestion)', hi: 'मंदाग्नि (कम भूख, खाने के बाद पेट में भारीपन)', bn: 'মন্দাগ্নি (কম ক্ষুধা, খাবারের পর পেটে ভারী ভাব)', as: 'মন্দাগ্নি (ধীৰ হজম)' }, value: 'mandagni' },
      { label: { en: 'Vishamagni (Erratic/unpredictable appetite, sometimes fast, sometimes bloating)', hi: 'विषमाग्नि (अनियमित भूख, कभी ज्यादा कभी बिल्कुल नहीं)', bn: 'বিষমাগ্নি (অনিয়মিত ক্ষুধা ও পেট ফাঁপা)', as: 'বিষমাগ্নি (অনিয়মীয়া)' }, value: 'vishamagni' }
    ],
    priority: 27
  },
  {
    id: 'q_ayush_vyayama',
    category: 'ayush',
    question: {
      en: 'AYUSH Assessment (Vyayama Shakti): Physical work and exercise endurance capacity?',
      hi: 'आयुष मूल्यांकन (व्यायाम शक्ति): शारीरिक परिश्रम, चलने-फिरने या काम करने की क्षमता?',
      bn: 'আয়ুষ মূল্যায়ন (ব্যায়াম শক্তি): শারীরিক পরিশ্রম বা কাজ করার সহনশীলতা কেমন?',
      as: 'আয়ুষ মূল্যাংকন (ব্যায়াম শক্তি): শাৰীৰিক পৰিশ্ৰম কৰাৰ ক্ষমতা?'
    },
    inputType: 'single_choice',
    options: [
      { label: { en: 'Pravara (High physical capacity, can do strenuous work without early fatigue)', hi: 'प्रवर (उत्तम शारीरिक क्षमता, भारी काम भी आसानी से)', bn: 'প্রবর (উচ্চ কর্মক্ষমতা, সহজে ক্লান্তি আসে না)', as: 'প্ৰবৰ (উচ্চ কৰ্মক্ষমতা)' }, value: 'pravara_vyayama' },
      { label: { en: 'Madhyama (Moderate physical endurance, comfortable with routine tasks)', hi: 'मध्यम (सामान्य कार्य क्षमता)', bn: 'মধ্যম (দৈনন্দিন কাজে স্বাভাবিক)', as: 'মধ্যম (সাধাৰণ শক্তি)' }, value: 'madhyama_vyayama' },
      { label: { en: 'Avara (Low stamina, experiences breathlessness or exhaustion with minimal effort)', hi: 'अवर (कम सहनशक्ति, थोड़े परिश्रम में ही सांस फूलना/थकान)', bn: 'অবর (সামান্য পরিশ্রমে শ্বাসকষ্ট বা দুর্বলতা)', as: 'অবৰ (অলপ কামতে ক্লান্তি)' }, value: 'avara_vyayama' }
    ],
    priority: 28
  },
  {
    id: 'q_ayush_vaya',
    category: 'ayush',
    question: {
      en: 'AYUSH Assessment (Vaya): Current life stage?',
      hi: 'आयुष मूल्यांकन (वय): जीवन की वर्तमान अवस्था?',
      bn: 'আয়ুষ মূল্যায়ন (বয়স): জীবনের বর্তমান পর্যায়?',
      as: 'আয়ুষ মূল্যাংকন (বয়স): জীৱনৰ বৰ্তমান অৱস্থা?'
    },
    inputType: 'single_choice',
    options: [
      { label: { en: 'Balya / Youth (< 16 years: Growth & Kapha predominance)', hi: 'बाल्यावस्था (16 वर्ष से कम)', bn: 'বাল্যাবস্থা (১৬ বছরের কম)', as: 'বাল্যাবস্থা (< ১৬ বছৰ)' }, value: 'balya' },
      { label: { en: 'Madhyama / Adult (16–60 years: Strength & Pitta predominance)', hi: 'मध्यमावस्था (16 से 60 वर्ष: कर्मठ अवस्था)', bn: 'মধ্যমাবস্থা (১৬–৬০ বছর: সক্রিয় বয়স)', as: 'মধ্যমাবস্থা (১৬-৬০ বছৰ)' }, value: 'madhyama_vaya' },
      { label: { en: 'Vriddha / Senior (> 60 years: Dhatu reduction & Vata predominance)', hi: 'वृद्धावस्था (60 वर्ष से अधिक)', bn: 'বৃদ্ধাবস্থা (৬০ বছরের বেশি)', as: 'বৃদ্ধাবস্থা (> ৬০ বছৰ)' }, value: 'vriddha' }
    ],
    priority: 29
  }
];

export interface IndianLocalExpression {
  vernacular: string;
  language: string;
  clinicalConcept: string;
  englishMeaning: string;
  suggestedTriageReview?: boolean;
}

export const INDIAN_LOCAL_EXPRESSIONS: IndianLocalExpression[] = [
  { vernacular: 'Chhati me dard', language: 'Hindi', clinicalConcept: 'Retrosternal Chest Pain', englishMeaning: 'Pain in chest', suggestedTriageReview: true },
  { vernacular: 'Ghabrahat', language: 'Hindi', clinicalConcept: 'Palpitations / Anxiety', englishMeaning: 'Restlessness / Fast heartbeat' },
  { vernacular: 'Matha ghurche', language: 'Bengali / Assamese', clinicalConcept: 'Vertigo / Presyncope', englishMeaning: 'Head spinning / dizziness' },
  { vernacular: 'Buk dhorche', language: 'Bengali', clinicalConcept: 'Palpitations', englishMeaning: 'Pounding heartbeat in chest' },
  { vernacular: 'Thanda gham', language: 'Bengali / Hindi', clinicalConcept: 'Diaphoresis', englishMeaning: 'Cold profuse sweating', suggestedTriageReview: true },
  { vernacular: 'Haat-paa jhinjhin', language: 'Bengali', clinicalConcept: 'Peripheral Paresthesia', englishMeaning: 'Tingling / numbness in extremities' },
  { vernacular: 'Gas utheche', language: 'Bengali', clinicalConcept: 'Dyspepsia / Acid Reflux', englishMeaning: 'Gastroesophageal burning' },
  { vernacular: 'Chhati me bojh', language: 'Hindi', clinicalConcept: 'Chest heaviness / pressure', englishMeaning: 'Heavy sensation in chest', suggestedTriageReview: true },
  { vernacular: 'Ushah lot kashto', language: 'Assamese', clinicalConcept: 'Dyspnea', englishMeaning: 'Shortness of breath / breathing difficulty', suggestedTriageReview: true }
];

export interface RedFlagRule {
  id: string;
  triggerAnswer: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  message: string;
}

export const RED_FLAG_RULES: RedFlagRule[] = [
  {
    id: 'rf_chest_sweating',
    triggerAnswer: 'dyspnea_sweating',
    severity: 'HIGH',
    title: 'Acute Coronary Syndrome Screening Alert',
    message: 'Reported retrosternal discomfort combined with dyspnea and cold diaphoresis.'
  },
  {
    id: 'rf_fever_chills',
    triggerAnswer: 'fever_high_rigors',
    severity: 'HIGH',
    title: 'High-Grade Febrile Infection with Rigors',
    message: 'High spikes (>103°F) accompanied by uncontrollable shivering and rigors.'
  },
  {
    id: 'rf_allergy_penicillin',
    triggerAnswer: 'penicillin',
    severity: 'HIGH',
    title: 'Known Severe Drug Allergy',
    message: 'Documented anaphylactoid / urticarial reaction to Beta-lactam / Penicillin antibiotics.'
  }
];

