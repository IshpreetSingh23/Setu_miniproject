// SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
// Google Cloud Vision OCR Provider (DOCUMENT_TEXT_DETECTION)
// Implemented via REST to guarantee seamless compatibility with Vercel Serverless runtimes

import crypto from 'crypto';
import { OCRProvider } from './provider';
import { OCRResult } from '../types';

export class GoogleVisionOCRProvider implements OCRProvider {
  name = 'Google Cloud Vision (DOCUMENT_TEXT_DETECTION)';

  isAvailable(): boolean {
    const hasApiKey = Boolean(process.env.GOOGLE_CLOUD_API_KEY);
    const hasServiceAccount = Boolean(
      process.env.GOOGLE_CLOUD_CLIENT_EMAIL && process.env.GOOGLE_CLOUD_PRIVATE_KEY
    );
    return hasApiKey || hasServiceAccount;
  }

  private async getAccessToken(): Promise<string | null> {
    const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
    const rawKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY;

    if (!clientEmail || !rawKey) return null;

    // Format private key properly handling escaped newlines
    const privateKey = rawKey.replace(/\\n/g, '\n');

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const claimSet = {
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/cloud-vision',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };

    const base64UrlEncode = (obj: Record<string, unknown>) =>
      Buffer.from(JSON.stringify(obj)).toString('base64url');

    const tokenPayload = `${base64UrlEncode(header)}.${base64UrlEncode(claimSet)}`;
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(tokenPayload);
    const signature = signer.sign(privateKey, 'base64url');
    const jwt = `${tokenPayload}.${signature}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to obtain Google Cloud OAuth token: ${res.statusText}`);
    }

    const data = await res.json();
    return data.access_token;
  }

  async processDocument(fileBuffer: Buffer, mimeType: string): Promise<OCRResult> {
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    const token = await this.getAccessToken();

    if (!apiKey && !token) {
      throw new Error('Google Cloud Vision credentials not configured.');
    }

    let url = 'https://vision.googleapis.com/v1/images:annotate';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (apiKey) {
      url += `?key=${apiKey}`;
    } else if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const base64Image = fileBuffer.toString('base64');
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'DOCUMENT_TEXT_DETECTION',
              maxResults: 1,
            },
          ],
          imageContext: {
            languageHints: ['hi', 'en'],
          },
        },
      ],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Cloud Vision OCR request failed (${response.status}): ${errorText}`);
    }

    const json = await response.json();
    const annotation = json.responses?.[0]?.fullTextAnnotation;
    const rawText = annotation?.text || '';
    const confidence = json.responses?.[0]?.textAnnotations?.[0]?.confidence ?? 0.94;

    return {
      text: rawText,
      confidence: Number((confidence * 100).toFixed(1)),
      provider: this.name,
      isFallback: false,
    };
  }
}
