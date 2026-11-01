const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

// Exercise actual gallery callbacks, without claiming native gesture verification.
function gallery({ reduced = false, photos = [1, 2, 3].map(source => ({ source, description: `Photo ${source}` })) } = {}) {
  const state = [];
  const scrolls = [];
  let cursor = 0;
  const jsx = (type, props) => ({ type, props });
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = initial;
      return [state[index], value => { state[index] = value; }];
    },
    useRef(initial) {
      const index = cursor++;
      return state[index] ?? (state[index] = { current: initial });
    },
  };
  const modules = {
    react,
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "react-native": { ScrollView: "ScrollView", View: "View" },
    "react-native-reanimated": { useReducedMotion: () => reduced },
    "./icon": { Icon: "Icon" }, "./photo": { Photo: "Photo" },
    "./press-feedback": { PressFeedback: "PressFeedback" }, "./text": { Text: "Text" },
  };
  const source = readFileSync(path.join(__dirname, "../src/components/ui/property-photo-gallery.tsx"), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: key => {
    assert.ok(key in modules, key);
    return modules[key];
  } });
  function render() {
    cursor = 0;
    const root = exports.PropertyPhotoGallery({ title: "Test stay", description: "Cover", photos });
    const tree = root.type(root.props);
    const nodes = [];
    function visit(node) {
      if (Array.isArray(node)) return node.forEach(visit);
      if (!node || typeof node !== "object") return;
      nodes.push(node);
      visit(node.props?.children);
    }
    visit(tree);
    const pager = nodes.find(node => node.type === "ScrollView");
    if (pager) pager.props.ref.current = { scrollTo: options => scrolls.push({ ...options }) };
    return nodes;
  }
  const control = direction => render().find(node => node.props?.accessibilityLabel === `${direction} photo of Test stay`);
  function resize(width) { render()[0].props.onLayout({ nativeEvent: { layout: { width } } }); render().find(node => node.type === "ScrollView").props.onContentSizeChange(); }
  return { render, control, resize, scrolls };
}

test("photo controls clamp at first/last slide and never request invalid offsets", () => {
  const app = gallery();
  app.resize(180);
  assert.equal(app.control("Previous").props.disabled, true);
  app.control("Next").props.onPress();
  assert.equal(app.scrolls.at(-1).x, 180);
  app.control("Next").props.onPress();
  assert.equal(app.scrolls.at(-1).x, 360);
  assert.equal(app.control("Next").props.disabled, true);
  app.control("Next").props.onPress();
  assert.equal(app.scrolls.at(-1).x, 360);
  app.control("Previous").props.onPress();
  assert.equal(app.scrolls.at(-1).x, 180);
});

test("native settling updates selection and resizing preserves the selected photo", () => {
  const app = gallery();
  app.resize(180);
  app.render().find(node => node.type === "ScrollView").props.onMomentumScrollEnd({ nativeEvent: { contentOffset: { x: 360 } } });
  assert.equal(app.control("Next").props.disabled, true);
  app.resize(320);
  assert.equal(app.scrolls.at(-1).x, 640);
  assert.equal(app.scrolls.at(-1).animated, false);
  assert.ok(app.render().some(node => node.type === "Photo" && node.props.style.width === 320));
});

test("reduced motion disables animated programmatic paging", () => {
  const app = gallery({ reduced: true });
  app.resize(180);
  app.control("Next").props.onPress();
  assert.equal(app.scrolls.at(-1).animated, false);
});

test("single and missing photos keep the fallback and hide gallery controls", () => {
  for (const photos of [[], [{ source: 1, description: "Only photo" }]]) {
    const app = gallery({ photos });
    app.resize(180);
    assert.equal(app.control("Next"), undefined);
    assert.equal(app.render().filter(node => node.type === "Photo").length, 1);
    assert.equal(app.render().find(node => node.type === "ScrollView").props.scrollEnabled, false);
  }
});
