// SETU: ResultsDashboard Component (Verification Score, Mismatch Audit & Leaflet GIS)

'use client';

import React from 'react';
import { Property, VerificationResult, ExtractedDocumentFields } from '@/lib/types';
import { Language, i18n } from './i18n';
import { GISParcelMap } from './GISParcelMap';

interface ResultsDashboardProps {
  currentLang: Language;
  property: Property;
  extractedDoc: ExtractedDocumentFields;
  verification: VerificationResult;
  onBackToSearch: () => void;
  onOpenCertificate: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  currentLang,
  property,
  extractedDoc,
  verification,
  onBackToSearch,
  onOpenCertificate,
}) => {
  const t = i18n[currentLang];
  const { total_score, risk_level, mismatches, factors, recommendation } = verification;

  // Visual styling based on risk level
  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let scoreColor = 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]';
  let alertHeaderBg = 'from-emerald-950/40 via-[#0b0f19] to-[#0b0f19]';
  let riskTitle = 'Title Clear & Verified';

  if (risk_level === 'MEDIUM') {
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    scoreColor = 'text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]';
    alertHeaderBg = 'from-amber-950/40 via-[#0b0f19] to-[#0b0f19]';
    riskTitle = 'Moderate Title Discrepancies';
  } else if (risk_level === 'HIGH') {
    badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    scoreColor = 'text-rose-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]';
    alertHeaderBg = 'from-rose-950/40 via-[#0b0f19] to-[#0b0f19]';
    riskTitle = 'Critical Title Alerts Detected';
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'match':
      case 'clear':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ✓ Match
          </span>
        );
      case 'partial':
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            ⚠ Partial
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
            ✕ Discrepancy
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-6 space-y-8">
      {/* Top Action & Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBackToSearch}
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>{t.backSearch}</span>
        </button>

        <button
          onClick={onOpenCertificate}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition flex items-center gap-2 shadow"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>{t.printCertificate}</span>
        </button>
      </div>

      {/* Status Alert Header Bar */}
      <div className={`glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden bg-gradient-to-r ${alertHeaderBg} flex flex-col md:flex-row justify-between items-center gap-6`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              SETU Land Verification Protocol
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-[10px] font-mono text-cyan-300">{property.property_id}</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white">{riskTitle}</h3>
          <p className="text-xs text-gray-300 mt-1 max-w-xl leading-relaxed">
            {property.owner_name} • Khasra {property.khasra_number} • {property.village}, {property.tehsil}, {property.district}
          </p>
        </div>

        {/* Risk Score Dial Card */}
        <div className="bg-black/50 border border-white/10 px-8 py-4 rounded-2xl text-center min-w-[170px] shadow-xl">
          <div className={`text-5xl font-black tracking-tight ${scoreColor}`}>
            {total_score}
          </div>
          <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
            {t.riskScore}
          </div>
          <div className={`mt-2 inline-block text-[11px] font-black px-3 py-0.5 rounded-full border ${badgeColor}`}>
            {risk_level} RISK
          </div>
        </div>
      </div>

      {/* Dynamic Recommendation Box */}
      <div className="glass-panel p-6 rounded-2xl border-l-4 border-cyan-500 text-xs">
        <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
          <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Verification Recommendation
        </h4>
        <p className="text-gray-300 leading-relaxed">{recommendation}</p>
        <p className="text-[10px] text-gray-500 mt-2 italic">{t.disclaimer}</p>
      </div>

      {/* Main Grid: Comparison Table & GIS Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Side-by-Side Comparison Table (Spans 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl">
            <h4 className="font-bold text-base text-white border-b border-white/10 pb-3 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.recordComparison}
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-2">{t.field}</th>
                    <th className="pb-2">{t.govtRecord}</th>
                    <th className="pb-2">{t.saleDeed}</th>
                    <th className="pb-2 text-center">{t.matchStatus}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-2.5 font-medium text-gray-400">Owner Name</td>
                    <td className="py-2.5 font-bold text-white">{property.owner_name}</td>
                    <td className="py-2.5 text-gray-300">{extractedDoc.owner_name || 'Unextracted'}</td>
                    <td className="py-2.5 text-center">{getStatusBadge(factors.ownership.status)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-gray-400">Father&apos;s Name</td>
                    <td className="py-2.5 font-bold text-white">{property.father_name || 'N/A'}</td>
                    <td className="py-2.5 text-gray-300">{extractedDoc.father_name || 'N/A'}</td>
                    <td className="py-2.5 text-center">
                      {getStatusBadge(
                        property.father_name && extractedDoc.father_name && property.father_name.toLowerCase() === extractedDoc.father_name.toLowerCase()
                          ? 'match'
                          : 'partial'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-gray-400">Khasra / Survey</td>
                    <td className="py-2.5 font-bold text-white">{property.khasra_number}</td>
                    <td className="py-2.5 text-gray-300">{extractedDoc.khasra_number || 'N/A'}</td>
                    <td className="py-2.5 text-center">{getStatusBadge(factors.khasra.status)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-gray-400">Parcel Area</td>
                    <td className="py-2.5 font-bold text-white">{property.area_value} {property.area_unit}</td>
                    <td className="py-2.5 text-gray-300">{extractedDoc.area_value ? `${extractedDoc.area_value} ${extractedDoc.area_unit || 'Acres'}` : 'N/A'}</td>
                    <td className="py-2.5 text-center">{getStatusBadge(factors.area.status)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-gray-400">Registration Deed</td>
                    <td className="py-2.5 font-bold text-white">{property.registration_number || 'N/A'}</td>
                    <td className="py-2.5 text-gray-300">{extractedDoc.registration_number || 'N/A'}</td>
                    <td className="py-2.5 text-center">{getStatusBadge(factors.registration.status)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-gray-400">Financial Encumbrance</td>
                    <td className="py-2.5 font-bold text-white">
                      {property.encumbrance_status}
                      {property.mortgage_details?.amount ? ` (₹${property.mortgage_details.amount})` : ''}
                    </td>
                    <td className="py-2.5 text-gray-300">Revenue Register Check</td>
                    <td className="py-2.5 text-center">{getStatusBadge(factors.encumbrance.status)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-gray-400">Litigation Registry</td>
                    <td className="py-2.5 font-bold text-white">{property.court_case_status}</td>
                    <td className="py-2.5 text-gray-300">
                      {property.court_case_details?.caseId ? `${property.court_case_details.caseId} (${property.court_case_details.court})` : 'Clear'}
                    </td>
                    <td className="py-2.5 text-center">{getStatusBadge(factors.court.status)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-gray-400">GIS Parcel Boundary</td>
                    <td className="py-2.5 font-bold text-white">PostGIS Cadastral Layer</td>
                    <td className="py-2.5 text-gray-300">Geodesic Polygon Area</td>
                    <td className="py-2.5 text-center">{getStatusBadge(factors.gis.status)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Mismatches List if Any */}
          {mismatches.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-rose-500/20 bg-rose-950/10">
              <h4 className="font-bold text-rose-300 text-sm mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                Identified Risk Factors ({mismatches.length} Alerts)
              </h4>
              <div className="space-y-2.5">
                {mismatches.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-white">{m.field}</strong>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          m.severity === 'high'
                            ? 'bg-rose-500/20 text-rose-400'
                            : m.severity === 'medium'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-cyan-500/20 text-cyan-400'
                        }`}
                      >
                        {m.severity} Risk
                      </span>
                    </div>
                    <p className="text-gray-300">{m.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Leaflet Map & 7-Factor Score Breakdown */}
        <div className="space-y-6">
          {/* Leaflet Map Card */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-xl">
            <h4 className="font-bold text-sm text-white border-b border-white/10 pb-2 mb-3 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Cadastral Geospatial Plot
            </h4>
            <GISParcelMap property={property} riskLevel={risk_level} heightClass="h-64" />
          </div>

          {/* 7-Factor Breakdown Cards */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 text-xs">
            <h4 className="font-bold text-sm text-white border-b border-white/10 pb-2 mb-3">
              7-Factor Score Distribution
            </h4>
            <div className="space-y-2.5">
              {Object.entries(factors).map(([key, f]) => (
                <div key={key} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                  <span className="text-gray-400">{f.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{f.score} / {f.maxScore}</span>
                    <span className="text-[10px]">{getStatusBadge(f.status)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
