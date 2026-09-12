import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PhysicianShell } from '../../components/layout/PhysicianShell';
import { usePhysician } from '../../contexts/PhysicianContext';
import { SourceReferenceBadge } from '../../components/common/SourceReferenceBadge';
import { VerificationBadge } from '../../components/common/VerificationBadge';
import { ConfidenceBadge } from '../../components/common/ConfidenceBadge';
import { RedFlagBadge } from '../../components/common/RedFlagBadge';
import { SourceModal } from '../../components/common/SourceModal';
import { Modal } from '../../components/common/Modal';
import {
  Stethoscope,
  FileCheck,
  Send,
  Download,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Pill,
  FolderArchive,
  History,
  ShieldCheck,
  HeartPulse,
  Share2,
  FileText,
  User,
  Activity,
  Sparkles
} from 'lucide-react';
import { ClinicalSummary, TimelineEvent, MedicalDocument } from '../../types';

export const DoctorPatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    getPatientById,
    getSummaryByPatientId,
    getTimelineByPatientId,
    getDocumentsByPatientId,
    verifySummary,
    updateSummarySection,
    exportToHis,
    alerts
  } = usePhysician();

  const patientId = id || 'pt_ananya_01';
  const patient = getPatientById(patientId);
  const summary = getSummaryByPatientId(patientId);
  const timeline = getTimelineByPatientId(patientId);
  const documents = getDocumentsByPatientId(patientId);
  const patientAlerts = alerts.filter(a => a.patientId === patientId);

  // Tabs
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'DOCUMENTS' | 'TIMELINE' | 'AYUSH' | 'AUDIT'>('SUMMARY');

  // Source Modal state
  const [selectedSource, setSelectedSource] = useState<{
    type: 'DOCUMENT' | 'PATIENT_INTERVIEW' | 'ABHA_HEALTH_RECORD';
    id: string;
    description: string;
  } | null>(null);

  // Edit Section state
  const [editingSection, setEditingSection] = useState<{
    sectionKey: keyof ClinicalSummary;
    title: string;
    content: string;
  } | null>(null);
  const [editReason, setEditReason] = useState('');

  // Confirm Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [acceptedResponsibility, setAcceptedResponsibility] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  // HIS Export Modal state
  const [showHisModal, setShowHisModal] = useState(false);
  const [hisExportResult, setHisExportResult] = useState<{
    success: boolean;
    hisReference?: string;
    timestamp?: string;
  } | null>(null);
  const [isExportingHis, setIsExportingHis] = useState(false);
  const [realFhirBundle, setRealFhirBundle] = useState<any>(null);

  React.useEffect(() => {
    if (/^\d+$/.test(patientId)) {
      fetch(`http://localhost:8000/api/patients/${patientId}/fhir`)
        .then((res) => (res.ok ? res.json() : null))
        .then((bundle) => {
          if (bundle) setRealFhirBundle(bundle);
        })
        .catch(() => {});
    }
  }, [patientId]);

  if (!patient || !summary) {
    return (
      <PhysicianShell>
        <div className="p-8 text-center text-slate-500">
          Patient record not found. <Link to="/doctor/queue" className="underline text-teal-600">Return to queue</Link>
        </div>
      </PhysicianShell>
    );
  }

  // Handle saving an edited section
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !editReason.trim()) return;

    updateSummarySection(patientId, editingSection.sectionKey, editingSection.content, editReason.trim());
    setEditingSection(null);
    setEditReason('');
  };

  // Handle Physician Confirmation
  const handleConfirmSummary = () => {
    if (!acceptedResponsibility) return;
    verifySummary(patientId, (summary as any).id || 'sum_01');
    setConfirmSuccess(true);
    setTimeout(() => {
      setConfirmSuccess(false);
      setShowConfirmModal(false);
    }, 1500);
  };

  // Handle Export to HIS simulation
  const handleExportToHis = async () => {
    setIsExportingHis(true);
    try {
      const res = await exportToHis((summary as any).id || patientId);
      setHisExportResult(res);
    } finally {
      setIsExportingHis(false);
    }
  };

  // Simulated FHIR R4 Bundle for modal preview
  const fhirBundlePayload = {
    resourceType: 'Bundle',
    type: 'document',
    timestamp: new Date().toISOString(),
    entry: [
      {
        resource: {
          resourceType: 'Composition',
          status: 'final',
          title: 'CareLens Pre-Consultation Intake Record',
          subject: { reference: `Patient/${patient.id}`, display: patient.name },
          date: new Date().toISOString(),
          author: [{ display: 'Dr. Priya Sen (Physician Verified)' }]
        }
      },
      {
        resource: {
          resourceType: 'Patient',
          id: patient.id,
          name: [{ text: patient.name }],
          gender: patient.gender.toLowerCase(),
          identifier: [{ system: 'https://healthid.ndhm.gov.in', value: patient.abhaId }]
        }
      },
      {
        resource: {
          resourceType: 'Condition',
          clinicalStatus: { coding: [{ code: 'active' }] },
          code: { text: summary.chiefComplaint }
        }
      }
    ]
  };

  return (
    <PhysicianShell>
      <div className="space-y-6 animate-in fade-in duration-150">
        {/* Top Patient Clinical Banner */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-extrabold text-xl shadow-xs">
                {patient.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {patient.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {patient.age}y / {patient.gender}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700">
                    ABHA: {patient.abhaId}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>Phone: {patient.phone}</span>
                  <span>•</span>
                  <span>Intake Mode: {patient.clinicalTrack === 'AYUSH' ? 'AYUSH Assessment' : 'Modern Medicine'}</span>
                  <span>•</span>
                  <span className="font-semibold text-teal-700">
                    Intake Status: {summary.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  summary.status === 'VERIFIED'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{summary.status === 'VERIFIED' ? 'Physician Verified' : 'Review & Verify Summary'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowHisModal(true)}
                className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
              >
                <Send className="w-4 h-4 text-teal-600" />
                <span>Send to HIS (FHIR)</span>
              </button>
            </div>
          </div>

          {/* Priority Attention Banner if alerts exist */}
          {patientAlerts.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-rose-950 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Priority Clinical Attention Alert: {patientAlerts[0].title}</span>
              </div>
              <span className="text-rose-800 font-medium">
                {patientAlerts[0].description}
              </span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
          {[
            { key: 'SUMMARY', label: 'Structured Clinical Summary', icon: FileText },
            { key: 'DOCUMENTS', label: `Documents (${(documents || []).length})`, icon: FolderArchive },
            { key: 'TIMELINE', label: `Chronological Story (${(timeline || []).length})`, icon: History },
            { key: 'AYUSH', label: 'AYUSH Assessment', icon: HeartPulse },
            { key: 'AUDIT', label: 'Audit Trail', icon: ShieldCheck }
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-teal-800 shadow-xs border border-slate-200 font-extrabold'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <IconComp className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Structured Clinical Summary */}
        {activeTab === 'SUMMARY' && (
          <div className="space-y-6">
            {/* Chief Complaint & HPI */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Chief Complaint & History of Present Illness (HPI)
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setEditingSection({
                      sectionKey: 'chiefComplaint',
                      title: 'Chief Complaint',
                      content: summary.chiefComplaint
                    })
                  }
                  className="text-teal-700 hover:text-teal-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
              <div className="text-sm font-bold text-slate-900 leading-snug">
                {summary.chiefComplaint}
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
                <span className="font-bold text-slate-900 block">Synthesized Narrative:</span>
                <p>{summary.historyOfPresentIllness}</p>
              </div>
            </div>

            {/* Current Medications & Drug Allergies Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Medications (2 cols) */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-teal-600" />
                    <span>Active Medications ({(summary.currentMedications || []).length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Extracted from prescriptions & interview</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Medication</th>
                        <th className="py-2.5 px-3">Dosage / Frequency</th>
                        <th className="py-2.5 px-3">Confidence</th>
                        <th className="py-2.5 px-3 text-right">Source Trace</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {(summary.currentMedications || []).map((med, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-bold text-slate-900">{med.name}</td>
                          <td className="py-3 px-3 text-slate-600">{med.dosage} • {med.frequency}</td>
                          <td className="py-3 px-3">
                            <ConfidenceBadge score={med.confidenceScore} />
                          </td>
                          <td className="py-3 px-3 text-right">
                            <SourceReferenceBadge
                              sourceType={med.sourceType}
                              sourceReference={med.sourceReference}
                              onClick={() =>
                                setSelectedSource({
                                  type: med.sourceType,
                                  id: med.sourceId,
                                  description: med.sourceReference
                                })
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Allergies & Red Flags (1 col) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Documented Allergies</span>
                  </h3>
                </div>

                {(summary.allergies || []).length > 0 ? (
                  <div className="space-y-2">
                    {(summary.allergies || []).map((allergy, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-900 flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                        <span>{allergy}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">No known drug allergies reported.</div>
                )}

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                  * Alert verified against patient self-report and previous prescription contraindications.
                </div>
              </div>
            </div>

            {/* Past Medical & Surgical History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Past Medical Diagnoses
                  </h3>
                </div>
                <ul className="space-y-2 text-xs">
                  {(summary.pastMedicalHistory || []).map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-800 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Surgical & Hospitalization History
                  </h3>
                </div>
                <ul className="space-y-2 text-xs">
                  {(summary.pastSurgicalHistory || []).map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-800 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Medical Documents */}
        {activeTab === 'DOCUMENTS' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-500 px-1">
              Showing physical records scanned or uploaded by the patient, along with OCR extracted clinical entities.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(documents || []).map((doc) => (
                <div
                  key={doc.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                        {doc.documentType ? doc.documentType.replace('_', ' ') : 'Document'}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{doc.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        Uploaded {doc.uploadedAt} • File: {doc.fileName}
                      </p>
                    </div>
                    <ConfidenceBadge score={doc.confidenceScore} />
                  </div>

                  {/* OCR Extracted details */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <span className="font-bold text-slate-800 block">Extracted Entities:</span>
                    <div className="text-slate-600">
                      <strong>Meds:</strong> {(doc.extractedData?.medications || []).map(m => m.name).join(', ') || 'None'}
                    </div>
                    <div className="text-slate-600">
                      <strong>Lab Values:</strong> {(doc.extractedData?.labResults || []).map(l => `${l.testName}: ${l.value} ${l.unit}`).join(', ') || 'None'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedSource({
                        type: 'DOCUMENT',
                        id: doc.id,
                        description: `Original OCR Scan for ${doc.title}`
                      })
                    }
                    className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Inspect Raw OCR & Source Page</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Chronological Story Timeline */}
        {activeTab === 'TIMELINE' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
            <div className="text-xs text-slate-500 pb-2 border-b border-slate-100">
              Multi-year clinical story reconstructed from patient interview, prescriptions, and discharge summaries.
            </div>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-teal-200 space-y-6">
              {(timeline || []).map((evt) => (
                <div key={evt.id} className="relative">
                  <div className="absolute -left-[31px] sm:-left-[39px] top-3.5 w-5 h-5 rounded-full bg-white border-4 border-teal-600 shadow-xs" />

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-white text-slate-800 border border-slate-200">
                          {evt.date}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                          {evt.category}
                        </span>
                      </div>
                      <VerificationBadge status={evt.verificationStatus} />
                    </div>

                    <div className="text-sm font-bold text-slate-900">{evt.title}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Source:</span>
                      <SourceReferenceBadge
                        sourceType={evt.sourceType}
                        sourceReference={evt.sourceReference}
                        onClick={() =>
                          setSelectedSource({
                            type: evt.sourceType,
                            id: evt.sourceId,
                            description: evt.sourceReference
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AYUSH Assessment */}
        {activeTab === 'AYUSH' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <span className="font-bold block text-sm">
                AYUSH / Ayurvedic Assessment Track
              </span>
              <p className="leading-relaxed">
                * Regulatory Notice: AYUSH assessment information is auxiliary and requires treating physician interpretation. CareLens does not make autonomous Ayurvedic diagnoses.
              </p>
            </div>

            {!summary.ayushAssessment || (!summary.ayushAssessment.prakriti && !summary.ayushAssessment.agni) ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <span className="font-bold text-slate-800 text-sm block">
                  No AYUSH Assessment Recorded
                </span>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  This patient's clinical intake was conducted under the {patient.clinicalTrack === 'AYUSH' ? 'AYUSH' : 'Modern Medicine'} pathway without a completed Dashavidha Pariksha questionnaire.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Prakriti (Constitution)
                    </span>
                    <div className="text-base font-bold text-slate-900">
                      {summary.ayushAssessment.prakriti || 'Not assessed'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Vikriti (Dosha Imbalance)
                    </span>
                    <div className="text-base font-bold text-slate-900">
                      {summary.ayushAssessment.vikriti || 'Not assessed'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Agni / Ahara Shakti (Digestion)
                    </span>
                    <div className="text-base font-bold text-slate-900">
                      {summary.ayushAssessment.agni || summary.ayushAssessment.aharaShakti || 'Not assessed'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Sara (Tissue Vitality)
                    </span>
                    <div className="text-base font-bold text-slate-900">
                      {summary.ayushAssessment.sara || 'Not assessed'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Samhanana (Body Build)
                    </span>
                    <div className="text-base font-bold text-slate-900">
                      {summary.ayushAssessment.samhanana || 'Not assessed'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Satva (Mental Resilience)
                    </span>
                    <div className="text-base font-bold text-slate-900">
                      {summary.ayushAssessment.satva || 'Not assessed'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Vyayama Shakti (Endurance)
                    </span>
                    <div className="text-base font-bold text-slate-900">
                      {summary.ayushAssessment.vyayamaShakti || 'Not assessed'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Satmya (Adaptability)
                    </span>
                    <div className="text-base font-bold text-slate-900">
                      {summary.ayushAssessment.satmya || 'Not assessed'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Koshtha (Bowel Habit)
                    </span>
                    <div className="text-base font-bold text-slate-900">
                      {summary.ayushAssessment.koshtha || 'Not assessed'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Pramana (Body Proportion)
                    </span>
                    <div className="text-base font-bold text-slate-900">
                      {summary.ayushAssessment.pramana || 'Not assessed'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Vaya (Life Stage)
                    </span>
                    <div className="text-base font-bold text-slate-900">
                      {summary.ayushAssessment.vaya || 'Not assessed'}
                    </div>
                  </div>
                </div>

                {summary.ayushAssessment.dietaryHabits && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                    <span className="font-bold text-slate-900 block">Assessment Notes & Intake Context:</span>
                    <p>{summary.ayushAssessment.dietaryHabits}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 5: Audit Trail */}
        {activeTab === 'AUDIT' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Immutable Clinical Audit Log for Patient {patient.name}
            </h3>
            <div className="space-y-3">
              {(summary.auditTrail || []).map((entry) => (
                <div key={entry.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{entry.action}</span>
                    <span className="font-mono text-slate-400 text-[11px]">{entry.timestamp}</span>
                  </div>
                  <p className="text-slate-600">
                    Actor: <strong>{entry.performedBy}</strong> ({entry.role})
                  </p>
                  {entry.reason && (
                    <p className="text-teal-800 bg-teal-50 px-2 py-1 rounded text-[11px]">
                      Reason: {entry.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source Traceability Modal */}
        <SourceModal
          isOpen={!!selectedSource}
          onClose={() => setSelectedSource(null)}
          sourceType={selectedSource?.type || 'DOCUMENT'}
          sourceId={selectedSource?.id || ''}
          description={selectedSource?.description}
        />

        {/* Edit Section Modal */}
        {editingSection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
              <h3 className="text-base font-bold text-slate-900">
                Edit {editingSection.title}
              </h3>
              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Corrected Text</label>
                  <textarea
                    value={editingSection.content}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, content: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium h-28"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mandatory Reason for Clinical Edit (Logged to Audit Trail)
                  </label>
                  <input
                    type="text"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="e.g. Patient clarified onset was 3 days ago, not 2"
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingSection(null)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow-xs"
                  >
                    Save & Audit Log
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Physician Intake Verification & Sign-Off"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <p className="leading-relaxed">
              You are verifying the synthesized pre-consultation intake for <strong>{patient.name}</strong>.
            </p>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
              <span className="font-bold block">Mandatory Clinical Responsibility Notice:</span>
              <p className="leading-relaxed">
                CareLens AI provides intake drafting assistance. Treating physicians maintain complete clinical responsibility for evaluating, questioning, and treating the patient.
              </p>
              <label className="flex items-start gap-2 pt-2 font-bold cursor-pointer text-amber-900">
                <input
                  type="checkbox"
                  checked={acceptedResponsibility}
                  onChange={(e) => setAcceptedResponsibility(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 mt-0.5"
                />
                <span>
                  I have reviewed this clinical summary. I accept clinical responsibility for this patient's intake.
                </span>
              </label>
            </div>

            {confirmSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-center font-bold">
                Summary Verified & Committed to Medical Record!
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!acceptedResponsibility}
                  onClick={handleConfirmSummary}
                  className="flex-1 py-3 bg-teal-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Confirm & Commit Record
                </button>
              </div>
            )}
          </div>
        </Modal>

        {/* HIS Export Modal (FHIR Payload preview) */}
        <Modal
          isOpen={showHisModal}
          onClose={() => setShowHisModal(false)}
          title="Export Intake to Hospital Information System (HIS / EMR)"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <p className="leading-relaxed">
              Transmits this verified clinical summary to the hospital EMR via standard <strong>HL7 FHIR R4</strong> Composition bundle.
            </p>

            <div className="p-3 bg-slate-900 text-slate-200 rounded-2xl font-mono text-[11px] max-h-48 overflow-y-auto space-y-1">
              <div className="text-teal-400 font-bold">// FHIR R4 Document Bundle Preview</div>
              <pre>{JSON.stringify(realFhirBundle || fhirBundlePayload, null, 2)}</pre>
            </div>

            {hisExportResult ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Transmitted to Hospital HIS (Simulated Gateway)</span>
                </div>
                <p>Reference ID: <strong>{hisExportResult.hisReference}</strong></p>
                <p className="text-[11px] text-emerald-700">Timestamp: {hisExportResult.timestamp}</p>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHisModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isExportingHis}
                  onClick={handleExportToHis}
                  className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {isExportingHis ? 'Transmitting FHIR Bundle...' : 'Send FHIR Payload to HIS'}
                </button>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </PhysicianShell>
  );
};
