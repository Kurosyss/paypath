/**
 * PayPath - Official PayPal Sandbox REST Client
 * Implements Orders v2, OAuth2 Token Caching, Negative Testing Headers,
 * Idempotency tracking (PayPal-Request-Id), Authoritative State Reconciliation,
 * and Webhook Signature Verification.
 */

import { v4 as uuidv4 } from 'uuid';
import { sanitizeHeaders, sanitizePayload } from './sanitization';
import { TraceEvent, OrderState, PayPalConfigStatus } from './types';

const SANDBOX_BASE_URL = 'https://api-m.sandbox.paypal.com';

export interface PayPalCredentials {
  clientId?: string;
  clientSecret?: string;
  webhookId?: string;
}

interface TokenCache {
  token: string;
  expiresAt: number; // epoch ms
}

let cachedToken: TokenCache | null = null;

export class PayPalClient {
  private clientId: string;
  private clientSecret: string;
  private webhookId: string;
  private baseUrl: string;

  constructor(customCreds?: PayPalCredentials) {
    this.clientId = customCreds?.clientId || process.env.PAYPAL_CLIENT_ID || '';
    this.clientSecret = customCreds?.clientSecret || process.env.PAYPAL_CLIENT_SECRET || '';
    this.webhookId = customCreds?.webhookId || process.env.PAYPAL_WEBHOOK_ID || '';
    this.baseUrl = SANDBOX_BASE_URL;
  }

  public getConfigStatus(): PayPalConfigStatus {
    const hasClientId = Boolean(this.clientId && this.clientId.trim().length > 0);
    const hasClientSecret = Boolean(this.clientSecret && this.clientSecret.trim().length > 0);
    const hasWebhookId = Boolean(this.webhookId && this.webhookId.trim().length > 0);

    return {
      hasClientId,
      hasClientSecret,
      hasWebhookId,
      mode: 'SANDBOX',
      connected: hasClientId && hasClientSecret,
      lastCheckedAt: new Date().toISOString(),
    };
  }

  /**
   * Fetches or reuses OAuth2 Bearer Access Token
   */
  public async getAccessToken(traces?: TraceEvent[]): Promise<{ token: string; trace?: TraceEvent }> {
    const now = Date.now();
    if (cachedToken && cachedToken.expiresAt > now + 60000) {
      return { token: cachedToken.token };
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        'Missing PayPal Sandbox credentials. Please configure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env or the Settings panel.'
      );
    }

    const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const startTime = Date.now();

    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const latencyMs = Date.now() - startTime;
    const data = await response.json().catch(() => ({}));

