const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

const settle = () => new Promise(setImmediate);
const user = { id: 12, clerk_id: "user_fixture", email: "ada@example.com", first_name: "Ada", last_name: null, profile_image_url: null };
const response = (status = 200, data = { data: user }, retryAfter = null) => ({
  ok: status >= 200 && status < 300, status,
  headers: { get: () => retryAfter }, json: async () => data,
});

function load(relative, modules, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(path.join(__dirname, "../src/screens/auth", relative), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, { exports, require: name => {
    assert.ok(name in modules, `Unexpected module ${name}`);
    return modules[name];
  }, AbortController, URL, ...globals });
  return exports;
}

function client(fetcher, { url = "https://api.example.com/api/", dev = true } = {}) {
  const calls = [];
  const timers = new Map();
  let timerId = 0;
  const api = load("sync-clerk-user.ts", { "expo/fetch": { fetch: async (...args) => {
    calls.push(args);
    return fetcher(...args);
  } } }, {
    process: { env: { EXPO_PUBLIC_API_URL: url } }, __DEV__: dev,
    setTimeout: (callback, delay) => { timers.set(++timerId, { callback, delay }); return timerId; },
    clearTimeout: id => timers.delete(id),
  });
  return { ...api, calls, timers, runTimer(delay) {
    const entry = [...timers].find(([, timer]) => timer.delay === delay);
    assert.ok(entry, `No ${delay}ms timer pending`);
    timers.delete(entry[0]); entry[1].callback();
  } };
}

test("sync sends only a fresh bearer token and validates the returned identity", async () => {
  const api = client(() => response());
  const result = await api.syncClerkUser("user_fixture", async () => "session-token", new AbortController().signal);
  assert.equal(result.id, 12);
  const [[url, options]] = api.calls;
  assert.equal(url, "https://api.example.com/api/auth/sync");
  assert.equal(options.method, "POST");
  assert.equal(options.headers.Authorization, "Bearer session-token");
  assert.equal(options.body, undefined);
  assert.equal(options.credentials, "omit");
  assert.equal(options.redirect, "error");
  assert.equal(api.timers.size, 0);
});

for (const status of [409, 422]) test(`HTTP ${status} fails without automatic retries or leaked server details`, async () => {
  const api = client(() => response(status, { message: "private server details" }));
  await assert.rejects(api.syncClerkUser("user_fixture", async () => "token", new AbortController().signal), error => {
    assert.doesNotMatch(error.message, /private server details/);
    return true;
  });
  assert.equal(api.calls.length, 1);
  assert.equal(api.timers.size, 0);
});

for (const failure of ["missing token", "rejected token"]) test(`sync refreshes a ${failure} automatically`, async () => {
  const tokenOptions = [];
  const api = client(() => response(tokenOptions.length === 1 ? 401 : 200));
  const pending = api.syncClerkUser("user_fixture", async (options) => {
    tokenOptions.push(options);
    return tokenOptions.length === 1 && failure === "missing token" ? null : `token-${tokenOptions.length}`;
  }, new AbortController().signal);
  await settle(); api.runTimer(1000);
  await pending;
  assert.equal(tokenOptions.length, 2);
  assert.equal(tokenOptions[1].skipCache, true);
  assert.equal(api.calls.at(-1)[1].headers.Authorization, "Bearer token-2");
});

for (const failure of ["network", 503, 429]) test(`${failure} retries once with a fresh token and then succeeds`, async () => {
  let tokens = 0;
  let attempts = 0;
  const api = client(() => {
    if (++attempts > 1) return response();
    if (failure === "network") throw new TypeError("Network down");
    return response(failure);
  });
  const pending = api.syncClerkUser("user_fixture", async () => `token-${++tokens}`, new AbortController().signal);
  await settle(); api.runTimer(1000);
  await pending;
  assert.equal(tokens, 2);
  assert.equal(api.calls[1][1].headers.Authorization, "Bearer token-2");
  assert.equal(api.timers.size, 0);
});

test("persistent failures stop after two attempts", async () => {
  const api = client(() => response(503));
  const pending = api.syncClerkUser("user_fixture", async () => "token", new AbortController().signal);
  const rejected = assert.rejects(pending, /try again/);
  await settle(); api.runTimer(1000); await rejected;
  assert.equal(api.calls.length, 2);
  assert.equal(api.timers.size, 0);
});

