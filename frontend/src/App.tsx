import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Context Providers
import { DemoModeProvider } from './contexts/DemoModeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { PatientSessionProvider } from './contexts/PatientSessionContext';
import { PhysicianProvider } from './contexts/PhysicianContext';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { PrivacyPage } from './pages/PrivacyPage';

// Patient Kiosk Pages
import { KioskStartPage } from './pages/kiosk/KioskStartPage';
import { KioskIdentifyPage } from './pages/kiosk/KioskIdentifyPage';
import { KioskAbhaPage } from './pages/kiosk/KioskAbhaPage';
import { KioskLanguagePage } from './pages/kiosk/KioskLanguagePage';
import { KioskConsentPage } from './pages/kiosk/KioskConsentPage';
import { KioskHistoryPage } from './pages/kiosk/KioskHistoryPage';
import { KioskDocumentsPage } from './pages/kiosk/KioskDocumentsPage';
import { KioskProcessingPage } from './pages/kiosk/KioskProcessingPage';
import { KioskTimelinePage } from './pages/kiosk/KioskTimelinePage';
import { KioskReviewPage } from './pages/kiosk/KioskReviewPage';
import { KioskCompletePage } from './pages/kiosk/KioskCompletePage';

// Physician Console Pages
import { DoctorLoginPage } from './pages/doctor/DoctorLoginPage';
import { DoctorDashboardPage } from './pages/doctor/DoctorDashboardPage';
import { DoctorQueuePage } from './pages/doctor/DoctorQueuePage';
import { DoctorPatientDetailPage } from './pages/doctor/DoctorPatientDetailPage';
import { DoctorDocumentsPage } from './pages/doctor/DoctorDocumentsPage';
import { DoctorAlertsPage } from './pages/doctor/DoctorAlertsPage';
import { DoctorAnalyticsPage } from './pages/doctor/DoctorAnalyticsPage';
import { DoctorSettingsPage } from './pages/doctor/DoctorSettingsPage';

// Scroll to top on navigation helper
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <DemoModeProvider>
        <LanguageProvider>
          <AccessibilityProvider>
            <PatientSessionProvider>
              <PhysicianProvider>
                <Routes>
                  {/* Public Informational Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/features" element={<FeaturesPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />

                  {/* Patient Kiosk Flow Routes */}
                  <Route path="/kiosk" element={<KioskStartPage />} />
                  <Route path="/kiosk/identify" element={<KioskIdentifyPage />} />
                  <Route path="/kiosk/abha" element={<KioskAbhaPage />} />
                  <Route path="/kiosk/language" element={<KioskLanguagePage />} />
                  <Route path="/kiosk/consent" element={<KioskConsentPage />} />
                  <Route path="/kiosk/history" element={<KioskHistoryPage />} />
                  <Route path="/kiosk/documents" element={<KioskDocumentsPage />} />
                  <Route path="/kiosk/processing" element={<KioskProcessingPage />} />
                  <Route path="/kiosk/timeline" element={<KioskTimelinePage />} />
                  <Route path="/kiosk/review" element={<KioskReviewPage />} />
                  <Route path="/kiosk/complete" element={<KioskCompletePage />} />

                  {/* Physician Console Routes */}
                  <Route path="/doctor/login" element={<DoctorLoginPage />} />
                  <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
                  <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
                  <Route path="/doctor/queue" element={<DoctorQueuePage />} />
                  <Route path="/doctor/patient/:id" element={<DoctorPatientDetailPage />} />
                  <Route path="/doctor/documents" element={<DoctorDocumentsPage />} />
                  <Route path="/doctor/alerts" element={<DoctorAlertsPage />} />
                  <Route path="/doctor/analytics" element={<DoctorAnalyticsPage />} />
                  <Route path="/doctor/settings" element={<DoctorSettingsPage />} />

                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </PhysicianProvider>
            </PatientSessionProvider>
          </AccessibilityProvider>
        </LanguageProvider>
      </DemoModeProvider>
    </BrowserRouter>
  );
}
