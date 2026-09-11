// Run: node --test tests/finance-rest-auth.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../team/team-pages.js'), 'utf8');
const helper = source.slice(source.indexOf('  async function financeRest('), source.indexOf('  function bindPhase5Rails('));

function setup(getSession, response = { ok: true, text: async () => '{"ok":true}' }) {
  const calls = [];
  const window = { ParagonConfig: { supabaseUrl: 'https://example.test/', supabaseAnonKey: 'anon' } };
  if (getSession) window.ParagonAuth = { getSession };
  const context = vm.createContext({ window, fetch: async (...args) => { calls.push(args); return response; } });
  vm.runInContext(helper, context);
  return { request: context.financeRest, calls, window };
}

test('awaits session and uses latest JWT, retaining API key and request options', async () => {
  let token = 'team-token';
  const { request, calls } = setup(async () => ({ access_token: token }));
  await request('/rest/v1/rpc/paragon_set_financial_pause', {
    method: 'POST', body: '{}', headers: { Prefer: 'return=representation', Authorization: 'Bearer stale' }
  });
  assert.equal(calls[0][0], 'https://example.test/rest/v1/rpc/paragon_set_financial_pause');
  assert.equal(calls[0][1].headers.Authorization, 'Bearer team-token');
  assert.equal(calls[0][1].headers.apikey, 'anon');
  assert.equal(calls[0][1].headers.Prefer, 'return=representation');
  assert.equal(calls[0][1].method, 'POST');
  assert.equal(calls[0][1].body, '{}');
  token = 'refreshed-token';
  await request('/rest/v1/rpc/paragon_coin_confirm_payment_intent');
  assert.equal(calls[1][1].headers.Authorization, 'Bearer refreshed-token');
});

test('missing auth or session preserves anonymous public reads', async () => {
  for (const getter of [undefined, async () => null]) {
    const { request, calls } = setup(getter);
    await request('/rest/v1/rpc/paragon_public_coin_config');
    assert.equal(calls[0][1].headers.Authorization, 'Bearer anon');
  }
});

test('session errors reject without silently downgrading or sending a request', async () => {
  const { request, calls } = setup(async () => { throw new Error('refresh failed'); });
  await assert.rejects(request('/rest/v1/rpc/private'), /refresh failed/);
  assert.equal(calls.length, 0);
});

test('database authorization errors remain visible', async () => {
  const { request } = setup(async () => null, { ok: false, status: 403, text: async () => '{"message":"Team only"}' });
  await assert.rejects(request('/rest/v1/rpc/private'), /Team only/);
});

test('missing configuration rejects without fetching', async () => {
  const { request, calls, window } = setup();
  window.ParagonConfig = {};
  await assert.rejects(request('/rest/v1/rpc/private'), /No Supabase config/);
  assert.equal(calls.length, 0);
});
