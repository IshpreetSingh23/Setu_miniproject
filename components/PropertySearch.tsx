// SETU: PropertySearch Component

'use client';

import React, { useState } from 'react';
import { Language, i18n } from './i18n';
import { Property } from '@/lib/types';

interface PropertySearchProps {
  currentLang: Language;
  onSelectProperty: (property: Property) => void;
}

const STATES_LIST = [
  'Uttar Pradesh',
  'Punjab',
  'Haryana',
  'Maharashtra',
  'Karnataka',
  'Delhi',
];

const DISTRICTS_MAP: Record<string, string[]> = {
  'Uttar Pradesh': ['Lucknow', 'Gautam Buddha Nagar', 'Kanpur Nagar', 'Varanasi', 'Agra'],
  'Punjab': ['Ludhiana', 'Jalandhar', 'Patiala', 'Amritsar', 'Bathinda'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Hisar'],
  'Maharashtra': ['Mumbai City', 'Pune', 'Nagpur', 'Thane'],
  'Karnataka': ['Bengaluru Urban', 'Mysuru', 'Mangaluru'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi'],
};

const TEHSILS_MAP: Record<string, string[]> = {
  'Lucknow': ['Malihabad', 'Bakshi Ka Talab', 'Lucknow'],
  'Gautam Buddha Nagar': ['Sadar Noida', 'Dadri', 'Jewar'],
  'Ludhiana': ['Ludhiana East', 'Ludhiana West', 'Khanna'],
  'Gurugram': ['Gurugram', 'Sohna', 'Pataudi'],
};

const VILLAGES_MAP: Record<string, string[]> = {
  'Malihabad': ['Malihabad Rural', 'Kasmandi', 'Dilawarnagar'],
  'Ludhiana East': ['Gill', 'Mundian Kalan', 'Jamalpur'],
  'Gurugram': ['Sukhrali', 'Wazirabad', 'Kanhai'],
};

export const PropertySearch: React.FC<PropertySearchProps> = ({
  currentLang,
  onSelectProperty,
}) => {
  const t = i18n[currentLang];

  const [mode, setMode] = useState<'dropdown' | 'manual'>('dropdown');
  const [state, setState] = useState('Uttar Pradesh');
  const [district, setDistrict] = useState('Lucknow');
  const [tehsil, setTehsil] = useState('Malihabad');
  const [village, setVillage] = useState('Malihabad Rural');
  const [khasra, setKhasra] = useState('123/5');
  const [manualQuery, setManualQuery] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Property[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const districts = DISTRICTS_MAP[state] || [];
  const tehsils = DISTRICTS_MAP[state]?.length ? (TEHSILS_MAP[district] || ['Main Tehsil']) : [];
  const villages = tehsils.length ? (VILLAGES_MAP[tehsil] || ['Rural Ward 1']) : [];

  const handleSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      let url = '/api/properties?';
      if (mode === 'dropdown') {
        const params = new URLSearchParams();
        if (state) params.set('state', state);
        if (district) params.set('district', district);
        if (tehsil) params.set('tehsil', tehsil);
        if (village) params.set('village', village);
        if (khasra) params.set('khasra', khasra);
        url += params.toString();
      } else {
        url += `query=${encodeURIComponent(manualQuery)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.properties)) {
        setResults(data.properties);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Property search failed:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = async (propertyId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}`);
      const data = await res.json();
      if (data.success && data.property) {
        onSelectProperty(data.property);
      }
    } catch (err) {
      console.error('Quick load failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="property-search-section" className="w-full max-w-4xl mx-auto my-8">
      {/* Search Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glowing aura */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t.searchTitle}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Search Land Records by Khasra Number, Survey Code, or Jurisdiction
            </p>
          </div>

          {/* Search Mode Toggle */}
          <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 text-xs">
            <button
              onClick={() => setMode('dropdown')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                mode === 'dropdown'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.selectDropdown}
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                mode === 'manual'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.enterManually}
            </button>
          </div>
        </div>

        {/* Form Inputs */}
        {mode === 'dropdown' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5 font-medium">{t.formState}</label>
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  const firstDist = DISTRICTS_MAP[e.target.value]?.[0] || '';
                  setDistrict(firstDist);
                }}
                className="w-full glass-input px-3 py-2.5 rounded-xl text-xs bg-[#0b0f19]/90 border border-white/10 focus:border-cyan-400"
              >
                {STATES_LIST.map((s) => (
                  <option key={s} value={s} className="bg-gray-900 text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1.5 font-medium">{t.formDistrict}</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full glass-input px-3 py-2.5 rounded-xl text-xs bg-[#0b0f19]/90 border border-white/10 focus:border-cyan-400"
              >
                {districts.map((d) => (
                  <option key={d} value={d} className="bg-gray-900 text-white">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1.5 font-medium">{t.formTehsil}</label>
              <select
                value={tehsil}
                onChange={(e) => setTehsil(e.target.value)}
                className="w-full glass-input px-3 py-2.5 rounded-xl text-xs bg-[#0b0f19]/90 border border-white/10 focus:border-cyan-400"
              >
                {tehsils.map((teh) => (
                  <option key={teh} value={teh} className="bg-gray-900 text-white">
                    {teh}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1.5 font-medium">{t.formVillage}</label>
              <select
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full glass-input px-3 py-2.5 rounded-xl text-xs bg-[#0b0f19]/90 border border-white/10 focus:border-cyan-400"
              >
                {villages.map((v) => (
                  <option key={v} value={v} className="bg-gray-900 text-white">
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1.5 font-medium">{t.formKhasra}</label>
              <input
                type="text"
                value={khasra}
                onChange={(e) => setKhasra(e.target.value)}
                placeholder="e.g. 123/5"
                className="w-full glass-input px-3 py-2.5 rounded-xl text-xs bg-[#0b0f19]/90 border border-white/10 focus:border-cyan-400 text-white placeholder-gray-500"
              />
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <label className="text-xs text-gray-400 block mb-1.5 font-medium">
              Enter Property ID, Owner Name, or Khasra Number
            </label>
            <input
              type="text"
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              placeholder="e.g. PROP-002 or Amit Sharma or 123/5"
              className="w-full glass-input px-4 py-3 rounded-xl text-sm bg-[#0b0f19]/90 border border-white/10 focus:border-cyan-400 text-white placeholder-gray-500"
            />
          </div>
        )}

        {/* Search CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* Quick Demo Scenarios Chips */}
          <div className="w-full sm:w-auto">
            <span className="text-[11px] text-gray-400 block mb-1.5 font-semibold">
              {t.sampleTitle}
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickSelect('PROP-002')}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50 transition font-bold"
                title="Amit Sharma - Clear Title (Low Risk)"
              >
                ✓ PROP-002 (Low Risk)
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('PROP-001')}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 hover:bg-amber-900/50 transition font-bold"
                title="Rajesh Kumar - Active SBI Mortgage"
              >
                ⚠ PROP-001 (Mortgage)
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('PROP-003')}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/50 transition font-bold"
                title="Sunita Devi - Court Dispute (High Risk)"
              >
                🚨 PROP-003 (Dispute)
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('PROP-006')}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/50 transition font-bold"
                title="Vikram Malhotra - GIS Area Inconsistency Warning"
              >
                🗺 PROP-006 (GIS Alert)
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={isLoading}
            className="w-full sm:w-auto glow-button px-7 py-2.5 rounded-xl font-bold text-white text-xs tracking-wide bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                <span>{t.searching}</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>{t.searchBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search Results Display */}
      {hasSearched && (
        <div className="mt-6 space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold px-2">
            Search Results ({results.length} Land Parcels Found)
          </h4>

          {results.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center border border-white/5">
              <p className="text-gray-400 text-sm">
                No matching land parcels found for the specified criteria.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Try clicking one of the demo quick badges above (e.g. PROP-002).
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {results.map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => onSelectProperty(prop)}
                  className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-cyan-500/40 hover:bg-white/[0.04] transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded">
                        {prop.property_id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          prop.encumbrance_status.toLowerCase() === 'clear'
                            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                            : 'bg-amber-950/40 border-amber-500/30 text-amber-400'
                        }`}
                      >
                        {prop.encumbrance_status}
                      </span>
                    </div>

                    <h5 className="font-bold text-white text-base group-hover:text-cyan-300 transition">
                      {prop.owner_name}
                    </h5>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Khasra {prop.khasra_number} • {prop.area_value} {prop.area_unit} • {prop.land_use}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                      {prop.address || `${prop.village}, ${prop.tehsil}, ${prop.district}, ${prop.state}`}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-gray-400 text-[11px]">
                      {prop.geometry ? 'Cadastral Polygon Available' : 'Centroid Point'}
                    </span>
                    <span className="text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Inspect & Verify →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
