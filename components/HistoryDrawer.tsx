// SETU: HistoryDrawer Component (Historical Verifications Ledger)

'use client';

import React, { useEffect, useState } from 'react';
import { VerificationHistoryItem } from '@/lib/types';
import { Language, i18n } from './i18n';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onSelectPropertyId: (propertyId: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  currentLang,
  onSelectPropertyId,
}) => {
  const t = i18n[currentLang];
  const [historyItems, setHistoryItems] = useState<VerificationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function fetchHistory() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/verification/history');
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.history)) {
          setHistoryItems(data.history);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md h-full bg-[#0b0f19] border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
        <div>
          <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.viewHistory}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 text-sm font-bold"
            >
              ✕
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-xs text-gray-400 flex flex-col items-center gap-2">
              <span className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></span>
              <span>Retrieving audit ledger...</span>
            </div>
          ) : historyItems.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400">
              No historical verifications recorded yet. Run a verification to populate the audit trail.
            </div>
          ) : (
            <div className="space-y-3">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectPropertyId(item.property_id);
                    onClose();
                  }}
                  className="p-4 rounded-xl glass-panel border border-white/5 hover:border-cyan-500/40 hover:bg-white/[0.03] transition cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {item.property_id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.risk_level === 'LOW'
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                          : item.risk_level === 'MEDIUM'
                          ? 'bg-amber-950/40 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-950/40 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {item.risk_level} RISK ({item.score}%)
                    </span>
                  </div>

                  <h5 className="font-semibold text-white text-sm">{item.owner_name}</h5>
                  <div className="flex justify-between items-center text-[11px] text-gray-400 mt-2 pt-2 border-t border-white/5">
                    <span>{item.run_date}</span>
                    <span className="text-cyan-400 font-medium">Inspect Record →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-white/10 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
};
