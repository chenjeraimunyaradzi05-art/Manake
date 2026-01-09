import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response } from 'express';
import crypto from 'crypto';
import { ingestWebhook } from './webhookController';
import { ApiError } from '../errors';

const mockEvent = {
  markFailed: vi.fn(async () => undefined),
  markProcessed: vi.fn(async () => undefined),
};

vi.mock('../models/WebhookEvent', () => ({
  WebhookEvent: {
    create: vi.fn(async () => mockEvent),
  },
}));

describe('ingestWebhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.WEBHOOK_SECRET_FACEBOOK = 'secret';
  });

  const makeRes = (): Response => {
    const res: Partial<Response> = {};
    res.json = vi.fn(() => res as Response) as Response['json'];
    return res as Response;
  };

  const makeReq = (override: Partial<Request> = {}): Request => {
    const body = { hello: 'world' };
    return {
      params: { provider: 'facebook' },
      headers: {},
      body,
      ip: '127.0.0.1',
      ...override,
    } as Request;
  };

  it('rejects invalid signature', async () => {
    const body = { hello: 'world' };
    const goodSig = crypto.createHmac('sha256', 'secret').update(JSON.stringify(body)).digest('hex');
    const badSig = '0' + goodSig.slice(1); // same length, mismatched content

    const req = makeReq({ body, headers: { 'x-webhook-signature': badSig } });
    const res = makeRes();

    await expect(ingestWebhook(req, res)).rejects.toBeInstanceOf(ApiError);
    expect(mockEvent.markFailed).toHaveBeenCalledWith('Signature verification failed');
  });

  it('processes valid signature', async () => {
    const body = { id: 'evt_1', type: 'test.event' };
    const payloadString = JSON.stringify(body);
    const signature = crypto.createHmac('sha256', 'secret').update(payloadString).digest('hex');

    const req = makeReq({
      body,
      headers: {
        'x-webhook-signature': signature,
        'x-event-id': 'evt_1',
        'x-event-type': 'test.event',
      },
    });
    const res = makeRes();

    await ingestWebhook(req, res);

    expect(mockEvent.markProcessed).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'ok' }));
  });
});
