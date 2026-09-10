import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePhysician } from '../../contexts/PhysicianContext';
import {
  Stethoscope,
  ShieldCheck,
  Lock,
  ArrowRight,
  UserCheck,
  Sparkles,
  HeartPulse,
  Activity
} from 'lucide-react';

export const DoctorLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = usePhysician();

  const [selectedRole, setSelectedRole] = useState<'PHYSICIAN' | 'TRIAGE_STAFF' | 'ADMIN'>('PHYSICIAN');
  const [username, setUsername] = useState('dr.priya.sen@apollo.demo');
  const [password, setPassword] = useState('demo1234');

  const handleRoleChange = (role: 'PHYSICIAN' | 'TRIAGE_STAFF' | 'ADMIN') => {
    setSelectedRole(role);
    if (role === 'PHYSICIAN') {
      setUsername('dr.priya.sen@hospital.demo');
    } else if (role === 'TRIAGE_STAFF') {
      setUsername('nurse.nair@hospital.demo');
    } else {
      setUsername('admin.roy@hospital.demo');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole);
    navigate('/doctor/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 font-sans selection:bg-teal-500">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black text-white tracking-tight block leading-tight">
                CareLens
              </span>
              <span className="text-[11px] font-bold text-teal-400 tracking-wider uppercase">
                Physician & Clinical Console
              </span>
            </div>
          </Link>
          <p className="text-xs text-slate-400">
            Secure clinical access for authorized hospital staff & attending clinicians
          </p>
        </div>

        {/* Role Selector Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Select Operating Role (1-Click Demo)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'PHYSICIAN', label: 'Doctor', title: 'Physician' },
                { role: 'TRIAGE_STAFF', label: 'Triage', title: 'OPD Nurse' },
                { role: 'ADMIN', label: 'Admin', title: 'Hospital Admin' }
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleRoleChange(item.role as any)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                    selectedRole === item.role
                      ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <span className="block">{item.label}</span>
                  <span className="text-[10px] opacity-75 font-normal block">{item.title}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Hospital Email / Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-sm font-medium focus:border-teal-500 focus:outline-hidden"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-sm font-medium focus:border-teal-500 focus:outline-hidden"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 font-bold text-sm rounded-2xl shadow-lg shadow-teal-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Access Clinical Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Sandbox note */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              Demo Environment
            </span>
            <span>Pre-seeded with OPD cohort</span>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Return to Public Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};
