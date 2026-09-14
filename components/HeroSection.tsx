// SETU: HeroSection Component

'use client';

import React from 'react';
import { Language, i18n } from './i18n';

interface HeroSectionProps {
  currentLang: Language;
  onStartVerification: () => void;
  onScrollToSearch: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentLang,
  onStartVerification,
  onScrollToSearch,
}) => {
  const t = i18n[currentLang];

  return (
    <div className="w-full flex flex-col items-center pt-8 pb-12 text-center">
      {/* DPI Badge */}
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-emerald-500/10 border border-cyan-500/20 px-4 py-1.5 rounded-full text-xs text-cyan-300 font-semibold mb-6 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>Integrated GIS-Based Digital Public Infrastructure for Land Governance</span>
      </div>

      {/* Main Headline */}
      <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl leading-tight">
        BRIDGING THE GAP IN <br className="hidden sm:inline" />
        <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(6,182,212,0.4)]">
          LAND RECORDS & GIS PARCELS
        </span>
      </h2>

      {/* Subtitle */}
      <p className="mt-5 text-base sm:text-lg text-gray-300 max-w-2xl font-light leading-relaxed">
        {t.heroDesc}
      </p>

      {/* Primary Action Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={onStartVerification}
          className="glow-button px-8 py-3.5 rounded-xl font-bold text-white shadow-lg hover:shadow-cyan-500/40 transition-all flex items-center gap-2 text-sm tracking-wide bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t.ctaVerify}
        </button>

        <button
          onClick={onScrollToSearch}
          className="px-8 py-3.5 rounded-xl font-semibold text-gray-200 glass-panel border border-white/10 hover:border-cyan-500/40 hover:text-white transition-all text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {t.searchTitle}
        </button>
      </div>

      {/* Live System Metrics Strip */}
      <div className="mt-14 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 p-4 glass-panel rounded-2xl border border-white/5 text-left">
        <div className="p-3 border-r border-white/5 last:border-0">
          <div className="text-2xl md:text-3xl font-black text-white">100%</div>
          <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">PostGIS Parcels</div>
        </div>
        <div className="p-3 border-r border-white/5 last:border-0">
          <div className="text-2xl md:text-3xl font-black text-cyan-400">7-Factor</div>
          <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Risk Analysis</div>
        </div>
        <div className="p-3 border-r border-white/5 last:border-0">
          <div className="text-2xl md:text-3xl font-black text-emerald-400">&lt; 850ms</div>
          <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Verification Speed</div>
        </div>
        <div className="p-3">
          <div className="text-2xl md:text-3xl font-black text-indigo-400">Bilingual</div>
          <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Hindi & English OCR</div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mt-16 w-full max-w-5xl text-left">
        <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-3 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          {t.featuresTitle}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: GIS */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h4 className="font-bold text-white text-base mb-1">{t.featGisTitle}</h4>
            <p className="text-xs text-gray-400 leading-relaxed">{t.featGisDesc}</p>
          </div>

          {/* Card 2: Ownership */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h4 className="font-bold text-white text-base mb-1">{t.featOwnershipTitle}</h4>
            <p className="text-xs text-gray-400 leading-relaxed">{t.featOwnershipDesc}</p>
          </div>

          {/* Card 3: Encumbrance */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-bold text-white text-base mb-1">{t.featEncumbranceTitle}</h4>
            <p className="text-xs text-gray-400 leading-relaxed">{t.featEncumbranceDesc}</p>
          </div>

          {/* Card 4: Court Disputes */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h4 className="font-bold text-white text-base mb-1">{t.featDisputeTitle}</h4>
            <p className="text-xs text-gray-400 leading-relaxed">{t.featDisputeDesc}</p>
          </div>

          {/* Card 5: Risk Scoring */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="font-bold text-white text-base mb-1">{t.featRiskTitle}</h4>
            <p className="text-xs text-gray-400 leading-relaxed">{t.featRiskDesc}</p>
          </div>

          {/* Card 6: QR Certificate */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h4 className="font-bold text-white text-base mb-1">{t.featAuditTitle}</h4>
            <p className="text-xs text-gray-400 leading-relaxed">{t.featAuditDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