for (const status of [429, 503]) test(`a long HTTP ${status} Retry-After leaves recovery to the explicit retry button`, async () => {
  const api = client(() => response(status, {}, "60"));
  await assert.rejects(api.syncClerkUser("user_fixture", async () => "token", new AbortController().signal));
  assert.equal(api.calls.length, 1);
  assert.equal(api.timers.size, 0);
});

for (const data of [{ data: { ...user, clerk_id: "user_other" } }, { data: { id: 12 } }, { data: null }]) {
  test(`an invalid success response cannot complete synchronization: ${JSON.stringify(data)}`, async () => {
    const api = client(() => response(200, data));
    await assert.rejects(api.syncClerkUser("user_fixture", async () => "token", new AbortController().signal), /confirm/);
    assert.equal(api.calls.length, 1);
  });
}

for (const options of [{ url: "" }, { url: "https://api.example.com/api?bad=true" }, { url: "http://api.example.com/api", dev: false }]) {
  test(`invalid API configuration sends no token: ${JSON.stringify(options)}`, async () => {
    const api = client(() => response(), options);
    let tokens = 0;
    await assert.rejects(api.syncClerkUser("user_fixture", async () => { tokens++; return "token"; }, new AbortController().signal));
    assert.equal(tokens, 0);
    assert.equal(api.calls.length, 0);
  });
}

test("sign-out while Clerk is fetching a token cancels work without sending it later", async () => {
  const api = client(() => response());
  const controller = new AbortController();
  let finishToken;
  const pending = api.syncClerkUser("user_fixture", () => new Promise(resolve => { finishToken = resolve; }), controller.signal);
  const rejected = assert.rejects(pending);
  controller.abort(); await rejected;
  finishToken("old-session-token"); await settle();
  assert.equal(api.calls.length, 0);
  assert.equal(api.timers.size, 0);
});

test("cancellation during retry backoff prevents a second attempt", async () => {
  const api = client(() => response(503));
  const controller = new AbortController();
  const pending = api.syncClerkUser("user_fixture", async () => "token", controller.signal);
  const rejected = assert.rejects(pending);
  await settle(); controller.abort(); await rejected;
  assert.equal(api.calls.length, 1);
  assert.equal(api.timers.size, 0);
});

test("token retrieval timeouts are bounded and late tokens cannot issue requests", async () => {
  const api = client(() => response());
  const tokens = [];
  const pending = api.syncClerkUser("user_fixture", () => new Promise(resolve => tokens.push(resolve)), new AbortController().signal);
  const rejected = assert.rejects(pending, /timed out/);
  api.runTimer(15000); await settle();
  api.runTimer(1000); await settle();
  api.runTimer(15000); await rejected;
  tokens.forEach(resolve => resolve("late-token")); await settle();
  assert.equal(tokens.length, 2);
  assert.equal(api.calls.length, 0);
  assert.equal(api.timers.size, 0);
});

// Model React effect cleanup and rerenders using the repository's existing VM
// approach. This tests lifecycle behavior, not native navigation or touch delivery.
function boundary(sync) {
  const slots = [];
  const effects = [];
  let cursor = 0;
  let dirty = false;
  const auth = { isLoaded: true, isSignedIn: true, sessionId: "sess_one", userId: "user_one" };
  const jsx = (type, props) => ({ type, props });
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], value => {
        slots[index] = typeof value === "function" ? value(slots[index]) : value;
        dirty = true;
      }];
    },
    useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
    useEffect(callback, deps) {
      const index = cursor++;
      const previous = slots[index];
      if (!previous || deps.some((dep, i) => !Object.is(dep, previous.deps[i]))) {
        slots[index] = { deps, cleanup: previous?.cleanup };
        effects.push(() => { previous?.cleanup?.(); slots[index].cleanup = callback(); });
      }
    },
  };
  const app = { auth, logout: async () => { Object.assign(auth, { isSignedIn: false, sessionId: null, userId: null }); } };
  const { ClerkUserSyncBoundary } = load("clerk-user-sync-boundary.tsx", {
    react: { ...react, createContext: () => ({ Provider: "SyncProvider" }) }, "react/jsx-runtime": { jsx, jsxs: jsx },
    "@clerk/expo": { useAuth: () => ({ ...auth, getToken: async () => "token" }), useClerk: () => ({ signOut: () => app.logout() }) },
    "react-native": { View: "View", ScrollView: "ScrollView", ActivityIndicator: "ActivityIndicator", useWindowDimensions: () => ({ width: 390, height: 844 }) },
    "react-native-safe-area-context": { useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) },
    "@/components/ui": { Button: "Button", StatusAlert: "StatusAlert", Text: "Text" },
    "./sync-clerk-user": { syncClerkUser: sync, UserSyncError: Error },
  });
  app.render = () => {
    let tree;
    do { dirty = false; cursor = 0; tree = ClerkUserSyncBoundary({ children: "Router" }); } while (dirty);
    effects.splice(0).forEach(effect => effect());
    const nodes = [];
    function visit(node) {
      if (Array.isArray(node)) return node.forEach(visit);
      if (!node || typeof node !== "object") return;
      nodes.push(node); visit(node.props.children);
    }
    visit(tree); return nodes;
  };
  app.unmount = () => slots.forEach(slot => slot?.cleanup?.());
  return app;
}

