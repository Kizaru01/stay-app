const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.join(__dirname, "../src/screens/onboarding");
const key = "stayapp.onboarding.v1";

function device() {
  const values = new Map();
  return {
    values,
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

// Execute the actual TypeScript modules; each context represents a fresh launch.
function launch(storage) {
  const context = vm.createContext(storage ? { window: { localStorage: storage } } : {});
  function load(name) {
    const source = readFileSync(path.join(root, `${name}.ts`), "utf8");
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const module = { exports: {} };
    const evaluate = vm.runInContext(`(function(require, exports, module) { ${code}\n})`, context);
    evaluate(specifier => {
      assert.equal(specifier, "./onboarding-storage-access");
      return load("onboarding-storage-access");
    }, module.exports, module);
    return module.exports;
  }
  return load("onboarding-storage");
}

test("first visit and partial viewing never mark onboarding completed", async () => {
  const storage = device();
  const visit = await launch(storage).readOnboardingVisit();
  assert.equal(visit.completed, false);
  assert.equal(visit.entry, "/sign-up");
  assert.equal(visit.storageAvailable, true);
  await launch(storage).readOnboardingVisit();
  assert.equal(storage.values.size, 0);
});

test("Skip/Finish destination persists across launch, and form selection updates it", async () => {
  const storage = device();
  assert.equal((await launch(storage).completeOnboarding("/sign-up")).persisted, true);
  let visit = await launch(storage).readOnboardingVisit();
  assert.equal(visit.completed, true);
  assert.equal(visit.entry, "/sign-up");
  await launch(storage).rememberAuthEntry("/sign-in");
  visit = await launch(storage).readOnboardingVisit();
  assert.equal(visit.entry, "/sign-in");
  assert.deepEqual(JSON.parse(storage.values.get(key)), { version: 1, completed: true, entry: "/sign-in" });
  assert.equal(storage.values.size, 1, "only the nonsensitive onboarding record is written");
});

test("existing-user exit persists login and clearing storage resets onboarding", async () => {
  const storage = device();
  const session = launch(storage);
  await session.completeOnboarding("/sign-in");
  assert.equal((await launch(storage).readOnboardingVisit()).entry, "/sign-in");
  storage.values.clear();
  assert.equal((await session.readOnboardingVisit()).completed, false);
});

test("direct form access alone does not complete onboarding", async () => {
  const storage = device();
  await launch(storage).rememberAuthEntry("/sign-in");
  assert.equal(storage.values.size, 0);
  assert.equal((await launch(storage).readOnboardingVisit()).completed, false);
});

test("malformed, incomplete, or unsupported records do not redirect", async () => {
  for (const value of ["not json", "null", "[]", '{"version":2,"completed":true,"entry":"/sign-in"}', '{"version":1,"completed":false,"entry":"/sign-in"}', '{"version":1,"completed":true,"entry":"/admin"}']) {
    const storage = device();
    storage.values.set(key, value);
    assert.equal((await launch(storage).readOnboardingVisit()).completed, false, value);
  }
});

test("blocked storage allows this session to continue without claiming persistence", async () => {
  const storage = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  const session = launch(storage);
  assert.equal((await session.readOnboardingVisit()).storageAvailable, false);
  assert.equal((await session.completeOnboarding("/sign-in")).persisted, false);
  const visit = await session.readOnboardingVisit();
  assert.equal(visit.completed, true);
  assert.equal(visit.entry, "/sign-in");
  assert.equal(visit.storageAvailable, false);
  assert.equal((await launch(storage).readOnboardingVisit()).completed, false);
});

test("write failure prefers latest session choice over stale disk data and can recover", async () => {
  const storage = device();
  const session = launch(storage);
  await session.completeOnboarding("/sign-up");
  const write = storage.setItem;
  storage.setItem = () => { throw new Error("quota"); };
  assert.equal((await session.rememberAuthEntry("/sign-in")).persisted, false);
  assert.equal((await session.readOnboardingVisit()).entry, "/sign-in");
  storage.setItem = write;
  assert.equal((await session.rememberAuthEntry("/sign-in")).persisted, true);
  assert.equal((await launch(storage).readOnboardingVisit()).entry, "/sign-in");
  assert.equal((await session.readOnboardingVisit()).storageAvailable, true);
});

test("SSR without window never touches native storage or crashes", async () => {
  const visit = await launch().readOnboardingVisit();
  assert.equal(visit.completed, false);
  assert.equal(visit.storageAvailable, false);
});
