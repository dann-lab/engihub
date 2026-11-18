/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EngiHub AI Configuration
 * Centralized Gemini model configuration for free tier availability and easy model swapping.
 */

// ============================================================================
// SERVER MODEL CONFIGURATION
// Override via the GEMINI_MODEL environment variable in Netlify if needed.
// ============================================================================
export const GEMINI_MODEL = (typeof process !== 'undefined' && process.env?.GEMINI_MODEL) || 'gemini-3.1-flash-lite';

// Rate limiting thresholds
export const RATE_LIMIT_HOURLY = 30;
export const RATE_LIMIT_DAILY = 100;

// Maximum payload size (10MB for scanned notes)
export const MAX_PAYLOAD_BYTES = 10 * 1024 * 1024;
