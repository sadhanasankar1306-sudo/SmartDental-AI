/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, PageId } from './components/Navbar.js';
import { HomePage } from './pages/HomePage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { PhotoAnalyzerPage } from './pages/PhotoAnalyzerPage.js';
import { XRayAnalyzerPage } from './pages/XRayAnalyzerPage.js';
import { ReportPage } from './pages/ReportPage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { ResearchPage } from './pages/ResearchPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { ScreeningResult } from './types/dental.js';
import { ShieldCheck, HeartPulse } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [activeScreening, setActiveScreening] = useState<ScreeningResult | null>(null);
  const [screeningsCount, setScreeningsCount] = useState<number>(0);

  // Load initial screenings to have an active screening ready for the report tab
  useEffect(() => {
    fetch('/api/screenings')
      .then(res => res.json())
      .then(data => {
        if (data.screenings && data.screenings.length > 0) {
          setScreeningsCount(data.screenings.length);
          setActiveScreening(data.screenings[0]);
        }
      })
      .catch(err => console.warn('Could not fetch initial screenings:', err));
  }, []);

  const handleScreeningCompleted = (result: ScreeningResult) => {
    setActiveScreening(result);
    setScreeningsCount(prev => prev + 1);
  };

  const handleSelectScreening = (result: ScreeningResult) => {
    setActiveScreening(result);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-teal-100 selection:text-teal-900">
      {/* Top Clinical Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        screeningsCount={screeningsCount}
      />

      {/* Main Page Content */}
      <main className="flex-1 pb-16">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={setCurrentPage}
            onSelectSampleImage={(url, modality, subType) => {
              setCurrentPage(modality === 'photograph' ? 'photo' : 'xray');
            }}
          />
        )}

        {currentPage === 'dashboard' && (
          <DashboardPage
            onNavigate={setCurrentPage}
            onSelectScreening={handleSelectScreening}
          />
        )}

        {currentPage === 'photo' && (
          <PhotoAnalyzerPage
            onNavigate={setCurrentPage}
            onScreeningCompleted={handleScreeningCompleted}
          />
        )}

        {currentPage === 'xray' && (
          <XRayAnalyzerPage
            onNavigate={setCurrentPage}
            onScreeningCompleted={handleScreeningCompleted}
          />
        )}

        {currentPage === 'report' && (
          <ReportPage
            screening={activeScreening}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'history' && (
          <HistoryPage
            onNavigate={setCurrentPage}
            onSelectScreening={handleSelectScreening}
          />
        )}

        {currentPage === 'research' && (
          <ResearchPage />
        )}

        {currentPage === 'settings' && (
          <SettingsPage />
        )}
      </main>

      {/* Clinical Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <HeartPulse className="w-4 h-4 text-teal-700" />
              <span>SmartDental AI Research Screening Platform</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <button onClick={() => setCurrentPage('home')} className="hover:text-slate-900">Overview</button>
              <button onClick={() => setCurrentPage('research')} className="hover:text-slate-900">Research & Metrics</button>
              <button onClick={() => setCurrentPage('settings')} className="hover:text-slate-900">Privacy & Terms</button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <div>
              © 2026 SmartDental AI. Developed for dental research, quality-aware computer vision, and pre-diagnostic screening.
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Non-diagnostic investigative software. Consultation with a licensed dentist required.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
