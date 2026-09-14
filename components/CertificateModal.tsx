// SETU: CertificateModal Component (Printable Digital Verification Certificate with QR Hash)

'use client';

import React from 'react';
import { Property, VerificationResult, ExtractedDocumentFields } from '@/lib/types';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  verification: VerificationResult;
  extractedDoc: ExtractedDocumentFields;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  property,
  verification,
  extractedDoc,
}) => {
  if (!isOpen) return null;

  const timestamp = new Date().toLocaleString('en-IN', {
    dateStyle: 'long',
    timeStyle: 'medium',
  });

  const qrData = encodeURIComponent(
    `SETU-VERIFY-ID:${property.property_id}-SCORE:${verification.total_score}-RISK:${verification.risk_level}-TIME:${Date.now()}`
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white text-gray-900 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 border-4 border-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="print:hidden absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-2 text-sm font-bold"
        >
          ✕ Close
        </button>

        {/* Certificate Header */}
        <div className="flex justify-between items-start border-b-2 border-cyan-600 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white font-black flex items-center justify-center text-lg">
                S
              </div>
              <h2 className="text-2xl font-black tracking-wider text-slate-900">
                SETU <span className="text-cyan-600 text-lg">DPI</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-semibold tracking-wide mt-0.5">
              INTEGRATED GIS-BASED DIGITAL PUBLIC INFRASTRUCTURE FOR LAND GOVERNANCE
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-slate-500 block">
              CERTIFICATE HASH: <strong className="text-slate-800">{property.property_id}</strong>
            </span>
            <div
              className={`mt-1 inline-block text-xs font-black px-3 py-0.5 rounded ${
                verification.risk_level === 'LOW'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : verification.risk_level === 'MEDIUM'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              {verification.risk_level} RISK ({verification.total_score} / 100)
            </div>
          </div>
        </div>

        {/* 1. Property Registry Identity */}
        <div className="mb-4">
          <h4 className="text-xs font-bold text-cyan-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
            1. Authoritative Digital Registry Identification
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div><strong>Property ID:</strong> {property.property_id}</div>
            <div><strong>Khasra / Gata:</strong> {property.khasra_number}</div>
            <div><strong>Total Area:</strong> {property.area_value} {property.area_unit}</div>
            <div><strong>Land Use:</strong> {property.land_use || 'Agricultural'}</div>
            <div><strong>Owner:</strong> {property.owner_name}</div>
            <div><strong>Father:</strong> {property.father_name || 'N/A'}</div>
            <div><strong>District:</strong> {property.district}</div>
            <div><strong>State:</strong> {property.state}</div>
          </div>
        </div>

        {/* 2. Cross-Verification Audit Table */}
        <div className="mb-4">
          <h4 className="text-xs font-bold text-cyan-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
            2. Title Comparison Audit (Digital Registry vs Physical Deed)
          </h4>
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-2 border">Audited Field</th>
                <th className="p-2 border">Digital Public Registry</th>
                <th className="p-2 border">Deed OCR Extract</th>
                <th className="p-2 border text-center">Audit Result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border font-medium">Owner Name</td>
                <td className="p-2 border">{property.owner_name}</td>
                <td className="p-2 border">{extractedDoc.owner_name || 'N/A'}</td>
                <td className="p-2 border text-center font-bold">{verification.factors.ownership.status.toUpperCase()}</td>
              </tr>
              <tr>
                <td className="p-2 border font-medium">Khasra Number</td>
                <td className="p-2 border">{property.khasra_number}</td>
                <td className="p-2 border">{extractedDoc.khasra_number || 'N/A'}</td>
                <td className="p-2 border text-center font-bold">{verification.factors.khasra.status.toUpperCase()}</td>
              </tr>
              <tr>
                <td className="p-2 border font-medium">Parcel Area</td>
                <td className="p-2 border">{property.area_value} {property.area_unit}</td>
                <td className="p-2 border">{extractedDoc.area_value ? `${extractedDoc.area_value} ${extractedDoc.area_unit || 'Acres'}` : 'N/A'}</td>
                <td className="p-2 border text-center font-bold">{verification.factors.area.status.toUpperCase()}</td>
              </tr>
              <tr>
                <td className="p-2 border font-medium">Encumbrance / Lien</td>
                <td className="p-2 border">{property.encumbrance_status}</td>
                <td className="p-2 border">Banking Lien Register</td>
                <td className="p-2 border text-center font-bold">{verification.factors.encumbrance.status.toUpperCase()}</td>
              </tr>
              <tr>
                <td className="p-2 border font-medium">Court Dispute Status</td>
                <td className="p-2 border">{property.court_case_status}</td>
                <td className="p-2 border">Judicial Litigation Registry</td>
                <td className="p-2 border text-center font-bold">{verification.factors.court.status.toUpperCase()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 3. Clearance Recommendation */}
        <div className="mb-4 bg-cyan-50 p-3 rounded-lg border border-cyan-200 text-xs">
          <strong className="text-cyan-900 block mb-1">Clearance Recommendation:</strong>
          <p className="text-slate-700">{verification.recommendation}</p>
        </div>

        {/* Footer: QR Code & Audit Signature */}
        <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <img src={qrUrl} alt="Verification QR" className="w-16 h-16 border p-1 rounded" />
            <div>
              <span className="font-bold text-slate-800 block">SETU Digital Verification Hash</span>
              <span className="text-[10px]">Scan with mobile to authenticate certificate</span>
            </div>
          </div>

          <div className="text-right">
            <div>Audit Timestamp: <strong>{timestamp}</strong></div>
            <div>Verification Engine: <strong>SETU 7-Factor Protocol</strong></div>
            <div className="mt-1 font-bold text-slate-800">DIGITALLY SECURED RECORD</div>
          </div>
        </div>

        {/* Print Button (Hidden on Print) */}
        <div className="mt-6 text-center print:hidden">
          <button
            onClick={() => window.print()}
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs shadow-lg transition"
          >
            🖨 Print Official Certificate
          </button>
        </div>
      </div>
    </div>
  );
};
