import { ClinicalAlert, ClinicalAnswer } from '../types';
import { CLINICAL_QUESTIONS } from '../data/questionBank';
import { DemoClinicalHistoryService } from './demoAdapters';
import { IClinicalHistoryService } from './interfaces';

export class BackendClinicalHistoryService implements IClinicalHistoryService {
  private readonly demoService = new DemoClinicalHistoryService();

  async getNextQuestion(
    currentAnswers: Record<string, string>,
    currentQuestionId?: string,
  ): Promise<any> {
    const applicable = CLINICAL_QUESTIONS.filter((q) => {
      if (q.condition) {
        return q.condition(currentAnswers);
      }
      return true;
    });

    if (!currentQuestionId) {
      return applicable[0] || null;
    }

    const currentIndex = applicable.findIndex(
      (q) => q.id === currentQuestionId,
    );
    if (currentIndex >= 0 && currentIndex < applicable.length - 1) {
      return applicable[currentIndex + 1];
    }

    return null;
  }

  async saveAnswer(patientId: string, answer: ClinicalAnswer): Promise<void> {
    if (!/^\d+$/.test(patientId)) {
      return this.demoService.saveAnswer(patientId, answer);
    }

    const response = await fetch('http://localhost:8000/api/clinical-history/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId: Number(patientId),
        questionId: answer.questionId,
        question: answer.questionText,
        answer: answer.answerText,
        language: 'en',
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to save clinical history.');
    }
  }

  async evaluateRedFlags(
    answers: Record<string, string>,
  ): Promise<ClinicalAlert[]> {
    const newAlerts: ClinicalAlert[] = [];
    const chief = (answers['q_chief_complaint'] || '').toLowerCase();
    const associated = (answers['q_chest_associated'] || '').toLowerCase();
    const radiation = (answers['q_chest_radiation'] || '').toLowerCase();
    const feverAssoc = (answers['q_fever_associated'] || '').toLowerCase();
    const allergies = (answers['q_mem_allergies'] || '').toLowerCase();

    // 1. Acute Chest Pain / ACS
    if (
      (chief.includes('chest') || chief.includes('chhati')) &&
      (associated.includes('dyspnea') ||
        associated.includes('sweating') ||
        radiation.includes('left_arm') ||
        associated.includes('breath'))
    ) {
      newAlerts.push({
        alertId: 'alert_cardiac',
        patientId: 'intake',
        trigger: 'Retrosternal Chest Discomfort with Dyspnea / Radiation',
        source: 'Patient Conversational Intake',
        timestamp: new Date().toISOString(),
        priority: 'CRITICAL',
        status: 'Needs triage',
        wording:
          'High-priority attention item: Reported chest discomfort with dyspnea/diaphoresis. Clinical evaluation and priority ECG recommended.',
      });
    }

    // 2. Severe Respiratory Distress
    if (
      feverAssoc.includes('severe_respiratory') ||
      chief.includes('breath') ||
      chief.includes('ushah') ||
      associated.includes('breath')
    ) {
      newAlerts.push({
        alertId: 'alert_resp',
        patientId: 'intake',
        trigger: 'Severe Breathing Difficulty / Shortness of Breath',
        source: 'Patient Conversational Intake',
        timestamp: new Date().toISOString(),
        priority: 'CRITICAL',
        status: 'Needs triage',
        wording:
          'High-priority attention item: Patient reports significant shortness of breath. Airway and oxygen saturation check recommended.',
      });
    }

    // 3. Drug Allergies
    if (allergies.includes('penicillin')) {
      newAlerts.push({
        alertId: 'alert_allergy',
        patientId: 'intake',
        trigger: 'Reported Penicillin Allergy',
        source: 'Patient Memory Reconstruction',
        timestamp: new Date().toISOString(),
        priority: 'HIGH',
        status: 'Acknowledged',
        wording:
          'Reported drug allergy: Penicillin (urticaria / swelling). Avoid beta-lactam prescribing.',
      });
    }

    // 4. Febrile infection with rigors
    if (feverAssoc.includes('chills_myalgia') || chief.includes('rigors')) {
      newAlerts.push({
        alertId: 'alert_fever',
        patientId: 'intake',
        trigger: 'High-Grade Fever with Rigors',
        source: 'Patient Conversational Intake',
        timestamp: new Date().toISOString(),
        priority: 'HIGH',
        status: 'Needs triage',
        wording:
          'Attention item: Patient reports high fever accompanied by rigors and chills.',
      });
    }

    return newAlerts;
  }
}
