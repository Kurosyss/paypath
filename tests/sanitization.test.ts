import { describe, it, expect } from 'vitest';
import { sanitizeHeaders, sanitizePayload, sanitizeString } from '../src/lib/sanitization';

describe('Sanitization Engine', () => {
  it('should redact Bearer and Basic authentication headers', () => {
    const rawHeaders = {
      Authorization: 'Bearer A21AAJabcdef1234567890XYZ',
      'Content-Type': 'application/json',
      'PayPal-Client-Secret': 'SECRET_12345_TEST',
    };

    const sanitized = sanitizeHeaders(rawHeaders);
    expect(sanitized.Authorization).toBe('Bearer [REDACTED_TOKEN]');
    expect(sanitized['PayPal-Client-Secret']).toBe('[REDACTED_BY_PAYPATH]');
    expect(sanitized['Content-Type']).toBe('application/json');
  });

  it('should redact sensitive keys in nested payloads', () => {
    const payload = {
      orderId: 'ORD-1234',
      amount: '25.00',
      client_secret: 'SUPER_SECRET_KEY',
      auth: {
        access_token: 'TOKEN_XYZ_999',
        password: 'admin_password',
      },
      buyer: {
        name: 'John Doe',
        credit_card_number: '4111 2222 3333 4444',
      },
    };

    const sanitized = sanitizePayload(payload);
    expect(sanitized.orderId).toBe('ORD-1234');
    expect(sanitized.amount).toBe('25.00');
    expect(sanitized.client_secret).toBe('[REDACTED_BY_PAYPATH]');
    expect(sanitized.auth.access_token).toBe('[REDACTED_BY_PAYPATH]');
    expect(sanitized.auth.password).toBe('[REDACTED_BY_PAYPATH]');
    expect(sanitized.buyer.credit_card_number).toBe('[REDACTED_BY_PAYPATH]');
  });

  it('should sanitize raw credit card numbers in strings', () => {
    const str = 'User paid with card 4111-2222-3333-4444 on PayPal';
    const cleaned = sanitizeString(str);
    expect(cleaned).toContain('4111-XXXX-XXXX-1111');
    expect(cleaned).not.toContain('4111-2222-3333-4444');
  });
});
