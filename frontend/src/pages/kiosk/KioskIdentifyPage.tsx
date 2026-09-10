import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientKioskShell } from '../../components/layout/PatientKioskShell';
import { usePatientSession } from '../../contexts/PatientSessionContext';
import { ArrowRight, User, Phone, Calendar, HeartPulse, Stethoscope, Sparkles } from 'lucide-react';

export const KioskIdentifyPage: React.FC = () => {
  const navigate = useNavigate();
  const { patient, updatePatient, setClinicalTrack } = usePatientSession();

  const [name, setName] = useState(patient.name || 'Ananya Sharma');
  const [age, setAge] = useState(String(patient.age || 42));
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>(patient.gender as any || 'Female');
  const [phone, setPhone] = useState(patient.phone || '+91 98765 43210');
  const [track, setTrack] = useState<'MODERN_MEDICINE' | 'AYUSH'>(patient.clinicalTrack || 'MODERN_MEDICINE');
  const [error, setError] = useState<string | null>(null);

 const handleContinue = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!name.trim()) {
    setError('Please enter your full name');
    return;
  }

  const numAge = parseInt(age, 10);

  if (isNaN(numAge) || numAge <= 0 || numAge > 120) {
    setError('Please enter a valid age');
    return;
  }

  try {
    const response = await fetch('http://localhost:8000/api/patients/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name.trim(),
        age: numAge,
        gender,
        phone: phone.trim(),
        clinicalTrack: track
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save patient');
    }

    const savedPatient = await response.json();

    updatePatient({
      id: String(savedPatient.id),
      name: savedPatient.name,
      age: savedPatient.age,
      gender: savedPatient.gender,
      phone: savedPatient.phone,
      clinicalTrack: savedPatient.clinicalTrack
    });

    setClinicalTrack(track);
    navigate('/kiosk/abha');

  } catch (err) {
    console.error(err);
    setError('Unable to save patient. Please try again.');
  }
};

  return (
    <PatientKioskShell
      currentStepIndex={0}
      title="Patient Details"
      subtitle="Please verify or enter your basic details for today's OPD consultation."
    >
      <form onSubmit={handleContinue} className="max-w-xl mx-auto w-full space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="patient-name" className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Full Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="patient-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ananya Sharma"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 text-slate-900 font-medium text-base transition-all"
                required
              />
            </div>
          </div>

          {/* Age & Gender Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="patient-age" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Age (Years)
              </label>
              <div className="relative">
                <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="patient-age"
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 text-slate-900 font-medium text-base transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Female', 'Male', 'Other'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-3 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      gender === g
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label htmlFor="patient-phone" className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Mobile Number (For OPD SMS & ABHA)
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="patient-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 text-slate-900 font-medium text-base transition-all"
              />
            </div>
          </div>

          {/* Clinical Track Selection: Modern Medicine vs AYUSH */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Clinical Assessment Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTrack('MODERN_MEDICINE')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  track === 'MODERN_MEDICINE'
                    ? 'border-teal-600 bg-teal-50/70 shadow-xs ring-1 ring-teal-600'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <span>Modern Medicine</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Standard OPD clinical intake, symptoms & prescription review.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTrack('AYUSH')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  track === 'AYUSH'
                    ? 'border-teal-600 bg-teal-50/70 shadow-xs ring-1 ring-teal-600'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <HeartPulse className="w-4 h-4 text-emerald-600" />
                  <span>AYUSH / Ayurveda</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Includes Prakriti, Agni (Ahara Shakti), Koshtha & lifestyle inquiry.
                </p>
              </button>
            </div>
            {track === 'AYUSH' && (
              <p className="text-[11px] text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 mt-2">
                * AYUSH assessment information — physician interpretation required. CareLens does not perform autonomous Ayurvedic diagnosis.
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-base rounded-2xl shadow-lg shadow-teal-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue to ABHA Verification</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </PatientKioskShell>
  );
};
