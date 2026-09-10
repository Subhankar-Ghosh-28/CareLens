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
  },

  // 5. AYUSH / AYURVEDIC TRACK QUESTIONS
  {
    id: 'q_ayush_digestive',
    category: 'ayush',
    question: {
      en: 'AYUSH Assessment: How is your appetite and digestion capacity (Agni / Ahara Shakti)?',
      hi: 'आयुष मूल्यांकन: आपकी भूख और पाचन शक्ति (अग्नि / आहार शक्ति) कैसी है?',
      bn: 'আয়ুষ মূল্যায়ন: আপনার ক্ষুধা ও হজম শক্তি (অগ্নি) কেমন?',
      as: 'আয়ুষ মূল্যাংকন: আপোনাৰ খোৱা-বোৱা আৰু হজম শক্তি কেনে?'
    },
    inputType: 'single_choice',
    options: [
      { label: { en: 'Tikshnagni (Strong / burns quickly)', hi: 'तीक्ष्णाग्नि (तीव्र भूख, तुरंत पचना)', bn: 'তীক্ষ্ণাগ্নি (তীব্র ক্ষুধা)', as: 'তীক্ষ্ণাগ্নি' }, value: 'tikshnagni' },
      { label: { en: 'Mandagni (Sluggish / heaviness after meals)', hi: 'मंदाग्नि (धीमा पाचन, पेट में भारीपन)', bn: 'মন্দাগ্নি (ধীর হজম, পেটে ভারী ভাব)', as: 'মন্দাগ্নি' }, value: 'mandagni' },
      { label: { en: 'Vishamagni (Irregular / variable appetite)', hi: 'विषमाग्नि (अनियमित भूख)', bn: 'বিষমাগ্নি (অনিয়মিত ক্ষুধা)', as: 'বিষমাগ্নি' }, value: 'vishamagni' },
      { label: { en: 'Samagni (Balanced digestion)', hi: 'समाग्नि (संतुलित पाचन)', bn: 'সমাগ্নি (সুষম হজম)', as: 'সমাগ্নি' }, value: 'samagni' }
    ],
    priority: 20
  },
  {
    id: 'q_ayush_bowel',
    category: 'ayush',
    question: {
      en: 'AYUSH Assessment: How is your bowel habit (Koshtha)?',
      hi: 'आयुष मूल्यांकन: आपका पेट साफ होने की प्रकृति (कोष्ठ) कैसी है?',
      bn: 'আয়ুষ মূল্যায়ন: আপনার কোষ্ঠ পরিষ্কার হওয়ার স্বভাব কেমন?',
      as: 'আয়ুষ মূল্যাংকন: কোষ্ঠ পৰিষ্কাৰ হোৱাৰ প্ৰকৃতি কেনে?'
    },
    inputType: 'single_choice',
    options: [
      { label: { en: 'Krura (Tendency towards constipation / dry hard stool)', hi: 'क्रूर कोष्ठ (कब्ज की प्रवृत्ति)', bn: 'ক্রূর কোষ্ঠ (কোষ্ঠকাঠিন্য)', as: 'ক্ৰূৰ কোষ্ঠ' }, value: 'krura' },
      { label: { en: 'Mridu (Tendency towards loose stools / easily triggered)', hi: 'मृदु कोष्ठ (जल्दी पेट खराब होना)', bn: 'মৃদু কোষ্ঠ (সহজেই পেট খারাপ)', as: 'মৃদু কোষ্ঠ' }, value: 'mridu' },
      { label: { en: 'Madhya (Regular / comfortable evacuation)', hi: 'मध्य कोष्ठ (सामान्य, नियमित)', bn: 'মধ্য কোষ্ঠ (স্বাভাবিক)', as: 'মধ্য কোষ্ঠ' }, value: 'madhya' }
    ],
    priority: 21
  }
];

export const AYUSH_QUESTIONS = CLINICAL_QUESTIONS.filter(q => q.category === 'ayush');

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

