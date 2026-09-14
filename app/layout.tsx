// SETU: Root Layout

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SETU – Integrated GIS-Based Digital Public Infrastructure for Land Governance',
  description:
    'A unified public digital infrastructure for land governance with automated cadastral GIS parcel verification, multi-factor risk scoring, and physical-to-digital title alignment.',
  keywords: [
    'SETU',
    'Land Governance',
    'GIS Parcel',
    'Cadastral Map',
    'Land Verification',
    'Digital Public Infrastructure',
    'Smart India Hackathon',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="relative bg-[#0b0f19] text-gray-200 min-h-screen">
        {/* Glowing Background Ambient Orbs */}
        <div className="orb bg-cyan-600 w-96 h-96 top-10 left-10"></div>
        <div
          className="orb bg-blue-700 w-[30rem] h-[30rem] bottom-10 right-10"
          style={{ animationDelay: '-4s' }}
        ></div>
        <div
          className="orb bg-emerald-600 w-80 h-80 top-1/2 left-1/3"
          style={{ animationDelay: '-7s' }}
        ></div>

        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
