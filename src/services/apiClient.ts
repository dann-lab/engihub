/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { auth } from './firebase';

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await auth.currentUser?.getIdToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const FALLBACK_AI_ERROR = "The tutor didn't respond. Check your connection and try again.";

/**
 * Universal client function calling Netlify AI function at /.netlify/functions/ai
 * Matches Netlify production deployment and local dev proxy.
 */
export async function callNetlifyAI<T = any>(payload: Record<string, any>): Promise<T> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch('/.netlify/functions/ai', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let serverErr = '';
      try {
        const errJson = await response.json();
        serverErr = errJson.error || errJson.message || '';
      } catch {
        serverErr = await response.text().catch(() => '');
      }
      console.error('Netlify AI request failed:', response.status, serverErr || response.statusText);
      throw new Error(FALLBACK_AI_ERROR);
    }

    const data = await response.json();
    return data as T;
  } catch (err: any) {
    console.error('AI invocation error:', err);
    throw new Error(FALLBACK_AI_ERROR);
  }
}

export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let errMessage = FALLBACK_AI_ERROR;
    try {
      const errJson = await response.json();
      if (errJson.error) {
        errMessage = errJson.error;
      }
    } catch {
      // Use fallback
    }

    if (response.status === 401) {
      throw new Error('Your session has expired. Please sign in again.');
    }
    throw new Error(errMessage);
  }

  return response.json();
}
