// SETU: Navbar Component

'use client';

import React from 'react';
import { Language, i18n } from './i18n';

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigate: (view: 'home' | 'search' | 'wizard' | 'results' | 'history') => void;
  isBackendConnected: boolean;
  onOpenHistory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  onNavigate,
  isBackendConnected,
  onOpenHistory,
}) => {
  const t = i18n[currentLang];

  return (
    <nav className="glass-panel sticky top-0 z-50 px-4 md:px-8 py-3.5 flex justify-between items-center border-b border-white/5 bg-[#0b0f19]/80 backdrop-blur-xl">
      {/* Brand & Emblem */}
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => onNavigate('home')}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform duration-200">
          S
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black tracking-wider text-white">SETU</h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 uppercase tracking-widest hidden sm:inline-block">
              GIS-DPI
            </span>
          </div>
          <p className="text-[10px] text-gray-400 hidden sm:block tracking-wide">
            {t.brandSubtitle}
          </p>
        </div>
      </div>

      {/* Center Nav Links */}
      <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300">
        <button
          onClick={() => onNavigate('home')}
          className="hover:text-cyan-400 transition"
        >
          Overview
        </button>
        <button
          onClick={() => onNavigate('wizard')}
          className="hover:text-cyan-400 transition flex items-center gap-1.5 font-semibold text-white"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          {t.ctaVerify}
        </button>
        <button
          onClick={onOpenHistory}
          className="hover:text-cyan-400 transition text-gray-300"
        >
          {t.viewHistory}
        </button>
      </div>

      {/* Right Tools: Connection Indicator, Demo Badge, Language Switcher */}
      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <div className="flex bg-black/50 border border-white/10 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-2.5 py-1 rounded-md transition font-semibold ${
              currentLang === 'en'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => onLanguageChange('hi')}
            className={`px-2.5 py-1 rounded-md transition font-semibold ${
              currentLang === 'hi'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            हिन्दी
          </button>
        </div>

        {/* API Connection Indicator */}
        <div
          className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${
            isBackendConnected
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
              : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="text-[11px] font-medium">
            {isBackendConnected ? 'PostGIS & API Live' : 'Digital Registry Ready'}
          </span>
        </div>

        {/* Demo Dataset Badge */}
        <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] text-amber-400 font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span className="hidden md:inline">{t.demoBadge}</span>
          <span className="md:hidden">Demo</span>
        </div>
      </div>
    </nav>
  );
};
