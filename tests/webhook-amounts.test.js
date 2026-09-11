// Synthetic regression fixtures, NOT verified native provider sandbox payloads.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { stripTypeScriptTypes } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
let handler;
let writes = 0;
const context = vm.createContext({
  Response, URL, console, TextEncoder,
  Deno: { env: { get: name => ({ PARAGON_COIN_WEBHOOK_SECRET: 'test-secret', SUPABASE_URL: 'https://database.example.test', SUPABASE_SERVICE_ROLE_KEY: 'test-service-key' })[name] || '' }, serve: fn => { handler = fn; } },
  fetch: async () => { writes++; throw new Error('Unexpected backend write'); }
});
vm.runInContext(stripTypeScriptTypes(fs.readFileSync(path.join(__dirname, '../supabase/functions/coin-payment-webhook/index.ts'), 'utf8')), context);
for (const provider of ['opay', 'moniepoint']) {
  const normalize = context[provider === 'opay' ? 'normalizeOpay' : 'normalizeMoniepoint'];
  const payload = fields => ({ data: { status: 'success', reference: 'tx-1', ...fields } });
  test(`${provider}: explicit units are independent of magnitude`, () => {
    assert.equal(normalize(payload({ amountNaira: 60000 })).amountNaira, 60000);
    assert.equal(normalize(payload({ amountInKobo: 1000 })).amountNaira, 10);
    assert.equal(normalize(payload({ amountInKobo: '6000000' })).amountNaira, 60000);
    assert.equal(normalize(payload({ amount_naira: '100' })).amountNaira, 100);
  });
  test(`${provider}: rejects ambiguous, conflicting, fractional and invalid money`, () => {
    for (const fields of [
      { amount: 60000 }, { amount: 1000 }, { amountNaira: 0 },
      { amountNaira: -1 }, { amountNaira: 'NaN' }, { amountNaira: Infinity },
      { amountNaira: true }, { amountNaira: 1.5 }, { amountInKobo: 150 },
      { amountNaira: Number.MAX_SAFE_INTEGER + 1 },
      { amountNaira: 100, amountInKobo: 20000 },
      { amountNaira: 100, status: 'unsuccessful' }, { amountNaira: 100, status: '' }
    ]) assert.equal(normalize(payload(fields)), null, JSON.stringify(fields));
  });
  test(`${provider}: HTTP route cannot fall back to generic and write rejected money`, async () => {
    for (const body of [
      { status: 'success', reference: 'tx-1', amount: 60000 },
      { status: 'failed', reference: 'tx-1', amount_naira: 60000 }
    ]) {
      const response = await handler(new Request(`https://example.test/?provider=${provider}`, {
        method: 'POST', headers: { 'X-Paragon-Coin-Secret': 'test-secret' }, body: JSON.stringify(body)
      }));
      assert.equal(response.status, 422);
      assert.equal(writes, 0);
    }
  });
}
