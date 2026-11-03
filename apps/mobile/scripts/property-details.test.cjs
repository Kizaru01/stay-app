const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

// Exercise actual screen callbacks and route lookup, not native rendering/gestures.
function screen(id = "sample-la-union-villa", canGoBack = true) {
  const state = [], saved = new Set(), navigation = [];
  let cursor = 0;
  const jsx = (type, props) => ({ type, props });
  const symbols = new Proxy({}, { get: (_, key) => key });
  const modules = {
    react: { useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = initial;
      return [state[index], value => { state[index] = typeof value === "function" ? value(state[index]) : value; }];
    } },
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "react-native": { ...Object.fromEntries(["Alert", "Linking", "ScrollView", "Share", "View"].map(key => [key, key])), useWindowDimensions: () => ({ width: 390, fontScale: 1 }) },
    "expo-router": { Stack: { Screen: "StackScreen" }, useLocalSearchParams: () => ({ id }), useRouter: () => ({ canGoBack: () => canGoBack, back: () => navigation.push("back"), replace: value => navigation.push(value) }) },
    "react-native-safe-area-context": { SafeAreaView: "SafeAreaView" },
    "@/components/ui": symbols,
    "@/components/ui/photo": symbols,
    "@/components/ui/press-feedback": symbols,
    "@/components/ui/property-photo-gallery": symbols,
    "./property-details-sections": symbols,
    "./property-questions": symbols,
    "./wishlist-context": { useWishlist: () => ({ savedIds: saved, setSaved: (id, value) => value ? saved.add(id) : saved.delete(id) }) },
  };
  function load(file) {
    const exports = {};
    const code = ts.transpileModule(readFileSync(path.join(__dirname, "../src", file), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
    vm.runInNewContext(code, { exports, require: key => {
      if (key.includes("assets/")) return 1;
      assert.ok(key in modules, key);
      return modules[key];
    } });
    return exports;
  }
  modules["./properties"] = load("fixtures/properties.ts");
  modules["./hosts"] = load("fixtures/hosts.ts");
  modules["@/fixtures/property-details"] = load("fixtures/property-details.ts");
  modules["./host-profile-card"] = load("screens/browse/host-profile-card.tsx");
  const component = load("screens/browse/property-details-screen.tsx");
  function render() {
    cursor = 0;
    const root = component.default();
    const nodes = [];
    function visit(node) {
      if (Array.isArray(node)) return node.forEach(visit);
      if (!node || typeof node !== "object") return;
      nodes.push(node);
      if (node.type === modules["./host-profile-card"].HostProfileCard) {
        visit(node.type(node.props));
      }
      visit(node.props?.children);
    }
    visit(root.type(root.props));
    return nodes;
  }
  modules["react-native-reanimated"] = { default: { View: "AnimatedView" }, useReducedMotion: () => true };
  return { render, saved, navigation, properties: modules["@/fixtures/property-details"].samplePropertyDetails, answer: load("screens/browse/property-questions.tsx").samplePropertyAnswer };
}

test("detail saves share the selected listing ID and can be reversed", () => {
  const app = screen();
  app.render().find(node => node.props?.accessibilityLabel === "Save to wishlist").props.onPress();
  assert.ok(app.saved.has("sample-la-union-villa"));
  app.render().find(node => node.props?.accessibilityLabel === "Remove from wishlist").props.onPress();
  assert.equal(app.saved.size, 0);
});

test("description and amenities expand, while all detail overlays dismiss", () => {
  const app = screen();
  for (const label of ["Show more", "Show all 12 amenities"]) {
    app.render().find(node => node.props?.label === label).props.onPress();
  }
  assert.ok(app.render().some(node => node.props?.label === "Show less" && node.props.expanded));
  assert.ok(app.render().some(node => node.type === "DetailColumns" && node.props.items.length === 12));
  const openers = [
    nodes => nodes.find(node => node.type === "HostRow"),
    nodes => nodes.find(node => node.props?.label === "Read 192 reviews"),
    nodes => nodes.find(node => node.props?.accessibilityLabel === "Reserve, view sample booking details"),
  ];
  for (const opener of openers) {
    opener(app.render()).props.onPress();
    const overlay = app.render().find(node => node.type === "DetailOverlay");
    assert.ok(overlay);
    overlay.props.onClose();
    assert.equal(app.render().some(node => node.type === "DetailOverlay"), false);
  }
});

test("question previews preserve a host draft across dismissal and assistant handoff", () => {
  const app = screen();
  assert.equal(app.render().some(node => node.props?.title === "View all photos"), false);
  app.render().find(node => node.type === "PropertyQuestionOptions").props.onSelect("contact");
  let composer = app.render().find(node => node.type === "HostQuestionPreview");
  assert.equal(composer.props.property.host.name, "Maria");
  composer.props.onDraftChange("Is an early check-in possible?");
  app.render().find(node => node.type === "DetailOverlay").props.onClose();
  app.render().find(node => node.type === "PropertyQuestionOptions").props.onSelect("assistant");
  app.render().find(node => node.type === "AssistantQuestionPreview").props.onContactHost();
  composer = app.render().find(node => node.type === "HostQuestionPreview");
  assert.equal(composer.props.draft, "Is an early check-in possible?");
});

test("sample assistant answers use each property's facts and decline unsupported topics", () => {
  const app = screen();
  for (const property of app.properties) {
    assert.equal(app.answer(property, "Cancellation policy"), property.cancellationPolicy);
    assert.match(app.answer(property, "Guests and bedrooms"), new RegExp(`up to ${property.guests} guests`));
    assert.ok(app.answer(property, "Amenities").includes(property.amenities[0].label));
    assert.ok(app.answer(property, "Check-in and check-out").includes(property.rules[0]));
    assert.match(app.answer(property, "Something else"), /only covers the listed property details/);
  }
});

test("unknown properties render a recovery action, direct entries fall back to Home", () => {
  const app = screen("missing", false);
  assert.equal(app.render().some(node => node.type === "PropertyPhotoGallery"), false);
  app.render().find(node => node.props?.title === "Back to stays").props.onPress();
  assert.deepEqual(app.navigation, ["/home"]);
});

test("every catalogue property has consistent detail data and bounded review ratings", () => {
  const app = screen();
  assert.equal(app.properties.length, 9);
  for (const property of app.properties) {
    assert.ok(property.beds > 0 && property.bathrooms > 0);
    assert.ok(property.host.name && property.introduction && property.fullDescription);
    assert.ok(property.amenities.length >= 8);
    assert.ok(property.reviews.every(review => review.rating >= 1 && review.rating <= 5));
  }
});

test("every listing resolves a complete sample host with consistent stable identity", () => {
  const { properties } = screen();
  const hosts = new Map();
  for (const { host } of properties) {
    assert.match(host.id, /^sample-host-/);
    for (const field of ["name", "bio", "location", "languages", "response", "hostingApproach", "occupation", "background"]) {
      assert.ok(host[field].trim(), `${host.id}: ${field}`);
    }
    assert.ok(Number.isInteger(host.yearsHosting) && host.yearsHosting > 0);
    assert.equal(typeof host.superhost, "boolean");
    assert.ok(host.avatar);
    assert.ok(host.interests.length > 0);
    assert.ok(host.credentials.length > 0);
    assert.ok(host.credentials.every(item => item.title.trim() && item.description.trim()));
    if (hosts.has(host.id)) assert.equal(hosts.get(host.id), host);
    hosts.set(host.id, host);
  }
  assert.equal(hosts.size, 8);
});

test("host overlay presents the selected profile and conditional hosting labels", () => {
  for (const [id, name, status] of [
    ["sample-la-union-villa", "Maria", "4 years hosting"],
    ["sample-rizal-treehouse", "Paolo", "1 year hosting"],
  ]) {
    const app = screen(id);
    const row = app.render().find(node => node.type === "HostRow");
    assert.equal(row.props.name, name);
    row.props.onPress();
    const nodes = app.render();
    const text = node => Array.isArray(node) ? node.map(text).join("") : typeof node === "object" ? "" : String(node ?? "");
    const texts = nodes.filter(node => node.type === "Text").map(node => text(node.props.children));
    assert.ok(texts.includes(status));
    assert.equal(nodes.some(node => node.type === "Badge" && node.props.label === "Superhost"), row.props.superhost);
    assert.ok(texts.includes(row.props.bio));
    assert.ok(texts.includes(row.props.hostingApproach));
    assert.ok(texts.includes(row.props.background));
    assert.ok(texts.includes("Background, credentials and badges are illustrative and have not been verified."));
    for (const credential of row.props.credentials) {
      assert.ok(texts.includes(credential.title));
      assert.ok(texts.includes(credential.description));
    }
    assert.ok(nodes.some(node => node.props?.label === `Lives in ${row.props.location}`));
    nodes.find(node => node.type === "DetailOverlay").props.onClose();
    assert.ok(!app.render().some(node => node.type === "DetailOverlay"));
  }
});
