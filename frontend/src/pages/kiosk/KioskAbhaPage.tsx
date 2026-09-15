import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientKioskShell } from '../../components/layout/PatientKioskShell';
import { usePatientSession } from '../../contexts/PatientSessionContext';
import { abhaService } from '../../services';
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Fingerprint,
  RefreshCw
} from 'lucide-react';

export const KioskAbhaPage: React.FC = () => {
  const navigate = useNavigate();
  const { patient, updatePatient } = usePatientSession();

  // State: 'CHOICE' | 'ENTER_ABHA' | 'NO_ABHA_EXPLAIN' | 'RETURN_FROM_CREATION'
  const [viewState, setViewState] = useState<'CHOICE' | 'ENTER_ABHA' | 'NO_ABHA_EXPLAIN' | 'RETURN_FROM_CREATION'>('CHOICE');
  const [abhaInput, setAbhaInput] = useState(patient.abhaId || '91-4521-8890-3321');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    isSandbox: boolean;
    patientName?: string;
    error?: string;
  } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res = await abhaService.verifyAbha(abhaInput);
      setVerificationResult(res);
      if (res.success) {
        updatePatient({
          abhaId: abhaInput.trim(),
          abhaStatus: res.isSandbox ? 'SANDBOX_VERIFIED' : 'VERIFIED'
        });
      }
    } catch (err: any) {
      setVerificationResult({
        success: false,
        isSandbox: true,
        error: 'Unable to connect to verification gateway.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSkipOrContinue = () => {
    navigate('/kiosk/language');
  };

  const handleRedirectToOfficialCreation = () => {
    const url = abhaService.getOfficialCreateUrl();
    // Redirect via configured destination
    window.location.assign(url);
  };

  return (
    <PatientKioskShell
      currentStepIndex={0}
      title="Ayushman Bharat Health Account (ABHA)"
      subtitle="Link your 14-digit ABHA ID to retrieve past digital records and integrate with national health systems."
    >
      <div className="max-w-xl mx-auto w-full space-y-6">
        {/* VIEW 1: Initial Question: YES or NO */}
        {viewState === 'CHOICE' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6 text-center animate-in fade-in duration-150">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Fingerprint className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Do you have an ABHA ID?
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                ABHA is your 14-digit Ayushman Bharat Health Number that securely holds your medical history across India.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => setViewState('ENTER_ABHA')}
                className="py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-base shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Yes, I have an ABHA</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setViewState('NO_ABHA_EXPLAIN')}
                className="py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-base border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>No, I don't have one</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSkipOrContinue}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
              >
                Skip for now and continue without ABHA
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: Patient HAS ABHA -> Enter & Verify */}
        {viewState === 'ENTER_ABHA' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                ABHA Verification
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Demo / Sandbox
              </span>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="abha-number" className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Enter 14-Digit ABHA Number or ABHA Address
                </label>
                <input
                  id="abha-number"
                  type="text"
                  value={abhaInput}
                  onChange={(e) => setAbhaInput(e.target.value)}
                  placeholder="e.g. 91-4521-8890-3321 or ananya@abdm"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 text-slate-900 font-mono font-semibold text-lg transition-all"
                  required
                />
                <p className="text-[11px] text-slate-500">
                  Try default demo ID: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-teal-800">91-4521-8890-3321</code>
                </p>
              </div>

              {/* Status or Error Display */}
              {verificationResult && (
                <div
                  className={`p-4 rounded-xl border text-xs leading-relaxed ${
                    verificationResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {verificationResult.success ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-emerald-950 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>ABHA Sandbox Verification Successful</span>
                      </div>
                      <p>
                        Verified Name: <strong>{verificationResult.patientName}</strong> • Linked to Hospital Session
                      </p>
                      <p className="text-[10px] text-emerald-700">
                        * Honest Transparency Notice: Running in ABDM Sandbox mode for demonstration.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{verificationResult.error}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Verification Button */}
              {!verificationResult?.success ? (
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3.5 px-5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying with ABDM Gateway...</span>
                    </>
                  ) : (
                    <span>Verify ABHA</span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSkipOrContinue}
                  className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-base"
                >
                  <span>Continue with Verified ABHA</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </form>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setViewState('CHOICE')}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <button
                type="button"
                onClick={handleSkipOrContinue}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
              >
                Continue without ABHA
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: Patient DOES NOT have ABHA -> Explain + Official Redirect */}
        {viewState === 'NO_ABHA_EXPLAIN' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6 animate-in fade-in duration-150">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 px-2.5 py-1 rounded bg-teal-50 border border-teal-200 inline-block">
                ABDM National Ecosystem
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                What is an ABHA ID?
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                An ABHA (Ayushman Bharat Health Account) is a unique 14-digit digital identity issued by the Government of India. It allows you to access and share your digital health records with doctors across hospitals nationwide with your consent.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs text-teal-950 space-y-2">
              <span className="font-bold block text-sm">Official Government Creation Portal</span>
              <p className="text-teal-800 leading-relaxed">
                You can create your ABHA in under 2 minutes using your Aadhaar or Driving License on the official National Health Authority (NHA) ABDM portal.
              </p>
              <p className="font-mono text-[11px] text-teal-900 bg-white/80 p-2 rounded border border-teal-200">
                Destination: {abhaService.getOfficialCreateUrl()}
              </p>
            </div>

            {/* Big Redirect Button */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleRedirectToOfficialCreation}
                className="w-full py-4 px-6 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer text-base"
              >
                <span>Create ABHA on Official Portal</span>
                <ExternalLink className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setViewState('RETURN_FROM_CREATION')}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
              >
                I have created my ABHA (Return to CareLens)
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setViewState('CHOICE')}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Go Back
              </button>
              <button
                type="button"
                onClick={handleSkipOrContinue}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
              >
                Proceed without ABHA
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: Return from external creation */}
        {viewState === 'RETURN_FROM_CREATION' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6 animate-in fade-in duration-150">
            <h2 className="text-xl font-bold text-slate-900">
              Have you created your ABHA?
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Great! Enter your newly created 14-digit ABHA number below to link it to today's intake.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setViewState('ENTER_ABHA')}
                className="py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-xs cursor-pointer"
              >
                I have created my ABHA
              </button>
              <button
                type="button"
                onClick={() => setViewState('NO_ABHA_EXPLAIN')}
                className="py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm cursor-pointer"
              >
                Go back to creation guide
              </button>
            </div>
          </div>
        )}
      </div>
    </PatientKioskShell>
  );
};