    const trace: TraceEvent = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: 'HTTP_RESPONSE',
      source: 'PAYPAL_API',
      title: 'OAuth 2.0 Token Exchange',
      detail: `POST /v1/oauth2/token (${response.status} ${response.statusText}) in ${latencyMs}ms`,
      status: response.ok ? 'SUCCESS' : 'ERROR',
      latencyMs,
      sanitizedPayload: {
        endpoint: '/v1/oauth2/token',
        method: 'POST',
        status: response.status,
        headers: sanitizeHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
        body: sanitizePayload({
          token_type: data.token_type,
          app_id: data.app_id,
          expires_in: data.expires_in,
          status: response.ok ? 'TOKEN_ISSUED' : 'AUTH_FAILED',
        }),
      },
    };

    if (traces) {
      traces.push(trace);
    }

    if (!response.ok) {
      throw new Error(
        `PayPal OAuth error (${response.status}): ${data.error_description || data.error || 'Authentication failed'}`
      );
    }

    const expiresInMs = (data.expires_in || 3600) * 1000;
    cachedToken = {
      token: data.access_token,
      expiresAt: now + expiresInMs,
    };

    return { token: cachedToken.token, trace };
  }

  public getAppBaseUrl(): string {
    const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_BASE_URL;
    if (configuredUrl && configuredUrl.trim().length > 0) {
      return configuredUrl.trim().replace(/\/$/, '');
    }
    const port = process.env.PORT || '3000';
    return `http://localhost:${port}`;
  }

  /**
   * Creates an order using Orders v2 API
   */
  public async createOrder(options: {
    amount: string;
    currency?: string;
    description?: string;
    mockResponseCode?: string; // for negative testing
    requestId?: string;
    returnUrl?: string;
    cancelUrl?: string;
    traces?: TraceEvent[];
  }): Promise<{ order: Record<string, unknown>; orderId: string; status: OrderState; traces: TraceEvent[] }> {
    const traces = options.traces || [];
    const { token } = await this.getAccessToken(traces);

    const requestId = options.requestId || uuidv4();
    const currency = options.currency || 'USD';
    const baseUrl = this.getAppBaseUrl();
    const returnUrl = options.returnUrl || `${baseUrl}/checkout/success`;
    const cancelUrl = options.cancelUrl || `${baseUrl}/checkout/cancel`;

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: `PU-${Date.now()}`,
          description: options.description || 'PayPath Reliability Test Purchase',
          amount: {
            currency_code: currency,
            value: options.amount,
          },
        },
      ],
      application_context: {
        brand_name: 'PayPath Lab Sandbox',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    };

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': requestId,
    };

    if (options.mockResponseCode) {
      headers['PayPal-Mock-Response'] = JSON.stringify({
        mock_application_codes: options.mockResponseCode,
      });
    }

    traces.push({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: 'HTTP_REQUEST',
      source: 'BACKEND',
      title: 'Create Order Request',
      detail: `POST /v2/checkout/orders (Idempotency: ${requestId})`,
      sanitizedPayload: {
        endpoint: '/v2/checkout/orders',
        method: 'POST',
        headers: sanitizeHeaders(headers),
        body: sanitizePayload(orderPayload),
      },
    });

    const startTime = Date.now();
    const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderPayload),
    });

    const latencyMs = Date.now() - startTime;
    const data = await response.json().catch(() => ({}));

    traces.push({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: 'HTTP_RESPONSE',
      source: 'PAYPAL_API',
      title: 'Create Order Response',
      detail: `POST /v2/checkout/orders -> ${response.status} ${response.statusText} (${latencyMs}ms)`,
      status: response.ok ? 'SUCCESS' : 'ERROR',
      latencyMs,
      sanitizedPayload: {
        endpoint: '/v2/checkout/orders',
        method: 'POST',
        status: response.status,
        body: sanitizePayload(data),
      },
    });

    if (!response.ok) {
      const errorMsg = data.message || data.details?.[0]?.issue || 'Order creation failed';
      throw new Error(`PayPal Order Create Failed (${response.status}): ${errorMsg}`);
    }

    return {
      order: data,
      orderId: data.id,
      status: (data.status as OrderState) || 'CREATED',
      traces,
    };
  }

  /**
   * Captures an approved order
   */
  public async captureOrder(options: {
    orderId: string;
    mockResponseCode?: string; // e.g. INSTRUMENT_DECLINED
    requestId?: string;
    simulateTimeout?: boolean;
    traces?: TraceEvent[];
  }): Promise<{ captureData: Record<string, unknown>; status: OrderState; captureId?: string; traces: TraceEvent[] }> {
    const traces = options.traces || [];
    const { token } = await this.getAccessToken(traces);

    const requestId = options.requestId || uuidv4();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': requestId,
    };

    if (options.mockResponseCode) {
      headers['PayPal-Mock-Response'] = JSON.stringify({
        mock_application_codes: options.mockResponseCode,
      });
    }

    traces.push({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: 'HTTP_REQUEST',
      source: 'BACKEND',
      title: 'Capture Order Request',
      detail: `POST /v2/checkout/orders/${options.orderId}/capture (Idempotency: ${requestId})`,
      sanitizedPayload: {
        endpoint: `/v2/checkout/orders/${options.orderId}/capture`,
        method: 'POST',
        headers: sanitizeHeaders(headers),
      },
    });

    if (options.simulateTimeout) {
      traces.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'FAULT_INJECTED',
        source: 'BACKEND',
        title: 'Network Timeout / Socket Drop Injected',
        detail: `Simulated 504 Gateway Timeout on capture of ${options.orderId}. Response lost in transit.`,
        status: 'WARNING',
      });
      throw new Error('TIMEOUT_SIMULATED: Network connection dropped before capture response received');
    }

    const startTime = Date.now();
    const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${options.orderId}/capture`, {
      method: 'POST',
      headers,
    });

    const latencyMs = Date.now() - startTime;
    const data = await response.json().catch(() => ({}));

    const isSuccess = response.ok && data.status === 'COMPLETED';

    traces.push({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: 'HTTP_RESPONSE',
      source: 'PAYPAL_API',
      title: 'Capture Order Response',
      detail: `POST /v2/checkout/orders/${options.orderId}/capture -> ${response.status} ${response.statusText} (${latencyMs}ms)`,
      status: isSuccess ? 'SUCCESS' : 'ERROR',
      latencyMs,
      sanitizedPayload: {
        endpoint: `/v2/checkout/orders/${options.orderId}/capture`,
        method: 'POST',
        status: response.status,
        body: sanitizePayload(data),
      },
    });

    // Check error details
    const isDeclined =
      data.details?.some((d: Record<string, unknown>) => d.issue === 'INSTRUMENT_DECLINED' || d.issue === 'TRANSACTION_REFUSED');

    const isOrderNotApproved =
      data.details?.some((d: Record<string, unknown>) => d.issue === 'ORDER_NOT_APPROVED') ||
      data.message?.includes('ORDER_NOT_APPROVED');

    const captureId =
      data.purchase_units?.[0]?.payments?.captures?.[0]?.id || undefined;

    const finalStatus: OrderState = isSuccess
      ? 'COMPLETED'
      : isDeclined
      ? 'DECLINED'
      : isOrderNotApproved
      ? 'PAYER_ACTION_REQUIRED'
      : 'FAILED';

    return {
      captureData: data,
      status: finalStatus,
      captureId,
      traces,
    };
  }

  /**
   * Authoritative State Reconciliation
   * Queries PayPal API for the ground-truth state of an order
   */
  public async getOrderDetails(
    orderId: string,
    traces?: TraceEvent[]
  ): Promise<{ order: Record<string, unknown>; status: OrderState; traces: TraceEvent[] }> {
    const traceList = traces || [];
    const { token } = await this.getAccessToken(traceList);

    const startTime = Date.now();
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    traceList.push({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: 'RECONCILIATION',
      source: 'BACKEND',
      title: 'State Reconciliation Query',
      detail: `GET /v2/checkout/orders/${orderId} (Querying authoritative ledger status)`,
      sanitizedPayload: {
        endpoint: `/v2/checkout/orders/${orderId}`,
        method: 'GET',
        headers: sanitizeHeaders(headers),
      },
    });

    const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers,
    });

    const latencyMs = Date.now() - startTime;
    const data = await response.json().catch(() => ({}));

    traceList.push({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: 'HTTP_RESPONSE',
      source: 'PAYPAL_API',
      title: 'Reconciliation Ledger Response',
      detail: `Authoritative Order Status: ${data.status} (HTTP ${response.status}) in ${latencyMs}ms`,
      status: response.ok ? 'SUCCESS' : 'ERROR',
      latencyMs,
      sanitizedPayload: {
        endpoint: `/v2/checkout/orders/${orderId}`,
        method: 'GET',
        status: response.status,
        body: sanitizePayload(data),
      },
    });

    return {
      order: data,
      status: (data.status as OrderState) || 'UNCERTAIN',
      traces: traceList,
    };
  }

  /**
   * Verifies Webhook Signature using official PayPal endpoint
   */
  public async verifyWebhookSignature(params: {
    authAlgo: string;
    certUrl: string;
    transmissionId: string;
    transmissionSig: string;
    transmissionTime: string;
    webhookEvent: Record<string, unknown>;
    webhookId?: string;
    traces?: TraceEvent[];
  }): Promise<{ verified: boolean; status: string; traces: TraceEvent[] }> {
    const traces = params.traces || [];
    const webhookId = params.webhookId || this.webhookId || 'WH-TEST-DEFAULT-ID';
    const { token } = await this.getAccessToken(traces);

    const verificationPayload = {
      auth_algo: params.authAlgo,
      cert_url: params.certUrl,
      transmission_id: params.transmissionId,
      transmission_sig: params.transmissionSig,
      transmission_time: params.transmissionTime,
      webhook_id: webhookId,
      webhook_event: params.webhookEvent,
    };

    traces.push({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: 'HTTP_REQUEST',
      source: 'BACKEND',
      title: 'Verify Webhook Signature',
      detail: `POST /v1/notifications/verify-webhook-signature (Transmission ID: ${params.transmissionId})`,
      sanitizedPayload: {
        endpoint: '/v1/notifications/verify-webhook-signature',
        method: 'POST',
        body: sanitizePayload(verificationPayload),
      },
    });

    const startTime = Date.now();
    const response = await fetch(`${this.baseUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verificationPayload),
    });

    const latencyMs = Date.now() - startTime;
    const data = await response.json().catch(() => ({}));

    const verified = response.ok && data.verification_status === 'SUCCESS';

    traces.push({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: 'HTTP_RESPONSE',
      source: 'PAYPAL_API',
      title: 'Signature Verification Result',
      detail: `Status: ${data.verification_status || 'FAILURE'} (${latencyMs}ms)`,
      status: verified ? 'SUCCESS' : 'WARNING',
      latencyMs,
      sanitizedPayload: {
        endpoint: '/v1/notifications/verify-webhook-signature',
        method: 'POST',
        status: response.status,
        body: sanitizePayload(data),
      },
    });

    return {
      verified,
      status: data.verification_status || 'FAILURE',
      traces,
    };
  }
}
