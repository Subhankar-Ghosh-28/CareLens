// Local Language Clinical Interpreter Dictionary
// Preserves original patient wording with tentative standardized clinical concept
// strictly marked as "Needs physician interpretation" (never definitive diagnosis)

export interface LocalExpressionMapping {
  original: string;
  language: string;
  transliteration?: string;
  standardizedConcept: string;
  clinicalCategory: 'Cardiovascular' | 'Respiratory' | 'Gastrointestinal' | 'Neurological' | 'General' | 'Musculoskeletal';
  contextNote: string;
}

export const LOCAL_EXPRESSIONS_DB: LocalExpressionMapping[] = [
  {
    original: 'Ghabrahat',
    language: 'Hindi',
    transliteration: 'घबराहट',
    standardizedConcept: 'Patient-reported sensation of uneasiness, restlessness or palpitations',
    clinicalCategory: 'Cardiovascular',
    contextNote: 'Often used by patients to describe tachycardia, acute anxiety, hypoperfusion, or non-specific distress.'
  },
  {
    original: 'Buk dhorche',
    language: 'Bengali',
    transliteration: 'বুক ধরফর করছে',
    standardizedConcept: 'Patient-reported sensation of palpitations or rapid / irregular heartbeat',
    clinicalCategory: 'Cardiovascular',
    contextNote: 'Colloquial Bengali for pounding chest sensation or palpitations. Requires pulse and rhythm check.'
  },
  {
    original: 'Pet jwala',
    language: 'Hindi',
    transliteration: 'पेट में जलन',
    standardizedConcept: 'Patient-reported epigastric burning sensation or dyspepsia',
    clinicalCategory: 'Gastrointestinal',
    contextNote: 'Distinguish from atypical cardiac angina in middle-aged and diabetic cohorts.'
  },
  {
    original: 'Matha ghurche',
    language: 'Bengali',
    transliteration: 'মাথা ঘুরছে',
    standardizedConcept: 'Patient-reported dizziness, lightheadedness or vertigo',
    clinicalCategory: 'Neurological',
    contextNote: 'Needs differentiation between true vertigo, orthostatic presyncope, and tension-type dizziness.'
  },
  {
    original: 'Chhati mein bhaari-pan',
    language: 'Hindi',
    transliteration: 'छाती में भारीपन',
    standardizedConcept: 'Patient-reported retrosternal chest heaviness or tightness',
    clinicalCategory: 'Cardiovascular',
    contextNote: 'High priority symptom requiring rule-out of acute coronary syndrome.'
  },
  {
    original: 'Dum phulna',
    language: 'Hindi',
    transliteration: 'दम फूलना',
    standardizedConcept: 'Patient-reported breathlessness or exertional dyspnea',
    clinicalCategory: 'Respiratory',
    contextNote: 'Correlate with exertion, orthopnea, nocturnal awakening, and wheeze.'
  },
  {
    original: 'Nenju vali / padapadapu',
    language: 'Tamil',
    transliteration: 'நெஞ்சு படபடப்பு',
    standardizedConcept: 'Patient-reported chest tightness or heart palpitations',
    clinicalCategory: 'Cardiovascular',
    contextNote: 'May indicate acute ischemia or supraventricular arrhythmia.'
  },
  {
    original: 'Gaat-re bikh',
    language: 'Assamese',
    transliteration: 'গাত বিষ',
    standardizedConcept: 'Patient-reported generalized body aches / myalgia',
    clinicalCategory: 'General',
    contextNote: 'Frequently encountered in febrile prodromes or viral syndromes.'
  }
];

export function findLocalExpression(text: string): LocalExpressionMapping | undefined {
  const lower = text.toLowerCase();
  return LOCAL_EXPRESSIONS_DB.find(expr => 
    lower.includes(expr.original.toLowerCase()) ||
    (expr.transliteration && text.includes(expr.transliteration))
  );
}
