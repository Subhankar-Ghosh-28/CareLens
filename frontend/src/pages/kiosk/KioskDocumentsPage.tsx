import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientKioskShell } from '../../components/layout/PatientKioskShell';
import { usePatientSession } from '../../contexts/PatientSessionContext';
import { ocrService } from '../../services';
import { MedicalDocument } from '../../types';
import { ConfidenceBadge } from '../../components/common/ConfidenceBadge';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  Plus
} from 'lucide-react';

export const KioskDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { uploadedDocuments, addUploadedDocument, removeUploadedDocument, patient } = usePatientSession();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // File drag & drop or selection
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    // Check file size (15MB limit)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 15MB limit. Please upload a smaller scan or PDF.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await ocrService.processDocument(
        file,
        'Prescription',
        String(patient.databaseId ?? patient.id),
      );
      addUploadedDocument(res.document);
    } catch (err: any) {
      setErrorMsg('Could not process this document. Please try again or choose a preset.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Preset demo document selector (handy for zero-friction kiosk testing)
  const handleAddPresetDoc = async (presetType: 'PRESCRIPTION' | 'LAB_REPORT' | 'DISCHARGE_SUMMARY') => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Simulate file upload with demo adapter
      const fakeFile = new File(['mock content'], `${presetType.toLowerCase()}_sample.pdf`, {
        type: 'application/pdf'
      });
      const cat = presetType === 'LAB_REPORT' ? 'Lab Report' : presetType === 'DISCHARGE_SUMMARY' ? 'Discharge Summary' : 'Prescription';
      const res = await ocrService.processDocument(
        fakeFile,
        cat,
        String(patient.databaseId ?? patient.id),
      );
      addUploadedDocument(res.document);
    } catch (err: any) {
      setErrorMsg('Failed to load sample document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    navigate('/kiosk/processing');
  };

  return (
    <PatientKioskShell
      currentStepIndex={4}
      title="Medical Documents & Reports"
      subtitle="Upload or scan physical prescriptions, lab test reports, or prior hospital discharge summaries."
    >
      <div className="max-w-3xl mx-auto w-full space-y-6">
        {/* Error notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Upload Zone */}
        <div className="p-8 rounded-3xl bg-white border-2 border-dashed border-slate-300 hover:border-teal-500 transition-colors text-center relative group">
          <input
            id="doc-upload"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="max-w-md mx-auto space-y-3 pointer-events-none">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base block">
                {isProcessing ? 'Processing Document with OCR Pipeline...' : 'Tap to scan or drag documents here'}
              </span>
              <span className="text-xs text-slate-500 mt-1 block">
                Supported formats: PDF, PNG, JPG (Max 15MB per file)
              </span>
            </div>
          </div>
        </div>

        {/* Demo Fast-Load Presets */}
        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Quick Demo Samples (Try with 1-Tap):
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleAddPresetDoc('PRESCRIPTION')}
              className="py-2.5 px-3 rounded-xl bg-white border border-slate-200 hover:border-teal-400 text-xs font-semibold text-slate-800 transition-all flex items-center justify-between cursor-pointer shadow-2xs"
            >
              <span>Dr. Mehta Prescription</span>
              <Plus className="w-3.5 h-3.5 text-teal-600" />
            </button>
            <button
              type="button"
              onClick={() => handleAddPresetDoc('LAB_REPORT')}
              className="py-2.5 px-3 rounded-xl bg-white border border-slate-200 hover:border-teal-400 text-xs font-semibold text-slate-800 transition-all flex items-center justify-between cursor-pointer shadow-2xs"
            >
              <span>Lipid & HbA1c Lab Report</span>
              <Plus className="w-3.5 h-3.5 text-teal-600" />
            </button>
            <button
              type="button"
              onClick={() => handleAddPresetDoc('DISCHARGE_SUMMARY')}
              className="py-2.5 px-3 rounded-xl bg-white border border-slate-200 hover:border-teal-400 text-xs font-semibold text-slate-800 transition-all flex items-center justify-between cursor-pointer shadow-2xs"
            >
              <span>Cholecystectomy Summary</span>
              <Plus className="w-3.5 h-3.5 text-teal-600" />
            </button>
          </div>
        </div>

        {/* List of Attached Documents */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 px-1">
            <span>Attached Documents ({uploadedDocuments.length})</span>
            <span>OCR Extraction Status</span>
          </div>

          {(uploadedDocuments || []).length === 0 ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
              No documents attached yet. You can continue without documents if you didn't bring any today.
            </div>
          ) : (
            <div className="space-y-3">
              {(uploadedDocuments || []).map((doc: any) => {
                const docTitle = doc.title || doc.fileName || doc.filename || 'Medical Document';
                const docType = (doc.documentType || doc.category || 'Prescription').replace('_', ' ');
                const medsCount = doc.extractedData?.medications?.length || 0;
                const labCount = doc.extractedData?.labResults?.length || 0;
                const diagCount = doc.extractedData?.diagnoses?.length || 0;
                const score =
                  doc.confidenceScore ??
                  (typeof doc.confidence === 'number' ? doc.confidence / 100 : undefined);

                return (
                  <div
                    key={doc.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{docTitle}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {docType}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                          <span>Extracted {medsCount} meds</span>
                          <span>•</span>
                          <span>{labCount} lab metrics</span>
                          <span>•</span>
                          <span>{diagCount} diagnoses</span>
                        </div>

                        {score < 0.8 && (
                          <div className="mt-2 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 inline-block">
                            ⚠️ Handwritten text detected — flagged for physician original verification
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                      {typeof score === 'number' && <ConfidenceBadge score={score} />}
                      <button
                        type="button"
                        onClick={() => removeUploadedDocument(doc.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Continue Action */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            {uploadedDocuments.length > 0
              ? 'All attached records will be organized into a unified clinical timeline.'
              : 'You can proceed directly to generate your clinical summary.'}
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="w-full sm:w-auto py-4 px-8 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-base rounded-2xl shadow-lg shadow-teal-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Process & Generate Summary</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </PatientKioskShell>
  );
};
