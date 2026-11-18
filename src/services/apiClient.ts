/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { auth } from './firebase';

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await auth.currentUser?.getIdToken().catch(() => null);
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
 * Works seamlessly on both Netlify production and local Express/Vite dev server.
 */
export async function callNetlifyAI<T = any>(payload: Record<string, any>): Promise<T> {
  const endpoints = ['/.netlify/functions/ai', '/api/ai'];
  let lastError = FALLBACK_AI_ERROR;

  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      // If endpoint returned HTML (e.g. SPA fallback) or 404, try next endpoint
      if (response.status === 404 || (!isJson && response.ok)) {
        lastError = `Endpoint ${endpoint} unavailable (${response.status}).`;
        continue;
      }

      if (response.ok && isJson) {
        return (await response.json()) as T;
      }

      let serverErr = '';
      if (isJson) {
        try {
          const errJson = await response.json();
          serverErr = errJson.error || errJson.message || '';
        } catch {
          serverErr = '';
        }
      } else {
        const text = await response.text().catch(() => '');
        if (response.status === 502 || response.status === 504) {
          serverErr = 'The request took too long on the server. Try a smaller batch or retry.';
        } else if (text && !text.trim().startsWith('<')) {
          serverErr = text.slice(0, 200);
        }
      }

      const finalMsg = serverErr || `Server error (${response.status}). ${FALLBACK_AI_ERROR}`;
      console.error(`AI call to ${endpoint} failed (${response.status}):`, finalMsg);
      // Real server/API error (not missing route) — surface directly instead of falling through
      throw new Error(finalMsg);
    } catch (err: any) {
      const msg = err?.message || FALLBACK_AI_ERROR;
      lastError = msg;
      // Only continue loop on network/404-route errors when there is another endpoint
      const isRouteMissing = msg.includes('unavailable (404)') || msg.includes('Failed to fetch') || msg.includes('NetworkError');
      if (!isRouteMissing || i === endpoints.length - 1) {
        throw new Error(lastError);
      }
    }
  }

  throw new Error(lastError);
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
