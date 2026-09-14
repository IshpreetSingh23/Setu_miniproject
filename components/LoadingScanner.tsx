// SETU: LoadingScanner Component (Multi-Step OCR & Verification Protocol Visualizer)

'use client';

import React, { useEffect, useState } from 'react';
import { Language } from './i18n';

interface LoadingScannerProps {
  currentLang: Language;
  onComplete: () => void;
}

const STEPS = [
  {
    en: 'Validating document MIME structure and digital integrity',
    hi: 'दस्तावेज़ प्रारूप और डिजिटल सत्यनिष्ठा की पुष्टि की जा रही है',
  },
  {
    en: 'Running Google Cloud Vision DOCUMENT_TEXT_DETECTION OCR',
    hi: 'क्लाउड विज़न बहुभाषी ओसीआर निष्कर्षण प्रारंभ किया गया',
  },
  {
    en: 'Extracting structured land title attributes (Owner, Khasra, Area)',
    hi: 'शीर्षक अभिलेख (मालिक, खसरा, रकबा) का निष्कर्षण किया जा रहा है',
  },
  {
    en: 'Querying PostGIS cadastral boundary & verifying geodesic parcel area',
    hi: 'पोस्टजीआईएस भू-नक्शा बहुभुज एवं क्षेत्रफल की संगति जांची जा रही है',
  },
  {
    en: 'Auditing banking encumbrance register for active collateral liens',
    hi: 'सक्रिय बैंक बंधक एवं वित्तीय देनदारियों की जांच की जा रही है',
  },
  {
    en: 'Scanning judicial court registry for pending disputes & stay orders',
    hi: 'अदालती मुकदमों एवं स्थगन आदेशों की रजिस्ट्री जांची जा रही है',
  },
  {
    en: 'Synthesizing 7-factor risk index and generating audit hash',
    hi: '7-कारक समग्र जोखिम सूचकांक एवं ऑडिट हैश तैयार किया जा रहा है',
  },
];

export const LoadingScanner: React.FC<LoadingScannerProps> = ({
  currentLang,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const delays = [450, 600, 700, 700, 600, 550, 500];

    let current = 0;
    const interval = () => {
      if (current < STEPS.length - 1) {
        current += 1;
        setCurrentStepIndex(current);
        setTimeout(interval, delays[current]);
      } else {
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    };

    const timer = setTimeout(interval, delays[0]);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="w-full max-w-lg mx-auto my-12 glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Background Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Radar Animation Graphic */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="relative w-24 h-24 rounded-full border border-cyan-500/30 flex items-center justify-center bg-cyan-950/20">
          <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-25"></div>
          <div className="w-16 h-16 rounded-full border border-cyan-500/50 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-cyan-400 animate-spin"
              style={{ animationDuration: '3s' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mt-4 tracking-wide">
          Running Land Governance DPI Protocols
        </h3>
        <p className="text-xs text-cyan-400 font-mono mt-1 animate-pulse">
          {STEPS[currentStepIndex][currentLang]}
        </p>
      </div>

      {/* Step by Step Progress List */}
      <div className="space-y-3">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                isPending ? 'opacity-30' : 'opacity-100'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${
                  isDone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : isCurrent
                    ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse'
                    : 'border border-gray-600 text-gray-500'
                }`}
              >
                {isDone ? '✓' : isCurrent ? '●' : idx + 1}
              </div>
              <span className={`font-medium ${isCurrent ? 'text-cyan-300' : isDone ? 'text-gray-300' : 'text-gray-500'}`}>
                {step[currentLang]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
