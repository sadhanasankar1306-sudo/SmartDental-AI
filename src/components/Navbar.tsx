/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Activity, 
  Camera, 
  FileText, 
  History, 
  BarChart3, 
  Settings as SettingsIcon, 
  Layers, 
  ShieldCheck,
  Home
} from 'lucide-react';

export type PageId = 'home' | 'dashboard' | 'photo' | 'xray' | 'report' | 'history' | 'research' | 'settings';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  screeningsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, screeningsCount = 0 }) => {
  const navItems: { id: PageId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Overview', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'photo', label: 'Photo Screening', icon: Camera },
    { id: 'xray', label: 'X-Ray Pipeline', icon: Layers },
    { id: 'report', label: 'Clinical Report', icon: FileText },
    { id: 'history', label: 'Records History', icon: History },
    { id: 'research', label: 'Model Evaluation', icon: BarChart3 },
    { id: 'settings', label: 'System Settings', icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-xs group-hover:bg-teal-800 transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C8.5 2 6 4 6 7.5C6 9.8 7 11.5 8 13C9 14.5 10 16.5 10 20C10 21.1 10.9 22 12 22C13.1 22 14 21.1 14 20C14 16.5 15 14.5 16 13C17 11.5 18 9.8 18 7.5C18 4 15.5 2 12 2M12 4C14.5 4 16 5.5 16 7.5C16 9.2 15.2 10.6 14.3 12C13.3 13.5 12 15.6 12 19C12 15.6 10.7 13.5 9.7 12C8.8 10.6 8 9.2 8 7.5C8 5.5 9.5 4 12 4Z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 tracking-tight text-base">SmartDental AI</span>
                <span className="text-xs font-mono text-teal-700 font-medium">v1.2-cv</span>
              </div>
              <div className="text-xs text-slate-500">Quality-Aware Dental Screening</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Modality Pipeline Active</span>
            </div>

            <button
              onClick={() => onNavigate('photo')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>New Screening</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="lg:hidden flex overflow-x-auto border-t border-slate-200 px-2 py-1.5 gap-1 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs whitespace-nowrap rounded-md font-medium shrink-0 ${
                isActive
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
