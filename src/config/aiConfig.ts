/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EngiHub AI Configuration
 * Centralized Gemini model configuration for free tier availability and easy model swapping.
 */

// ============================================================================
// GEMINI MODEL CONFIGURATION
// Easily switch models here (e.g. 'gemini-3.8-flash', 'gemini-2.5-flash', etc.)
// or override via the GEMINI_MODEL environment variable in Netlify.
// ============================================================================
export const GEMINI_MODEL = (typeof process !== 'undefined' && process.env?.GEMINI_MODEL) || 'gemini-3.8-flash';

// Rate limiting thresholds
export const RATE_LIMIT_HOURLY = 30;
export const RATE_LIMIT_DAILY = 100;

// Maximum payload size (10MB for scanned notes)
export const MAX_PAYLOAD_BYTES = 10 * 1024 * 1024;
