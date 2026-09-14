// SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
// Main Application Controller & View Orchestrator

'use client';

import React, { useState, useEffect } from 'react';
import { Property, VerificationResult, ExtractedDocumentFields, LandDocument } from '@/lib/types';
import { Language } from '@/components/i18n';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { PropertySearch } from '@/components/PropertySearch';
import { VerificationWizard } from '@/components/VerificationWizard';
import { LoadingScanner } from '@/components/LoadingScanner';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { CertificateModal } from '@/components/CertificateModal';
import { HistoryDrawer } from '@/components/HistoryDrawer';

export default function HomePage() {
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [view, setView] = useState<'home' | 'wizard' | 'loading' | 'results'>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [extractedDoc, setExtractedDoc] = useState<ExtractedDocumentFields | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);

  // Check API connectivity on mount
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/properties?khasra=123/5');
        setIsBackendConnected(res.ok);
      } catch {
        setIsBackendConnected(false);
      }
    }
    checkHealth();
  }, []);

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
    setView('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartAnalysis = async (file: File | null, docRecord?: LandDocument) => {
    if (!selectedProperty) return;

    setView('loading');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      let extracted: ExtractedDocumentFields = {
        owner_name: selectedProperty.owner_name,
        khasra_number: selectedProperty.khasra_number,
        area_value: selectedProperty.area_value,
        area_unit: selectedProperty.area_unit,
        registration_number: selectedProperty.registration_number,
      };

      // Trigger OCR API if document was recorded
      if (docRecord?.id) {
        const ocrRes = await fetch(`/api/documents/${docRecord.id}/ocr`, {
          method: 'POST',
        });
        const ocrData = await ocrRes.json();
        if (ocrData.success && ocrData.extractedFields) {
          extracted = ocrData.extractedFields;
        }
      }

      setExtractedDoc(extracted);

      // Trigger 7-Factor Verification Engine API
      const verifyRes = await fetch('/api/verification/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: selectedProperty.property_id,
          documentId: docRecord?.id,
          extractedFields: extracted,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success && verifyData.verification) {
        setVerificationResult(verifyData.verification);
      }
    } catch (err) {
      console.error('Analysis execution error:', err);
    }
  };

  const handleScannerComplete = () => {
    setView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFromHistory = async (propertyId: string) => {
    try {
      const res = await fetch(`/api/properties/${propertyId}`);
      const data = await res.json();
      if (data.success && data.property) {
        setSelectedProperty(data.property);
        // Default verified payload for historical preview
        const dummyExtracted: ExtractedDocumentFields = {
          owner_name: data.property.owner_name,
          khasra_number: data.property.khasra_number,
          area_value: data.property.area_value,
          area_unit: data.property.area_unit,
          registration_number: data.property.registration_number,
        };
        setExtractedDoc(dummyExtracted);

        const verifyRes = await fetch('/api/verification/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId: data.property.property_id,
            extractedFields: dummyExtracted,
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success && verifyData.verification) {
          setVerificationResult(verifyData.verification);
          setView('results');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (err) {
      console.error('Failed to load historical property:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Navbar */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onNavigate={(targetView) => {
          if (targetView === 'home') setView('home');
          else if (targetView === 'wizard') {
            if (selectedProperty) setView('wizard');
            else setView('home');
          } else if (targetView === 'results') {
            if (verificationResult) setView('results');
          }
        }}
        isBackendConnected={isBackendConnected}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Viewport */}
      <main className="container mx-auto px-4 py-6 flex-1">
        {view === 'home' && (
          <div className="w-full">
            <HeroSection
              currentLang={currentLang}
              onStartVerification={() => {
                const el = document.getElementById('property-search-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onScrollToSearch={() => {
                const el = document.getElementById('property-search-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <PropertySearch
              currentLang={currentLang}
              onSelectProperty={handleSelectProperty}
            />
          </div>
        )}

        {view === 'wizard' && selectedProperty && (
          <VerificationWizard
            currentLang={currentLang}
            selectedProperty={selectedProperty}
            onBackToSearch={() => setView('home')}
            onStartAnalysis={handleStartAnalysis}
          />
        )}

        {view === 'loading' && (
          <LoadingScanner
            currentLang={currentLang}
            onComplete={handleScannerComplete}
          />
        )}

        {view === 'results' && selectedProperty && extractedDoc && verificationResult && (
          <ResultsDashboard
            currentLang={currentLang}
            property={selectedProperty}
            extractedDoc={extractedDoc}
            verification={verificationResult}
            onBackToSearch={() => setView('home')}
            onOpenCertificate={() => setIsCertificateOpen(true)}
          />
        )}
      </main>

      {/* Official Certificate Modal */}
      {isCertificateOpen && selectedProperty && verificationResult && extractedDoc && (
        <CertificateModal
          isOpen={isCertificateOpen}
          onClose={() => setIsCertificateOpen(false)}
          property={selectedProperty}
          verification={verificationResult}
          extractedDoc={extractedDoc}
        />
      )}

      {/* Verification History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        currentLang={currentLang}
        onSelectPropertyId={handleSelectFromHistory}
      />

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-gray-500 glass-panel mt-16">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-400">SETU DPI</span>
            <span>•</span>
            <span>Smart India Hackathon (SIH)</span>
          </div>
          <div>
            Built with Next.js, Supabase PostGIS, Google Cloud Vision OCR, and Leaflet
          </div>
          <div className="text-[11px] text-gray-600">
            Automated screening indicator. External government registry gateway pending authorization.
          </div>
        </div>
      </footer>
    </div>
  );
}
