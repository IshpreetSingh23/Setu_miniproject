// SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
// Smart Fallback/Demo OCR Provider for Local Evaluation & Offline SIH Presentations

import { OCRProvider } from './provider';
import { OCRResult } from '../types';

export class FallbackOCRProvider implements OCRProvider {
  name = 'SETU Demonstration OCR Provider (Development Mode)';

  isAvailable(): boolean {
    return true; // Always available as graceful fallback
  }

  async processDocument(fileBuffer: Buffer, mimeType: string): Promise<OCRResult> {
    // Artificial small delay simulating cloud OCR processing
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Inspect buffer for simple text or generate realistic bilingual Indian sale deed text
    const bufferText = fileBuffer.toString('utf-8');
    const hasEmbeddedText = bufferText.includes('DEED') || bufferText.includes('KHASRA') || bufferText.includes('विलेख');

    let simulatedDeedText = '';
    if (hasEmbeddedText) {
      simulatedDeedText = bufferText;
    } else {
      simulatedDeedText = `
GOVERNMENT OF UTTAR PRADESH / उत्तर प्रदेश सरकार
SUB-REGISTRAR OFFICE, MALIHABAD / उप-निबंधक कार्यालय, मलीहाबाद

REGISTRATION CERTIFICATE / विलेख पंजीकरण प्रमाण पत्र
Document No / दस्तावेज़ संख्या: REG-2025-0456
Date of Execution / निष्पादन तिथि: 20/08/2025

FIRST PARTY (EXECUTANT / VENDOR) / प्रथम पक्ष:
Name / नाम: Amit Sharma / अमित शर्मा
Father's Name / पिता का नाम: Som Nath / सोम नाथ
Resident of / निवासी: Malihabad Rural, Malihabad, District Lucknow, Uttar Pradesh

PROPERTY DETAILS / संपत्ति विवरण:
Khasra Number / खसरा संख्या: 123/5
Survey Number / सर्वे नंबर: SUR-UP-1235
Total Area / कुल क्षेत्रफल: 1.80 Acres / एकड़
Land Use / भूमि उपयोग: Residential Plot / आवासीय भूखंड
Location / स्थिति: Village Malihabad Rural, Tehsil Malihabad, District Lucknow

SCHEDULE OF BOUNDARIES / चौहद्दी विवरण:
North / उत्तर: Khasra 123/4 (Rajesh Kumar)
South / दक्षिण: Village Link Road / संपर्क मार्ग
East / पूर्व: Khasra 123/6 (Sunita Devi)
West / पश्चिम: Revenue Canal / नहर
`;
    }

    return {
      text: simulatedDeedText,
      confidence: 96.5,
      provider: this.name,
      isFallback: true,
    };
  }
}
