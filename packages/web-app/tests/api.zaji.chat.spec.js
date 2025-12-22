/* Tiny Playwright API smoke for Zaji.
   - Default endpoint: http://127.0.0.1:3000/api/zaji/chat
   - Optional auth: set ZAJI_AUTH_HEADER and ZAJI_AUTH_VALUE
*/
const { test, expect } = require('@playwright/test');

const ENDPOINT = process.env.ZAJI_ENDPOINT || 'http://127.0.0.1:3000/api/zaji/chat';
const AUTH_HEADER = process.env.ZAJI_AUTH_HEADER || '';
const AUTH_VALUE  = process.env.ZAJI_AUTH_VALUE  || '';

function maybeHeaders() {
  return AUTH_HEADER && AUTH_VALUE ? { [AUTH_HEADER]: AUTH_VALUE, 'Content-Type': 'application/json' }
                                   : { 'Content-Type': 'application/json' };
}

test('GET /api/zaji/chat returns docs JSON', async ({ request }) => {
  const res = await request.get(ENDPOINT, { headers: maybeHeaders() });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  // name field from your route docs
  expect(json.name).toBe('Zaji chat');
  expect(Array.isArray(json.methods)).toBe(true);
});

test('POST smoke returns exactly "OK"', async ({ request }) => {
  const res = await request.post(ENDPOINT, {
    headers: maybeHeaders(),
    data: { prompt: 'SMOKE TEST: reply with exactly the string OK', temperature: 0.0 }
  });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.response).toBe('OK');
});
