// SETU: Bilingual OCR Field Extractor Tests

import { describe, it, expect } from 'vitest';
import { extractFieldsFromOCR } from './extractor';

describe('OCR Field Extractor', () => {
  it('extracts structured fields from English sale deed text', () => {
    const rawText = `
SUB-REGISTRAR OFFICE
DEED OF SALE
Document No: REG-2025-0456
Date of Execution: 20/08/2025
Owner Name: Amit Sharma
Father's Name: Som Nath
Village: Malihabad Rural, Tehsil: Malihabad, District: Lucknow
Khasra No: 123/5
Total Area: 1.80 Acres
`;

    const fields = extractFieldsFromOCR(rawText);
    expect(fields.owner_name).toBe('Amit Sharma');
    expect(fields.father_name).toBe('Som Nath');
    expect(fields.khasra_number).toBe('123/5');
    expect(fields.area_value).toBe(1.8);
    expect(fields.registration_number).toBe('REG-2025-0456');
    expect(fields.village).toBe('Malihabad Rural');
    expect(fields.tehsil).toBe('Malihabad');
    expect(fields.district).toBe('Lucknow');
  });

  it('extracts structured fields from Hindi sale deed text', () => {
    const rawText = `
उप-निबंधक कार्यालय
बैनामा / विक्रय पत्र
विलेख संख्या: REG-2025-0192
नाम: राजेश कुमार
पिता का नाम: राम लाल
खसरा संख्या: 123/4
कुल क्षेत्रफल: 2.50 एकड़
ग्राम: मलीहाबाद रूरल
तहसील: मलीहाबाद
जिला: लखनऊ
`;

    const fields = extractFieldsFromOCR(rawText);
    expect(fields.owner_name).toBe('राजेश कुमार');
    expect(fields.father_name).toBe('राम लाल');
    expect(fields.khasra_number).toBe('123/4');
    expect(fields.area_value).toBe(2.5);
    expect(fields.registration_number).toBe('REG-2025-0192');
  });

  it('handles empty and noisy text without hallucinating missing fields', () => {
    const fields = extractFieldsFromOCR('Random scanned document noise with no property data.');
    expect(fields.owner_name).toBeNull();
    expect(fields.khasra_number).toBeNull();
    expect(fields.area_value).toBeNull();
  });
});
