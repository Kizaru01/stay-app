const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const user = { id: 1, clerk_id: "user_test", name: "Alex", email: "alex@example.test", email_verified_at: null, avatar_url: null };
function load(fetch, url = "https://api.example.test/api") {
  const code = ts.transpileModule(readFileSync(path.join(__dirname, "../src/screens/auth/sync-account.ts"), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = vm.createContext({ process: { env: { EXPO_PUBLIC_API_URL: url } }, AbortController, setTimeout, clearTimeout });
  const module = { exports: {} };
  vm.runInContext("(function(require, exports) {" + code + "\n})", context)(() => ({ fetch }), module.exports);
  return module.exports;
}
const response = (status, data = user) => ({ status, ok: status === 200, json: async () => ({ data }) });
const args = () => ({ getToken: async () => "token", userId: "user_test", signal: new AbortController().signal });

test("sends only bearer identity and validates the server user", async () => {
  const api = load(async (url, options) => {
    assert.equal(url, "https://api.example.test/api/auth/sync");
    assert.equal(options.headers.Authorization, "Bearer token");
    assert.equal(options.body, undefined);
    return response(200);
  });
  assert.equal((await api.syncAccount(args())).clerk_id, "user_test");
});
test("refreshes a rejected token once, then succeeds", async () => {
  const options = [];
  let calls = 0;
  const api = load(async () => response(++calls === 1 ? 401 : 200));
  await api.syncAccount({ ...args(), getToken: async option => { options.push(option.skipCache); return "token"; } });
  assert.deepEqual(options, [false, true]);
  assert.equal(calls, 2);
});
test("persistent 401 and conflicts are not automatically retried", async () => {
  for (const status of [401, 409, 422]) {
    let calls = 0;
    const api = load(async () => { calls++; return response(status); });
    await assert.rejects(api.syncAccount(args()), error => error.status === status && !api.shouldRetrySync(0, error));
    assert.equal(calls, status === 401 ? 2 : 1);
  }
});
test("transient failures have a finite retry budget", async () => {
  const api = load(async () => response(503));
  await assert.rejects(api.syncAccount(args()), error => api.shouldRetrySync(1, error) && !api.shouldRetrySync(2, error));
});
test("does not accept another user's identity", async () => {
  const api = load(async () => response(200, { ...user, clerk_id: "user_other" }));
  await assert.rejects(api.syncAccount(args()), error => error.status === 502);
});
test("missing API configuration never sends credentials", async () => {
  const api = load(() => assert.fail("must not fetch"), "");
  await assert.rejects(api.syncAccount(args()), error => error.status === 400);
});
test("cancels token retrieval and never sends a late token after account switch", async () => {
  let finishToken;
  const api = load(() => assert.fail("must not fetch"));
  const controller = new AbortController();
  const pending = api.syncAccount({ ...args(), signal: controller.signal, getToken: () => new Promise(resolve => { finishToken = resolve; }) });
  controller.abort();
  await assert.rejects(pending);
  finishToken("old-token");
  await new Promise(resolve => setImmediate(resolve));
});
test("malformed successful responses cannot unlock the account", async () => {
  const api = load(async () => response(200, { id: 1 }));
  await assert.rejects(api.syncAccount(args()), error => error.status === 502);
});
