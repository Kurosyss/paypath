/**
 * PayPath - Security Sanitizer
 * Redacts secrets, tokens, card data, and PII from traces, headers, and logs
 * before storage or transmission to AI providers.
 */

const REDACTED_MARKER = '[REDACTED_BY_PAYPATH]';

// Sensitive keys (case-insensitive)
const SENSITIVE_KEY_PATTERNS = [
  /client[-_]?secret/i,
  /authorization/i,
  /access[-_]?token/i,
  /refresh[-_]?token/i,
  /bearer/i,
  /secret/i,
  /password/i,
  /passwd/i,
  /cvv/i,
  /cvc/i,
  /card[-_]?number/i,
  /cardholder/i,
  /ssn/i,
  /webhook[-_]?secret/i,
  /transmission[-_]?sig/i,
  /private[-_]?key/i,
  /api[-_]?key/i,
];

// Regex for patterns in string values
const BEARER_REGEX = /Bearer\s+([A-Za-z0-9_\-.~+/]+=*)/gi;
const BASIC_AUTH_REGEX = /Basic\s+([A-Za-z0-9+/=]+)/gi;
const CREDIT_CARD_REGEX = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;

/**
 * Sanitizes a string value
 */
export function sanitizeString(val: string): string {
  if (!val) return val;
  let result = val;

  // Replace Bearer tokens
  result = result.replace(BEARER_REGEX, 'Bearer [REDACTED_ACCESS_TOKEN]');
  // Replace Basic auth
  result = result.replace(BASIC_AUTH_REGEX, 'Basic [REDACTED_CREDENTIALS]');
  // Replace Credit Card patterns
  result = result.replace(CREDIT_CARD_REGEX, '4111-XXXX-XXXX-1111');

  return result;
}

/**
 * Sanitizes an HTTP headers object
 */
export function sanitizeHeaders(headers: Record<string, string> | Headers | undefined): Record<string, string> {
  if (!headers) return {};
  const sanitized: Record<string, string> = {};

  const entries: [string, string][] =
    typeof (headers as Headers).forEach === 'function'
      ? Array.from((headers as Headers).entries())
      : Object.entries(headers);

  for (const [key, value] of entries) {
    const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
    if (isSensitive) {
      if (/authorization/i.test(key)) {
        sanitized[key] = value.startsWith('Bearer')
          ? 'Bearer [REDACTED_TOKEN]'
          : 'Basic [REDACTED_CREDENTIALS]';
      } else {
        sanitized[key] = REDACTED_MARKER;
      }
    } else {
      sanitized[key] = sanitizeString(String(value));
    }
  }

  return sanitized;
}

/**
 * Recursively deep sanitizes an arbitrary object or array
 */
export function sanitizePayload<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeString(obj) as unknown as T;
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizePayload(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      const isSensitiveKey = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
      if (isSensitiveKey) {
        output[key] = REDACTED_MARKER;
      } else {
        output[key] = sanitizePayload(val);
      }
    }
    return output as T;
  }

  return obj;
}
