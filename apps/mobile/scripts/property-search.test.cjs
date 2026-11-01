const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const source = readFileSync(path.join(__dirname, "../src/screens/browse/property-search.ts"), "utf8");
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const moduleUnderTest = { exports: {} };
vm.runInNewContext(`(function(exports) { ${code}\n})`)(moduleUnderTest.exports);
const { filterProperties, readFilters, filterParams, parsePrice, validatePriceRange } = moduleUnderTest.exports;

// Execute the real catalogue too; Metro's image requires are replaced with labels.
const fixture = readFileSync(path.join(__dirname, "../src/fixtures/properties.ts"), "utf8");
const fixtureCode = ts.transpileModule(fixture, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const fixtureExports = {};
vm.runInNewContext(`(function(require, exports) { ${fixtureCode}\n})`)(name => name, fixtureExports);
const properties = fixtureExports.sampleProperties;
const ids = results => Array.from(results, item => item.id);
const all = { category: "all" };

test("blank query returns the entire temporary catalogue in its original order", () => {
  assert.deepEqual(ids(filterProperties(properties, "  \t ", all)), ids(properties));
  assert.equal(properties.length, 9);
});

test("destination search ignores case and whitespace and combines words", () => {
  assert.deepEqual(ids(filterProperties(properties, "  TAGAYTAY  cabin ", all)), ["sample-tagaytay-cabin", "sample-lakeside-cabin"]);
  assert.equal(filterProperties(properties, "philippines", all).length, 9);
  assert.equal(filterProperties(properties, "not-a-destination", all).length, 0);
});

test("titles, categories and accent-insensitive destinations can be searched", () => {
  assert.deepEqual(ids(filterProperties(properties, "private pool", all)), ["sample-la-union-villa"]);
  assert.equal(filterProperties(properties, "unique", all)[0].id, "sample-rizal-treehouse");
  const accent = [{ title: "Quiet stay", location: "Café District", category: "city", nightlyPriceAmount: 100 }];
  assert.equal(filterProperties(accent, "cafe", all).length, 1);
});

test("category, query and inclusive nightly price boundaries apply together", () => {
  assert.deepEqual(ids(filterProperties(properties, "Tagaytay", { category: "cabins", min: 4200, max: 4500 })), ["sample-tagaytay-cabin", "sample-lakeside-cabin"]);
  assert.deepEqual(ids(filterProperties(properties, "Tagaytay", { category: "cabins", min: 4500, max: 4500 })), ["sample-tagaytay-cabin"]);
  assert.equal(filterProperties(properties, "Tagaytay", { category: "beach" }).length, 0);
  assert.equal(filterProperties(properties, "", { category: "all", max: 0 }).length, 0);
  assert.equal(filterProperties(properties, "", { category: "all", min: 6800 }).length, 1);
  assert.equal(filterProperties(properties, "", { category: "all", max: 2900 }).length, 1);
});

test("every Home category has matching sample inventory", () => {
  for (const category of ["cabins", "beach", "city", "unique", "experiences"]) {
    const results = filterProperties(properties, "", { category });
    assert.ok(results.length > 0, category);
    assert.ok(results.every(property => property.category === category));
  }
});

test("price validation accepts blanks, zero and decimals, and rejects invalid/inverted ranges", () => {
  assert.equal(validatePriceRange("", ""), undefined);
  assert.equal(validatePriceRange("0", "4500.50"), undefined);
  assert.equal(parsePrice(" 4200.25 "), 4200.25);
  for (const invalid of ["-1", "Infinity", "NaN", "1e4", "1,000", "2.999", "999999999999999999999"]) {
    assert.ok(validatePriceRange(invalid, ""), invalid);
  }
  assert.ok(validatePriceRange("4501", "4500"));
});

test("malformed route params are safe and applied filters round-trip including reset", () => {
  const malformed = readFilters({ category: ["cabins"], min: "-1", max: "NaN" });
  assert.equal(malformed.category, "all");
  assert.equal(malformed.min, undefined);
  assert.equal(malformed.max, undefined);
  assert.equal(readFilters({ category: "invalid", min: "6000", max: "2000" }).min, undefined);
  const selected = { category: "cabins", min: 4200, max: 4500 };
  assert.equal(JSON.stringify(readFilters(filterParams(selected))), JSON.stringify(selected));
  const reset = readFilters(filterParams(all));
  assert.equal(filterProperties(properties, "", reset).length, properties.length);
});
