import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDemoMode } from '../../contexts/DemoModeContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import {
  Activity,
  Stethoscope,
  RotateCcw,
  Sparkles,
  Sliders,
  Menu,
  X,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { isDemoMode, toggleDemoMode, resetDemo } = useDemoMode();
  const { openModal } = useAccessibility();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [resetFeedback, setResetFeedback] = useState(false);

  const isKiosk = location.pathname.startsWith('/kiosk');
  const isDoctor = location.pathname.startsWith('/doctor');

  const handleReset = () => {
    resetDemo();
    setResetFeedback(true);
    setTimeout(() => setResetFeedback(false), 2000);
    setShowDemoMenu(false);
  };

  const navLinks = [
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Features', href: '/features' },
    { name: 'Privacy & Safety', href: '/privacy' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                    CareLens
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                    Clinical Intake
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 tracking-tight">
                  History First. Better Care.
                </span>
              </div>
            </Link>
          </div>

          {/* Center Navigation Links (Public pages) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`transition-colors py-1 relative ${
                    isActive
                      ? 'text-teal-700 font-semibold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls & CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Demo Mode Badge / Control */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  isDemoMode
                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 shadow-2xs'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{isDemoMode ? 'Demo Sandbox Active' : 'Production Mode'}</span>
                <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 font-semibold text-slate-800">
                    <span>Demo Environment</span>
                    <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-800 rounded">
                      Deterministic
                    </span>
                  </div>
                  <p className="text-slate-500 mb-3 leading-relaxed">
                    Demo Mode provides realistic simulation of Ananya Sharma, ABHA sandbox, OCR document parsing, and HIS telemetry without external API requirements.
                  </p>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-medium transition-colors cursor-pointer border border-teal-200"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {resetFeedback ? 'Demo Reset Successful!' : 'Reset Demo State'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        toggleDemoMode();
                        setShowDemoMenu(false);
                      }}
                      className="w-full text-left py-1.5 px-2 rounded hover:bg-slate-50 text-slate-600 cursor-pointer"
                    >
                      {isDemoMode ? 'Switch to Production Endpoint Mode' : 'Switch to Demo Sandbox Mode'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Accessibility Button */}
            <button
              type="button"
              onClick={openModal}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
              title="Accessibility & Display Settings"
              aria-label="Open accessibility settings"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Kiosk or Doctor Shortcuts */}
            {!isKiosk && (
              <Link
                to="/kiosk"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl shadow-xs transition-colors"
              >
                <span>Patient Kiosk</span>
              </Link>
            )}

            {!isDoctor && (
              <Link
                to="/doctor/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs"
              >
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span>Doctor Console</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={openModal}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
              aria-label="Accessibility"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-amber-50 text-amber-900 font-medium text-sm border border-amber-200"
            >
              <RotateCcw className="w-4 h-4" />
              {resetFeedback ? 'Demo Reset Complete!' : 'Reset Demo State'}
            </button>

            <Link
              to="/kiosk"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center w-full py-2.5 px-4 bg-teal-600 text-white font-semibold rounded-xl text-sm shadow-xs"
            >
              Start Patient Journey (Kiosk)
            </Link>

            <Link
              to="/doctor/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center w-full py-2.5 px-4 bg-slate-100 text-slate-800 font-semibold rounded-xl text-sm border border-slate-200"
            >
              Physician Console
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