test("guest browsing and hydration never trigger synchronization", () => {
  let calls = 0;
  const app = boundary(async () => { calls++; });
  Object.assign(app.auth, { isLoaded: false, isSignedIn: false, sessionId: null, userId: null });
  assert.equal(app.render()[0].props.children, "Router");
  app.auth.isLoaded = true;
  assert.equal(app.render()[0].props.children, "Router");
  assert.equal(calls, 0); app.unmount();
});

test("restored sessions sync once despite changing getToken wrappers and rerenders", async () => {
  let calls = 0;
  const app = boundary(async () => { calls++; });
  app.render(); app.render(); await settle();
  const nodes = app.render(); app.render();
  assert.equal(calls, 1);
  assert.equal(nodes[0].props.value.phase, "ready");
  assert.equal(nodes[0].props.children, "Router");
  app.unmount();
});

test("errors retain the session and explicit retry completes setup", async () => {
  let calls = 0;
  const app = boundary(async () => { if (++calls === 1) throw new Error("Offline"); });
  app.render(); await settle();
  const failed = app.render();
  assert.equal(app.auth.isSignedIn, true);
  assert.equal(failed[0].props.value.message, "Offline");
  failed[0].props.value.retry();
  app.render(); await settle();
  assert.equal(app.render()[0].props.children, "Router");
  assert.equal(calls, 2); app.unmount();
});

test("a session switch cancels old work and ignores a late success", async () => {
  const calls = [];
  const app = boundary((id, getToken, signal) => new Promise(resolve => calls.push({ id, signal, resolve })));
  app.render();
  Object.assign(app.auth, { userId: "user_two", sessionId: "sess_two" });
  app.render();
  assert.equal(calls[0].signal.aborted, true);
  calls[0].resolve(); await settle();
  assert.equal(app.render()[0].props.children, "Router");
  calls[1].resolve(); await settle();
  assert.equal(app.render()[0].props.children, "Router");
  app.unmount();
});

test("sign-out cancels synchronization and guest browsing ignores a late failure", async () => {
  let signal, reject;
  const app = boundary((id, getToken, pendingSignal) => {
    signal = pendingSignal;
    return new Promise((_, fail) => { reject = fail; });
  });
  const nodes = app.render();
  await nodes[0].props.value.logout();
  assert.equal(signal.aborted, true);
  app.render(); reject(new Error("Stale error")); await settle();
  assert.equal(app.render()[0].props.children, "Router");
  app.unmount();
});

test("failed sign-out offers recovery and a new sign-in synchronizes again", async () => {
  let calls = 0;
  const app = boundary(async () => { calls++; throw new Error("Offline"); });
  app.logout = async () => { throw new Error("Sign-out unavailable"); };
  app.render(); await settle();
  await app.render()[0].props.value.logout();
  assert.match(app.render()[0].props.value.message, /Couldn't sign out/);
  Object.assign(app.auth, { isSignedIn: false, sessionId: null, userId: null }); app.render();
  Object.assign(app.auth, { isSignedIn: true, sessionId: "sess_new", userId: "user_one" }); app.render();
  await settle();
  assert.equal(calls, 2); app.unmount();
});
