// SETU: PropertySearch Component with Multi-State Jurisdiction Cascades
// Supports: Uttar Pradesh, Punjab, Haryana, Maharashtra, Karnataka, and Delhi

'use client';

import React, { useState } from 'react';
import { Language, i18n } from './i18n';
import { Property } from '@/lib/types';

interface PropertySearchProps {
  currentLang: Language;
  onSelectProperty: (property: Property) => void;
}

export const STATES_LIST = [
  'Uttar Pradesh',
  'Punjab',
  'Haryana',
  'Maharashtra',
  'Karnataka',
  'Delhi',
];

export const DISTRICTS_MAP: Record<string, string[]> = {
  'Uttar Pradesh': ['Lucknow', 'Gautam Buddha Nagar', 'Kanpur Nagar', 'Varanasi', 'Agra'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Hisar'],
  'Maharashtra': ['Pune', 'Nagpur', 'Mumbai City', 'Thane'],
  'Karnataka': ['Bengaluru Urban', 'Mysuru', 'Mangaluru'],
  'Delhi': ['North Delhi', 'South Delhi', 'New Delhi'],
};

export const TEHSILS_MAP: Record<string, string[]> = {
  'Lucknow': ['Malihabad', 'Bakshi Ka Talab', 'Lucknow'],
  'Gautam Buddha Nagar': ['Sadar Noida', 'Dadri', 'Jewar'],
  'Ludhiana': ['Ludhiana East', 'Ludhiana West', 'Khanna'],
  'Amritsar': ['Amritsar-I', 'Amritsar-II', 'Ajnala'],
  'Gurugram': ['Gurugram', 'Sohna', 'Pataudi'],
  'Faridabad': ['Faridabad', 'Ballabgarh', 'Badkhal'],
  'Pune': ['Haveli', 'Pune City', 'Khed'],
  'Nagpur': ['Nagpur Rural', 'Nagpur Urban', 'Hingna'],
  'Mumbai City': ['Mumbai', 'Colaba', 'Fort'],
  'Bengaluru Urban': ['Bengaluru East', 'Bengaluru South', 'Bengaluru North'],
  'Mysuru': ['Mysuru', 'Nanjangud', 'Hunsur'],
  'North Delhi': ['Alipur', 'Narela', 'Model Town'],
  'South Delhi': ['Mehrauli', 'Hauz Khas', 'Saket'],
  'New Delhi': ['Chanakyapuri', 'Delhi Cantonment', 'Vasant Vihar'],
};

export const VILLAGES_MAP: Record<string, string[]> = {
  'Malihabad': ['Malihabad Rural', 'Kasmandi', 'Dilawarnagar'],
  'Sadar Noida': ['Chhapraula', 'Barola', 'Bhangel'],
  'Ludhiana East': ['Gill', 'Mundian Kalan', 'Jamalpur'],
  'Amritsar-I': ['Khatrai Kalan', 'Verka', 'Chheharta'],
  'Gurugram': ['Sukhrali', 'Wazirabad', 'Kanhai'],
  'Faridabad': ['Tilpat', 'Sihi', 'Mewla Maharajpur'],
  'Haveli': ['Wagholi', 'Hadapsar', 'Kharadi'],
  'Nagpur Rural': ['Besur', 'Wadi', 'Khamla'],
  'Mumbai': ['Colaba Ward', 'Marine Lines', 'Fort Ward'],
  'Bengaluru East': ['Varthur', 'Bellandur', 'Whitefield'],
  'Mysuru': ['Hootagalli', 'Hebbal', 'Belagola'],
  'Alipur': ['Bakhtawarpur', 'Singhu', 'Khamphur'],
  'Mehrauli': ['Chattarpur', 'Sultanpur', 'Gadaipur'],
  'Chanakyapuri': ['Aliganj', 'Jor Bagh'],
};

export const DEFAULT_KHASRA_MAP: Record<string, string> = {
  'Malihabad Rural': '123/5',
  'Chhapraula': '45/2',
  'Gill': '124/1',
  'Khatrai Kalan': '88/3',
  'Sukhrali': '55/9',
  'Tilpat': '112/7',
  'Wagholi': '304/1',
  'Besur': '152/4',
  'Colaba Ward': '12/C',
  'Varthur': '142/2',
  'Hootagalli': '89/1',
  'Bakhtawarpur': '77/14',
  'Chattarpur': '201/5',
  'Aliganj': '15/1',
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

  // Cascading drop-down options
  const districts = DISTRICTS_MAP[state] || [];
  const tehsils = district ? (TEHSILS_MAP[district] || ['Main Tehsil']) : [];
  const villages = tehsil ? (VILLAGES_MAP[tehsil] || ['Rural Ward 1']) : [];

  // Cascading update handlers
  const handleStateChange = (newState: string) => {
    setState(newState);
    const newDistList = DISTRICTS_MAP[newState] || [];
    const newDist = newDistList[0] || '';
    setDistrict(newDist);

    const newTehList = TEHSILS_MAP[newDist] || ['Main Tehsil'];
    const newTeh = newTehList[0] || '';
    setTehsil(newTeh);

    const newVilList = VILLAGES_MAP[newTeh] || ['Rural Ward 1'];
    const newVil = newVilList[0] || '';
    setVillage(newVil);

    const newKh = DEFAULT_KHASRA_MAP[newVil] || '';
    setKhasra(newKh);
  };

  const handleDistrictChange = (newDist: string) => {
    setDistrict(newDist);

    const newTehList = TEHSILS_MAP[newDist] || ['Main Tehsil'];
    const newTeh = newTehList[0] || '';
    setTehsil(newTeh);

    const newVilList = VILLAGES_MAP[newTeh] || ['Rural Ward 1'];
    const newVil = newVilList[0] || '';
    setVillage(newVil);

    const newKh = DEFAULT_KHASRA_MAP[newVil] || '';
    setKhasra(newKh);
  };

  const handleTehsilChange = (newTeh: string) => {
    setTehsil(newTeh);

    const newVilList = VILLAGES_MAP[newTeh] || ['Rural Ward 1'];
    const newVil = newVilList[0] || '';
    setVillage(newVil);

    const newKh = DEFAULT_KHASRA_MAP[newVil] || '';
    setKhasra(newKh);
  };

  const handleVillageChange = (newVil: string) => {
    setVillage(newVil);
    const newKh = DEFAULT_KHASRA_MAP[newVil] || '';
    setKhasra(newKh);
  };

  const executeSearch = async (
    targetState = state,
    targetDistrict = district,
    targetTehsil = tehsil,
    targetVillage = village,
    targetKhasra = khasra,
    targetQuery = manualQuery
  ) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      let url = '/api/properties?';
      if (mode === 'dropdown') {
        const params = new URLSearchParams();
        if (targetState) params.set('state', targetState);
        if (targetDistrict) params.set('district', targetDistrict);
        if (targetTehsil) params.set('tehsil', targetTehsil);
        if (targetVillage) params.set('village', targetVillage);
        if (targetKhasra && targetKhasra.trim()) params.set('khasra', targetKhasra.trim());
        url += params.toString();
      } else {
        url += `query=${encodeURIComponent(targetQuery)}`;
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

  const handleQuickStateClick = async (st: string) => {
    handleStateChange(st);
    const firstDist = DISTRICTS_MAP[st]?.[0] || '';
    const firstTeh = TEHSILS_MAP[firstDist]?.[0] || '';
    const firstVil = VILLAGES_MAP[firstTeh]?.[0] || '';
    const defaultKh = DEFAULT_KHASRA_MAP[firstVil] || '';

    // Search all parcels in this state
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/properties?state=${encodeURIComponent(st)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.properties)) {
        setResults(data.properties);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('State filter failed:', err);
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
              Search Land Records by Khasra Number, Survey Code, or Jurisdiction across 6 States
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

        {/* State Quick Switcher Bar */}
        <div className="mb-5 pb-3 border-b border-white/5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">
              Select Jurisdiction State
            </span>
            <span className="text-[10px] text-cyan-400/80">
              Active: {state}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STATES_LIST.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleQuickStateClick(st)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
                  state === st
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold shadow-sm shadow-cyan-500/20'
                    : 'bg-white/[0.03] text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                <span>📍</span>
                <span>{st}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        {mode === 'dropdown' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5 font-medium">{t.formState}</label>
              <select
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full glass-input px-3 py-2.5 rounded-xl text-xs bg-[#0b0f19]/90 border border-white/10 focus:border-cyan-400 text-white font-medium cursor-pointer"
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
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full glass-input px-3 py-2.5 rounded-xl text-xs bg-[#0b0f19]/90 border border-white/10 focus:border-cyan-400 text-white font-medium cursor-pointer"
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
                onChange={(e) => handleTehsilChange(e.target.value)}
                className="w-full glass-input px-3 py-2.5 rounded-xl text-xs bg-[#0b0f19]/90 border border-white/10 focus:border-cyan-400 text-white font-medium cursor-pointer"
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
                onChange={(e) => handleVillageChange(e.target.value)}
                className="w-full glass-input px-3 py-2.5 rounded-xl text-xs bg-[#0b0f19]/90 border border-white/10 focus:border-cyan-400 text-white font-medium cursor-pointer"
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
              Enter Property ID, State, District, Owner Name, or Khasra Number
            </label>
            <input
              type="text"
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              placeholder="e.g. Maharashtra or Pune or PROP-010 or Suresh Deshmukh or 304/1"
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
                className="text-[10px] px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50 transition font-bold"
                title="UP: Amit Sharma - Clear Title (Low Risk)"
              >
                UP: PROP-002 (Low Risk)
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('PROP-001')}
                className="text-[10px] px-2 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 hover:bg-amber-900/50 transition font-bold"
                title="UP: Rajesh Kumar - Active SBI Mortgage"
              >
                UP: PROP-001 (Mortgage)
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('PROP-003')}
                className="text-[10px] px-2 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/50 transition font-bold"
                title="UP: Sunita Devi - Court Dispute (High Risk)"
              >
                UP: PROP-003 (Dispute)
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('PROP-004')}
                className="text-[10px] px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50 transition font-bold"
                title="Punjab: Mohan Singh - Agricultural Clear"
              >
                PB: PROP-004 (Ludhiana)
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('PROP-006')}
                className="text-[10px] px-2 py-1 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/50 transition font-bold"
                title="Haryana: Vikram Malhotra - GIS Area Inconsistency Warning"
              >
                HR: PROP-006 (GIS Alert)
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('PROP-010')}
                className="text-[10px] px-2 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/50 transition font-bold"
                title="Maharashtra: Suresh Deshmukh - Pune Mixed Land"
              >
                MH: PROP-010 (Pune)
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('PROP-013')}
                className="text-[10px] px-2 py-1 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:bg-purple-900/50 transition font-bold"
                title="Karnataka: Anand Murthy - Bengaluru IT Tech Park"
              >
                KA: PROP-013 (Bengaluru)
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('PROP-015')}
                className="text-[10px] px-2 py-1 rounded-lg bg-teal-950/40 border border-teal-500/30 text-teal-300 hover:bg-teal-900/50 transition font-bold"
                title="Delhi: Ramesh Chand - North Delhi Farmhouse"
              >
                DL: PROP-015 (Delhi)
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => executeSearch()}
            disabled={isLoading}
            className="w-full sm:w-auto glow-button px-7 py-2.5 rounded-xl font-bold text-white text-xs tracking-wide bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
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
          <div className="flex items-center justify-between px-2">
            <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold">
              Search Results ({results.length} Land Parcels Found in {state})
            </h4>
            {results.length > 0 && (
              <span className="text-[11px] text-cyan-400 font-medium">
                Click any parcel to load profile & PostGIS geometry
              </span>
            )}
          </div>

          {results.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center border border-white/5">
              <p className="text-gray-400 text-sm">
                No matching land parcels found for the specified criteria in {state}.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Try clicking one of the state buttons above (e.g. Maharashtra, Karnataka, Delhi) or a quick scenario chip.
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
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded">
                          {prop.property_id}
                        </span>
                        <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10 font-semibold">
                          {prop.state}
                        </span>
                      </div>
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
                    <span className="text-gray-400 text-[11px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      {prop.geometry ? 'Cadastral PostGIS Polygon' : 'Centroid Point'}
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
