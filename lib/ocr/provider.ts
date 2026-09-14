// SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
// OCR Provider Abstraction Interface

import { OCRResult } from '../types';

export interface OCRProvider {
  name: string;
  isAvailable(): boolean;
  processDocument(fileBuffer: Buffer, mimeType: string): Promise<OCRResult>;
}
