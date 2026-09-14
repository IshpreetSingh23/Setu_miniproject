// SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
// Bilingual Structured Field Extractor (English & Hindi OCR Text Parsing)

import { ExtractedDocumentFields } from '../types';

/**
 * Extracts structured property and title attributes from raw OCR text using regex heuristics.
 */
export function extractFieldsFromOCR(rawText: string): ExtractedDocumentFields {
  const fields: ExtractedDocumentFields = {
    owner_name: null,
    father_name: null,
    khasra_number: null,
    survey_number: null,
    area_value: null,
    area_unit: 'Acres',
    village: null,
    tehsil: null,
    district: null,
    state: null,
    registration_number: null,
    registration_date: null,
    land_use: null,
    boundaries: null,
    document_number: null,
  };

  if (!rawText || typeof rawText !== 'string') return fields;

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // 1. Owner Name Extraction
  // Look for "Name:", "Owner:", "Vendor:", "Executant:", "नाम:", "क्रेता:", "विक्रेता:"
  const ownerRegexes = [
    /(?:owner|executant|vendor|purchaser|name)\s*[:\-\/]\s*([A-Za-z\s]+?)(?:\s*[\/,]|\s+s\/o|\s+w\/o|\s+d\/o|\s+father|\n|$)/i,
    /(?:नाम|मालिक|विक्रेता|क्रेता)\s*[:\-\/]\s*([\u0900-\u097F\sA-Za-z]+?)(?:\s*[\/,]|\s+पिता|\s+आत्मज|\n|$)/i,
  ];

  for (const regex of ownerRegexes) {
    const match = rawText.match(regex);
    if (match && match[1]?.trim()) {
      const candidate = match[1].trim().replace(/\b(shri|smt|mr|श्री|श्रीमती)\b/gi, '').trim();
      if (candidate.length > 2) {
        fields.owner_name = candidate;
        break;
      }
    }
  }

  // 2. Father's Name Extraction
  const fatherRegexes = [
    /(?:father(?:'s)?\s*name|s\/o|w\/o|d\/o)\s*[:\-\/]\s*([A-Za-z\s]+?)(?:\s*[\/,]|\s+resident|\s+r\/o|\n|$)/i,
    /(?:पिता\s*का\s*नाम|आत्मज|वल्द)\s*[:\-\/]\s*([\u0900-\u097F\sA-Za-z]+?)(?:\s*[\/,]|\s+निवासी|\n|$)/i,
  ];

  for (const regex of fatherRegexes) {
    const match = rawText.match(regex);
    if (match && match[1]?.trim()) {
      const candidate = match[1].trim().replace(/\b(shri|late|श्री|स्वर्गवासी)\b/gi, '').trim();
      if (candidate.length > 2) {
        fields.father_name = candidate;
        break;
      }
    }
  }

  // 3. Khasra / Survey Number
  const khasraMatch = rawText.match(/(?:khasra(?:\s*(?:no|number|\.))?|खसरा(?:\s*संख्या)?|गाटा(?:\s*संख्या)?)\s*[:\-\/.]?\s*([0-9]+(?:\/[0-9]+)?)/i);
  if (khasraMatch && khasraMatch[1]) {
    fields.khasra_number = khasraMatch[1].trim();
  }

  const surveyMatch = rawText.match(/(?:survey(?:\s*(?:no|number|\.))?|सर्वे(?:\s*नंबर)?)\s*[:\-\/.]?\s*([A-Za-z0-9\-_]+)/i);
  if (surveyMatch && surveyMatch[1]) {
    fields.survey_number = surveyMatch[1].trim();
  }

  // 4. Area Value & Unit
  const areaMatch = rawText.match(/(?:total\s*area|area|extent|क्षेत्रफल|रकबा)\s*[:\-\/]?\s*([0-9]+(?:\.[0-9]+)?)\s*(acres?|hectares?|sq\.?\s*meters?|bigha|गज|एकड़|हेक्टेयर|वर्ग\s*मीटर)?/i);
  if (areaMatch && areaMatch[1]) {
    const num = parseFloat(areaMatch[1]);
    if (!isNaN(num) && num > 0) {
      fields.area_value = num;
      if (areaMatch[2]) {
        fields.area_unit = areaMatch[2].trim();
      }
    }
  }

  // 5. Registration Number & Document Number
  const regMatch = rawText.match(/(?:registration(?:\s*(?:no|number|\.))?|document(?:\s*(?:no|number|\.))?|विलेख(?:\s*संख्या)?|पंजीकरण(?:\s*क्रमांक)?)\s*[:\-\/.]?\s*([A-Za-z0-9\-_]+)/i);
  if (regMatch && regMatch[1]) {
    fields.registration_number = regMatch[1].trim();
    fields.document_number = regMatch[1].trim();
  }

  // 6. Registration / Execution Date
  const dateMatch = rawText.match(/(?:date(?:\s*of\s*execution)?|पंजीकरण\s*तिथि|निष्पादन\s*तिथि)\s*[:\-\/]?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})/i);
  if (dateMatch && dateMatch[1]) {
    fields.registration_date = dateMatch[1].trim();
  }

  // 7. Locality: Village, Tehsil, District, State
  const villageMatch = rawText.match(/(?:village|ग्राम|गाँव)\s*[:\-\/]?\s*([A-Za-z\u0900-\u097F\s]+?)(?=[,\n]|tehsil|तहसील|$)/i);
  if (villageMatch && villageMatch[1]?.trim()) {
    fields.village = villageMatch[1].trim();
  }

  const tehsilMatch = rawText.match(/(?:tehsil|तहसील)\s*[:\-\/]?\s*([A-Za-z\u0900-\u097F\s]+?)(?=[,\n]|district|जिला|$)/i);
  if (tehsilMatch && tehsilMatch[1]?.trim()) {
    fields.tehsil = tehsilMatch[1].trim();
  }

  const districtMatch = rawText.match(/(?:district|जिला)\s*[:\-\/]?\s*([A-Za-z\u0900-\u097F\s]+?)(?=[,\n]|state|राज्य|$)/i);
  if (districtMatch && districtMatch[1]?.trim()) {
    fields.district = districtMatch[1].trim();
  }

  // Fallback scan: if Khasra wasn't caught by key, search lines without date context
  if (!fields.khasra_number) {
    for (const line of lines) {
      if (/date|execution|तिथि|तारीख/i.test(line)) continue;
      const inlineKhasra = line.match(/\b([0-9]{1,4}\/[0-9]{1,3})\b/);
      if (inlineKhasra && !line.includes('/20') && !line.includes('/19')) {
        fields.khasra_number = inlineKhasra[1];
        break;
      }
    }
  }

  return fields;
}
