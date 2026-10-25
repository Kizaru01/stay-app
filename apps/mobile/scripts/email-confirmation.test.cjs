const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

// Exercise the real screen callbacks without adding a native test runtime.
// This verifies form/navigation wiring; it does not simulate native touch delivery.
function screen(name, params = {}) {
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
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "react-native": native,
    "expo-router": {
      useRouter: () => ({ push: route => pushes.push(route), replace() {} }),
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
  modules["@/fixtures/mock-email-confirmation"] = load("fixtures/mock-email-confirmation.ts");
  const component = load(`screens/auth/${name}.tsx`);
  function render() {
    cursor = 0;
    const tree = name === "auth-entry-screen" ? component.AuthEntryScreen({ mode: "sign-up" }) : component.default();
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
  return { render, pushes };
}

test("Create account validates input then routes the entered email without the password", () => {
  const app = screen("auth-entry-screen");
  const submit = nodes => nodes.find(node => node.type === "Pressable" && node.props.onPress &&
    node.props.children?.props?.children === "Create account").props.onPress();
  submit(app.render());
  assert.equal(app.pushes.length, 0);
  assert.match(app.render().find(node => node.type === "StatusAlert").props.message, /valid email/);
  app.render().find(node => node.type === "TextField" && node.props.label === "Email address").props.onChangeText("guest@example.com");
  submit(app.render());
  assert.equal(app.pushes.length, 0);
  assert.match(app.render().find(node => node.type === "StatusAlert").props.message, /password/);
  app.render().find(node => node.type === "TextField" && node.props.label === "Password").props.onChangeText("preview-password");
  submit(app.render());
  assert.equal(JSON.stringify(app.pushes), JSON.stringify([{ pathname: "/confirm-email", params: { email: "guest@example.com" } }]));
});

test("Confirmation rejects incomplete/wrong codes and pushes Home once for the correct code", () => {
  const app = screen("confirm-email-screen", { email: "guest@example.com" });
  const enter = value => app.render().find(node => node.type === "TextField").props.onChangeText(value);
  const submit = () => app.render().find(node => node.type === "Button" && node.props.title === "Confirm email").props.onPress();
  enter("12"); submit();
  assert.match(app.render().find(node => node.type === "TextField").props.error, /all six/);
  enter("999999"); submit();
  assert.match(app.render().find(node => node.type === "TextField").props.error, /doesn't match/);
  assert.equal(app.pushes.length, 0);
  enter("123456"); submit(); submit();
  assert.deepEqual(app.pushes, ["/home"]);
});
