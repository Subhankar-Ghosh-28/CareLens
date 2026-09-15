import React, { useState } from 'react';
import { PhysicianShell } from '../../components/layout/PhysicianShell';
import { usePhysician } from '../../contexts/PhysicianContext';
import { ConfidenceBadge } from '../../components/common/ConfidenceBadge';
import { SourceModal } from '../../components/common/SourceModal';
import {
  FolderArchive,
  FileText,
  Search,
  Eye,
  Sparkles,
  AlertTriangle,
  Calendar,
  User,
  ArrowRight
} from 'lucide-react';

export const DoctorDocumentsPage: React.FC = () => {
  const { documents, getPatientById } = usePhysician();
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.documentType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PhysicianShell>
      <div className="space-y-6 animate-in fade-in duration-150">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Digitized Medical Documents Library
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Prescriptions, lab panels, and discharge summaries scanned and parsed via OCR
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            Total Documents: {documents.length}
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents by title or type..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:border-teal-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => {
            const pt = getPatientById(doc.patientId);

            return (
              <div
                key={doc.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      {doc.documentType.replace('_', ' ')}
                    </span>
                    <ConfidenceBadge score={doc.confidenceScore} />
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">{doc.title}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    <span>Patient: {pt?.name || 'Ananya Sharma'}</span>
                  </div>

                  {/* Highlights */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1 text-slate-600">
                    <div>
                      <strong>Extracted Meds:</strong>{' '}
                      {doc.extractedData.medications.map(m => m.name).join(', ') || 'None'}
                    </div>
                    <div>
                      <strong>Lab Values:</strong>{' '}
                      {doc.extractedData.labResults.map(l => `${l.testName} (${l.value})`).join(', ') || 'None'}
                    </div>
                  </div>

                  {doc.confidenceScore < 0.8 && (
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Handwritten notes detected — verify original</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDoc(doc)}
                  className="w-full py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Document & OCR Text</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Source Modal */}
        {selectedDoc && (
          <SourceModal
            isOpen={!!selectedDoc}
            onClose={() => setSelectedDoc(null)}
            sourceType="DOCUMENT"
            sourceId={selectedDoc.id}
            description={`Original Document Scan: ${selectedDoc.title}`}
          />
        )}
      </div>
    </PhysicianShell>
  );
};
