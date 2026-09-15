import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePhysician } from '../../contexts/PhysicianContext';
import { useDemoMode } from '../../contexts/DemoModeContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  AlertTriangle,
  FolderArchive,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Bell,
  Menu,
  X
} from 'lucide-react';

interface PhysicianShellProps {
  children: React.ReactNode;
}

export const PhysicianShell: React.FC<PhysicianShellProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentDoctor, logout, patientQueue, alerts } = usePhysician();
  const { isDemoMode, resetDemo } = useDemoMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const pendingAlertsCount = alerts.filter(a => a.status === 'Needs triage').length;

  const handleReset = () => {
    resetDemo();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2000);
  };

  const navItems = [
    { name: 'Overview', href: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Patient Queue', href: '/doctor/queue', icon: Users, badge: patientQueue.length },
    { name: 'Clinical Summaries', href: '/doctor/patient/pt_ananya_01', icon: FileText },
    { name: 'Medical Documents', href: '/doctor/documents', icon: FolderArchive },
    { name: 'Priority Alerts', href: '/doctor/alerts', icon: AlertTriangle, alertBadge: pendingAlertsCount },
    { name: 'Operational Analytics', href: '/doctor/analytics', icon: BarChart3 },
    { name: 'HIS & Integrations', href: '/doctor/settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans antialiased">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
        <Link to="/doctor/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-bold">
            <Stethoscope className="w-4 h-4" />
          </div>
          <span className="font-bold text-white text-base">CareLens MD</span>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Physician Clinical Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand header */}
          <div className="p-5 border-b border-slate-800/80">
            <Link to="/doctor/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-md shadow-teal-500/10">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold text-white tracking-tight">CareLens</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                    MD Console
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block font-medium">
                  Clinical Intake Review
                </span>
              </div>
            </Link>
          </div>

          {/* Clinician Card */}
          <div className="mx-4 my-4 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-800/40 border border-teal-500/40 flex items-center justify-center text-teal-300 font-semibold text-xs">
              PS
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-200 truncate">
                {currentDoctor.name}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {currentDoctor.department}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              const IconComponent = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent
                      className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-500'}`}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-300">
                      {item.badge}
                    </span>
                  )}
                  {item.alertBadge !== undefined && item.alertBadge > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
                      {item.alertBadge} Alert
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950">
          {/* Demo Mode status indicator */}
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Demo Sandbox
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-teal-400 hover:text-teal-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              title="Reset sample patients and alerts"
            >
              <RotateCcw className="w-3 h-3" />
              {resetDone ? 'Done' : 'Reset'}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <Link to="/" className="hover:text-slate-200 transition-colors">
              Public Portal
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/doctor/login');
              }}
              className="hover:text-rose-400 flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Clinical Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 text-slate-900 overflow-y-auto">
        {/* Physician Console Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-2xs sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">
                  CareLens Clinical Intake Console
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-200 rounded-md">
                  OPD Triage Active
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pre-consultation clinical histories, medical timelines & red-flag triage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {pendingAlertsCount > 0 && (
              <Link
                to="/doctor/alerts"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>{pendingAlertsCount} Priority Items Require Review</span>
              </Link>
            )}

            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              HIS Simulation: Connected
            </span>
          </div>
        </header>

        {/* Workspace Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
