import React from 'react';
import { usePatientSession } from '../../contexts/PatientSessionContext';
import { ShieldAlert, RefreshCw, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SessionTimeoutModal: React.FC = () => {
  const { showTimeoutWarning, secondsUntilTimeout, resetTimeoutWarning, endSession } = usePatientSession();
  const navigate = useNavigate();

  if (!showTimeoutWarning) return null;

  const handleEnd = async () => {
    await endSession('User chose to end session during inactivity prompt');
    navigate('/kiosk/complete');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-200 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-800">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">
          For your privacy, this session will end soon
        </h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          No activity was detected for a while. To protect your medical privacy on this kiosk terminal, this intake session will automatically close in:
        </p>

        {/* Big countdown display */}
        <div className="my-4 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-50 border-2 border-amber-300 text-3xl font-extrabold text-amber-900 font-mono shadow-inner">
          {secondsUntilTimeout}s
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
          <button
            type="button"
            onClick={resetTimeoutWarning}
            className="w-full sm:flex-1 py-3.5 px-5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Continue Visit
          </button>
          <button
            type="button"
            onClick={handleEnd}
            className="w-full sm:w-auto py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            End Session
          </button>
        </div>
      </div>
    </div>
  );
};
