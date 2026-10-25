const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const packageRoot = path.resolve(path.dirname(require.resolve("react-native-css/components")), "../../..");

for (const entry of ["src/components/index.cts", "dist/commonjs/components/index.cjs", "dist/module/components/index.cjs"]) {
  test(`${entry} forwards the native asset registry used by Expo fonts`, () => {
    const assets = [];
    const registry = {
      registerAsset(asset) { return assets.push(asset); },
      getAssetByID(id) { return assets[id - 1]; },
    };
    const context = {
      module: { exports: {} },
      require(name) {
        assert.equal(name, "react-native");
        return { AssetRegistry: registry };
      },
    };
    vm.runInNewContext(readFileSync(path.join(packageRoot, entry), "utf8"), context);
    const forwarded = context.module.exports.AssetRegistry;
    assert.equal(forwarded, registry);
    const font = { name: "Inter", type: "ttf" };
    assert.equal(forwarded.getAssetByID(registry.registerAsset(font)), font);
  });
}
