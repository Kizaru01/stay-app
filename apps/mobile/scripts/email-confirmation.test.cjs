const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

// Exercise the real screen callbacks without adding a native test runtime.
// This verifies form/navigation wiring; it does not simulate native touch delivery.
function screen(name, params = {}, mode = "sign-up", overrides = {}) {
  const ok = async () => ({ error: null });
  const attempt = { status: "missing_requirements", missingFields: [], emailAddress: "guest@example.com", identifier: "guest@example.com", password: ok, verifications: { sendEmailCode: ok, verifyEmailCode: ok }, mfa: { sendEmailCode: ok, verifyEmailCode: ok }, finalize: ok, ...overrides };
  const state = [];
  const pushes = [];
  let cursor = 0;
  const jsx = (type, props) => ({ type, props });
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = typeof initial === "function" ? initial() : initial;
      return [state[index], value => { state[index] = value; }];
    },
    useRef(initial) {
      const index = cursor++;
      return state[index] ?? (state[index] = { current: initial });
    },
    useEffect() {},
    useCallback: callback => callback,
  };
  const native = new Proxy({
    Keyboard: { dismiss() {} }, Platform: { OS: "android" },
    useWindowDimensions: () => ({ width: 390, height: 844 }),
  }, { get: (target, key) => target[key] ?? key });
  const modules = {
    react,
    "@clerk/expo": { useSSO: () => ({ startSSOFlow: async () => ({ createdSessionId: null }) }), useAuth: () => ({ isLoaded: true, isSignedIn: false }), useSignUp: () => ({ signUp: attempt }), useSignIn: () => ({ signIn: attempt }), isClerkAPIResponseError: error => Array.isArray(error?.errors) },
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "react-native": native,
    "expo-router": {
      useRouter: () => ({ push: route => pushes.push(route), replace: route => pushes.push(route) }),
      useLocalSearchParams: () => params,
      useFocusEffect() {}, Stack: { Screen: "StackScreen" }, Link: "Link",
    },
    "expo-status-bar": { StatusBar: "StatusBar" },
    "react-native-safe-area-context": { useSafeAreaInsets: () => ({ top: 47, bottom: 34 }) },
    "react-native-svg": { default: "Svg", Path: "Path" },
    "@/components/ui": new Proxy({}, { get: (_, key) => key }),
    "@/components/ui/welcome-logo": { WelcomeLogo: "WelcomeLogo" },
    "@/screens/onboarding/onboarding-storage": { rememberAuthEntry: async () => ({ persisted: true }) },
  };
  function load(relative) {
    const code = ts.transpileModule(readFileSync(path.join(__dirname, "../src", relative), "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const exports = {};
    vm.runInNewContext(code, { exports, require: key => {
      if (!(key in modules)) throw new Error(`Unexpected dependency: ${key}`);
      return modules[key];
    } });
    return exports;
  }
  modules["./clerk-errors"] = load("screens/auth/clerk-errors.ts");
  const component = load(`screens/auth/${name}.tsx`);
  function render() {
    cursor = 0;
    const tree = name === "auth-entry-screen" ? component.AuthEntryScreen({ mode }) : component.default();
    const nodes = [];
    function visit(node) {
      if (Array.isArray(node)) return node.forEach(visit);
      if (!node || typeof node !== "object") return;
      nodes.push(node);
      visit(node.props?.children);
    }
    visit(tree);
    return nodes;
  }
  return { render, pushes, attempt };
}

const fill = (app, label, value) => app.render().find(node => node.type === "TextField" && node.props.label === label).props.onChangeText(value);
const submitEntry = app => app.render().find(node => node.type === "Pressable" && node.props.children?.props?.children === "Create account").props.onPress();
const submitCode = app => app.render().find(node => node.type === "Button" && node.props.title === "Confirm email").props.onPress();

test("sign-up validates then sends credentials only to Clerk and routes without secrets", async () => {
  const calls = [];
  const app = screen("auth-entry-screen", {}, "sign-up", { password: async data => { calls.push(data); return { error: null }; } });
  await submitEntry(app);
  assert.match(app.render().find(node => node.type === "StatusAlert").props.message, /your name/);
  fill(app, "Name", "   ");
  await submitEntry(app);
  assert.equal(calls.length, 0);
  assert.match(app.render().find(node => node.type === "StatusAlert").props.message, /your name/);
  fill(app, "Name", "  María 李  ");
  await submitEntry(app);
  assert.match(app.render().find(node => node.type === "StatusAlert").props.message, /valid email/);
  fill(app, "Email address", "guest@example.com");
  await submitEntry(app);
  assert.match(app.render().find(node => node.type === "StatusAlert").props.message, /password/);
  fill(app, "Password", "a-long-test-password");
  await submitEntry(app);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].firstName, "María 李");
  assert.equal(calls[0].password, "a-long-test-password");
  assert.equal(JSON.stringify(app.pushes), JSON.stringify([{ pathname: "/confirm-email", params: { flow: "sign-up" } }]));
});

test("verification rejects incomplete and API-rejected codes; only Clerk completion reaches Home", async () => {
  let count = 0;
  const app = screen("confirm-email-screen", {}, "sign-up", { verifications: { sendEmailCode: async () => ({ error: null }), verifyEmailCode: async ({ code }) => {
    count++;
    if (code !== "654321") return { error: { errors: [{ message: "Code is invalid or expired" }] } };
    app.attempt.status = "complete";
    return { error: null };
  } } });
  fill(app, "Six-digit confirmation code", "12"); await submitCode(app);
  assert.equal(count, 0);
  fill(app, "Six-digit confirmation code", "123456"); await submitCode(app);
  assert.match(app.render().find(node => node.type === "TextField").props.error, /invalid or expired/);
  assert.equal(app.pushes.length, 0);
  fill(app, "Six-digit confirmation code", "654321");
  await Promise.all([submitCode(app), submitCode(app)]);
  assert.deepEqual(app.pushes, ["/home"]);
});

test("failed sign-up stays on the form with Clerk feedback", async () => {
  const app = screen("auth-entry-screen", {}, "sign-up", { password: async () => ({ error: { errors: [{ message: "Password is too short" }] } }) });
  fill(app, "Name", "Alex");
  fill(app, "Email address", "guest@example.com"); fill(app, "Password", "short");
  await submitEntry(app);
  assert.deepEqual(app.pushes, []);
  assert.match(app.render().find(node => node.type === "StatusAlert").props.message, /too short/);
});

test("new-device sign-in sends a code and uses the sign-in verification flow", async () => {
  const app = screen("auth-entry-screen", {}, "sign-in", { status: "needs_client_trust" });
  assert.equal(app.render().some(node => node.type === "TextField" && node.props.label === "Name"), false);
  fill(app, "Email address", "guest@example.com"); fill(app, "Password", "a-long-test-password");
  await app.render().find(node => node.type === "Pressable" && node.props.children?.props?.children === "Sign In").props.onPress();
  assert.equal(JSON.stringify(app.pushes), JSON.stringify([{ pathname: "/confirm-email", params: { flow: "sign-in" } }]));
});

test("direct confirmation without a pending attempt offers restart", () => {
  const app = screen("confirm-email-screen", {}, "sign-up", { status: "needs_identifier", emailAddress: null });
  assert.equal(app.render().some(node => node.type === "TextField"), false);
  assert.ok(app.render().find(node => node.type === "Button" && node.props.title === "Go to sign up"));
});
